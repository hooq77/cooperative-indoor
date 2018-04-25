'use strict';

angular.module('CooperativeIndoorMap')
  .service('ApiService', ['$http', '$q',
    function($http, $q) {

      return {
        /**
         * 获取当前区域内的室内地图子图（建筑物）列表
         * @param bounds 边界
         * @returns {HttpPromise} promise 类型
         */
        getBuildings: function(bounds){
          return $http.post('/api/buildings', bounds);
        },
        /**
         * 获取特定建筑物的楼层列表
         * @param mapId 建筑物ID
         * @returns {HttpPromise} promise类型
         */
        getFloors: function(mapId){
          return $http.get('/api/floors/' + mapId);
        },

        /**
         * 获取特定楼层的区隔列表
         * @param floorId 楼层ID
         * @returns {HttpPromise} promise类型
         */
        getAreas: function(floorId){
          return $http.get('/api/areas/' + floorId);
        },
        /**
         * 获取特定楼层的POI列表
         * @param floorId 楼层ID
         * @returns {HttpPromise} promise类型
         */
        getPois: function(floorId) {
          return $http.get('/api/pois/' + floorId);
        },

        /**
         * 获取特定楼层的连接线信息
         * @param floorId 楼层ID
         * @returns {HttpPromise} promise类型
         */
        getLines: function(floorId) {
          return $http.get('/api/lines/' + floorId);
        },

        /**
         * 获取特定区隔的历史信息
         * @param id 区隔ID
         * @returns {HttpPromise} promise类型
         */
        getAreaHistory: function(id) {
          return $http.get('/api/history/area/' + id);
        },

        // 以下为原始内容
        /**
         * Returns a promise which will be resolved current features of the map
         * @param  {String} mapId the map id
         * @return {Function} Promise of the http request
         */
        getFeatures: function(mapId) {
          return $http.get('/api/features/' + mapId);
        },

        /**
         * Returns an oboe promise which will be resolved current features of the map.
         * Can be used to handle intermediary results of the http request.
         * Especially useful when loading larger amount of features as one doesn't have to wait
         * until the request is finished.
         * @param  {String} mapId the map id
         * @return {Function} Promise of the http request
         */
        getFeaturesOboe: function(mapId) {
          return oboe('/api/features/' + mapId);
        },


        /**
         * Returns a promise which will be resolved with the history of a specific feature
         * @param  {String} mapId the map id
         * @param  {String} fid   the feature id
         * @return {Function} Promise of the http request
         */
        getFeatureHistory: function(mapId, fid) {
          return $http.get('/api/documentRevisions/' + mapId + '/' + fid);
        },

        /**
         * Request the current map history. Returns a promise with the http request.
         * @param  {String} mapId the map id
         * @return {Function}       Promise of the http request
         */
        getMapHistory: function(mapId) {
          return $http.get('api/history/' + mapId);
        },

        /**
         * Loads the presets for the feature categories and fields from the server. Returns a promise.
         * @return {Function} Promise of the http request
         */
        getPresetData: function() {
          var categoriesPromise = $http.get('presets/categories'),
            fieldsPromise = $http.get('presets/fields'),
            presetsPromise = $http.get('presets/presets');

          return $q.all([categoriesPromise, fieldsPromise, presetsPromise]).then(function(resultArray) {
            var categories, fields, presets;
            if (resultArray) {
              if (resultArray[0] && resultArray[0].data) {
                categories = resultArray[0].data;
              }
              if (resultArray[1] && resultArray[1].data) {
                fields = resultArray[1].data;
              }
              if (resultArray[2] && resultArray[2].data) {
                presets = resultArray[2].data;
              }
            }
            return [categories, fields, presets];
          });


        }

      };
    }
  ]);
