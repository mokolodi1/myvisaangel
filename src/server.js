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

  next();
});

app.route('/v1/ping').get(function(request, response) {
  response.json({
    pong: "It works!",
  });
});

/*
Figure out which visas the user is eligible for
*/
app.route('/v1/get_visas').get(function(request, response) {
  Utilities.cleanVisaQuery(request.query);

  var result = {
    messages: [],
    redirect_to_blocks: [],
  }
  var recommendedSlugs = [];

  _.each(tdsTypes, (tdsInfo, tdsSlug) => {
    let eligible = tdsInfo.eligible(request.query);

    if (eligible) {
      if (eligible.messages) {
        result.messages = result.messages.concat(eligible.messages);
      }

      if (eligible.blockName) {
        result.redirect_to_blocks =
            result.redirect_to_blocks.concat(eligible.blockName);
        recommendedSlugs.push(tdsSlug);
      }
    }
  });

  if (result.redirect_to_blocks.length === 0) {
    result.redirect_to_blocks.push("No recommendation")
  } else {
    result.set_attributes = {
      recommended_tds: recommendedSlugs.join("|"),
    };
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
    console.log("Perfect nationality match:", nationality,
        bestResult.item.slug);

    response.json({
      set_attributes: {
        nationality: bestResult.item.slug,
        validated_nationality: "yes",
      }
    });
  } else if (bestResult && bestResult.score <= .25 &&
      !(results[1] && results[1].score - results[0].score < .05)) {
    console.log("Asking to confirm nationality:", nationality,
        bestResult.item.slug);

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

  Utilities.getSubmissionMethods((error, result) => {
    if (error) {
      console.log("Error reading from Google doc:", error);
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
        console.log("Perfect prefecture match:", prefecture,
            bestResult.item.name);

        response.json({
          set_attributes: {
            prefecture: bestResult.item.slugishName,
            validated_prefecture: "yes",
          }
        });
      } else if (bestResult && bestResult.score <= .25 &&
          !(results[1] && results[1].score - results[0].score < .05)) {
        console.log("Asking to confirm prefecture:", prefecture,
            bestResult.item.name);

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
        console.log("Couldn't figure out what they said :(");

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

  console.log("Select from list:", tdsChoices);
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

      if (intent && (intent.slug === "dossier-submission-method" ||
                      intent.slug === "dossier-list-papers")) {
        console.log("They need dossier help!", intent.slug);

        var { prefecture, selected_tds } = request.query;

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
            // convert from recast's recognition to slugs
            // TODO: ask Paola or Abdel to confirm these
            // TODO: fuzzy search on this?
            let newSelectedTds = {
              "passport_talent": "ptsq",
              "passeport_talent": "ptsq",
              "travailleur_temporaire": "salarie_tt",
              "commercant": "commercant",
              "aps": "aps",
              "autorisation_provisoire_de_sejour": "aps",
              "vie_privee_et_familiale": "vpf",
              "travailleur": "salarie_tt",
              "salarie": "salarie_tt",
              "entrepreneur": "commercant",
              "profession_liberale": "???",
            }[Utilities.slugishify(recastTds.value)];

            if (newSelectedTds) {
              selected_tds = newSelectedTds;
            }
          }
        }

        // should we ask questions?
        var questionBlocks = [];
        if (!prefecture) {
          questionBlocks.push("Ask for prefecture");
        }
        if (!selected_tds) {
          questionBlocks.push("Select TDS type");
        }

        let blockForIntent = {
          "dossier-submission-method": "Dossier submission method",
          "dossier-list-papers": "Dossier papers list",
        }[intent.slug];

        var result = {
          redirect_to_blocks: questionBlocks.concat([
            blockForIntent
          ]),
        };
        if (questionBlocks.length) {
          result.messages = [
            {
              text: "Pour t'aider j'ai besoin " +
              "de quelques informations complémentaires",
            },
          ];
        }

        // send these back even if they haven't been modified (but only
        // if they're defined)
        if (prefecture || selected_tds) {
          result.set_attributes = { prefecture, selected_tds };
        }

        response.json(result);
      } else if (intent && intent.slug === "tds-recommendation") {
        console.log("They want a recommendation for which TDS to get...");

        response.json({
          redirect_to_blocks: [ "TDS Questions" ],
        });
      } else if (intent && intent.slug === "greetings") {
        console.log("Saying hello. How nice!");

        response.json({
          messages: [
            {
              text: `Bonjour, ${request.query["first name"]} !`
            }
          ],
        });
      } else if (intent && intent.slug === "thanks") {
        console.log("They are saying thanks! It's nice being loved...");

        response.json({
          messages: [
            {
              text: "Je t'en prie. C'etait un plaisir de parler avec toi 🙂"
            }
          ],
        });
      } else {
        console.log("Don't know what they asked -- chat with creators");

        response.json({
          redirect_to_blocks: ["Introduce creators chat"],
        });
      }
    })
    .catch(function (error) {
      console.log("Error dealing with Recast:", error);

      response.status(500).send("Problem connecting with Recast.ai");
    });
});

app.route('/v1/dossier_submission_method').get(function(request, response) {
  let { selected_tds, prefecture } = request.query;

  if (!selected_tds || !prefecture) {
    response.status(400)
        .send('Missing selected_tds or prefecture parameter(s)');
    return;
  }

  Utilities.getSubmissionMethods((error, result) => {
    if (error) {
      console.log("error:", error);
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

      console.log("submissionPossibilities:", submissionPossibilities);

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
      console.log("No info yet for that submission type.");

      response.json({
        messages: [
          {
            text: "Je ne sais pas encore comment déposer un dossier " +
            `pour un titre de séjour ${tdsTypes[selected_tds].name} là-bas...`,
          },
        ],
      });
    }
  });
});

app.route('/v1/dossier_papers_list').get(function(request, response) {
  let { selected_tds, prefecture } = request.query;

  if (!selected_tds || !prefecture) {
    response.status(400)
        .send('Missing selected_tds or prefecture parameter(s)');
    return;
  }

  Utilities.getPapersList((error, result) => {
    if (error) {
      console.log("error:", error);
      response.status(500).send("Error getting the prefecture papers list");
      return;
    }

    let matchingRows = _.where(result, {
      tdsSlug: selected_tds,
      prefectureSlug: prefecture,
    });

    if (matchingRows.length > 0 && matchingRows[0]["lien"]) {
      let papersListLink = matchingRows[0]["lien"];
      console.log("Returning the link:", papersListLink);

      response.json({
        messages: [
          {
            text: `Voici la liste de papiers : ${papersListLink}`,
          },
        ],
      });
    } else {
      console.log("No info yet for that tds type.");

      response.json({
        messages: [
          {
            text: "Je ne connais pas encore la liste de papiers pour là-bas 😔",
          },
        ],
      });
    }
  });
});

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
