/*! RESOURCE: /scripts/app.$sp/directive.spIgnoreComposition.js */
angular.module('sn.$sp').directive('spIgnoreComposition', function () {
  return {
    restrict: 'A',
    link: function postLink(scope, element) {
      var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
      if (isIE11) element.off('compositionstart').off('compositionend');
    },
  };
});
