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
	email: {type: String, unique: true, index: true},
	hashedPassword: String,
	firstname: String,
	lastname: String
}, {collection: 'users'});
var User = mongoose.model('user', userSchema);

// view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Helper functions



// TODO: main page
app.get('/', function(request, response) {
	response.render('layout');
})

// TODO: search
app.post('/search', function(request, response) {
	
})


// TODO: Product page


// TODO: Login page
app.get('/login', function(request, response) {
    response.render('login', {title: 'Log In'});
})

app.post('/login', function(request, response) {
  	var email = request.body.email;
	var password = request.body.password;
	
	User.find({email: email}).then(function(results){
		if((results.length > 0) && (bcrypt.compareSync(password, results[0].hashedPassword))) {
			var session = request.session;
			session.username = email;
			response.redirect('/');
		} else {
			response.render('login', {errorMessage: 'Username or password incorrect'});
		}
	})
})

// TODO: Register page
app.get('/register', function(request, response) {
	response.render('register', {title: 'Account Creation'});
})

app.post('/register', function(request, response) {
	var firstname = request.body.firstname;
	var lastname = request.body.lastname;
	var email = request.body.email;
	var password = request.body.password;
	var confirmPassword = request.body.confirmPassword;
	
	if(firstname == "" || lastname == "" || email == "" || password == "" || confirmPassword == ""){
		response.render('register', {errorMessage: 'All fields must be filled!'});
	} else if (password != confirmPassword) {
		response.render('register', {errorMessage: 'Passwords must match!'});
	} else {
		User.find({email: email}).then(function(results) {
			if(results.length > 0){
				response.render('register', {errorMessage: 'An account with this email address already exists.'});
			} else {
				var hash = bcrypt.hashSync(password);
				var newUser = new User({email: email,
										hashedPassword: hash,
										firstname: firstname,
										lastname: lastname});
				console.log(newUser);
				newUser.save(function(error) {
					if(error) {
						console.log(error);
						response.render('register', {errorMessage: 'Unable to register'});
					} else {
						response.render('registerSuccess', {firstname: firstname});
					}
				})
			}
		})
	}
	
})

// TODO: Shopping cart page


// TODO: check out page



app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
})