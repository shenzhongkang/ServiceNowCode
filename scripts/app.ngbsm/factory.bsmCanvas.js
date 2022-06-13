/*! RESOURCE: /scripts/app.ngbsm/factory.bsmCanvas.js */
angular
  .module('sn.ngbsm')
  .factory('bsmCanvas', function ($timeout, $window, d3) {
    'use strict';
    var container = null;
    var camera = null;
    var below = null;
    var visualization = null;
    var above = null;
    var canvas = null;
    var margins = [0, 0, 0, 0];
    return {
      setCamera: function (d3Selection) {
        camera = d3Selection;
      },
      setBelow: function (d3Selection) {
        below = d3Selection;
      },
      setVisualization: function (d3Selection) {
        visualization = d3Selection;
      },
      setAbove: function (d3Selection) {
        above = d3Selection;
      },
      setCanvas: function (d3Selection) {
        canvas = d3Selection;
      },
      setContainer: function (d3Selection) {
        container = d3Selection;
      },
      setMargins: function (marginArray) {
        margins = marginArray;
      },
      camera: function () {
        return camera;
      },
      below: function () {
        return below;
      },
      visualization: function () {
        return visualization;
      },
      above: function () {
        return above;
      },
      canvas: function () {
        return canvas;
      },
      container: function () {
        return container;
      },
      getMargins: function () {
        return margins;
      },
      getHeight: function () {
        if (canvas !== null && container !== null)
          return container[0][0].clientHeight;
        return 0;
      },
      getWidth: function () {
        if (canvas !== null && container !== null)
          return container[0][0].clientWidth;
        return 0;
      },
      getInnerHeight: function () {
        if (canvas !== null && container !== null)
          return container[0][0].clientHeight - (margins[0] + margins[2]);
        return 0;
      },
      getInnerWidth: function () {
        if (canvas !== null && container !== null)
          return container[0][0].clientWidth - (margins[1] + margins[3]);
        return 0;
      },
    };
  });