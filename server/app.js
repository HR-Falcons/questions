require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();

app.use(express.json());
app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).send(`
  Available routes:\n
    \tGET /qa/questions\n
    \tGET /qa/questions/:question_id/answers\n
    \tPOST /qa/questions\n
    \tPOST /qa/questions/:question_id/answers\n
    \tPUT /qa/questions/:question_id/helpful\n
    \tPUT /qa/questions/:question_id/report\n
    \tPUT /qa/answers/:answer_id/helpful\n
    \tPUT /qa/answers/:answer_id/report\n
  `);
});

app.get('/qa/questions', (req, res) => {
  const product_id = Number(req.query.product_id);
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  if (Number.isNaN(Number(product_id)) || Number.isNaN(Number(page))
  || Number.isNaN(Number(count))) {
    res.sendStatus(400);
  } else {
    db.getQAbyProductIdJoin(product_id, page, count)
      .then((results) => {
        res.status(200).send({
          product_id,
          results,
        });
      })
      .catch((err) => {
        console.log('get /qa/questions', err);
        res.sendStatus(500);
      });
  }
});

app.get('/qa/questions2', (req, res) => {
  const product_id = Number(req.query.product_id);
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  if (Number.isNaN(product_id) || Number.isNaN(page)
  || Number.isNaN(count)) {
    res.sendStatus(400);
  } else {
    db.getQAbyProductId(product_id, page, count)
      .then((results) => {
        res.status(200).send({
          product_id,
          results,
        });
      })
      .catch((err) => {
        console.log('get /qa/questions2', err);
        res.sendStatus(500);
      });
  }
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const question_id = Number(req.params.question_id);
  const page = Number(req.query.page) || 1;
  const count = Number(req.query.count) || 5;
  if (Number.isNaN(question_id) || Number.isNaN(page)
  || Number.isNaN(count)) {
    res.sendStatus(400);
  } else {
    db.getAbyProductIdJoin(question_id, page, count)
      .then((results) => {
        res.status(200).send({
          question: question_id,
          page,
          count,
          results,
        });
      })
      .catch((err) => {
        console.log('get /qa/questions/:question_id/answers', err);
        res.sendStatus(500);
      });
  }
});

app.post('/qa/questions', (req, res) => {
  const { body, name, email, product_id } = req.body;

  if (Number.isNaN(Number(product_id)) || typeof body !== 'string'
  || typeof name !== 'string' || typeof email !== 'string'
  || body.length === 0 || name.length === 0 || email.length === 0
  || !/^[\w\d]+@[\w\d]+\.[\w\d]+$/.test(email)) {
    res.sendStatus(400);
  } else {
    db.addQuestion(body, name, email, product_id)
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log('post /qa/questions', err);
        res.sendStatus(500);
      });
  }
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  const question_id = req.params.question_id;
  const { body, name, email, photos } = req.body;

  if (Number.isNaN(Number(question_id)) || typeof body !== 'string'
  || typeof name !== 'string' || typeof email !== 'string'
  || body.length === 0 || name.length === 0 || email.length === 0
  || !/^[\w\d]+@[\w\d]+\.[\w\d]+$/.test(email) || !Array.isArray(photos)) {
    res.sendStatus(400);
  } else {
    db.addAnswer(question_id, body, name, email, photos)
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err) => {
        console.log('post /qa/questions/:question_id/answers', err);
        res.sendStatus(500);
      });
  }
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  const question_id = req.params.question_id;

  if (Number.isNaN(Number(question_id))) {
    res.sendStatus(400);
  } else {
    db.markQuestionHelpful(question_id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log('put /qa/questions/:question_id/helpful', err);
        res.sendStatus(500);
      });
  }
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  const question_id = req.params.question_id;

  if (Number.isNaN(Number(question_id))) {
    res.sendStatus(400);
  } else {
    db.reportQuestion(question_id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log('put /qa/questions/:question_id/report', err);
        res.sendStatus(500);
      });
  }
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  const answer_id = req.params.answer_id;

  if (Number.isNaN(Number(answer_id))) {
    res.sendStatus(400);
  } else {
    db.markAnswerHelpful(answer_id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log('put /qa/answers/:answer_id/helpful', err);
        res.sendStatus(500);
      });
  }
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  const answer_id = req.params.answer_id;

  if (Number.isNaN(Number(answer_id))) {
    res.sendStatus(400);
  } else {
    db.reportAnswer(answer_id)
      .then(() => {
        res.sendStatus(204);
      })
      .catch((err) => {
        console.log('put /qa/answers/:answer_id/report', err);
        res.sendStatus(500);
      });
  }
});

module.exports = {
  app,
};
