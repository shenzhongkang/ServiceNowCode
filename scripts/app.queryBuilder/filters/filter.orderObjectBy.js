/*! RESOURCE: /scripts/app.queryBuilder/filters/filter.orderObjectBy.js */
angular.module('sn.queryBuilder').filter('orderObjectBy', function () {
  return function (items, prop, reverse) {
    var orderedBy = [];
    if (prop === 'raw_updated_on' || prop === 'raw_created_on') reverse = true;
    angular.forEach(items, function (item) {
      orderedBy.push(item);
    });
    orderedBy.sort(function (a, b) {
      if (prop === 'name' || prop === 'label') {
        if (
          typeof a[prop] === 'object' &&
          typeof b[prop] === 'object' &&
          angular.isDefined(a[prop].display_value) &&
          angular.isDefined(b[prop].display_value)
        ) {
          var aTest = a[prop].display_value.toLowerCase();
          var bTest = b[prop].display_value.toLowerCase();
        } else {
          var aTest = a[prop].toLowerCase();
          var bTest = b[prop].toLowerCase();
        }
        return aTest > bTest ? 1 : -1;
      }
      return a[prop] > b[prop] ? 1 : -1;
    });
    if (reverse) orderedBy.reverse();
    return orderedBy;
  };
});
