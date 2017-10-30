"use strict"

var _ = require("underscore");
var express = require("express");
var Fuse = require("fuse.js");
const recastai = require('recastai')

var app = express();
var port = process.env.PORT || 3000;

var Data = require("./data.js");
var Utilities = require("./utilities.js");
var tdsTypes = require("./tdsTypes.js");

// print some info about the time and such
app.all('*', (request, response, next) => {
  if (request.path.startsWith("/v1/")) {
    console.log("\n" + new Date(), request.path, request.query);
  }

  // put in a little print function for everything that we send back...
  var oldSend = response.send;
  response.send = function (data) {
    console.log("response:", data);

    oldSend.apply(response, arguments);
  }

  next();
});

app.route('/v1/ping').get(function(request, response) {
  response.json({
    pong: "It works!",
  });
});

// NOTE: this route intentionally crashes the app for testing purposes
if (process.env.NODE_ENV === "dev") {
  app.route('/private/crash').get(function(request, response) {
    response.json({
      hehe: "It's about to crash ;)"
    });

    // to crash node the invalid JS has to be in a callback
    require('child_process').exec('hello', () => {
      asdf
    });
  });
}

process.on('uncaughtException', function (err) {
  console.error("Uncaught exception! Here's the stack:");
  console.error(err.stack);
});


// Now on to the real meat of the app...


/*
Figure out which visas the user is eligible for
*/
app.route('/v1/get_visas').get(function(request, response) {
  Utilities.cleanVisaQuery(request.query);
  Utilities.logInSheet("get_visas", request.query);

  var result = {
    messages: []
  };
  var recommendedSlugs = [];

  _.each(tdsTypes, (tdsInfo, tdsSlug) => {
    let eligible = tdsInfo.eligible(request.query);

    if (eligible &&
          !(tdsSlug === "salarie_tt" &&
              tdsTypes.ptsq.eligible(request.query))) {
      recommendedSlugs.push(tdsSlug);

      if (eligible.messages) {
        result.messages = result.messages.concat(eligible.messages);
      }
    }
  });

  if (recommendedSlugs.length > 0) {
    result.set_attributes = {
      recommended_tds: recommendedSlugs.join("|"),
    };

    result.messages.push({
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: _.map(recommendedSlugs, (tdsSlug) => {
            let tdsInfo = tdsTypes[tdsSlug];

            return {
              title: tdsInfo.name,
              subtitle: tdsInfo.description,
              buttons: tdsInfo.summary_link && [
                {
                  type: "web_url",
                  title: "Fiche récapitulative",
                  url: tdsInfo.summary_link,
                },
                {
                  type: "show_block",
                  block_names: [
                    "Dossier papers list",
                  ],
                  title: "Voir liste papiers",
                  set_attributes: {
                    selected_tds: tdsSlug
                  },
                },
              ],
            };
          }),
        }
      }
    });

    result.messages.push({
      text: "Tu as encore des questions ? Écris ta question directement " +
          "ci-dessous.\n" +
          "Par exemple : Comment déposer un dossier pour le passeport " +
          "talent à Nanterre ?",
    });
  } else {
    result.redirect_to_blocks = [ "No recommendation" ];
  }

  if (result.messages.length === 0) {
    delete result.messages;
  }

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
    response.json({
      set_attributes: {
        nationality: bestResult.item.slug,
        validated_nationality: "yes",
      }
    });
  } else if (bestResult && bestResult.score <= .25 &&
      !(results[1] && results[1].score - results[0].score < .05)) {
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

    response.json({
      "messages": [
        {
          "text":  "De quel pays exactement parles-tu ?",
          quick_replies,
        }
      ],
    });
  } else {
    let messages = [
      {
        text: "Je n'arrive pas à comprendre 😔. Vérifie l'orthographe stp et " +
        "dis-moi à nouveau de quel pays tu viens."
      }
    ];

    // if they put a space tell them to just put the country
    if (_.contains(nationality, " ")) {
      messages.push({
        text: "Essaye d'envoyer seulement le nom de ton pays d'origine."
      });
    }

    response.json({
      messages,
      set_attributes: {
        validated_nationality: "no",
      }
    });
  }
});

