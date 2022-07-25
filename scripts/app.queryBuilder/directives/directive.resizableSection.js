/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.resizableSection.js */
angular.module('sn.queryBuilder').directive('resizableSection', [
  '$rootScope',
  '$document',
  '$timeout',
  'CONSTQB',
  function ($rootScope, $document, $timeout, CONST) {
    'use strict';
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var direction = attrs.resizableSection;
        element.on('mousedown', function (event) {
          event.preventDefault();
          $document.on('mousemove', mouseMoveHandler);
          $document.on('mouseup', mouseUpHandler);
        });
        function mouseMoveHandler(event) {
          if (direction === 'vertical') {
            var top = angular.element(attrs.resizableTop);
            var bottom = angular.element(attrs.resizableBottom);
            var y = window.innerHeight - event.pageY;
            var max = eval(attrs.max) || 81;
            var min = eval(attrs.min) || window.innerHeight - 206;
            if (event.pageY >= max && event.pageY <= min) {
              element.css({
                bottom: y + 'px',
              });
              top.css({
                height:
                  event.pageY - parseInt(attrs.resizableHeight) - 81 + 'px',
              });
              bottom.css({
                height: y + 'px',
                'max-height': window.innerHeight - max + 'px',
              });
            }
          }
        }
        function mouseUpHandler() {
          $document.unbind('mousemove', mouseMoveHandler);
          $document.unbind('mouseup', mouseUpHandler);
        }
      },
    };
  },
]);
