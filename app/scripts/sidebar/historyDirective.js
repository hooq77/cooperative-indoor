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
           * 监听history侧边栏打开事件，侧边栏打开的时候加载历史版本信息
           */
          scope.$on('sidebar:on', function(e, view) {
            if (view === 'history') {
              loadFloorHistory();
            }
          });
          
          /**
           * 加载当前楼层中每个feature的最新版本
           */
          function loadFloorHistory() {
            let indoor = IndoorHandler.getCurrentBuildingAndLevel();
            scope.isShowFloorHistory = true;
            scope.isShowFeatureHistory = false;
            scope.history = IndoorHandler.getCurrentFloorFeatures();
          }
  
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
           * Event listener for the feature history close event.
           * Toggle the view for the map history and reload the history.
           */
          scope.$on('closeFeatureHistory', function() {
            scope.isShowFeatureHistory = false;
            scope.isShowFloorHistory = true;
            // loadFloorHistory();
          });
          scope.closeFeatureHistory = function(){
            scope.isShowFeatureHistory = false;
            scope.isShowFloorHistory = true;
            // loadFloorHistory();
          };
           /**
           * Replace aggregated object in the history with the single actions
           * @param  {Object} action the aggregated object
           */
          scope.showHistoryDetails = function(fid) {
            var index = scope.history.indexOf(action);
            var tmp = scope.history[index];
            delete scope.history[index];
            scope.history = scope.history.concat(tmp.actions);
          };
          
          /**
           * Pan to the a selected feature
           * @param  {String} fid feature id (= leaflet layer id)
           */
          scope.panToFeature = function(fid) {
            MapHandler.panToFeature(fid);
          };
  
  
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
  
          function getFloorHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {
                      action.dateString = createDateString(action.date);
                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });
    
            scope.$root.$broadcast('showFeatureHistory', id);
          }
          function getBuildingHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {
                      action.dateString = createDateString(action.date);
                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });
    
            scope.$root.$broadcast('showFeatureHistory', id);
          }
  
          function getLineHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {
                      action.dateString = createDateString(action.date);
                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });
    
            scope.$root.$broadcast('showFeatureHistory', id);
          }
  
          function getPoiHistory(id) {
            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {
                      action.dateString = createDateString(action.date);
                    }
                  });
                  scope.history = reduceActions(result.data);
                }
              });
    
            scope.$root.$broadcast('showFeatureHistory', id);
          }
  
  
          /**
           * Combine similar actions to avoid a map history pollution if one person makes many changes.
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
        }
      };
    }
  ]);
