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

let User = sequelize.define('user', {
  name:{
    type: Sequelize.DataTypes.STRING(30),
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

let Building = sequelize.define('building', {
  id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
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
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "indoor_building"
});

let BuildingHistory = sequelize.define('buildingHistory', {
  key:{
    type:Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  operation: Sequelize.DataTypes.STRING(10),
  parent: Sequelize.DataTypes.INTEGER,
  merge: Sequelize.DataTypes.INTEGER,
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
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
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "history_building"
});

let Floor = sequelize.define('floor', {
  id:{
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  number: Sequelize.DataTypes.INTEGER,
  name: Sequelize.DataTypes.STRING(40),
  height: Sequelize.DataTypes.REAL,
  outline: {
    type: Sequelize.DataTypes.GEOMETRY('GEOMETRY', 4326),
    allowNull: false
  },
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "indoor_floor"
});

let FloorHistory = sequelize.define('floorHistory', {
  key:{
    type:Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  operation: Sequelize.DataTypes.STRING(10),
  parent: Sequelize.DataTypes.INTEGER,
  merge: Sequelize.DataTypes.INTEGER,
  id:{
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  number: Sequelize.DataTypes.INTEGER,
  name: Sequelize.DataTypes.STRING(40),
  height: Sequelize.DataTypes.REAL,
  outline: {
    type: Sequelize.DataTypes.GEOMETRY('GEOMETRY', 4326),
    allowNull: false
  },
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "history_floor"
});

let Area = sequelize.define('area', {
  id:{
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  type:Sequelize.DataTypes.STRING(10),
  name: Sequelize.DataTypes.STRING(40),
  number:  Sequelize.DataTypes.STRING(10),
  outline: {
    type: Sequelize.DataTypes.GEOMETRY('GEOMETRY', 4326),
    allowNull: false
  },
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "indoor_area"
});

let AreaHistory = sequelize.define('areaHistory', {
  key:{
    type:Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  operation: Sequelize.DataTypes.STRING(10),
  parent: Sequelize.DataTypes.INTEGER,
  merge: Sequelize.DataTypes.INTEGER,
  id:{
    type: Sequelize.DataTypes.UUID,
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  type:Sequelize.DataTypes.STRING(10),
  name: Sequelize.DataTypes.STRING(40),
  number:  Sequelize.DataTypes.STRING(10),
  outline: {
    type: Sequelize.DataTypes.GEOMETRY('GEOMETRY', 4326),
    allowNull: false
  },
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "history_area"
});

let Style = sequelize.define('style', {
  id:{
    type: Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: Sequelize.DataTypes.STRING(10),
  name: Sequelize.DataTypes.STRING(10),
  stroke: Sequelize.DataTypes.STRING(10),
  "stroke-width": Sequelize.DataTypes.REAL,
  "stroke-opacity": Sequelize.DataTypes.REAL,
  fill: Sequelize.DataTypes.STRING(10),
  "fill-opacity": Sequelize.DataTypes.REAL,
}, {
  freezeTableName: true,
  tableName: "sys_style"
});

let Poi = sequelize.define('poi', {
  id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  type:Sequelize.DataTypes.STRING(10),
  name: Sequelize.DataTypes.STRING(40),
  visible: Sequelize.DataTypes.BOOLEAN,
  ico: Sequelize.DataTypes.TEXT,
  image: Sequelize.DataTypes.TEXT,
  website: Sequelize.DataTypes.TEXT,
  latlng: {
    type: Sequelize.DataTypes.GEOMETRY('Point', 4326),
    allowNull: false
  },
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "indoor_poi"
});

let PoiHistory = sequelize.define('poiHistory', {
  key:{
    type:Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  operation: Sequelize.DataTypes.STRING(10),
  parent: Sequelize.DataTypes.INTEGER,
  merge: Sequelize.DataTypes.INTEGER,
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  type:Sequelize.DataTypes.STRING(10),
  name: Sequelize.DataTypes.STRING(40),
  visible: Sequelize.DataTypes.BOOLEAN,
  ico: Sequelize.DataTypes.TEXT,
  image: Sequelize.DataTypes.TEXT,
  website: Sequelize.DataTypes.TEXT,
  latlng: {
    type: Sequelize.DataTypes.GEOMETRY('Point', 4326),
    allowNull: false
  },
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "history_poi"
});

let Line = sequelize.define('line', {
  id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV1(),
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  line: {
    type: Sequelize.DataTypes.GEOMETRY('LineString', 4326),
    allowNull: false
  },
  distance: Sequelize.DataTypes.REAL,
  one_way: Sequelize.DataTypes.BOOLEAN,
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "indoor_line"
});

let LineHistory = sequelize.define('lineHistory', {
  key:{
    type:Sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  operation: Sequelize.DataTypes.STRING(10),
  parent: Sequelize.DataTypes.INTEGER,
  merge: Sequelize.DataTypes.INTEGER,
  id: {
    type: Sequelize.DataTypes.UUID,
    primaryKey: true
  },
  deleted: {
    type: Sequelize.DataTypes.BOOLEAN,
    allowNull: false
  },
  line: {
    type: Sequelize.DataTypes.GEOMETRY('LineString', 4326),
    allowNull: false
  },
  distance: Sequelize.DataTypes.REAL,
  one_way: Sequelize.DataTypes.BOOLEAN,
  time: Sequelize.DataTypes.DATE,
  version: {
    type:Sequelize.DataTypes.INTEGER,
    allowNull: false
  }
}, {
  freezeTableName: true,
  tableName: "history_line"
});

User.hasMany(Building, {foreignKey: "owner"});
Building.belongsTo(User, {foreignKey: "owner"});

User.hasMany(BuildingHistory, {foreignKey: "owner"});
BuildingHistory.belongsTo(User, {foreignKey: "owner"});

User.hasMany(Floor, {foreignKey: "owner"});
Floor.belongsTo(User, {foreignKey: "owner"});

User.hasMany(FloorHistory, {foreignKey: "owner"});
FloorHistory.belongsTo(User, {foreignKey: "owner"});

User.hasMany(Area, {foreignKey: "owner"});
Area.belongsTo(User, {foreignKey: "owner"});

User.hasMany(AreaHistory, {foreignKey: "owner"});
AreaHistory.belongsTo(User, {foreignKey: "owner"});

User.hasMany(Poi, {foreignKey: "owner"});
Poi.belongsTo(User, {foreignKey: "owner"});

User.hasMany(PoiHistory, {foreignKey: "owner"});
PoiHistory.belongsTo(User, {foreignKey: "owner"});

User.hasMany(Line, {foreignKey: "owner"});
Line.belongsTo(User, {foreignKey: "owner"});

User.hasMany(LineHistory, {foreignKey: "owner"});
LineHistory.belongsTo(User, {foreignKey: "owner"});

Building.hasMany(Floor);
Floor.belongsTo(Building);

Building.hasMany(FloorHistory);
FloorHistory.belongsTo(Building);

Floor.hasMany(Area);
Area.belongsTo(Floor);

Floor.hasMany(AreaHistory);
AreaHistory.belongsTo(Floor);

Floor.belongsTo(Style);
FloorHistory.belongsTo(Style);

Area.belongsTo(Style);
AreaHistory.belongsTo(Style);

Area.belongsTo(Poi);
AreaHistory.belongsTo(Poi);

Poi.belongsToMany(Floor, {through: 'poi_floor'});
Floor.belongsToMany(Poi, {through: 'poi_floor'});

Line.belongsTo(Poi, {as: "start", foreignKey: "from"});
Line.belongsTo(Poi, {as: "end", foreignKey: "to"});

LineHistory.belongsTo(Poi, {as: "start", foreignKey: "from"});
LineHistory.belongsTo(Poi, {as: "end", foreignKey: "to"});

sequelize.sync().then(() => console.log("数据库已连接"))
  .catch(err => {
    console.log("数据库同步失败！")
    console.error(err.stack)
  });

exports = {User, Building, BuildingHistory, Floor, FloorHistory,
  Area, AreaHistory, Poi, PoiHistory, Line, LineHistory, Style, sequelize};

//
// const User = sequelize.define('user', {
//   uuid: {
//     type: Sequelize.DataTypes.UUID,
//     defaultValue: Sequelize.DataTypes.UUIDV1(),
//     primaryKey: true
//   },
//   username: Sequelize.DataTypes.STRING,
//   birthday: Sequelize.DataTypes.DATE
// }, {
//   timestamps: false,
//   freezeTableName: true,
//   tableName: "user",
//   version: true
// });
// function userInsert(user){
//   User
//     .create(user)
//     .then(res => console.log(res.uuid))
//     .then(findAllUser())
//     .catch(err=> console.error(err.stack));
// }
//
// function findAllUser(){
//   User.findAll()
//     .then(res => {
//       console.log("there are %d item", res.length);
//       for (var key in res) {
//         console.log(res[key].dataValues)
//       }
//     })
//     .catch(err=> console.error(err.stack));
// }
//
// sequelize.sync()
//   .then(res => {
//     console.log(res.models);
//     userInsert({username: 'huqiang', birthday: new Date('2018-03-01')});
//   })
//   .catch(err=> console.error(err.stack));