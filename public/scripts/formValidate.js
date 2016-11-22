function validateForm() {
	var password = document.forms["registerForm"]["password"].value;
	var confirmPassword = document.forms["registerForm"]["confirmPassword"].value;
	
	if(password != confirmPassword){
		var message = document.createElement('div');
		message.innerHTML = 'Passwords must match!';
		var box = document.getElementById('confirmDiv');
		box.appendChild(message);
		return false;
	}
}