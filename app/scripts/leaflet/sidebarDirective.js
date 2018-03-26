angular.module('CollaborativeMap')
    .directive('sidebar', [function () {
        return {
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: 'partials/sidebar',
            replace: true,
            // transclude: true,
            link: function postLink($scope) {
                var map = window._map;
                var sidebar = L.control.sidebar('sidebar').addTo(map);

            }
        };
    }])