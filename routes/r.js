/*jshint esversion: 6 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Precipitation = require("../models/precipitation");

router.get("/r", (req, res ) =>{
  var url = 'http://localhost:8000/data';
  var requestSettings = {
        url: url,
        body: '{"a":[10, 9, 8, 7], "b":[51, 11, 41, 52]}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);

    });
});

router.get("/precipitation", (req, res ) =>{
  var url = 'http://localhost:8000/radarhourly';
  var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {

        var rbody= (JSON.parse(JSON.parse(body)));
        rbody = rbody;

        console.log(rbody.features);
        for(let feature of rbody.features){
          console.log("FeaturE: "+ feature);
          var addRadar = new Precipitation({
            type: feature.type,
            properties: {
              level: feature.properties.layer
            },
            geometry: {
              type: feature.geometry.type,
              coordinates: feature.geometry.coordinates
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
  * @example url/getBorders?coordinates=9,53&max=20
  *
  */
router.get("/getrad", (req, res) => {
  var regions ={type:"FeatureCollection", features:[]};
  var query = {};
  if(req.query.max){
    query['geojson.properties.prec'] = { $lte: req.query.max};
  }
  if(req.query.min){
    query['geojson.properties.prec'] = { $gte: req.query.min};
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
      console.log(pair);
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
          regions.features.push(result[i]);
      }
        res.json(regions);
    });
});



module.exports = router;
