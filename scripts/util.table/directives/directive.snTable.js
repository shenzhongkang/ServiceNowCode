/*! RESOURCE: /scripts/util.table/directives/directive.snTable.js */
angular.module('sn.table').directive('snTable', [
  '$filter',
  '$http',
  'i18n',
  'snTableCommon',
  'snTableRepository',
  '$window',
  '$timeout',
  '$document',
  'SNTABLECONSTANTS',
  'trapFocusInModal',
  function (
    $filter,
    $http,
    i18n,
    snTableCommon,
    snTableRepository,
    $window,
    $timeout,
    $document,
    CONSTANTS,
    trapFocusInModal
  ) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      scope: {
        config: '=config',
        columns: '=?columns',
        rows: '=?rows',
      },
      templateUrl:
        '/angular.do?sysparm_type=get_partial&name=ui_cmdb_directive_sn_table.xml',
      controller: function ($scope, $rootScope) {
        var loading = false;
        var readOnlyVal = '';
        var _focusTrap = null;
        if (!$scope.columns) $scope.columns = [];
        if (!$scope.rows) $scope.rows = [];
        $scope.allowInlineEdit = angular.isDefined(
          $scope.config.allowInlineEdit
        )
          ? $scope.config.allowInlineEdit
          : false;
        $scope.allowInlineInsert = angular.isDefined(
          $scope.config.allowInlineInsert
        )
          ? $scope.config.allowInlineInsert
          : false;
        $scope.editWindowOpen = false;
        $scope.editInput = '';
        $scope.savingInlineEdit = false;
        $scope.openWindow = null;
        $scope.config.targetRow = 1;
        if (!$scope.config.rowsPerPage) $scope.config.rowsPerPage = 20;
        if (!$scope.config.availableRows) $scope.config.availableRows = 0;
        $scope._allColumns = $scope.columns;
        $scope._rows = $scope.rows;
        $scope._groups = [];
        $scope._columns = $scope.columns;
        $scope.$watch('config.table', loadTable);
        $scope.$watch('config.query', loadRows);
        $scope.$on(
          'manage_columns_internal',
          snTableCommon.consumeEvent(function (event) {
            $scope.$broadcast('manage_columns');
          })
        );
        $scope.$on(
          'force_update_table',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, true, config)) return;
            applyFilters();
          })
        );
        $scope.$on(
          'force_refresh_data',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, true, config)) return;
            if (!$scope.config.table) {
              applyFilters();
              return;
            }
            loading = true;
            var promise = snTableRepository.getRows(
              $scope.config,
              $scope._columns
            );
            if (promise) {
              promise.then(function (data) {
                $scope.rows = data.result;
                applyFilters();
                $rootScope.$broadcast('table-force-refresh-data-complete', {
                  tableScope: $scope,
                });
                loading = false;
              });
            }
          })
        );
        $scope.$on('edit-window-open', function (event, data) {
          if (data && !$scope.savingInlineEdit) {
            $scope.editWindowPosition = data.position;
            $scope.editData = {
              row: data.row,
              column: data.column,
              inlineInsert: data.inlineInsert,
              inlineInsertRowIndex: data.inlineInsertRowIndex,
              addingRowsLength: data.addingRowsLength,
              canBeEdited: true,
              oldValue: data.row[data.column.name],
            };
            if (
              $scope.config.editableColumns &&
              $scope.config.editableColumns.length > 0
            ) {
              if (
                $scope.config.editableColumns.indexOf(data.column.name) === -1
              ) {
                $scope.editData.canBeEdited = false;
              }
            }
            if (
              ($scope.config.disabledColumns &&
                $scope.config.disabledColumns.length > 0 &&
                $scope.config.disabledColumns.indexOf(data.column.name) > -1) ||
              ($scope.config.disallowEditingColumn &&
                $scope.config.disallowEditingColumn(data.column, data.row))
            ) {
              $scope.editData.canBeEdited = false;
            }
            if ($scope.isBooleanField()) {
              $scope.booleanEditField = data.row[data.column.name];
            } else
              $scope.editInput = snTableCommon.getDisplayValue(
                data.row,
                data.column,
                $scope.config,
                data.inlineInsert
              );
            $scope.editWindowOpen = true;
            var ref = null;
            if ($scope.config.referenceConfig)
              ref =
                $scope.config.referenceConfig[$scope.editData.column.reference];
            if ($scope.editData.column.type === 'reference' && ref) {
              $scope.reference = {
                ed: {
                  reference: $scope.editData.column.reference,
                  searchField: ref.displayValue,
                },
                field: {
                  value: $scope.editData.oldValue.display_value,
                  displayValue: $scope.editData.oldValue.display_value,
                },
                options: { placeholder: i18n.getMessage('empty.reference') },
              };
            } else if ($scope.editData.column.type === 'reference') {
              $scope.reference = {
                ed: { reference: $scope.editData.column.reference },
                field: {
                  value: $scope.editData.oldValue.display_value,
                  displayValue: $scope.editData.oldValue.display_value,
                },
                options: { placeholder: i18n.getMessage('empty.reference') },
              };
            }
            $timeout(function () {
              var isReadOnly = $scope.showReadOnlyEditWindow();
              readOnlyVal = isReadOnly ? 'readonly' : 'editable';
              $scope.selector =
                '#cmdb-cell-edit-window-' + $scope.$id + '-' + readOnlyVal;
              if ($scope.isBooleanField() && !isReadOnly) {
                angular
                  .element(
                    '#cmdb-cell-edit-window-' +
                      $scope.$id +
                      '-' +
                      readOnlyVal +
                      ' select'
                  )
                  .focus();
              } else {
                if ($scope.isBooleanField() && isReadOnly)
                  $scope.editInput = angular.copy($scope.booleanEditField);
                $scope.selector += ' input';
                angular.element($scope.selector).focus();
              }
              angular.element($scope.selector).on('keydown', function (e) {
                if (e.keyCode === CONSTANTS.KEY_CODES.ENTER_KEY) {
                  $scope.confirmEdit();
                }
                if (e.keyCode === CONSTANTS.KEY_CODES.ESCAPE_KEY) {
                  $scope.closeEditWindow();
                }
              });
            });
          }
        });
        $scope.$on('sn_table_remove_row', function (event, data) {
          if (data.inlineInsert) {
            $rootScope.$broadcast('sn_table_remove_inline_insert_row', data);
          } else {
            var index = $scope._rows.indexOf(data.row);
            if (index > -1) {
              $scope._rows.splice(index, 1);
            }
          }
        });
        $scope.$on('sn_table_commit_insert_manually', function (event, data) {
          if (data.row) {
            snTableRepository.commitNewRow(data.row, $scope.config).then(
              function (result) {
                for (var key in data.row) {
                  data.row[key] = result[key];
                }
                data.row.sys_id = result.sys_id;
                data.row.hasBeenCommited = true;
                $rootScope.$broadcast(
                  'sn_table_commit_insert_manually_complete',
                  {
                    status: 'success',
                    row: data.row,
                    rowIndex: data.rowIndex,
                  }
                );
              },
              function (result) {
                if (result && result.error && result.error.detail) {
                  $rootScope.$broadcast('notify_error', {
                    message: result.error.detail,
                  });
                }
                $rootScope.$broadcast(
                  'sn_table_commit_insert_manually_complete',
                  {
                    status: 'failure',
                    row: data.row,
                    rowIndex: data.rowIndex,
                  }
                );
              }
            );
          }
        });
        $scope.confirmEdit = function () {
          var field = $scope.editData.row[$scope.editData.column.name];
          var targetValue = $scope.isBooleanField()
            ? $scope.booleanEditField
            : $scope.editInput;
          var columnName = $scope.editData.column.name;
          var valid = true;
          $scope.savingInlineEdit = true;
          if ($scope.config.validateInlineEditInsert) {
            valid = $scope.config.validateInlineEditInsert({
              row: $scope.editData.row,
              column: $scope.editData.column,
              field: field,
              targetValue: targetValue,
              oldValue: $scope.editData.oldValue,
              referenceValue: $scope.editData.referenceValue,
              inlineInsert: $scope.editData.inlineInsert,
              inlineInsertRowIndex: $scope.editData.inlineInsertRowIndex,
              addingRowsLength: $scope.editData.addingRowsLength,
              canBeEdited: $scope.editData.canBeEdited,
            });
          }
          if (valid) {
            if (!$scope.editData.column.skipServiceCall) {
              if ($scope.editData.row.sys_id) {
                var editingData = {};
                editingData[columnName] = targetValue;
                if ($scope.editData.canBeEdited) {
                  if (
                    !$scope.config.manuallyCommitInserts ||
                    $scope.editData.row.hasBeenCommited ||
                    !$scope.editData.inlineInsert
                  ) {
                    snTableRepository
                      .updateRow(
                        $scope.editData.row,
                        $scope.config,
                        editingData
                      )
                      .then(
                        function (result) {
                          finishConfirmEdit(field, targetValue, true);
                        },
                        function (result) {
                          if (result && result.error && result.error.detail) {
                            $rootScope.$broadcast('notify_error', {
                              message: result.error.detail,
                            });
                          }
                          finishConfirmEdit(field, targetValue, false);
                        }
                      );
                  } else {
                    finishConfirmEdit(field, targetValue, true);
                  }
                } else {
                  finishConfirmEdit(field, targetValue, true);
                }
              } else {
                updateEditData(field, targetValue);
                if ($scope.editData.canBeEdited) {
                  if (
                    !$scope.config.manuallyCommitInserts ||
                    $scope.editData.row.hasBeenCommited ||
                    !$scope.editData.inlineInsert
                  ) {
                    snTableRepository
                      .commitNewRow($scope.editData.row, $scope.config)
                      .then(
                        function (result) {
                          for (var key in $scope.editData.row) {
                            $scope.editData.row[key] = result[key];
                          }
                          $scope.editData.row.sys_id = result.sys_id;
                          $scope.editData.row.hasBeenCommited = true;
                          finishConfirmEdit(field, targetValue, true);
                        },
                        function (result) {
                          if (result && result.error && result.error.detail) {
                            $rootScope.$broadcast('notify_error', {
                              message: result.error.detail,
                            });
                          }
                          finishConfirmEdit(field, targetValue, false);
                        }
                      );
                  } else {
                    finishConfirmEdit(field, targetValue, true);
                  }
                } else {
                  finishConfirmEdit(field, targetValue, true);
                }
              }
            } else {
              finishConfirmEdit(field, targetValue, true);
            }
          } else {
            finishConfirmEdit(field, targetValue, false);
          }
          trapFocusInModal.deactivateFocusTrap(_focusTrap, false);
          _focusTrap = null;
        };
        $scope.allowEditWindow = function () {
          return (
            $scope.allowInlineEdit &&
            $scope.editWindowOpen &&
            $scope.editData.canBeEdited
          );
        };
        $scope.showReadOnlyEditWindow = function () {
          return (
            $scope.allowInlineEdit &&
            $scope.editWindowOpen &&
            !$scope.editData.canBeEdited
          );
        };
        $scope.$watch('editWindowOpen', function (newVal, oldVal) {
          if (newVal === false && $scope.reference && $scope.reference.field) {
            $scope.reference.field.value = null;
            $scope.reference.field.displayValue = null;
          }
          if (newVal !== undefined && newVal) {
            $timeout(function () {
              var element;
              if ($scope.allowEditWindow())
                element = angular.element(
                  '#cmdb-cell-edit-window-' + $scope.$id + '-editable'
                );
              else if ($scope.showReadOnlyEditWindow())
                element = angular.element(
                  '#cmdb-cell-edit-window-' + $scope.$id + '-readonly'
                );
              _focusTrap = trapFocusInModal.activateFocusTrap(
                element,
                _focusTrap
              );
            });
          }
        });
        $scope.searchReference = function () {
          if (!$scope.editData.column.reference) {
            var field = $scope.editData.row[$scope.editData.column.name];
            var parts = field.link.split('/');
            var table = parts[parts.length - 1].split('?')[0];
          } else {
            var table = $scope.editData.column.reference;
          }
          var refTable = $scope.config.table || $scope.config.refTable;
          var targetValue = $scope.editData.row[$scope.editData.column.name]
            .display_value
            ? $scope.editData.row[
                $scope.editData.column.name
              ].display_value.toLowerCase()
            : '';
          var tmpRefListPick = $window.reflistPick;
          $window.reflistPick = function (elementName, value, display) {
            $timeout(function () {
              $scope.editData.referenceValue = value;
              $scope.editInput = display;
            });
            $scope.openWindow.close();
            $scope.openWindow = null;
            if (tmpRefListPick) {
              $window.reflistPick = tmpRefListPick;
            }
          };
          $scope.openWindow = $window.open(
            '/' +
              table +
              '_list.do?sysparm_target=' +
              refTable +
              '.' +
              $scope.editData.column.name +
              '&sysparm_target_value=' +
              targetValue +
              '&sysparm_nameofstack=reflist&sysparm_clear_stack=true&sysparm_element=' +
              $scope.editData.column.name +
              '&sysparm_reference=' +
              table +
              '&sysparm_view=sys_ref_list&sysparm_additional_qual=&sys_uniqueValue=' +
              $scope.editData.row.sys_id +
              '&sys_target=' +
              refTable +
              '&sysparm_list_edit_ref_qual_tag=&sysparm_domain_restore=false',
            '',
            'width=800,height=500'
          );
        };
        $scope.refSelected = function (e) {
          var fields =
            $scope.config.referenceConfig[$scope.editData.column.reference];
          if (e.added && e.added[fields.value]) {
            $scope.editData.referenceValue = e.added[fields.value];
            $scope.editInput = e.added[fields.displayValue];
          } else {
            $scope.editData.referenceValue = null;
            $scope.editInput = '';
            $scope.editData.row[$scope.editData.column.name].value = '';
          }
        };
        $scope.isReferenceField = function () {
          if ($scope.editData) return $scope.editData.column.is_reference;
          return false;
        };
        $scope.showReferenceSearch = function () {
          return !$scope.config.useReferencePicker && $scope.isReferenceField();
        };
        $scope.isBooleanField = function () {
          if ($scope.editData) return $scope.editData.column.type === 'boolean';
          return false;
        };
        $scope.showReferenceField = function () {
          return (
            $scope.config.useReferencePicker &&
            !$scope.isBooleanField() &&
            $scope.isReferenceField()
          );
        };
        $scope.showTextField = function () {
          return !$scope.isBooleanField() && !$scope.isReferenceField();
        };
        $scope.getPosition = function () {
          var refFix = 0;
          if ($scope.config.useReferencePicker && $scope.isReferenceField())
            refFix = 2;
          if ($scope.editWindowPosition) {
            return {
              top: $scope.editWindowPosition.top + refFix + 'px',
              left: angular.isDefined($scope.editWindowPosition.left)
                ? $scope.editWindowPosition.left + 'px'
                : undefined,
              right: angular.isDefined($scope.editWindowPosition.right)
                ? $scope.editWindowPosition.right + 'px'
                : undefined,
            };
          }
        };
        $scope.closeEditWindow = function (event) {
          if (event && event.stopImmediatePropagation) {
            event.stopImmediatePropagation();
          }
          $scope.editInput = '';
          $scope.editWindowOpen = false;
          inlineEditFocusField(true);
          trapFocusInModal.deactivateFocusTrap(_focusTrap, false);
          _focusTrap = null;
        };
        $scope.showRows = function () {
          return !$scope.config.groupBy;
        };
        $scope.showGroups = function (group) {
          return $scope.config.groupBy !== undefined;
        };
        $scope.inlineEditInsert = function () {
          return $scope.allowInlineInsert;
        };
        $scope.getAllColumns = function () {
          if ($scope.config.table !== undefined) return $scope._allColumns;
          return $scope.columns;
        };
        $scope.getTableClasses = function () {
          return {
            'table-condensed': $scope.config.condensed,
          };
        };
        $scope.getLoadingStyle = function () {
          return {
            opacity: loading ? 0.5 : 1,
            'pointer-events': loading ? 'none' : 'all',
            transition: 'opacity 0.25s ease',
          };
        };
        applyFilters();
        function loadTable() {
          if (!$scope.config.table) return;
          var promise = loadColumns();
          if (promise) promise.then(loadRows);
        }
        function loadColumns() {
          var promise = snTableRepository.getColumns($scope.config);
          if (promise) {
            loading = true;
            return promise.then(function (response) {
              if (!$scope.config.sortBy && !$scope.config.sort) {
                $scope.config.sortBy = response.sorting.sort_by;
                $scope.config.sort = response.sorting.sort;
                for (var i = 0; i < response.active.length; i++) {
                  if (response.active[i].name === $scope.config.sortBy)
                    response.active[i].sort = $scope.config.sort;
                }
              }
              $scope.columns = response.active;
              $scope._columns = $filter('snTableColumnFilter')($scope.columns);
              $scope._allColumns = response.all;
              for (var i = 0; i < $scope.columns.length; i++) {
                if ($scope.columns[i].name === $scope.config.sortBy) {
                  $scope.columns[i].sort = $scope.config.sort;
                  break;
                }
              }
              loading = false;
              $rootScope.$broadcast('table-retrieved-columns', {
                tableScope: $scope,
              });
            });
          }
          return false;
        }
        function loadRows() {
          var promise = snTableRepository.getRows(
            $scope.config,
            $scope._columns
          );
          if (promise) {
            loading = true;
            return promise.then(function (data) {
              $scope.rows = data.result;
              applyFilters();
              loading = false;
              $rootScope.$broadcast('table-retrieved-rows', {
                tableScope: $scope,
              });
            });
          }
          return false;
        }
        function getColumnList() {
          var columns = '';
          for (var i = 0; i < $scope.columns.length; i++)
            columns += $scope.columns[i].name + ',';
          return columns + 'sys_id';
        }
        function applyFilters() {
          $scope._rows = $filter('snTableRowFilter')(
            $scope.rows,
            $scope.config,
            $scope.columns
          );
          $scope._groups = $filter('snTableGroupFilter')(
            $scope._rows,
            $scope.config,
            $scope.columns
          );
          $scope._columns = $filter('snTableColumnFilter')($scope.columns);
          snTableCommon.updateVisibleRows(
            $scope._rows,
            $scope._groups,
            $scope.config
          );
          if (!$scope.config.selectSingle || !$scope.config.selection) {
            snTableCommon.updateSelection(
              $scope.config.visibleRows,
              $scope.config
            );
            snTableCommon.updateAllSelected($scope.config);
          }
        }
        function finishConfirmEdit(field, targetValue, passed) {
          if ($scope.isBooleanField()) targetValue = $scope.booleanEditField;
          if (passed) {
            updateEditData(field, targetValue);
            $rootScope.$broadcast('table-confirm-edit-success', {
              row: $scope.editData.row,
              column: $scope.editData.column,
              field: field,
              targetValue: targetValue,
              oldValue: $scope.editData.oldValue,
              referenceValue: $scope.editData.referenceValue,
              inlineInsert: $scope.editData.inlineInsert,
              inlineInsertRowIndex: $scope.editData.inlineInsertRowIndex,
              addingRowsLength: $scope.editData.addingRowsLength,
            });
          } else {
            $rootScope.$broadcast('table-confirm-edit-failure', {
              row: $scope.editData.row,
              column: $scope.editData.column,
              field: field,
              targetValue: targetValue,
              oldValue: $scope.editData.oldValue,
              referenceValue: $scope.editData.referenceValue,
              inlineInsert: $scope.editData.inlineInsert,
              inlineInsertRowIndex: $scope.editData.inlineInsertRowIndex,
              addingRowsLength: $scope.editData.addingRowsLength,
            });
          }
          inlineEditFocusField();
          $scope.editInput = '';
          $scope.booleanEditField = 'true';
          $scope.editWindowOpen = false;
          $scope.savingInlineEdit = false;
        }
        function updateEditData(field, targetValue) {
          if (angular.isObject(field)) {
            if (field.display_value)
              $scope.editData.row[$scope.editData.column.name].display_value =
                targetValue;
            if (field.name)
              $scope.editData.row[$scope.editData.column.name].name =
                targetValue;
            if (field.label)
              $scope.editData.row[$scope.editData.column.name].label =
                targetValue;
          } else $scope.editData.row[$scope.editData.column.name] = targetValue;
        }
        function inlineEditFocusField(fromEscape) {
          angular.element($scope.selector).off('keydown');
          $timeout(function () {
            var selector =
              '#' + $scope.editData.row.sys_id + $scope.editData.column.sys_id;
            if (
              $scope.editData.inlineInsert &&
              angular.isUndefined($scope.editData.inlineInsertRowIndex) &&
              angular.isDefined($scope.editData.addingRowsLength) &&
              !fromEscape
            ) {
              $timeout(function () {
                selector =
                  '#adding-row-' +
                  $scope.editData.addingRowsLength +
                  '-' +
                  $scope.editData.column.sys_id;
                var cellElement = angular.element(selector);
                cellElement.focus();
              });
            } else if (
              $scope.editData.inlineInsert &&
              angular.isUndefined($scope.editData.inlineInsertRowIndex)
            ) {
              selector = '#inline-insert-' + $scope.editData.column.sys_id;
            } else if (
              $scope.editData.inlineInsert &&
              angular.isDefined($scope.editData.inlineInsertRowIndex)
            ) {
              selector =
                '#adding-row-' +
                $scope.editData.inlineInsertRowIndex +
                '-' +
                $scope.editData.column.sys_id;
            }
            var cellElement = angular.element(selector);
            cellElement.focus();
          });
        }
      },
    };
  },
]);