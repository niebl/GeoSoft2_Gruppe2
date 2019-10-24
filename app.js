const express = require('express');
const app = express();

//setting view engine to pug
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  res.render('index');
});


app.listen(3000, () => console.log("app is listening the silence"));
