/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorJSCommon.js */
var GlideEditorJSCommon = (function () {
  var contextMenuOpened = false,
    liSelected,
    displayedContextMenuItems,
    gutterContextMenuId,
    LINE_ID,
    GUTTER,
    EDITOR,
    LINE_NUMBER,
    CONTEXT_EVENT,
    breakConditionId,
    logStatementId,
    addBreakpointId,
    addConditionId,
    editConditionId,
    removeConditionId,
    removeBreakpointId,
    addConditionalBreakpointId,
    lintingEnabled,
    addLogpointId,
    editLogpointId,
    removeLogpointId,
    hasBreakpointRole = false,
    subscriberCollection = { gutterContextMenu: [], change: [] };
  function init(id, editor, debugpoints) {
    var isNewRecord = g_form.isNewRecord();
    if (isNewRecord) return;
    hasBreakpointRole = debugpoints.hasBreakpointRole;
    hasLogpointRole = debugpoints.hasLogpointRole;
    var lineNumberSelector =
      '.Debugger-breakpoints-gutter-marker div.CodeMirror-linenumber';
    var lineNumberGhostClass = 'Debugger-linenumber-ghost';
    $j(window.document).on('mouseover', lineNumberSelector, function (e) {
      e.target.classList.add(lineNumberGhostClass);
      updateContextEvent(e);
    });
    $j(window.document).on('mouseout', lineNumberSelector, function (e) {
      e.target.classList.remove(lineNumberGhostClass);
      $j('.logpoint-readonly,.breakpoint-readonly').css({
        display: 'none',
      });
    });
    window.document.oncontextmenu = function (e) {
      if (isContextMenuClickedOnGutter(e.target.classList)) return false;
    };
    $j('#gutterContextMenu')
      .find('li')
      .hover(function () {
        $j(this).focus();
      });
    $j(window).keydown(function (e) {
      if (contextMenuOpened) {
        if (e.which === 40) {
          if (liSelected) {
            var nextNotHidden;
            $j(displayedContextMenuItems).each(function (index, item) {
              if ($j(item).is(':focus'))
                nextNotHidden = $j(item)
                  .nextAll('.breakpoint-menu-item')
                  .not('.hide-me')
                  .first();
            });
            nextNotHidden.focus();
          } else {
            liSelected = $j(displayedContextMenuItems[0])
              .nextAll('.breakpoint-menu-item')
              .not('.hide-me')
              .first();
            liSelected.focus();
          }
        } else if (e.which === 38) {
          if (liSelected) {
            var prevNotHidden;
            $j(displayedContextMenuItems).each(function (index, item) {
              if ($j(item).is(':focus'))
                prevNotHidden = $j(item)
                  .prevAll('.breakpoint-menu-item')
                  .not('.hide-me')
                  .first();
            });
            prevNotHidden.focus();
          } else {
            liSelected = $j(displayedContextMenuItems[0])
              .prevAll('.breakpoint-menu-item')
              .not('.hide-me')
              .first();
            liSelected.focus();
          }
        } else if (e.which === 27) {
          if (contextMenuOpened) hideContextMenu();
        }
      }
    });
    GlideEditorJSBreakpoints.init(id, editor);
    GlideEditorJSLogpoints.init(id, editor);
    loadPoints(id, editor, function () {
      editor.on('gutterClick', function (cm, line, gutter, event) {
        $j('.logpoint-readonly,.breakpoint-readonly').css({
          display: 'none',
        });
        onGutterClick(id, cm, line, gutter, event);
      });
      var _lastLineCount = editor.lineCount();
      editor.on('change', function (cm, changed) {
        var curLineCount = editor.lineCount();
        if (curLineCount !== _lastLineCount) {
          _lastLineCount = curLineCount;
          updateGutterMarkers(editor, changed);
        }
      });
      editor.on('gutterContextMenu', function (cm, line, gutter, event) {
        subscriberCollection['gutterContextMenu'].forEach(function (handler) {
          handler(id, cm, line, gutter, event);
        });
        onGutterContextMenu(id, editor, line, gutter, event);
      });
      lintingEnabled = editor.getOption('lint');
      editor.on('optionChange', function (cm, option) {
        if (option === 'gutters' || option === 'lint') {
          var lintEnabled = cm.options.lint;
          if (lintEnabled === false) {
            $j('.CodeMirror-lines').each(function (index, item) {
              item.classList.add('linter-toggled');
            });
            lintingEnabled = false;
          } else {
            $j('.CodeMirror-lines').each(function (index, item) {
              item.classList.remove('linter-toggled');
            });
            lintingEnabled = true;
          }
        }
        if (option === 'format_code') {
          updateGutterMarkers(editor);
        }
      });
    });
    $j(window.document).mouseup(function (e) {
      var contextMenu = $j(gutterContextMenuId);
      if (
        !contextMenu.is(e.target) &&
        contextMenu.has(e.target).length === 0 &&
        !(
          $j(e.target).hasClass('CodeMirror-linenumber') ||
          $j(e.target).hasClass('CodeMirror-gutter-background')
        )
      )
        hideContextMenu();
    });
    window.addEventListener(
      'scroll',
      function () {
        hideContextMenu();
      },
      true
    );
    initializeReferences();
  }
  function initializeReferences() {
    addBreakpointId = '#addBreakpoint';
    addConditionId = '#addCondition';
    editConditionId = '#editCondition';
    removeConditionId = '#removeCondition';
    removeBreakpointId = '#removeBreakpoint';
    addConditionalBreakpointId = '#addConditionalBreakpoint';
    breakConditionId = '#breakCondition';
    gutterContextMenuId = '#gutterContextMenu';
    addLogpointId = '#addLogpoint';
    editLogpointId = '#editLogpoint';
    removeLogpointId = '#removeLogpoint';
    logStatementId = '#logCondition';
    gutterContextMenuId = '#gutterContextMenu';
  }
  function subscriberToGutterEvent(eventName, handler) {
    if (subscriberCollection[eventName])
      subscriberCollection[eventName].push(handler);
  }
  function updateContextEvent(e) {
    CONTEXT_EVENT = e;
  }
  function hideAllElements() {
    $j('.breakpoint-menu-item').addClass('hide-me');
  }
  function hideElement(elementId) {
    $j(elementId).addClass('hide-me');
  }
  function hideContextMenu() {
    hideElement(gutterContextMenuId);
    if (EDITOR)
      EDITOR.removeLineClass(
        LINE_NUMBER - 1,
        'gutter',
        'Debugger-linenumber-ghost-clone'
      );
    contextMenuOpened = false;
  }
  function updateGutterMarkers(editor, changed) {
    editor.operation(function () {
      editor.eachLine(function (line) {
        editor.removeLineClass(line, 'gutter');
        editor.addLineClass(
          line,
          'gutter',
          'Debugger-breakpoints-gutter-marker'
        );
      });
    });
    subscriberCollection['change'].forEach(function (handler) {
      handler(editor, changed);
    });
  }
  function updatePointerStyles(
    editor,
    changedOrigin,
    line,
    className,
    lineCount,
    highlightClass
  ) {
    var lineNumber = Number(line);
    if (lineCount >= lineNumber)
      editor.addLineClass(lineNumber - 1, 'gutter', className);
    editor.addLineClass(lineNumber - 1, 'background', highlightClass);
  }
  function getKey() {
    var tbl = g_form.getTableName();
    var sysId = g_form.getUniqueValue();
    return tbl + '.' + sysId;
  }
  function removeConditionClass(EDITOR, LINE_NUMBER) {
    EDITOR.removeLineClass(
      LINE_NUMBER - 1,
      'gutter',
      'Debugger-breakpoints-condition-gutter'
    );
  }
  function removeOutlineClass() {
    if (EDITOR && LINE_NUMBER)
      EDITOR.removeLineClass(LINE_NUMBER - 1, 'gutter', 'Debugger-outline');
  }
  function showElement(elementId) {
    $j(elementId).removeClass('hide-me');
  }
  function isContextMenuClickedOnGutter(targetContextMenuClassList) {
    return (
      targetContextMenuClassList.contains('CodeMirror-gutter-elt') ||
      targetContextMenuClassList.contains('CodeMirror-linenumber') ||
      targetContextMenuClassList.contains('CodeMirror-gutter-background') ||
      targetContextMenuClassList.contains('breakpoint-menu-item')
    );
  }
  function focusContextMenu(gutterContextMenuElement) {
    var listNodes = gutterContextMenuElement.children().first().children();
    displayedContextMenuItems = [];
    listNodes.each(function (index, item) {
      if (!item.classList.contains('hide-me'))
        displayedContextMenuItems.push(item);
    });
    if (displayedContextMenuItems && displayedContextMenuItems.length > 0)
      displayedContextMenuItems[0].focus();
  }
  function showContextMenu() {
    var gutterContextMenuElement = $j(gutterContextMenuId);
    gutterContextMenuElement.css({
      top: CONTEXT_EVENT.pageY + 'px',
      left: CONTEXT_EVENT.pageX + 'px',
      position: 'fixed',
    });
    if (!isBrowserIE()) {
      gutterContextMenuElement.css({
        'z-index': '1000',
      });
    }
    EDITOR.addLineClass(
      LINE_NUMBER - 1,
      'gutter',
      'Debugger-linenumber-ghost-clone'
    );
    showElement(gutterContextMenuId);
    contextMenuOpened = true;
    var contextmenuHeight = gutterContextMenuElement
      .children()
      .first()
      .height();
    if (window.innerHeight < CONTEXT_EVENT.pageY + contextmenuHeight) {
      gutterContextMenuElement.css({
        top: CONTEXT_EVENT.pageY - contextmenuHeight + 'px',
      });
    }
    focusContextMenu(gutterContextMenuElement);
  }
  function isBrowserIE() {
    var userAgent = navigator.userAgent.toLowerCase();
    return (
      userAgent.indexOf('msie ') > -1 || userAgent.indexOf('trident/') > -1
    );
  }
  function onGutterClick(id, editor, lineNumber, gutter, event) {
    if (event.which === 3) {
      event.preventDefault();
      var userAgent = navigator.userAgent.toLowerCase();
      if (
        userAgent.indexOf('firefox') > -1 ||
        isBrowserIE() ||
        userAgent.indexOf('edge') > -1
      ) {
        onGutterContextMenu(id, editor, lineNumber, gutter, event);
        subscriberCollection['gutterContextMenu'].forEach(function (handler) {
          handler(id, editor, lineNumber, gutter, event);
        });
      }
      return;
    }
    if (
      event.target.classList.contains('CodeMirror-foldgutter-open') ||
      event.target.classList.contains('CodeMirror-foldgutter-folded')
    )
      return;
    var isLogpointExist = ifLineHasPoint(
      lineNumber + 1,
      GlideEditorJSLogpoints.getLogPoints()
    );
    if (hasBreakpointRole && !isLogpointExist) {
      var evaluationString =
        GlideEditorJSBreakpoints.getBreakPoints()[lineNumber + 1];
      if (evaluationString == null)
        GlideEditorJSBreakpoints.toggleBreakpoint(
          id,
          editor,
          lineNumber + 1,
          gutter,
          ''
        );
      else
        GlideEditorJSBreakpoints.toggleBreakpoint(
          id,
          editor,
          lineNumber + 1,
          gutter
        );
    } else if (hasLogpointRole && isLogpointExist)
      GlideEditorJSLogpoints.toggleLogpoint(id, editor, lineNumber + 1, gutter);
    editor.removeLineClass(lineNumber, 'gutter', 'Debugger-breakpoints-gutter');
    editor.removeLineClass(
      lineNumber,
      'gutter',
      'Debugger-breakpoints-condition-gutter'
    );
    editor.removeLineClass(
      lineNumber,
      'background',
      'Debugger-breakpoints-highlight'
    );
  }
  function ifLineHasPoint(lineNum, Collection) {
    return (
      Object.keys(Collection).filter(function (point) {
        return point == lineNum;
      }).length > 0
    );
  }
  function onGutterContextMenu(id, editor, lineNumber, gutter, event) {
    var isWidgetDisplayed =
      $j(breakConditionId).is(':visible') || $j(logStatementId).is(':visible');
    if (isWidgetDisplayed) return;
    removeOutlineClass();
    if (CONTEXT_EVENT) hideContextMenu();
    LINE_NUMBER = lineNumber + 1;
    CONTEXT_EVENT = event;
    LINE_ID = id;
    GUTTER = gutter;
    EDITOR = editor;
    hideAllElements();
    if (
      ifLineHasPoint(LINE_NUMBER, GlideEditorJSBreakpoints.getBreakPoints())
    ) {
      showElement(removeBreakpointId);
      if (
        GlideEditorJSBreakpoints.ifBreakpointAtLineHasCondition(LINE_NUMBER)
      ) {
        showElement(editConditionId);
        showElement(removeConditionId);
      } else {
        showElement(addConditionId);
        hideElement(editConditionId);
      }
    } else if (
      ifLineHasPoint(LINE_NUMBER, GlideEditorJSLogpoints.getLogPoints())
    ) {
      showElement(editLogpointId);
      showElement(removeLogpointId);
    } else {
      showElement(addBreakpointId);
      showElement(addConditionalBreakpointId);
      showElement(addLogpointId);
    }
    if (document.getElementById('gutterContextMenu')) showContextMenu();
    event.preventDefault();
  }
  function removeErrorClass(errorElement, selector) {
    hideElement(errorElement);
    $j(selector).removeClass('condition-input-error');
  }
  function updatePointContent(id, lineNumber, then, evaluationString, api) {
    var scriptType = g_form.getTableName();
    var scriptId = g_form.getUniqueValue();
    var scriptField = id.split('.')[1];
    var requestData = null;
    if (evaluationString != null)
      requestData = JSON.stringify({ evaluationString: evaluationString });
    var url =
      '/api/now/js/' +
      api +
      '/' +
      scriptType +
      '/' +
      scriptId +
      '/' +
      scriptField +
      '/' +
      lineNumber;
    $j.ajax({
      url: url,
      method: 'POST',
      headers: {
        'X-UserToken': window.g_ck,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: requestData,
    }).done(function (response) {
      then(true);
    });
  }
  function togglePoint(id, editor, lineNumber, gutter, statement, api) {
    hideContextMenu();
    var lineInfo = editor.lineInfo(lineNumber - 1);
    var gutters = lineInfo.gutterMarkers || {};
    if ('CodeMirror-foldgutter' === gutter && gutters[gutter]) {
      return;
    }
    updatePointContent(
      id,
      lineNumber,
      function (ok) {
        if (ok) loadPoints(id, editor);
      },
      statement,
      api
    );
  }
  function removeEditorClass(lineNumber, context, className) {
    EDITOR.removeLineClass(lineNumber, context, className);
  }
  function hidePointReadonlyMode(selector) {
    $j(selector).css({
      display: 'none',
    });
  }
  function stopDotPropogation(e) {
    if (event.keyCode === 190) event.stopPropagation();
  }
  function loadPoints(id, editor, then) {
    var scriptType = g_form.getTableName();
    var scriptId = g_form.getUniqueValue();
    var scriptField = id.split('.')[1];
    var url =
      '/api/now/js/debugpoints/script' +
      '/' +
      scriptType +
      '/' +
      scriptId +
      '/' +
      scriptField;
    $j.ajax({
      url: url,
      method: 'GET',
      headers: { 'X-UserToken': window.g_ck },
    }).done(function (data) {
      if (!data || typeof data !== 'object') return;
      var result = data.result || {};
      var debugpoints = result.debugpoints || {};
      setPoints(debugpoints);
      updateGutterMarkers(editor);
      if (then) then();
    });
  }
  function setPoints(debugpoints) {
    var logpoints = {};
    var breakpoints = {};
    var debugBreakpoints = debugpoints.BREAKPOINT || {};
    var debugLogpoints = debugpoints.LOGPOINT || {};
    breakpoints = getDebugpoints(debugBreakpoints);
    logpoints = getDebugpoints(debugLogpoints);
    GlideEditorJSBreakpoints.setBreakpoints(breakpoints);
    GlideEditorJSLogpoints.setLogpoints(logpoints);
  }
  function getDebugpoints(debugPoints) {
    var points = {};
    Object.keys(debugPoints).map(function (line) {
      var pointData = debugPoints[line];
      points[line] = pointData ? pointData.evaluationString : null;
    });
    return points;
  }
  function hideEditor(event, containerId, conditionId, point, saveHandler) {
    var container = $j(containerId);
    if (
      !container.is(event.target) &&
      container.has(event.target).length === 0
    ) {
      var conditionTextboxElement = $j(conditionId);
      var isWidgetDisplayed = conditionTextboxElement.is(':visible'),
        conditionValue = $j.trim(conditionTextboxElement.val());
      if (
        isWidgetDisplayed &&
        point !== conditionValue &&
        !saveHandler(conditionValue)
      )
        return;
      GlideEditorJSCommon.hideElement(containerId);
      if (EDITOR) {
        GlideEditorJSCommon.removeOutlineClass(EDITOR, LINE_NUMBER);
        EDITOR.refresh();
      }
    }
  }
  function isLintingEnabled() {
    return lintingEnabled;
  }
  return {
    init: init,
    contextMenuOpened: contextMenuOpened,
    hideContextMenu: hideContextMenu,
    updateGutterMarkers: updateGutterMarkers,
    updatePointerStyles: updatePointerStyles,
    getKey: getKey,
    removeConditionClass: removeConditionClass,
    removeOutlineClass: removeOutlineClass,
    isContextMenuClickedOnGutter: isContextMenuClickedOnGutter,
    onGutterContextMenu: onGutterContextMenu,
    showElement: showElement,
    hideElement: hideElement,
    focusContextMenu: focusContextMenu,
    showContextMenu: showContextMenu,
    isBrowserIE: isBrowserIE,
    onGutterClick: onGutterClick,
    removeErrorClass: removeErrorClass,
    updatePointContent: updatePointContent,
    togglePoint: togglePoint,
    subscriberToGutterEvent: subscriberToGutterEvent,
    removeEditorClass: removeEditorClass,
    hidePointReadonlyMode: hidePointReadonlyMode,
    loadPoints: loadPoints,
    stopDotPropogation: stopDotPropogation,
    hideEditor: hideEditor,
    isLintingEnabled: isLintingEnabled,
  };
})();
