'use strict';

angular.module('CooperativeIndoorMap')
  .service('DrawEditHandler', ['Socket',
    function (Socket) {
      var map, drawnItems, mapScope, drawControl;
      var editHandler, editFeatureId;
      return {

        /**
         * 初始化drawEdit服务，设定drawstart事件响应函数
         * @param  {Object} m     map对象
         * @param  {Object} dI    drawItem，绘制图形元素的容器
         * @param  {Object} scope Angular scope对象
         * @param  {Object} dControl 绘制元素的控制组件
         */
        initDrawEditHandler: function(m, dI, scope, dControl) {
          map = m;
          drawnItems = dI;
          mapScope = scope;
          drawControl = dControl;

          map.on('draw:drawstart', function() {
            if (editHandler) {
              this.removeEditHandler();
            }
          }.bind(this));
        },

        /**
         * 手动调用leaflet.draw编辑特定元素
         * @param {Object} layer 被编辑的元素
         */
        editFeature: function(layer) {
          //If a feature is already in editing mode, stop before creating a new editHandler
          if (editHandler) {
            this.removeEditHandler();
          }

          if (layer instanceof L.Marker) {
            let icon = layer._icon;
            if (L.DomUtil.hasClass(icon, 'leaflet-marker-poi')) {
              L.DomUtil.removeClass(icon, 'leaflet-marker-poi');
            }
          }
          var editPathOptions = this.getEditStyle();

          //Create a new edit handler
          editHandler = new L.EditToolbar.Edit(map, {
            featureGroup: L.featureGroup([layer]),
            selectedPathOptions: editPathOptions
          });
          //jshint camelcase:false
          editFeatureId = layer._leaflet_id;
          editHandler.enable();
          mapScope.$emit('editHandler', true, editFeatureId);

          //Directly save the feature on every change
          layer.on('dragend', function() {
            editHandler.save();
          });
          layer.on('edit', function() {
            editHandler.save();
          });
        },

        /**
         * 返回一个JSON对象，表示元素在编辑的时候的样式
         * Returns a JSON object with style properties for the Leaflet.draw editing
         * @return {Object} leaflet style object
         */
        getEditStyle: function() {
          return {
            color: '#fe57a1',
            /* Hot pink all the things! */
            opacity: 0.6,
            dashArray: '10, 10',

            fill: true,
            fillColor: '#fe57a1',
            fillOpacity: 0.1,

            // Whether to user the existing layers color
            maintainColor: false
          };
        },

        /**
         * 退出编辑模式，移除正在编辑样式，产生editHandler事件
         */
        removeEditHandler: function() {
          if (editHandler) {
            let layer = editHandler._featureGroup.getLayer(editFeatureId);
            if (layer && layer instanceof L.Marker) {
              let icon = layer._icon;
              if (!L.DomUtil.hasClass(icon, 'leaflet-marker-poi')) {
                L.DomUtil.addClass(icon, 'leaflet-marker-poi');
              }
            }

            editHandler.disable();
            editHandler = undefined;
            editFeatureId = undefined;
            mapScope.$emit('editHandler', false, editFeatureId);
          }
        },

        /**
         * 使用Leaflet.Draw保存更改，并移除editHandler
         */
        saveEditedFeature: function() {
          if (editHandler) {
            editHandler.save();
            this.removeEditHandler();
          }
        },

        editByUser: {},

        /**
         * 多个用户共同编辑的时候，触发editHandlerUpdate事件
         * @param  {[type]} event {user, id, active, mapId}
         */
        fireEditFeatureEvent: function(event) {
          if (editFeatureId === event.fid) {
            mapScope.$emit('editHandlerUpdate', this.editByUser[editFeatureId]);
          }
        },
        /**
         * 存储特定元素的编辑用户，如果多个用户对一个元素进行编辑
         * @param {Object} event {user, id, active, mapId}
         */
        setEditFeatureEvent: function(event) {
          if (event.user && event.fid) {
            if (event.active) {
              if (this.editByUser[event.fid]) {
                this.editByUser[event.fid].push(event.user);
              } else {
                this.editByUser[event.fid] = [event.user];
              }
            } else if (this.editByUser[event.fid]) {
              this.editByUser[event.fid].splice(this.editByUser[event.fid].indexOf(event.user), 1);
              if (this.editByUser[event.fid].length === 0) {
                delete this.editByUser[event.fid];
              }
            }
            this.fireEditFeatureEvent(event);
          }
        },

        /**
         * 删除当前选定的元素
         */
        deleteFeature: function() {
          //Stop the edit mode
          if (editHandler) {
            editHandler.disable();
          }
          //Create a delete handler
          var delLayer = map._layers[editFeatureId];
          if(!delLayer) {
            return;
          }
          var deleteHandler = new L.EditToolbar.Delete(map, {
            featureGroup: L.featureGroup([delLayer]),
          });
          deleteHandler.enable();
          deleteHandler._removeLayer(delLayer);
          deleteHandler.save();
          deleteHandler.disable();

          //remove the layer from the map
          this.removeLayer(map, {
            fid: editFeatureId
          }, drawnItems);
        },

        /**
         * 更新一个元素，用于显示元素之间的不同
         * 不要把元素添加到drawItem中，也不要使元素可编辑
         * @param  {String} fid          feature id
         * @param  {Object} geoJsonLayer geojson object
         */
        updateLayerForDiff: function(fid, geoJsonLayer) {
          this.removeLayer(map, {
            'fid': fid
          }, map);
          this.addGeoJSONFeature(map, {
            feature: geoJsonLayer,
            'fid': fid
          }, map, true);
        },

        /**
         * 从map中和drawItem中移除特定的元素
         * @param  {String} fid the feature id
         */
        removeLayerFid: function(fid) {
          this.removeLayer(map, {
            'fid': fid
          }, drawnItems);
        },


        /**
         * 添加一个还没有添加的元素，用于版本回退
         * @param {String} fid          the feature id
         * @param {Object} geoJsonLayer geojson object
         */
        addFeatureAfterDiff: function(fid, geoJsonLayer) {
          //If feature exists, a newer version has been added while the user was reviewing different revisions
          if (!map._layers[fid]) {
            this.addGeoJSONFeature(map, {
              feature: geoJsonLayer,
              'fid': fid
            }, drawnItems);
          }
        },

        /**
         * 更新元素，先移除，然后重新绘制
         * 出发propertyEdited事件
         * @param  {Object} layer leaflet layer
         */
        updateFeature: function(layer) {
          this.removeLayer(map, layer, drawnItems);
          this.addGeoJSONFeature(map, layer, drawnItems);
          map.fireEvent('propertyEdited', {
            'layer': layer.feature,
            'fid': layer.fid
          });
        },

        /**
         * 更新属性信息，重用geometry
         * @param  {Object} layer feature
         */
        updateOnlyProperties: function(layer) {
          if (editFeatureId) {
            var tmpLayer = map._layers[editFeatureId].toGeoJSON();
            layer.feature.geometry = tmpLayer.geometry;
          }
          this.updateFeature(layer);
        },
        
        /**
         * 添加一次性click事件，用于元素拾取
         */
        getLayerIdOnce: function(cb) {
          //jshint camelcase:false
          drawnItems.once('click', function(layer) {
              var fid;
              if (layer && layer.layer && layer.layer._leaflet_id) {
                fid = layer.layer._leaflet_id;
              }
              cb(fid);
          }.bind(this));
        },

        /**
         * 缩放地图到特定的范围之中
         * @param  {Object} bounds leaflet bouding box (L.LatLngBounds)
         */
        fitBounds: function(bounds) {
          map.fitBounds(bounds);
        },

        /**
         * 创建一个Leaflet bounding box
         * @param  {Array} nE [lat, lng]
         * @param  {Array} sW [lat, lng]
         * @return {Object}    leafet bounding box (L.LatLngBounds)
         */
        getBounds: function(nE, sW) {
          return new L.LatLngBounds(nE, sW);
        },

        /**
         * 绘制用于的视图边界，3000ms之后自动移除
         * @param  {Object} bounds Leaflet bounding box (L.LatLngBounds)
         */
        paintUserBounds: function(bounds, color) {
          var boundsColor = color || '#ff0000';

          var bound = L.rectangle(bounds, {
            color: boundsColor,
            weight: 2,
            fill: false,
            opacity: 1
          });
          bound.addTo(map);
          map.fitBounds(bound, {
            'paddingBottomRight': [1, 1],
            'paddingTopLeft': [1, 1]
          });
          setTimeout(function() {
            map.removeLayer(bound);
          }, 3000);
        },

        /**
         * 绘制所有用户的边界，并自动缩放到这些边界的最大外围矩形
         * @param  {Object} user {userid:{bounds, color}}
         */
        paintAllUserBounds: function(user) {
          var lGroup = L.featureGroup();
          map.addLayer(lGroup);

          for (var key in user) {
            var bound = L.rectangle(user[key].bounds, {
              color: user[key].color,
              weight: 2,
              fill: false,
              opacity: 1
            });
            bound.addTo(lGroup);
          }
          var allBounds = lGroup.getBounds();
          if (allBounds.isValid()) {
            map.fitBounds(lGroup.getBounds(), {
              'paddingBottomRight': [1, 1],
              'paddingTopLeft': [1, 1]
            });
          }
          setTimeout(function() {
            map.removeLayer(lGroup);
          }, 3500);
        },

        /**
         * 对特定元素进行版本回退的时候，将回退的版本信息发送到服务器
         * @param  {String} mapId the map id
         * @param  {String} fid   feature id
         * @param  {String} toRev revision to which the feature should be reverted
         * @param  {String} user  username
         */
        revertFeature: function(mapId, fid, toRev, user) {
          Socket.emit('revertFeature', {
            'mapId': mapId,
            'fid': fid,
            'toRev': toRev,
            'user': user
          }, function(res) {
            console.log(res);
          });
        },

        /**
         * 使用WebSocket发送消息，恢复已经删除的元素
         * @param  {String} mapId the map id
         * @param  {String} fid   feature id
         * @param  {Object} feature leaflet feature
         * @param  {String} user  username
         */
        restoreDeletedFeature: function(mapId, fid, feature, user) {
          Socket.emit('restoreDeletedFeature', {
            'mapId': mapId,
            'fid': fid,
            'feature': feature,
            'action': 'restored',
            'user': user
          }, function(res) {
            console.log(res);
          });
        },

        /**
         * 缩放地图到指定的元素
         * @param  {String} id feature id (= layer id)
         */
        panToFeature: function(id) {
          var target = map._layers[id];

          if (target && target._latlng) {
            map.panTo(target._latlng);
          } else if (target && target._latlngs) {
            var bounds = target.getBounds();
            map.fitBounds(bounds);
          }
        },

        /**
         * 元素点选事件处理函数
         * @param  {e} e event
         */
        onLayerClick: function(e) {
          //jshint camelcase:false
          let layer = e.target;
          if(layer instanceof L.Marker && layer.isPopupOpen()) {
            layer.closePopup();
          }
          mapScope.selectFeature(layer, this.editByUser[layer._leaflet_id]);
          this.editFeature(layer);
        },

        /**
         * 对地图中的某一层启用编辑功能
         * @param  {LayerGroup} layergroup feature array
         */
        enableFeatureDrawEidt: function(layergroup) {
          //jshint camelcase:false
          for (let key in layergroup._layers) {
            let layer = layergroup._layers[key];
            layer.on('click', this.onLayerClick, this);
          }
        },
  
        /**
         * 对地图中的某一层启用编辑功能
         * @param  {LayerGroup} layergroup feature array
         */
        disableFeatureDrawEidt: function(layergroup) {
          //jshint camelcase:false
          if (editHandler) {
            this.removeEditHandler();
          }
          for (let key in layergroup._layers) {
            let layer = layergroup._layers[key];
            layer.off('click', this.onLayerClick, this);
          }
        },
        /**
         * 获取被选定正在编辑的FeatureId
         * @returns {*} editFeatureId
         */
        getEditFeatureId: function() {
          return editFeatureId;
        },

        /**
         * 着重显示一个元素
         * @param  {Object} feature leaflet feature
         */
        highlightFeature: function(feature, color) {
          if (feature) {
            if (feature._icon || feature._container) {
              color = color || '#FFFF03';
              var elem = feature._icon || feature._container.children[0];
              if (elem.getAttribute('class').indexOf('highlight') === -1) {
                elem.setAttribute('class', elem.getAttribute('class') + 'animateAll');
                setTimeout(function() {
                  // elem.setAttribute('class', elem.getAttribute('class') + ' highlight');
                  elem.style.stroke = color;
                  elem.style.strokeWidth = '5px';
                  elem.style.backgroundShadow = '0 0 20px 5px ' + color;
                  elem.style.border = 'solid';
                  elem.style.borderColor = color;
                }, 50);

                setTimeout(function() {
                  elem.setAttribute('class', elem.getAttribute('class') + ' animateAll');
                  setTimeout(function() {
                    elem.style.stroke = '';
                    elem.style.strokeWidth = '';
                    elem.style.backgroundShadow = '';
                    elem.style.border = '';
                    elem.style.borderColor = '';
                    elem.setAttribute('class', elem.getAttribute('class').replace(/animateAll/g, ''));
                  }, 1000);
                }, 1000);
              }
            }
          }
        },


        /**
         * 包装highlightFeature函数，着重显示一个元素通过元素id
         * @param  {String} fid feature id
         */
        highlightFeatureId: function(fid) {
          this.highlightFeature(map._layers[fid]);
        },

        /**
         * 移除一个特定的元素
         * @param  {Object} map        the map
         * @param  {Object} event      remove event ({fid, feature, user})
         * @param  {Object} drawnItems layer group for the features
         */
        removeLayer: function(map, event, drawnItems) {
          var deleteLayer = map._layers[event.fid];
          if (deleteLayer) {
            map.removeLayer(deleteLayer);
            drawnItems.removeLayer(deleteLayer);
          }
        },

        /**
         * 检查一个元素是否被编辑
         * @return {Boolean} is edited
         */
        hasGeometryEdits: function() {
          if (editHandler && editHandler._featureGroup && editHandler._featureGroup._layers) {
            var layers = editHandler._featureGroup._layers;
            for (var key in layers) {
              if (layers[key].edited === true) {
                return true;
              }
            }
            return false;
          } else {
            return false;
          }
        },

        /**
         * 返回元素的类型
         * @param  {Object} layer leaflet layer
         * @return {String}       geometry type (point, area, line)
         */
        getLayerType: function(layer) {
          if (layer instanceof L.Marker) {
            return 'point';
          } else if (layer instanceof L.Polygon) {
            return 'area';
          } else if (layer instanceof L.Polyline) {
            return 'line';
          }
        },

        /**
         * 根据元素的id返回元素的类型
         * @param  {String} fid feature id
         * @return {String}     geometry type
         */
        getLayerTypeFid: function(fid) {
          var layer = map._layers[fid];
          if (layer) {
            return this.getLayerType(layer);
          }
        }
      };
    }]);