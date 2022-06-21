/*! RESOURCE: /scripts/service-portal-designer/portal/portal.js */
(function () {
  'use strict';
  angular
    .module('spd_portal', [])
    .factory('portal', function (config, utils, $q, record) {
      var cache = [];
      function getList() {
        if (cache.length > 0) {
          var deferred = $q.defer();
          deferred.resolve(cache);
          return deferred.promise;
        }
        record.select({ table: config.portalList.table });
        return record.query(config.portalList.params).then(function (data) {
          return data.sort(function (a) {
            return a.url_suffix == window.defaultPortal ? -1 : 1;
          });
        });
      }
      function getDefault() {
        return getList().then(function (portals) {
          var portal;
          function sp(portal) {
            if (portal.url_suffix === window.defaultPortal) {
              return portal;
            }
          }
          portal = _.filter(portals, sp);
          if (portal.length) {
            return portal[0];
          }
          return portals[portals.length - 1];
        });
      }
      function getTheme(urlSuffix) {
        record.select({ url_suffix: urlSuffix }, config.themeUri);
        return record.query();
      }
      function getByUrlSuffix(urlSuffix) {
        return getList().then(function (response) {
          var result;
          response.some(function (item) {
            if (item.url_suffix === urlSuffix) {
              result = item;
              return;
            }
          });
          return result;
        });
      }
      return {
        getList: getList,
        getDefault: getDefault,
        getByUrlSuffix: getByUrlSuffix,
        getTheme: getTheme,
      };
    });
})();
