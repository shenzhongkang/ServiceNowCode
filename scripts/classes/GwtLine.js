/*! RESOURCE: /scripts/classes/GwtLine.js */
var GwtLine = Class.create(GwtGraphic, {
  initialize: function (container, id) {
    GwtGraphic.prototype.initialize.call(this, container, id);
    this.lineWidth = 2;
    this.lineCap = 'round';
    this.arrowHead = null;
    this.color = 'black';
    this.segment = null;
    this.arrowHeadFlag = false;
    this.clickToleranceWidth = 12;
    this.getElement().onclick = this._onClick.bindAsEventListener(this);
    this.getElement().ondblclick = this._onDblClick.bindAsEventListener(this);
    this.getElement().oncontextmenu = this._onRtClick.bindAsEventListener(this);
  },
  destroy: function () {
    this.getElement().onclick = null;
    this.getElement().ondblclick = null;
    this.getElement().oncontextmenu = null;
    if (ie5) {
      this.getElement().onmouseenter = null;
      this.getElement().onmouseleave = null;
    } else {
      this.getElement().onmouseover = null;
      this.getElement().onmouseout = null;
    }
    this.removeArrowHead();
    GwtGraphic.prototype.destroy.call(this);
  },
  setColor: function (c) {
    this.color = c;
    if (this.segment != null) this._draw();
  },
  drawLine: function (x1, y1, x2, y2) {
    this._drawLine(x1, y1, x2, y2, false);
  },
  drawLineWithArrowHead: function (x1, y1, x2, y2) {
    this._drawLine(x1, y1, x2, y2, true);
  },
  redraw: function () {
    this.removeArrowHead();
    var x1 = this.segment.points[0].getX();
    var y1 = this.segment.points[0].getY();
    var x2 = this.segment.points[1].getX();
    var y2 = this.segment.points[1].getY();
    var width = Math.abs(x2 - x1);
    var height = Math.abs(y2 - y1);
    var startX, startY, endX, endY;
    var left, top;
    var mid = parseInt(this.lineWidth / 2);
    var canvasWidth = width;
    if (this._isVertical(height, width)) {
      canvasWidth = this.lineWidth + this.clickToleranceWidth;
      mid += this.clickToleranceWidth / 2;
    }
    var canvasHeight = height;
    if (this._isHorizontal(height, width)) {
      canvasHeight = this.lineWidth + this.clickToleranceWidth;
      mid += this.clickToleranceWidth / 2;
    }
    if (width > 0) canvasWidth += mid * 2;
    if (height > 0) canvasHeight += mid * 2;
    if (x1 <= x2) {
      left = x1 - mid;
      startX = mid;
      endX = startX + width;
    } else {
      left = x2 - mid;
      startX = canvasWidth - mid;
      endX = mid;
    }
    if (y1 <= y2) {
      top = y1 - mid;
      startY = mid;
      endY = startY + height;
    } else {
      top = y2 - mid;
      startY = canvasHeight - mid;
      endY = mid;
    }
    var padding = (this.clickToleranceWidth + this.lineWidth) / 2;
    if (this._isHorizontal(height, width)) {
      left += padding;
      startX -= padding;
      canvasWidth -= padding * 2;
      endX -= padding;
    }
    if (this._isVertical(height, width)) {
      top += padding;
      startY -= padding;
      canvasHeight -= padding * 2;
      endY -= padding;
    }
    var ctx = this._getContext();
    this._setupCanvas(ctx, left, top, canvasWidth, canvasHeight);
    this._render(ctx, startX, startY, endX, endY);
  },
  _setupCanvas: function (ctx, left, top, canvasWidth, canvasHeight) {
    var ctx = this._getContext();
    this.setBounds(left, top, canvasWidth, canvasHeight);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    return ctx;
  },
  _render: function (ctx, startX, startY, endX, endY) {
    ctx.lineCap = this.lineCap;
    ctx.lineWidth = this.lineWidth;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.closePath();
    ctx.strokeStyle = this.color;
    ctx.stroke();
    if (this.arrowHeadFlag) this._drawArrowHead(startX, startY, endX, endY);
  },
  _isVertical: function (height, width) {
    return width <= this.lineWidth && height > 0;
  },
  _isHorizontal: function (height, width) {
    return height <= this.lineWidth && width > 0;
  },
  removeArrowHead: function () {
    if (this.arrowHead) {
      this.arrowHead.destroy();
      this.arrowHead = null;
    }
  },
  distanceToPoint: function (point) {
    return this.segment.distanceToPoint(point);
  },
  lineLength: function () {
    return this.segment.lineLength();
  },
  midPoint: function () {
    return this.segment.midpoint();
  },
  getStartPoint: function () {
    return this.segment.getStartPoint();
  },
  getEndPoint: function () {
    return this.segment.getEndPoint();
  },
  nearLine: function (x, y, toleranceDistance) {
    var pos = Position.cumulativeOffset(this.container);
    var adjustX = x - pos[0];
    var adjustY = y - pos[1];
    var clickPoint = new GwtPoint(adjustX, adjustY);
    var d = this.distanceToPoint(clickPoint);
    if (d <= toleranceDistance) {
      return true;
    }
    return false;
  },
  toString: function () {
    return this.segment.toString();
  },
  translate: function (xDelta, yDelta) {
    this.segment.points[0].translate(xDelta, yDelta);
    this.segment.points[1].translate(xDelta, yDelta);
  },
  _registerMouseOver: function () {
    if (ie5) {
      this.getElement().onmouseenter =
        this._onMouseOver.bindAsEventListener(this);
      this.getElement().onmouseleave =
        this._onMouseOut.bindAsEventListener(this);
    } else {
      this.getElement().onmouseover =
        this._onMouseOver.bindAsEventListener(this);
      this.getElement().onmouseout = this._onMouseOut.bindAsEventListener(this);
    }
  },
  _onClick: function (event) {
    this.fireEvent('click', this, event);
    return false;
  },
  _onDblClick: function (event) {
    this.fireEvent('dblclick', this, event);
    return false;
  },
  _onRtClick: function (event) {
    this.fireEvent('rtclick', this, event);
    return false;
  },
  _onMouseOver: function (event) {
    if (this.clickNearLine(event)) {
      this.fireEvent('mouseover', this, event);
      return false;
    }
  },
  _onMouseOut: function (event) {
    this.fireEvent('mouseout', this, event);
    return false;
  },
  clickNearLine: function (event) {
    var x = event.clientX + this.container.scrollLeft + getScrollX();
    var y = event.clientY + this.container.scrollTop + getScrollY();
    return this.nearLine(x, y, (this.lineWidth + this.clickToleranceWidth) / 2);
  },
  _drawLine: function (x1, y1, x2, y2, arrowHeadFlag) {
    this.arrowHeadFlag = arrowHeadFlag;
    if (
      x1 == undefined ||
      y1 == undefined ||
      x2 == undefined ||
      y2 == undefined
    )
      return;
    this.segment = new GwtLineSegment(
      new GwtPoint(x1, y1),
      new GwtPoint(x2, y2)
    );
    this._registerMouseOver();
    this.redraw();
  },
  _draw: function () {
    this._drawLine(
      this.segment.points[0].x,
      this.segment.points[0].y,
      this.segment.points[1].x,
      this.segment.points[1].y,
      this.arrowHeadFlag
    );
  },
  _drawArrowHead: function (x1, y1, x2, y2) {
    var xLineDelta = x2 - x1;
    var yLineDelta = y2 - y1;
    if (xLineDelta == 0 && yLineDelta == 0) {
      xLineDelta = 1;
    }
    var xLineUnitDelta =
      xLineDelta / Math.sqrt(xLineDelta * xLineDelta + yLineDelta * yLineDelta);
    var yLineUnitDelta =
      yLineDelta / Math.sqrt(xLineDelta * xLineDelta + yLineDelta * yLineDelta);
    xLineUnitDelta *= 2.5;
    yLineUnitDelta *= 2.5;
    var headLength = this.lineWidth * 1.5;
    if (headLength < 3) headLength = 3;
    var xBase = x2 - Math.round(headLength * xLineUnitDelta);
    var yBase = y2 - Math.round(headLength * yLineUnitDelta);
    var xNormalDelta = yLineDelta;
    var yNormalDelta = -xLineDelta;
    var xNormalUnitDelta =
      xNormalDelta /
      Math.sqrt(xNormalDelta * xNormalDelta + yNormalDelta * yNormalDelta);
    var yNormalUnitDelta =
      yNormalDelta /
      Math.sqrt(xNormalDelta * xNormalDelta + yNormalDelta * yNormalDelta);
    var points = [];
    points.push(new GwtPoint(x2 + this.left, y2 + this.top));
    points.push(
      new GwtPoint(
        xBase + Math.round(headLength * xNormalUnitDelta) + this.left,
        yBase + Math.round(headLength * yNormalUnitDelta) + this.top
      )
    );
    points.push(
      new GwtPoint(
        xBase - Math.round(headLength * xNormalUnitDelta) + this.left,
        yBase - Math.round(headLength * yNormalUnitDelta) + this.top
      )
    );
    this.arrowHead = new GwtTriangle(this.container, this.id + '_arrow_head');
    this.arrowHead.setColor(this.color);
    this.arrowHead.draw(points);
  },
  type: function () {
    return 'GwtLine';
  },
});
