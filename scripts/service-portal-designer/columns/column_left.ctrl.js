/*! RESOURCE: /scripts/service-portal-designer/columns/column_left.ctrl.js */
(function () {
  'use strict';
  var mod = angular.module('spd_column_left', []);
  mod.controller(
    'ColumnLeftCtrl',
    function (state, $state, editorManager, config, widget, text, page) {
      var vm = this;
      vm.leftMenuSelectedOption = config.leftMenuSelectedOption;
      vm.columnDefaultType = config.columnDefaultType;
      vm.filterWidget = '';
      vm.pageList = null;
      vm.rules = config.rules;
      state.onChange('leftMenuSelectedOption').update(vm);
      vm.model = {
        layouts: editorManager.getRowsAndColumns(),
      };
      text('Loading...').then(function (message) {
        vm.model.widgets = [{ label: message }];
      });
      widget.getList().then(function (widgetList) {
        vm.model.widgets = widgetList;
      });
      page.getList().then(function (data) {
        vm.pageList = data;
      });
      state.onChange('pageList').update(vm);
      vm.model.layouts.unshift(angular.copy(config.container));
      vm.draggedToEditor = function (item) {
        if (item.type !== 'widget') {
          state.set('currentWorkSaved', false);
        }
      };
      vm.editWidget = widget.edit;
      vm.pageChanged = function pageChanged(item) {
        $state.go('editor', { id: item.id });
        state.set('pageSelected', item.sys_id);
      };
    }
  );
})();
