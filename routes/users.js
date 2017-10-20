const express = require('express');
var router = express.Router();
const multer = require('multer');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//Handle File uploads
var upload = multer({dest: './public/images'});
var User = require('../models/user');

/*GET user listing */

// router.get('/', (req, res, next) => {
//     res.send('respond with a resource');
// });

router.get('/register', (req, res, next) => {
    res.render('register', {title: 'Register'});
});
router.post('/register', upload.single('profilepicture'), (req, res, next) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var passwordConfirmation = req.body.passwordConfirmation; 

    if(req.file){
        console.log('Files uploading....');
        var profilepicture = req.file.filename;
    }else{
        console.log('No File uploaded....');
        var profilepicture = 'noimage.jpg';
    }
    // Form Validation
    req.checkBody('name', 'Name field is required.').notEmpty();
    req.checkBody('email', 'Email field is required.').notEmpty();
    req.checkBody('email', 'Email must be valid.').isEmail();
    req.checkBody('username', 'Username field is required.').notEmpty();
    req.checkBody('password', 'Password field is required.').notEmpty();
    req.checkBody('passwordConfirmation', 'Password do not match.').equals(req.body.password);

    // Check Errors
    var errors = req.validationErrors();
    if(errors){
        res.render('register', {
            errors: errors
        });
    }else{
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
            profilepicture: profilepicture
        });

        User.createUser(newUser, (err, user) => {
            if(err) throw err;
            console.log(user);

        });

        req.flash('success', 'Registered succesfully!!!')
        res.location('/');
        res.redirect('/');
    }
});
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(function(username, password, done){
    User.getUserByUsername(username, (err, user) => {
        if(err) throw err;
        if(!user){
            return done(null, false, {message: 'Unknown User'});
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) return done(err);
            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid Password'});
            }
        });
    });

}));



router.get('/login', (req, res, next) => {
    res.locals.message = req.flash('message');
    res.render('login', {title: 'Log in', message : req.flash('error')});
});
router.post('/login',
    passport.authenticate('local', {failureRedirect:'/users/login', failureFlash:'Invalid username or password'}),
    function(req, res) {
    req.flash('success', 'You are now logged in');
    res.redirect('/');
});

router.get('/logout', (req, res) => {
    req.logout();
   // req.flash('success', 'Your are now logged out');
    res.redirect('/users/login');
});

module.exports = router;