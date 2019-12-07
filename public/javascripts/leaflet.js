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

var overlayMaps = {
    "Radar": leafletRadarAttribution
};

var baseMaps = {
	"Topographic": topo,
	"Streets": street,
  "Satellite": satellite
};

var map = L.map('map', {
  layers:  [street]
}).setView([51.16, 10.45], 6);


L.control.layers(baseMaps, overlayMaps).addTo(map);

/**
* @object shapesOnMap.
* @desc the object containing info of all shapes on the map
* @author Felix
*/
var shapesOnMap = {
  tweets: []
}

/**
* @function addTweetToMap
* @desc adds a given shape, in this case likely a tweet, to the map.
* leaning on https://stackoverflow.com/questions/45931963/leaflet-remove-specific-marker
* BE SURE TO HAVE A GLOBAL VARIABLE shapes DECLARED AS AN ARRAY
* @param mapdiv the map id of the map
* @param input the object of the tweet to be added to the map
* @Author Felix
*/
async function addTweetToMap(mapdiv, input){
  var id;

  //choose a fitting id for the current shape
  if (shapesOnMap.tweets.length < 1) id = 0;
  else id = shapes.length;

  //create a leaflet object from the given coordinates and colors
  var newShape = new L.GeoJSON(input.geojson);
  newShape._id = id;
  newShape.bindPopup(await getEmbeddedTweet(input.id_str))
  map.addLayer(newShape);
  shapes.push(newShape);
}

var embeddedCallback = function(data){
  if(data != undefined){
    return data;
  } else {return "nonexistant";}
}

/**
* @function getEmbeddedTweet
* @desc sends a request to the twitter Oembed API to get an embedded tweet https://developer.twitter.com/en/docs/tweets/post-and-engage/api-reference/get-statuses-oembed
* @param id_str the id of the tweet that is to be embedded
* @returns html of the embedded tweet
* @Author Felix
*/
async function getEmbeddedTweet(id_str){
  let output;
  var requestURL = "http://publish.twitter.com/oembed?url=https://twitter.com/t/status/";
  //let requestURL = "https://localhost:3000/embedTweet?id="
  requestURL = requestURL.concat(id_str);

  await $.ajax({
    url: requestURL,
    dataType: 'jsonp',
    //contentType: 'application/json',
    //success: embeddedCallback,
    jsonpCallback: 'embeddedCallback',
    success: function(data){
      output = data;
    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log(xhr.status);
      console.log(thrownError)
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
