/*! RESOURCE: /scripts/classes/ajax/DerivedFields.js */
var DerivedFields = Class.create({
  initialize: function (elementName, value) {
    this.elementName = elementName;
    this.value = value;
    this.isDerivedWaiting =
      typeof g_form !== 'undefined' && g_form._isDerivedWaiting(elementName);
    this.dfs =
      (typeof g_form !== 'undefined' &&
        g_form.getDerivedFields(elementName, true)) ||
      null;
  },
  clearRelated: function () {
    if (typeof g_form === 'undefined') return;
    var list = this.dfs;
    if (list == null) return;
    var prefix = this.elementName.split('.');
    var refFieldName = prefix.shift();
    prefix = prefix.join('.');
    for (var i = 0; i < list.length; i++) {
      var elname = prefix + '.' + list[i];
      g_form._addDerivedWaiting(
        elname,
        refFieldName,
        g_form.isDisabled(elname)
      );
      var el = gel(refFieldName + '.' + elname);
      if (el && el.getAttribute('choice') !== '3') g_form.clearValue(elname);
    }
  },
  updateRelated: function (key) {
    if (typeof key === 'undefined') key = this.value;
    if (typeof key === 'undefined' || typeof g_form === 'undefined') return;
    var list = this.dfs;
    if (list == null) return;
    if (key === '' && !this.isDerivedWaiting) {
      list.forEach(function (fn) {
        resetDerivedWaitingThenclearValue(this.elementName + '.' + fn);
      }, this);
      return;
    }
    list.forEach(function (fieldName) {
      var widgetName = 'sys_original.' + this.elementName + '.' + fieldName;
      var widget = gel(widgetName);
      if (widget) widget.value = '';
    }, this);
    if (key === '' && this.isDerivedWaiting) return;
    var url =
      'xmlhttp.do?sysparm_processor=GetReferenceRecord' +
      '&sysparm_name=' +
      this.elementName +
      '&sysparm_value=' +
      key +
      '&sysparm_derived_fields=' +
      list.join(',');
    var args = new Array(this.elementName, list.join(','));
    serverRequest(url, refFieldChangeResponse, args);
  },
  isDerivedWaitingClearValue: function () {
    return this.value == '' && this.isDerivedWaiting;
  },
  toString: function () {
    return 'DerivedFields';
  },
});
