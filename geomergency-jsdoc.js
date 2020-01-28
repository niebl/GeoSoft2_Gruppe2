////////////////////////////////////////////////////////////////////////////////
//app.js
////////////////////////////////////////////////////////////////////////////////

/**
* @function geomergencyRouter
* @desc sets the server internal siteState and returns the router.
* @returns indexRouter as defined in app.js
*/
/**
* @function exampleScenarioRouter
* @desc sets the server internal siteState and returns the router.
* @returns exampleRouter as defined in app.js
*/
/**
* @function updateTweetStream
* @desc initialises the tweet stream with given parameters and current Site-state
* @param params the params of the stream
* @param callback callback function, what to do with the returned tweets. only works when page in standard mode
* @param siteState String that indicates whether or not the site is currently in demo-scenario mode or standard mode
*/
/**
* @function queryTweets
* @param queries, Object of mongoose queries
* @return mongoose docs
*/
/**
* @function tweetDelete middleware function
* @desc function that is being called when a delete tweet call is made to the tweets endpoint
* param: id_str the id of the tweet(s) to delete
*/
/**
* @function tweetSearch middleware function
* @desc callback function that looks at the arguments passed in the tweet API request and returns the according response.
* example http://localhost:3000/tweets?fields=id,text
* params: bbox: The bounding Box of the geographical area to fetch tweets from
*         include: The strings that are to be included in the returned tweets
*         exclude: The strings that aren't to be included in the returned tweets
*         fields: The fields of the tweets that are to be returned
*         latest: whether or not to only show the latest tweet
* @param req
* @param res
*/
/**
* @function containsPreviousSubstring
* @desc helping function that checks whether a previous substring is contained within the examined tweet
* only works within tweetSearch.
* @see {@link tweetSearch}
* @returns boolean
*/
/**
* @function postTweetToMongo
* @param tweet the tweet object
* @param includes array containing strings that have to be contained in tweets
* @param excludes array containing strings that mustn't be in tweets
*/
/**
* @function getEmbeddedTweet
* @desc sends a request to the twitter Oembed API to get an embedded tweet https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/get-statuses-oembed
* then calls postTweetToMongo in order to add the tweet to the database
* @param tweet the tweet-object
*/
/**
* @function getProcesses middleware function for getting Processes
* @desc middleware function that looks for running processes
* @param req
* @param res
*/
/**
* @function queryStatuses
* @desc function that queries the mongo status collection
* @param queries, Object of mongoose queries
* @param res, express response for error handling
* @return mongoose docs
*/
/**
* @function rmStatuses
* @desc function that removes messages from the mongo status collection
* @param queries, Object of mongoose queries
* @param res, express response for error handling
* @return true or false
*/
/**
* @function postProcesses middleware function for posting Processes
* @desc middleware function that takes the attributes in a function body (x-www-form-urlencoded)
* @param req
* @param res
*/

////////////////////////////////////////////////////////////////////////////////
//twitApiExt.js
////////////////////////////////////////////////////////////////////////////////

/**
* @function tweetStreamExt
* @param params an object that contains the parameters for a twitter-search query. more info on https://developer.twitter.com/en/docs/tweets/search/api-reference/get-search-tweets
* @param callback the function that is being called when new data is coming in. only works on non-example data
* @param siteState String that indicates whether or not the current state is demo-scenario or standard mode
* @see {@link updateTweetStream}
*/
/**
* @function killStreamExt
* @desc function that kills the running function listening to the twitter stream api
* @returns boolean whether it was successful
*/
/**
* @function shuffleArray
* @desc implementation of the Durstenfeld-shuffle
* credit: https://stackoverflow.com/a/12646864
*/

////////////////////////////////////////////////////////////////////////////////
//utilityFunctions.js
////////////////////////////////////////////////////////////////////////////////

/**
* @function indicateStatus
* @desc sends a POST request to the status API so the client side can know what the server is doing.
* @param text String, the message of the status
*/
/**
* @function parseBBOX
* @desc function that takes a string of 4 coordinates and parses it into an Array
* @param bboxString String that describes a boox in 2 coordinates
* @returns array of length 4 or error
*/
/**
* @function loadConfigs
* @desc reads the config.yaml and returns an object containing the values
* @returns object, containting several attributes and values that represent configuration arguments
*/

////////////////////////////////////////////////////////////////////////////////
// routes/badweather.js
////////////////////////////////////////////////////////////////////////////////

/** requesting GEJSOn of bad Weather events
* @event get weather
* @url?name=<placeholder>&coordinates=<lng,lat>&event=<EVENT>
* @example http://localhost:3000/weather?event=GLATTEIS&name=Münster
*/
/**
* @function loadBorders
* @desc loads the border-geoJSON into the mongoDB
* @returns boolean whether laoding all districts was successful
*/
/**
* @function loadUnwetter
* @desc function that loads new weather-alert-data into the database if called
* devnote: still very high runtime. might not be of high priority since it's not called often, but improvement is encouraged
*/
/**
* @function queryUnwetter
* @desc Queries the districts that have bad weather warnings issued against them from the mongodb
* @param queries, Object of mongoose queries
* @return mongoose docs
*/
/**
* @function periodicallyUpdateWeather
* @desc periodically gets updates from the DWD weather warning API in the given interval if called
* @param interval integer of interval length in milliseconds
*/

////////////////////////////////////////////////////////////////////////////////
// routes/summary.js
////////////////////////////////////////////////////////////////////////////////
/**
* @function quadrat
* Getting the density json from R /density
* @return density json
*/
/**
* @function density
* Getting the density json from R /density
* @return density json
*/
/**
* @function kest
* Getting the k- function from R
* @return kest plot
*/
/**
* @function lest
* Getting the l- function from R
* @return l function plot
*/
/**
* @function gest
* Getting the g- function from R
* @return gest plot
*/
/**
* @function fest
* Getting the f- function from R
* @return fest plot
*/
