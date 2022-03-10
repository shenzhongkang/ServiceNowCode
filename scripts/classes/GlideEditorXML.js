/*! RESOURCE: /scripts/classes/GlideEditorXML.js */
var GlideEditorXML = Class.create(GlideEditor, {
  initialize: function (
    $super,
    id,
    options,
    jvarAccessKey,
    isReadOnly,
    apiJSON
  ) {
    var schemaInfo = {};
    var schemaInfoSorted = {};
    if (JSON.parse(apiJSON).jellySchema)
      schemaInfo = Object.extend(
        JSON.parse(apiJSON).jellySchema,
        CodeMirror.htmlSchema
      );
    Object.keys(schemaInfo)
      .sort()
      .forEach(function (key) {
        schemaInfoSorted[key] = schemaInfo[key];
      });
    options = Object.extend(
      {
        mode: 'xml',
        lineNumbers: true,
        enableMacros: false,
        hintOptions: {
          schemaInfo: schemaInfoSorted,
          closeCharacters: /[\s()\[\]{};>,]/,
        },
      },
      options || {}
    );
    $super(id, options, jvarAccessKey, isReadOnly, apiJSON);
    CustomEvent.observe('js_editor.validate', this._onValidate.bind(this));
  },
  formatCode: function (editor) {
    editor.focus();
    return;
  },
  commentSelection: function (editor) {
    var cursor = editor.getCursor();
    var lineNo = editor.getCursor().line;
    var lineStr = editor.getLine(lineNo);
    if (
      editor.somethingSelected() &&
      editor.getSelection().trim().startsWith('<!-- ')
    ) {
      editor.replaceSelection(
        editor.getSelection().replace('<!-- ', '').replace(' -->', '')
      );
      editor.focus();
      return;
    } else if (lineStr.trim().startsWith('<!-- ')) {
      editor.replaceRange(
        lineStr.replace('<!-- ', '').replace(' -->', ''),
        CodeMirror.Pos(lineNo, 0),
        CodeMirror.Pos(lineNo, lineStr.length)
      );
      editor.setCursor({ line: cursor.line, ch: cursor.ch - 5 });
      editor.focus();
      return;
    }
    if (editor.somethingSelected()) {
      editor.replaceSelection('<!-- ' + editor.getSelection() + ' -->');
    } else {
      editor.replaceRange(
        '<!-- ' + lineStr + ' -->',
        CodeMirror.Pos(lineNo, 0),
        CodeMirror.Pos(lineNo, lineStr.length)
      );
      editor.setCursor({ line: cursor.line, ch: cursor.ch + 2 });
    }
    editor.focus();
  },
  _onValidate: function (id, autoValidation) {
    if (id !== this.id) return 0;
    return 0;
  },
  changeJsEditorPreference: function (value) {
    var opposite;
    if (value == 'true') opposite = 'false';
    else if (value == 'false') opposite = 'true';
    else return;
    setPreference('glide.ui.javascript_editor', value);
    if (value == 'false') {
      this._hideEditor();
    } else {
      this._showEditor();
    }
    var toggleElementShow = gel('js_editor_' + value + '.' + this.id);
    var toggleElementHide = gel('js_editor_' + opposite + '.' + this.id);
    showObjectInline(toggleElementShow);
    hideObject(toggleElementHide);
  },
  toString: function () {
    return 'GlideEditorXML';
  },
});
