const { Sequelize, Model, DataTypes } = require('sequelize');
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

const getById = (id) => (
  Questions.findAll({
    where: {
      id,
    },
  })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      console.log(err);
    })
);

module.exports = {
  getById,
};
