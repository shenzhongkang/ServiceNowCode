/*! RESOURCE: /scripts/classes/GwtDiagramPathRouter.js */
var GwtDiagramPathRouter = Class.create();
GwtDiagramPathRouter.prototype = {
  initialize: function () {
    this.drawElements = [];
    this.midX = 0;
    this.midY = 0;
  },
  route: function (diagram, sourcePort, targetPort) {
    this.direction = this._determineDirection(
      sourcePort.getBounds(),
      targetPort.getBounds()
    );
    var startPoint = sourcePort.getFromPoint(this.direction);
    var endPoint = targetPort.getToPoint(this.direction);
    this.drawElements = [];
    this.drawElements.push(new GwtPointsLine(startPoint, endPoint));
    this.midX =
      startPoint.getX() + parseInt((endPoint.getX() - startPoint.getX()) / 2);
    this.midY =
      startPoint.getY() + parseInt((endPoint.getY() - startPoint.getY()) / 2);
  },
  getDrawElements: function () {
    return this.drawElements;
  },
  getMidPoint: function () {
    return new GwtPoint(this.midX, this.midY);
  },
  _determineDirection: function (sourceRect, targetRect) {
    var dist = new GwtDistance(sourceRect, targetRect);
    return dist.getDirection();
  },
  type: function () {
    return 'GwtDiagramPathRouter';
  },
};
