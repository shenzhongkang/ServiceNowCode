/*! RESOURCE: /scripts/classes/GwtQuadraticCurve.js */
var GwtQuadraticCurve = Class.create(GwtGraphic, {
  CLICK_TOLERANCE_WIDTH: 8,
  initialize: function (container, id) {
    GwtGraphic.prototype.initialize.call(this, container, id);
    this.color = 'black';
    this.lineWidth = 1;
    this.points = [];
    this.getElement().onclick = this._onClick.bindAsEventListener(this);
    this.getElement().ondblclick = this._onDblClick.bindAsEventListener(this);
    this.getElement().onmousemove = this._onMouseMove.bindAsEventListener(this);
    if (ie5)
      this.getElement().onmouseleave =
        this._onMouseOut.bindAsEventListener(this);
    else
      this.getElement().onmouseout = this._onMouseOut.bindAsEventListener(this);
  },
  destroy: function () {
    this.getElement().onclick = null;
    this.getElement().ondblclick = null;
    this.getElement().onmousemove = null;
    this.getElement().onmouseleave = null;
    this.getElement().onmouseout = null;
    GwtGraphic.prototype.destroy.call(this);
  },
  draw: function (curveBegin, curveEnd, refPoint) {
    this.points.push(curveBegin);
    this.points.push(curveEnd);
    this.points.push(refPoint);
    this._loadClickableAreas();
    this._draw();
  },
  _draw: function () {
    var padding = this.lineWidth;
    var curveBegin = this.points[0];
    var curveEnd = this.points[1];
    var refPoint = this.points[2];
    var canvasWidth = Math.abs(curveBegin.getX() - curveEnd.getX());
    var canvasHeight = Math.abs(curveBegin.getY() - curveEnd.getY());
    if (curveBegin.getX() > curveEnd.getX()) {
      var maxX = curveBegin.getX();
    } else {
      var maxX = curveEnd.getX();
    }
    if (curveBegin.getY() > curveEnd.getY()) {
      var maxY = curveBegin.getY();
    } else {
      var maxY = curveEnd.getY();
    }
    var xOffset = maxX - canvasWidth;
    var yOffset = maxY - canvasHeight;
    canvasWidth += padding * 2;
    canvasHeight += padding * 2;
    maxX += padding;
    maxY += padding;
    xOffset -= padding;
    yOffset -= padding;
    this.setBounds(xOffset, yOffset, canvasWidth, canvasHeight);
    var ctx = this._getContext();
    ctx.lineWidth = this.lineWidth;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.beginPath();
    ctx.moveTo(curveBegin.getX() - xOffset, curveBegin.getY() - yOffset);
    ctx.bezierCurveTo(
      refPoint.getX() - xOffset,
      refPoint.getY() - yOffset,
      refPoint.getX() - xOffset,
      refPoint.getY() - yOffset,
      curveEnd.getX() - xOffset,
      curveEnd.getY() - yOffset
    );
    ctx.strokeStyle = this.color;
    ctx.stroke();
  },
  _loadClickableAreas: function () {
    this.baseRect1 = this._baseRectangle(
      this.points[0],
      this.points[2],
      this.points[1]
    );
    this.baseRect2 = this._baseRectangle(
      this.points[2],
      this.points[1],
      this.points[0]
    );
  },
  _baseRectangle: function (startPoint, endPoint, offsetPoint) {
    if (startPoint.getY() == endPoint.getY()) {
      var height = this.CLICK_TOLERANCE_WIDTH;
      var top = startPoint.getY();
      if (offsetPoint.getY() < startPoint.getY()) top -= height;
      var left = startPoint.getX();
      if (endPoint.getX() < startPoint.getX()) left = endPoint.getX();
      var width = Math.abs(startPoint.getX() - endPoint.getX());
    } else {
      var width = this.CLICK_TOLERANCE_WIDTH;
      var left = startPoint.getX();
      if (offsetPoint.getX() < startPoint.getX());
      left -= width;
      var top = startPoint.getY();
      if (endPoint.getY() < startPoint.getY()) top = endPoint.getY();
      var height = Math.abs(startPoint.getY() - endPoint.getY());
    }
    return new GwtBounds(left, top, width, height);
  },
  setColor: function (c) {
    this.color = c;
    if (this.points.length > 0) this._draw();
  },
  _onClick: function (event) {
    this.fireEvent('click', this, event);
    return false;
  },
  _onDblClick: function (event) {
    this.fireEvent('dblclick', this, event);
    return false;
  },
  _onMouseMove: function (event) {
    if (this.isNearCurve(event)) {
      this.fireEvent('mouseover', this, event);
      return false;
    }
    this.fireEvent('mouseout', this, event);
  },
  _onMouseOut: function (event) {
    this.fireEvent('mouseout', this, event);
    return false;
  },
  isNearCurve: function (event) {
    var pos = Position.cumulativeOffset(this.container);
    var adjustX =
      event.clientX - pos[0] + this.container.scrollLeft + getScrollX();
    var adjustY =
      event.clientY - pos[1] + this.container.scrollTop + getScrollY();
    return (
      this.baseRect1.isPointWithin(adjustX, adjustY) ||
      this.baseRect2.isPointWithin(adjustX, adjustY)
    );
  },
  type: function () {
    return 'GwtQuadraticCurve';
  },
});
