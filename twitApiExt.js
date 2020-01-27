/*jshint esversion: 6 */
//use twitter package. src: https://github.com/jdub/node-twitter
const Twitter = require('twitter');

var utilities = require('./utilityFunctions.js');
const configurations = utilities.loadConfigs(__dirname+'/configs/config.yml');
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

  /**
  * @function tweetStreamExt
  * @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  * @param callback the function that is being called when new data is coming in
  */
  tweetStreamExt : function(params, callback){
    var stream = this.client.stream('statuses/filter', params);
    console.log(this.client.stream)
    console.log(stream)
    console.log(this.client)
//    console.log(this.client.options.request_options)
    utilities.indicateStatus("starting twitter-API stream")
    stream.on('start', function(){
      console.log("initialising twitter stream")
      utilities.indicateStatus("initialising twitter stream")
    })

    stream.on('data', function(event){
      callback(event);
    });

    stream.on('error', function(error) {
      console.log(token.twitter)
      console.log(error);
      utilities.indicateStatus(error)
    });
  },

  /**
  * @function periodicTweetSearchExt repeat a search periodically, add results to mongodb
  * @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  * @param cycles the amount of times the query is to be repeated, infinite if TRUE
  * @param interval the interval in milliseconds
  * @see searchTweetExt
  * //TODO: log of output still returns undefined. possibly because return function call searchTweetExt is not waited on
  * BROKEN
  */
  periodicTweetSearchExt : function(params, cycles, interval){
    let output = this.tweetSearchExt(params);
    {
      // setInterval(
      //   function(){
      //     let output = await searchTweetExt(params);
      //     console.log(output);
      //   }, interval
      // );
    }
    return output;
  },

  /**
  * @function TweetSearchExt search for tweets using twitters api (the external twitter api)
  * @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
  * @returns Object containing statuses:[(array of tweets)]  and search_metadata:{(various metadata)}
  * @see filterGeotagged
  * @author Felix
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
  * @function filterGeotagged filter the response of the Twitter api to only return geo-tagged tweets
  * @param response the response the api got
  * @author Felix
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
