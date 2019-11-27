/*jshint esversion: 6 */
const token = require('./tokens.js');

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
  q: 'regen',
  geocode: "51.17,10.45,430km"
};

/**
* @function periodicTweetSearchExt repeat a search periodically, add results to mongodb
* @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
* @param interval the interval in milliseconds
* @see searchTweetExt
* //TODO: log of output still returns undefined. possibly because return function call searchTweetExt is not waited on 
*/
function periodicTweetSearchExt(interval, params){
  setInterval(
    function(){
      let output = searchTweetExt(params)
      console.log(output);
    }, interval
  );
}

/**
* @function searchTweetsExt search for tweets using twitters api (the external twitter api)
* @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
* @returns Object containing statuses:[(array of tweets)]  and search_metadata:{(various metadata)}
* @see filterGeotagged
* @author Felix
*/
function searchTweetExt(params){
  let tweets = [];
  client.get('search/tweets', params, function(error, tweets, response) {
    if (!error){
      tweets = filterGeotagged(tweets);
      return tweets;
    } else {console.log(error);}
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
  console.log(response)
  return response;
}

periodicTweetSearchExt(5000, params2)
//searchTweetExt(params2)
