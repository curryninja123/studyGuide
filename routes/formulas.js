var express = require('express');
var router = express.Router();
var userz = require('../models/userz.js');
var structs = require('../models/structs.js');
var mongoose = require('mongoose'), ObjectId = mongoose.Types.ObjectId;

var JSONError = '{ "error": true, "message": "Unable to fulfill request" }'
var JSONSuccess = '{ "error": false, "message": "Request fulfilled" }'

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
		res.render('formula/make', {
			title: 'Make Formula', 
			subjects: result,
			solver: '',
			formula: '',
			title: '',
			examples: '',
			proofs: '',
			history: '',
			variableDefinitions: '',
			tags: '',
			practice: '',
		});
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

router.post('/profile/add/:formulaId', userz.verify, function(req, res) {
	structs.Formula.findById(req.params.formulaId, function(err, result) {
		if (err || !result || (req.session.user.addedFormulas && req.session.user.addedFormulas.indexOf(req.params.formulaId) > 0)) {
			res.setHeader('Content-Type', 'application/json');
			res.send(JSONError);
		}
		else {
			userz.User.findByIdAndUpdate(req.session.user._id, {
				$addToSet: {
					addedFormulas: req.params.formulaId,
				}
			}).exec(function(err, success) {
				res.setHeader('Content-Type', 'application/json');
				res.send(JSONSuccess);

			});
		}
	});
});

router.post('/create', userz.verify, function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	params = {
		formula: req.body.formula,
		title: req.body.title,
		proofs: req.body.proofs,
		examples: req.body.examples,
		solver: req.body.solver,
		history: req.body.history,
		variableDefinitions: req.body.variableDefinitions,
		tags: (req.body.tags || "general").split(" "),
		practice: req.body.practice,
	}
	var theFormula = structs.Formula(params);
	theFormula.save(function(err, result) {
		if (err) {
			console.log(err);
			res.render('productionError', {status: 500});
		}
		else {
			subjects = req.body.subjects;
			if (subjects && typeof(subjects) == "string") {
				structs.Subject.findOneAndUpdate({name: subjects}, {
					$addToSet: {formulas: ObjectId(result.id)},
				}).exec(function(err, numModified) {
					if (err) {console.log(err);} 
					else {console.log("Success " + numModified);}
				});
			}
			else if (subjects) {
				for (var i = 0; i < subjects.length; i++) {
					console.log(i);
					structs.Subject.findOneAndUpdate({name: subjects[i]}, {
						$push: {formulas: result.id},
					}).exec(function(err, numModified) {
						if (err) {console.log(err);} 
						else {console.log("Success " + numModified);}
					});
				}
			}
			res.redirect('/formula/view/' + result.id.toString());
		}
	});
});

router.get('/categories', function(req, res) {
	structs.Category.find().populate('subjects').exec(function(err, result) {
		res.render('formula/displayCategories', {title: "Categories", categories: result});
	});
});

router.get('/subject/:name', function(req, res) {
	structs.Subject.findOne({name: req.params.name}).populate('formulas').exec(function(err, result) {
		if (err || !result) {
			console.log(err);
			res.render('Error', {message: "Error", error: {status: "500", stack: "Denied"}});
		}
		else {
			res.render('formula/subjectListing', {title: result.name, subject: result});
		}
	});
});

router.get('/edit/:formulaId', userz.verify, function(req, res) {
	structs.Formula.findById(req.params.formulaId, function(err, formula) {
		structs.Subject.find().exec(function(err, result) {
			res.render('formula/make', {
				title: 'Make Formula', 
				subjects: result,
				solver: formula.solver || '',
				formula: formula.formula,
				title: formula.title,
				examples: formula.examples,
				proofs: formula.proofs,
				history: formula.history,
				variableDefinitions: formula.variableDefinitions,
				tags: formula.tags.join(" "),
				practice: formula.practice
			});
		});
	});
});

router.post('/update/:formulaId', userz.verify, function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	structs.Formula.update({_id: ObjectId(req.params.formulaId)}, { 
		$set: {
			formula: req.body.formula,
			title: req.body.title,
			examples: req.body.examples,
			proofs: req.body.proofs,
			solver: req.body.solver,
			history: req.body.history,
			variableDefinitions: req.body.variableDefinitions,
			tags: (req.body.tags || "general").split(" "),
			practice: req.body.practice,
		}
	}, function(err, numAffected) {
		if (err) {
			res.send(JSONError);
		}
		else {
			res.redirect('/formula/display/' + req.params.formulaId);
		}
	});
});

module.exports = router;