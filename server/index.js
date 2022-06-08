require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db.js');

const app = express();

app.use(express.json());
app.use(cors());

app.listen(process.env.PORT);

app.get('/:qid', (req, res) => {
  db.getById(req.params.qid)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      console.log(err);
      res.end();
    });
});
// eslint-disable-next-line no-console
console.log(`Listening at http://localhost:${process.env.PORT}`);
