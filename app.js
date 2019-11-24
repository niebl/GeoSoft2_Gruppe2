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

module.exports = app;
