'use strict';

angular.module('CooperativeIndoorMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams',
    function($scope, $rootScope) {
      $rootScope.userName = 'huqiang';
      $scope.$root.mapId = $scope.mapId = 'hubei';

      // TesterService.init($scope, undefined);
    }
  ]);
