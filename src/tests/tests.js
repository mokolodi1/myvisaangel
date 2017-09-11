"use strict"

// require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
var qs = require('qs');

var visaTypes = require("../visaTypes.js");

chai.use(chaiHttp);

describe('My Visa Bot API', () => {
  // Before each command you can clear any database stuff, but
  // we won't use this just yet.
  beforeEach((done) => {
    // Book.remove({}, (err) => {
    //   done();
    // });
    done();
  });

  describe("Make sure the internals work...", () => {
    // Tests for APS

    describe('APS visa', () => {
      it('should return not eligible for Algerians', (done) => {
        let result = visaTypes.aps({
          nationality: "algeria"
        });

        should.equal(result, undefined);

        done();
      });

      it("should return eligible for countries with a Special Agreement " +
          "(condition_de_duree et condition_de_diplome qui changent)", (done) => {
        let result = visaTypes.aps({
          nationality: "congo"
        });

        result.should.be.deep.eql({
          "messages": [
            {
              "text": "⚠️ Attention, ton pays a un accord spécial avec la " +
                  "France qui change les choses suivantes pour l'APS :\n" +
                  "Condition de durée : 9 mois à la place de 12\n" +
                  "Condition de diplôme : Diplôme au moins équivalent " +
                  "au master obtenu dans un établissement français.\n"
            },
          ],
          "redirect_to_blocks": ["APS"]
        })

        done();
      });

      it("should return eligible for countries with a Special Agreement " +
          "(condition_de_duree, condition_de_diplome et renouvellement qui changent)", (done) => {
        let result = visaTypes.aps({
          nationality: "gabon"
        });

        result.should.be.deep.eql({
          "messages": [
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
          "redirect_to_blocks": ["APS"]
        });

        done();
      });

      it('should return eligible for Colombian students w/ diploma', (done) => {
        let result = visaTypes.aps({
          nationality: "colombia",
          currentTDS: "student",
          diploma: "license_pro",
        });

        result.should.be.deep.eql({
          "redirect_to_blocks": ["APS"]
        });

        done();
      });
    });

    describe('Vie privée et familiale visa', () => {
      it('should return eligible for Pacsed people', (done) => {
        let result = visaTypes.vpf({
          familySituation: "pacsed",
        });

        result.should.be.deep.eql({
          "redirect_to_blocks": ["Vie privée et familiale"]
        });

        done();
      });

      it('should return not eligible for single people', (done) => {
        let result = visaTypes.vpf({
          familySituation: "single",
        });

        should.equal(result, undefined);

        done();
      });
    });

    describe('Passeport Talent Salarié Qualifié visa', () => {
      it('should return eligible for Master, CDI, >35526,4€ (2x SMIC) people', (done) => {
        let result = visaTypes.ptsq({
          diploma: "masters",
          smicMultiplier: 2,
          employmentSituation: "cdi"
        });

        result.should.be.deep.eql({
          "redirect_to_blocks": [ "Passeport Talent Salarié Qualifié" ]
        })

        done();
      });

      it('should return not eligible for Equivalent au Master, CDI, >26645€ (1,5x SMIC) people', (done) => {
        let result = visaTypes.ptsq({
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
        let result = visaTypes.salarie({
          employmentSituation: "cdi",
          smicMultiplier: 1.5,
        });

        result.should.be.deep.eql({
          "redirect_to_blocks": [ "Salarié/TT" ]
        })

        done();
      });

      it('should return not eligible for Entrepreneur', (done) => {
        let result = visaTypes.salarie({
          employmentSituation: "doesnt_know"
        });

        should.equal(result, undefined);

        done();
      });
    });

    describe('Commercant visa', () => {
      it('should return eligible for entrepreneur', (done) => {
        let result = visaTypes.commercant({
          employmentSituation: "entrepreneur"
        });

        result.should.be.deep.eql({
          "redirect_to_blocks": [ "Commerçant" ]
        })

        done();
      });

      it('should return not eligible for CDD', (done) => {
        let result = visaTypes.commercant({
          employmentSituation: "cdd"
        });

        should.equal(result, undefined);

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
              redirect_to_blocks: [
                'APS',
                'Passeport Talent Salarié Qualifié',
                'Salarié/TT'
              ]
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
                }
              ],
              redirect_to_blocks: [ 'APS' ]
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
            })

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
                nationality: "usa"
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
                nationality: "mexico"
              }
            });

            done();
        });
      });
    });
  });
});
