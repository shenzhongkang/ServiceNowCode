/*! RESOURCE: /scripts/app.ngbsm/factory.bsmLinkLayout.js */
angular.module('sn.ngbsm').factory('bsmLinkLayout', function (CONFIG) {
  'use strict';
  function createEmptyLine() {
    return [
      {
        x: 0,
        y: 0,
      },
      {
        x: 0,
        y: 0,
      },
      {
        x: 0,
        y: 0,
      },
      {
        x: 0,
        y: 0,
      },
    ];
  }
  function calculateHorizontalCurvedLine(source, target, line) {
    var dx = (target.x - source.x) * CONFIG.LINK_CURVE_WEIGHT;
    line[0].x = source.x;
    line[0].y = source.y;
    line[1].x = source.x + dx;
    line[1].y = source.y;
    line[2].x = target.x - dx;
    line[2].y = target.y;
    line[3].x = target.x;
    line[3].y = target.y;
  }
  function calculateVerticalCurvedLine(source, target, line) {
    var dy = (target.y - source.y) * CONFIG.LINK_CURVE_WEIGHT;
    line[0].x = source.x;
    line[0].y = source.y;
    line[1].x = source.x;
    line[1].y = source.y + dy;
    line[2].x = target.x;
    line[2].y = target.y - dy;
    line[3].x = target.x;
    line[3].y = target.y;
  }
  function calculateStraightLine(source, target, line) {
    line[0].x = source.x;
    line[0].y = source.y;
    line[1].x = source.x;
    line[1].y = source.y;
    line[2].x = target.x;
    line[2].y = target.y;
    line[3].x = target.x;
    line[3].y = target.y;
  }
  function calculateCurveWithOffsets(source, target, line, offsets) {
    line[0].x = source.x;
    line[0].y = source.y;
    line[1].x = source.x - offsets.source.x;
    line[1].y = source.y - offsets.source.y;
    line[2].x = target.x - offsets.target.x;
    line[2].y = target.y - offsets.target.y;
    line[3].x = target.x;
    line[3].y = target.y;
  }
  function calculateRadialOffsets(source, target) {
    var offsets = {
      source: {
        x:
          source.r > 0.05
            ? (source.x / source.r) * CONFIG.LINK_RADIAL_CURVE_WEIGHT
            : 0,
        y:
          source.r > 0.05
            ? (source.y / source.r) * CONFIG.LINK_RADIAL_CURVE_WEIGHT
            : 0,
      },
      target: {
        x:
          target.r > 0.05
            ? (target.x / target.r) * CONFIG.LINK_RADIAL_CURVE_WEIGHT
            : 0,
        y:
          target.r > 0.05
            ? (target.y / target.r) * CONFIG.LINK_RADIAL_CURVE_WEIGHT
            : 0,
      },
    };
    if (target.r < source.r) {
      var distance = Math.abs(target.r - source.r);
      if (distance > CONFIG.LINK_RADIAL_CONCAVITY_FLIP_MIN) {
        var mult = interpolateLinearly(
          [
            CONFIG.LINK_RADIAL_CONCAVITY_FLIP_MIN,
            CONFIG.LINK_RADIAL_CONCAVITY_FLIP_MAX,
          ],
          [1, -1],
          distance
        );
        mult = clamp(mult, -1, 1);
        offsets.target.x *= mult;
        offsets.target.y *= mult;
      }
    } else if (target.r > source.r) {
      var distance = Math.abs(target.r - source.r);
      if (distance > CONFIG.LINK_RADIAL_CONCAVITY_FLIP_MIN) {
        var mult = interpolateLinearly(
          [
            CONFIG.LINK_RADIAL_CONCAVITY_FLIP_MIN,
            CONFIG.LINK_RADIAL_CONCAVITY_FLIP_MAX,
          ],
          [1, -1],
          distance
        );
        mult = clamp(mult, -1, 1);
        offsets.source.x *= mult;
        offsets.source.y *= mult;
      }
    }
    return offsets;
  }
  function interpolateLinearly(originalRange, newRange, originalValue) {
    return (
      ((originalValue - originalRange[0]) * (newRange[1] - newRange[0])) /
        (originalRange[1] - originalRange[0]) +
      newRange[0]
    );
  }
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  return {
    recalculateLink: function (graph, link) {
      var source = graph.nodes[link.source];
      var target = graph.nodes[link.target];
      if (link.line === undefined) link.line = createEmptyLine();
      var line = link.line;
      if (!graph.useLines && CONFIG.PERFORMANCE_ALLOW_CURVES) {
        if (graph.mode === 'horizontal')
          calculateHorizontalCurvedLine(source, target, line);
        else if (graph.mode === 'vertical')
          calculateVerticalCurvedLine(source, target, line);
        else if (graph.mode === 'radial')
          calculateCurveWithOffsets(
            source,
            target,
            line,
            calculateRadialOffsets(source, target)
          );
        else calculateStraightLine(source, target, line);
      } else calculateStraightLine(source, target, line);
    },
    recalculateAllLinks: function (graph) {
      for (var i = 0; i < graph.links.length; i++)
        this.recalculateLink(graph, graph.links[i]);
    },
  };
});