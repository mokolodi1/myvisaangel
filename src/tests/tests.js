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
              "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
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
              "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
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


  describe("Check to see if some dev ops stuff works...", () => {
    it("should be able able to recover from a crash", (done) => {
      chai.request(server)
        .get('/private/crash')
        .end((err, response) => {
          console.log("err:", err);
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
                              type: "web_url",
                              title: "Fiche récapitulative",
                              url: "https://docs.google.com/document/d/" +
                                "1OakbDux-SRj4aqHgkiQRUWgrWTxBVlPxeNYI9bh5mww/",
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
                        },
                        {
                          "buttons": [
                            {
                              "title": "Fiche récapitulative",
                              "type": "web_url",
                              "url": "https://docs.google.com/document/d/" +
                                "1TXg9zsDfzhgkPRl6pAWKJ7S0F02giJ-o9R1ry8NqAMo/",
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
                              type: "web_url",
                              title: "Fiche récapitulative",
                              url: "https://docs.google.com/document/d/" +
                                "1OakbDux-SRj4aqHgkiQRUWgrWTxBVlPxeNYI9bh5mww/",
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
                            }
                          ],
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
            response.body.should.be.deep.eql({
              messages: [
                {
                  text: "Je n'arrive pas à comprendre 😔. Vérifie " +
                  "l'orthographe stp et dis-moi à nouveau de quel pays " +
                  "tu viens."
                },
              ],
              set_attributes: {
                validated_nationality: "no",
              },
            });

            done();
        });
      });

      it("shouldn't work return an error if no nationality specified", (done) => {
        chai.request(server)
          .get('/v1/parse_nationality')
          .end((err, response) => {
            response.should.have.status(400);

            done();
        });
      });
    });

    describe('/GET /v1/parse_prefecture', () => {
      it('should work for Paris', (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Paris')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "paris",
                validated_prefecture: "yes",
              }
            });

            done();
        });
      });

      it('should work for Boulogne-Billancourt', (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Boulogne-Billancourt')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              set_attributes: {
                prefecture: "boulogne_billancourt",
                validated_prefecture: "yes",
              }
            });

            done();
        });
      });

      it('should ask again if they spell it super wrong', (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Ppaarriiss')
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
              set_attributes: {
                validated_prefecture: "no",
              },
            });

            done();
        });
      });

      it('should ask again if they spell it super wrong spaces', (done) => {
        chai.request(server)
          .get("/v1/parse_prefecture?prefecture=I+don't+know")
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
              set_attributes: {
                validated_prefecture: "no",
              },
            });

            done();
        });
      });

      it("should ask them to specify if it's relatively close", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=Boigny')
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
              ]
            });

            done();
        });
      });

      it("shouldn't work with a string like bo", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture?prefecture=bo')
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
          .get('/v1/parse_prefecture?prefecture=')
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
              ],
              set_attributes: {
                validated_prefecture: "no",
              },
            });

            done();
        });
      });

      it("shouldn't work return an error if no prefecture specified", (done) => {
        chai.request(server)
          .get('/v1/parse_prefecture')
          .end((err, response) => {
            response.should.have.status(400);

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
            response.should.have.status(400);

            done();
          });
      });

      it("should drop to live chat with a really long message", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=' + "a".repeat(513))
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.deep.eql({
              redirect_to_blocks: ["Silent creators respond"],
            });

            done();
          });
      });

      it("should work if we don't know what they want", (done) => {
        chai.request(server)
          .get('/v1/nlp?last+user+freeform+input=I+like+bacon+bits+and+racing+cars')
          .end((err, response) => {
            response.should.have.status(200);
            response.body.should.be.a('object');
            response.body.should.be.deep.eql({
              redirect_to_blocks: ["Silent creators respond"],
            });

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
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                  "de quelques informations complémentaires",
                },
              ],
              set_attributes: {
                selected_tds: "ptsq",
              },
              redirect_to_blocks: [
                "Ask for prefecture",
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
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                  "de quelques informations complémentaires",
                },
              ],
              set_attributes: {
                prefecture: "paris",
              },
              redirect_to_blocks: [
                "Select TDS type",
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
              messages: [
                {
                  text: "Pour t'aider j'ai besoin " +
                  "de quelques informations complémentaires",
                },
              ],
              set_attributes: {
                prefecture: "pamiers",
              },
              redirect_to_blocks: [
                "Select TDS type",
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

            // TODO: this will change!
            response.body.should.be.deep.eql({
              set_attributes: {
                nlp_disabled: "yes"
              }
            });

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
          .get('/v1/dossier_submission_method?prefecture=nyc&selected_tds=aps')
          .end((err, response) => {
            response.should.have.status(200);

            response.body.should.be.deep.eql({
              redirect_to_blocks: ["Silent creators respond"],
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

            // TODO: this will change!
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
                }
              ]
            });

            done();
          });
      });
    });
  });
});
