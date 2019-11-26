var mongoose = require('mongoose');

// Article Schema
var unwetterKreisSchema = mongoose.Schema({
  Name: String,
  Type: String,
  Event: String,
  Border: Array}
);

var UnwetterKreis = module.exports = mongoose.model('UnwetterKreis', unwetterKreisSchema);
