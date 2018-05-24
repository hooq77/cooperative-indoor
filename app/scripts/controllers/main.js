'use strict';

angular.module('CooperativeIndoorMap')
  .controller('MainCtrl', ['$scope', '$routeParams',
    function($scope) {
      // $rootScope.userName = 'huqiang';
      $scope.$root.mapId = $scope.mapId = 'hubei';

      // TesterService.init($scope, undefined);
    }
  ]);
