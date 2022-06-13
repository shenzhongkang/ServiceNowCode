/*! RESOURCE: /scripts/app.ngbsm/factory.bsmSelection.js */
angular
  .module('sn.ngbsm')
  .factory('bsmSelection', function (bsmCamera, bsmGraph, bsmGraphUtilities) {
    'use strict';
    var api = null;
    var makingSelection = false;
    var currentSelection = {
      nodes: [],
      links: [],
    };
    var selectionBox = {};
    updateSelectionBox(0, 0, 0, 0);
    function updateSelectionBox(x1, y1, x2, y2) {
      selectionBox.x1 = x1;
      selectionBox.y1 = y1;
      selectionBox.x2 = x2;
      selectionBox.y2 = y2;
      selectionBox.x =
        selectionBox.x1 > selectionBox.x2 ? selectionBox.x2 : selectionBox.x1;
      selectionBox.y =
        selectionBox.y1 > selectionBox.y2 ? selectionBox.y2 : selectionBox.y1;
      selectionBox.w = Math.abs(selectionBox.x1 - selectionBox.x2);
      selectionBox.h = Math.abs(selectionBox.y1 - selectionBox.y2);
    }
    function getElementsInSelectionBox(graph) {
      clearSelection();
      var minX = selectionBox.x;
      var maxX = selectionBox.x + selectionBox.w;
      var minY = selectionBox.y;
      var maxY = selectionBox.y + selectionBox.h;
      for (var i = 0; i < graph.nodes.length; i++) {
        if (isNodeInSelectionBox(graph.nodes[i]))
          currentSelection.nodes.push(graph.nodes[i]);
      }
      for (var i = 0; i < graph.links.length; i++) {
        if (
          isNodeInSelectionBox(graph.nodes[graph.links[i].source]) ||
          isNodeInSelectionBox(graph.nodes[graph.links[i].target])
        )
          currentSelection.links.push(graph.links[i]);
      }
    }
    function isNodeInSelectionBox(node) {
      if (node.x > selectionBox.x && node.x < selectionBox.x + selectionBox.w)
        if (node.y > selectionBox.y && node.y < selectionBox.y + selectionBox.h)
          return true;
      return false;
    }
    function clearSelection() {
      currentSelection = {
        nodes: [],
        links: [],
      };
    }
    function selectSingleNode(node) {
      if (api.hasSelection()) {
        bsmGraphUtilities.setPropertyOnGraphElements(
          api.getSelection(),
          'isSelected',
          false
        );
        api.clearSelection();
      }
      currentSelection.nodes = [node];
      currentSelection.links = bsmGraphUtilities.getLinksAttachedToNode(
        bsmGraph.current(),
        node
      );
      bsmGraphUtilities.setPropertyOnGraphElements(
        api.getSelection(),
        'isSelected',
        true
      );
    }
    return (api = {
      makingSelection: function () {
        return makingSelection;
      },
      onSelectionStart: function (event) {
        if (!makingSelection) {
          makingSelection = true;
          var coords = bsmCamera.unprojectScreenCoords({
            x: event.x,
            y: event.y,
          });
          updateSelectionBox(coords.x, coords.y, coords.x, coords.y);
        }
      },
      onSelectionChange: function (event, graph) {
        if (makingSelection) {
          var coords = bsmCamera.unprojectScreenCoords({
            x: event.x,
            y: event.y,
          });
          updateSelectionBox(
            selectionBox.x1,
            selectionBox.y1,
            coords.x,
            coords.y
          );
          getElementsInSelectionBox(graph);
        }
      },
      onSelectionEnd: function () {
        if (makingSelection) makingSelection = false;
      },
      getSelection: function () {
        return currentSelection;
      },
      getSelectionBox: function () {
        return selectionBox;
      },
      clearSelection: function () {
        clearSelection();
      },
      hasSelection: function () {
        return currentSelection.nodes.length > 0;
      },
      nodeInSelection: function (node) {
        for (var i = 0; i < currentSelection.nodes.length; i++) {
          if (currentSelection.nodes[i] === node) return true;
        }
        return false;
      },
      select: function (node) {
        selectSingleNode(node);
      },
    });
  });