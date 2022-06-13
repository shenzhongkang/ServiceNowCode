/*! RESOURCE: /scripts/app.ngbsm/factory.bsmUserHistory.js */
angular.module('sn.ngbsm').factory('bsmUserHistory', function (bsmRESTService) {
  'use strict';
  return {
    load: function () {
      return bsmRESTService.getLastMap().then(function (response) {
        response = JSON.parse(response);
        return response;
      });
    },
    save: function (table, id) {
      bsmRESTService.saveLastMap(table, id);
    },
  };
});