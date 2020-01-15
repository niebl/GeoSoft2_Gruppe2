var mongoose = require('mongoose');

// Article Schema
var unwetterKreisSchema = mongoose.Schema({
  type: { type: String },
  id: {type: String, unique: true},
  bbox: Array,
  properties: {
    AREADESC: {type: String},
    EVENT: [String],
    ECGROUP: {type: String},
    URGENCY: {type: String},
    SENT: {type: String},
    ONSET: {type: String},
    EXPIRED: {type: String},
    HEADLINE: {type: String},
    DESCRIPTION: {type: String},
    PARAMETERNAME: {type: String},
    PARAMETERVALUE: {type: String}
  },
  geometry: {
     type: { type: String },
     coordinates: [Array]
	  }
  }
);

var UnwetterKreis = module.exports = mongoose.model('UnwetterKreis', unwetterKreisSchema);
