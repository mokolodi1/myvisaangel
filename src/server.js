"use strict"

var _ = require("underscore");
var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

var visaTypes = require("./visaTypes.js");
var utilities = require("./utilities.js");

app.route('/v1/ping').get(function(request, response) {
  response.json({
    pong: "It works!",
  });
});

/*
Figure out whether the user is eligible for visas
*/
app.route('/v1/get_visas').get(function(request, response) {
  let cleanedQuery = Utilities.cleanVisaQuery(request.query)
  console.log("Eligible for visas:", cleanedQuery);

  var result = {
    messages: [],
    redirect_to_blocks: [],
  }

  _.each(visaTypes, (getVisaInfo) => {
    let visaInfo = getVisaInfo(cleanedQuery);

    if (visaInfo) {
      if (Array.isArray(visaInfo.messages)) {
        result.messages = result.concat(visaInfo.messages);
      }

      if (Array.isArray(visaInfo.messages)) {
        result.redirect_to_blocks = result.concat(visaInfo.redirect_to_blocks);
      }
    }
  });

  if (redirect_to_blocks.length === 0) {
    delete result.redirect_to_blocks
    result.messages.push("You're not eligible for any visas.")
  }

  response.json(result)
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
