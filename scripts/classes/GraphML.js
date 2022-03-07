/*! RESOURCE: /scripts/classes/GraphML.js */
var GraphML = Class.create();
GraphML.prototype = {
  initialize: function () {
    this.graphElement = new GraphMLElement();
    this.graph = null;
    this.nodes = [];
    this.ports = [];
    this.edges = [];
    this.actions = [];
    this.graphKeys = {};
    this.nodeKeys = {};
    this.portKeys = {};
    this.edgeKeys = {};
    this.nodeIndex = {};
  },
  loadFromXML: function (xml) {
    this._loadKeys(xml);
    this._loadData(xml);
    this._loadActions(xml);
    this._loadNodes(xml);
    this._loadPorts(xml);
    this._loadEdges(xml);
  },
  serialize: function () {
    var xml = loadXML('<graphml/>');
    var root = xml.documentElement;
    this._serializeKeys(root, this.graphKeys, 'graph');
    this._serializeKeys(root, this.nodeKeys, 'node');
    this._serializeKeys(root, this.portKeys, 'port');
    this._serializeKeys(root, this.edgeKeys, 'edge');
    var graph = xml.createElement('graph');
    root.appendChild(graph);
    this.graphElement = new GraphMLElement();
    this.graph.saveToGraphML(this.graphElement);
    this.graphElement.serialize(graph);
    for (var i = 0; i < this.nodes.length; i++) {
      var node = xml.createElement('node');
      graph.appendChild(node);
      var ge = new GraphMLElement();
      this.nodes[i].saveToGraphML(ge);
      ge.serialize(node);
    }
    for (var i = 0; i < this.ports.length; i++) {
      var port = xml.createElement('port');
      graph.appendChild(port);
      var ge = new GraphMLElement();
      this.ports[i].saveToGraphML(ge);
      ge.serialize(port);
    }
    for (var i = 0; i < this.edges.length; i++) {
      var edge = xml.createElement('edge');
      graph.appendChild(edge);
      var ge = new GraphMLElement();
      this.edges[i].saveToGraphML(ge);
      ge.serialize(edge);
    }
    return getXMLString(xml);
  },
  _serializeKeys: function (element, keys, type) {
    for (var key in keys) {
      var kxml = element.ownerDocument.createElement('key');
      element.appendChild(kxml);
      kxml.setAttribute('id', key);
      kxml.setAttribute('attr.name', key);
      kxml.setAttribute('attr.type', 'string');
      kxml.setAttribute('for', type);
      var t = kxml.ownerDocument.createTextNode(keys[key]);
      kxml.appendChild(t);
    }
  },
  getGraph: function () {
    return this.graphElement;
  },
  getNodes: function () {
    return this.nodes;
  },
  getNodesAsArray: function () {
    return this.nodes;
  },
  getPorts: function () {
    return this.ports;
  },
  getPortsAsArray: function () {
    return this.ports;
  },
  getEdges: function () {
    return this.edges;
  },
  getEdgesAsArray: function () {
    return this.edges;
  },
  getActions: function () {
    return this.actions;
  },
  addGraph: function (graph) {
    this.graph = graph;
  },
  addNode: function (node) {
    this.nodes.push(node);
  },
  addPort: function (port) {
    this.ports.push(port);
  },
  addEdge: function (edge) {
    this.edges.push(edge);
  },
  addAction: function (action) {
    this.actions.push(action);
  },
  getNode: function (nodeID) {
    return this.nodes[this.nodeIndex[nodeID]];
  },
  _loadKeys: function (xml) {},
  _loadData: function (xml) {
    var graphs = xml.getElementsByTagName('graph');
    if (graphs.length > 0)
      this.graphElement = new GraphMLElement(graphs.item(0), this.graphKeys);
  },
  _loadNodes: function (xml) {
    var nodes = xml.getElementsByTagName('node');
    for (var i = 0; i < nodes.length; i++) {
      var graphElement = new GraphMLElement(nodes.item(i), this.nodeKeys);
      this.nodes.push(graphElement);
      this.nodeIndex[graphElement.id] = this.nodes.length - 1;
    }
  },
  _loadPorts: function (xml) {
    var ports = xml.getElementsByTagName('port');
    for (var i = 0; i < ports.length; i++) {
      var graphElement = new GraphMLElement(ports.item(i), this.portKeys);
      this.ports.push(graphElement);
    }
  },
  _loadEdges: function (xml) {
    var edges = xml.getElementsByTagName('edge');
    for (var i = 0; i < edges.length; i++) {
      var graphElement = new GraphMLElement(edges.item(i), this.edgeKeys);
      this.edges.push(graphElement);
    }
  },
  _loadActions: function (xml) {
    var actions = xml.getElementsByTagName('action');
    for (var i = 0; i < actions.length; i++) {
      var graphElement = new GraphMLElement(actions.item(i), {});
      this.actions.push(graphElement);
    }
  },
  type: function () {
    return 'GraphML';
  },
  z: null,
};
var GraphMLElement = Class.create();
GraphMLElement.prototype = {
  initialize: function (element, defaultValues) {
    this.data = {};
    this.attributes = {};
    if (!element) {
      this.id = '';
      return;
    }
    this._saveAttributes(element);
    this.id = this.getAttribute('id');
    this._copy(defaultValues, this.data);
    var datas = element.getElementsByTagName('data');
    for (var i = 0; i < datas.length; i++) {
      var data = datas[i];
      if (data.parentNode != element) continue;
      var n = data.attributes.getNamedItem('key').value;
      if (data.firstChild) this.data[n] = data.firstChild.nodeValue;
      else this.data[n] = '';
    }
  },
  getID: function () {
    return this.id;
  },
  setID: function (id) {
    this.id = id;
    this.setAttribute('id', id);
  },
  getAttribute: function (n) {
    return this.attributes[n];
  },
  setAttribute: function (n, v) {
    this.attributes[n] = v + '';
  },
  getData: function (n) {
    return this.data[n];
  },
  setData: function (n, v) {
    this.data[n] = v + '';
  },
  removeData: function (n) {
    delete this.data[n];
  },
  copyData: function (o) {
    this._copy(this.data, o);
  },
  saveData: function (o) {
    this._copy(o, this.data);
  },
  serialize: function (exml) {
    for (var n in this.attributes)
      exml.setAttribute(n, this.attributes[n] + '');
    for (var n in this.data) {
      var dxml = exml.ownerDocument.createElement('data');
      exml.appendChild(dxml);
      dxml.setAttribute('key', n);
      var t = dxml.ownerDocument.createTextNode(this.data[n] + '');
      dxml.appendChild(t);
    }
  },
  getSource: function () {
    return this.getAttribute('source');
  },
  getSourceID: function () {
    return this.getSource();
  },
  getTarget: function () {
    return this.getAttribute('target');
  },
  getTargetID: function () {
    return this.getTarget();
  },
  getX: function () {
    return this.getAttribute('x');
  },
  getY: function () {
    return this.getAttribute('y');
  },
  moveTo: function (x, y) {
    this.setData('x', x);
    this.setData('y', y);
  },
  setColor: function (c) {
    this.setData('color', c);
  },
  _copy: function (from, to) {
    for (var n in from) to[n] = from[n];
  },
  _saveAttributes: function (element) {
    for (var i = 0; i < element.attributes.length; i++) {
      var attr = element.attributes[i];
      this.attributes[attr.nodeName] = attr.nodeValue;
    }
  },
  type: function () {
    return 'GraphMLElement';
  },
  z: null,
};
