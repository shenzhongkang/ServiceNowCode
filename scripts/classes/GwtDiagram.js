/*! RESOURCE: /scripts/classes/GwtDiagram.js */
var GwtDiagram = Class.create(GwtObservable, {
  NEW_NODE_SPACE_V: 20,
  NEW_NODE_SPACE_H: 50,
  DEFAULT_X: 100,
  DEFAULT_Y: 100,
  DEFAULT_NODE_WIDTH: 160,
  DEFAULT_NODE_HEIGHT: 50,
  DEFAULT_FONT: 'Arial',
  DEFAULT_FONT_SIZE: 8,
  initialize: function (container, processor) {
    if (window.G_vmlCanvasManager) window.G_vmlCanvasManager.init_(document);
    this.hideEdgesForNodeDrag = false;
    this.container = $(container);
    this.processor = processor;
    this.readOnly = false;
    this.edges = {};
    this.nodes = {};
    this.actions = [];
    this.clear();
    this.clearParams();
    this.layout = null;
    this.container.style.position = 'relative';
    document.onkeydown = this._handleKeyDown.bindAsEventListener(this);
    this.selector = new GwtDraggableDraw(this.container);
    this.selector.on('enddraw', this._onSelectArea.bind(this));
    this.container.onscroll = this._handleResize.bindAsEventListener(this);
    this.container.onclick = this._onClick.bindAsEventListener(this);
    this.container.ondblclick = this._onDblClick.bindAsEventListener(this);
    this.container.oncontextmenu = this._onRtClick.bindAsEventListener(this);
    this._onNodeDragFunc = this._onNodeDrag.bind(this);
    this._onNodeDragEndFunc = this._onNodeDragEnd.bind(this);
    this._onNodeBeforeClickFunc = this._onNodeBeforeClick.bind(this);
    this._onNodeBeforeCloseFunc = this._onNodeBeforeClose.bind(this);
    this._onNodeDblClickFunc = this._onNodeDblClick.bind(this);
    this._onEdgeBeforeCloseFunc = this._onEdgeBeforeClose.bind(this);
    this._onNodeMouseOverFunc = this._onNodeMouseOver.bind(this);
    this._onNodeMouseOutFunc = this._onNodeMouseOut.bind(this);
    this.nodeFactoryFunc = this._nodeFactory.bind(this);
    this.childNodeFactoryFunc = this._childNodeFactory.bind(this);
    this.edgeFactoryFunc = this._edgeFactory.bind(this);
    this.pathRouterFactoryFunc = this._pathRouterFactory.bind(this);
    this.nodeCompareFunc = null;
  },
  repositionNodes: function () {
    if (this.layout && this.layout.repositionNodes)
      this.layout.repositionNodes(this.nodes);
  },
  selectNode: function (id) {
    for (var key in this.nodes) {
      var node = this.nodes[key];
      if (node.getID() == id) node.setSelected(true);
      else node.setSelected(false);
    }
  },
  hideNode: function (node) {
    node.invisible();
    var images = $(node.getID()).select('img');
    for (var i = 0; i < images.length; i++) images[i].style.display = 'none';
    for (var key in this.edges) this.edges[key].hideWithCheck();
  },
  showNode: function (node) {
    node.visible();
    var images = $(node.getID()).select('img');
    for (var i = 0; i < images.length; i++) images[i].style.display = 'block';
    for (var key in this.edges) this.edges[key].showWithCheck();
  },
  scrollToNode: function (node, adj) {
    var elem = gel(node.getID());
    var tempTop = elem.offsetTop + adj;
    var tempLeft = elem.offsetLeft + adj;
    if (tempTop < 0) tempTop = 0;
    if (tempLeft < 0) tempLeft = 0;
    gel(this.container_id).scrollTop = tempTop;
    gel(this.container_id).scrollLeft = tempLeft;
  },
  getNodesByValue: function (dataKey) {
    var values = [];
    var nodesByValue = {};
    for (var key in this.nodes) {
      var node = this.nodes[key];
      var data = node.getData(dataKey);
      if (values.indexOf(data) == -1) values[values.length] = data;
      if (!nodesByValue[data]) nodesByValue[data] = [];
      nodesByValue[data].push(node);
    }
    values.sort();
    return { nodesByValue: nodesByValue, values: values };
  },
  _setNodeClickHandlers: function () {
    var diagram = this;
    for (var key in this.nodes) {
      GwtContextMenu.zIndex = this.nodes[key].DEFAULT_ZINDEX + 1001;
      this.nodes[key].on('beforeclick', function () {
        for (var key in diagram.nodes) {
          var currentNode = diagram.nodes[key];
          var newZIndex = currentNode.getZIndex() - 1;
          if (newZIndex < this.DEFAULT_ZINDEX) newZIndex = this.DEFAULT_ZINDEX;
          currentNode.setZIndex(newZIndex);
        }
        this.setZIndex(this.DEFAULT_ZINDEX + 1000);
        return false;
      });
    }
  },
  _onClick: function (ev) {
    for (var key in this.edges) {
      if (this.edges[key].isClickNearEdge(ev))
        this._handleEdgeClick(this.edges[key], ev);
    }
  },
  _onDblClick: function (ev) {
    for (var key in this.edges) {
      if (this.edges[key].isClickNearEdge(ev))
        this._handleEdgeDblClick(this.edges[key], ev);
    }
  },
  _onRtClick: function (ev) {
    for (var key in this.edges) {
      if (this.edges[key].isClickNearEdge(ev))
        this._handleEdgeRtClick(this.edges[key], ev);
    }
  },
  _handleResize: function () {
    this.selector.moveCanvas(
      this.container.scrollTop,
      this.container.scrollLeft
    );
  },
  getContainer: function () {
    return this.container;
  },
  getPosition: function () {
    var pos = Position.cumulativeOffset(this.container);
    var offsetX = grabScrollLeft(this.container);
    var offsetY = grabScrollTop(this.container);
    return new GwtPoint(pos[0] - offsetX, pos[1] - offsetY);
  },
  destroy: function () {
    this.clear();
    this.container.onscroll = null;
    this.container.onclick = null;
    this.container.ondblclick = null;
    this.container.oncontextmenu = null;
    this.container = null;
    this.selector.destroy();
  },
  clear: function () {
    this.suppressEvents = true;
    for (var key in this.edges) {
      this.edges[key].destroy();
    }
    for (var key in this.nodes) {
      var node = this.nodes[key];
      if (!node.isChildNode) {
        this.nodes[key].destroy();
      }
    }
    this.suppressEvents = false;
    this.edges = {};
    this.nodes = {};
    this.actions = [];
    this.clearData();
  },
  clearParams: function () {
    this.params = {};
  },
  setData: function (name, value) {
    this.data[name] = value;
  },
  getData: function (name, defaultValue) {
    if (defaultValue == undefined) defaultValue = '';
    if (this.data[name] != undefined) return this.data[name];
    else return defaultValue;
  },
  removeData: function (name) {
    delete this.data[name];
  },
  clearData: function () {
    this.data = {};
  },
  getNodes: function () {
    return this.nodes;
  },
  getNodesAsArray: function () {
    var nodes = [];
    for (var n in this.nodes) {
      nodes.push(this.nodes[n]);
    }
    if (this.nodeCompareFunc != null) {
      nodes.sort(this.nodeCompareFunc);
    }
    return nodes;
  },
  getEdges: function () {
    return this.edges;
  },
  getSelectedNode: function () {
    for (var key in this.nodes) {
      var node = this.nodes[key];
      if (node.isActive()) return node;
    }
    return null;
  },
  getSelectedEdge: function () {
    for (var key in this.edges) {
      var edge = this.edges[key];
      if (edge.getSelected()) return edge;
    }
    return null;
  },
  getEdgesAsArray: function () {
    var edges = [];
    for (var key in this.edges) edges.push(this.edges[key]);
    return edges;
  },
  registerNodeFactory: function (factory) {
    this.nodeFactoryFunc = factory;
  },
  registerChildNodeFactory: function (factory) {
    this.childNodeFactoryFunc = factory;
  },
  registerEdgeFactory: function (factory) {
    this.edgeFactoryFunc = factory;
  },
  registerPathRouterFactory: function (factory) {
    this.pathRouterFactoryFunc = factory;
  },
  registerNodeComparison: function (compareFn) {
    this.nodeCompareFunc = compareFn;
  },
  getNodeFromFactory: function (diagram, id, readOnly) {
    return this.nodeFactoryFunc(diagram, id, readOnly);
  },
  getChildNodeFromFactory: function (diagram, id, readOnly, parent) {
    return this.childNodeFactoryFunc(diagram, id, readOnly, parent);
  },
  getEdgeFromFactory: function (
    diagram,
    id,
    readOnly,
    source,
    target,
    sourcePort,
    targetPort
  ) {
    return this.edgeFactoryFunc(
      diagram,
      id,
      readOnly,
      source,
      target,
      sourcePort,
      targetPort
    );
  },
  getPathRouterFromFactory: function () {
    return this.pathRouterFactoryFunc();
  },
  _nodeFactory: function (diagram, id, readOnly) {
    return new GwtDiagramNode(diagram, id, readOnly);
  },
  _childNodeFactory: function (diagram, id, readOnly, parent) {
    return new GwtDiagramNodeChild(diagram, id, readOnly, parent);
  },
  _edgeFactory: function (
    diagram,
    id,
    readOnly,
    source,
    target,
    sourcePort,
    targetPort
  ) {
    return new GwtDiagramEdge(
      diagram,
      id,
      readOnly,
      source,
      target,
      sourcePort,
      targetPort
    );
  },
  _pathRouterFactory: function () {
    return new GwtDiagramPathRouter();
  },
  clearSelected: function () {
    for (var key in this.nodes) {
      var node = this.nodes[key];
      node.setSelected(false);
    }
    for (var key in this.edges) {
      var edge = this.edges[key];
      if (edge.getSelected()) edge.setSelected(false);
    }
  },
  selectAll: function () {
    for (var key in this.nodes) {
      var node = this.nodes[key];
      node.setSelected(true);
    }
  },
  setSelectedRect: function (rect, multiselect) {
    if (!multiselect) this.clearSelected();
    for (var key in this.nodes) {
      var node = this.nodes[key];
      if (node.isInRect(rect)) node.setSelected(true);
    }
    for (var key in this.edges) {
      var edge = this.edges[key];
      if (edge.isInRect(rect)) edge.setSelected(true);
    }
  },
  moveSelected: function (node, deltaX, deltaY) {
    for (var key in this.nodes) {
      var n = this.nodes[key];
      if (n != node && n.isActive()) {
        var x = n.getX() + deltaX;
        var y = n.getY() + deltaY;
        n.moveTo(x, y);
      }
    }
  },
  addNode: function (graphmlElement) {
    var node;
    var parentID = graphmlElement.getData('parent');
    if (!parentID)
      node = this.getNodeFromFactory(
        this,
        graphmlElement.getID(),
        this.readOnly
      );
    else {
      var parent;
      try {
        parent = this.getNode(parentID);
      } catch (ex) {}
      if (!parent) return null;
      node = this.getChildNodeFromFactory(
        this,
        graphmlElement.getID(),
        this.readOnly,
        parent
      );
    }
    node.loadFromGraphML(graphmlElement);
    node.insert(this.container);
    node.setDimensions();
    node.setXY();
    node.showBody(true);
    this.nodes[node.getID()] = node;
    this._registerNodeHandlers(node);
    this._addActions(node);
    return node;
  },
  addNewNode: function (node, x, y) {
    node.insert(this.container);
    this.nodes[node.getID()] = node;
    this._registerNodeHandlers(node);
    this._addActions(node);
    return node;
  },
  getNodeIds: function () {
    var result = [];
    for (var key in this.nodes) {
      result.push(key);
    }
    return result;
  },
  getNode: function (id) {
    if (this.useUniqueIds && id.indexOf(this.container.id + '_') != 0)
      id = this.container.id + '_' + id;
    if (!this.nodes[id]) {
      throw new Error('node [' + id + '] is undefined');
    }
    return this.nodes[id];
  },
  getNodeByDataValue: function (name, value) {
    var nodes = this.getNodesAsArray();
    var foundNode;
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      if (node.getData(name) == value) foundNode = node;
    }
    return foundNode;
  },
  removeNode: function (id) {
    this.getNode(id);
    delete this.nodes[id];
  },
  moveNodes: function (fromX, fromY, xDist, yDist) {
    var nodes = [];
    for (var key in this.nodes) {
      var n = this.nodes[key];
      if (n.getX() >= fromX && n.getY() >= fromY) {
        n.moveTo(n.getX() + xDist, n.getY() + yDist);
        nodes.push(n);
      }
    }
    this.fireEvent('movenodes', this, nodes);
  },
  pointInNode: function (x, y) {
    var realX = x - this.getPosition().x;
    var realY = y - this.getPosition().y;
    for (var key in this.nodes) {
      var node = this.nodes[key];
      if (node.isPointWithin(realX, realY)) return node;
    }
    return null;
  },
  addEdge: function (graphmlElement) {
    var s = graphmlElement.getAttribute('source');
    var t = graphmlElement.getAttribute('target');
    if (!s || !t) return;
    var source = this.getNode(s);
    var target = this.getNode(t);
    var sourcePortID = graphmlElement.getAttribute('source_port');
    var targetPortID = graphmlElement.getAttribute('target_port');
    var edge = this.getEdgeFromFactory(
      this,
      graphmlElement.getID(),
      this.readOnly,
      source,
      target,
      sourcePortID,
      targetPortID
    );
    edge.loadFromGraphML(graphmlElement);
    this.edges[edge.getID()] = edge;
    this._registerEdgeHandlers(edge);
    return edge;
  },
  addNewEdge: function (source, target, sourcePortID, targetPortID, sysID) {
    if (this.isDuplicateEdge(source.getID(), sourcePortID, target.getID()))
      return;
    if (!sysID) sysID = this._generateId();
    var edge = this.getEdgeFromFactory(
      this,
      sysID,
      this.readOnly,
      source,
      target,
      sourcePortID,
      targetPortID
    );
    this.edges[sysID] = edge;
    edge.draw();
    this.fireEvent('newedge', this, edge);
    this._registerEdgeHandlers(edge);
    return edge;
  },
  getEdgeIds: function () {
    var result = [];
    for (var key in this.edges) {
      result.push(key);
    }
    return result;
  },
  getEdge: function (id) {
    if (!this.edges[id]) {
      throw new Error('edge [' + id + '] is undefined');
    }
    return this.edges[id];
  },
  getEdgeBetween: function (from, to) {
    for (var key in this.edges) {
      var e = this.edges[key];
      if (
        e.getSource().getID() == from.getID() &&
        e.getTarget().getID() == to.getID()
      )
        return e;
    }
  },
  removeEdge: function (id) {
    this.getEdge(id);
    delete this.edges[id];
  },
  getEdgesFrom: function (node) {
    var id = node.getID();
    var edges = [];
    for (var key in this.edges) {
      var e = this.edges[key];
      if (id == e.getSource().getID()) edges.push(e);
    }
    return edges;
  },
  getEdgesTo: function (node) {
    var id = node.getID();
    var edges = [];
    for (var key in this.edges) {
      var e = this.edges[key];
      if (id == e.getTarget().getID()) edges.push(e);
    }
    return edges;
  },
  addAction: function (graphmlElement) {
    var action = new GwtDiagramAction(graphmlElement);
    this.actions.push(action);
  },
  addCustomAction: function (action) {
    this.actions.push(action);
  },
  setParam: function (name, value) {
    this.params[name] = value;
  },
  getParam: function (name) {
    var val = this.params[name];
    if (!val) return '';
    else return this.params[name];
  },
  toXML: function () {
    var graphml = new GraphML();
    graphml.addGraph(this);
    for (var key in this.nodes) {
      graphml.addNode(this.nodes[key]);
      var ports = this.nodes[key].getPorts();
      for (var key in this.ports) graphml.addPort(this.ports[key]);
    }
    for (var key in this.edges) graphml.addEdge(this.edges[key]);
    return graphml.serialize();
  },
  saveToGraphML: function (graphmlElement) {
    graphmlElement.setID(this.id);
    graphmlElement.saveData(this.data);
  },
  load: function (layout) {
    this.layout = layout;
    setTimeout(this._load.bind(this), 0);
  },
  _load: function () {
    this._showLoading();
    this.params['id'] = this.id;
    this.params['sysparm_type'] = 'get';
    var ajax = new GlideAjax(this.processor);
    ajax.getXML(this._onLoad.bind(this), this.params);
  },
  save: function () {
    setTimeout(this._save.bind(this), 0);
  },
  _save: function () {
    this._showLoading();
    var ajax = new GlideAjax(this.processor);
    this.params['sysparm_type'] = 'save';
    this.params['xml'] = this.toXML();
    ajax.getXML(this._onSave.bind(this), this.params);
  },
  _onLoad: function (response) {
    var evName = 'afterload';
    this.suppressEvents = true;
    this.clear();
    if (!response || !response.responseXML) return;
    try {
      this._processLoadResponse(response.responseXML);
    } catch (e) {
      var msg = 'Error loading diagram - ';
      if (e.description == null) msg += e.message;
      else msg += e.description;
      alert(msg);
      this.clear();
      evName = 'loaderror';
    }
    this.suppressEvents = false;
    this._hideLoading();
    this.fireEvent(evName, this);
    var diagramWarning = this.getData('warning');
    if (diagramWarning) alert(diagramWarning);
  },
  _processLoadResponse: function (xml) {
    var graph = new GraphML();
    graph.loadFromXML(xml);
    var graphElement = graph.getGraph();
    graphElement.copyData(this.data);
    if (this.getData('error_string')) throw this.getData('error_string');
    this.id = graphElement.getID();
    if (this.getData('read_only') == 'true') this.readOnly = true;
    else this.readOnly = false;
    if (this.layout != null) this.layout.apply(graph);
    var actions = graph.getActions();
    for (var i = 0; i < actions.length; i++) this.addAction(actions[i]);
    this.suppressEvents = false;
    if (this.readOnly != true) this.fireEvent('addactions', this);
    this.suppressEvents = true;
    this.actions = this.actions.sort(function (a, b) {
      var aOrder = a.order;
      if (!aOrder) aOrder = 0;
      var bOrder = b.order;
      if (!bOrder) bOrder = 0;
      return aOrder - bOrder;
    });
    this._loadNodes(graph, false);
    this._loadNodes(graph, true);
    var edges = graph.getEdges();
    for (var i = 0; i < edges.length; i++) {
      try {
        this.addEdge(edges[i]);
      } catch (ex) {}
    }
    this.drawEdges();
  },
  drawEdges: function () {
    for (var key in this.edges) {
      var edge = this.edges[key];
      setTimeout(edge.draw.bind(edge), 0);
    }
  },
  _generateId: function () {
    var aj = new GlideAjax('GlideSystemAjax');
    aj.addParam('sysparm_name', 'newGuid');
    aj.getXMLWait();
    return aj.getAnswer();
  },
  _loadNodes: function (graph, childNodesFlag) {
    var ports = graph.getPorts();
    var nodes = graph.nodes;
    if (this.nodeCompareFunc != null) {
      nodes.sort(this.nodeCompareFunc);
    }
    for (var i = 0; i < nodes.length; i++) {
      if (childNodesFlag && !nodes[i].getData('parent')) continue;
      if (!childNodesFlag && nodes[i].getData('parent')) continue;
      var node = this.addNode(nodes[i]);
      if (!node) continue;
      var id = nodes[i].getID();
      for (var j = 0; j < ports.length; j++) {
        var port = ports[j];
        if (port.getAttribute('node') == id) node.loadPortFromGraphML(port);
      }
    }
  },
  _getDataValues: function (map, dataMap) {
    for (var key in map) {
      var data = map[key];
      var name = data.getKey();
      var value = data.getValue();
      if (value) {
        value = glide.commons.DOM.getStringValue({ node: value });
      }
      if (!value) value = '';
      dataMap[name] = value;
    }
  },
  _onSave: function (response) {
    this._hideLoading();
  },
  _onSelectArea: function (draggable, rect, e) {
    var multiselect = e.shiftKey;
    var selectRect = new GwtBounds(
      rect.left,
      rect.top,
      rect.width,
      rect.height
    );
    this.setSelectedRect(selectRect, multiselect);
  },
  _handleKeyDown: function (e) {
    if (String(e.keyCode) == '46' || String(e.keyCode) == '8') {
      var element = Event.element(e);
      if (element.tagName.toLowerCase() == 'input') {
        return;
      }
      if (this.readOnly != true) this._deleteSelectedItems();
      Event.stop(e);
      return false;
    }
  },
  _deleteSelectedItems: function () {
    for (var key in this.nodes) {
      if (this.nodes[key].selected) this.nodes[key].destroy();
    }
    for (var key in this.edges) {
      if (this.edges[key].selected) this.edges[key].destroy();
    }
  },
  scale: function (ratio) {
    if ((!this.currentScale && ratio == 1) || this.currentScale == ratio)
      return;
    this.currentScale = ratio;
    if (!this.nonScaleFontSize)
      this.nonScaleFontSize = this.layout.nodeFontSize;
    var fontSize = this.nonScaleFontSize * ratio;
    this.layout.setDefaultNodeFontSize(fontSize);
    var nodes = this.getNodes();
    var nodeIds = this.getNodeIds();
    for (var i = 0; i < nodeIds.length; i++) {
      var node = this.getNode(nodeIds[i]);
      node.scale(ratio, fontSize);
    }
  },
  updateIconActions: function (node) {
    node.clearActions();
    this._addActions(node);
  },
  _addActions: function (node) {
    for (var i = 0; i < this.actions.length; i++) {
      if (this.actions[i].type == 'menu' || this.actions[i].type == 'line')
        this.actions[i].addToNode(node);
    }
    for (var i = this.actions.length - 1; i >= 0; i--) {
      if (this.actions[i].type == 'icon') this.actions[i].addToNode(node);
    }
  },
  _registerNodeHandlers: function (node) {
    if (ie5) {
      node.on('mouseenter', this._onNodeMouseOverFunc);
      node.on('mouseleave', this._onNodeMouseOutFunc);
    } else {
      node.on('mouseover', this._onNodeMouseOverFunc);
      node.on('mouseout', this._onNodeMouseOutFunc);
    }
    node.on('dblclick', this._onNodeDblClickFunc);
    if (this.readOnly == true) return;
    node.on('drag', this._onNodeDragFunc);
    node.on('dragend', this._onNodeDragEndFunc);
    node.on('beforeclick', this._onNodeBeforeClickFunc);
    node.on('beforeclose', this._onNodeBeforeCloseFunc);
  },
  _onNodeDrag: function (node, xdelta, ydelta) {
    var hideEdges = false;
    if (!node.isDragging) {
      node.isDragging = true;
      hideEdges = true;
    }
    for (var key in this.nodes) {
      var n = this.nodes[key];
      if (n != node && n.isActive()) {
        var x = n.getX() + xdelta;
        var y = n.getY() + ydelta;
        if (x >= 0 && y >= 0) {
          n.moveTo(x, y);
          if (!n.isDragging) {
            n.isDragging = true;
            hideEdges = true;
          }
        }
      }
    }
    if (hideEdges && this.hideEdgesForNodeDrag)
      for (var key in this.edges) this.edges[key].hideWithCheck();
  },
  _onNodeDragEnd: function () {
    var nodes = [];
    for (var key in this.nodes) {
      var n = this.nodes[key];
      if (n.isActive()) {
        nodes.push(n);
        n.isDragging = false;
      }
    }
    if (this.hideEdgesForNodeDrag)
      for (var key in this.edges) this.edges[key].showWithCheck();
    this.fireEvent('movenodes', this, nodes);
  },
  _onNodeBeforeClick: function (node, multiselect) {
    if (!multiselect) this.clearSelected();
  },
  _onNodeDblClick: function (node, e) {
    this.fireEvent('nodedblclick', this, node);
    Event.stop(getEvent(e));
    return false;
  },
  _onNodeBeforeClose: function (node) {
    var edgesChanged = [];
    var edgesAdded = [];
    var edgesDeleted = [];
    var edgesFrom = this.getEdgesFrom(node);
    var edgesTo = this.getEdgesTo(node);
    var toCnt = 0;
    for (toCnt = 0; toCnt < edgesTo.length; toCnt++) {
      var target;
      var targetPort;
      if (toCnt < edgesFrom.length) {
        target = edgesFrom[toCnt].getTarget();
        targetPort = edgesFrom[toCnt].getTargetPort();
      } else if (edgesFrom.length > 0) {
        target = edgesFrom[edgesFrom.length - 1].getTarget();
        targetPort = edgesFrom[edgesFrom.length - 1].getTargetPort();
      } else {
        target = null;
      }
      if (
        !target ||
        this.isDuplicateEdge(
          edgesTo[toCnt].getSourceID(),
          edgesTo[toCnt].getSourcePortID(),
          target.getID()
        )
      ) {
        edgesTo[toCnt].destroy();
        edgesDeleted.push(edgesTo[toCnt]);
      } else {
        edgesTo[toCnt].setTarget(target, targetPort.getID());
        edgesChanged.push(edgesTo[toCnt]);
      }
    }
    var fromCnt = toCnt;
    if (edgesTo.length > 0) {
      toCnt = edgesTo.length - 1;
      while (fromCnt < edgesTo.length) {
        var source = edgesTo[toCnt].getSource();
        var sourcePort = edgesTo[toCnt].getSourcePort();
        if (
          edgesFrom[fromCnt].getSourceID() == source.getID() ||
          this.isDuplicateEdge(
            source.getID(),
            sourcePort.getID(),
            edgesFrom[fromCnt].getTargetID()
          )
        ) {
          edgesFrom[fromCnt].destroy();
          edgesDeleted.push(edgesFrom[fromCnt]);
        } else {
          edgesFrom[fromCnt].setSource(source, sourcePort.getID());
          edgesChanged.push(edgesFrom[fromCnt]);
        }
        fromCnt++;
      }
      while (fromCnt < edgesFrom.length) {
        edgesFrom[fromCnt].destroy();
        edgesDeleted.push(edgesFrom[fromCnt]);
        fromCnt++;
      }
      for (var fromCnt = 0; fromCnt < edgesTo.length; fromCnt++) {
        if (fromCnt == edgesFrom.length) break;
        edgesFrom[fromCnt].destroy();
        edgesDeleted.push(edgesFrom[fromCnt]);
      }
    } else {
      while (fromCnt < edgesFrom.length) {
        edgesFrom[fromCnt].destroy();
        edgesDeleted.push(edgesFrom[fromCnt]);
        fromCnt++;
      }
    }
    this.fireEvent(
      'deletenode',
      this,
      node,
      edgesDeleted,
      edgesChanged,
      edgesAdded
    );
    this.removeNode(node.getID());
  },
  isDuplicateEdge: function (sourceID, sourcePortID, targetID) {
    if (sourceID == targetID) return true;
    for (var key in this.edges) {
      var edge = this.edges[key];
      if (
        edge.getSourceID() == sourceID &&
        edge.getSourcePortID() == sourcePortID &&
        edge.getTargetID() == targetID
      )
        return true;
    }
    return false;
  },
  _onNodeMouseOver: function (node, e) {
    this.fireEvent('nodemouseover', this, node, e);
  },
  _onNodeMouseOut: function (node, e) {
    this.fireEvent('nodemouseout', this, node, e);
  },
  _registerEdgeHandlers: function (edge) {
    edge.on('beforeclose', this._onEdgeBeforeCloseFunc);
    edge.on('edgertclick', this._onEdgeRtClickFunc);
    edge.on('edgemouseout', this._onEdgeMouseOutFunc);
  },
  _onEdgeBeforeClose: function (edge) {
    this.fireEvent('deleteedge', this, edge);
    this.removeEdge(edge.getID());
  },
  _handleEdgeClick: function (edge, e) {
    var isSelected = edge.getSelected();
    if (!e.shiftKey) this.clearSelected();
    edge.setSelected(!isSelected);
    this.fireEvent('edgeclick', this, edge, e);
  },
  _handleEdgeDblClick: function (edge, e) {
    this.fireEvent('edgedblclick', this, edge, e);
  },
  _handleEdgeRtClick: function (edge, e) {
    this.fireEvent('edgertclick', edge, e);
  },
  edgeChanged: function (edge) {
    this.fireEvent('changeedge', this, edge);
  },
  _showLoading: function () {
    this.loadingDialog = new GlideDialogWindow('dialog_loading', true);
    this.loadingDialog.setPreference('table', 'loading');
    this.loadingDialog.render();
  },
  _hideLoading: function () {
    if (this.loadingDialog) {
      this.loadingDialog.destroy();
      this.loadingDialog = null;
    }
  },
  _dumpEdges: function (label) {
    jslog(new Date().toLocaleTimeString() + label + ':');
    var edges = this.getEdgesAsArray();
    for (var i = 0; i < edges.length; i++) {
      jslog(
        '  ' +
          edges[i].getSource().getData('description') +
          '.' +
          edges[i].getSourcePort().getData('name') +
          ' -> ' +
          edges[i].getTarget().getData('description') +
          '.' +
          edges[i].getTargetPort().node.getData('description')
      );
    }
  },
  type: 'GwtDiagram',
});
