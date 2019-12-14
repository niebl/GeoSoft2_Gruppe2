/*jshint esversion: 8 */

var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  id: 'map',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 13
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
* create an empty layer
* leaning on https://stackoverflow.com/a/33221018
* @see onEachDot
* @author Felix, nathansnider(inspiration)
*/
var tweetLayer = L.geoJson(false,{
  pointToLayer: tweetToLayer,
  onEachFeature: onEachDot
});

var overlayMaps = {
  "Radar": leafletRadarAttribution,
  "Tweets": tweetLayer
};

var baseMaps = {
  "Topographic": topo,
  "Streets": street,
  "Satellite": satellite
};

var map = L.map('map', {
  layers:  [street,tweetLayer]
}).setView([51.16, 10.45], 6);


L.control.layers(baseMaps, overlayMaps).addTo(map);

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
  var markersOnMap = tweetLayer._layers

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
      newPopupContent = feature.properties.embeddedTweet+"<hr>"+newPopupContent;
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
* @function onEachDot
* @desc gets called whenever a new marker is added to the map.
* binds the embedded tweet into the popup.
* devnote: potential for more functionality
* @author Felix, nathansnider(inspiration)
*/
function onEachDot(feature, layer){
  var popup = L.popup(
      {maxHeight:140}
    ).setContent(feature.properties.embeddedTweet)
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
    tweetLayer.addData(newTweet)
  });
}

// /**
// * @function addTweetToMap
// * @desc adds a given shape, in this case likely a tweet, to the map.
// * leaning on https://stackoverflow.com/questions/45931963/leaflet-remove-specific-marker
// * BE SURE TO HAVE A GLOBAL VARIABLE Object shapesOnMap, containing array "tweets"
// * @param mapdiv the map id of the map
// * @param input the object of the tweet to be added to the map
// * @Author Felix
// */
// async function addTweetToMap(mapdiv, input){
//   let id;
//   let popupContent;
//   let neighbourFound = false;
//   const minDistance = 40000000;
//
//   //if there was no neighbour within min distance
//   if (!neighbourFound){
//     //create a leaflet object from the given coordinates and colors
//     var newShape = new L.GeoJSON(input.geojson);
//     newShape.bindPopup(await getEmbeddedTweet(input.id_str))
//     map.addLayer(newShape);
//     shapesOnMap.tweets.push(newShape);
//   }
// }

/**
* @function getEmbeddedTweet
* @desc sends a request to the twitter Oembed API to get an embedded tweet https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/get-statuses-oembed
* @param id_str the id of the tweet that is to be embedded
* @returns html of the embedded tweet
* @Author Felix
*/
async function getEmbeddedTweet(id_str){
  var output;
  var requestURL = "http://publish.twitter.com/oembed?url=https://twitter.com/t/status/";
  //let requestURL = "https://localhost:3000/embedTweet?id="
  requestURL = requestURL.concat(id_str);

  var embeddedCallback = function(data){
    if(data != undefined){
      output = data
      return data;
    } else {return {html: "<b>Tweet not Available</b>"};}
  }

  await $.ajax({
    url: requestURL,
    dataType: 'jsonp',
    //contentType: 'application/json',
    //success: embeddedCallback,
    callback: 'embeddedCallback',
    success: function(data){
      output = data;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
      console.log(id_str)
      console.log(thrownError)
      output = {html: thrownError}
    }
  });
  return output.html;
}


/**
* @example loadDoc()
* Sets a marker using cookies via ajax request
* @author Dorian
*/
/*
function loadDoc() {
var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
L.marker(JSON.parse(this.response)).addTo(map).bindPopup("I am an orange leaf.");

}
};
xhttp.open("GET", "/getdefaultlocation", true);
xhttp.send();
}
*/
