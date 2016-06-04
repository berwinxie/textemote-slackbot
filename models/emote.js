// Load required packages
var mongoose = require('mongoose');

// Define our user schema
var EmoteSchema   = new mongoose.Schema({
  name: String,
  emote: String
});

// Export the Mongoose model
module.exports = mongoose.model('Emote', EmoteSchema);
