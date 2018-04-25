'use strict';

angular.module('CooperativeIndoorMap')
  .service('DataImport', ['MapHandler',
    function(MapHandler) {

      var map, drawnItems;

      return {
        init: function(mapInstance, drawn) {
          map = mapInstance;
          drawnItems = drawn;
        },

        /**
         * 从GeoJSON导入地图元素
         * 创建一个GeoJSON对象，并处罚地图创建事件
         * @param {Object} data The (valid) GeoJSON data
         */
        importGeoJson: function(data) {
          var geojson = MapHandler.createSimpleStyleGeoJSONFeature(data);

          // fake a draw event, so we can reuse the existing signaling pipeline:
          // (add to map, clickhandlers, broadcast to other users, ..)
          geojson.eachLayer(function(layer) {
            map.fire('draw:created', {
              action: 'imported feature',
              layer: layer
            });
          });

          map.fitBounds(geojson);
        },
        /**
         * 将当前绘制的元素导出为GeoJSON
         * @returns {*}
         */
        exportGeoJson: function() {
          return drawnItems.toGeoJSON();
        }
      };

    }]
  );
