/*! RESOURCE: /scripts/util.table/directives/directive.snTablePaginationManager.js */
angular.module('sn.table').directive('snTablePaginationManager', [
  'snTableCommon',
  function (snTableCommon) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {
        rows: '=rows',
        config: '=config',
      },
      template: '',
      controller: function ($scope) {
        $scope.$watch('config.targetRow', function (newVal, oldVal) {
          $scope.config.targetRow = parseInt($scope.config.targetRow);
          if (!targetInRange()) $scope.config.targetRow = oldVal;
          if (!targetInRange()) limitTarget();
          snTableCommon.deselectAll($scope.rows);
          $scope.config.allSelected = false;
          updateTable();
        });
        $scope.$on(
          'sn_table_first_page',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, false, config)) return;
            if (config && config === $scope.config) firstPage();
          })
        );
        $scope.$on(
          'sn_table_previous_page',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, false, config)) return;
            if (config && config === $scope.config) previousPage();
          })
        );
        $scope.$on(
          'sn_table_go_to',
          snTableCommon.consumeEvent(function (event, config, target) {
            if (!snTableCommon.allowEvent($scope.config, false, config)) return;
            if (isNaN(parseInt(target))) return;
            if (config && config === $scope.config && target)
              commitTarget(target);
          })
        );
        $scope.$on(
          'sn_table_next_page',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, false, config)) return;
            if (config && config === $scope.config) nextPage();
          })
        );
        $scope.$on(
          'sn_table_last_page',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, false, config)) return;
            if (config && config === $scope.config) lastPage();
          })
        );
        $scope.$on(
          'sn_table_reset_pagination',
          snTableCommon.consumeEvent(function (event, config) {
            if (!snTableCommon.allowEvent($scope.config, false, config)) return;
            if (config && config === $scope.config) firstPage();
          })
        );
        function firstPage() {
          if (!allowChanges()) return;
          $scope.config.targetRow = 1;
          updateTable();
        }
        function previousPage() {
          if (!allowChanges()) return;
          $scope.config.targetRow =
            $scope.config.targetRow - $scope.config.rowsPerPage;
          if ($scope.config.targetRow < 1) $scope.config.targetRow = 1;
          updateTable();
        }
        function nextPage() {
          if (!allowChanges()) return;
          if (
            $scope.config.targetRow <
            $scope.config.availableRows - $scope.config.rowsPerPage + 1
          )
            $scope.config.targetRow = pageMax() + 1;
          limitTarget();
          updateTable();
        }
        function lastPage() {
          if (!allowChanges()) return;
          $scope.config.targetRow =
            $scope.config.availableRows - $scope.config.rowsPerPage + 1;
          if ($scope.config.targetRow < 1) $scope.config.targetRow = 1;
          updateTable();
        }
        function commitTarget(target) {
          if (!allowChanges()) return;
          $scope.config.targetRow = target;
          updateTable();
        }
        function allowChanges() {
          return snTableCommon.paginationNeeded($scope.config);
        }
        function pageMax() {
          return snTableCommon.pageMax($scope.config);
        }
        function targetInRange() {
          if (
            isNaN($scope.config.targetRow) ||
            $scope.config.targetRow == undefined
          )
            return false;
          if (
            $scope.config.targetRow < 1 ||
            $scope.config.targetRow > $scope.config.availableRows
          )
            return false;
          return true;
        }
        function limitTarget() {
          if ($scope.config.targetRow > $scope.config.availableRows)
            $scope.config.targetRow = $scope.config.availableRows;
          if ($scope.config.targetRow < 1) $scope.config.targetRow = 1;
        }
        function updateTable() {
          if ($scope.config.table) $scope.$emit('force_refresh_data');
          else $scope.$emit('force_update_table');
        }
      },
    };
  },
]);
