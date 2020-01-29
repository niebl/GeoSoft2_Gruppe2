/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var router = express.Router();
const turf = require('@turf/turf');
var yaml = require('js-yaml');
var fs = require('fs');

const kreisgrenzen = require('../public/jsons/landkreiseSimp');

const utilities = require('../utilityFunctions.js');
var configurations = {};

var Kreis = require("../models/kreis");
var UnwetterKreis = require("../models/unwetterkreis");

//set the update interval for the weather warnigns to defaut 5 minutes
var weatherUpdateInterval = 300000;

function main(){
  //import the configurations from the yaml
  //TODO: FIXME configs werden nicht geladen
  configurations = loadConfigs(__dirname + '/../configs/config.yml')

  //set new weather update interval if it was user-given
  if(configurations.weatherParams.weatherUpdateInterval != undefined){
    weatherUpdateInterval = configurations.weatherParams.weatherUpdateInterval
  }

  //periodically update the weather in 5 minute intervals
  loadUnwetter();
  periodicallyUpdateWeather(weatherUpdateInterval);
}

main();

////////////////////////////////////////////////////////////////////////////////
// endpoints
////////////////////////////////////////////////////////////////////////////////

router.get('/deleteUnwetter', (req, res) => {
  UnwetterKreis.deleteMany({}, (err, result) => {
    next();
  });
});

/** requesting GEJSOn of bad Weather events
* @event get weather
* @url?name=<placeholder>&coordinates=<lng,lat>&event=<EVENT>
* @example http://localhost:3000/weather?event=GLATTEIS&name=Münster
*/
router.get("/", async(req, res)=>{
  let out = [];

  var bbox = req.query.bbox;
  var events = req.query.events;

  //BoundingBox
  if(bbox!=undefined){
    bbox = utilities.parseBBOX(bbox);
    if(bbox instanceof Error){
      res.status(400);
      res.send(bbox+"<hr>");
    }
  }

  //events
  if(events!=undefined){
    events = events.split(",");
  }
  //TODO: check validity of each event

  //build query object
  var query = {};



  let unwetterPromise = new Promise(async function(resolve, reject){
    resolve(await queryUnwetter(query));
  });

  unwetterPromise.then(function(results){

    //GEOGRAPHIC FILTERING
    //devnote: only compares bboxes at the moment. so districts will show up that are not directly within selected bbox
    if(bbox!=undefined){
      let turfbbox = turf.bboxPolygon([bbox[1],bbox[2],bbox[3],bbox[0]]);

      for(let shape of results){
        shapebbox = turf.bboxPolygon(shape.bbox);
        //console.log(shape)
        if(turf.booleanOverlap(shapebbox,turfbbox)||turf.booleanWithin(shapebbox,turfbbox)){
          out.push(shape);
        } else {
          //console.log("outside")
        }
      }
    } else {
      out = results;
    }

    //reset output
    results = out;
    out = [];

    //EVENT KEYWORD FILTERING
    if(events!=undefined){
      //check each shape if it contains the searched event
      let keywordFound;
      for(let shape of results){
        keywordFound = false;
        for(let weatherEvents of shape.properties.EVENT){
          for(let keyword of events){
            //compare each searched keyoword for each listed event in the district
            if(weatherEvents.toUpperCase() == keyword.toUpperCase()){
              //if one is found, give green light to add to the output
              keywordFound = true;
              break;
            }
          }
        }
        if(keywordFound){
          out.push(shape);
        }
      }

    } else {
      out = results;
    }

    res.send(out);
  });
});

////////////////////////////////////////////////////////////////////////////////
// functions
////////////////////////////////////////////////////////////////////////////////

