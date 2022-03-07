/*! RESOURCE: /scripts/classes/GwtDraggableDraw.js */
var GwtDraggableDraw = Class.create(GwtDraggable, {
  initialize: function (header, itemDragged) {
    this._createCanvas(header);
    GwtDraggable.prototype.initialize.call(this, this.canvas);
    this.setStart(this.drawStart.bind(this));
    this.setDrag(this.drawDrag.bind(this));
    this.setEnd(this.drawEnd.bind(this));
    this.setCursor('crosshair');
    this.setScroll(true);
    Event.observe(window, 'resize', this._resizeCanvas.bind(this));
  },
  destroy: function () {
    this._destroyTool();
    this._destroyCanvas();
    GwtDraggable.prototype.destroy.call(this);
  },
  moveCanvas: function (topx, left) {
    var div = gel('canvas');
    div.style.top = topx;
    div.style.left = left;
  },
  _createTool: function () {
    var div = cel('div');
    div.id = 'tool';
    div.style.position = 'absolute';
    div.style.top = 0 + 'px';
    div.style.left = 0 + 'px';
    div.style.height = 0 + 'px';
    div.style.width = 0 + 'px';
    div.style.border = '1px solid black';
    div.style.backgroundColor = '#9999aa';
    div.style.opacity = '.20';
    div.style.filter = 'alpha(opacity=20)';
    div.style.zIndex = 10000;
    this.draggable.appendChild(div);
    return div;
  },
  _destroyTool: function () {
    if (this.tool) {
      rel(this.tool);
      this.tool = null;
    }
  },
  _drawTool: function () {
    this.tool.style.left = this.left - this.offsetLeft + 'px';
    this.tool.style.top = this.top - this.offsetTop + 'px';
    this.tool.style.width = this.width + 'px';
    this.tool.style.height = this.height + 'px';
  },
  _createCanvas: function (el) {
    this.offsetTop = grabOffsetTop(el);
    this.offsetLeft = grabOffsetLeft(el);
    var topx = this.offsetTop;
    var left = this.offsetLeft;
    if (Element.getStyle(el, 'position') == 'relative') {
      topx = 0;
      left = 0;
    }
    var div = cel('div');
    div.id = 'canvas';
    div.style.position = 'absolute';
    div.style.top = topx + 'px';
    div.style.left = left + 'px';
    div.style.border = 0 + 'px';
    div.style.zIndex = 0;
    el.appendChild(div);
    this.canvas = div;
    this._resizeCanvas();
  },
  _resizeCanvas: function () {
    this.canvas.style.width = this.canvas.parentNode.scrollWidth + 'px';
    this.canvas.style.height = this.canvas.parentNode.scrollHeight + 'px';
  },
  _destroyCanvas: function () {
    if (this.canvas) {
      rel(this.canvas);
      this.canvas = null;
    }
  },
  drawStart: function (me, x, y) {
    var offset = this._getScrollOffset();
    if (this.tool) this._destroyTool();
    this.tool = this._createTool();
    this.startX = x + offset.x;
    this.startY = y + offset.y;
    this.left = x;
    this.top = y;
    this.width = 0;
    this.height = 0;
    this._drawTool();
    return true;
  },
  drawDrag: function (me, x, y) {
    var offset = this._getScrollOffset();
    x += this.getXDifference() + offset.x;
    y += this.getYDifference() + offset.y;
    if (x >= this.startX) {
      this.left = this.startX;
      this.width = x - this.startX;
    } else {
      this.left = x;
      this.width = this.startX - x;
    }
    if (y >= this.startY) {
      this.top = this.startY;
      this.height = y - this.startY;
    } else {
      this.top = y;
      this.height = this.startY - y;
    }
    this._drawTool();
    return true;
  },
  drawEnd: function (me, e) {
    this._destroyTool();
    var rect = {};
    rect.left = this.left + this.canvas.offsetLeft;
    rect.top = this.top + this.canvas.offsetTop;
    rect.width = this.width;
    rect.height = this.height;
    this.fireEvent('enddraw', this, rect, e);
    return true;
  },
  _getScrollOffset: function () {
    return { x: 0, y: 0 };
  },
  z: null,
});
