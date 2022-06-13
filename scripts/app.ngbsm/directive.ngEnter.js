/*! RESOURCE: /scripts/app.ngbsm/directive.ngEnter.js */
angular.module('sn.ngbsm').directive('ngEnter', function (CONST) {
  'use strict';
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === CONST.KEYCODE_ENTER) {
        scope.$apply(function () {
          scope.$eval(attrs.ngEnter);
        });
        event.preventDefault();
        event.stopPropagation();
      }
    });
  };
});