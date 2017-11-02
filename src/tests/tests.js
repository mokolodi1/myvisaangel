"use strict"

// require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
var qs = require('qs');

var tdsTypes = require("../tdsTypes.js");
var Utilities = require("../utilities.js");

chai.use(chaiHttp);

var silentLiveChat = {
  redirect_to_blocks: ["Silent creators respond"],
  set_attributes: {
    nlp_disabled: "yes",
  },
};

describe('My Visa Bot API', () => {
  describe("Make sure the internals work...", () => {
    // Tests for APS

    describe('APS visa', () => {
      it('should return not eligible for Algerians', (done) => {
        let result = tdsTypes.aps.eligible({
          nationality: "algeria"
        });

        should.equal(result, undefined);

        done();
      });

      it("should return eligible with Special Agreement " +
          "(condition_de_duree et condition_de_diplome qui changent)", (done) => {
        let result = tdsTypes.aps.eligible({
          nationality: "congo",
          currentTDS: "student",
          diploma: "licence_pro",
        });

        result.should.be.deep.eql({
          messages: [
            {
              text: "⚠️ Attention, ton pays a un accord spécial avec la " +
                  "France qui change les choses suivantes pour l'APS :\n" +
                  "Condition de durée : 9 mois à la place de 12\n" +
                  "Condition de diplôme : Diplôme au moins équivalent " +
                  "au master obtenu dans un établissement français.\n"
            },
          ],
        })

        done();
      });

      it("should return eligible with Special Agreement " +
          "(condition_de_duree, condition_de_diplome et renouvellement qui changent)", (done) => {
        let result = tdsTypes.aps.eligible({
          nationality: "gabon",
          currentTDS: "student",
          diploma: "licence_pro",
        });

        result.should.be.deep.eql({
          messages: [
            {
              text: "⚠️ Attention, ton pays a un accord spécial avec la " +
                  "France qui change les choses suivantes pour l'APS :\n" +
                  "Condition de durée : 9 mois à la place de 12\n" +
                  "Renouvellement : renouvelable une fois\n" +
                  "Condition de diplôme : Licence professionnelle ou " +
                  "diplôme au moins équivalent au master obtenus dans un " +
                  "établissement français.\n"
            }
          ],
        });

        done();
      });

      it('should return eligible for Colombian students w/ diploma', (done) => {
        let result = tdsTypes.aps.eligible({
          nationality: "colombia",
          currentTDS: "student",
          diploma: "licence_pro",
        });

        result.should.be.deep.eql({});

        done();
      });
    });

    describe('Vie privée et familiale visa', () => {
      it('should return eligible for Pacsed people', (done) => {
        let result = tdsTypes.vpf.eligible({
          familySituation: "pacsed",
        });

        result.should.be.deep.eql({});

        done();
      });

      it('should return not eligible for single people', (done) => {
        let result = tdsTypes.vpf.eligible({
          familySituation: "single",
        });

        should.equal(result, undefined);

        done();
      });
    });

    describe('Passeport Talent Salarié Qualifié visa', () => {
      it('should return eligible for Master, CDI, >35526,4€ (2x SMIC) people', (done) => {
        let result = tdsTypes.ptsq.eligible({
          diploma: "masters",
          smicMultiplier: 2,
          employmentSituation: "cdi"
        });

        result.should.be.deep.eql({});

        done();
      });

      it('should return not eligible for Equivalent au Master, CDI, >26645€ (1,5x SMIC) people', (done) => {
        let result = tdsTypes.ptsq.eligible({
          diploma: "masters",
          smicMultiplier: 1.5,
          employmentSituation: "cdi"
        });

        should.equal(result, undefined);

        done();
      });
    });

    describe('Salarié visa', () => {
      it('should return eligible for CDI', (done) => {
        let result = tdsTypes.salarie_tt.eligible({
          employmentSituation: "cdi",
          smicMultiplier: 1.5,
        });

        result.should.be.deep.eql({});

        done();
      });

      it('should return eligible for CDI (with warning for salary)', (done) => {
        let result = tdsTypes.salarie_tt.eligible({
          employmentSituation: "cdi",
          smicMultiplier: 1,
        });

        result.should.be.deep.eql({
          messages: [
            {
              text: "⚠️ Attention, tu es éligible au titre de séjour " +
              "salarié mais vu que tu ne gagnes pas plus de 1,5smic tu " +
              "seras opposable à l'emploi, c'est-à-dire " +
              "qu'à moins d'exercer un métier dit en tension (manque de " +
              "main d'oeuvre), la situation de chômage en France sera " +
              "prise en compte par l'administration dans sa décision. " +
              "Pour plus d'informations, regarde cette notice : " +
              "https://docs.google.com/document/d/1lb-4yLRCsyLbEVO_xUxDn" +
              "UOHiBF5HC9IJTWA86_JDwo/edit?usp=sharing\n"
            }
          ],
        });

        done();
      });

      it('should return eligible for CDD (with warning for license classique)', (done) => {
        let result = tdsTypes.salarie_tt.eligible({
          employmentSituation: "cdi",
          diploma: "licence_classique",
        });

        result.should.be.deep.eql({
          messages: [
            {
              text: "⚠️ Attention, tu es éligible au titre de séjour " +
              "salarié mais vu que tu as une licence classique tu seras " +
              "opposable à l'emploi, c'est-à-dire " +
              "qu'à moins d'exercer un métier dit en tension (manque de " +
              "main d'oeuvre), la situation de chômage en France sera " +
              "prise en compte par l'administration dans sa décision. " +
              "Pour plus d'informations, regarde cette notice : " +
              "https://docs.google.com/document/d/1lb-4yLRCsyLbEVO_xUxDn" +
              "UOHiBF5HC9IJTWA86_JDwo/edit?usp=sharing\n"
            }
          ],
        });

        done();
      });

      it('should return eligible for CDI (with warning for license classique, salary)', (done) => {
        let result = tdsTypes.salarie_tt.eligible({
          employmentSituation: "cdi",
          smicMultiplier: 1,
          diploma: "licence_classique",
        });

        result.should.be.deep.eql({
          messages: [
            {
              text: "⚠️ Attention, tu es éligible au titre de séjour " +
              "salarié mais vu que tu ne gagnes pas plus de 1,5smic et " +
              "que tu as une licence classique tu seras opposable à " +
              "l'emploi, c'est-à-dire " +
              "qu'à moins d'exercer un métier dit en tension (manque de " +
              "main d'oeuvre), la situation de chômage en France sera " +
              "prise en compte par l'administration dans sa décision. " +
              "Pour plus d'informations, regarde cette notice : " +
              "https://docs.google.com/document/d/1lb-4yLRCsyLbEVO_xUxDn" +
              "UOHiBF5HC9IJTWA86_JDwo/edit?usp=sharing\n"
            }
          ],
        });

        done();
      });

      it('should return not eligible for unknown employment', (done) => {
        let result = tdsTypes.salarie_tt.eligible({
          employmentSituation: "doesnt_know"
        });

        should.equal(result, undefined);

        done();
      });
    });

    describe('Commercant visa', () => {
      it('should return eligible for entrepreneur', (done) => {
        let result = tdsTypes.commercant.eligible({
          employmentSituation: "entrepreneur"
        });

        result.should.be.deep.eql({});

        done();
      });

      it('should return not eligible for CDD', (done) => {
        let result = tdsTypes.commercant.eligible({
          employmentSituation: "cdd"
        });

        should.equal(result, undefined);

        done();
      });
    });

    describe("Utilities", () => {
      it("should work: tdsFromRecast", () => {
        should.equal(Utilities.tdsFromRecast("passport_talent"), "ptsq");
        should.equal(Utilities.tdsFromRecast("asdfasdfasdf"), undefined);
      });
    });
  });


  describe("Check to see if some general/dev-ops stuff works...", () => {
    it("should be able able to recover from a crash", (done) => {
      chai.request(server)
        .get('/private/crash')
        .end((err, response) => {
          console.log("err:", err);
          done();
      });
    });

    it("should be able to get an image", function (done) {
      chai.request(server)
        .get('/static/aps.jpg')
        .end((err, response) => {
          response.should.have.status(200);
          // TODO: check image data

          done();
        });
    });
  });


  describe("Make sure the API works...", () => {
    describe('/GET /v1/ping', () => {
      it('should return { pong: "It works!" }', (done) => {
        chai.request(server)
          .get('/v1/ping')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.have.property('pong').eql('It works!');

            done();
        });
      });
    });

    describe('/GET /v1/get_visas', () => {
      it('should work: US, CDI, 2xSMIC, student, masters, single', (done) => {
        chai.request(server)
          .get('/v1/get_visas?' + qs.stringify({
            nationality: "usa",
            currentTDS: "Étudiant",
            diploma: "Master",
            employmentSituation: "CDI",
            familySituation: "Célibataire",
            salary: ">35526,4€ (2x SMIC)",
          }))
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');

            response.body.should.be.deep.eql({
              messages: [
                {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "generic",
                      elements: [
                        {
                          title: "APS",
                          subtitle: "L'APS te permet de chercher, exercer " +
                              "un emploi ou créer une entreprise",
                          buttons: [
                            {
                              type: "show_block",
                              title: "Fiche récapitulative",
                              block_names: [
                                "TDS all info",
                              ],
                              set_attributes: {
                                selected_tds: "aps"
                              },
                            },
                            {
                              block_names: [
                                "Dossier submission method"
                              ],
                              set_attributes: {
                                selected_tds: "aps",
                              },
                              title: "Comment déposer",
                              type: "show_block",
                            },
                            {
                              block_names: [
                                "Dossier papers list"
                              ],
                              set_attributes: {
                                selected_tds: "aps",
                              },
                              title: "Voir liste papiers",
                              type: "show_block",
                            },
                          ],
                          image_url: "http://dev.myvisaangel.com/static/aps.jpg",
                        },
                        {
                          "buttons": [
                            {
                              type: "show_block",
                              title: "Fiche récapitulative",
                              block_names: [
                                "TDS all info",
                              ],
                              set_attributes: {
                                selected_tds: "ptsq"
                              },
                            },
                            {
                              block_names: [
                                "Dossier submission method"
                              ],
                              set_attributes: {
                                selected_tds: "ptsq",
                              },
                              title: "Comment déposer",
                              type: "show_block",
                            },
                            {
                              block_names: [
                                "Dossier papers list"
                              ],
                              set_attributes: {
                                selected_tds: "ptsq",
                              },
                              title: "Voir liste papiers",
                              type: "show_block",
                            },
                          ],
                          "subtitle": "Ce titre pluriannuel t'autorise à " +
                              "travailler, créer une entreprise ou investir",
                          "title": "Passeport Talent Salarié Qualifié",
                          image_url: "http://dev.myvisaangel.com/static/ptsq.jpg",
                        },
                      ],
                    }
                  }
                },
                {
                  text: "Tu as encore des questions ? Écris ta question " +
                      "directement ci-dessous.\n" +
                      "Par exemple : Comment déposer un dossier pour le " +
                      "passeport talent à Nanterre ?",
                }
              ],
              set_attributes: {
                recommended_tds: "aps|ptsq"
              },
            });

            done();
        });
      });

      it('should work: tunisia, Étudiant, Licence pro, Je ne sais pas, Célibataire, 1.5x SMIC', (done) => {
        chai.request(server)
          .get('/v1/get_visas?' + qs.stringify({
            nationality: "tunisia",
            currentTDS: "Étudiant",
            diploma: "Licence pro",
            employmentSituation: "Je ne sais pas",
            familySituation: "Célibataire",
            salary: ">26645€ (1,5x SMIC)",
          }))
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "⚠️ Attention, ton pays a un accord spécial avec la " +
                  "France qui change les choses suivantes pour l\'APS :\n" +
                  "Condition de durée : 6 mois à la place de 12\n" +
                  "Renouvellement : renouvelable une fois\n" +
                  "Condition de diplôme : Licence professionnelle ou " +
                  "diplôme au moins équivalent au master obtenus dans un " +
                  "établissement français ou dans un établissement du pays " +
                  "d\'origine dans le cadre d\'une convention de délivrance " +
                  "de diplômes en partenariat international.\n"
                },
                {
                  attachment: {
                    type: "template",
                    payload: {
                      template_type: "generic",
                      elements: [
                        {
                          title: "APS",
                          subtitle: "L'APS te permet de chercher, exercer " +
                              "un emploi ou créer une entreprise",
                          buttons: [
                            {
                              type: "show_block",
                              title: "Fiche récapitulative",
                              block_names: [
                                "TDS all info",
                              ],
                              set_attributes: {
                                selected_tds: "aps"
                              },
                            },
                            {
                              block_names: [
                                "Dossier submission method"
                              ],
                              set_attributes: {
                                selected_tds: "aps",
                              },
                              title: "Comment déposer",
                              type: "show_block",
                            },
                            {
                              block_names: [
                                "Dossier papers list",
                              ],
                              set_attributes: {
                                selected_tds: "aps",
                              },
                              title: "Voir liste papiers",
                              type: "show_block",
                            },
                          ],
                          image_url: "http://dev.myvisaangel.com/static/aps.jpg",
                        },
                      ],
                    }
                  }
                },
                {
                  text: "Tu as encore des questions ? Écris ta question " +
                      "directement ci-dessous.\n" +
                      "Par exemple : Comment déposer un dossier pour le " +
                      "passeport talent à Nanterre ?",
                }
              ],
              set_attributes: {
                recommended_tds: "aps"
              },
            });

            done();
        });
      });

      it('should work: Senegal, je ne sais pas, 1xSMIC, APS, Masters, single', (done) => {
        chai.request(server)
          .get('/v1/get_visas?' + qs.stringify({
            nationality: "senegal",
            currentTDS: "APS",
            diploma: "Master",
            employmentSituation: "Je ne sais pas",
            familySituation: "Célibataire",
            salary: ">17764€ (1x SMIC)",
          }))
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');

            response.body.should.be.deep.eql({
              redirect_to_blocks: [
                'No recommendation'
              ]
            });

            done();
        });
      });
    });

    describe('/GET /v1/parse_nationality', () => {
      it('should work for usa', (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=usa')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                nationality: "usa",
                validated_nationality: "yes",
              }
            });

            done();
        });
      });

      it('should work for Mexique', (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=Mexique')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                nationality: "mexico",
                validated_nationality: "yes",
              }
            });

            done();
        });
      });

      it('should ask again if they spell it super wrong', (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=Meiqxiko')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Je n'arrive pas à comprendre 😔. Vérifie " +
                  "l'orthographe stp et dis-moi à nouveau de quel pays " +
                  "tu viens."
                }
              ],
              set_attributes: {
                validated_nationality: "no",
              },
            });

            done();
        });
      });

      it('should ask again if they spell it super wrong spaces', (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=Je+suis+de+Meiqxiko')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Je n'arrive pas à comprendre 😔. Vérifie " +
                  "l'orthographe stp et dis-moi à nouveau de quel pays " +
                  "tu viens."
                },
                {
                  text: "Essaye d'envoyer seulement le nom de ton pays " +
                  "d'origine."
                }
              ],
              set_attributes: {
                validated_nationality: "no",
              },
            });

            done();
        });
      });

      it("should ask them to specify if it's relatively close", (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=Marooc')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Est-ce que tu voulais dire Maroc ?",
                  quick_replies: [
                    {
                      title: "Oui 😀",
                      set_attributes: {
                        nationality: "morocco",
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
              ]
            });

            done();
        });
      });

      it("shouldn't work with a string like ma", (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=ma')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "De quel pays exactement parles-tu ?",
                  quick_replies: [
                    {
                      title: "Macédoine",
                      set_attributes: {
                        nationality: "macedonia",
                        validated_nationality: "yes",
                      },
                    },
                    {
                      title: "Malte",
                      set_attributes: {
                        nationality: "malta",
                        validated_nationality: "yes"
                      },
                    },
                    {
                      title: "Mauritanie",
                      set_attributes: {
                        nationality: "mauritania",
                        validated_nationality: "yes"
                      },
                    },
                    {
                      title: "Maurice",
                      set_attributes: {
                        nationality: "mauritius",
                        validated_nationality: "yes"
                      },
                    },
                    {
                      title: "Martinique",
                      set_attributes: {
                        nationality: "martinique",
                        validated_nationality: "yes"
                      },
                    },
                    {
                      title: "Autre",
                      set_attributes: { validated_nationality: "no" },
                    },
                  ],
                },
              ],
            });

            done();
        });
      });

      it("shouldn't work with a blank string", (done) => {
        chai.request(server)
          .get('/v1/parse_nationality?nationality=')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql(silentLiveChat);

            done();
        });
      });

      it("shouldn't work return an error if no nationality specified", (done) => {
        chai.request(server)
          .get('/v1/parse_nationality')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql(silentLiveChat);

            done();
        });
      });
    });

    describe('/GET /v1/parse_prefecture', () => {
      it('should work for Paris', (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Paris&destination_block=Dossier submission')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "paris",
              },
            });

            done();
        });
      });

      it('should work for Boulogne-Billancourt', (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Boulogne-Billancourt&destination_block=Dossier submission')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "boulogne_billancourt",
              }
            });

            done();
        });
      });

      it('should ask again if they spell it super wrong', (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Ppaarriiss&destination_block=Dossier submission')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Je n'arrive pas à comprendre 😔. Vérifie " +
                  "l'orthographe stp et dis-moi à nouveau de quelle " +
                  "préfecture tu dépends."
                }
              ],
              redirect_to_blocks: [
                "Ask for prefecture",
                "Dossier submission",
              ],
            });

            done();
        });
      });

      it('should ask again if they spell it super wrong spaces', (done) => {
        chai.request(server)
          .get("/v1/parse_prefecture?prefecture=I+don't+know&destination_block=Dossier submission")
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Je n'arrive pas à comprendre 😔. Vérifie " +
                  "l'orthographe stp et dis-moi à nouveau de quelle " +
                  "préfecture tu dépends."
                },
                {
                  text: "Essaye d'envoyer seulement le nom de la préfecture."
                }
              ],
              redirect_to_blocks: [
                "Ask for prefecture",
                "Dossier submission",
              ],
            });

            done();
        });
      });

      it("should ask them to specify if it's relatively close", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Boigny&destination_block=Dossier submission')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Est-ce que tu voulais dire Bobigny ?",
                  quick_replies: [
                    {
                      title: "Oui 😀",
                      set_attributes: {
                        prefecture: "bobigny",
                      },
                    },
                    {
                      title: "Non 😔",
                      block_names: [ "Ask for prefecture", "Dossier submission" ],
                    },
                  ],
                }
              ]
            });

            done();
        });
      });

      it("shouldn't work with a string like bo", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=bo&destination_block=Dossier submission')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.messages[0].text.should.be.eql("Je n'arrive pas à " +
                "comprendre 😔. Vérifie l'orthographe stp et " +
                "dis-moi à nouveau de quelle préfecture tu dépends.");

            done();
        });
      });

      it("shouldn't work with a blank string", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=&destination_block=Dossier submission')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql(silentLiveChat);

            done();
        });
      });

      it("shouldn't work return an error if no prefecture specified", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql(silentLiveChat);

            done();
        });
      });

      it("shouldn't work return an error if prefecture spelled wrong and no destination", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Boigny')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql(silentLiveChat);

            done();
        });
      });
    });

    describe('/GET /v1/select_tds', () => {
      it('should work if they completed the initial user flow', (done) => {
        chai.request(server)
          .get('/v1/select_tds?recommended_tds=aps|ptsq|commercant')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour quel titre de séjour ?",
                  quick_replies: [
                    {
                      title: "APS",
                      set_attributes: {
                        selected_tds: "aps",
                      }
                    },
                    {
                      title: "Passeport Talent Salarié Qualifié",
                      set_attributes: {
                        selected_tds: "ptsq",
                      }
                    },
                    {
                      title: "Commerçant",
                      set_attributes: {
                        selected_tds: "commercant",
                      }
                    },
                  ]
                }
              ]
            });

            done();
        });
      });

      it("should work if they didn't complete the initial user flow", (done) => {
        chai.request(server)
          .get('/v1/select_tds')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour quel titre de séjour ?",
                  quick_replies: [
                    {
                      title: "APS",
                      set_attributes: {
                        selected_tds: "aps",
                      }
                    },
                    {
                      title: "Vie Privée et Familiale",
                      set_attributes: {
                        selected_tds: "vpf",
                      }
                    },
                    {
                      title: "Passeport Talent Salarié Qualifié",
                      set_attributes: {
                        selected_tds: "ptsq",
                      }
                    },
                    {
                      title: "Salarié/Travailleur Temporaire",
                      set_attributes: {
                        selected_tds: "salarie_tt",
                      }
                    },
                    {
                      title: "Commerçant",
                      set_attributes: {
                        selected_tds: "commercant",
                      }
                    },
                  ]
                }
              ]
            });

            done();
          });
      });
    });

    describe('/GET /v1/nlp', () => {
      it("should work with a blank string", (done) => {
        chai.request(server)
          .get('/v1/nlp')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });

      it("should drop to live chat with a really long message", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=' + "a".repeat(513))
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });

      it("should work if we don't know what they want", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=I+like+bacon+bits+and+racing+cars')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });

      it("should work with a rdv request", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=rdv+svp')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              redirect_to_blocks: [
                "Dossier submission method",
              ],
            });

            done();
          });
      });

      it("should work with a rdv request specifying the visa type and prefecture", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=comment faire un rdv à Paris pour un passport talent ?')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                selected_tds: "ptsq",
                prefecture: "paris"
              },
              redirect_to_blocks: [
                "Dossier submission method",
              ],
            });

            done();
          });
      });

      it("should work with a rdv request specifying only the visa type", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=comment faire un rdv pour un passport talent ?')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                selected_tds: "ptsq",
              },
              redirect_to_blocks: [
                "Dossier submission method",
              ],
            });

            done();
          });
      });

      it("should work with a rdv request specifying only the prefecture", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=comment faire un rdv à Paris ?')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "paris",
              },
              redirect_to_blocks: [
                "Dossier submission method",
              ],
            });

            done();
          });
      });

      it("should work with a papers list request", (done) => {
        chai.request(server)
          .get("/v1/nlp?last+user+freeform+input=c%27est%20quoi%20la%20liste%20pour%20l%27aps%20à%20Paris%20?")
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "paris",
                selected_tds: "aps",
              },
              redirect_to_blocks: [
                "Dossier papers list",
              ],
            });

            done();
          });
      });

      it("should work with a papers list request without info", (done) => {
        chai.request(server)
          .get("/v1/nlp?last+user+freeform+input=c%27est%20quoi%20la%20liste%20de%20papiers%20?")
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              redirect_to_blocks: [
                "Dossier papers list",
              ],
            });

            done();
          });
      });

      it("should work with a papers list request with Pampiers", (done) => {
        chai.request(server)
          .get("/v1/nlp?last+user+freeform+input=c%27est%20quoi%20la%20liste%20de%20papiers%20pour%20Pamiers%20?")
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "pamiers",
              },
              redirect_to_blocks: [
                "Dossier papers list",
              ],
            });

            done();
          });
      });

      it("should start the TDS recommendation flow if they want that", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=Quel titre de séjour demander ?')
          .end((err, response) => {
            response.should.have.status(200);

            // TODO: this will change!
            response.body.should.be.deep.eql({
              redirect_to_blocks: [ "TDS Questions" ]
            });

            done();
          });
      });

      it("should respond correctly to thank you", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=Merci')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Je t'en prie. C'etait un plaisir de parler avec " +
                  "toi 🙂",
                },
              ],
            });

            done();
          });
      });

      it("should respond to hello", (done) => {
        chai.request(server)
          .get('/v1/nlp?first%20name=Teo&last+user+freeform+input=Bonjour, Manu !')
          .end((err, response) => {
            response.should.have.status(200);

            // TODO: this will change!
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Bonjour, Teo !",
                },
              ],
            });

            done();
          });
      });

      it("should not respond if NLP disabled", (done) => {
        chai.request(server)
          .get('/v1/nlp?first%20name=Teo&last+user+freeform+input=Bonjour, Manu !&nlp_disabled=yes')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });
    });

    describe('/GET /v1/dossier_submission_method', () => {
      it("should fail if missing parameters", (done) => {
        chai.request(server)
          .get('/v1/dossier_submission_method')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                    "de quelques informations complémentaires",
                },
              ],
              redirect_to_blocks: [
                "Ask for prefecture",
                "Select TDS type",
                "Dossier submission method",
              ],
              set_attributes: {
                destination_block: "Dossier submission method",
              },
            });

            done();
          });
      });

      it("should help users (Paris, APS)", (done) => {
        chai.request(server)
          .get('/v1/dossier_submission_method?prefecture=paris&selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                { text: "Voici la/les procédure(s) pour déposer un dossier " +
                    "pour un titre de séjour APS à Paris :" },
                {
                  text: "Tu n'as pas besoin de prendre RDV. " +
                    "Envoi par mail : " +
                    "pp-dpg-sdae-6eb-aps-etudiant@interieur.gouv.fr"
                },
              ]
            });

            done();
          });
      });

      it("should help users (Paris, VPF)", (done) => {
        chai.request(server)
          .get('/v1/dossier_submission_method?prefecture=paris&selected_tds=vpf')
          .end((err, response) => {
            response.should.have.status(200);

            // TODO: this will change!
            response.body.should.be.deep.eql({
              messages: [
                { text: "Voici la/les procédure(s) pour déposer un dossier " +
                    "pour un titre de séjour Vie Privée et Familiale à Paris :" },
                {
                  text: "Le RDV se prend Par téléphone. Dépôt sur place : " +
                    "34 30 (0,06 €/min + prix d'un appel)"
                },
              ]
            });

            done();
          });
      });

      it("should help users if we don't have the info yet", (done) => {
        chai.request(server)
          .get('/v1/dossier_submission_method?prefecture=nope&selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour le moment nous n'avons la procedure pour la " +
                  "préfecture de NOPE dans notre base de données.",
                },
                {
                  text: "D'ailleurs, nous te serions très reconnaissants si une " +
                      "fois ton dossier déposé, tu pouvais nous faire un retour " +
                      "d'expérience sur ta préfecture pour enrichir notre base " +
                      "de données 😍",
                },
              ],
            });

            done();
          });
      });
    });

    describe('/GET /v1/dossier_papers_list', () => {
      it("should fail if missing parameters", (done) => {
        chai.request(server)
          .get('/v1/dossier_papers_list')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                      "de quelques informations complémentaires",
                },
              ],
              redirect_to_blocks: [
                "Ask for prefecture",
                "Select TDS type",
                "Dossier papers list",
              ],
              set_attributes: {
                destination_block: "Dossier papers list",
              },
            });

            done();
          });
      });

      it("should help users if they have the info", (done) => {
        chai.request(server)
          .get('/v1/dossier_papers_list?prefecture=paris&selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Voici la liste de papiers pour un titre de séjour " +
                  "APS à Paris : https://drive.google.com/open?" +
                  "id=1SaFEnvlhEAuPEm9PyvnRdtJ386OgfLET9nWQoXVrBrA"
                }
              ]
            });

            done();
          });
      });

      it("return an apology if we don't have the info", (done) => {
        chai.request(server)
          .get('/v1/dossier_papers_list?prefecture=nope&selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour le moment nous n'avons la liste pour la " +
                  "préfecture de NOPE dans notre base de données mais en " +
                  "attendant, " +
                  "je t'invite à regarder la liste de Nanterre car c'est " +
                  "très générique et il se peut qu'elle corresponde à 90% à " +
                  "la liste de ta préfecture 🙂",
                },
                {
                  text: "Voici la liste de papiers pour un titre de séjour APS à Nanterre : " +
                  "https://drive.google.com/open?" +
                  "id=1W0IMm0EeZc5Q_KwYuud-VmDSfvMqRhuj2dnRPIw4Xgs",
                },
                {
                  text: "D'ailleurs, nous te serions très reconnaissants si une " +
                      "fois ton dossier déposé, tu pouvais nous faire un retour " +
                      "d'expérience sur ta préfecture pour enrichir notre base " +
                      "de données 😍",
                },
              ]
            });

            done();
          });
      });
    });

    describe('/GET /v1/dossier_processing_time', () => {
      it("should fail if missing parameters", (done) => {
        chai.request(server)
          .get('/v1/dossier_processing_time')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                      "de quelques informations complémentaires",
                },
              ],
              redirect_to_blocks: [
                "Ask for prefecture",
                "Select TDS type",
                "Dossier processing time",
              ],
              set_attributes: {
                destination_block: "Dossier processing time",
              },
            });

            done();
          });
      });

      it("should help users if they have the info", (done) => {
        chai.request(server)
          .get('/v1/dossier_processing_time?prefecture=antony&selected_tds=ptsq')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Normalement 5 mois environ (REX d'avril 2017) " +
                      "pour le Passeport Talent Salarié Qualifié à Antony"
                }
              ]
            });

            done();
          });
      });

      it("return an apology if we don't have the info", (done) => {
        chai.request(server)
          .get('/v1/dossier_processing_time?prefecture=nope&selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Nous n'avons pas encore des retours sur les délais pour " +
                      "cette procédure. N'hésite pas à nous faire un retour " +
                      "d'expérience quand tu auras fait les démarches afin de " +
                      "pouvoir aider la communauté 😉",
                },
              ]
            });

            done();
          });
      });
    });

    describe('/GET TDS info routes', () => {
      it("should ask for more info if missing parameters", (done) => {
        chai.request(server)
          .get('/v1/tds_duration')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                      "de quelques informations complémentaires",
                },
              ],
              redirect_to_blocks: [
                "Select TDS type",
                "TDS duration",
              ],
              set_attributes: {
                destination_block: "TDS duration",
              },
            });

            done();
          });
      });

      it("should drop into live chat if not defined", (done) => {
        chai.request(server)
          .get('/v1/tds_summary?selected_tds=nope')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });

      it("should give tds summary for aps", (done) => {
        chai.request(server)
          .get('/v1/tds_summary?selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "L’Autorisation Provisoire de Séjour est donnée aux " +
                      "étudiants étrangers récemment diplômés d’un " +
                      "établissement français et qui veulent : \n" +
                      "- Créer une entreprise dans un domaine correspondant" +
                      " à leur formation.\n" +
                      "- Chercher et exercer un emploi : En relation avec " +
                      "leur formation Avec une rémunération au moins égale " +
                      "à 2 220,40€ bruts mensuels (c’est-à-dire 2 fois le " +
                      "SMIC) et conforme au minimum conventionnel ou aux " +
                      "salaires pratiqués dans la branche. ",
                },
              ],
            });

            done();
          });
      });

      it("should give the duration for ptsq", (done) => {
        chai.request(server)
          .get('/v1/tds_duration?selected_tds=ptsq')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "La durée du passeport talent mention salarié " +
                      "qualifié est de 4 ans (renouvelable)",
                },
              ],
            });

            done();
          });
      });

      it("should give the price for salarie_tt", (done) => {
        chai.request(server)
          .get('/v1/tds_price?selected_tds=salarie_tt')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "- Mention Salarié : 269€\n" +
                      "- Mention Travailleur temporaire : 19€",
                },
              ],
            });

            done();
          });
      });

      it("should give the advantages for vpf", (done) => {
        chai.request(server)
          .get('/v1/tds_advantages?selected_tds=vpf')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Avantages d'une carte de séjour vie privée et " +
                      "familiale :\n- On peut changer d’employeur autant " +
                      "qu’on le souhaite, sans avoir à notifier la " +
                      "préfecture. \n- Elle autorise son détenteur à " +
                      "travailler en CDD, CDI, être au chômage ou encore " +
                      "créer son entreprise, sans avoir besoin de fournir " +
                      "des justificatifs."
                },
              ],
            });

            done();
          });
      });

      it("should give the disadvantages for vpf", (done) => {
        chai.request(server)
          .get('/v1/tds_disadvantages?selected_tds=vpf')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Inconvénients de la carte vie privée et familiale :\n" +
                      "Tu es lié à ton/ta concubin(e) et si jamais vous vous " +
                      "séparez, tu devras demander un changement de statut " +
                      "pour changer de titre de séjour.",
                },
              ],
            });

            done();
          });
      });

      it("should give the conditions for commercant", (done) => {
        chai.request(server)
          .get('/v1/tds_conditions?selected_tds=commercant')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Conditions pour obtenir une carte commerçant :\n" +
                      "- Justifier d'une activité viable sur le plan " +
                      "économique ou, s'il intègre une entreprise existante, " +
                      "de sa capacité à lui verser une rémunération " +
                      "suffisante (au moins égale au Smic),\n" +
                      "- Justifier d'une activité compatible avec la " +
                      "sécurité, la salubrité et la tranquillité publique,\n" +
                      "- Respecter les obligations de cette profession " +
                      "(conditions de diplômes ou d'expérience " +
                      "professionnelle, par exemple),\n" +
                      "- Absence de condamnation ou d'interdiction " +
                      "d'exercice.",
                },
              ],
            });

            done();
          });
      });

      it("should ask for more info for all info if needed", (done) => {
        chai.request(server)
          .get('/v1/tds_all_info?selected_tds=')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                  "de quelques informations complémentaires",
                },
              ],
              redirect_to_blocks: [
                "Select TDS type",
                "TDS all info",
              ],
              set_attributes: {
                destination_block: "TDS all info",
              },
            });

            done();
          });
      });

      it("should drop into live chat if all info not defined", (done) => {
        chai.request(server)
          .get('/v1/tds_all_info?selected_tds=nope')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });

      it("should give all info for commercant", (done) => {
        chai.request(server)
          .get('/v1/tds_all_info?selected_tds=commercant')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "C'est une carte de séjour temporaire qui permet " +
                      "d'exercer une activité commerciale, industrielle, " +
                      "artisanale ou autre profession non salariée sur le " +
                      "territoire français pendant plus de 3 mois."
                },
                {
                  text: "La durée de la carte commerçant est de  1 an " +
                      "(renouvelable)"
                },
                {
                  text: "Le prix d'une carte de séjour commerçant est de 269€"
                },
                {
                  text: "Avantages d'une carte de séjour commerçant :\n- " +
                      "Permet d'exercer une activité non-salariée."
                },
                {
                  text: "Inconvénients de la carte commerçant :\nTu ne peux " +
                      "pas exercer une activité salariée (CDD, CDI, intérim)."
                },
                {
                  text: "Conditions pour obtenir une " +
                      "carte commerçant :\n- Justifier d'une activité " +
                      "viable sur le plan économique ou, s'il intègre une " +
                      "entreprise existante, de sa capacité à lui verser " +
                      "une rémunération suffisante (au moins égale au Smic)," +
                      "\n- Justifier d'une activité compatible avec la " +
                      "sécurité, la salubrité et la tranquillité " +
                      "publique,\n- Respecter les obligations de cette " +
                      "profession (conditions de diplômes ou d'expérience " +
                      "professionnelle, par exemple),\n- Absence de " +
                      "condamnation ou d'interdiction d'exercice."
                }
              ]
            });

            done();
          });
      });

      it("should ask for more info for cerfa if needed", (done) => {
        chai.request(server)
          .get('/v1/tds_cerfa?selected_tds=')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                  "de quelques informations complémentaires",
                },
              ],
              redirect_to_blocks: [
                "Select TDS type",
                "TDS cerfa",
              ],
              set_attributes: {
                destination_block: "TDS cerfa",
              },
            });

            done();
          });
      });

      it("should drop into live chat if not defined", (done) => {
        chai.request(server)
          .get('/v1/tds_cerfa?selected_tds=nope')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql(silentLiveChat);

            done();
          });
      });

      it("should give the cerfa for the APS", (done) => {
        chai.request(server)
          .get('/v1/tds_cerfa?selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Pas besoin de cerfa pour l'APS",
                },
              ],
            });

            done();
          });
      });
    });
  });
});
