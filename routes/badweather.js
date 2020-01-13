/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var router = express.Router();
const kreisgrenzen = require('../public/jsons/landkreiseSimp');

var utilities = require('../utilityFunctions.js');

var Kreis = require("../models/kreis");
var UnwetterKreis = require("../models/unwetterkreis");

const weatherUpdateInterval = 300000;

function main(){
  //periodically update the weather in 5 minute intervals
  loadUnwetter();
  // periodicallyUpdateWeather(weatherUpdateInterval);
}

main();

////////////////////////////////////////////////////////////////////////////////
// endpoints
////////////////////////////////////////////////////////////////////////////////

/** requesting GEJSOn of deutsche Kreise
  * @author Dorian
  * url?name=<placeholder>&coordinates=<lng,lat>
  * @example url/getBorders?coordinates=9,53
  */
router.get('/getBorders', (req, res) => {
  var regions ={type:"FeatureCollection", features:[]};
  var query = {};
  if(req.query.name){
    query['geojson.properties.name'] = req.query.name;
  }
  if(req.query.coordinates){
    var coords = req.query.coordinates.split(",");
    query['geojson.geometry']=
     {$geoIntersects: {$geometry: {
      type: "Point",
      coordinates: coords}}};
  }
    //find featrues by name
    Kreis.find(query, function(err, result){
      if(err){
        console.log(err);
      }

      for(var i= 0; i < result.length; i++){
          regions.features.push(result[i].geojson);
      }
        res.json(regions);
    });
});

router.get('/deleteUnwetter', (req, res) => {
    UnwetterKreis.deleteMany({}, (err, result) => {
      next();
    });
});

/** requesting GEJSOn of bad Weather events
  * @author Dorian
  * @url?name=<placeholder>&coordinates=<lng,lat>&event=<EVENT>
  * @example http://localhost:3000/getUnwetter?event=GLATTEIS&name=Münster
  */

router.get("/warnings", (req, res)=>{
  var query = {};
  if(req.query.event){
    var event = req.query.event.toUpperCase();
    query['geojson.properties.event'] = event;
  }
  if(req.query.name){
    // query = {'geojson.properties.name' : req.query.name};
    query['geojson.properties.name'] = req.query.name;
  }
  if(req.query.coordinates){
    var coords = req.query.coordinates.split(",");
    query['geojson.geometry']=
     {$geoIntersects: {$geometry: {
      type: "Point",
      coordinates: coords}}};
  }
  UnwetterKreis.find(query, (err, result)=>{
  if(err){
      console.log(err);
    }
    var json = {type: "FeatureCollection", features:[]};
    result.forEach((item, index) =>{
      json.features.push(item.geojson);
    });
    res.json(json);
  });
});

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

/**
* @function loadBorders
* loads the border-geoJSON into the mongoDB
* @returns boolean whether laoding all districts was successful
* @Author Dorian, Felix
*/
async function loadBorders(){
  //get a list of each district
  var kreisliste = kreisgrenzen.features;
  for(let kreis of kreisliste){
    console.log(kreis.properties.GEN)
    //save each district to the mongoDB
    try {
      var newKreis = new Kreis({
      geojson: {
        type: "Feature",
        properties: {
          name: kreis.properties.GEN,
        },
        geometry: {
          type: kreis.geometry.type,
          coordinates: kreis.geometry.coordinates
       }
     }
    });
    await newKreis.save();
    //if it was unsuccessful, notify the system
    }catch(error){
      console.log("error in loading district-borders");
      console.log(error);
      utilities.indicateStatus(`error in loading district-borders: ${error}`);

      //terminate function
      return false;
    }
  }
  //if there was no error, indicate success
  console.log("successfully loaded district-borders into MongoDB");
  utilities.indicateStatus(`successfully loaded district-borders into MongoDB`);
  return true;
}

