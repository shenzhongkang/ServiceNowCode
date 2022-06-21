/*! RESOURCE: /scripts/service-portal-designer/config/text.js */
(function () {
  'use strict';
  angular
    .module('spd_text', ['sn.common.i18n'])
    .factory('text', function (i18n, $q) {
      return function (str) {
        var d = $q.defer();
        i18n.getMessage(str, function (message) {
          d.resolve(message);
        });
        return d.promise;
      };
    });
})();
