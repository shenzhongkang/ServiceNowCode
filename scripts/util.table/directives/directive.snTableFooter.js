/*! RESOURCE: /scripts/util.table/directives/directive.snTableFooter.js */
angular.module('sn.table').directive('snTableFooter', [
  '$timeout',
  'snTableCommon',
  'i18n',
  function ($timeout, snTableCommon, i18n) {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      scope: {
        rows: '=rows',
        groups: '=groups',
        config: '=config',
      },
      template:
        '' +
        '<tr role="presentation" class="list2_no_records" ng-if="!hasRows()">' +
        '    <td colspan="999" tabindex="0">' +
        i18n.getMessage('No records to display') +
        '    </td>' +
        '</tr>' +
        '<tr role="presentation" class="table-footer" ng-if="showControls()">' +
        '    <td colspan="999" style="background-color: #fff;">' +
        '        <table style="width: 100%; margin-top: 2px;" role="presentation"><tr>' +
        '            <td class="table-checkbox" ng-if="showCheckbox()">' +
        '                <span class="input-group-checkbox" style="float: left;">' +
        '                    <input id="{{getCheckBoxId()}}" class="checkbox" type="checkbox" ng-model="config.allSelected" ng-change="toggleAll()"/>' +
        '                    <label class="checkbox-label" for="{{getCheckBoxId()}}">' +
        '                        <span class="sr-only">' +
        i18n.getMessage('Select record for action') +
        '</span>' +
        '                    </label>' +
        '                </span>' +
        '            </td>' +
        '            <td class="table-actions" ng-if="showActions()">' +
        '                <div>' +
        '                    <sn-dropdown data="config.actions"></sn-dropdown>' +
        '                </div>' +
        '            </td>' +
        '            <td class="table-pagination" ng-if="showPagination()">' +
        '                <sn-table-pagination config="config"></sn-table-pagination>' +
        '            </td>' +
        '        </tr></table>' +
        '    </td>' +
        '</tr>',
      controller: function ($scope) {
        $scope.$watch(watchSelection, actionSelected);
        $scope.getCheckBoxId = function () {
          return 'table-check-all-' + $scope.$id;
        };
        $scope.showControls = function () {
          return (
            $scope.showCheckbox() ||
            $scope.showActions() ||
            $scope.showPagination()
          );
        };
        $scope.showPagination = function () {
          var isGrouped = $scope.isGrouped() ? true : false;
          var isDisabled = $scope.config.disableFooterPagination ? true : false;
          var hasRows = $scope.config.availableRows > 0 ? true : false;
          return !isGrouped && !isDisabled && hasRows;
        };
        $scope.showActions = function () {
          var actionsDefined =
            $scope.config.actions &&
            $scope.config.actions.options &&
            $scope.config.actions.options.length > 0;
          var actionsSuppressed = $scope.config.hideActions ? true : false;
          return actionsDefined && !actionsSuppressed;
        };
        $scope.showCheckbox = function () {
          var allowSelection = $scope.config.selectable ? true : false;
          var hasRows = $scope.config.availableRows > 0 ? true : false;
          return allowSelection && hasRows;
        };
        $scope.hasRows = function () {
          return (
            $scope.config.allowInlineInsert ||
            ($scope.config.availableRows > 0 && $scope.rows.length > 0)
          );
        };
        $scope.isGrouped = function () {
          return $scope.config.groupBy ? true : false;
        };
        $scope.toggleAll = function () {
          var rows = $scope.rows;
          if ($scope.config.groupBy)
            rows = snTableCommon.getVisibleGroupRows($scope.groups);
          if ($scope.config.toggleAllCallBack)
            $scope.config.toggleAllCallBack();
          return snTableCommon.toggleAll(rows, $scope.config);
        };
        function watchSelection() {
          if (!$scope.config.actions) return false;
          if (!$scope.config.actions.selected) return false;
          return $scope.config.actions.selected;
        }
        function actionSelected(selection) {
          if (
            selection &&
            selection.action &&
            typeof selection.action === 'function'
          ) {
            selection.action(selection);
            $timeout(function () {
              $scope.config.actions.selected = $scope.config.actions.options[0];
            });
          }
        }
      },
    };
  },
]);