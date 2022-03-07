/*! RESOURCE: /scripts/classes/GwtManhattanRoute.js */
var GwtManhattanRoute = Class.create(GwtDiagramPathRouter, {
  CURVE_SIZE: 20,
  initialize: function () {
    GwtDiagramPathRouter.prototype.initialize.call(this);
    this.midX = 0;
    this.midY = 0;
    this.curved = false;
  },
  route: function (diagram, sourcePort, targetPort) {
    this.sourceRect = sourcePort.getBounds();
    this.targetRect = targetPort.getBounds();
    this.direction = this._determineDirection(this.sourceRect, this.targetRect);
    this.startPoint = sourcePort.getFromPoint(this.direction);
    this.endPoint = targetPort.getToPoint(this.direction);
    this.points = [];
    this.drawElements = [];
    this.deltaX = parseInt(this.startPoint.getX() - this.endPoint.getX());
    this.deltaY = parseInt(this.startPoint.getY() - this.endPoint.getY());
    this.midX = parseInt(this.startPoint.getX() - this.deltaX / 2);
    this.midY = parseInt(this.startPoint.getY() - this.deltaY / 2);
    this.points.push(this.startPoint);
    this._addMidPoints();
    this.points.push(this.endPoint);
    if (this.curved) this._addCurves();
    else this.drawElements.push(new GwtPointsPolyLine(this.points));
  },
  getMidPoint: function () {
    return new GwtPoint(this.midX, this.midY);
  },
  _addMidPoints: function () {
    if (this._nodesOverlapVertically()) this._addHorizontalTurn();
    else this._addVerticalTurn();
  },
  _nodesOverlapVertically: function () {
    if (
      (this.sourceRect.right >= this.targetRect.left &&
        this.sourceRect.right <= this.targetRect.right) ||
      (this.sourceRect.left <= this.targetRect.right &&
        this.sourceRect.left >= this.targetRect.left)
    )
      return true;
    else return false;
  },
  _addVerticalTurn: function () {
    this.points.push(new GwtPoint(this.midX, this.startPoint.getY()));
    this.points.push(new GwtPoint(this.midX, this.endPoint.getY()));
  },
  _addHorizontalTurn: function () {
    this.points.push(new GwtPoint(this.startPoint.getX(), this.midY));
    this.points.push(new GwtPoint(this.endPoint.getX(), this.midY));
  },
  _addCurves: function () {
    var points = this.points;
    var p1;
    if (points.length < 3) {
      if (points.length == 2)
        this.drawElements.push(new GwtPointsLine(points[0], points[1]));
      return;
    }
    p1 = points[0];
    for (var i = 1; i < points.length - 1; i++) {
      var p2 = points[i].clone();
      var p3 = points[i + 1].clone();
      p1 = this._addCurveAtCorner(p1, p2, p3);
    }
    this.drawElements.push(new GwtPointsLine(p1, p3));
  },
  _addCurveAtCorner: function (p1, p2, p3) {
    if ((p1.x == p2.x && p2.x == p3.x) || (p1.y == p2.y && p2.y == p3.y)) {
      this.drawElements.push(new GwtPointsLine(p1, p2));
      return p2;
    }
    var refPoint = p2.clone();
    var newPoint1 = this._adjustForCurve(p1, p2);
    var newPoint2 = this._adjustForCurve(p3, p2);
    this.drawElements.push(new GwtPointsLine(p1, newPoint1));
    this.drawElements.push(new GwtPointsQCurve(newPoint1, newPoint2, refPoint));
    return newPoint2;
  },
  _adjustForCurve: function (p1, p2) {
    var direction;
    var size = this.CURVE_SIZE;
    if (p1.x == p2.x) {
      if (size > Math.abs(p2.y - p1.y)) size = Math.abs(p2.y - p1.y);
      if (p2.y > p1.y) direction = GWT_DIRECTION.S;
      else direction = GWT_DIRECTION.N;
    } else {
      if (size > Math.abs(p2.x - p1.x)) size = Math.abs(p2.x - p1.x);
      if (p2.x > p1.x) direction = GWT_DIRECTION.E;
      else direction = GWT_DIRECTION.W;
    }
    var p = new GwtPoint(p2.x, p2.y);
    if (direction == GWT_DIRECTION.S) p.y -= size;
    else if (direction == GWT_DIRECTION.N) p.y += size;
    else if (direction == GWT_DIRECTION.E) p.x -= size;
    else if (direction == GWT_DIRECTION.W) p.x += size;
    else return null;
    return p;
  },
  type: function () {
    return 'GwtManhattanRoute';
  },
});
var GwtManhattanRouteCurve = Class.create(GwtManhattanRoute, {
  initialize: function () {
    GwtManhattanRoute.prototype.initialize.call(this);
    this.curved = true;
  },
  type: function () {
    return 'GwtManhattanRouteCurve';
  },
});
