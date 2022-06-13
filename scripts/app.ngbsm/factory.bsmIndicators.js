/*! RESOURCE: /scripts/app.ngbsm/factory.bsmIndicators.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmIndicators',
    function (
      $rootScope,
      $interval,
      $resource,
      $timeout,
      $q,
      bsmGraph,
      bsmGraphUtilities,
      bsmRenderer,
      bsmFilters,
      bsmURL,
      CONFIG,
      RequestFactory,
      bsmRelatedBusinessServices
    ) {
      'use strict';
      var api = null;
      var cache = null;
      var lastResponse = null;
      var fetchTime = Date.now() + CONFIG.INDICATORS_FETCH_DELAY;
      var tasks = $resource('/task.do');
      var indicators = RequestFactory.createResource({
        url: '/api/now/table/bsm_indicator',
        options: null,
        actions: {
          get: {
            method: 'GET',
          },
        },
      });
      var currentLoadDelay = null;
      var currentIndicatorRequest = null;
      var currentEventRequest = null;
      $rootScope.$on('ngbsm.view_mode_switching', function () {
        if (currentLoadDelay !== null) $timeout.cancel(currentLoadDelay);
        if (currentIndicatorRequest !== null) currentIndicatorRequest.abort();
        if (currentEventRequest !== null) currentEventRequest.abort();
        currentLoadDelay = null;
        currentIndicatorRequest = null;
        currentEventRequest = null;
      });
      $rootScope.$on('ngbsm.re_render_indicator_on_map', function () {
        loadAndApplyIndicators(bsmGraph.current());
      });
      function autoRefresh() {
        if (
          Math.abs(Date.now() - fetchTime) >
          CONFIG.INDICATORS_FETCH_DELAY * 2
        )
          loadAndApplyIndicators(bsmGraph.current());
      }
      function cacheIndicators() {
        if (cache !== null) return $timeout(function () {}, 0);
        currentIndicatorRequest = indicators.get();
        return currentIndicatorRequest.promise.then(function (response) {
          currentIndicatorRequest = null;
          cache = {};
          for (var i = 0; i < response.result.length; i++)
            cache[response.result[i].sys_id] = response.result[i];
        });
      }
      function getAllNodes(graph) {
        var nodes = [];
        for (var i = 0; i < graph.nodes.length; i++) {
          var node = graph.nodes[i];
          nodes.push({
            id: node.id,
            collapsedIds: node.collapsedIds,
            isCollapsed: node.isCollapsed,
            isCluster: node.isCluster,
          });
        }
        return nodes;
      }
      function makeNodeMap(graph) {
        var map = {};
        for (var i = 0; i < graph.nodes.length; i++)
          map[graph.nodes[i].id] = graph.nodes[i];
        return map;
      }
      function loadAndApplyIndicators(graph) {
        currentLoadDelay = $timeout(
          function () {},
          fetchTime - Date.now() > 0 ? fetchTime - Date.now() : 0
        );
        currentLoadDelay.then(function () {
          currentLoadDelay = null;
          var indicatorRequest;
          indicatorRequest = cacheIndicators();
          indicatorRequest.then(function () {
            var indicators = bsmRelatedBusinessServices.getIndicators();
            bsmFilters.enumerateTaskFilters(indicators);
            lastResponse = '';
            api.clearIndicators();
            saltGraphWithData(graph, lastResponse);
            bsmRenderer.drawAll(500);
          });
        });
      }
      function saltGraphWithData(graph, data) {
        var nodes = makeNodeMap(graph);
        saltGraphWithCountData(graph, nodes, data);
        saltGraphWithColorData(graph, nodes, data);
      }
      function saltGraphWithCountData(graph, nodes, data) {
        var active = buildActiveFilterMap();
        for (var key in nodes) {
          applyIndicatorFilterToNode(nodes[key], active);
        }
      }
      function saltGraphWithColorData(graph, nodes, data) {
        if (!data || !angular.isArray(data.events)) return;
        var indicators = removeIndicatorDuplicates(data.events);
        for (var i = 0; i < indicators.length; i++) {
          addIndicatorColorToNode(nodes[indicators[i].nodeId], indicators[i]);
          flagAffectedNeighborNodes(nodes[indicators[i].nodeId]);
        }
      }
      function applyIndicatorFilterToNode(node, active) {
        if (!node || !angular.isArray(node.indicators)) return;
        for (var i = 0; i < node.indicators.length; i++) {
          var indicatorID = node.indicators[i].id;
          if (active[indicatorID]) {
            node.indicators[i].show = true;
          } else {
            node.indicators[i].show = false;
          }
        }
      }
      function addIndicatorCountsToNode(node, types, active) {
        if (!node) return;
        var indicators = [];
        var sum = 0;
        for (var property in types) {
          if (types.hasOwnProperty(property) && active[property]) {
            indicators.push({
              type: property,
              value: types[property],
            });
            sum += parseInt(types[property]);
          }
        }
        node.indicatorCount = sum;
        node.indicatorCounts = indicators;
      }
      function addIndicatorColorToNode(node, indicator) {
        if (!node || !indicator) return;
        if (cache[indicator.indicatorId])
          node.indicatorColor = cache[indicator.indicatorId].node_color;
      }
      function flagAffectedNeighborNodes(node) {
        if (!node) return;
        var set = {
          nodes: bsmGraphUtilities.getAllUpstreamNodes(
            bsmGraph.current(),
            node
          ),
        };
        bsmGraphUtilities.setPropertyOnGraphNodes(
          set,
          'affectedNeighbor',
          true
        );
      }
      function removeIndicatorDuplicates(events) {
        var added = {};
        var indicators = [];
        if (!angular.isArray(events)) return indicators;
        for (var i = 0; i < events.length; i++) {
          if (!added[events[i].nodeId]) {
            added[events[i].nodeId] = true;
            indicators.push(events[i]);
          }
        }
        return indicators;
      }
      function getTasksForCI(data) {
        var filter = buildTaskFilterQuery();
        var ids = 'cmdb_ci=' + data.id + '^stateNOT IN3,4,7,6' + filter;
        if (data.isCluster && data.isCollapsed) {
          var all = data.collapsedIds.split(',');
          for (var i = 0; i < all.length; i++)
            ids += '^NQcmdb_ci=' + all[i] + '^stateNOT IN3,4,7,6' + filter;
        }
        return tasks
          .get({
            JSONv2: true,
            sysparm_query: ids,
          })
          .$promise.then(function (response) {
            return response.records;
          });
      }
      function buildTaskFilterQuery() {
        var types = bsmFilters.getTaskFilter().options;
        var first = true;
        var query = '';
        for (var i = 0; i < types.length; i++) {
          if (types[i].checked) {
            query +=
              '^' + (first ? '' : 'OR') + 'sys_class_name=' + types[i].value;
            if (first) first = false;
          }
        }
        return query;
      }
      function buildActiveFilterMap() {
        var types = bsmFilters.getTaskFilter().options;
        var map = {};
        for (var i = 0; i < types.length; i++) {
          if (types[i].checked) map[types[i].value] = true;
        }
        return map;
      }
      return (api = {
        loadIndicatorData: function (graph) {
          fetchTime = Date.now() + CONFIG.INDICATORS_FETCH_DELAY;
          loadAndApplyIndicators(graph);
        },
        clearIndicators: function () {
          bsmGraphUtilities.setPropertyOnGraphNodes(
            bsmGraph.current(),
            'affectedNeighbor',
            false
          );
          bsmGraphUtilities.setPropertyOnGraphNodes(
            bsmGraph.current(),
            'indicatorCount',
            0
          );
          bsmGraphUtilities.setPropertyOnGraphNodes(
            bsmGraph.current(),
            'indicatorCounts',
            undefined
          );
          bsmGraphUtilities.setPropertyOnGraphNodes(
            bsmGraph.current(),
            'indicatorColor',
            undefined
          );
        },
        reapplyIndicators: function (graph) {
          if (lastResponse !== null) saltGraphWithData(graph, lastResponse);
        },
        indicatorColors: function () {
          return {
            change_request: '#fcc721',
            change_task: '#ce43ea',
            incident: '#f74335',
            problem: '#f99320',
            sc_req_item: '#5462d7',
            sc_request: '#5462d7',
            sc_task: '#ce43ea',
          };
        },
        getTasksForCI: function (data) {
          return getTasksForCI(data);
        },
        buildActiveFilterMap: buildActiveFilterMap,
      });
    }
  );