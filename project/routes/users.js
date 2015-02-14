var express = require('express');
var router = express.Router();
var userz = require('../models/userz.js');
var CryptoJS = require('crypto-js');

function genSalt() {
	return CryptoJS.lib.WordArray.random(256/8);
}
function pbd(password, salt, iterations, callback) {
   var maxIterations = 500;
   if (iterations < 500) {
   	for (var i = 0; i < iterations; i++) {
   	 	password = CryptoJS.SHA3(password + salt,
   	 		{outputLength: 384});
   	}
   	callback(password.toString(CryptoJS.enc.Base64));
   }
   else {
   	 for (var i = 0; i < 500; i++) {
   	 	password = CryptoJS.SHA3(password + salt,
   	 		{outputLength: 384});
   	 }
   	 process.nextTick(function(err) {
   	 	pbd(password, salt, iterations - 500, callback);
   	 })
   }
}

router.get('/this', function(req, res) {
	if (!req.query.salt)
		res.send(genSalt().toString(CryptoJS.enc.Base64));
	else {
		var pw = req.query.password || "password"
		pbd(pw, req.query.salt, 10000, function(result) {
			res.send("PBD" + result);
		});
	}
	// password: whichaneesh
	// salt: cOetkE8+k4svlnCEQxvVtUxKV/a28YTmK4/fqJQWyYM=
	// hash: EwUe7ZLx7y02nTakvca8FhbcSekrSAE6ms2SSKwjLcFzD4Dwy2yRUQn8pMOdQVX1
});

router.get('/createadmin', function(req, res) {
	userz.User.where({'email': 'admin'}).count(function(err, count) {
		console.log("COUNT" + count);
		if (!err && count == 0) {
			var admin = new userz.User({
				firstname: 'Admin',
				lastname: 'User',
				email: 'admin',
				hash: 'GZQSxHhcqdcS/f3gLpsfViuNCW+q67Z1VH94eJxHVDo1L0E1pYhfNaaSxi8gxXtT',
				salt: 'cOetkE8+k4svlnCEQxvVtUxKV/a28YTmK4/fqJQWyYM=',
				isAdmin: true
			});
			admin.save(function(err) {
				if (err)
					req.flash("error in creation")
				else
					req.flash("success", "Admin created");
				res.redirect("/");
			});
		}
		else {
			req.flash("error", "Admin already exists");
			res.redirect("/");
		}
	});
});

router.get('/signup', function(req, res) {
	res.render('users/signup', {title: 'Sign Up', robo: true});
});

router.post('/new', function(req, res) {
	console.log(res.body);
	userz.register(req, res, {});
});

router.get('/login', function(req, res) {
	res.render('users/login', {title: 'Log In', robo: true});
});

router.post('/session/new', function(req, res) {
	params = {
		'email': req.body.email || 'xx',
		'password': req.body.password || 'xx'
	};
	userz.authenticate(params.email, params.password, function(user) {
		if (!user) {
			req.flash('error', 'Invalid Credentials');
			res.redirect('/users/login');
		}
		else {
			req.session.user = user;
			res.redirect('/users/welcome');
		}
	});
});

router.get('/welcome', userz.verify, function(req, res) {
	res.render('users/welcome', {title: 'Welcome!', headerImage: '/images/mojave.jpg'});
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
