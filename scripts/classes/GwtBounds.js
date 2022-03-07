/*! RESOURCE: /scripts/classes/GwtBounds.js */
var GwtBounds = Class.create({
  initialize: function (left, top, width, height) {
    if (
      left == undefined ||
      top == undefined ||
      width == undefined ||
      height == undefined
    )
      return;
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
    this.middleX = left + width / 2;
    this.middleY = top + height / 2;
    this.bottom = top + height;
    this.right = left + width;
    this.cbottom = this.bottom;
    this.cright = this.right;
  },
  setFromElement: function (element) {
    var e = $(element);
    if (!e) return;
    var rect = getBounds(e);
    this.left = rect.left;
    this.top = rect.top;
    this.width = rect.width;
    this.height = rect.height;
    this.middleX = rect.middleX;
    this.middleY = rect.middleY;
    this.bottom = rect.bottom;
    this.right = rect.right;
    this.cbottom = rect.cbottom;
    this.cright = rect.cright;
  },
  getLeft: function () {
    return this.left;
  },
  getTop: function () {
    return this.top;
  },
  getWidth: function () {
    return this.width;
  },
  getHeight: function () {
    return this.height;
  },
  getBottom: function () {
    return this.bottom;
  },
  getRight: function () {
    return this.right;
  },
  isPointWithin: function (x, y) {
    return (
      x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
    );
  },
  isInRect: function (rect) {
    return !(
      this.getLeft() > rect.getRight() ||
      this.getRight() < rect.getLeft() ||
      this.getTop() > rect.getBottom() ||
      this.getBottom() < rect.getTop()
    );
  },
  toString: function () {
    return (
      '(' +
      this.getLeft() +
      ',' +
      this.getTop() +
      ')(' +
      this.getRight() +
      ',' +
      this.getBottom() +
      ')'
    );
  },
  isLineIntersecting: function (line) {
    if (
      this.isPointWithin(line.points[0].getX(), line.points[0].getY()) ||
      this.isPointWithin(line.points[1].getX(), line.points[1].getY())
    )
      return true;
    var topLine = new GwtLineSegment(
      new GwtPoint(this.getLeft(), this.getTop()),
      new GwtPoint(this.getRight(), this.getTop())
    );
    if (topLine.isLineIntersecting(line)) return true;
    var leftLine = new GwtLineSegment(
      new GwtPoint(this.getLeft(), this.getTop()),
      new GwtPoint(this.getLeft(), this.getBottom())
    );
    if (leftLine.isLineIntersecting(line)) return true;
    var bottomLine = new GwtLineSegment(
      new GwtPoint(this.getLeft(), this.getBottom()),
      new GwtPoint(this.getRight(), this.getBottom())
    );
    if (bottomLine.isLineIntersecting(line)) return true;
    return false;
  },
});
