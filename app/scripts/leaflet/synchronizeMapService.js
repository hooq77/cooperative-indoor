'use strict';

angular.module('CooperativeIndoorMap')
  .service('SynchronizeMap', ['MapMovementEvents', 'MapDrawEvents', 'Socket', 'MapHandler', 'Users',
    function(MapMovementEvents, MapDrawEvents, Socket, MapHandler, Users) {
      var mapScope;


      /**
       * 地图在移动之后，通过WebSocket发送移动之后的地图界面信息
       * @param  {String} mapId
       * @param  {Object} event = {sE, nW}
       */

      function sendMapMovements(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapMovement', message, function(res) {
          console.log(res);
        });
      }


      /**
       * 检查用于是否被Watching
       * @param  {String}  userId
       * @return {Boolean}
       */

      function isWachtingUser(userId) {
        var res = mapScope.isWatchingAll || mapScope.watchUsers[userId] || false;
        return res;
      }


      /**
       * 处理地图的移动
       * @param  {Object} movement = {event: {nE, sW, userId}}
       */

      function handleMapMovements(movement) {
        if (movement.event && movement.event.nE && movement.event.sW && movement.event.userId) {
          var newBounds = MapHandler.getBounds(movement.event.nE, movement.event.sW);
          mapScope.userBounds[movement.event.userId] = newBounds;
          if (isWachtingUser(movement.event.userId)) {
            MapHandler.fitBounds(newBounds);
          }
        }
      }


      /**
       * 接受服务器广播的地图移动
       * @param  {String} mapId
       */

      function receiveMapMovements(mapId) {
        Socket.on(mapId + '-mapMovement', function(res) {
          handleMapMovements(res);
        });
      }


      /**
       * 发送地图绘制信息
       * @param  {String} mapId
       * @param  {Object} event = {action //edited/deleted/created, feature //Leaflet feature, fid //feature id, user}
       */

      function sendMapDraws(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapDraw', message, function(res) {
          console.log(res);
        });

      }


      /**
       * 检查toolbox窗口是否打开
       * @param  {Object} map
       * @param  {Object} event = mapDraw event
       */

      function refreshSidebar() {
        // console.log(mapScope.selectedFeature)
        // console.log(event)
        // if (mapScope.username === event.user
        //   && mapScope.selectedFeature
        //   && mapScope.selectedFeature.fid === event.fid) {
        //   updatePropertiesView(map, event);
        // }
      }

      /**
       * 监听服务器的地图绘制广播，按照动作的类型进行不同的操作
       * @param  {String} mapId
       * @param  {Object} map
       * @param  {Object} drawnItems = layer group on which the features are drawn
       */

      function receiveMapDraws(mapId, map, drawnItems) {

        Socket.on(mapId + '-mapDraw', function(res) {
          if (res && res.event) {
            refreshSidebar(map, res.event);

            var event = res.event;

            if (event.action === 'created' || event.action === 'created feature' || event.action === 'imported feature') {

              MapHandler.addGeoJSONFeature(map, event, drawnItems, false, Users.getUserColorByName(res.event.user));

            } else if (event.action === 'edited' || event.action === 'edited geometry' || event.action === 'edited properties' || event.action === 'reverted') {

              MapHandler.addGeoJSONFeature(map, event, drawnItems, false, Users.getUserColorByName(res.event.user));

            } else if (event.action === 'deleted' || event.action === 'deleted feature') {

              MapHandler.removeLayer(map, event, drawnItems);

            }

          }
        });
      }

      /**
       * 监听用户的信息的进入和退出情况
       * @param  {String} mapId
       */

      function receiveUsers(mapId) {
        Socket.on(mapId + '-users', function(res) {
          mapScope.users = Users.receiveUsers(res.users);
        });
      }

      /**
       * 发送用户名和用户地图ID
       * @param  {String} mapId
       * @param  {String} userName
       */

      function login(mapId, userName) {
        Socket.emit('login', {
          'mapId': mapId,
          'user': userName
        });
      }

      /**
       * 发送地图编辑信息
       * @param mapId 地图id
       * @param active 动作
       * @param fid 元素id
       */
      function sendEditFeatureEvent(mapId, active, fid){
        var message = {
          'mapId': mapId,
          'user' : mapScope.userName,
          'fid': fid,
          'active': active
        };
        Socket.emit('editFeature', message, function(res) {
          console.log(res);
        });
      }

      /**
       * 元素编辑是时间
       * @param mapId 地图id
       */
      function editFeatureEvents(mapId){
        mapScope.$root.$on('editHandler', function(event, active, fid){
          sendEditFeatureEvent(mapId, active, fid);
        });

        Socket.on(mapId + '-editFeature', function(data){
          MapHandler.setEditFeatureEvent(data);
        });
      }

      return {

        /**
         * 初始化地图同步服务
         * @param  {Object} map
         * @param  {Object} scope Angular scope
         * @param  {Object} drawnItems layer group for drawn features
         */
        init: function(map, scope, drawnItems) {
          mapScope = scope;
          login(mapScope.mapId, mapScope.userName);

          MapMovementEvents.connectMapEvents(map, function(event) {
            sendMapMovements(scope.mapId, event);
          });

          receiveMapMovements(scope.mapId);
          receiveUsers(scope.mapId);

          MapDrawEvents.connectMapEvents(map, scope, function(event) {
            sendMapDraws(scope.mapId, event);
          });

          receiveMapDraws(scope.mapId, map, drawnItems);

          editFeatureEvents(scope.mapId);
        }
      };
    }
  ]);
