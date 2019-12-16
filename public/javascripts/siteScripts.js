/*jshint esversion: 8 */

var bbox = "55.22,5.00,47.15,15.20";
//the timestamps. older_than for updateMapTweets, older_thanCheck for checkTweetUpdates
var older_than;
var older_thanCheck;
/**
* @var nearestTweetRadius.
* the minimal distance a tweet is allowed to have to another in meters.
*/
const nearestTweetRadius = 50;

//initialise with the current timestamp, -5 minutes
older_than = Date.now() - 300000;
older_thanCheck = older_than;

//begin the periodic update check. interval of 10 seconds
checkTweetUpdates(10000);

//site-events
//click of UPDATE MAP button
$("#update-map").click(function(){
  updateMapTweets();
});
$("#sidebarCollapse").click(function(e){
  e.preventDefault();
  $("#wrapper").toggleClass("toggled");
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

  //update the timestamp to when tweets were last fetched.
  //also update the timestamp for the var used by updateTweetNotifs
  older_than = Date.now();
  older_thanCheck = older_than;

  //add the tweets once the API responded
  tweetPromise.then(function(tweets){
    for (let tweet of tweets){
      addTweetToMap(tweet);
    }
    updateTweetNotifs({clear:true});
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

  //console.log(requestURL)
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

/**
* @function checkTweetUpdates
* @desc periodically queries internal tweet API to see whether new tweets have been posted since the last update.
* notifies the user on screen
* @param interval the amount of time to pass between each check in ms
*/
async function checkTweetUpdates(interval){
  setInterval(async function(){
    var tweetPromise = new Promise(async function(resolve, reject){
      var tweets = await getTweets("bbox="+bbox+"&older_than="+older_thanCheck+"&fields=created_at");
      resolve(tweets.tweets);
    });

    tweetPromise.then(function(tweets){
      let numberNewTweets = tweets.length;
      updateTweetNotifs({increment: numberNewTweets});
      //update the timestamp
      older_thanCheck = Date.now();
    });
  },
    interval
  );
}

/**
* @function updateTweetNotifs
* @desc function that is being used to increase or clear the notifications of new tweets.
* if both clear and increment is passed, counter is first cleared, then incremented.
* @param arguments Object, with params increment and clear
* @param increment integer of times the notif is to be incremented. defaults to false
* @param clear boolean of whether to clear the counter. defaults to 0
*/
function updateTweetNotifs(arguments){
  var clear;
  var increment;

  //default clear to false unless something else is passed. dont accept non-booleans
  if(arguments.clear == undefined||arguments.clear!=true){clear = false}
    else{clear = arguments.clear};
  //default inrement to 0 unless something else is passed. don't accept non-integers
  if(arguments.increment == undefined||!Number.isInteger(arguments.increment)){increment = 0}
    else{increment = arguments.increment};

  //clear if clear is true
  if(clear){
    $("#update-badge").removeClass("visible");
    $("#update-badge").addClass("invisible");
    $("#update-badge").html(0)
  }

  //increment by the specified amount
  if(increment != 0){
    let count = parseInt($("#update-badge").html())
    $("#update-badge").html(count+increment)

    //if there is a negative correction to be made, don't update the div classes. only the html
    if(increment > 0){
      $("#update-badge").removeClass("invisible");
      $("#update-badge").addClass("visible");
    }
  }
}
