const Sequelize = require('sequelize');
const sequelize = new Sequelize('temp', 'root', '123456', {
  host: 'localhost',
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define:{
    underscored: true,
    timestamps: false
  },
  operatorsAliases: false
});

var User = sequelize.define('user', {
  name:{
    type: Sequelize.DataTypes.STRING(30),
    allowNull: false,
    primaryKey: true
  },
  password:{
    type: Sequelize.DataTypes.STRING(64),
    allowNull: false
  },
  real_name: {
    type: Sequelize.DataTypes.STRING(30)
  },
  role: Sequelize.DataTypes.STRING(10),
  mobile: Sequelize.DataTypes.STRING(15),
  email: Sequelize.DataTypes.STRING(30),
  organization: Sequelize.DataTypes.STRING(64),
  occupation: Sequelize.DataTypes.STRING(20),
  reg_time: Sequelize.DataTypes.DATE,
  last_login: Sequelize.DataTypes.DATE
}, {
  freezeTableName: true,
  tableName: "sys_user"
});


var Building = sequelize.define('buildingHistory', {
  id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  type:Sequelize.DataTypes.STRING(10),
  short_name: Sequelize.DataTypes.STRING(16),
  name: Sequelize.DataTypes.STRING(40),
  address: Sequelize.DataTypes.STRING(100),
  description: Sequelize.DataTypes.TEXT,
  outline: {
    type: Sequelize.DataTypes.GEOMETRY('GEOMETRY', 4326),
    allowNull: false
  },
  center_point: Sequelize.DataTypes.GEOMETRY('Point', 4326),
  time: Sequelize.DataTypes.DATE,
  version: Sequelize.DataTypes.INTEGER
}, {
  freezeTableName: true,
  tableName: "bld_info"
});
Building.belongsTo(User, {foreignKey: "owner"});
User.hasMany(Building, {foreignKey: "owner"});
sequelize.sync({force: true});