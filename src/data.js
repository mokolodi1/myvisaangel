"use strict"

module.exports = {};

module.exports.eeeCountries = [
  "Allemagne",
  "Autriche",
  "Belgique",
  "Bulgarie",
  "Chypre",
  "Croatie",
  "Danemark",
  "Espagne",
  "Estonie",
  "Finlande",
  "France",
  "Grèce",
  "Hongrie",
  "Irlande",
  "Italie",
  "Lettonie",
  "Lituanie",
  "Luxembourg",
  "Malte",
  "Pays-Bas",
  "Pologne",
  "Portugal",
  "République tchèque",
  "Roumanie",
  "Royaume-Uni",
  "Slovaquie",
  "Slovénie",
  "Suède",
  "Islande",
  "Liechtenstein",
  "Norvège",
];

// APS See here for original data:
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
var apsDiploma = {
  licencePro: "Licence pro",
  master: "Master",
  masterEquivalent: "Équivalent au Master",
};
module.exports.apsDiploma = apsDiploma

var apsCurrentTDS = {
  student: "Étudiant",
};
module.exports.apsCurrentTDS = apsCurrentTDS

var apsAgreements = {
  masters: "Diplôme au moins équivalent au master obtenu dans un établissement français",
  mastersOrLicensePro: "Licence professionnelle ou diplôme au moins équivalent au master obtenus dans un établissement français",
  mastersLicenseProNotFrance: "Licence professionnelle ou diplôme au moins équivalent au master obtenus dans un établissement " +
      "français ou dans un établissement du pays d'origine dans le cadre d'une convention de délivrance de diplômes en partenariat international",
};
module.exports.apsAgreements = apsAgreements

module.exports.apsSpecialCountries = {
  "Balkans": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenseProNotFrance,
    condition_de_duree: 12,
    renouvellement: false
  },
  "Benin": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "Burkina Faso": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenseProNotFrance,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "Cameroun": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Cap vert": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 9,
    renouvellement: false,
  },
  "Congo": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 9,
    renouvellement: false,
  },
  "Côté d'ivoire": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Gabon": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 9,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "Inde": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Liban": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Macédoine": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Mali": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Maroc": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Maurice": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenseProNotFrance,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "Mauritanie": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Monténégro": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenseProNotFrance,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Niger": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "République centrafricaine": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Russie": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Sénégal": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Serbie": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenseProNotFrance,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Togo": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicensePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "Tunisie": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenseProNotFrance,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
};

// VPF See here for original data:
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
var vpfFamilySituation = {
  pacsed: "Pacsé à un français",
  married: "Marié à un français",
  withKids: "Avec enfant français",
};
module.exports.vpfFamilySituation = vpfFamilySituation

// Passeport Talent Salarié Qualifié See here for original data:
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
var ptsqDiploma = {
  master: "Master",
  masterEquivalent: "Équivalent au Master",
};
module.exports.ptsqDiploma = ptsqDiploma

var ptsqEmploymentSituation = {
  cdi: "CDI"
};
module.exports.ptsqEmploymentSituation = ptsqEmploymentSituation

var ptsqSalary = {
  smicx2: ">35526,4€ (2x SMIC)"
  smicx3: ">53289,6€ (3x SMIC)"
};
module.exports.ptsqSalary = ptsqSalary

// Salarié See here for original data:
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
var salarieEmploymentSituation = {
  cdi: "CDI",
  cdd: "CDD",
};
module.exports.salarieEmploymentSituation = salarieEmploymentSituation

var salarieSalary = {
  smicx1,5: ">26645€ (1,5x SMIC)",
};
module.exports.salarieSalary = salarieSalary

// Commerçant See here for original data:
// https://docs.google.com/spreadsheets/d/1pGqTtZCiQCKClGhvdZk7mAOhNYRiV5pwodIs9_xFVac/edit#gid=1679689044
var commerçantEmploymentSituation = {
  entrepreneur: "Entrepreneur",
};
module.exports.commerçantEmploymentSituation = commerçantEmploymentSituation
