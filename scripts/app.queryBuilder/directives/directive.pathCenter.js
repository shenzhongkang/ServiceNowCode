/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.pathCenter.js */
angular.module('sn.queryBuilder').directive('pathCenter', function ($timeout) {
  'use strict';
  return {
    restrict: 'A',
    scope: {
      connection: '=pathCenter',
    },
    link: function (scope, element, attrs) {
      pathCenter();
      function pathCenter() {
        if (element && element.length === 1) {
          var pathLength = element[0].getTotalLength();
          if (pathLength === 0) return;
          var midPoint = element[0].getPointAtLength(pathLength / 2);
          scope.connection.center = {};
          scope.connection.center.x = midPoint.x;
          scope.connection.center.y = midPoint.y;
        }
      }
      scope.$on('calculate_path_center', function (event) {
        pathCenter();
      });
    },
  };
});
