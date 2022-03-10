/*! RESOURCE: /scripts/classes/syntax_editor5/references/simpleList.js */
var SimpleList = (function () {
  var SR_ASCENDING_TEXT = getMessage('Sort in ascending order');
  var SR_DESCENDING_TEXT = getMessage('Sort in descending order');
  var SORT_ASCENDING_CLASS = 'icon-vcr-up';
  var SORT_DESCENDING_CLASS = 'icon-vcr-down';
  var DEFAULT_TABLE_CAPTION = getMessage('Simple read only table');
  var NO_RECORDS_CLASS = 'simple-list-no-records';
  var HEADER = 'header';
  var BODY = 'body';
  function SimpleList(listData, parentElem) {
    this.listData = listData;
    this.tableElem = '';
    this.sortStatus = {
      column: getDefaultSort(listData),
      order: 1,
    };
    $j(parentElem).append(getSimpleList.call(this));
    addListeners.call(this);
  }
  SimpleList.prototype.updateListBody = updateListBody;
  SimpleList.prototype.updateColumnHeader = updateColumnHeader;
  SimpleList.prototype.sortAndUpdateStatus = sortAndUpdateStatus;
  SimpleList.prototype.sortList = sortList;
  function getSimpleList() {
    var listData = this.listData;
    this.sortList(this.sortStatus.column, this.sortStatus.order);
    var caption = listData.caption || DEFAULT_TABLE_CAPTION;
    return (
      '<table class="table list_table table-hover" id="' +
      listData.tableId +
      '" > \
  <caption class="sr-only">' +
      caption +
      '</caption>' +
      getListHeader(listData) +
      getListBody(listData) +
      '</table>'
    );
  }
  function getListHeader(listData) {
    var infoHeaderCell = getInfoCell(listData.infoColumn, HEADER);
    var headerRow = listData.header.reduce(function (combinedHeader, header) {
      var isSort = header.defaultSort ? 'text-primary' : '';
      var sortDir = header.defaultSort ? ' sort_dir="ASC" ' : ' ';
      var isHide = header.defaultSort ? '' : 'hide';
      var srText = header.defaultSort ? SR_DESCENDING_TEXT : SR_ASCENDING_TEXT;
      var ColumnClassName = getColumnClassName(header);
      return (
        combinedHeader +
        '<th data-key="' +
        header.columnName +
        '" class="table-column-header ellipsis ' +
        ColumnClassName +
        '" ' +
        sortDir +
        ' > \
  <a tabIndex="0" id="initailFocusLink" class="sort-columns ' +
        isSort +
        '">' +
        header.displayValue +
        '<span class="sr-only label_sort_order">' +
        srText +
        '</span> \
  </a> \
  <span class="col-change-sort simple-list-sort-icon icon-vcr-up ' +
        isHide +
        '"></span> \
  </th>'
      );
    }, infoHeaderCell);
    return '<thead > \
  <tr > ' + headerRow + '</tr> \
  </thead>';
  }
  function getListBody(listData) {
    var tBodyClassName =
      listData.body && listData.body.length ? '' : NO_RECORDS_CLASS;
    return (
      '<tbody id="' +
      listData.tbodyId +
      '" class="' +
      tBodyClassName +
      '"  >' +
      getListBodyContents(listData) +
      '</tbody>'
    );
  }
  function getListBodyContents(listData) {
    var body = listData.body;
    var tbodyHtml = '';
    body.forEach(function (row, index) {
      var rowClass = 'list_' + (index % 2 ? 'even' : 'odd');
      tbodyHtml += getBodyRow(listData, row, rowClass);
    });
    return tbodyHtml;
  }
  function getInfoCell(infoColumn, cellType) {
    if (!infoColumn) return '';
    var infoCell = '';
    var infoClassName = infoColumn.className || 'simple-list-info-column';
    if (cellType === BODY) {
      var title = infoColumn.displayValue || 'Preview record';
      infoCell =
        '<td class="simple-list-info-row ' +
        infoClassName +
        ' " > \
  <button type="button" class="simple-list-info-button btn btn-icon table-btn-lg icon-info" title="' +
        title +
        '" data-toggle="popover"></button> \
  </td>';
    } else if (cellType === HEADER)
      infoCell = '<th class="' + infoClassName + '"></th>';
    return infoCell;
  }
  function getBodyRow(listData, row, rowClass) {
    var infoBodyCell = getInfoCell(listData.infoColumn, BODY);
    var header = listData.header;
    var bodyRow = '';
    header.forEach(function (column) {
      var isLink = column.isLink
        ? ' tabIndex="0" class="simple-list-link" '
        : '';
      var columnClassName = getColumnClassName(column);
      bodyRow +=
        '<td class="ellipsis ' +
        columnClassName +
        '"> \
  <span ' +
        isLink +
        ' >' +
        row[column.columnName] +
        '</span> \
  </td>';
    });
    var rowAttrs = ' ';
    if (listData.rowAttrs) {
      listData.rowAttrs.forEach(function (attr) {
        rowAttrs += 'data-' + attr + '="' + row[attr] + '" ';
      });
    }
    return (
      '<tr class= "list_row ' +
      rowClass +
      '"' +
      rowAttrs +
      ' " >' +
      infoBodyCell +
      bodyRow +
      '</tr>'
    );
  }
  function updateListBody(updatedBody) {
    var listData = this.listData;
    if (updatedBody) listData.body = updatedBody;
    var tBodyElement = $j('#' + listData.tbodyId);
    if (listData.body && listData.body.length)
      tBodyElement.removeClass(NO_RECORDS_CLASS);
    else {
      tBodyElement.addClass(NO_RECORDS_CLASS);
      return;
    }
    this.sortList(this.sortStatus.column, this.sortStatus.order);
    tBodyElement.html(getListBodyContents(listData));
  }
  function addListeners() {
    var sortStatus = this.sortStatus;
    var tableId = this.listData.tableId;
    this.tableElem = $j('#' + tableId);
    this.tableElem
      .find('.table-column-header')
      .children()
      .on(
        'click',
        function (event) {
          var prevSortStatus = Object.assign({}, sortStatus);
          var key = $j(event.target).parent().data('key');
          this.sortAndUpdateStatus(key);
          this.updateListBody();
          this.updateColumnHeader(prevSortStatus);
        }.bind(this)
      );
  }
  function sortAndUpdateStatus(key) {
    var sortStatus = this.sortStatus;
    if (sortStatus.column === key) {
      sortStatus.order = -1 * sortStatus.order;
    } else {
      sortStatus.order = 1;
      sortStatus.column = key;
    }
    this.sortList(key, sortStatus.order);
  }
  function updateColumnHeader(prevSortStatus) {
    var sortStatus = this.sortStatus;
    var currentRow = this.tableElem.find(
      'th[data-key="' + sortStatus.column + '"]'
    );
    if (prevSortStatus.column === sortStatus.column) {
      var sortIcon = currentRow.children('span');
      var srSortElement = currentRow.find('a > span');
      if (sortStatus.order === 1) {
        sortIcon
          .removeClass(SORT_DESCENDING_CLASS)
          .addClass(SORT_ASCENDING_CLASS);
        srSortElement.text(SR_DESCENDING_TEXT);
      } else {
        sortIcon
          .removeClass(SORT_ASCENDING_CLASS)
          .addClass(SORT_DESCENDING_CLASS);
        srSortElement.text(SR_ASCENDING_TEXT);
      }
    } else {
      var prevRow = this.tableElem.find(
        'th[data-key="' + prevSortStatus.column + '"]'
      );
      prevRow.removeAttr('sort_dir');
      if (sortStatus.order === 1) currentRow.attr('sort_dir', 'ASC');
      else currentRow.attr('sort_dir', 'DESC');
      $j(prevRow.children()[1])
        .addClass('hide')
        .removeClass(SORT_DESCENDING_CLASS);
      prevRow.find('a > span').text(SR_ASCENDING_TEXT);
      $j(currentRow.children()[1])
        .addClass(SORT_ASCENDING_CLASS)
        .removeClass('hide');
      currentRow.find('a > span').text(SR_DESCENDING_TEXT);
    }
  }
  function sortList(key, order) {
    var bodyData = this.listData.body;
    bodyData.sort(function (a, b) {
      if (!a[key]) return order;
      if (!b[key]) return -1 * order;
      if (a[key].toUpperCase() < b[key].toUpperCase()) return -1 * order;
      if (a[key].toUpperCase() > b[key].toUpperCase()) return order;
      return 0;
    });
  }
  function getDefaultSort(listData) {
    var column = listData.header.find(function (column) {
      return column.defaultSort === true;
    });
    return column.columnName;
  }
  function getColumnClassName(column) {
    var className = column.className || 'simple-list-' + column.columnName;
    return className;
  }
  return SimpleList;
})();
