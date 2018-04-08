angular.module('CooperativeIndoorMap')
  .directive('sidebar', ['$compile', 'MapHandler','Users', 'IndoorHandler',
    function($compile, MapHandler, Users, IndoorHandler) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/sidebar',
        replace: true,
        link: function postLink($scope, elements) {
          var map = window._map;
          var sidebar = window._sidebar = L.control.sidebar('sidebar').addTo(map);
          /**
           * Store all users which are supposed to be watched. Is used by the mapMovement service to check if the map should change when other users move the map
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
           * Paint a rectangle on the map to show the viewport of other users
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

          $scope.currentView = "";

          function getCurrentView() {
            sidebar.on('content', function (event) {
              if(event && event.id){
                $scope.currentView = event.id;
                if($scope.currentView === "propertis") {
                  IndoorHandler.enableIndoorEdit();
                } else {
                  IndoorHandler.disableIndoorEdit();
                }
                $scope.$root.$broadcast('sidebar:on', event.id);
              }
            });
            sidebar.on('closing', function () {
              $scope.$root.$broadcast('sidebar:off');
              if($scope.currentView === "propertis") {
                IndoorHandler.disableIndoorEdit();
              }
              $scope.currentView = undefined;
            });
          }

          getCurrentView();

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
           * Watch all users
           */
          $scope.isWatchingAll = false;
          $scope.watchAll = function () {
            $scope.isWatchingAll = !$scope.isWatchingAll;
          };

          /**
           * Pans to a selcted featured
           * @param {String} id feature id
           */
          $scope.panToFeature = function(id) {
            MapHandler.panToFeature(id);
            MapHandler.highlightFeatureId(id);
          };

          /**
           * Highlights the user Button if a chat message comes in and the user tab is not opened
           */
          function highlightOnChatMessage() {
            $scope.$on('chatmessage', function () {
              if(!$("#message").hasClass("active"))
                $("#message").addClass("orangeBackground");
            });
            sidebar.on('content', function (evt) {
              if (evt.id === 'user') {
                $("#message").removeClass("orangeBackground");
              }
            });
          }

          highlightOnChatMessage();

        }
      };
  }]);