/*jshint esversion: 6 */
const token = require('./tokens.js');
const app = require('./app.js')

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/geomergency', {useNewUrlParser: true, useUnifiedTopology: true});
const Tweet = require("./models/tweet");

//use twitter package. src: https://github.com/jdub/node-twitter
var Twitter = require("twitter")


//create a client object for the external twitter api
//the given api keys are a parameter
var client = new Twitter(
  token.twitter
);

//just a test
var params1 = {screen_name: 'DWD_presse'}
var params2 = {
  //q: 'regen',
  geocode: "51.17,10.45,430km"
};
var params3 = {
  //track: "regen, wetter, sturm, hagel, schnee, hilfe",
  locations: "5.00,47.15,15.20,55.22"
};

/**
* @function tweetStreamExt
* @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
* @param callback the function that is being called when new data is coming in
*/
function tweetStreamExt(params, callback){
  var stream = client.stream('statuses/filter', params);
  stream.on('data', function(event){
    callback(event);
  });

  stream.on('error', function(error) {
    console.log(error);
  });
}

/**
* @function periodicTweetSearchExt repeat a search periodically, add results to mongodb
* @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
* @param cycles the amount of times the query is to be repeated, infinite if TRUE
* @param interval the interval in milliseconds
* @see searchTweetExt
* //TODO: log of output still returns undefined. possibly because return function call searchTweetExt is not waited on
*/
function periodicTweetSearchExt(params, cycles, interval){
  let output = tweetSearchExt(params);
  console.log(output)
  {
    // setInterval(
    //   function(){
    //     let output = await searchTweetExt(params);
    //     console.log(output);
    //   }, interval
    // );
  }
  return output;
}

/**
* @function TweetSearchExt search for tweets using twitters api (the external twitter api)
* @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
* @returns Object containing statuses:[(array of tweets)]  and search_metadata:{(various metadata)}
* @see filterGeotagged
* @author Felix
*/
function tweetSearchExt(params){
  let tweetPromise = new Promise(function(resolve, reject){
    client.get('search/tweets', params, function(error, tweets, response) {
      if (!error){
        tweets = filterGeotagged(tweets);
        resolve(tweets);
      } else {
        console.log(error);
        reject(error);
      }
    });
  });

  tweetPromise.then(function(tweets){
    console.log(tweets);
    return(tweets);
  });

}

/**
* @function filterGeotagged filter the response of the Twitter api to only return geo-tagged tweets
* @param response the response the api got
* @author Felix
*/
function filterGeotagged(response){
  //traverse the tweets from the back
  for(let i = response.statuses.length-1; i>=0; i--){
    //remove every tweet without coordinates
    if(response.statuses[i].coordinates == null){
      response.statuses.splice(i, 1);
    }
  }
  //console.log(response)
  return response;
}

//console.log(tweetSearchExt(params2))
tweetStreamExt(params3, function(tweet){
  if(tweet.coordinates != null){
    console.log(tweet.text);
    console.log(tweet.coordinates);
    console.log(tweet.id)
    console.log(tweet.created_at)
    console.log("_______________________________")
  }
});

//searchTweetExt(params2)
