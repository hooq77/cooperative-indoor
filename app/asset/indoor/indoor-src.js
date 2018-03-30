/**
 * A layer that will display indoor data
 *
 * addData takes a GeoJSON feature collection, each feature must have a level
 * property that indicates the level.
 *
 * getLevels can be called to get the array of levels that are present.
 */
/* global L */
let geojson = L.geoJSON({type: 'FeatureCollection',features: []});

function getGeoJSON(feature) {
  geojson.addData(feature.outline);
  let layer = geojson.getLayers()[0];
  geojson.removeLayer(layer);

  layer._leaflet_id = feature.id;
  return layer
}

L.Control.Level = L.Control.extend({
  options: {
    position: 'bottomright',

    // used to get a unique integer for each level to be used to order them
    parseLevel: function (level) {
      return parseInt(level, 10)
    }
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
    let self = this

    let levels = []

    for (let i = 0; i < this.options.levels.length; i++) {
      let level = this.options.levels[i]

      let levelNum = self.options.parseLevel(level)

      levels.push({
        num: levelNum,
        label: level
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
      levelBtn.onclick = function () {
        self.setLevel(level)
      }
      buttons[level] = levelBtn
    }
    this._indoor.setLevel(activeLevel)
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
    getLevel: function (feature) {
      if (feature.properties.role === 'buildingpart') {
        return feature.properties.floor
      } else if (feature.properties.role === 'floor') {
        return feature.properties.level
      }
      return null
    },
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

    this._map = null;
    this._data = {};
    this._baseFloor = {};
    this._fullFloor = {};

    this._leaflet_id = building.id;
    this._data[building.id] = building;
    this._levelControl = null;
  },
  addFloors: function(features) {
    for (let k in features) {
      let feature = features[k];
      this._data[feature.id] = feature;
      this._baseFloor[feature.number] = getGeoJSON(feature);
      this._fullFloor[feature.number] = L.featureGroup([]);
    }
    this._levelControl = L.Control.Level(this, option)
  },
  addFeatures: function(floorId, features) {
    let floorNum = this._data[floorId].number;
    for (let k in features) {
      let feature = features[k];
      this._data[feature.id] = feature;
      this._fullFloor[floorNum].addLayer(getGeoJSON(feature))
    }
  },
  addTo: function (map) {
    map.addLayer(this)
    return this
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
      if (this._level in this._layers) {
        this._map.addLayer(this._floors[this._level])
        this._map.addLayer(this._layers[this._level])
        this._map.addLayer(this._pois[this._level])
      } else {
        // TODO: Display warning?
      }
    }
  },
  onRemove: function (map) {
    if (this._level in this._layers) {
      this._map.removeLayer(this._layers[this._level])
      this._map.removeLayer(this._floors[this._level])
    }

    this._map = null
  },
  getLevels: function () {
    return Object.keys(this._layers)
  },
  setLevel: function (level) {
    if (typeof (level) === 'object') {
      level = level.newLevel
    }

    if (this._level === level) {
      return
    }

    let oldLayer = this._layers[this._level]
    let oldFloor = this._floors[this._level]
    let oldPoi = this._pois[this._level]
    let layer = this._layers[level]
    let floor = this._floors[level]
    let poi = this._pois[level]
    if (this._map !== null) {
      if (this._map.hasLayer(oldLayer)) {
        this._map.removeLayer(oldLayer)
      }
      if (this._map.hasLayer(oldFloor)) {
        this._map.removeLayer(oldFloor)
      }
      if (this._map.hasLayer(oldPoi)) {
        this._map.removeLayer(oldPoi)
      }
      this._map.addLayer(floor)
      this._map.addLayer(layer)
      this._map.addLayer(poi)
    }

    this._level = level
  },
  resetStyle: function (layer) {
    // reset any custom styles
    layer.options = layer.defaultOptions
    this._setLayerStyle(layer, this.options.style)
    return this
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

