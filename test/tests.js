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
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('hello').eql('world');

          done();
      });
    });
  });

  describe('/GET /v1/calculate_sum', () => {
    it('it should not work if the parameters are wrong', (done) => {
      chai.request(server)
        .get('/v1/calculate_sum')
        .end((err, res) => {
          res.should.have.status(400);
          done();
      });
    });

    it('should calculate the sum correctly', (done) => {
      chai.request(server)
        .get('/v1/calculate_sum?first=1000&second=4000')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('result').eql(5000);
          done();
      });
    });

    it('should deal with negative numbers', (done) => {
      chai.request(server)
        .get('/v1/calculate_sum?first=-1000&second=4000')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('result').eql(3000);
          done();
      });
    });
  });

  describe('/GET /v1/aps_conditions', () => {
    it('should not work if the parameters are wrong', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions')
        .end((err, res) => {
          res.should.have.status(400);
          done();
      });
    });

    it('should work for Algeria', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Algérie')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.be.deep.eql({
            applicable: false
          });

          done();
      });
    });

    it('should work for an EEE country (Italie)', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Italie')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.be.deep.eql({
            applicable: false
          });

          done();
      });
    });

    it('should work for an non-EEE country (USA)', (done) => {
      chai.request(server)
        .get('/v1/aps_conditions?pays=Etats-Unis')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.be.deep.eql({
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
        .get('/v1/aps_conditions?pays=Burkina Faso')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.be.deep.eql({
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
});
