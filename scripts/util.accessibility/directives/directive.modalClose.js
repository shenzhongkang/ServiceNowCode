/*! RESOURCE: /scripts/util.accessibility/directives/directive.modalClose.js */
angular.module('sn.accessibility').directive('modalClose', function ($timeout) {
  'use strict';
  return {
    restrict: 'A',
    scope: {
      close: '&modalClose',
      modalParentClass: '@?',
      modalWatch: '=?',
    },
    link: function (scope, element, attrs) {
      var body = angular.element(document).find('body');
      var modalParentClass = angular.isUndefined(scope.modalParentClass)
        ? 'modal-dialog'
        : scope.modalParentClass;
      var watch;
      if (!angular.isUndefined(attrs.modalWatch)) {
        watch = scope.$watch('modalWatch', function (newValue, oldValue) {
          if (!!newValue) registerEvents();
          else deregisterEvents();
        });
      } else registerEvents();
      function registerEvents() {
        $timeout(function () {
          body.on('click', function (event) {
            event.stopPropagation();
            var modalBox = element[0].getBoundingClientRect();
            var x = event.pageX;
            var y = event.pageY;
            if (
              !x ||
              !y ||
              (modalBox.left < x &&
                modalBox.right > x &&
                modalBox.top < y &&
                modalBox.bottom > y) ||
              $.contains(element[0], event.target)
            )
              return;
            closeModalAndDeregisterEvents();
          });
        });
      }
      function deregisterEvents() {
        body.off('click');
      }
      function closeModalAndDeregisterEvents() {
        if (scope.close && typeof scope.close == 'function') {
          scope.close();
          scope.$apply();
        }
        deregisterEvents();
      }
      scope.$on('$destroy', function () {
        deregisterEvents();
        if (watch) watch();
      });
    },
  };
});