/*! RESOURCE: /scripts/service-portal-designer/editor/editor.ctrl.js */
(function () {
  'use strict';
  angular
    .module('spd_editor', [])
    .controller(
      'EditorCtrl',
      function (
        $rootScope,
        $scope,
        $state,
        $timeout,
        state,
        map,
        editorManager,
        config,
        widget,
        utils,
        text,
        events,
        spUtil
      ) {
        var vm = this;
        state.onChange('pageLoaded').update(vm);
        vm.columnDefaultType = config.columnDefaultType;
        vm.pageLoaded = true;
        vm.rules = config.rules;
        vm.themeName = config.themeName;
        vm.allowedTypes = function allowedTypes(item) {
          var types = config.rules[item.type].allowedTypes;
          if (item.type === 'column') {
            if (item[config.rules[item.type].content].length > 0) {
              return [item[config.rules[item.type].content][0].type];
            }
          }
          return types;
        };
        vm.getUlClass = function getUlClass(item) {
          var styles = ['drop-zone'];
          var content = item[vm.rules[item.type].content];
          if (content.length === 0) styles.push('empty');
          if (item.width) {
            styles.push(item.width);
          } else {
            if (content.length > 0 && content[0].type == 'column')
              styles.push('row');
            else styles.push(vm.rules[item.type].ul);
          }
          return styles;
        };
        vm.getClass = function getClass(item, parent) {
          var styles = ['item'];
          if (state.get('itemSelected') === item) styles.push('selected');
          if (item.type === 'widget') styles.push('widget-item');
          else styles.push(config.rules[parent.type].li);
          if (item.class_name) styles.push(item.class_name);
          _.forEach(item.size_classes, function (size, type) {
            styles.push(
              utils.format(config.columnSizeTpl, { size: size, type: type })
            );
          });
          return styles.join(' ');
        };
        vm.positionChanged = function positionChanged(item) {
          editorManager.remove(item, true);
          state.set('currentWorkSaved', false);
        };
        vm.addRowWithColumns = function addRowWithColumns(e, container, row) {
          var item = angular.copy(row);
          map.setParent(item, container);
          container[config.rules.container.content].push(item);
          state.set('currentWorkSaved', false);
          container.plusButton = false;
          $scope.selected(item[config.rules.row.content][0]);
          e.stopPropagation();
          $rootScope.$broadcast(events.save);
        };
        vm.inserted = function dropped(item, parent) {
          if (parent.type == 'layout') {
            parent = $scope.item;
          }
          map.setParent(item, parent);
          if (parent.type === 'container') {
            parent.plusButton = false;
          }
          $scope.selected(item);
          $timeout(function () {
            $rootScope.$broadcast(events.save);
          }, 150);
        };
        vm.isFixed = function isFixed(item) {
          if (_.includes(config.fixedItems, item.type)) return true;
          return false;
        };
        vm.parseJSON = function parseJSON(content) {
          if (content) {
            return JSON.parse(content);
          }
        };
        $scope.$on(events.widgetFieldUpdated, function (e, name, value) {
          vm.update(name, value);
        });
        function displayFormModal(e, item) {
          var input = {
            table: item.type === 'widget' ? 'sp_instance' : 'sp_' + item.type,
            sys_id: item.sys_id,
            hideRelatedLists: true,
          };
          spUtil.get('widget-options-config', input).then(function (widget) {
            var myModalCtrl = null;
            widget.options.afterClose = function () {
              vm.widgetEditModal = null;
              state.set('formModalOpen', false);
            };
            widget.options.afterOpen = function (modalCtrl) {
              myModalCtrl = modalCtrl;
              state.set('formModalOpen', true);
            };
            vm.widgetEditModal = widget;
            var unregister = $scope.$on(
              'sp.form.record.updated',
              function (evt, fields, savedFormSysId) {
                if (item.sys_id !== savedFormSysId) return;
                if (
                  item.type === 'page' &&
                  fields.id &&
                  fields.id.value !== item.id
                ) {
                  $state.go('editor', { id: fields.id.value });
                } else if (
                  item.type === 'portal' &&
                  fields.url_suffix &&
                  fields.url_suffix.value !== state.get('portalSelected')
                ) {
                  state.set('portalSelected', fields.url_suffix.value);
                  $state.go('editor', { portal: fields.url_suffix.value });
                } else {
                  $rootScope.$broadcast(events.refresh);
                }
                unregister();
                unregister = null;
                myModalCtrl.close();
              }
            );
          });
        }
        $scope.$on(events.displayFormModal, displayFormModal);
        vm.widgetEditModal = null;
      }
    );
})();
