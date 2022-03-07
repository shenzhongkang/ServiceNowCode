/*! RESOURCE: /scripts/classes/GwtCircle.js */
var GwtCircle = Class.create(GwtGraphic, {
  initialize: function (container, id) {
    GwtGraphic.prototype.initialize.call(this, container, id);
    this.lineWidth = 1;
    this.color = 'black';
    this.fillColor = null;
    this.radius = -1;
    this.diameter = -1;
    this.getElement().onclick = this._onClick.bindAsEventListener(this);
    this.getElement().ondblclick = this._onDblClick.bindAsEventListener(this);
    this.getElement().oncontextmenu =
      this._onContextMenu.bindAsEventListener(this);
  },
  destroy: function () {
    GwtGraphic.prototype.destroy.call(this);
  },
  setColor: function (c) {
    this.color = c;
    if (this.radius > 0) this._draw();
  },
  setFillColor: function (c) {
    this.fillColor = c;
  },
  draw: function (radius, x, y) {
    this.radius = radius;
    this.diameter = radius * 2;
    this.setBounds(x, y, this.diameter, this.diameter);
    this._draw();
  },
  _draw: function () {
    var doublePi = Math.PI * 2.0;
    var ctx = this._getContext();
    ctx.clearRect(0, 0, this.getWidth(), this.getHeight());
    if (this.fillColor != null) {
      ctx.beginPath();
      ctx.fillStyle = this.fillColor;
      ctx.arc(
        this.radius,
        this.radius,
        this.radius - this.lineWidth,
        0,
        doublePi,
        false
      );
      ctx.fill();
    }
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = this.lineWidth;
    ctx.arc(
      this.radius,
      this.radius,
      this.radius - this.lineWidth + 1,
      0,
      doublePi,
      false
    );
    ctx.stroke();
  },
  _onClick: function (event) {
    this.fireEvent('click', this, event);
    return false;
  },
  _onDblClick: function (event) {
    this.fireEvent('dblclick', this, event);
    return false;
  },
  _onContextMenu: function (event) {
    this.fireEvent('contextmenu', this, event);
    return false;
  },
  type: function () {
    return 'GwtCircle';
  },
});
