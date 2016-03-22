// Load required packages
var mongoose = require('mongoose');

// Define our task schema
var TaskSchema   = new mongoose.Schema({
  name: String,
  description: String,
  deadline: Date,
  completed: Boolean,
  assignedUser: String,
  assignedUserName: String,
  dateCreated: Date
});

/*
“name” - String
“description” - String
“deadline” - Date
“completed” - Boolean
“assignedUser” - String - The _id field of the user this task is assigned to - default “”
“assignedUserName” - String - The name field of the user this task is assigned to - default “unassigned”
“dateCreated” - Date - should be set automatically by server to present date
*/

// Export the Mongoose model
module.exports = mongoose.model('Task', TaskSchema);

