/*! RESOURCE: /scripts/util.table/directives/directive.snTableGroup.js */
angular.module('sn.table').directive('snTableGroup', [
  'snTableCommon',
  function (snTableCommon) {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      scope: {
        group: '=group',
        groups: '=groups',
        columns: '=columns',
        config: '=config',
      },
      template:
        '' +
        '<tr class="list_group" ng-if="!hasGroupCustomTemplate()">' +
        '    <td class="list_group" style="font-weight: bold;" colspan="999">' +
        '        <span class="icon" style="font-size: 8px; margin: 0px 6px 0px 12px; position: relative; top: -2px;" ng-class="getExpandIcon()" ng-click="toggleGroup()"></span>' +
        '        <a ng-href="{{getGroupQueryLink()}}" ng-bind="getGroupLabel()"></a>' +
        '    </td>' +
        '</tr>' +
        '<tr ng-if="hasCustomGroupTemplate()" ng-class="getGroupClasses()" ng-include="getGroupTemplateUrl()"></tr>' +
        '<tr class="list_row" ng-if="!hasCustomTemplate() && group.expanded" ng-repeat-start="row in group._rows">' +
        '    <td class="list_decoration_cell col-small col-center" ng-class="{ \'col-control\': isSelectable() }" ng-if="hasSelectColumn()">' +
        '        <span class="input-group-checkbox" ng-if="isSelectable()">' +
        '            <input class="checkbox" type="checkbox" ng-model="row._selected"/>' +
        '            <label class="checkbox-label" ng-click="toggleSelection(row)">' +
        '                <span class="sr-only">Select record for action</span>' +
        '            </label>' +
        '        </span>' +
        '    </td>' +
        '    <td class="list_decoration_cell col-center col-small" ng-if="hasOpenColumn()">' +
        '        <a href="#" class="list_popup btn btn-icon table-btn-lg icon-info" ng-if="isOpenable()">' +
        '            <span class="sr-only">Preview</span>' +
        '        </a>' +
        '    </td>' +
        '    <td tabindex="0" sn-table-cell class="vt" style="position: relative;" row="row" column="column" config="config" ng-repeat="column in columns"></td>' +
        '</tr>' +
        '<tr ng-if="hasCustomTemplate()" ng-class="getRowClasses()" ng-include="getTemplateUrl()" ng-repeat-end></tr>' +
        '<tr class="list_header" ng-if="hasMoreRows() && group.expanded">' +
        '    <td colspan="999" style="text-align: center; font-weight: bold; line-height: normal;">' +
        '        <span style="cursor: pointer;" ng-click="showAllRows()">Show {{hiddenRowCount()}} more rows</span>' +
        '    </td>' +
        '</tr>',
      controller: function ($scope) {
        $scope.getExpandIcon = function () {
          return {
            'icon-vcr-right': !$scope.group.expanded,
            'icon-vcr-down': $scope.group.expanded,
          };
        };
        $scope.getGroupQueryLink = function () {
          return '#';
        };
        $scope.getGroupLabel = function () {
          return (
            $scope.group.column.label +
            ': ' +
            $scope.group.label +
            ' (' +
            $scope.getRowCount() +
            ')'
          );
        };
        $scope.hasMoreRows = function () {
          return $scope.group.rows.length > $scope.group._rows.length;
        };
        $scope.hiddenRowCount = function () {
          return $scope.group.rows.length - $scope.group._rows.length;
        };
        $scope.showAllRows = function () {
          $scope.group._rows = $scope.group.rows;
          $scope.config.allSelected = false;
          snTableCommon.updateVisibleRows([], $scope.groups, $scope.config);
        };
        $scope.getRowCount = function () {
          return $scope.group.rows.length;
        };
        $scope.hasGroupCustomTemplate = function () {
          if (
            $scope.config.groupTemplate !== undefined &&
            typeof $scope.config.groupTemplate === 'string'
          )
            return true;
          return false;
        };
        $scope.getGroupTemplateUrl = function () {
          return (
            '/angular.do?sysparm_type=get_partial&name=' +
            $scope.config.groupTemplate +
            '.xml'
          );
        };
        $scope.hasCustomTemplate = function () {
          return snTableCommon.hasCustomRowTemplate($scope.config);
        };
        $scope.getTemplateUrl = function () {
          return (
            '/angular.do?sysparm_type=get_partial&name=' +
            $scope.config.rowTemplate +
            '.xml'
          );
        };
        $scope.toggleGroup = function () {
          if ($scope.group.expanded) $scope.group.expanded = false;
          else $scope.group.expanded = true;
          snTableCommon.updateVisibleRows([], $scope.groups, $scope.config);
        };
        $scope.hasSelectColumn = function () {
          return snTableCommon.hasSelectColumn($scope.config);
        };
        $scope.hasOpenColumn = function () {
          return snTableCommon.hasOpenColumn($scope.config);
        };
        $scope.isOpenable = function () {
          return snTableCommon.isOpenable($scope.config);
        };
        $scope.isSelectable = function () {
          return snTableCommon.isSelectable($scope.config);
        };
        $scope.toggleSelection = function (row) {
          var rows = snTableCommon.getVisibleGroupRows($scope.groups);
          return snTableCommon.toggleSelection(rows, $scope.config, row);
        };
        $scope.getRowClasses = function () {
          return snTableCommon.getRowClasses($scope.config);
        };
        $scope.getGroupClasses = function () {
          var classes = {};
          var name = $scope.config.groupTemplate;
          if ($scope.hasGroupCustomTemplate()) {
            classes['custom'] = true;
            classes[name] = true;
          }
          return classes;
        };
      },
    };
  },
]);
