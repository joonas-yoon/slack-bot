var express = require('express');
var bodyParser = require('body-parser');

var problem_bot = require('./problem');
var recommend_bot = require('./recommend');
// var rank_bot = require('./rank');
  
var app = express();
var port = process.env.PORT || 3000;

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

// test route
app.get('/', function (req, res) { res.status(200).send('Hello world!') });

app.post('/problem', problem_bot);
app.post('/recommend', recommend_bot);
// app.post('/rank', rank_bot);
app.get('/log', function (req, res) {
  var fileSystem = require('fs');
  var path = require('path');
  var filePath = path.join(__dirname, 'app.log');
  var readStream = fileSystem.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(res);
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(400).send(err.message);
});

app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});

process.on('uncaughtException', function(err) {
  console.log('uncaughtException: ' + err);
});