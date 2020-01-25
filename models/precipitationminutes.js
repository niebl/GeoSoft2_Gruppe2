var mongoose = require('mongoose');

// Article Schema
var precipitationminutesSchema = mongoose.Schema({
  geojson: {
    type: { type: String },
    properties: {
      level: Number
    },
    geometry: {
      type: { type: String },
      coordinates: Array}
    }
  });

var Precipitationminutes = module.exports = mongoose.model('Precipitationminutes', precipitationminutesSchema);
