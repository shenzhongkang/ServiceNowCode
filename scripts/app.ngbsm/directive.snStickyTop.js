/*! RESOURCE: /scripts/app.ngbsm/directive.snStickyTop.js */
angular.module('sn.ngbsm').directive('snStickyTop', function () {
  'use strict';
  return {
    restrict: 'A',
    replace: false,
    link: function (scope, elem, attrs) {
      var container = angular.element(elem[0].parentElement);
      var base = angular.element(elem[0]);
      container.on('scroll', function () {
        base.css('top', container[0].scrollTop + 'px');
      });
    },
  };
});