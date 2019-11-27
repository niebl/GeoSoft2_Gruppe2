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
var params = {screen_name: 'DWD_presse'}
client.get('statuses/user_timeline', params, function(error, tweets, response) {
  if (!error) {
    console.log(tweets);
  } else {console.log(error)}
});
