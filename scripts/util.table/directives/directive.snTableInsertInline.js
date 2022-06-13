/*! RESOURCE: /scripts/util.table/directives/directive.snTableInsertInline.js */
angular.module('sn.table').directive('snTableInsertInline', [
  '$timeout',
  'snTableCommon',
  'i18n',
  'snTableRepository',
  'SNTABLECONSTANTS',
  function ($timeout, snTableCommon, i18n, snTableRepository, CONSTANTS) {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      scope: {
        rows: '=rows',
        columns: '=columns',
        config: '=config',
      },
      templateUrl:
        '/angular.do?sysparm_type=get_partial&name=ui_cmdb_directive_sn_table_inline_insert.xml',
      controller: function ($scope, $rootScope) {
        $scope.addingRows = [];
        $scope.committingAllRows = false;
        $scope.committingIndex = -1;
        $scope.inlineInsert = function (column, row, rowIndex) {
          var selector = row
            ? '#adding-row-' + rowIndex + '-' + column.sys_id
            : '#inline-insert-' + column.sys_id;
          var cellElement = angular.element(selector);
          var insertRow = row;
          if (!insertRow) {
            insertRow = {};
            for (var i = 0; i < $scope.columns.length; i++) {
              insertRow[$scope.columns[i].name] = '';
            }
          }
          var position = getEditPopoverPosition(cellElement[0]);
          var data = {
            position: position,
            column: column,
            row: insertRow,
            inlineInsert: true,
            inlineInsertRowIndex: rowIndex,
            addingRowsLength: $scope.addingRows.length,
          };
          $rootScope.$broadcast('edit-window-open', data);
        };
        $scope.addingRowKeydown = function (e, column, row, rowIndex) {
          if (e.keyCode === CONSTANTS.KEY_CODES.ENTER_KEY) {
            $scope.inlineInsert(column, row, rowIndex);
          }
        };
        $scope.inlineInsertKeydown = function (e, column) {
          if (e.keyCode === CONSTANTS.KEY_CODES.ENTER_KEY) {
            $scope.inlineInsert(column);
          }
        };
        $scope.addAdditionalInsertColumn = function () {
          return (
            snTableCommon.hasOpenColumn($scope.config) &&
            snTableCommon.hasSelectColumn($scope.config)
          );
        };
        $scope.commitAddingRow = function (row, rowIndex) {
          var sendRow = angular.copy(row);
          if ($scope.config.getManualCommitObject) {
            sendRow = $scope.config.getManualCommitObject(row);
          }
          $rootScope.$broadcast('sn_table_commit_insert_manually', {
            row: sendRow,
            rowIndex: rowIndex,
          });
        };
        $scope.showCommitRowButton = function (row) {
          if ($scope.config.getManualCommitObject && !row.hasBeenCommited)
            return true;
          return false;
        };
        $rootScope.$on('table-confirm-edit-success', function (e, attrs) {
          if (
            attrs.inlineInsert === true &&
            attrs.inlineInsertRowIndex === undefined &&
            !attrs.ignoreInlineInsert
          ) {
            $scope.addingRows.push(attrs.row);
          }
        });
        $rootScope.$on('sn_table_first_page', clearAddingRows);
        $rootScope.$on('sn_table_previous_page', clearAddingRows);
        $rootScope.$on('sn_table_next_page', clearAddingRows);
        $rootScope.$on('sn_table_last_page', clearAddingRows);
        $rootScope.$on('sn_table_go_to', clearAddingRows);
        $rootScope.$on('sn_table_updated_visible_rows', clearAddingRows);
        $scope.$on('sn_table_remove_inline_insert_row', function (event, data) {
          if (data.inlineInsertRowIndex > -1)
            $scope.addingRows.splice(data.inlineInsertRowIndex, 1);
          else {
            var index = $scope.addingRows.indexOf(data.row);
            if (index > -1) $scope.addingRows.splice(index, 1);
          }
        });
        $scope.$on(
          'sn_table_commit_insert_manually_complete',
          function (event, data) {
            if (data.status === 'success') {
              if (!$scope.committingAllRows) {
                if (angular.isDefined(data.rowIndex)) {
                  $scope.addingRows[data.rowIndex] = data.row;
                }
              } else {
                if (
                  angular.isDefined(
                    $scope.addingRows[$scope.committingIndex + 1]
                  )
                ) {
                  $scope.committingIndex++;
                  $scope.commitAddingRow(
                    $scope.addingRows[$scope.committingIndex],
                    $scope.committingIndex
                  );
                } else {
                  $rootScope.$broadcast('sn_table_all_rows_committed');
                }
              }
            }
            if (data.status === 'failure') {
              if ($scope.committingAllRows) {
                if (
                  angular.isDefined(
                    $scope.addingRows[$scope.committingIndex + 1]
                  )
                ) {
                  $scope.committingIndex++;
                  $scope.commitAddingRow(
                    $scope.addingRows[$scope.committingIndex],
                    $scope.committingIndex
                  );
                } else {
                  $rootScope.$broadcast('sn_table_all_rows_committed');
                }
              }
            }
          }
        );
        $scope.$on('sn_table_commit_all_uncommited', function (event, data) {
          if ($scope.addingRows.length > 0) {
            $scope.committingAllRows = true;
            $scope.committingIndex = 0;
            $scope.commitAddingRow(
              $scope.addingRows[$scope.committingIndex],
              $scope.committingIndex
            );
          } else {
            $rootScope.$broadcast('sn_table_all_rows_committed');
          }
        });
        function getEditPopoverPosition(element) {
          var left = 0;
          var top = 0;
          left += element.offsetLeft;
          top += element.offsetTop;
          left -= element.scrollLeft;
          top -= element.scrollTop;
          if (left + 200 > element.offsetParent.clientWidth) {
            var right = 0;
            right += element.offsetLeft + element.clientWidth;
            right -= element.offsetParent.clientWidth;
            right = Math.abs(right);
            return {
              right: right,
              top: top,
            };
          }
          return {
            left: left,
            top: top,
          };
        }
        function clearAddingRows() {
          if (!$scope.config.manuallyCommitInserts) $scope.addingRows = [];
        }
      },
    };
  },
]);