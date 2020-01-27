/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

//this is  a test function
router.get("/summary", async function(req, res ){
  var url = 'http://localhost:8000/data';
  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweetAPI/search?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);

    });
});

router.get("/wordcloud", async function(req, res ){
  console.log("wordcloud");
  var url = 'http://localhost:8000/wordcloud';
  console.log(req.query.minfreq);
  if(req.query.minfreq){
    url = 'http://localhost:8000/wordcloud?minfreq=' + req.query.minfreq ;
  }

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, async function(error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);

    });
});

/**
* @function density
* Getting the density json from R /density
* @params Sigma value for sigma
* @return density json
*/
router.get("/density", async function(req, res ){
  var url = 'http://localhost:8000/density';
  if(req.query.sigma){
    url = url+"?sigma=" + req.query.sigma;
  }
  var tweeturl = "http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655";
  if(req.query.bbox){
    tweeturl= "http://localhost:3000/tweets?bbox=" + req.query.bbox;
    if(req.query.sigma){
      var coords = req.query.bbox.split(",");
      url = url+"&north=" + coords[0]+ "&east=" + coords[1]+ "&south=" + coords[2] + "&west=" + coords[3];
    }else{
      var coords1 = req.query.bbox.split(",");
      url = url+"?north=" + coords1[0] + "&east=" + coords1[1]+ "&south=" + coords1[2] + "&west=" + coords1[3];
    }
  }
  console.log("Density URL:  " + url);
  var requestSettings = {
        url: url,
        body: '{"url": "' +  tweeturl + '"}',
        method: 'GET',
        encoding: null
    };

    await request(requestSettings, function(error, response, body) {
      if(error){
        res.status(500).send('Bad Request');
      }else{
        //res.set('Content-Type', 'text');
        try{
          var rbody= (JSON.parse(JSON.parse(body)));
          res.send(rbody.features);
        }catch(err){
          console.error(err);
          res.status(500).send('Bad Request');
        }
      }
    });
});

/**
* @function kest
* Getting the k- function from R
* @return kest plot
*/
router.get("/kest", async function(req, res ){
  var url = 'http://localhost:8000/kest';

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, async function(error, response, body) {
      if(error){
        res.status(400).send('Bad Request');
      } else{
        try{
          res.set('Content-Type', 'image/png');
          res.send(body);
        }catch(err){
          console.error(err);
        }
        }
    });
});

/**
* @function fest
* Getting the f- function from R
* @return fest plot
*/
router.get("/fest", async function(req, res ){
  var url = 'http://localhost:8000/fest';

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(400).send('Bad Request');
      } else{
        try{
          res.set('Content-Type', 'image/png');
          res.send(body);
        }catch(err){
          console.error(err);
        }
        }
    });
});

/**
* @function gest
* Getting the g- function from R
* @return gest plot
*/
router.get("/gest", async function(req, res ){
  var url = 'http://localhost:8000/gest';

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(400).send('Bad Request');
      } else{
        try{
          res.set('Content-Type', 'image/png');
          res.send(body);
        }catch(err){
          console.error(err);
        }
        }
    });
});

/**
* @function lest
* Getting the l- function from R
* @return lest plot
*/
router.get("/lest", async function(req, res ){
  var url = 'http://localhost:8000/lest';

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(400).send('Bad Request');
      } else{
        try{
          res.set('Content-Type', 'image/png');
          res.send(body);
        }catch(err){
          console.error(err);
        }
        }
    });
});

/**
* @function ann
* Getting average nearest neighbour
* @return lest plot
*/
router.get("/ann", async function(req, res ){
  var url = 'http://localhost:8000/ann';

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweets?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(400).send('Bad Request');
      } else{
        try{
          res.set('Content-Type', 'image/png');
          res.send(body);
        }catch(err){
          console.error(err);
        }
        }
    });
});
module.exports = router;
