const { Sequelize, Model, DataTypes } = require('sequelize');
const Promise = require('bluebird');
require('dotenv').config();

// Option 1: Passing a connection URI
const sequelize = new Sequelize(`postgres://${process.env.pgUser}:${process.env.pgPass}@localhost:${process.env.pgPort}/SDC`); // Example for postgres

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
    allowNull: false,
  },
  date_written: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  answerer_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  answerer_email: {
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
    allowNull: false,
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
    reported: Boolean(data.reported),
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

const getPhotosByAnswerId = (answer_id) => (
  AnswersPhotos.findAll({
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

const getAnswersByQuestionId = (question_id) => (
  Answers.findAll({
    where: {
      question_id,
      reported: false,
    },
  })
    .then((response) => {
      return response;
      // const promArray = [];
      // response.forEach((ansArr, i) => {
      //   ansArr.forEach((ans) => {
      //     results[i].answers[ans.id] = Answer(ans);
      //     promArray.push(getPhotosByAnswerId(ans.id));
      //   });
      // });
      // return Promise.all(promArray);
    })
    .catch((err) => {
      console.log('getAnswersByQuestionId', err);
    })
);

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
        ansArr.forEach((ans) => {
          results[i].answers[ans.id] = Answer(ans);
        });
      });
      return results;
    })
    .catch((err) => {
      console.log('getQAbyProductId', err);
    });
};

module.exports = {
  getQAbyProductId,
};
