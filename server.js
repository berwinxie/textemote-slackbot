// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Emote = require('./models/emote');
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

// Use environment defined port or 8888
var port = process.env.PORT || 8888;

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


//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});


// ----------------- FACES ----------------- //

// text face route
var textFaceRoute = router.route('/textface');

textFaceRoute.post(function(req, res) {
  console.log(req.query);
  Emote.find({'emotion':req.query.text.toLowerCase()}, function(err, emote) {

    // emotion not found
    if (emote.length === 0) {
      res.status(200);
      return res.json({
        "text": 'Emotion was not found Σ(ﾟДﾟ；)'
      })
    }
    else {
      // return random emotion from list
      var index = Math.floor(Math.random()*emote.length)
      return res.json({
        "response_type": "in_channel",
        "text": emote[index].textface
      })
    }
  });

});

// text face route
var textFaceInputRoute = router.route('/textfaceinput');
textFaceInputRoute.post(function(req, res) {
  var emote = new Emote();
  emote.emotion = req.query.emotion;
  emote.textface = req.query.textface;
  if (emote.emotion !== undefined && emote.textface !== undefined) {
    emote.save(function(err) {
      if (err){
        res.status(404);
        return res.send(err);
      }
      res.status(201);
      return res.json({ message: 'Emote for ' + req.query.emotion + '(' + req.query.textface + ') created!'});
    });
  }
  else {
    return res.json({ message: 'Empty params'});
  }
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
