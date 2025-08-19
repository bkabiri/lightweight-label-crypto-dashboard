//= link_tree ../images
//= link_tree ../builds
//= link application.css

// Importmap JS (serve files from app/javascript and vendor/javascript)
//// This is what lets /assets/controllers/application.js be served in prod.
//// Keep BOTH lines:
 //= link_tree ../../javascript .js
 //= link_tree ../../../vendor/javascript .js