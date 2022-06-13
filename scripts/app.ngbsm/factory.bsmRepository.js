/*! RESOURCE: /scripts/app.ngbsm/factory.bsmRepository.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmRepository',
    function (
      $resource,
      $rootScope,
      i18n,
      bsmGraph,
      bsmGraphUtilities,
      bsmIndicators,
      bsmUserHistory,
      bsmURL,
      ngBsmConstants,
      cmdbMatomo,
      CONFIG,
      bsmRESTService,
      bsmFilters
    ) {
      'use strict';
      var levelOverride = undefined;
      var mapScriptid = bsmURL.getParameter('mapScriptID');
      var mapScriptParams = bsmURL.getParameter('mapScriptParams');
      if (!mapScriptid) mapScriptid = '';
      var predefinedFilterId = bsmURL.getParameter('preFilterId');
      var expandedNodesOverwrite = [];
      var mapExpandedNodesGroups = {};
      $rootScope.$on('ngbsm.set_max_level', function (event, max) {
        levelOverride = max;
      });
      $rootScope.$on('ngbsm.set_map_script', function (event, pMapScriptId) {
        mapScriptid = pMapScriptId;
      });
      $rootScope.$on(
        'ngbsm.applyPredefinedFilter',
        function (event, pPredefinedFilter) {
          predefinedFilterId = pPredefinedFilter.value;
        }
      );
      function loadBasic(sysId, levels, isService) {
        if (!sysId) return;
        var mapLevel = levels || levelOverride || bsmURL.getParameter('level');
        if (!mapLevel) {
          mapLevel = CONFIG.DEFAULT_MAX_LEVELS;
        }
        cmdbMatomo.trackEvent(
          ngBsmConstants.MATOMO.CATEGORY,
          ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_LEVEL,
          ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_LEVEL + ' ' + mapLevel
        );
        var timer = new StopWatch();
        return bsmRESTService
          .loadMap(
            sysId,
            '',
            mapLevel,
            predefinedFilterId,
            'loadBasic',
            mapScriptid,
            mapScriptParams,
            isService ? 'true' : 'false'
          )
          .then(function (response) {
            if (!response) {
              loadGraphFailure();
              return;
            }
            if (response.archive && response.archive.length > 0) {
              $rootScope.$broadcast('ngbsm.error', {
                error: response.archive,
              });
              return;
            }
            response = JSON.parse(response.map);
            cmdbMatomo.trackEvent(
              ngBsmConstants.MATOMO.CATEGORY,
              ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_LOAD,
              ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_LOAD,
              timer.getTime()
            );
            if (!response || !response.id) {
              loadGraphFailure();
              return;
            }
            timer = new StopWatch();
            bsmGraphUtilities.prepareLoadedGraph(response);
            bsmGraph.push(response);
            bsmGraph.current().infrastructureView = !isService;
            bsmIndicators.loadIndicatorData(bsmGraph.current());
            cmdbMatomo.trackEvent(
              ngBsmConstants.MATOMO.CATEGORY,
              ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_CLIENT_PROCESSING,
              ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_CLIENT_PROCESSING,
              timer.getTime()
            );
            if (!isService)
              bsmUserHistory.save(
                bsmGraph.current().root.className,
                bsmGraph.current().root.id
              );
            $rootScope.$broadcast('ngbsm.load_view_events');
            return response;
          })
          .catch(loadGraphFailure);
      }
      function loadCluster(sysId, levels, stickyNodes, isService) {
        if (!sysId) return;
        var sLevel = levels || levelOverride || bsmURL.getParameter('level');
        return bsmRESTService
          .loadMap(
            sysId,
            JSON.stringify(stickyNodes),
            sLevel,
            predefinedFilterId,
            'loadCluster',
            mapScriptid,
            mapScriptParams,
            isService ? 'true' : 'false'
          )
          .then(function (response) {
            if (!response) {
              loadGraphFailure();
              return;
            }
            if (response.archive && response.archive.length > 0) {
              $rootScope.$broadcast('ngbsm.error', {
                error: response.archive,
              });
              return;
            }
            response = JSON.parse(response.map);
            if (!response || !response.id) {
              loadGraphFailure();
              return;
            }
            bsmGraphUtilities.prepareLoadedGraph(response);
            bsmGraph.push(response);
            bsmGraph.current().infrastructureView = !isService;
            bsmIndicators.loadIndicatorData(bsmGraph.current());
            if (!isService)
              bsmUserHistory.save(
                bsmGraph.current().root.className,
                bsmGraph.current().root.id
              );
            bsmFilters.loadingCluster();
            $rootScope.$broadcast('ngbsm.load_view_events');
            return response;
          })
          .catch(loadGraphFailure);
      }
      function expandBasic(sysId, levels, isService, actionType) {
        if (!sysId) return;
        var sLevel = levels || levelOverride || bsmURL.getParameter('level');
        return bsmRESTService
          .loadMap(
            sysId,
            '',
            sLevel,
            predefinedFilterId,
            actionType || 'expandBasic',
            mapScriptid,
            mapScriptParams,
            isService ? 'true' : 'false'
          )
          .then(function (response) {
            if (!response) {
              loadGraphFailure();
              return;
            }
            if (response.archive && response.archive.length > 0) {
              $rootScope.$broadcast('ngbsm.error', {
                error: response.archive,
              });
              return;
            }
            response = JSON.parse(response.map);
            if (!response || !response.id) {
              loadGraphFailure();
              return;
            }
            var base = bsmGraphUtilities.flattenGraph(bsmGraph.current());
            var merged = bsmGraphUtilities.mergeGraphs(base, response);
            bsmGraphUtilities.prepareLoadedGraph(merged);
            bsmGraph.push(merged);
            bsmGraph.current().infrastructureView = !isService;
            bsmIndicators.loadIndicatorData(bsmGraph.current());
            if (!isService)
              bsmUserHistory.save(
                bsmGraph.current().root.className,
                bsmGraph.current().root.id
              );
            $rootScope.$broadcast('ngbsm.load_view_events');
            return merged;
          })
          .catch(loadGraphFailure);
      }
      function expandCluster(sysId, levels, stickyNodes, isService) {
        if (!sysId) return;
        var sLevel = levels || levelOverride || bsmURL.getParameter('level');
        return bsmRESTService
          .loadMap(
            sysId,
            JSON.stringify(stickyNodes),
            sLevel,
            predefinedFilterId,
            'expandCluster',
            mapScriptid,
            mapScriptParams,
            isService ? 'true' : 'false'
          )
          .then(function (response) {
            if (!response) {
              loadGraphFailure();
              return;
            }
            if (response.archive && response.archive.length > 0) {
              $rootScope.$broadcast('ngbsm.error', {
                error: response.archive,
              });
              return;
            }
            response = JSON.parse(response.map);
            if (!response || !response.id) {
              loadGraphFailure();
              return;
            }
            var base = bsmGraphUtilities.flattenGraph(bsmGraph.current());
            var merged = bsmGraphUtilities.mergeGraphs(
              base,
              response,
              response.id
            );
            bsmGraphUtilities.prepareLoadedGraph(merged);
            merged.root.isCollapsed = false;
            bsmGraph.push(merged);
            bsmGraph.current().infrastructureView = !isService;
            bsmIndicators.loadIndicatorData(bsmGraph.current());
            if (!isService)
              bsmUserHistory.save(
                bsmGraph.current().root.className,
                bsmGraph.current().root.id
              );
            $rootScope.$broadcast('ngbsm.load_view_events');
            return merged;
          })
          .catch(loadGraphFailure);
      }
      function loadGraphFailure() {
        $rootScope.$broadcast('ngbsm.error', {
          error: i18n.getMessage('dependencies.ngbsm.map.error.load'),
        });
      }
      return {
        loadGraph: function (
          sysId,
          levels,
          stickyNodes,
          isService,
          isCluster,
          clusterId
        ) {
          if (!sysId) return;
          var lastLevelDefenition = levelOverride ? levelOverride : levels;
          $rootScope.$broadcast('ngbsm.graph.begin.load');
          if (stickyNodes) {
            for (var i = 0; i < stickyNodes.length; i++) {
              if (expandedNodesOverwrite.indexOf(stickyNodes[i]) < 0) {
                expandedNodesOverwrite.push(stickyNodes[i]);
                mapExpandedNodesGroups[stickyNodes[i]] = clusterId;
              }
            }
            if (isCluster && mapScriptid === '') {
              return expandCluster(
                clusterId,
                lastLevelDefenition,
                expandedNodesOverwrite,
                isService
              );
            } else {
              return loadCluster(
                sysId,
                lastLevelDefenition,
                expandedNodesOverwrite,
                isService
              );
            }
          } else {
            expandedNodesOverwrite = [];
            mapExpandedNodesGroups = {};
            return loadBasic(sysId, lastLevelDefenition, isService);
          }
        },
        expandGraph: function (
          sysId,
          levels,
          stickyNodes,
          isService,
          actionType
        ) {
          if (!sysId) return;
          $rootScope.$broadcast('ngbsm.graph.begin.load');
          if (stickyNodes)
            return expandCluster(sysId, levels, stickyNodes, isService);
          $rootScope.$broadcast('ngbsm.original.graph.changed', actionType);
          return expandBasic(sysId, levels, isService, actionType);
        },
        canCollpaseToVirtualGroup: function (item) {
          var sysId = item.id;
          return angular.isDefined(mapExpandedNodesGroups[sysId]);
        },
        collapseGraph: function (rootSysId, item) {
          var groupID = mapExpandedNodesGroups[item.id];
          var nodesToBeCollapsed = [];
          for (key in mapExpandedNodesGroups) {
            if (mapExpandedNodesGroups[key] === groupID) {
              nodesToBeCollapsed.push(key);
            }
          }
          for (var i = 0; i < nodesToBeCollapsed.length; i++) {
            var key = nodesToBeCollapsed[i];
            var index = expandedNodesOverwrite.indexOf(key);
            if (index > -1) {
              expandedNodesOverwrite.splice(index, 1);
            }
            delete mapExpandedNodesGroups[key];
          }
          var lastLevelDefenition = levelOverride
            ? levelOverride
            : bsmURL.getParameter('level');
          return this.loadGraph(
            rootSysId,
            lastLevelDefenition,
            [],
            undefined,
            item.isCluster,
            item.id
          );
        },
      };
    }
  );