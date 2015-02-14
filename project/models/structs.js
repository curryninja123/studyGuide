var formulaSchema = new Schema({
	formula: String,
	examples: String,
	proofs: String,
	history: String,
	tag: String,
	practice: String
});

var subjectSchema = new Schema({
	name: String,
	formula: [Schema.Types.ObjectId],
	tags: [String]
})

var groupSchema = new Schema({
	users: [Schema.Types.ObjectId],
	articles: [Schema.Types.ObjectId]
})