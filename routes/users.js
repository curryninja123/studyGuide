var express = require('express');
var router = express.Router();
var userz = require('../models/userz.js');
var structs = require('../models/structs.js');
var CryptoJS = require('crypto-js');
var querystring = require('querystring');

function genSalt() {
    return CryptoJS.lib.WordArray.random(256 / 8);
}

function pbd(password, salt, iterations, callback) {
    var maxIterations = 500;
    if (iterations < 500) {
        for (var i = 0; i < iterations; i++) {
            password = CryptoJS.SHA3(password + salt, {
                outputLength: 384
            });
        }
        callback(password.toString(CryptoJS.enc.Base64));
    } else {
        for (var j = 0; j < 500; j++) {
            password = CryptoJS.SHA3(password + salt, {
                outputLength: 384
            });
        }
        process.nextTick(function(err) {
            pbd(password, salt, iterations - 500, callback);
        });
    }
}

router.get('/this', function(req, res) {
    if (!req.query.salt)
        res.send(genSalt().toString(CryptoJS.enc.Base64));
    else {
        var pw = req.query.password || "password";
        pbd(pw, req.query.salt, 10000, function(result) {
            res.send("PBD" + result);
        });
    }
    // password: whichaneesh
    // salt: cOetkE8+k4svlnCEQxvVtUxKV/a28YTmK4/fqJQWyYM=
    // hash: EwUe7ZLx7y02nTakvca8FhbcSekrSAE6ms2SSKwjLcFzD4Dwy2yRUQn8pMOdQVX1
});

router.get('/createadmin', function(req, res) {
    userz.User.where({
        'email': 'admin'
    }).count(function(err, count) {
        console.log("COUNT" + count);
        if (!err && count === 0) {
            var admin = new userz.User({
                firstname: 'Admin',
                lastname: 'User',
                email: 'admin',
                username: 'admin',
                hash: 'GZQSxHhcqdcS/f3gLpsfViuNCW+q67Z1VH94eJxHVDo1L0E1pYhfNaaSxi8gxXtT',
                salt: 'cOetkE8+k4svlnCEQxvVtUxKV/a28YTmK4/fqJQWyYM=',
                isAdmin: true
            });
            admin.save(function(err) {
                if (err)
                    req.flash("error in creation");
                else
                    req.flash("success", "Admin created");
                res.redirect("/");
            });
        } else {
            req.flash("error", "Admin already exists");
            res.redirect("/");
        }
    });
});

router.get('/signup', function(req, res) {
    params = {
        firstname: req.query.firstname || '',
        lastname: req.query.lastname || '',
        email: req.query.email || '',
        username: req.query.username || '',
        title: 'Sign Up'
    };
    res.render('users/signup', params);
});

router.post('/new', function(req, res) {
    console.log(res.body);
    userz.register(req, res, {
        successPath: '/sessions/welcome',
        failurePath: '/sessions/signup'
    });
});

router.get('/login', function(req, res) {
    res.render('users/login', {
        title: 'Log In',
        robo: true
    });
});

router.post('/session/new', function(req, res) {
    params = {
        'email': req.body.email || 'xx',
        'password': req.body.password || 'xx'
    };
    userz.authenticate(params.email, params.password, function(user) {
        if (!user) {
            req.flash('error', 'Invalid Credentials');
            res.redirect('/sessions/login');
        } else {
            req.session.user = user;
            req.flash('success', user.firstname + ', you have been logged in');
            res.redirect('/sessions/welcome');
        }
    });
});

router.get('/welcome', userz.verify, function(req, res) {
    structs.Category.find().populate('subjects').exec(function(err, result) {
        res.render('users/welcome', {
            title: 'Welcome!',
            headerImage: '/images/mojave.jpg',
            categories: result
        });
    });
});

router.get('/migrateusers', userz.verifyAdmin, function(req, res) {
    userz.User.find().exec(function(err, users) {
        users.forEach(function(user) {
            if (!user.isAdmin && user.username.indexOf("DEFAULT") === 0) {
                if (user.username.length == 7) {
                    userz.User.findByIdAndUpdate(user.id, {
                        $set: {
                            username: user.username + user.id
                        }
                    }).exec(function(err, user) {
                        if (err) {
                            console.log(err);
                        }
                    });
                }
            }
        });
    });
    req.flash('success', 'Users have been migrated');
    res.redirect('/sessions/welcome');
});

router.get('/fixusername', userz.verify, function(req, res) {
    if (req.session.user.username.indexOf('DEFAULT') !== 0) {
        req.flash('error', 'Your username cannot be changed');
        res.redirect('/');
    } else {
        params = {
            title: 'Modify Username',
            username: req.query.username || ''
        }
        res.render('users/fixusername', params);
    }
});

router.post('/fixusername', userz.verify, function(req, res) {
    if (req.session.user.username.indexOf('DEFAULT') !== 0) {
        req.flash('error', 'Your username cannot be changed');
        res.redirect('/');
    } else {
        wasError = false;
        if (!req.body.username || req.body.username.length < 6) {
            wasError = true;
            req.flash('error', 'Username must be at least six characters');
        }
        userz.User.where({
            username: req.body.username
        }).count(function(err, count) {
            if (count >= 1) {
                wasError = true;
                req.flash('error', 'Username is not unique');
            }
            if (wasError) {
                res.redirect('/sessions/fixusername?' + querystring.stringify({
                    username: req.body.username
                }));
            } else {
                console.log(req.body.username);
                userz.User.findOneAndUpdate({
                    email: req.session.user.email
                }, {
                    $set: {
                        username: req.body.username
                    }
                }).exec(function(err, user) {
                    console.log(user);
                    req.session.user = user;
                    res.locals.user = user;
                    req.flash('success', 'You have changed your username');
                    res.redirect('/sessions/welcome');
                });
            }
        });
    }
});

router.post('/api/usernamecheck', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    userz.User.where({
        username: req.body.username
    }).count(function(err, count) {
        if (count >= 1) {
            res.send('{ "isValid" : false }');
        } else {
            res.send('{ "isValid" : true }');
        }
    });
});

router.get('/logout', function(req, res) {
    req.session.regenerate(function(err) {
        req.flash('success', 'You have been logged out');
        res.redirect('/');
    });
});

/* GET users listing. */
router.get('/', function(req, res) {
    res.send('respond with a resource' + genSalt());
});


module.exports = router;