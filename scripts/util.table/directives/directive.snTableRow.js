/*! RESOURCE: /scripts/util.table/directives/directive.snTableRow.js */
angular.module('sn.table').directive('snTableRow', [
  'snTableCommon',
  'i18n',
  'SNTABLECONSTANTS',
  function (snTableCommon, i18n, CONSTANTS) {
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
        '<tr role="row" class="list_row" ng-if="!hasCustomTemplate()" ng-repeat-start="row in rows" ng-attr-row-id="{{row[rowId]}}" tabindex="{{getRowTabIndex()}}" aria-label="{{getRowAriaLabel(row, $index)}}" ng-keydown="rowKeypress($event, row)">' +
        '    <td class="list_decoration_cell col-small col-center" ng-class="{ \'col-control\': isSelectable() || showRadioButton() }" ng-if="hasSelectColumn()">' +
        '        <span class="input-group-checkbox" ng-if="isSelectable()">' +
        '            <input ng-attr-id="{{getCheckBoxId(row)}}" class="checkbox" type="checkbox" ng-model="row._selected" ng-change="toggleSelection(row)"/>' +
        '            <label class="checkbox-label" for="{{getCheckBoxId(row)}}">' +
        '                <span class="sr-only">' +
        i18n.getMessage('Select record for action') +
        '</span>' +
        '            </label>' +
        '        </span>' +
        '        <span class="input-group-radio" ng-if="showRadioButton()">' +
        '            <input ng-attr-id="{{::getRadioButtonId(row)}}" name="sn-table-radio-select-{{::$parent.$parent.$parent.$parent.$id}}" class="radio" type="radio" ng-model="config.radioSelection" ng-value="row" />' +
        '            <label class="radio-label" for="{{::getRadioButtonId(row)}}"><span class="sr-only">' +
        i18n.getMessage('Select record for action') +
        '</span></label>' +
        '        </span>' +
        '    </td>' +
        '    <td class="list_decoration_cell col-center col-small" ng-if="hasOpenColumn()">' +
        '        <a ng-href="{{getRowLink(row)}}" ng-attr-target="{{linkMode()}}" class="list_popup btn btn-icon table-btn-lg icon-info" ng-if="isOpenable()" aria-label="{{getIconInfoTooltip(row)}}" sn-tooltip-basic="{{getIconInfoTooltip(row)}}">' +
        '        </a>' +
        '    </td>' +
        '    <td sn-table-cell ng-attr-id="{{row.sys_id + column.sys_id}}" ng-click="cellClick($event, row, column)" ng-dblclick="cellDoubleClick($event, row, column)" class="vt" ng-class="getCellClasses(column)" style="position: relative;" row="row" column="column" config="config" ng-repeat="column in columns" aria-labelledby="{{column.sys_id}}" tabindex="{{getCellTabIndex()}}" ng-keydown="cellKeypress($event, row, column)" role="gridcell"></td>' +
        '</tr>' +
        '<tr role="row" ng-if="hasCustomTemplate()" ng-class="getRowClasses()" ng-include="getTemplateUrl()" ng-repeat-end=""></tr>',
      controller: function ($scope, $rootScope) {
        $scope.rowId = '';
        if (angular.isString($scope.config.showRowId)) {
          $scope.rowId = $scope.config.showRowId;
        }
        $scope.getRowTabIndex = function () {
          if (angular.isDefined($scope.config.rowTabIndexable))
            return $scope.config.rowTabIndexable ? 0 : -1;
          return -1;
        };
        $scope.getRowAriaLabel = function (row, index) {
          if ($scope.config.rowAriaLabel)
            return $scope.config.rowAriaLabel(row, index, $scope.config);
          return i18n.format(i18n.getMessage('Row {0}'), index + 1);
        };
        $scope.getCellTabIndex = function () {
          if (angular.isDefined($scope.config.cellTabIndexable))
            return $scope.config.cellTabIndexable ? 0 : -1;
          if (angular.isDefined($scope.config.allowInlineEdit))
            return $scope.config.allowInlineEdit ? 0 : -1;
          return 0;
        };
        $scope.linkMode = function () {
          return snTableCommon.linkMode($scope.config);
        };
        $scope.cellClick = function (e, row, column) {
          if ($scope.config.cellClickCallBack) {
            $scope.config.cellClickCallBack(e, row, column, $scope.config);
          }
        };
        $scope.cellDoubleClick = function (e, row, column) {
          if ($scope.config.cellDoubleClickCallBack) {
            $scope.config.cellDoubleClickCallBack(
              e,
              row,
              column,
              $scope.config
            );
          } else if (
            $scope.config.allowInlineEdit &&
            e.target.tagName.toLowerCase() !== 'a'
          ) {
            var selector = '#' + row.sys_id + column.sys_id;
            var cellElement = angular.element(selector);
            var position = getEditPopoverPosition(cellElement[0]);
            var data = {
              position: position,
              row: row,
              column: column,
            };
            $rootScope.$broadcast('edit-window-open', data);
            e.stopPropagation();
          }
        };
        $scope.getCheckBoxId = function (row) {
          var rowId = row.sys_id ? row.sys_id : row.child_id;
          var id = 'check_box_row_' + rowId + '_' + $scope.$id;
          return id;
        };
        $scope.getRadioButtonId = function (row) {
          var id = 'radio_button_row_' + row.sys_id + '_' + $scope.$id;
          return id;
        };
        $scope.getRowLink = function (row) {
          return snTableCommon.getRowLink($scope.config, row);
        };
        $scope.hasSelectColumn = function () {
          return snTableCommon.hasSelectColumn($scope.config);
        };
        $scope.hasOpenColumn = function () {
          return snTableCommon.hasOpenColumn($scope.config);
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
        $scope.isOpenable = function () {
          return snTableCommon.isOpenable($scope.config);
        };
        $scope.isSelectable = function () {
          return snTableCommon.isSelectable($scope.config);
        };
        $scope.showRadioButton = function () {
          return snTableCommon.showRadioButton($scope.config);
        };
        $scope.toggleSelection = function (row) {
          if ($scope.config.toggleSelectionCallBack)
            $scope.config.toggleSelectionCallBack();
          return snTableCommon.toggleSelection($scope.rows, $scope.config, row);
        };
        $scope.toggleRadioSelection = function (row) {
          return snTableCommon.toggleRadioSelection(
            $scope.rows,
            $scope.config,
            row
          );
        };
        $scope.getRowClasses = function () {
          return snTableCommon.getRowClasses($scope.config);
        };
        $scope.getCellClasses = function (column) {
          var classes = {};
          var name = snTableCommon.getCellTemplateName(column, $scope.config);
          if (name) {
            classes['custom'] = true;
            classes[name] = true;
          }
          return classes;
        };
        $scope.getIconInfoTooltip = function (row) {
          return i18n.format(
            i18n.getMessage('cmdbTable.iconInfo.tooltip'),
            snTableCommon.getLinkDisplayValue(row, $scope.columns[0])
          );
        };
        $scope.cellKeypress = function (e, row, column) {
          if (
            e.keyCode === CONSTANTS.KEY_CODES.ENTER_KEY &&
            e.target &&
            !e.target.href
          ) {
            e.preventDefault();
            if (angular.isDefined($scope.config.cellEnterClickAction)) {
              if ($scope.config.cellEnterClickAction === 'dblclick') {
                $scope.cellDoubleClick(e, row, column);
              } else if ($scope.config.cellEnterClickAction === 'click') {
                if ($scope.config.cellClickCallBack)
                  $scope.config.cellClickCallBack(
                    e,
                    row,
                    column,
                    $scope.config
                  );
                else if (snTableCommon.isLink(row, column, $scope.config)) {
                  var selector = '#' + row.sys_id + column.sys_id + ' a';
                  var cellElement = angular.element(selector)[0];
                  cellElement.click();
                  e.stopPropagation();
                }
              }
            } else {
              if ($scope.config.allowInlineEdit)
                $scope.cellDoubleClick(e, row, column);
              else if ($scope.config.cellClickCallBack)
                $scope.config.cellClickCallBack(e, row, column, $scope.config);
              else if (snTableCommon.isLink(row, column, $scope.config)) {
                var selector = '#' + row.sys_id + column.sys_id + ' a';
                var cellElement = angular.element(selector)[0];
                cellElement.click();
                e.stopPropagation();
              }
            }
          }
        };
        $scope.rowKeypress = function (e, row) {
          if (e.keyCode === CONSTANTS.KEY_CODES.ENTER_KEY) {
            if ($scope.config.rowClickCallBack)
              $scope.config.rowClickCallBack(e, row);
          }
        };
        $scope.rowSRText = function (row, columns) {
          if (
            row !== undefined &&
            columns !== undefined &&
            columns.length > 0 &&
            columns[0] !== undefined
          ) {
            var column = columns[0];
            return i18n.format(
              i18n.getMessage('Select {0} for action'),
              snTableCommon.getLinkDisplayValue(row, column)
            );
          }
          return i18n.getMessage('Select record for action');
        };
        function getEditPopoverPosition(element) {
          var left = 0;
          var top = 0;
          var parentWidth = element.offsetParent.scrollWidth;
          left += element.offsetLeft;
          top += element.offsetTop;
          left -= element.scrollLeft;
          top -= element.scrollTop;
          if (left + 200 > parentWidth) {
            var right = 0;
            right += element.offsetLeft + element.clientWidth;
            right -= parentWidth + element.offsetParent.scrollLeft;
            return {
              right: right,
              top: top,
            };
          }
          if (
            left + 187 >
            element.offsetParent.scrollLeft + element.offsetParent.clientWidth
          ) {
            element.offsetParent.scrollLeft += 187;
          }
          return {
            left: left,
            top: top,
          };
        }
      },
    };
  },
]);