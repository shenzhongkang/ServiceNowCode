/*! RESOURCE: /scripts/app.ngbsm/directive.snFocusTrap.js */
angular.module('sn.ngbsm').directive('snFocusTrap', function () {
  'use strict';
  var focusTrapElements = [];
  function cbFocus(element) {
    if (element.focus) {
      element.focus();
      return element;
    }
    try {
      window.HTMLElement.prototype.focus.call(element);
    } catch (e) {
      svgFocusHack(element);
    }
    return document.activeElement === element ? element : null;
  }
  function svgFocusHack(element) {
    var fragment = document.createElement('div');
    fragment.innerHTML =
      '<svg><foreignObject width="30" height="30"><input type = "text" /></foreignObject></svg>';
    var foreignObject = fragment.firstChild.firstChild;
    element.appendChild(foreignObject);
    var input = foreignObject.querySelector('input');
    input.focus();
    input.disabled = true;
    element.removeChild(foreignObject);
  }
  return {
    restrict: 'A',
    scope: {
      exitOnBlur: '@',
      snFocusTrap: '@',
      openModel: '=',
    },
    link: function (scope, elem, attrs) {
      elem.attr('tabindex', -1);
      elem.attr('aria-label', scope.snFocusTrap);
      if (!window.NOW['IS_ACCESSIBILITY_ENABLED']) {
        elem.css('outline', 'none');
      }
      var getTabs = function () {
        return elem
          .find(':input:visible, a[href]:visible, [tabindex]:visible')
          .not('[tabindex="-1"], [disabled]');
      };
      var currentTabNum = function () {
        var tabs = getTabs();
        var currentFocus = document.activeElement;
        var found = -1;
        for (var i = 0; i < tabs.length; i++) {
          if (tabs[i] === currentFocus) {
            found = i;
          }
        }
        return found;
      };
      var focusTrap = function (e) {
        if (
          !angular.element.contains(elem[0], e.target) &&
          elem[0] !== e.target
        ) {
          if (scope.tabPressed) {
            if (scope.exitOnBlur) {
              focusTrapClose();
            } else {
              cbFocus(elem[0]);
            }
          }
        }
      };
      var focusLoop = function (e) {
        if (e.keyCode === 9) {
          scope.tabPressed = e.shiftKey ? -1 : 1;
          var tabs = getTabs();
          var current = currentTabNum();
          if (!scope.exitOnBlur) {
            if (e.shiftKey && current === 0) {
              e.preventDefault();
              cbFocus(tabs[tabs.length - 1] || elem[0]);
            } else if (!e.shiftKey && current === getTabs().length - 1) {
              e.preventDefault();
              cbFocus(tabs[0] || elem[0]);
            }
          }
          setTimeout(function () {
            scope.tabPressed = false;
          });
        }
      };
      document.addEventListener('focus', focusTrap, true);
      function focusTrapOpen() {
        if (focusTrapElements.length) {
          focusTrapElements[focusTrapElements.length - 1].focus =
            document.activeElement;
        } else {
          focusTrapElements.trigger = document.activeElement;
        }
        focusTrapElements.push({ element: elem[0] });
        document.addEventListener('keydown', focusLoop, true);
        cbFocus(elem[0]);
      }
      function focusTrapClose() {
        document.removeEventListener('keydown', focusLoop, true);
        var found;
        for (var i = 0; i < focusTrapElements.length; i++) {
          if (focusTrapElements[i].element === elem[0]) {
            found = i;
          }
        }
        var isLastFocusTrap = found === focusTrapElements.length - 1;
        focusTrapElements.splice(found, 1);
        if (
          isLastFocusTrap &&
          (angular.element.contains(elem[0], document.activeElement) ||
            document.activeElement === elem[0] ||
            (scope.exitOnBlur && scope.tabPressed))
        ) {
          if (focusTrapElements.length) {
            cbFocus(focusTrapElements[focusTrapElements.length - 1].focus);
          } else {
            cbFocus(focusTrapElements.trigger);
          }
        }
      }
      scope.$watch(
        function () {
          if (typeof attrs.openModel != 'undefined') {
            return scope.openModel;
          } else {
            return isVisible();
          }
        },
        function (switchedOn, oldValue) {
          if (oldValue === switchedOn) return;
          if (switchedOn) {
            focusTrapOpen();
          } else {
            focusTrapClose();
          }
        }
      );
      function isVisible() {
        return elem.is(':visible');
      }
    },
  };
});