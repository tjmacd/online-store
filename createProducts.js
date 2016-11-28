// Run "mongo createProducts.js" at the shell
var db = connect('localhost:27017/project');

db.products.drop();

db.products.insert({name: "Desk lamp", 
					category: "appliances",
					description: "Blue folding arm desk lamp. LED bulb. 4000 lumens. 50 W.",
					image: "big_work table lamp.jpg", 
					price: 34.99});
db.products.insert({name: "Desk chair", 
					category: "furniture",
					description: "Work in style and comfort with this ergonomic desk chair. 225 lb capacity. 3 levers: recline, pitch and yaw.",
					image: "desk_chair.jpg", 
					price: 87.99});
db.products.insert({name: "Supreme King office desk", 
					category: "furniture",
					description: "The Supreme King office desk is perfect for any domineering authority figure. Inspire awe in the hearts of all your underlings. Three drawers!",
					image: "free-desk-01.jpg", 
					price: 49.99});
db.products.ensureIndex({name:"text",
						category:"text",
						description: "text"});


