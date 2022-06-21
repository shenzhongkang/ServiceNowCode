/*! RESOURCE: /scripts/service-portal-designer/utils/ignoreKeys.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_ignore_keys_directive', [])
    .directive('ignoreKeys', function () {
      return {
        scope: {
          ignoreKeys: '=',
        },
        require: 'ngModel',
        link: function (scope, element, attr, ctrl) {
          function parser(text) {
            var sanitizedInput = text.replace(scope.ignoreKeys, '');
            if (sanitizedInput !== text) {
              ctrl.$setViewValue(sanitizedInput);
              ctrl.$render();
            }
            return sanitizedInput;
          }
          ctrl.$parsers.push(parser);
        },
      };
    });
})();
