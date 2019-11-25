/*jshint esversion: 6 */

const api = require('./apis')

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
  res.render('index');
});

// mongoose setup
mongoose.connect('mongodb://localhost:27017/local', {useNewUrlParser: true, useUnifiedTopology: true});

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
//API-endpoints
app.get('/tweetAPI/search', (req, res) => {
  res.send(api.tweetSearch(req, res));
});

app.post('/tweetAPI', (req, res) => {
  //post here
  res.send('POST request to the homepage');
});

app.delete('/tweetAPI', (req, res) => {
  //delete here https://dustinpfister.github.io/2018/06/21/express-app-delete/
  res.send('DELETE request to the homepage');
});

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

var exampleTweet = require('./exampleData/example-tweet.json');
/**
* @function tweetSearch callback function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response.
* example http://localhost:3000/tweets?fields=id,text
* params: bbox: The bounding Box of the geographical area to fetch tweets from
*         include: The strings that are to be included in the returned tweets
*         exclude: The strings that aren't to be included in the returned tweets
*         fields: The fields of the tweets that are to be returned
*         latest: whether or not to only show the latest tweet
* @param req the request that was submitted in the REST QUERY
* @author Felix
* TODO: Add error handling and response codes https://www.ibm.com/support/knowledgecenter/SS42VS_7.3.2/com.ibm.qradar.doc/c_rest_api_errors.html
*/
<<<<<<< HEAD
function tweetSearch(req,res){
=======
tweetSearch: function(req,res){
>>>>>>> 8390af75ba9374a564806b5ffe8771d399562da0
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

  {
    //delete later
    outJSON = exampleTweet;
  }

  //call to function that will look for tweets on TweetDB within bounding box.
  //IMPORTANT: FUNCTION NAME AND PARAMETERS WILL LIKELY CHANGE.
  //outJSON.tweets = getTweetsInRect(bbox);


  //QUERY include
  if(include != undefined){
    //    include = include.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
    let userRegEx = new RegExp(include);
    for(let tweet in outJSON.tweets){
      //if there is a match, push tweet to outJSON
      if(
        outJSON.tweets[tweet].text.includes(include)
        ||(outJSON.tweets[tweet].text.match(userRegEx) !==null)
      ){newOutJSON.tweets.push(outJSON.tweets[tweet]);}
    }
    //make newOutJSON the new outJSON, reset the former
    outJSON = newOutJSON;
    newOutJSON = {"tweets":[]};
  }

  //QUERY exclude
  if(exclude != undefined){
    //    exclude = exclude.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
    for(let i= outJSON.tweets.length-1; i >= 0; i--){
      //console.log(outJSON.tweets[i].text)
      if(
        outJSON.tweets[i].text.includes(exclude)
        //||(outJSON.tweets[i].text.match(userRegEx) !==null )
      ){outJSON.tweets.splice(i,1);}
    }
  }

  //QUERY latest
  //if latest is requested, return only latest tweet meeting given parameters
  if(latest != undefined){
    if(latest.toUpperCase() === "TRUE"){
      //in the beginning was Jan 01 1970
      let latestTime = new Date("Thu Jan 01 00:00:00 +0000 1970");


      for(let tweet of outJSON.tweets){
        //if there is a younger one than the previous, make that the new latest
        if(new Date(tweet.created_at) > latestTime){
          latestTime = tweet.created_at;
          newOutJSON.tweets = [];
          newOutJSON.tweets.push(tweet);
        }
      }
      //make newOutJSON the new outJSON, reset the former
      outJSON = newOutJSON;
      newOutJSON = {"tweets":[]};
    }
  }

  //QUERY fields
  //if field params are passed, return requested fields only
  if(fields != undefined){
    fields = fields.split(",");
    let fieldtweets = {"tweets" : []};
    //traverse every tweet in the given list
    for (let entry of outJSON.tweets){
      //for every tweet, pick only the fields that are specified
      let tweet = {};
      for (let field of fields){
        tweet[field] = entry[field];
      }
      fieldtweets.tweets.push(tweet);
    }
    outJSON = fieldtweets;
  }

  return outJSON;
}

module.exports = app;
