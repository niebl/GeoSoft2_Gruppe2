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
app.get("/", (req, res)=>{res.send("hello world")});
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
var exampleTweet = require('./exampleData/example-tweet.json')

app.get('/tweets', (req, res) => {
  return res.send(tweetAPI(req, res))
})

/**
* @function tweetAPI callback function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response
* example http://localhost:3000/tweets?fields=id,text
* @param req
* @param res
*/
function tweetAPI(req, res){
  var outJSON = {};

  //access the provided parameters
  let fields = req.query.fields;


  fields = fields.split(",")
  for (var field of fields){
    outJSON[field] = exampleTweet[field];
  }
  console.log(outJSON);
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

//provisorischer listener.
const port =  3000;
app.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);

module.exports = app;
