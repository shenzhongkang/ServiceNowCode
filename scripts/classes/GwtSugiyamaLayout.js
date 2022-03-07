/*! RESOURCE: /scripts/classes/GwtSugiyamaLayout.js */
var GwtSugiyamaLayout = Class.create(GwtDiagramLayout, {
  initialize: function (diagram, overrideLayout) {
    GwtDiagramLayout.prototype.initialize.call(this, diagram);
    this.gridAreaSize = -100;
    this.rowHeights = new Array();
    this.colWidths = new Array();
    this.setSpacing(new GwtPoint(25, 15));
    this.flushToOrigin = false;
    this.vertical = false;
    this.overrideLayout = overrideLayout;
    this.visitedNodes = {};
  },
  repositionNodes: function (nodes) {
    var nodeMap = {};
    for (var key in nodes) {
      var node = nodes[key];
      var x = node.getX() + '';
      if (!nodeMap[x]) nodeMap[x] = [];
      nodeMap[x].push(node);
    }
    for (var key in nodeMap) {
      var nodePositions = [];
      var nodesByPosition = {};
      var nodes = nodeMap[key];
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        var posString = this._padString(5, node.getY() + '', '0');
        nodePositions.push(posString);
        nodesByPosition[posString] = node;
      }
      nodePositions.sort();
      for (var i = 1; i < nodePositions.length; i++) {
        var node = nodesByPosition[nodePositions[i]];
        var higherNode = nodesByPosition[nodePositions[i - 1]];
        node.moveTo(
          node.getX(),
          higherNode.getY() + higherNode.getContainer().getHeight() + 10
        );
      }
    }
  },
  _padString: function (width, str, pad) {
    var ret = str;
    for (var i = 0; i < width - str.length; i++) ret = pad + ret;
    return ret;
  },
  apply: function (graph) {
    var layout = 'sugiyamah';
    if (this.overrideLayout == null || this.overrideLayout == '') {
      layout = this.diagram.getData('layout');
      if (!layout) layout = 'sugiyamah';
    } else layout = this.overrideLayout;
    this.diagram.layoutStyle = layout;
    if (layout == 'custom') return;
    this.graph = graph;
    if (layout == 'sugiyamav') this.setVertical(true);
    else this.setVertical(false);
    this.computeEdges();
    var s = new Date();
    var levels = this.getLevels();
    this.setTotalTime('Layout getLevels', s);
    this._addSkippedNodes(levels);
    s = new Date();
    this.populateWrappers(levels);
    this.setTotalTime('Layout populateWrappers', s);
    s = new Date();
    this.solveEdgeCrosses(levels);
    this.setTotalTime('Layout solveEdgeCrosses', s);
    s = new Date();
    this.moveToBarycenter(levels);
    this.setTotalTime('Layout moveToBarycenter', s);
    s = new Date();
    this.adjustAccordingToSize(levels);
    this.setTotalTime('Layout adjustAccordingToSize', s);
    s = new Date();
    this.positionNodes(levels);
    this.setTotalTime('Layout positioning', s);
  },
  _addSkippedNodes: function (levels) {
    var nodes = this.graph.getNodesAsArray();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (!node.getData('SUGIYAMA_VISITED') && node.getID() != this.getFocus())
        levels[0].push(node);
    }
  },
  adjustAccordingToSize: function (levels) {
    for (var r = 0; r < levels.length; r++) {
      var level = levels[r];
      for (var c = 0; c < level.length; c++) {
        var wrapper = level[c];
        var node = wrapper.getNode();
        var row = 0;
        var col = 0;
        if (this.vertical) {
          row = r;
          col = wrapper.getGridPosition();
        } else {
          row = wrapper.getGridPosition();
          col = r;
        }
        this.rowHeights[row] = this.nodeHeight;
        this.colWidths[col] = this.nodeWidth;
      }
    }
  },
  positionNodes: function (levels) {
    var min = this.flushToOrigin
      ? new GwtPoint(0, 0)
      : this.findMinimumAndSpacing();
    for (var r = 0; r < levels.length; r++) {
      var level = levels[r];
      for (var c = 0; c < level.length; c++) {
        var wrapper = level[c];
        var node = wrapper.getNode();
        if (this.visitedNodes[node.getID()]) continue;
        node.wrapper = null;
        node.removeData('SUGIYAMA_VISITED');
        wrapper.setNode(null);
        var x = 0;
        var y = 0;
        if (this.vertical) {
          x = wrapper.getGridPosition();
          y = r;
        } else {
          x = r;
          y = wrapper.getGridPosition();
        }
        x = this.getColumnOffset(x, node);
        y = this.getRowOffset(y, node);
        node.moveTo(x + min.getX(), y + min.getY());
        this.visitedNodes[node.getID()] = node.getID();
      }
    }
  },
  findMinimumAndSpacing: function () {
    var min_x = 50;
    var min_y = 50;
    var nodes = this.graph.getNodesAsArray();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getX() < min_x) min_x = node.getX();
      if (node.getY() < min_y) min_y = node.getY();
    }
    return new GwtPoint(min_x, min_y);
  },
  getLevels: function () {
    var levels = [];
    levels[0] = [];
    var n;
    if (this.getFocus()) n = this.graph.getNode(this.getFocus());
    if (n) levels[0].push(n);
    else {
      var rootNodes = this.getRootNodes();
      for (var i = 0; i < rootNodes.length; i++) levels[0].push(rootNodes[i]);
    }
    var downStream = this._fillLevel(levels);
    var upStream = this._fillLevel(levels, true);
    return upStream.concat(downStream.slice(1));
  },
  getRootNodes: function () {
    var rootList = [];
    var nodes = this.graph.getNodesAsArray();
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var edgeInfo = this.getEdgeInfo(node.getID());
      if (edgeInfo.ins.length == 0) rootList.push(node);
    }
    return rootList;
  },
  getRowOffset: function (y, node) {
    var offset = 0;
    var h = this.nodeHeight;
    for (var i = 0; i < y; i++) {
      offset += this.spacing.getY() + this.rowHeights[i];
    }
    if (h < this.rowHeights[y]) {
      var leftOver = this.rowHeights[y] - h;
      var addition = parseInt(leftOver / 2);
      offset += addition;
    }
    return offset;
  },
  getColumnOffset: function (x, node) {
    var offset = 0;
    var w = this.nodeWidth;
    for (var i = 0; i < x; i++) {
      offset += this.spacing.getX() + this.colWidths[i];
    }
    if (w < this.colWidths[x]) {
      var leftOver = this.colWidths[x] - w;
      var addition = parseInt(leftOver / 2);
      offset += addition;
    }
    return offset;
  },
  moveToBarycenter: function (levels) {
    var movementsCurrentLoop = -1;
    this._calculatePriorty();
    this._calculateLevels(levels);
    while (movementsCurrentLoop != 0) {
      movementsCurrentLoop = 0;
      for (var i = 1; i < levels.length; i++) {
        movementsCurrentLoop += this._moveToBarycenter(levels, i);
      }
      for (var i = levels.length - 1; i >= 0; i--) {
        movementsCurrentLoop += this._moveToBarycenter(levels, i);
      }
    }
  },
  populateWrappers: function (levels) {
    for (var i = 0; i < levels.length; i++) {
      var currentLevelList = levels[i];
      for (var n = 0; n < currentLevelList.length; n++) {
        var node = currentLevelList[n];
        var cellwrapper = new CellWrapper(i, n, node);
        currentLevelList[n] = cellwrapper;
        node.wrapper = cellwrapper;
      }
      if (currentLevelList.length > this.gridAreaSize)
        this.gridAreaSize = currentLevelList.length;
    }
  },
  setSpacing: function (spacing) {
    this.spacing = spacing;
  },
  setVertical: function (v) {
    this.vertical = v;
  },
  solveEdgeCrosses: function (levels) {
    var movementsCurrentLoop = -1;
    while (movementsCurrentLoop != 0) {
      movementsCurrentLoop = 0;
      for (var i = 0; i < levels.length - 1; i++) {
        movementsCurrentLoop += this._isolveEdgeCrosses(true, levels, i);
      }
      for (var i = levels.length - 1; i >= 1; i--) {
        movementsCurrentLoop += this._isolveEdgeCrosses(false, levels, i);
      }
    }
  },
  _calculateLevels: function (levels) {
    for (var l = 0; l < levels.length; l++) {
      var level = levels[l];
      for (var j = 0; j < level.length; j++) {
        var wrapper = level[j];
        wrapper.setGridPosition(j);
      }
    }
  },
  _calculatePriorty: function () {
    var nodes = this.graph.getNodesAsArray();
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var wrapper = n.wrapper;
      if (!wrapper) continue;
      var edgeInfo = this.getEdgeInfo(n.getID());
      for (var j = 0; j < edgeInfo.outs.length; j++)
        this._calculatePriorityEdge(edgeInfo.outs[j], n, wrapper);
      for (var j = 0; j < edgeInfo.ins.length; j++)
        this._calculatePriorityEdge(edgeInfo.ins[j], n, wrapper);
    }
  },
  _calculatePriorityEdge: function (node, n, wrapper) {
    if (node.getID() == n.getID()) return;
    var nwrapper = node.wrapper;
    if (!nwrapper || nwrapper == wrapper) return;
    wrapper.priority++;
  },
  _isolveEdgeCrosses: function (down, levels, lindex) {
    var currentLevel = levels[lindex];
    var levelSortBefore = [];
    var movements = 0;
    for (var i = 0; i < currentLevel.length; i++) {
      levelSortBefore[i] = currentLevel[i];
    }
    currentLevel = currentLevel.sort(this._sortCell);
    for (var j = 0; j < levelSortBefore.length; j++) {
      if (
        levelSortBefore[j].getEdgeCrossesIndicator() !=
        currentLevel[j].getEdgeCrossesIndicator()
      )
        movements++;
    }
    for (var j = currentLevel.length - 1; j >= 0; j--) {
      var swrapper = currentLevel[j];
      var node = swrapper.getNode();
      var theKids;
      if (down) theKids = this.getEdgeInfo(node.getID()).outs;
      else theKids = this.getEdgeInfo(node.getID()).ins;
      for (var i = 0; i < theKids.length; i++) {
        var kid = theKids[i];
        var wrapper = kid.wrapper;
        if (wrapper && wrapper.getLevel() > lindex)
          wrapper.addToEdgeCrossesIndicator(swrapper.getEdgeCrossesIndicator());
      }
    }
    return movements;
  },
  _moveToBarycenter: function (levels, levelIndex) {
    var movements = 0;
    var currentLevel = levels[levelIndex];
    for (var cIndex = 0; cIndex < currentLevel.length; cIndex++) {
      var sourceWrapper = currentLevel[cIndex];
      var gridPositionsSum = 0;
      var countNodes = 0;
      var n = sourceWrapper.getNode();
      var edgeInfo = this.getEdgeInfo(n.getID());
      for (var j = 0; j < edgeInfo.outs.length; j++) {
        var node = edgeInfo.outs[j];
        if (node.getID() == n.getID()) continue;
        var nwrapper = node.wrapper;
        if (!nwrapper || nwrapper == sourceWrapper) continue;
        gridPositionsSum += nwrapper.getGridPosition();
        countNodes++;
      }
      for (var j = 0; j < edgeInfo.ins.length; j++) {
        var node = edgeInfo.ins[j];
        if (node.getID() == n.getID()) continue;
        var nwrapper = node.wrapper;
        if (!nwrapper || nwrapper == sourceWrapper) continue;
        gridPositionsSum += nwrapper.getGridPosition();
        countNodes++;
      }
      if (countNodes > 0) {
        var tmp = parseFloat(gridPositionsSum / countNodes);
        var newGridPosition = parseInt(Math.round(tmp));
        var toRight = newGridPosition > sourceWrapper.getGridPosition();
        var moved = true;
        while (newGridPosition != sourceWrapper.getGridPosition() && moved) {
          moved = this._move(
            toRight,
            currentLevel,
            cIndex,
            sourceWrapper.getPriority()
          );
          if (moved) movements++;
        }
      }
    }
    return movements;
  },
  _move: function (toRight, currentLevel, cIndex, cPriority) {
    var currentWrapper = currentLevel[cIndex];
    var moved = false;
    var neighborIndexInTheLevel = cIndex + (toRight ? 1 : -1);
    var newGridPosition = currentWrapper.getGridPosition() + (toRight ? 1 : -1);
    if (newGridPosition < 0 || newGridPosition >= this.gridAreaSize)
      return false;
    if (
      (toRight && cIndex == currentLevel.length - 1) ||
      (!toRight && cIndex == 0)
    ) {
      moved = true;
    } else {
      var neighborWrapper = currentLevel[neighborIndexInTheLevel];
      var neighborPriority = neighborWrapper.getPriority();
      if (neighborWrapper.getGridPosition() == newGridPosition) {
        if (neighborPriority >= cPriority) return false;
        else
          moved = this._move(
            toRight,
            currentLevel,
            neighborIndexInTheLevel,
            cPriority
          );
      } else {
        moved = true;
      }
    }
    if (moved) currentWrapper.setGridPosition(newGridPosition);
    return moved;
  },
  _sortCell: function (a, b) {
    if (a.getEdgeCrossesIndicator() == b.getEdgeCrossesIndicator()) return 0;
    var compareValue = parseFloat(
      b.getEdgeCrossesIndicator() - a.getEdgeCrossesIndicator()
    );
    return parseInt(compareValue * 1000);
  },
  _fillLevel: function (nodeList, doUp) {
    var cLevel = [];
    cLevel[0] = [];
    for (var j = 0; j < nodeList[0].length; j++) {
      var node = nodeList[0][j];
      var edgeInfo = this.getEdgeInfo(node.getID());
      if (doUp)
        for (var i = 0; i < edgeInfo.ins.length; i++)
          this._fillLevelEdge(edgeInfo.ins[i], cLevel[0]);
      else
        for (var i = 0; i < edgeInfo.outs.length; i++)
          this._fillLevelEdge(edgeInfo.outs[i], cLevel[0]);
    }
    if (cLevel[0].length > 0) {
      var levels = this._fillLevel(cLevel, doUp);
      if (doUp) nodeList = levels.concat(nodeList);
      else nodeList = nodeList.concat(levels);
    }
    return nodeList;
  },
  _fillLevelEdge: function (node, level) {
    if (node.getData('SUGIYAMA_VISITED')) return;
    node.setData('SUGIYAMA_VISITED', true);
    level.push(node);
  },
  type: function () {
    return 'GwtSugiyamaLayout';
  },
});
var CellWrapper = Class.create();
CellWrapper.prototype = {
  initialize: function (level, edgeCrossesIndicator, node) {
    this.level = level;
    this.edgeCrossesIndicator = parseFloat(edgeCrossesIndicator);
    this.setNode(node);
    this.additions = this.additions ? this.additions++ : 1;
    this.priority = 0;
    this.gridPosition = 0;
  },
  addToEdgeCrossesIndicator: function (addValue) {
    this.edgeCrossesIndicator += parseFloat(addValue);
    this.additions++;
  },
  getEdgeCrossesIndicator: function () {
    if (this.additions == 0) return 0;
    return this.edgeCrossesIndicator / this.additions;
  },
  getGridPosition: function () {
    return this.gridPosition;
  },
  getLevel: function () {
    return this.level;
  },
  getNode: function () {
    return this.node;
  },
  getPriority: function () {
    return this.priority;
  },
  setNode: function (n) {
    this.node = n;
  },
  setGridPosition: function (p) {
    this.gridPosition = p;
  },
  type: function () {
    return 'CellWrapper';
  },
};
