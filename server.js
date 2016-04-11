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
var mongoose = require('mongoose');
var db = mongoose.connection;

// db.on('error', console.error);
// db.once('open', function() {

// });
//replace this with your Mongolab URL
// switch between the two to do local/mlab
mongoose.connect('mongodb://127.0.0.1:27017/cs498');
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

//Default route here
var homeRoute = router.route('/');

homeRoute.get(function(req, res) {
  res.json({ message: 'Hello World!' });
});

// ----------------- USERS ----------------- //

//User route
var userRoute = router.route('/users');

userRoute.get(function(req, res) {
  // getting the parameters for querying
  var params = req.query;

  var findParams = {};
  // if existing in the query, we apply it
  if (params.hasOwnProperty('where')) {
    findParams.where = JSON.parse(params.where);
  }

  var query;

  if (params.hasOwnProperty('count')) {
    if (params['count']) {
      query = User.count(findParams.where, function(err, count) {
        if (err) {
          return res.send(err);
        }
        return res.json({message:'OK', count:count})
      });
    }
  }

  else {
    query = User.find(findParams.where, function(err, user) {
      if (err) {
        return res.send(err);
      }
      // console.log(user[0]['name']);
      return res.json({message:'OK', data:user})
    });
  }

  if (params.hasOwnProperty('sort')) {
    query.sort(JSON.parse(params.sort));
  }
  if (params.hasOwnProperty('select')) {
    query.select(JSON.parse(params.select));
  }

  if (params.hasOwnProperty('skip')) {
    query.skip(params.skip);
  }

  if (params.hasOwnProperty('limit')) {
    query.limit(params.limit);
  }
});

userRoute.options(function(req, res) {
  res.writeHead(200);
  res.end()
});


userRoute.post(function(req, res) {
  var user = new User();      // create a new instance of the User model
  var d = new Date();         // let us set date automatically 

  // user info
  user.name = req.body.name; 
  user.email = req.body.email; 
  console.log('email');
  console.log(user.email);
  if (typeof user.email === undefined || user.email === '') {
    res.status(200);
    return res.json({message: 'Email is invalid', data:{}});
  }
  user.pendingTasks = req.body.pendingTasks; 
  if(user.pendingTasks === undefined) {
    user.pendingTasks = [];
  }
  user.dateCreated = d.toJSON(); 

  User.find({email: user.email}, function(err, users) {
    // found email existing
    if (users.length > 0) {
      res.status(200);
      return res.json({message: 'Email already exists/Is invalid', data:{}});
    }
    else {
      // save the comment and check for errors
      user.save(function(err) {
        if (err){
          res.status(404);
          return res.send(err);
        }
        res.status(201);
        return res.json({ message: 'OK', data: user});
      });
    }
  });

  
});

// ----------------- USER: ID ----------------- //

// user route with id
var userIdRoute = router.route('/users/:id');

userIdRoute.get(function(req, res) {
  
  User.findById(req.params.id, function(err, user) {
    if (err) {
      res.status(404);
      return res.send(err);
    }
    res.status(200);
    return res.json({message:'OK', data:user})
  });
});


// should this completely replace the user? i.e. change the dateCreated
userIdRoute.put(function(req, res) {
  console.log(req.query);

  if (req.query.method == 'push'){ 
    User.findByIdAndUpdate(req.params.id, {$addToSet: {'pendingTasks': req.query.pendingTasks}}, function(err, user) {
      if (err) {
        return res.send(err);
      }
      return res.json({message:'OK', data:user});
    });
  }
  else if (req.query.method == 'pull'){
    User.findByIdAndUpdate(req.params.id, {$pull: {'pendingTasks': req.query.pendingTasks}}, function(err, user) {
      if (err) {
        return res.send(err);
      }
      return res.json({message:'OK', data:user});
    });
  }

  else {
    console.log('POOOOOOOOOOOOOOOOP');
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return res.send(err);
      }

      console.log('INSIDEPOOOOP');

      user['pendingTasks'] = req.body.pendingTasks;
      user['name'] = req.body.name;
      user['email'] = req.body.email;
      user['dateCreated'] = req.body.dateCreated;
      user['_id'] = req.body._id;

      console.log('pendingtasks');
      console.log(user['pendingTasks']);
      user.save(function(err, user) {
        if (err){
          return res.send(err);
        }
        console.log('SAVED THE POOOOP');
        return res.json({message:'OK', data:user})
      });

    });
  }
  
});

