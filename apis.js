/*jshint esversion: 6 */

//the example tweet, later to be replaced by the database
var exampleTweet = require('./exampleData/example-tweet.json');

module.exports = {
  /**
  * @function tweetSearch callback function
  * @desc callback function that looks at the arguments passed in the tweet API request and returns the according response.
  * example http://localhost:3000/tweets?fields=id,text
  * params: bbox: The bounding Box of the geographical area to fetch tweets from
  *         include: The strings that are to be included in the returned tweets
  *         exclude: The strings that aren't to be included in the returned tweets
  *         fields: The fields of the tweets that are to be returned
  *         latest: whether or not to only show the latest tweet
  * @param req the request that was submitted in the REST QUERY
  * @author Felix
  * TODO: Add error handling and response codes https://www.ibm.com/support/knowledgecenter/SS42VS_7.3.2/com.ibm.qradar.doc/c_rest_api_errors.html
  */
  tweetSearch: function(req,res){
    let outJSON = {"tweets" : []};
    let newOutJSON = {"tweets":[]};
    const geoJSONtemplate = {"type": "FeatureCollection","features": [{"type": "Feature","properties": {},"geometry": {"type": "","coordinates": [[]]}}]};

    //access the provided parameters
    var bbox = req.query.bbox;
    var include = req.query.include;
    var exclude = req.query.exclude;
    var fields = req.query.fields;
    var latest = req.query.latest;

    //QUERY BoundingBox
    //create boundingBox geojson from given parameters
    bbox = bbox.split(",");
    //numberify the strings
    for(let i = 0; i < bbox.length; i++){
      bbox[i] = parseFloat(bbox[i]);
    }

    {
      //delete later
      outJSON = exampleTweet;
    }

    //call to function that will look for tweets on TweetDB within bounding box.
    //IMPORTANT: FUNCTION NAME AND PARAMETERS WILL LIKELY CHANGE.
    //outJSON.tweets = getTweetsInRect(bbox);


    //QUERY include
    if(include != undefined){
      //    include = include.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
      let userRegEx = new RegExp(include);
      for(let tweet in outJSON.tweets){
        //if there is a match, push tweet to outJSON
        if(
          outJSON.tweets[tweet].text.includes(include)
          ||(outJSON.tweets[tweet].text.match(userRegEx) !==null)
        ){newOutJSON.tweets.push(outJSON.tweets[tweet]);}
      }
      //make newOutJSON the new outJSON, reset the former
      outJSON = newOutJSON;
      newOutJSON = {"tweets":[]};
    }

    //QUERY exclude
    if(exclude != undefined){
      //    exclude = exclude.match(/(["'])(?:(?=(\\?))\2.)*?\1/g);
      for(let i= outJSON.tweets.length-1; i >= 0; i--){
        //console.log(outJSON.tweets[i].text)
        if(
          outJSON.tweets[i].text.includes(exclude)
          //||(outJSON.tweets[i].text.match(userRegEx) !==null )
        ){outJSON.tweets.splice(i,1);}
      }
    }

    //QUERY latest
    //if latest is requested, return only latest tweet meeting given parameters
    if(latest != undefined){
      if(latest.toUpperCase() === "TRUE"){
        //in the beginning was Jan 01 1970
        let latestTime = new Date("Thu Jan 01 00:00:00 +0000 1970");


        for(let tweet of outJSON.tweets){
          //if there is a younger one than the previous, make that the new latest
          if(new Date(tweet.created_at) > latestTime){
            latestTime = tweet.created_at;
            newOutJSON.tweets = [];
            newOutJSON.tweets.push(tweet);
          }
        }
        //make newOutJSON the new outJSON, reset the former
        outJSON = newOutJSON;
        newOutJSON = {"tweets":[]};
      }
    }

    //QUERY fields
    //if field params are passed, return requested fields only
    if(fields != undefined){
      fields = fields.split(",");
      let fieldtweets = {"tweets" : []};
      //traverse every tweet in the given list
      for (let entry of outJSON.tweets){
        //for every tweet, pick only the fields that are specified
        let tweet = {};
        for (let field of fields){
          tweet[field] = entry[field];
        }
        fieldtweets.tweets.push(tweet);
      }
      outJSON = fieldtweets;
    }

    return outJSON;
  }
}
