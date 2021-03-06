/*! RESOURCE: /scripts/depends.js */
function getNameFromElement(elementName) {
  var names = elementName.split('.');
  names = names.slice(1);
  return names.join('.');
}
function loadFilterColumns(fname, dependent) {
  var value = resolveDependentValue(fname, dependent);
  var names = fname.split('.');
  serverRequest(
    'xmlhttp.do?sysparm_include_sysid=true&sysparm_processor=SysMeta&sysparm_table_name=false&sysparm_type=column&sysparm_nomax=true&sysparm_value=' +
      names[0],
    getFilterColumnsResponse,
    [fname, dependent]
  );
  CustomEvent.fire('conditions:dependent_change');
}
function getFilterColumnsResponse(evt, args) {
  var fname = args[0];
  var dep = args[1];
  var hinput = document.getElementById(fname);
  filterExpanded = true;
  var table = resolveDependentValue(fname, dep);
  var xfilter = unescape(hinput.value);
  var form = findParentByTag(hinput, 'FORM');
  if (table) {
    firstTable = table;
    createCondFilter(table + '.' + fname, xfilter, fname);
  }
}
function gotTemplateResponseWithRef(fn, name) {
  if (typeof name !== 'string' || name.length === 0) return fn;
  return function () {
    var args = Array.prototype.slice.call(arguments);
    args.push(name);
    fn.apply(null, args);
  };
}
function onSelChange(elementName, fromSetTemplateValue) {
  var elementId = elementName;
  var includesSysSelect = elementName.indexOf('sys_select.') === 0;
  if (includesSysSelect) elementId = elementName.replace('sys_select.', '');
  var df = new DerivedFields(elementId, gel(elementName).value);
  df.clearRelated();
  df.updateRelated();
  var vName = 'ni.dependent.' + getNameFromElement(elementId);
  var eDeps = document.getElementsByName(vName);
  jslog('*************---->' + eDeps.length);
  for (var i = 0; i < eDeps.length; i++) {
    var eDep = eDeps[i];
    if (eDep == null) continue;
    var f = eDep.attributes.getNamedItem('onDependentChange');
    if (f) {
      eval(f.nodeValue);
      continue;
    }
    if (df.isDerivedWaitingClearValue() && eDep.hasAttribute('data-ref-qual'))
      continue;
    var name = eDep.value;
    var eChanged = gel(elementName);
    var value;
    if (eChanged.options) {
      var selected = eChanged.selectedIndex;
      value = eChanged.options[selected].value;
    } else value = eChanged.value;
    var retFunc = selResponseHelper(
      includesSysSelect || isReferenceType(name),
      fromSetTemplateValue
    );
    var ajax = new GlideAjax('set_from_attributes');
    var argCnt = 0;
    for (var ac = 0; ac < eDep.attributes.length; ac++) {
      var itemName = eDep.attributes[ac].name;
      if (itemName.substring(0, 7).toLowerCase() == 'sysparm') {
        var pvalue = eDep.attributes[ac].value;
        ajax.addParam(itemName, pvalue);
        argCnt++;
      } else if (itemName == 'function') {
        var fdef = eDep.attributes[ac].value;
        var index = fdef.indexOf('(');
        if (index == -1) {
          retFunc = eval(eDep.attributes[ac].value);
          retFunc = gotTemplateResponseWithRef(retFunc, eDep.dataset.ref);
        } else retFunc = fdef;
      }
    }
    if (argCnt == 0) continue;
    ajax.addParam('sysparm_value', value);
    ajax.addParam('sysparm_name', name);
    ajax.addParam('sysparm_chars', '*');
    ajax.addParam('sysparm_nomax', 'true');
    if (
      'true' == eDep.getAttribute('data-ref-qual') &&
      typeof g_form !== 'undefined'
    ) {
      if (
        g_form.isNewRecord() ||
        _hasEmptyAncestor(g_form._removeTableName(name))
      )
        ajax.addEncodedString(g_form.serialize());
      else {
        var encoded = g_form.serializeChangedAll();
        if (!gel(elementId).changed)
          encoded += g_form._serializeElement(elementId);
        ajax.addEncodedString(encoded);
      }
    }
    var scopeElement = gel('sysparm_domain_scope');
    if (scopeElement && scopeElement.value) {
      ajax.addParam('sysparm_domain_scope', scopeElement.value);
    }
    var domainElement = gel('sysparm_domain');
    if (domainElement && domainElement.value) {
      ajax.addParam('sysparm_domain', domainElement.value);
    }
    if (fromSetTemplateValue && g_allow_field_dependency_for_templates) {
      ajax.setWantRequestObject(true);
      var responseObject = ajax.getXMLWait();
      if (responseObject.responseXML) retFunc(responseObject, eChanged);
    } else {
      ajax.getXML(retFunc, null, eChanged);
    }
  }
}
function _hasEmptyAncestor(v) {
  var name = v.substring(0, v.lastIndexOf('.'));
  return !!name && (g_form.getValue(name) == '' || _hasEmptyAncestor(name));
}
function isReferenceType(name) {
  return getDataType(name) == 'glide_element_reference_choice';
}
function getDataType(name) {
  var input = gel(name);
  return (input && input.getAttribute('data-type')) || '';
}
function getDefaultOption(name, e) {
  if (e.getAttribute('sysparm_processor') !== 'PickList') return null;
  var defaultOption = e.getAttribute('default_option');
  if (defaultOption) return defaultOption;
  if ('glide_element_reference_choice_without_none' !== getDataType(name))
    return getMessage('-- None --');
  return null;
}
function selResponse(request, containsSysSelect, fromSetTemplateValue) {
  if (!request || !request.responseXML) return;
  var e = request.responseXML.documentElement;
  var elementName = e.getAttribute('sysparm_name');
  if (containsSysSelect && gel('sys_display.original.' + elementName))
    elementName = 'sys_select.' + elementName;
  var selectedItem = e.getAttribute('select_option');
  var select = gel(elementName);
  var currentValue = select.value;
  var isSelect2 = select.className.indexOf('select2') > -1;
  try {
    select.options.length = 0;
  } catch (e) {}
  var defaultOption = getDefaultOption(elementName, e);
  if (defaultOption)
    appendSelectOption(select, '', document.createTextNode(defaultOption));
  var items = request.responseXML.getElementsByTagName('item');
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var t = item.getAttribute('value');
    var label = item.getAttribute('label');
    var hint = item.getAttribute('hint');
    if (defaultOption == null || label !== defaultOption) {
      if (isSelect2) {
        var newOption = new Option(label, t);
        $j(select).append(newOption);
      } else
        var opt = appendSelectOption(select, t, document.createTextNode(label));
      if (hint != '' && opt) opt.title = hint;
      if (selectedItem && label == selectedItem)
        if (isSelect2) $j(select).val(t);
        else opt.selected = true;
      else if (currentValue && t == currentValue) {
        if (isSelect2) $j(select).val(currentValue);
        else opt.selected = true;
        currentValue = '';
      }
    }
  }
  if (select['onchange'])
    select.onchange.call(select, null, fromSetTemplateValue);
  if (!select.value && typeof g_form != 'undefined')
    g_form._setEmptyMandatoryFieldsVisible(elementName);
}
function selResponseHelper(hasSysSelect, fromSetTemplateValue) {
  return function (request) {
    selResponse(request, hasSysSelect, fromSetTemplateValue);
  };
}
function hasDepends(elementName) {
  var vName = 'ni.dependent.' + getNameFromElement(elementName);
  var eDep = document.getElementsByName(vName)[0];
  return eDep;
}
function resolveDependentValue(id, depname, deptable) {
  var systable = id.split('.')[0];
  var table = null;
  var dep = document.getElementById(systable + '.' + depname);
  if (dep != null) {
    if (dep.tagName == 'SELECT') table = dep.options[dep.selectedIndex].value;
    else table = dep.value;
    table = table.split('.')[0];
  } else {
    table = deptable;
  }
  if (table == '*' || table == '' || table == 'null') table = null;
  return table;
}
function loadFields(
  fname,
  dependent,
  types,
  script_types,
  ref_types,
  script_ref_types,
  script_ref_types_dependent,
  field_choices_script,
  show_field_name_on_label,
  access_table
) {
  var depValue = resolveDependentValue(fname, dependent, dependent);
  loadFieldsWithValue(
    fname,
    depValue,
    types,
    script_types,
    ref_types,
    script_ref_types,
    script_ref_types_dependent,
    field_choices_script,
    show_field_name_on_label,
    access_table
  );
}
function loadFieldsWithValue(
  fname,
  table,
  types,
  script_types,
  ref_types,
  script_ref_types,
  script_ref_types_dependent,
  field_choices_script,
  show_field_name_on_label,
  access_table
) {
  var script_ref_types_dependent_value = '';
  if (script_ref_types_dependent) {
    var systable = fname.split('.')[0];
    var s_dep = gel(systable + '.' + script_ref_types_dependent);
    if (s_dep != null) {
      if (s_dep.tagName == 'SELECT')
        script_ref_types_dependent_value =
          s_dep.options[s_dep.selectedIndex].value;
      else script_ref_types_dependent_value = s_dep.value;
    }
  }
  if (table != null)
    getTableColumns(
      table,
      fname,
      types,
      script_types,
      ref_types,
      script_ref_types,
      script_ref_types_dependent_value,
      field_choices_script,
      show_field_name_on_label,
      access_table
    );
}
function getTableColumns(
  table,
  ref,
  types,
  script_types,
  ref_types,
  script_ref_types,
  script_ref_types_dependent_value,
  field_choices_script,
  show_field_name_on_label,
  access_table
) {
  if (!types) types = '';
  if (!script_types) script_types = '';
  if (!ref_types) ref_types = '';
  if (!script_ref_types) script_ref_types = '';
  if (!script_ref_types_dependent_value) script_ref_types_dependent_value = '';
  var serverRequestString =
    'xmlhttp.do?sysparm_include_sysid=true&sysparm_processor=SysMeta&sysparm_table_name=false&sysparm_type=column&sysparm_nomax=true' +
    '&sysparm_value=' +
    table +
    '&sysparm_types=' +
    types +
    '&sysparm_script_types=' +
    script_types +
    '&sysparm_script_ref_types_dependent_value=' +
    script_ref_types_dependent_value +
    '&sysparm_script_ref_types=' +
    script_ref_types +
    '&sysparm_ref_types=' +
    ref_types +
    '&sysparm_containing_table=' +
    $('sys_target').value;
  if (field_choices_script && field_choices_script != '')
    serverRequestString +=
      '&sysparm_field_choices_script=' + field_choices_script;
  if (show_field_name_on_label && show_field_name_on_label != '')
    serverRequestString +=
      '&sysparm_show_field_name_on_label=' + show_field_name_on_label;
  if (access_table)
    serverRequestString += '&sysparm_access_table=' + access_table;
  serverRequestString += '&sysparm_ref_field=' + encodeURIComponent(ref);
  serverRequest(serverRequestString, getTableColumnsResponse, ref);
}
function getTableColumnsResponse(request, ref) {
  var fname = ref;
  var tcols = request.responseXML;
  var scols = gel(fname);
  var currentvis = scols.style.visibility;
  scols.style.visibility = 'hidden';
  var cfield = gel('sys_original.' + fname);
  cValue = cfield.value;
  if (typeof scols.options === 'undefined') scols.options = [];
  else scols.options.length = 0;
  var includeNone = scols.attributes.getNamedItem('include_none');
  if (includeNone) {
    if (includeNone.nodeValue == 'true')
      scols.options[scols.options.length] = new Option(
        getMessage('-- None --'),
        ''
      );
  }
  var items = tcols.getElementsByTagName('item');
  var sindex = 0;
  for (var i = 0; i != items.length; i++) {
    var item = items[i];
    var value = item.getAttribute('value');
    var label = item.getAttribute('label');
    scols.options[scols.options.length] = new Option(label, value);
    if (cValue == value) sindex = scols.options.length - 1;
  }
  scols.selectedIndex = sindex;
  scols.style.visibility = currentvis;
  CustomEvent.fire('getTableColumnsResponse.received');
  fireSetValueEvent();
}
function fireSetValueEvent() {
  if (typeof g_form != 'undefined') {
    var form = g_form.getFormElement();
    if (typeof form != 'undefined') $(form).fire('glideform:setvalue');
  }
}
