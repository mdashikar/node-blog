const express = require('express');
var router = express.Router();

const mongo = require('mongodb');
const moment = require('moment');
const url = process.env.MONGODB_URI || 'localhost/nodeblog';  
const db = require('monk')(url);


router.get('/show/:category', (req,res, next) => {
    
    var posts = db.get('posts');
    posts.find({category: req.params.category} , {}, function(err, posts){
        res.render('index', {
            'title' : req.params.category,
            "posts" : posts
        });
    })
    
    
});
router.get('/', (req,res, next) => {
    var categories = db.get('categories');
    categories.find({}, {}, function(err, category){
        res.render('index', {
            "categories" : category
        });
    })
    
});

router.get('/add', ensureAuthenticated, (req,res, next) => {
    
    res.render('addcategory', {
        'title' : 'Add Category'
       
    });
    
    
});
function ensureAuthenticated( req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/users/login');
}


router.post('/add', (req,res, next) => {
    var name= req.body.name;
    

     // Form Validation
     req.checkBody('name', 'Category Name field is required.').notEmpty();
    
     
 
     //Check Errors
     var errors = req.validationErrors();
     if(errors){
         res.render('addcategory', {
             errors: errors
         });
         //res.redirect('/categories/add');
     }else{
         var categories = db.get('categories');
         categories.insert({
             "name": name,
            
         }, function(err, post){
             if(err){
                 res.send(err);
             } else{
                req.flash('success', 'Category Added!!!')
                res.location('/');
                res.redirect('/');
             }
         });
         console.log('posting to db');
         
    }
});

module.exports = router;