"use strict"

var _ = require("underscore");

var data = require('./data.js');

// Authorisation Provisoire de Séjour
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function aps(query) {
  let {
    currentTDS,
    nationality,
    diploma,
  } = query;



  if (nationality !== "algeria" && currentTDS === "student" &&
      _.contains(["licence_pro", "masters", "masters_equiv"], diploma)) {
    var apsSpecialInfo = data.apsSpecialCountries[nationality];
    if (apsSpecialInfo && apsSpecialInfo.applicable) {
      var apsWarnings = "";

      if (apsSpecialInfo.condition_de_duree !== 12) {
        apsWarnings += "Condition de durée : " +
            apsSpecialInfo.condition_de_duree + " mois à la place de 12\n";
      }

      if (apsSpecialInfo.renouvellement === true) {
        apsWarnings += "Renouvellement : renouvelable une fois\n";
      }

      if (apsSpecialInfo.condition_de_diplome) {
        apsWarnings += "Condition de diplôme : " +
             apsSpecialInfo.condition_de_diplome +".\n"
      }

      return {
        messages: [
          {
            "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
                "France qui change les choses suivantes pour l'APS :\n" +
                apsWarnings,
          }
        ],
        blockName: "APS",
      };
    }

    return {
      blockName: "APS",
    };
  }
}

// vie privée et familiale
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function vpf(query) {
  if (_.contains(["married", "frenchKids", "pacsed"], query.familySituation)) {
    return {
      blockName: "Vie privée et familiale"
    };
  }
}

// Passeport Talent Salarié Qualifié
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function ptsq(query) {
  let {
    nationality, diploma, employmentSituation, smicMultiplier
  } = query;

  if (nationality !== "algeria" &&
      _.contains(["masters", "masters_equiv"], diploma) &&
      employmentSituation === "cdi" &&
      smicMultiplier >= 2) {
    return {
      blockName: "Passeport Talent Salarié Qualifié"
    }
  }
}

// Salarié/TT
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function salarie(query) {
  if (_.contains(["cdi", "cdd"], query.employmentSituation)) {
    let opposableReason = "";
    if (query.smicMultiplier < 1.5) {
      opposableReason = "que tu ne gagnes pas plus de 1,5smic";
    }
    if (query.diploma === "licence_classique") {
      if (opposableReason !== "") {
        opposableReason += " et ";
      }
      opposableReason += "que tu as une licence classique";
    }

    let result = {
      blockName: "Salarié/TT"
    }

    if (opposableReason !== "") {
      _.extend(result, {
        messages: [
          {
            text: "⚠️ Attention, tu es éligible au titre de séjour " +
            `salarié mais vu ${opposableReason} tu seras opposable à ` +
            "l'emploi, c'est-à-dire " +
            "qu'à moins d'exercer un métier dit en tension (manque de " +
            "main d'oeuvre), la situation de chômage en France sera " +
            "prise en compte par l'administration dans sa décision. " +
            "Pour plus d'informations, regarde cette notice : " +
            "https://docs.google.com/document/d/1lb-4yLRCsyLbEVO_xUxDn" +
            "UOHiBF5HC9IJTWA86_JDwo/edit?usp=sharing\n"
          }
        ]
      });
    }

    return result;
  }
}

// Commerçant
function commercant(query) {
  // https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
  if (query.employmentSituation === "entrepreneur") {
    return {
      blockName: "Commerçant"
    }
  }
}

module.exports = {
  aps,
  vpf,
  ptsq,
  salarie,
  commercant,
}
