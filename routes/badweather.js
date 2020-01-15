/*jshint esversion: 8 */
var request = require('request');
var express = require('express');
var router = express.Router();
const turf = require('@turf/turf');

const kreisgrenzen = require('../public/jsons/landkreiseSimp');

var utilities = require('../utilityFunctions.js');

var Kreis = require("../models/kreis");
var UnwetterKreis = require("../models/unwetterkreis");

const weatherUpdateInterval = 300000;

function main(){
  //periodically update the weather in 5 minute intervals
  loadUnwetter();
  //periodicallyUpdateWeather(weatherUpdateInterval);
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

  router.get("/warnings", async(req, res)=>{
    let out;

    var bbox = req.query.bbox;
    var events = req.query.events;

    //BoundingBox
    if(bbox!=undefined){
      bbox = utilities.parseBBOX(bbox)
      if(bbox instanceof Error){
        res.status(400)
        res.send(bbox+"<hr>")
      }
    }

    //events
    if(events!=undefined){
      events = events.split(",")
    }
    //TODO: check validity of each event

    //build query object
    var query = {};

    if(events!=undefined){
      query['geojson.properties.EVENT'] = {
        $or: events
      };
    }

    console.log(query)

    let unwetterPromise = new Promise(async function(resolve, reject){
      resolve(await queryUnwetter(query));
    })

    unwetterPromise.then(function(results){
      console.log(results[0])
      console.log(bbox)

      if(bbox!=undefined){
        let turfbbox = turf.bboxPolygon(bbox)
        console.log(turfbbox)

        for(let shape of results){
          //console.log(shape)
          if(turf.booleanWithin(shape.geojson,turfbbox)){
            out.push(shape.geojson)
          }
        }
      } else {
        out = results;
      }

      console.log(out)
      res.send(out)
    })




    // var query = {};
    // if(req.query.event){
    //   var event = req.query.event.toUpperCase();
    //   query['geojson.properties.event'] = event;
    // }
    // if(req.query.name){
    //   // query = {'geojson.properties.name' : req.query.name};
    //   query['geojson.properties.name'] = req.query.name;
    // }
    // if(req.query.coordinates){
    //   var coords = req.query.coordinates.split(",");
    //   query['geojson.geometry']=
    //    {$geoIntersects: {$geometry: {
    //     type: "Point",
    //     coordinates: coords}}};
    // }
    // UnwetterKreis.find(query, (err, result)=>{
    // if(err){
    //     console.log(err);
    //   }
    //   var json = {type: "FeatureCollection", features:[]};
    //   result.forEach((item, index) =>{
    //     json.features.push(item.geojson);
    //   });
    //   res.json(json);
    // });
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
                //TODO: append more info
                warnkreise[i].geojson.properties.EVENT.push(kreis.properties.EVENT);
              }
            }
            if(!districtfound){
              //the warning doesn't exist yet on the list, add it
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
              existingDistricts.push(kreis.properties.AREADESC);
              newKreisWarnung = undefined;
            }
          }
        }
        //finally, save the warnings to the db
        for(let kreisWarnung of warnkreise){
          if(kreisWarnung != null){
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
  * Queries the districts that have bad weather warnings issued against them from the mongodb
  * @author Felix
  * @param queries, Object of mongoose queries
  * @return mongoose docs
  */
  async function queryUnwetter(queries){
    let output;

    function unwetterPromise(){
      return new Promise(async function(resolve, reject){
        await UnwetterKreis.find(
          queries,
          async function(err,docs){
            if(err){
              console.log("~~~~~! error in mongoDB query !~~~~~");
              console.log(error);
              return reject()
            } else {
              console.log("SUCCESSFUL~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")
              console.log(docs[0])
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
      loadUnwetter(),
      interval
    );
  }

  module.exports = router;
