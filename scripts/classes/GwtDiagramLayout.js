/*! RESOURCE: /scripts/classes/GwtDiagramLayout.js */
var GwtDiagramLayout = Class.create();
GwtDiagramLayout.prototype = {
  initialize: function (diagram) {
    this.diagram = diagram;
    this.focusNodeID = null;
    this.levelCount = 0;
    this.nodeWidth = this.diagram.DEFAULT_NODE_WIDTH;
    this.nodeHeight = this.diagram.DEFAULT_NODE_HEIGHT;
    this.nodeFont = this.diagram.DEFAULT_FONT;
    this.nodeFontSize = this.diagram.DEFAULT_FONT_SIZE;
    this.totalTimes = new Object();
  },
  destroy: function () {
    this.diagram = null;
  },
  apply: function () {},
  getDiagram: function () {
    return this.diagram;
  },
  getFocus: function () {
    return this.focusNodeID;
  },
  setFocus: function (id) {
    this.focusNodeID = id;
  },
  setTotalTime: function (what, startTime) {
    var totalTime = new Date() - startTime;
    this.totalTimes[what] = totalTime;
  },
  setDefaultNodeSize: function (nodeWidth, nodeHeight) {
    this.nodeWidth = nodeWidth;
    this.nodeHeight = nodeHeight;
  },
  setDefaultNodeFont: function (font) {
    this.nodeFont = font;
  },
  setDefaultNodeFontSize: function (fontSize) {
    this.nodeFontSize = fontSize;
  },
  computeEdges: function () {
    this.edgeInfo = {};
    var edges = this.graph.getEdgesAsArray();
    for (var i = 0; i < edges.length; i++) {
      var e = edges[i];
      var sourceID = e.getSourceID();
      var targetID = e.getTargetID();
      var sourceNode = this.graph.getNode(sourceID);
      var targetNode = this.graph.getNode(targetID);
      if (targetNode) this._getEdgeInfo(sourceID).outs.push(targetNode);
      if (sourceNode) this._getEdgeInfo(targetID).ins.push(sourceNode);
    }
  },
  getEdgeInfo: function (nodeId) {
    return this._getEdgeInfo(nodeId);
  },
  _getEdgeInfo: function (id) {
    if (!this.edgeInfo[id]) {
      this.edgeInfo[id] = {};
      this.edgeInfo[id].ins = [];
      this.edgeInfo[id].outs = [];
    }
    return this.edgeInfo[id];
  },
  type: function () {
    return 'GwtDiagramLayout';
  },
};
