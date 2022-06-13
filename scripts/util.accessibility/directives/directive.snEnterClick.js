/*! RESOURCE: /scripts/util.accessibility/directives/directive.snEnterClick.js */
angular
  .module('sn.accessibility')
  .directive('snEnterClick', function ($timeout) {
    'use strict';
    return {
      restrict: 'A',
      link: function (scope, elm, attr) {
        elm.bind('keypress', function (event) {
          if (event && event.which === 13) {
            if (attr.snEnterClick) {
              var target = elm[0].querySelector(attr.snEnterClick);
              if (target) target.click();
            } else elm[0].click();
          }
        });
      },
    };
  });