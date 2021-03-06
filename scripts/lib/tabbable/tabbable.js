/*! RESOURCE: /scripts/lib/tabbable/tabbable.js */
(function () {
  window.tabbable = function (el, selectorList) {
    var basicTabbables = [];
    var orderedTabbables = [];
    var isHidden = createIsHidden();
    var candidates = el.querySelectorAll(
      selectorList ||
        'input, select, a[href], textarea, button, [tabindex], [contenteditable]:not([contenteditable="false"])'
    );
    var candidate, candidateIndex;
    for (var i = 0, l = candidates.length; i < l; i++) {
      candidate = candidates[i];
      candidateIndex = getTabindex(candidate);
      if (
        candidateIndex < 0 ||
        (candidate.tagName === 'INPUT' && candidate.type === 'hidden') ||
        candidate.disabled ||
        isHidden(candidate)
      ) {
        continue;
      }
      if (candidateIndex === 0) {
        basicTabbables.push(candidate);
      } else {
        orderedTabbables.push({
          tabIndex: candidateIndex,
          node: candidate,
        });
      }
    }
    var tabbableNodes = orderedTabbables
      .sort(function (a, b) {
        return a.tabIndex - b.tabIndex;
      })
      .map(function (a) {
        return a.node;
      });
    Array.prototype.push.apply(tabbableNodes, basicTabbables);
    return tabbableNodes;
  };
  function isContentEditable(node) {
    return node.contentEditable === 'true';
  }
  function getTabindex(node) {
    var tabindexAttr = parseInt(node.getAttribute('tabindex'), 10);
    if (!isNaN(tabindexAttr)) return tabindexAttr;
    if (isContentEditable(node)) return 0;
    return node.tabIndex;
  }
  function createIsHidden() {
    var nodeCache = [];
    return function isHidden(node) {
      if (node === document.documentElement || !node.tagName) return false;
      for (var i = 0, length = nodeCache.length; i < length; i++) {
        if (nodeCache[i][0] === node) return nodeCache[i][1];
      }
      var result = false;
      var style = window.getComputedStyle(node);
      if (style.visibility === 'hidden' || style.display === 'none') {
        result = true;
      } else if (node.parentNode) {
        result = isHidden(node.parentNode);
      }
      nodeCache.push([node, result]);
      return result;
    };
  }
})();
