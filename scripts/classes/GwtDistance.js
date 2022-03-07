/*! RESOURCE: /scripts/classes/GwtDistance.js */
var GwtDistance = Class.create({
  initialize: function (a, b) {
    this.boundA = a;
    this.boundB = b;
    this.xdistance = a.left - b.left;
    this.ydistance = a.top - b.top;
    this.tdistance =
      this.xdistance * this.xdistance + this.ydistance * this.ydistance;
    this.distance = Math.sqrt(this.tdistance);
  },
  getAngle: function () {
    var angle = Math.round(
      (Math.atan2(this.ydistance, this.xdistance) * 180) / Math.PI
    );
    if (angle < 0) angle += 360;
    return angle;
  },
  getDirection: function () {
    if (this.boundA.right < this.boundB.left) {
      if (this.boundA.bottom < this.boundB.top) return GWT_DIRECTION.SE;
      else if (this.boundA.top > this.boundB.bottom) return GWT_DIRECTION.NE;
      else return GWT_DIRECTION.E;
    }
    if (
      this.boundA.right > this.boundB.left &&
      this.boundA.left < this.boundB.right
    ) {
      if (this.boundA.bottom < this.boundB.top) return GWT_DIRECTION.S;
      else return GWT_DIRECTION.N;
    }
    if (this.boundA.bottom < this.boundB.top) return GWT_DIRECTION.SW;
    else if (this.boundA.top > this.boundB.bottom) return GWT_DIRECTION.NW;
    else return GWT_DIRECTION.W;
  },
  getSlope: function () {
    if (this.xdistance == 0) return null;
    return this.ydistance / this.xdistance;
  },
  getDistance: function () {
    return this.distance;
  },
  type: function () {
    return 'GwtDistance';
  },
});
var GWT_DIRECTION = {
  N: 'n',
  S: 's',
  E: 'e',
  W: 'w',
  NE: 'ne',
  NW: 'nw',
  SE: 'se',
  SW: 'sw',
};
