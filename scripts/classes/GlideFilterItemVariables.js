/*! RESOURCE: /scripts/classes/GlideFilterItemVariables.js */
var GlideFilterItemVariables = Class.create(GlideFilterVariables, {
  getFilterText: function (oper) {
    if (!this.variableFilter) return '';
    var varSyntax = 'variables.';
    if (
      $j(this.tr)
        .closest('.filter_controls-with-overflow')
        .attr('has-item-variable-syntax') === 'true'
    )
      varSyntax = 'variablesHASITEMVARIABLE:';
    return (
      varSyntax + this.getValues() + oper + this.variableFilter.getValues()
    );
  },
  z: null,
});
