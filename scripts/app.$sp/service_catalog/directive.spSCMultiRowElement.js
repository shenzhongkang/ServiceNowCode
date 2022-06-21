/*! RESOURCE: /scripts/app.$sp/service_catalog/directive.spSCMultiRowElement.js */
angular
  .module('sn.$sp')
  .directive(
    'spScMultiRowElement',
    function (
      $http,
      spModal,
      spUtil,
      i18n,
      $sce,
      spScUtil,
      cabrillo,
      spAriaUtil
    ) {
      'use strict';
      function getEmbeddedWidgetOptions(action, data) {
        var options = {
          embeddedWidgetId: 'sc-multi-row-active-row',
          embeddedWidgetOptions: {
            action: action,
            source_table: '',
            source_id: '',
            row_data: {},
            variable_set_id: '',
            variable_set_name: '',
            cat_item: '',
            native_mobile: '',
            parent: {},
          },
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          modalLabel: data.modalLabel,
        };
        for (var key in options.embeddedWidgetOptions) {
          if (typeof data[key] != 'undefined') {
            options.embeddedWidgetOptions[key] = data[key];
          }
        }
        return options;
      }
      function loadActiveRowWidget(action, data) {
        return $http({
          method: 'POST',
          url: spUtil.getWidgetURL('widget-modal'),
          headers: spUtil.getHeaders(),
          data: getEmbeddedWidgetOptions(action, data),
        });
      }
      function isValueEmpty(value) {
        return typeof value == 'undefined' || value == '';
      }
      var actions = {
        ADD_ROW: 'add',
        UPDATE_ROW: 'edit',
      };
      var catalogVariableTypes = {
        CHECK_BOX: '7',
      };
      return {
        restrict: 'E',
        templateUrl: 'sp_element_sc_multi_row.xml',
        controllerAs: 'c',
        scope: {
          field: '=',
          getGlideForm: '&glideForm',
          native: '=?',
          parentFields: '=',
        },
        controller: function ($scope) {
          var field = $scope.field;
          var g_form = $scope.getGlideForm();
          this.isMEE = cabrillo.isNative() && $scope.native;
          var canAdd = true;
          var parent = $scope.parentFields;
          this.addButtonAriaLabel = i18n.format(
            i18n.getMessage('Do you want to add a row for {0}'),
            field.label
          );
          function getActiveOptionsData() {
            return {
              variable_set_id: field.sys_id,
              variable_set_name: field.name,
              source_table: field.source_table,
              source_id: field.source_id,
              cat_item: field.cat_item,
              native_mobile: cabrillo.isNative() && $scope.native,
              parent: angular.copy(parent),
              modalLabel: field.label,
            };
          }
          $scope.$on(
            '$sp.sc_multi_row.create_row',
            function (evt, fieldId, itemId) {
              if (field.id == fieldId && field.cat_item == itemId)
                $scope.c.createRow();
            }
          );
          g_form.$private.events.on(
            'change',
            function (fieldName, oldValue, newValue) {
              if (fieldName !== field.name) {
                return;
              }
              if (field.skipOnChangeUpdate) {
                field.skipOnChangeUpdate = false;
                return;
              }
              field._value = isValueEmpty(newValue) ? [] : JSON.parse(newValue);
              if (field._value.length > 0) refreshMultiRowDisplayValue();
              else {
                field.displayValue = [];
                field._displayValue = '';
              }
            }
          );
          function refreshMultiRowDisplayValue() {
            field._loadingData = true;
            spScUtil
              .getDisplayValueForMultiRowSet(field.id, field.value)
              .then(function (response) {
                if (!response.data) return;
                field.displayValue = response.data.result;
                field._displayValue = JSON.parse(response.data.result);
                field._loadingData = false;
              });
          }
          function clearAllValue() {
            $scope.getGlideForm().setValue(field.name, '', '');
            $('#' + field.sys_id + '_add_row')
              .focus()
              .after(function () {
                sendLiveMessage(
                  i18n.getMessage('All rows have been deleted'),
                  500
                );
              });
          }
          this.clearValue = function () {
            var options = {
              title: i18n.getMessage(
                'Are you sure you want to delete all rows?'
              ),
              headerStyle: { border: 'none', 'padding-bottom': 0 },
              footerStyle: { border: 'none', 'padding-top': 0 },
              messageOnly: true,
              buttons: [
                { label: i18n.getMessage('Cancel'), primary: false },
                {
                  label: i18n.getMessage('Remove'),
                  class: 'btn-danger',
                  primary: true,
                },
              ],
            };
            if (this.isMEE) {
              if (confirm(options.title)) {
                clearAllValue();
              }
            } else {
              spModal.open(options).then(function (actionButton) {
                if (!actionButton.primary) return;
                clearAllValue();
              });
            }
          };
          this.createRow = function (evt) {
            var that = this;
            var activeRowWidget;
            canAdd = false;
            loadActiveRowWidget(actions.ADD_ROW, getActiveOptionsData()).then(
              function (response) {
                var activeRowWidget = response.data.result;
                var unregisterCancel = $scope.$on(
                  '$sp.sc_multi_row_active_row.cancel',
                  function (event, data) {
                    that.activeRow = '';
                    $('#' + field.sys_id + '_add_row')
                      .focus()
                      .after(function () {
                        sendLiveMessage(
                          i18n.getMessage('New row not added'),
                          500
                        );
                      });
                  }
                );
                var unregisterSave = $scope.$on(
                  '$sp.sc_multi_row_active_row.add',
                  function (event, data) {
                    that.activeRow = '';
                    var newVal = angular.copy(field._value) || [];
                    var newDisplayVal = angular.copy(field._displayValue) || [];
                    newVal.push(data.value);
                    newDisplayVal.push(data.display_value);
                    field.validated = true;
                    $scope
                      .getGlideForm()
                      .setValue(
                        field.name,
                        JSON.stringify(newVal),
                        JSON.stringify(newDisplayVal)
                      );
                    $('#' + field.sys_id + '_add_row')
                      .focus()
                      .after(function () {
                        sendLiveMessage(i18n.getMessage('New row added'), 500);
                      });
                  }
                );
                activeRowWidget.options.afterClose = function () {
                  unregisterSave();
                  unregisterCancel();
                };
                that.activeRow = activeRowWidget;
                canAdd = true;
              }
            );
          };
          this.updateRow = function (index) {
            var that = this;
            var activeRowWidget;
            var options = getActiveOptionsData();
            options.row_data = field._value[index];
            loadActiveRowWidget(actions.UPDATE_ROW, options).then(function (
              response
            ) {
              var activeRowWidget = response.data.result;
              var unregisterCancel = $scope.$on(
                '$sp.sc_multi_row_active_row.cancel',
                function (event, data) {
                  that.activeRow = '';
                  sendLiveMessage(i18n.getMessage('Row not updated'), 0);
                }
              );
              var unregister = $scope.$on(
                '$sp.sc_multi_row_active_row.update',
                function (event, data) {
                  that.activeRow = '';
                  var newVal = angular.copy(field._value) || [];
                  var newDisplayVal = angular.copy(field._displayValue) || [];
                  newVal[index] = data.value;
                  newDisplayVal[index] = data.display_value;
                  field._value[index] = angular.copy(data.value);
                  field._displayValue[index] = angular.copy(data.display_value);
                  field.validated = true;
                  $scope
                    .getGlideForm()
                    .setValue(
                      field.name,
                      JSON.stringify(newVal),
                      JSON.stringify(newDisplayVal)
                    );
                  sendLiveMessage(i18n.getMessage('Row has been updated'), 0);
                }
              );
              activeRowWidget.options.afterClose = function () {
                unregister();
                unregisterCancel();
              };
              that.activeRow = activeRowWidget;
            });
          };
          function deleteSelectedRow(index) {
            var newVal = angular.copy(field._value) || [];
            var newDisplayVal = angular.copy(field._displayValue) || [];
            newVal.splice(index, 1);
            newDisplayVal.splice(index, 1);
            field.validated = true;
            if (newVal.length !== 0) {
              $scope
                .getGlideForm()
                .setValue(
                  field.name,
                  JSON.stringify(newVal),
                  JSON.stringify(newDisplayVal)
                );
              var newFocusIdx = index === newVal.length ? index - 1 : index;
              $('#remove-row-' + newFocusIdx)
                .focus()
                .after(function () {
                  sendLiveMessage(i18n.getMessage('Row has been deleted'), 500);
                });
            } else {
              $scope.getGlideForm().setValue(field.name, '', '');
              $('#' + field.sys_id + '_add_row')
                .focus()
                .after(function () {
                  sendLiveMessage(i18n.getMessage('Row has been deleted'), 500);
                });
            }
          }
          this.deleteRow = function (index) {
            var options = {
              title: i18n.getMessage(
                'Are you sure you want to delete the row?'
              ),
              headerStyle: { border: 'none', 'padding-bottom': 0 },
              footerStyle: { border: 'none', 'padding-top': 0 },
              messageOnly: true,
              buttons: [
                { label: i18n.getMessage('Cancel'), primary: false },
                {
                  label: i18n.getMessage('Remove'),
                  class: 'btn-danger',
                  primary: true,
                },
              ],
            };
            if (this.isMEE) {
              if (confirm(options.title)) {
                deleteSelectedRow(index);
              }
            } else {
              spModal.open(options).then(function (actionButton) {
                if (!actionButton.primary) return;
                deleteSelectedRow(index);
              });
            }
          };
          this.canDelete = function () {
            return true;
          };
          this.canInsert = function () {
            if (canAdd && field._value.length < field.max_rows_size)
              return true;
            return false;
          };
          this.canClearValue = function () {
            return this.canDelete() && field._value && field._value.length > 0;
          };
          this.getCellDisplayValue = function (displayValue, fieldType) {
            if (fieldType == catalogVariableTypes.CHECK_BOX)
              return '' + displayValue;
            return $sce.trustAsHtml(displayValue);
          };
          function sendLiveMessage(message, timeout) {
            if (!message) return;
            if (!timeout) timeout = 0;
            setTimeout(function () {
              spAriaUtil.sendLiveMessage(message);
            }, timeout);
          }
        },
        link: function (scope, element, attrs, ctrl) {
          var field = scope.field;
          if (typeof field.value != 'undefined' && Array.isArray(field.value))
            field.value = JSON.stringify(field.value);
          if (
            typeof field.displayValue != 'undefined' &&
            Array.isArray(field.displayValue)
          )
            field.displayValue = JSON.stringify(field.displayValue);
          if (typeof field._value == 'undefined')
            field._value = isValueEmpty(field.value)
              ? []
              : JSON.parse(field.value);
          if (typeof field._displayValue == 'undefined')
            field._displayValue = isValueEmpty(field.displayValue)
              ? []
              : JSON.parse(field.displayValue);
          scope.field._loadingData = false;
        },
      };
    }
  );
