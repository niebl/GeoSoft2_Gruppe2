var mongoose = require('mongoose');

// Article Schema
var unwetterKreisSchema = mongoose.Schema({
  type: { type: String },
  id: {type: String, unique: true},
  bbox: Array,
  properties: {
    created_at: {type: Number},
    AREADESC: {type: String},
    EVENT: [String],
    EC_GROUP: [String],
    EC_LICENSE: {type: String},
    URGENCY: {type: String},
    SENT: {type: String},
    ONSET: {type: String},
    EXPIRED: {type: String},
    HEADLINE: [String],
    DESCRIPTION: [String],
    PARAMETERNAME: [String],
    PARAMETERVALUE: [String]
  },
  geometry: {
     type: { type: String },
     coordinates: [Array]
	  }
  }
);

var UnwetterKreis = module.exports = mongoose.model('UnwetterKreis', unwetterKreisSchema);
