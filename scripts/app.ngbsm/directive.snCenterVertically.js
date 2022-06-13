/*! RESOURCE: /scripts/app.ngbsm/directive.snCenterVertically.js */
angular.module('sn.ngbsm').directive('snCenterVertically', function () {
  'use strict';
  return {
    restrict: 'A',
    replace: false,
    link: function (scope, elem, attrs) {
      var first = true;
      scope.$watch(
        function () {
          return elem.css('height');
        },
        heightChanged,
        true
      );
      function heightChanged(newValue, oldValue) {
        if (newValue !== oldValue || first) {
          first = false;
          elem.css(
            'margin-top',
            '-' + Math.round(parseInt(newValue) / 2) + 'px'
          );
        }
      }
    },
  };
});