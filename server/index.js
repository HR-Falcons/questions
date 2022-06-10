require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT);

app.get('/qa/questions/', (req, res) => {
  const product_id = req.query.product_id;
  const page = req.query.page || 1;
  const count = req.query.count || 5;
  if (Number.isNaN(Number(product_id))) {
    res.sendStatus(404);
  } else {
    db.getQAbyProductIdJoin(product_id, page, count)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.end();
      });
  }
});

console.log(`Listening at http://localhost:${process.env.PORT}`);
