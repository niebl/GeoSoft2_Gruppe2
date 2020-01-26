var mongoose = require('mongoose');

// Article Schema
var precipitationSchema = mongoose.Schema({
  geojson: {
    type: { type: String },
    properties: {
      level: Number
    },
    geometry: {
      type: { type: String },
      coordinates: Array}
    }
  }
);

var Precipitation = module.exports = mongoose.model('Precipitation', precipitationSchema);
