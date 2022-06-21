/*! RESOURCE: /scripts/lib/focus-trap/focus-trap.js */
(function () {
  var listeningFocusTrap = null;
  function focusTrap(element, userOptions) {
    var tabbableNodes = [];
    var nodeFocusedBeforeActivation = null;
    var active = false;
    var container =
      typeof element === 'string' ? document.querySelector(element) : element;
    var config = userOptions || {};
    config.returnFocusOnDeactivate =
      userOptions && userOptions.returnFocusOnDeactivate != undefined
        ? userOptions.returnFocusOnDeactivate
        : true;
    config.escapeDeactivates =
      userOptions && userOptions.escapeDeactivates != undefined
        ? userOptions.escapeDeactivates
        : true;
    var trap = {
      activate: activate,
      deactivate: deactivate,
      pause: removeListeners,
      unpause: addListeners,
    };
    return trap;
    function activate(activateOptions) {
      var defaultedActivateOptions = {
        onActivate:
          activateOptions && activateOptions.onActivate !== undefined
            ? activateOptions.onActivate
            : config.onActivate,
      };
      active = true;
      nodeFocusedBeforeActivation = getFocusedElement();
      if (defaultedActivateOptions.onActivate) {
        defaultedActivateOptions.onActivate();
      }
      addListeners();
      return trap;
    }
    function deactivate(deactivateOptions) {
      var defaultedDeactivateOptions = {
        returnFocus:
          deactivateOptions && deactivateOptions.returnFocus != undefined
            ? deactivateOptions.returnFocus
            : config.returnFocusOnDeactivate,
        returnFocusTo: deactivateOptions && deactivateOptions.returnFocusTo,
        onDeactivate:
          deactivateOptions && deactivateOptions.onDeactivate !== undefined
            ? deactivateOptions.onDeactivate
            : config.onDeactivate,
      };
      removeListeners();
      if (defaultedDeactivateOptions.onDeactivate) {
        defaultedDeactivateOptions.onDeactivate();
      }
      if (defaultedDeactivateOptions.returnFocus) {
        setTimeout(function () {
          tryFocus(
            defaultedDeactivateOptions.returnFocusTo ||
              nodeFocusedBeforeActivation
          );
        }, 0);
      }
      active = false;
      return this;
    }
    function addListeners() {
      if (!active) return;
      if (listeningFocusTrap) {
        listeningFocusTrap.pause();
      }
      listeningFocusTrap = trap;
      updateTabbableNodes();
      tryFocus(firstFocusNode());
      document.addEventListener('focus', checkFocus, true);
      document.addEventListener('click', checkClick, true);
      document.addEventListener('mousedown', checkPointerDown, true);
      document.addEventListener('touchstart', checkPointerDown, true);
      document.addEventListener('keydown', checkKey, true);
      return trap;
    }
    function removeListeners() {
      if (!active || !listeningFocusTrap) return;
      document.removeEventListener('focus', checkFocus, true);
      document.removeEventListener('click', checkClick, true);
      document.removeEventListener('mousedown', checkPointerDown, true);
      document.removeEventListener('touchstart', checkPointerDown, true);
      document.removeEventListener('keydown', checkKey, true);
      listeningFocusTrap = null;
      return trap;
    }
    function firstFocusNode() {
      var node;
      if (!config.initialFocus) {
        node = tabbableNodes[0];
        if (!node) {
          throw new Error(
            "You can't have a focus-trap without at least one focusable element"
          );
        }
        return node;
      }
      node =
        typeof config.initialFocus === 'string'
          ? document.querySelector(config.initialFocus)
          : config.initialFocus;
      if (!node) {
        throw new Error('`initialFocus` refers to no known node');
      }
      return node;
    }
    function checkPointerDown(e) {
      if (config.clickOutsideDeactivates) {
        deactivate({ returnFocus: false });
      }
    }
    function checkClick(e) {
      if (config.clickOutsideDeactivates) return;
      var composedPath = getEventPath(e);
      if (composedPath.indexOf(container) >= 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
    }
    function checkFocus(e) {
      if (config.focusOutsideDeactivates === false) return;
      var composedPath = getEventPath(e);
      var target = composedPath[0];
      if (composedPath.indexOf(container) >= 0) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      target.blur();
    }
    function checkKey(e) {
      if (e.key === 'Tab' || e.keyCode === 9) {
        handleTab(e);
      }
      if (config.escapeDeactivates !== false && isEscapeEvent(e)) {
        deactivate();
      }
    }
    function handleTab(e) {
      e.preventDefault();
      updateTabbableNodes();
      var target = getEventPath(e)[0];
      var currentFocusIndex = tabbableNodes.indexOf(target);
      var lastTabbableNode = tabbableNodes[tabbableNodes.length - 1];
      var firstTabbableNode = tabbableNodes[0];
      if (e.shiftKey) {
        if (
          target === firstTabbableNode ||
          tabbableNodes.indexOf(target) === -1
        ) {
          return tryFocus(lastTabbableNode);
        }
        return tryFocus(tabbableNodes[currentFocusIndex - 1]);
      }
      if (target === lastTabbableNode) return tryFocus(firstTabbableNode);
      tryFocus(tabbableNodes[currentFocusIndex + 1]);
    }
    function updateTabbableNodes() {
      tabbableNodes = tabbable(container);
    }
  }
  function isEscapeEvent(e) {
    return e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
  }
  function tryFocus(node) {
    if (!node || !node.focus) return;
    node.focus();
    if (node.tagName.toLowerCase() === 'input') {
      node.select();
    }
  }
  function getFocusedElement() {
    var activeElement = document.activeElement;
    if (!activeElement || activeElement === document.body) {
      return;
    }
    var getShadowActiveElement = function (element) {
      if (element.shadowRoot && element.shadowRoot.activeElement) {
        element = getShadowActiveElement(element.shadowRoot.activeElement);
      }
      return element;
    };
    return getShadowActiveElement(activeElement);
  }
  function getEventPath(evt) {
    return (
      evt.path ||
      (evt.composedPath && evt.composedPath()) ||
      composedPath(evt.target)
    );
  }
  function composedPath(el) {
    var path = [];
    while (el) {
      if (el.shadowRoot) {
        if (el.shadowRoot.activeElement) {
          path.push(el.shadowRoot.activeElement);
        }
        path.push(el.shadowRoot);
      }
      path.push(el);
      if (el.tagName === 'HTML') {
        path.push(document);
        path.push(window);
        break;
      }
      el = el.parentElement;
    }
    return path;
  }
  window.focusTrap = focusTrap;
})();
