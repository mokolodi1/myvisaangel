"use strict"

var _ = require("underscore");

// Change things like "CDD" to "cdd", >17764,2€ (1 SMIC)" to smicx1"
function cleanVisaQuery(query) {
  let {
    salary, employmentSituation, diploma, familySituation, currentTDS
  } = query;

  let smicMultiplier;
  if (salary) {
    smicMultiplier = {
      ">17764": 1,
      ">26645": 1.5,
      ">35526": 2,
      ">53289": 3,
    }[salary.slice(0, ">53289".length)];
  }

  employmentSituation = {
    "CDI": "cdi",
    "CDD": "cdd",
    "Entrepreneur": "entrepreneur",
    "Je ne sais pas": "doesnt_know",
  }[employmentSituation];

  diploma = {
    "Licence classique": "licence_classique",
    "Licence pro": "licence_pro",
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
