const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');
const Promise = require('bluebird');
require('dotenv').config();

// Option 1: Passing a connection URI
const sequelize = new Sequelize(`postgres://${process.env.pgUser}:${process.env.pgPass}@localhost:${process.env.pgPort}/SDC`, {
  logging: false,
}); // Example for postgres

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
  });

const Questions = sequelize.define('Questions', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  date_written: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  asker_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  asker_email: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  reported: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  helpful: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
});

const Answers = sequelize.define('Answers', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
  },
  date_written: {
    type: DataTypes.BIGINT,
  },
  answerer_name: {
    type: DataTypes.TEXT,
  },
  answerer_email: {
    type: DataTypes.TEXT,
  },
  reported: {
    type: DataTypes.BOOLEAN,
  },
  helpful: {
    type: DataTypes.INTEGER,
  },
}, {
  timestamps: false,
});

const AnswersPhotos = sequelize.define('AnswersPhotos', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  answer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  url: {
    type: DataTypes.TEXT,
  },
}, {
  timestamps: false,
});

const Question = (data) => (
  {
    question_id: data.id,
    question_body: data.body,
    question_date: new Date(Number(data.date_written)).toISOString(),
    asker_name: data.asker_name,
    question_helpfulness: data.helpful,
    reported: false,
    answers: {},
  }
);

const Question2 = (data) => (
  {
    question_id: data.question_id,
    question_body: data.question_body,
    question_date: new Date(Number(data.question_date)).toISOString(),
    asker_name: data.asker_name,
    question_helpfulness: data.question_helpfulness,
    reported: false,
    answers: {},
  }
);

const Answer = (data) => (
  {
    id: data.id,
    body: data.body,
    date: new Date(Number(data.date_written)).toISOString(),
    answerer_name: data.answerer_name,
    helpfulness: data.helpful,
    photos: [],
  }
);

const Answer2 = (data) => (
  {
    id: data.id,
    body: data.body,
    date: new Date(Number(data.date)).toISOString(),
    answerer_name: data.answerer_name,
    helpfulness: data.helpfulness,
    photos: [],
  }
);

const getPhotosByAnswerId = (answer_id) => (
  AnswersPhotos.findAll({
    attributes: ['answer_id', 'url'],
    where: {
      answer_id,
    },
  })
    .then((response) => response)
    .catch((err) => {
      console.log('getPhotosByAnswerId', err);
    })
);

const getQuestionsByProductId = (product_id) => (
  Questions.findAll({
    attributes: ['id', 'body', 'date_written', 'asker_name', 'helpful'],
    where: {
      product_id,
      reported: false,
    },
  })
    .then((response) => response.map(Question))
    .catch((err) => {
      console.log('getQuestionsByProductId', err);
    })
);

const getAnswersByQuestionId = (question_id) => {
  const answers = {};
  return Answers.findAll({
    attributes: ['id', 'body', 'date_written', 'answerer_name', 'helpful'],
    where: {
      question_id,
      reported: false,
    },
  })
    .then((response) => {
      // return response;
      const promArray = [];
      response.forEach((ans) => {
        answers[ans.id] = Answer(ans);
        promArray.push(getPhotosByAnswerId(ans.id));
      });
      return Promise.all(promArray);
    })
    .then((response) => {
      response.forEach((photoArr) => {
        photoArr.forEach((photo) => {
          answers[photo.answer_id].photos.push(photo.url);
        });
      });
      return answers;
    })
    .catch((err) => {
      console.log('getAnswersByQuestionId', err);
    });
};

const getQAbyProductId = (product_id) => {
  let results = [];

  return getQuestionsByProductId(product_id)
    .then((response) => {
      results = response;
      const promArray = [];
      results.forEach((q) => {
        promArray.push(getAnswersByQuestionId(q.question_id));
      });
      return Promise.all(promArray);
    })
    .then((response) => {
      response.forEach((ansArr, i) => {
        results[i].answers = ansArr;
      });
      return results;
    })
    .catch((err) => {
      console.log('getQAbyProductId', err);
    });
};

const getQAbyProductIdJoin = (product_id, page, count) => {
  const results = [];
  const limit = count;
  const offset = (page - 1) * count;
  return sequelize.query(`select "Questions".id as question_id, "Questions".body as question_body, "Questions".date_written as question_date, asker_name, "Questions".helpful as question_helpfulness, "Answers".id as id, "Answers".body, "Answers".date_written as date, "Answers".answerer_name, "Answers".helpful as helpfulness, "AnswersPhotos".url from (select * from "Questions" where product_id = ${product_id} and "Questions".reported = false order by "Questions".id limit ${limit} offset ${offset}) "Questions" left outer join "Answers" on "Questions".id = "Answers".question_id left outer join "AnswersPhotos" on "Answers".id = "AnswersPhotos".answer_id where ("Answers".reported = false or "Answers".reported is null);`, {
    type: QueryTypes.SELECT,
  })
    .then((response) => {
      let i = 0;
      let j;
      let k;
      while (i < response.length) {
        const question = Question2(response[i]);
        if (response[i].body) {
          j = i;
          while (j < response.length && response[j].question_id === response[i].question_id) {
            k = j;
            const answer = Answer2(response[j]);
            while (k < response.length && response[j].id === response[k].id) {
              if (response[k].url) {
                answer.photos.push(response[k].url);
              }
              k++;
            }
            question.answers[answer.id] = answer;
            j = k;
          }
          i = j;
        } else {
          i++;
        }
        results.push(question);
      }
      return results;
    })
    .catch((err) => {
      console.log('getQAbyProductIDJoin', err);
    });
};

module.exports = {
  getQAbyProductId,
  getQAbyProductIdJoin,
};
