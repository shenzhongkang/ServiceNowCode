/*! RESOURCE: /scripts/classes/GwtTriangle.js */
var GwtTriangle = Class.create(GwtGraphic, {
  initialize: function (container, id) {
    GwtGraphic.prototype.initialize.call(this, container, id);
    this.fill = true;
    this.lineWidth = 1;
    this.lineCap = 'round';
    this.color = 'black';
    this.points = [];
  },
  destroy: function () {
    GwtGraphic.prototype.destroy.call(this);
  },
  setColor: function (c) {
    this.color = c;
    if (this.points.length > 0) this._draw();
  },
  draw: function (points) {
    if (points.length != 3) return;
    this.points = [];
    for (var i = 0; i < 3; i++)
      this.points[i] = new GwtPoint(points[i].x, points[i].y);
    this._draw();
  },
  _draw: function () {
    var left = this.points[0].x;
    var right = this.points[0].x;
    var topx = this.points[0].y;
    var bottom = this.points[0].y;
    for (var i = 1; i < 3; i++) {
      if (this.points[i].x < left) left = this.points[i].x;
      if (this.points[i].x > right) right = this.points[i].x;
      if (this.points[i].y < topx) topx = this.points[i].y;
      if (this.points[i].y > bottom) bottom = this.points[i].y;
    }
    var width = right - left;
    var height = bottom - topx;
    this.setBounds(left, topx, width, height);
    this.canvas.style.position = this.canvasDiv.style.position + '';
    var ctx = this._getContext();
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.lineCap = this.lineCap;
    ctx.lineWidth = this.lineWidth;
    ctx.moveTo(this.points[0].x - left, this.points[0].y - topx);
    for (var i = 1; i < 3; i++) {
      ctx.lineTo(this.points[i].x - left, this.points[i].y - topx);
    }
    if (this.fill) {
      ctx.fillStyle = this.color;
      ctx.fill();
    } else {
      ctx.strokeStyle = this.color;
      ctx.stroke();
    }
  },
  type: function () {
    return 'GwtTriangle';
  },
});
