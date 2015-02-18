var express = require('express');
var routes = require('./routes/index');
var settings = require('./settings')
var session = require('express-session')
var MongoStore = require('connect-mongo')(session);
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var users = require('./routes/users');
var formulas = require('./routes/formulas');
var app = express();
var helpers = require('express-helpers')(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// session setup
app.use(session({
    secret: settings.cookie_secret,
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
        url: settings.dbURI
    })
}));

// flash
var flash = require('connect-flash');
app.use(flash());
app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success') || [];
    res.locals.error_messages = req.flash('error') || [];
    next();
});

userz = require('./models/userz.js');
app.use(userz.loginvar());

// controller setup
app.use('/', routes);
app.use('/sessions', users);
app.use('/formula', formulas);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            status : err.status || 500
        });
    });
}

var mongoose = require( 'mongoose' );
var dbURI = settings.dbURI;
mongoose.connect(dbURI);
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbURI);
});
mongoose.connection.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('productionError', {
        message: err.message,
        error: {},
        status: ('' + (err.status || 500))
    });
});

module.exports = app;
app.listen(settings.port);
