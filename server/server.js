const express = require('express');
const hbs = require('hbs');
const bodyParser = require('body-parser');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const expressValidator = require('express-validator');
var helpers = require('template-helpers')();
const multer = require('multer');
//Handle File uploads
var upload = multer({dest: './public/images'});
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const mongo = require('mongodb');
const mongoose = require('mongoose');
//const moment = require('moment');
const url = process.env.MONGODB_URI || 'localhost/nodeblog'; 
const db = require('monk')(url);
var helpers = require('handlebars-helpers')();

//var db = mongoose.connection;

var routes = require('../routes/index');
var users = require('../routes/users');
var posts = require('../routes/posts');
var categories = require('../routes/categories');


var app = express();

app.locals.moment = require('moment');

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'hbs');



// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

// Make our db accessible to our router
app.use(function(req, res, next){
    req.db = db;
    next();
});

// Handle Sessions
// app.use(cookieSession({
//     secret: 'secret',
//     saveUninitialized: true,
//     resave: true
// }));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
// Passport 
app.use(passport.initialize());
app.use(passport.session());

// Validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
 
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,      
        value : value
      };
    }
})); 

// Express messages for flash notification rendering
app.use(flash());
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.get('*', function(req, res, next){
  res.locals.user = req.user || null;
  next();
});

// Routes for our app
app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);
app.use('/categories', categories);



const port = process.env.PORT || 3000;

hbs.registerHelper('trimString', function(passedString, startstring, endstring) {
  var theString = passedString.substring( startstring, endstring );
  return new hbs.SafeString(theString);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  
  // error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


app.listen(port, () => {
    console.log(`Started on port: ${port}`);
});

module.exports = {app};

