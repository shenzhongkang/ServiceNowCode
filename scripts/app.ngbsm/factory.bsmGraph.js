/*! RESOURCE: /scripts/app.ngbsm/factory.bsmGraph.js */
angular.module('sn.ngbsm').factory('bsmGraph', function ($rootScope, i18n) {
  'use strict';
  var history = [];
  var graph = null;
  return {
    current: function () {
      return graph;
    },
    push: function (newGraph) {
      if (graph !== null && graph !== undefined) history.push(graph);
      graph = newGraph;
    },
    pop: function () {
      if (history.length > 0) {
        graph = history.pop();
        $rootScope.$broadcast('ngbsm.previous_view_loaded');
      } else {
        $rootScope.$broadcast('ngbsm.error', {
          error: i18n.getMessage('dependencies.ngbsm.map.error.no.previous'),
        });
      }
    },
  };
});