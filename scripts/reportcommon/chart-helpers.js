/*! RESOURCE: /scripts/reportcommon/chart-helpers.js */
var chartHelpers = window.chartHelpers || {};
chartHelpers.objectSize = function objectSize(obj) {
  var size = 0;
  var key;
  for (key in obj) if (obj.hasOwnProperty(key)) size++;
  return size;
};
chartHelpers.compareByProperty = function compareByProperty(property, desc) {
  return function propertyCompare(a, b) {
    if (a[property] > b[property]) return desc ? -1 : 1;
    if (a[property] < b[property]) return desc ? 1 : -1;
    return 0;
  };
};
chartHelpers.evaluateColorRules = function evaluateColorRules(score, rules) {
  if (typeof score !== 'undefined' && score !== null && score !== '' && rules) {
    rules.sort(chartHelpers.compareByProperty('ruleOrder', true));
    var operate = {
      '<': function lessThan(x, y) {
        return x < y;
      },
      '<=': function lessThanEqual(x, y) {
        return x <= y;
      },
      '=': function Equal(x, y) {
        return x === y;
      },
      '>=': function greaterThanEqual(x, y) {
        return x >= y;
      },
      '>': function greaterThan(x, y) {
        return x > y;
      },
      between: function between(x, y, z) {
        return x > y && x < z;
      },
    };
    for (var i = 0; i < rules.length; i++)
      if (operate[rules[i].operator](score, rules[i].value1, rules[i].value2))
        return { color: rules[i].color, bgColor: rules[i].bgColor };
  }
  return '';
};
chartHelpers.hexEncode = function (utf8String) {
  var hex;
  var i;
  var result = '';
  for (i = 0; i < utf8String.length; i++) {
    hex = utf8String.charCodeAt(i).toString(16);
    result += '\\u' + ('000' + hex).slice(-4);
  }
  return result;
};
