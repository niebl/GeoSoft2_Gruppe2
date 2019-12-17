var mongoose = require('mongoose');

// Article Schema
var kreisSchema = mongoose.Schema({
  geojson:{
    type: { type: String },
    properties: {
      name: String
    },
    geometry: {
      type: { type: String },
      coordinates: Array}
    }
  }
);

var Kreis = module.exports = mongoose.model('Kreis', kreisSchema);
