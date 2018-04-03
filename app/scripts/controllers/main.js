'use strict';

angular.module('CooperativeIndoorMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams',
    function($scope, $rootScope, $routeParams) {

      function loadName() {
        var oldName = localStorage.getItem('cm-user');
        if (oldName && oldName !== 'undefined') {
          $rootScope.userName = oldName;
        }
        $scope.userName = $rootScope.userName = $rootScope.userName || 'unnamed';
      }

      loadName();
      $scope.$root.mapId = $scope.mapId = $routeParams.mapid.toLowerCase();

      // TesterService.init($scope, undefined);

    }
  ]);
