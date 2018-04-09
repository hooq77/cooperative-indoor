const model = require('./model');
const wkx = require('wkx');

exports.findBuildingsByBounds = function(bounds, callback){
  let geometry = wkx.Geometry.parseGeoJSON(bounds.geometry);
  let wkt = "SRID=4326;" + geometry.toWkt()
  model.Building.findAll({
    where: model.sequelize.fn('st_intersects', model.sequelize.col('outline'), wkt)
  }).then((res) => {
    callback(undefined, res);
  }).catch(err => callback(err))
};

exports.findFloorsById = function(mapId, callback){
  model.Floor.findAll({
    where: {
      building_id:mapId
    }
  }).then((res) => {
    callback(undefined, res);
  }).catch(err => callback(err))
};

exports.findAreasById = function(floorId, callback){
  model.Area.findAll({
    where: {
      floor_id: floorId
    }
  }).then((res) => {
    callback(undefined, res);
  }).catch(err => callback(err))
};

exports.getAreaHistoryById = function (id, callback) {
  model.AreaHistory.findAll({
    where: {
      id: id
    }
  }).then((res) => {
    callback(undefined, res)
  }).catch(err => callback(err))
}