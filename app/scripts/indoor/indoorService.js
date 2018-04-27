'use strict';
/* jshint -W083 */
angular.module('CooperativeIndoorMap')
  .service('IndoorHandler', ['Socket', 'ApiService', 'DrawEditHandler',
    function (Socket, ApiService, DrawEditHandler) {
      let map, mapScope;
      let indoors = {};
      let indoorId;
      let indoorLevel = null;

      /**
       * 获取室内地图区隔信息
       * @param mapId 室内地图id
       * @param floorId 楼层的id
       */
      function loadAreas(mapId, floorId) {
        ApiService.getAreas(floorId)
          .success(areas =>{
            indoors[mapId].addAreas(floorId, areas);
          });
      }
      /**
       * 加载特定的室内地图
       * @param mapId 室内地图id
       */
      function loadIndoorMap(mapId) {
        ApiService.getFloors(mapId)
          .success(floors =>{
            let indoor = indoors[mapId];
            indoor.addFloors(floors);
            for(let key in floors) {
              let floorId = floors[key].id;
              loadAreas(mapId ,floorId);
            }
            indoor.addTo(map);
          });
      }

      /**
       * 获取当前视图下室内地图列表
       */
      function getBuildings() {
        var bounds = map.getBounds();
        ApiService.getBuildings(L.rectangle(bounds).toGeoJSON())
          .success(blds => {
            console.log('获取地图列表成功，列表长度：' + blds.length);
            if(blds.length === 0 && indoorId) {
              // 当前区域没有室内地图
              indoors[indoorId].remove();
              indoorId = null;
            }
            for(let key in blds) {
              let building = blds[key];
              
              if (!indoorId) {
                indoorId = building.id;
              }

              if (!indoors[building.id]) {
                indoors[building.id] = L.indoor(building,{});
                loadIndoorMap(building.id);
                // 楼层信息加载之后就把室内地图添加到map
                indoors[building.id].on('indoor:loaded', function (evt) {
                  if(evt.id === indoorId){
                    indoors[indoorId].addTo(map);
                  }
                });
                // 室内地图切换楼层的时候，在AngularJS应用内部广播
                indoors[building.id].on('indoor:level', function (evt) {
                  indoorLevel = evt.level;
                  mapScope.$root.$broadcast('indoor:level', {level: evt.level, id: building.id});
                });
              } else if(building.id === indoorId){
                indoors[indoorId].addTo(map);
              }
            }
          })
          .error((data, status) => {
            console.log('获取地图列表失败，错误代码' + status);
          });
      }

      return {
        /**
         * 初始化室内地图服务，设置map对象，scope对象，监听moveend事件，获取室内地图等
         * @param  {Object} m     map对象
         * @param  {Object} scope Angular scope对象
         */
        initIndoorHandler: function(m, scope) {
          map = m;
          mapScope = scope;
          map.on('moveend', getBuildings);
          getBuildings();
          map._indoor = indoors;
        },

        /**
         * 打开室内地图的编辑功能
         */
        enableIndoorEdit: function () {
          let indoor = indoors[indoorId];
          if(indoor) {
            let level = indoor._level;
            DrawEditHandler.enableFeatureDrawEidt(indoor._areas[level]);
            DrawEditHandler.enableFeatureDrawEidt(indoor._lines[level]);
            DrawEditHandler.enableFeatureDrawEidt(indoor._pois[level]);
          }
        },

        /**
         * 关闭室内地图的编辑功能
         */
        disableIndoorEdit: function () {
          let indoor = indoors[indoorId];
          if(indoor) {
            let level = indoor._level;
            DrawEditHandler.disableFeatureDrawEidt(indoor._areas[level]);
            DrawEditHandler.disableFeatureDrawEidt(indoor._lines[level]);
            DrawEditHandler.disableFeatureDrawEidt(indoor._pois[level]);
          }
        },
  
        /**
         * 获取当前当前的建筑物ID和显示楼层
         * @returns {{building: *, level: *}}
         */
        getCurrentBuildingAndLevel: function() {
          return {
            building: indoorId,
            level: indoorLevel
          };
        },
        
        /**
         * 获取当前楼层的所有元素
         * @returns {{building: *, level: *}}
         */
        getCurrentFloorFeatures: function() {
          let indoor = indoors[indoorId];
          let features = [];
          if(indoor) {
            let level = indoor._level;
            // indoor._areas[level].eachLayer(function (layer) {
            //   features.push(layer.feature);
            // });
            //
            // indoor._lines[level].eachLayer(function (layer) {
            //   features.push(layer.feature);
            // });
            //
            // indoor._pois[level].eachLayer(function (layer) {
            //   if(layer.id && layer.properties){
            //     features.push(layer.feature);
            //   }
            // });
            features = features.concat(indoor._areas[level].getLayers());
            features = features.concat(indoor._lines[level].getLayers());
            features = features.concat(indoor._pois[level].getLayers());
            for (let i = 0; i < features.length; i++) {
              features[i] = features[i].feature;
            }
          }
          return features;
        },

        /**
         * 通过ID获取当前室内地图元素
         * @param id 元素id
         * @returns {*} 元素信息
         */
        getFeatureById: function (id) {
          let indoor = indoors[indoorId];
          return indoor._data[id];
        }
      };
    }]);