/*! RESOURCE: /scripts/service-portal-designer/header/sub_header.ctrl.js */
(function () {
  'use strict';
  var mod = angular.module('spd_sub_header', []);
  mod.controller(
    'SubHeaderCtrl',
    function (
      $scope,
      $rootScope,
      map,
      state,
      editorManager,
      config,
      $modal,
      text,
      events
    ) {
      var vm = this;
      vm.options = config.leftMenuOptions;
      vm.selected = config.leftMenuSelectedOption;
      vm.title;
      $scope.$on(events.itemSelected, function (e, item) {
        vm.title = item.label ? item.label : item.type;
      });
      vm.updateSelected = function updateSelected(item) {
        vm.selected = item;
        state.set('leftMenuSelectedOption', item);
      };
      var modalScope = $rootScope.$new(true);
      var modalInstance = $modal({
        scope: modalScope,
        template: 'modal.html',
        show: false,
      });
      function removeElement(item) {
        var parent = editorManager.remove(item);
        $scope.selected(parent);
        $rootScope.$broadcast(events.save);
      }
      function remove(e, item) {
        text('Do you want to permanently delete the selected item?').then(
          function (title) {
            modalScope.title = title;
          }
        );
        modalScope.confirm = function () {
          removeElement(item || state.get('itemSelected'));
        };
        modalInstance.$promise.then(modalInstance.show);
      }
      $scope.$on(events.widgetRemove, remove);
      vm.remove = remove;
      vm.edit = function () {
        var item = state.get('itemSelected');
        $rootScope.$broadcast(events.displayFormModal, item);
      };
      vm.size_classes = [{ label: '-- Default --', value: undefined }];
      vm.containerTypes = config.containerTypes;
      _.times(config.columnMaxSize, function (x) {
        vm.size_classes.push({ label: x + 1, key: x + 1 });
      });
      vm.columnSize = vm.size_classes[0];
      vm.models = $scope.$parent.models;
      vm.columnTypes = config.columnTypes;
      vm.item = $scope.$parent.item;
      vm.rules = config.rules;
      function calculateSize(parent, max) {
        var pos = 0;
        var total = 0;
        _.forEach(parent[config.rules.row.content], function (column) {
          if (column.size_classes[config.columnDefaultType]) {
            total += column.size_classes[config.columnDefaultType];
          } else if (column.size_classes.sm) {
            total += column.size_classes.sm;
          }
        });
        if (total >= max) {
          return config.columnDefaultSize;
        } else {
          pos = max - total;
        }
        return vm.size_classes[pos].key;
      }
      vm.add = function add() {
        var item;
        var parent = state.get('itemSelected');
        if (parent.type === 'row' || parent.type == 'column') {
          item = angular.copy(config.column);
          if (parent.type === 'column') {
            parent = map.getParent(parent.id);
          }
          item.size_classes[config.columnDefaultType] = calculateSize(
            parent,
            config.columnMaxSize
          );
          map.setProps(item, parent);
          parent[config.rules.row.content].push(item);
        }
        if (parent.type == 'container') {
          parent = map.getParent(parent.id);
          item = angular.copy(config.container);
          map.setProps(item, parent);
          parent[config.rules.layout.content].push(item);
        }
        $scope.selected(item);
        $rootScope.$broadcast(events.save);
      };
    }
  );
})();
