/*! RESOURCE: /scripts/util.table/factories/factory.snTableCommon.js */
angular.module('sn.table').factory('snTableCommon', [
  '$rootScope',
  function ($rootScope) {
    'use strict';
    function linkMode(config) {
      if (config.linkToNewTab) return '_blank';
      return undefined;
    }
    function isLink(row, column, config) {
      if (config.disableLinking) return false;
      if (config.table === 'cmdb_health_config') {
        if (row.applies_to === config.currentTable) {
          return true;
        } else {
          return false;
        }
      }
      if (column._record_link && config.table) return true;
      var field = row[column.name];
      if (angular.isObject(field) && field.display_value && field.link)
        return true;
      return false;
    }
    function getLink(row, column, config) {
      if (column._record_link) {
        return getRowLink(config, row);
      } else {
        var field = row[column.name];
        var parts = field.link.split('/');
        var sliceIndex = 0;
        for (var i = 0; i < parts.length; i++) {
          if (
            parts[i] === 'table' &&
            parts[i - 1] === 'ui' &&
            parts[i - 2] === 'cmdb'
          ) {
            sliceIndex = i + 1;
            break;
          }
        }
        parts.splice(0, sliceIndex);
        if (parts.length >= 2) {
          var table = parts[parts.length - 2];
          var id = parts[parts.length - 1];
          return (
            '/' +
            table +
            '.do?sys_id=' +
            id +
            addStack(config) +
            addGotoUrl(config)
          );
        } else if (parts.length === 1) {
          var newParts = parts[0].split('?');
          var table = newParts[0];
          var queryCondition = newParts[1];
          return (
            '/' +
            table +
            '_list.do?sysparm_query=' +
            queryCondition +
            addStack(config) +
            addGotoUrl(config)
          );
        }
      }
      return '#';
    }
    function addStack(config) {
      return config && config.nameOfStack
        ? '&sysparm_nameofstack=' + config.nameOfStack
        : '';
    }
    function addGotoUrl(config) {
      return config && config.gotoUrl ? config.gotoUrl : '';
    }
    function getLinkDisplayValue(row, column, config, isInsert) {
      var field = row[column.name];
      if (
        config &&
        config.table === 'cmdb_health_config' &&
        typeof field.display_value === 'undefined'
      )
        return field;
      else if (
        field &&
        field.display_value !== undefined &&
        field.display_value !== null &&
        field.display_value !== 'null'
      )
        return field.display_value;
      if (column._record_link) {
        if (field) return field;
        else if (!isInsert) return '(empty)';
      }
      return '';
    }
    function getDisplayValue(row, column, config, isInsert) {
      var field = row[column.name];
      if (isLink(row, column, config))
        return getLinkDisplayValue(row, column, config, isInsert);
      if (field === undefined || field === null) return '';
      if (angular.isObject(field)) {
        if (field.display_value) return field.display_value;
        if (field.name) return field.name;
        if (field.label) return field.label;
      } else if (!angular.isFunction(field)) {
        return field;
      }
      return '';
    }
    function getValue(row, column, config) {
      var field = row[column.name];
      if (field === undefined || field === null) return '';
      if (
        isLink(row, column, config) &&
        (angular.isUndefined(field.useLinkForSort) || field.useLinkForSort)
      )
        return row[column.name].link;
      if (angular.isObject(field)) {
        if (field.sys_id) return field.sys_id;
        if (field.name) return field.name;
        if (field.value) return field.value;
        if (field.label) return field.label;
      } else if (!angular.isFunction(field)) {
        return field;
      }
      return '';
    }
    function getRowLink(config, row) {
      if (angular.isFunction(config.linkFn) && row.sys_id)
        return config.linkFn(row);
      if (config.table && row.sys_id)
        return (
          '/' +
          config.table +
          '.do?sys_id=' +
          row.sys_id +
          addStack(config) +
          addGotoUrl(config)
        );
      return '#';
    }
    function hasSelectColumn(config) {
      if (config.selectable || config.selectSingle) return true;
      else if (config.configurable && config.filterable) return true;
      else if (!config.openable && config.filterable) return true;
      return false;
    }
    function hasOpenColumn(config) {
      if (config.openable) return true;
      else if (config.configurable && config.filterable) return true;
      else if (!config.selectable && config.configurable) return true;
      return false;
    }
    function isOpenable(config) {
      return config.openable;
    }
    function isSelectable(config) {
      return config.selectable;
    }
    function showRadioButton(config) {
      return config.selectSingle;
    }
    function toggleSelection(rows, config, row) {
      if (allSelected(rows)) config.allSelected = true;
      else config.allSelected = false;
      updateSelection(rows, config);
    }
    function toggleRadioSelection(rows, config, row) {
      if (config.selection && config.selection.length > 0) {
        for (var i = 0; i < config.selection.length; i++) {
          config.selection[i]._selected = false;
        }
      }
      config.selection = [];
      config.selection.push(row);
    }
    function toggleAll(rows, config) {
      if (config.allSelected) {
        selectAll(rows);
      } else {
        deselectAll(rows);
      }
      updateSelection(rows, config);
    }
    function updateSelection(rows, config) {
      config.selection = rows.filter(function (row) {
        return row._selected;
      });
    }
    function updateRadioSelection(rows, config) {
      if (config.selection && config.selection.length === 1) {
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].sys_id === config.selection[0].sys_id) {
            rows[i]._selected = true;
            break;
          }
        }
      }
    }
    function updateAllSelected(config) {
      if (allSelected(config.visibleRows)) config.allSelected = true;
      else config.allSelected = false;
    }
    function updateVisibleRows(rows, groups, config) {
      config.visibleRows = [];
      if (groups.length > 0) {
        for (var i = 0; i < groups.length; i++) {
          if (groups[i].expanded) {
            for (var j = 0; j < groups[i]._rows.length; j++)
              config.visibleRows.push(groups[i]._rows[j]);
          }
        }
      } else {
        for (var i = 0; i < rows.length; i++) config.visibleRows.push(rows[i]);
      }
      $rootScope.$broadcast('sn_table_updated_visible_rows');
    }
    function pageMax(config) {
      if (config.targetRow + config.rowsPerPage - 1 > config.availableRows)
        return config.availableRows;
      return config.targetRow + config.rowsPerPage - 1;
    }
    function paginationNeeded(config) {
      if (config.availableRows <= config.rowsPerPage) return false;
      else return true;
    }
    function boundTargetRow(config) {
      if (config.targetRow > config.availableRows)
        config.targetRow = config.availableRows - config.rowsPerPage + 1;
      if (config.targetRow < 1) config.targetRow = 1;
    }
    function selectAll(rows) {
      for (var key in rows) rows[key]._selected = true;
    }
    function deselectAll(rows) {
      for (var key in rows) rows[key]._selected = false;
    }
    function allSelected(rows) {
      for (var key in rows) if (!rows[key]._selected) return false;
      return true;
    }
    function getVisibleGroupRows(groups) {
      var rows = [];
      for (var i = 0; i < groups.length; i++)
        for (var j = 0; j < groups[i]._rows.length; j++)
          rows.push(groups[i]._rows[j]);
      return rows;
    }
    function getColumnList(columns, excludeSysId) {
      var list = '';
      for (var i = 0; i < columns.length; i++) list += columns[i].name + ',';
      return excludeSysId
        ? list.substring(0, list.length - 1)
        : list + 'sys_id';
    }
    function getOrderByQuery(config) {
      var orderBy = '';
      if (config.sortBy !== undefined && config.sort !== undefined) {
        if (config.sort === 'ascending') orderBy = '^ORDERBY' + config.sortBy;
        else if (config.sort === 'descending')
          orderBy = '^ORDERBYDESC' + config.sortBy;
      }
      return orderBy;
    }
    function getFilterByQuery(filter) {
      var filterBy = '';
      if (filter) {
        if (filter.indexOf('=') === 0 && filter.length > 1) {
          filterBy = '=' + filter.substring(1, filter.length);
        } else if (filter.indexOf('*') === 0 && filter.length > 1) {
          filterBy = 'LIKE' + filter.substring(1, filter.length);
        } else if (filter.indexOf('%') === 0 && filter.length > 1) {
          filterBy = 'ENDSWITH' + filter.substring(1, filter.length);
        } else {
          filterBy = 'STARTSWITH' + filter;
        }
      }
      return filterBy;
    }
    function getCellTemplateName(column, config) {
      var override = undefined;
      if (config && config.columnTemplates)
        override = config.columnTemplates[column.name];
      var template = override ? override : column.template;
      return template;
    }
    function getRowClasses(config) {
      var classes = {};
      var name = config.rowTemplate;
      if (hasCustomRowTemplate(config)) {
        classes['custom'] = true;
        classes[name] = true;
      }
      return classes;
    }
    function hasCustomRowTemplate(config) {
      if (
        config.rowTemplate !== undefined &&
        typeof config.rowTemplate === 'string'
      )
        return true;
      return false;
    }
    function consumeEvent(callback) {
      return function () {
        var event = arguments.length > 0 ? arguments[0] : undefined;
        if (event && event.stopPropagation) event.stopPropagation();
        if (callback) callback.apply(this, arguments);
      };
    }
    function allowEvent(config, allowGeneral, source) {
      if (!config) return false;
      if (config === source) return true;
      if (source === undefined && allowGeneral) return true;
      return false;
    }
    return {
      linkMode: linkMode,
      isLink: isLink,
      getLink: getLink,
      getLinkDisplayValue: getLinkDisplayValue,
      getDisplayValue: getDisplayValue,
      getValue: getValue,
      getRowLink: getRowLink,
      hasSelectColumn: hasSelectColumn,
      hasOpenColumn: hasOpenColumn,
      isSelectable: isSelectable,
      showRadioButton: showRadioButton,
      isOpenable: isOpenable,
      toggleSelection: toggleSelection,
      toggleRadioSelection: toggleRadioSelection,
      toggleAll: toggleAll,
      updateSelection: updateSelection,
      updateRadioSelection: updateRadioSelection,
      updateVisibleRows: updateVisibleRows,
      updateAllSelected: updateAllSelected,
      pageMax: pageMax,
      paginationNeeded: paginationNeeded,
      boundTargetRow: boundTargetRow,
      selectAll: selectAll,
      deselectAll: deselectAll,
      allSelected: allSelected,
      getVisibleGroupRows: getVisibleGroupRows,
      getColumnList: getColumnList,
      getOrderByQuery: getOrderByQuery,
      getFilterByQuery: getFilterByQuery,
      getCellTemplateName: getCellTemplateName,
      getRowClasses: getRowClasses,
      hasCustomRowTemplate: hasCustomRowTemplate,
      consumeEvent: consumeEvent,
      allowEvent: allowEvent,
    };
  },
]);