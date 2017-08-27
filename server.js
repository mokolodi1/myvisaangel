var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

app.route('/v1/helloworld').get(function(req, res) {
  console.log("saying hello!");

  res.json({
    hello: "world",
  });
});

app.route('/v1/visa_type').get(function(req, res) {
  console.log("Someone's requesting information!");

  console.log("req:", req);
  console.log("Object.keys(req):", Object.keys(req));

  res.json({
    such: "wow"
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
