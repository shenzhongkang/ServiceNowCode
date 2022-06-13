/*! RESOURCE: /scripts/app.ngbsm/factory.bsmRenderer.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmRenderer',
    function (
      $rootScope,
      $timeout,
      bsmCanvas,
      bsmFilters,
      bsmGraph,
      bsmGroups,
      bsmIcons,
      bsmRelationships,
      bsmSelection,
      bsmEdgeColors,
      CONFIG,
      d3,
      bsmURL
    ) {
      'use strict';
      var bsmBehaviors = null;
      var visualizeFlow = false;
      var currentlyDrawing = false;
      var nextDrawBuffer = null;
      var raphaelPaper = Raphael(-5, -5, 1, 1);
      var isAccessibilityEnabeld = window.NOW['IS_ACCESSIBILITY_ENABLED'];
      var BSM_NODE_SIZE = 30;
      var BSM_NODE_CENTER = BSM_NODE_SIZE / 2;
      var BSM_NODE_LABEL = BSM_NODE_SIZE / 2 + 3;
      var BSM_NODE_MENU = BSM_NODE_LABEL + 3;
      var BSM_NODE_ICON = BSM_NODE_SIZE / 2 + 2;
      var line = d3.svg
        .line()
        .interpolate(CONFIG.PERFORMANCE_ALLOW_CURVES ? 'basis' : 'line')
        .x(function (d) {
          return d.x;
        })
        .y(function (d) {
          return d.y;
        });
      function getNodeClassLabel(node) {
        return node.classLabel || '';
      }
      function getNodeLabel(node) {
        return node.name || '';
      }
      function repairLabel(elem, datum) {
        if (CONFIG.TRUNCATE_NODE_LABELS) truncateLabel(elem, datum);
        else breakLabel(elem, datum);
      }
      function truncateLabel(elem, datum) {
        var d3Elem = d3.select(elem);
        var text = d3Elem.text();
        var i;
        var width = elem.getComputedTextLength() || 0;
        if (text.length === 0) return;
        if (CONFIG.NODE_LABEL_WIDTH < 10) {
          var err = new Error(
            'Requested truncate label within maximal width less than 10px. Skipping...'
          );
          console.warn(err.stack);
          return;
        }
        if (width <= CONFIG.NODE_LABEL_WIDTH) {
          return;
        }
        i = text.length;
        while (i > 0 && width > CONFIG.NODE_LABEL_WIDTH) {
          i--;
          width = elem.getSubStringLength(0, i);
        }
        d3Elem
          .text(text.substring(0, i - 1) + '\u2026')
          .attr('data-ci-label', text);
        var titleElement = elem.nextElementSibling;
        var titleD3Elem = d3.select(titleElement);
        titleD3Elem.text(text);
        if (!datum.classLabel || d3Elem.classed('class-label')) {
          datum.labelWidth = elem.getComputedTextLength();
          var parentNode = d3.selectAll('.node').filter(function (d) {
            return d.d3id === datum.d3id;
          });
          repairContextMenuArrowPosition(parentNode, datum);
        }
      }
      var REGEX_WHITESPACE = /\s+/;
      function breakLabelPart(label, lines) {
        var d3Elem = bsmCanvas.above().select('text.common-text-element');
        var elem = d3Elem[0][0];
        var width;
        var from = 0;
        var to = 1;
        d3Elem.style('display', null);
        while (to < label.length) {
          d3Elem.text(label.substring(from, to));
          width = elem.getComputedTextLength() || 0;
          if (width > CONFIG.NODE_LABEL_WIDTH) {
            if (to + 1 === label.length) {
              to++;
            } else if (REGEX_WHITESPACE.test(label.charAt(to + 1))) to--;
            else if (to > 1 && REGEX_WHITESPACE.test(label.charAt(to - 2)))
              to--;
            lines.push(label.substring(from, to).trim());
            from = to;
          }
          to++;
        }
        if (to - from > 0) lines.push(label.substring(from, to).trim());
        d3Elem.style('display', 'none');
      }
      function breakLabel(elem, datum, noContextMenuArrow) {
        var lines = [];
        var d3Elem = d3.select(elem);
        if (!d3Elem.selectAll('tspan').empty()) return;
        var label = getNodeClassLabel(datum);
        breakLabelPart(label, lines);
        label = getNodeLabel(datum);
        breakLabelPart(label, lines);
        d3Elem.text(null);
        var count = 0;
        for (var i = 0; i < lines.length; i++) {
          if (lines[i].length === 0) continue;
          d3Elem
            .append('tspan')
            .attr('x', 0)
            .attr('y', count * 11)
            .text(lines[i]);
          count++;
        }
        datum.multilineLabelCount = count;
        if (!noContextMenuArrow) {
          if (CONFIG.FLAG_IS_IE9) {
            var rText = raphaelPaper.text(0, 0, d3Elem.select('tspan').text());
            datum.labelWidth = rText.getBBox().width;
            rText.remove();
          } else {
            datum.labelWidth = d3Elem
              .select('tspan')[0][0]
              .getComputedTextLength();
          }
          var parentNode = d3.selectAll('.node').filter(function (d) {
            return d.d3id === datum.d3id;
          });
          repairContextMenuArrowPosition(parentNode, datum);
        }
      }
      function repairContextMenuArrowPosition(d3Container, datum) {
        var labelWidth = Math.min(
          datum.labelWidth || datum.nextLabelWidth,
          CONFIG.NODE_LABEL_WIDTH
        );
        var translate = 'translate(' + (BSM_NODE_MENU + labelWidth) + ', 0)';
        d3Container.select('g.menu-trigger').attr('transform', translate);
      }
      function repairNodeClassLabel(datum) {
        repairLabel(this, datum);
      }
      function repairNodeLabel(datum) {
        repairLabel(this, datum);
      }
      function drawAll(duration) {
        var node = bsmCanvas
          .visualization()
          .selectAll('g.node')
          .data(bsmGraph.current().nodes, function (d) {
            return d.d3id ? d.d3id : (d.d3id = d3.nextId());
          });
        var nodeEnter = createNodes(node);
        var end = angular.element.Deferred();
        var count = node[0].length;
        node
          .transition()
          .duration(duration)
          .attr('transform', function (d) {
            return (
              'translate(' +
              d.x +
              ',' +
              d.y +
              ')' +
              (d === bsmGraph.current().root ? 'scale(1.25)' : '')
            );
          })
          .attr('opacity', '1')
          .style('display', function (d) {
            if ((d.isFiltered || !d.isReachable) && bsmFilters.getFilterMode())
              return d3.select(this).style('display');
            else return 'block';
          })
          .each('end', function (d, e, f) {
            var n = d3.select(this).style('display', function () {
              return (d.isFiltered || !d.isReachable) &&
                bsmFilters.getFilterMode()
                ? 'none'
                : 'block';
            });
            if (isAccessibilityEnabeld) {
              n.attr('tabindex', 0)
                .attr('focusable', 'true')
                .attr('aria-label', d.classLabel + ' ' + d.name)
                .attr('id', 'ngbsm-node-' + d.nodeId);
              if (--count === 0) {
                end.resolve();
              }
            }
          });
        node
          .selectAll('.node-content')
          .transition()
          .duration(duration)
          .attr('opacity', function (d) {
            return d.isFiltered || !d.isReachable
              ? bsmFilters.getFilterMode()
                ? '0'
                : '0.5'
              : '1';
          });
        node
          .selectAll('.backplate')
          .transition()
          .duration(duration)
          .attr('id', function (d) {
            return d.id;
          })
          .attr('data-test-is-collapsed', function (d) {
            return d.isCollapsed;
          })
          .attr('data-test-is-cluster', function (d) {
            return d.isCluster;
          })
          .attr('data-test-name', function (d) {
            return d.name;
          })
          .attr('data-test-group', function (d) {
            return d.classLabel;
          })
          .attr('class', function (d) {
            return 'backplate' + (d.isSelected ? ' highlighted' : '');
          });
        node
          .selectAll('.highlight')
          .transition()
          .duration(duration)
          .attr('class', function (d) {
            return (
              'highlight' +
              (d.isDirectlyRelated || d.isMouseOver || d.isSelected
                ? ' highlighted'
                : '')
            );
          });
        if (CONFIG.TRUNCATE_NODE_LABELS) {
          var classLabels = node.selectAll('.class-label');
          classLabels
            .transition()
            .duration(duration)
            .style('font-weight', function (d) {
              if (CONFIG.FLAG_IS_SAFARI && d.affectedNeighbor) return 'bold';
              return null;
            });
          classLabels.text(getNodeClassLabel).each(repairNodeClassLabel);
        }
        var labels = node.selectAll('.label');
        labels
          .transition()
          .duration(duration)
          .style('font-weight', function (d) {
            if (CONFIG.FLAG_IS_SAFARI && d.affectedNeighbor) return 'bold';
            return null;
          });
        labels.text(getNodeLabel).each(repairNodeLabel);
        node
          .exit()
          .transition()
          .duration(duration)
          .attr('opacity', '0')
          .remove();
        var link = bsmCanvas
          .visualization()
          .selectAll('g.link')
          .data(bsmGraph.current().links, function (d) {
            return d.d3id ? d.d3id : (d.d3id = d3.nextId());
          });
        var linkEnter = createLinks(link);
        link
          .transition()
          .duration(duration)
          .attr('data-test-link-type', function (d) {
            return d.type;
          })
          .attr('data-test-source', function (d) {
            return bsmGraph.current().nodes[d.source].id;
          })
          .attr('data-test-target', function (d) {
            return bsmGraph.current().nodes[d.target].id;
          })
          .attr('opacity', function (d) {
            return d.isFiltered || !d.isReachable
              ? bsmFilters.getFilterMode()
                ? '0'
                : '0.5'
              : '1';
          })
          .style('display', function (d) {
            if ((d.isFiltered || !d.isReachable) && bsmFilters.getFilterMode())
              return d3.select(this).style('display');
            else return 'block';
          })
          .each('end', function (d, e, f) {
            var n = d3.select(this).style('display', function () {
              return (d.isFiltered || !d.isReachable) &&
                bsmFilters.getFilterMode()
                ? 'none'
                : 'block';
            });
            if (isAccessibilityEnabeld) {
              n.attr('tabindex', 0)
                .attr('focusable', 'true')
                .attr('id', 'ngbsm-link-' + e)
                .attr('aria-label', d.typeName)
                .attr(
                  'aria-describedby',
                  'ngbsm-node-' +
                    d.source +
                    ' ngbsm-link-' +
                    e +
                    ' ngbsm-node-' +
                    d.target
                )
                .attr('role', 'button');
            }
          });
        link.selectAll('.wide-line').attr('d', function (d) {
          return line(d.line);
        });
        link
          .selectAll('.line')
          .transition()
          .duration(duration)
          .attr('class', function (d) {
            return (
              'line' +
              (d.isDirectlyRelated || d.isMouseOver || d.isSelected
                ? ' highlighted'
                : '') +
              (visualizeFlow ? ' visualize-flow' : '')
            );
          })
          .attr('d', function (d) {
            return line(d.line);
          });
        link
          .selectAll('.path-marker')
          .transition()
          .duration(duration)
          .attr('class', function (d) {
            return (
              'path-marker' +
              (d.isDirectlyRelated || d.isMouseOver || d.isSelected
                ? ' highlighted'
                : '')
            );
          })
          .attrTween('transform', function (d) {
            return function () {
              return markerTransform(d.pathElement, markerOffset(d));
            };
          });
        link
          .exit()
          .transition()
          .duration(duration)
          .attr('opacity', '0')
          .remove();
        renderIndicator(nodeEnter, node, node.exit(), duration);
        renderLinkCount(linkEnter, link, link.exit(), duration);
        return end.promise();
      }
      function drawMinimal(duration) {
        var node = bsmCanvas
          .visualization()
          .selectAll('g.node')
          .data(bsmGraph.current().nodes, function (d) {
            return d.d3id ? d.d3id : (d.d3id = d3.nextId());
          });
        node
          .transition()
          .duration(duration)
          .attr('transform', function (d) {
            return (
              'translate(' +
              d.x +
              ',' +
              d.y +
              ')' +
              (d === bsmGraph.current().root ? 'scale(1.25)' : '')
            );
          })
          .attr('opacity', '1')
          .style('display', function (d) {
            if ((d.isFiltered || !d.isReachable) && bsmFilters.getFilterMode())
              return d3.select(this).style('display');
            else return 'block';
          })
          .each('end', function (d, e, f) {
            d3.select(this).style('display', function () {
              return (d.isFiltered || !d.isReachable) &&
                bsmFilters.getFilterMode()
                ? 'none'
                : 'block';
            });
          });
        node
          .selectAll('.node-content')
          .transition()
          .duration(duration)
          .attr('opacity', function (d) {
            return d.isFiltered || !d.isReachable
              ? bsmFilters.getFilterMode()
                ? '0'
                : '0.5'
              : '1';
          });
        var link = bsmCanvas
          .visualization()
          .selectAll('g.link')
          .data(bsmGraph.current().links, function (d) {
            return d.d3id ? d.d3id : (d.d3id = d3.nextId());
          });
        link
          .transition()
          .duration(duration)
          .attr('opacity', function (d) {
            return d.isFiltered || !d.isReachable
              ? bsmFilters.getFilterMode()
                ? '0'
                : '0.5'
              : '1';
          })
          .style('display', function (d) {
            if ((d.isFiltered || !d.isReachable) && bsmFilters.getFilterMode())
              return d3.select(this).style('display');
            else return 'block';
          })
          .each('end', function (d, e, f) {
            d3.select(this).style('display', function () {
              return (d.isFiltered || !d.isReachable) &&
                bsmFilters.getFilterMode()
                ? 'none'
                : 'block';
            });
          });
        link
          .selectAll('.line')
          .transition()
          .duration(duration)
          .attr('d', function (d) {
            return line(d.line);
          });
        link
          .selectAll('.wide-line')
          .transition()
          .duration(duration)
          .attr('d', function (d) {
            return line(d.line);
          });
        link
          .selectAll('.path-marker')
          .transition()
          .duration(duration)
          .attrTween('transform', function (d) {
            return function () {
              return markerTransform(d.pathElement, markerOffset(d));
            };
          });
        link
          .selectAll('.link-badge')
          .transition()
          .duration(duration)
          .attrTween('transform', function (d) {
            return function () {
              if (d.count !== undefined && d.count > 1)
                return linkBadgeTransform(d.pathElement);
              return '';
            };
          });
        renderIndicator(null, node, null, duration);
      }
      function drawAbove(duration) {
        bsmCanvas
          .above()
          .selectAll('g.selection')
          .selectAll('rect')
          .classed('active', bsmSelection.makingSelection())
          .attr('x', bsmSelection.getSelectionBox().x)
          .attr('y', bsmSelection.getSelectionBox().y)
          .attr('width', bsmSelection.getSelectionBox().w)
          .attr('height', bsmSelection.getSelectionBox().h);
        bsmCanvas
          .above()
          .selectAll('g.new-relationship')
          .selectAll('path')
          .classed('active', bsmRelationships.isCreatingRelationship())
          .classed('link', true)
          .classed('visualize-flow', true)
          .attr('d', function (d) {
            return line(bsmRelationships.getCreationLine());
          });
        bsmCanvas
          .container()
          .selectAll('.relationship-label')
          .classed('active', bsmRelationships.getLastOver() !== null)
          .style('left', bsmRelationships.getTooltipLocation().x)
          .style('top', bsmRelationships.getTooltipLocation().y)
          .html(function (d) {
            var currentLink = bsmRelationships.getLastOver();
            var source = currentLink !== null ? currentLink.source : '';
            var target = currentLink !== null ? currentLink.target : '';
            var tooltip = '';
            for (var i = 0; i < bsmGraph.current().links.length; i++) {
              var link = bsmGraph.current().links[i];
              if (
                (link.source === source && link.target === target) ||
                (link.target === source && link.source === target)
              ) {
                var dirSymbol = link.source === source ? '&darr; ' : '&uarr; ';
                var typeDescription = link.typeName.split('::');
                tooltip += dirSymbol + translateWord(typeDescription[0]);
                if (typeDescription.length === 2) {
                  tooltip += '::' + translateWord(typeDescription[1]);
                }
                tooltip += '<br/>';
              }
            }
            return tooltip;
          });
        var groups = bsmCanvas
          .below()
          .selectAll('g.group-box')
          .data(bsmGroups.groups());
        var groupsEnter = groups.enter().append('g').classed('group-box', true);
        groupsEnter
          .append('rect')
          .attr('x', function (d) {
            return d.x;
          })
          .attr('y', function (d) {
            return d.y;
          })
          .attr('width', function (d) {
            return d.w;
          })
          .attr('height', function (d) {
            return d.h;
          })
          .attr('rx', 8)
          .attr('ry', 8);
        groups
          .selectAll('rect')
          .transition()
          .duration(duration)
          .attr('x', function (d) {
            return d.x;
          })
          .attr('y', function (d) {
            return d.y;
          })
          .attr('width', function (d) {
            return d.w;
          })
          .attr('height', function (d) {
            return d.h;
          });
        groups.exit().remove();
      }
      var createNodes = (function (node) {
        return function (node) {
          var nodeEnter = node
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('opacity', 0)
            .attr('transform', function (d) {
              return 'translate(' + d.x + ',' + d.y + ')';
            })
            .on('contextmenu', bsmBehaviors.onRightClick)
            .on('mouseover', bsmBehaviors.onNodeMouseOver)
            .on('mouseout', bsmBehaviors.onNodeMouseOut)
            .on('mousedown', bsmBehaviors.onMouseDown)
            .on('dblclick', function () {
              d3.event.preventDefault();
              d3.event.stopPropagation();
            })
            .call(bsmBehaviors.drag);
          nodeEnter
            .filter(function (d) {
              return d === bsmGraph.current().root;
            })
            .attr('transform', 'scale(1.25)')
            .append('rect')
            .classed('rootplate', true)
            .classed('visualize-root', true)
            .classed('root', true)
            .attr('x', -BSM_NODE_CENTER)
            .attr('y', -BSM_NODE_CENTER)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('fill', 'black')
            .attr('width', BSM_NODE_SIZE)
            .attr('height', BSM_NODE_SIZE);
          var background = nodeEnter.append('g').classed('background', true);
          background
            .append('rect')
            .classed('backgound', true)
            .attr('x', -BSM_NODE_CENTER)
            .attr('y', -BSM_NODE_CENTER)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('width', BSM_NODE_SIZE)
            .attr('height', BSM_NODE_SIZE);
          var content = nodeEnter.append('g').classed('node-content', true);
          content
            .append('rect')
            .classed('backplate', true)
            .attr('x', -BSM_NODE_CENTER)
            .attr('y', -BSM_NODE_CENTER)
            .attr('rx', 6)
            .attr('ry', 6)
            .attr('width', BSM_NODE_SIZE)
            .attr('height', BSM_NODE_SIZE);
          content
            .append('image')
            .classed('icon', true)
            .classed('bsmicon', true)
            .attr('x', -BSM_NODE_ICON / 2)
            .attr('y', -BSM_NODE_ICON / 2)
            .attr('width', BSM_NODE_ICON)
            .attr('height', BSM_NODE_ICON)
            .attr('xlink:href', function (d) {
              return bsmIcons.get(d.className);
            });
          var indicators = content
            .append('g')
            .classed('node-content-indicators', true);
          var classLabelGroup = indicators
            .append('g')
            .classed('class-label-group', true);
          var classLabelBox = classLabelGroup
            .append('text')
            .classed('class-label', true);
          if (CONFIG.TRUNCATE_NODE_LABELS) {
            classLabelBox
              .style('display', function (d) {
                if (d.classLabel) return 'block';
                return 'none';
              })
              .attr('x', BSM_NODE_LABEL)
              .attr('y', -2)
              .attr('text-anchor', 'start')
              .text(function (d) {
                return d.classLabel + ':';
              })
              .each(function (d) {
                d.labelWidth = this.getComputedTextLength();
              })
              .style('fill-opacity', 1);
            classLabelGroup.append('title');
          } else {
            classLabelGroup.style('display', 'none');
          }
          var labelGroup = indicators.append('g').classed('label-group', true);
          if (!CONFIG.TRUNCATE_NODE_LABELS) {
            labelGroup
              .attr('transform', 'translate(' + BSM_NODE_LABEL + ',-2)')
              .each(function (d) {
                d.labelWidth = 0;
              });
          }
          var labelBox = labelGroup.append('text').classed('label', true);
          if (CONFIG.TRUNCATE_NODE_LABELS) {
            labelBox
              .attr('y', function (d) {
                return -2 + (d.classLabel ? 10 : 0);
              })
              .attr('x', BSM_NODE_LABEL);
          } else {
            labelBox.attr({ x: 0, y: 0 });
          }
          labelBox
            .attr('text-anchor', 'start')
            .text(function (d) {
              return truncate(d.name);
            })
            .each(function (d) {
              d.nextLabelWidth = this.getComputedTextLength();
            })
            .style('fill-opacity', 1);
          labelGroup.append('title');
          indicators
            .append('g')
            .classed('menu-trigger', true)
            .attr('transform', function (d) {
              var labelWidth = d.labelWidth || d.nextLabelWidth;
              return 'translate(' + (BSM_NODE_MENU + labelWidth) + ', 0)';
            })
            .append('path')
            .classed('menu-trigger', true)
            .on('click.contextmenu', bsmBehaviors.onRightClick)
            .attr('d', 'M0, -7 L 6,-7 L 3,-2 Z');
          if (CONFIG.TRUNCATE_NODE_LABELS) {
            classLabelBox.each(function (d) {
              d.endTextPosition = this.getComputedTextLength();
            });
          }
          labelBox.each(function (d) {
            var l = this.getComputedTextLength();
            d.endTextPosition =
              angular.isUndefined(d.endTextPosition) || l > d.endTextPosition
                ? l + 13
                : d.endTextPosition;
          });
          indicators
            .append('rect')
            .attr('x', function (d) {
              return d.endTextPosition + 10;
            })
            .attr('y', -10)
            .attr('width', 5)
            .attr('height', 30)
            .attr('fill-opacity', '0');
          if (bsmURL.getParameter('debug')) {
            if (bsmURL.getParameter('debug').indexOf('ci_id') > 0) {
              var debugGroup = indicators.append('g');
              var debugBox = debugGroup
                .append('text')
                .attr('x', function (d) {
                  return BSM_NODE_LABEL;
                })
                .attr('y', function (d) {
                  return 22;
                })
                .attr('text-anchor', 'middle')
                .text(function (d) {
                  return d.id;
                })
                .style('fill', 'red')
                .style('font', '6px Arial, sans-serif');
              debugGroup
                .append('a')
                .attr('xlink:href', function (d) {
                  function executeCopy(text) {
                    var input = document.createElement('textarea');
                    document.body.appendChild(input);
                    input.value = text;
                    input.focus();
                    input.select();
                    document.execCommand('Copy');
                    input.remove();
                    console.log('***** CopiedID- ' + text + ' **************');
                  }
                  return (
                    'javascript:' +
                    executeCopy +
                    ";executeCopy('" +
                    d.id +
                    "');"
                  );
                })
                .append('rect')
                .attr('x', BSM_NODE_LABEL + 55)
                .attr('y', 18)
                .attr('height', 4)
                .attr('width', 4)
                .style('fill', 'red');
            }
            if (bsmURL.getParameter('debug').indexOf('group') > 0) {
              var debugGroup = indicators.append('g');
              var debugBox = debugGroup
                .append('text')
                .attr('x', function (d) {
                  return BSM_NODE_LABEL;
                })
                .attr('y', function (d) {
                  return 28;
                })
                .attr('text-anchor', 'middle')
                .text(function (d) {
                  if (d.isCollapsed) return d.collapsedIds;
                  else return '';
                })
                .style('fill', 'green')
                .style('font', '6px Arial, sans-serif');
              debugGroup
                .append('a')
                .attr('xlink:href', function (d) {
                  function executeCopy(text) {
                    var input = document.createElement('textarea');
                    document.body.appendChild(input);
                    input.value = text;
                    input.focus();
                    input.select();
                    document.execCommand('Copy');
                    input.remove();
                    console.log(
                      '***** Copied Group IDs- ' + text + ' **************'
                    );
                  }
                  return (
                    'javascript:' +
                    executeCopy +
                    ";executeCopy('" +
                    d.collapsedIds +
                    "');"
                  );
                })
                .append('rect')
                .attr('x', BSM_NODE_LABEL + 62)
                .attr('y', 18)
                .attr('height', 4)
                .attr('width', 4)
                .attr('fill-opacity', function (d) {
                  return d.collapsedIds ? '1' : '0';
                })
                .style('fill', 'green');
            }
          }
          return nodeEnter;
        };
      })();
      function translateWord(engWord) {
        if (g_lang == 'en') return engWord;
        var grI18n = new GlideRecord('sys_translated');
        grI18n.addQuery('language', g_lang);
        grI18n.addQuery('name', 'cmdb_rel_type');
        grI18n.addQuery('value', engWord);
        grI18n.query();
        if (grI18n.next()) return grI18n.getValue('label');
        return engWord;
      }
      function createLinks(link) {
        var linkEnter = link
          .enter()
          .insert('g', '.node')
          .classed('link', true)
          .attr('opacity', 0)
          .on('dblclick', function () {
            d3.event.preventDefault();
            d3.event.stopPropagation();
          });
        linkEnter
          .append('path')
          .classed('wide-line', true)
          .attr('id', function (d) {
            return d.id;
          })
          .attr('d', function (d) {
            return line(d.line);
          })
          .on('contextmenu', bsmBehaviors.onRightClick)
          .on('mouseover', bsmBehaviors.onLinkMouseOver)
          .on('mouseout', bsmBehaviors.onLinkMouseOut);
        linkEnter
          .append('path')
          .classed('line', true)
          .attr('d', function (d) {
            return line(d.line);
          })
          .style('stroke', function (d) {
            return getLinkColor(d.type);
          })
          .each(function (d) {
            d.pathElement = this;
          })
          .on('contextmenu', bsmBehaviors.onRightClick)
          .on('mousedown', bsmBehaviors.onLinkSelected)
          .on('mouseover', bsmBehaviors.onLinkMouseOver)
          .on('mouseout', bsmBehaviors.onLinkMouseOut);
        var arrowHead = linkEnter
          .append('g')
          .classed('path-marker', true)
          .attr('transform', function (d) {
            return markerTransform(d.pathElement, markerOffset(d));
          });
        arrowHead
          .append('rect')
          .style('stroke', function (d) {
            return 'none';
          })
          .attr('fill', 'white')
          .attr('x', -3)
          .attr('y', -3)
          .attr('width', 6)
          .attr('height', 6);
        arrowHead
          .append('path')
          .style('stroke', function (d) {
            return getLinkColor(d.type);
          })
          .attr('d', 'M -1 -4  L 0 -2 L 1 -4 z');
        return linkEnter;
      }
      function renderIndicator(enter, update, exit, duration) {
        if (duration === undefined) {
          return;
        }
        if (update) {
          var gIndicators = update.selectAll('.node-content-indicators');
          gIndicators.selectAll('image.bsmIndicator').remove();
          var indicators = gIndicators.filter(function (d) {
            return d.hasOwnProperty('indicators') && d.indicators.length > 0;
          });
          if (CONFIG.TRUNCATE_NODE_LABELS) {
            var indicatorsWithClassLabel = indicators.filter(function (d) {
              return d.classLabel;
            });
            gIndicators.attr('transform', null);
            indicatorsWithClassLabel.attr('transform', 'translate(0, -5)');
          } else {
            gIndicators.attr('transform', 'translate(0, -5)');
          }
          indicators.each(function (d) {
            for (
              var int = 0, indEnabled = 0;
              int < d.indicators.length;
              int++
            ) {
              if (d.indicators[int].show) {
                var img = d3
                  .select(this)
                  .append('image')
                  .classed('icon', true)
                  .attr('class', 'bsmIndicator')
                  .attr('x', 18 + indEnabled * 12)
                  .attr('y', function (d) {
                    if (
                      !CONFIG.TRUNCATE_NODE_LABELS &&
                      !isNaN(Number(d.multilineLabelCount))
                    )
                      return 12 * (Number(d.multilineLabelCount) - 1) - 2;
                    return d.classLabel ? 12 : 10;
                  })
                  .attr('width', 14)
                  .attr('height', 10)
                  .attr('xlink:href', function (n) {
                    return d.indicators[int].icon;
                  });
                if (isAccessibilityEnabeld) {
                  img.attr('tabindex', 0).attr('focusable', 'true');
                  img.on('focus', bsmBehaviors.indicatorFocus);
                  img.on('blur', bsmBehaviors.indicatorBlur);
                }
                var title = img.append('title').text(function (d) {
                  return d.indicators[int].tooltip;
                });
                indEnabled++;
              } else {
              }
            }
          });
        }
      }
      function renderLinkCount(enter, update, exit, duration) {
        if (enter) {
          enter = enter
            .append('g')
            .classed('link-badge', true)
            .attr('transform', 'translate(0,0)')
            .style('display', function (d) {
              return d.count !== undefined && d.count > 1 ? 'block' : 'none';
            })
            .on('mouseover', bsmBehaviors.onLinkMouseOver)
            .on('mouseout', bsmBehaviors.onLinkMouseOut);
          enter
            .append('rect')
            .classed('badge-plate', true)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', -5)
            .attr('y', -5);
          enter
            .append('text')
            .classed('badge-label', true)
            .attr('text-anchor', 'middle')
            .attr('dy', '.35em')
            .text(function (d) {
              return d.count;
            });
        }
        if (update) {
          update = update.selectAll('.link-badge');
          update
            .selectAll('.badge-plate')
            .attr('class', function (d) {
              return (
                'badge-plate' +
                (d.isDirectlyRelated || d.isMouseOver || d.isSelected
                  ? ' highlighted'
                  : '')
              );
            })
            .attr('width', function (d) {
              return 5 + ('' + d.count).length * 5;
            })
            .style('stroke', function (d) {
              return getLinkColor(d.type);
            })
            .attr('x', function (d) {
              return -(5 + ('' + d.count).length * 5) / 2;
            });
          update.selectAll('.badge-label').text(function (d) {
            return d.count;
          });
          update
            .transition()
            .duration(duration)
            .style('display', function (d) {
              return d.count !== undefined && d.count > 1 ? 'block' : 'none';
            })
            .attrTween('transform', function (d) {
              return function () {
                if (d.count !== undefined && d.count > 1)
                  return linkBadgeTransform(d.pathElement);
                return '';
              };
            });
        }
      }
      function markerOffset(datum) {
        var offset = CONFIG.LINK_MARKER_OFFSET;
        var target = bsmGraph.current().nodes[datum.target];
        if (target) {
          offset += 0;
          offset *= target == bsmGraph.current().root ? 1.25 : 1;
        }
        return offset;
      }
      function markerTransform(path, offset) {
        var delta = 0.01;
        var pathD = path.getAttribute('d');
        var rPath = raphaelPaper.path(pathD);
        var l = Raphael.getTotalLength(pathD);
        var point = rPath.getPointAtLength(l - offset);
        var before = rPath.getPointAtLength(l - (offset + delta));
        var after = rPath.getPointAtLength(l - (offset - delta));
        rPath.remove();
        return (
          'translate(' +
          point.x +
          ',' +
          point.y +
          ') rotate(' +
          (Math.atan2(after.x - before.x, after.y - before.y) * -180) /
            Math.PI +
          ')'
        );
      }
      function linkBadgeTransform(path) {
        try {
          var point = path.getPointAtLength(path.getTotalLength() / 2);
          return 'translate(' + point.x + ',' + point.y + ')';
        } catch (e) {
          return 'translate(0, 0)';
        }
      }
      function truncate(label) {
        var name = label;
        if (label && label.length > 16) {
          var sections = label.split('@');
          var chars = Math.floor(16 / sections.length);
          var name = '';
          for (var i = 0; i < sections.length; i++)
            name +=
              (sections[i].length > chars
                ? sections[i].substring(0, chars) + '...'
                : sections[i]) + (i < sections.length - 1 ? '@' : '');
        }
        return name;
      }
      function getLinkColor(relationType) {
        var color = bsmEdgeColors.get(relationType);
        if (color) return color;
      }
      function canRender() {
        if (bsmBehaviors === null) {
          console.log('Cannot render without a behavior model set!');
          return false;
        }
        return true;
      }
      return {
        BSM_NODE_LABEL: BSM_NODE_LABEL,
        setBehaviors: function (behaviors) {
          bsmBehaviors = behaviors;
        },
        drawAll: function (duration) {
          if (duration > 0)
            $rootScope.$broadcast('ngbsm.long_draw_triggered', {
              duration: duration,
            });
          return drawAll(duration);
        },
        drawMinimal: function (duration) {
          if (duration > 0)
            $rootScope.$broadcast('ngbsm.long_draw_triggered', {
              duration: duration,
            });
          drawMinimal(duration);
        },
        drawAbove: function (duration) {
          drawAbove(duration);
        },
        toggleVisualizeFlow: function () {
          visualizeFlow = !visualizeFlow;
        },
        breakLabel: breakLabel,
      };
    }
  );