'use strict';
angular.module('CooperativeIndoorMap')
  .directive('tools', ['DataImport',
    function(DataImport) {
      return {
        templateUrl: 'partials/tools',
        restrict: 'E',
        scope: {},
        link: function postLink($scope) {
          $scope.dataInputField = '';
          $scope.jsonError = '';

          /**
           * 导入GeoJSON并增加时间戳
           * and adds the data to the map
           */
          $scope.importDataString = function() {
            var data = $scope.dataInputField;
            try {
              DataImport.importGeoJson(JSON.parse(data));
              $scope.jsonError = '';
              $scope.dataInputField = '';
            } catch (err) {
              $scope.jsonError = 'invalid geojson: ' + err;
            }
          };
          /**
           * 导出地图
           */
          $scope.exportMap = function() {
            $scope.dataInputField = JSON.stringify(DataImport.exportGeoJson(), null, 2);
          };

        }
      };
    }
  ]);
