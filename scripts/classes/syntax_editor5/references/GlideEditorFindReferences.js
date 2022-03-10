/*! RESOURCE: /scripts/classes/syntax_editor5/references/GlideEditorFindReferences.js */
var GlideEditorFindReferences = (function () {
  var tableNamesMsg = getMessage(
    'Script Include, Business Rule, UI Page, ACL, UI Action, UI Policy, List Controls, Widgets, Scripted REST API, Workflow Action and Flow Action.'
  );
  var noReferencesText = new GwtMessage().getMessage(
    'No files found in the tables: {0}',
    tableNamesMsg
  );
  var showAllFilesMsg = getMessage('Show All Files');
  var infoText = new GwtMessage().getMessage(
    'The list shows search results from the tables: {0} To see results from all tables, click {1}.',
    tableNamesMsg,
    showAllFilesMsg
  );
  var usagesModalId = 'usages-modal';
  var jUsagesModalId = '#usages-modal';
  var modalBodyId = 'usages-modal-body';
  var popoverViewportPadding = 13;
  var typeMapper = {
    sys_script_include: 'script_include',
    sys_db_object: 'table',
  };
  var defaultSearchTables = [
    'sys_script',
    'sys_script_include',
    'sys_ui_page',
    'sys_ui_action',
    'sys_ui_policy',
    'sys_security_acl',
    'sys_ui_list_control',
    'sys_widgets',
    'sys_ws_operation',
    'wf_action',
    'sys_variable_value',
  ];
  var modalElement;
  var usages;
  var literal;
  var literalName;
  var scope;
  var listView;
  var popoverStatus;
  var isFullSearchStarted;
  var modalTitle;
  var tbodyBox;
  var focusTrap;
  function initialise(contextLiteral) {
    usages = [];
    literal = contextLiteral;
    if (literal.type === 'sys_db_object') literalName = literal.key;
    else if (literal.type === 'sys_script_include') {
      var split = literal.key.split('.');
      scope = split[0];
      literalName = split[1];
    }
    listView = null;
    popoverStatus = {
      isShown: false,
      eventTarget: null,
    };
    isFullSearchStarted = false;
    modalTitle = '';
    tbodyBox = {};
    focusTrap = false;
  }
  function addFocusTrap() {
    if (window.focusTrap) {
      focusTrap = window.focusTrap(document.getElementById(usagesModalId), {
        initialFocus: $j('.usages-modal_title')[0],
      });
      focusTrap.activate();
    }
  }
  function findUsageName(sysId) {
    var usage = usages.find(function (usage) {
      return usage.sysId === sysId;
    });
    return usage.name ? usage.name : 'no name';
  }
  function tBodyResizeHandler() {
    var tbody = document.getElementById(modalBodyId);
    if (tbody) {
      tbodyBox = tbody.getBoundingClientRect();
      var scrollbarWidth = tbody.offsetWidth - tbody.clientWidth;
      if (scrollbarWidth)
        modalElement.find('thead').addClass('thead-scroll-offset');
    }
  }
  function isElementInViewport(dElem) {
    var elementBox = dElem.getBoundingClientRect();
    return (
      elementBox.bottom >= tbodyBox.top && elementBox.bottom <= tbodyBox.bottom
    );
  }
  function isEllipsisActive(dElem) {
    return dElem.clientWidth < dElem.scrollWidth;
  }
  function getNumOfFilesMsg(numberOfFiles) {
    if (numberOfFiles === 1) return getMessage('Showing 1 file');
    return new GwtMessage().getMessage('Showing {0} files', numberOfFiles);
  }
  function getUsagesAjax(
    literal,
    searchTables,
    ignoredTables,
    successCallback,
    failureCallback
  ) {
    $j.ajax({
      url: '/api/now/syntax_editor/getReferences',
      method: 'POST',
      headers: {
        'X-UserToken': window.g_ck,
      },
      contentType: 'application/json',
      data: JSON.stringify({
        searchWord: literal.key,
        searchWordType: typeMapper[literal.type],
        searchTables: searchTables,
        ignoredTables: ignoredTables,
      }),
    })
      .done(function (data) {
        if (data.result && data.result.result)
          successCallback(data.result.result);
      })
      .fail(function (error) {
        if (failureCallback) failureCallback(error);
      });
  }
  function getUsages() {
    getUsagesAjax(literal, defaultSearchTables, [], function (data) {
      usages = JSON.parse(data);
      renderModal();
    });
  }
  function getAllUsages() {
    getUsagesAjax(literal, [], defaultSearchTables, updateModal, function () {
      isFullSearchStarted = false;
    });
  }
  function updateModal(fullUsages) {
    var defaultUsagesNum = usages.length;
    usages = usages.concat(JSON.parse(fullUsages));
    modalElement.find('.info-message').text(getNumOfFilesMsg(usages.length));
    modalElement.find('.info-message-wrapper .icon-info').hide();
    modalElement.find('.modal-footer').hide();
    var noReferencesElem = modalElement.find('.no-references-msg');
    if (!usages.length) {
      noReferencesElem.addClass('full-body-height');
      noReferencesElem.html('<p>' + getMessage('No files found') + '</p>');
    } else {
      updateListBody(usages);
      $j('#' + modalBodyId).addClass('full-body-height');
      if (defaultUsagesNum === 0) noReferencesElem.addClass('hide');
    }
    tBodyResizeHandler();
  }
  function getCombinedUsages(usage) {
    var maxNumberOfDigits = (function () {
      var maxLineNumber = 0;
      usage.fields.forEach(function (scriptField) {
        scriptField.references.forEach(function (reference) {
          maxLineNumber = Math.max(maxLineNumber, reference.lineNo);
        });
      });
      return maxLineNumber.toString().length;
    })();
    var combinedUsages = usage.fields.map(function (scriptField) {
      return scriptField.references.reduce(function (combinedref, ref) {
        var paddedLine = ('Line ' + ref.lineNo).padEnd(maxNumberOfDigits + 6);
        return (
          combinedref + paddedLine + ref.code.replace(/\r?\n|\r/gm, '') + '\n'
        );
      }, scriptField.name + '\n');
    });
    return combinedUsages
      .reduce(function (combinedScripts, script) {
        return combinedScripts + script.trim() + '\n\n';
      }, '')
      .trim();
  }
  function addEditorDecorations(codeMirrorEditor, usage) {
    var headingLines = (function () {
      var headingLines = [];
      var index = 0;
      usage.fields.forEach(function (scriptField) {
        headingLines.push(index);
        index += scriptField.references.length + 2;
      });
      return headingLines;
    })();
    headingLines.map(function (headingLine) {
      return codeMirrorEditor.addLineClass(
        headingLine,
        'text',
        'popover-script-heading'
      );
    });
    var charWidth = codeMirrorEditor.defaultCharWidth(),
      basePadding = 4;
    codeMirrorEditor.on('renderLine', function (cm, line, elt) {
      var lineRegex = /^Line [0-9]+ */;
      var matchingText = (lineRegex.exec(line.text) || [''])[0];
      var off =
        CodeMirror.countColumn(
          matchingText,
          matchingText.length,
          cm.getOption('tabSize')
        ) * charWidth;
      elt.style.textIndent = '-' + off + 'px';
      elt.style.paddingLeft = basePadding + off + 'px';
    });
    codeMirrorEditor.refresh();
  }
  function showEditorPreview(sysId) {
    if ($j('#usages-preview').siblings().length > 0) return;
    var usage = usages.find(function (usage) {
      return usage.sysId === sysId;
    });
    var combinedUsagesString = getCombinedUsages(usage);
    var textarea = document.getElementById('usages-preview');
    var codeMirrorEditor = CodeMirror.fromTextArea(textarea, {
      lineNumbers: false,
      mode: 'javascript',
      lineWrapping: true,
      readOnly: true,
      viewportMargin: Infinity,
      cursorBlinkRate: -1,
    });
    codeMirrorEditor.setValue(combinedUsagesString);
    addEditorDecorations(codeMirrorEditor, usage);
    modalElement.find('.usages-popover').removeClass('invisible');
  }
  function hidePopover() {
    popoverStatus.isShown = false;
    modalElement.find('.usages-popover').addClass('invisible');
    $j(popoverStatus.eventTarget).popover('hide');
  }
  function showPopover(event) {
    var target = $j(event.target);
    var sysId = target.parent().parent().data('sysid');
    if (popoverStatus.isShown) {
      hidePopover();
      if (popoverStatus.eventTarget === event.target) return;
    }
    popoverStatus.isShown = true;
    popoverStatus.eventTarget = event.target;
    var popoverTemplate =
      '<div class="invisible usages-popover popover glide-popup" role="tooltip" > \
  <div class="arrow"> \
  </div> \
  <div class="popover-body"> \
  <div class="popover-header"> \
  <h3 class="popover-title ellipsis"></h3> \
  <button class="open-file btn btn-default">' +
      getMessage('Open File') +
      '</button> \
  </div> \
  <div class="popover-content" > \
  </div> \
  </div> \
  </div>';
    target.popover({
      template: popoverTemplate,
      placement: 'bottom',
      title: new GwtMessage().getMessage(
        'Usage of {0} in {1}',
        literalName,
        findUsageName(sysId)
      ),
      content: '<textarea class="invisible" id="usages-preview"></textarea>',
      trigger: 'manual',
      placement: 'auto',
      viewport: {
        selector: jUsagesModalId + ' .modal-body',
        padding: popoverViewportPadding,
      },
    });
    target.one('shown.bs.popover', function () {
      showEditorPreview(sysId);
    });
    target.popover('show');
  }
  function addListeners() {
    modalElement.on('mouseover', 'td', function (event) {
      var tdElement;
      var target = $j(event.target);
      var nodeName = target.prop('nodeName');
      if (nodeName === 'SPAN') tdElement = target.parent();
      else if (nodeName === 'TD') tdElement = target;
      if (tdElement) {
        if (tdElement.data('data-dynamic-title')) return;
        if (isEllipsisActive(tdElement.get(0)))
          $j(tdElement).attr('data-dynamic-title', $j(tdElement).text().trim());
      }
    });
    modalElement.on(
      'mouseover',
      '.modal-title, .popover-title',
      function (event) {
        var target = $j(event.target);
        if (target.data('data-dynamic-title')) return;
        if (isEllipsisActive(target.get(0))) {
          var tooltipText = target.hasClass('modal-title')
            ? modalTitle
            : target.text().trim();
          target.attr('data-dynamic-title', tooltipText);
        }
      }
    );
    modalElement.on('click', '.simple-list-info-button', function (event) {
      event.stopPropagation();
      showPopover(event);
    });
    modalElement.on(
      'click',
      ':not(.simple-list-info-button)',
      function (event) {
        if ($j(event.target).closest('.usages-popover').length > 0) {
          return;
        }
        if (popoverStatus.isShown) {
          hidePopover();
        }
      }
    );
    modalElement.on('click', '.open-file, .simple-list-link', function (event) {
      var row;
      var target = $j(event.target);
      if (target.hasClass('open-file'))
        row = target.closest('.usages-popover').parent().parent();
      else if (target.hasClass('simple-list-link'))
        row = target.parent().parent();
      if (row)
        GlideEditorContextMenu.openRecord(
          row.data('tablename'),
          row.data('sysid')
        );
    });
    $j('#show-all-button').on('click', function (event) {
      if (!isFullSearchStarted) {
        isFullSearchStarted = true;
        getAllUsages();
      }
    });
    $j(document).on('click', outsideClickHandler);
    modalElement.on('keydown', function (event) {
      if (event.which === 27) {
        if (popoverStatus.isShown) {
          event.stopPropagation();
          hidePopover();
        } else modalElement.modal('hide');
      }
    });
    addTbodyScrollListener();
    modalElement.on('hide.bs.modal', function () {
      destroyModal();
    });
  }
  function outsideClickHandler() {
    if ($j(event.target).closest('.modal-content').length > 0) return;
    modalElement.modal('hide');
  }
  function destroyModal() {
    if (window.focusTrap && focusTrap) focusTrap.deactivate();
    $j(document).off('click', outsideClickHandler);
  }
  function addTbodyScrollListener() {
    var modalBodyElement = modalElement.find('.modal-body');
    $j('#' + modalBodyId).on('scroll', function () {
      if (!popoverStatus.isShown) return;
      var popoverTarget = popoverStatus.eventTarget;
      if (!isElementInViewport(popoverTarget)) {
        hidePopover();
        return;
      }
      var popoverTargetBottom = popoverTarget.getBoundingClientRect().bottom;
      var modalBodyTop = modalBodyElement[0].getBoundingClientRect().top;
      var popoverTop = popoverTargetBottom - modalBodyTop;
      modalElement.find('.popover').css({ top: popoverTop });
    });
  }
  function updateListBody(usages) {
    listView.updateListBody(usages);
  }
  function noUsagesMsg(numberOfFiles) {
    if (!numberOfFiles)
      return (
        '<div class="no-references-msg"> \
  <p>' +
        noReferencesText +
        '</p> \
  <p>' +
        getMessage(
          'To find references in other tables, click ' + showAllFilesMsg
        ) +
        '</p> \
  </div>'
      );
    return '';
  }
  function getModalBody(listData) {
    return (
      '<div class=usages-modal-container> \
  <div class="info-message-wrapper"> \
  <span class="info-message">' +
      getNumOfFilesMsg(usages.length) +
      '</span> \
  <span tabIndex="-1" class="icon-info icon-info-tooltip text-primary" aria-label="' +
      infoText +
      '" title="' +
      infoText +
      '"></span> \
  </div> \
  <hr> \
  <div class="usages-table-wrapper"> \
  </div>' +
      noUsagesMsg(listData.length) +
      '<hr class="table-bottom-break"> \
  <div class="modal-footer"> \
  <button class="btn btn-default" id="show-all-button" >' +
      showAllFilesMsg +
      '</button> \
  </div> \
  </div>'
    );
  }
  function getTableConfig(tableData) {
    return {
      tableId: 'usages-modal-table',
      tbodyId: modalBodyId,
      caption: '',
      infoColumn: {
        displayValue: getMessage('Preview script'),
        className: 'mini-width',
      },
      rowAttrs: ['sysId', 'tableName'],
      header: [
        {
          columnName: 'name',
          displayValue: getMessage('File name'),
          isLink: true,
          className: 'medium-width',
        },
        {
          columnName: 'tableDisplayName',
          displayValue: getMessage('File type'),
          className: 'small-width',
        },
        {
          columnName: 'applicationLabel',
          displayValue: getMessage('Application'),
          defaultSort: true,
          className: 'small-width',
        },
      ],
      body: tableData,
    };
  }
  function renderTable(tableData) {
    modalElement = $j(jUsagesModalId);
    var tableConfig = getTableConfig(tableData);
    var tableWrapper = modalElement.find('.usages-table-wrapper');
    listView = new SimpleList(tableConfig, tableWrapper);
  }
  function renderModal() {
    var usagesModal = new GlideModal(usagesModalId, true);
    modalTitle = new GwtMessage().getMessage(
      'Files referencing {0}',
      literalName
    );
    usagesModal.setTitle(modalTitle);
    var modalBody = getModalBody(usages);
    usagesModal.setBody(modalBody);
    renderTable(usages);
    addListeners();
    addFocusTrap();
    tBodyResizeHandler();
  }
  function showUsages(contextLiteral) {
    initialise(contextLiteral);
    getUsages();
  }
  return {
    showUsages: showUsages,
  };
})();
