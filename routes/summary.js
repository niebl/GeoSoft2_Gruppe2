/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();


router.get("/wordcloud", async function(req, res ){
  url = 'http://localhost:8000/wordcloud';

  // tbd
  if(req.query.minfreq){
    url = 'http://localhost:8000/wordcloud?minfreq=' + req.query.minfreq ;
  }

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(500).send('Bad Request');
      }else{
        //res.set('Content-Type', 'text');
        try{
          res.set('Content-Type', 'image/png');
          res.send(body);
        }catch(err){
          console.error(err);
        }
      }
    });
});


router.get("/timeline", async function(req, res ){
  url = 'http://localhost:8000/timeline?';

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(500).send('Bad Request');
      }else{
        //res.set('Content-Type', 'text');
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
* @function quadrat
* Getting the density json from R /density
* @return density json
*/
router.get("/quadrat", async function(req, res ){
  var url = 'http://localhost:8000/quadrat';

  if(req.query.xbreak && req.query.ybreak){
    
    url = url + "?xbreak=" + req.query.xbreak + "&ybreak=" + req.query.ybreak;
  }
  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(500).send('Bad Request');
      }else{
        //res.set('Content-Type', 'text');
        try{
          var rbody= (JSON.parse(JSON.parse(body)));
          res.send(rbody.features);
        }catch(err){
          console.error(err);

        }
      }
    });

});


/**
* @function density
* Getting the density json from R /density
* @return density json
*/
router.get("/density", async function(req, res ){
  var url = 'http://localhost:8000/density';

  if(req.query.sigma){
    url = url + "?sigma=" + req.query.sigma;
  }
  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
        method: 'GET',
        encoding: null
    };

    request(requestSettings, function(error, response, body) {
      if(error){
        res.status(500).send('Bad Request');
      }else{
        //res.set('Content-Type', 'text');
        try{
          var rbody= (JSON.parse(JSON.parse(body)));
          res.send(rbody.features);
        }catch(err){
          console.error(err);

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

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
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
* Getting the k- function from R
* @return l function plot
*/
router.get("/lest", async function(req, res ){
  var url = 'http://localhost:8000/lest';

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
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
* Getting the k- function from R
* @return gest plot
*/
router.get("/gest", async function(req, res ){
  var url = 'http://localhost:8000/gest';

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
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
* @function fest
* Getting the k- function from R
* @return fest plot
*/
router.get("/fest", async function(req, res ){
  var url = 'http://localhost:8000/fest';

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
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
* Getting the k- function from R
* @return ann plot
*/
router.get("/ann", async function(req, res ){
  var url = 'http://localhost:8000/ann';

  let tweetRequestUrl = `http://localhost:3000/tweets?`;
  if(req.query.bbox){
    tweetRequestUrl = tweetRequestUrl+`bbox=${req.query.bbox}&`;
  }
  if(req.query.older_than){
    tweetRequestUrl = tweetRequestUrl+`older_than=${req.query.older_than}&`;
  }
  if(req.query.include){
    tweetRequestUrl = tweetRequestUrl+`include=${req.query.include}&`;
  }
  if(req.query.exclude){
    tweetRequestUrl = tweetRequestUrl+`exclude=${req.query.exclude}&`;
  }
  //TODO: include, exclude


  console.log(tweetRequestUrl);

  var requestSettings = {
        url: url,
        body: `{"url": "${tweetRequestUrl}"}`,
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
