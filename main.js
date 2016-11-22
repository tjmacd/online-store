var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var uuid = require('node-uuid');
var assert = require('assert');
var bcrypt = require('bcrypt-nodejs');

// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

// Session
app.use(session({
	genid: function(request) { return uuid.v4(); },
	resave: false,
	saveUninitialized: false,
	secret: 'sdjiHUHUF&t65$$YIU())Y^T$$R^&^&&^FGGUUGY#$%^754546yffhgjhvffcehfjdyt'
}))

mongoose.connect('localhost:27017/project');
var Schema = mongoose.Schema;
var userSchema = new Schema({
	username: {type: String, unique: true, index: true},
	hashedPassword: String,
	email: String
}, {collection: 'users'});
var User = mongoose.model('user', userSchema);

// view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// TODO: main page
app.get('/', function(request, response) {
	response.render('layout');
})

// TODO: Product page


// TODO: Login page
app.get('/login', function(request, response) {
    response.render('login');
})

app.post('/processLogin', function(request, response) {
  	var username = request.body.username;
	var password = request.body.password;
	
	User.find({username: username}).then(function(results){
		if((results.length > 0) && (bcrypt.compareSync(password, results[0].hashedPassword))) {
			var session = request.session;
			session.username = username;
		} else {
			response.render('login', {errorMessage: 'Username or password incorrect'});
		}
	})
})

// TODO: Register page


// TODO: Shopping cart page


// TODO: check out page



app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
})