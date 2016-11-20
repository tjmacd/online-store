var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));

app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// TODO: main page
app.get('/', function(request, response) {
	response.send('Hello, world!');
})

// TODO: Product page


// TODO: Login page


// TODO: Register page


// TODO: Shopping cart page


// TODO: check out page



app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function() {
	console.log('Listening on port ' + app.get('port'));
})