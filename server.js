// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/user');
var Task = require('./models/task');
var config = require('./secret');
var bodyParser = require('body-parser');
var router = express.Router();

// mongolab vars
var mongo_user = config.mongo_user;
var mongo_password = config.mongo_password;

var mongodburl = 'mongodb://' + mongo_user + ':' + mongo_password + '@ds051873.mlab.com:51873/cs498'
console.log(mongodburl);
//replace this with your Mongolab URL
mongoose.connect(mongodburl);


// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

//User route
var userRoute = router.route('/users');

userRoute.get(function(req, res) {
  res.json([{ "name": "alice", "height": 12 }, { "name": "jane", "height": 13 }]);
});

userRoute.post(function(req, res) {
  var user = new User();      // create a new instance of the User model
  var d = new Date();         // let us set date automatically 
  user.name = req.body.name; 
  user.email = req.body.email; 
  user.pendingTasks = req.body.pendingTasks; 
  user.dateCreated = d.toJSON(); 

  // save the comment and check for errors
  user.save(function(err) {
      if (err){
          res.send(err);
      }
      res.json({ message: 'User created!', name: user.name });
  });
});

// user route with id
var userIdRoute = router.route('/users/:id');


var taskRoute = router.route('/tasks');
var taskIdRoute = router.route('/tasks/:id');


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
