/*! RESOURCE: /scripts/util.accessibility/directives/directive.highlightOnInsideFocus.js */
angular
  .module('sn.accessibility')
  .directive('highlightOnInsideFocus', function ($timeout) {
    'use strict';
    return {
      restrict: 'A',
      scope: {
        watchList: '=?',
      },
      link: function (scope, element, attrs) {
        var elemToBeHighlighted = element;
        var watch;
        if (attrs.highlightOnInsideFocus.length > 0) {
          var elems = element.find(attrs.highlightOnInsideFocus);
          if (elems.length > 0) elemToBeHighlighted = angular.element(elems[0]);
        }
        initEvents();
        if (!angular.isUndefined(attrs.watchList)) {
          watch = scope.$watch('watchList', function (newValue, oldValue) {
            initEvents();
          });
        }
        function initEvents() {
          var actionButtons = element.find('button, input, [tabindex]');
          actionButtons.off('focus').on('focus', function () {
            elemToBeHighlighted.addClass('focused');
          });
          actionButtons.off('blur').on('blur', function () {
            elemToBeHighlighted.removeClass('focused');
          });
        }
        if (watch) {
          scope.$on('$destroy', function () {
            watch();
          });
        }
      },
    };
  });