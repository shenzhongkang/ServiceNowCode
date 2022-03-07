/*! RESOURCE: /scripts/classes/GwtDiagramEdge.js */
var GwtDiagramEdge = Class.create(GwtObservable, {
  NON_HIGHLIGHTED_ZINDEX: 1,
  HIGHLIGHTED_ZINDEX: 2,
  initialize: function (
    diagram,
    id,
    readOnly,
    source,
    target,
    sourcePortID,
    targetPortID
  ) {
    this.diagram = diagram;
    this.id = id;
    this.hidden = false;
    this.supportsPrintLines = false;
    this.readOnly = readOnly;
    this._setSource(source, sourcePortID);
    this._setTarget(target, targetPortID);
    this.clearData();
    this.selected = false;
    this.highlighted = false;
    this.dimColor = '#808080';
    this.highlightColor = '#FFA500';
    this.selectColor = '#6495ED';
    this.color = this.dimColor;
    this.lineWidth = 2;
    this.arrowHead = true;
    this.clickToleranceWidth = 12;
    this._onClickFunc = this._onClick.bind(this);
    this._onDblClickFunc = this._onDblClick.bind(this);
    this._onNodeMoveFunc = this._onNodeMove.bind(this);
    this._registerNodeHandlers(this.source);
    this._registerNodeHandlers(this.target);
    this.pathRouter = this.diagram.getPathRouterFromFactory();
  },
  enablePrintLines: function () {
    this.supportsPrintLines = true;
  },
  show: function () {
    this._toggleLines(false);
    this.hidden = false;
    this.draw();
  },
  hide: function () {
    this._toggleLines(true);
    this.hidden = true;
  },
  _toggleLines: function (state) {
    var line = this.line;
    for (var i = 0; i < line.lines.length; i++) {
      var elem = line.lines[i].getElement();
      if ($(elem).visible() == state) elem.toggle();
    }
    var arrowHead = line.lines[line.lines.length - 1].arrowHead;
    if (arrowHead) {
      var elem = arrowHead.getElement();
      if ($(elem).visible() == state) elem.toggle();
    }
    for (var i = 0; i < line.curves.length; i++) {
      var elem = line.curves[i].getElement();
      if ($(elem).visible() == state) elem.toggle();
    }
  },
  hideWithCheck: function () {
    if (
      !this.hidden &&
      (!$(this.source.getContainer()).visible() ||
        !$(this.target.getContainer()).visible() ||
        this.source.isDragging ||
        this.target.isDragging)
    )
      this.hide();
  },
  showWithCheck: function () {
    if (
      this.hidden &&
      $(this.source.getContainer()).visible() &&
      $(this.target.getContainer()).visible()
    )
      this.show();
  },
  loadFromGraphML: function (graphml) {
    graphml.copyData(this.data);
    var c = this.getData('color');
    if (c) {
      this.setColor(c);
      this.dimColor = c;
    }
    var w = this.getData('width');
    if (w) this.setLineWidth(w);
    if (this.diagram.allowMouseOverEdge) this._buildHoverDiv();
  },
  saveToGraphML: function (graphmlElement) {
    graphmlElement.setID(this.id);
    graphmlElement.setAttribute('source', this.source.getID());
    if (this.getSourcePortID())
      graphmlElement.setAttribute('source_port', this.getSourcePortID());
    graphmlElement.setAttribute('target', this.target.getID());
    if (this.getTargetPortID())
      graphmlElement.setAttribute('target_port', this.getTargetPortID());
    graphmlElement.saveData(this.data);
  },
  draw: function () {
    this._invalidate();
  },
  destroy: function () {
    this.fireEvent('beforeclose', this);
    this.un('edgertclick');
    this.un('beforeclose');
    if (this.line) {
      this.line.destroy();
      this.line.un('click', this._onClickFunc);
      this.line.un('dblclick', this._onDblClickFunc);
      this.line.un('contextmenu', this._onRtClickFunc);
      this.line.un('mouseout', this._onMouseOutFunc);
    }
    if (this.hoverDiv) {
      rel(this.hoverDiv);
      this.hoverDiv = null;
    }
    this._clearDragPoints();
    this.line = null;
    this._unregisterNodeHandlers(this.source);
    this._unregisterNodeHandlers(this.target);
  },
  getID: function () {
    return this.id;
  },
  getSource: function () {
    return this.source;
  },
  getSourceID: function () {
    return this.source.getID();
  },
  getSourcePort: function () {
    return this.sourcePort;
  },
  getSourcePortID: function () {
    if (this.sourcePort) return this.sourcePort.getID();
    else return '';
  },
  setSource: function (node, portID) {
    this._unregisterNodeHandlers(this.source);
    this._setSource(node, portID);
    this._registerNodeHandlers(this.source);
    this._invalidate();
  },
  _setSource: function (node, portID) {
    this.source = node;
    this.sourcePort = this.source.getPort(portID);
  },
  getTarget: function () {
    return this.target;
  },
  getTargetID: function () {
    return this.target.getID();
  },
  getTargetPort: function () {
    return this.targetPort;
  },
  getTargetPortID: function () {
    if (this.targetPort) return this.targetPort.getID();
    else return '';
  },
  setTarget: function (node, portID) {
    this._unregisterNodeHandlers(this.target);
    this._setTarget(node, portID);
    this._registerNodeHandlers(this.target);
    this._invalidate();
  },
  _setTarget: function (node, portID) {
    this.target = node;
    this.targetPort = this.target.getPort(portID);
  },
  setData: function (name, value) {
    this.data[name] = value;
    if (name == 'color') this.setColor(value);
    if (name == 'width') this.setLineWidth(w);
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
  getSelected: function () {
    return this.selected;
  },
  setSelected: function (b) {
    this.selected = b;
    if (this.selected) {
      this.line.setZIndex(this.HIGHLIGHTED_ZINDEX);
      this.setColor(this.selectColor);
    } else
      this.setColor(this.highlighted ? this.highlightColor : this.dimColor);
  },
  dim: function () {
    if (this.line) {
      this.highlighted = false;
      this.line.setZIndex(this.NON_HIGHLIGHTED_ZINDEX);
      this.setColor(this.selected ? this.selectColor : this.dimColor);
    }
  },
  highlight: function () {
    if (this.line) {
      this.highlighted = true;
      this.line.setZIndex(this.HIGHLIGHTED_ZINDEX);
      this.setColor(this.highlightColor);
    }
  },
  setColor: function (c) {
    var prev = this.color;
    this.color = c;
    if (this.line) this.line.setColor(c);
    return prev;
  },
  setLineWidth: function (w) {
    this.lineWidth = w;
  },
  isInRect: function (rect) {
    return false;
  },
  _buildHoverDiv: function () {
    this.description = this.getData('name');
    if (!this.description) {
      if (this.hoverDiv) {
        this.hoverDiv.innerHTML = '';
        rel(this.hoverDiv);
        this.hoverDiv = null;
      }
      return;
    }
    if (!this.hoverDiv) {
      this.hoverDiv = cel('div');
      this.hoverDiv.className = 'edge_label';
      this.diagram.getContainer().appendChild(this.hoverDiv);
    }
    this.hoverDiv.style.width = '';
    this.hoverDiv.innerHTML = this.description;
    this.hoverDiv.style.visibility = 'hidden';
    this._onMouseOutFunc = this._onMouseOut.bind(this);
  },
  _invalidate: function () {
    if (!this.hidden && !this.diagram.edgeInvalidateDisabled) {
      if (!this.line) this._createLine();
      else {
        this.line.un('click', this._onClickFunc);
        this.line.un('dblclick', this._onDblClickFunc);
        this.line.un('contextMenu', this._onRtClickFunc);
        this.line.un('mouseout', this._onMouseOutFunc);
      }
      this.line.lineWidth = this.lineWidth;
      this.line.setColor(this.color);
      this.pathRouter.route(
        this.diagram,
        this.sourcePort,
        this.targetPort,
        this.id
      );
      this.line.arrowHead = this.arrowHead;
      this.line.draw(this.pathRouter.getDrawElements());
      this.line.on('click', this._onClickFunc);
      this.line.on('dblclick', this._onDblClickFunc);
      this.line.on('contextmenu', this._onRtClickFunc);
      this.line.on('mouseout', this._onMouseOutFunc);
      this._addDragPoints();
      if (this.supportsPrintLines) {
        var line = this.line;
        for (var i = 0; i < line.lines.length; i++) {
          var elem = $(line.lines[i].getElement());
          if (
            line.lines[i].getStartPoint().getX() ==
              line.lines[i].getEndPoint().getX() &&
            line.lines[i].getStartPoint().getY() !=
              line.lines[i].getEndPoint().getY()
          ) {
            var newElem = cel('div');
            newElem.style.height = elem.offsetHeight + 'px';
            newElem.className = 'printLine';
            elem.appendChild(newElem);
            if (elem.children[0].children[0])
              elem.children[0].children[0].className = 'printRemoveLine';
            else elem.children[0].className = 'printRemoveLine';
          }
        }
      }
    }
  },
  _createLine: function () {
    this.line = new GwtPolyline(this.diagram.getContainer(), 'p_' + this.id);
    this.line.clickToleranceWidth = this.clickToleranceWidth;
  },
  _clearDragPoints: function () {
    if (this.dragPoints) this.dragPoints.destroy();
    this.dragPoints = null;
  },
  _addDragPoints: function () {
    this._clearDragPoints();
    if (
      this.diagram.readOnly ||
      (!this.diagram.allowDragEdgeSource && !this.diagram.allowDragEdgeTarget)
    )
      return;
    this.dragPoints = new GwtEdgeDragPoint(
      this,
      this.id,
      this.line.getStartPoint(),
      this.line.getEndPoint()
    );
    this.dragPoints.enable(
      this.diagram.allowDragEdgeSource,
      this.diagram.allowDragEdgeTarget
    );
  },
  _registerNodeHandlers: function (node) {
    if (node) {
      node.on('drag', this._onNodeMoveFunc);
      node.on('move', this._onNodeMoveFunc);
    }
  },
  _unregisterNodeHandlers: function (node) {
    if (node) {
      node.un('drag', this._onNodeMoveFunc);
      node.un('move', this._onNodeMoveFunc);
    }
  },
  _onClick: function (polyline, ev) {
    this.fireEvent('click', this, ev);
  },
  _onDblClick: function (polyline, ev) {
    this.fireEvent('dblclick', this, ev);
  },
  _onMouseOut: function (polyline, ev) {
    this.hideHoverDiv();
    this.fireEvent('mouseout', this, ev);
  },
  showHoverDiv: function (x, y) {
    this.highlight();
    var pos = this.diagram.getPosition();
    this.hoverDiv.innerHTML = this.description;
    this.hoverDiv.style.left = x - pos.getX() + 5 + 'px';
    this.hoverDiv.style.top = y - pos.getY() + 25 + 'px';
    this.hoverDiv.style.visibility = 'visible';
  },
  hideHoverDiv: function () {
    this.dim();
    if (this.hoverDiv) this.hoverDiv.style.visibility = 'hidden';
  },
  _onNodeMove: function (node, x, y) {
    this._invalidate();
  },
  isClickNearEdge: function (ev) {
    return this.line.isClickNearPolyLine(ev);
  },
  type: function () {
    return 'GwtDiagramEdge';
  },
});
