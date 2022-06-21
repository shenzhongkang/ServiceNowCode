/*! RESOURCE: /scripts/service-portal-designer/page/page_select.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_page_select', [])
    .controller(
      'PageSelectCtrl',
      function ($rootScope, events, $scope, state, page, portal, $state) {
        var vm = this;
        vm.pageIndex = null;
        vm.pageList = null;
        vm.pageLogin = null;
        vm.pageNotFound = null;
        vm.pageRemovalStage = null;
        function setSpecialPages(portalSelected) {
          portal.getByUrlSuffix(portalSelected).then(function (response) {
            if (response.homepage && response.homepage.display_value) {
              vm.pageIndex = response.homepage.display_value;
            }
            if (response.login_page && response.login_page.display_value) {
              vm.pageLogin = response.login_page.display_value;
            }
            if (
              response.notfound_page &&
              response.notfound_page.display_value
            ) {
              vm.pageNotFound = response.notfound_page.display_value;
            }
          });
        }
        vm.portalSelected = state.get('portalSelected');
        if (!vm.portalSelected) {
          portal.getDefault().then(function (data) {
            state.set('portalSelected', data.url_suffix);
            vm.portalSelected = data.url_suffix;
            state.set('portalId', data.sys_id);
            setSpecialPages(data.url_suffix);
          });
        } else {
          setSpecialPages(vm.portalSelected);
        }
        page.getList().then(function (data) {
          vm.pageList = data;
          $rootScope.$broadcast(events.pageSelectionDataHasLoaded);
        });
        vm.pageChanged = function pageChanged(item) {
          $state.go('editor', { id: item.id, portal: vm.portalSelected });
          state.set('pageSelected', item.sys_id);
        };
        vm.pageIsSpecial = function pageIsSpecial(item) {
          return (
            vm.pageIndex === item.id ||
            vm.pageLogin === item.id ||
            vm.pageNotFound === item.id
          );
        };
        vm.triggerDeleteConfirmationModal =
          function triggerDeleteConfirmationModal($event, item) {
            $event.stopPropagation();
            vm.pageRemovalStage = item;
            $scope.$broadcast('dialog.page-delete-confirmation-modal.show');
          };
        vm.removeStagedPage = function removeStagedPage(pageRemovalStage) {
          if (!pageRemovalStage) return;
          page.remove(pageRemovalStage.sys_id).then(function (data) {
            if (!data.remove_successful) return;
            vm.pageList = _.filter(vm.pageList, function (page) {
              return page.sys_id !== data.page_id;
            });
            state.set('pageList', vm.pageList);
          });
          pageRemovalStage = null;
          $scope.$broadcast('dialog.page-delete-confirmation-modal.close');
        };
        vm.pageOrder = function pageOrder(item) {
          return vm.pageIndex === item.sys_id ? 0 : item.title;
        };
      }
    );
})();
