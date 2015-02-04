var express = require('express');
var router = express.Router();
var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
 //fdf

router.get('/',function(req,res)
{
   res.render('index');
});


router.post('/login',
    passport.authenticate('local', { successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true })
);

module.exports = router;
