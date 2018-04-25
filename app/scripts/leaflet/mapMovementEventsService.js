'use strict';

angular.module('CooperativeIndoorMap')
  .service('MapMovementEvents', [function() {
    return {

      /**
       * 监听地图移动结束的事件
       * @param  {Object}   map      the map
       * @param  {Function} callback
       */
      connectMapEvents: function(map, callback) {
        // catches any map movements (drag, zoom, resize, ...)
        map.on('moveend', function() {
          var bounds = map.getBounds();
          callback({
            'nE': [bounds._northEast.lat, bounds._northEast.lng],
            'sW': [bounds._southWest.lat, bounds._southWest.lng]
          });
        });
      },
    };
  }]);
