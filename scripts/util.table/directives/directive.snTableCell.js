/*! RESOURCE: /scripts/util.table/directives/directive.snTableCell.js */
angular.module('sn.table').directive('snTableCell', [
  'snTableCommon',
  function (snTableCommon) {
    'use strict';
    return {
      restrict: 'A',
      replace: false,
      scope: {
        row: '=row',
        column: '=column',
        config: '=config',
      },
      template:
        '' +
        '<div class="sn-table-cell">' +
        '    <div ng-if="shouldDisplay(row, column)">' +
        '        <span ng-if="isLink(row, column)" sn-tooltip-basic="{{getDisplayValue(row, column)}}" data-placement="auto top" data-delay-show="1000" data-classes="sn-table-tooltip">' +
        '            <a ng-if="config.clickCallback" ng-bind="getLinkDisplayValue(row, column)" ng-click="itemClicked(row, column, config)" style="cursor: pointer;" tabindex="0" sn-enter-click=""></a>' +
        '            <a ng-if="!config.clickCallback" ng-href="{{getLink(row, column)}}" ng-attr-target="{{linkMode()}}" ng-bind="getLinkDisplayValue(row, column)" tabindex="0"></a>' +
        '        </span>' +
        '        <span ng-if="!isLink(row, column)" ng-bind="getDisplayValue(row, column)" sn-tooltip-basic="{{getDisplayValue(row, column)}}" data-placement="auto top" data-delay-show="1000" data-classes="sn-table-tooltip"></span>' +
        '    </div>' +
        '    <div ng-include="getTemplateUrl(column)" ng-if="hasCustomTemplate(column)"></div>' +
        '</div>',
      controller: function ($scope) {
        $scope.hasCustomTemplate = function (column) {
          if (
            $scope.config &&
            $scope.config.columnTemplates &&
            $scope.config.columnTemplates[column.name]
          )
            return true;
          if (
            column &&
            column.template !== undefined &&
            typeof column.template === 'string'
          )
            return true;
          return false;
        };
        $scope.itemClicked = function (row, column, config) {
          if (
            $scope.config &&
            $scope.config.clickCallback &&
            typeof $scope.config.clickCallback == 'function'
          )
            $scope.config.clickCallback(row, column, config);
        };
        $scope.getTemplateUrl = function (column) {
          var template = snTableCommon.getCellTemplateName(
            column,
            $scope.config
          );
          return (
            '/angular.do?sysparm_type=get_partial&name=' + template + '.xml'
          );
        };
        $scope.linkMode = function () {
          return snTableCommon.linkMode($scope.config);
        };
        $scope.isLink = function (row, column) {
          return snTableCommon.isLink(row, column, $scope.config);
        };
        $scope.getLink = function (row, column) {
          return snTableCommon.getLink(row, column, $scope.config);
        };
        $scope.getLinkDisplayValue = function (row, column) {
          return snTableCommon.getLinkDisplayValue(row, column);
        };
        $scope.shouldDisplay = function (row, column) {
          if (!row || !column) return false;
          if ($scope.hasCustomTemplate(column)) return false;
          var field = row[column.name];
          if (field === undefined || field === null || field === 'null')
            return false;
          return true;
        };
        $scope.getDisplayValue = function (row, column) {
          return snTableCommon.getDisplayValue(row, column, $scope.config);
        };
        $scope.getValue = function (row, column) {
          if (!row || !column) return undefined;
          return row[column.name];
        };
      },
    };
  },
]);
