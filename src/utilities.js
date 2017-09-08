"use strict"

var _ = require("underscore");

// Change things like "CDD" to "cdd", >17764,2€ (1 SMIC)" to smicx1"
function cleanVisaQuery(query) {
  let {
    salary, employmentSituation, diploma, familySituation, currentTDS
  } = query;

  let smicMultiplier = {
    ">17764,2¬ (1 SMIC)": 1,
    ">26645¬ (1,5x SMIC)": 1.5,
    ">35526,4¬ (2x SMIC)": 2,
    ">53289,6¬ (3x SMIC)": 3,
  }[salary];

  employmentSituation = {
    "CDI": "cdi",
    "CDD": "cdd",
    "Entrepreneur": "entrepreneur",
    "Je ne sais pas": "doesnt_know",
  }[employmentSituation];

  diploma = {
    "License classique": "license_classique",
    "License pro": "license_pro",
    "Master": "masters",
    "Équivalent au Master": "masters_equiv",
  }[diploma];

  familySituation = {
    "Pacsé à un français": "pacsed",
    "Marié à un français": "married",
    "Avec enfant français": "frenchKids",
    "Célibataire": "single",
  }[familySituation];

  currentTDS = {
    "Étudiant": "student",
    "APS": "aps",
    "Autre": "other",
  }[currentTDS];

  _.extend(query, {
    smicMultiplier, employmentSituation, diploma, familySituation, currentTDS
  });
}

module.exports = {
  cleanVisaQuery
}
