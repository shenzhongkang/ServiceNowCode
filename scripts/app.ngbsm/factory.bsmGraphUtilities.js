/*! RESOURCE: /scripts/app.ngbsm/factory.bsmGraphUtilities.js */
angular.module('sn.ngbsm').factory('bsmGraphUtilities', function () {
  'use strict';
  var api = null;
  function isGroup(node) {
    return node.hasOwnProperty('collapsedIds');
  }
  function flattenGraph(graph) {
    var flat = {
      id: graph.id,
      name: graph.name,
      serviceId: graph.serviceId,
      serviceViewAvailable: graph.serviceViewAvailable,
      errors: graph.errors,
      nodes: [],
      links: [],
    };
    for (var i = 0; i < graph.links.length; i++) {
      flat.links.push({
        id: graph.links[i].id,
        type: graph.links[i].type,
        typeName: graph.links[i].typeName,
        count: graph.links[i].count,
        source: graph.nodes[graph.links[i].source].id,
        target: graph.nodes[graph.links[i].target].id,
      });
    }
    for (var i = 0; i < graph.nodes.length; i++) {
      var serializedNode = {
        id: graph.nodes[i].id,
        nodeId: graph.nodes[i].nodeId,
        name: graph.nodes[i].name,
        level: graph.nodes[i].level,
        className: graph.nodes[i].className,
        classLabel: graph.nodes[i].classLabel,
        isCluster: graph.nodes[i].isCluster,
        isCollapsed: graph.nodes[i].isCollapsed,
        cidetail: graph.nodes[i].cidetail,
      };
      if (isGroup(graph.nodes[i]))
        serializedNode.collapsedIds = graph.nodes[i].collapsedIds;
      flat.nodes.push(serializedNode);
    }
    for (var i = 0; i < flat.nodes.length; i++) flat.nodes[i].nodeId = i;
    return flat;
  }
  function mapBaseGraph(base, expandedNode) {
    var baseNodes = {};
    for (var i = 0; i < base.nodes.length; i++) {
      baseNodes[base.nodes[i].id] = base.nodes[i];
    }
    if (baseNodes[expandedNode]) baseNodes[expandedNode].isCollapsed = false;
    var baseLinks = {};
    for (var i = 0; i < base.links.length; i++)
      baseLinks[base.links[i].id] = base.links[i];
    return {
      baseNodes: baseNodes,
      baseLinks: baseLinks,
    };
  }
  function mergeGraphs(base, addition, expandedNode) {
    var mappedGraph = mapBaseGraph(base, expandedNode);
    var baseNodes = mappedGraph.baseNodes;
    var baseLinks = mappedGraph.baseLinks;
    var bin = removeCollapsed(base, addition);
    var merged = angular.copy(base);
    for (var i = 0; i < addition.nodes.length; i++) {
      if (!bin.excludeNodes[addition.nodes[i].id]) {
        if (!baseNodes[addition.nodes[i].id]) {
          merged.nodes.push(addition.nodes[i]);
        }
      } else {
      }
    }
    for (var i = 0; i < addition.links.length; i++) {
      if (!bin.excludeLinks[addition.links[i].id]) {
        if (
          !baseLinks[addition.links[i].id] &&
          (!bin.excludeNodes[addition.links[i].source] ||
            !bin.excludeNodes[addition.links[i].target])
        ) {
          merged.links.push(addition.links[i]);
        }
      } else {
      }
    }
    for (var i = 0; i < merged.nodes.length; i++) merged.nodes[i].nodeId = i;
    removeRedundantCIs(merged);
    return merged;
  }
  function removeRedundantCIs(merged) {
    var nodesInMainGraph = {};
    var rootID = merged.id;
    recurseFindMainGraphNodes(rootID, merged, nodesInMainGraph);
    var floatingNodes = {};
    for (var i = 0; i < merged.nodes.length; i++) {
      if (
        !nodesInMainGraph[merged.nodes[i].id] &&
        !merged.nodes[i].isCollapsed
      ) {
        floatingNodes[merged.nodes[i].id] = true;
      }
    }
    for (var key in floatingNodes) {
      for (var j = 0; j < merged.nodes.length; j++) {
        if (key === merged.nodes[j].id) {
          merged.nodes.splice(j, 1);
          break;
        }
      }
    }
    for (var key in floatingNodes) {
      for (var j = 0; j < merged.links.length; j++) {
        if (key === merged.links[j].source || key === merged.links[j].target) {
          merged.links.splice(j, 1);
          break;
        }
      }
    }
    for (var j = 0; j < merged.nodes.length; j++) {
      merged.nodes[j].nodeId = j;
    }
  }
  function recurseFindMainGraphNodes(parentNodeID, merged, nodesInMainGraph) {
    if (!nodesInMainGraph[parentNodeID]) {
      nodesInMainGraph[parentNodeID] = true;
    }
    for (var i = 0; i < merged.links.length; i++) {
      if (
        merged.links[i].source === parentNodeID ||
        merged.links[i].target === parentNodeID
      ) {
        var nextNodeID =
          merged.links[i].source === parentNodeID
            ? merged.links[i].target
            : merged.links[i].source;
        if (!nodesInMainGraph[nextNodeID]) {
          recurseFindMainGraphNodes(nextNodeID, merged, nodesInMainGraph);
        }
      }
    }
  }
  function removeCollapsedDownstream(colapsedNodes, colapsedLinks, graph) {
    var isChanged = false;
    for (var i = 0; i < graph.links.length; i++) {
      if (
        colapsedNodes[graph.links[i].source] ||
        colapsedNodes[graph.links[i].target]
      ) {
        if (!colapsedLinks[graph.links[i].id]) {
          colapsedLinks[graph.links[i].id] = true;
          isChanged = true;
        }
      }
    }
    if (isChanged) {
      removeCollapsedDownstream(colapsedNodes, colapsedLinks, graph);
    }
  }
  function removeCollapsed(base, newGraph) {
    var colapsedNodes = {};
    var colapsedLinks = {};
    var groups = {};
    for (var i = 0; i < base.nodes.length; i++) {
      if (
        base.nodes[i].isCollapsed &&
        base.nodes[i].hasOwnProperty('collapsedIds') &&
        base.nodes[i].collapsedIds !== ''
      ) {
        groups[base.nodes[i].collapsedIds] = base.nodes[i].id;
        var arrayIDs = base.nodes[i].collapsedIds.split(',');
        for (var j = 0; j < arrayIDs.length; j++) {
          colapsedNodes[arrayIDs[j]] = true;
        }
      }
    }
    for (var i = 0; i < newGraph.nodes.length; i++) {
      if (
        newGraph.nodes[i].isCollapsed &&
        newGraph.nodes[i].hasOwnProperty('collapsedIds') &&
        newGraph.nodes[i].collapsedIds !== ''
      ) {
        var collapsedIds = newGraph.nodes[i].collapsedIds;
        if (groups.hasOwnProperty(collapsedIds)) {
          colapsedNodes[newGraph.nodes[i].id] = true;
        }
      }
    }
    removeCollapsedDownstream(colapsedNodes, colapsedLinks, newGraph);
    return {
      excludeNodes: colapsedNodes,
      excludeLinks: colapsedLinks,
    };
  }
  function serializeGraph(graph) {
    var g = {
      mode: graph.mode,
      id: graph.id,
      infrastructureView: graph.infrastructureView,
      name: graph.name,
      nodes: [],
      links: [],
    };
    for (var i = 0; i < graph.nodes.length; i++)
      g.nodes.push(serializeGraphNode(graph.nodes[i]));
    for (var i = 0; i < graph.links.length; i++)
      g.links.push(serializeGraphLink(graph.links[i]));
    return JSON.stringify(g);
  }
  function serializeGraphNode(node) {
    var n = {};
    var keys = Object.keys(node);
    for (var i = 0; i < keys.length; i++) {
      if (
        typeof node[keys[i]] === 'boolean' ||
        typeof node[keys[i]] === 'number' ||
        typeof node[keys[i]] === 'string'
      )
        n[keys[i]] = node[keys[i]];
    }
    return n;
  }
  function serializeGraphLink(link) {
    var l = {};
    var keys = Object.keys(link);
    for (var i = 0; i < keys.length; i++) {
      if (
        typeof link[keys[i]] === 'boolean' ||
        typeof link[keys[i]] === 'number' ||
        typeof link[keys[i]] === 'string'
      )
        l[keys[i]] = link[keys[i]];
    }
    return l;
  }
  function parseNodeNodeIdAsInteger(graph) {
    if (graph && graph.nodes) {
      for (var i = 0; i < graph.nodes.length; i++)
        graph.nodes[i].nodeId = parseInt(graph.nodes[i].nodeId);
    }
  }
  function sortNodeArrayByNodeId(graph) {
    if (graph && graph.nodes) {
      graph.nodes.sort(function (a, b) {
        if (a.nodeId > b.nodeId) return 1;
        if (a.nodeId < b.nodeId) return -1;
        return 0;
      });
    }
  }
  function findAndSetGraphRoot(graph) {
    if (graph && graph.nodes && graph.id) {
      for (var i = 0; i < graph.nodes.length; i++) {
        if (graph.nodes[i].id === graph.id) {
          graph.root = graph.nodes[i];
          break;
        }
      }
    }
  }
  function parseLinkSourceAndTargetAsInteger(graph) {
    if (!graph || !angular.isArray(graph.links)) return;
    for (var i = 0; i < graph.links.length; i++) {
      graph.links[i].source = parseInt(graph.links[i].source);
      graph.links[i].target = parseInt(graph.links[i].target);
    }
  }
  function ensureLinkSourceAndTargetAreIndicies(graph) {
    if (!graph || !angular.isArray(graph.links)) return;
    for (var i = 0; i < graph.links.length; ) {
      if (
        typeof graph.links[i].target === 'string' &&
        graph.links[i].target.length === 32
      )
        graph.links[i].target = nodeIndexFromSysId(
          graph,
          graph.links[i].target
        );
      if (
        typeof graph.links[i].source === 'string' &&
        graph.links[i].source.length === 32
      )
        graph.links[i].source = nodeIndexFromSysId(
          graph,
          graph.links[i].source
        );
      if (graph.links[i].source === -1 || graph.links[i].target === -1)
        graph.links.splice(i, 1);
      else i++;
    }
  }
  function nodeIndexFromSysId(graph, id) {
    if (!graph || !angular.isArray(graph.nodes)) return -1;
    for (var i = 0; i < graph.nodes.length; i++)
      if (graph.nodes[i].id === id) return graph.nodes[i].nodeId;
    return -1;
  }
  function groupNodesByKey(graph, key) {
    var groups = {};
    var id = -1;
    if (!graph || !angular.isArray(graph.nodes)) return;
    for (var i = 0; i < graph.nodes.length; i++) {
      var value = angular.isUndefined(graph.nodes[i][key])
        ? 'undefined'
        : graph.nodes[i][key].toString();
      if (angular.isUndefined(groups[value])) groups[value] = id++;
      graph.nodes[i].group = groups[value];
    }
  }
  function setArrayObjectProperty(array, property, value) {
    if (angular.isArray(array) && property) {
      for (var i = 0; i < array.length; i++) array[i][property] = value;
    }
  }
  function searchForReachableNodes(root) {
    if (!root.searched) {
      root.searched = true;
      if (!root.isFiltered) {
        root.isReachable = true;
        for (var i = 0; i < root.upstreamNodes.length; i++)
          searchForReachableNodes(root.upstreamNodes[i]);
        for (var i = 0; i < root.downstreamNodes.length; i++)
          searchForReachableNodes(root.downstreamNodes[i]);
      }
    }
  }
  function flagReachable(graph, node) {
    if (!graph || !angular.isArray(graph.nodes)) return;
    if (!node.searched) {
      node.searched = true;
      if (!node.isFiltered) {
        node.isReachable = true;
        if (node.upstream !== undefined && node.upstream.length > 0) {
          for (var i = 0; i < node.upstream.length; i++) {
            var link = node.upstream[i];
            if (!link.searched) {
              link.searched = true;
              if (!link.isFiltered && !link.isFilteredImplicitly) {
                link.isReachable = true;
                flagReachable(graph, graph.nodes[link.source]);
              }
            }
          }
        }
        if (node.downstream !== undefined && node.downstream.length > 0) {
          for (var i = 0; i < node.downstream.length; i++) {
            var link = node.downstream[i];
            if (!link.searched) {
              link.searched = true;
              if (!link.isFiltered && !link.isFilteredImplicitly) {
                link.isReachable = true;
                flagReachable(graph, graph.nodes[link.target]);
              }
            }
          }
        }
      }
    }
  }
  function cacheRelatedLinks(graph) {
    for (var i = 0; i < graph.nodes.length; i++) {
      graph.nodes[i].upstream = api.getLinksWithNodeAsTarget(
        graph,
        graph.nodes[i]
      );
      graph.nodes[i].downstream = api.getLinksWithNodeAsSource(
        graph,
        graph.nodes[i]
      );
    }
  }
  function getAllUpstreamNodes(graph, node) {
    var toCheck = [];
    var included = {};
    toCheck.push(node);
    while (toCheck.length > 0) {
      var current = toCheck.pop();
      if (angular.isUndefined(current)) {
        continue;
      }
      if (included[current.id] === undefined) {
        included[current.id] = current;
        if (current.upstream !== undefined) {
          for (var i = 0; i < current.upstream.length; i++) {
            if (included[current.upstream[i].id] === undefined)
              toCheck.push(graph.nodes[current.upstream[i].source]);
          }
        }
      }
    }
    var all = [];
    for (var key in included) all.push(included[key]);
    return all;
  }
  return (api = {
    getLinksAttachedToNode: function (graph, node) {
      var links = [];
      for (var i = 0; i < graph.links.length; i++)
        if (
          graph.links[i].source === node.nodeId ||
          graph.links[i].target === node.nodeId
        )
          links.push(graph.links[i]);
      return links;
    },
    getLinksWithNodeAsSource: function (graph, node) {
      var links = [];
      for (var i = 0; i < graph.links.length; i++)
        if (graph.links[i].source === node.nodeId) links.push(graph.links[i]);
      return links;
    },
    getLinksWithNodeAsTarget: function (graph, node) {
      var links = [];
      for (var i = 0; i < graph.links.length; i++)
        if (graph.links[i].target === node.nodeId) links.push(graph.links[i]);
      return links;
    },
    getDirectlyRelatedNodesAndLinks: function (graph, node) {
      var links = [];
      var nodes = [];
      for (var i = 0; i < graph.links.length; i++) {
        if (graph.links[i].source === node.nodeId) {
          links.push(graph.links[i]);
          nodes.push(graph.nodes[graph.links[i].target]);
        } else if (graph.links[i].target === node.nodeId) {
          links.push(graph.links[i]);
          nodes.push(graph.nodes[graph.links[i].source]);
        }
      }
      return {
        links: links,
        nodes: nodes,
      };
    },
    serializeGraph: function (graph) {
      return serializeGraph(graph);
    },
    prepareLoadedGraph: function (graph) {
      parseNodeNodeIdAsInteger(graph);
      sortNodeArrayByNodeId(graph);
      findAndSetGraphRoot(graph);
      setArrayObjectProperty(graph.nodes, 'd3id', undefined);
      groupNodesByKey(graph, 'className');
      ensureLinkSourceAndTargetAreIndicies(graph);
      parseLinkSourceAndTargetAsInteger(graph);
      setArrayObjectProperty(graph.links, 'd3id', undefined);
      cacheRelatedLinks(graph);
    },
    setPropertyOnGraphElements: function (graph, property, value) {
      if (graph) {
        if (graph.nodes) setArrayObjectProperty(graph.nodes, property, value);
        if (graph.links) setArrayObjectProperty(graph.links, property, value);
      }
    },
    setPropertyOnGraphNodes: function (graph, property, value) {
      if (graph && graph.nodes)
        setArrayObjectProperty(graph.nodes, property, value);
    },
    setPropertyOnGraphLinks: function (graph, property, value) {
      if (graph && graph.links)
        setArrayObjectProperty(graph.links, property, value);
    },
    ensureLinkSourceAndTargetAreIndicies: function (graph) {
      ensureLinkSourceAndTargetAreIndicies(graph);
    },
    cacheRelatedNodes: function (graph) {
      for (var i = 0; i < graph.nodes.length; i++) {
        var up = this.getLinksWithNodeAsTarget(graph, graph.nodes[i]);
        graph.nodes[i].upstreamNodes = [];
        for (var j = 0; j < up.length; j++)
          graph.nodes[i].upstreamNodes.push(graph.nodes[up[j].source]);
        var down = this.getLinksWithNodeAsSource(graph, graph.nodes[i]);
        graph.nodes[i].downstreamNodes = [];
        for (var k = 0; k < down.length; k++)
          graph.nodes[i].downstreamNodes.push(graph.nodes[down[k].target]);
      }
    },
    flagReachable: function (graph) {
      this.setPropertyOnGraphNodes(graph, 'isReachable', false);
      this.setPropertyOnGraphLinks(graph, 'isReachable', false);
      this.setPropertyOnGraphNodes(graph, 'searched', false);
      this.setPropertyOnGraphLinks(graph, 'searched', false);
      flagReachable(graph, graph.root);
    },
    getAllUpstreamNodes: function (graph, node) {
      return getAllUpstreamNodes(graph, node);
    },
    flattenGraph: function (graph) {
      return flattenGraph(graph);
    },
    mergeGraphs: function (base, addition, expendedNode) {
      return mergeGraphs(base, addition, expendedNode);
    },
  });
});