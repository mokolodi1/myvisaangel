"use strict"

var _ = require("underscore");

module.exports = {};

module.exports.eeeCountries = [
  "germany",
  "austria",
  "belgium",
  "bulgaria",
  "cyprus",
  "croatia",
  "denmark",
  "spain",
  "estonia",
  "finland",
  "france",
  "greece",
  "hungary",
  "ireland",
  "italy",
  "latvia",
  "lithuania",
  "luxembourg",
  "malta",
  "netherlands",
  "poland",
  "portugal",
  "czech_republic",
  "romania",
  "uk",
  "slovakia",
  "slovenia",
  "sweden",
  "iceland",
  "liechtenstein",
  "norway",
];

// APS stuff -- see visaTypes.js for spreadsheet
var apsAgreements = {
  masters: "Diplôme au moins équivalent au master obtenu dans un établissement français",
  mastersOrLicencePro: "Licence professionnelle ou diplôme au moins équivalent au master obtenus dans un établissement français",
  mastersLicenceProNotFrance: "Licence professionnelle ou diplôme au moins équivalent au master obtenus dans un établissement " +
      "français ou dans un établissement du pays d'origine dans le cadre d'une convention de délivrance de diplômes en partenariat international",
};
var balticSpecialAgreement = {
  applicable: true,
  accord_special: true,
  condition_de_diplome: apsAgreements.mastersLicenceProNotFrance,
  condition_de_duree: 12,
  renouvellement: false
};
module.exports.apsSpecialCountries = {
  "serbia": balticSpecialAgreement,
  "montenegro": balticSpecialAgreement,
  "bosnia_and_herzegovina": balticSpecialAgreement,
  "albania": balticSpecialAgreement,
  "macedonia": balticSpecialAgreement,
  "benin": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "burkina_faso": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenceProNotFrance,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "cameroon": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "cape_verde": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 9,
    renouvellement: false,
  },
  "congo": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 9,
    renouvellement: false,
  },
  "ivory_coast": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "gabon": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 9,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "india": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "lebanon": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.masters,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "macedonia": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "mali": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "morocco": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "mauritius": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenceProNotFrance,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
  "mauritania": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "montenegro": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenceProNotFrance,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "niger": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "central_african_republic": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "russia": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "senegal": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "serbia": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenceProNotFrance,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "togo": {
    applicable: true,
    accord_special: false,
    condition_de_diplome: apsAgreements.mastersOrLicencePro,
    condition_de_duree: 12,
    renouvellement: false,
  },
  "tunisia": {
    applicable: true,
    accord_special: true,
    condition_de_diplome: apsAgreements.mastersLicenceProNotFrance,
    condition_de_duree: 6,
    renouvellement: true,
    renouvellement_count: 1,
  },
};

