"use strict"

var _ = require("underscore");
var express = require("express");
var Fuse = require("fuse.js");

var app = express();
var port = process.env.PORT || 3000;

var visaTypes = require("./visaTypes.js");
var utilities = require("./utilities.js");
var data = require("./data.js");

app.route('/v1/ping').get(function(request, response) {
  response.json({
    pong: "It works!",
  });
});

/*
Figure out which visas the user is eligible for
*/
app.route('/v1/get_visas').get(function(request, response) {
  console.log("Eligible for visas:", request.query);
  utilities.cleanVisaQuery(request.query)

  var result = {
    messages: [],
    redirect_to_blocks: [],
  }

  _.each(visaTypes, (getVisaInfo, visaType) => {
    let visaInfo = getVisaInfo(request.query);

    if (visaInfo) {
      if (Array.isArray(visaInfo.messages)) {
        result.messages = result.concat(visaInfo.messages);
      }

      if (Array.isArray(visaInfo.redirect_to_blocks)) {
        result.redirect_to_blocks =
            result.redirect_to_blocks.concat(visaInfo.redirect_to_blocks);
      }
    }
  });

  if (result.redirect_to_blocks.length === 0) {
    delete result.redirect_to_blocks;
    result.messages.push("You're not eligible for any visas.");
  }

  if (result.messages.length === 0) {
    delete result.messages;
  }

  console.log("result:", result);
  response.json(result);
});

/*
** Transform their nationality to standardized lower-case English
*/
// declare this here so it's done once and kept in memory
var countriesFuse = new Fuse(data.countries, {
  shouldSort: true,
  threshold: 0.6,
  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [
    "french",
    "english",
    "alternatives"
  ]
});
app.route('/v1/parse_nationality').get(function(request, response) {
  let results = countriesFuse.search(request.query.nationality)

  // TODO: what could possibly go wrong??

  response.json({
    set_attributes: {
      "parsed_nationality": results[0].slug
    }
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
