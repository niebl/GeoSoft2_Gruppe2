var express = require('express');
var router = express.Router();

/**
  * sets the default location of a pair of a location
  * e.g. a default Map view postion
  *
  * @author Dorian
  * @problems  function has to be changed to post???? --> UI
  */
router.post('/setdefaultlocation/:lat/:lng', function(req, res){
  //res.clearCookie("coords");
  var position = [];
  position.push(req.params.lat);
  console.log("Coorososdo", req.params.lat);
  position.push(req.params.lng);
  res.cookie('coords', position, {});
  res.redirect("/");
});


router.get('/marker/:lat/:lng/:whatever', function(req, res){
  var text = req.params.whatever;
  var lng = req.params.lng;
  var lat = req.params.lat;
    res.render('map', {markerLat: lat, markerLng: lng});
});

/* GET home page. */
router.get('/', function(req, res) {
  var location = req.cookies.coords || [7,-50];
  /*if(location){
    res.render('index', {defLocation: location});
  }else{
      res.render('index', {defLocation: [0,0]});
  }*/
res.render('map', {defLocation: location});
});

module.exports = router;
