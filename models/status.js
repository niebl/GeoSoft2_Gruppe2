var mongoose = require('mongoose');

// Article Schema

var Status = mongoose.Schema({
  created_at: {type: Number},
  message: {type: String},
});

var Status = module.exports = mongoose.model('Status', Status);
