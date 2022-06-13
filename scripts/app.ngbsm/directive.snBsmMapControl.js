/*! RESOURCE: /scripts/app.ngbsm/directive.snBsmMapControl.js */
angular
  .module('sn.ngbsm')
  .directive(
    'snBsmMapControl',
    function ($rootScope, bsmCamera, bsmGraph, bsmBehaviors, CONFIG) {
      'use strict';
      return {
        restrict: 'E',
        replace: false,
        scope: {
          controls: '=data',
        },
        templateUrl:
          '/angular.do?sysparm_type=get_partial&name=sn_bsm_map_control.xml',
        controller: function ($scope) {
          $scope.editMode = false;
          $rootScope.$on('ngbsm.mouse_mode_changed', function (event, value) {
            $scope.editMode = value;
            setTimeout(function () {
              $scope.$apply();
            }, 0);
          });
          $scope.moveUp = function () {
            bsmCamera.translateBy(0, 2 * CONFIG.CAMERA_TRANSLATE_AMOUNT);
            bsmCamera.moveCamera(500);
          };
          $scope.moveRight = function () {
            bsmCamera.translateBy(-2 * CONFIG.CAMERA_TRANSLATE_AMOUNT, 0);
            bsmCamera.moveCamera(500);
          };
          $scope.moveDown = function () {
            bsmCamera.translateBy(0, -2 * CONFIG.CAMERA_TRANSLATE_AMOUNT);
            bsmCamera.moveCamera(500);
          };
          $scope.moveLeft = function () {
            bsmCamera.translateBy(2 * CONFIG.CAMERA_TRANSLATE_AMOUNT, 0);
            bsmCamera.moveCamera(500);
          };
          $scope.fitToScreen = function () {
            bsmCamera.fitToScreen(bsmGraph.current());
            bsmCamera.moveCamera(800);
          };
          $scope.zoomIn = function () {
            bsmCamera.scaleBy(2 * CONFIG.CAMERA_SCALE_AMOUNT);
            bsmCamera.moveCamera(500);
          };
          $scope.zoomOut = function () {
            bsmCamera.scaleBy(-2 * CONFIG.CAMERA_SCALE_AMOUNT);
            bsmCamera.moveCamera(500);
          };
          $scope.switchMode = function () {
            $rootScope.$broadcast('ngbsm.change_mouse_mode');
          };
        },
      };
    }
  );