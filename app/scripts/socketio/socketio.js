'use strict';
angular.module('SocketModule')
  .factory('Socket', ['$rootScope',
    function($rootScope) {
      var socket = io.connect();

      /**
       * 广播WebSocket已连接事件
       */
      socket.on('connect', function() {
        $rootScope.$broadcast('socketio-connected');
      });

      /**
       * 广播WebSocket断开连接事件
       */
      socket.on('disconnect', function() {
        $rootScope.$broadcast('socketio-disconnected');
      });

      return {
        /**
         * 监听WebSocket事件，接受服务器推送信息
         * @param {String} eventName name of the stream
         * @param {Function} callback
         */
        on: function(eventName, callback) {
          socket.on(eventName, function() {
            console.log('on ' + eventName);
            console.log(arguments[0]);
            var args = arguments;
            $rootScope.$apply(function() {
              callback.apply(socket, args);
            });
          });
        },

        /**
         * 广播WebSocket事件，向服务器发送数据
         * @param {String} eventName name of the stream
         * @param {Object} data  the data to be send
         * @param {Function} callback
         */
        emit: function(eventName, data, callback) {
          console.log('emit ' + eventName);
          console.log(data);
          socket.emit(eventName, data, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        }
      };

    }
  ]);
