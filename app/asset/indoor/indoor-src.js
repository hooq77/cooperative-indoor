/**
 * A layer that will display indoor data
 *
 * addData takes a GeoJSON feature collection, each feature must have a level
 * property that indicates the level.
 *
 * getLevels can be called to get the array of levels that are present.
 */
/* global L */
L.Control.Level = L.Control.extend({
  options: {
    position: 'bottomright',
  },

  initialize: function (indoor, options) {
    L.setOptions(this, options)
    this._indoor = indoor
    this._map = null
    this._buttons = {}
    this._level = options.level
  },
  onAdd: function (map) {
    let div = L.DomUtil.create('div', 'leaflet-bar leaflet-control')

    div.style.font = '18px "Lucida Console",Monaco,monospace'

    let buttons = this._buttons
    let activeLevel = this._level

    let levels = []

    for (let i = 0; i < this.options.levels.length; i++) {
      let levelNum = this.options.levels[i]

      let levelName = this.options.names[i]

      levels.push({
        num: levelNum,
        label: levelName
      })
    }

    levels.sort(function (a, b) {
      return a.num - b.num
    })

    for (let i = levels.length - 1; i >= 0; i--) {
      let level = levels[i].num
      let originalLevel = levels[i].label
    
      let levelBtn = L.DomUtil.create('a', 'leaflet-button-part', div)
      levelBtn.href = '#'
      if (level === activeLevel || originalLevel === activeLevel) {
        levelBtn.style.backgroundColor = '#b0b0b0'
      }
      levelBtn.appendChild(levelBtn.ownerDocument.createTextNode(originalLevel))
      L.DomEvent.on(levelBtn ,'click', L.DomEvent.stop);
      L.DomEvent.on(levelBtn, 'click',  function () {
        this.setLevel(level)
      }, this)
      buttons[level] = levelBtn
    }
    return div
  },
  setLevel: function (level) {
    if (level === this._level) {
      return
    }

    let oldLevel = this._level
    this._level = level

    this._indoor.setLevel({
      oldLevel: oldLevel,
      newLevel: level
    })
    
    if (this._map !== null) {
      if (typeof oldLevel !== 'undefined') {
        this._buttons[oldLevel].style.backgroundColor = '#FFFFFF'
      }
      this._buttons[level].style.backgroundColor = '#b0b0b0'
    }
  }
})

L.Control.level = function (indoor, options) {
  return new L.Control.Level(indoor, options)
};

L.Indoor = L.Layer.extend({
  options: {
    style: function (feature) {
      let fill = 'white'

      if (feature.properties.type === '教室') {
        fill = '#169EC6'
      } else if (feature.properties.type === '储物间') {
        fill = '#0A485B'
      }

      return {
        fillColor: fill,
        weight: 1,
        color: '#666',
        fillOpacity: 1
      }
    }
  },

  initialize: function (building, options) {
    L.setOptions(this, options);
    this.geojson = L.geoJSON({type: 'FeatureCollection',features: []}, this.options);
    this._map = null;
    this._data = {};
    this._baseFloor = {};
    this._fullFloor = {};
    this._level = null;
    
    this._leaflet_id = building.id;
    this._data[building.id] = building;
    this._levelControl = null;
  },
  addFloors: function(features) {
    let names = [];
    
    for (let k in features) {
      let feature = features[k];
      this._data[feature.id] = feature;
      names.push(feature.name);
      this._baseFloor[feature.number] = this._getGeoJSON(feature);
      this._fullFloor[feature.number] = L.featureGroup([]);
    }
    this._levelControl = L.Control.level(this, {
      levels: this.getLevels(),
      level: this.getLevels()[0],
      names: names
    })
  },
  addFeatures: function(floorId, features) {
    let floorNum = this._data[floorId].number;
    for (let k in features) {
      let feature = features[k];
      this._data[feature.id] = feature;
      this._fullFloor[floorNum].addLayer(this._getGeoJSON(feature))
    }
  },
  onAdd: function (map) {
    this._map = map

    if (this._level === null) {
      let levels = this.getLevels()

      if (levels.length !== 0) {
        this._level = levels[0]
      }
    }

    if (this._level !== null) {
      if (this._level in this._baseFloor) {
        this._baseFloor[this._level].addTo(map);
        this._fullFloor[this._level].addTo(map);
      } else {
        // TODO: Display warning?
      }
      this._levelControl.addTo(map);
    }
  },
  onRemove: function (map) {
    if (this._level in this._layers) {
      this._map.removeLayer(this._baseFloor[this._level])
      this._map.removeLayer(this._fullFloor[this._level])
    }
    this._levelControl.remove();
    this._map = null
  },
  getLevels: function () {
    return Object.keys(this._baseFloor)
  },
  setLevel: function (level) {
    if (typeof (level) === 'object') {
      level = level.newLevel
    }

    if (this._level === level) {
      return
    }

    if (this._map !== null) {
      if (this._map.hasLayer(this._fullFloor[this._level])) {
        this._map.removeLayer(this._fullFloor[this._level])
      }
      if (this._map.hasLayer(this._baseFloor[this._level])) {
        this._map.removeLayer(this._baseFloor[this._level])
      }
      this._map.addLayer(this._baseFloor[level])
      this._map.addLayer(this._fullFloor[level])
    }

    this._level = level
    this.fire("levelchange", {level: level})
  },
  resetStyle: function (layer) {
    // reset any custom styles
    layer.options = layer.defaultOptions
    this._setLayerStyle(layer, this.options.style)
    return this
  },
  _getGeoJSON: function(feature) {
    this.geojson.addData(feature.outline);
    let layer = this.geojson.getLayers()[0];
    this.geojson.removeLayer(layer);
    
    layer._leaflet_id = feature.id;
    return layer
  },
  _setLayerStyle: function (layer, style) {
    if (typeof style === 'function') {
      style = style(layer.feature)
    }
    if (layer.setStyle) {
      layer.setStyle(style)
    }
  }
})

L.indoor = function (data, options) {
  return new L.Indoor(data, options)
}

