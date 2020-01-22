/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();

var Precipitation = require("../models/precipitation");

router.get("/summary", async function(req, res ){
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


module.exports = router;
