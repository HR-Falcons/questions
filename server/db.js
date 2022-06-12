const { Sequelize, Model, DataTypes, QueryTypes } = require('sequelize');
const Promise = require('bluebird');
require('dotenv').config();

// const sequelize = new Sequelize(`postgres://${process.env.sdccloudUser}:${process.env.sdccloudPass}@${process.env.sdccloudURL}:${process.env.pgPort}/sdc`, {
//   logging: false,
// });

const sequelize = new Sequelize(`postgres://${process.env.pgUser}:${process.env.pgPass}@localhost:${process.env.pgPort}/SDC`, {
  logging: false,
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
  });

const Questions = sequelize.define('Questions', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
  },
  body: {
    type: DataTypes.TEXT,
  },
  date_written: {
    type: DataTypes.BIGINT,
  },
  asker_name: {
    type: DataTypes.TEXT,
  },
  asker_email: {
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

const Answers = sequelize.define('Answers', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.INTEGER,
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
    autoIncrement: true,
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

const Answer3 = (data) => (
  {
    answer_id: data.answer_id,
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

const getQuestionsByProductId = (product_id, page, count) => (
  Questions.findAll({
    attributes: ['id', 'body', 'date_written', 'asker_name', 'helpful'],
    where: {
      product_id,
      reported: false,
    },
    limit: count,
    offset: (page - 1) * count,
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

const getQAbyProductId = (product_id, page, count) => {
  let results = [];

  return getQuestionsByProductId(product_id, page, count)
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

const getAbyProductIdJoin = (question_id, page, count) => {
  const results = [];
  const limit = count;
  const offset = (page - 1) * count;
  return sequelize.query(`select "Answers".id as answer_id, "Answers".body, "Answers".date_written as date, "Answers".answerer_name, "Answers".helpful as helpfulness, "AnswersPhotos".id as photo_id, "AnswersPhotos".url from (select * from "Answers" where "Answers".question_id = ${question_id} and "Answers".reported = false order by "Answers".id limit ${limit} offset ${offset} ) "Answers" left outer join "AnswersPhotos" on "Answers".id = "AnswersPhotos".answer_id;`, {
    type: QueryTypes.SELECT,
  })
    .then((response) => {
      let j = 0;
      let k;
      while (j < response.length) {
        k = j;
        const answer = Answer3(response[j]);
        while (k < response.length && response[j].answer_id === response[k].answer_id) {
          if (response[k].url) {
            answer.photos.push({
              id: response[k].photo_id,
              url: response[k].url,
            });
          }
          k++;
        }
        j = k;
        results.push(answer);
      }
      return results;
    })
    .catch((err) => {
      console.log('getAbyProductIDJoin', err);
    });
};

const addQuestion = (body, name, email, product_id) => (
  Questions.create({
    product_id,
    body,
    date_written: Date.now(),
    asker_name: name,
    asker_email: email,
    reported: false,
    helpful: 0,
  }).then((data) => (
    Answers.create({
      question_id: data.id,
      body: null,
      date_written: null,
      answerer_name: null,
      answerer_email: null,
      reported: null,
      helpful: null,
    })
  ))
);

const addAnswer = (question_id, body, name, email, photos) => (
  Answers.findOne({
    where: {
      question_id,
      body: null,
    },
  })
    .then((data) => {
      if (data) {
        return Answers.update({
          body,
          date_written: Date.now(),
          answerer_name: name,
          answerer_email: email,
          reported: false,
          helpful: 0,
        }, {
          where: {
            id: data.id,
          },
        });
      }
      return Answers.create({
        question_id,
        body,
        date_written: Date.now(),
        answerer_name: name,
        answerer_email: email,
        reported: false,
        helpful: 0,
      });
    })
    .then((data) => {
      if (photos) {
        const promArray = photos.map((url) => (
          AnswersPhotos.create({
            answer_id: data.id,
            url,
          })
        ));
        return Promise.all(promArray);
      }
    })
);

const markQuestionHelpful = (question_id) => (
  Questions.increment('helpful', {
    where: {
      id: question_id,
    },
  })
);

const reportQuestion = (question_id) => (
  Questions.update({
    reported: true,
  }, {
    where: {
      id: question_id,
    },
  })
);

const markAnswerHelpful = (answer_id) => (
  Answers.increment('helpful', {
    where: {
      id: answer_id,
    },
  })
);

const reportAnswer = (answer_id) => (
  Answers.update({
    reported: true,
  }, {
    where: {
      id: answer_id,
    },
  })
);

module.exports = {
  getQAbyProductId,
  getQAbyProductIdJoin,
  getAbyProductIdJoin,
  addQuestion,
  addAnswer,
  markQuestionHelpful,
  reportQuestion,
  markAnswerHelpful,
  reportAnswer,
};
