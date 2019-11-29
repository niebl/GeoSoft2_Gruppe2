var mongoose = require('mongoose');

// Article Schema
var TweetSchema = mongoose.Schema(
  {date: Date},
  {lat: Number},
  {lng: Number},
  {Text: String},
  {TweetID: String}
);

var Tweet = module.exports = mongoose.model('Tweet', TweetSchema);
