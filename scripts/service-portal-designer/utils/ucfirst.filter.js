/*! RESOURCE: /scripts/service-portal-designer/utils/ucfirst.filter.js */
(function () {
  'use strict';
  angular.module('spd_ucfirst_filter', []).filter('ucfirst', function () {
    return function (input) {
      if (input) {
        return input.substring(0, 1).toUpperCase() + input.substring(1);
      }
    };
  });
})();
