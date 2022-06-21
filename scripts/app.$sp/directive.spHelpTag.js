/*! RESOURCE: /scripts/app.$sp/directive.spHelpTag.js */
angular.module('sn.$sp').directive('spHelpTag', function ($sce, i18n) {
  'use strict';
  return {
    restrict: 'E',
    templateUrl: 'sp_help_tag.xml',
    scope: {
      field: '=',
    },
    controller: function ($scope) {
      $scope.trustedHTML = function (html) {
        return $sce.trustAsHtml(html);
      };
    },
    link: function (scope, element) {
      scope.hideHelp = function () {
        scope.field.expand_help = false;
        element[0].firstElementChild.focus();
      };
      scope.getHelpAriaLabel = function () {
        return i18n.format(i18n.getMessage('{h} for {f}'), {
          f: scope.field.label,
          h: scope.field.help_tag,
        });
      };
    },
  };
});
