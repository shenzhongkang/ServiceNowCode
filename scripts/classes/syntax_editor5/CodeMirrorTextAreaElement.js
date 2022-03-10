/*! RESOURCE: /scripts/classes/syntax_editor5/CodeMirrorTextAreaElement.js */
var CodeMirrorTextAreaElement = Class.create({
  initialize: function (name) {
    this.name = name;
    this.elem = document.getElementById(this.name);
    if (typeof window.textareaResize === 'function') textareaResize(this.name);
    this.setAria();
  },
  setReadOnly: function (disabled) {
    gel(this.name).disabled = disabled;
    var cmName = this.name;
    var cmEditor = $(cmName).parentNode;
    var cmStyle = disabled ? 'snc_readonly' : 'snc';
    var DISABLED = 'disabled';
    var gEditor = GlideEditor.get(cmName);
    var formatCode = cmName + '.formatCode';
    var toggleLinter = cmName + '.toggleLinter';
    var replace = cmName + '.replace';
    var replaceAll = cmName + '.replaceAll';
    var save = cmName + '.save';
    var gTreeButton = $(cmName + '.scriptTreeToggleImage');
    var gTree = $(cmName + '.fields_script_tree');
    gEditor.editor.setOption('readOnly', disabled);
    gEditor.editor.setOption('theme', cmStyle);
    if (disabled) {
      if (gEditor.options.mode == 'javascript') {
        $(formatCode).addClassName(DISABLED);
        $(toggleLinter).addClassName(DISABLED);
        this.codeCompleteFunction = gEditor.options.extraKeys['Ctrl-Space'];
        gEditor.options.extraKeys['Ctrl-Space'] = '';
        if (gTreeButton) {
          gTreeButton.hide();
          cmEditor.addClassName('col-lg-12');
        }
        if (gTree) gTree.hide();
      }
      $(replace).addClassName(DISABLED);
      $(replaceAll).addClassName(DISABLED);
      $(save).addClassName(DISABLED);
    } else {
      if (gEditor.options.mode == 'javascript') {
        $(formatCode).removeClassName(DISABLED);
        $(toggleLinter).removeClassName(DISABLED);
        gEditor.options.extraKeys['Ctrl-Space'] = this.codeCompleteFunction;
        if (gTreeButton) {
          gTreeButton.show();
          cmEditor.removeClassName('col-lg-12');
        }
        if (gTree) gTree.show();
      }
      $(replace).removeClassName(DISABLED);
      $(replaceAll).removeClassName(DISABLED);
      $(save).removeClassName(DISABLED);
    }
  },
  isDisabled: function () {
    return GlideEditor.get(this.name).editor.getOption('readOnly');
  },
  isReadOnly: function () {
    return GlideEditor.get(this.name).editor.getOption('readOnly');
  },
  getValue: function () {
    return GlideEditor.get(this.name).editor.getValue();
  },
  setValue: function (newValue) {
    GlideEditor.get(this.name).editor.setValue(newValue);
    onChange(this.name);
    if (typeof window.jQuery === 'function') {
      $j(this.elem).trigger('autosize.resize');
    }
  },
  isVisible: function () {
    return true;
  },
  setAria: function () {
    var scriptDiv = this.elem.nextSibling.querySelector('.CodeMirror-code');
    scriptDiv.setAttribute('aria-labelledby', 'label.' + this.name);
  },
  type: 'CodeMirrorTextAreaElement',
  z: null,
});
var CodeMirrorNoScriptTextAreaElement = Class.create({
  initialize: function (name) {
    this.id = name;
    this.elem = document.getElementById(this.id);
    if (typeof window.textareaResize === 'function') textareaResize(this.id);
  },
  setValue: function (newValue) {
    if (newValue == ' XXmultiChangeXX') newValue = '';
    if (typeof window.jQuery === 'function') {
      $j(this.elem).val(newValue).trigger('autosize.resize');
    } else {
      $(this.elem).setValue(newValue);
    }
    onChange(this.id);
  },
  type: 'CodeMirrorNoScriptTextAreaElement',
  z: null,
});
