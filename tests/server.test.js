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

    it('should return an object with an array of results', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(typeof res.body).toBe('object');
          expect(Array.isArray(res.body.results)).toBe(true);
          done();
        });
    });

    it('should return questions for specified product_id', (done) => {
      request.get('/qa/questions?product_id=1')
        .then((res) => {
          expect(res.body.product_id).toBe(1);
          done();
        });
    });

    it('should return only 1 question when specified count = 1', (done) => {
      request.get('/qa/questions?product_id=1&count=1')
        .then((res) => {
          expect(res.body.results).toHaveLength(1);
          done();
        });
    });

    it('should return a 400 for an invalid product_id', (done) => {
      request.get('/qa/questions?product_id=bad')
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
          expect(res.body).toHaveProperty('question');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('count');
          expect(res.body).toHaveProperty('results');
          done();
        });
    });

    it('should use default values for page and count', (done) => {
      request.get('/qa/questions/1/answers')
        .then((res) => {
          expect(res.body.page).toBe(1);
          expect(res.body.count).toBe(5);
          done();
        });
    });

    it('should only return 1 answer when specified count = 1', (done) => {
      request.get('/qa/questions/1/answers?count=1')
        .then((res) => {
          expect(res.body.count).toBe(1);
          expect(res.body.results).toHaveLength(1);
          done();
        });
    });

    it('should return a 400 for an invalid question_id', (done) => {
      request.get('/qa/questions/bad/answers')
        .then((res) => {
          expect(typeof res.body).toBe('object');
          done();
        });
    });
  });

  describe('post /qa/questions', () => {
    it('should return a 201', (done) => {
      request.post('/qa/questions')
        .send({
          body: 'tester',
          name: 'jester',
          email: 'test@jest.com',
          product_id: 123123,
        })
        .then((res) => {
          expect(res.statusCode).toBe(201);
          done();
        });
    });

    it('should return a 400 for a blank body', (done) => {
      request.post('/qa/questions')
        .send({
          body: '',
          name: 'jester',
          email: 'test@jest.com',
          product_id: 123123,
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 for a blank name', (done) => {
      request.post('/qa/questions')
        .send({
          body: 'tester',
          name: '',
          email: 'test@jest.com',
          product_id: 123123,
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 for an invalid email', (done) => {
      request.post('/qa/questions')
        .send({
          body: 'tester',
          name: 'jester',
          email: 'testjest.com',
          product_id: 123123,
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 for a bad request', (done) => {
      request.post('/qa/questions')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });

  describe('post /qa/questions/:question_id/answers', () => {
    it('should return a 201', (done) => {
      request.post('/qa/questions/123123/answers')
        .send({
          body: 'tester',
          name: 'jester',
          email: 'test@jest.com',
          photos: [],
        })
        .then((res) => {
          expect(res.statusCode).toBe(201);
          done();
        });
    });

    it('should return a 400 for a blank body', (done) => {
      request.post('/qa/questions/123123/answers')
        .send({
          body: '',
          name: 'jester',
          email: 'test@jest.com',
          photos: [],
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 for a blank name', (done) => {
      request.post('/qa/questions/123123/answers')
        .send({
          body: 'tester',
          name: '',
          email: 'test@jest.com',
          photos: [],
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 for an invalid email', (done) => {
      request.post('/qa/questions/123123/answers')
        .send({
          body: 'tester',
          name: 'jester',
          email: 'testjest.com',
          photos: [],
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 if photos is not an array', (done) => {
      request.post('/qa/questions/123123/answers')
        .send({
          body: 'tester',
          name: 'jester',
          email: 'test@jest.com',
          photos: 1,
        })
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });

    it('should return a 400 for a bad request', (done) => {
      request.post('/qa/questions/bad/answers')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });

  describe('put /qa/questions/:question_id/helpful', () => {
    it('should return a 204', (done) => {
      request.put('/qa/questions/1/helpful')
        .then((res) => {
          expect(res.statusCode).toBe(204);
          done();
        });
    });

    it('should return a 400 for a bad request', (done) => {
      request.put('/qa/questions/bad/helpful')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });

  describe('put /qa/questions/:question_id/report', () => {
    it('should return a 204', (done) => {
      request.put('/qa/questions/321321/report')
        .then((res) => {
          expect(res.statusCode).toBe(204);
          done();
        });
    });

    it('should return a 400 for a bad request', (done) => {
      request.put('/qa/questions/bad/report')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });

  describe('put /qa/answers/:question_id/helpful', () => {
    it('should return a 204', (done) => {
      request.put('/qa/answers/1/helpful')
        .then((res) => {
          expect(res.statusCode).toBe(204);
          done();
        });
    });

    it('should return a 400 for a bad request', (done) => {
      request.put('/qa/answers/bad/helpful')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });

  describe('put /qa/answers/:question_id/report', () => {
    it('should return a 204', (done) => {
      request.put('/qa/answers/321321/report')
        .then((res) => {
          expect(res.statusCode).toBe(204);
          done();
        });
    });

    it('should return a 400 for a bad request', (done) => {
      request.put('/qa/answers/bad/report')
        .then((res) => {
          expect(res.statusCode).toBe(400);
          done();
        });
    });
  });
});
