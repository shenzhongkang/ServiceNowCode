/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderCanvasControl.js */
angular.module('sn.queryBuilder').directive('queryBuilderCanvasControl', [
  'getTemplateUrl',
  function (getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      templateUrl: getTemplateUrl('query_builder_canvas_control.xml'),
      controller: function ($scope, $timeout) {
        $scope.selectMode = false;
        $scope.canvasXOffset = 0;
        $scope.canvasYOffset = 0;
        $scope.canvasZoom = 1;
        $scope.moveUp = function (event) {
          $scope.canvasYOffset += 100;
          event.stopPropagation();
        };
        $scope.moveRight = function (event) {
          $scope.canvasXOffset += 100;
          event.stopPropagation();
        };
        $scope.moveDown = function (event) {
          $scope.canvasYOffset += -100;
          event.stopPropagation();
        };
        $scope.moveLeft = function (event) {
          $scope.canvasXOffset += -100;
          event.stopPropagation();
        };
        $scope.zoomIn = function (event) {
          $scope.canvasZoom += 0.1;
          event.stopPropagation();
        };
        $scope.zoomOut = function (event) {
          $scope.canvasZoom += -0.1;
          if ($scope.canvasZoom < 0) $scope.canvasZoom = 0;
          event.stopPropagation();
        };
        $scope.fitToScreen = function (event) {
          $scope.canvasYOffset = 0;
          $scope.canvasXOffset = 0;
          $scope.canvasZoom = 1;
          event.stopPropagation();
        };
        $scope.switchMode = function (event) {
          $scope.selectMode = !$scope.selectMode;
          event.stopPropagation();
        };
        $scope.$on('clear_canvas', function () {
          $scope.selectMode = false;
        });
      },
    };
  },
]);
