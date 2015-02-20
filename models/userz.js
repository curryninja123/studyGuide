var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CryptoJS = require('crypto-js');
var querystring = require('querystring');

function genSalt() {
    return CryptoJS.lib.WordArray.random(256 / 8);
}

function pbd(password, salt, iterations, callback) {
    var maxIterations = 900;
    if (iterations < maxIterations) {
        for (var i = 0; i < iterations; i++) {
            password = CryptoJS.SHA3(password + salt, {
                outputLength: 384
            });
        }
        callback(password.toString(CryptoJS.enc.Base64));
    } else {
        for (var j = 0; j < maxIterations; j++) {
            password = CryptoJS.SHA3(password + salt, {
                outputLength: 384
            });
        }
        process.nextTick(function(err) {
            pbd(password, salt, iterations - maxIterations, callback);
        });
    }
}

var userSchema = new Schema({
    firstname: String,
    lastname: String,
    email: {
        type: String,
        unique: true
    },
    username: {
        type: String,
        default: "DEFAULT"
    },
    hash: String,
    salt: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    addedFormulas: [{
        type: Schema.Types.ObjectId,
        ref: 'Formula'
    }],
    groups: [Schema.Types.ObjectId],
});

var User = mongoose.model('User', userSchema);

exports.User = User;

exports.createUser = function(firstname, lastname, email, username, password, callback) {
    var salt = genSalt().toString(CryptoJS.enc.Base64);
    pbd(password, salt, 10000, function(result) {
        var user = new User({
            firstname: firstname,
            username: username,
            lastname: lastname,
            email: email,
            hash: result,
            salt: salt
        });
        user.save(function(err) {
            if (err) {
                console.log("Error in saving user");
            }
            callback(user);
        });
    });
};

exports.authenticate = function(email, password, callback) {
    User.findOne({
        email: email
    }, function(err, user) {
        if (err || !user) {
            console.log("error");
            callback(null);
        } else {
            pbd(password || " ", user.salt, 10000, function(result) {
                if (result == user.hash)
                    callback(user);
                else {
                    callback(null);
                }
            });
        }
    });
};

exports.register = function(req, res, options) {
    options = options || {};
    emailField = options.emailField || 'email';
    passwordField = options.passwordField || 'password';
    firstnameField = options.firstnameField || 'firstname';
    lastnameField = options.lastnameField || 'lastname';
    usernameField = options.usernameField || 'username';
    passwordConfirmationField = options.passwordConfirmationField || 'password_confirmation';
    params = {
        email: req.body[emailField],
        firstname: req.body[firstnameField],
        lastname: req.body[lastnameField],
        username: req.body[usernameField],
        password: req.body[passwordField],
        passwordConfirmation: req.body[passwordConfirmationField]
    };
    var wasError = false;
    var emailRegex = /^.+@.+\.[a-zA-Z]{2,8}$/;
    var passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,64}$/;
    var nameRegex = /^[A-Za-z]{1,64}$/;
    if (!emailRegex.test(params.email)) {
        wasError = true;
        req.flash('error', 'Invalid Email');
    }
	if (!params.username || params.username.length < 6) {
		wasError = true;
		req.flash('error', 'Username must be at least six characters');
	}
    if (!passwordRegex.test(params.password)) {
        wasError = true;
        req.flash('error', 'Password invalid or too weak. ' +
            'Make sure it is at least 8 characters with one number,' +
            ' one uppercase letter, and one lowercase letter');
    }
    if (!(nameRegex.test(params.firstname) && nameRegex.test(params.lastname))) {
        wasError = true;
        req.flash('error', 'First name and Last name are required and should be alphanumeric');
    }
    if (params.password != params.passwordConfirmation) {
        wasError = true;
        req.flash('error', 'Password must match confirmation');
    }
    User.where({
        'email': params.email
    }).count(function(err, count) {
        if (err)
            console.log(err);
        else if (count > 0) {
            wasError = true;
            req.flash('error', 'Email must be unique');
        }
        failurePath = options.failurePath || '/users/signup';
        successPath = options.successPath || '/users/welcome';
        User.where({
            'username': params.username
        }).count(function(err, count) {
			if (err) {
				console.log(err);
			}
			else if (count > 0) {
				wasError = true;
				req.flash('error', 'Username must be unique');
			}
            if (wasError) {
                res.redirect(failurePath + '?' + querystring.stringify(params));
            } else {
                exports.createUser(params.firstname, params.lastname,
                    params.email, params.username, params.password,
                    function(user) {
                        req.session.user = user;
                        req.flash('success', 'Welcome to your new account, ' + user.firstname);
                        res.redirect(successPath);
                    });
            }
        });
    });
};

// Middleware
exports.loginvar = function() {
    return function(req, res, next) {
        if (req.session.user) {
            if (req.session.user.isAdmin)
                res.locals.isAdmin = true;
            res.locals.loggedIn = true;
            res.locals.user = req.session.user;
        } else {
            res.locals.isAdmin = false;
            res.locals.loggedIn = false;
        }
        next();
    };
};

exports.verify = function(req, res, next) {
    if (req.session.user) {
        res.locals.user = req.session.user;
        next();
    } else {
        req.flash("error", 'You must be logged in to access this page');
        res.redirect("/sessions/login");
    }
};

exports.verifyAdmin = function(req, res, next) {
    exports.verify(req, res, function() {
        if (req.session.user.isAdmin)
            next();
        else
            res.send(403);
    });
};
