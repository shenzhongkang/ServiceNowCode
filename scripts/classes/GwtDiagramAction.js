/*! RESOURCE: /scripts/classes/GwtDiagramAction.js */
var GwtDiagramAction = Class.create();
GwtDiagramAction.prototype = {
  TYPE_ICON: 'icon',
  TYPE_MENU: 'menu',
  TYPE_SEP: 'line',
  initialize: function (graphml) {
    if (graphml) {
      this.condition = graphml.getAttribute('condition');
      this.name = graphml.getAttribute('name');
      this.type = graphml.getAttribute('type');
      this.order = graphml.getAttribute('order');
      this.icon = graphml.getAttribute('icon');
      this.script = graphml.getData('script');
    }
  },
  setCondition: function (condition) {
    this.condition = condition;
  },
  setName: function (name) {
    this.name = name;
  },
  setOrder: function (order) {
    this.order = order;
  },
  setType: function (type) {
    this.type = type;
  },
  setIcon: function (icon) {
    this.icon = icon;
  },
  setScript: function (script) {
    this.script = script;
  },
  addToNode: function (node) {
    if (!this.script && this.type != this.TYPE_SEP) return false;
    if (this.condition && !node.evalCondition(this.condition)) return false;
    if (this.type == this.TYPE_MENU || this.type == this.TYPE_SEP)
      node.addMenuAction(this);
    else if (this.type == this.TYPE_ICON) node.addIconAction(this);
  },
  run: function (graph, node) {
    if (!this.script) return;
    return eval(this.script);
  },
  type: function () {
    return 'GwtDiagramAction';
  },
};
