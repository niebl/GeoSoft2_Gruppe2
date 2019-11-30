var mongoose = require('mongoose');

// Article Schema
var Tweet = mongoose.Schema({
  date: {type: Number},
  lat: {type: Number},
  lng: {type: Number},
  text: {type: String},
  tweetID: {type: String, unique: true}
});

var Tweet = module.exports = mongoose.model('Tweet', Tweet);
