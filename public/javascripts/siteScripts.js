/*jshint esversion: 8 */

//site-events
//click of UPDATE MAP button
$("#update-map").click(function(){
  alert("click1");
});

/**
* @function getTweets
* @desc queries internal API for tweets within given bounding box
* @param bbox array of [lat-Northwest, lon-Northwest, lat-Southeast, lon-Southeast]
* @returns Object containing array of information about Tweets
*/
