var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

app.route('/v1/helloworld').get(function(req, res) {
  console.log("saying hello!");

  res.json({
    hello: "world",
  });
});

app.listen(port);

console.log("My Visa Angel API started on port " + port);
