// Get the packages we need
var express = require('express');
var mongoose = require('mongoose');
var Emote = require('./models/emote');
var bodyParser = require('body-parser');
var router = express.Router();


var mongoose = require('mongoose');
var db = mongoose.connection;

//replace this with your Mongolab URL
// switch between the two to do local/mlab
mongoose.connect('mongodb://127.0.0.1:27017/slackbot');


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
  if (req.body.text !== '' && req.body.text !== undefined) {

    // used to check for adding new emotions
    var splitString = req.body.text.toLowerCase().split(':');

    // if text is 'list', then list the emotions
    if (req.body.text.toLowerCase() === 'list') {
      var emotionsList = [];
      Emote.find({}, function(err, emote){
        emote.forEach(function(document){
          if (emotionsList.indexOf(document.emotion) == -1) {
            emotionsList.push(document.emotion.toString());
          }  
        });
        return res.json({ "text": 'Current list of emotions: ' + emotionsList.join(', ')});
      });
    }

    // add emotions if in format of: 'add:emotion:emoji'
    else if (splitString.length === 3 && splitString[0] === 'add' && splitString[1] !== '' && splitString[2] !== '' && splitString[1] !== undefined && splitString[2] !== undefined) {
      var emote = new Emote();
      emote.emotion = splitString[1];
      // this makes it so if the textface has a : in it, it won't be broken up
      emote.textface = splitString.slice(2).join(':');

      if (emote.emotion !== undefined && emote.textface !== undefined) {
        // check if already exists
        Emote.find({'emotion':emote.emotion, 'textface' : emote.textface}, function(err, emotesList) {
          if (emotesList.length > 0) {
            return res.json({"text": "This combination already exists!"})
          }

          else {
            emote.save(function(err) {
              if (err){
                res.status(404);
                return res.send(err);
              }
              res.status(201);
              return res.json({ "text": 'Emote for ' + splitString[1] + '(' + splitString.slice(2).join(':') + ') created!'});
            });
          }
        })   
      }
      else {
        return res.json({ message: 'Empty params'});
      }
    }

    else {
      // look for emotions
      Emote.find({'emotion':req.body.text.toLowerCase()}, function(err, emote) {
        // emotion not found
        if (emote.length === 0) {
          res.status(200);
          return res.json({
            "text": 'Emotion was not found Σ(ﾟДﾟ；). Add a new one by using the format: \'add:emotion:emoji\''
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
    } 
  }
  else {
    return res.json({
      "text": "See which emotions you can use by typing '/textmote list'\nAdd a new one by using the format: 'add:emotion:emoji', e.g. add:shrug:¯\\_(´◉◞౪◟◉)_/¯"
    });
  }

});

// text face route
var textFaceInputRoute = router.route('/textfaceinput');
textFaceInputRoute.post(function(req, res) {
  var emote = new Emote();
  emote.emotion = req.body.emotion;
  emote.textface = req.body.textface;
  if (emote.emotion !== undefined && emote.textface !== undefined) {
    // check if already exists
        Emote.find({'emotion':emote.emotion, 'textface' : emote.textface}, function(err, emotesList) {
          if (emotesList.length > 0) {
            return res.json({"text": "This combination already exists!"})
          }

          else {
            emote.save(function(err) {
              if (err){
                res.status(404);
                return res.send(err);
              }
              res.status(201);
              return res.json({ "text": 'Emote for ' + emote.emotion + '(' +emote.textface + ') created!'});
            });
          }
        })   
  }
  else {
    return res.json({ message: 'Empty params'});
  }
});

// Start the server
app.listen(port);
console.log('Server running on port ' + port);
