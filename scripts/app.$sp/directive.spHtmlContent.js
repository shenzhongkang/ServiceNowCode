/*! RESOURCE: /scripts/app.$sp/directive.spHtmlContent.js */
angular.module('sn.$sp').directive('spHtmlContent', function ($sce, $compile) {
  return {
    template: '<p ng-bind-html="trustAsHtml(model)"></p>',
    restrict: 'E',
    replace: true,
    scope: {
      model: '=',
    },
    link: function (scope, element, attrs, controller) {
      scope.trustAsHtml = $sce.trustAsHtml;
      scope.$watch('model', function () {
        Prism.highlightAll();
        element.find('img').each(function (index, el) {
          if (!el.hasAttribute('role') && !el.getAttribute('alt'))
            el.setAttribute('role', 'presentation');
        });
      });
    },
  };
});
