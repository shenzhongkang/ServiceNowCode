/*! RESOURCE: /scripts/app.ngbsm/factory.bsmNodeTransform.js */
angular.module('sn.ngbsm').factory('bsmNodeTransform', function () {
  'use strict';
  return {
    flipAcrossXAxis: function (root) {
      root.y *= -1;
      if (root.children) {
        for (var i = 0; i < root.children.length; i++)
          this.flipAcrossXAxis(root.children[i]);
      }
    },
    horizontalize: function (root) {
      var temp = root.x;
      root.x = root.y;
      root.y = temp;
      if (root.children) {
        for (var i = 0; i < root.children.length; i++)
          this.horizontalize(root.children[i]);
      }
    },
    radialize: function (graph, root) {
      root.theta = root.x * 2 * Math.PI;
      root.r = root.y * 192 * graph.maxDegree;
      root.x = Math.cos(root.theta) * root.r;
      root.y = Math.sin(root.theta) * root.r;
      if (root.children) {
        for (var i = 0; i < root.children.length; i++)
          this.radialize(graph, root.children[i]);
      }
    },
    expand: function (nodes, factor) {
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].x = nodes[i].x * factor;
        nodes[i].y = nodes[i].y * factor;
      }
    },
  };
});