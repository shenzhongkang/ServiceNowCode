/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorJSLogpoints.js */
var GlideEditorJSLogpoints = (function () {
  var LINE_ID,
    GUTTER,
    EDITOR,
    LOGPOINTS = {},
    LINE_NUMBER,
    addLogpointId = '#addLogpoint',
    editLogpointId = '#editLogpoint',
    removeLogpointId = '#removeLogpoint',
    logpointContainerId = '#logpointContainer',
    logConditionId = '#logCondition',
    gutterContextMenuId = '#gutterContextMenu',
    logStatementId = '#logCondition',
    logpointContainerContent = null;
  function init(id, editor) {
    var isNewRecord = g_form.isNewRecord();
    if (isNewRecord) return;
    var lineNumberSelector =
      '.Debugger-breakpoints-gutter-marker div.CodeMirror-linenumber';
    var containerSelector = $j(logpointContainerId)[0];
    logpointContainerContent =
      containerSelector == null ? null : containerSelector.outerHTML;
    $j(window.document).on('mouseover', lineNumberSelector, function (e) {
      var isFullScreen = editor.getOption('fullScreen');
      showLogpointReadonlyMode(e, isFullScreen);
    });
    editor.on('gutterClick', function (cm, line, gutter, event) {
      hideLogpointReadonlyMode();
    });
    $j(window.document).mouseup(hideLogpointEditor);
    $j(addLogpointId).on('click', showLogpointEditor);
    $j(editLogpointId).on('click', showLogpointEditor);
    $j(removeLogpointId).on('click', onRemoveLogpointClick);
    registerInputEvents();
    GlideEditorJSCommon.subscriberToGutterEvent(
      'gutterContextMenu',
      onGutterContextMenu
    );
    GlideEditorJSCommon.subscriberToGutterEvent(
      'change',
      updateLogGutterMarkers
    );
  }
  function registerInputEvents() {
    $j(logConditionId).keydown(onLogConditionTextboxKeyDown);
    $j(logConditionId).keyup(GlideEditorJSCommon.stopDotPropogation);
  }
  function removeLogpointClass(EDITOR, LINE_NUMBER) {
    GlideEditorJSCommon.removeEditorClass(
      LINE_NUMBER - 1,
      'gutter',
      'Debugger-logpoints-gutter'
    );
  }
  function toggleLogpoint(id, editor, lineNumber, gutter, statement) {
    GlideEditorJSCommon.togglePoint(
      id,
      editor,
      lineNumber,
      gutter,
      statement,
      'logpoints/logpoint'
    );
  }
  function loadLogPoints(id, editor, then) {
    GlideEditorJSCommon.loadPoints(id, editor);
  }
  function updateLogGutterMarkers(editor, changed) {
    var lineCount = editor.lineCount(),
      classNameToApply = 'Debugger-logpoints-gutter',
      classNameToHighlight = 'logpoints-highlight',
      changedOrigin = changed ? changed.origin : null;
    Object.keys(LOGPOINTS).forEach(function (logpointLine) {
      GlideEditorJSCommon.updatePointerStyles(
        editor,
        changedOrigin,
        logpointLine,
        classNameToApply,
        lineCount,
        classNameToHighlight
      );
    });
  }
  function onRemoveLogpointClick() {
    toggleLogpoint(LINE_ID, EDITOR, LINE_NUMBER, GUTTER);
    removeLogpointClass(EDITOR, LINE_NUMBER);
  }
  function ifLogpointAtLineHasStatement(lineNum, val) {
    return (
      LOGPOINTS[LINE_NUMBER] &&
      LOGPOINTS[LINE_NUMBER].length > 0 &&
      LOGPOINTS[LINE_NUMBER] === val
    );
  }
  function updateLogpointsWithVal(val) {
    GlideEditorJSCommon.updatePointContent(
      LINE_ID,
      LINE_NUMBER,
      function (ok) {
        if (ok) loadLogPoints(LINE_ID, EDITOR);
        GlideEditorJSCommon.updateGutterMarkers(EDITOR);
      },
      val,
      'logpoints/logpoint'
    );
  }
  function trySaveLogCondition(val) {
    var trimmedValue = $j.trim(val),
      isSaved = true;
    var isNewpoint = !LOGPOINTS[LINE_NUMBER] && trimmedValue !== '';
    var isUpdate = LOGPOINTS[LINE_NUMBER] && LOGPOINTS[LINE_NUMBER] !== val;
    if (isNewpoint || isUpdate) {
      updateLogpointsWithVal(trimmedValue || null);
      if (trimmedValue.length < 1) {
        GlideEditorJSCommon.removeConditionClass(EDITOR, LINE_NUMBER);
        delete LOGPOINTS[LINE_NUMBER];
      } else LOGPOINTS[LINE_NUMBER] = trimmedValue;
    }
    return isSaved;
  }
  function onGutterContextMenu(id, editor, lineNumber, gutter, event) {
    hideLogpointReadonlyMode();
    var conditionTextboxElement = $j(logStatementId),
      isWidgetDisplayed = conditionTextboxElement.is(':visible');
    if (!isWidgetDisplayed) {
      GlideEditorJSCommon.removeOutlineClass();
      LINE_NUMBER = lineNumber + 1;
      LINE_ID = id;
      GUTTER = gutter;
      EDITOR = editor;
    }
  }
  function getLogPoints() {
    return LOGPOINTS;
  }
  function hideLogpointEditor(e) {
    if ($j(logConditionId).is(':visible'))
      GlideEditorJSCommon.hideEditor(
        e,
        logpointContainerId,
        logConditionId,
        LOGPOINTS[LINE_NUMBER],
        trySaveLogCondition
      );
  }
  function showLogpointEditor() {
    var statement = LOGPOINTS[LINE_NUMBER] || '';
    EDITOR.addLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-outline');
    var conditionTextbox = $j('#logCondition');
    conditionTextbox.val(statement || '');
    $j('#logLineNumber').text(LINE_NUMBER);
    GlideEditorJSCommon.removeErrorClass('#logError', '#logCondition');
    if (document.getElementById('logpointContainer') == null) {
      $j('#debugContainer').append(logpointContainerContent);
      registerInputEvents();
      conditionTextbox = $j('#logCondition');
    }
    CONDITION_WIDGET = EDITOR.doc.addLineWidget(
      LINE_NUMBER - 1,
      document.getElementById('logpointContainer')
    );
    GlideEditorJSCommon.hideContextMenu();
    GlideEditorJSCommon.showElement(logpointContainerId);
    conditionTextbox.focus();
  }
  function onLogConditionTextboxKeyDown(event) {
    if (event.keyCode === 13 || event.keyCode === 27) {
      var statement = $j.trim(event.target.value);
      var isValueValid =
        (!LOGPOINTS[LINE_NUMBER] && statement !== '') ||
        typeof LOGPOINTS[LINE_NUMBER] !== 'undefined';
      var isSaved = isValueValid && trySaveLogCondition(statement);
      if (!isValueValid || isSaved || event.keyCode === 27) {
        GlideEditorJSCommon.hideElement(logpointContainerId);
        GlideEditorJSCommon.removeOutlineClass(EDITOR, LINE_NUMBER);
      }
    }
  }
  function showLogpointReadonlyMode(e, isFullScreen) {
    var logpointContainer = $j(logpointContainerId);
    var isLogpointContainerHidden =
      logpointContainer.hasClass('hide-me') || !logpointContainer.length;
    var shouldDisplayCondition =
      e.target.parentNode.classList.contains('Debugger-logpoints-gutter') &&
      $j(gutterContextMenuId).hasClass('hide-me') &&
      isLogpointContainerHidden;
    if (shouldDisplayCondition) {
      var lineNumber = e.target.textContent;
      CONTEXT_EVENT = e;
      if (LOGPOINTS[lineNumber]) {
        var offset = $j(e.target).closest('.CodeMirror-scroll').offset();
        var position = isFullScreen ? 'fixed' : 'absolute';
        var left =
          45 +
          (isFullScreen ? 0 : 15) +
          (GlideEditorJSCommon.isLintingEnabled() ? 16 : 0);
        $j('.logpoint-readonly')
          .text(LOGPOINTS[lineNumber])
          .css({
            display: 'block',
            top: CONTEXT_EVENT.pageY - offset.top + 15 + 'px',
            left: left + 'px',
            position: position,
          });
      }
    }
  }
  function hideLogpointReadonlyMode(selector) {
    GlideEditorJSCommon.hidePointReadonlyMode('.logpoint-readonly');
  }
  function setLogpoints(points) {
    LOGPOINTS = points || {};
  }
  return {
    getLogPoints: getLogPoints,
    init: init,
    setLogpoints: setLogpoints,
    toggleLogpoint: toggleLogpoint,
  };
})();
