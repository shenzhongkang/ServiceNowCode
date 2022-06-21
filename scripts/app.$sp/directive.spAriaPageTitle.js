/*! RESOURCE: /scripts/app.$sp/directive.spAriaPageTitle.js */
angular
  .module('sn.$sp')
  .directive('spAriaPageTitle', function (spAriaFocusManager) {
    function link(scope, elem, attr) {
      spAriaFocusManager.registerPageTitleFocus(function (
        focusFirstTabbableEl,
        $event
      ) {
        scope.$applyAsync(function () {
          if (focusFirstTabbableEl) {
            var focusablePageElements = window.tabbable($('main')[0]);
            if (focusablePageElements[0]) {
              focusablePageElements[0].focus();
              $event.stopPropagation();
              return;
            }
          }
          elem.attr('tabIndex', '-1').focus();
        });
      });
    }
    return {
      restrict: 'E',
      replace: true,
      scope: {
        pageTitle: '=',
      },
      template: "<h1 class='sr-only'>{{pageTitle}}</h1>",
      link: link,
    };
  });
