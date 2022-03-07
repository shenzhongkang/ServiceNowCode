/*! RESOURCE: /scripts/classes/ParametersERD.js */
var ParametersERD = Class.create({
  initialize: function (atts_split) {
    this.values = {
      table_history: '',
      table: '',
      show_internal: 'true',
      show_referenced: 'true',
      show_referenced_by: 'true',
      show_extended: 'true',
      show_extended_by: 'true',
      table_expansion: '',
    };
    if (!atts_split) return;
    for (var j = 0; j < ParametersERD.paramList.length; j++) {
      var currentParam = ParametersERD.paramList[j];
      for (var i = 0; i < atts_split.length; i++) {
        var attribute = atts_split[i];
        if (
          attribute.startsWith(currentParam + '=') &&
          attribute != currentParam + '='
        )
          this.values[currentParam] = attribute.substring(
            attribute.indexOf('=') + 1
          );
      }
    }
  },
  clone: function () {
    var params = new ParametersERD();
    for (var key in this.values) params.values[key] = this.values[key];
    return params;
  },
  createURL: function () {
    var paramsString = '';
    for (var key in this.values)
      paramsString += key + '=' + this.values[key] + ',';
    return (
      'generic_hierarchy_erd.do?' +
      'sysparm_attributes=' +
      paramsString +
      'spacing_x=60,spacing_y=90,nocontext'
    );
  },
  pushTable: function (table) {
    if (this.values['table_history'].length > 0)
      this.values['table_history'] += '|' + this.values['table'];
    else this.values['table_history'] = this.values['table'];
    this.values['table'] = table;
    return this;
  },
  removeExpand: function (table) {
    var parts = this.values['table_expansion'].split('|');
    this.values['table_expansion'] = '';
    for (var i = 0; i < parts.length; i++)
      if (parts[i].length > 0 && parts[i] != table)
        this.values['table_expansion'] += '|' + parts[i] + '|';
    return this;
  },
  addExpand: function (table) {
    if (this.values['table_expansion'].indexOf('|' + table + '|') == -1)
      this.values['table_expansion'] += '|' + table + '|';
    return this;
  },
  clearTableExpansion: function () {
    this.values['table_expansion'] = '';
    return this;
  },
});
ParametersERD.paramList = [
  'table_expansion',
  'table_history',
  'show_internal',
  'table',
  'show_referenced',
  'show_referenced_by',
  'show_extended',
  'show_extended_by',
];
