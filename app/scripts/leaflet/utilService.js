'use strict';

/**
 * @memberof CooperativeIndoorMap
 * @fileOverview Util factory.
 * @exports CooperativeIndoorMap.MapHandler
 * @author Huqiang
 */
angular.module('CooperativeIndoorMap').
  factory('Utils', function() {
    return {

      c: 1,
      /**
       * 基于时间产生id
       * @return {String} new id
       */
      createId: function() {
        var d = new Date();
        var m = d.getMilliseconds() + '';
        var u = ++d + m + (++this.c === 10000 ? (this.c = 1) : this.c);

        return u;
      },

      /**
       * 用户自定义Stamp函数，用于产生唯一的layer id
       */
      patchLStamp: function() {
        L.userStamp = function(obj) {
          // jshint camelcase: false
          console.log("user define stamp function has run")
          obj._leaflet_id = obj._leaflet_id || this.createId();
          return obj._leaflet_id;
        }.bind(this);
      }

    };
  });
