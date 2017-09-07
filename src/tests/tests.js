"use strict"

// require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
var Data = require('../data.js');

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

  // test the hello route
  describe('/GET /v1/helloworld', () => {
    it('it should return { hello: "world" }', (done) => {
      chai.request(server)
        .get('/v1/helloworld')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('hello').eql('world');

          done();
      });
    });
  });

  describe('/GET /v1/calculate_sum', () => {
    it('it should not work if the parameters are wrong', (done) => {
      chai.request(server)
        .get('/v1/calculate_sum')
        .end((err, response) => {
          response.should.have.status(400);
          done();
      });
    });

    it('should calculate the sum correctly', (done) => {
      chai.request(server)
        .get('/v1/calculate_sum?first=1000&second=4000')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('result').eql(5000);
          done();
      });
    });

    it('should deal with negative numbers', (done) => {
      chai.request(server)
        .get('/v1/calculate_sum?first=-1000&second=4000')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.have.property('result').eql(3000);
          done();
      });
    });
  });

  describe('/GET /v1/aps_conditions', () => {
    it('should not work if the parameters are wrong', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions')
        .end((err, response) => {
          response.should.have.status(400);
          done();
      });
    });

    it('should work for Algeria', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Algérie')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.be.deep.eql({
            applicable: false
          });

          done();
      });
    });

    it('should work for an EEE country (Italie)', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Italie')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.be.deep.eql({
            applicable: false
          });

          done();
      });
    });

    it('should work for an non-EEE country (USA)', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Etats-Unis')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.be.deep.eql({
            applicable: true,
            accord_special: false,
            condition_de_diplome: Data.apsAgreements.masters,
            condition_de_duree: 12,
            renouvellement: false,
          });

          done();
      });
    });

    it('should work for a special country (Burkina Faso)', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Burkina Faso&currentTDS=Étudiant&diploma=Master')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.a('object');
          response.body.should.be.deep.eql({
            applicable: true,
            accord_special: true,
            condition_de_diplome: Data.apsAgreements.mastersLicenseProNotFrance,
            condition_de_duree: 6,
            renouvellement: true,
            renouvellement_count: 1,
          });

          done();
      });
    });
  });

  // Tests for APS

  describe('/GET /v1/eligible_for_aps', () => {
    it('should return not eligible for Algerians', (done) => {
      chai.request(server)
        .get('/v1/eligible_for_aps?nationality=Algérienne')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.deep.eql({
            "redirect_to_blocks": [ "No recommendation" ]
          });

          done();
      });
    });

    it("should return eligible for countries with a Special Agreement " +
        "(only condition_de_duree qui change)", (done) => {
      chai.request(server)
        .get('/v1/eligible_for_aps?nationality=Congo')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.deep.eql({
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
          });

          done();
      });
    });

    it("should return eligible for countries with a Special Agreement " +
        "(condition_de_duree et renouvellement qui changent)", (done) => {
      chai.request(server)
        .get('/v1/eligible_for_aps?nationality=Gabon')
        .end((err, response) => {
          response.should.have.status(200);
          response.body.should.be.deep.eql({
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
    });

    console.log("about to run");
    it('should return eligible for Colombians', (done) => {
      console.log("requeseting");
      chai.request(server)
        .get('/v1/eligible_for_aps?nationality=Colombienne&')
        .end((err, response) => {
          console.log("I'm here");
          response.should.have.status(200);
          response.body.should.be.deep.eql({
            "redirect_to_blocks": ["APS"]
          });

          done();
      });
    });
  });

// Tests for Vie Privée et familiale
 describe('/GET /v1/eligible_for_vpf', () => {
  it('should return eligible for Pacsed people', (done) => {
    chai.request(server)
      .get('/v1/eligible_for_vpf?familySituation=Pacsé à un français')
      .end((err, response) => {
        response.should.have.status(200);
         response.body.should.be.deep.eql({
           "redirect_to_blocks": ["Vie privée et familiale"]
         });

         done();
     });
   });
 });

// It should simply continue looking for a match
   it('should return not eligible for single people', (done) => {
     chai.request(server)
       .get('/v1/eligible_for_vpf?familySituation=Célibataire')
       .end((err, response) => {
         response.should.have.status(200);
         response.body.should.be.deep.eql({
           "redirect_to_blocks": ["JSON PTSQ analysis"]
         });

         done();
     });
   });
 });

 //TODO: review all this tests, they are incomplete
 // Tests for Passeport Talent Salarié Qualifié
 describe('/GET /v1/eligible_for_ptsq', () => {
   it('should return eligible for Master, CDI, >35526,4€ (2x SMIC) people', (done) => {
     chai.request(server)
       .get('/v1/eligible_for_ptsq?diploma=Master')
       .end((err, response) => {
         response.should.have.status(200);
         response.body.should.be.deep.eql({
           "redirect_to_blocks": [ "Passeport Talent Salarié Qualifié" ]
         });

         done();
     });
   });

   // It should simply continue looking for a match
   it('should return not eligible for Equivalent au Master, CDI, >26645€ (1,5x SMIC) people', (done) => {
     chai.request(server)
       .get('/v1/eligible_for_ptsq?diploma=Master&')
       .end((err, response) => {
         response.should.have.status(200);
         response.body.should.be.deep.eql({
           "redirect_to_blocks": [ "JSON salarie analysis" ]
         });

         done();
     });
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
