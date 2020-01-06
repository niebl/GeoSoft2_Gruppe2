/*jshint esversion: 8 */

var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

  id: 'map',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 17
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  id: 'map',
  maxZoom: 17,
  attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  id: 'map',
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var leafletRadarAttribution = L.tileLayer.wms("https://maps.dwd.de/geoserver/dwd/wms/", {
  layers: 'dwd:FX-Produkt',
  format: 'image/png',
  styles: '',
  transparent: true,
  opacity: 0.6,
});

/**
* create an empty layer for the tweets
* leaning on https://stackoverflow.com/a/33221018
* @see onEachDot
* @author Felix, nathansnider(inspiration)
*/
var tweetLayer = L.geoJson(false,{
  pointToLayer: tweetToLayer,
  onEachFeature: onEachTweet
});

/**
* create layer for counties
*
*/
var kreisLayer = L.featureGroup(false)

//create layer for selection rectangle
var drawnRect = new L.FeatureGroup();

var overlayMaps = {
  "Radar": leafletRadarAttribution,
  "Tweets": tweetLayer,
  "Kreise": kreisLayer,
  "Selection": drawnRect
};

var baseMaps = {
  "Topographic": topo,
  "Streets": street,
  "Satellite": satellite
};

var map = L.map('map', {
  layers:  [street,tweetLayer],
  zoomControl: false,
  drawControl: false
}).setView([51.16, 10.45], 6);

//add zoom buttons:
var zoomControls = L.control.zoom({
  position:'topright'
}).addTo(map)

//add drawControl
var drawControl = new L.Control.Draw({
  draw: {
    rectangle: true,

    marker: false,
    polygon: false,
    polyline: false,
    circle: false,
    circlemarker: false,
  },
  edit: {
    featureGroup: drawnRect
  },
  position:'topright'
})
map.addControl(drawControl);

map.on('draw:created', function(e){
  drawnRect.clearLayers()
  var layer = e.layer;

  //North, west, south, east coords
  var coords = [layer._bounds._northEast.lat,layer._bounds._southWest.lng,layer._bounds._southWest.lat,layer._bounds._northEast.lng];

  //show coords in side-menu
  $("input[name='bboxNorth']").val(coords[0]);
  $("input[name='bboxWest']").val(coords[1]);
  $("input[name='bboxSouth']").val(coords[2]);
  $("input[name='bboxEast']").val(coords[3]);

  //set coordinates to bbox
  bbox = coords;

  drawnRect.addLayer(layer);

  //remove the tweets that aren'T within the area
  removeTweetsOutOfSelection(bbox, include, exclude);
});

L.control.layers(baseMaps, overlayMaps).addTo(map);

// kreisPromise = new Promise(async function(resolve, reject){
//   var requestURL = "/weather/kreise";
//   var response = await $.ajax({
//     url: requestURL,
//     dataType: 'text',
//     //contentType: 'application/json',
//     //success: embeddedCallback,
//     success: async function(data){
//       console.log(data)
//       getKreise()
//     },
//     error: function(xhr, ajaxOptions, thrownError){
//       console.log(xhr.status);
//       console.log(id_str)
//       console.log(thrownError)
//       output = {html: thrownError}
//     }
//   });
// })
// async function getKreise(){
//   var requestURL = "weather/getUnwetter"
//   return await $.ajax({
//     url: requestURL,
//     success: async function(data){
//       //console.log(data)
//       for(let feature of data.features){
//         kreisLayer.addLayer(L.geoJson(feature,{
//           fillOpacity: 0.3,
//           color: 'purple'
//         }).bindPopup(feature.properties.name+"<br>"+feature.properties.event)
//       )
//       }
//
//     },
//     error: function(xhr, ajaxOptions, thrownError){
//       console.log("error in getTweets")
//       console.log(xhr.status);
//       console.log(thrownError)
//     }
//   })
// }

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

