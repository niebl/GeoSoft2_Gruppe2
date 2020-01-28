/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Precipitation = require("../models/precipitation");
var Precipitationminutes = require("../models/precipitationminutes");

oneHourRadar();
fiveMinRadar();
setInterval(
  oneHourRadar,
  300000
);
setInterval(
  fiveMinRadar,
  300000
);
//
function oneHourRadar(){
  var url = 'http://localhost:8000/radarhourly';
  var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };
    Precipitation.deleteMany({}, (err, result) => {
      console.log("deleted");
    });
    request(requestSettings, function(error, response, body) {

        var rbody= (JSON.parse(JSON.parse(body)));
        rbody = rbody;

        for(let feature of rbody.features){
          var addRadar = new Precipitation({
            geojson:{
              type: feature.type,
              properties: {
                level: feature.properties.layer
              },
              geometry: {
                type: feature.geometry.type,
                coordinates: feature.geometry.coordinates
              }
            }
          });
          addRadar.save();
        }
    });
    console.log("Succesfully loaded");
}


  /**
    * requesting Specific values
    * @author Dorian
    * @query coordinates=<lng, lat>
    * @query polygon=<lng, lat> BBox
    * @query max=value max Prec threshold
    * @query min=value min prec threshold
    * @example url/radar/get1hradar?coordinates=9,53&max=20
    *
    */
  router.get("/get1hradar", async function(req, res){
    var regions ={type:"FeatureCollection", features:[]};
    var query = {};
    if(req.query.min){
      query['geojson.properties.level'] = { $gte: req.query.min};
    }
    if(req.query.max){
      query['geojson.properties.level'] = { $lte: req.query.max};
    }

    if(req.query.coordinates){
      var coords = req.query.coordinates.split(",");
      query['geojson.geometry']=
       {$geoIntersects: {$geometry: {
        type: "Point",
        coordinates: coords}}};
    }
    if(req.query.polygon){
      var poly = req.query.polygon.split(",");
      var polyarray = [];
      for(var j =0; j < poly.length; j = j +2){
        var pair = [];
        pair.push(Number(Number(poly[j])));
        pair.push(Number(Number(poly[j +1])));
        polyarray.push(pair);
      }
      // to close Loop forpolygon
      polyarray.push([poly[0], poly[1]]);
      query['geojson.geometry']=
       {$geoWithin: {$geometry: {
        type: "Polygon",
        coordinates: [polyarray]}}};
    }
      //find featrues by name
      Precipitation.find(query, function(err, result){
        if(err){
          console.log(err);
        }

        for(var i= 0; i < result.length; i++){
            regions.features.push(result[i].geojson);
        }
          res.json(regions.features);
      });
  });

// 5min radar
//
//
function fiveMinRadar(){
  var url = 'http://localhost:8000/radar';
  var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };
    Precipitationminutes.deleteMany({}, (err, result) => {
      console.log("deleted");
    });
    request(requestSettings, function(error, response, body) {

        var rbody= (JSON.parse(JSON.parse(body)));
        rbody = rbody;


        for(let feature of rbody.features){
          var addRadar = new Precipitationminutes({
            geojson:{
              type: feature.type,
              properties: {
                level: feature.properties.layer
              },
              geometry: {
                type: feature.geometry.type,
                coordinates: feature.geometry.coordinates
              }
            }
          });
          addRadar.save();
        }
        console.log('Radar of germany  in 5 min intervalls added into db');
    });
}

/**
  * requesting Specific values
  * @author Dorian
  * @query coordinates=<lng, lat>
  * @query polygon=<lng, lat> BBox
  * @query max=value max Prec threshold
  * @query min=value min prec threshold
  * @example url/radar/get1hradar?coordinates=9,53&max=20
  *
  */
router.get("/get5mradar", async function(req, res){
  var regions ={type:"FeatureCollection", features:[]};
  var query = {};
  if(req.query.min){
    query['geojson.properties.level'] = { $gte: req.query.min};
  }
  if(req.query.max){
    query['geojson.properties.level'] = { $lte: req.query.max};
  }

  if(req.query.coordinates){
    var coords = req.query.coordinates.split(",");
    query['geojson.geometry']=
     {$geoIntersects: {$geometry: {
      type: "Point",
      coordinates: coords}}};
  }
  if(req.query.polygon){
    var poly = req.query.polygon.split(",");
    var polyarray = [];
    for(var j =0; j < poly.length; j = j +2){
      var pair = [];
      pair.push(Number(Number(poly[j])));
      pair.push(Number(Number(poly[j +1])));
      polyarray.push(pair);
    }
    // to close Loop forpolygon
    polyarray.push([poly[0], poly[1]]);
    query['geojson.geometry']=
     {$geoWithin: {$geometry: {
      type: "Polygon",
      coordinates: [polyarray]}}};
  }
    //find featrues by name
    Precipitationminutes.find(query, function(err, result){
      if(err){
        console.log(err);
      }

      for(var i= 0; i < result.length; i++){
          regions.features.push(result[i].geojson);
      }
        res.json(regions.features);
    });
});
module.exports = router;
