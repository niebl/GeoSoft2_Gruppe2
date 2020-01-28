var mongoose = require('mongoose');

// Article Schema
var precipitationDemoSchema = mongoose.Schema({
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

var PrecipitationDemo = module.exports = mongoose.model('Precipitationminutes', precipitationDemoSchema);
