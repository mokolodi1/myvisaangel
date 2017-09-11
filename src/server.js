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
  console.log("Get visas:", request.originalUrl);
  utilities.cleanVisaQuery(request.query)
  console.log("Cleaned query:", request.query);

  var result = {
    messages: [],
    redirect_to_blocks: [],
  }

  _.each(visaTypes, (getVisaInfo, visaType) => {
    let visaInfo = getVisaInfo(request.query);

    if (visaInfo) {
      if (Array.isArray(visaInfo.messages)) {
        result.messages = result.messages.concat(visaInfo.messages);
      }

      if (Array.isArray(visaInfo.redirect_to_blocks)) {
        result.redirect_to_blocks =
            result.redirect_to_blocks.concat(visaInfo.redirect_to_blocks);
      }
    }
  });

  if (result.redirect_to_blocks.length === 0) {
    // TODO: Paola -- feel free to change this text
    result.redirect_to_blocks.push("No recommendation")
  }

  if (result.messages.length === 0) {
    delete result.messages;
  }

  console.log("Result:", result);
  response.json(result);
});

/*
** Transform their nationality to standardized lower-case English
*/
// declare this here so it's done once and kept in memory
var countriesFuse = new Fuse(data.countries, {
  shouldSort: true,
  threshold: 0.6,
  includeScore: true,
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
  console.log("Parse nationality:", request.originalUrl);

  let { nationality } = request.query;
  let results = countriesFuse.search(nationality);

  // if the first result isn't great then give them options
  let bestResult = results[0];
  if (bestResult && bestResult.score < .25) {
    nationality = bestResult.item.slug;
    console.log("nationality, score:", nationality, bestResult.score);

    response.json({
      set_attributes: {
        nationality
      }
    });
  } else if (bestResult && bestResult.score < .4) {
    let quick_replies = _.map(results.slice(0, 5), (result) => {
      return {
        title: result.item.french,
        set_attributes: {
          nationality: result.item.slug,
        },
      };
    });

    let countryOptions = _.pluck(quick_replies, "title").join(", ");
    console.log("Result country options:", countryOptions);

    response.json({
      "messages": [
        {
          // TODO: Paola -- feel free to change this text
          "text":  "De quel pays exactement parles-tu ?",
          quick_replies,
        }
      ],
      redirect_to_blocks: [ "Nationality" ],
    });
  } else {
    let messages = [
      {
        // TODO: Paola -- feel free to change this text
        text: "Je n'arrive pas à comprendre 😔. Vérifie l'ortographe stp et dis-moi à nouveau de quel pays tu viens."
      }
    ];

    // if they put a space tell them to just put the country
    if (_.contains(nationality, " ")) {
      messages.push({
        text: "Essaye d'envoyer seulement le nom de ton pays d'origine"
      });
    }

    let tryAgain = {
      messages,
      redirect_to_blocks: [
        "Nationality"
      ]
    };
    console.log("Try again:", tryAgain);
    response.json(tryAgain);
  }
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
