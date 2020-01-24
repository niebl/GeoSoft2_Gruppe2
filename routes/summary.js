/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();


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
  var url = 'http://localhost:8000/wordcloud';
  console.log(req.query.minfreq);
  if(req.query.minfreq){
    url = 'http://localhost:8000/wordcloud?minfreq=' + req.query.minfreq ;
  }

  var requestSettings = {
        url: url,
        body: null,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
        res.set('Content-Type', 'image/png');
        res.send(body);

    });
});

router.get("/density", async function(req, res ){
  var url = 'http://localhost:8000/density';
  console.log(req.query.minfreq);
  if(req.query.minfreq){
    url = 'http://localhost:8000/wordcloud?minfreq=' + req.query.minfreq ;
  }

  var requestSettings = {
        url: url,
        body: '{"url":"http://localhost:3000/tweetAPI/search?bbox=55.299,3.95,47.076,16.655"}',
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
        //res.set('Content-Type', 'text');
        var rbody= (JSON.parse(JSON.parse(body)));
        res.send(rbody.features);

    });
});

router.get("/kest", async function(req, res ){
  var url = 'http://localhost:8000/kest';
  console.log(req.query.minfreq);
  if(req.query.minfreq){
    url = 'http://localhost:8000/wordcloud?minfreq=' + req.query.minfreq ;
  }

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

module.exports = router;
