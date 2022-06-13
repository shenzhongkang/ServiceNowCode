/*! RESOURCE: /scripts/app.ngbsm/factory.bsmRasterizer.js */
angular.module('sn.ngbsm').factory('bsmRasterizer', [
  'd3',
  'CONFIG',
  'bsmRenderer',
  'bsmGraph',
  function (d3, CONFIG, bsmRenderer, bsmGraph) {
    'use strict';
    function updateCILabels(innerSVG) {
      var d3Elem = d3.select(innerSVG);
      d3Elem.selectAll('path.menu-trigger').remove();
      d3Elem.selectAll('g.class-label-group').style('display', 'none');
      if (CONFIG.TRUNCATE_NODE_LABELS) {
        var textLabelElem = d3Elem.selectAll('text.label');
        d3Elem
          .selectAll('g.label-group')
          .attr(
            'transform',
            'translate(' + [bsmRenderer.BSM_NODE_LABEL, -2] + ')'
          );
        textLabelElem.attr({ x: 0, y: 0 });
      }
      var nodes = bsmGraph.current().nodes;
      var jqElem = angular.element(innerSVG);
      var labelsContainer;
      for (var i = 0; i < nodes.length; i++) {
        labelsContainer = jqElem
          .find('#' + nodes[i].id)
          .siblings('.node-content-indicators')
          .find('text.label');
        bsmRenderer.breakLabel(labelsContainer[0], nodes[i], true);
      }
    }
    return {
      rasterizeAsPNG: function () {
        var serializedStyle = '\n';
        for (var i = 0; i < document.styleSheets.length; i++) {
          var href = document.styleSheets[i].href;
          if (
            angular.isString(href) &&
            href.indexOf('ngbsm_css_includes.css') !== -1
          ) {
            var rules = document.styleSheets[i].rules;
            if (!rules) {
              continue;
            }
            for (var j = 0; j < rules.length; j++) {
              if (rules[j].cssText.indexOf('keyframes') !== -1) {
                continue;
              }
              serializedStyle += rules[j].cssText + '\n';
            }
            break;
          }
        }
        var svgElement = angular
          .element("[data-test-id='dv_map_container']")
          .clone();
        var innerSVG = svgElement.children()[0];
        updateCILabels(innerSVG);
        svgElement.removeAttr('ng-attr-width ng-attr-height ng-attr-viewbox');
        svgElement
          .find('image.icon')
          .removeAttr('x y')
          .attr('transform', 'translate(-8.5,-8.5)');
        svgElement.find('.node .backplate').css({
          fill: '#e6e8ea',
          stroke: '#bdc0c4',
          'stroke-width': '1px',
        });
        svgElement.find('.link .line').css({
          stroke: '#81878e',
          'stroke-width': '2px',
        });
        svgElement.find('.link').css({
          fill: 'none',
        });
        svgElement.find('.link .path-marker').css({
          stroke: '#81878e',
          'stroke-linejoin': 'miter',
          'stroke-width': '2px',
        });
        svgElement.find('.node .label').attr({
          'font-family': 'arial, sans-serif',
          'font-size': '8px',
        });
        svgElement.find('image.bsmIndicator , path.menu-trigger').remove();
        svgElement.prepend('<rect width="100%" height="100%" fill="white" />');
        var styleElement = angular.element(
          "<style type='text/css'>" + serializedStyle + '</style>'
        );
        svgElement.prepend(styleElement);
        var svg = new XMLSerializer().serializeToString(svgElement[0]);
        var canvas = document.createElement('canvas');
        canvg(canvas, svg);
        return canvas.toDataURL('image/png', 1.0);
      },
    };
  },
]);