'use strict';

angular.module('CooperativeIndoorMap')
  .directive('chat', ['Socket', 'MapHandler', 'Tooltip',
    function(Socket, MapHandler, Tooltip) {

      return {
        templateUrl: 'partials/chat',
        restrict: 'E',
        scope: {},
        link: function postLink($scope, element) {
          $scope.messages = [];
          $scope.chatMessage = '';
          var mapId = $scope.$parent.mapId;

          /**
           * 通过WebSocket发送会话消息
           * @param {String} message the chat message
           */

          function sendMessage(message) {
            var userName = $scope.$parent.userName;
            message = {
              'message': message,
              'user': userName,
              'mapId': mapId
            };
            Socket.emit('chat', message, function(res) {
              console.log(res);
            });
          }

          /**
           * 滚动到会话消息的底部
           */
          function scrollDown() {
            var elem = $('.chatMessages')[0];
            if (elem) {
              elem.scrollTop = elem.scrollHeight;
            }
          }

          /**
           * 接受会话消息，广播消息通知，显示消息并滚动到最底部
           */
          function receiveMessage() {
            Socket.on(mapId + '-chat', function(res) {
              $scope.$root.$broadcast('chatmessage');
              $scope.messages.push(res);
              setTimeout(scrollDown, 100);
            });
          }

          receiveMessage();

          /**
           * 监听enter按键，发送消息
           * @param {Number} key key code
           */
          $scope.sendMessage = function(key) {
            var send = function() {
              var message = $scope.chatMessage;
              $scope.chatMessage = '';
              sendMessage(message);
            };

            if ($scope.chatMessage) {
              if (key && key.keyCode === 13) {
                send();
              } else if (!key) {
                send();
              }
            }
          };

          $scope.isReferTo = false;

          /**
           * 取消选取特定的元素
           */
          $scope.cancelReferToFeature = function() {
            $scope.isReferTo = false;
            Tooltip.hideTooltip();
          };

          /**
           * 选取某个元素
           */
          $scope.referToFeature = function() {
            $scope.isReferTo = true;
            Tooltip.showTooltip('选取元素.');
            MapHandler.getLayerIdOnce(function(fid) {
              if (fid !== '') {
                $scope.chatMessage += ' #' + fid + ' ';
              }
              setTimeout(function(){
                element.find('input')[0].scrollLeft = element.find('input')[0].scrollWidth;
                element.find('input')[0].focus();
              },50);
              Tooltip.hideTooltip();
              $scope.isReferTo = false;
              // $scope.safeApply();
            });
          };
        }
      };
    }
  ]);
