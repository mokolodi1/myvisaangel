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
    employmentSituation,
  } = query;

  var apsSpecialInfo = data.apsSpecialCountries[nationality];

  if (nationality === "Algérienne") {
    return;
  }

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
      "messages": [
        {
          "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
              "France qui change les choses suivantes pour l'APS :\n" +
              apsWarnings,
        }
      ],
      "redirect_to_blocks": ["APS"]
    }
  } else if (currentTDS === "student" &&
      _.contains(["license_pro", "masters", "masters_equiv"], diploma)) {
    return {
      "redirect_to_blocks": ["APS"]
    }
  }
}

// vie privée et familiale
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function vpf(query) {
  if (_.contains(["married", "frenchKids", "pacsed"], query.familySituation)) {
    return {
      "redirect_to_blocks": [ "Vie privée et familiale" ]
    };
  }
}

// Passeport Talent Salarié Qualifié
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function ptsq(query) {
  let {
    nationality, diploma, employmentSituation, smicMultiplier
  } = query;

  if (nationality !== "Algérienne" &&
      _.contains(["masters", "masters_equiv"], diploma) &&
      employmentSituation === "cdi" &&
      smicMultiplier >= 2) {
    return {
      "redirect_to_blocks": [ "Passeport Talent Salarié Qualifié" ]
    }
  }
}

// Salarié/TT
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
function salarie(query) {
  if (_.contains(["cdi", "cdd"], query.employmentSituation) &&
      query.smicMultiplier >= 1.5) {
    return {
      "redirect_to_blocks": [ "Salarié/TT" ]
    };
  }
}

// Commerçant
function commercant(query) {
  // https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
  if (query.employmentSituation === "entrepreneur") {
    return {
      "redirect_to_blocks": [ "Commerçant" ]
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
