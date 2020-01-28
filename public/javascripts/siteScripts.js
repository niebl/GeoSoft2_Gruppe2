/*jshint esversion: 8 */

var defaultBbox = "55.22,5.00,47.15,15.20";
var bbox = "55.22,5.00,47.15,15.20";
var bboxArray = [55.22,5.00,47.15,15.20];

var include = [];
var exclude = [];
var eventfilter = [];
//the timestamps. older_than for updateMapTweets, older_thanCheck for checkTweetUpdates
var older_than;
var older_thanCheck;
var older_thanStatusCheck;
var initTimeHeatmap = Date.now() - 300000;

var min_precipitation;
var max_precipitation;


//the minimal distance a map-tag is allowed to have to another in meters without being merged.
var nearestTweetRadius;
var updateCheckInterval;
var statusCheckInterval;
var warningUpdateInterval;
var oneHourRadarUpdateInterval;

main();

async function main(err){
  //set the standard configurations of interval refreshes, bounding boxes, filters, etc
  setStandardConfigs();

  //TODO: update site-filter inputs with standard values on launch

  //load first data and initialise interval loops
  get1hRadar({
    min : min_precipitation,
    max : max_precipitation
  });
  get5mRadar({
    min : min_precipitation,
    max : max_precipitation
  });
  getDensity({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  setInterval(
    get1hRadar(),
    oneHourRadarUpdateInterval
  );
  setInterval(
    get5mRadar(),
    oneHourRadarUpdateInterval
  );

  ////////////////////////////////////////////////////////////////////////////////
  // site-events
  ////////////////////////////////////////////////////////////////////////////////

  //toggle side-bar elements
  //toggle tweet options
  $("#parameter-toggle").click(function(e){
    e.preventDefault();
    $("#browser-controls").toggleClass("toggled");
  });
  //toggle tweet-browser
  $("#browser-toggle").click(function(e){
    e.preventDefault();
    $("#tweet-browser").toggleClass("toggled");
  });

  $("#parameter-toggle1").click(function(e){
    e.preventDefault();
    $("#browser-controls1").toggleClass("toggled");
  });

  $("#parameter-toggle2").click(function(e){
    e.preventDefault();
    $("#browser-controls2").toggleClass("toggled");
  });

  //click of UPDATE MAP button
  $("#update-map").click(function(){
    updateMapTweets();
  });
  //toggle sidebar button
  $("#sidebarCollapse").click(function(e){
    e.preventDefault();
    $("#wrapper").toggleClass("toggled");
    setTimeout(function(){ map.invalidateSize();}, 400);
  });

  // summary Statistics:
  $("#density").click(function(){
    var sigma =   $("densitysigma").val();
    getDensity({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude, sigma : sigma});
  });
  $("#quadrat").click(function(){
    var xbreak =   $("xbreak").val();
    var ybreak =   $("ybreak").val();
    getQuadrat({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude, xbreak: xbreak, ybreak: ybreak});
  });
  $("#kest").click(function(){
    getKest({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });
  $("#fest").click(function(){
    getFest({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });
  $("#lest").click(function(){
    getLest({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });
  $("#gest").click(function(){
    getGest({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });

  $("#wordcloud").click(function(){
    getWordcloud({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });
  $("#timeline").click(function(){
    getTimeline({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });
  $("#fest").click(function(){
    getFest({older_than: initTimeHeatmap, bbox: bbox, include: include, exclude: exclude});
  });
  $("#getPrec").click(function(){
    get1hRadar({
      min : min_precipitation,
      max : max_precipitation,
      bbox : bbox
    });
    get5mRadar({
      min : min_precipitation,
      max : max_precipitation,
      bbox : bbox
    });
  });




  //go to tweet
  $("#tweet-browser, #map").on('click', '.gotoTweet', function(e){
    //get the attributes from the parent element of the button
    var coordsInput = $(e.target).parent().attr('coords').split(",");
    var idInput = $(e.target).parent().attr('id_str').split(",");

    //parse the coordinates and swap lat and lon
    var coords = [];
    coords[0] = parseFloat(coordsInput[1]);
    coords[1] = parseFloat(coordsInput[0]);

    //set the view of the map to the tweet and zoom in
    map.setView(coords, 13,
      // {
      // "animate": true,
      // "pan":{
      //   "duration": 0.5
      // }
      // }
    );
    for(let marker in tweetLayer._layers){
      if(tweetLayer._layers[marker]._popup._content.includes(idInput)){
        tweetLayer._layers[marker].openPopup();
      }
    }
  });
  //remove the tweet from map
  $("#tweet-browser, #map").on('click', '.removeTweet', function(e){
    //get the attributes from the parent element of the button
    var coordsInput = $(e.target).parent().attr('coords');
    var idInput = $(e.target).parent().attr('id_str');

    coordsInput.split(",");
    idInput.split(",");

    //parse the coordinates and swap lat and lon
    var coords = [];
    coords[0] = parseFloat(coordsInput[1]);
    coords[1] = parseFloat(coordsInput[0]);

    updateProgressIndicator(`removing tweet <font color="yellow">${idInput}</font> from view`);

    //remove from the browser
    $("#tweet"+idInput).remove();

    //remove from the map
    for(let marker in tweetLayer._layers){
      //if the tweets id is found in the popup, remove it's div
      //based on https://stackoverflow.com/questions/16940274/remove-div-and-its-content-from-html-string/16940353#16940353
      if(tweetLayer._layers[marker]._popup._content.includes(idInput)){
        //get the html popup content to work with jquery
        let popupContent = tweetLayer._layers[marker]._popup._content;
        popupContent = $(popupContent);
        editor = $("<p>").append(popupContent);
        //remove the according div and assign the new updated content
        editor.find("#mapTweet"+idInput).remove();
        popupContent = editor.html();
        tweetLayer._layers[marker]._popup._content = popupContent;

        //remove the layer if there is no popup content
        if(popupContent == ""){
          tweetLayer._layers[marker].remove();
        } else {
          //update the popup in map view
          tweetLayer._layers[marker].closePopup();
          tweetLayer._layers[marker].openPopup();
        }
      }
    }
  });

  //confirm Coords
  $('#confirmCoords').on('click', function(e){
    bboxArray = [
      parseFloat($("input[name='bboxNorth']").val()),
      parseFloat($("input[name='bboxWest']").val()),
      parseFloat($("input[name='bboxSouth']").val()),
      parseFloat($("input[name='bboxEast']").val())
    ];

    //refresh data
    removeTweetsOutOfSelection(bboxArray, include, exclude);
    getWarnings({bbox : bbox, events: eventFilter})

    //communicate new bbox with server side
    indicateStatus(bbox.toString(), "selectedbbox")

    drawnRect.clearLayers();

    var rectBounds = [[bbox[0],bbox[1]],[bbox[2],bbox[3]]];
    L.rectangle(rectBounds).addTo(drawnRect);
  });
  //clear coords
  $('#clearCoords').on('click', function(e){

    //reset inputs
    $("input[name='bboxNorth']").val('');
    $("input[name='bboxWest']").val('');
    $("input[name='bboxSouth']").val('');
    $("input[name='bboxEast']").val('');


    drawnRect.clearLayers();
    bbox = defaultBbox;

    //refresh data
    getWarnings({bbox : bbox, events: eventFilter})
    //communicate new bbox with server side
    indicateStatus("-180,85,+180,-85", "selectedbbox")
  });

  $('#saveLevels').on('click', function(e){
    var min =  $('#LevelsPreMin').val();
    var max =  $('#LevelsPreMax').val();
    if(min <= max){
      min_precipitation = min;
      max_precipitation = max;
      $('#PrecLevelError').text("Parameters setted");
    } else{
      $('#PrecLevelError').text("Invalid Parameters");
    }
  });
  //FILTER words
  $('#confirmFilter').on('click', function(e){
    include = $("input[name='includeKeywords']").val().split(",");
    exclude = $("input[name='excludeKeywords']").val().split(",");

    removeTweetsOutOfSelection(bboxArray, include, exclude);
  });

  //FILTER events
  $('#confirmEventFilter').on('click', function(e){
    eventFilter = $("input[name='eventFilter']").val().split(",");
    getWarnings({bbox : bbox, events: eventFilter});
  });
  //reset event filter
  $('#resetEventFilter').on('click', function(e){
    eventFilter = [];
    getWarnings({bbox : bbox, events: eventFilter});
  });

  //set url-coordinates
  $('#updateURLCoords').on('click', function(e){
    e.preventDefault();
    //fetch coordinates and zoom-level from the map
    var coords = {
      lat: map._lastCenter.lat,
      lon: map._lastCenter.lng,
      zoom : map._zoom
    };

    //set the coordinates in the URL to the new value
    setWindowCoordinates(coords);
  });
}

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

/**
* @function initialiseIntervals
* @desc initialises periodic checks on updates with the intervals that are specified in the global variables
*/
function initialiseIntervals(){
  //begin the periodic update checks
  checkTweetUpdates(updateCheckInterval);
  checkStatusUpdates(statusCheckInterval);

  //initialise the periodic update of the district weather warnings
  getWarnings();
  setInterval(
    getWarnings({
      bbox : bbox,
      events : eventFilter
    }),
    warningUpdateInterval
  );
}

/**
* @function setStandardConfigs
* @desc fallback-function that gets called when getting the config parameters from the server failed
*/
function setStandardConfigs(){
  include = []
  exclude = []

  nearestTweetRadius = 50;

  updateCheckInterval= 10000;
  statusCheckInterval= 2000;
  warningUpdateInterval = 300000;

  //initialise with the current timestamp, -5 minutes. so more tweets have a chance of appearing on initialisation
  older_than = Date.now() - 300000;
  older_thanCheck = older_than;
  //initialise status check timestamp with -5 seconds so statuses declared before site was loaded can be found
  older_thanStatusCheck = Date.now() - 10000;

  oneHourRadarUpdateInterval = 300000;

  //initialise all check intervals with the new values
  initialiseIntervals();
}

/**
* @function updateProgressIndicator
* function that updates the content of the progress indicator with a given string
* @param message the string of a message to display.
*/
function updateProgressIndicator(message, currentTime){
  if (currentTime==undefined){
    currentTime = "timestamp: " + Date.now();
  } else {
    currentTime = "timestamp: " + currentTime;
  }
  $("#progressIndicator").prepend(currentTime+"&nbsp;&nbsp;"+message+"<br>");
}

/**
* @function makeTweetQueryString
* @desc function that returns a usable query string to search for tweets with given parameters. Uses global variables
* @returns String, that is used as parameter for getTweets
* @param older_than UNIX timestamp of highest allowed age a tweet can have
* @see getTweets
*/
function makeTweetQueryString(older_than){
  let queryString = `bbox=${bbox}&older_than=${older_than}`;
  if(!(include.length == 0 || include == undefined || include[0] == "")){
    queryString = queryString+`&include=${include}`;
  }
  if(!(exclude.length == 0 || exclude == undefined || exclude[0] == "")){
    queryString = queryString+`&exclude=${exclude}`;
  }
  return queryString;
}

/**
* @function updateMapTweets
* @desc updates the map with the tweets that have been fetched from getTweets() function
* @see getTweets
*/
async function updateMapTweets(){
  var tweetPromise = new Promise(async function(resolve, reject){
    var tweets = await getTweets(makeTweetQueryString(older_than));
    resolve(tweets.tweets);
  });

  //get the time of when the button was clicked
  var timeOfClick = Date.now();

  //add the tweets once the API responded
  tweetPromise.then(function(tweets){
    //check for undefined tweets and display error message (see issue #6)
    if(tweets == undefined){
      updateProgressIndicator(`<font color="red">response from TweetAPI undefined. Try again</font>`);
    } else {
      if(tweets.length > 0){
        updateProgressIndicator("displaying new tweets");
      }
      for (let tweet of tweets){
        addTweetToMap(tweet);
      }
      updateTweetNotifs({clear:true});

      //update the timestamp to when tweets were last fetched.
      //also update the timestamp for the var used by updateTweetNotifs
      older_than = timeOfClick;
      older_thanCheck = timeOfClick;
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
  var requestURL = "/tweets?";
  requestURL = requestURL + params;

  //console.log(requestURL)
  await $.ajax({
    url: requestURL,
    success: function(data){
      output = data;
      updateProgressIndicator("successfully received data from tweet-API");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator(`<font color="red">connection to tweet-API failed</font>`);
    }
  });
  return output;
}

/**
* @function checkStatusUpdates
* @desc periodically queries internal status API to see what is currently running.
* Posts new messages to the status indicator.
* @param interval the amount of time to pass between each check in ms
*/
async function checkStatusUpdates(interval){
  setInterval(async function(){
    var messagePromise = new Promise(async function(resolve, reject){
      //progress indicator won't be updated for these checks, since they serve to directly feed the progressIndicator
      var messages = await getMessages(`older_than=${older_thanStatusCheck}&remove=true`);
      resolve(messages);
    });

    messagePromise.then(function(messages){
      let numberNewMessages = messages.length;

      //if there are new statuses, prepend each to the status indicator
      if(numberNewMessages > 0){
        for(let message of messages){
          updateProgressIndicator(message.message, message.created_at);
        }
      }

      //terminate
      return true;
    });
  },
  interval
);
}

/**
* @function getMessages
* @desc queries internal API for status messages within given bounding box
* @param params string of parameters for the API query.
* @see ApiSpecs
* @returns Object containing array of information about statuses
*/
async function getMessages(params){
  let output;
  var requestURL = "/statuses?";
  requestURL = requestURL + params;

  await $.ajax({
    url: requestURL,
    success: function(data){
      output = data;
    },
    error: function(xhr, ajaxOptions, thrownError){
      //not shown in status indicator, since this is a trivial, non-app-breaking issue
      console.log(`call to status-API failed`);
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
      //indicate event
      updateProgressIndicator("checking for new tweets");
      var tweets = await getTweets(makeTweetQueryString(older_thanCheck)+"&fields=created_at");
      resolve(tweets.tweets);
    });

    tweetPromise.then(function(tweets){
      let numberNewTweets = tweets.length;
      updateTweetNotifs({increment: numberNewTweets});

      //indicate event
      if(numberNewTweets > 0){
        updateProgressIndicator(`<font color="yellow">+${numberNewTweets}</font>, new tweets available`);
      }

      //update the timestamp
      older_thanCheck = Date.now();

      //terminate
      return true
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
  if(arguments.clear == undefined||arguments.clear!=true){clear = false;}
  else{clear = arguments.clear;}
  //default inrement to 0 unless something else is passed. don't accept non-integers
  if(arguments.increment == undefined||!Number.isInteger(arguments.increment)){increment = 0;}
  else{increment = arguments.increment;}

  //clear if clear is true
  if(clear){
    $("#update-badge").removeClass("visible");
    $("#update-badge").addClass("invisible");
    $("#update-badge").html(0);
  }

  //increment by the specified amount
  if(increment != 0){
    let count = parseInt($("#update-badge").html());
    $("#update-badge").html(count+increment);

    //if there is a negative correction to be made, don't update the div classes. only the html
    if(increment > 0){
      $("#update-badge").removeClass("invisible");
      $("#update-badge").addClass("visible");
    }
  }
}

/**
* @function setWindowCoordinates
* @desc function that sets window coordinates and zoom-level of the browser search-bar, without updating the page
* @param Coords Object: {lat: float, Lon: float, Zoom: number}
* @returns boolean
*/
function setWindowCoordinates(coords){
  window.history.replaceState(false, "Geomergency", `/geomergency/${coords.lat},${coords.lon},${coords.zoom}`);
}

/**
* @function indicateStatus
* @desc sends a POST request to the status API so processes can indicate status.
* is used for certain cases of client-to-server communication
* @param text String, the message of the status
* @param messageType String, the type of message of the status
*/
async function indicateStatus(text,messageType){
  //prepare form
  var requestURL = "http://localhost:3000/statuses";
  var form = {
    message: text,
    created_at: Date.now(),
    messageType: messageType
  }

  //post form to status endpoint
  $.post(requestURL,
    form,
    function(data, status){
      if(status != "success"){
        console.log("error in posting message: ",status)
      }
    }
  )
}
