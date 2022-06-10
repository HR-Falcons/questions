require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT);

app.get('/qa1/:product_id', (req, res) => {
  if (Number.isNaN(Number(req.params.product_id))) {
    res.sendStatus(404);
  } else {
    db.getQAbyProductId(req.params.product_id)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.end();
      });
  }
});

app.get('/qa2/:product_id', (req, res) => {
  if (Number.isNaN(Number(req.params.product_id))) {
    res.sendStatus(404);
  } else {
    db.getQAbyProductIdJoin(req.params.product_id)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.end();
      });
  }
});
// eslint-disable-next-line no-console
console.log(`Listening at http://localhost:${process.env.PORT}`);
