/*! RESOURCE: /scripts/service-portal-designer/columns/item_hover.directive.js */
(function () {
  'use strict';
  angular.module('spd_item_hover', []).directive('itemHoverMenu', function () {
    function link(scope, element) {
      element.on('mouseenter', function () {
        element.find('.item-edit').css('display', 'inline');
      });
      element.on('mouseleave', function () {
        element.find('.item-edit').css('display', 'none');
      });
    }
    return {
      restrict: 'C',
      link: link,
    };
  });
})();
