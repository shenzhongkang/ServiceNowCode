/*! RESOURCE: /scripts/classes/GwtPolyline.js */
var GwtPolyline = Class.create(GwtObservable, {
  CURVE_SIZE: 10,
  initialize: function (container, id) {
    GwtObservable.prototype.initialize.call(this);
    this.id = id;
    this.container = container;
    this.fill = true;
    this.lineWidth = 1;
    this.lineCap = 'round';
    this.arrowHead = false;
    this.curved = false;
    this.color = 'black';
    this.clickToleranceWidth = 12;
    this.lines = [];
    this.curves = [];
    this._onClickFunc = this._onClick.bind(this);
    this._onDblClickFunc = this._onDblClick.bind(this);
    this._onMouseOverFunc = this._onMouseOver.bind(this);
    this._onMouseOutFunc = this._onMouseOut.bind(this);
  },
  destroy: function () {
    for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].un('click', this._onClickFunc);
      this.lines[i].un('dblclick', this._onDblClickFunc);
      this.lines[i].un('mouseover', this._onMouseOverFunc);
      this.lines[i].un('mouseout', this._onMouseOutFunc);
      this.lines[i].destroy();
    }
    this.lines = [];
    for (var i = 0; i < this.curves.length; i++) {
      this.curves[i].un('click', this._onClickFunc);
      this.curves[i].un('dblclick', this._onDblClickFunc);
      this.curves[i].un('mouseover', this._onMouseOverFunc);
      this.curves[i].un('mouseout', this._onMouseOutFunc);
      this.curves[i].destroy();
    }
    this.curves = [];
  },
  draw: function (drawElements) {
    this.destroy();
    for (var i = 0; i < drawElements.length; i++) {
      var lastElement = i == drawElements.length - 1;
      var type = drawElements[i].type();
      if (type == 'GwtPointsLine') this._drawLine(drawElements[i], lastElement);
      else if (type == 'GwtPointsPolyLine')
        this._drawPolyLine(drawElements[i], lastElement);
      else if (type == 'GwtPointsQCurve')
        this._drawQCurve(drawElements[i], lastElement);
    }
  },
  setColor: function (c) {
    this.color = c;
    for (var i = 0; i < this.lines.length; i++) this.lines[i].setColor(c);
    for (var i = 0; i < this.curves.length; i++) this.curves[i].setColor(c);
  },
  setZIndex: function (z) {
    for (var i = 0; i < this.lines.length; i++) this.lines[i].setZIndex(z);
    for (var i = 0; i < this.curves.length; i++) this.curves[i].setZIndex(z);
  },
  translate: function (xDelta, yDelta) {
    for (var i = 0; i < this.lines.length; i++)
      this.lines[i].translate(xDelta, yDelta);
  },
  lineLength: function () {
    var len = 0;
    for (var i = 0; i < this.lines.length; i++)
      len += this.lines[i].lineLength();
    return len;
  },
  midPoint: function () {
    var len = this.lineLength();
    var midLength = parseInt(len / 2);
    var accumulatedLength = 0;
    var offset = 0;
    var containingSegment = 0;
    for (var i = 0; i < this.lines.length; i++) {
      var segmentLength = this.lines[i].lineLength();
      if (accumulatedLength + segmentLength >= midLength) {
        offset = midLength - accumulatedLength;
        containingSegment = i;
        break;
      }
      accumulatedLength += segmentLength;
    }
    return this.lines[containingSegment].midPoint();
  },
  getStartPoint: function () {
    return this.lines[0].getStartPoint();
  },
  getEndPoint: function () {
    return this.lines[this.lines.length - 1].getEndPoint();
  },
  isClickNearPolyLine: function (ev) {
    for (var i = 0; i < this.lines.length; i++) {
      if (this.lines[i].clickNearLine(ev)) return true;
    }
    for (var i = 0; i < this.curves.length; i++) {
      if (this.curves[i].isNearCurve(ev)) return true;
    }
  },
  toString: function () {
    var s = '';
    for (var i = 0; i < this.lines.length; i++)
      s += this.lines[i].toString() + ',';
    if (s.length > 0) s = s.substring(0, s.length - 1);
    return s;
  },
  _createLineSegment: function () {
    var segmentCnt = this.lines.length;
    this.lines[segmentCnt] = new GwtLine(
      this.container,
      this.id + '_s' + segmentCnt
    );
    this.lines[segmentCnt].clickToleranceWidth = this.clickToleranceWidth;
    this.lines[segmentCnt].fill = this.fill;
    this.lines[segmentCnt].lineWidth = this.lineWidth;
    this.lines[segmentCnt].lineCap = this.lineCap;
    this.lines[segmentCnt].setColor(this.color);
    this.lines[segmentCnt].on('click', this._onClickFunc);
    this.lines[segmentCnt].on('dblclick', this._onDblClickFunc);
    this.lines[segmentCnt].on('mouseover', this._onMouseOverFunc);
    this.lines[segmentCnt].on('mouseout', this._onMouseOutFunc);
    return this.lines[segmentCnt];
  },
  _drawLine: function (points, lastElement) {
    var line = this._createLineSegment();
    if (this.arrowHead && lastElement)
      line.drawLineWithArrowHead(
        points.startPoint.getX(),
        points.startPoint.getY(),
        points.endPoint.getX(),
        points.endPoint.getY()
      );
    else
      line.drawLine(
        points.startPoint.getX(),
        points.startPoint.getY(),
        points.endPoint.getX(),
        points.endPoint.getY()
      );
  },
  _drawPolyLine: function (polyLine, lastElement) {
    var points = polyLine.points;
    var pointCount = points.length - 1;
    for (var i = 0; i < pointCount; i++) {
      var line = this._createLineSegment();
      var p2 = i + 1;
      if (this.arrowHead && lastElement && p2 == pointCount)
        line.drawLineWithArrowHead(
          points[i].getX(),
          points[i].getY(),
          points[p2].getX(),
          points[p2].getY()
        );
      else
        line.drawLine(
          points[i].getX(),
          points[i].getY(),
          points[p2].getX(),
          points[p2].getY()
        );
    }
  },
  _drawQCurve: function (curve) {
    var curveCnt = this.curves.length;
    this.curves[curveCnt] = new GwtQuadraticCurve(
      this.container,
      this.id + '_q' + curveCnt
    );
    this.curves[curveCnt].setColor(this.color);
    this.curves[curveCnt].lineWidth = this.lineWidth;
    this.curves[curveCnt].draw(
      curve.startPoint,
      curve.endPoint,
      curve.refPoint
    );
    this.curves[curveCnt].on('click', this._onClickFunc);
    this.curves[curveCnt].on('dblclick', this._onDblClickFunc);
    this.curves[curveCnt].on('mouseover', this._onMouseOverFunc);
    this.curves[curveCnt].on('mouseout', this._onMouseOutFunc);
  },
  _onClick: function (line, event) {
    this.fireEvent('click', this, event);
    return false;
  },
  _onDblClick: function (line, event) {
    this.fireEvent('dblclick', this, event);
    return false;
  },
  _onMouseOver: function (line, event) {
    this.fireEvent('mouseover', this, event);
    return false;
  },
  _onMouseOut: function (line, event) {
    this.fireEvent('mouseout', this, event);
    return false;
  },
  type: function () {
    return 'GwtPolyline';
  },
});
