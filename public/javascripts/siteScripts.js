/*jshint esversion: 8 */

var bbox = "55.22,5.00,47.15,15.20";
var older_than;
<<<<<<< HEAD
/**
* @var nearestTweetRadius.
* the minimal distance a tweet is allowed to have to another in meters.
*/
const nearestTweetRadius = 50;
=======
const nearestTweetRadius = 50
>>>>>>> 12b7c05678e78e26e9a5334022fbac2a864626e6

//initialise with the current timestamp, -5 minutes
older_than = Date.now() - 300000;

//site-events
//click of UPDATE MAP button
$("#update-map").click(function(){
  updateMapTweets();
});

/**
* @function updateMapTweets
* @desc updates the map with the tweets that have been fetched from getTweets() function
* @see getTweets
*/
async function updateMapTweets(){
  var tweetPromise = new Promise(async function(resolve, reject){
    var tweets = await getTweets("bbox="+bbox+"&older_than="+older_than);
    resolve(tweets.tweets);
  });

  //update the timestamp to when tweets were last fetched
  older_than = Date.now();

  //add the tweets once the API responded
  tweetPromise.then(function(tweets){
    for (let tweet of tweets){
      addTweetToMap(tweet);
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
