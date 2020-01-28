/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
const utilities = require('../utilityFunctions.js');
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
async function oneHourRadar(){
  utilities.indicateStatus(`Started downloading new 1h precipitation data`);
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
    utilities.indicateStatus(`Successfully downloaded new 1h precipitation data`);
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
    if(req.query.polygon1){
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
        polyarray1.push(nw, sw, se, ne, nw);
      console.log(polyarray1)

      // to close Loop forpolygon
      query['geojson.geometry']=
       {$geoWithin: {$geometry: {
        type: "Polygon",
        coordinates: [polyarray1]}}};
    }
      console.log("query " + query);
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
async function fiveMinRadar(){
  var url = 'http://localhost:8000/radar';
  utilities.indicateStatus(`Started downloading new 5m Precipitation data`);
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
        utilities.indicateStatus(`Successfully downloaded new 5m precipitation data`);
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
  if(req.query.polygon1){
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
      polyarray1.push(nw, sw, se, ne, nw);

    // to close Loop forpolygon
    query['geojson.geometry']=
     {$geoWithin: {$geometry: {
      type: "Polygon",
      coordinates: [polyarray1]}}};
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
