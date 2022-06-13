/*! RESOURCE: /scripts/util.table/filters/filter.snTableColumnFilter.js */
angular.module('sn.table').filter('snTableColumnFilter', function () {
  return function (input) {
    var array = [];
    for (var i = 0; i < input.length; i++) {
      if (input[i].active === true) array.push(input[i]);
    }
    array.sort(function (a, b) {
      if (
        a.order === undefined ||
        a.order === null ||
        b.order === undefined ||
        b.order === null
      )
        return Number.POSITIVE_INFINITY;
      return a.order - b.order;
    });
    for (var i = 0; i < array.length; i++) {
      array[i]._record_link = false;
    }
    for (var i = 0; i < array.length; i++) {
      if (!array[i].is_reference) {
        array[i]._record_link = true;
        break;
      }
    }
    return array;
  };
});