/*! RESOURCE: /scripts/util.table/filters/filter.snTableGroupFilter.js */
angular.module('sn.table').filter('snTableGroupFilter', [
  'snTableCommon',
  function (snTableCommon) {
    var lastGroupColumn = null;
    var lastGroupMap = {};
    return function (input, config, columns) {
      if (!config.groupBy) return [];
      var column = {
        name: config.groupBy,
        label: config.groupBy,
      };
      for (var i = 0; i < columns.length; i++) {
        if (columns[i].name === config.groupBy) {
          column = columns[i];
          break;
        }
      }
      var lastMap = {};
      if (lastGroupColumn && lastGroupColumn === config.groupBy)
        lastMap = lastGroupMap;
      var map = {};
      for (var i = 0; i < input.length; i++) {
        var lastGroup =
          lastMap[snTableCommon.getValue(input[i], column, config)];
        if (map[snTableCommon.getValue(input[i], column, config)])
          map[snTableCommon.getValue(input[i], column, config)].rows.push(
            input[i]
          );
        else {
          map[snTableCommon.getValue(input[i], column, config)] = {
            rows: [input[i]],
            label: snTableCommon.getDisplayValue(input[i], column, config),
            column: column,
            expanded: lastGroup && lastGroup.expanded ? true : false,
          };
        }
      }
      lastGroupColumn = config.groupBy;
      lastGroupMap = map;
      var groups = [];
      for (var key in map) groups.push(map[key]);
      for (var i = 0; i < groups.length; i++)
        groups[i]._rows = groups[i].rows.slice(0, config.rowsPerPage);
      groups.sort(function (a, b) {
        return a.label == b.label ? 0 : a.label < b.label ? -1 : 1;
      });
      return groups;
    };
  },
]);