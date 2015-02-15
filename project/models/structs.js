var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var formulaSchema = new Schema({
	formula: String,
	examples: String,
	proofs: String,
	title: String,
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
	name: String,
	users: [Schema.Types.ObjectId],
	articles: [Schema.Types.ObjectId],
	messageBoard: [{
		content: String,
		sender: Schema.Types.ObjectId,
		sent: Date
	}]
});

exports.Formula = mongoose.model('Formula', formulaSchema);
exports.Subject = mongoose.model('Subject', subjectSchema);
exports.Group = mongoose.model('Group', groupSchema);
