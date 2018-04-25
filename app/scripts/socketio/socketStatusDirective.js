'use strict';
angular.module('SocketModule').directive('socketStatus', [
  function() {

    return {
      restrict: 'E',
      template: '<div ng-show="showStatus" class="socketStatus" ng-class="statusClass"></div>',
      replace: true,
      scope: {},
      link: function(scope, element) {

        scope.showStatus = false;

        /**
         * 显示WebSocket已连接，3s后消失
         */
        scope.$on('socketio-connected', function() {
          element[0].innerHTML = '协同服务器已连接...';
          scope.showStatus = true;
          scope.statusClass = 'greenBackground';
          scope.$apply();
          setTimeout(function() {
            scope.showStatus = false;
            scope.$apply();
          }, 3000);
        });

        /**
         * 显示丢失连接，自动重连
         */
        scope.$on('socketio-disconnected', function() {
          element[0].innerHTML = '连接丢失，重新连接中...';
          scope.showStatus = true;
          scope.statusClass = '';
          scope.$apply();
        });

      }
    };

  }
]);
