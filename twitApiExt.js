/*jshint esversion: 6 */
//use twitter package. src: https://github.com/jdub/node-twitter
const Twitter = require('twitter');
var request = require('request');

const Tweet = require('./models/tweet.js');
var mongoose = require('mongoose');

var exampleTweets = require('./public/jsons/exampleTweets.json');

var utilities = require('./utilityFunctions.js');
const configurations = utilities.loadConfigs(__dirname+'/config.yml');
const token = configurations.tokens;

console.log(token)

module.exports = {

  testparams : {
    params1 : {screen_name: 'DWD_presse'},
    params2 : {//q: 'regen',
      geocode: "51.17,10.45,430km"
    },
    params3 : {
      //track: "klima",
      locations: "5.00,47.15,15.20,55.22"
    }
  },

  //create a Twitter object that is used for the queries
  client : new Twitter(token.twitter),
  stream : null,

  /**
  * @function tweetStreamExt
  * @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  * @param callback the function that is being called when new data is coming in. only works on non-example data
  * @param siteState String that indicates whether or not the current state is demo-scenario or standard mode
  * @see updateTweetStream
  */
  tweetStreamExt : async function(params, callback, siteState){
    //demo mode
    if(siteState == "example"){
      utilities.indicateStatus("starting example-tweet stream");
      //kill stream
      this.stream = null;

      //delete all real tweets first before switching into demo mode
      let deleteRequestURL = "http://localhost:3000/tweets";

      var deleteRequestSettings = {
        uri: deleteRequestURL,
        method: 'DELETE',
        encoding: null,
      };
      await request(deleteRequestSettings, function(error, response, body){
        if(error){
          console.log(error);
        } else {return true};
      });

      //shuffle the order of the exampletweets
      exampleTweets = this.shuffleArray(exampleTweets);

      //send the example tweets to the database in bytes
      let i = 0;
      var tweetInterval = setInterval(function(){

        //create the tweet object, because somehow the callback won't work
        //FIXME, TODO: make callback work
        Tweet.create({
          id_str : exampleTweets[i].id_str,
          text : exampleTweets[i].text,
          created_at : Date.now()+1000,
          embeddedTweet : exampleTweets[i].embeddedTweet,
          geojson: {
            type: "Feature",
            properties: {
            },
            geometry: {
              type : "Point",
              coordinates : [exampleTweets[i].geojson.geometry.coordinates[0], exampleTweets[i].geojson.geometry.coordinates[1]]
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

        i++;
        if(i >= exampleTweets.length-1) {
          clearInterval(tweetInterval);
        }
      }, 5000);
    }

    //normal mode
    else {
      this.stream = this.client.stream('statuses/filter', params);
      utilities.indicateStatus("starting twitter-API stream");
      this.stream.on('data', function(event){
        callback(event);
      });

      this.stream.on('error', function(error) {
        console.log(error);
        utilities.indicateStatus(error);
      });
    }
  },

  /**
  * @function killStreamExt
  * @desc function that kills the running function listening to the twitter stream api
  * @returns boolean whether it was successful
  */
  killStreamExt : function(){
    try{
    this.stream = null;
    } catch(error){
      return false;
    }
    return true;
  },

  /**
  * @function TweetSearchExt search for tweets using twitters api (the external twitter api)
  * @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  * @returns Object containing statuses:[(array of tweets)]  and search_metadata:{(various metadata)}
  * @see filterGeotagged
  */
  tweetSearchExt : function(params){
    let tweetPromise = new Promise(function(resolve, reject){
      client.get('search/tweets', params, function(error, tweets, response) {
        if (!error){
          tweets = this.filterGeotagged(tweets);
          resolve(tweets);
        } else {
          console.log(error);
          reject(error);
        }
      });
    });

    tweetPromise.then(function(tweets){
      return(tweets);
    });

  },

  /**
  * @function filterGeotagged filter the response of the Twitter api to only return geo-tagged tweets.
  * @param response the response the api got
  */
  filterGeotagged: function(response){
    //traverse the tweets from the back
    for(let i = response.statuses.length-1; i>=0; i--){
      //remove every tweet without coordinates
      if(response.statuses[i].coordinates == null){
        response.statuses.splice(i, 1);
      }
    }
    //console.log(response)
    return response;
  },

  /**
  * @function shuffleArray
  * implementation of the Durstenfeld-shuffle
  * credit: https://stackoverflow.com/a/12646864
  */
  shuffleArray: function(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

//console.log(tweetSearchExt(params2))
// tweetStreamExt(params3, function(tweet){
//   if(tweet.coordinates != null){
//     console.log(tweet.text);
//     console.log(tweet.coordinates);
//     console.log(tweet.id);
//     console.log(tweet.created_at);
//     console.log("_______________________________");
//   }
// });

//searchTweetExt(params2)
