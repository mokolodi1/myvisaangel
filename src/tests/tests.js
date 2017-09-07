"use strict"

// require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

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
          "(only condition_de_duree qui change)", (done) => {
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
          "(condition_de_duree et renouvellement qui changent)", (done) => {
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

      // It should simply continue looking for a match
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

    // // Tests for Salarié in CDI
    // describe('/GET /v1/eligible_for_salarie', () => {
    //   it('should return eligible for CDI, >26645€ (1,5x SMIC) people', (done) => {
    //     chai.request(server)
    //       .get('/v1/eligible_for_salarie?employmentSituation=CDI')
    //       .end((err, response) => {
    //         response.should.have.status(200);
    //         response.body.should.be.deep.eql({
    //           "type": "show_block",
    //           "block_name": "Salarié/TT",
    //           "title": "WTF"
    //         });
    //
    //         done();
    //     });
    //   });
    //   // I don't know what it should return, it should simply continue looking for a match
    //   it('should return not eligible for Entrepreneur', (done) => {
    //     chai.request(server)
    //       .get('/v1/eligible_for_salarie?employmentSituation=Entrepreneur')
    //       .end((err, response) => {
    //         response.should.have.status(200);
    //         response.body.should.be.deep.eql({
    //           //"type": "show_block",
    //           //"block_name": "Vie privée et familiale",
    //           //"title": "WTF"
    //         });
    //
    //         done();
    //     });
    //   });
    // });
    //
    // // Tests for Salarié in CDD
    // describe('/GET /v1/eligible_for_salarie', () => {
    //   it('should return eligible for CDD, >26645€ (1,5x SMIC) people', (done) => {
    //     chai.request(server)
    //       .get('/v1/eligible_for_salarie?employmentSituation=CDD')
    //       .end((err, response) => {
    //         response.should.have.status(200);
    //         response.body.should.be.deep.eql({
    //           "type": "show_block",
    //           "block_name": "Salarié/TT",
    //           "title": "WTF"
    //         });
    //
    //         done();
    //     });
    //   });
    //   // I don't know what it should return, it should simply continue looking for a match
    //   it('should return not eligible for CDD, >17764,2€ (1 SMIC) people', (done) => {
    //     chai.request(server)
    //       .get('/v1/eligible_for_ptsq?familySituation=Célibataire')
    //       .end((err, response) => {
    //         response.should.have.status(200);
    //         response.body.should.be.deep.eql({
    //           //"type": "show_block",
    //           //"block_name": "Vie privée et familiale",
    //           //"title": "WTF"
    //         });
    //
    //         done();
    //     });
    //   });
    // });
    //
    // // Tests for Commerçant
    // describe('/GET /v1/eligible_for_commerçant', () => {
    //   it('should return eligible for Entrepreneur', (done) => {
    //     chai.request(server)
    //       .get('/v1/eligible_for_commerçant?employmentSituation=Entrepreneur')
    //       .end((err, response) => {
    //         response.should.have.status(200);
    //         response.body.should.be.deep.eql({
    //           "type": "show_block",
    //           "block_name": "Salarié/TT",
    //           "title": "WTF"
    //         });
    //
    //         done();
    //     });
    //   });
    //   // I don't know what it should return, it should simply continue looking for a match
    //   it('should return not eligible for I dont know', (done) => {
    //     chai.request(server)
    //       .get('/v1/eligible_for_commerçant?employmentSituation=Je ne sais pas')
    //       .end((err, response) => {
    //         response.should.have.status(200);
    //         response.body.should.be.deep.eql({
    //           //"type": "show_block",
    //           //"block_name": "Vie privée et familiale",
    //           //"title": "WTF"
    //         });
    //
    //         done();
    //     });
    //   });
    // });
  });

  describe("Make sure the API works...", () => {
    // test the hello route
    describe('/GET /v1/ping', () => {
      it('it should return { pong: "It works!" }', (done) => {
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
  });
});
