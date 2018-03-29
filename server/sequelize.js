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
const pg = require('pg');
client = new pg.Client('postgres://root:123456@localhost:5432/indoor_new');

var User = sequelize.define('user', {
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

var Building = sequelize.define('building', {
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


var BuildingHistory = sequelize.define('buildingHistory', {
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

var Floor = sequelize.define('floor', {
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


var FloorHistory = sequelize.define('floorHistory', {
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


var Area = sequelize.define('area', {
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


var AreaHistory = sequelize.define('areaHistory', {
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
})

var Style = sequelize.define('style', {
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


var Poi = sequelize.define('poi', {
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
})


var PoiHistory = sequelize.define('poiHistory', {
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

var Line = sequelize.define('line', {
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

var LineHistory = sequelize.define('lineHistory', {
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

sequelize.sync({force: true}).then(res => {
  console.log(res.models);
  User.create({
    name: 'huqiang',
    password:'123456',
    real_name: '胡强',
    role: 'admin',
    mobile: '15071197759',
    email: 'huhooo@126.com',
    organization: '华中科技大学',
    occupation: '学生',
    reg_time: new Date('2017-11-16 03:14:24.326308'),
    last_login: new Date('2017-11-16 03:14:24.326308')
  }).then( data => {
    client.connect((err) => {
      if (err) {
        console.error(err.stack);
        return;
      }
      client.query("select *, st_asgeojson(outline) as geo, st_asgeojson(center_point) as point from bld_info;", (err, res) => {
        if (err) {
          return console.error('查询出错...', err);
        }
        console.log("数据库连接成功...");
        if(res.rows.length !== 0) {
          for (var i in res.rows) {
            copyBuilding(res.rows[i])
          }
        }
      })
    })
  })
});


function copyBuilding(building) {
  var id = building.id;
  var crs =  { type: 'name', properties: { name: 'EPSG:4326'}};
  building.owner = 'huqiang';
  building.deleted = false;
  building.time = building.create_time;
  building.outline = JSON.parse(building.geo);
  building.center_point = JSON.parse(building.point);
  building.outline.crs = crs;
  building.center_point.crs = crs;
  delete building.point;
  delete building.geo;
  delete building.create_time;
  delete building.create_by_user;
  delete building.init_layer;
  delete building.id;
  Building.create(building).then((res) => {
    console.log("building复制成功");
    var buildingHistory = res.dataValues;
    buildingHistory.operation = 'insert';
    buildingHistory.outline = building.outline;
    buildingHistory.center_point = building.center_point;
    BuildingHistory.create(buildingHistory).then(() => {
      console.log("building history 复制成功");
      client.query("select *, st_asgeojson(outline) as geo from bld_floor where bld_floor.building = " + id, [], (err, res) => {
        if(err) {
          console.error(err.stack);
        } else {
          for (var key in res.rows) {
            // console.log(res.rows[key]);
            copyFloor(res.rows[key], buildingHistory.id)
          }
        }
      })
    })
  })
}

function copyFloor(floor, buildingId) {
  var id = floor.id;
  var crs =  { type: 'name', properties: { name: 'EPSG:4326'}};
  delete floor.building;
  floor.building_id = buildingId;
  delete floor.create_by_user;
  floor.owner = 'huqiang';
  floor.time = floor.create_time;
  delete floor.create_time;
  floor.number = floor.layer_number;
  delete floor.layer_number;
  floor.name = floor.layer_name;
  delete floor.layer_name;
  floor.outline = JSON.parse(floor.geo);
  delete floor.geo;
  floor.outline.crs = crs;
  delete floor.id;
  floor.deleted = false;
  Floor.create(floor).then((res) => {
    console.log("floor 复制成功");
    // console.log(res.dataValues);
    var floorHistory = res.dataValues;
    floorHistory.operation = 'insert';
    floorHistory.outline = floor.outline;

    FloorHistory.create(floorHistory).then(() => {
      console.log("floor history 复制成功")
      client.query("select *, st_asgeojson(geo) as outline from bld_part where bld_part.floor = " + id, [], (err, res) => {
        if(err) {
          console.error(err.stack);
        } else {
          for (var key in res.rows) {
            // console.log(res.rows[key]);
            copyPart(res.rows[key], floorHistory.id);
          }
        }
      })
    })
  })
}

function copyPart(part, floorId) {
  var area = {};
  area.floor_id = floorId;
  area.outline = JSON.parse(part.outline);
  area.outline.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
  area.name = part.name;
  area.type = part.type;
  area.number = part.number;
  area.version = part.version;
  area.deleted = false;
  area.time = part.create_time;
  area.owner = 'huqiang';
  
  Area.create(area).then((res) => {
    console.log('area 复制成功');
    var areaHistory = res.dataValues;
    areaHistory.outline = area.outline;
    areaHistory.operation = 'insert';
    AreaHistory.create(areaHistory).then((res) => {
      console.log('area history 复制成功')
    })
  })
  
}

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