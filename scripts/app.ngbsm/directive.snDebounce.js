/*! RESOURCE: /scripts/app.ngbsm/directive.snDebounce.js */
angular.module('sn.ngbsm').directive('snDebounce', function ($timeout) {
  'use strict';
  return {
    restrict: 'A',
    require: 'ngModel',
    priority: 99,
    link: function (scope, elm, attr, ngModelCtrl) {
      if (attr.type === 'radio' || attr.type === 'checkbox') {
        return;
      }
      var delay = parseInt(attr.snDebounce, 10);
      if (isNaN(delay)) {
        delay = 1000;
      }
      elm.unbind('input');
      var debounce;
      elm.bind('input', function () {
        $timeout.cancel(debounce);
        debounce = $timeout(function () {
          scope.$apply(function () {
            ngModelCtrl.$setViewValue(elm.val());
          });
        }, delay);
      });
      elm.bind('blur', function () {
        scope.$apply(function () {
          ngModelCtrl.$setViewValue(elm.val());
        });
      });
    },
  };
});