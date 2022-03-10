/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditor.js */
var g_glideEditors = g_glideEditors || {};
var g_glideEditorArray = g_glideEditorArray || [];
var GlideEditor = Class.create({
  initialize: function (
    id,
    options,
    jvarAccessKey,
    isReadOnly,
    apiJSON,
    linter,
    codeComplete
  ) {
    var isJavaScript = options.mode == 'javascript';
    var webWorker = typeof Worker !== 'undefined';
    this.macros = {};
    this._initMacros();
    this.id = id;
    var el = $(id);
    this.originalValue = el.value;
    this.curCursor = null;
    var self = this;
    if (isJavaScript && webWorker && codeComplete) {
      var defs = [];
      if (apiJSON) defs.push(JSON.parse(apiJSON));
      var server = new CodeMirror.TernServer({
        defs: defs,
        showError: function (e, m) {},
        workerDeps: [
          '/scripts/snc-code-editor/tern-bundle.min.js?sysparm_substitute=false',
        ],
        workerScript: 'scripts/snc-code-editor/codemirror/addon/tern/worker.js',
        useWorker: true,
        queryOptions: { completions: { caseInsensitive: true, guess: false } },
      });
    }
    var ios =
      /AppleWebKit/.test(navigator.userAgent) &&
      /Mobile\/\w+/.test(navigator.userAgent);
    this.mac = ios || /Mac/.test(navigator.platform);
    this.win = /Win/.test(navigator.platform);
    var ie = /MSIE \d/.test(navigator.userAgent);
    CodeMirror.extraCommands = {
      showKeyMap: getMessage('Help'),
      fullScreen: getMessage('Toggle Full Screen'),
      find: getMessage('Start Searching'),
      findNext: getMessage('Find Next'),
      findPrev: getMessage('Find Previous'),
      replace: getMessage('Replace'),
      replaceAll: getMessage('Replace All'),
      commentSelection: getMessage('Toggle Comment'),
      scriptDebugger: getMessage('Open Script Debugger'),
      autoComplete: getMessage('Scripting Assistance'),
    };
    CodeMirror.extraCommandsJS = {
      formatCode: getMessage('Format Code'),
      showDocs: getMessage('Show Description'),
    };
    jvarAccessKey = jvarAccessKey
      .replace('CTRL', 'Ctrl')
      .replace('SHIFT', 'Shift')
      .replace('OPT', 'Alt')
      .replace('ALT', 'Alt')
      .replace(' + ', '-');
    CodeMirror.extraKeyMap = {
      showKeyMap: jvarAccessKey + '-H',
      fullScreen: 'Ctrl-M',
      find: jvarAccessKey + '-F',
      findNext: jvarAccessKey + '-G',
      findPrev: jvarAccessKey + '-Shift-G',
      replace: jvarAccessKey + '-E',
      replaceAll: jvarAccessKey + '-;',
      commentSelection: jvarAccessKey + '-/',
      autoComplete: 'Ctrl-Space',
    };
    var extraKeys = {};
    extraKeys[CodeMirror.extraKeyMap['showKeyMap']] = function (editor) {
      self.showKeyMap(editor);
    };
    extraKeys[CodeMirror.extraKeyMap['fullScreen']] = function (editor) {
      self.fullScreen(editor, id);
    };
    extraKeys[CodeMirror.extraKeyMap['commentSelection']] = function (editor) {
      self.commentSelection(editor);
    };
    extraKeys[CodeMirror.extraKeyMap['find']] = function (editor) {
      CodeMirror.commands['find'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['findNext']] = function (editor) {
      CodeMirror.commands['findNext'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['findPrev']] = function (editor) {
      CodeMirror.commands['findPrev'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['replace']] = function (editor) {
      CodeMirror.commands['replace'](editor);
    };
    extraKeys[CodeMirror.extraKeyMap['replaceAll']] = function (editor) {
      CodeMirror.commands['replaceAll'](editor);
    };
    extraKeys['Tab'] = function (editor) {
      self._getMacro(editor, self.macros);
    };
    if (isJavaScript) {
      CodeMirror.extraKeyMap['showDocs'] = jvarAccessKey + '-J';
      if (typeof Worker === 'undefined') {
        delete CodeMirror.extraCommandsJS['autoComplete'];
        delete CodeMirror.extraCommandsJS['showDocs'];
      }
      if (options.readOnly) {
        delete CodeMirror.extraCommands['commentSelection'];
        delete CodeMirror.extraCommands['replace'];
        delete CodeMirror.extraCommands['replaceAll'];
        delete CodeMirror.extraCommandsJS['formatCode'];
        delete CodeMirror.extraCommandsJS['autoComplete'];
      }
      if (!isReadOnly && webWorker && codeComplete) {
        extraKeys[CodeMirror.extraKeyMap['autoComplete']] = function (cm) {
          server.complete(cm, server);
        };
      }
      extraKeys[CodeMirror.extraKeyMap['showDocs']] = function (cm) {
        server.showDocs(cm);
        setTimeout(function () {
          if ($$('div.CodeMirror-Tern-tooltip')[0])
            $$('div.CodeMirror-Tern-tooltip')[0].show();
        }, 100);
      };
    }
    var cmStyle = isReadOnly ? 'snc_readonly' : 'snc';
    this.options = Object.extend(
      {
        inputStyle: 'contenteditable',
        indentUnit: 4,
        softTabs: true,
        theme: cmStyle,
        height: el.getHeight(),
        lineWrapping: true,
        onGutterClick: self.foldCode,
        matchBrackets: true,
        indentWithTabs: true,
        matchTags: {
          bothTags: true,
        },
        readOnly: !isReadOnly,
        styleActiveLine: true,
        extraKeys: extraKeys,
        viewportMargin: 10,
      },
      options || {}
    );
    var ed = (this.editor = CodeMirror.fromTextArea(el, this.options));
    if (this.options.mode === 'xml') {
      this.editor.doc.mode.electricInput = /<\//;
      if (!isReadOnly && webWorker) {
        this.editor.options.extraKeys[CodeMirror.extraKeyMap['autoComplete']] =
          'autocomplete';
      }
    }
    this.editor.on('mousedown', function (cm, event) {
      var osKeyFlag = event.metaKey;
      if ('Ctrl'.indexOf(jvarAccessKey) === 0) osKeyFlag = event.ctrlKey;
      if (osKeyFlag && event.altKey) event.altKey = false;
      else if (osKeyFlag === true) event.preventDefault();
    });
    if (!isReadOnly && isJavaScript && webWorker && codeComplete) {
      this.editor.on('cursorActivity', function (cm) {
        server.updateArgHints(cm, server);
      });
      this.editor.on('startCompletion', function (cm) {
        self.codeCompleteHandler(cm);
      });
      this.editor.on('scroll', function () {
        if ($$('div.CodeMirror-Tern-tooltip')[0])
          $$('div.CodeMirror-Tern-tooltip')[0].hide();
      });
      var cmVariables = $(id).next('.CodeMirror');
      var shiftKey = false;
      cmVariables.onkeydown = function (event) {
        shiftKey = event.shiftKey;
      };
      cmVariables.onkeyup = function (event) {
        var ternToolTip = $$('div.CodeMirror-Tern-tooltip')[0];
        var key = event.key;
        if (key == '.')
          if (event.shiftKey || shiftKey) return;
          else {
            if (
              self.editor &&
              self.editor.getTokenAt(self.editor.getCursor()).type == 'string'
            )
              return;
            var cm = this.CodeMirror.glideEditor.editor;
            server.complete(cm, server);
          }
        if (key == '(' && ternToolTip) ternToolTip.show();
        if (key == 'Escape' && ternToolTip) ternToolTip.hide();
      };
    }
    if (el.form && this.editor.options.mode == 'javascript')
      addOnSubmitEvent(
        el.form,
        function () {
          if (this.textAreaMode)
            this.editor.setValue(this.editor.getTextArea().value);
          this.editor.save();
        }.bind(this)
      );
    this.editor.on('change', function (i) {
      i.glideEditor._onTextChange(i.glideEditor);
      i.save();
    });
    this.editor.on('codemirror_hint_pick', function (i) {
      var data = i.data.data;
      var editor = i.editor;
      var cur = editor.getCursor();
      var token = data.type;
      if (token && token.indexOf('fn(') != -1) {
        if (
          editor.getTokenAt({ ch: cur.ch + 1, line: cur.line }).string != '('
        ) {
          editor.replaceRange(
            '()',
            {
              line: cur.line,
              ch: cur.ch,
            },
            {
              line: cur.line,
              ch: cur.ch,
            }
          );
          if (
            token &&
            token.indexOf('fn()') == -1 &&
            $$('div.CodeMirror-Tern-tooltip')[0]
          ) {
            editor.execCommand('goCharLeft');
            setTimeout(function () {
              if ($$('div.CodeMirror-Tern-tooltip')[0])
                $$('div.CodeMirror-Tern-tooltip')[0].show();
            }, 100);
          }
        } else if (token && token.indexOf('fn()') == -1) {
          editor.execCommand('goCharRight');
        }
      }
    });
    this.editor.getTextArea().style.display = 'block';
    this.editor.getTextArea().style.position = 'absolute';
    this.editor.getTextArea().style.top = '-1000000px';
    ed.setHeight = function (height) {};
    this.curLine = this.editor.addLineClass(0, 'cm_active_line');
    CustomEvent.observe('textarea.resize', this._onTextAreaResize.bind(this));
    CodeMirror.commands.processTab = function (cm) {
      if (cm.somethingSelected()) cm.indentSelection('add');
      else CodeMirror.commands.insertTab(cm);
    };
    CodeMirror.keyMap.basic['Tab'] = 'processTab';
    g_glideEditors[this.id] = this;
    g_glideEditorArray[g_glideEditorArray.length] = this;
    this.editor.glideEditor = this;
    this.textAreaMode = false;
    var form = $(this.id.split('.')[0] + '.form_scroll');
    form.onscroll = function () {
      var ternTip = $$('div.CodeMirror-Tern-tooltip');
      if (ternTip.length == 0) return;
      for (var i = 0; i < ternTip.length; i++) {
        ternTip[i].remove();
      }
      var hintBox = $$('ul.CodeMirror-hints')[0];
      if (hintBox) hintBox.hide();
      var autoCompleteBox = $$('ul.ui-autocomplete')[0];
      if (autoCompleteBox) autoCompleteBox.hide();
    };
    if (
      g_form.getTableName() == 'sys_script' &&
      g_scratchpad.execute_function
    ) {
      var script = '';
      if (g_form.getValue('when') == 'before')
        script = 'onBefore(current, previous);';
      if (g_form.getValue('when') == 'after')
        script = 'onAfter(current, previous);';
      if (g_form.getValue('when').indexOf('async') == 0)
        script = 'onAsync(current);';
      if (g_form.getValue('when') == 'before_display')
        script = 'onDisplay(current, {});';
      this.addDocs('businessRule.js', script, server);
    }
    if (linter) self.toggleLinter();
    if (g_form.isDisabled(id.split('.')[1])) {
      addAfterPageLoadedEvent(function () {
        g_form.setReadOnly(id.split('.')[1], true);
      });
    }
    CodeMirror.scriptInfo = { id: '', type: '', field: '' };
    var tabNextOrPrev = function (goPrevious) {
      var selectables = jQuery(':tabbable');
      var current = jQuery(':focus');
      var incrementor = goPrevious ? -1 : 1;
      var targetIndex = goPrevious ? selectables.length - 1 : 0;
      if (current.length === 1) {
        var currentIndex = selectables.index(current);
        var updateIndexCondition = goPrevious
          ? currentIndex > 0
          : currentIndex + 1 < selectables.length;
        if (updateIndexCondition) targetIndex = currentIndex + incrementor;
      }
      selectables.eq(targetIndex).focus();
    };
    var tabNext = function () {
      tabNextOrPrev(false);
    };
    var tabPrevious = function () {
      tabNextOrPrev(true);
    };
    this.editor.addKeyMap({ 'Shift-Esc': tabPrevious });
    this.editor.addKeyMap({ Esc: tabNext });
    var ref = this.editor.getTextArea().id;
    jQuery(this.editor.getInputField()).attr({
      'aria-describedby': [
        ref + '_editor-keyboard-trap-help-1',
        ref + '_editor-keyboard-trap-help-2',
      ].join(' '),
    });
  },
  fullScreen: function (editor, id, exit) {
    var TREE_OFF = 'Tree-Off';
    var TOOL_FULLSCREEN = 'CodeMirror-Toolbar-fullscreen';
    var NONE = 'none';
    var FULLSCREEN = 'fullScreen';
    if (!id) {
      id = editor.glideEditor.id;
    }
    var ie = /MSIE \d/.test(navigator.userAgent);
    if (ie) {
      alert(
        getMessage(
          'Full Screen mode is not available for IE versions 10 and under'
        )
      );
      return;
    }
    var inFullScreen = editor.getOption(FULLSCREEN);
    (fieldsScriptTree = gel(id + '.fields_script_tree')),
      (labelElem = gel('label.' + id)),
      (columnElem = gel('column.' + id)),
      (editorElem = gel(id + '.editor.toolbar'));
    if (!inFullScreen && !exit) {
      labelElem.appendChild(editorElem);
      labelElem.className += ' ' + TOOL_FULLSCREEN;
      $('js_editor_true.' + id).hide();
      editor.setOption(FULLSCREEN, !inFullScreen);
      if (fieldsScriptTree) {
        fieldsScriptTree.className = 'CodeMirror-Tree-fullscreen well';
        if (fieldsScriptTree.parentNode.style.display == NONE) {
          $$('div.CodeMirror-fullscreen')[0].addClassName(TREE_OFF);
        }
      } else {
        $$('div.CodeMirror-fullscreen')[0].addClassName(TREE_OFF);
      }
      if ($$('div.CodeMirror-Tern-tooltip')[0])
        $$('div.CodeMirror-Tern-tooltip').each(Element.hide);
      if ($$('ul.CodeMirror-hints')[0])
        $$('ul.CodeMirror-hints').each(Element.hide);
    } else {
      if (fieldsScriptTree) {
        fieldsScriptTree.className = 'well script_tree';
        if (fieldsScriptTree.parentNode.style.display == NONE) {
          $$('div.CodeMirror-fullscreen')[0].removeClassName(TREE_OFF);
        }
      } else {
        $$('div.CodeMirror-fullscreen')[0].removeClassName(TREE_OFF);
      }
      editor.setOption(FULLSCREEN, false);
      columnElem.appendChild(editorElem);
      labelElem.className = labelElem.className.replace(
        ' ' + TOOL_FULLSCREEN,
        ''
      );
      editor.setHeight($(id).getHeight() + 'px');
      $('js_editor_true.' + id).show();
      if ($$('div.CodeMirror-Tern-tooltip')[0])
        $$('div.CodeMirror-Tern-tooltip').each(Element.hide);
      if ($$('ul.CodeMirror-hints')[0])
        $$('ul.CodeMirror-hints').each(Element.hide);
    }
  },
  showKeyMap: function (editor) {
    var isJavaScript = editor.options.mode == 'javascript';
    var dialog = new GlideModal('cm_key_map');
    dialog.setTitle('Editor Key Map');
    dialog.setWidth(400);
    var bodyText =
      '<style>td {padding-right: 5px;}</style><table style="margin-left: 5px">';
    var shortCut;
    for (var key in CodeMirror.extraCommands) {
      shortCut = CodeMirror.extraKeyMap[key];
      if (!shortCut) continue;
      shortCut = shortCut.replace(/\-/g, '+');
      bodyText +=
        '<tr><td><li>' +
        CodeMirror.extraCommands[key] +
        '</li></td><td><b>' +
        shortCut +
        '</b></td></tr>';
    }
    if (isJavaScript) {
      for (var key in CodeMirror.extraCommandsJS) {
        shortCut = CodeMirror.extraKeyMap[key];
        if (!shortCut) continue;
        shortCut = shortCut.replace(/\-/g, '+');
        bodyText +=
          '<tr><td><li>' +
          CodeMirror.extraCommandsJS[key] +
          '</li></td><td><b>' +
          shortCut +
          '</b></td></tr>';
      }
    }
    if (editor.options.enableMacros) {
      bodyText +=
        '</table><hr><b>Macros:</b> Type help and hit TAB to view the list of macros';
    }
    dialog.setBody(bodyText);
  },
  commentSelection: function (editor) {
    var fromCursor = editor.getCursor('from');
    var toCursor = editor.getCursor('to');
    if (editor.somethingSelected()) {
      if (
        this._shouldToggleComment(editor, fromCursor.line, toCursor.line, true)
      ) {
        editor.lineComment(fromCursor, toCursor);
        var fromCh = fromCursor.ch == 0 ? 0 : fromCursor.ch + 3;
        var toCh = toCursor.ch == 0 ? 0 : toCursor.ch + 3;
        editor.setSelection(
          { line: fromCursor.line, ch: fromCh },
          { line: toCursor.line, ch: toCh }
        );
      } else if (
        this._shouldToggleComment(editor, fromCursor.line, toCursor.line, false)
      ) {
        editor.uncomment(fromCursor, toCursor);
      }
      editor.focus();
      return;
    }
    if (editor.getLine(fromCursor.line).trim().startsWith('//')) {
      editor.uncomment(fromCursor, toCursor);
      editor.focus();
      return;
    }
    editor.lineComment(fromCursor, toCursor);
    editor.focus();
  },
  _shouldToggleComment: function (editor, fromLine, toLine, isComment) {
    var anchorLine = editor.getCursor('anchor').line;
    var headLine = editor.getCursor('head').line;
    if (anchorLine > headLine) toLine++;
    for (var i = fromLine; i < toLine; i++) {
      if (editor.getLine(i).blank()) continue;
      if (isComment && !editor.getLine(i).trim().startsWith('//')) return true;
      if (!isComment && editor.getLine(i).trim().startsWith('//')) return true;
    }
    return false;
  },
  _format: function (editor, txt) {
    var oneLineIndent = false;
    var spacesForTab = '\t';
    var indentWithTabs = this.editor.getOption('indentWithTabs');
    if (!indentWithTabs) {
      var indent = this.editor.getOption('indentUnit');
      spacesForTab = new Array(indent + 1).join(' ');
    }
    var spacesLen = spacesForTab.length;
    var lines = txt.split('\n');
    var indentSpaces = '';
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].replace(/^\s+|\s+$/g, '');
      line = line + '';
      if (line.startsWith('}')) {
        if (indentSpaces.length >= spacesLen) {
          indentSpaces = indentSpaces.substring(
            0,
            indentSpaces.length - spacesLen
          );
        }
      }
      if (line.startsWith('*')) lines[i] = ' ' + indentSpaces + line;
      else lines[i] = indentSpaces + line;
      if (oneLineIndent) {
        oneLineIndent = false;
        indentSpaces = indentSpaces.substring(
          0,
          indentSpaces.length - spacesLen
        );
      }
      if (line.endsWith('{')) {
        indentSpaces += spacesForTab;
      } else if (
        line.startsWith('if') ||
        line.startsWith('else') ||
        line.startsWith('for') ||
        line.startsWith('while')
      ) {
        indentSpaces += spacesForTab;
        oneLineIndent = true;
      }
    }
    return lines.join('\n');
  },
  _hideEditor: function () {
    this.editor.getTextArea().style.position = '';
    this.editor.getTextArea().style.top = 0;
    this.editor.save();
    this.editor.getWrapperElement().style.display = 'none';
    this.editor.getTextArea().style.display = '';
    $(this.id + '.editor.toolbar').style.display = 'none';
    $(this.id + '.editor.toolbar.instructional.info').style.display = 'none';
    $(this.id + '.noeditor.toolbar').style.display = '';
    $('go_to_script.' + this.id).style.visibility = '';
    $('go_to_script.' + this.id).style.display = '';
    this.textAreaMode = true;
  },
  _showEditor: function () {
    this.editor.getWrapperElement().style.display = '';
    this.editor.getTextArea().style.position = 'absolute';
    this.editor.getTextArea().style.top = '-1000000px';
    this.editor.setValue(this.editor.getTextArea().value);
    $(this.id + '.noeditor.toolbar').style.display = 'none';
    $(this.id + '.editor.toolbar').style.display = '';
    $(this.id + '.editor.toolbar.instructional.info').style.display = '';
    this.textAreaMode = false;
  },
  _onTextChange: function (ge) {
    if (!ge.editor) return;
    var el = $(ge.id);
    var value = ge.editor.getValue();
    if (el.changed) {
      if (value === ge.originalValue) ge._clearModified(el);
    } else {
      if (!el.changed && ge.editor.getValue() !== ge.originalValue) {
        ge._setModified(el);
      }
    }
    onChangeLabelProcess(ge.id);
    fieldChanged(ge.id, el.changed);
  },
  _onTextAreaResize: function (id) {
    if (id !== this.id) return;
    this.editor.setHeight($(id).getHeight() + 'px');
    this.editor.focus();
  },
  _clearModified: function (el) {
    el.changed = false;
    var original = $$(
      'input.' + this.id.replace('.', '_') + '_editor_original_input'
    );
    if (original[0] && original[0].value != 'XXmultiChangeXX')
      original[0].value = this.originalValue;
  },
  _setModified: function (el) {
    var form = el.up('form');
    if (!form) return;
    var original = $$(
      'input.' + this.id.replace('.', '_') + '_editor_original_input'
    );
    if (original[0] && original[0].value != 'XXmultiChangeXX')
      original[0].value = 'XXmultiChangeXX';
    if ($('sys_original.' + this.id).getValue() !== $(this.id).getValue())
      el.changed = true;
    onChangeLabelProcess(this.id);
    fieldChanged(this.id, el.changed);
  },
  _initMacros: function () {
    var helpList = [];
    helpList.push(
      'The Syntax Editor macros are:\n-----------------------------'
    );
    var div = $('syntax_macros');
    if (!div) return false;
    var macros = div.select('textarea');
    for (var i = 0; i < macros.length; i++) {
      var macro = macros[i];
      this.macros[macro.getAttribute('name') + ''] = this._initMacro(
        macro.value
      );
      helpList.push(
        macro.getAttribute('name') + ' - ' + macro.getAttribute('comments')
      );
    }
    var helpMacro = {};
    helpMacro.text = helpList.join('\n');
    this.macros['help'] = helpMacro;
    return macros.length > 0;
  },
  _initMacro: function (text) {
    var lines = text.split('\n');
    var macro = {};
    macro['text'] = text;
    macro['length'] = lines.length;
    macro['curLine'] = -1;
    macro['curCh'] = 0;
    for (var i = 0; i < lines.length; i++) {
      var pos = lines[i].indexOf('$0');
      if (pos == -1) continue;
      macro['curLine'] = i;
      macro['curCh'] = pos;
      lines[i] = lines[i].replace(/\$0/, '');
      macro['text'] = lines.join('\n');
    }
    return macro;
  },
  _getMacro: function (editor, macros) {
    var cur = editor.getCursor();
    var token = editor.getTokenAt(cur);
    var m = macros[token.string];
    if (!m) {
      editor.indentSelection('add');
      return undefined;
    }
    var cursor = {
      line: cur.line,
      ch: token.start,
    };
    if (m.curLine >= 0) {
      cursor.line += m.curLine;
      if (m.curLine == 0) cursor.ch += m.curCh;
      else cursor.ch = m.curCh;
    }
    editor.replaceRange(
      m.text,
      {
        line: cur.line,
        ch: token.start,
      },
      {
        line: cur.line,
        ch: token.end,
      }
    );
  },
  format: function (txt) {
    return txt;
  },
  toString: function () {
    return 'GlideEditor';
  },
  addDocs: function (name, script, server) {
    var doc = new CodeMirror.Doc(script, 'javascript');
    server.addDoc(name, doc);
  },
  codeCompleteHandler: function (editor) {
    var completion = editor.state.completionActive;
    completion.options.completeSingle = false;
    var pick = completion.pick;
    completion.pick = function (data, i) {
      var completion = data.list[i];
      CodeMirror.signal(editor, 'codemirror_hint_pick', {
        data: completion,
        editor: editor,
      });
      pick.apply(this, arguments);
    };
  },
  _launchScriptDebugger: function (id, type, field) {
    var width = window.top.innerWidth - 40,
      height = window.top.innerHeight,
      x = window.top.screenX + 20,
      y = window.top.screenY + 20,
      features =
        'width=' +
        width +
        ',height=' +
        height +
        ',toolbar=no,status=no,directories=no,menubar=no,resizable=yes,screenX=' +
        x +
        ',left=' +
        x +
        ',screenY=' +
        y +
        ',top=' +
        y;
    var debuggerWind = window.open('', 'sn_ScriptDebugger', features, false),
      prevFullUrl = debuggerWind.location.href,
      reload = false;
    if (prevFullUrl === 'about:blank') {
      try {
        var storedTime = localStorage.getItem('sn_ScriptDebugger'),
          currentTime = new Date().getTime();
        if (storedTime && currentTime - storedTime < 60000) {
          debuggerWind.close();
          localStorage.setItem(
            'sn_ScriptDebuggerExist_ShowNotification',
            new Date().getTime()
          );
          return;
        }
      } catch (e) {}
      reload = true;
    }
    var url =
      '$jsdebugger.do?scriptId=' +
      id +
      '&scriptType=' +
      type +
      '&scriptField=' +
      field +
      '&sysparm_nostack=true';
    if (!reload) {
      var prevUrl = prevFullUrl.slice(prevFullUrl.indexOf('$jsdebugger.do'));
      if (prevUrl != url) {
        reload = true;
      }
    }
    if (reload) {
      debuggerWind = window.open(url, 'sn_ScriptDebugger', features, false);
    }
    debuggerWind.focus();
    debuggerWind.setTimeout(focus, 100);
  },
  scriptDebugger: function (editor) {
    var launchFunction;
    if (window.top.launchScriptDebugger) {
      launchFunction = window.top.launchScriptDebugger;
    } else if (
      window.top.opener &&
      window.top.opener.top.launchScriptDebugger
    ) {
      launchFunction = window.top.opener.top.launchScriptDebugger;
    } else {
      launchFunction = this._launchScriptDebugger;
    }
    launchFunction(
      CodeMirror.scriptInfo.id,
      CodeMirror.scriptInfo.type,
      CodeMirror.scriptInfo.field
    );
  },
});
GlideEditor.get = function (id) {
  return g_glideEditors[id];
};
GlideEditor.getAll = function () {
  return g_glideEditorArray;
};
