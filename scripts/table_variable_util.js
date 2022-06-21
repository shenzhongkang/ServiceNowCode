/*! RESOURCE: /scripts/table_variable_util.js */
function getDuplicateFields(
  uniqueColumnNames,
  parentGridData,
  existingRowData,
  currentRowData
) {
  var uniqueColumnData = new Map();
  var duplicateUniqueFields = new Set();
  var isExecutedFromScript = true;
  var duplicateUniqueFieldsArray = [];
  if (currentRowData) isExecutedFromScript = false;
  for (var name in uniqueColumnNames) {
    uniqueColumnData.set(name, new Map());
  }
  if (existingRowData && Object.keys(existingRowData).length > 0) {
    for (var columnName in uniqueColumnNames) {
      var currentColumnData = currentRowData[columnName];
      var existingColumnData = existingRowData[columnName];
      if (
        currentColumnData &&
        existingColumnData &&
        currentColumnData.toLowerCase() === existingColumnData.toLowerCase()
      ) {
        delete uniqueColumnNames[columnName];
      }
    }
  }
  if (Object.keys(uniqueColumnNames).length > 0) {
    if (Array.isArray(parentGridData) && parentGridData.length > 0) {
      for (var i = 0; i < parentGridData.length; i++) {
        var row = parentGridData[i];
        if (row !== null && typeof row === 'object') {
          for (var uniqueColumnName in uniqueColumnNames) {
            var columnValue = row[uniqueColumnName];
            if (columnValue) {
              columnValue = columnValue.toLowerCase();
              if (!uniqueColumnData.get(uniqueColumnName).has(columnValue))
                uniqueColumnData.get(uniqueColumnName).set(columnValue, true);
              else if (isExecutedFromScript)
                duplicateUniqueFields.add(uniqueColumnNames[uniqueColumnName]);
            }
          }
        }
      }
    }
    if (!isExecutedFromScript) {
      for (var uniqueColumnName in uniqueColumnNames) {
        var currentColumnData = currentRowData[uniqueColumnName];
        if (
          currentColumnData &&
          uniqueColumnData
            .get(uniqueColumnName)
            .has(currentColumnData.toLowerCase())
        )
          duplicateUniqueFields.add(uniqueColumnNames[uniqueColumnName]);
      }
    }
  }
  if (duplicateUniqueFields) {
    duplicateUniqueFields.forEach(function (element) {
      duplicateUniqueFieldsArray.push(element);
    });
  }
  return duplicateUniqueFieldsArray;
}
if (typeof Object.assign !== 'function') {
  Object.defineProperty(Object, 'assign', {
    value: function assign(target, varArgs) {
      'use strict';
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }
      var to = Object(target);
      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];
        if (nextSource !== null && nextSource !== undefined) {
          for (var nextKey in nextSource) {
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true,
  });
}
