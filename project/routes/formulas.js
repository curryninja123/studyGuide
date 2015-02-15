var express = require('express');
var router = express.Router();
var userz = require('../models/userz.js');
var structs = require('../models/structs.js');
var mongoose = require('mongoose'), ObjectId = mongoose.Types.ObjectId;

var JSONError = '{ error: true, message: "Unable to fulfill request" }'
var JSONSuccess = '{ error: false, message: "Request fulfilled" }'

router.get('/', function(req, res) {
	res.send("FORMULAS");
});

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

router.get('/make', userz.verify, function(req, res) {
	structs.Subject.find().exec(function(err, result) {
		console.log(result);
		res.render('formula/make', {title: 'Make Formula', subjects: result});
	})
});

router.get('/display/:formulaId', function(req, res) {
	structs.Formula.findById(req.params.formulaId, function(err, formula) {
		if (err) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSONError);
		}
		else {
			res.render('formula/display', {title: 'View Formula', formula: formula});
		}
	});
});

router.post('/create', userz.verifyAdmin, function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	params = {
		formula: req.body.formula,
		title: req.body.title,
		proofs: req.body.proofs,
		examples: req.body.examples,
		history: req.body.history,
		tags: (req.body.tags || "general").split(" "),
		practice: req.body.practice,
	}
	var theFormula = structs.Formula(params);
	theFormula.save(function(err, result) {
		if (err) {
			console.log(err);
			res.render('error', {title: 'Error'});
		}
		else {
			res.redirect('/formula/view/' + result.id.toString());
			subjects = req.body.subjects;
			if (subjects) {
				for (var i = 0; i < subjects.length; i++) {
					structs.Subject.update({name: subjects[i]}, {
						$push: {formulas: result.id},
					});
				}
			}
		}
	});
});

router.post('/update/:formulaId', userz.verifyAdmin, function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	structs.Formula.update({_id: ObjectId(req.params.formulaId)}, { 
		$set: {
			formula: req.body.formula,
			title: req.body.title,
			proofs: req.body.proofs,
			history: req.body.history,
			tags: (req.body.tags || "general").split(" "),
			practice: req.body.practice,
		}
	}, function(err, numAffected) {
		if (err) {
			res.send(JSONError);
		}
		else {
			res.redirect('/formula/view/' + req.params.formulaId);
		}
	});
});

module.exports = router;