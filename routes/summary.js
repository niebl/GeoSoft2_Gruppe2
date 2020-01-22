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
        //res.set('Content-Type', 'json');
        res.send(body);

    });
});

router.get("/summary1", async function(req, res ){
  var url = 'http://localhost:8000/wordcloud';
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

module.exports = router;
