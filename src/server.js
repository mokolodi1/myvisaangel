"use strict"

var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

// we don't need this just yet, but I'm going to keep it here until we do
// var _ = require("underscore");

var Data = require('./data.js');


app.route('/v1/helloworld').get(function(req, res) {
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
  var first = parseInt(req.query.first)
  var second = parseInt(req.query.second)

  if (isNaN(first) || isNaN(second)) {
    res.status(400); // 400 = bad request
    res.send("You didn't put the right parameters!");
    return;
  }

  res.json({
    result: first + second
  });
});

app.route('/v1/aps_conditions').get(function (req, res) {
  var country = req.query.pays;

  // if they didn't provide a country...
  if (!country) {
    res.status(400);
    res.send("You didn't put the right parameters!");
    return;
  }

  var specialCountry = Data.apsSpecialCountries[country]
  if (specialCountry) {
    res.json(specialCountry);
    return;
  }

  // weed out non-applicable countries
  if (Data.eeeCountries.indexOf(country) !== -1 || country === "Algérie") {
    res.json({
      applicable: false,
    });
    return;
  }

  // Pays non membres de l'EEE
  res.json({
    applicable: true,
    accord_special: false,
    condition_de_diplome: Data.apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  });
})

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
