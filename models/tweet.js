var mongoose = require('mongoose');

// Article Schema
var Tweet = mongoose.Schema({
  created_at: {type: Number},
  //lon-lat-coordinates
  coordinates: {type: [Number]},
  text: {type: String},
  id_str: {type: String, unique: true}
});

var Tweet = module.exports = mongoose.model('Tweet', Tweet);
