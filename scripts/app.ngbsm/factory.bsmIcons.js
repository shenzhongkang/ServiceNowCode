/*! RESOURCE: /scripts/app.ngbsm/factory.bsmIcons.js */
angular.module('sn.ngbsm').factory('bsmIcons', function (bsmRESTService) {
  'use strict';
  var cache = {};
  var defaultIcon = '';
  refreshCache();
  function refreshCache() {
    bsmRESTService.getIcons().then(function (response) {
      response = JSON.parse(response);
      cache = {};
      for (var i = 0; i < response.icons.length; i++) {
        if (response.icons[i].className === 'cmdb_ci')
          defaultIcon = response.icons[i].path;
        else cache[response.icons[i].className] = response.icons[i].path;
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
    set: function (key, icon) {
      if (cache.hasOwnProperty(key)) {
        return false;
      } else {
        cache[key] = icon;
      }
    },
    get: function (key) {
      return cache[key] === undefined ? defaultIcon : cache[key];
    },
    defaultIcon: function () {
      return defaultIcon;
    },
  };
});