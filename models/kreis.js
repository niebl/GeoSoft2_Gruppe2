var mongoose = require('mongoose');

// Article Schema
var kreisSchema = mongoose.Schema({
  Name: String,
  Type: String,
  Border: Array}
);

var Kreis = module.exports = mongoose.model('Kreis', kreisSchema);
