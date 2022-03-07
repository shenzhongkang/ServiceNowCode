/*! RESOURCE: /scripts/classes/GwtEdgeDragPoint.js */
var GwtEdgeDragPoint = Class.create(GwtObservable, {
  initialize: function (edge, id, startPoint, endPoint) {
    this.edge = edge;
    this.id = id;
    this.parentPosition = this.edge.diagram.getPosition();
    this._draggingFunc = this._dragging.bind(this);
    this._draggedFunc = this._dragged.bind(this);
    this.startDiv = this._drawPoint(startPoint, 'start');
    this.endDiv = this._drawPoint(endPoint, 'end');
  },
  enable: function (start, end) {
    if (start) this._enableDragging(this.startDiv);
    if (end) this._enableDragging(this.endDiv);
  },
  destroy: function () {
    this._destroyPoint(this.startDiv);
    this.startDiv = null;
    this._destroyPoint(this.endDiv);
    this.endDiv = null;
  },
  _destroyPoint: function (divPoint) {
    if (!divPoint) return;
    if (divPoint.gd) {
      divPoint.gd.un('dragging', this._draggingFunc);
      divPoint.gd.un('dragged', this._draggedFunc);
      divPoint.gd.destroy();
    }
    divPoint.gd = null;
    divPoint.onmouseover = null;
    divPoint.onmouseout = null;
    rel(divPoint);
  },
  _drawPoint: function (point, type) {
    var dragDiv = cel('div');
    dragDiv.id = this.id + '_' + type;
    dragDiv._type = type;
    dragDiv.className = 'drag_point drag_point_hide';
    dragDiv.style.left = point.getX() - 5 + 'px';
    dragDiv.style.top = point.getY() - 5 + 'px';
    if (type != 'end') dragDiv.style.zIndex = '-1';
    this.edge.diagram.getContainer().appendChild(dragDiv);
    return dragDiv;
  },
  _enableDragging: function (dragDiv) {
    dragDiv.onmouseover = this._show.bindAsEventListener(this);
    dragDiv.onmouseout = this._hide.bindAsEventListener(this);
    dragDiv.gd = new GwtDraggable(dragDiv, dragDiv);
    dragDiv.gd.setCursor('default');
    dragDiv.gd.on('dragging', this._draggingFunc);
    dragDiv.gd.on('dragged', this._draggedFunc);
  },
  _show: function (e) {
    var dragDiv = Event.element(e);
    removeClassName(dragDiv, 'drag_point_hide');
    addClassName(dragDiv, 'drag_point_show');
    this.parentPosition = this.edge.diagram.getPosition();
  },
  _hide: function (e) {
    var dragDiv = Event.element(e);
    removeClassName(dragDiv, 'drag_point_show');
    addClassName(dragDiv, 'drag_point_hide');
  },
  _activateDrag: function (drag, x, y) {
    drag.differenceX = 0;
    drag.differenceY = 0;
    this.line = new GwtLine(
      this.edge.diagram.getContainer(),
      this.id + '_dragline'
    );
    this.line.setZIndex(1000);
    this.line.setColor('blue');
    if (drag.getDraggable()._type == 'start') {
      this.startX = x - this.parentPosition.x;
      this.startY = y - this.parentPosition.y;
      this.endX = parseInt(this.endDiv.style.left);
      this.endY = parseInt(this.endDiv.style.top);
    } else {
      this.startX = parseInt(this.startDiv.style.left);
      this.startY = parseInt(this.startDiv.style.top);
      this.endX = x - this.parentPosition.x;
      this.endY = y - this.parentPosition.y;
    }
    this.prevColor = this.edge.setColor('silver');
    this._drawLine();
  },
  _dragging: function (drag, x, y, e) {
    if (!this.line) this._activateDrag(drag, x, y);
    if (x < this.parentPosition.x || y < this.parentPosition.y) {
      return;
    }
    if (drag.getDraggable()._type == 'start') {
      this.startX = x - this.parentPosition.x;
      this.startY = y - this.parentPosition.y;
    } else {
      this.endX = x - this.parentPosition.x;
      this.endY = y - this.parentPosition.y;
    }
    this._drawLine();
  },
  _dragged: function (drag, e) {
    var x, y;
    if (drag.getDraggable()._type == 'start') {
      x = this.startX + this.parentPosition.x;
      y = this.startY + this.parentPosition.y;
    } else {
      x = this.endX + this.parentPosition.x;
      y = this.endY + this.parentPosition.y;
    }
    var node = this.edge.diagram.pointInNode(x, y);
    if (node) {
      if (
        drag.getDraggable()._type == 'start' &&
        this.edge.getSource().getID() != node.getID() &&
        !this.edge.diagram.isDuplicateEdge(
          node.getID(),
          null,
          this.edge.getTarget().getID()
        )
      ) {
        this.edge.setSource(node);
        this.edge.diagram.edgeChanged(this.edge);
      } else if (
        this.edge.getTarget().getID() != node.getID() &&
        !this.edge.diagram.isDuplicateEdge(
          this.edge.getSourceID(),
          this.edge.getSourcePortID(),
          node.getID()
        )
      ) {
        this.edge.setTarget(node);
        this.edge.diagram.edgeChanged(this.edge);
      }
    }
    this.line.destroy();
    this.line = null;
    this.edge.setColor(this.prevColor);
    this.edge._invalidate();
  },
  _drawLine: function () {
    this.line.drawLineWithArrowHead(
      this.startX,
      this.startY,
      this.endX,
      this.endY
    );
  },
  type: function () {
    return 'GwtEdgeDragPoint';
  },
});