// https://github.com/stefangabos/world_countries/blob/master/data/en/countries.csv
// https://docs.google.com/spreadsheets/d/1nfdoNN1nHEh_LigxJvGv3R0PFJgoNiHVKg5_E_oz7yk/edit?usp=sharing
// TODO: Saint Martin mix-ups possible
let countries = [
  { slug: "andorra", english: "Andorra", country_code: "ad", french: "Andorre" },
  { slug: "united_arab_emirates", english: "United Arab Emirates", country_code: "ae", french: "Émirats arabes unis" },
  { slug: "afghanistan", english: "Afghanistan", country_code: "af", french: "Afghanistan" },
  { slug: "antigua_and_barbuda", english: "Antigua and Barbuda", country_code: "ag", french: "Antigua-et-Barbuda" },
  { slug: "anguilla", english: "Anguilla", country_code: "ai", french: "Anguilla" },
  { slug: "albania", english: "Albania", country_code: "al", french: "Albanie" },
  { slug: "armenia", english: "Armenia", country_code: "am", french: "Arménie" },
  { slug: "angola", english: "Angola", country_code: "ao", french: "Angola" },
  { slug: "antarctica", english: "Antarctica", country_code: "aq", french: "Antarctique" },
  { slug: "argentina", english: "Argentina", country_code: "ar", french: "Argentine" },
  { slug: "american_samoa", english: "American Samoa", country_code: "as", french: "Samoa américaines" },
  { slug: "austria", english: "Austria", country_code: "at", french: "Autriche" },
  { slug: "australia", english: "Australia", country_code: "au", french: "Australie" },
  { slug: "aruba", english: "Aruba", country_code: "aw", french: "Aruba" },
  { slug: "aland_islands", english: "Åland Islands", country_code: "ax", french: "Îles Åland" },
  { slug: "azerbaijan", english: "Azerbaijan", country_code: "az", french: "Azerbaïdjan" },
  { slug: "bosnia_and_herzegovina", english: "Bosnia and Herzegovina", country_code: "ba", french: "Bosnie-Herzégovine" },
  { slug: "barbados", english: "Barbados", country_code: "bb", french: "Barbade" },
  { slug: "bangladesh", english: "Bangladesh", country_code: "bd", french: "Bangladesh" },
  { slug: "belgium", english: "Belgium", country_code: "be", french: "Belgique" },
  { slug: "burkina_faso", english: "Burkina Faso", country_code: "bf", french: "Burkina Faso" },
  { slug: "bulgaria", english: "Bulgaria", country_code: "bg", french: "Bulgarie" },
  { slug: "bahrain", english: "Bahrain", country_code: "bh", french: "Bahreïn" },
  { slug: "burundi", english: "Burundi", country_code: "bi", french: "Burundi" },
  { slug: "benin", english: "Benin", country_code: "bj", french: "Bénin" },
  { slug: "saint_barthelemy", english: "Saint Barthélemy", country_code: "bl", french: "Saint-Barthélemy" },
  { slug: "bermuda", english: "Bermuda", country_code: "bm", french: "Bermudes" },
  { slug: "brunei_darussalam", english: "Brunei Darussalam", country_code: "bn", french: "Brunei" },
  { slug: "bolivia", english: "Bolivia (Plurinational State of)", country_code: "bo", french: "Bolivie" },
  { slug: "bonaire_sint_eustatius_and_saba", english: "Bonaire, Sint Eustatius and Saba", country_code: "bq", french: "Pays-Bas caribéens" },
  { slug: "brazil", english: "Brazil", country_code: "br", french: "Brésil" },
  { slug: "bahamas", english: "Bahamas", country_code: "bs", french: "Bahamas" },
  { slug: "bhutan", english: "Bhutan", country_code: "bt", french: "Bhoutan" },
  { slug: "bouvet_island", english: "Bouvet Island", country_code: "bv", french: "Île Bouvet" },
  { slug: "botswana", english: "Botswana", country_code: "bw", french: "Botswana" },
  { slug: "belarus", english: "Belarus", country_code: "by", french: "Biélorussie" },
  { slug: "belize", english: "Belize", country_code: "bz", french: "Belize" },
  { slug: "canada", english: "Canada", country_code: "ca", french: "Canada" },
  { slug: "cocos_keeling_islands", english: "Cocos (Keeling) Islands", country_code: "cc", french: "Îles Cocos" },
  { slug: "congo", english: "Congo (Democratic Republic of the)", country_code: "cd", french: "République démocratique du Congo" },
  { slug: "central_african_republic", english: "Central African Republic", country_code: "cf", french: "République centrafricaine" },
  { slug: "congo", english: "Congo", country_code: "cg", french: "République du Congo" },
  { slug: "switzerland", english: "Switzerland", country_code: "ch", french: "Suisse" },
  { slug: "ivory_coast", english: "Côte d'Ivoire", country_code: "ci", french: "Côte d'Ivoire", alternatives: ["Ivory coast"] },
  { slug: "cook_islands", english: "Cook Islands", country_code: "ck", french: "Îles Cook" },
  { slug: "chile", english: "Chile", country_code: "cl", french: "Chili" },
  { slug: "cameroon", english: "Cameroon", country_code: "cm", french: "Cameroun" },
  { slug: "china", english: "China", country_code: "cn", french: "Chine" },
  { slug: "colombia", english: "Colombia", country_code: "co", french: "Colombie" },
  { slug: "costa_rica", english: "Costa Rica", country_code: "cr", french: "Costa Rica" },
  { slug: "cuba", english: "Cuba", country_code: "cu", french: "Cuba" },
  { slug: "cape_verde", english: "Cape Verde", country_code: "cv", french: "Cap-Vert" },
  { slug: "curacao", english: "Curaçao", country_code: "cw", french: "Curaçao" },
  { slug: "christmas_island", english: "Christmas Island", country_code: "cx", french: "Île Christmas" },
  { slug: "cyprus", english: "Cyprus", country_code: "cy", french: "Chypre" },
  { slug: "czechia", english: "Czechia", country_code: "cz", french: "Tchéquie" },
  { slug: "germany", english: "Germany", country_code: "de", french: "Allemagne" },
  { slug: "djibouti", english: "Djibouti", country_code: "dj", french: "Djibouti" },
  { slug: "denmark", english: "Denmark", country_code: "dk", french: "Danemark" },
  { slug: "dominica", english: "Dominica", country_code: "dm", french: "Dominique" },
  { slug: "dominican_republic", english: "Dominican Republic", country_code: "do", french: "République dominicaine" },
  { slug: "algeria", english: "Algeria", country_code: "dz", french: "Algérie" },
  { slug: "ecuador", english: "Ecuador", country_code: "ec", french: "Équateur" },
  { slug: "estonia", english: "Estonia", country_code: "ee", french: "Estonie" },
  { slug: "egypt", english: "Egypt", country_code: "eg", french: "Égypte" },
  { slug: "western_sahara", english: "Western Sahara", country_code: "eh", french: "République arabe sahraouie démocratique" },
  { slug: "eritrea", english: "Eritrea", country_code: "er", french: "Érythrée" },
  { slug: "spain", english: "Spain", country_code: "es", french: "Espagne" },
  { slug: "ethiopia", english: "Ethiopia", country_code: "et", french: "Éthiopie" },
  { slug: "finland", english: "Finland", country_code: "fi", french: "Finlande" },
  { slug: "fiji", english: "Fiji", country_code: "fj", french: "Fidji" },
  { slug: "falkland_islands", english: "Falkland Islands (Malvinas)", country_code: "fk", french: "Malouines" },
  { slug: "micronesia", english: "Micronesia (Federated States of)", country_code: "fm", french: "Micronésie" },
  { slug: "faroe_islands", english: "Faroe Islands", country_code: "fo", french: "Îles Féroé" },
  { slug: "france", english: "France", country_code: "fr", french: "France" },
  { slug: "gabon", english: "Gabon", country_code: "ga", french: "Gabon" },
  { slug: "uk", english: "United Kingdom of Great Britain and Northern Ireland", country_code: "gb", french: "Royaume-Uni" },
  { slug: "grenada", english: "Grenada", country_code: "gd", french: "Grenade" },
  { slug: "georgia", english: "Georgia", country_code: "ge", french: "Géorgie" },
  { slug: "french_guiana", english: "French Guiana", country_code: "gf", french: "Guyane" },
  { slug: "guernsey", english: "Guernsey", country_code: "gg", french: "Guernesey" },
  { slug: "ghana", english: "Ghana", country_code: "gh", french: "Ghana" },
  { slug: "gibraltar", english: "Gibraltar", country_code: "gi", french: "Gibraltar" },
  { slug: "greenland", english: "Greenland", country_code: "gl", french: "Groenland" },
  { slug: "gambia", english: "Gambia", country_code: "gm", french: "Gambie" },
  { slug: "guinea", english: "Guinea", country_code: "gn", french: "Guinée" },
  { slug: "guadeloupe", english: "Guadeloupe", country_code: "gp", french: "Guadeloupe" },
  { slug: "equatorial_guinea", english: "Equatorial Guinea", country_code: "gq", french: "Guinée équatoriale" },
  { slug: "greece", english: "Greece", country_code: "gr", french: "Grèce" },
  { slug: "south_georgia_and_the_south_sandwich_islands", english: "South Georgia and the South Sandwich Islands", country_code: "gs", french: "Géorgie du Sud-et-les Îles Sandwich du Sud" },
  { slug: "guatemala", english: "Guatemala", country_code: "gt", french: "Guatemala" },
  { slug: "guam", english: "Guam", country_code: "gu", french: "Guam" },
  { slug: "guinea_bissau", english: "Guinea-Bissau", country_code: "gw", french: "Guinée-Bissau" },
  { slug: "guyana", english: "Guyana", country_code: "gy", french: "Guyana" },
  { slug: "hong_kong", english: "Hong Kong", country_code: "hk", french: "Hong Kong" },
  { slug: "heard_island_and_mcdonald_islands", english: "Heard Island and McDonald Islands", country_code: "hm", french: "Îles Heard-et-MacDonald" },
  { slug: "honduras", english: "Honduras", country_code: "hn", french: "Honduras" },
  { slug: "croatia", english: "Croatia", country_code: "hr", french: "Croatie" },
  { slug: "haiti", english: "Haiti", country_code: "ht", french: "Haïti" },
  { slug: "hungary", english: "Hungary", country_code: "hu", french: "Hongrie" },
  { slug: "indonesia", english: "Indonesia", country_code: "id", french: "Indonésie" },
  { slug: "ireland", english: "Ireland", country_code: "ie", french: "Irlande" },
  { slug: "israel", english: "Israel", country_code: "il", french: "Israël" },
  { slug: "isle_of_man", english: "Isle of Man", country_code: "im", french: "Île de Man" },
  { slug: "india", english: "India", country_code: "in", french: "india" },
  { slug: "british_indian_ocean_territory", english: "British Indian Ocean Territory", country_code: "io", french: "Territoire britannique de l'océan Indien" },
  { slug: "iraq", english: "Iraq", country_code: "iq", french: "Irak" },
  { slug: "iran", english: "Iran (Islamic Republic of)", country_code: "ir", french: "Iran" },
  { slug: "iceland", english: "Iceland", country_code: "is", french: "Islande" },
  { slug: "italy", english: "Italy", country_code: "it", french: "Italie" },
  { slug: "jersey", english: "Jersey", country_code: "je", french: "Jersey" },
  { slug: "jamaica", english: "Jamaica", country_code: "jm", french: "Jamaïque" },
  { slug: "jordan", english: "Jordan", country_code: "jo", french: "Jordanie" },
  { slug: "japan", english: "Japan", country_code: "jp", french: "Japon" },
  { slug: "kenya", english: "Kenya", country_code: "ke", french: "Kenya" },
  { slug: "kyrgyzstan", english: "Kyrgyzstan", country_code: "kg", french: "Kirghizistan" },
  { slug: "cambodia", english: "Cambodia", country_code: "kh", french: "Cambodge" },
  { slug: "kiribati", english: "Kiribati", country_code: "ki", french: "Kiribati" },
  { slug: "comoros", english: "Comoros", country_code: "km", french: "Comores" },
  { slug: "saint_kitts_and_nevis", english: "Saint Kitts and Nevis", country_code: "kn", french: "Saint-Christophe-et-Niévès" },
  { slug: "north_korea", english: "Korea (Democratic People's Republic of)", country_code: "kp", french: "Corée du Nord", alternatives: ["North Korea"] },
  { slug: "south_korea", english: "Korea (Republic of)", country_code: "kr", french: "Corée du Sud", alternatives: ["South Korea"] },
  { slug: "kuwait", english: "Kuwait", country_code: "kw", french: "Koweït" },
  { slug: "cayman_islands", english: "Cayman Islands", country_code: "ky", french: "Îles Caïmans" },
  { slug: "kazakhstan", english: "Kazakhstan", country_code: "kz", french: "Kazakhstan" },
  { slug: "laos", english: "Lao People's Democratic Republic", country_code: "la", french: "Laos" },
  { slug: "lebanon", english: "Lebanon", country_code: "lb", french: "lebanon" },
  { slug: "saint_lucia", english: "Saint Lucia", country_code: "lc", french: "Sainte-Lucie" },
  { slug: "liechtenstein", english: "Liechtenstein", country_code: "li", french: "Liechtenstein" },
  { slug: "sri_lanka", english: "Sri Lanka", country_code: "lk", french: "Sri Lanka" },
  { slug: "liberia", english: "Liberia", country_code: "lr", french: "Liberia" },
  { slug: "lesotho", english: "Lesotho", country_code: "ls", french: "Lesotho" },
  { slug: "lithuania", english: "Lithuania", country_code: "lt", french: "Lituanie" },
  { slug: "luxembourg", english: "Luxembourg", country_code: "lu", french: "Luxembourg" },
  { slug: "latvia", english: "Latvia", country_code: "lv", french: "Lettonie" },
  { slug: "libya", english: "Libya", country_code: "ly", french: "Libye" },
  { slug: "morocco", english: "Morocco", country_code: "ma", french: "Maroc" },
  { slug: "monaco", english: "Monaco", country_code: "mc", french: "Monaco" },
  { slug: "moldova", english: "Moldova (Republic of)", country_code: "md", french: "Moldavie" },
  { slug: "montenegro", english: "Montenegro", country_code: "me", french: "Monténégro" },
  { slug: "saint_martin", english: "Saint Martin (French part)", country_code: "mf", french: "Saint-Martin" },
  { slug: "madagascar", english: "Madagascar", country_code: "mg", french: "Madagascar" },
  { slug: "marshall_islands", english: "Marshall Islands", country_code: "mh", french: "Îles Marshall" },
  { slug: "macedonia", english: "Macedonia (the former Yugoslav Republic of)", country_code: "mk", french: "Macédoine" },
  { slug: "mali", english: "Mali", country_code: "ml", french: "Mali" },
  { slug: "myanmar", english: "Myanmar", country_code: "mm", french: "Birmanie" },
  { slug: "mongolia", english: "Mongolia", country_code: "mn", french: "Mongolie" },
  { slug: "macao", english: "Macao", country_code: "mo", french: "Macao" },
  { slug: "northern_mariana_islands", english: "Northern Mariana Islands", country_code: "mp", french: "Îles Mariannes du Nord" },
  { slug: "martinique", english: "Martinique", country_code: "mq", french: "Martinique" },
  { slug: "mauritania", english: "Mauritania", country_code: "mr", french: "Mauritanie" },
  { slug: "montserrat", english: "Montserrat", country_code: "ms", french: "Montserrat" },
  { slug: "malta", english: "Malta", country_code: "mt", french: "Malte" },
  { slug: "mauritius", english: "Mauritius", country_code: "mu", french: "Maurice" },
  { slug: "maldives", english: "Maldives", country_code: "mv", french: "Maldives" },
  { slug: "malawi", english: "Malawi", country_code: "mw", french: "Malawi" },
  { slug: "mexico", english: "Mexico", country_code: "mx", french: "Mexique" },
  { slug: "malaysia", english: "Malaysia", country_code: "my", french: "Malaisie" },
  { slug: "mozambique", english: "Mozambique", country_code: "mz", french: "Mozambique" },
  { slug: "namibia", english: "Namibia", country_code: "na", french: "Namibie" },
  { slug: "new_caledonia", english: "New Caledonia", country_code: "nc", french: "Nouvelle-Calédonie" },
  { slug: "niger", english: "Niger", country_code: "ne", french: "Niger" },
  { slug: "norfolk_island", english: "Norfolk Island", country_code: "nf", french: "Île Norfolk" },
  { slug: "nigeria", english: "Nigeria", country_code: "ng", french: "Nigeria" },
  { slug: "nicaragua", english: "Nicaragua", country_code: "ni", french: "Nicaragua" },
  { slug: "netherlands", english: "Netherlands", country_code: "nl", french: "Pays-Bas" },
  { slug: "norway", english: "Norway", country_code: "no", french: "Norvège" },
  { slug: "nepal", english: "Nepal", country_code: "np", french: "Népal" },
  { slug: "nauru", english: "Nauru", country_code: "nr", french: "Nauru" },
  { slug: "niue", english: "Niue", country_code: "nu", french: "Niue" },
  { slug: "new_zealand", english: "New Zealand", country_code: "nz", french: "Nouvelle-Zélande" },
  { slug: "oman", english: "Oman", country_code: "om", french: "Oman" },
  { slug: "panama", english: "Panama", country_code: "pa", french: "Panama" },
  { slug: "peru", english: "Peru", country_code: "pe", french: "Pérou" },
  { slug: "french_polynesia", english: "French Polynesia", country_code: "pf", french: "Polynésie française" },
  { slug: "papua_new_guinea", english: "Papua New Guinea", country_code: "pg", french: "Papouasie-Nouvelle-Guinée" },
  { slug: "philippines", english: "Philippines", country_code: "ph", french: "Philippines" },
  { slug: "pakistan", english: "Pakistan", country_code: "pk", french: "Pakistan" },
  { slug: "poland", english: "Poland", country_code: "pl", french: "Pologne" },
  { slug: "saint_pierre_and_miquelon", english: "Saint Pierre and Miquelon", country_code: "pm", french: "Saint-Pierre-et-Miquelon" },
  { slug: "pitcairn", english: "Pitcairn", country_code: "pn", french: "Îles Pitcairn" },
  { slug: "puerto_rico", english: "Puerto Rico", country_code: "pr", french: "Porto Rico" },
  { slug: "palestine", english: "Palestine, State of", country_code: "ps", french: "Palestine" },
  { slug: "portugal", english: "Portugal", country_code: "pt", french: "Portugal" },
  { slug: "palau", english: "Palau", country_code: "pw", french: "Palaos" },
  { slug: "paraguay", english: "Paraguay", country_code: "py", french: "Paraguay" },
  { slug: "qatar", english: "Qatar", country_code: "qa", french: "Qatar" },
  { slug: "reunion", english: "Réunion", country_code: "re", french: "La Réunion" },
  { slug: "romania", english: "Romania", country_code: "ro", french: "Roumanie" },
  { slug: "serbia", english: "Serbia", country_code: "rs", french: "Serbie" },
  { slug: "russian_federation", english: "Russian Federation", country_code: "ru", french: "Russie" },
  { slug: "rwanda", english: "Rwanda", country_code: "rw", french: "Rwanda" },
  { slug: "saudi_arabia", english: "Saudi Arabia", country_code: "sa", french: "Arabie saoudite" },
  { slug: "solomon_islands", english: "Solomon Islands", country_code: "sb", french: "Salomon" },
  { slug: "seychelles", english: "Seychelles", country_code: "sc", french: "Seychelles" },
  { slug: "sudan", english: "Sudan", country_code: "sd", french: "Soudan" },
  { slug: "sweden", english: "Sweden", country_code: "se", french: "Suède" },
  { slug: "singapore", english: "Singapore", country_code: "sg", french: "Singapour" },
  { slug: "saint_helena", english: "Saint Helena, Ascension and Tristan da Cunha", country_code: "sh", french: "Sainte-Hélène, Ascension et Tristan da Cunha" },
  { slug: "slovenia", english: "Slovenia", country_code: "si", french: "Slovénie" },
  { slug: "svalbard_and_jan_mayen", english: "Svalbard and Jan Mayen", country_code: "sj", french: "Svalbard et ile Jan Mayen" },
  { slug: "slovakia", english: "Slovakia", country_code: "sk", french: "Slovaquie" },
  { slug: "sierra_leone", english: "Sierra Leone", country_code: "sl", french: "Sierra Leone" },
  { slug: "san_marino", english: "San Marino", country_code: "sm", french: "Saint-Marin" },
  { slug: "senegal", english: "Senegal", country_code: "sn", french: "Sénégal" },
  { slug: "somalia", english: "Somalia", country_code: "so", french: "Somalie" },
  { slug: "suriname", english: "Suriname", country_code: "sr", french: "Suriname" },
  { slug: "south_sudan", english: "South Sudan", country_code: "ss", french: "Soudan du Sud" },
  { slug: "sao_tome_and_principe", english: "Sao Tome and Principe", country_code: "st", french: "Sao Tomé-et-Principe" },
  { slug: "el_salvador", english: "El Salvador", country_code: "sv", french: "Salvador" },
  { slug: "sint_maarten", english: "Sint Maarten (Dutch part)", country_code: "sx", french: "Saint-Martin" },
  { slug: "syrian_arab_republic", english: "Syrian Arab Republic", country_code: "sy", french: "Syrie" },
  { slug: "swaziland", english: "Swaziland", country_code: "sz", french: "Swaziland" },
  { slug: "turks_and_caicos_islands", english: "Turks and Caicos Islands", country_code: "tc", french: "Îles Turks-et-Caïcos" },
  { slug: "chad", english: "Chad", country_code: "td", french: "Tchad" },
  { slug: "french_southern_territories", english: "French Southern Territories", country_code: "tf", french: "Terres australes et antarctiques françaises" },
  { slug: "togo", english: "Togo", country_code: "tg", french: "Togo" },
  { slug: "thailand", english: "Thailand", country_code: "th", french: "Thaïlande" },
  { slug: "tajikistan", english: "Tajikistan", country_code: "tj", french: "Tadjikistan" },
  { slug: "tokelau", english: "Tokelau", country_code: "tk", french: "Tokelau" },
  { slug: "timor_leste", english: "Timor-Leste", country_code: "tl", french: "Timor oriental" },
  { slug: "turkmenistan", english: "Turkmenistan", country_code: "tm", french: "Turkménistan" },
  { slug: "tunisia", english: "Tunisia", country_code: "tn", french: "Tunisie" },
  { slug: "tonga", english: "Tonga", country_code: "to", french: "Tonga" },
  { slug: "turkey", english: "Turkey", country_code: "tr", french: "Turquie" },
  { slug: "trinidad_and_tobago", english: "Trinidad and Tobago", country_code: "tt", french: "Trinité-et-Tobago" },
  { slug: "tuvalu", english: "Tuvalu", country_code: "tv", french: "Tuvalu" },
  { slug: "taiwan", english: "Taiwan, Province of China", country_code: "tw", french: "Taïwan / (République de Chine (Taïwan))" },
  { slug: "tanzania", english: "Tanzania, United Republic of", country_code: "tz", french: "Tanzanie" },
  { slug: "ukraine", english: "Ukraine", country_code: "ua", french: "Ukraine" },
  { slug: "uganda", english: "Uganda", country_code: "ug", french: "Ouganda" },
  { slug: "united_states_minor_outlying_islands", english: "United States Minor Outlying Islands", country_code: "um", french: "Îles mineures éloignées des États-Unis" },
  { slug: "usa", english: "United States of America", country_code: "us", french: "États-Unis", alternatives: ["USA", "US", "United States", "America", "American"] },
  { slug: "uruguay", english: "Uruguay", country_code: "uy", french: "Uruguay" },
  { slug: "uzbekistan", english: "Uzbekistan", country_code: "uz", french: "Ouzbékistan" },
  { slug: "holy_see", english: "Holy See", country_code: "va", french: "Saint-Siège (État de la Cité du Vatican)" },
  { slug: "saint_vincent_and_the_grenadines", english: "Saint Vincent and the Grenadines", country_code: "vc", french: "Saint-Vincent-et-les Grenadines" },
  { slug: "venezuela", english: "Venezuela (Bolivarian Republic of)", country_code: "ve", french: "Venezuela" },
  { slug: "british_virgin_islands", english: "Virgin Islands (British)", country_code: "vg", french: "Îles Vierges britanniques" },
  { slug: "us_virgin_islands", english: "Virgin Islands (U.S.)", country_code: "vi", french: "Îles Vierges des États-Unis" },
  { slug: "viet_nam", english: "Viet Nam", country_code: "vn", french: "Viêt Nam" },
  { slug: "vanuatu", english: "Vanuatu", country_code: "vu", french: "Vanuatu" },
  { slug: "wallis_and_futuna", english: "Wallis and Futuna", country_code: "wf", french: "Wallis-et-Futuna" },
  { slug: "samoa", english: "Samoa", country_code: "ws", french: "Samoa" },
  { slug: "yemen", english: "Yemen", country_code: "ye", french: "Yémen" },
  { slug: "mayotte", english: "Mayotte", country_code: "yt", french: "Mayotte" },
  { slug: "south_africa", english: "South Africa", country_code: "za", french: "Afrique du Sud" },
  { slug: "zambia", english: "Zambia", country_code: "zm", french: "Zambie" },
  { slug: "zimbabwe", english: "Zimbabwe", country_code: "zw", french: "Zimbabwe" },
];

module.exports.countries = countries;
