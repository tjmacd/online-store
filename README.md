# CSCI3230proj

Online shopping application

## Setup Instructions
- Requires node, and mongodb
- Steps:
	- Start mongo service
	- run 'mongo createProducts.js'
	- run 'node main.js'
	- connect to 'localhost:3000/'
- There are no users to start off with, but they can be added using 'register now' from the login page

## Outline
### Database **(done)**
- Stores table of products. Each product has:
  - name
  - category
  - description
  - price
  - ~~keywords~~
  - image
  - ~~comments?~~
  
### All pages
- Logo **(done)**
- Navigation bar **(done)**
- Login/Logout button **(done)**
- Search bar **(done)**
- Bottom banner thingy with legal and social media stuff
 
### Main page **(done)**
- Displays various products showing image and price **(done)**
- ~~Side nav bar for categories~~

### Product page
- Shows large image of product
- Extra images option
- Description
- price
- Add to cart button (links to login if not logged in then adds after logged in)
- ~~Review section displaying reviews and form~~
  - ~~must be logged in to leave review~~
  
### Log in page **(done)**
- Asks for username and password **(done)**
- on submit may redirect to different pages **(done)**

### Profile page **(done)**
- Displays address book - all addresses associated with user
  - Add new address **(done)**
  - edit address **(done)**
  - delete address **(done)**

### Create new account page **(done)**
- Asks for username (checks availabity) **(done)**
- Asks for password (2nd box to confirm password) **(done)**

### shopping cart page
- must be logged in to view
- Shows all items in users cart (associated with account)
  - small image, name and price
- Total cost
- tax
- button to check out

### check out page **(done)**
- asks for billing address **(done)**
- shipping address **(done)**
- credit card info **(done)**
- all above can be stored with user account as prefered options **(done)**
- after submit, asks customer to confirm all details including total price **(done)**

### formatting
- should display well on both desktop and mobile
