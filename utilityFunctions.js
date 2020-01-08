/*jshint esversion: 8 */

/**
* Collection of functions that will be used by more than one js in the server
**/

var request = require('request');

module.exports = {
  request: request,
  /**
  * @function indicateStatus
  * @desc sends a POST request to the status API so the client side can know what the server is doing.
  * @param text String, the message of the status
  * @Author Felix
  */
  indicateStatus : async function(text){
    var output;
    var requestURL = "http://localhost:3000/status/newprocess";
    //let requestURL = "https://localhost:3000/embedTweet?id="

    request.post(requestURL, {form:
      {
        message: text,
        created_at: Date.now()
      }
    });}
};
