'use strict';

angular.module('CooperativeIndoorMap')
  .directive('featureHistory', ['MapHandler', 'ApiService', 'IndoorHandler',
    function(MapHandler, ApiService, IndoorHandler) {
      function isArray(value) {
        return value && typeof value === 'object' && value.constructor === Array;
      }

      function typeofReal(value) {
        return isArray(value) ? 'array' : typeof value;
      }

      /**
       * 比较两个元素
       * @param {Object} a Object 1
       * @param {Object} b Object 2
       * @param {String} name headline for the view
       * @param {Object} results html element for the results
       */

      function compareTree(a, b, name, results, divId, hasChanges) {
        var typeA = typeofReal(a);
        var typeB = typeofReal(b);

        var aString = (typeA === 'object' || typeA === 'array') ? '' : String(a) + ' ';
        var bString = (typeB === 'object' || typeB === 'array') ? '' : String(b) + ' ';

        var leafNode = document.createElement('span');
        leafNode.appendChild(document.createTextNode(name));
        if (a === undefined) {
          hasChanges[divId] = true;
          leafNode.setAttribute('class', 'diff-added');
          leafNode.appendChild(document.createTextNode(': ' + bString));
        } else if (b === undefined) {
          hasChanges[divId] = true;
          leafNode.setAttribute('class', 'diff-removed');
          leafNode.appendChild(document.createTextNode(': ' + aString));
        } else if (typeA !== typeB || (typeA !== 'object' && typeA !== 'array' && a !== b)) {
          hasChanges[divId] = true;
          leafNode.setAttribute('class', 'diff-changed');
          leafNode.appendChild(document.createTextNode(': ' + aString));
          leafNode.appendChild(document.createTextNode(' => ' + bString));
        } else {
          // leafNode.appendChild(document.createTextNode(': ' + aString));
        }

        if (typeA === 'object' || typeA === 'array' || typeB === 'object' || typeB === 'array') {
          let keys = [];
          for (let i in a) {
            if (a.hasOwnProperty(i)) {
              keys.push(i);
            }
          }
          for (let i in b) {
            if (b.hasOwnProperty(i)) {
              keys.push(i);
            }
          }
          keys.sort();

          let listNode = document.createElement('ul');
          listNode.appendChild(leafNode);

          for (let i = 0; i < keys.length; i++) {
            if (keys[i] === keys[i - 1]) {
              continue;
            }
            let li = document.createElement('li');
            listNode.appendChild(li);

            compareTree(a && a[keys[i]], b && b[keys[i]], keys[i], li, divId, hasChanges);
          }
          results.appendChild(listNode);
        } else {
          results.appendChild(leafNode);
          return hasChanges;
        }
      }

      /**
       * 初始化文本的比较
       * @pram {Object} objA Object 1
       * @pram {Object} objB Object 2
       * @pram {String} divId id of the html parent element
       * @pram {String} name headline for the view
       */

      function startCompare(objA, objB, divId, name, hasChanges) {
        hasChanges[divId] = false;
        var results = document.getElementById(divId);
        results.innerHTML = '';

        compareTree(objA, objB, name, results, divId, hasChanges);
      }


      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/featurehistory',
        replace: true,
        scope: {},

        link: function($scope, element) { //, iElm, iAttrs, controller) {
          //Scope variables (used in the gui)
          $scope.currentRevisionIndex = 0;
          $scope.currentRevision = undefined;
          $scope.documentRevision = [];
          $scope.numberOfRevisions = undefined;
          $scope.loading = true;

          var documentRevisions;
          var slider = element[0].getElementsByClassName('verticalSlider')[0];

          /**
           * 获取属性的不同
           * @param  {Number} index 版本序号
           */

          function getPropertyDiff(index) {
            if ($scope.numberOfRevisions > index + 1 && !$scope.currentRevision._deleted) {
              //Textual diff for properties
              startCompare(documentRevisions[index + 1].properties, documentRevisions[index].properties, 'diffProperties', 'Properties', $scope.hasChanges);
              //Textual diff for geometry
              //startCompare(documentRevisions[index + 1].geometry.coordinates, documentRevisions[index].geometry.coordinates, 'diffGeometry', 'Geometry', $scope.hasChanges);
            }
          }
          /**
           * 将历史版本显示为当前版本
           * @param {Number} index array index
           */

          function setCurrentRevision(index) {
            $scope.currentRevisionIndex = index;
            $scope.currentRevision = documentRevisions[index];
            getPropertyDiff(index);
            var fid = 'diff-' + $scope.currentRevision.id;
            $scope.sliderValue = $scope.numberOfRevisions - index;
            MapHandler.removeLayerFid(fid);
            MapHandler.updateLayerForDiff(fid, $scope.currentRevision);
            MapHandler.highlightFeatureId(fid);
          }

          /**
           * 从地图中移除原始元素
           */
          function removeOriginalFeature() {
            var fid = documentRevisions[0].id;
            MapHandler.removeLayerFid(fid);
          }

          /**
           * 初始化滑动器栏
           */
          function setUpSlider() {
            if (slider) {
              slider.max = $scope.numberOfRevisions;
              $scope.sliderValue = $scope.numberOfRevisions;
              slider.min = 1;
            }
          }

          /**
           * 利用当前版本进行赋值，移除原始元素，初始化滑动器
           */
          function initView() {
            if (documentRevisions) {
              $scope.numberOfRevisions = documentRevisions.length;
              if ($scope.numberOfRevisions > 0) {
                removeOriginalFeature();
                setCurrentRevision(0);
                setUpSlider();
              }
            }
          }

          /**
           * 初始化函数，在界面上显示特定元素的历史版本信息
           * @param id
           */
          function init(id) {
            $scope.documentRevision = [];
            $scope.currentRevisionIndex = 0;
            initView();
            let feature = IndoorHandler.getFeatureById(id);
            switch (feature.model) {
              case 'area':
                // getAreaHistory(id);
                break;
              case 'line':
                // getLineHistory(id);
                break;
              case 'poi':
                // getPoiHistory(id);
                break;
              case 'floor':
                // getFloorHistory(id);
                break;
              case 'building':
                // getBuildingHistory(id);
                break;
            }
          }

          /**
           * 移除元素对比信息
           */
          function setOriginalFeature() {
            // MapHandler.removeLayerFid('diff-' + $scope.currentRevision.id);
            // MapHandler.addFeatureAfterDiff($scope.currentRevision._id, documentRevisions[0]);
          }

          /**
           * 清空视图，移除所有的版本信息
           */

          function cleanUp() {
            setOriginalFeature();
            $scope.currentRevisionIndex = 0;
            $scope.currentRevision = undefined;
            $scope.documentRevision = [];
            $scope.numberOfRevisions = undefined;
          }

          /**
           * 滑动器滑动监听函数
           */
          $scope.sliderChange = function() {
            setCurrentRevision($scope.numberOfRevisions - $scope.sliderValue);
          };


          /**
           * 关闭版本浏览界面，回到主界面
           */
          $scope.backToHistory = function() {
            cleanUp();
            $scope.$root.$broadcast('closeFeatureHistory');

          };

          /**
           * showFeatureHistory事件响应函数
           */
          $scope.$on('showFeatureHistory', function(e, id) {
            init(id);
          });

          /**
           * toolbox事件响应函数
           */
          $scope.$on('toolbox', function() {
            if ($scope.currentRevision) {
              cleanUp();
              $scope.$root.$broadcast('closeFeatureHistory');
            }
          });

          /**
           * 设定当前版本为上一版本
           */
          $scope.previousRevision = function() {
            if ($scope.numberOfRevisions > $scope.currentRevisionIndex + 1) {
              setCurrentRevision($scope.currentRevisionIndex + 1);
            }
          };

          /**
           * 设定当前版本为下一版本
           */
          $scope.nextRevision = function() {
            if ($scope.currentRevisionIndex > 0) {
              setCurrentRevision($scope.currentRevisionIndex - 1);
            }
          };

          /**
           * 回退到特定版本
           * @param {String} id the feature id
           * @param {String} rev the revision to which the feature will be reverted
           */
          $scope.revertFeature = function(id, rev) {
            MapHandler.revertFeature($scope.$root.mapId, id, rev, $scope.$root.userName);
          };

          /**
           * 恢复删除的元素
           * @param {String} id feature id
           * @param {Object} feature the feature
           */
          $scope.restoreDeletedFeature = function(id, feature) {
            MapHandler.restoreDeletedFeature($scope.$root.mapId, id, feature, $scope.$root.userName);
          };

          //Variables are changed while the textual diff is created.
          //Used by the GUI to decide which view to display.
          $scope.hasChanges = {
            diffGeometry: false,
            diffProperties: false
          };

          /**
           * 判断是否有元素图形发生改变
           * @param  {String}  action the action string of the feature
           * @return {Boolean}        true if there are geometry changes
           */
          $scope.hasGeomChanges = function(action) {
            var geomChanges = ['created feature', 'deleted feature', 'edited geometry', 'restored', 'imported feature'];
            return geomChanges.indexOf(action) > -1;
          };

          /**
           * 打开对比窗口
           * @param {String} fid the feature id
           * @param {String} rev the revision key
           * @param {Number} index index of the revisions array
           */
          $scope.showTextDiff = function(fid, rev, index) {
            var length = $scope.documentRevision.length;
            if (length >= index + 1) {
              startCompare($scope.documentRevision[index + 1].properties, $scope.documentRevision[index].properties, 'diffProperties', 'Properties', $scope.hasChanges);
              startCompare($scope.documentRevision[index + 1].geometry.coordinates, $scope.documentRevision[index].geometry.coordinates, 'diffGeometry', 'Geometry', $scope.hasChanges);
            }
            $scope.hideDocumentRevisionView = true;
            $scope.hideDiffView = false;
          };

        }
      };
    }
  ]);
