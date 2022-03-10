/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorJSBreakpoints.js */
var GlideEditorJSBreakpoints = (function () {
  var BREAKPOINTS = {},
    LINE_ID,
    LINE_NUMBER,
    CONTEXT_EVENT,
    GUTTER,
    EDITOR,
    CONDITION_WIDGET,
    addBreakpointId = '#addBreakpoint',
    addConditionId = '#addCondition',
    editConditionId = '#editCondition',
    removeConditionId = '#removeCondition',
    removeBreakpointId = '#removeBreakpoint',
    addConditionalBreakpointId = '#addConditionalBreakpoint',
    breakConditionId = '#breakCondition',
    gutterContextMenuId = '#gutterContextMenu',
    breakpointContainerId = '#breakpointContainer',
    breakpointContainerContent = null;
  function init(id, editor) {
    var isNewRecord = g_form.isNewRecord();
    if (isNewRecord) return;
    var lineNumberSelector =
      '.Debugger-breakpoints-gutter-marker div.CodeMirror-linenumber';
    var containerSelector = $j(breakpointContainerId)[0];
    breakpointContainerContent =
      containerSelector == null ? null : containerSelector.outerHTML;
    $j(window.document).on('mouseover', lineNumberSelector, function (e) {
      var isFullScreen = editor.getOption('fullScreen');
      showBreakpointReadonlyMode(e, isFullScreen);
    });
    editor.on('gutterClick', function (cm, line, gutter, event) {
      hideBreakpointReadonlyMode();
    });
    $j(window.document).mouseup(hideBreakpointEditor);
    $j(addBreakpointId).on('click', onAddBreakpointClick);
    $j(addConditionId).on('click', showBreakpointEditor);
    $j(editConditionId).on('click', showBreakpointEditor);
    $j(removeConditionId).on('click', onRemoveConditionClick);
    $j(removeBreakpointId).on('click', onRemoveBreakpointClick);
    $j(addConditionalBreakpointId).on('click', showBreakpointEditor);
    registerInputEvents();
    GlideEditorJSCommon.subscriberToGutterEvent(
      'gutterContextMenu',
      onGutterContextMenu
    );
    GlideEditorJSCommon.subscriberToGutterEvent(
      'change',
      updateBreakpointGutterMarkers
    );
  }
  function registerInputEvents() {
    $j(breakConditionId).keydown(onConditionTextboxKeyDown);
    $j(breakConditionId).keyup(GlideEditorJSCommon.stopDotPropogation);
  }
  function updateBreakpointGutterMarkers(editor, changed) {
    var lineCount = editor.lineCount(),
      classNameToHighlight = 'Debugger-breakpoints-highlight',
      changedOrigin = changed ? changed.origin : null;
    Object.keys(BREAKPOINTS).forEach(function (breakpointLine) {
      var classNameToApply =
        BREAKPOINTS[breakpointLine] != null &&
        BREAKPOINTS[breakpointLine] !== ''
          ? 'Debugger-breakpoints-condition-gutter'
          : 'Debugger-breakpoints-gutter';
      GlideEditorJSCommon.updatePointerStyles(
        editor,
        changedOrigin,
        breakpointLine,
        classNameToApply,
        lineCount,
        classNameToHighlight
      );
    });
  }
  function toggleBreakpoint(id, editor, lineNumber, gutter, statement) {
    GlideEditorJSCommon.togglePoint(
      id,
      editor,
      lineNumber,
      gutter,
      statement,
      'debugger/breakpoint'
    );
  }
  function onAddBreakpointClick() {
    toggleBreakpoint(LINE_ID, EDITOR, LINE_NUMBER, GUTTER, '');
  }
  function showBreakpointEditor() {
    var condition = BREAKPOINTS[LINE_NUMBER] || '';
    var conditionTextbox = $j('#breakCondition');
    EDITOR.addLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-outline');
    conditionTextbox.val(condition);
    $j('#debuggerLineNumber').text(LINE_NUMBER);
    GlideEditorJSCommon.removeErrorClass('#conditionError', '#breakCondition');
    if (document.getElementById('breakpointContainer') == null) {
      $j('#debugContainer').append(breakpointContainerContent);
      registerInputEvents();
      conditionTextbox = $j('#breakCondition');
    }
    CONDITION_WIDGET = EDITOR.doc.addLineWidget(
      LINE_NUMBER - 1,
      document.getElementById('breakpointContainer')
    );
    GlideEditorJSCommon.hideContextMenu();
    GlideEditorJSCommon.showElement(breakpointContainerId);
    conditionTextbox.focus();
  }
  function hideBreakpointEditor(e) {
    if ($j(breakConditionId).is(':visible'))
      GlideEditorJSCommon.hideEditor(
        e,
        breakpointContainerId,
        breakConditionId,
        BREAKPOINTS[LINE_NUMBER],
        trySaveCondition
      );
  }
  function onRemoveConditionClick() {
    BREAKPOINTS[LINE_NUMBER] = '';
    GlideEditorJSCommon.hideContextMenu();
    GlideEditorJSCommon.removeEditorClass(
      LINE_NUMBER - 1,
      'gutter',
      'Debugger-breakpoints-condition-gutter'
    );
    updateBreakpointsWithVal('');
  }
  function onRemoveBreakpointClick() {
    toggleBreakpoint(LINE_ID, EDITOR, LINE_NUMBER, GUTTER);
    GlideEditorJSCommon.removeEditorClass(
      LINE_NUMBER - 1,
      'gutter',
      'Debugger-breakpoints-condition-gutter'
    );
    GlideEditorJSCommon.removeEditorClass(
      LINE_NUMBER - 1,
      'gutter',
      'Debugger-breakpoints-gutter'
    );
  }
  function onConditionTextboxKeyDown(event) {
    if (event.keyCode === 13 || event.keyCode === 27) {
      var isValid = trySaveCondition(event.target.value);
      if (isValid || event.keyCode === 27) {
        GlideEditorJSCommon.hideElement(breakpointContainerId);
        GlideEditorJSCommon.removeOutlineClass();
      }
    }
  }
  function trySaveCondition(val) {
    var trimmedValue = $j.trim(val);
    if (!ifBreakpointAtLineHasConditionVal(LINE_NUMBER, val)) {
      BREAKPOINTS[LINE_NUMBER] = trimmedValue;
      updateBreakpointsWithVal(trimmedValue);
      if (trimmedValue.length < 1)
        GlideEditorJSCommon.removeEditorClass(
          LINE_NUMBER - 1,
          'gutter',
          'Debugger-breakpoints-condition-gutter'
        );
    }
    return true;
  }
  function onGutterContextMenu(id, editor, lineNumber, gutter, event) {
    hideBreakpointReadonlyMode();
    var conditionTextboxElement = $j(breakConditionId),
      isWidgetDisplayed = conditionTextboxElement.is(':visible');
    if (!isWidgetDisplayed) {
      GlideEditorJSCommon.removeOutlineClass();
      LINE_NUMBER = lineNumber + 1;
      CONTEXT_EVENT = event;
      LINE_ID = id;
      GUTTER = gutter;
      EDITOR = editor;
    }
  }
  function updateBreakpointsWithVal(val) {
    GlideEditorJSCommon.updatePointContent(
      LINE_ID,
      LINE_NUMBER,
      function (ok) {
        if (ok) GlideEditorJSCommon.loadPoints(LINE_ID, EDITOR);
      },
      val,
      'debugger/breakpoint'
    );
  }
  function ifBreakpointAtLineHasCondition(lineNum) {
    return BREAKPOINTS[lineNum] && BREAKPOINTS[lineNum].length > 0;
  }
  function ifBreakpointAtLineHasConditionVal(lineNum, val) {
    return (
      BREAKPOINTS[LINE_NUMBER] &&
      BREAKPOINTS[LINE_NUMBER].length > 0 &&
      BREAKPOINTS[LINE_NUMBER] === val
    );
  }
  function showBreakpointReadonlyMode(e, isFullScreen) {
    var breakpointContainer = $j(breakpointContainerId);
    var isBreakpointContainerHidden =
      breakpointContainer.hasClass('hide-me') || !breakpointContainer.length;
    var shouldDisplayCondition =
      e.target.parentNode.classList.contains(
        'Debugger-breakpoints-condition-gutter'
      ) &&
      $j(gutterContextMenuId).hasClass('hide-me') &&
      isBreakpointContainerHidden;
    if (shouldDisplayCondition) {
      var lineNumber = e.target.textContent;
      CONTEXT_EVENT = e;
      var offset = $j(e.target).closest('.CodeMirror-scroll').offset();
      var position = isFullScreen ? 'fixed' : 'absolute';
      var left =
        45 +
        (isFullScreen ? 0 : 15) +
        (GlideEditorJSCommon.isLintingEnabled() ? 16 : 0);
      $j('.breakpoint-readonly')
        .text(BREAKPOINTS[lineNumber])
        .css({
          display: 'block',
          top: CONTEXT_EVENT.pageY - offset.top + 15 + 'px',
          left: left + 'px',
          position: position,
        });
    }
  }
  function hideBreakpointReadonlyMode(selector) {
    GlideEditorJSCommon.hidePointReadonlyMode('.breakpoint-readonly');
  }
  function getBreakPoints() {
    return BREAKPOINTS;
  }
  function setBreakpoints(points) {
    BREAKPOINTS = points || {};
  }
  return {
    init: init,
    toggleBreakpoint: toggleBreakpoint,
    getBreakPoints: getBreakPoints,
    ifBreakpointAtLineHasCondition: ifBreakpointAtLineHasCondition,
    setBreakpoints: setBreakpoints,
  };
})();
