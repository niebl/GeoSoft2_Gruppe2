/*jshint esversion: 6 */

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mongoose = require('mongoose');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');




// mongoose setup
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// twitter data in mongoose
var twitter = mongoose.model('Tweet', {url: String, location: String, author: String, date: String, text: String});

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
