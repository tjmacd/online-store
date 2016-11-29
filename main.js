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
var productSchema = new Schema({
 	name: String,
	category: String,
 	description: String,
 	image: String,
 	price: Number
}, {collection: 'products'});
var Product = mongoose.model('product', productSchema);

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
	addresses: [addressSchema],
	cart: [productSchema] //Product ids
}, {collection: 'users'});
var User = mongoose.model('user', userSchema);


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

// main page
app.get('/', function(request, response) {
	request.session.returnTo = '/';
	Product.find({}).then(function(results) {
		response.render('main', {title: 'JunkMart', 
								 username: getUsername(request), 
								 products: results});
	})
})

// search
app.post('/search', function(request, response) {
	var query = request.body.query;
	Product.find({$text: {$search: query}}).then(function(results) {
		response.render('main', {title: 'Search results', 
								 username: getUsername(request), 
								 numResults: results.length, 
								 query: query,
								 products: results})
	})
})


// TODO: Product page
app.get('/product/:id', function(request, response) {
	var id = request.params.id;
	Product.find({"_id": mongoose.Types.ObjectId(id)}).then(function(results) {
		if(results.length > 0){
			var product = results[0];
			response.render('product', {title: 'Product', username: getUsername(request), action: '/product/'+id, name: product.name, image: product.image, price: product.price, description: product.description});
		} else {
			response.redirect(request.session.returnTo);
		}
	})
})

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
			if(typeof request.session.returnTo !== "undefined"){
				response.redirect(request.session.returnTo);
			} else {
				response.redirect('/');
			}
		} else {
			response.render('login', {errorMessage: 'Username or password incorrect', username: getUsername(request)});
		}
	})
})

// Logout
app.get('/logout', function(request, response) {
	request.session.username = '';
	request.session.shipTo = '';
	response.redirect('/');
})

// Register page
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
        request.session.returnTo = '/newAddress';
		response.redirect('/login');
	} else {
		response.render('addressForm', {title: 'Add New Address', username: getUsername(request), formLabel: "New Address", action: '/newAddress'});
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
		response.render('addressForm', {errorMessage: 'Please fill all fields marked with *', title: 'Add New Address', username: getUsername(request), formLabel: 'New Address', action: '/newAddress'});
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
						response.redirect(request.session.returnTo);
					}
				})
			} else {
				response.redirect('/login');
			}
		})
	}
})

app.get('/editAddress/:id', function(request, response) {
	var id = request.params.id;
	User.find({"addresses._id": mongoose.Types.ObjectId(id)}, {_id: 0, 'addresses.$': 1}).then(function(results) {
		if(results.length > 0){
			var address = results[0].addresses[0];
			response.render('addressForm', {title: 'Edit Address', username: getUsername(request), formLabel: 'Edit Address', action: '/editAddress/'+id, name: address.name, line1: address.line1, line2: address.line2, city: address.city, province: address.province, postcode: address.postcode, country: address.country, id: address._id});
		} else {
			response.redirect(request.session.returnTo);
		}
	})
})

app.post('/editAddress/:id', function(request, response) {
	var id = request.params.id;
	var name = request.body.name;
	var line1 = request.body.line1;
	var line2 = request.body.line2;
	var city = request.body.city;
	var province = request.body.province;
	var postcode = request.body.postcode;
	var country = request.body.country;
	
	if(name == "" || line1 == "" || city == "" || postcode == "" || country == ""){
		response.render('addressForm', {errorMessage: 'Please fill all fields marked with *', title: 'Edit Address', username: getUsername(request), formLabel: 'Edit Address', action: '/editAddress/'+id});
		response.render('addressForm', {errorMessage: 'Please fill all fields marked with *', title: 'Edit Address', username: getUsername(request), formLabel: 'Edit Address', action: '/editAddress/'+id});
	} else {
		User.update({email: request.session.email, 
					 "addresses._id": mongoose.Types.ObjectId(id)}, 
					{$set: {"addresses.$.name": name,
					   "addresses.$.line1": line1,
					   "addresses.$.line2": line2,
					   "addresses.$.city": city,
					   "addresses.$.province": province,
					   "addresses.$.postcode": postcode,
					   "addresses.$.country": country}}, {multi: false}, 
					function(error, numAffected) {
			if(error || (numAffected.nModified != 1)) {
				response.render('newAddress', {errorMessage: 'Unable to update address', title: 'Add New Address', username: getUsername(request)});
			} else {
				response.redirect('/profile');
			}
		})
		
	}
})

