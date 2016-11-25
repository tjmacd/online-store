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
var addressSchema = new Schema({
	name: String,
	line1: String,
	line2: String,
	city: String,
	province: String,
	postcode: String,
	country: String
})
var userSchema = new Schema({
	email: {type: String, unique: true, index: true},
	hashedPassword: String,
	firstname: String,
	lastname: String,
	addresses: [addressSchema]
}, {collection: 'users'});
var User = mongoose.model('user', userSchema);

var productSchema = new Schema({
  sid: {type: String, unique: true, index: true},
  name: String,
  description: String,
  image: String,
  price: float
}, {collection: 'products'});
var Product = mongoose.model('user', productSchema);

// view engine
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Helper functions
function getUsername(request) {
	var username = '';
	var session = request.session;
	if (session.username) {
		username = session.username;
	}
	return username;
}

// TODO: main page
app.get('/', function(request, response) {
	request.session.returnTo = '/';
	response.render('layout', {title: 'JunkMart', username: getUsername(request)});
})

// TODO: search
app.post('/search', function(request, response) {
	
})


// TODO: Product page


// Login
app.get('/login', function(request, response) {
    response.render('login', {title: 'Log In', username: getUsername(request)});
})

app.post('/login', function(request, response) {
  	var email = request.body.email;
	var password = request.body.password;
	
	User.find({email: email}).then(function(results){
		if((results.length > 0) && (bcrypt.compareSync(password, results[0].hashedPassword))) {
			var session = request.session;
			session.username = results[0].firstname;
			session.email = results[0].email;
			response.redirect(request.session.returnTo);
		} else {
			response.render('login', {errorMessage: 'Username or password incorrect', username: getUsername(request)});
		}
	})
})

// Logout
app.get('/logout', function(request, response) {
	request.session.username = '';
	response.redirect('/');
})

// TODO: Register page
app.get('/register', function(request, response) {
	response.render('register', {title: 'Account Creation', username: getUsername(request)});
})

app.post('/register', function(request, response) {
	var firstname = request.body.firstname;
	var lastname = request.body.lastname;
	var email = request.body.email;
	var password = request.body.password;
	var confirmPassword = request.body.confirmPassword;
	
	if(firstname == "" || lastname == "" || email == "" || password == "" || confirmPassword == ""){
		response.render('register', {errorMessage: 'All fields must be filled!', title: 'Account Creation', username: getUsername(request)});
	} else if (password != confirmPassword) {
		response.render('register', {errorMessage: 'Passwords must match!', title: 'Account Creation', username: getUsername(request)});
	} else {
		User.find({email: email}).then(function(results) {
			if(results.length > 0){
				response.render('register', {errorMessage: 'An account with this email address already exists.', title: 'Account Creation', username: getUsername(request)});
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
						response.render('register', {title: 'Account Creation', errorMessage: 'Unable to register', username: getUsername(request)});
					} else {
						response.render('registerSuccess', {title: 'Registration Successful', firstname: firstname, username: getUsername(request)});
					}
				})
			}
		})
	}
})

// Profile
app.get('/profile', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.returnTo = '/profile';
		response.redirect('/login');
	} else {
		
		User.find({email: request.session.email}).then(function(results) {
			var addresses = [];
			if(results.length > 0) {
				addresses = results[0].addresses;
			}
			response.render('profile', {title: 'Account Profile', username: getUsername(request), addresses: addresses});
		});
		
	}
})

app.get('/newAddress', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.redirectTo = '/newAddress';
		response.redirect('/login');
	} else {
		response.render('newAddress', {title: 'Add New Address', username: getUsername(request)});
	}
})

app.post('/newAddress', function(request, response) {
	var name = request.body.name;
	var line1 = request.body.line1;
	var line2 = request.body.line2;
	var city = request.body.city;
	var province = request.body.province;
	var postcode = request.body.postcode;
	var country = request.body.country;
	
	if(name == "" || line1 == "" || city == "" || postcode == "" || country == ""){
		response.render('newAddress', {errorMessage: 'Please fill all fields marked with *', title: 'Add New Address', username: getUsername(request)});
	} else {
		User.find({email: request.session.email}).then(function(results) {
			if(results.length > 0){
				var addresses = results[0].addresses;
				addresses.push({name: name,
							   line1: line1,
							   line2: line2,
							   city: city,
							   province: province,
							   postcode: postcode,
							   country: country});
				User.update({email: request.session.email}, {addresses: addresses}, {multi: false}, function(error, numAffected) {
					if(error || (numAffected.nModified != 1)) {
						response.render('newAddress', {errorMessage: 'Unable to add address', title: 'Add New Address', username: getUsername(request)});
					} else {
						response.redirect('/profile')
					}
				})
			} else {
				response.redirect('/login');
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
