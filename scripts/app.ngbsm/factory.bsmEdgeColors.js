/*! RESOURCE: /scripts/app.ngbsm/factory.bsmEdgeColors.js */
angular.module('sn.ngbsm').factory('bsmEdgeColors', function (bsmRESTService) {
  'use strict';
  var cache = {};
  refreshCache();
  function refreshCache() {
    bsmRESTService.getColors().then(function (response) {
      response = JSON.parse(response);
      cache = {};
      for (var i = 0; i < response.edgecolors.length; i++) {
        cache[response.edgecolors[i].relationship_type] =
          response.edgecolors[i].color;
      }
    });
  }
  return {
    refresh: function () {
      refreshCache();
    },
    has: function (key) {
      return cache[key] !== undefined;
    },
    get: function (key) {
      return cache[key] === undefined ? '' : cache[key];
    },
  };
});