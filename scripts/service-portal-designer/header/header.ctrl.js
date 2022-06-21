/*! RESOURCE: /scripts/service-portal-designer/header/header.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_header', [])
    .controller(
      'HeaderCtrl',
      function (
        $scope,
        state,
        page,
        portal,
        map,
        config,
        pageUpdate,
        $state,
        $rootScope,
        utils,
        events,
        $window
      ) {
        var vm = this;
        vm.loadingIndicator = false;
        vm.pageList = [];
        vm.portalSelected = null;
        vm.deviceSelected = config.previewDefaultDevice;
        vm.previewDeviceSizes = config.previewDeviceSizes;
        state.onChange('currentWorkSaved').update(vm);
        $scope.$on(events.loadingIndicator, function (e, status) {
          vm.loadingIndicator = status;
        });
        function loadPage(pageId) {
          $scope.$parent.item = angular.copy(config.layout);
          map.removeAll();
          state.set('pageLoaded', false);
          return page.get(pageId).then(function (response) {
            state.set('pageLoaded', true);
            return page.render(
              'container',
              response.result,
              $scope.$parent.item
            );
          });
        }
        $scope.$on(events.stateChanged, function () {
          state.set('itemSelected', false);
          var item;
          if ($state.params.id) {
            page.getList().then(function (data) {
              vm.pageList = data;
              vm.pageList.some(function (page) {
                if (page.id === $state.params.id) {
                  item = page;
                  return true;
                }
              });
              if ($state.params.portal) {
                portal
                  .getByUrlSuffix($state.params.portal)
                  .then(function (portal) {
                    state.set('pageSelected', item);
                    state.set('portalId', portal.sys_id);
                    loadPage(item.id);
                  });
              }
            });
          }
          if ($state.params.portal) {
            vm.portalSelected = $state.params.portal;
            state.set('portalSelected', $state.params.portal);
          }
        });
        function save() {
          state.set('currentWorkSaved', true);
          var model = angular.copy($scope.item);
          pageUpdate.addOrder(model);
          pageUpdate.updateModel(model);
          return pageUpdate
            .update(state.get('pageSelected').sys_id, model)
            .then(function (response) {
              state.set('pageLoaded', true);
              return response;
            });
        }
        vm.saveAndRender = function () {
          save().then(function (response) {
            if (typeof response !== 'undefined') {
              $scope.$parent.item = angular.copy(config.layout);
              map.removeAll();
              page.render('container', response, $scope.$parent.item);
            }
          });
        };
        $scope.$on(events.save, vm.saveAndRender);
        vm.refreshAndRender = function () {};
        var updateInProgress = false;
        $scope.$on(events.refresh, function (e) {
          if (!updateInProgress) {
            updateInProgress = true;
            loadPage(state.get('pageSelected').id).then(function () {
              updateInProgress = false;
            });
          }
        });
        vm.open = function () {
          $window.open(
            utils.format(config.previewUri, {
              id: state.get('pageSelected').id,
              portal: state.get('portalSelected'),
            })
          );
        };
        vm.openPortalProperties = function () {
          var item = {};
          item.id = state.get('portalSelected');
          item.sys_id = state.get('portalId');
          item.type = 'portal';
          $rootScope.$broadcast(events.displayFormModal, item);
        };
        vm.openPageProperties = function () {
          var item = state.get('pageSelected');
          item.type = 'page';
          $rootScope.$broadcast(events.displayFormModal, item);
        };
        vm.changeDevice = function changeDevice(device) {
          $state.transitionTo(
            $state.current,
            {
              portal: vm.portalSelected,
              id: state.get('pageSelected').id,
              device: device,
            },
            { notify: false }
          );
          state.set('deviceSelected', device);
          vm.deviceSelected = device;
        };
      }
    );
})();
