'use strict';
angular.module('CooperativeIndoorMap')
  .service('Users', [
    function() {

      var users = {};

      return {

        /**
         * 存储协同编辑的用户信息，并为其分配一个特定的颜色
         * @param  {Object} newUsers {socketId: name}
         * @return {Object}          user object with colors {socketId:{name, color}}
         */
        receiveUsers: function(newUsers) {
          if (newUsers) {
            var tmpUsers = {};
            for (var key in newUsers) {

              if (users[key]) {
                tmpUsers[key] = users[key];
              } else {
                tmpUsers[key] = {
                  name: newUsers[key],
                  color: randomColor()
                };
              }
            }
            users = tmpUsers;
          }
          return users;
        },

        /**
         * 根据SocketID返回特定的用户
         * @param  {String} key socket id
         * @return {Object}     user object {color, name}
         */
        getUserById: function(key) {
          return users[key];
        },

        /**
         * 根据用户名返回为用户所分配的颜色
         * @param  {String} name user name
         * @return {String}      hex color value
         */
        getUserColorByName: function(name) {
          for (var key in users) {
            if (users[key].name === name) {
              return users[key].color;
            }
          }
        }
      };
    }
  ]);
