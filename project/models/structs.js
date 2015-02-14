var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var formulaSchema = new Schema({
	formula: String,
	examples: String,
	proofs: String,
	history: String,
	tags: [String],
	practice: String
});

var subjectSchema = new Schema({
	name: {type: String, unique: true},
	formula: [Schema.Types.ObjectId],
	tags: [String]
});

var groupSchema = new Schema({
	users: [Schema.Types.ObjectId],
	articles: [Schema.Types.ObjectId]
});

exports.Formula = mongoose.model('Formula', formulaSchema);
exports.Subject = mongoose.model('Subject', subjectSchema);
exports.Group = mongoose.model('Group', groupSchema);
