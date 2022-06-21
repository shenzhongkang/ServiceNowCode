/*! RESOURCE: /scripts/app.$sp/directive.spRichTextLabel.js */
angular
  .module('sn.$sp')
  .directive('spRichTextLabel', function ($sce, cabrillo, getTemplateUrl) {
    return {
      scope: {
        field: '=',
      },
      templateUrl: getTemplateUrl('sp_rich_text_label.xml'),
      restrict: 'E',
      replace: true,
      controller: function ($scope) {
        $scope.trustAsHtml = function (html) {
          return $sce.trustAsHtml(html);
        };
        $scope.isNative = cabrillo.isNative();
      },
    };
  });
