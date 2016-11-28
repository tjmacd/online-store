$(document).ready(function() {
	console.log("I am here");
	var date = new Date();
	var year = date.getFullYear();
  	for(var i=1; i<= 12; i++){
	  	$('#month').append('<option value="'+i+'">'+i+'</option>');
  	}
 	for(var i=0; i<=20; i++){
		var y = year+i;
		$('#year').append('<option value="'+y+'">'+y+'</option>')
	}
})