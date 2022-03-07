/*! RESOURCE: /scripts/classes/GwtPoint.js */
var GwtPoint = Class.create(Point, {
  setX: function (x) {
    this.x = x;
  },
  setY: function (y) {
    this.y = y;
  },
  clone: function () {
    return new GwtPoint(this.x, this.y);
  },
  dotProduct: function (otherPoint) {
    return this.x * otherPoint.getX() + this.y * otherPoint.getY();
  },
  crossProduct: function (otherPoint) {
    return this.x * otherPoint.getY() - this.y * otherPoint.getX();
  },
  subtractPoint: function (otherPoint) {
    var new_x = this.x - otherPoint.getX();
    var new_y = this.y - otherPoint.getY();
    var new_point = new GwtPoint(new_x, new_y);
    return new_point;
  },
  addPoint: function (otherPoint) {
    var new_x = this.x + otherPoint.getX();
    var new_y = this.y + otherPoint.getY();
    var new_point = new GwtPoint(new_x, new_y);
    return new_point;
  },
  distance: function (otherPoint) {
    var new_point = this.subtractPoint(otherPoint);
    var p = new_point.dotProduct(new_point);
    var sr = Math.sqrt(p);
    return parseInt(sr + 0.5);
  },
  toString: function () {
    return '(' + this.x + ',' + this.y + ')';
  },
  translate: function (xDelta, yDelta) {
    this.x += xDelta;
    this.y += yDelta;
  },
  type: function () {
    return 'GwtPoint';
  },
});
