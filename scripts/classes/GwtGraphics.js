/*! RESOURCE: /scripts/classes/GwtGraphics.js */
var GwtGraphic = Class.create(GwtObservable, {
  initialize: function (container, id) {
    this.container = $(container);
    this.id = id;
    this._createCanvas();
  },
  destroy: function () {
    if (isMSIE) {
      if (typeof G_vmlCanvasManager != 'undefined')
        G_vmlCanvasManager.uninitElement(this.canvas);
      this.canvas.removeNode(true);
      this.canvasDiv.removeNode(true);
    } else {
      this.canvasDiv.removeChild(this.canvas);
      this.container.removeChild(this.canvasDiv);
    }
    this.canvas = null;
    this.canvasDiv = null;
    this.container = null;
  },
  setPosition: function (left, top) {
    this.canvasDiv.style.left = this.addPX(left);
    this.canvasDiv.style.top = this.addPX(top);
    this.left = left;
    this.top = top;
  },
  setDimensions: function (width, height) {
    this.canvasDiv.style.width = this.addPX(width);
    this.canvasDiv.style.height = this.addPX(height);
    this.canvasDiv.width = width;
    this.canvasDiv.height = height;
    this.canvas.style.width = this.addPX(width);
    this.canvas.style.height = this.addPX(height);
    this.canvas.width = width;
    this.canvas.height = height;
    this.width = width;
    this.height = height;
  },
  setBounds: function (left, top, width, height) {
    this.setPosition(left, top);
    this.setDimensions(width, height);
  },
  setZIndex: function (z) {
    this.canvasDiv.style.zIndex = z;
  },
  getWidth: function () {
    return this.width;
  },
  getHeight: function () {
    return this.height;
  },
  getElement: function () {
    return this.canvasDiv;
  },
  isPointInPath: function (x, y) {
    return this._getContext().isPointInPath(x, y);
  },
  outline: function (color) {
    var ctx = this._getContext();
    var saveAlpha = ctx.globalAlpha;
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = 1;
    ctx.strokeStyle = color;
    ctx.strokeRect(0, 0, this.width, this.height);
    ctx.globalAlpha = saveAlpha;
  },
  _createCanvas: function () {
    this.canvasDiv = cel('div');
    this.canvasDiv.style.position = 'absolute';
    this.canvasDiv.id = 'div_' + this.id;
    this.canvas = cel('canvas');
    this.canvas.id = 'canvas_' + this.id;
    this.canvas.style.verticalAlign = 'top';
    if (typeof G_vmlCanvasManager != 'undefined') {
      G_vmlCanvasManager.initElement(this.canvas);
    }
    this.canvasDiv.appendChild(this.canvas);
    this.container.appendChild(this.canvasDiv);
  },
  _getContext: function () {
    return this.canvas.getContext('2d');
  },
  addPX: function (val) {
    val = val + '';
    return val.endsWith('px') ? val : val + 'px';
  },
  type: function () {
    return 'GwtGraphic';
  },
});
