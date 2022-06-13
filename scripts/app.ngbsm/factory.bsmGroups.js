/*! RESOURCE: /scripts/app.ngbsm/factory.bsmGroups.js */
angular.module('sn.ngbsm').factory('bsmGroups', function () {
  'use strict';
  var groups = [];
  return {
    groups: function () {
      return groups;
    },
    create: function (nodes) {
      if (nodes.length > 1)
        groups.push({
          nodes: nodes,
        });
      this.update();
    },
    update: function () {
      var dx = 48;
      var dy = 32;
      for (var i = 0; i < groups.length; i++) {
        var minX = Number.MAX_VALUE;
        var maxX = -Number.MAX_VALUE;
        var minY = Number.MAX_VALUE;
        var maxY = -Number.MAX_VALUE;
        var n = groups[i].nodes;
        for (var j = 0; j < n.length; j++) {
          if (n[j].x < minX) minX = n[j].x;
          if (n[j].x > maxX) maxX = n[j].x;
          if (n[j].y < minY) minY = n[j].y;
          if (n[j].y > maxY) maxY = n[j].y;
        }
        groups[i].x = minX - dx;
        groups[i].y = minY - dy;
        groups[i].w = maxX - minX + 2 * dx;
        groups[i].h = maxY - minY + 2 * dy;
      }
    },
  };
});