/*jshint esversion: 6 */

var express = require('express');
var router = express.Router();

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

router.get("/rad", (req, res ) =>{
  var url = 'http://localhost:8000/radio';
  var requestSettings = {
        url: url,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
        res.send(JSON.parse(JSON.parse(body)));

    });
});



module.exports = router;
