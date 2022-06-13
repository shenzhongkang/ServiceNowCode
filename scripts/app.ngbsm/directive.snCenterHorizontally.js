/*! RESOURCE: /scripts/app.ngbsm/directive.snCenterHorizontally.js */
angular
  .module('sn.ngbsm')
  .directive('snCenterHorizontally', function ($timeout) {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      link: function (scope, elem, attrs) {
        var first = true;
        scope.$watch(
          function () {
            return elem.css('width');
          },
          widthChanged,
          true
        );
        function widthChanged(newValue, oldValue) {
          if (newValue !== oldValue || first) {
            first = false;
            elem.css(
              'margin-left',
              '-' + Math.round(parseInt(newValue) / 2) + 'px'
            );
          }
        }
      },
    };
  });