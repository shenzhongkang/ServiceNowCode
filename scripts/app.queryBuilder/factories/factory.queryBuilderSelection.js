/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderSelection.js */
angular.module('sn.queryBuilder').factory('queryBuilderSelection', [
  'CONSTQB',
  'd3',
  '$timeout',
  function (CONST, d3, $timeout) {
    'use strict';
    var makingSelection = false;
    var currentSelection = {
      nodes: [],
      connections: [],
    };
    var selectionBox = {};
    var boxElem;
    var previousOffsetX;
    var previousOffsetY;
    updateSelectionBox(0, 0, 0, 0);
    function _makingSelection() {
      return makingSelection;
    }
    function _onSelectionStart(event, graph) {
      if (!makingSelection) {
        makingSelection = true;
        var overSvg = event.target.className.baseVal === 'connection-svg';
        var coords = {
          x: overSvg ? event.offsetX : event.offsetX - graph.canvasXOffset,
          y: overSvg ? event.offsetY : event.offsetY - graph.canvasYOffset,
        };
        previousOffsetX = event.pageX;
        previousOffsetY = event.pageY;
        updateSelectionBox(coords.x, coords.y, coords.x, coords.y);
      }
    }
    function _onSelectionChange(event, graph) {
      if (makingSelection) {
        var coords = {
          x: selectionBox.x2 + (event.pageX - previousOffsetX),
          y: selectionBox.y2 + (event.pageY - previousOffsetY),
        };
        previousOffsetX = event.pageX;
        previousOffsetY = event.pageY;
        updateSelectionBox(
          selectionBox.x1,
          selectionBox.y1,
          coords.x,
          coords.y
        );
        getElementsInSelectionBox(graph);
      }
    }
    function _onSelectionStop() {
      if (makingSelection) makingSelection = false;
      boxElem = d3
        .selectAll('g.selection')
        .selectAll('rect')
        .classed('active', false);
    }
    function _getSelection() {
      return currentSelection;
    }
    function _getSelectionBox() {
      return selectionBox;
    }
    function _clearSelection() {
      for (var i = 0; i < currentSelection.nodes.length; i++)
        currentSelection.nodes[i].touched = false;
      for (var i = 0; i < currentSelection.connections.length; i++)
        currentSelection.connections[i].info.touched = false;
      currentSelection = {
        nodes: [],
        connections: [],
      };
    }
    function _hasSelection() {
      return currentSelection.nodes.length > 0;
    }
    function _nodeInSelection(node) {
      for (var i = 0; i < currentSelection.nodes.length; i++) {
        if (currentSelection.nodes[i].nodeId === node.nodeId) return true;
      }
      return false;
    }
    function _connectionInSelection(conn) {
      for (var i = 0; i < currentSelection.connections.length; i++) {
        if (currentSelection.connections[i].id === conn.id) return true;
      }
      return false;
    }
    function _manuallySelectNode(node, connections) {
      var currentIndex = currentSelection.nodes.indexOf(node);
      if (currentIndex > -1) {
        node.touched = false;
        currentSelection.nodes.splice(currentIndex, 1);
        makingSelection = currentSelection.nodes.length > 0 ? true : false;
        checkConnections(connections);
      } else {
        node.touched = true;
        currentSelection.nodes.push(node);
        checkConnections(connections);
      }
    }
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
      boxElem = d3
        .selectAll('g.selection')
        .selectAll('rect')
        .classed('active', makingSelection)
        .attr('x', selectionBox.x)
        .attr('y', selectionBox.y)
        .attr('width', selectionBox.w)
        .attr('height', selectionBox.h);
    }
    function getElementsInSelectionBox(graph) {
      _clearSelection();
      for (var i = 0; i < graph.nodes.length; i++) {
        if (isNodeInSelectionBox(graph.nodes[i])) {
          currentSelection.nodes.push(graph.nodes[i]);
          graph.nodes[i].touched = true;
        }
      }
      for (var i = 0; i < graph.connections.length; i++) {
        if (isConnectionInSelectionBox(graph.connections[i])) {
          currentSelection.connections.push(graph.connections[i]);
          graph.connections[i].info.touched = true;
        }
      }
    }
    function isNodeInSelectionBox(node) {
      var minX = selectionBox.x;
      var minY = selectionBox.y;
      var maxX = selectionBox.x + selectionBox.w;
      var maxY = selectionBox.y + selectionBox.h;
      var right = node.x + node.divWidth;
      var bottom = node.y + node.divHeight;
      if (
        pointInSelection(node.x, node.y) ||
        pointInSelection(right, node.y) ||
        pointInSelection(right, bottom) ||
        pointInSelection(node.x, bottom)
      )
        return true;
      else if (minX >= node.x && minX <= right) {
        if (minY >= node.y && minY <= bottom) return true;
        else if (maxY >= node.y && maxY <= bottom) return true;
        else if (minY < node.y && maxY > bottom) return true;
      } else if (node.x >= minX && node.x <= maxX) {
        if (minY >= node.y && minY <= bottom)
          return checkMiddleSelection(node, minX, maxX, minY, maxY);
      }
      return false;
    }
    function isConnectionInSelectionBox(conn) {
      var hasFirstNode = _nodeInSelection(conn.info.first);
      var hasSecondNode = _nodeInSelection(conn.info.second);
      var trueParentIncluded = false;
      var parent = conn.info.first;
      var trueChildIncluded = false;
      var child = conn.info.second;
      if (parent.nodeType === CONST.NODETYPE.OPERATOR) {
        var parents = getAllParents(parent);
        if (parents) {
          if (parents.length === 1) {
            if (_nodeInSelection(parents[0])) trueParentIncluded = true;
          } else if (parents.length > 1) {
            for (var i = 0; i < parents.length; i++) {
              if (_nodeInSelection(parents[i])) trueParentIncluded = true;
            }
          }
        }
      } else {
        trueParentIncluded = true;
      }
      if (child.nodeType === CONST.NODETYPE.OPERATOR) {
        var children = getAllChildren(child);
        if (children) {
          if (children.length === 1) {
            if (_nodeInSelection(children[0])) trueChildIncluded = true;
          } else if (children.length > 1) {
            for (var i = 0; i < children.length; i++) {
              if (_nodeInSelection(children[i])) trueChildIncluded = true;
            }
          }
        }
      } else trueChildIncluded = true;
      if (
        hasFirstNode &&
        hasSecondNode &&
        trueParentIncluded &&
        trueChildIncluded
      )
        return true;
      return false;
    }
    function getAllParents(parent) {
      var parents = [];
      for (var i = 0; i < parent.leftConnections.length; i++) {
        parents.push(parent.leftConnections[i]);
      }
      return parents;
    }
    function getAllChildren(child) {
      var children = [];
      for (var i = 0; i < child.rightConnections.length; i++) {
        children.push(child.rightConnections[i]);
      }
      return children;
    }
    function checkMiddleSelection(node, minX, maxX, minY, maxY) {
      if (minX >= node.x && minX <= node.x + node.divWidth) return true;
      else if (maxX >= node.x && maxX <= node.x + node.divWidth) return true;
      else if (minX < node.x && maxX > node.x + node.divWidth) return true;
      return false;
    }
    function pointInSelection(x, y) {
      var minX = selectionBox.x;
      var minY = selectionBox.y;
      var maxX = selectionBox.x + selectionBox.w;
      var maxY = selectionBox.y + selectionBox.h;
      if (x >= minX && x <= maxX && y >= minY && y <= maxY) return true;
      return false;
    }
    function checkConnections(connections) {
      for (var i = 0; i < connections.length; i++) {
        var firstIndex = currentSelection.nodes.indexOf(
          getTrueParent(connections[i].info.first)
        );
        var secondIndex = currentSelection.nodes.indexOf(
          getTrueChild(connections[i].info.second)
        );
        var isFirstOperator =
          connections[i].info.first.nodeType === CONST.NODETYPE.OPERATOR;
        var isSecondOperator =
          connections[i].info.second.nodeType === CONST.NODETYPE.OPERATOR;
        var connectionIndex = currentSelection.connections.indexOf(
          connections[i]
        );
        if (firstIndex > -1 && secondIndex > -1) {
          if (connectionIndex === -1) {
            if (isFirstOperator) {
              var firstOpIndex = currentSelection.nodes.indexOf(
                connections[i].info.first
              );
              if (firstOpIndex === -1) {
                connections[i].info.first.touched = true;
                currentSelection.nodes.push(connections[i].info.first);
              }
            }
            if (isSecondOperator) {
              var secondOpIndex = currentSelection.nodes.indexOf(
                connections[i].info.second
              );
              if (secondOpIndex === -1) {
                connections[i].info.second.touched = true;
                currentSelection.nodes.push(connections[i].info.second);
              }
            }
            connections[i].info.touched = true;
            currentSelection.connections.push(connections[i]);
          }
        } else {
          if (connectionIndex > -1) {
            if (isFirstOperator) {
              var firstOpIndex = currentSelection.nodes.indexOf(
                connections[i].info.first
              );
              if (firstOpIndex > -1) {
                connections[i].info.first.touched = false;
                currentSelection.nodes.splice(firstOpIndex, 1);
                makingSelection =
                  currentSelection.nodes.length > 0 ? true : false;
              }
            }
            if (isSecondOperator) {
              var secondOpIndex = currentSelection.nodes.indexOf(
                connections[i].info.second
              );
              if (secondOpIndex > -1) {
                connections[i].info.second.touched = false;
                currentSelection.nodes.splice(secondOpIndex, 1);
                makingSelection =
                  currentSelection.nodes.length > 0 ? true : false;
              }
            }
            connections[i].info.touched = false;
            currentSelection.connections.splice(connectionIndex, 1);
          }
        }
      }
    }
    function getTrueParent(parent) {
      while (parent && parent.nodeType === CONST.NODETYPE.OPERATOR) {
        parent = parent.leftConnections[0];
      }
      if (parent && parent.nodeType != CONST.NODETYPE.OPERATOR) return parent;
      return null;
    }
    function getTrueChild(child) {
      while (child && child.nodeType === CONST.NODETYPE.OPERATOR) {
        child = child.rightConnections[0];
      }
      if (child && child.nodeType != CONST.NODETYPE.OPERATOR) return child;
      return null;
    }
    return {
      makingSelection: _makingSelection,
      onSelectionStart: _onSelectionStart,
      onSelectionChange: _onSelectionChange,
      onSelectionStop: _onSelectionStop,
      getSelection: _getSelection,
      getSelectionBox: _getSelectionBox,
      clearSelection: _clearSelection,
      hasSelection: _hasSelection,
      nodeInSelection: _nodeInSelection,
      connectionInSelection: _connectionInSelection,
      manuallySelectNode: _manuallySelectNode,
    };
  },
]);
