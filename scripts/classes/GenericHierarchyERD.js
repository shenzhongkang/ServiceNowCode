/*! RESOURCE: /scripts/classes/GenericHierarchyERD.js */
var GenericHierarchyERD = Class.create(GenericHierarchy, {
  initialize: function (diagram_id, processor, params, expanded_key_ids) {
    GenericHierarchy.prototype.initialize.call(
      this,
      diagram_id,
      processor,
      expanded_key_ids
    );
    this.allowMouseOverEdge = true;
    this.hideEdgesForNodeDrag = true;
    this.columnSpanMarkup = {};
    this.colorBarMarkup = {};
    this.params = params.clone();
    this.container_id = diagram_id;
    this.expanded_key_ids = expanded_key_ids;
  },
  _postLoad: function () {
    this._processNodesAndEdges();
    this._setupFlyout();
  },
  _setupFlyout: function () {
    var flyoutContent = [];
    var topBorder = 0;
    var result = this.getNodesByValue(
      GenericHierarchyERD.TABLE_DISPLAY_NAME_DATA
    );
    var tableDisplayNames = result.values;
    var nodesByDisplayName = result.nodesByValue;
    for (var i = 0; i < tableDisplayNames.length; i++) {
      var array = nodesByDisplayName[tableDisplayNames[i]];
      for (var j = 0; j < array.length; j++) {
        flyoutContent[flyoutContent.length] = this._createFlyoutItem(
          'flyout_item_',
          'flyout_item_toggle_',
          array[j],
          topBorder
        );
        topBorder = 1;
      }
    }
    this.flyout = new GlideFlyout({
      title: getMessage('Tables'),
      parent: gel(this.container_id).parentNode,
      id: 'flyout',
      top: 0,
      right: 20,
      height: '50%',
      minHeight: 24,
      maxWidth: 220,
      position: 'absolute',
      content: flyoutContent,
    });
  },
  _createFlyoutItem: function (prefix, togglePrefix, node, topBorder) {
    var diagram = this;
    var id = node.getID();
    var tableName = node.getData(GenericHierarchyERD.TABLE_NAME_DATA);
    var background = GenericHierarchyERD.COLOR_TABLE;
    if (this.params.values['table'] == tableName)
      background = GenericHierarchyERD.COLOR_TABLE_SELECTED;
    var div = $(cel('div'));
    div.setAttribute('id', prefix + id);
    div.style.cursor = 'pointer';
    div.style.background = background;
    div.style.borderTop = topBorder + 'px solid white';
    div.on('click', function () {
      diagram.scrollToNode(node, -100);
      diagram.flyout.collapse();
      diagram.selectNode(id);
    });
    var table = $(cel('table'));
    table.style.background = 'none';
    var tbody = $(cel('tbody'));
    table.appendChild(tbody);
    var tr = $(cel('tr'));
    var tdIcon = $(cel('td'));
    var tdContent = $(cel('td'));
    if (this.params.values['table'] != tableName) {
      var imgToggle = $(cel('img'));
      imgToggle.setAttribute('id', togglePrefix + id);
      imgToggle.setAttribute('title', GenericHierarchyERD.HIDE_THIS_TABLE_MSG);
      imgToggle.setAttribute('src', 'images/eyeOpenNew.png');
      imgToggle.itemState = 'visible';
      imgToggle.node = node;
      imgToggle.addClassName('hideShowNode');
      tdIcon.appendChild(imgToggle);
    } else {
      var imgToggle = $(cel('img'));
      imgToggle.setAttribute('src', 'images/eyeOpenNew.png');
      imgToggle.style.visibility = 'hidden';
      imgToggle.addClassName('hideShowNode');
      tdIcon.appendChild(imgToggle);
    }
    tdContent.innerHTML = node.getData(
      GenericHierarchyERD.TABLE_TITLE_MARKUP_DATA
    );
    tr.appendChild(tdIcon);
    tr.appendChild(tdContent);
    tbody.appendChild(tr);
    div.appendChild(table);
    return div;
  },
  _createEventHandlers: function () {
    var diagram = this;
    $(document.body).on('click', 'td.dCell', function (ev, el) {
      document.location.href =
        'sys_dictionary.do?sys_id=' +
        $(el).getAttribute('dID') +
        '&sysparm_record_target=sys_dictionary';
      ev.stop();
    });
    var params = this.params;
    $(document.body).on('click', 'td.rCell', function (ev, el) {
      document.location.href = params
        .clone()
        .pushTable($(el).getAttribute('rTable'))
        .clearTableExpansion()
        .createURL();
      ev.stop();
    });
    $(document.body).on('click', 'img.expandImg', function (ev, el) {
      document.location.href = params
        .clone()
        .addExpand($(el).getAttribute('expandTable'))
        .createURL();
    });
    $(document.body).on('click', 'img.collapseImg', function (ev, el) {
      document.location.href = params
        .clone()
        .removeExpand($(el).getAttribute('collapseTable'))
        .createURL();
    });
    $(document.body).on('click', 'span.colummsHeader', function (ev, el) {
      var spanID = $(el).getAttribute('spanID');
      var span = $(spanID);
      var table = $(spanID + '_table');
      if (!span.visible()) {
        table.update(diagram.columnSpanMarkup[spanID]);
        var goToMessage = getMessage('Go to dictionary');
        var focusMessage = getMessage('Focus on referenced table');
        $(span)
          .select('.dCell')
          .each(function (el) {
            $(el).setAttribute('title', goToMessage);
          });
        $(span)
          .select('.rCell')
          .each(function (el) {
            $(el).setAttribute('title', focusMessage);
          });
      } else table.update('');
      $(span).toggle();
      var titleElem = $($(el).getAttribute('titleID'));
      if (span.visible()) titleElem.down('img').src = 'images/minusNew.gif';
      else titleElem.down('img').src = 'images/plusNew.gif';
      var elemID = $(table.up('.node_outer_div')).getAttribute('id');
      var node = diagram.getNode(elemID);
      diagram._removeAndAddNode(node, true);
      ev.stop();
    });
    $(document.body).on('click', 'img.hideShowNode', function (ev, el) {
      if (el.itemState == 'visible') {
        el.itemState = 'hidden';
        el.src = 'images/eyeClosedNew.png';
        el.title = GenericHierarchyERD.SHOW_THIS_TABLE_MSG;
        diagram.hideNode(el.node);
      } else {
        el.itemState = 'visible';
        el.src = 'images/eyeOpenNew.png';
        el.title = GenericHierarchyERD.HIDE_THIS_TABLE_MSG;
        diagram.showNode(el.node);
      }
      ev.stop();
    });
    $(document.body).on('click', 'img.nodeHideIcon', function (ev, el) {
      var imgToggle = $(gel('flyout_item_toggle_' + el.getAttribute('nodeID')));
      imgToggle.itemState = 'hidden';
      imgToggle.src = 'images/eyeClosedNew.png';
      imgToggle.title = GenericHierarchyERD.SHOW_THIS_TABLE_MSG;
      diagram.hideNode(imgToggle.node);
      ev.stop();
    });
  },
  _removeAndAddNode: function (node, doClick) {
    var elem = $(node.getID());
    var parent = elem.parentNode;
    parent.removeChild(elem);
    parent.appendChild(elem);
    if (doClick) node.fireEvent('click');
  },
  _processNodesAndEdges: function () {
    this._setNodeClickHandlers();
    for (var key in this.nodes) {
      var node = this.nodes[key];
      var tableName = node.getData(GenericHierarchyERD.TABLE_NAME_DATA);
      if (this.params.values['table'] != tableName)
        this._createNodeHideIcon(node);
      else
        $(node.getID())
          .select('.drag_section_header')[0]
          .select('img')[0].style.visibility = 'hidden';
      this._setNodeName(node, tableName);
      if (isMSIE)
        this._setNodeBackgroundColor(
          node,
          this._setNodeHeaderColorIE(node, tableName)
        );
      else
        this._setNodeBackgroundColor(
          node,
          this._setNodeHeaderColor(node, tableName)
        );
      this._setNodeDescription(node, tableName);
      this._createNodeActions(node, tableName);
    }
    this._createEventHandlers();
    this.edgeInvalidateDisabled = true;
    this.repositionNodes();
    this.edgeInvalidateDisabled = false;
    for (var key in this.edges) this._prepareEdge(this.edges[key]);
  },
  _prepareEdge: function (edge) {
    edge.enablePrintLines();
    edge.arrowHead = false;
    if (edge.getData('name') && edge.getData('name').length > 0) {
      edge._buildHoverDiv();
      edge._invalidate();
      $(edge.hoverDiv).addClassName('hoverDiv');
      edge.line.on('mouseover', function (n, e) {
        if (e.x) edge.showHoverDiv(e.x + 10, e.y);
        else edge.showHoverDiv(e.pageX + 10, e.pageY);
      });
      edge.line.on('mouseout', function (n, e) {
        edge.hideHoverDiv();
      });
    }
  },
  _getColumnsHeaderMarkup: function (
    table,
    currentTable,
    currentTableName,
    columnSpanID,
    hasHiddenColumns
  ) {
    var headerTitle =
      "<span style='color: #444;'>" +
      GenericHierarchyERD.COLUMNS_MESSAGE +
      '</span>';
    var color = GenericHierarchyERD.COLOR_COLUMN_BLOCK_HEADER;
    if (table != currentTable) {
      headerTitle = currentTableName + ' ' + headerTitle;
      color = GenericHierarchyERD.COLOR_COLUMN_BLOCK_HEADER_BASE;
    }
    var style = "'font-size: 10px; font-weight: bold; color: " + color + "'";
    if (hasHiddenColumns) {
      var columnCellTitleID = table + '_' + currentTable + '_columns_title';
      return (
        "<span class='colummsHeader' spanID='" +
        columnSpanID +
        "' titleID='" +
        columnCellTitleID +
        "'><table style=" +
        style +
        "><tr><td id='" +
        columnCellTitleID +
        "'><img src='images/plusNew.gif' style='margin-top: -1px; width: 12px; height: 12px;'/></td><td> " +
        headerTitle +
        '</td></tr></table></span>'
      );
    } else
      return (
        '<span><table style=' +
        style +
        '><tr><td>' +
        currentTableName +
        '</td></tr></table></span>'
      );
  },
  _setNodeDescription: function (node, table) {
    var description = '';
    var counter = 0;
    while (node.getData(GenericHierarchyERD.COLUMN_DATA_PREFIX + counter)) {
      var currentTable = node.getData(
        GenericHierarchyERD.COLUMN_DATA_TABLE_PREFIX + counter
      );
      var currentTableName = node.getData(
        GenericHierarchyERD.COLUMN_DATA_TABLE_NAME_PREFIX + counter
      );
      var columnMarkup = node.getData(
        GenericHierarchyERD.COLUMN_DATA_PREFIX + counter
      );
      counter++;
      if (description.length > 0)
        description += "<div class='nodeDescSep'></div>";
      var columnSpanID = table + '_' + currentTable + '_columns';
      description += this._getColumnsHeaderMarkup(
        table,
        currentTable,
        currentTableName,
        columnSpanID,
        columnMarkup.length > 0
      );
      if (columnMarkup.length > 0) {
        description +=
          "<span id='" +
          columnSpanID +
          "' style='display: none;' state='hidden'><table id='" +
          columnSpanID +
          "_table' class='columnsTable'></table></span>";
        this.columnSpanMarkup[columnSpanID] = columnMarkup;
      }
    }
    node.setDescription(description);
    $('body_' + node.getID()).style.width = '100%';
  },
  _splitTable: function (table) {
    if (table.length > 20 && table.indexOf('_') > -1) {
      var parts = table.split('_');
      table = '';
      var current = '';
      for (var i = 0; i < parts.length; i++) {
        if (current.length + parts[i].length > 26) {
          table += current + '<br/>';
          current = '';
        }
        current += parts[i];
        if (i < parts.length - 1) current += '_';
      }
      if (current.length > 0) table += current;
    }
    return table;
  },
  _createNodeActions: function (node, table) {
    this._createNodeAction(
      GenericHierarchyERD.FOCUS_MESSAGE,
      'self.location.href="' +
        this.params.clone().pushTable(table).clearTableExpansion().createURL() +
        '";',
      node
    );
    this._createNodeAction(
      GenericHierarchyERD.LIST_MESSAGE,
      'self.location.href="' + table + '_list.do";',
      node
    );
    this._createNodeAction(
      GenericHierarchyERD.DICTIONARY_MESSAGE,
      'self.location.href="sys_dictionary_list.do?sysparm_referring_url=generic_hierarchy_erd.do&sysparm_view=&sysparm_query=name%3D' +
        table +
        '&sysparm_query_encoded=name%3D' +
        table +
        '";',
      node
    );
  },
  _createNodeAction: function (name, script, node) {
    var action = new GwtDiagramAction();
    action.setName(name);
    action.setScript(script);
    action.setType('menu');
    node.addMenuAction(action);
  },
  _createNodeHideIcon: function (node) {
    var id = node.getID();
    var header = $(id).select('.drag_section_header')[0];
    var cell = header.select('td')[0];
    if (!this.imgHide) {
      this.imgHide = $(cel('img'));
      this.imgHide.setAttribute(
        'title',
        GenericHierarchyERD.HIDE_THIS_TABLE_MSG
      );
      this.imgHide.setAttribute('src', 'images/eyeOpenNew.png');
      this.imgHide.addClassName('nodeHideIcon');
    }
    var imgHide = this.imgHide.cloneNode(false);
    imgHide.setAttribute('id', 'hideNode_' + id);
    imgHide.setAttribute('nodeID', id);
    var imgIcon = header.select('img')[0];
    imgIcon.parentNode.removeChild(imgIcon);
    var table = cel('table');
    table.style.background = 'none';
    var tr2 = cel('tr');
    var td2 = cel('td');
    td2.appendChild(imgHide);
    tr2.appendChild(td2);
    var tbody = cel('tbody');
    tbody.appendChild(tr2);
    table.appendChild(tbody);
    cell.appendChild(table);
  },
  _setNodeName: function (node, table) {
    var name = node.getData(GenericHierarchyERD.TABLE_DISPLAY_NAME_DATA);
    if (table.startsWith('var__m_')) name = 'Variable';
    name = "<span style='font-weight: bold'>" + name + '</span>';
    var colors = [];
    var titles = [];
    if (this.params.values['show_internal'])
      name +=
        "<br/><span style='font-size: 9px; color: #444;'>(" +
        this._splitTable(table) +
        ')</span>';
    var displayExpandedKey = false;
    if (
      node.getData(GenericHierarchyERD.REL_EXPANDED_EXTENDS) ||
      node.getData(GenericHierarchyERD.REL_EXPANDED_EXTENDED_BY)
    ) {
      colors.push(GenericHierarchyERD.COLOR_TABLE_EXPANDED);
      titles.push(GenericHierarchyERD.PART_OF_EXPANDED_MSG);
      displayExpandedKey = true;
    }
    if (displayExpandedKey)
      for (var i = 0; i < this.expanded_key_ids.length; i++) {
        var elem = $(this.expanded_key_ids[i]);
        if (!elem.visible()) elem.toggle();
      }
    var key = '';
    if (node.getData(GenericHierarchyERD.REL_EXTENDS)) {
      colors.push(GenericHierarchyERD.COLOR_TABLE_BASE);
      titles.push(GenericHierarchyERD.THIS_TABLE_IS_EXTENDED_MSG);
      key += 'A';
    }
    if (node.getData(GenericHierarchyERD.REL_EXTENDEDBY)) {
      colors.push(GenericHierarchyERD.COLOR_TABLE_CHILD);
      titles.push(GenericHierarchyERD.THIS_TABLE_EXTENDS_MSG);
      key += 'B';
    }
    if (node.getData(GenericHierarchyERD.REL_REFERENCES)) {
      colors.push(GenericHierarchyERD.COLOR_TABLE_REF);
      titles.push(GenericHierarchyERD.THIS_TABLE_IS_REFERENCED);
      key += 'C';
    }
    if (node.getData(GenericHierarchyERD.REL_REFERENCEDBY)) {
      colors.push(GenericHierarchyERD.COLOR_TABLE_REF_BY);
      titles.push(GenericHierarchyERD.THIS_TABLE_REFERENCES);
      key += 'D';
    }
    var colorBar = '';
    if (colors.length > 0) {
      if (!this.colorBarMarkup[key]) {
        colorBar += "<div class='cBarSep'></div><div class='cBarCont'>";
        var perc = 100 / colors.length;
        for (var i = 0; i < colors.length; i++) {
          var rightBorder = '';
          var color = colors[i];
          if (i < colors.length - 1)
            rightBorder = ' border-right: 1px solid darkgray;';
          colorBar +=
            "<div style='top: 0px; position: absolute; height: 0px; border-top: 6px solid " +
            color +
            '; width: ' +
            perc +
            '%; left: ' +
            perc * i +
            '%; background: ' +
            color +
            '; ' +
            rightBorder +
            "' title='" +
            titles[i] +
            "'></div>";
        }
        colorBar += '</div>';
        this.colorBarMarkup[key] = colorBar;
      } else colorBar = this.colorBarMarkup[key];
    }
    var icons = '';
    if (
      this.params.values['show_extended'] == 'true' ||
      this.params.values['show_extended_by'] == 'true'
    ) {
      if (node.getData(GenericHierarchyERD.CAN_EXPAND_DATA) == 'true')
        icons =
          "<img style='margin-top: -2px;' class='expandImg' title='" +
          getMessage('Expand hierarchy') +
          "' expandTable='" +
          table +
          "' src='images/plusNew.gif'/>";
      else if (node.getData(GenericHierarchyERD.CAN_COLLAPSE_DATA) == 'true')
        icons =
          "<img style='margin-top: -2px;' class='collapseImg' title='" +
          getMessage('Collapse hierarchy') +
          "' collapseTable='" +
          table +
          "' src='images/minusNew.gif'/>";
    }
    var title =
      "<table class='node_table' style='border-collapse: collapse;'><tr><td class='node_content_cell'>" +
      name +
      colorBar +
      "</td><td class='node_controls_cell'><div class='node_controls_div'>" +
      icons +
      '</div></td></tr></table>';
    node.setTitle(title);
    if (
      this.params.values['show_extended'] == 'true' ||
      this.params.values['show_extended_by'] == 'true'
    ) {
      if (node.getData(GenericHierarchyERD.CAN_EXPAND_DATA) == 'true') {
        var img = $(cel('img'));
        img.setAttribute('title', getMessage('Expand hierarchy'));
        img.setAttribute('src', 'images/plusNew.gif');
        img.addClassName('expandImg');
        img.setAttribute('expandTable', table);
        img.style.position = 'absolute';
        if (isChrome || isSafari) img.style.right = '4px';
        else img.style.right = '10px';
        img.style.top = '10px';
        $(node.getID()).appendChild(img);
      } else if (
        node.getData(GenericHierarchyERD.CAN_COLLAPSE_DATA) == 'true'
      ) {
        var img = $(cel('img'));
        img.setAttribute('title', getMessage('Collapse hierarchy'));
        img.setAttribute('src', 'images/minusNew.gif');
        img.addClassName('collapseImg');
        img.setAttribute('collapseTable', table);
        img.style.position = 'absolute';
        if (isChrome || isSafari) img.style.right = '4px';
        else img.style.right = '10px';
        img.style.top = '10px';
        $(node.getID()).appendChild(img);
      }
    }
    node.setData(GenericHierarchyERD.TABLE_TITLE_MARKUP_DATA, title);
  },
  _setNodeHeaderColorIE: function (node, table) {
    var color = GenericHierarchyERD.COLOR_TABLE;
    if (table == this.params.values['table'])
      color = GenericHierarchyERD.COLOR_TABLE_SELECTED;
    if (document.documentElement.getAttribute('data-doctype') == 'true')
      $(node.getID()).select('.drag_section')[0].style.border = '0px';
    var header = $(node.getID()).select('.drag_section_header')[0];
    var headerParent = header.parentNode;
    var height = header.offsetHeight;
    var width = header.offsetWidth;
    headerParent.removeChild(header);
    if (!this.headerDiv) {
      this.headerDiv = $(cel('div'));
      this.headerDiv.style.borderWidth = '0px';
      this.headerDiv.style.borderStyle = 'none';
      this.headerDiv.style.borderRightStyle = 'solid';
      this.headerDiv.addClassName('headerDivIE');
    }
    var headerDiv = this.headerDiv.cloneNode(false);
    headerDiv.style.borderRightWidth = width + 2 + 'px';
    headerDiv.style.borderRightColor = color;
    header.style.background = 'none';
    header.style.position = 'absolute';
    if (document.documentElement.getAttribute('data-doctype') == 'true') {
      header.style.top = '-1px';
      header.style.left = '-1px';
    } else {
      header.style.top = '1px';
      header.style.left = '1px';
    }
    header.style.width = width + 4 + 'px';
    header.style.height = '100%';
    header.style.borderStyle = 'solid';
    header.style.borderWidth = '2px';
    header.style.borderColor = 'white';
    headerParent.style.height = height + 2 + 'px';
    headerParent.appendChild(headerDiv);
    headerParent.appendChild(header);
    return headerDiv;
  },
  _setNodeHeaderColor: function (node, table) {
    var color = GenericHierarchyERD.COLOR_TABLE;
    if (table == this.params.values['table'])
      color = GenericHierarchyERD.COLOR_TABLE_SELECTED;
    if (document.documentElement.getAttribute('data-doctype') == 'true')
      $(node.getID()).select('.drag_section')[0].style.border = '0px';
    var header = $(node.getID()).select('.drag_section_header')[0];
    var headerParent = header.parentNode;
    var height = header.offsetHeight;
    var width = header.offsetWidth;
    if (!this.headerDiv) {
      this.headerDiv = $(cel('div'));
      this.headerDiv.style.borderWidth = '0px';
      this.headerDiv.style.borderStyle = 'none';
      this.headerDiv.style.borderTopStyle = 'solid';
      this.headerDiv.addClassName('headerDiv');
      if (document.documentElement.getAttribute('data-doctype') == 'true') {
        this.headerDiv.style.top = '1px';
        this.headerDiv.style.left = '1px';
      }
    }
    var headerDiv = this.headerDiv.cloneNode(false);
    headerDiv.style.borderTopWidth = height + 'px';
    headerDiv.style.borderTopColor = color;
    headerDiv.style.width = width + 'px';
    header.style.background = 'none';
    header.style.position = 'absolute';
    if (document.documentElement.getAttribute('data-doctype') == 'true') {
      header.style.top = '-1px';
      header.style.left = '-1px';
    } else {
      header.style.top = '4px';
      header.style.left = '3px';
    }
    header.style.width = width + 'px';
    headerParent.style.height = height + 'px';
    headerParent.removeChild(header);
    headerParent.appendChild(headerDiv);
    headerParent.appendChild(header);
    return null;
  },
  _pad: function (numChars, val, char) {
    while (val.length < numChars) val = char + val;
    return val;
  },
  _getNodesByZIndex: function () {
    var values = [];
    var nodesByZindex = {};
    for (var key in this.nodes) {
      var node = this.nodes[key];
      var index = this._pad(4, '' + $(node.getID()).style.zIndex, '0');
      if (values.indexOf(index) == -1) values[values.length] = index;
      if (!nodesByZindex[index]) nodesByZindex[index] = [];
      nodesByZindex[index].push(node);
    }
    values.sort();
    return { nodesByZindex: nodesByZindex, values: values };
  },
  _setNodeBackgroundColor: function (node, headerElem) {
    var id = node.getID();
    if (isMSIE && !isMSIE6) {
      var dragSection = $('window.' + id);
      dragSection.cellPadding = 0;
      dragSection.cellSpacing = 0;
      var bodySpan = $('body_' + id);
      var bodyCell = $(bodySpan.parentNode);
      if (!this.outerDiv) {
        this.outerDiv = $(cel('div'));
        this.outerDiv.addClassName('outerDiv');
        this.backImg = $(cel('img'));
        this.backImg.src = 'images/white.png';
        this.backImg.addClassName('backImg');
        this.bodyDiv = $(cel('div'));
        this.bodyDiv.addClassName('bodyDiv');
      }
      var outerDiv = this.outerDiv.cloneNode(false);
      var img = this.backImg.cloneNode(false);
      if (document.documentElement.getAttribute('data-doctype') == 'true')
        img.style.top = headerElem.offsetHeight - 7 + 'px';
      else img.style.top = headerElem.offsetHeight - 1 + 'px';
      var bodyDiv = this.bodyDiv.cloneNode(false);
      bodyDiv.style.width = bodyCell.offsetWidth + 'px';
      bodyCell.removeChild(bodySpan);
      outerDiv.appendChild(bodyDiv);
      bodyDiv.appendChild(bodySpan);
      bodyCell.appendChild(img);
      bodyCell.appendChild(outerDiv);
    }
    $(id).addClassName('node_outer_div');
    if (document.documentElement.getAttribute('data-doctype') == 'true') {
      $(id).style.overflow = 'hidden';
      $(id).style.border = '1px solid #CCC';
    }
  },
});
GenericHierarchyERD.COLUMNS_MESSAGE = getMessage('Columns');
GenericHierarchyERD.FOCUS_MESSAGE = getMessage('Focus on this table');
GenericHierarchyERD.LIST_MESSAGE = getMessage('Go to list');
GenericHierarchyERD.DICTIONARY_MESSAGE = getMessage('Go to dictionary');
GenericHierarchyERD.HIDE_THIS_TABLE_MSG = getMessage('Hide this table');
GenericHierarchyERD.SHOW_THIS_TABLE_MSG = getMessage('Show this table');
GenericHierarchyERD.THIS_TABLE_IS_EXTENDED_MSG = getMessage(
  'This table is extended by the selected table'
);
GenericHierarchyERD.THIS_TABLE_EXTENDS_MSG = getMessage(
  'This table extends the selected table'
);
GenericHierarchyERD.THIS_TABLE_IS_REFERENCED = getMessage(
  'This table is referenced by the selected table'
);
GenericHierarchyERD.THIS_TABLE_REFERENCES = getMessage(
  'This table references the selected table'
);
GenericHierarchyERD.PART_OF_EXPANDED_MSG = getMessage(
  'Part of expanded hierarchy'
);
GenericHierarchyERD.COLOR_WHITE = 'white';
GenericHierarchyERD.COLOR_TABLE = '#d6e9fc';
GenericHierarchyERD.COLOR_TABLE_REF = 'tomato';
GenericHierarchyERD.COLOR_TABLE_CHILD = 'blue';
GenericHierarchyERD.COLOR_TABLE_BASE = 'green';
GenericHierarchyERD.COLOR_TABLE_REF_BY = 'orange';
GenericHierarchyERD.COLOR_TABLE_SELECTED = '#ffffcc';
GenericHierarchyERD.COLOR_COLUMN_LOCAL = 'black';
GenericHierarchyERD.COLOR_COLUMN_INHERITED = 'green';
GenericHierarchyERD.COLOR_COLUMN_BLOCK_HEADER = 'black';
GenericHierarchyERD.COLOR_COLUMN_BLOCK_HEADER_BASE = 'green';
GenericHierarchyERD.COLOR_TABLE_EXPANDED = 'purple';
GenericHierarchyERD.REL_EXTENDS = 'extends';
GenericHierarchyERD.REL_EXTENDEDBY = 'extendedby';
GenericHierarchyERD.REL_REFERENCES = 'references';
GenericHierarchyERD.REL_REFERENCEDBY = 'referencedby';
GenericHierarchyERD.TABLE_NAME_DATA = 'table_name';
GenericHierarchyERD.TABLE_TITLE_MARKUP_DATA = 'table_title_markup';
GenericHierarchyERD.TABLE_DISPLAY_NAME_DATA = 'table_display_name';
GenericHierarchyERD.COLUMN_DATA_TABLE_PREFIX = 'columns_table_';
GenericHierarchyERD.COLUMN_DATA_TABLE_NAME_PREFIX = 'columns_table_name_';
GenericHierarchyERD.COLUMN_DATA_PREFIX = 'columns_';
GenericHierarchyERD.CAN_EXPAND_DATA = 'can_expand';
GenericHierarchyERD.CAN_COLLAPSE_DATA = 'can_collapse';
GenericHierarchyERD.REL_EXPANDED_EXTENDS = 'expanded_extends';
GenericHierarchyERD.REL_EXPANDED_EXTENDED_BY = 'expanded_extended_by';
GwtDiagramNode.prototype._onClick = function (me, e) {
  var ev = getEvent(e);
  var elem = Event.element(ev);
  var isRightClick = Event.isRightClick(ev);
  var node = this;
  var isSelected = node.isActive();
  setTimeout(function () {
    if (!isSafari) {
      if (elem.hasClassName('expandImg'))
        document.location.href = params
          .clone()
          .addExpand($(elem).getAttribute('expandTable'))
          .createURL();
      else if (elem.hasClassName('collapseImg'))
        document.location.href = params
          .clone()
          .removeExpand($(elem).getAttribute('collapseTable'))
          .createURL();
    }
    node.fireEvent('beforeclick', node, false);
    node.setSelected(!isSelected);
    node.fireEvent('afterclick', node, false);
  }, 100);
  if (isRightClick) {
    Event.stop(ev);
    return false;
  }
};
if (!isMSIE6) {
  GwtDiagramNode.prototype.dragEnd = function (me, e) {
    this.fireEvent('dragend', this);
    var result = this.diagram._getNodesByZIndex();
    var indexes = result.values;
    var nodesByZindex = result.nodesByZindex;
    for (var i = 0; i < indexes.length; i++) {
      var array = nodesByZindex[indexes[i]];
      for (var j = 0; j < array.length; j++) {
        var n = array[j];
        if (n.getID() != this.getID()) this.diagram._removeAndAddNode(n, false);
      }
    }
    if (isMSIE) this.diagram._removeAndAddNode(this, true);
    else this.diagram._removeAndAddNode(this, false);
  };
}
document.body.onselectstart = function () {
  return false;
};
document.onselectstart = function () {
  return false;
};
