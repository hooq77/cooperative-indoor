'use strict';

angular.module('CooperativeIndoorMap')
  .directive('sidebar', ['$compile', 'MapHandler','Users', 'IndoorHandler',
    function($compile, MapHandler, Users, IndoorHandler) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/sidebar',
        replace: true,
        link: function postLink($scope) {
          var map = window._map;
          var sidebar = window._sidebar = L.control.sidebar('sidebar').addTo(map);
          /**
           * 监听用户列表与监听用户按键的响应函数
           */
          $scope.watchUsers = {};
          $scope.watchUser = function (userId, event) {
            if ($scope.watchUsers[userId]) {
              delete $scope.watchUsers[userId];
              event.currentTarget.innerHTML = 'Watch';
            } else {
              $scope.watchUsers[userId] = true;
              event.currentTarget.innerHTML = 'Unwatch';
            }
          };

          /**
           * 用户边界列表与用户边界显示按键的响应函数
           */
          $scope.userBounds = {};
          $scope.getUserBounds = function (userId) {
            var bounds = $scope.userBounds[userId];
            if (bounds) {
              MapHandler.paintUserBounds(bounds, Users.getUserById(userId).color || 'undefined');
            } else {
              window.alert('The user hasn\'t moved since you logged in');
            }
          };

          $scope.currentView = '';

          /**
           * 获取当前的视图
           */
          function getCurrentView() {
            sidebar.on('content', function (event) {
              if(event && event.id){
                $scope.currentView = event.id;
                if($scope.currentView === 'propertis') {
                  IndoorHandler.enableIndoorEdit();
                } else {
                  IndoorHandler.disableIndoorEdit();
                }
                $scope.$root.$broadcast('sidebar:on', event.id);
              }
            });
            sidebar.on('closing', function () {
              $scope.$root.$broadcast('sidebar:off');
              if($scope.currentView === 'propertis') {
                IndoorHandler.disableIndoorEdit();
              }
              $scope.currentView = undefined;
            });
          }

          getCurrentView();
          /**
           * 获取所有用户的边界，并显示这些边界的总边界
           */
          $scope.getAllUserBounds = function () {
            var users = {};
            for (var key in $scope.userBounds) {
              users[key] = {};
              users[key].bounds = $scope.userBounds[key];
              users[key].color = Users.getUserById(key).color;
            }
            MapHandler.paintAllUserBounds(users);
          };

          /**
           * 监听所有用户
           */
          $scope.isWatchingAll = false;
          $scope.watchAll = function () {
            $scope.isWatchingAll = !$scope.isWatchingAll;
          };

          /**
           * 缩放并着重显示特定的元素
           * @param {String} id feature id
           */
          $scope.panToFeature = function(id) {
            MapHandler.panToFeature(id);
            MapHandler.highlightFeatureId(id);
          };

          /**
           * 新消息到来，如果用户会话窗口没有打开，高亮打开按钮
           */
          function highlightOnChatMessage() {
            $scope.$on('chatmessage', function () {
              if(!$('#message').hasClass('active')) {
                $('#message').addClass('orangeBackground');
              }
            });
            sidebar.on('content', function (evt) {
              if (evt.id === 'user') {
                $('#message').removeClass('orangeBackground');
              }
            });
          }

          highlightOnChatMessage();

        }
      };
  }]);