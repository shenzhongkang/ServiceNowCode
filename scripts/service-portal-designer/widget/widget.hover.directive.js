/*! RESOURCE: /scripts/service-portal-designer/widget/widget.hover.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_widget_hover_directive', [])
    .directive('widgetHoverMenu', function ($rootScope, state, events, spUtil) {
      function link(scope, element) {
        scope.display = false;
        state.onChange('itemSelected').call(function (item) {
          if (item !== scope.item && scope.display) {
            scope.display = false;
          }
        });
        scope.edit = function edit(item) {
          $rootScope.$broadcast(events.displayFormModal, item);
        };
        scope.remove = function remove(item) {
          $rootScope.$broadcast(events.widgetRemove, item);
        };
        element.on('mouseenter', function () {
          scope.display = true;
          scope.$apply();
        });
        element.on('mouseleave', function () {
          var itemSelected = state.get('itemSelected');
          if (itemSelected !== scope.item) {
            scope.display = false;
            scope.$digest();
          }
        });
      }
      return {
        restrict: 'C',
        templateUrl: 'widget_hover_menu.html',
        replace: true,
        link: link,
      };
    });
})();