/**
* @function tweetToLayer
* @desc gets called whenever a new marker is added to the map.
* checks whether the location of the tweet is currently occupied.
* then decides on whether to add to the map or to append to a popup
* devnote: potential for more functionality
* @param feature the tweet that is being added
* @param latlng the coordinates of the tweet
* @see nearestTweetRadius
* @author Felix, nathansnider(inspiration)
*/
function tweetToLayer(feature, latlng){
  var tweetdiv = `
    <div id="mapTweet${feature.properties.id_str}" class="tweetDiv" coords="${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}" id_str="${feature.properties.id_str}">
      <button type="button" class="btn btn-secondary btn-sm gotoTweet">go to</button>
      <button type="button" class="btn btn-danger btn-sm removeTweet">remove</button>
      ${feature.properties.embeddedTweet}
    <hr>
    </div>
  `;
  var markersOnMap = tweetLayer._layers;

  //if there are no tweets on the map, just add it. don't check for others
  if(Object.entries(markersOnMap).length === 0){
    return L.marker(latlng, {
      opacity: 0.7
    });
  }

  //otherwise, compare the locations of the new tweets to existing ones to check for overlapping pins
  else {
    var nearNeighbourFound = false;
    var nearNeighbour = {};

    for(var marker in markersOnMap){
      existingCoords = [markersOnMap[marker]._latlng.lng,markersOnMap[marker]._latlng.lat];
      newCoords = [latlng.lng,latlng.lat];

      //if the distance between the two points is smaller than the smallest allowed radius mark the nearNeighbour as found
      if(turf.distance(existingCoords,newCoords,{units:'meters'}) <= nearestTweetRadius){
        nearNeighbourFound = true;
        nearNeighbour = marker;
        break;
      }

    }

    if(nearNeighbourFound){ //if the tweet is within the smallest allowed radius to another tweet, append it to the popup
      var newPopupContent = markersOnMap[nearNeighbour]._popup._content;
      newPopupContent = tweetdiv+newPopupContent;
      //change the content of the marker on the map
      markersOnMap[nearNeighbour]._popup._content = newPopupContent;

    } else { //otherwise, just append it to the existing one within the radius
      return L.marker(latlng, {
        opacity: 0.7
      });
    }
  }
}

/**
* @function onEachTweet
* @desc gets called whenever a new marker is added to the map.
* binds the embedded tweet into the popup.
* devnote: potential for more functionality
* @author Felix, nathansnider(inspiration)
*/
function onEachTweet(feature, layer){
  var tweetdiv = `
    <div id="mapTweet${feature.properties.id_str}" class="tweetDiv" coords="${feature.geometry.coordinates[0]},${feature.geometry.coordinates[1]}" id_str="${feature.properties.id_str}">
      <button type="button" class="btn btn-secondary btn-sm gotoTweet">go to</button>
      <button type="button" class="btn btn-danger btn-sm removeTweet">remove</button>
      ${feature.properties.embeddedTweet}
    <hr>
    </div>
  `;
  var popup = L.popup(
      {maxHeight:140}
    ).setContent(tweetdiv)
  layer.bindPopup(popup)
}

/**
* @function makeTweet
* creates a tweet object to be appended to the tweetLayer on the map.
* also calls oembed api to get an embedded version of the tweet.
* devnote: currently unused, but possibly still needed in future
* @param tweet the tweet object that was fetched from the API
* @return geojson object of the tweet on the map, incuding html for embedded tweet
*/
async function makeTweet(tweet){
  let id;
  let popupContent;

  var newTweet = {
    type: "FeatureCollection",
    features: []
  };

  var embedPromise = new Promise(async function(resolve,reject){
    var embedded = await getEmbeddedTweet(tweet.id_str)
    resolve(embedded)
  })

  return embedPromise.then(function(embedded){
    var properties = {
      id_str: tweet.id_str,
      _id: tweet._id,
      text: tweet.text,
      created_at: tweet.created_at,
      embeddedTweet: embedded
    };
    newTweet.features.push({
      "geometry": tweet.geojson.geometry,
      "properties": properties,
      "type": "Feature"
    });
    return newTweet;
  });
}

/**
* @function addTweetToMap
* creates a tweet object and appends it to the tweetLayer on the map.
* also calls oembed api to get an embedded version of the tweet.
* also adds the tweets to the map after the fact because that allows the function to be called parallel.
* @param tweet the tweet object that was fetched from the API
*/
async function addTweetToMap(tweet){
  let id;
  let popupContent;

  var newTweet = {
    type: "FeatureCollection",
    features: []
  };


  var properties = {
    id_str: tweet.id_str,
    _id: tweet._id,
    text: tweet.text,
    created_at: tweet.created_at,
    embeddedTweet: tweet.embeddedTweet
  };
  newTweet.features.push({
    "geometry": tweet.geojson.geometry,
    "properties": properties,
    "type": "Feature"
  });
  tweetLayer.addData(newTweet)

  //add the tweet to the tweet-browser
  //provisional.

  var tweetdiv = `
    <div id="tweet${tweet.id_str}" class="tweetDiv" coords="${tweet.geojson.geometry.coordinates[0]},${tweet.geojson.geometry.coordinates[1]}" id_str="${tweet.id_str}">
      <button type="button" class="btn btn-secondary btn-sm gotoTweet">go to</button>
      <button type="button" class="btn btn-danger btn-sm removeTweet">remove</button>
      ${tweet.embeddedTweet}
    <hr>
    </div>
  `;
  $("#tweet-browser").prepend(tweetdiv);
}

