/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorJS.js */
var GlideEditorJS = Class.create(GlideEditor, {
  isBreakpointsEnabled: false,
  initialize: function (
    $super,
    id,
    options,
    jvarAccessKey,
    isReadOnly,
    apiJSON,
    linter,
    codeComplete,
    debugpoints,
    eslintConfig,
    showContextMenu,
    contextMenuData
  ) {
    try {
      eslintConfig = JSON.parse(eslintConfig);
    } catch (e) {
      eslintConfig = {};
    }
    options = Object.extend(
      {
        mode: 'javascript',
        lineNumbers: true,
        enableMacros: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        autoCloseBrackets: true,
        eslintConfig: eslintConfig,
      },
      options || {}
    );
    jvarAccessKey = jvarAccessKey
      .replace('CTRL', 'Ctrl')
      .replace('SHIFT', 'Shift')
      .replace('OPT', 'Alt')
      .replace('ALT', 'Alt')
      .replace(' + ', '-');
    this.isBreakpointsEnabled = debugpoints.breakpoints;
    $super(
      id,
      options,
      jvarAccessKey,
      isReadOnly,
      apiJSON,
      linter,
      codeComplete
    );
    if (this.isBreakpointsEnabled)
      GlideEditorJSCommon.init(id, this.editor, debugpoints);
    if (showContextMenu === 'true' && typeof discover !== 'undefined') {
      var self = this;
      var contextMenuInfo = contextMenuData ? JSON.parse(contextMenuData) : '';
      var apiDocResourceIds = contextMenuInfo.apiDocResourceIds;
      discover.storeCache(
        contextMenuInfo.flushTime,
        this.editor,
        function (editorObj, result) {
          if (!editorObj || !result) return;
          if (result.type === 'error') console.error(result.error);
          else discoverContextMenuTokens(editorObj);
        }
      );
      var discoverContextMenuTokens = function (ed) {
        var updateEditor = function (editorObj, result) {
          if (!editorObj || !result) return;
          var tokens = result.tokens;
          editorObj.getAllMarks().forEach(function (marker) {
            if (
              typeof marker.className === 'string' &&
              marker.className.include('discoverable-text')
            )
              marker.clear();
          });
          for (var i = 0; i < tokens.length; i++)
            for (var j = 0; j < tokens[i].length; j++) {
              var discoverableToken = tokens[i][j];
              editorObj.markText(
                {
                  line: discoverableToken.token.line,
                  ch: discoverableToken.token.start,
                },
                {
                  line: discoverableToken.token.line,
                  ch: discoverableToken.token.end,
                },
                {
                  className:
                    'discoverable-text ' +
                    (discoverableToken.type + '-' + discoverableToken.key),
                }
              );
            }
        };
        var lines = [];
        var lineCount = ed.lineCount();
        for (var i = 0; i < lineCount; i++) {
          var lineTokens = ed.getLineTokens(i);
          lines[lines.length] = lineTokens.map(function (item) {
            return {
              line: i,
              start: item.start,
              end: item.end,
              string: item.string,
              type: item.type,
            };
          });
        }
        if (lines.length > 0)
          discover.discoverTokens(
            lines,
            apiDocResourceIds,
            { currentScope: g_scratchpad.scope },
            ed,
            updateEditor
          );
      };
      var showEditorContext = function (event, literal) {
        event.preventDefault();
        return GlideEditorContextMenu.showEditorContext(event, literal);
      };
      var getDiscoveredLiteral = function (elem) {
        var elemClassList = elem.classList;
        if (elemClassList.contains('discoverable-text')) {
          var type, key;
          var name = elem.innerText.replace(/'|"/g, '');
          var listLength = elemClassList.length;
          for (var i = 0; i < listLength; i++) {
            var className = elemClassList.item(i);
            if (className.startsWith('scriptInclude')) {
              type = 'sys_script_include';
              key = className.substring(className.indexOf('-') + 1);
            }
            if (className.startsWith('dbObject')) {
              type = 'sys_db_object';
              key = className.substring(className.indexOf('-') + 1);
            }
            if (className.startsWith('glideApi')) {
              type = 'api';
              key = className.substring(className.indexOf('-') + 1);
            }
          }
          if (!!key && !!type && !!name)
            return {
              type: type,
              key: key,
              name: name,
            };
        }
        return;
      };
      var debounce = function (func, delay) {
        var debounceTimer;
        return function () {
          var context = this;
          var args = arguments;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(function () {
            func.apply(context, args);
          }, delay);
        };
      };
      this.editor.on('changes', debounce(discoverContextMenuTokens, 350));
      this.editor.on('mousedown', function (cm, event) {
        var osKeyFlag = event.metaKey;
        if ('Ctrl'.indexOf(jvarAccessKey) === 0) osKeyFlag = event.ctrlKey;
        if (osKeyFlag && event.which == '1') {
          var literal = getDiscoveredLiteral(event.target);
          if (literal) GlideEditorContextMenu.openDefinitionTab(literal);
        }
      });
      this.editor.getWrapperElement().oncontextmenu = function (event) {
        if (self.editor.getSelection()) return true;
        var literal = getDiscoveredLiteral(event.target);
        if (literal) return showEditorContext(event, literal);
        return false;
      };
    }
  },
  formatCode: function (editor) {
    editor.format_code(editor.somethingSelected(), {
      indent_size: editor.getOption('indentUnit'),
    });
    const format_code_option = 'format_code';
    let format_code_value = editor.getOption(format_code_option);
    editor.setOption(
      'format_code',
      format_code_value ? 1 : format_code_value++
    );
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
      if (this.isBreakpointsEnabled)
        GlideEditorJSCommon.updateGutterMarkers(this.editor);
    }
    var toggleElementShow = gel('js_editor_' + value + '.' + this.id);
    var toggleElementHide = gel('js_editor_' + opposite + '.' + this.id);
    showObjectInline(toggleElementShow);
    hideObject(toggleElementHide);
  },
  _setErrorText: function (msg) {
    var d = $(this.id + '.lint');
    var tr = $(this.id + '.lint.tr');
    d.innerHTML = msg;
    if (msg != '') {
      tr.style.display = '';
    } else {
      tr.style.display = 'none';
    }
  },
  toString: function () {
    return 'GlideEditorJS';
  },
  toggleLinter: function () {
    if (typeof Worker === 'undefined' || typeof linter === 'undefined') return;
    var self = this;
    if (self.editor.getOption('lint')) turnOffLinting();
    else turnOnLinting();
    function turnOnLinting() {
      var eslintConfig = self.editor.getOption('eslintConfig');
      self.editor.setOption('gutters', [
        'CodeMirror-lint-markers',
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
      ]);
      self.editor.setOption('lint', {
        es3: true,
        rhino: true,
        async: true,
        getAnnotations: lint,
        eslintConfig: eslintConfig,
        onUpdateLinting: handleResults,
      });
    }
    function turnOffLinting() {
      self.editor.setOption('lint', false);
      self.editor.setOption('gutters', [
        'CodeMirror-linenumbers',
        'CodeMirror-foldgutter',
      ]);
    }
    function lint() {
      return linter.validate.apply(this, arguments);
    }
    function handleResults(results) {}
  },
});
