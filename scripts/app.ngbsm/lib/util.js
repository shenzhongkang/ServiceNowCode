/*! RESOURCE: /scripts/app.ngbsm/lib/util.js */
('use strict');
angular.module('angular-abortable-requests').factory('Util', function () {
  return {
    interpolate: function (string, params) {
      var result = [],
        segmentMatch,
        key;
      angular.forEach((string || '').split(':'), function (segment, i) {
        if (i === 0) {
          result.push(segment);
        } else {
          segmentMatch = segment.match(/(\w+)(.*)/);
          key = segmentMatch[1];
          result.push(params[key]);
          result.push(segmentMatch[2] || '');
          delete params[key];
        }
      });
      return result.join('');
    },
    disuniteHttp: function (string) {
      var iDomain = string.indexOf('://'),
        uri;
      uri = {
        protocol: string.substring(0, iDomain) + '://',
        url: string.substring(iDomain + 3),
      };
      return uri;
    },
    removeFromArray: function (arr, items) {
      var removedItems = [];
      array.getArray(items).forEach(function (item) {
        var index = arr.indexOf(item);
        if (index !== -1) {
          arr.splice(index, 1);
          removedItems.push(item);
        }
      });
      return removedItems;
    },
  };
});