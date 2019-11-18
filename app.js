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

app.get('/tweets', (req, res) => {
  return res.send(tweetAPI(req, res));
});

/**
* @function tweetAPI callback function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response
* example http://localhost:3000/tweets?fields=id,text
* @author Felix
* TODO: make multiple queries at once possible.
*       they need some sort of hierarchy
* TODO: add error messages for invalid queries
* TODO: getcapabilities
*/
function tweetAPI(req, res){
  var outJSON = {"tweets" : []};

  //access the provided parameters
  let fields = req.query.fields;
  let contains = req.query.contains;


  //if no query params passed, return all tweets
  if(req.query == undefined){
    outJSON = exampleTweet;
  } else {

    //QUERY CONTAINS
    //if contains params are passed, return tweets containing requested substrings only
    if(contains != undefined){
      //regex match all in quotes
      contains = contains.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);

      //traverse every tweet text for the given substrings
      for (let entry of exampleTweet.tweets){
        for (let string in contains){
          //TODO: support for AND OR
        }
      }
    }

    //QUERY FIELDS
    //if field params are passed, return requested fields only
    if(fields != undefined){
      fields = fields.split(",");
      //traverse every tweet in the given list
      for (let entry of exampleTweet.tweets){
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
  //return JSON of tweets
  return outJSON;
}

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

//provisorischer listener.
const port =  3000;
app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`)
);

module.exports = app;
