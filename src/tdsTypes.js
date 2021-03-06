"use strict"

var _ = require("underscore");
var Data = require('./data.js');

var tdsTypes = {
  aps: {
    name: "APS",
    description: "L'APS te permet de chercher, exercer un emploi ou créer " +
        "une entreprise",
    photo_url: "http://myvisaangel.com/static/aps.jpg",
  },
  vpf: {
    name: "Vie Privée et Familiale",
    description: "Ce titre t'autorise à travailler en France (comme salarié " +
        "ou non-salarié)",
    photo_url: "http://myvisaangel.com/static/vpf.jpg",
  },
  ptsq: {
    name: "Passeport Talent Salarié Qualifié",
    description: "Ce titre pluriannuel t'autorise à travailler, créer une " +
        "entreprise ou investir",
    photo_url: "http://myvisaangel.com/static/ptsq.jpg",
  },
  salarie_tt: {
    name: "Salarié/Travailleur Temporaire",
    description: "Porte la mention Salarié si tu as un CDI / Travailler " +
        "temporaire si tu as un CDD",
    photo_url: "http://myvisaangel.com/static/salarie_tt.jpg",
  },
  commercant: {
    name: "Commerçant",
    description: "T'autorise à exercer une activité commerciale, " +
        "industrielle ou artisanale",
    photo_url: "http://myvisaangel.com/static/salarie_tt.jpg",
  },
};

// Authorisation Provisoire de Séjour
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
tdsTypes.aps.eligible = (query) => {
  let {
    currentTDS,
    nationality,
    diploma,
  } = query;

  if (nationality !== "algeria" && currentTDS === "student" &&
      _.contains(["licence_pro", "masters", "masters_equiv"], diploma)) {
    var apsSpecialInfo = Data.apsSpecialCountries[nationality];
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
             apsSpecialInfo.condition_de_diplome +".\n";
      }

      return {
        messages: [
          {
            "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
                "France qui change les choses suivantes pour l'APS :\n" +
                apsWarnings,
          }
        ],
      };
    }

    return {};
  }
}

// vie privée et familiale
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
tdsTypes.vpf.eligible = (query) => {
  if (_.contains(["married", "frenchKids", "pacsed"], query.familySituation)) {
    return {};
  }
}

// Passeport Talent Salarié Qualifié
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
tdsTypes.ptsq.eligible = (query) => {
  let {
    nationality, diploma, employmentSituation, smicMultiplier
  } = query;

  if (nationality !== "algeria" &&
      _.contains(["masters", "masters_equiv"], diploma) &&
      smicMultiplier >= 2) {
    if (employmentSituation === "cdi") {
      return {};
    } else {
      return {
        messages: [
          {
            text: "Normalement, si tu as un CDD supérieur à 3 mois, tu es " +
            "éligible au passeport talent et celui-ci aura une durée égale à " +
            "celle de ton CDD. Si tu as de la chance, la préfecture peut " +
            "aussi te donner un passeport talent d'une durée de 4 ans."
          }
        ],
      };
    }
  }
}

// Salarié/TT
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
tdsTypes.salarie_tt.eligible = (query) => {
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

    let result = {}

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
tdsTypes.commercant.eligible = (query) => {
  // https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
  if (query.employmentSituation === "entrepreneur") {
    return {}
  }
}

module.exports = tdsTypes;
