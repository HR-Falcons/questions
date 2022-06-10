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
  if (Number.isNaN(Number(product_id))) {
    res.sendStatus(404);
  } else {
    db.getQAbyProductIdJoin(product_id, page, count)
      .then((results) => {
        res.send({
          product_id,
          results,
        });
      })
      .catch((err) => {
        console.log('get /qa/questions', err);
        res.end();
      });
  }
});

app.get('/qa/questions2', (req, res) => {
  const product_id = req.query.product_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  if (Number.isNaN(Number(product_id))) {
    res.sendStatus(404);
  } else {
    db.getQAbyProductId(product_id, page, count)
      .then((results) => {
        res.send({
          product_id,
          results,
        });
      })
      .catch((err) => {
        console.log('get /qa/questions2', err);
        res.end();
      });
  }
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const question_id = req.params.question_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  if (Number.isNaN(Number(question_id))) {
    res.sendStatus(404);
  } else {
    db.getAbyProductIdJoin(question_id, page, count)
      .then((results) => {
        res.send({
          question: question_id,
          page,
          count,
          results,
        });
      })
      .catch((err) => {
        console.log(err);
        res.end();
      });
  }
});

console.log(`Listening at http://localhost:${process.env.PORT}`);
