'use strict';
/**
 * @memberof CooperativeIndoorMap
 * @fileOverview Directive which to handle feature properties. Allows adding/editing/deleting properties
 * @exports CooperativeIndoorMap.FeaturePropertiesDirective *
 *
 * @requires  $compile
 * @requires ApiService
 * @requires MapHandler
 *
 * @author Dennis Wilhelm
 */
angular.module('CooperativeIndoorMap')
  .directive('featureproperties', ['$compile', 'MapHandler', 'ApiService', 'DrawEditHandler',
    function($compile, MapHandler, ApiService, DrawEditHandler) {

      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/featureproperties',
        replace: true,
        link: function postLink($scope) {
          /**
           * 通过属性视图给选定的feature设置属性，将属性数组放入到scope中，
           * 并使用ng-repeat指令在mapService中使用
           * @param {Object} feature leaflet中的layer的信息
           */
          $scope.selectFeature = function(feature, editByUser) {
            //jshint camelcase:false
            cleanSelection();
            var lastEditedBy;
            if (feature.feature && feature.feature.user) {
              lastEditedBy = feature.feature.user;
            }else{
              lastEditedBy = $scope.userName;
            }

            $scope.selectedFeature = {
              'properties': [],
              'fid': feature._leaflet_id,
              'user': lastEditedBy
            };

            selectCategoriesForGeomType(feature);

            var tmpGeoJSON = $scope.selectedFeature.feature = feature.toGeoJSON();

            //Create an Array containing all properties. Has to be included in the feature again
            for (var prop in tmpGeoJSON.properties) {
              if (allowedProp(prop)) {
                $scope.selectedFeature.properties.push({
                  'key': prop,
                  'value': tmpGeoJSON.properties[prop]
                });
              }
            }

            //Preselect the selectboxes if a category/preset is available
            if (tmpGeoJSON.properties && tmpGeoJSON.properties.category) {
              $scope.selectedCategory = tmpGeoJSON.properties.category;
              setPresetsInScope($scope.selectedCategory);
              setTimeout(function() {
                $('#categorySelect')[0].value = $scope.selectedCategory;
              }, 40);
            }
            if (tmpGeoJSON.properties && tmpGeoJSON.properties.preset) {
              var i = getPresetIndex(tmpGeoJSON.properties.preset);
              $scope.selectedPreset = i;
              //Wait to let the gui render first and set the selected index for the selectbox
              setTimeout(function() {
                $('#presetSelect')[0].selectedIndex = parseInt(i) + 1;
              }, 40);

            }

            $scope.editByUser = editByUser;

            //$apply has to be called manually, if the function is called from a different event (here leaflet click)
            $scope.safeApply();
          };

          $scope.$on('editHandlerUpdate', function(event, data) {
            $scope.editByUser = data;
            //$apply has to be called manually, if the function is called from a different event (here leaflet click)
            $scope.safeApply();
          });

          /**
           * 打开历史界面，显示元素的编辑历史
           * @param {String} id the feature id
           */
          $scope.showFeatureHistory = function(id) {
            $scope.$root.$broadcast('showFeatureHistory', id);
            $scope.$root.$broadcast('openToolbox', 'historyView');
          };

          var lastChange = -1;
          /**
           * 对于属性的更改，每秒钟同步一次
           */
          $scope.propertyChanged = function() {
            lastChange = new Date().getTime();
            setTimeout(function() {
              var tmpDate = new Date().getTime();
              if ((tmpDate - lastChange) > 900) {
                console.log('update property');
                updateFeature();
              }
            }, 1000);
          };
  
          /**
           * 保存并退出元素编辑状态
           */
          $scope.saveEdit = function() {
            MapHandler.removeEditHandler();
            DrawEditHandler.removeEditHandler();
            cleanSelection();
            $scope.selectedFeature = undefined;
          };

          /**
           * 删除当前的元素
           */
          $scope.deleteFeature = function() {
            MapHandler.deleteFeature();
            DrawEditHandler.deleteFeature();
            cleanSelection();
            $scope.selectedFeature = undefined;
          };

          /**
           * 更新列表元素属性显示
           */

          function updateFeature() {
            $scope.selectedFeature.properties.forEach(function(prop) {
              $scope.selectedFeature.feature.properties[prop.key] = prop.value;
            });
            MapHandler.updateOnlyProperties($scope.selectedFeature);
          }

          /**
           * 增加一个新属性
           * @param {event} key 按键
           */
          $scope.newProperty = function(key) {
            var newProp = function() {
              if ($scope.newKey && $scope.newValue) {
                $scope.selectedFeature.properties.push({
                  'key': $scope.newKey,
                  'value': $scope.newValue
                });
                $scope.newKey = '';
                $scope.newValue = '';
                updateFeature();
              }
              $scope.hideNewProperty = true;
            };

            if (key && key.keyCode === 13) {
              newProp();
            } else if (!key) {
              newProp();
            }
          };

          /**
           * 设定元素类型
           * @param {String} type the property type
           */

          function addNewPropertyType(type) {
            $scope.selectedFeature.properties.push({
              'key': type,
              'value': ''
            });
            updateFeature();
          }

          /**
           * 去除元素类型
           * @param type
           */
          function removePropertyType(type) {
            for (var i = $scope.selectedFeature.properties.length - 1; i >= 0; i--) {
              if ($scope.selectedFeature.properties[i].key === type) {
                $scope.selectedFeature.properties.splice(i, 1);
              }
            }
            delete $scope.selectedFeature.feature.properties[type];
          }

          //Variable used to controle the 'hide' class via ng-class
          $scope.hideNewProperty = true;

          /**
           * 显示增加新元素的输入框
           */
          $scope.addNewProperty = function() {
            $scope.hideNewProperty = false;
          };
          
          /**
           * 删除特定属性
           * @param {Number} i index of the properties Array
           */
          $scope.removeProperty = function(i) {
            var remKey = $scope.selectedFeature.properties[i].key;
            delete $scope.selectedFeature.feature.properties[remKey];
            $scope.selectedFeature.properties.splice(i, 1);
            updateFeature();
          };
          
          //NEW CATEGORIES SYSTEM
          var presets;
          var fields;
          var categories;

          /**
           * Select the suitable categories for the given feature based on the geometry type.
           * Put the selection in the scope variable for the GUI
           * @param  {Object} layer selected feature
           */

          function selectCategoriesForGeomType(layer) {
            var geomType = MapHandler.getLayerType(layer);
            $scope.categories = {};

            for (var key in categories) {
              if (categories[key].geometry.indexOf(geomType) > -1) {
                $scope.categories[key] = categories[key];
              }
            }
          }

          /**
           * Remove selected category and preset from the scope
           */

          function cleanSelection() {
            $scope.presets = undefined;
            $scope.selectedCategory = undefined;
            $scope.selectedPreset = undefined;
          }

          /**
           * GET request to load the category/preset and fields information from the server.
           * Stores the categories in the scope for the select box.
           * Fields and presets will be used as soon as a category has been chosen.
           */

          function getPresetData() {

            ApiService.getPresetData().then(function(result) {
              if (result && result.length === 3) {
                categories = result[0];
                fields = result[1];
                presets = result[2];
              }
            });
          }

          /**
           * If a category is selected, append the sub categories (presets) to a second select box.
           * Saves the category in the feature and call the update function to sync the feature.
           */
          $scope.selectPresets = function() {
            $scope.cancelEditMode();
            $scope.fields = [];
            $scope.selectedPreset = undefined;
            var selCategory = $scope.selectedCategory;

            if (selCategory) {
              //Update the feature
              $scope.selectedFeature.feature.properties.category = selCategory;
              setStyleFromCategory(selCategory);
              MapHandler.updateOnlyProperties($scope.selectedFeature);

              //Set to scope array
              setPresetsInScope(selCategory);

            }
          };

          /**
           * Removes existing simplestyle properties and sets the new ones
           * based on the configured category styles.
           * @param {Object} category the chosen osm category
           */

          function setStyleFromCategory(category) {
            var style = categories[category].style;
            var selFeature = $scope.selectedFeature.feature;
            removeExistingStyle(selFeature);
            for (var key in style) {
              selFeature.properties[key] = style[key];
            }
          }

          /**
           * Removes existing simplestyle properties from the given feature
           * @param  {Object} feature the GeoJSON feature
           */

          function removeExistingStyle(feature) {
            var simpleStyleKeys = [
              'marker-size',
              'marker-symbol',
              'marker-color',
              'stroke',
              'stroke-opacity',
              'stroke-width',
              'fill',
              'fill-opacity'
            ];
            simpleStyleKeys.forEach(function(styleKey) {
              delete feature.properties[styleKey];
            });
          }

          /**
           * Append the presets to the scope variable to fill the select box.
           */

          function setPresetsInScope(category) {
            $scope.presets = [];
            $scope.presets = [];
            //Get the member of the chosen category = presets
            var members = categories[category].members || [];
            members.forEach(function(member) {
              $scope.presets.push(presets[member]);
            });

          }

          /**
           * Returns the index of a preset in the categories member array
           * @param  {String} presetKey object key
           * @return {String}           Key of the categories member array
           */

          function getPresetIndex(presetKey) {
            var members = categories[$scope.selectedCategory].members;
            for (var key in members) {
              if (presetKey === members[key]) {
                return key;
              }
            }
          }

          /**
           * Called if the preset is selected.
           * Updates the feature and cally update to sync.
           *
           * Checks if the preset is associated with fields and adds new ones to the properties.
           */
          $scope.selectFields = function() {
            $scope.cancelEditMode();

            var members;
            $scope.fields = [];
            if ($scope.selectedPreset) {
              //Update the feature
              var oldPreset = $scope.selectedFeature.feature.properties.preset;
              $scope.selectedFeature.feature.properties.preset = getSelectedPresetName($scope.selectedPreset);
              MapHandler.updateOnlyProperties($scope.selectedFeature);

              members = $scope.presets[$scope.selectedPreset].fields || [];

              //Remove the fields of older presets from the feature
              if (oldPreset) {
                var oldMembers = presets[oldPreset].fields || [];
                if (oldMembers) {
                  oldMembers.forEach(function(member) {
                    //only delete members if they aren't used by the new preset
                    if (members.indexOf(member) === -1) {
                      var index = $scope.fields.indexOf(fields[member]);
                      if (index > -1) {
                        $scope.fields.splice(index, 1);
                      }
                      removePropertyType(fields[member].label);
                    }
                  });
                }
              }


              //Get the fields of the preset
              members = $scope.presets[$scope.selectedPreset].fields || [];
              members.forEach(function(member) {
                var newKey = fields[member].label;
                //Only append if not already existing
                if (!$scope.selectedFeature.feature.properties.hasOwnProperty(newKey)) {
                  addNewPropertyType(newKey);
                }
                //Scope array for the GUI
                $scope.fields.push(fields[member]);
              });
            }
          };

          /**
           * Returns the key of the selected preset (sub-category)
           * @param  {String} index the key of the categories member object
           * @return {String}       preset name
           */

          function getSelectedPresetName(index) {
            if (index && $scope.categories[$scope.selectedCategory] && $scope.categories[$scope.selectedCategory].members && $scope.categories[$scope.selectedCategory].members[index]) {
              return $scope.categories[$scope.selectedCategory].members[index];
            }
          }

          getPresetData();
        }
      };
    }
  ]);
