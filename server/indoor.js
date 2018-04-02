const dbHelper = require('./dbHelper');

exports.getIndoorListByBounds = function (bounds, callback) {
  dbHelper.findBuildingsByBounds(bounds, (err, res) => {
    if (err) {
      callback(err, res);
    } else {
      let geojsons = [];
      for (let i = 0; i < res.length; i++) {
        let building = res[i].toJSON();
        let geojson = {
          type: 'Feature',
          properties: {}
        }
        geojson.id = building.id;
        geojson.properties = building;
        geojson.model = "building";
        geojson.geometry = building.outline;
        if(geojson.properties.outline)
          delete geojson.properties.outline;
        if(geojson.properties.deleted !== undefined)
          delete geojson.properties.deleted;
        geojsons.push(geojson);
      }
      callback(err, geojsons)
    }
  })
}

exports.getFloorsById = function (indoorId, callback) {
  dbHelper.findFloorsById(indoorId, (err, res) => {
    if(err) {
      callback(err, res);
    } else {
      let geojsons = [];
      for (let i = 0; i < res.length; i++) {
        let floor = res[i].toJSON();
        let geojson = {
          type: 'Feature',
          properties: {}
        }
        geojson.id = floor.id;
        geojson.properties = floor;
        geojson.model = "floor";
        geojson.geometry = floor.outline;
        if(geojson.properties.outline)
          delete geojson.properties.outline;
        if(geojson.properties.deleted !== undefined)
          delete geojson.properties.deleted;
        geojsons.push(geojson);
      }
      callback(err, geojsons)
    }
  })
}

exports.getAreasById = function (floorId, callback) {
  dbHelper.findAreasById(floorId, (err, res) => {
    if(err) {
      callback(err, res);
    } else {
      let geojsons = [];
      for (let i = 0; i < res.length; i++) {
        let area = res[i].toJSON();
        let geojson = {
          type: 'Feature',
          properties: {}
        }
        geojson.id = area.id;
        geojson.properties = area;
        geojson.geometry = area.outline;
        geojson.model = "area";
        if(geojson.properties.outline)
          delete geojson.properties.outline;
        if(geojson.properties.deleted !== undefined)
          delete geojson.properties.deleted;
        geojsons.push(geojson);
      }
      callback(err, geojsons)
    }
  })
}