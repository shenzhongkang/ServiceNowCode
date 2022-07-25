/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.centerCalc.js */
angular
  .module('sn.queryBuilder')
  .directive('centerCalc', function ($rootScope) {
    'use strict';
    return {
      restrict: 'A',
      scope: {
        node: '=centerCalc',
      },
      link: function (scope, element, attrs) {
        calcCenter();
        function calcCenter() {
          scope.node.divWidth = element[0].clientWidth;
          scope.node.divHeight = element[0].clientHeight;
          var x = Math.floor(element[0].clientWidth / 2);
          var y = Math.floor(element[0].clientHeight / 2);
          var center = {
            x: scope.node.x + x,
            y: scope.node.y + y,
          };
          var left = {
            x: scope.node.x,
            y: scope.node.y + scope.node.divHeight / 2,
          };
          var right = {
            x: scope.node.x + scope.node.divWidth,
            y: scope.node.y + scope.node.divHeight / 2,
          };
          var leftCorner = {
            x: scope.node.x - 6,
            y: scope.node.y + scope.node.divHeight / 2 - 6,
          };
          var rightCorner = {
            x: scope.node.x + scope.node.divWidth - 6,
            y: scope.node.y + scope.node.divHeight / 2 - 6,
          };
          scope.node.center = center;
          scope.node.leftCenter = left;
          scope.node.rightCenter = right;
          scope.node.leftCorner = leftCorner;
          scope.node.rightCorner = rightCorner;
        }
        scope.$on('calculate_center', function (event) {
          if (scope.node) calcCenter();
        });
      },
    };
  });