/**
* @function loadBorders
* @desc loads the border-geoJSON into the mongoDB
* @returns boolean whether laoding all districts was successful
*/
async function loadBorders(){
  //get a list of each district
  var kreisliste = kreisgrenzen.features;
  for(let kreis of kreisliste){
    //save each district to the mongoDB
    try {
      var newKreis = new Kreis({
        type: "Feature",
        properties: {
          name: kreis.properties.GEN,
        },
        geometry: {
          type: kreis.geometry.type,
          coordinates: kreis.geometry.coordinates
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
* @desc function that loads new weather-alert-data into the database if called
* devnote: still very high runtime. might not be of high priority since it's not called often, but improvement is encouraged
*/
function loadUnwetter(){
  utilities.indicateStatus("updating weather warnings from DWD-API");
  const requestURL = "https://maps.dwd.de/geoserver/dwd/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dwd%3AWarnungen_Landkreise&outputFormat=application%2Fjson";
  console.log("loading Unwetter")
  request(requestURL, function(error, response, body) {
    if(error){
      console.log(error);
      utilities.indicateStatus(`<font color="red">error in connecting to DWD-API of weather warnings: ${error}</font>`);
      return;
    }

    //clear the database of previous entries
    UnwetterKreis.deleteMany({}, function(err, result){
      if(err){
        utilities.indicateStatus(`<font color="red">error in refreshing Unwetter ${err}</font>`);
        return;
      }
      //parse the results of the query
      var responseJSON = body;
      responseJSON = JSON.parse(responseJSON);

      //create an array of all the warnings
      warnings = responseJSON.features;

      //establish array for mongoose objects to be stored in before being saved
      let existingDistricts = [null];
      let warnkreise = [null];

      for(let kreis of warnings){
        if(kreis.type == "Feature"){
          //loop through existing warnings to see if any already exist
          let districtfound = false;
          for(let i = 0; i < existingDistricts.length; i++){
            if(kreis.properties.AREADESC == existingDistricts[i]){
              districtfound = true;

              //append info
              try{
                warnkreise[i].properties.EVENT.push(kreis.properties.EVENT);
                warnkreise[i].properties.EC_GROUP.push(kreis.properties.EC_GROUP);
                warnkreise[i].properties.HEADLINE.push(kreis.properties.HEADLINE);
                warnkreise[i].properties.DESCRIPTION.push(kreis.properties.DESCRIPTION);
                warnkreise[i].properties.PARAMETERVALUE.push(kreis.properties.PARAMETERVALUE);
                warnkreise[i].properties.PARAMETERNAME.push(kreis.properties.PARAMETERNAME);
              } catch(err){
                //console.log(err);
              }
            }
          }
          if(!districtfound){
            //the warning doesn't exist yet on the list, add it
            let newKreisWarnung = new UnwetterKreis({
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
                EC_GROUP: kreis.properties.EC_GROUP,
                EC_LICENSE: kreis.properties.EC_LICENSE,
                URGENCY: kreis.properties.URGENCY,
                SENT: kreis.properties.SENT,
                ONSET: kreis.properties.ONSET,
                EXPIRED: kreis.properties.EXPIRED,
                HEADLINE: kreis.properties.HEADLINE,
                DESCRIPTION: kreis.properties.DESCRIPTION,
                PARAMETERNAME: kreis.properties.PARAMETERNAME,
                PARAMETERVALUE: kreis.properties.PARAMETERVALUE
              }
            });
            warnkreise.push(newKreisWarnung);
            existingDistricts.push(kreis.properties.AREADESC);
            newKreisWarnung = undefined;
          }
        }
      }
      //finally, save the warnings to the db
      for(let kreisWarnung of warnkreise){
        if(kreisWarnung != null){
          kreisWarnung.properties.created_at = Date.now();
          kreisWarnung.save();
        }
      }
      console.log("weather update successful");
      utilities.indicateStatus("weather-warning update successful");
    });
  });
}

/**
* @function queryUnwetter
* @desc Queries the districts that have bad weather warnings issued against them from the mongodb
* @param queries, Object of mongoose queries
* @return mongoose docs
*/
async function queryUnwetter(queries){
  let output;

  function unwetterPromise(){
    return new Promise(async function(resolve, reject){
      await UnwetterKreis.find(
        queries,
        {__v:0, _id:0},
        async function(err,docs){
          if(err){
            console.log("~~~~~! error in mongoDB query !~~~~~");
            console.log(error);
            return reject();
          } else {
            return resolve(docs);
          }
        }
      );
    })
  }

  return unwetterPromise().then(docs=>{
    return docs;
  });
}

/**
* @function periodicallyUpdateWeather
* @desc periodically gets updates from the DWD weather warning API in the given interval if called
* @param interval integer of interval length in milliseconds
*/
function periodicallyUpdateWeather(interval){
  setInterval(
    loadUnwetter,
    interval
  );
}

//devnote: for unknown reasons, these functions imported from utilityFunctions can't properly retrieve the file.
//comment of these functions available in app.js or utilityFunctions
//FIXME
function loadConfigs(path){
  try {
    //load and return the document in the path
    const doc = yaml.safeLoad(fs.readFileSync(path, 'utf-8'));
    return(doc);
  } catch (e){
    console.log(e);
    return false;
  }
}

module.exports = router;
