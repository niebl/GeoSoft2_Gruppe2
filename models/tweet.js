var mongoose = require('mongoose');

// Article Schema
var tweetSchema = mongoose.Schema({
  date: Number},
  {lat: Number},
  {lng: Number},
  {Text: String}
);

var Tweet = module.exports = mongoose.model('Tweet', tweetSchema);
