/*! RESOURCE: /scripts/app.ngbsm/factory.bsmAccessibility.js */
angular
  .module('sn.ngbsm')
  .factory('bsmAccessibility', function ($rootScope, bsmGraph, d3) {
    'use strict';
    var accessibility = {
      navigate: false,
      enabled: window.NOW['IS_ACCESSIBILITY_ENABLED'],
    };
    var currentFocus = {
      link: 0,
      node: 0,
      links: [],
      nodes: [],
      type: 'node',
      lastElement: null,
      nodeProperty: -1,
      tabOrder: [],
      currentTab: 0,
      currentNode: function () {
        return this.getNode(this.node);
      },
      currentLink: function () {
        return this.getLink(this.link);
      },
      getLink: function (linkIndex) {
        if (typeof this.links[linkIndex] === 'undefined') return undefined;
        return bsmGraph.current().links[this.links[linkIndex]];
      },
      getNode: function (nodeIndex) {
        if (typeof this.nodes[nodeIndex] === 'undefined') return undefined;
        return bsmGraph.current().nodes[this.nodes[nodeIndex]];
      },
      currentDatum: function () {
        return this.type === 'node' ? this.currentNode() : this.currentLink();
      },
      focus: focusOnElement,
      tabTo: function (index) {
        if (this.tabOrder[index]) {
          this.link = 0;
          this.node = 0;
          var datum = d3.select(this.tabOrder[index]).datum();
          if (typeof datum.nodeId !== 'undefined') {
            currentFocus.type = 'node';
            currentFocus.nodeProperty = -1;
            this.nodes = [datum.nodeId];
          } else {
            currentFocus.type = 'link';
            currentFocus.nodeProperty = -1;
            var graphLinks = bsmGraph.current().links;
            for (var i = 0; i < graphLinks.length; i++) {
              if (graphLinks[i] === datum) {
                this.links = [i];
                break;
              }
            }
          }
          this.focus(datum);
        }
      },
      reset: function (datum) {
        var current = this.currentDatum();
        if (!(current && current.isReachable) || datum) {
          this.link = 0;
          this.node = 0;
          this.nodes = [];
          this.links = [];
          this.type = 'node';
          this.lastElement = null;
          this.nodeProperty = -1;
          this.nodes.push((datum || bsmGraph.current().root).nodeId);
        }
        if (accessibility.enabled) {
          this.tabOrder = getTabOrder();
          this.currentTab = findTabPosFromElement(
            getElementFromDatum(this.currentDatum())
          );
        }
      },
      datumGet: getElementFromDatum,
    };
    function focusOnElement(datum) {
      var found = getElementFromDatum(datum);
      if (found) {
        currentFocus.nodeProperty = -1;
        cbFocus(found);
        if (typeof datum.nodeId !== 'undefined') {
          currentFocus.type = 'node';
        } else {
          currentFocus.type = 'link';
        }
        $rootScope.$broadcast('ngbsm.svg_element_focus', datum);
        currentFocus.lastElement = datum;
        currentFocus.currentTab = findTabPosFromElement(found);
      }
    }
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
    function findTabPosFromElement(elem) {
      var found;
      for (var i = 0; i < currentFocus.tabOrder.length; i++) {
        if (elem === currentFocus.tabOrder[i]) {
          found = i;
          break;
        }
      }
      return found;
    }
    function siblingMove(dir) {
      var type = currentFocus.type;
      if (type === 'node') {
        if (dir === 'right') {
          currentFocus.node++;
          if (currentFocus.node === currentFocus.nodes.length) {
            currentFocus.node = 0;
          }
        } else {
          currentFocus.node--;
          if (currentFocus.node < 0) {
            currentFocus.node = currentFocus.nodes.length - 1;
          }
        }
        focusOnElement(currentFocus.currentNode());
      } else if (type === 'link') {
        if (dir === 'right') {
          currentFocus.link++;
          if (currentFocus.link === currentFocus.links.length) {
            currentFocus.link = 0;
          }
        } else {
          currentFocus.link--;
          if (currentFocus.link < 0) {
            currentFocus.link = currentFocus.links.length - 1;
          }
        }
        focusOnElement(currentFocus.currentLink());
      }
    }
    function nodePropertyMove(dir) {
      if (currentFocus.type === 'node') {
        var node = currentFocus.currentNode();
        var elem = getElementFromDatum(node);
        var tabs = d3.select(elem).selectAll('[tabindex]')[0];
        currentFocus.nodeProperty += dir === 'next' ? 1 : -1;
        if (tabs[currentFocus.nodeProperty]) {
          cbFocus(tabs[currentFocus.nodeProperty]);
          return true;
        }
      }
      return false;
    }
    function hierarchyMove(dir) {
      var type = currentFocus.type;
      var node;
      if (type === 'node') {
        var links = getNodeLinks(dir);
        node = currentFocus.currentNode();
        if (links.length) {
          currentFocus.links = links;
          currentFocus.type = 'link';
          for (var i = 0; i < currentFocus.links.length; i++) {
            if (
              currentFocus.getLink(i)[dir === 'up' ? 'target' : 'source'] ===
              node.nodeId
            ) {
              currentFocus.link = i;
            }
          }
          focusOnElement(currentFocus.currentLink());
        }
      } else if (type === 'link') {
        var link = currentFocus.currentLink();
        node = bsmGraph.current().nodes.filter(function (elem) {
          return link[dir === 'up' ? 'source' : 'target'] === elem.nodeId;
        })[0];
        var nodes = getLinkNodes(dir);
        if (nodes.length) {
          currentFocus.nodes = nodes;
          currentFocus.type = 'node';
          for (var i = 0; i < currentFocus.nodes.length; i++) {
            if (currentFocus.nodes[i] === node.nodeId) {
              currentFocus.node = i;
            }
          }
          focusOnElement(currentFocus.currentNode());
        }
      }
    }
    function tab(e) {
      if (!nodePropertyMove(e.shiftKey ? 'prev' : 'next')) {
        var currentTab = currentFocus.currentTab;
        if (e.shiftKey) {
          currentTab--;
          if (currentTab < 0) {
            currentTab = currentFocus.tabOrder.length - 1;
          }
        } else {
          currentTab++;
          if (currentTab === currentFocus.tabOrder.length) {
            currentTab = 0;
          }
        }
        currentFocus.tabTo(currentTab);
      }
    }
    function getNodeLinks(dir) {
      var links = [];
      var graphLinks = bsmGraph.current().links;
      var node = currentFocus.currentNode();
      for (var i = 0; i < graphLinks.length; i++) {
        var elem = graphLinks[i];
        if (
          (dir === 'up' ? elem.target : elem.source) === node.nodeId &&
          elem.isReachable
        ) {
          links.push(i);
        }
      }
      links.sort(function (a, b) {
        return (
          getTabValue(getElementFromDatum(bsmGraph.current().links[a])) -
          getTabValue(getElementFromDatum(bsmGraph.current().links[b]))
        );
      });
      return links;
    }
    function getLinkNodes(dir) {
      var nodes = [];
      var nodeIds = [];
      var graphNodes = bsmGraph.current().nodes;
      var graphlinks = bsmGraph.current().links;
      var link = currentFocus.currentLink();
      for (var j = 0; j < graphlinks.length; j++) {
        var l = graphlinks[j];
        var found;
        if (
          (dir === 'up' ? l.target : l.source) ===
          (dir === 'up' ? link.target : link.source)
        ) {
          var nodeId = dir === 'up' ? l.source : l.target;
          if ((bsmGraph.current().nodes[nodeId] || {}).isReachable) {
            nodeIds.push(nodeId);
          }
        }
      }
      for (var i = 0; i < graphNodes.length; i++) {
        var elem = graphNodes[i];
        if (nodeIds.indexOf(elem.nodeId) + 1) {
          nodes.push(i);
        }
      }
      nodes.sort(function (a, b) {
        return (
          getTabValue(getElementFromDatum(bsmGraph.current().nodes[a])) -
          getTabValue(getElementFromDatum(bsmGraph.current().nodes[b]))
        );
      });
      return nodes;
    }
    function getTabOrder() {
      return d3
        .select('svg')
        .selectAll('g.node, g.link')[0]
        .filter(function (elem) {
          return d3.select(elem).datum().isReachable;
        })
        .sort(function (a, b) {
          return getTabValue(a) - getTabValue(b);
        });
    }
    function getTabValue(elem) {
      var mode = bsmGraph.current().mode;
      var rect = elem.getBoundingClientRect();
      return mode === 'horizontal'
        ? (rect.left + rect.width / 2) * 100000 + rect.top + rect.height / 2
        : (rect.top + rect.height / 2) * 100000 + rect.left + rect.width / 2;
    }
    function getElementFromDatum(datum) {
      return d3.selectAll('g.node, g.link').filter(function (d) {
        return d.d3id === datum.d3id;
      })[0][0];
    }
    return {
      siblingMove: siblingMove,
      hierarchyMove: hierarchyMove,
      tab: tab,
      state: accessibility,
      currentFocus: currentFocus,
      cbFocus: cbFocus,
    };
  });