/*jshint esversion: 6 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//TODO change request to include turf
var turf = require('@turf/turf');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.get('/', function(req, res) {
  res.render('index');});

// mongoose setup
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});


// twitter data in mongoose
var twitter = mongoose.model('Tweet', {url: String, location: String, author: String, date: String, text: String});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/index', indexRouter);
app.use('/users', usersRouter);


app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

// use scripts, styles in webserver
app.use("/stylesheetpug", express.static(__dirname + '/public/stylesheets/style.css'));
app.use("/leafletscript", express.static(__dirname + '/public/javascripts/leaflet.js'));


app.get('/getdefaultlocation', function(req, res) {
    var location = req.cookies.coords;
    res.send(location);
});
app.get("/", (req, res)=>{res.send("hello world");});
app.get('/setdefaultlocation1/:lat/:lng', function(req, res){
  //res.clearCookie("coords");
  var position = [];
  postion.push(req.params.lat);
  postion.push(req.params.lng);
  res.cookie('coords', postion, {httpOnly: true, secure: true, path:'/'});
  res.send(req.params.lat);
});

//Tweet api
//the example tweet, later to be replaced by the database
var exampleTweet = require('./exampleData/example-tweet.json');

//API-endpoints
app.get('/tweetAPI/search', (req, res) => {
  res.send(tweetSearch(req, res));
});

app.post('/tweetAPI', (req, res) => {
  //post here
  res.send('POST request to the homepage');
});

app.delete('/tweetAPI', (req, res) => {
  //delete here https://dustinpfister.github.io/2018/06/21/express-app-delete/
  res.send('DELETE request to the homepage');
});

/**
* @function tweetSearch callback function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response
* example http://localhost:3000/tweets?fields=id,text
* @author Felix
* TODO: finish each query parameters
* TODO: make optional parameters optional
*/
function tweetSearch(req,res){
  let outJSON = {"tweets" : []};
  let newOutJSON = {"tweets":[]};
  const geoJSONtemplate = {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "","coordinates": [[]]}}]};

  //access the provided parameters
  var bbox = req.query.bbox;
  var include = req.query.include;
  var exclude = req.query.exclude;
  var fields = req.query.fields;
  var latest = req.query.latest;

  //QUERY BoundingBox
  //create boundingBox geojson from given parameters
  bbox = bbox.split(",");
  //numberify the strings
  for(let i = 0; i < bbox.length; i++){
    bbox[i] = parseFloat(bbox[i]);
  }

  //call to function that will look for tweets on TweetDB within bounding box.
  //IMPORTANT: FUNCTION NAME AND PARAMETERS WILL LIKELY CHANGE.
  //outJSON.tweets = getTweetsInRect();

  //delete later
  return({
    "notes":"these are the parameters that were passed",
    "bbox":bbox,
    "include":include,
    "exclude":exclude,
    "fields":fields,
    "latest":latest
  });

  //QUERY include
  if(include != undefined)
  {
    include = include.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
    let userRegEx = new RegExp(include);
    for(let tweet in outJSON.tweets){
      //if there is a match, push tweet to outJSON
      if(
        tweet.text.includes(include) ||
        (tweet.text.match(userRegEx) !==null )
      ){newOutJSON.push(tweet);}
    }
    //make newOutJSON the new outJSON, reset the former
    outJSON = newOutJSON;
    newOutJSON = {"tweets":[]};
  }

  //QUERY exclude
  if(exclude != undefined)
  {
    exclude = exclude.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
    for(let i= outJSON.length-1; i >= 0; i--){
      if(
        outJSON.tweets[i].text.includes(include) ||
        (outJSON.tweets[i].text.match(userRegEx) !==null )
        //NOTE: UNSURE IF FOLLOWING WORKS CORRECTLY
      ){outJSON.splice(i,1);}
    }
  }

  //QUERY latest
  if(latest != undefined){
    if(latest.toUpperCase() === TRUE){
      //function to find latest tweet
    }
  }

  //QUERY fields
  //if field params are passed, return requested fields only
  if(fields != undefined){
    fields = fields.split(",");
    //traverse every tweet in the given list
    for (let entry of OutJSON.tweets){
      //for every tweet, pick only the fields that are specified
      let tweet = {};
      let fieldtweets = {"tweets" : []};
      for (let field of fields){
        tweet[field] = entry[field];
      }
      fieldtweets.tweets.push(tweet);
      outJSON = fieldtweets;
    }
  }

}

// function tweetAPI(req, res){
//   var outJSON = {"tweets" : []};
//
//   //access the provided parameters
//   let fields = req.query.fields;
//   let contains = req.query.contains;
//
//
//   //if no query params passed, return all tweets
//   if(req.query == undefined){
//     outJSON = exampleTweet;
//   } else {
//
//     //QUERY CONTAINS
//     //if contains params are passed, return tweets containing requested substrings only
//     if(contains != undefined){
//       //regex match all in quotes
//       contains = contains.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
//
//       //traverse every tweet text for the given substrings
//       for (let entry of exampleTweet.tweets){
//         for (let string in contains){
//           //TODO: support for AND OR
//         }
//       }
//     }
//
//     //QUERY FIELDS
//     //if field params are passed, return requested fields only
//     if(fields != undefined){
//       fields = fields.split(",");
//       //traverse every tweet in the given list
//       for (let entry of exampleTweet.tweets){
//         //for every tweet, pick only the fields that are specified
//         let tweet = {};
//         let fieldtweets = {"tweets" : []};
//         for (let field of fields){
//           tweet[field] = entry[field];
//         }
//         fieldtweets.tweets.push(tweet);
//         outJSON = fieldtweets;
//       }
//     }
//   }
//   //return JSON of tweets
//   return outJSON;
// }

/**
* @function searchTweets
*/

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
