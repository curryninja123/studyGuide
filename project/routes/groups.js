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

module.exports = router;