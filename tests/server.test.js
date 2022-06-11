const supertest = require('supertest');
const { app } = require('../server/app.js');

const request = supertest(app);

describe('api', () => {
  describe('get /qa/questions', () => {
    it('should return a 200', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
    it('should return an object', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(typeof res.body).toBe('object');
          done();
        });
    });
  });

  describe('get /qa/questions/:question_id/answers', () => {
    it('should return a 200', (done) => {
      request.get('/qa/questions/1/answers')
        .then((res) => {
          expect(res.statusCode).toBe(200);
          done();
        });
    });
    it('should return an object', (done) => {
      request.get('/qa/questions/1/answers')
        .then((res) => {
          expect(typeof res.body).toBe('object');
          done();
        });
    });
  });

  describe('post /qa/questions', () => {
    it('should return a 400 for a bad request', (done) => {
      request.post('/qa/questions')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });
});
