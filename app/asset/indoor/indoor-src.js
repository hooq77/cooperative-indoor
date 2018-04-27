'use strict';
/* global L */
L.Control.Level = L.Control.extend({
  options: {
    position: 'bottomright',
  },

  initialize: function (indoor, options) {
    L.setOptions(this, options);
    this._indoor = indoor;
    this._map = null;
    this._buttons = {};
    this._level = options.level;
  },
  onAdd: function () {
    let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

    div.style.font = '18px "Lucida Console",Monaco,monospace';

    let buttons = this._buttons;
    let activeLevel = this._level;

    let levels = [];

    for (let i = 0; i < this.options.levels.length; i++) {
      let levelNum = this.options.levels[i];
      let levelName = this.options.names[i];
      levels.push({
        num: Number.parseInt(levelNum),
        label: levelName
      });
    }

    levels.sort(function (a, b) {
      return a.num - b.num;
    });

    for (let i = levels.length - 1; i >= 0; i--) {
      // jshint -W083
      let level = levels[i].num;
      let originalLevel = levels[i].label;
    
      let levelBtn = L.DomUtil.create('a', 'leaflet-button-part', div);
      levelBtn.href = '#';
      if (level === activeLevel || originalLevel === activeLevel) {
        levelBtn.style.backgroundColor = '#b0b0b0';
      }
      levelBtn.appendChild(levelBtn.ownerDocument.createTextNode(originalLevel));
      L.DomEvent.on(levelBtn ,'click', L.DomEvent.stop);
      L.DomEvent.on(levelBtn, 'click',  function () {
        this.setLevel(level);
      }, this);
      buttons[level] = levelBtn;
    }
    return div;
  },
  setLevel: function (newLevel) {
    let oldLevel = this._level;
    if (newLevel === oldLevel) {
      return;
    }

    this._level = newLevel;
    this._indoor.setLevel(newLevel);
    
    if (this._map !== null) {
      if (typeof oldLevel !== 'undefined') {
        this._buttons[oldLevel].style.backgroundColor = '#FFFFFF';
      }
      this._buttons[newLevel].style.backgroundColor = '#b0b0b0';
    }
  }
});

L.Control.level = function (indoor, options) {
  return new L.Control.Level(indoor, options);
};

L.Indoor = L.Evented.extend({
  options: {
    style: function (feature) {
      let fill = 'white';

      if (feature.properties.type === '教室') {
        fill = '#169EC6';
      } else if (feature.properties.type === '储物间') {
        fill = '#0A485B';
      }

      return {
        fillColor: fill,
        weight: 1,
        color: '#666',
        fillOpacity: 1
      };
    }
  },

  initialize: function (building, options) {
    // jshint camelcase:false
    L.setOptions(this, options);
    this._geojson = L.geoJSON({type: 'FeatureCollection',features: []}, this.options);
    this._map = null;
    this._data = {};
    this._floors = {};
    this._areas = {};
    this._lines = {};
    this._pois = {};

    this._level = null;
    this._levels = [];
    
    this._leaflet_id = building.id;
    this._data[building.id] = building;
    this._levelControl = null;
  },
  addFloors: function(features) {
    // jshint camelcase:false
    let names = [];

    for (let i = 0; i < features.length; i++) {
      let props = features[i].properties;
      this._data[props.id] = features[i];
      this._levels.push(props.number);
      names.push(props.name);
      this._floors[props.number] = this._getGeoJSON(features[i]);
      this._areas[props.number] = L.featureGroup([]);
      this._lines[props.number] = L.featureGroup([]);
      this._pois[props.number] = L.featureGroup([]);
    }
    this._levelControl = L.Control.level(this, {
      levels: this._levels,
      level: this._levels[0],
      names: names
    });
    this.fire('indoor:loaded', {id: this._leaflet_id});
  },
  addAreas: function(floorId, features) {
    let floorNum = this._data[floorId].properties.number;
    var map = this._map;
    for (let i  = 0; i < features.length; i ++) {
      let props = features[i].properties;
      this._data[props.id] = features[i];
      let area = this._getGeoJSON(features[i]);
      this._areas[floorNum].addLayer(area);
      area.addTo(map);
      let point = area.getCenter();
      area.remove();
      let poi = L.marker(point, {
        icon: L.divIcon({
          html: props.name,
          iconSize: [60, 20],
          bgPos: [30, 10],
          className: 'leaflet-marker-poi'
        })
      });
      poi.bindPopup(JSON.stringify(props));
      this._pois[floorNum].addLayer(poi);
    }
    if(map.hasLayer(this._areas[floorNum])) {
      map.removeLayer(this._areas[floorNum]);
      map.addLayer(this._areas[floorNum]);
    }
  },
  addLines: function(floorId, features) {
    let floorNum = this._data[floorId].properties.number;
    for (let i  = 0; i < features.length; i ++) {
      let props = features[i].properties;
      this._data[props.id] = features[i];
      this._areas[floorNum].addLayer(this._getGeoJSON(features[i]));
    }
  },
  addPois: function(floorId, features) {
    let floorNum = this._data[floorId].properties.number;
    for (let i  = 0; i < features.length; i ++) {
      let props = features[i].properties;
      this._data[props.id] = features[i];
      this._areas[floorNum].addLayer(this._getGeoJSON(features[i]));
    }
  },
  addTo: function (map) {
    this._map = map;

    if (this._level === null) {
      if (this._levels.length !== 0) {
        this._level = this._levels[0];
      }
    }

    if (this._level !== null) {
      this._floors[this._level].addTo(map);
      this._areas[this._level].addTo(map);
      this._lines[this._level].addTo(map);
      this._pois[this._level].addTo(map);
      this._levelControl.addTo(map);
    }
  },
  remove: function () {
    this._map.removeLayer(this._floors[this._level]);
    this._map.removeLayer(this._areas[this._level]);
    this._map.removeLayer(this._lines[this._level]);
    this._map.removeLayer(this._pois[this._level]);

    this._levelControl.remove();
    this._map = null;
  },
  setLevel: function (newLevel) {
    let oldLevel = this._level;
    if (oldLevel === newLevel) {
      return;
    }

    this._level = newLevel;

    if (this._map !== null) {
      this._map.removeLayer(this._areas[oldLevel]);
      this._map.removeLayer(this._floors[oldLevel]);
      this._map.removeLayer(this._lines[oldLevel]);
      this._map.removeLayer(this._pois[oldLevel]);

      this._map.addLayer(this._floors[newLevel]);
      this._map.addLayer(this._areas[newLevel]);
      this._map.addLayer(this._lines[newLevel]);
      this._map.addLayer(this._pois[newLevel]);
    }

    this.fire('indoor:level', {level: this._level});
  },
  resetStyle: function (layer) {
    // reset any custom styles
    layer.options = layer.defaultOptions;
    this._setLayerStyle(layer, this.options.style);
    return this;
  },
  _getGeoJSON: function(feature) {
    // jshint camelcase:false
    this._geojson.addData(feature);
    let layer = this._geojson.getLayers()[0];
    this._geojson.removeLayer(layer);
    
    layer._leaflet_id = feature.id;
    return layer;
  },
  _setLayerStyle: function (layer, style) {
    if (typeof style === 'function') {
      style = style(layer.feature);
    }
    if (layer.setStyle) {
      layer.setStyle(style);
    }
  }
});

L.indoor = function (data, options) {
  return new L.Indoor(data, options);
};

