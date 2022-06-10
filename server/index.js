require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT);

app.get('/qa/questions', (req, res) => {
  const product_id = req.query.product_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
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
  const product_id = req.query.product_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  if (Number.isNaN(Number(product_id)) || Number.isNaN(Number(page))
  || Number.isNaN(Number(count))) {
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
  const question_id = req.params.question_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  if (Number.isNaN(Number(question_id)) || Number.isNaN(Number(page))
  || Number.isNaN(Number(count))) {
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
  || body.length === 0 || name.length === 0 || email.length === 0) {
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
  || !Array.isArray(photos)) {
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

console.log(`Listening at http://localhost:${process.env.PORT}`);
