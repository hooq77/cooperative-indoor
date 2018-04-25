'use strict';

angular.module('CooperativeIndoorMap')
  .directive('chatMessage', ['MapHandler', '$compile',
    function(MapHandler, $compile) {
      return {
        template: '<div></div>',
        restrict: 'E',
        scope: {
          message: '='
        },
        link: function postLink(scope, element) {
          var message = '';

          /**
           * 按照元素类别确定元素的class信息
           * @param fid
           * @returns {*}
           */
          function getClassForFeature(fid) {
            var type = MapHandler.getLayerTypeFid(fid);
            if (type === 'point') {
              return 'markerFeature';
            } else if (type === 'line') {
              return 'lineFeature';
            } else if (type === 'area') {
              return 'polygonFeature';
            } else {
              return false;
            }
          }

          /**
           * 在聊天界面中生成一个按钮，点击即可缩放到选取的元素上
           * @param fidString
           * @returns {*}
           */
          function createButton(fidString) {
            var fid = fidString.substring(1);
            var className = getClassForFeature(fid);
            if (className) {
              return message.replace(fidString, '<div class="featureInChat '+className+'" ng-click="panToFeature(\'' + fid + '\')"></div> ');
            } else {
              return fidString;
            }
          }

          /**
           * 交换元素id
           */
          function exchangeFid() {
            var index = message.indexOf('#');
            if (index > -1) {
              var fidString = message.substring(index).split(' ')[0];
              message = createButton(fidString);
            }
            if (message.indexOf('#') > -1) {
              exchangeFid();
            }
          }
          /**
           * 缩放到特定的元素，并着重显示
           */
          scope.panToFeature = function(fid) {
            MapHandler.panToFeature(fid);
            MapHandler.highlightFeatureId(fid);
          };


          if (scope.message && scope.message.message) {
            message = scope.message.message;
          }

          message = message.replace(/<script/g,'');
          message = message.replace(/<style/g,'');

          exchangeFid(message);
          element[0].innerHTML = message;
          var e = angular.element(element[0]);
          $compile(e.contents())(scope);

        }
      };
    }
  ]);
