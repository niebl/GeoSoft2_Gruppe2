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
    var requestURL = "http://localhost:3000/statuses";
    //let requestURL = "https://localhost:3000/embedTweet?id="

    request.post(requestURL, {form:
      {
        message: text,
        created_at: Date.now()
      }
  });},
  /**
  * @function parseBBOX
  * @desc function that takes a string of 4 coordinates and parses it into an Array
  * @param bboxString String that describes a boox in 2 coordinates
  * @returns array of length 4 or error
  */
  parseBBOX: function(bboxString){
    //QUERY BoundingBox
    //create boundingBox geojson from given parameters
    try {
      bbox = bboxString.split(",");
    }catch(err){
      return(err)
    }

    //numberify the strings
    for(let i = 0; i < bbox.length; i++){
      bbox[i] = parseFloat(bbox[i]);

      //return error when bbox coord was not given a number
      if(isNaN(bbox[i])){
        var err = new Error("bbox parameter "+i+" is not a number");
        return err;
      }
    }

    //check validity of bbox
    if(bbox.length != 4){
      var err = new Error("invalid parameter for bbox");
      return err;
    }
    //check validity of bbox coordinates
    if(!(
      (bbox[0]>bbox[2])&& //north to be more north than south
      (bbox[1]<bbox[3])&& //west to be less east than east

      bbox[0]<=85 && bbox[0]>=-85&& //north and south in range of 85 to -85 degrees
      bbox[2]<=85 && bbox[2]>=-85&&

      bbox[1]<=180 && bbox[1]>=-180&& //east and west in range of 180 to -180 degrees
      bbox[3]<=180 && bbox[3]>=-180
    )){
      var err = new Error("bbox coordinates are not geographically valid");
      return err;
    };
    return bbox
  }
};
