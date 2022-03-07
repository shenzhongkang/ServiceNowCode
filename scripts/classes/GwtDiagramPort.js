/*! RESOURCE: /scripts/classes/GwtDiagramPort.js */
var GwtDiagramPort = Class.create(GwtObservable, {
  initialize: function (node, id, readOnly) {
    this.node = node;
    this.id = id;
    this.firstEdge = null;
    this.readOnly = readOnly;
    this.clearData();
  },
  getID: function () {
    return '';
  },
  getNodeID: function () {
    return node.getID();
  },
  setData: function (name, value) {
    this.data[name] = value;
  },
  getData: function (name, defaultValue) {
    if (defaultValue == undefined) defaultValue = '';
    if (this.data[name] != undefined) return this.data[name];
    else return defaultValue;
  },
  removeData: function (name) {
    delete this.data[name];
  },
  clearData: function () {
    this.data = {};
  },
  loadFromGraphML: function (graphml) {
    graphml.copyData(this.data);
  },
  saveToGraphML: function (graphmlElement) {
    graphmlElement.setID(this.id);
    graphmlElement.setAttribute('node', this.node.getID());
    graphmlElement.saveData(this.data);
  },
  getBounds: function () {
    return new GwtBounds(
      this.node.getX(),
      this.node.getY(),
      this.node.getWidth(),
      this.node.getHeight()
    );
  },
  isFirstEdge: function (id) {
    var isFirst = this.firstEdge == null || this.firstEdge == id;
    if (this.firstEdge == null) this.firstEdge = id;
    return isFirst;
  },
  getFromPoint: function (direction) {
    var x, y;
    var bounds = this.getBounds();
    if (direction == GWT_DIRECTION.S) {
      x = bounds.middleX;
      y = bounds.bottom;
    } else if (direction == GWT_DIRECTION.SW) {
      x = bounds.left;
      y = bounds.bottom;
    } else if (direction == GWT_DIRECTION.W) {
      x = bounds.left;
      y = bounds.middleY;
    } else if (direction == GWT_DIRECTION.NW) {
      x = bounds.left;
      y = bounds.top;
    } else if (direction == GWT_DIRECTION.N) {
      x = bounds.middleX;
      y = bounds.top;
    } else if (direction == GWT_DIRECTION.NE) {
      x = bounds.right;
      y = bounds.top;
    } else if (direction == GWT_DIRECTION.E) {
      x = bounds.right;
      y = bounds.middleY;
    } else if (direction == GWT_DIRECTION.SE) {
      x = bounds.right;
      y = bounds.bottom;
    }
    return new GwtPoint(x, y);
  },
  getToPoint: function (direction) {
    var x, y;
    var bounds = this.getBounds();
    if (direction == GWT_DIRECTION.S) {
      x = bounds.middleX;
      y = bounds.top;
    } else if (direction == GWT_DIRECTION.SW) {
      x = bounds.right;
      y = bounds.top;
    } else if (direction == GWT_DIRECTION.W) {
      x = bounds.right;
      y = bounds.middleY;
    } else if (direction == GWT_DIRECTION.NW) {
      x = bounds.right;
      y = bounds.bottom;
    } else if (direction == GWT_DIRECTION.N) {
      x = bounds.middleX;
      y = bounds.bottom;
    } else if (direction == GWT_DIRECTION.NE) {
      x = bounds.left;
      y = bounds.bottom;
    } else if (direction == GWT_DIRECTION.E) {
      x = bounds.left;
      y = bounds.middleY;
    } else if (direction == GWT_DIRECTION.SE) {
      x = bounds.left;
      y = bounds.top;
    }
    return new GwtPoint(x, y);
  },
  type: function () {
    return 'GwtDiagramPort';
  },
});