app.get('/deleteAddress/:id', function(request, response) {
	User.update({email: request.session.email},
			   {$pull: {addresses: {_id: mongoose.Types.ObjectId(request.params.id)}}}, {multi: false}, 
			   function(error, numAffected) {
			if(error || (numAffected.nModified != 1)) {
				response.render('profile', {errorMessage: 'Unable to delete address', title: 'Account Profile', username: getUsername(request), addresses: addresses});
			} else {
				response.redirect('/profile');
			}
	})
})

// Shopping cart page
app.get('/cart', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.returnTo = '/cart';
		response.redirect('/login');
	} else {
		User.find({email: request.session.email})
			.then(function(results) {
			if(results.length > 0){
				var cart = results[0].cart;
				response.render('cart', {title: username+"'s Shopping Cart", username: username, products: cart});
			} else {
				response.redirect('/login');
			}
			
		})
		
	}
})

app.get('/addCart/:id', function(request, response) {
	var username = getUsername(request);
    var id = request.params.id;
	if(!username || username === ''){
        request.session.returnTo = '/addCart';
		response.redirect('/login');
	} else {
		User.find({email: request.session.email}).then(function(results) {
			if(results.length > 0){
				var products = results[0].products;
				products.push({name:  mongoose.Types.ObjectId(id).name,
                               category: mongoose.Types.ObjectId(id).category,
                               description: mongoose.Types.ObjectId(id).description,
							   image: mongoose.Types.ObjectId(id).image,
							   price: mongoose.Types.ObjectId(id).price
							   });
				User.update({email: request.session.email}, {addresses: addresses}, {multi: false}, function(error, numAffected) {
					if(error || (numAffected.nModified != 1)) {
						response.render('/main', {errorMessage: 'Unable to add product', title: 'Main', username: getUsername(request)});
					} else {
						response.render('cart', {title: username+"'s Shopping Cart", username: username, products: cart});
					}
				})
        
	}
})

// check out page
app.get('/checkoutShipping', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.returnTo = request.url;
		response.redirect('/login');
	} else {
		
		User.find({email: request.session.email}).then(function(results) {
			var addresses = [];
			if(results.length > 0) {
				addresses = results[0].addresses;
			}
			response.render('checkoutShipping', {title: 'Checkout', username: getUsername(request), addresses: addresses});
		});
	}
})

app.get('/checkoutPayment', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.returnTo = request.url;
		response.redirect('/login');
	} else {
		request.session.shipTo = request.query.shipTo;
		User.find({email: request.session.email}).then(function(results) {
			var addresses = [];
			if(results.length > 0) {
				addresses = results[0].addresses;
			}
			response.render('checkoutPayment', {title: 'Checkout', username: getUsername(request), addresses: addresses});
		});
	}
})

app.post('/confirmOrder', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.returnTo = request.url;
		response.redirect('/login');
	} else {
		var id = request.session.shipTo;
		User.find({"addresses._id": mongoose.Types.ObjectId(id)}, 
				  {_id: 0, 'addresses.$': 1})
			.then(function(results) {
			if(results.length > 0){
				var address = results[0].addresses[0];
				var creditCard = request.body.number.substr(-4, 4);

				User.find({email: request.session.email})
					.then(function(results) {
					if(results.length > 0){
						var cart = results[0].cart;
						var price = 0;
						for(var i=0; i<cart.length; i++){
							price += cart[i].price;
						}
						var shipping = 6.99;
						var tax = price * 0.13;
						var total = price + shipping + tax;
						response.render('confirmOrder', 
										{title: 'Edit Address', 
										 username: getUsername(request), 
										 address: address, 
										 number: creditCard, 
										 price: price, 
										 shipping: shipping,
										 tax: tax, 
										 totalPrice: total});
					} else {
						response.redirect('/');
					}
				})
			} else {
				response.redirect('/');
			}
		})
	}
})

app.post('/orderSuccess', function(request, response) {
	var username = getUsername(request);
	if(!username || username === ''){
        request.session.returnTo = request.url;
		response.redirect('/login');
	} else {
		User.update({email: request.session.email},
			   {cart: []}, {multi: false}, 
			   function(error, numAffected) {
			response.render('orderSuccess', {title: 'Order Complete', username: getUsername(request)});
		})	
	}
})


app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
})