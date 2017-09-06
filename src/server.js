"use strict"

var express = require("express");
var app = express();
var port = process.env.PORT || 3000;

var _ = require("underscore");

var Data = require('./data.js');


app.route('/v1/helloworld').get(function(request, response) {
  response.json({
    hello: "world",
  });
});

/*
 * All of the stuff about the request to the website is
 * stored in the variable request, so don't hesitate to poke
 * around inside it to see what's there:
 * console.log(request). You'll find a lot of useful
 * information online about how routes work if you Google
 * "express node routes".
 */
app.route('/v1/calculate_sum').get(function(request, response) {
  var first = parseInt(request.query.first)
  var second = parseInt(request.query.second)

  if (isNaN(first) || isNaN(second)) {
    response.status(400); // 400 = bad request
    response.send("You didn't put the right parameters!");
    return;
  }

  response.json({
    result: first + second
  });
});

app.route('/v1/aps_conditions').get(function (request, response) {
  var country = request.query.pays;

  // if they didn't provide a country...
  if (!country) {
    response.status(400);
    response.send("You didn't put the right parameters!");
    return;
  }

  var specialCountry = Data.apsSpecialCountries[country]
  if (specialCountry) {
    response.json(specialCountry);
    return;
  }

  // weed out non-applicable countries
  if (Data.eeeCountries.indexOf(country) !== -1 || country === "Algérie") {
    response.json({
      applicable: false,
    });
    return;
  }

  // Pays non membres de l'EEE
  response.json({
    applicable: true,
    accord_special: false,
    condition_de_diplome: Data.apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  });
})

/*
Figure out whether the user is eligible for an APS
*/
app.route('/v1/eligible_for_aps').get(function(request, response) {
  console.log("Asked whether eligible for APS:", request.query);

  var currentTDS = request.query.currentTDS;
  var nationality = request.query.nationality;
  var diploma = request.query.diploma;
  var employmentSituation = request.query.employmentSituation;

  // TODO: error handling for variables (such as nationality) not being defined

  var apsSpecialInfo = Data.apsSpecialCountries[nationality];
  var apsCurrentTDS = Data.apsCurrentTDS[currentTDS];
  var apsDiploma = Data.apsDiploma[diploma];

  if (nationality === "Algérienne") {
    response.json({
      "redirect_to_blocks": [ "No recommendation" ]
    });
  } else if (apsSpecialInfo && apsSpecialInfo.applicable) {
    var changesToNormalAPS = "";

    if (apsSpecialInfo.condition_de_duree !== 12) {
      changesToNormalAPS += "Condition de durée : " +
          apsSpecialInfo.condition_de_duree + " mois à la place de 12\n";
    }

    if (apsSpecialInfo.renouvellement === true) {
      changesToNormalAPS += "Renouvellement : renouvelable une fois\n";
    }

    if (apsSpecialInfo.condition_de_diplome) {
      changesToNormalAPS += "Condition de diplôme : " +
           apsSpecialInfo.condition_de_diplome +".\n"
    }
    response.json({
      "messages": [
        {
          "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
              "France qui change les choses suivantes pour l'APS :\n" +
              changesToNormalAPS,
        }
      ],
      "redirect_to_blocks": ["APS"]
    });
  } else if (apsCurrentTDS && apsDiploma) {
    response.json({
      "type": "show_block",
      "block_name": "APS",
      "title": "WTF"
    });
  } else {
    response.status(200);
    response.send("Don't know what to do here");
  }
});

