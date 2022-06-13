/*! RESOURCE: /scripts/util.table/directives/directive.snTablePagination.js */
angular.module('sn.table').directive('snTablePagination', [
  '$rootScope',
  'snTableCommon',
  'i18n',
  function ($rootScope, snTableCommon, i18n) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {
        config: '=config',
        hideWhenUnused: '=?hideWhenUnused',
      },
      templateUrl:
        '/angular.do?sysparm_type=get_partial&name=ui_cmdb_directive_sn_table_pagination.xml',
      controller: function ($scope) {
        $scope.pagination = {
          targetRow: 1,
        };
        $scope.$watch('config.targetRow', function (newVal, oldVal) {
          $scope.pagination.targetRow = $scope.config.targetRow;
        });
        $scope.shouldShow = function () {
          if ($scope.hideWhenUnused === undefined) return true;
          if ($scope.hideWhenUnused)
            return snTableCommon.paginationNeeded($scope.config);
          return true;
        };
        $scope.firstPage = function () {
          $rootScope.$broadcast('sn_table_first_page', $scope.config);
        };
        $scope.previousPage = function () {
          $rootScope.$broadcast('sn_table_previous_page', $scope.config);
        };
        $scope.nextPage = function () {
          $rootScope.$broadcast('sn_table_next_page', $scope.config);
        };
        $scope.lastPage = function () {
          $rootScope.$broadcast('sn_table_last_page', $scope.config);
        };
        $scope.pageMax = function () {
          return snTableCommon.pageMax($scope.config);
        };
        $scope.tableMax = function () {
          return $scope.config.availableRows;
        };
        $scope.commitTarget = function (keystroke) {
          if (!keystroke) keystroke = event;
          var target = parseInt($scope.pagination.targetRow);
          if (target && keystroke && keystroke.which === 13) {
            $rootScope.$broadcast('sn_table_go_to', $scope.config, target);
            $scope.config.targetRow = target;
            $scope.pagination.targetRow = target;
          }
        };
      },
    };
  },
]);