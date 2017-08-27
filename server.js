"use strict"

var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

app.route('/v1/helloworld').get(function(req, res) {
  console.log("saying hello!");

  res.json({
    hello: "world",
  });
});

/*
 * All of the stuff about the request to the website is
 * stored in the variable req, so don't hesitate to poke
 * around inside it to see what's there:
 * console.log(req). You'll find a lot of useful
 * information online about how routes work if you Google
 * "express node routes".
 */
app.route('/v1/calculate_sum').get(function(req, res) {
  console.log("Someone's requesting information!");
  console.log("req.query:", req.query);

  var first = parseInt(req.query.first)
  var second = parseInt(req.query.second)

  if (first === NaN || second === NaN) {
    res.status(400); // 400 = bad request
    res.send("You didn't put the right parameters!");
  }

  res.json({
    sum: first + second
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
