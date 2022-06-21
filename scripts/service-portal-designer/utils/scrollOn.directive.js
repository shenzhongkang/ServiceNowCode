/*! RESOURCE: /scripts/service-portal-designer/utils/scrollOn.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_scroll_on_directive', [])
    .directive('scrollOn', function () {
      return function (scope, element, attr) {
        scope.$on(attr.scrollOn, function (e, value) {
          $(element).scrollTop(value);
        });
      };
    });
})();
