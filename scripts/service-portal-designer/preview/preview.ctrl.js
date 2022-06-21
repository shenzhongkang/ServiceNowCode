/*! RESOURCE: /scripts/service-portal-designer/preview/preview.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_preview', [])
    .controller('PreviewCtrl', function ($state, state, utils, config) {
      var vm = this;
      vm.url = utils.format(config.previewUri, {
        id: $state.params.id,
        portal: $state.params.portal,
      });
      vm.device = $state.params.device;
      state.onChange('deviceSelected').call(function (device) {
        vm.device = device;
      });
    });
})();