/**
* @function loadUnwetter
* function that loads new weather-alert-data into the database if called
* devnote: still very high runtime. might not be of high priority since it's not called often, but improvement is encouraged
* @author Dorian, FELIX
* //TODO: manche Kreise (Freiburg, Kreis Augsburg, Stadt münchen, etc) bekommen keine Warnungen. Grund: if(warning.regionName.includes(kreis.properties.GEN)) nicht genau genug
*/
function loadUnwetter(){
  utilities.indicateStatus("updating weather warnings from DWD-API");
  const requestURL = "https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd%3AWarnungen_Landkreise&outputFormat=application%2Fjson";
  console.log("loading Unwetter")
  request(requestURL, function(error, response, body) {
    if(error){
      console.log(error);
      utilities.indicateStatus(`<font color="red">error in connecting to DWD-API of weather warnings: ${error}</font>`);
    }
    //clear the database of previous entries
    UnwetterKreis.remove({});

    //parse the results of the query
  	var responseJSON = body;
    responseJSON = JSON.parse(responseJSON);

    //create an array of all the warnings
    warnings = responseJSON.features;

    //establish array for mongoose objects to be stored in before being saved
    //devnote: still an artifact from an earlier version. if no other problems occur for which this step could be useful, remove this step
    let warnkreise = [];
    warnkreise = warnings;

    for(let kreis of warnings){
      console.log(kreis)
      let newKreisWarnung = new UnwetterKreis({
        geojson: {
          type: kreis.type,
          id: kreis.id,
          bbox: kreis.bbox,
          geometry: {
            type: kreis.geometry.type,
            coordinates: kreis.geometry.coordinates
          },
          properties:  {
            AREADESC: kreis.properties.AREADESC,
            EVENT: kreis.properties.EVENT,
            ECGROUP: kreis.properties.ECGROUP,
            URGENCY: kreis.properties.URGENCY,
            SENT: kreis.properties.SENT,
            ONSET: kreis.properties.ONSET,
            EXPIRED: kreis.properties.EXPIRED,
            HEADLINE: kreis.properties.HEADLINE,
            DESCRIPTION: kreis.properties.DESCRIPTION,
            PARAMETERNAME: kreis.properties.PARAMETERNAME,
            PARAMETERVALUE: kreis.properties.PARAMETERVALUE
          }
        }
      });
      warnkreise.push(newKreisWarnung);
      kreisWarnung = undefined;
    }
    //finally, save the warnings to the db
    for(let kreisWarnung of warnkreise){
      console.log(kreisWarnung)
      kreisWarnung.save();
    }
    utilities.indicateStatus("weather-warning update successful");
  });
  //
  //
  //
  //
  //
  // request('https://www.dwd.de/DWD/warnungen/warnapp/json/warnings.json', function(error, response, body) {
  //   if(error){
  //     console.log(error);
  //     utilities.indicateStatus(`<font color="red">error in connecting to DWD-API of weather warnings: ${error}</font>`);
  //   }
  //   //clear the database of previous entries
  //   unwetterKreis.remove({});
  //
  //   //convert jsonp to json and parse the warnings
  //   var responseJSON = body.slice(24, body.length - 2);
  //   responseJSON = JSON.parse(responseJSON);
  //
  //   //create an array that can be worked with better and migrate the needed response data there
  //   warnings = [];
  //   for(let key in responseJSON.warnings){
  //     warnings.push({
  //       regionName: responseJSON.warnings[key][0].regionName,
  //       event: responseJSON.warnings[key][0].event
  //     });
  //   }
  //   //clear responseJSON so it doesn't take up
  //   responseJSON = undefined;
  //
  //   //first, load the districts
  //   var kreise = kreisgrenzen.features;
  //
  //   //create local array containing Warnkreise
  //   let warnkreise = [];
  //
  //   for(let warning of warnings){
  //     for(let kreis of kreise){
  //       if(warning.regionName.includes(kreis.properties.GEN)){
  //         //console.dir(kreis)
  //
  //         let warningFound = false;
  //
  //         //try to find an existing district warning first
  //         for(let kreisWarnung of warnkreise){
  //           if(kreisWarnung.geojson.properties.name == kreis.properties.GEN){
  //             kreisWarnung.geojson.properties.event.push(warning.event);
  //             warningFound = true;
  //             break;
  //           }
  //         }
  //         //create a new warning if the warning district was previously not on the list
  //         if(!warningFound){
  //           let newKreisWarnung = new UnwetterKreis({
  //             geojson: {
  //               type: "Feature",
  //               properties:{
  //                 name: kreis.properties.GEN,
  //                 event: [warning.event]
  //               },
  //               geometry:{
  //                 type: kreis.geometry.type,
  //                 coordinates: kreis.geometry.coordinates
  //               }
  //             }
  //           });
  //           warnkreise.push(newKreisWarnung);
  //           kreisWarnung = undefined;
  //         }
  //       }
  //     }
  //   }
  //   //finally, save the warnings to the db
  //   for(let kreisWarnung of warnkreise){
  //      kreisWarnung.save();
  //   }
  //   utilities.indicateStatus("weather-warning update successful");
  // });
}

/**
* @function periodicallyUpdateWeather
* @desc periodically gets updates from the DWD weather warning API in the given interval if called
* @param interval integer of interval length in milliseconds
*/
function periodicallyUpdateWeather(interval){
  setInterval(
    loadUnwetter(),
    interval
  );
}

module.exports = router;
