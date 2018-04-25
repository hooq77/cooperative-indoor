'use strict';
angular.module('CooperativeIndoorMap')
  .service('MapDrawEvents', [
    function() {

      var mapScope;

      /**
       * Creates an event object to send via Websockets
       * @param  {Object} event map draw event
       * @param  {String} type  created/deleted/edited
       * @return {Object}       {action, feature, fid, user}
       */
      function eventToMessage(event, type) {
        //jshint camelcase: false
        return {
          'action': type,
          'feature': event.layer.toGeoJSON(),
          'fid': event.layer._leaflet_id,
          'user': mapScope.userName
        };
      }

      return {

        /**
         * 连接服务器之后即开始监听元素创建时间和元素编辑事件
         * @param  {Object}   map      the map
         * @param  {Object}   scope    Angular scope
         * @param  {Function} callback
         */
        connectMapEvents: function(map, scope, callback) {
          mapScope = scope;

          map.on('draw:created', function(event) {
            // scope.selectFeature(event.layer);
            // MapHandler.addClickEvent(event.layer);
            callback(eventToMessage(event, event.action || 'created feature'));
          });

          map.on('draw:edited', function(event) {
            if (event.layers && event.layers._layers) {
              var layers = event.layers._layers;

              for (var key in layers) {
                callback(eventToMessage({
                  layer: layers[key]
                }, 'edited geometry'));
              }
            }
          });

          //Property ofa feature edited through the toolbox
          map.on('propertyEdited', function(event) {
            if (event && event.layer && event.fid) {
              callback({
                'action': 'edited properties',
                'feature': event.layer,
                'fid': event.fid,
                user: mapScope.userName
              });
            }
          });

          map.on('draw:deleted', function(event) {
            if (event.layers && event.layers._layers) {
              var layers = event.layers._layers;

              for (var key in layers) {
                callback(eventToMessage({
                  layer: layers[key]
                }, 'deleted feature'));
              }
            }
          });
        }

      };
    }
  ]);