userIdRoute.delete(function(req, res) {
  User.remove({
    _id: req.params.id
  }, 
  function(err, user) {
    if (err) {
      return res.send(err);
    }
    // return the user that we deleted so that we can go through all its tasks to set their assigned user to unassigned
    res.status(200);
    return res.json({ message: "Successfully delete", data:user});
  });
});


// ----------------- TASKS ----------------- //

var taskRoute = router.route('/tasks');

taskRoute.get(function(req, res) {
  // getting the parameters for querying
  var params = req.query;
  // console.log(params);

  var findParams = {};
  // if existing in the query, we apply it
  if (params.hasOwnProperty('where')) {
    findParams.where = JSON.parse(params.where);
  }

  var query;
  var size = 0;
  if (params.hasOwnProperty('count') && (params['count'] == "true" || params['count'] == true)) {
    // for some reason, if there is more things after count, we have to do some magical things
    // if count is the only param, we can just send count normally
    // if not, I find all the tasks and return the size of the array
    for (key in params) {
            if (params.hasOwnProperty(key)) size++;
        }

    if (size === 1) {
      console.log('yay');
      query = Task.count(findParams.where, function(err, count) {
            if (err) {
              return res.send(err);
            }
            return res.json({message:'OK', count:count})
          });
    }
    else {
      query = Task.find(findParams.where, function(err, task) {
        if (err) {
          return res.send(err);
        }        
          console.log(task);
          return res.json({message:'OK', count:task.length})
        });

    }
  }

  else {
    query = Task.find(findParams.where, function(err, task) {
      if (err) {
        return res.send(err);
      }
      return res.json({message:'OK', data:task})
    });
  }

  if (params.hasOwnProperty('sort')) {
    query.sort(JSON.parse(params.sort));
  }
  if (params.hasOwnProperty('select')) {
    query.select(JSON.parse(params.select));
  }

  if (params.hasOwnProperty('skip')) {
    query.skip(params.skip);
  }

  if (params.hasOwnProperty('limit')) {
    query.limit(params.limit);
  }
  else {
    query.limit(100);
  }


  // DO COUNT?

  
});

taskRoute.post(function(req, res) {
  var task = new Task();      // create a new instance of the User model
  var d = new Date();         // let us set date automatically 

  // task info
  task.name = req.body.name; 
  task.description = req.body.description; 
  task.deadline = req.body.deadline;
  task.completed = req.body.completed;
  task.assignedUser = req.body.assignedUser
  task.assignedUserName = req.body.assignedUserName;
  dateCreated = d.toJSON();

  // add the task_id to the assignedUser

  task.save(function(err) {
    if (err){
      return res.send(err);
    }
    res.status(201);
    return res.json({ message: 'OK', data: task});
  });
});

taskRoute.options(function(req, res) {
  res.writeHead(200);
  res.end()
});



var taskIdRoute = router.route('/tasks/:id');

taskIdRoute.get(function(req, res) {
  Task.findById(req.params.id, function(err, task) {
    if (err) {
      return res.send(err);
    }
    return res.json({message:'OK', data:task});
  });
});

taskIdRoute.put(function(req, res) {
  var query = {$set : req.query };
  console.log('task id put');
  console.log(query);
  Task.findByIdAndUpdate(req.params.id, query, {new:true}, function(err, task) {
    if (err) {
      return res.send(err);
    }
    // console.log(task);
    return res.json({message:'OK', data:task});
  });
});

taskIdRoute.delete(function(req, res) {
  Task.remove({
    _id: req.params.id
  }, 
  function(err, user) {
    if (err) {
      return res.send(err);
    }
    return res.json({ message: "Successfully deleted task", data: user});
  });
});


// Start the server
app.listen(port);
console.log('Server running on port ' + port);
