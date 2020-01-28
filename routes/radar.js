/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Precipitation = require("../models/precipitation");
var Precipitationminutes = require("../models/precipitationminutes");
var PrecipitationDemo = require("../models/precipitationDemo");


//hourly Radar
//
//
router.get("/precipitation1h", async function (req, res ){
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

        console.log(rbody.features);
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
        res.send('Radar of germany added into db');
    });
});

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
router.get("/precipitation5m", async function (req, res ){
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

        console.log(rbody.features);
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
        res.send('Radar of germany  in 5 min intervalls added into db');
    });
});

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
