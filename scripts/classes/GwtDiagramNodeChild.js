/*! RESOURCE: /scripts/classes/GwtDiagramNodeChild.js */
var GwtDiagramNodeChild = Class.create(GwtDiagramNode, {
  initialize: function (diagram, id, readOnly, parent) {
    this.isChildNode = true;
    this.parent = parent;
    GwtDiagramNode.prototype.initialize.call(this, diagram, id, readOnly);
    this.setData('parent', parent.getID());
    this.setPreference('pinned', true);
    this.setPosition('relative');
    this.setClassName(this.getClassName() + ' diagram_child_node');
  },
  insert: function (container) {
    GwtDiagramNode.prototype.insert.call(this, this.parent.getBody());
    this.parent.addChildNode(this);
  },
  destroy: function () {
    this.destroy0();
    this.parent.deleteChildNode(this);
  },
  destroy0: function () {
    GwtDiagramNode.prototype.destroy.call(this);
  },
  moveTo: function (x, y) {
    return;
  },
  setWindowActive: function () {
    return;
  },
  type: function () {
    return 'GwtDiagramNodeChild';
  },
});
