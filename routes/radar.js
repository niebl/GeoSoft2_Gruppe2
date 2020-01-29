/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
const utilities = require('../utilityFunctions.js');
var Precipitation = require("../models/precipitation");
var Precipitationminutes = require("../models/precipitationminutes");
var PrecipitationDemo = require("../models/precipitationDemo");

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
async function oneHourRadar(){
  utilities.indicateStatus(`refreshing 5m Precipitation data in cache`);
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

        if(body != undefined){
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
        }

    });
    utilities.indicateStatus(`Successfully cached new 5m precipitation data`);
}


  /**
    * requesting Specific values
    * @event get get1hradar
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
    if(req.query.bbox){
      var poly1 = req.query.bbox.split(",");
      console.log(poly1);
      var polyarray1 = [];
      var nw = [Number(poly1[0]), Number(poly1[1])] ;
      var sw = [Number(poly1[2]), Number(poly1[1])] ;
      var se = [Number(poly1[2]), Number(poly1[3])] ;
      var ne = [Number(poly1[0]), Number(poly1[3])] ;
      var ws = [Number(poly1[1]), Number(poly1[2])] ;
      var en = [Number(poly1[3]), Number(poly1[0])] ;
      polyarray1.push(nw, sw, se, ne, nw);
      console.log(polyarray1)

      // to close Loop forpolygon
      query['geojson.geometry']=
       {$geoWithin: {$box:[
         ws, en
       ]}};
    }

      console.log("query " + query);
      Precipitation.find(query, function(err, result){
        if(err){
          console.log(err);
        }
        console.log(result);
        for(var i= 0; i < result.length; i++){
            regions.features.push(result[i].geojson);
        }
          res.send(regions.features);
      });
  });

// 5min radar
//
//
async function fiveMinRadar(){
  var url = 'http://localhost:8000/radar';
  utilities.indicateStatus(`refreshing 5m Precipitation data in cache`);
  var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };
    Precipitationminutes.deleteMany({}, (err, result) => {
      console.log("deleted");
    });
    request(requestSettings, function(error, response, body) {

        try{
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
          utilities.indicateStatus(`Successfully cached new 5m precipitation data`);
          console.log('Radar of germany  in 5 min intervalls added into db');
        } catch(error) {
          utilities.indicateStatus(`error in caching new 5m precipitation data`);
        }
    });
}

/**
  * requesting Specific values
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

  if(req.query.bbox){
    var poly1 = req.query.bbox.split(",");
    var polyarray1 = [];
      var nw = [Number(poly1[0]), Number(poly1[1])] ;
      var sw = [Number(poly1[2]), Number(poly1[1])] ;
      var se = [Number(poly1[2]), Number(poly1[3])] ;
      var ne = [Number(poly1[0]), Number(poly1[3])] ;
      var ws =[Number(poly1[1]), Number(poly1[2])] ;
      var en = [Number(poly1[3]), Number(poly1[0])] ;
      //polyarray1.push(nw, sw, se, ne, nw);

    // to close Loop forpolygon
    query['geojson.geometry']=
     {$geoWithin: {$box:[
         ws , en
       ]}};
  }
    //find featrues by name
    await Precipitationminutes.find(query, function(err, result){
      if(err){
        console.log(err);
      }
      console.log(result);
      for(var i= 0; i < result.length; i++){
          regions.features.push(result[i].geojson);
      }
        res.send(regions.features);
    });
});

// Demo radar
//
//
router.get("/precipitationDemo", async function (req, res ){
  var url = 'http://localhost:8000/radarDemo';
  var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };
    PrecipitationDemo.deleteMany({}, (err, result) => {
      console.log("deleted");
    });
    request(requestSettings, function(error, response, body) {

        var rbody= (JSON.parse(JSON.parse(body)));
        rbody = rbody;

        console.log(rbody.features);
        for(let feature of rbody.features){
          var addRadar = new PrecipitationDemo({
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
        res.send('Demo radar of germany  added into db');
    });
});


router.get("/getDemoradar", async function(req, res){
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
    console.log(poly);
    var polyarray = [];
    for(var j =0; j < poly.length; j = j +2){
      var pair = [];
      pair.push(Number(Number(poly[j])));
      pair.push(Number(Number(poly[j +1])));
      polyarray.push(pair);
    }
    // to close Loop forpolygon
    polyarray.push([poly[0], poly[1]]);
    console.log(polyarray);
    query['geojson.geometry']=
     {$geoWithin: {$geometry: {
      type: "Polygon",
      coordinates: [polyarray]}}};
  }
    //find featrues by name
    PrecipitationDemo.find(query, function(err, result){
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
