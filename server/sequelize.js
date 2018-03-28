const Sequelize = require('sequelize');
const sequelize = new Sequelize('indoor_new', 'root', '123456', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define:{
    timestamp: false
  },
  operatorsAliases: false
});

const User = sequelize.define('user', {
  username: Sequelize.DataTypes.STRING,
  birthday: Sequelize.DataTypes.DATE
});
const Project = sequelize.define('project', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT
});

const Task = sequelize.define('task', {
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  deadline: Sequelize.DATE
});