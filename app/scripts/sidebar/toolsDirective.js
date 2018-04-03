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
           * takes a GeoJSON string from the toolbox input field
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

          $scope.exportMap = function() {
            $scope.dataInputField = JSON.stringify(DataImport.exportGeoJson(), null, 2);
          };

        }
      };
    }
  ]);
