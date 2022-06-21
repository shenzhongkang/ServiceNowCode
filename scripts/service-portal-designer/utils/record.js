/*! RESOURCE: /scripts/service-portal-designer/utils/record.js */
(function () {
  'use strict';
  angular
    .module('spd_record', ['spd_config', 'spd_utils'])
    .service('record', function (config, utils, $resource) {
      var vm = this;
      vm.select = function select(params, url, options) {
        vm.res = $resource(
          utils.getUrl(url || config.tableUri),
          params,
          options || null
        );
      };
      vm.query = function (params) {
        return vm.res.get(params).$promise.then(function (response) {
          return response.result;
        });
      };
    });
})();
