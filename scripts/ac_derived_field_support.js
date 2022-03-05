/*! RESOURCE: /scripts/ac_derived_field_support.js */
function refFieldChangeResponse(request, args) {
  if (request == null) return;
  var elementName = args[0];
  var parts = elementName.split('.');
  parts.shift();
  var sName = parts.join('.') + '.';
  if (args[1]) {
    var fields = args[1].split(',');
    setNodes(sName, fields, request);
    return;
  }
  jslog('************** WHAT ARE WE DOING HERE *********************');
}
function setNodes(sName, array, request) {
  for (var i = 0; i < array.length; i++) {
    var fn = array[i];
    var eln = sName + fn;
    var elo = g_form.getGlideUIElement(eln);
    if (!elo) continue;
    var field = request.responseXML.getElementsByTagName(fn);
    if (field.length != 1) {
      resetDerivedWaitingThenclearValue(eln);
      continue;
    }
    var dv = field[0].getAttribute('value');
    var v = field[0].getAttribute('db_value');
    if (elo.getType() == 'glide_list' || elo.getType() == 'reference') {
      g_form._setValue(eln, v, dv.split(','), false);
    } else if (v) g_form.setValue(eln, v, dv);
    else g_form.setValue(eln, dv);
    g_form._resetDerivedField(eln);
  }
}
function resetDerivedWaitingThenclearValue(df) {
  if (!df) return;
  var sn = g_form._removeTableName(df);
  if (g_form._isDerivedWaiting(df)) g_form._resetDerivedField(sn);
  g_form.clearValue(sn);
}
function clearValueThenResetDerivedWaiting(df) {
  if (!df) return;
  var sn = g_form._removeTableName(df);
  if (!g_form._isDerivedWaiting(df)) {
    g_form._addDerivedWaiting(sn, g_form.getTableName(), g_form.isDisabled(sn));
    g_form.clearValue(sn);
  }
  g_form._resetDerivedField(sn);
  g_form._setEmptyMandatoryFieldsVisible(sn);
}
