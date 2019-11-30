/*jshint esversion: 6 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoose = require('mongoose');
var request = require('request');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// mongoose setup
mongoose.connect('mongodb://localhost:27017/geomergency', {useNewUrlParser: true, useUnifiedTopology: true});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// sets paths to routers
app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

// use scripts, styles in webserver
app.use("/stylesheetpug", express.static(__dirname + '/public/stylesheets/style.css'));
app.use("/leafletscript", express.static(__dirname + '/public/javascripts/leaflet.js'));

app.use('/gemeinden', express.static(__dirname + '/landkreise.json'));

// mongoDB models:
var Tweet = require("./models/tweet");
var Kreis = require("./models/kreis");
var UnwetterKreis = require("./models/unwetterkreis");
// const kitty = new Tweet({ json: '{"test": "1"}' });
// kitty.save();

app.get("/r", (req, res ) =>{
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


/** Adding German "kreisgrenzen" into db
  * @author Dorian
  *
  */
app.get("/kreise", (req, res ) =>{
  var requestSettings = {
        url: "http://localhost:3000/gemeinden",
        method: 'GET'
    };
  request(requestSettings, function(error, response, body) {
    if(error){
      console.log(error);
    }
    var kreisListe = JSON.parse(body).features;
    for(var i= 0; i <= kreisListe.length -1; i++){
        console.log( kreisListe[i].geometry.type);
        var addKreis = new Kreis({
          geojson: {
            type: "Feature",
            properties: {
              name: kreisListe[i].properties.GEN,
            },
            geometry: {
              type: kreisListe[i].geometry.type,
              coordinates: kreisListe[i].geometry.coordinates
           }
         }
        });
        //addKreis.properties.name = kreisListe[i].properties.GEN;
        addKreis.save();
        if(i == kreisListe.length -1 ){
          res.send('Regions of germany added into db');
        }
    }

  });
});

app.get('/loadUnwetter', (req, res) => {
  var requestSettings = {
        url: "http://localhost:3000/gemeinden",
        method: 'GET'
    };
  request('https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json', function(error, response, body) {
    if(error){
      console.log(error);
    }

    var toJson = body.slice(24, body.length - 2);
    var warnings =  JSON.parse(toJson);
    var dangerzone  = [];
    for(var key in warnings.warnings){
      dangerzone.push([warnings.warnings[key][0].regionName, warnings.warnings[key][0].event]);
    }
    Kreis.find({}, function(err, result){
      if(err){
        console.log(err);
      }
      var zet = [];
      dangerzone.forEach((item, index) =>{
        for(var i= 0; i < result.length; i++){
          if(item[0].includes(result[i].geojson.properties.name)){
            console.log(item[0] + "   " + result[i].geojson.properties.name);
            var addUnwetterKreis = new UnwetterKreis({
              geojson: {
                type: "Feature",
                properties: {
                  name: result[i].geojson.properties.name,
                  event: item[1]
                },
                geometry: {
                  type: result[i].geojson.geometry.type,
                  coordinates: result[i].geojson.geometry.coordinates
               }
             }
            });
            addUnwetterKreis.save();
          }
        }
      });
      res.send(dangerzone);
    });
});
});

app.get("/getEvent", (req, res)=>{
  UnwetterKreis.find({}, (err, result)=>{
    var json = {type: "FeatureCollection", features:[]};
    result.forEach((item, index) =>{
      json.features.push(item.geojson);
    });

    res.json(json);
  });
});



/** requesting GEJSOn of deutsche Kreise
  * @author Dorian
  *
  */
app.get('/getBorders', (req, res) => {

  let qname =  req.query.name;
  let qlat =  req.query.lat;
  let qlng = req.query.lng;
  var regions ={type:"FeatureCollection", features:[]};
  Kreis.find({}, function(err, result){
    if(err){
      console.log(err);
    }

    for(var i= 0; i < result.length; i++){
        regions.features.push(result[i].geojson);
    }
    res.json(regions);
  });
});

/**
  * get Tweet in rectangle
  * @author Dorian
  * @params rectangular [N, W, S, E]
  * @return JSOn result
  */
function getTweetsInRect(rectangular){
   return Tweet.find()
  .where('lat').gte(rectangular[0]).lte(rectangular[2])
  .where('lat').gte(rectangular[1]).lte(rectangular[3]);
}


/**
  * get Tweet in Timespan
  * @author Dorian
  * @params start start date 'YYYY-MM-DD'
  * @params end end date 'YYYY-MM-DD'
  * @return JSON Tweets
  */
function getTweetsInTimespan(rectangular){
  return Tweet.find()
  .where('date').gte(start).lte(end);
}

/**
  * get Tweets which includes expression
  * @author Dorian
  * @params word the searched word
  * @return JSON Tweets
  */
function getTweetsIncludeWord(word){
  return Tweet.find()
  .where('Text').includes(word);
}




/**
  * find Word in tweet by an given input
  * @author Dorian
  * @params Text which got searched
  * @params word to find
  * @return TweetIDs
  */
  function findWord(text, word){
    text.includes(word);
  }

  /**
    * check if point is in rectangle
    * @author Dorian
    * @params point[lat, lng]
    * @params rectangle[[lat,lng],[lat,lng]] --> [N, W, S, E]
    * @return boolean
    */
    function checkPointInRect(point, rectangle){
      if(point[0] < rectangle[0] && point[2] < rectangle[0] && point[1] < rectangle[1] && point[1] < rectangle[3]){
        return true;
      } else {
        return false;
      }
    }


/**
  * sets the default location of a pair of a location
  * e.g. a default Map view postion
  *
  * @author Dorian
  * @problems what happens if cookie is empty??
  */
app.get('/getdefaultlocation', function(req, res) {
    var location = req.cookies.coords;
    res.send(location);
});

/**
  * sets the default location of a pair of a location
  * e.g. a default Map view postion
  *
  * @author Dorian
  * @problems  function has to be changed to post???? --> UI
  */
app.get('/setdefaultlocation/:lat/:lng', function(req, res){
  //res.clearCookie("coords");
  var position = [];
  position.push(req.params.lat);
  position.push(req.params.lng);
  res.cookie('coords', position, {});
  res.redirect('/getdefaultlocation');
});

//Tweet api
//the example tweet, later to be replaced by the database
var exampleTweet = require('./exampleData/example-tweet.json');

app.get('/tweets', (req, res) => {
  return res.send(tweetAPI(req, res));
});

/**
* @function tweetAPI callback function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response
* example http://localhost:3000/tweets?fields=id,text
* @author Felix
*/
function tweetAPI(req, res){
  var outJSON = {"tweets" : []};

  //access the provided parameters
  let fields = req.query.fields;

  //QUERY FIELDS
  //if field params are passed, return requested fields only
  if(fields != undefined){
    fields = fields.split(",");
    //traverse every tweet in the given list
    for (var entry of exampleTweet.tweets){
      //for every tweet, pick only the fields that are specified
      let tweet = {};
      for (var field of fields){
        tweet[field] = entry[field];
      }
      outJSON.tweets.push(tweet);
    }
  }
  //if no field params passed, return full tweet
  else{
    outJSON = exampleTweet;
  }

  //return JSON of tweets
  return outJSON;
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
