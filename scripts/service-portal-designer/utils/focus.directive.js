/*! RESOURCE: /scripts/service-portal-designer/utils/focusOn.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_focus_on_directive', [])
    .directive('focusOn', function () {
      return function (scope, elem, attr) {
        scope.$on(attr.focusOn, function (e) {
          elem[0].focus();
        });
      };
    });
})();
