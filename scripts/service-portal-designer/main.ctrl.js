/*! RESOURCE: /scripts/service-portal-designer/main.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_main', [])
    .controller(
      'MainCtrl',
      function (
        $scope,
        map,
        config,
        editorManager,
        $rootScope,
        state,
        $state,
        text,
        events,
        $modal,
        $document,
        $timeout,
        tinymceService
      ) {
        var vm = this;
        vm.txt = text;
        vm.pageSelected = null;
        vm.portalSelected = null;
        state.onChange('pageSelected').update(vm);
        state.onChange('portalSelected').update(vm);
        state.onChange('itemSelected').update(vm);
        tinymceService.loadTinymceAsync();
        vm.pageInfo = {};
        state.onChange('pageInfo').update(vm);
        vm.state = $state;
        $scope.item = angular.copy(config.layout);
        if (debug) {
          debug.getModel = function () {
            return $scope.item;
          };
          debug.state = $state;
        }
        vm.deselect = function deselect() {
          state.set('itemSelected', false);
        };
        function removeCurrentSelected() {
          var itemSelected = state.get('itemSelected');
          var parent = editorManager.remove(itemSelected);
          $scope.selected(parent);
          $rootScope.$broadcast(events.save);
        }
        $document.on('keydown', function (e) {
          if (e.keyCode == 83) {
            if (e.metaKey || e.ctrlKey) {
              e.stopPropagation();
              e.preventDefault();
              $rootScope.$broadcast('$sp.save', e);
            }
          }
          if (e.target.type !== 'textarea' && e.target.type !== 'text') {
            if (e.which === config.key_delete) {
              if (state.get('itemSelected') && !state.get('formModalOpen')) {
                $modal({ scope: $scope, template: 'modal.html', show: true });
                text(
                  'Do you want to permanently delete the selected item?'
                ).then(function (title) {
                  $scope.title = title;
                });
                $scope.confirm = removeCurrentSelected;
              }
              e.preventDefault();
            }
          }
        });
        vm.breadcrumbSelected = function ($event, item) {
          $event.preventDefault();
          $scope.selected(item);
        };
        $scope.breadcrumb = [];
        $scope.models = {
          columns: editorManager.getRowsAndColumns(),
        };
        function buildBreadCrumbs(item) {
          var parent = map.getParent(item.id);
          if (parent && parent.type !== 'layout') {
            $scope.breadcrumb.unshift(parent);
            buildBreadCrumbs(parent);
          }
          $rootScope.$broadcast(events.itemSelected, item);
        }
        $scope.selected = function selected(item) {
          state.set('itemSelected', item.type !== 'layout' ? item : false);
          if (item.sys_id) {
            $state.go(
              'editor',
              { sysId: item.sys_id },
              { location: true, notify: false }
            );
          }
          $timeout(function () {
            $scope.breadcrumb = [];
            if (item.type !== 'layout') {
              $scope.breadcrumb.push(item);
            }
            buildBreadCrumbs(item);
          });
        };
        $scope.$on(events.itemSelect, function (e, item) {
          $scope.selected(item);
        });
      }
    );
})();
