var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

app.route('/v1/helloworld').get(function(req, res) {
  console.log("saying hello!");

  res.json({
    hello: "world",
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
