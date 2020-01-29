/*jshint esversion: 8 */

var url = window.location.href;
var host = window.location.host;
var siteState;
if(url.indexOf(`http://${host}/geomergency`) != -1){
  siteState = "geomergency";
}
if(url.indexOf(`http://${host}/example`) != -1){
  siteState = "example";
}

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
* credit: nathansnider(inspiration)
*/
var tweetLayer = L.geoJson(false,{
  pointToLayer: tweetToLayer,
  onEachFeature: onEachTweet
});

//create layer for selection rectangle
var drawnRect = new L.FeatureGroup();

/**
* create layer for counties
*
*/
var kreisLayer = L.featureGroup(false);
var radar1hLayer =  L.featureGroup(false);
var radar5mLayer =  L.featureGroup(false);
var radarDemoLayer =  L.featureGroup(false);
var densityLayer =  L.featureGroup(false);
var quadratLayer =  L.featureGroup(false);

var overlayMaps = {
  // "Radar": leafletRadarAttribution,
  "Tweets": tweetLayer,
  "District-Warnings": kreisLayer,
  // "1h Radar": radar1hLayer,
  // "5min Radar": radar5mLayer,
  // "Demo Radar": radarDemoLayer,
  "Tweet Density": densityLayer,
  "Tweet Quadraticcount": quadratLayer,
  "Selection": drawnRect
};
if(siteState == "geomergency"){
  overlayMaps["1h Radar"] = radar1hLayer;
  overlayMaps["5min Radar"] = radar5mLayer;
}
if(siteState == "example"){
  overlayMaps["Demo Radar"] = radarDemoLayer;
}

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
}).addTo(map);

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
});
map.addControl(drawControl);

