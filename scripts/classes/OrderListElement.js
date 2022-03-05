/*! RESOURCE: /scripts/classes/OrderListElement.js */
var OrderListElement = Class.create({
  initialize: function (name, newRecord) {
    this.name = name;
    this.lastValue = '';
    this.initialSetup = true;
    var nonedit = gel(this.name + '_nonedit');
  },
  onLoad: function () {
    var values = gel(this.name).value;
    this.setValue(values);
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
  _fireSetValueEvent: function () {
    if (typeof g_form != 'undefined') {
      var form = g_form.getFormElement();
      if (typeof form != 'undefined') $(form).fire('glideform:setvalue');
    }
  },
  _setListValues: function () {
    var scols = gel('ni.' + this.name + '.select_1');
    var displayValues = [];
    var text = '';
    var count = 0;
    for (var i = 0; i < scols.length; i++) {
      var opt = scols.options[i];
      if (opt.value && opt.value != '--None--') {
        if (count > 0) {
          text += ', ';
        }
        displayValues.push({ label: opt.text, value: opt.value });
        text += opt.text;
        count++;
      }
    }
    gel(this.name).value = JSON.stringify(displayValues);
    var nonedit = gel(this.name + '_nonedit');
    if (nonedit) {
      nonedit.innerText = text;
    }
    if (this.lastValue != displayValues) {
      this.lastValue = displayValues;
      if (!this.initialSetup) onChange(this.name);
    }
    if (this.initialSetup) this._fireSetValueEvent();
    this.initialSetup = false;
    nonedit.style.visibility = 'visible';
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
  setValue: function (values) {
    if (!values) return;
    values = typeof values === 'string' ? JSON.parse(values) : values;
    var scols = gel('ni.' + this.name + '.select_1');
    scols.options.length = 0;
    values.forEach(function (value) {
      scols.options[scols.options.length] = new Option(
        value.label,
        value.value
      );
    });
    this._setListValues();
    var unlockElement = gel(this.name + '_unlock');
    lock(
      unlockElement,
      this.name,
      this.name + '_edit',
      this.name + '_nonedit',
      'ni.' + this.name + '.select_1',
      this.name + '_nonedit'
    );
    onChange(this.name);
  },
  type: function () {
    return 'OrderListElement';
  },
});