/**
* @function removeTweetsOutOfSelection
* removes all tweets that are not contained within the bounding box
* @param bbox an array or string with 4 coordinates, representing the bounding box containing the tweets
* @param include array of substrings that are to be included in the tweets
* @param exclude array of substrings that are to be excluded frin the tweets
* @Author Felix
*/
function removeTweetsOutOfSelection(bbox, include, exclude){
  //case differentiation if bbox is string or array
  if (typeof bbox === 'string' || bbox instanceof String){
    bbox = bbox.split(",");
    for(let i = 0; i < bbox.length; i++){
      bbox[i] = parseFloat(bbox[i]);
    }
  }
  //bbox = turf.bboxPolygon([bbox[1],bbox[0],bbox[3],bbox[2]]);

  //remove the tweets from the browser
  rmTweetsByKeywords(bbox, include, exclude);

  //remove out of bounds the tweet from the map

}

/**
* @function rmTweetsByKeywords
* helping function that makes a request to the API to remove the tweets from the browser
* @param bbox an array or string with 4 coordinates, representing the bounding box containing the tweets, N,W,S,E
* @param include array of substrings that are to be included in the tweets
* @param exclude array of substrings that are to be excluded frin the tweets
* @see removeTweetsOutOfSelection
* @author Felix
*/
async function rmTweetsByKeywords(bbox, include, exclude){
  //build the request string
  var requestURL = `bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`;
  if(!(include.length == 0 || include == undefined || include[0] == "")){
    requestURL = requestURL + `&include=${include.join()}`;
  }
  if(!(exclude.length == 0 || exclude == undefined || exclude[0] == "")){
    requestURL = requestURL + `&exclude=${exclude.join()}`;
  }
  requestURL = requestURL + "&fields=id_str";

  console.log(requestURL)

  var tweetPromise = new Promise(async function(resolve, reject){
    //get the included tweets and resolve
    var tweets = await getTweets(requestURL);
    resolve(tweets.tweets);
  });

  tweetPromise.then(function(tweets){
    bbox = turf.bboxPolygon([bbox[1],bbox[0],bbox[3],bbox[2]]);

    //remove tweets from the browser
    for(let tweet of tweets){
      //remove the tweets from the browser
      $("#tweet-browser").children("div").each(function(){
        //extrct coordinates of div
        var point = $(this).attr('coords').split(",");
        point[0] = parseFloat(point[0])
        point[1] = parseFloat(point[1])
        point = turf.point([point[0],point[1]]);

        let included = false;
        let contained = turf.booleanWithin(point, bbox);

        //if include string is empty, defualt to true
        if(include.length == 0 || include == undefined || include[0] == ""){included = true;}

        //check if the id strings were found in the answer
        if(tweet.id_str == $(this).attr("id_str")){
          included = true;
        }

        //remove if any of the conditions are met
        if(!included || !contained){
          $(this).remove();
        }
      });
    }

    //remove tweets from the map
    //ISSUE: TODO: following seems to incorrectly exclude some tweets.
    //              ISSUE probably starts at line 428
    for(var marker in tweetLayer._layers){
      //EXCTRACT COORDINATES
      var point = turf.point([tweetLayer._layers[marker]._latlng.lng,tweetLayer._layers[marker]._latlng.lat]);

      //TODO: text dependent removal of tweets from map
      //initialise the var deciding about geographic containment of tweets within bbox
      var contained = turf.booleanWithin(point, bbox);

      //remove out-of-bounds markers first
      if(!contained){
        tweetLayer._layers[marker].remove();
      }
      //then check the popups of remaining markers for tweets that should be excluded
      else {
        popupHTML = $(tweetLayer._layers[marker]._popup._content);

        for(let child of popupHTML){
          child = $(child)
          if(child.attr("class")=="tweetDiv"){

            //initialise variable deciding over inclusion of tweetDiv
            var included = false;

            //if include is empty or undefined, default to true
            if(include.length == 0 || include == undefined || include[0] == ""){
              included = true;
            }

            //check if id strings were found in the answer
            for(let tweet of tweets){
              if(tweet.id_str == $(child).attr("id_str")){
                included = true;
              }
            }

            if(!included){
              //remove entire marker if there is only one tweet left
              if(popupHTML.children("div").length <= 1){
                tweetLayer._layers[marker].remove();
                break;
              } else {
                child.remove();
              }
            }
          }
          try{
            tweetLayer._layers[marker]._popup._content = popupHTML.html();
          } catch(error){/*ignore*/}
        }

        //update the popup if marker still exists
        try{
          tweetLayer._layers[marker]._popup._content = popupHTML.prop('outerHTML');
        } catch(error){/*ignore*/}
      }
    }
  });
}
