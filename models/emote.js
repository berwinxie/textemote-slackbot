// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var EmoteSchema   = new mongoose.Schema({
  emotion: String,
  textface: String
});

// Export the Mongoose model
module.exports = mongoose.model('Emote', EmoteSchema);
