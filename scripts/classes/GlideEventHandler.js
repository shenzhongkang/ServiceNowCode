/*! RESOURCE: /scripts/classes/GlideEventHandler.js */
var GlideEventHandler = Class.create({
  initialize: function (handlerName, handler, fieldName, isUiPolicy) {
    this.handlerName = handlerName;
    this.handler = handler;
    this.fieldName = fieldName;
    this.isUiPolicy = !!isUiPolicy;
  },
});
