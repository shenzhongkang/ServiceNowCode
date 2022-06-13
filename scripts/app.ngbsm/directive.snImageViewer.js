/*! RESOURCE: /scripts/app.ngbsm/directive.snImageViewer.js */
angular
  .module('sn.ngbsm')
  .directive(
    'snImageViewer',
    function (
      $rootScope,
      $timeout,
      bsmRasterizer,
      bsmCanvas,
      CONFIG,
      i18n,
      bsmGraph
    ) {
      'use strict';
      return {
        restrict: 'E',
        replace: false,
        scope: {},
        templateUrl:
          '/angular.do?sysparm_type=get_partial&name=sn_image_viewer.xml',
        controller: function ($scope, $element, bsmAccessibility) {
          if (bsmAccessibility.state.enabled) {
            $element.find('.image').attr('tabindex', 0);
          }
          $scope.active = false;
          $scope.base64 = '';
          $scope.$on('ngbsm.export_image', function () {
            $scope.active = true;
            $scope.base64 = bsmRasterizer.rasterizeAsPNG();
          });
          $scope.close = function () {
            $scope.active = false;
          };
          $scope.click = function (e) {
            if (
              window.navigator.userAgent.indexOf('MSIE') > 0 ||
              !!navigator.userAgent.match(/Trident.*rv\:11\./)
            )
              return;
            var link = document.createElement('a');
            link.download = bsmGraph.current().name;
            link.href = $scope.base64;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          };
        },
      };
    }
  );