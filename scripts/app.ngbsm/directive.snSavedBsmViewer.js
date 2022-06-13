/*! RESOURCE: /scripts/app.ngbsm/directive.snSavedBsmViewer.js */
angular.module('sn.ngbsm').directive('snSavedBsmViewer', function ($rootScope) {
  'use strict';
  return {
    restrict: 'E',
    replace: false,
    scope: {},
    templateUrl:
      '/angular.do?sysparm_type=get_partial&name=sn_saved_bsm_viewer.xml',
    controller: function ($scope) {
      var TILE_WIDTH = 178;
      var TILES_IN_VIEW = 3;
      var tileOffset = 0;
      $scope.views = [];
      $scope.active = false;
      $scope.offset = 0;
      $scope.$on('ngbsm.views_loaded', function (event, data) {
        if (!validData(data)) return;
        $scope.views = [];
        $scope.offset = 0;
        tileOffset = 0;
        for (var i = 0; i < data.length; i++)
          if (data[i]) {
            var graph = {};
            try {
              graph = JSON.parse(data[i].graph);
            } catch (e) {}
            data[i].name = graph.name;
            $scope.views.push(data[i]);
          }
        $scope.active = true;
      });
      $scope.clickedLeft = function () {
        if (tileOffset > 0) tileOffset -= 1;
        $scope.offset = tileOffset * -TILE_WIDTH;
      };
      $scope.clickedRight = function () {
        if (tileOffset < $scope.views.length - TILES_IN_VIEW) tileOffset += 1;
        $scope.offset = tileOffset * -TILE_WIDTH;
      };
      $scope.canClickLeft = function () {
        if (tileOffset === 0) return 0;
        return 1;
      };
      $scope.canClickRight = function () {
        if (tileOffset >= $scope.views.length - TILES_IN_VIEW) return 0;
        return 1;
      };
      $scope.leftOpacity = function () {
        if (tileOffset === 0) return 0.25;
        return 1;
      };
      $scope.rightOpacity = function () {
        if (tileOffset >= $scope.views.length - TILES_IN_VIEW) return 0.25;
        return 1;
      };
      $scope.select = function (data) {
        $scope.active = false;
        $rootScope.$broadcast('ngbsm.view_selected', data);
      };
      function validData(data) {
        if (!data || data.length === 0) return false;
        for (var i = 0; i < data.length; i++) {
          if (
            data[i].thumbnail === null ||
            data[i].thumbnail === undefined ||
            data[i].thumbnail === ''
          )
            return false;
          if (
            data[i].graph === null ||
            data[i].graph === undefined ||
            data[i].graph === ''
          )
            return false;
        }
        return true;
      }
    },
  };
});