/*! RESOURCE: /scripts/app.$sp/directive.spTextarea.js */
angular
  .module('sn.$sp')
  .directive('spTextarea', function ($window, $rootScope) {
    'use strict';
    function autosizeAsync(scope, element) {
      scope.$applyAsync(function () {
        if (scope.field.isVisible()) {
          $window.requestAnimationFrame(function () {
            $window.autosize.update(element);
          });
        }
      });
    }
    return {
      scope: {
        field: '=',
        getGlideForm: '&glideForm',
      },
      require: '^ngModel',
      template:
        '<textarea sp-ignore-composition="" ng-attr-placeholder="{{field.placeholder}}" style="resize:vertical;" aria-required="{{field.isMandatory()}}"/>',
      restrict: 'E',
      replace: true,
      link: function (scope, element, attr, ngModel) {
        $window.autosize(element);
        var render0 = ngModel.$render;
        ngModel.$render = function () {
          render0();
          autosizeAsync(scope, element);
        };
        var isHiddenOnRender = !scope.field.isVisible();
        var resizeCallback = function () {
          if (scope.field.isVisible()) autosizeAsync(scope, element);
        };
        if (isHiddenOnRender) {
          $rootScope.$on('field.change', resizeCallback);
        }
        $rootScope.$on('sp.components.resize', resizeCallback);
        var g_form = scope.getGlideForm();
        g_form.$private.events.on(
          'propertyChange',
          function (type, fieldName, propertyName, propertyValue) {
            if (fieldName !== scope.field.name) return;
            if (type === 'FIELD' && propertyName === 'visible' && propertyValue)
              autosizeAsync(scope, element);
          }
        );
      },
    };
  });
