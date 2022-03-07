/*! RESOURCE: /scripts/classes/GwtDiagramSelected.js */
var GwtDiagramSelected = Class.create();
GwtDiagramSelected.prototype = {
  initialize: function (graph) {
    this.edges = [];
    this.nodes = [];
    for (var key in graph.nodes) {
      var node = graph.nodes[key];
      if (node.isActive()) {
        this.nodes.push(node);
      }
    }
    for (var key in graph.edges) {
      var edge = graph.edges[key];
      if (edge.selected) {
        this.edges.push(edge);
      }
    }
  },
  getNodeCount: function () {
    return this.nodes.length;
  },
  getEdgeCount: function () {
    return this.edges.length;
  },
  getNodes: function () {
    return this.nodes;
  },
  getEdges: function () {
    return this.edges;
  },
  getNode: function (ndx) {
    return this.nodes[ndx];
  },
  getEdge: function (ndx) {
    return this.edges[ndx];
  },
  getNodeMidPoint: function (from, to) {
    var x = from.getX() + parseInt((to.getX() - from.getX()) / 2);
    var y = from.getY() + parseInt((to.getY() - from.getY()) / 2);
    return { x: x, y: y };
  },
  type: function () {
    return 'GwtDiagramSelected';
  },
};
