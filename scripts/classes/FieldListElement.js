/*! RESOURCE: /scripts/classes/FieldListElement.js */
var FieldListElement = Class.create({
  initialize: function (
    name,
    dependent,
    dependentTable,
    defaultDisplayName,
    newRecord,
    excludeDotWalk
  ) {
    this.name = name;
    this.dependent = dependent;
    this.table = dependentTable == 'null' ? null : dependentTable;
    this.excludeDotWalk = excludeDotWalk;
    this.defaultDisplayName = defaultDisplayName == 'true';
    if (this.defaultDisplayName) this.tableChanged = newRecord == 'true';
    else this.tableChanged = false;
    this.displayName = '';
    this.lastValue = '';
    this.initialSetup = true;
    this.fetching = false;
    this.valuesToSet = null;
  },
  onLoad: function () {
    if (!this.table) {
      var table = resolveDependentValue(this.name, this.dependent, this.table);
      this.table = table;
    }
    var processGlideVarInput = document.getElementById(
      'ni.' + this.name + '.list_item_id'
    );
    processGlideVarInput.onchange = this.processGlideVars.bind(this);
    this._listCols();
  },
  depChange: function () {
    gel(this.name).value = '';
    this._setTableName();
  },
  moveOptionUpdate: function (
    sourceSelect,
    targetSelect,
    keepSourceLabel,
    unmovableSourceValues,
    keepTargetLabel,
    direction,
    property
  ) {
    moveOption(
      sourceSelect,
      targetSelect,
      keepSourceLabel,
      unmovableSourceValues,
      keepTargetLabel,
      direction,
      property
    );
    this._setListValues();
  },
  moveUpUpdate: function (select) {
    moveUp(gel(select));
    this._setListValues();
  },
  moveDownUpdate: function (select) {
    moveDown(gel(select));
    this._setListValues();
  },
  _listCols: function () {
    this.fetching = true;
    var colist = gel(this.name);
    var url =
      'xmlhttp.do?sysparm_processor=ListColumns&sysparm_exclude_dot_walk=' +
      this.excludeDotWalk +
      '&sysparm_expanded=0&sysparm_name=' +
      this.table +
      '&sysparm_include_display_name=true&sysparm_qualified_field_name=' +
      this.name;
    if (colist.value.length > 0) url += '&sysparm_col_list=' + colist.value;
    jslog('FieldListElement: _listCols calling AJAX ' + url);
    serverRequest(url, this._colsReturned.bind(this), null);
  },
  _colsReturned: function (request) {
    jslog('FieldListElement: _colsReturned AJAX response received');
    var tcols = request.responseXML;
    var scols = gel('ni.' + this.name + '.select_1');
    scols.options.length = 0;
    var acols = gel('ni.' + this.name + '.select_0');
    acols.options.length = 0;
    var colist = gel(this.name);
    var mfields = new Array();
    var useSpecFields = false;
    var root = tcols.getElementsByTagName('xml')[0];
    this.displayName = root.getAttribute('displayName');
    if (this.tableChanged) {
      if (this.defaultDisplayName) colist.value = this.displayName;
      else colist.value = '';
    }
    if (colist.value.length > 0) {
      mfields = colist.value.split(',');
      if (mfields.length > 0) useSpecFields = true;
    }
    var items = tcols.getElementsByTagName('item');
    for (var i = 0; i != items.length; i++) {
      var item = items[i];
      var value = item.getAttribute('value');
      var label = item.getAttribute('label');
      var ref = item.getAttribute('reference');
      if (ref) {
        if (ref == '') ref = null;
      }
      if (valueExistsInArray(value, mfields)) {
        scols.options[scols.options.length] = this._enhanceOption(
          item,
          value,
          label,
          root,
          'selected'
        );
        if (ref)
          acols.options[acols.options.length] = this._enhanceOption(
            item,
            value,
            label,
            root,
            'available'
          );
      } else {
        acols.options[acols.options.length] = this._enhanceOption(
          item,
          value,
          label,
          root,
          'available'
        );
      }
    }
    if (useSpecFields) {
      var newOptions = new Array();
      for (var i = 0; i != mfields.length; i++) {
        var s = mfields[i];
        for (var z = 0; z != scols.options.length; z++) {
          if (scols.options[z].value == s) {
            newOptions[newOptions.length] = scols.options[z];
            break;
          }
        }
      }
      scols.options.length = 0;
      for (var i = 0; i != newOptions.length; i++) {
        scols.options.add(newOptions[i]);
      }
    }
    this._setListValues();
    this.fetching = false;
    if (this.valuesToSet === null) return;
    this.setValue(this.valuesToSet.value, this.valuesToSet.displayValue);
    this.valuesToSet = null;
  },
  _fireSetValueEvent: function () {
    if (typeof g_form != 'undefined') {
      var form = g_form.getFormElement();
      if (typeof form != 'undefined') $(form).fire('glideform:setvalue');
    }
  },
  _enhanceOption: function (item, value, label, root, status) {
    var ref = null;
    var xlabel = label;
    if (status != 'selected') {
      ref = item.getAttribute('reference');
      if (ref) {
        if (ref != '') {
          xlabel += ' (+)';
        } else ref = null;
      }
    }
    var o = new Option(xlabel, value);
    o.cv = value;
    o.cl = label;
    if (ref) {
      o.tl = item.getAttribute('reflabel');
      o.style.color = 'green';
      o.reference = ref;
      o.doNotDelete = 'true';
      if (root) {
        o.bt = root.getAttribute('name');
        o.btl = root.getAttribute('label');
      }
    }
    o.type = item.getAttribute('type');
    var elementAttributes = item.getAttribute('attributes');
    if (elementAttributes) {
      o.elementAttributes = this._setNamedAttributes(o, elementAttributes);
    }
    return o;
  },
  _setNamedAttributes: function (o, attrs) {
    o.namedAttributes = o.namedAttributes || {};
    if (!attrs) return;
    var pairs = attrs.split(',');
    for (var i = 0; i < pairs.length; i++) {
      var parts = pairs[i].split('=');
      if (parts.length == 2) o.namedAttributes[parts[0]] = parts[1];
    }
  },
  _setTableName: function () {
    var table = resolveDependentValue(this.name, this.dependent, this.table);
    if (table != this.table) {
      this.tableChanged = true;
      this.table = table;
      this._listCols(table);
    }
  },
  _setListValues: function () {
    var scols = gel('ni.' + this.name + '.select_1');
    var values = '';
    var text = '';
    var count = 0;
    for (var i = 0; i < scols.length; i++) {
      var opt = scols.options[i];
      if (opt.value && opt.value != '--None--') {
        if (count > 0) {
          values += ',';
          text += ', ';
        }
        values += opt.value;
        text += opt.text;
        count++;
      }
    }
    gel(this.name).value = values;
    var nonedit = gel(this.name + '_nonedit');
    if (nonedit) {
      nonedit.innerHTML = text;
    }
    this.tableChanged = false;
    if (this.lastValue != values) {
      this.lastValue = values;
      if (!this.initialSetup) onChange(this.name);
    }
    if (this.initialSetup) this._fireSetValueEvent();
    this.initialSetup = false;
  },
  setReadOnly: function (disabled) {
    if (disabled) {
      var unlockElement = gel(this.name + '_unlock');
      lock(
        unlockElement,
        this.name,
        this.name + '_edit',
        this.name + '_nonedit',
        'ni.' + this.name + '.select_1',
        this.name + '_nonedit'
      );
      hideObject(unlockElement);
    } else if (gel(this.name + '_edit').style.display == 'none') {
      var unlockElement = gel(this.name + '_unlock');
      if (isDoctype()) showObjectInlineBlock(unlockElement);
      else showObjectInline(unlockElement);
    }
    gel(this.name).disabled = disabled;
    return true;
  },
  isDisabled: function () {
    var unlockElement = $(this.name + '_unlock');
    if (unlockElement && unlockElement.visible()) return false;
    return true;
  },
  setValue: function (value, displayValue) {
    if (this.fetching) {
      this.valuesToSet = {
        value: value,
        displayValue: displayValue,
      };
      return;
    }
    gel(this.name).value = value;
    var acols = gel('ni.' + this.name + '.select_0');
    var scols = gel('ni.' + this.name + '.select_1');
    if (typeof value == 'string') {
      value = value.split(',');
    }
    if (typeof displayValue == 'string') {
      displayValue = displayValue.split(',');
    }
    if (value && displayValue) {
      if (value.length != displayValue.length) {
        jslog(
          'FieldListElement ' +
            this.name +
            '.setValue() received value and displayValue parameters of different lengths'
        );
        return;
      }
    }
    var selectedIds = new Array();
    var index = 0;
    for (var i = 0; i < scols.options.length; i++) {
      selectedIds[index] = i;
      index++;
    }
    if (index > 0) {
      moveSelectedOptions(
        selectedIds,
        scols,
        acols,
        '--None--',
        ['home'],
        '--None--'
      );
    }
    var text = [];
    var validValue = new Array();
    for (var i = 0; i < value.length; i++) {
      var v = value[i];
      var aIndex = this._getOptionIndex(acols, v);
      if (aIndex > -1) {
        selectedIds = new Array();
        selectedIds[0] = aIndex;
        text.push(acols.options[aIndex].text);
        validValue[i] = v;
        moveSelectedOptions(
          selectedIds,
          acols,
          scols,
          '--None--',
          [],
          '--None--'
        );
      } else {
        if (displayValue && displayValue[i]) {
          addChoiceFromValueAndDisplay(scols, v, displayValue[i]);
          text.push(displayValue[i]);
          validValue[i] = v;
        }
      }
    }
    if (validValue.length > 0) this.lastValue = validValue.join(',');
    var nonedit = gel(this.name + '_nonedit');
    if (nonedit) {
      nonedit.innerHTML = text.join(', ');
    }
    onChange(this.name);
  },
  processGlideVars: function () {
    if (!this.name) return;
    var prefix = 'ni.' + this.name + '.';
    var item = document.getElementById(prefix + 'list_item_id');
    var itemId = item && item.value;
    if (itemId) {
      var select = document.getElementById(prefix + 'select_0');
      var option = getSingleSelectedOption(select);
      var table = getTablenameFromOption(option);
      var glideAjax = new GlideAjax('GlideVarItemsProcessor');
      glideAjax.addParam('sysparm_type', 'get_item_variables');
      glideAjax.addParam('sysparm_item_id', itemId);
      glideAjax.addParam('sysparm_name', table);
      glideAjax.getXML(setVariableOptions, null, [
        prefix,
        itemId,
        option.value,
      ]);
    }
  },
  _getOptionIndex: function (select, value) {
    for (var i = 0; i < select.length; i++)
      if (select.options[i].value == value) return i;
    return -1;
  },
  type: function () {
    return 'FieldListElement';
  },
});
