'use strict';

angular.module('CooperativeIndoorMap')
  .directive('map', ['MapHandler', 'SynchronizeMap', 'ApiService', 'DataImport','IndoorHandler','DrawEditHandler',
    function(MapHandler, SynchronizeMap, ApiService, DataImport, IndoorHandler, DrawEditHandler) {
      var mapLoadingDiv;
      /**
       * Creates a loading div
       */
      function showLoading() {
        mapLoadingDiv = document.createElement('div');
        mapLoadingDiv.className = 'mapLoading';
        var loading = document.createElement('div');
        loading.className = 'loading';
        mapLoadingDiv.appendChild(loading);
        document.body.appendChild(mapLoadingDiv);
      }

      /**
       * Removes the loading div from the page
       */
      function removeLoading() {
        document.body.removeChild(mapLoadingDiv);
      }

      /**
       * Load the features for the current map from the database
       * @param  {String} mapId      the map id
       * @param  {Object} map        the map
       * @param  {Object} drawnItems layer group for the drawn items
       */
      function loadFeatures(mapId, map, drawnItems) {
        showLoading();
        var featuresLength = 0;
        ApiService.getFeaturesOboe(mapId)
          .node('rows.*', function(row) {
            featuresLength++;
            // This callback will be called everytime a new object is
            // found in the foods array.
            MapHandler.addGeoJSONFeature(map, {
              'feature': row.doc,
              'fid': row.doc._id
            }, drawnItems);
          })
          .done(function() {
            if (featuresLength) {
              map.fitBounds(drawnItems.getBounds());
            }
            removeLoading();
          });
      }

      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<div id="map" class="sidebar-map"></div>',
        replace: true,
        scope: {
          mapId: '=mapid'
        },
        // transclude: true,
        link: function postLink($scope) {
          var normal = L.tileLayer('http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}', {
              maxZoom: 22,
              minZoom: 5
          });
          var satellite = L.tileLayer('http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}', {
              maxZoom: 20,
              minZoom: 5
          });
          var baseLayers = {
              '地图': normal,
              '影像': satellite
          };
          //expose map for debugging purposes
          var map = window._map = L.map('map', {
            center: [30.50891, 114.40718],
            zoom: 18,
            layers: [normal],
            zoomControl: false
          });

          L.control.zoom({
            zoomInTitle: '放大',
            zoomOutTitle: '缩小',
            position: 'topleft'
          }).addTo(map);

          L.control.layers(baseLayers, {}, {
            position: 'bottomleft'
          }).addTo(map);

          // Initialise the FeatureGroup to store editable layers
          var drawnItems = window.drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);

          // Initialise the draw control and pass it the FeatureGroup of editable layers
          var drawControl = window._drawControl = new L.Control.Draw({
            edit: false,
            draw: {
              circle: false,
              rectangle: false,
              circlemarker: false,
              marker: true,
              polyline: {
                shapeOptions: {
                  color: '#555555',
                  fillOpacity: 0.5,
                  weight: 2,
                  opacity: 1
                }
              },
              polygon: {
                shapeOptions: {
                  color: '#555555',
                  fillOpacity: 0.5,
                  weight: 2,
                  opacity: 1
                }
              }
            }
          });
          map.addControl(drawControl);

          L.drawLocal.edit.handlers.edit.tooltip.subtext = '点击保存或删除退出编辑状态';
          L.drawLocal.edit.handlers.edit.tooltip.text = '进入编辑状态';
          //Drawn features have to be added to the layer group
          map.on('draw:created', function(e) {
            // drawnItems.addLayer(e.layer);
            // MapHandler.editFeature(e.layer);
          });

          //Out of some unknown reasons the leaflet.draw tooltips where deactivated
          map.options.drawControlTooltips = true;

          //Load already existing features from the db
          loadFeatures($scope.mapId, map, drawnItems);

          //Initialize the MapHandler (wrapper for all map based actions)
          MapHandler.initMapHandler(map, drawnItems, $scope.$parent, drawControl);

          //初始化室内地图服务
          IndoorHandler.initIndoorHandler(map, $scope.$parent);

          //初始化地图编辑服务
          DrawEditHandler.initDrawEditHandler(map, drawnItems, $scope.$parent, drawControl);

          //Initialize the map synchronization (handles all Websocket related sync stuff)
          SynchronizeMap.init(map, $scope.$parent, drawnItems);

          //Pass the map instance to the DataImporter
          DataImport.init(map, drawnItems);
        }
      };
    }
  ]);
