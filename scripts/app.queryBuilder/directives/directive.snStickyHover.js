/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.snStickyHover.js */
angular.module('sn.queryBuilder').directive('snStickyHover', [
  '$timeout',
  function ($timeout) {
    'use strict';
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        var base = angular.element(element);
        var container = base.parent();
        var scroll = base.closest('.' + attrs.snStickyHover);
        var hovering = false;
        base.hide();
        container.on('mouseover', function () {
          positionIcon();
          hovering = true;
          base.show();
          scroll.on('scroll', onScroll);
        });
        container.on('mouseleave', function () {
          hovering = false;
          base.hide();
          scroll.off('scroll', onScroll);
        });
        container.on('click', function () {
          $timeout(function () {
            positionIcon();
          });
        });
        function onScroll() {
          if (hovering) positionIcon();
        }
        function positionIcon() {
          var leftOffset =
            parseInt(scroll[0].clientWidth) - 20 + scroll.scrollLeft();
          var styles = {
            left: leftOffset + 'px',
            display: 'inline',
          };
          base.css(styles);
        }
      },
    };
  },
]);
