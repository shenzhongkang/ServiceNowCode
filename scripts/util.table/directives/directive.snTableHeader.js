/*! RESOURCE: /scripts/util.table/directives/directive.snTableHeader.js */
angular.module('sn.table').directive('snTableHeader', [
  'snTableRepository',
  'snTableCommon',
  'i18n',
  '$timeout',
  function (snTableRepository, snTableCommon, i18n, $timeout) {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      scope: {
        rows: '=rows',
        columns: '=columns',
        config: '=config',
      },
      template:
        '' +
        '<div class="sr-only" aria-live="assertive">{{sortAriaNotification}}</div>' +
        '<tr role="presentation" class="column-header">' +
        '    <th class="col-control" ng-if="hasConfigColumn()" scope="col">' +
        '        <button class="icon-cog btn btn-icon table-btn-lg" ng-show="config.configurable" ng-click="openColumnManager()">' +
        '            <span class="sr-only">' +
        i18n.getMessage('Personalize List') +
        '</span>' +
        '        </button>' +
        '    </th>' +
        '    <th class="col-control" ng-if="hasFilterColumn()" scope="col">' +
        '        <button class="icon-search btn btn-icon table-btn-lg" ng-show="config.filterable" aria-pressed="{{config.showFilters}}" ng-click="toggleFilters()">' +
        '            <span class="sr-only">' +
        i18n.getMessage('Search') +
        '</span>' +
        '        </button>' +
        '    </th>' +
        '    <th ng-repeat="column in columns" aria-sort="{{ariaSort(column)}}" scope="col">' +
        '        <a class="header-label" tabindex="0" style="text-decoration: none; cursor: default;" sn-tooltip-basic="{{nextSortMessage(column)}}" ng-class="{ \'col-change-sort\': isSorted(column) }" sn-enter-click="span[ng-click]">' +
        '            <span style="cursor: pointer;" ng-click="sortOrToggleSort(column)" ng-attr-id="{{column.sys_id}}" aria-label="{{getScreenReaderLabel(column)}}" tabindex="-1">{{column.label}}</span>' +
        '            <i class="icon-vcr-down col-sort sort" style="cursor: pointer;" ng-show="isSortedDescending(column)" ng-click="sortOrToggleSort(column)" tabindex="-1"><label class="sr-only">' +
        i18n.getMessage('Search') +
        '</label></i>' +
        '            <i class="icon-vcr-up col-sort sort" style="cursor: pointer;" ng-show="isSortedAscending(column)" ng-click="sortOrToggleSort(column)" tabindex="-1"></i>' +
        '            <i class="col-sort group" style="cursor: pointer;" ng-class="getGroupClass(column)" ng-show="canGroup(column)" ng-click="groupBy(column)" sn-tooltip-basic="{{getGroupTooltip(column)}}" data-delay-show="1000"></i>' +
        '        </a>' +
        '    </th>' +
        '</tr>' +
        '<tr role="presentation" class="list_header" ng-show="shouldShowFilters()">' +
        '    <th class="col-control" ng-if="hasConfigColumn()" scope="col"></th>' +
        '    <th class="col-control" ng-if="hasFilterColumn()" scope="col"></th>' +
        '    <th class="test-align-left list_hdrcell list_hdr" style="padding: 0px;" ng-repeat="column in columns" scope="col">' +
        '        <div style="padding: 3px 6px; border-left: solid 1px #f2f2f2; font-weight: normal; float: left; width: 100%;">' +
        '            <span class="form-field">' +
        '                <input class="form-control" type="text" placeholder="' +
        i18n.getMessage('Search') +
        '" ng-model="filters[column.name]" ng-disabled="column.readOnly" ng-keyup="updateFilter(column, $event)" ng-keypress="commitFilter(column, $event)" aria-label="{{getSearchFieldAria(column)}}"/>' +
        '            </span>' +
        '        </div>' +
        '    </th>' +
        '</tr>',
      controller: function ($scope) {
        $scope.filters = {};
        $scope.sortAriaNotification = '';
        $scope.config.showFilters = false;
        $scope.$on('force_update_table', syncColumnFilters);
        $scope.$on('force_refresh_data', syncColumnFilters);
        if (
          !$scope.config.table &&
          $scope.config.sortBy &&
          $scope.config.sort
        ) {
          for (var i = 0; i < $scope.columns.length; i++) {
            if ($scope.columns[i].name === $scope.config.sortBy) {
              $scope.columns[i].sort = $scope.config.sort;
              break;
            }
          }
        }
        $scope.openColumnManager = function () {
          $scope.$emit('manage_columns_internal');
        };
        $scope.isSorted = function (column) {
          return column.name === $scope.config.sortBy;
        };
        $scope.sortOrToggleSort = function (column) {
          var isSameColumn = $scope.config.sortBy === column.name;
          var sortingText = '';
          $scope.config.sortBy = column.name;
          if (isSameColumn) {
            if (column.sort === 'descending') {
              column.sort = 'ascending';
              sortingText = i18n.format(
                i18n.getMessage(
                  '{0}: Currently ordering ascending. Click to change ordering.'
                ),
                column.label
              );
            } else {
              column.sort = 'descending';
              sortingText = i18n.format(
                i18n.getMessage(
                  '{0}: Currently ordering descending. Click to change ordering.'
                ),
                column.label
              );
            }
          } else {
            column.sort = 'ascending';
            sortingText = i18n.format(
              i18n.getMessage(
                '{0}: Currently ordering ascending. Click to change ordering.'
              ),
              column.label
            );
          }
          $scope.config.sort = column.sort;
          snTableRepository.saveSorting($scope.config);
          updateTable();
          $scope.sortAriaNotification = sortingText;
        };
        $scope.isSortedDescending = function (column) {
          return $scope.isSorted(column) && column.sort === 'descending';
        };
        $scope.isSortedAscending = function (column) {
          return $scope.isSorted(column) && column.sort === 'ascending';
        };
        $scope.ariaSort = function (column) {
          if (!$scope.isSorted(column)) return 'none';
          else if ($scope.isSortedDescending(column)) return 'descending';
          else if ($scope.isSortedAscending(column)) return 'ascending';
          return null;
        };
        $scope.nextSortMessage = function (column) {
          if ($scope.isSorted(column)) {
            if (column.sort === 'descending')
              return i18n.format(
                i18n.getMessage('Sort {0} ascending'),
                column.label
              );
            else
              return i18n.format(
                i18n.getMessage('Sort {0} descending'),
                column.label
              );
          }
          return i18n.format(
            i18n.getMessage('Sort {0} ascending'),
            column.label
          );
        };
        $scope.getScreenReaderLabel = function (column) {
          var sortingText = '';
          if ($scope.isSortedDescending(column))
            sortingText = i18n.format(
              i18n.getMessage(
                '{0}: Currently ordering descending. Click to change ordering.'
              ),
              column.label
            );
          else if ($scope.isSortedAscending(column))
            sortingText = i18n.format(
              i18n.getMessage(
                '{0}: Currently ordering ascending. Click to change ordering.'
              ),
              column.label
            );
          else
            sortingText = i18n.format(
              i18n.getMessage('{0}: Click to order ascending.'),
              column.label
            );
          return sortingText;
        };
        $scope.hasConfigColumn = function () {
          if ($scope.config.configurable) return true;
          else if ($scope.config.selectable && $scope.config.openable)
            return true;
          else if (!$scope.config.filterable && $scope.config.openable)
            return true;
          return false;
        };
        $scope.hasFilterColumn = function () {
          if ($scope.config.filterable) return true;
          else if ($scope.config.selectable && $scope.config.openable)
            return true;
          else if (!$scope.config.configurable && $scope.config.selectable)
            return true;
          return false;
        };
        $scope.shouldShowFilters = function () {
          return $scope.config.filterable && $scope.config.showFilters;
        };
        $scope.toggleFilters = function () {
          if ($scope.config.filterable && !$scope.config.showFilters)
            $scope.config.showFilters = true;
          else $scope.config.showFilters = false;
        };
        $scope.updateFilter = function (column, event) {
          if (column && column.is_choiceList) {
            var query = snTableCommon.getFilterByQuery(
              $scope.filters[column.name]
            );
            var promise = snTableRepository.getColumnChoiceList(
              $scope.config,
              column.name,
              query
            );
            promise.then(function (data) {
              column.query = 'IN' + data.result.join(',');
            });
          }
        };
        $scope.commitFilter = function (column, event) {
          if (column && event && event.which === 13) {
            for (var i = 0; i < $scope.columns.length; i++) {
              $scope.columns[i].filter = $scope.filters[$scope.columns[i].name];
              if (!$scope.columns[i].is_choiceList)
                $scope.columns[i].query = snTableCommon.getFilterByQuery(
                  $scope.filters[$scope.columns[i].name]
                );
            }
            $scope.config.targetRow = 1;
            updateTable();
          }
        };
        $scope.getGroupClass = function (column) {
          return {
            'icon-empty-circle': !$scope.isGrouped(column),
            'icon-check-circle': $scope.isGrouped(column),
          };
        };
        $scope.getGroupTooltip = function (column) {
          if ($scope.config.disallowManualGrouping) {
            if ($scope.isGrouped(column))
              return 'The list is grouped on this column';
            else return 'The list is not grouped on this column';
          } else {
            if ($scope.isGrouped(column)) return 'Stop grouping on this column';
            else return 'Group on this column';
          }
        };
        $scope.canGroup = function (column) {
          return (
            !$scope.config.disallowManualGrouping || $scope.isGrouped(column)
          );
        };
        $scope.isGrouped = function (column) {
          return column.name === $scope.config.groupBy;
        };
        $scope.groupBy = function (column) {
          if ($scope.config.disallowManualGrouping) return;
          if ($scope.config.groupBy === column.name)
            $scope.config.groupBy = null;
          else $scope.config.groupBy = column.name;
          updateTable();
        };
        $scope.getSearchFieldAria = function (column) {
          var columnLabel = column.label ? column.label : column.name;
          return i18n.format(
            i18n.getMessage('cmdbTable.searchField.ariaLabel'),
            columnLabel
          );
        };
        function updateTable() {
          if ($scope.config.table) $scope.$emit('force_refresh_data');
          else $scope.$emit('force_update_table');
        }
        function syncColumnFilters() {
          for (var i = 0; i < $scope.columns.length; i++)
            $scope.filters[$scope.columns[i].name] = $scope.columns[i].filter;
        }
      },
    };
  },
]);