/*jshint esversion: 8 */
const token = require('./tokens.js');


var twitterApiExt = require('./twitApiExt.js');

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
const https = require('https');
const turf = require('@turf/turf')
var app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// mongoose setup
mongoose.connect('mongodb://localhost:27017/geomergency', {useNewUrlParser: true, useUnifiedTopology: true}, function(err){
  if (err) {
    console.log("mongoDB connect failed");
    console.log(err);
  }
  console.log("mongoDB connect succeeded");
  console.log(mongoose.connection.host);
  console.log(mongoose.connection.port);
});
const Tweet = require('./models/tweet.js');

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
app.use('/popper.js', express.static(__dirname + '/node_modules/popper.js/dist'))
app.use('/turf', express.static(__dirname + '/node_modules/@turf/turf'))

// use scripts, styles in webserver
app.use("/stylesheetpug", express.static(__dirname + '/public/stylesheets/style.css'));
app.use("/leafletscript", express.static(__dirname + '/public/javascripts/leaflet.js'));
app.use("/siteScripts", express.static(__dirname+'/public/javascripts/siteScripts.js'))

//tweet query functions

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

/**
* get Tweets in rectangle
* @author Dorian, heavily modified by Felix
* @param rectangular [N, W, S, E], WGS84
* @return Array
*/
async function getTweetsInRect(rectangular){
  let output
  await Tweet.find({
    'geojson.geometry.coordinates': {
      $geoWithin: {
        $box : [
          [rectangular[1],rectangular[2]], //West-Sount
          [rectangular[3],rectangular[0]] //East-North
        ]
      }
    }
  },
  function(err, docs){
    if(err){
      console.log("~~~~~! error in mongoDB query !~~~~~")
      console.log(error)
    }
    output = docs;
  });
  return output;
}

/**
* @function queryTweets
* @author Felix
* @param queries, Object of mongoose queries
* @return mongoose docs
*/
async function queryTweets(queries){
  let output;
  await Tweet.find(
    queries,
    function(err,docs){
      if(err){
        console.log("~~~~~! error in mongoDB query !~~~~~");
        console.log(error);
      } else {
      output = docs;
      }
    }
  );
  return output;
}

//Tweet api

//~~~~~~~API-endpoints~~~~~~~
//public DB search API
app.get('/tweetAPI/search', async (req, res) => {
  res.send(await tweetSearch(req, res));
});


/**
* @function tweetSearch callback function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response.
* example http://localhost:3000/tweets?fields=id,text
* params: bbox: The bounding Box of the geographical area to fetch tweets from
*         include: The strings that are to be included in the returned tweets
*         exclude: The strings that aren't to be included in the returned tweets
*         fields: The fields of the tweets that are to be returned
*         latest: whether or not to only show the latest tweet
* @param req
* @param res
* @author Felix
*/
async function tweetSearch(req,res){
  let outJSON = {tweets : []};
  let newOutJSON = {tweets : []};
  const geoJSONtemplate = {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "","coordinates": [[]]}}]};

  //access the provided parameters
  var older_than = req.query.older_than
  var bbox = req.query.bbox;
  var include = req.query.include;
  var exclude = req.query.exclude;
  var fields = req.query.fields;
  var latest = req.query.latest;

  //check validity of parameters
  if (bbox == undefined){
    res.status(400),
    res.send("bbox is not defined")
  }

  //QUERY BoundingBox
  //create boundingBox geojson from given parameters
  try {
    bbox = bbox.split(",");
  }catch(err){
    //check
    res.status(400)
    res.send("error in bbox parameter<hr>"+err)
  }

  //numberify the strings
  for(let i = 0; i < bbox.length; i++){
    bbox[i] = parseFloat(bbox[i]);

    //return error when bbox coord was not given a number
    if(isNaN(bbox[i])){
      res.status(400);
      res.send("bbox parameter "+i+" is not a number <hr>");
    }
  }

  //check validity of bbox
  if(bbox.length != 4){
    res.status(400)
    res.send("invalid parameter for bbox")
  }
  //check validity of bbox coordinates
  if(!(
    (bbox[0]>bbox[2])&& //north to be more north than south
    (bbox[1]<bbox[3])&& //west to be less east than east

    bbox[0]<=85 && bbox[0]>=-85&& //north and south in range of 85 to -85 degrees
    bbox[2]<=85 && bbox[2]>=-85&&

    bbox[1]<=180 && bbox[1]>=-180&& //east and west in range of 180 to -180 degrees
    bbox[3]<=180 && bbox[3]>=-180
  )){
    res.status(400)
    res.send("bbox coordinates are not geographically valid")
  };

  //QUERY older_than
  //if no or incorrect time data is given, set to unix timestamp 0
  if (older_than == undefined || isNaN(older_than)){
    older_than = 0;
  }

  //call to function that will look for tweets on TweetDB within bounding box.
  //outJSON.tweets = await getTweetsInRect(bbox)
  outJSON.tweets = await queryTweets({
    'geojson.geometry.coordinates': {
      $geoWithin: {
        $box : [
          [bbox[1],bbox[2]], //West-Sount
          [bbox[3],bbox[0]] //East-North
        ]
      }
    },
    created_at: {$gt: older_than}
  })


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

    //check if requested fields exist
    for (let field of fields){
      if(!(
      field == "geojson" ||
      field == "_id" ||
      field == "id_str" ||
      field == "text" ||
      field == "created_at"
      )){
        res.status(400)
        res.send("requested field "+field+" does not exist")
      }
    }

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

//TO CHANGE: provisional initialiser of tweetStreamExt. make a proper one with custom parameters
console.log(twitterApiExt.tweetStreamExt(twitterApiExt.testparams.params3, function(tweet){
  if(tweet.coordinates != null){
    postTweetToMongo(tweet);
  }
}))

/**
* @function postTweetToMongo
* @param tweet the tweet object
* @param includes array containing strings that have to be contained in tweets
* @param excludes array containing strings that mustn't be in tweets
* @author Felix
*/
function postTweetToMongo(tweet){
  Tweet.create({
    id_str : tweet.id_str,
    text : tweet.text,
    created_at : Date.parse(tweet.created_at),
    geojson: {
      type: "Feature",
      properties: {
      },
      geometry: {
        type : "Point",
        coordinates : [tweet.coordinates.coordinates[0], tweet.coordinates.coordinates[1]]
      }
    }
  },
  function(err, tweet){
    if(err){
      console.log("error in saving tweet to DB");
      console.log(err);
      return false;
    }
  });
}
