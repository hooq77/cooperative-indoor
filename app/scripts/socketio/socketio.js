'use strict';
/**
 * @memberof SocketModule
 * @fileOverview Handles the WebSocket connection. Provides the method to connect to a stream as well to emit messages.
 * 
 * @requires $rootScope
 * 
 * @exports SocketModule.Socket
 * @author Dennis Wilhelm
 */
angular.module('SocketModule')
  .factory('Socket', ['$rootScope',
    function($rootScope) {
      var socket = io.connect();

      /**
       * Broadcast an event if the websocket connection is established
       */
      socket.on('connect', function() {
        $rootScope.$broadcast('socketio-connected');
      });

      /**
       * Broadcasts an event if the websocket connection is lost
       */
      socket.on('disconnect', function() {
        $rootScope.$broadcast('socketio-disconnected');
      });

      return {
        /**
         * Connect to a WebSocket stream
         * @param {String} eventName name of the stream
         * @param {Function} callback
         */
        on: function(eventName, callback) {
          socket.on(eventName, function() {
            console.log("on " + eventName);
            console.log(arguments[0]);
            var args = arguments;
            $rootScope.$apply(function() {
              callback.apply(socket, args);
            });
          });
        },

        /**
         * Emits/Sends a message to a WebSocket stream
         * @param {String} eventName name of the stream
         * @param {Object} data  the data to be send
         * @param {Function} callback
         */
        emit: function(eventName, data, callback) {
          console.log("emit " + eventName);
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
