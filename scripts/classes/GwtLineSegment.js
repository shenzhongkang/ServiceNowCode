/*! RESOURCE: /scripts/classes/GwtLineSegment.js */
var GwtLineSegment = Class.create({
  initialize: function (point1, point2) {
    this.points = [];
    this.points[0] = point1;
    this.points[1] = point2;
  },
  distanceToPoint: function (point) {
    var v = this.points[1].subtractPoint(this.points[0]);
    var w = point.subtractPoint(this.points[0]);
    var c1 = w.dotProduct(v);
    if (c1 <= 0) return point.distance(this.points[0]);
    var c2 = v.dotProduct(v);
    if (c2 <= c1) return point.distance(this.points[1]);
    var b = c1 / c2;
    var new_x = parseInt(this.points[0].getX() + b * v.getX());
    var new_y = parseInt(this.points[0].getY() + b * v.getY());
    var nearestPointOnLine = new GwtPoint(new_x, new_y);
    return point.distance(nearestPointOnLine);
  },
  midpoint: function () {
    var mpoint = this.points[0].addPoint(this.points[1]);
    mpoint.setX(parseInt(mpoint.getX() / 2));
    mpoint.setY(parseInt(mpoint.getY() / 2));
    return mpoint;
  },
  getStartPoint: function () {
    return this.points[0];
  },
  getEndPoint: function () {
    return this.points[1];
  },
  lineLength: function () {
    return this.points[0].distance(this.points[1]);
  },
  slope: function () {
    var p = this.points[1].subtractPoint(this.points[0]);
    var x = p.getX();
    if (x == 0) return 0;
    return p.getY() / x;
  },
  toString: function () {
    return this.points[0].toString() + this.points[1].toString();
  },
  isLineIntersecting: function (otherLine) {
    var s1 = this._sameSide(this, otherLine);
    var s2 = this._sameSide(otherLine, this);
    return s1 <= 0 && s2 <= 0;
  },
  _sameSide: function (line1, line2) {
    var sameSide = 0;
    var diff_line = line1.points[1].subtractPoint(line1.points[0]);
    var diff_point1 = line2.points[0].subtractPoint(line1.points[0]);
    var diff_point2 = line2.points[1].subtractPoint(line1.points[1]);
    var c1 = diff_line.crossProduct(diff_point1);
    var c2 = diff_line.crossProduct(diff_point2);
    if (c1 != 0 && c2 != 0) sameSide = c1 < 0 != c2 < 0 ? -1 : 1;
    else if (
      diff_line.getX() == 0 &&
      diff_point1.getX() == 0 &&
      diff_point2.getX() == 0
    )
      sameSide =
        !this._isBetween(
          line1.points[0].getY(),
          line1.points[1].getY(),
          line2.points[0].getY()
        ) &&
        !this._isBetween(
          line1.points[0].getY(),
          line1.points[1].getY(),
          line2.points[1].getY()
        )
          ? 1
          : 0;
    else if (
      diff_line.getY() == 0 &&
      diff_point1.getY() == 0 &&
      diff_point2.getY() == 0
    )
      sameSide =
        !this._isBetween(
          line1.points[0].getX(),
          line1.points[1].getX(),
          line2.points[0].getY()
        ) &&
        !this._isBetween(
          line1.points[0].getX(),
          line1.points[1].getX(),
          line2.points[1].getX()
        )
          ? 1
          : 0;
    return sameSide;
  },
  _isBetween: function (a, b, c) {
    return b > a ? c >= a && c <= b : c >= b && c <= a;
  },
  type: function () {
    return 'GwtLineSegment';
  },
});
