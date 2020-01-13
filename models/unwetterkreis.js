var mongoose = require('mongoose');

// Article Schema
var unwetterKreisSchema = mongoose.Schema({
  geojson:{
    type: { type: String },
    properties: {
      name: String,
      event: Array
    },
    geometry: {
       type: { type: String },
       coordinates: Array}
    }
  }
);

var UnwetterKreis = module.exports = mongoose.model('UnwetterKreis', unwetterKreisSchema);
