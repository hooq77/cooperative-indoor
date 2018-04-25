'use strict';

angular.module('CooperativeIndoorMap')
  .directive('history', ['MapHandler', 'ApiService', 'IndoorHandler',
    function(MapHandler, ApiService, IndoorHandler) {
    
      
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/history',
        replace: true,
        scope: {},
        link: function(scope) { //, iElm, iAttrs, controller) {

          scope.isShowFloorHistory = true;
          scope.isShowFeatureHistory = false;
          /**
           * 组合相似的编辑行为，避免历史列表过长
           * @param  {Array} values the history actions
           * @return {Array}        the aggregated history actions
           */

          function reduceActions(values) {
            var result = [];
            values.forEach(function(elem) {
              if (result.length === 0) {
                result.push(elem);
              } else {
                if (elem.owner === result[result.length - 1].owner) {
                  if (result[result.length - 1].actions) {
                    result[result.length - 1].actions.push(elem);
                    result[result.length - 1].number++;
                    result[result.length - 1].time = elem.time;
                    result[result.length - 1].to = elem.version;
                  } else {
                    result[result.length - 1] = {
                      owner: elem.owner,
                      actions: [result[result.length - 1], elem],
                      number: 2,
                      time: elem.time,
                      from: elem.version
                    };
                  }
                } else {
                  result.push(elem);
                }
              }
            });
            return result;
          }

          /**
           * 加载当前楼层中每个feature的最新版本
           */
          function loadFloorHistory() {
            IndoorHandler.getCurrentBuildingAndLevel();
            // let indoor = IndoorHandler.getCurrentBuildingAndLevel();
            scope.isShowFloorHistory = true;
            scope.isShowFeatureHistory = false;
            scope.history = IndoorHandler.getCurrentFloorFeatures();
          }

          /**
           * 获取特定区隔的历史信息
           * @param id 区隔id
           */
          function getAreaHistory(id) {
            scope.currentfId = id;
            scope.loading = true;
            ApiService.getAreaHistory(id)
              .then(function(result) {
                scope.loading = false;
                if (result.data) {
                  scope.featureHistory = reduceActions(result.data);
                }
              });
          }

          /**
           * 获取楼层的历史信息
           * @param id 楼层id
           */
          function getFloorHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {

                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });

            scope.$root.$broadcast('showFeatureHistory', id);
          }

          /**
           * 获取建筑物的历史信息
           * @param id 建筑物id
           */
          function getBuildingHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {

                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });

            scope.$root.$broadcast('showFeatureHistory', id);
          }

          /**
           * 获取连接线的历史信息
           * @param id 连接线id
           */
          function getLineHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {

                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });

            scope.$root.$broadcast('showFeatureHistory', id);
          }

          /**
           * 获取poi的历史信息
           * @param id poi的id
           */
          function getPoiHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {

                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });

            scope.$root.$broadcast('showFeatureHistory', id);
          }

          /**
           * 监听history侧边栏打开事件，侧边栏打开的时候加载历史版本信息
           */
          scope.$on('sidebar:on', function(e, view) {
            if (view === 'history') {
              loadFloorHistory();
            }
          });
  
          /**
           * 浏览单个feature的历史版本信息
           * @param {String} id feature的id
           */
          scope.showFeatureHistory = function(id) {
            scope.isShowFeatureHistory = true;
            scope.isShowFloorHistory = false;
            let feature = IndoorHandler.getFeatureById(id);
            switch (feature.model) {
              case 'area':
                getAreaHistory(id);
                break;
              case 'line':
                getLineHistory(id);
                break;
              case 'poi':
                getPoiHistory(id);
                break;
              case 'floor':
                getFloorHistory(id);
                break;
              case 'building':
                getBuildingHistory(id);
                break;
            }
            // scope.$root.$broadcast('showFeatureHistory', id);
          };

          /**
           * 监听历史信息关闭事件，在当前地图和历史中切换
           */
          scope.$on('closeFeatureHistory', function() {
            scope.isShowFeatureHistory = false;
            scope.isShowFloorHistory = true;
            // loadFloorHistory();
          });
          /**
           * 历史信息关闭处理
           */
          scope.closeFeatureHistory = function(){
            scope.isShowFeatureHistory = false;
            scope.isShowFloorHistory = true;
            // loadFloorHistory();
          };
           /**
           * 替换渐进式的编辑行为为一个行为
           */
          scope.showHistoryDetails = function() {
            var index = scope.history.indexOf();
            var tmp = scope.history[index];
            delete scope.history[index];
            scope.history = scope.history.concat(tmp.actions);
          };
          
          /**
           * 缩放到特定的元素
           * @param  {String} fid feature id (= leaflet layer id)
           */
          scope.panToFeature = function(fid) {
            MapHandler.panToFeature(fid);
          };
        }
      };
    }
  ]);
