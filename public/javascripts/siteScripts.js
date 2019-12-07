/*jshint esversion: 8 */

var bbox = "47.15,5.00,55.22,15.20";

//site-events
//click of UPDATE MAP button
$("#update-map").click(function(){
  showAllTweets();
});

/**
* @function showAllTweets a test function to see if tweets show up on map
*/
async function showAllTweets(){
  //make a promise to ensure the tweets are there before executing the rest of the function
  var tweetPromise = new Promise(async function(resolve, reject){
    var tweets = await getTweets(bbox);
    resolve(tweets.tweets);
  });

  tweetPromise.then(function(tweets){
    for (let tweet of tweets){
      console.log(tweet)
      addTweetToMap("map", tweet);
    }
  });

}

/**
* @function getTweets
* @desc queries internal API for tweets within given bounding box
* @param bbox string of "lat-Northwest, lon-Northwest, lat-Southeast, lon-Southeast" (WGS84)
* @returns Object containing array of information about Tweets
*/
async function getTweets(bbox){
  let output;
  var requestURL = "http://localhost:3000/tweetAPI/search?";
  requestURL = requestURL + "bbox=" + bbox;

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
