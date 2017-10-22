const express = require('express');
const hbs = require('hbs');
var router = express.Router();
const multer = require('multer');
var upload = multer({dest: './public/images'});
const mongo = require('mongodb');
const moment = require('moment');
const url = process.env.MONGODB_URI || 'localhost/nodeblog'; 
const db = require('monk')(url);

var helpers = require('handlebars-helpers')();  

router.get('/singlepage/:id', (req,res, next) => {
    var posts = db.get('posts');
    posts.findOne(req.params.id, function(err, post){
        res.render('singlepage', {
            'title' : req.params.title,
            'post': post
        });
    })
    
});

router.get('/add', ensureAuthenticated, (req,res, next) => {
    var categories = db.get('categories');
    categories.find({}, {}, function(err, categories){
        res.render('addpost', {
            'title' : 'Add Post',
            "categories" : categories
        });
    })
    
});
function ensureAuthenticated( req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}



router.post('/add',upload.single('mainimage'),  (req,res, next) => {
    var title = req.body.title;
    var category = req.body.category;
    var body = req.body.body;
    var author = req.body.author;
    var pictureid = req.body.pictureid;
    var date = new Date();
    if(req.file){
        console.log('Files uploading....');
        var mainimage = req.file.filename;
    }else{
        console.log('No File uploaded....');
        var mainimage = 'noimage.jpg';
    }
     // Form Validation
     req.checkBody('title', 'Title field is required.').notEmpty();
     req.checkBody('category', 'Category field is required.').notEmpty();
      
     req.checkBody('body', 'Body field is required.').notEmpty();
     req.checkBody('author', 'Author name is required.').notEmpty();
     
 
     //Check Errors
     var errors = req.validationErrors();
     if(errors){
         res.render('addpost', {
             errors: errors
         });
         //res.redirect('/posts/add');
         console.log(errors);
     }else{
         var posts = db.get('posts');
         posts.insert({
             "title": title,
             "category": category,
             "body": body,
             "date": moment(date).format("MMM Do YY"),
             "author": author,
             "pictureid": pictureid,
             "mainimage": mainimage
         }, function(err, post){
             if(err){
                 res.send(err);
             } else{
                req.flash('success', 'Post Added!!!')
                res.location('/');
                res.redirect('/');
             }
         });
         console.log('posting to db');
         
    }
   
});

router.post('/addcomment', (req,res, next) => {
    var name = req.body.name;
    var email = req.body.email;
    var addComment = req.body.addComment;
    var postid = req.body.postid;
    var commentDate = new Date();
    
     // Form Validation
     req.checkBody('name', 'Name field is required.').notEmpty();
     req.checkBody('email', 'Email field is required.').notEmpty();
     req.checkBody('email', 'Email must be valid.').isEmail();
     req.checkBody('addComment', 'Comment field is required.').notEmpty();
    
     
 
     //Check Errors
     var errors = req.validationErrors();
     if(errors){
         var posts = db.get('posts');
         posts.findOne(postid, (err, post) => {
            res.render('singlepage', {
                "errors": errors,
                "post": post
            });
         });
         
         //res.redirect('/posts/add');
         console.log(errors);
     }else{
         var comment = {
             "name": name,
             "email": email,
             "addComment": addComment,
             "commentDate": moment(commentDate).format("MMM Do YY")
         }

         var posts = db.get('posts');
         posts.update({
             "_jd": postid
         }, {
             $push:{
                 "comments": comment
             }
         }, (err, doc) => {
            if(err){
                throw err;
            }else{
                req.flash('success', 'Comment added!!');
                res.location('/posts/singlepage/' + postid);
                res.redirect('/posts/singlepage/' + postid);
            }
         });
         console.log(comment);
         
         
    }
   
});

module.exports = router;