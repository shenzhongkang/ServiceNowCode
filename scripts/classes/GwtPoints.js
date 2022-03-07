/*! RESOURCE: /scripts/classes/GwtPoints.js */
var GwtPointsLine = Class.create({
  initialize: function (startPoint, endPoint) {
    this.startPoint = startPoint.clone();
    this.endPoint = endPoint.clone();
  },
  type: function () {
    return 'GwtPointsLine';
  },
});
var GwtPointsPolyLine = Class.create({
  initialize: function (points) {
    this.points = points;
  },
  type: function () {
    return 'GwtPointsPolyLine';
  },
});
var GwtPointsQCurve = Class.create({
  initialize: function (startPoint, endPoint, refPoint) {
    this.startPoint = startPoint.clone();
    this.endPoint = endPoint.clone();
    this.refPoint = refPoint.clone();
  },
  type: function () {
    return 'GwtPointsQCurve';
  },
});
