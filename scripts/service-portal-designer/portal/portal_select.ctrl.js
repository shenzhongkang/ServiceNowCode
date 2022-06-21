/*! RESOURCE: /scripts/service-portal-designer/portal/portal_select.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_portal_select', [])
    .controller(
      'PortalSelectCtrl',
      function (state, page, portal, $state, spPreference) {
        var vm = this;
        vm.portalList = [];
        vm.portalSelected = null;
        portal.getList().then(function (data) {
          vm.portalList = data;
          if (vm.portalList.length === 1) {
            vm.portalSelected = vm.portalList[0];
          }
        });
        vm.selectPortal = function selectPortal(item) {
          vm.portalSelected = item;
          state.set('portalSelected', vm.portalSelected.url_suffix);
          state.set('portalId', vm.portalSelected.sys_id);
          spPreference.set('sp.portal', vm.portalSelected.url_suffix);
          var pageSelected = state.get('pageSelected');
          if (pageSelected && pageSelected.id) {
            $state.go('editor', {
              portal: vm.portalSelected.url_suffix,
              id: pageSelected.id,
            });
          } else {
            $state.go('pageSelect', { portal: vm.portalSelected.url_suffix });
          }
        };
      }
    );
})();
