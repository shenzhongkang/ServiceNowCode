/*! RESOURCE: /scripts/app.ngbsm/directive.snBsmDialog.js */
angular
  .module('sn.ngbsm')
  .directive(
    'snBsmDialog',
    function ($rootScope, bsmActions, bsmSearchRepository) {
      'use strict';
      return {
        restrict: 'E',
        replace: false,
        scope: {},
        templateUrl:
          '/angular.do?sysparm_type=get_partial&name=sn_bsm_dialog.xml',
        controller: function ($scope) {
          $scope.data = { active: false };
          $scope.config = {};
          $scope.$on('ngbsm.open_bsm_dialog', function (data, dialogConfig) {
            $scope.config = dialogConfig;
            $scope.data.active = true;
          });
        },
      };
    }
  );