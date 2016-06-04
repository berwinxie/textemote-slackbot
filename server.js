// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var User = require('./models/emote');
var config = require('./secret');
var bodyParser = require('body-parser');
var router = express.Router();

// mongolab vars
var mongo_user = config.mongo_user;
var mongo_password = config.mongo_password;

// var mongodburl = 'mongodb://' + mongo_user + ':' + mongo_password + '@ds051873.mlab.com:51873/cs498'
var mongoose = require('mongoose');
var db = mongoose.connection;

// db.on('error', console.error);
// db.once('open', function() {

// });
//replace this with your Mongolab URL
// switch between the two to do local/mlab
mongoose.connect('mongodb://127.0.0.1:27017/slackbot');
// mongoose.connect(mongodburl);


// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;

//Allow CORS so that backend and frontend could pe put on different servers
var allowCrossDomain = function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
};
app.use(allowCrossDomain);

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));

// All our routes will start with /api
app.use('/api', router);

// ----------------- USERS ----------------- //

// text face route
var textFaceRoute = router.route('/textface');

textFaceRoute.post(function(req, res) {
  return res.json({
    "response_type": "in_channel",
    "text": "(✿◠‿◠)"
  })
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
