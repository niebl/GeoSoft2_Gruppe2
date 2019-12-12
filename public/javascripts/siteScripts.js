/*jshint esversion: 8 */

var bbox = "55.22,5.00,47.15,15.20";
var older_than;

//initialise with the current timestamp, -5 minutes
older_than = Date.now() - 300000

//site-events
//click of UPDATE MAP button
$("#update-map").click(function(){
  updateMapTweets();
});

/**
* @function showAllTweets a test function to see if tweets show up on map
*/
async function showAllTweets(){
  //make a promise to ensure the tweets are there before executing the rest of the function
  var tweetPromise = new Promise(async function(resolve, reject){
    var tweets = await getTweets("bbox="+bbox+"&older_than="+older_than);
    resolve(tweets.tweets);
  });

  tweetPromise.then(function(tweets){
    for (let tweet of tweets){
      console.log("chirp")
      console.log(tweet)
      addTweetToMap("map", tweet);
    }
  });
}

/**
* @function updatgeMapTweets
* @desc updates the map with the tweets that have
*/
async function updateMapTweets(){
  var tweetPromise = new Promise(async function(resolve, reject){
    var tweets = await getTweets("bbox="+bbox+"&older_than="+older_than);
    resolve(tweets.tweets);
  });
  //update the timestamp to where tweets were last fetched
  older_than = Date.now()
  tweetPromise.then(function(tweets){
    for (let tweet of tweets){
      addTweetToMap("map", tweet);
    }
  });
}

/**
* @function getTweets
* @desc queries internal API for tweets within given bounding box
* @param params string of parameters for the API query.
* @see ApiSpecs
* @returns Object containing array of information about Tweets
*/
async function getTweets(params){
  let output;
  var requestURL = "http://localhost:3000/tweetAPI/search?";
  requestURL = requestURL + params;

  console.log(requestURL)
  await $.ajax({
    url: requestURL,
    success: function(data){
      output = data;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log("error in getTweets")
      console.log(xhr.status);
      console.log(thrownError)
    }
  });
  return output;
}
