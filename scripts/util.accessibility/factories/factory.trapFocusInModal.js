/*! RESOURCE: /scripts/util.accessibility/factories/factory.trapFocusInModal.js */
angular
  .module('sn.accessibility')
  .factory('trapFocusInModal', function ($timeout) {
    'use strict';
    var previousElement = null;
    function getActiveElement() {
      return previousElement;
    }
    function saveActiveElement(activeElement) {
      if (activeElement !== null && activeElement !== undefined) {
        previousElement = activeElement;
        previousElement.blur();
      }
    }
    function activateFocusTrap(modal, _focusTrap) {
      if (_focusTrap || !window.focusTrap) return;
      _focusTrap = focusTrap(modal[0], {
        clickOutsideDeactivates: true,
      });
      _focusTrap.activate();
      return _focusTrap;
    }
    function deactivateFocusTrap(_focusTrap, setFocusBackToElement) {
      if (!_focusTrap || !window.focusTrap) return;
      _focusTrap.deactivate();
      if (setFocusBackToElement === undefined) setFocusBack();
      _focusTrap = null;
    }
    function setFocusBack(activeElement) {
      $timeout(function () {
        var currentFocus = angular.element(document.activeElement)[0];
        currentFocus.blur();
        if (activeElement !== null && activeElement !== undefined) {
          activeElement.focus();
        } else if (previousElement !== null && previousElement !== undefined) previousElement.focus();
        previousElement = null;
      });
    }
    return {
      getActiveElement: getActiveElement,
      saveActiveElement: saveActiveElement,
      activateFocusTrap: activateFocusTrap,
      deactivateFocusTrap: deactivateFocusTrap,
      setFocusBack: setFocusBack,
    };
  });