map.on('draw:created', function(e){
  drawnRect.clearLayers();
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
  //refresh the weather warnings
  getWarnings({bbox : bbox, events: eventFilter})
  //communicate new bbox with server side
  indicateStatus(bbox.toString(), "selectedbbox")
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

//initialise the map to the coordinates that are given in the URL
initialiseView();

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

/**
* @function getWarnings
* @desc queries the /weather endpoint for new district weather warnings and adds them to the map
* also clears the Kreiswarnings-layer first
* @param query Object containing the query parameters
*/
async function getWarnings(query){
  //clear kreisLayer
  kreisLayer.clearLayers();

  //set up request URL
  var requestURL = "/weather";

  if(query != undefined){
      //variable to let the URL builder know whether a parameter was already entered in the query
    var noPriorParam = true;

    if(query.bbox != undefined && query.bbox != []){
      requestURL = requestURL+`?bbox=${query.bbox}`;
      noPriorParam = false;
    }
    if(query.events != [] && query.events != undefined && query.events.length != 0){
      if(noPriorParam){
        requestURL = requestURL+`?`;
      } else {
        requestURL = requestURL+`&`;
      }
      requestURL = requestURL+`events=${query.events}`;
      noPriorParam = false;
    }
  }

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      //console.log(data)
      for(let feature of data){
        //prepare the popup content
        var popupContent = "<hr>"
        for(var warning in feature.properties.EVENT){
          popupContent = popupContent + `
            <hr> <b>${feature.properties.HEADLINE[warning]}</b> <br>
            ${feature.properties.DESCRIPTION[warning]} <br>
          `
        }
        kreisLayer.addLayer(L.geoJson(feature,{
          opacity: 0.2,
          fillOpacity: 0.1,
          color: 'purple'
        }).bindPopup(
          //bind the popup to each weather event
          `<h3>${feature.properties.AREADESC}</h3> <br> ${convertUNIXtoTime(feature.properties.created_at)}`
          + popupContent + `<hr><small>${feature.properties.EC_LICENSE}</small>`
        )
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log("error in getWarnings");
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function get1hRadar
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function get1hRadar(query){
  //clear layer
  radar1hLayer.clearLayers();

  //set up request URL
  var requestURL = "/radar/get1hradar";
  console.log("min:  " + query.min);
  console.log("max:  " + query.max);
  if(query != undefined){
      //variable to let the URL builder know whether a parameter was already entered in the query
    var noPriorParam = true;

    if(query.min != undefined && query.min != []){
      requestURL = requestURL+`?min=${query.min}`;
      noPriorParam = false;
    }
    if(query.max != undefined && query.max != []){
      if(noPriorParam){
        requestURL = requestURL+`?max=${query.max}`;
        noPriorParam = false;
      }else{
        requestURL = requestURL+`&max=${query.max}`;
      }
    }
    if(query.bbox != undefined && query.bbox != []){
      if(noPriorParam){
        requestURL = requestURL+ '?';
        noPriorParam = false;
      }else{
        requestURL = requestURL+'&';
      }
      requestURL = requestURL + `bbox=${query.bbox}`;
    }
    console.log(requestURL);
  }

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      console.log("The radar data getting loaded");
      console.log(data);
      for(let feature of data){
        radar1hLayer.addLayer(L.geoJson(feature,{
          style: function(feature) {
        switch (feature.properties.level) {
            case null: return {fillColor: "transparent"};
            case 0:  return {fillColor: "#f1eef6"};
            case 1:  return {fillColor: "#bdc9e1"};
            case 2:  return {fillColor: "#74a9cf"};
            case 3:  return {fillColor: "#2b8cbe"};
            case 4:  return {fillColor: "#045a8d"};
        }
    },
          fillOpacity: 0.7,
          color: "transparent",

          //color: 'green'
        })
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log("error in get1hradar");
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}



/**
* @function get5mRadar
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function get5mRadar(query){
  //clear layer
  radar5mLayer.clearLayers();

  //set up request URL
  var requestURL = "/radar/get5mradar";
  console.log("min:  " + query.min);
  console.log("max:  " + query.max);
  if(query != undefined){
      //variable to let the URL builder know whether a parameter was already entered in the query
    var noPriorParam = true;

    if(query.min != undefined && query.min != []){
      requestURL = requestURL+`?min=${query.min}`;
      noPriorParam = false;
    }
    if(query.max != undefined && query.max != []){
      if(noPriorParam){
        requestURL = requestURL+`?max=${query.max}`;
        noPriorParam = false;
      }else{
        requestURL = requestURL+`&max=${query.max}`;
      }
    }
    if(query.bbox != undefined && query.bbox != []){
      if(noPriorParam){
        requestURL = requestURL+ '?';
        noPriorParam = false;
      }else{
        requestURL = requestURL+'&';
      }
      requestURL = requestURL + `bbox=${query.bbox}`;
    }
    console.log(requestURL);
  }

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      console.log("The radar data getting loaded");
      console.log(data);
      for(let feature of data){
        radar5mLayer.addLayer(L.geoJson(feature,{
          style: function(feature) {
        switch (feature.properties.level) {
          case 0:  return {fillColor: "#f1eef6"};
          case 1:  return {fillColor: "#bdc9e1"};
          case 2:  return {fillColor: "#74a9cf"};
          case 3:  return {fillColor: "#2b8cbe"};
          case 4:  return {fillColor: "#045a8d"};
        }
    },
          fillOpacity: 0.7,
          color: "transparent",

          //color: 'green'
        })
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log("error in get5mradar");
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}


/**
* @function get5mRadar
* @desc queries the 5m Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function get5mRadar(query){
  //clear layer
  radar5mLayer.clearLayers();

  //set up request URL
  var requestURL = "/radar/get5mradar";
  console.log("min:  " + query.min);
  console.log("max:  " + query.max);
  if(query != undefined){
      //variable to let the URL builder know whether a parameter was already entered in the query
    var noPriorParam = true;

    if(query.min != undefined && query.min != []){
      requestURL = requestURL+`?min=${query.min}`;
      noPriorParam = false;
    }
    if(query.max != undefined && query.max != []){
      if(noPriorParam){
        requestURL = requestURL+`?max=${query.max}`;
        noPriorParam = false;
      }else{
        requestURL = requestURL+`&max=${query.max}`;
      }
    }
    if(query.bbox != undefined && query.bbox != []){
      if(noPriorParam){
        requestURL = requestURL+ '?';
        noPriorParam = false;
      }else{
        requestURL = requestURL+'&';
      }
      requestURL = requestURL + `polygon=${query.bbox}`;
    }
    console.log(requestURL);
  }

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      console.log("The radar data getting loaded");
      console.log(data);
      for(let feature of data){
        radar5mLayer.addLayer(L.geoJson(feature,{
          style: function(feature) {
        switch (feature.properties.level) {
            case null: return {fillColor: "transparent"};
            case 0:  return {fillColor: "#b3cde3"};
            case 1:  return {fillColor: "#8c96c6"};
            case 2:  return {fillColor: "#8856a7"};
            case 3:  return {fillColor: "#810f7c"};
        }
    },
          fillOpacity: 0.7,
          color: "transparent",

          //color: 'green'
        })
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log("error in get5mradar");
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getDemoradar
*/

async function getDemoRadar(query){
  //clear layer
  radarDemoLayer.clearLayers();

  //set up request URL
  var requestURL = "/radar/getDemoradar";
  console.log("min:  " + query.min);
  console.log("max:  " + query.max);
  if(query != undefined){
      //variable to let the URL builder know whether a parameter was already entered in the query
    var noPriorParam = true;

    if(query.min != undefined && query.min != []){
      requestURL = requestURL+`?min=${query.min}`;
      noPriorParam = false;
    }
    if(query.max != undefined && query.max != []){
      if(noPriorParam){
        requestURL = requestURL+`?max=${query.max}`;
        noPriorParam = false;
      }else{
        requestURL = requestURL+`&max=${query.max}`;
      }
    }
    if(query.bbox != undefined && query.bbox != []){
      if(noPriorParam){
        requestURL = requestURL+ '?';
        noPriorParam = false;
      }else{
        requestURL = requestURL+'&';
      }
      requestURL = requestURL + `polygon=${query.bbox}`;
    }
    console.log(requestURL);
  }

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      console.log("The radar data getting loaded");
      console.log(data);
      for(let feature of data){
        radarDemoLayer.addLayer(L.geoJson(feature,{
          style: function(feature) {
        switch (feature.properties.level) {
            case null: return {fillColor: "transparent"};
            case 0:  return {fillColor: "#b3cde3"};
            case 1:  return {fillColor: "#8c96c6"};
            case 2:  return {fillColor: "#8856a7"};
            case 3:  return {fillColor: "#810f7c"};
        }
    },
          fillOpacity: 0.7,
          color: "transparent",

          //color: 'green'
        })
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      console.log("error in getDemoradar");
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getDensity
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getDensity(query){
  //clear layer
  densityLayer.clearLayers();

  //set up request URL
  var requestURL = "/summary/density?";
  if(query.sigma){
    requestURL = requestURL+`sigma=${query.sigma}&`;
  }
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`
  }

  updateProgressIndicator("refreshing tweet-density heatmap...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("tweet-density heatmap refreshed");
      for(let feature of data){
        densityLayer.addLayer(L.geoJson(feature,{
          style: function(feature) {
        switch (feature.properties.layer) {
            case null: return {fillColor: "transparent"};
            case 0:  return {fillColor: "transparent"};
            case 1:  return {fillColor: "#ffffb2"};
            case 2:  return {fillColor: "#fecc5c"};
            case 3:  return {fillColor: "#fd8d3c"};
            case 4:  return {fillColor: "#f03b20"};
            case 5:  return {fillColor: "#bd0026"};
        }
    },
          fillOpacity: 0.7,
          color: "transparent",

          //color: 'green'
        })
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed refreshing tweet-density heatmap</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}


/**
* @function getQuadrat
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getQuadrat(query){
  //clear layer
quadratLayer.clearLayers();

  //set up request URL
  var requestURL = "/summary/quadrat?";

  if(query.xbreak){
    requestURL = requestURL+`xbreak=${query.xbreak}&`;
  }
  if(query.ybreak){
    requestURL = requestURL+`ybreak=${query.ybreak}&`;
  }
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing quadratic count map...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("Quadratic count map refreshed");
      for(let feature of data){
        console.log("in feature layer quadrat");
        quadratLayer.addLayer(L.geoJson(feature,{
          style: function(feature) {
        switch (feature.properties.layer) {
            case null: return {fillColor: "transparent"};
            case 0:  return {fillColor: "transparent"};
            case 1:  return {fillColor: "#ffffb2"};
            case 2:  return {fillColor: "#fecc5c"};
            case 3:  return {fillColor: "#fd8d3c"};
            case 4:  return {fillColor: "#f03b20"};
            case 5:  return {fillColor: "#bd0026"};
        }
    },
          fillOpacity: 0.7,
          color: "transparent",

          //color: 'green'
        })
      );
    }

    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed refreshing  Quadratic Count map</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getWordcloud
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getWordcloud(query){

  //set up request URL
  var requestURL = "/summary/wordcloud?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing tweet-Wordcloud...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("Wordcloud is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed refreshing tweet-density heatmap</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getTimeline
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getTimeline(query){

  //set up request URL
  var requestURL = "/summary/timeline?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }


  updateProgressIndicator("refreshing timeline...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("timeline is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed refreshing tweet-density heatmap</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getKest
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getKest(query){

  //set up request URL
  var requestURL = "/summary/kest?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing tweet-Wordcloud...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("KFunction is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed K function</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getLest
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getLest(query){

  //set up request URL
  var requestURL = "/summary/lest?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing tweet-Wordcloud...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("LFunction is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed K function</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getGest
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getGest(query){

  //set up request URL
  var requestURL = "/summary/gest?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing tweet-Wordcloud...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("GFunction is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed K function</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getFest
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getFest(query){

  //set up request URL
  var requestURL = "/summary/fest?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing tweet-Wordcloud...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("FFunction is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed K function</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function getAnn
* @desc queries the 1h Radar data endpoint for new district weather warnings and adds them to the map
* also clears the layer first
* @param query Object containing the query parameters
*/
async function getAnn(query){

  //set up request URL
  var requestURL = "/summary/ann?";
  if(query.bbox){
    requestURL = requestURL+`bbox=${query.bbox}&`;
  }
  if(query.older_than){
    requestURL =requestURL+`older_than=${query.older_than}&`;
  }
  if(query.include){
    requestURL = requestURL+`include=${query.include}&`;
  }
  if(query.exclude){
    requestURL = requestURL+`exclude=${query.exclude}&`;
  }

  updateProgressIndicator("refreshing tweet-Wordcloud...");

  return await $.ajax({
    url: requestURL,
    success: async function(data){
      updateProgressIndicator("ANN is loaded");
      $("#imagesummary").attr("src", requestURL);
      $("#linksummary").attr("href", requestURL);
      $("#imagesummary").attr("width", "300px");
      $("#imagesummary").attr("height", "300px");
    },
    error: function(xhr, ajaxOptions, thrownError){
      updateProgressIndicator('<font color="red">failed ANN function</font>');
      console.log(xhr.status);
      console.log(requestURL);
      console.log(thrownError);
    }
  });
}

/**
* @function tweetToLayer
* @desc gets called whenever a new marker is added to the map.
* checks whether the location of the tweet is currently occupied.
* then decides on whether to add to the map or to append to a popup
* devnote: potential for more functionality
* @param feature the tweet that is being added
* @param latlng the coordinates of the tweet
* @see nearestTweetRadius
* credit: nathansnider
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
* credit: nathansnider
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
    ).setContent(tweetdiv);
  layer.bindPopup(popup);
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
    var embedded = await getEmbeddedTweet(tweet.id_str);
    resolve(embedded);
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
  tweetLayer.addData(newTweet);

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

  var tweetPromise = new Promise(async function(resolve, reject){
    //get the included tweets and resolve
    var tweets = await getTweets(requestURL);
    resolve(tweets.tweets);
  });

  tweetPromise.then(function(tweets){
    bbox = turf.bboxPolygon([bbox[1],bbox[0],bbox[3],bbox[2]]);

    //remove tweets from the browser
    $("#tweet-browser").children("div").each(function(){
      //extrct coordinates of div
      var point = $(this).attr('coords').split(",");
      point[0] = parseFloat(point[0]);
      point[1] = parseFloat(point[1]);
      point = turf.point([point[0],point[1]]);

      let included = false;
      let contained = turf.booleanWithin(point, bbox);

      //check if the id strings were found in the answer
      for(let tweet of tweets){
        if(tweet.id_str == $(this).attr("id_str")){
          included = true;
        }
      }

      //remove if any of the conditions are met
      if(!included || !contained){
        $(this).remove();
      }
    });

    //remove tweets from the map
    for(var marker in tweetLayer._layers){
      //EXCTRACT COORDINATES
      var point = turf.point([tweetLayer._layers[marker]._latlng.lng,tweetLayer._layers[marker]._latlng.lat]);

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
          child = $(child);
          if(child.attr("class")=="tweetDiv"){

            //initialise variable deciding over inclusion of tweetDiv
            var included = false;

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
        }

        //update the popup if marker still exists
        try{
          tweetLayer._layers[marker]._popup._content = popupHTML.prop('outerHTML');
        } catch(error){/*ignore*/}
      }
    }
  });
}

/**
* @function getWindowCoordinates
* @desc function that gets window coordinates and zoom-level of the browser search-bar
* @returns Object: {lat: float, Lon: float, Zoom: number}
*/
function getWindowCoordinates(){
  //get the individual numbers from the URL as strings
  coords = $(location).attr('pathname').split("/");
  coords = coords[coords.length - 1];
  coords = coords.split(",");

  //numberify
  for(let number in coords){
    coords[number] = parseFloat(coords[number]);
  }

  //finish the output-object
  coords = {lat:coords[0], lon:coords[1], zoom:parseInt(coords[2])};

  return coords;
}

/**
* @function initialiseView
* @desc sets the map view to what was specified in the URL
*/
function initialiseView(){
  //set the view to where coordinates specified
  let coords;
  coords = getWindowCoordinates();

  //check if numbers are valid
  if(!(
    !isNaN(coords[0]) &&
    !isNaN(coords[1]) &&
    Number.isInteger(coords[2])
  )){
    map.setView(new L.LatLng(coords.lat,coords.lon), coords.zoom);
  }else{
    return false;
  }
}

/**
* @function convertUNIXtoTime
* takes a UNIX timestamp and returns a string of the datetime
* @param timestamp
* @returns string representing time and date
* based on https://makitweb.com/convert-unix-timestamp-to-date-time-with-javascript/
*/
function convertUNIXtoTime(timestamp){
  var date = new Date(timestamp)

  // Year
  var year = date.getFullYear();

  // Month
  var month = "0" +date.getMonth()+1;

  // Day
  var day = "0" +date.getDate();

  // Hours
  var hours = "0" +date.getHours();

  // Minutes
  var minutes = "0" + date.getMinutes();

  // Seconds
  var seconds = "0" + date.getSeconds();

  // Display date time in MM-dd-yyyy h:m:s format
  var dateTime = year+'-'+month.substr(-2)+'-'+day.substr(-2)+' '+hours.substr(-2) + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

  return dateTime
}
