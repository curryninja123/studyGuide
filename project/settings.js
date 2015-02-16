
if (process.env.NODE_ENV == 'development') {
	module.exports.dbURI = 'mongodb://localhost/studyguide';
	module.exports.dbName = 'studyguide';
	module.exports.dbPort = 27017;
	module.exports.dbHost = 'localhost';
	module.exports.cookie_secret = '3vmw3rqdieLI40ZNlJD2heC3zRFWJjwHAeANbxLVXcVzW18SelUogU0G0zcHidk8v';
	module.exports.port = 8000;
}
else {
	module.exports.dbName = 'studyguide';
	module.exports.dbPort = 63870;
	module.exports.dbHost = 'ds063870.mongolab.com';
	module.exports.dbUsername = process.env['DATABASE_USERNAME'];
	module.exports.dbPassword = process.env['DATABASE_PASSWORD'];
	module.exports.dbURI = 'mongodb://' + 
				module.exports.dbUsername + ':' + 
				module.exports.dbPassword + '@' + 
				module.exports.dbHost + ':' +
				module.exports.dbPort + '/' +
				module.exports.dbName;
	module.exports.cookie_secret = process.env['SECRET_COOKIE'];
	module.exports.port = 8000;
}