app.route('/v1/parse_prefecture').get(function(request, response) {
  let { prefecture } = request.query;

  if (!prefecture && prefecture !== "") {
    response.status(400).send('Missing prefecture parameter');
    return;
  }

  Utilities.tdsInfoSheet((error, result) => {
    if (error) {
      console.error("Error reading from Google doc:", error);
      response.status(500).send('Error reading from Google doc');
    } else {
      let prefecturesHash = _.reduce(result, (memo, row) => {
        memo[row["préfecture"]] = true;
        return memo;
      }, {});
      let prefectureNames = _.map(Object.keys(prefecturesHash), (name) => {
        return {
          name,
          slugishName: Utilities.slugishify(name),
        };
      });

      var prefectureFuse = new Fuse(prefectureNames, {
        shouldSort: true,
        includeScore: true,
        maxPatternLength: 32,
        minMatchCharLength: 2,
        keys: [ "name" ],
      });

      let slugishInput = Utilities.slugishify(prefecture);
      let results = prefectureFuse.search(slugishInput);
      let bestResult = results[0];

      if (bestResult &&
          bestResult.item.slugishName === Utilities.slugishify(prefecture)) {
        response.json({
          set_attributes: {
            prefecture: bestResult.item.slugishName,
            validated_prefecture: "yes",
          }
        });
      } else if (bestResult && bestResult.score <= .25 &&
          !(results[1] && results[1].score - results[0].score < .05)) {
        response.json({
          "messages": [
            {
              "text":  `Est-ce que tu voulais dire ${bestResult.item.name} ?`,
              quick_replies: [
                {
                  title: "Oui 😀",
                  set_attributes: {
                    prefecture: bestResult.item.slugishName,
                    validated_prefecture: "yes",
                  },
                },
                {
                  title: "Non 😔",
                  set_attributes: {
                    validated_prefecture: "no",
                  },
                },
              ],
            }
          ],
        });
      } else {
        let messages = [
          {
            text: "Je n'arrive pas à comprendre 😔. Vérifie l'orthographe stp et " +
            "dis-moi à nouveau de quelle préfecture tu dépends."
          }
        ];

        // if they put a space tell them to just put the country
        if (_.contains(prefecture, " ")) {
          messages.push({
            text: "Essaye d'envoyer seulement le nom de la préfecture."
          });
        }

        response.json({
          messages,
          set_attributes: {
            validated_prefecture: "no",
          }
        });
      }
    }
  });
});

app.route('/v1/select_tds').get(function(request, response) {
  var tdsChoices = [];
  if (request.query.recommended_tds) {
    tdsChoices = request.query.recommended_tds.split("|");
  } else {
    tdsChoices = Object.keys(tdsTypes);
  }

  response.json({
    messages: [
      {
        text: "Pour quel titre de séjour ?",
        quick_replies: _.map(tdsChoices, (tdsSlug) => {
          return {
            title: tdsTypes[tdsSlug].name,
            set_attributes: {
              selected_tds: tdsSlug,
            },
          };
        }),
      },
    ],
  });
});

const recastClient = new recastai.request('9c2055e6ba8361b582f9b5aa6457df67', 'fr');
app.route('/v1/nlp').get(function(request, response) {
  let message = request.query["last user freeform input"];

  if (!message) {
    response.status(400).send('Missing "last user freeform input" parameter');
    return;
  }

  recastClient.analyseText(message)
    .then(function(recastResponse) {
      let intent = recastResponse.intent();
      console.log("Recast intent:", intent);

      let { query } = request;
      query.intentSlug = intent && intent.slug;
      query.intentConfidence = intent && intent.confidence;
      Utilities.logInSheet("nlp", query);

      let { nlp_disabled } = request.query;
      if (nlp_disabled) {
        response.json({ set_attributes: { nlp_disabled } });
        return;
      }

      if (intent && (intent.slug === "dossier-submission-method" ||
                      intent.slug === "dossier-list-papers")) {
        var { prefecture, selected_tds } = query;

        // grab prefecture/TDS from Recast if they have been defined
        let { entities } = recastResponse;
        if (entities) {
          // TODO: test this
          // remove "papiers" from the list of prefecture entries - it
          // recognizes the word "papiers" as the prefecture "Pamiers"
          let withoutPapiers = _.filter(entities.prefecture, (entry) => {
            return Utilities.slugishify(entry.raw) !== "papiers";
          });
          if (withoutPapiers && withoutPapiers.length > 0) {
            let newPrefecture = Utilities.mostConfident(withoutPapiers);
            prefecture = Utilities.slugishify(newPrefecture.value);
          }

          let recastTds = Utilities.mostConfident(entities["visa-type"]);
          if (recastTds) {
            let tds = Utilities.tdsFromRecast(recastTds.value);

            if (tds) {
              selected_tds = tds;
            }
          }
        }

        var result = Utilities.prefTdsRequired(prefecture, selected_tds);

        let blockForIntent = {
          "dossier-submission-method": "Dossier submission method",
          "dossier-list-papers": "Dossier papers list",
          "tds-processing-time": "Dossier processing time",
        }[intent.slug];
        result.redirect_to_blocks.push(blockForIntent);

        // send these back even if they haven't been modified (but only
        // if they're defined)
        if (prefecture || selected_tds) {
          result.set_attributes = { prefecture, selected_tds };
        }

        response.json(result);
      } else if (intent && intent.slug === "tds-recommendation") {
        response.json({
          redirect_to_blocks: [ "TDS Questions" ],
        });
      } else if (intent && intent.slug === "greetings") {
        response.json({
          messages: [
            {
              text: `Bonjour, ${query["first name"]} !`
            }
          ],
        });
      } else if (intent && intent.slug === "thanks") {
        response.json({
          messages: [
            {
              text: "Je t'en prie. C'etait un plaisir de parler avec toi 🙂"
            }
          ],
        });
      } else {
        response.json({
          redirect_to_blocks: ["Silent creators respond"],
        });
      }
    })
    .catch(function (error) {
      console.error("Error dealing with Recast:", error);

      response.status(500).send("Problem connecting with Recast.ai");
    });
});

