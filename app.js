const express = require('express');
const app = express();


//setting view engine to pug
app.set('view engine', 'pug');

// files from packages needed
app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

// use scripts, styles in webserver
app.use("/stylesheetpug", express.static(__dirname + '/style/stylesheetpug.css'));
app.use("/leafletscript", express.static(__dirname + '/Scripts/leaflet.js'));

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/main', function(req, res) {
  res.render('initmap');
});





app.listen(3000, () => console.log("app is listening the silence"));
