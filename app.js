const express = require('express');
const app = express();

//setting view engine to pug
app.set('view engine', 'pug');

<<<<<<< Updated upstream
app.get('/', function(req, res) {
  res.render('index');
=======
// mongoose setup
mongoose.connect('mongodb://localhost:27017/test', {useNewUrlParser: true, useUnifiedTopology: true});

// twitter data in mongoose
var twitter = mongoose.model('Tweet', {url: String, location: String, author: String, date: String, text: String});


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/index', indexRouter);
app.use('/users', usersRouter);


app.use("/leaflet", express.static(__dirname + "/node_modules/leaflet/dist"));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/bootstrap', express.static(__dirname + '/node_modules/bootstrap/dist'));

// use scripts, styles in webserver
app.use("/stylesheetpug", express.static(__dirname + '/public/stylesheets/style.css'));
app.use("/leafletscript", express.static(__dirname + '/public/javascripts/leaflet.js'));


app.get('/getdefaultlocation', function(req, res) {
    var location = req.cookies.coords;
    res.send(location);
});
app.get("/", (req, res)=>{res.send("hello world")});
app.get('/setdefaultlocation1/:lat/:lng', function(req, res){
  //res.clearCookie("coords");
  var position = [];
  postion.push(req.params.lat);
  postion.push(req.params.lng);
  res.cookie('coords', postion, {httpOnly: true, secure: true, path:'/'});
  res.send(req.params.lat);
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
>>>>>>> Stashed changes
});


app.listen(3000, () => console.log("app is listening the silence"));