app.route('/v1/dossier_submission_method').get(function(request, response) {
  let { selected_tds, prefecture } = request.query;

  if (!selected_tds || !prefecture) {
    var result = Utilities.prefTdsRequired(prefecture, selected_tds);

    result.redirect_to_blocks.push("Dossier submission method");

    response.json(result);
    return;
  }

  Utilities.tdsInfoSheet((error, result) => {
    if (error) {
      console.error("error:", error);
      response.status(500).send("Error getting the prefecture submission info");
      return;
    }

    let matchingRows = _.chain(result)
      .where({
        tdsSlug: selected_tds,
        prefectureSlug: prefecture,
      })
      .filter((row) => {
        // XXX: might need better way to tell if row is ready for production
        return row["besoinrdv"]
      })
      .value();

    if (matchingRows.length > 0) {
      let submissionPossibilities = _.map(matchingRows, (row) => {
        let rdvMessage = "Tu n'as pas besoin de prendre RDV. ";
        if (Utilities.slugishify(matchingRows[0]["besoinrdv"]) === "oui") {
          rdvMessage = "Le RDV se prend " +
              `${matchingRows[0]["commentprendrerdv"]}. `;
        }

        return {
          text: rdvMessage + `${row["dépôtdudossier"]} : ${row["coordonnées"]}`
        };
      });

      response.json({
        messages: [
          {
            text: "Voici la/les procédure(s) pour déposer un dossier pour " +
            `un titre de séjour ${tdsTypes[selected_tds].name} à ` +
            `${Data.slugToPrefecture[prefecture]} :`,
          }
        ].concat(submissionPossibilities),
      });
    } else {
      response.json({
        redirect_to_blocks: ["Silent creators respond"],
      });
    }
  });
});

app.route('/v1/dossier_papers_list').get(function(request, response) {
  let { selected_tds, prefecture } = request.query;

  if (!selected_tds || !prefecture) {
    var result = Utilities.prefTdsRequired(prefecture, selected_tds);

    result.redirect_to_blocks.push("Dossier papers list");

    response.json(result);
    return;
  }

  Utilities.papersListSheet((error, result) => {
    if (error) {
      console.error("error:", error);
      response.status(500).send("Error getting the submission information");
      return;
    }

    let matchingRows = _.where(result, {
      tdsSlug: selected_tds,
      prefectureSlug: prefecture,
    });

    if (matchingRows.length > 0 && matchingRows[0]["lien"]) {
      let papersListLink = matchingRows[0]["lien"];
      response.json({
        messages: [
          {
            text: "Voici la liste de papiers pour un titre de séjour " +
                `${tdsTypes[selected_tds].name} à ` +
                `${Data.slugToPrefecture[prefecture]} : ${papersListLink}`,
          },
        ],
      });
    } else {
      let nanterreRows = _.where(result, {
        tdsSlug: selected_tds,
        prefectureSlug: "nanterre",
      });

      response.json({
        messages: [
          {
            text: "Pour le moment nous n'avons la liste pour la préfecture " +
                `de ${Data.slugToPrefecture[prefecture]} ` +
                "dans notre base de données mais en attendant, je t'invite " +
                "à regarder la liste de Nanterre car c'est très générique " +
                "et il se peut qu'elle corresponde à 90% à la liste de ta" +
                " préfecture 🙂",
          },
          {
            text: "Voici la liste de papiers pour un titre de séjour " +
                `${tdsTypes[selected_tds].name} à Nanterre : ` +
                nanterreRows[0]["lien"],
          },
        ],
      });
    }
  });
});

app.route('/v1/dossier_processing_time').get(function(request, response) {
  let { selected_tds, prefecture } = request.query;

  if (!selected_tds || !prefecture) {
    var result = Utilities.prefTdsRequired(prefecture, selected_tds);

    result.redirect_to_blocks.push("Dossier processing time");

    response.json(result);
    return;
  }

  Utilities.processingTimeSheet((error, result) => {
    if (error) {
      console.error("error:", error);
      response.status(500).send("Error getting the submission information");
      return;
    }

    let matchingRows = _.where(result, {
      tdsSlug: selected_tds,
      prefectureSlug: prefecture,
    });

    console.log("matchingRows[0]:", matchingRows[0]);
    if (matchingRows.length > 0 && matchingRows[0]["délai"]) {
      let delayText = matchingRows[0]["délai"].replace(/\n/g, ' ');

      response.json({
        messages: [
          {
            text: `Normalement ${delayText} pour le ` +
                `${tdsTypes[selected_tds].name} à ` +
                `${Data.slugToPrefecture[prefecture]}`,
          },
        ],
      });
    } else {
      response.json({
        messages: [
          {
            text: "Nous n'avons pas encore des retours sur les délais pour " +
                "cette procédure. N'hésite pas à nous faire un retour " +
                "d'expérience quand tu auras fait les démarches afin de " +
                "pouvoir aider la communauté 😉"
          }
        ],
      });
    }
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
