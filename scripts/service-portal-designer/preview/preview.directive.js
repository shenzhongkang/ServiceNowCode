/*! RESOURCE: /scripts/service-portal-designer/preview/preview.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_preview_directive', [])
    .directive('preview', function (utils, config) {
      function link(scope, element) {
        element.find('iframe').on('load', function () {
          this.contentDocument.body.appendChild(
            utils.styleSheet(config.previewStyle)
          );
        });
      }
      return {
        restrict: 'E',
        scope: {
          url: '=',
          device: '=',
        },
        template:
          '<div class="layout-preview {{device}}"><iframe src="{{url}}" frameborder="0" class="preview"></iframe></div>',
        replace: true,
        link: link,
      };
    });
})();