// /*
// Figure out whether the user is eligible for a Vie Privée et Familiale
// */
// app.route('/v1/eligible_for_vpf').get(function(request, response) {
//   console.log("Asked whether eligible for VPF:", request.query);
//
//   var familySituation = request.query.familySituation;
//
//   // TODO: error handling for variables not being defined
//
//   var vpfFamilySituation = Data.vpfFamilySituation[familySituation];
//
//   if (vpfFamilySituation) {
//     response.json({
//       "type": "show_block",
//       "block_name": "Vie privée et familiale",
//       "title": "WTF"
//     });
//   } else {
//     response.json({
//       hello: "world"
//     });
//   }
// });
//
// /*
// Figure out whether the user is eligible for a Passeport Talent salarié qualifié
// */
// app.route('/v1/eligible_for_ptsq').get(function(request, response) {
//   console.log("Asked whether eligible for PT salarié qualifié:", request.query);
//
//   var nationality = request.query.nationality;
//   var diploma = request.query.diploma;
//   var employmentSituation = request.query.employmentSituation;
//   var salary = request.query.salary;
//
//   // TODO: error handling for variables not being defined
//
//   var ptsqDiploma = Data.ptsqDiploma[diploma];
//   var ptsqEmploymentSituation = Data.ptsqEmploymentSituation[employmentSituation];
//   var ptsqSalary = Data.ptsqSalary[salary];
//
//   if (nationality === "Algérienne") {
//     response.json({
//       "type": "show_block",
//       "block_name": "No recommendation",
//       "title": "WTF"
//     });
//   } else if (ptsqDiploma && ptsqEmploymentSituation && ptsqSalary) {
//     response.json({
//       "type": "show_block",
//       "block_name": "Passeport Talent Salarié Qualifié",
//       "title": "WTF"
//     });
//   } else {
//     response.json({
//       hello: "world"
//     });
//   }
// });
//
// /*
// Figure out whether the user is eligible for a Titre de séjour salarié
// */
// app.route('/v1/eligible_for_salarie').get(function(request, response) {
//   console.log("Asked whether eligible for salarie:", request.query);
//
//   var employmentSituation = request.query.employmentSituation;
//   var salary = request.query.salary;
//
//   // TODO: error handling for variables not being defined
//
//   var salarieEmploymentSituation = Data.salarieEmploymentSituation[employmentSituation];
//   var salarieSalary = Data.salarieSalary[salary];
//
//   if (nationality === "Algérienne") {
//     response.json({
//       "type": "show_block",
//       "block_name": "No recommendation",
//       "title": "WTF"
//     });
//   } else if (salarieEmploymentSituation && salarieSalary) {
//     response.json({
//       "type": "show_block",
//       "block_name": "Salarié/TT",
//       "title": "WTF"
//     });
//   } else {
//     response.json({
//       hello: "world"
//     });
//   }
// });
//
// /*
// Figure out whether the user is eligible for a Titre de séjour commerçant
// */
// app.route('/v1/eligible_for_commerçant').get(function(request, response) {
//   console.log("Asked whether eligible for commerçant:", request.query);
//
//   var employmentSituation = request.query.employmentSituation;
//
//   // TODO: error handling for variables not being defined
//
//   var commerçantEmploymentSituation = Data.commerçantEmploymentSituation[employmentSituation];
//
//   if (nationality === "Algérienne") {
//     response.json({
//       "type": "show_block",
//       "block_name": "No recommendation",
//       "title": "WTF"
//     });
//   } else if (commerçantEmploymentSituation) {
//     response.json({
//       "type": "show_block",
//       "block_name": "Commerçant",
//       "title": "WTF"
//     });
//   } else {
//     response.json({
//       hello: "world"
//     });
//   }
// });



// else if (currentTDS === "Étudiant" &&
//     nationality !== "" &&
//     _.contains(["Licence Pro", "Master", "Équivalent au Master"], diploma) &&
//     _.contains(["CDI", "CDD", "Entrepreneur", "Je ne sais pas"], employmentSituation) {
//   //
// }
//
//
//
// function APS (currentTDS, nationality, diploma, employmentSituation){
//   if (currentTDS == "Étudiant" && nationality != "Algérienne" && diploma == "Licence Pro", "Master", "Équivalent au Master" && employmentSituation == "CDI", "CDD", "Entrepreneur", "Je ne sais pas")
//     {
//   "messages": [
//     {
//       "attachment": {
//         "type": "template",
//         "payload": {
//           "template_type": "button",
//           "text": "Autorisation Provisoire de Séjour (APS)",
//           "buttons": [
//             {
//               "type": "show_block",
//               "block_name": "Offer help papers",
//               "title": "En savoir plus"
//             },
//             {
//               "type": "web_url",
//               "url": "https://drive.google.com/open?id=0B67583XzIqWiQlZseEZ2bjE4ZDQ",
//               "title": "Voir liste papiers"
//             }
//           ]
//         }
//       }
//     }
//   ]
// }
// else if (currentTDS == "Étudiant" && nationality = module.exports.apsSpecialCountries && diploma == "Licence Pro", "Master", "Équivalent au Master" && employmentSituation == "CDI", "CDD", "Entrepreneur", "Je ne sais pas") {
//   {
// "messages": [
//   {
//     "attachment": {
//       "type": "template",
//       "payload": {
//         "template_type": "button",
//         "text": "Autorisation Provisoire de Séjour (APS)",
//         "buttons": [
//           {
//             "type": "show_block",
//             "block_name": "Offer help papers",
//             "title": "En savoir plus"
//           },
//           {
//             "type": "web_url",
//             "url": "https://drive.google.com/open?id=0B67583XzIqWiQlZseEZ2bjE4ZDQ",
//             "title": "Voir liste papiers"
//           }
//         ]
//       }
//     }
//   }
// ]
// }
// else if (currentTDS == "Étudiant" && nationality == "Algérienne" && diploma == "Licence Pro", "Master", "Équivalent au Master" && employmentSituation == "CDI", "CDD", "Entrepreneur", "Je ne sais pas") {
//
//
//   }
// }
//
// response.json({
//   result: "hello"
// });

var server = app.listen(port);
module.exports = server

console.log("started My Visa Angel API on port " + port);
