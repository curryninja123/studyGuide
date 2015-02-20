var express = require('express');
var router = express.Router();
var userz = require('../models/userz');

/* GET home page. */
router.get('/', function(req, res) {
    res.render('index', {
        title: 'Study Guide'
    });
});

router.get('/profile', function(req, res) {
    userz.User.findById(req.session.user._id).populate('addedFormulas').exec(function(err, user) {
        console.log(user + " " + err);
        res.render('profile/profile', {
            user: user,
            title: 'Profile',
            changeAvailable: req.session.user.username.indexOf('DEFAULT') === 0
        });
    });
});

module.exports = router;
