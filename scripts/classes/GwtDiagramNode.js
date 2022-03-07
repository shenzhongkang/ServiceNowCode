/*! RESOURCE: /scripts/classes/GwtDiagramNode.js */
var GwtDiagramNode = Class.create(GlideWindow, {
  DEFAULT_ZINDEX: 4,
  initialize: function (diagram, id, readOnly) {
    this.childNodes = {};
    if (diagram.useUniqueIds) {
      id = diagram.container.id + '_' + id;
    }
    this.useUniqueIds = true;
    GlideWindow.prototype.initialize.call(this, id, readOnly);
    this.diagram = diagram;
    if (!this.diagram.allowMoveNode) this.setPreference('pinned', true);
    this.isDragging = false;
    this.clearData();
    this.window.style.tableLayout = 'fixed';
    this.window.style.overflow = 'hidden';
    this.setStyle('overflow', 'hidden');
    this.setClassName('drag_section');
    this.getTitle().style.whiteSpace = 'normal';
    if (this.diagram.layout) {
      this.setSize(
        this.diagram.layout.nodeWidth,
        this.diagram.layout.nodeHeight
      );
      this.setFont(
        this.diagram.layout.nodeFont,
        this.diagram.layout.nodeFontSize
      );
    } else {
      this.setSize(
        this.diagram.DEFAULT_NODE_WIDTH,
        this.diagram.DEFAULT_NODE_HEIGHT
      );
      this.setFont(this.diagram.DEFAULT_FONT, this.diagram.DEFAULT_FONT_SIZE);
    }
    this.setZIndex(this.DEFAULT_ZINDEX);
    this.on('click', this._onClick.bind(this));
    this.ports = {};
    this._createDefaultPort(readOnly);
    if (!this.diagram.allowDeleteNode) this.removeCloseDecoration();
    this.contextMenu = [];
  },
  getBaseID: function () {
    var id = this.id;
    if (this.useUniqueIds)
      id = id.substring(this.diagram.container.id.length + 1);
    return id;
  },
  getX: function () {
    if (!this.isReadOnly() && this.cacheY) return this.cacheX;
    return this.getContainer().offsetLeft;
  },
  getY: function () {
    if (!this.isReadOnly() && this.cacheY) return this.cacheY;
    return this.getContainer().offsetTop;
  },
  getHeight: function () {
    if (!this.isReadOnly() && this.cacheHeight) return this.cacheHeight;
    return parseInt(Element.getDimensions(this.getWindowDOM()).height);
  },
  getWidth: function () {
    if (!this.isReadOnly() && this.cacheWidth) return this.cacheWidth;
    var e = this.getWindowDOM();
    return parseInt(Element.getDimensions(e).width, 10) + 2;
  },
  scale: function (ratio, fontSize) {
    if (!this.nonScaleX) {
      this.nonScaleX = this.getX();
      this.nonScaleY = this.getY();
      this.nonScaleH = this.getHeight();
      this.nonScaleW = this.getWidth();
    }
    var w = ratio * this.nonScaleW;
    var h = ratio * this.nonScaleH;
    var x = ratio * this.nonScaleX;
    var y = ratio * this.nonScaleY;
    this.setFontSize(fontSize);
    this.setSize(w, h);
    this.moveTo(x, y);
    $(this.getContainer())
      .select('img')
      .each(function (img) {
        if (ratio < 1) {
          img.style.height = ratio * 100 + '%';
          img.style.width = ratio * 100 + '%';
        } else {
          img.style.height = '';
          img.style.width = '';
        }
      });
    $(this.getContainer()).style.height = '';
  },
  getDefaultPort: function () {
    return this.defaultPort;
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
  getPorts: function () {
    return this.ports;
  },
  getPort: function (portID) {
    if (!portID || !this.ports[portID]) return this.defaultPort;
    return this.ports[portID];
  },
  addPort: function (portID, port) {
    this.ports[portID] = port;
  },
  removePort: function (portID) {
    if (this.ports[portID]) delete this.ports[portID];
  },
  dragStart: function (me, x, y, e) {
    this.parentPosition = this.diagram.getPosition();
    x -= this.parentPosition.x;
    y -= this.parentPosition.y;
    this.x = x - me.differenceX;
    this.y = y - me.differenceY;
  },
  dragging: function (me, x, y, e) {
    if (!this.isActive()) {
      var multiselect = getEvent(e).shiftKey;
      this.fireEvent('beforeclick', this, multiselect);
      this.setWindowActive();
      this.fireEvent('afterclick', this, multiselect);
    }
    if (x < this.parentPosition.x || y < this.parentPosition.y) {
      return;
    }
    x -= this.parentPosition.x;
    y -= this.parentPosition.y;
    var oldX = this.x;
    var oldY = this.y;
    this.x = x;
    this.y = y;
    GlideWindow.prototype.dragging.call(this, me, x, y);
    this.fireEvent('drag', this, x - oldX, y - oldY);
  },
  dragEnd: function (me, e) {
    this.fireEvent('dragend', this);
  },
  moveTo: function (x, y) {
    GlideWindow.prototype.moveTo.call(this, x, y);
    this.fireEvent('move', this, x, y);
  },
  setTitle: function (title) {
    this.data['name'] = title;
    GlideWindow.prototype.setTitle.call(this, title);
  },
  setDescription: function (descr) {
    this.data['description'] = descr;
    this.setBody(descr);
  },
  destroy: function () {
    for (var id in this.childNodes) {
      var child = this.childNodes[id];
      child.destroy0();
    }
    this.childNodes = {};
    for (var key in this.ports) this.ports[key].destroy();
    if (this.leftIcon) {
      this.leftIcon.onmouseenter = null;
      this.leftIcon.onmouseleave = null;
      this.leftIcon.onmouseover = null;
      this.leftIcon.onmouseout = null;
    }
    GlideWindow.prototype.destroy.call(this);
  },
  setSelected: function (selectFlag) {
    if (!this.getHeader()) return;
    if (selectFlag) this.setWindowActive();
    else this.setWindowInactive();
  },
  setWindowActive: function () {
    GlideWindow.prototype.setWindowActive.call(this);
  },
  setWindowInactive: function () {
    GlideWindow.prototype.setWindowInactive.call(this);
  },
  getBounds: function () {
    var myRect = new GwtBounds();
    myRect.setFromElement(this.getContainer());
    var parentPosition = this.diagram.getPosition();
    myRect.left -= parentPosition.x;
    myRect.right -= parentPosition.x;
    myRect.top -= parentPosition.y;
    myRect.bottom -= parentPosition.y;
    var sl = this.diagram.getContainer().scrollLeft;
    var st = this.diagram.getContainer().scrollTop;
    myRect.left -= sl;
    myRect.middleX -= sl;
    myRect.right -= sl;
    myRect.top -= st;
    myRect.middleY -= st;
    myRect.bottom -= st;
    return myRect;
  },
  isInRect: function (rect) {
    var myRect = this.getBounds();
    return myRect.isInRect(rect);
  },
  isPointWithin: function (x, y) {
    var myRect = this.getBounds();
    return myRect.isPointWithin(x, y);
  },
  isLineIntersecting: function (line) {
    var myRect = this.getBounds();
    return myRect.isLineIntersecting(line);
  },
  hilight: function (className) {
    if (!className) className = 'drag_section_hilight';
    if (this.getClassName() != className) {
      this.previousClass = this.getClassName();
      this.setClassName(className);
    }
  },
  lowlight: function () {
    if (this.previousClass) this.setClassName(this.previousClass);
  },
  addChildNode: function (childNode) {
    this.childNodes[childNode.getID()] = childNode;
    this.fireEvent('move', this, this.getX(), this.getY());
  },
  deleteChildNode: function (childNode) {
    delete this.childNodes[childNode.getID()];
    this.fireEvent('move', this, this.getX(), this.getY());
  },
  loadFromGraphML: function (graphml) {
    graphml.copyData(this.data);
    this.setTitle(this.getData('name', '(name)'));
    this._loadWindowBody();
    var icon = this.getData('icon');
    if (!icon) icon = 'images/gwt/document.gifx';
    if (!this.leftIcon) this.leftIcon = cel('img');
    this.leftIcon.src = icon;
    this.leftIcon.alt = '';
    if (ie5) {
      this.leftIcon.onmouseenter = this._onImageMouseOver.bind(this);
      this.leftIcon.onmouseleave = this._onImageMouseOut.bind(this);
    } else {
      this.leftIcon.onmouseover = this._onImageMouseOver.bind(this);
      this.leftIcon.onmouseout = this._onImageMouseOut.bind(this);
    }
    this.addDecoration(this.leftIcon, true);
    var color = this.getData('color');
    if (color) this.setHeaderColor(color);
    var deleteable = this.getData('deleteable', 'true');
    if (deleteable == 'false') this.removeCloseDecoration();
  },
  _loadWindowBody: function () {
    var body = this.getData('description');
    if (body) this.setBody(body);
    else this.setBody('');
    this._reloadChildNodes();
  },
  _reloadChildNodes: function () {
    for (var id in this.childNodes) {
      this.childNodes[id].insert(this.getBody());
    }
  },
  _onImageMouseOver: function (event) {
    this.diagram.fireEvent('imagemouseover', this, event);
  },
  _onImageMouseOut: function (event) {
    this.diagram.fireEvent('imagemouseout', this, event);
  },
  loadPortFromGraphML: function (graphml) {
    var port = this._createPort(graphml.getID(), graphml.data);
    graphml.copyData(port.data);
    this.addPort(port.getID(), port);
  },
  saveToGraphML: function (graphmlElement) {
    graphmlElement.setID(this.id);
    this.setData('x', this.getX());
    this.setData('y', this.getY());
    graphmlElement.saveData(this.data);
  },
  setXY: function () {
    var x = this.getData('x');
    var y = this.getData('y');
    if (!x) x = 100;
    if (!y) y = 100;
    this.moveTo(x, y);
  },
  setDimensions: function () {
    var w = this.getData('width');
    var h = this.getData('height');
    if (w) this.setSize(w, h);
    if (this.getData('is_parent') == 'true') this._adjustSizeAsParent();
  },
  setSize: function (w, h, overflow) {
    GlideWindow.prototype.setSize.call(this, w, h);
    this.window.style.height = h;
    if (typeof overflow == 'undefined' || !overflow)
      this.getContainer().style.overflowY = 'hidden';
  },
  _adjustSizeAsParent: function () {
    var h = this.getHeight();
    var w = this.getWidth();
    w += 50;
    this.setSize(w, h);
  },
  _onClick: function (me, e) {
    var multiselect = getEvent(e).shiftKey;
    var isSelected = this.isActive();
    this.fireEvent('beforeclick', this, multiselect);
    this.setSelected(!isSelected);
    this.fireEvent('afterclick', this, multiselect);
  },
  evalCondition: function (condition) {
    if (!condition) return false;
    try {
      return eval(condition);
    } catch (e) {
      return false;
    }
  },
  addMenuAction: function (action) {
    if (this.contextMenu.length == 0)
      this.getWindowDOM().oncontextmenu =
        this._runMenuAction.bindAsEventListener(this);
    this.contextMenu.push(action);
  },
  addIconAction: function (action) {
    var span = cel('span');
    span.title = action.name;
    var img = cel('img', span);
    img.className = 'node_icon';
    img.src = action.icon;
    img.alt = span.title;
    img.gWindow = this;
    img._action = action;
    img.onclick = this._runIconAction.bindAsEventListener(this);
    this.addDecoration(span);
    img = null;
    span = null;
  },
  clearMenuActions: function () {
    this.contextMenu = [];
  },
  clearIconActions: function () {
    this.clearRightDecorations();
  },
  clearActions: function () {
    this.clearMenuActions();
    this.clearIconActions();
  },
  _runIconAction: function (e) {
    Event.stop(e);
    var element = Event.element(e);
    var action = element._action;
    this._runAction(action);
  },
  _runMenuAction: function (e) {
    if (!this.isActive()) this._onClick(this, e);
    var gcm = new GwtContextMenu('diagram_context_menu');
    gcm.clear();
    gcm.setProperty('timeout', 500);
    for (var i = 0; i < this.contextMenu.length; i++) {
      var action = this.contextMenu[i];
      if (action.type == 'line') gcm.addLine();
      else if (action.script)
        gcm.addFunc(
          this.contextMenu[i].name,
          this._runAction.bind(this, this.contextMenu[i])
        );
    }
    Event.stop(e);
    gcm.display(e);
  },
  _runAction: function (a) {
    var action = a;
    if (!action) return;
    if (!action.script) return;
    eval(action.script);
    return false;
  },
  _createDefaultPort: function (readOnly) {
    this.defaultPort = new GwtDiagramPort(this, '', readOnly);
  },
  _createPort: function (id) {
    return new GwtDiagramPort(this, id, this.isReadOnly());
  },
  type: function () {
    return 'GwtDiagramNode';
  },
});
