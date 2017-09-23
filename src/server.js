"use strict"

var _ = require("underscore");
var express = require("express");
var Fuse = require("fuse.js");
const recastai = require('recastai')

var app = express();
var port = process.env.PORT || 3000;

var VisaTypes = require("./visaTypes.js");
var Utilities = require("./utilities.js");
var Data = require("./data.js");

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
  Utilities.cleanVisaQuery(request.query)
  console.log("Cleaned query:", request.query);

  var result = {
    messages: [],
    redirect_to_blocks: [],
  }

  _.each(VisaTypes, (getVisaInfo, visaType) => {
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
var countriesFuse = new Fuse(Data.countries, {
  shouldSort: true,
  includeScore: true,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [ "slugishNames" ]
});
app.route('/v1/parse_nationality').get(function(request, response) {
  console.log("Parse nationality:", request.originalUrl);

  let { nationality } = request.query;

  if (!nationality && nationality !== "") {
    response.status(400).send('Missing nationality parameter');
    return;
  }

  let results = countriesFuse.search(nationality);

  let bestResult = results[0];
  let slugy = Utilities.slugishify(nationality);
  if (bestResult &&
      _.contains(bestResult.item.slugishNames, slugy)) {
    console.log("Perfect match:", nationality, bestResult.item.slug);
    response.json({
      set_attributes: {
        nationality: bestResult.item.slug,
        validated_nationality: "yes",
      }
    });
  } else if (bestResult && bestResult.score <= .25 &&
      !(results[1] && results[1].score - results[0].score < .05)) {
    console.log("Asking to confirm:", nationality, bestResult.item.slug);

    response.json({
      "messages": [
        {
          "text":  `Est-ce que tu voulais dire ${bestResult.item.french} ?`,
          quick_replies: [
            {
              title: "Oui 😀",
              set_attributes: {
                nationality: bestResult.item.slug,
                validated_nationality: "yes",
              },
            },
            {
              title: "Non 😔",
              set_attributes: {
                validated_nationality: "no",
              },
            },
          ],
        }
      ],
    });
  } else if (bestResult && bestResult.score < .4) {
    let filterTopFive = _.filter(results.slice(0, 5), (result) => {
      return result.score < .45;
    });

    let quick_replies = _.map(filterTopFive, (result) => {
      return {
        title: result.item.french,
        set_attributes: {
          nationality: result.item.slug,
          validated_nationality: "yes",
        },
      };
    });
    quick_replies.push({
      "title": "Autre",
      set_attributes: {
        validated_nationality: "no",
      }
    });

    let countryOptions = _.pluck(quick_replies, "title").join(", ");
    console.log("Result country options:", countryOptions);

    response.json({
      "messages": [
        {
          "text":  "De quel pays exactement parles-tu ?",
          quick_replies,
        }
      ],
    });
  } else {
    console.log("Couldn't figure out what they said :(");

    let messages = [
      {
        text: "Je n'arrive pas à comprendre 😔. Vérifie l'ortographe stp et " +
        "dis-moi à nouveau de quel pays tu viens."
      }
    ];

    // if they put a space tell them to just put the country
    if (_.contains(nationality, " ")) {
      messages.push({
        text: "Essaye d'envoyer seulement le nom de ton pays d'origine."
      });
    }

    let tryAgain = {
      messages,
      // redirect_to_blocks: [
      //   "Nationality"
      // ],
      set_attributes: {
        validated_nationality: "no",
      }
    };
    response.json(tryAgain);
  }
});

const recastClient = new recastai.request('9c2055e6ba8361b582f9b5aa6457df67', 'fr')
app.route('/v1/nlp').get(function(request, response) {
  console.log("NLP:", request.originalUrl);

  client.converseText('hello')
    .then(function(res) {
      if (res.action) {
        console.log('Action: ', res.action.slug);
      }

      const reply = res.reply()
      console.log('Reply: ', reply)
    });

  response.json({
    messages: [
      {
        text: "Oh hello there!",
      },
    ],
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
