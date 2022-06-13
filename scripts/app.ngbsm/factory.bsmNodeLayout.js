/*! RESOURCE: /scripts/app.ngbsm/factory.bsmNodeLayout.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmNodeLayout',
    function (bsmFilters, bsmNodeTransform, CONFIG, d3) {
      'use strict';
      function degreeOfSeperation(graph, root) {
        for (var i = 0; i < graph.nodes.length; i++) {
          graph.nodes[i].degree = Number.MAX_VALUE;
          if (!graph.nodes[i].x) graph.nodes[i].x = 0;
          if (!graph.nodes[i].y) graph.nodes[i].y = 0;
        }
        graph.maxDegree = 0;
        root.degree = 0;
        tagWithDegree(graph, root, 1);
        for (var i = 0; i < graph.nodes.length; i++)
          if (graph.nodes[i].degree > graph.maxDegree)
            graph.maxDegree = graph.nodes[i].degree;
      }
      function tagWithDegree(graph, root, degree) {
        var up = [];
        var down = [];
        var affected = [];
        for (var i = 0; i < graph.links.length; i++) {
          if (graph.links[i].source === root.nodeId) down.push(graph.links[i]);
          else if (graph.links[i].target === root.nodeId)
            up.push(graph.links[i]);
        }
        for (var j = 0; j < up.length; j++) {
          var node = graph.nodes[up[j].source];
          if (node.degree > degree) {
            node.degree = degree;
            affected.push(node);
          }
        }
        for (var j = 0; j < down.length; j++) {
          var node = graph.nodes[down[j].target];
          if (node.degree > degree) {
            node.degree = degree;
            affected.push(node);
          }
        }
        for (var k = 0; k < affected.length; k++)
          tagWithDegree(graph, affected[k], degree + 1);
      }
      function layoutAsTree(graph, root, horizontal) {
        degreeOfSeperation(graph, root);
        resetNodeTreeData(graph);
        var basket = getNodeBasket(graph, root);
        var children = getUpstreamAndDownstreamNodes(basket, graph, root);
        var up = {
          children: buildManySubtrees(graph, basket, children.up),
        };
        var down = {
          children: buildManySubtrees(graph, basket, children.down),
        };
        var tree = d3.layout
          .tree()
          .nodeSize(
            horizontal
              ? [
                  CONFIG.LAYOUT_HORIZONTAL_SPACING_Y,
                  CONFIG.LAYOUT_HORIZONTAL_SPACING_X,
                ]
              : [
                  CONFIG.LAYOUT_VERTICAL_SPACING_X,
                  CONFIG.LAYOUT_VERTICAL_SPACING_Y,
                ]
          );
        tree.nodes(down);
        tree.nodes(up);
        bsmNodeTransform.flipAcrossXAxis(up);
        root.y = 0;
        root.x = 0;
        if (horizontal) {
          bsmNodeTransform.horizontalize(up);
          bsmNodeTransform.horizontalize(down);
        }
        if (up.children && down.children)
          root.children = up.children.concat(down.children);
        else if (up.children) root.children = up.children;
        else if (down.children) root.children = down.children;
        else root.children = [];
      }
      function layoutAsRadialTree(graph, root) {
        degreeOfSeperation(graph, root);
        resetNodeTreeData(graph);
        var basket = getNodeBasket(graph, root);
        var children = getAllRelatedNodes(basket, graph, root);
        root.children = buildManySubtrees(graph, basket, children);
        d3.layout.tree().nodes(root);
        bsmNodeTransform.radialize(graph, root);
      }
      function layoutAsForce(graph, root) {
        var links = [];
        for (var i = 0; i < graph.links.length; i++) {
          links.push({
            source: graph.links[i].source,
            target: graph.links[i].target,
          });
        }
        var force = d3.layout.force().nodes(graph.nodes).links(links);
        force.start();
        for (var i = 0; i < CONFIG.LAYOUT_FORCE_ITERATIONS; i++) force.tick();
        force.stop();
        bsmNodeTransform.expand(
          graph.nodes,
          CONFIG.LAYOUT_FORCE_EXPANSION_FACTOR
        );
      }
      function layoutAsGroup(graph, root) {
        var groups = makeGroundNodeArrayAndMapping(countNodesInGroups(graph));
        var groupforce = d3.layout
          .force()
          .nodes(groups.nodes)
          .links([])
          .charge(function (d) {
            return CONFIG.LAYOUT_GROUP_CHARGE_WEIGHT - d.count * d.count;
          });
        groupforce.start();
        for (var i = 0; i < CONFIG.LAYOUT_GROUP_GROUP_ITERATIONS; i++)
          groupforce.tick();
        groupforce.stop();
        bsmNodeTransform.expand(
          groups.nodes,
          CONFIG.LAYOUT_GROUP_GROUP_EXPANSION_FACTOR
        );
        var force = d3.layout
          .force()
          .nodes(graph.nodes)
          .links([])
          .on('tick', function (e) {
            var k = 0.1 * e.alpha;
            graph.nodes.forEach(function (n) {
              n.y += (groups.lookup[n.group].y - n.y) * k;
              n.x += (groups.lookup[n.group].x - n.x) * k;
            });
          });
        force.start();
        for (var i = 0; i < CONFIG.LAYOUT_GROUP_NODE_ITERATIONS; i++)
          force.tick();
        force.stop();
        bsmNodeTransform.expand(
          graph.nodes,
          CONFIG.LAYOUT_GROUP_NODES_EXPANSION_FACTOR
        );
      }
      function layoutNodeAsTree(root, graph, basket) {
        var related = [];
        for (var i = 0; i < graph.links.length; i++) {
          if (
            bsmFilters.getFilterMode() &&
            (!graph.links[i].isReachable || graph.links[i].isFiltered)
          )
            continue;
          if (
            graph.links[i].source == root.nodeId ||
            graph.links[i].target == root.nodeId
          ) {
            var node = null;
            if (graph.links[i].source === root.nodeId)
              node = graph.nodes[graph.links[i].target];
            else if (graph.links[i].target === root.nodeId)
              node = graph.nodes[graph.links[i].source];
            if (node.degree === root.degree + 1 && basket[node.nodeId]) {
              related.push(node);
              basket[node.nodeId] = false;
            }
          }
        }
        root.children = related;
        for (var j = 0; j < root.children.length; j++)
          layoutNodeAsTree(root.children[j], graph, basket);
      }
      function getNodeBasket(graph, root) {
        var basket = {};
        for (var i = 0; i < graph.nodes.length; i++)
          if (graph.nodes[i].isReachable || !bsmFilters.getFilterMode())
            basket[graph.nodes[i].nodeId] = true;
        basket[root.nodeId] = false;
        return basket;
      }
      function resetNodeTreeData(graph) {
        for (var i = 0; i < graph.nodes.length; i++)
          graph.nodes[i].children = [];
      }
      function getUpstreamAndDownstreamNodes(basket, graph, root) {
        var up = [];
        var down = [];
        for (var i = 0; i < graph.links.length; i++) {
          if (
            bsmFilters.getFilterMode() &&
            (!graph.links[i].isReachable || graph.links[i].isFiltered)
          )
            continue;
          if (graph.links[i].source === root.nodeId) {
            if (basket[graph.links[i].target]) {
              basket[graph.links[i].target] = false;
              down.push(graph.nodes[graph.links[i].target]);
            }
          } else if (graph.links[i].target === root.nodeId) {
            if (basket[graph.links[i].source]) {
              basket[graph.links[i].source] = false;
              up.push(graph.nodes[graph.links[i].source]);
            }
          }
        }
        return {
          up: up,
          down: down,
        };
      }
      function getAllRelatedNodes(basket, graph, root) {
        var all = [];
        for (var i = 0; i < graph.links.length; i++) {
          if (
            bsmFilters.getFilterMode() &&
            (!graph.links[i].isReachable || graph.links[i].isFiltered)
          )
            continue;
          if (graph.links[i].source === root.nodeId) {
            if (basket[graph.links[i].target]) {
              basket[graph.links[i].target] = false;
              all.push(graph.nodes[graph.links[i].target]);
            }
          } else if (graph.links[i].target === root.nodeId) {
            if (basket[graph.links[i].source]) {
              basket[graph.links[i].source] = false;
              all.push(graph.nodes[graph.links[i].source]);
            }
          }
        }
        return all;
      }
      function buildManySubtrees(graph, basket, set) {
        for (var i = 0; i < set.length; i++)
          layoutNodeAsTree(set[i], graph, basket);
        return set;
      }
      function countNodesInGroups(graph) {
        var groupCount = {};
        for (var i = 0; i < graph.nodes.length; i++) {
          var g = parseInt(graph.nodes[i].group);
          if (groupCount[g] !== undefined) groupCount[g]++;
          else groupCount[g] = 1;
        }
        return groupCount;
      }
      function makeGroundNodeArrayAndMapping(groups) {
        var keys = Object.keys(groups);
        var nodes = [];
        var lookup = {};
        for (var i = 0; i < keys.length; i++) {
          nodes.push({
            group: parseInt(keys[i]),
            count: groups[parseInt(keys[i])],
          });
          lookup[parseInt(keys[i])] = nodes[i];
        }
        return {
          nodes: nodes,
          lookup: lookup,
        };
      }
      return {
        runHorizontalTreeLayout: function (graph, root) {
          layoutAsTree(graph, root, true);
        },
        runVerticalTreeLayout: function (graph, root) {
          layoutAsTree(graph, root, false);
        },
        runRadialTreeLayout: function (graph, root) {
          layoutAsRadialTree(graph, root);
        },
        runForceLayout: function (graph, root) {
          layoutAsForce(graph, root);
        },
        runForceGroupLayout: function (graph, root) {
          layoutAsGroup(graph, root);
        },
        runLoadedLayout: function (graph, root) {
          degreeOfSeperation(graph, root);
        },
        runCurrentLayout: function (graph, root) {
          if (graph && graph.root) {
            if (graph.mode === 'horizontal')
              this.runHorizontalTreeLayout(graph, root);
            else if (graph.mode === 'vertical')
              this.runVerticalTreeLayout(graph, root);
            else if (graph.mode === 'radial')
              this.runRadialTreeLayout(graph, root);
            else if (graph.mode === 'force') this.runForceLayout(graph, root);
            else if (graph.mode === 'group')
              this.runForceGroupLayout(graph, root);
          }
        },
      };
    }
  );