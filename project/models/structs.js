var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var formulaSchema = new Schema({
	formula: String,
	examples: String,
	proofs: String,
	title: String,
	history: String,
	variableDefinitions: String,
	tags: [String],
	practice: String
});

var categorySchema = new Schema({
	name: {type: String, unique: true},
	subcategories: [{type: Schema.Types.ObjectId, ref: 'Category'}],
	subjects: [{type: Schema.Types.ObjectId, ref: 'Subject'}]
});

var subjectSchema = new Schema({
	name: {type: String, unique: true},
	formulas: [{type: Schema.Types.ObjectId, ref: 'Formula'}],
	tags: [String]
});

var groupSchema = new Schema({
	name: String,
	password: String,
	users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	articles: [String],
	messageBoard: [{
		content: String,
		sender: {type: Schema.Types.ObjectId, ref: 'User'},
		sent: Date
	}]
});

exports.Formula = mongoose.model('Formula', formulaSchema);
exports.Subject = mongoose.model('Subject', subjectSchema);
exports.Group = mongoose.model('Group', groupSchema);
exports.Category = mongoose.model('Category', categorySchema);
