/*! RESOURCE: /scripts/util.table/filters/filter.snTableRowFilter.js */
angular.module('sn.table').filter('snTableRowFilter', [
  'snTableCommon',
  function (snTableCommon) {
    var reg = /[-[\]{}()*+?.,\\^$|#\s]/g;
    function isNil(field) {
      return field === undefined || field === null || field === '';
    }
    return function (input, config, columns) {
      var array = [];
      if (input) {
        for (var i = 0; i < input.length; i++) {
          array.push(input[i]);
        }
      }
      if (!config.table) {
        var filterColumns = columns.filter(function (column) {
          return (
            column.active &&
            column.filter !== undefined &&
            column.filter !== null &&
            column.filter !== ''
          );
        });
        filterColumns.forEach(function (column) {
          var filter = '';
          if (column.filter.indexOf('=') === 0 && column.filter.length > 1) {
            filter = column.filter.substring(1, column.filter.length);
            array = array.filter(function (element) {
              var label = String(
                snTableCommon.getDisplayValue(element, column, config)
              ).replace(reg, '\\$&');
              var exp = new RegExp(label, 'i');
              return exp.test(filter);
            });
          } else if (
            column.filter.indexOf('*') === 0 &&
            column.filter.length >= 1
          ) {
            filter = column.filter.substring(1, column.filter.length);
            array = array.filter(function (element) {
              var exp = new RegExp(filter.replace(reg, '\\$&'), 'i');
              return (
                String(
                  snTableCommon.getDisplayValue(element, column, config)
                ).search(exp) !== -1
              );
            });
          } else if (
            column.filter.indexOf('%') === 0 &&
            column.filter.length > 1
          ) {
            filter = column.filter.substring(1, column.filter.length);
            array = array.filter(function (element) {
              var exp = new RegExp(filter.replace(reg, '\\$&') + '$', 'i');
              return exp.test(
                String(snTableCommon.getDisplayValue(element, column, config))
              );
            });
          } else {
            filter = column.filter;
            array = array.filter(function (element) {
              var exp = new RegExp(filter.replace(reg, '\\$&'), 'i');
              return (
                String(
                  snTableCommon.getDisplayValue(element, column, config)
                ).search(exp) === 0
              );
            });
          }
        });
      }
      if (!config.table) {
        if (config.sortBy !== undefined && config.sort !== undefined) {
          var useValueForSort =
            angular.isDefined(config.sortByValue) &&
            config.sortByValue.indexOf(config.sortBy) > -1;
          if (config.sort === 'ascending') {
            array.sort(function (a, b) {
              var sortColumn = {
                name: config.sortBy,
              };
              if (useValueForSort) {
                a = snTableCommon.getValue(a, sortColumn, config);
                b = snTableCommon.getValue(b, sortColumn, config);
              } else {
                a = snTableCommon.getDisplayValue(a, sortColumn, config);
                b = snTableCommon.getDisplayValue(b, sortColumn, config);
              }
              if (isNil(a)) return Number.NEGATIVE_INFINITY;
              if (typeof a === 'string' || typeof b === 'string')
                return String(a).localeCompare(String(b));
              return a - b;
            });
          } else if (config.sort === 'descending') {
            array.sort(function (a, b) {
              var sortColumn = {
                name: config.sortBy,
              };
              if (useValueForSort) {
                a = snTableCommon.getValue(a, sortColumn, config);
                b = snTableCommon.getValue(b, sortColumn, config);
              } else {
                a = snTableCommon.getDisplayValue(a, sortColumn, config);
                b = snTableCommon.getDisplayValue(b, sortColumn, config);
              }
              if (isNil(a)) return Number.POSITIVE_INFINITY;
              if (typeof a === 'string' || typeof b === 'string')
                return String(b).localeCompare(String(a));
              return b - a;
            });
          }
        }
      }
      if (!config.table) {
        config.availableRows = array.length;
        snTableCommon.boundTargetRow(config);
        if (!config.groupBy)
          array = array.slice(
            config.targetRow - 1,
            config.targetRow - 1 + config.rowsPerPage
          );
      }
      if (!config.selectSingle) snTableCommon.updateSelection(array, config);
      else snTableCommon.updateRadioSelection(array, config);
      return array;
    };
  },
]);