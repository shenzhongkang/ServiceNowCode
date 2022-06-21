/*! RESOURCE: /scripts/service-portal-designer/page/page_add.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_page_add', [])
    .controller(
      'PageAddCtrl',
      function ($scope, $rootScope, state, page, portal, $state) {
        var vm = this;
        vm.pageIdInvalid = false;
        vm.portalSelected = $state.params.portal;
        vm.page = {
          id: null,
          title: null,
          portal: null,
        };
        vm.list = {
          portal: [],
        };
        $scope.$evalAsync(function () {
          $rootScope.$broadcast('spd_page_add_loaded');
        });
        vm.fillPageId = function () {
          if (!$scope.addPageFrm.pageId.$dirty) {
            vm.page.id = vm.page.title
              .toLowerCase()
              .replace(/[^a-z0-9-]/gi, '_')
              .replace(/^-|-$/g, '');
          }
        };
        vm.submit = function submit() {
          if (vm.page.id && vm.pageIdInvalid == false) {
            portal.getByUrlSuffix($state.params.portal).then(function (portal) {
              vm.page.portal = portal.sys_id;
              page.add(vm.page).then(function (response) {
                $state.go('editor', {
                  id: vm.page.id,
                  portal: $state.params.portal,
                });
                state.set('pageSelected', response.sys_id);
              });
            });
          }
        };
        vm.checkPageId = function checkPageId() {
          if (!vm.page.id) {
            vm.pageIdInvalid = false;
          } else {
            vm.page.id = vm.page.id
              .toLowerCase()
              .replace(/[^a-z0-9-]/gi, '_')
              .replace(/^-|-$/g, '');
            page.exists(vm.page.id).then(function (result) {
              vm.pageIdInvalid = result;
            });
          }
        };
      }
    );
})();
