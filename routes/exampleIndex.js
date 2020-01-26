var express = require('express');
var router = express.Router();
var utilities = require('../utilityFunctions.js');

/* GET home page. */
router.get('/geomergency/example/:coords', function(req, res, next) {
  var coords = req.params.coords;
  var error;

  //if coordinates are presumably entered, check validity
  if(coords!=undefined){
    coords = coords.split(",");

    //numberify the strings
    if(coords.length == 3){
      coords[0] = parseFloat(coords[0]);
      coords[1] = parseFloat(coords[1]);
      coords[2] = parseInt(coords[2]);

      //check input validity
      if(!(
        !isNaN(coords[0]) &&
        !isNaN(coords[1]) &&
        Number.isInteger(coords[2])
      )){
        error = `<font color="red">invalid coordinate parameters in URL. Reset to default</font>`
        res.redirect("http://localhost:3000/geomergency/example")
      }else{
        res.render('exampleIndex');
      }
    }else{
      error = `<font color="red">invalid coordinate parameters in URL. Reset to default</font>`
      res.redirect("http://localhost:3000/geomergency/example")
    }

  }

  if(error != undefined){
    utilities.indicateStatus(error)
  }

  res.render('exampleIndex');

});

router.get('/geomergency/example', function(req, res, next){

  res.render('exampleIndex');

});

module.exports = router;
