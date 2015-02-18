var express = require('express');
var router = express.Router();
var userz = require('../models/userz.js');
var structs = require('../models/structs.js');
var mongoose = require('mongoose'), ObjectId = mongoose.Types.ObjectId;

var JSONError = '{ error: true, message: "Unable to fulfill request" }'
var JSONSuccess = '{ error: false, message: "Request fulfilled" }'

router.get("/newgroup", function(req, res) {
	res.render("group/newgroup");
});

router.post('/create', userz.verify, function(req, res) {
	var params = {
		name: req.body.name,
		password: req.body.password,
		users: [ObjectId(req.session.user._id)],
		articles: [],
		messageBoard: []
	}
	var newGroup = structs.Group(params);
	newGroup.save(function(err, group) {
		if (err || !group) {
			res.send("ERROR");
		}
		else {
			userz.User.findByIdAndUpdate(req.session.user._id, {
				$addToSet: {'groups': group.id}
			}, function(err, user) {
				res.redirect('/view/:groupId');
			});
			// TODO
		}
	})
});

module.exports = router;
