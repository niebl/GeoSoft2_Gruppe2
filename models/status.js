var mongoose = require('mongoose');

// Article Schema

var Status = mongoose.Schema({
  created_at: {type: Number},
  message: {type: String},
  messageType: {type: String, default:"processIndication"},
});

var Status = module.exports = mongoose.model('Status', Status);
