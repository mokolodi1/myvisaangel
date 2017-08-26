// require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

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

});
