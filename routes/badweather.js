/*jshint esversion: 6 */
var request = require('request');
var express = require('express');
var router = express.Router();

var Kreis = require("../models/kreis");
var UnwetterKreis = require("../models/unwetterkreis");


/** requesting GEJSOn of deutsche Kreise
  * @author Dorian
  * url?name=<placeholder>&coordinates=<lng,lat>
  * @example url/getBorders?coordinates=9,53
  */
router.get('/getBorders', (req, res) => {
  var regions ={type:"FeatureCollection", features:[]};
  var query = {};
  if(req.query.name){

    query['geojson.properties.name'] = req.query.name;
  }
  if(req.query.coordinates){
    var coords = req.query.coordinates.split(",");
    query['geojson.geometry']=
     {$geoIntersects: {$geometry: {
      type: "Point",
      coordinates: coords}}};
  }
    //find featrues by name
    Kreis.find(query, function(err, result){
      if(err){
        console.log(err);
      }

      for(var i= 0; i < result.length; i++){
          regions.features.push(result[i].geojson);
      }
        res.json(regions);
    });
});



/** Adding German "kreisgrenzen" into db
  * @author Dorian
  *
  */
router.get("/kreise", (req, res ) =>{
  var requestSettings = {
        url: "http://localhost:3000/gemeinden",
        method: 'GET'
    };
  request(requestSettings, function(error, response, body) {
    if(error){
      console.log(error);
    }
    var kreisListe = JSON.parse(body).features;
    for(var i= 0; i <= kreisListe.length -1; i++){
        console.log( kreisListe[i].geometry.type);
        var addKreis = new Kreis({
          geojson: {
            type: "Feature",
            properties: {
              name: kreisListe[i].properties.GEN,
            },
            geometry: {
              type: kreisListe[i].geometry.type,
              coordinates: kreisListe[i].geometry.coordinates
           }
         }
        });
        //addKreis.properties.name = kreisListe[i].properties.GEN;
        addKreis.save();
        if(i == kreisListe.length -1 ){
          res.send('Regions of germany added into db');
        }
    }

  });
});

router.get('/deleteUnwetter', (req, res) => {
    UnwetterKreis.deleteMany({}, (err, result) => {
      next();
    });
});

router.get('/loadUnwetter', (req, res, next) => {
    UnwetterKreis.deleteMany({}, (err, result) => {
      next();
    });
}, (req, res) => {
  var requestSettings = {
        url: "http://localhost:3000/gemeinden",
        method: 'GET'
    };
  request('https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json', function(error, response, body) {
    if(error){
      console.log(error);
    }

    var toJson = body.slice(24, body.length - 2);
    var warnings =  JSON.parse(toJson);
    var dangerzone  = [];
    for(var key in warnings.warnings){
      dangerzone.push([warnings.warnings[key][0].regionName, warnings.warnings[key][0].event]);
    }

    Kreis.find({}, function(err, result){
      if(err){
        console.log(err);
      }
      var zet = [];
      dangerzone.forEach((item, index) =>{
        for(var i= 0; i < result.length; i++){
          if(item[0].includes(result[i].geojson.properties.name)){
            var addUnwetterKreis = new UnwetterKreis({
              geojson: {
                type: "Feature",
                properties: {
                  name: result[i].geojson.properties.name,
                  event: item[1]
                },
                geometry: {
                  type: result[i].geojson.geometry.type,
                  coordinates: result[i].geojson.geometry.coordinates
               }
             }
            });
            addUnwetterKreis.save();
          }
        }
      });
      res.send(dangerzone);
    });
});
});


/** requesting GEJSOn of bad Weather events
  * @author Dorian
  * @url?name=<placeholder>&coordinates=<lng,lat>&event=<EVENT>
  * @example http://localhost:3000/getUnwetter?event=GLATTEIS&name=Münster
  */

  router.get("/getUnwetter", (req, res)=>{
  var query = {};
  if(req.query.event){
    query['geojson.properties.event'] = req.query.event;
  }
  if(req.query.name){
    // query = {'geojson.properties.name' : req.query.name};
    query['geojson.properties.name'] = req.query.name;
  }
  if(req.query.coordinates){
    var coords = req.query.coordinates.split(",");
    query['geojson.geometry']=
     {$geoIntersects: {$geometry: {
      type: "Point",
      coordinates: coords}}};
  }
  UnwetterKreis.find(query, (err, result)=>{
  if(err){
      console.log(err);
    }
    var json = {type: "FeatureCollection", features:[]};
    result.forEach((item, index) =>{
      json.features.push(item.geojson);
    });
    res.json(json);
  });
});

module.exports = router;
