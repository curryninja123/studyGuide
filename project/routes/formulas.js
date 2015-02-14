var express = require('express');
var router = express.Router();
var userz = require('../models/userz.js');
var structs = require('../models/structs.js');

var JSONError = '{ error: true, message: "Unable to fulfill request" }'
var JSONSuccess = '{ error: false, message: "Request fulfilled" }'

router.get('/view/:formulaId', function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	structs.Formula.findById(req.params.formulaId, function(err, formula) {
		if (err) {
			res.send(JSONError);
		}
		else {
			res.send(formula);
		}
	});
});

router.post('/create', userz/verifyAdmin, function(req, res) {

});

router.post('/update/:formulaId', userz.verifyAdmin, function(req, res) {
	structs.Formula.findById(req.params.formulaId, function(err, formula) {
		if (err) {
			res.send(JSONError);
		}
		else {
			res.send('');
		}
	});
});