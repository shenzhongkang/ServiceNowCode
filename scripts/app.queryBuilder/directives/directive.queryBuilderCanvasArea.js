/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderCanvasArea.js */
angular.module('sn.queryBuilder').directive('queryBuilderCanvasArea', [
  'CONSTQB',
  'getTemplateUrl',
  function (CONST, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_canvas_area.xml'),
      controller: [
        '$scope',
        '$rootScope',
        '$timeout',
        'queryBuilderSelection',
        'queryBuilderCanvasUtil',
        'queryBuilderCommon',
        '$window',
        function (
          $scope,
          $rootScope,
          $timeout,
          queryBuilderSelection,
          queryBuilderCanvasUtil,
          queryBuilderCommon,
          $window
        ) {
          $scope.filterConfigRelated = {
            sets: true,
            queryHeuristics: false,
            dotWalking: true,
            saveFilter: false,
            loadFilter: false,
            testFilter: false,
            sortFilter: false,
            runFilter: false,
            clearFilter: false,
            closeFilter: false,
            clearAll: false,
            isInline: true,
            mode: 'automatic',
            outputType: 'encoded_query',
            relatedListQueryConditions: true,
            encodedQuery: '',
          };
          $scope.showFilterType = 'cmdb_ci';
          $scope.toggleShowFilters = function (event, node) {
            if (node && event) {
              event.stopPropagation();
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              if (latestTouched && latestTouched.touched) {
                latestTouched.touched = false;
              }
              if (angular.isDefined(node.nodeType)) {
                queryBuilderCanvasUtil.setLatestTouched(node);
                node.touched = true;
                if (node.filters && node.filters.platform)
                  $scope.showFilterType = node.filters.platform;
                if ($scope.currentQuery && $scope.currentQuery.touched)
                  $scope.currentQuery.touched = false;
              } else if (node.query_type === CONST.QUERY_TYPES.SERVICE) {
                queryBuilderCanvasUtil.setLatestTouched(null);
                $scope.showFilterType = CONST.BASE_SERVICE_CLASS;
                $scope.currentQuery.touched = true;
              }
              latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              if (
                !latestTouched &&
                queryBuilderCommon.isGeneralQuery($scope.currentQuery)
              )
                latestTouched = node;
              if (queryBuilderSelection.hasSelection()) {
                if (queryBuilderSelection.nodeInSelection(latestTouched)) {
                  queryBuilderSelection.clearSelection();
                  $rootScope.$broadcast(
                    'queryBuilder.filterButtonClickedNode',
                    {
                      node: latestTouched,
                    }
                  );
                } else {
                  queryBuilderSelection.clearSelection();
                }
              }
              if (queryBuilderCanvasUtil.getShowFilters()) {
                queryBuilderCanvasUtil.setShowFilters(false);
                $scope.filterConfigRelated.encodedQuery = node.applied_filters;
                $timeout(function () {
                  queryBuilderCanvasUtil.setShowFilters(true);
                });
              } else {
                var showFilters = queryBuilderCanvasUtil.getShowFilters();
                $scope.filterConfigRelated.encodedQuery = node.applied_filters;
                $timeout(function () {
                  queryBuilderCanvasUtil.setShowFilters(true);
                });
              }
            } else {
              queryBuilderCanvasUtil.setShowFilters(false);
            }
          };
          $scope.openServiceQuery = function (event, node) {
            if (node && event) {
              event.stopPropagation();
              if ($scope.tab2 && $scope.tab2.name) {
                $scope.tab2 = angular.copy($scope.currentQuery);
                $scope.tab2.query.graph.nodes = $scope.nodes;
                $scope.tab2.query.graph.edges = $scope.connections;
                $scope.tab2After = angular.copy($scope.tab2);
                $scope.tab2.query = queryBuilderCommon.flattenLocally(
                  $scope.tab2.query
                );
                $scope.tab2AfterFlattened = angular.copy($scope.tab2After);
                $scope.tab2AfterFlattened.query =
                  queryBuilderCommon.flattenGraph(
                    $scope.tab2AfterFlattened.query,
                    $scope.tab2AfterFlattened.name,
                    $scope.tab2AfterFlattened.usedNames
                  );
                $scope.tab2.changed = !angular.equals(
                  $scope.tab2Before,
                  $scope.tab2
                );
                if ($scope.tab2.query.graph.nodes.length === 0)
                  $scope.tab2.changed = false;
              }
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if ($scope.savedQueries[i].sys_id === node.sys_id)
                  $scope.initializeLoadQuery($scope.savedQueries[i], false);
              }
            }
          };
          $scope.stylesForMainContent = function () {
            var twoOpen =
              !$scope.leftContainerClosed && !$scope.rightContainerClosed;
            var leftOpen = !$scope.leftContainerClosed;
            var rightOpen = !$scope.rightContainerClosed;
            var leftPanel = angular.element('.left-panel');
            var rightPanel = angular.element('.right-panel-nav');
            if (leftPanel && leftPanel[0] && rightPanel && rightPanel[0]) {
              var leftPanelWidth = leftOpen ? leftPanel[0].clientWidth : 0;
              var rightPanelWidth = rightOpen
                ? rightPanel[0].clientWidth
                : CONST.SIDE_PANEL_TOGGLE_WIDTH;
              var mainWidth =
                'calc(100% - ' + (leftPanelWidth + rightPanelWidth) + 'px)';
              var leftPosition = leftOpen
                ? leftPanelWidth + 'px'
                : CONST.SIDE_PANEL_TOGGLE_WIDTH + 'px';
              return {
                width: mainWidth,
                left: leftPosition,
              };
            }
            return {};
          };
          $scope.classesForMainContent = function () {
            var oneOpen =
              (!$scope.leftContainerClosed && $scope.rightContainerClosed) ||
              ($scope.leftContainerClosed && !$scope.rightContainerClosed);
            var twoOpen =
              !$scope.leftContainerClosed && !$scope.rightContainerClosed;
            var leftOpen = !$scope.leftContainerClosed;
            return {
              'one-open': oneOpen,
              'two-open': twoOpen,
              'left-open': leftOpen,
            };
          };
          $scope.showCanvasArea = function () {
            return $scope.activeTab === 2 || $scope.activeTab === 3;
          };
          $scope.clearCanvas = function () {
            $scope.$broadcast('clear_canvas');
            $scope.$broadcast('queryBuilder.hide_right_dropdown');
            resetToDefault();
          };
          $scope.getCanvasClearClasses = function () {
            return {
              disabled: !queryBuilderCanvasUtil.getDroppedClass(),
            };
          };
          $scope.disableClearCanvasButton = function () {
            if (queryBuilderCanvasUtil.getDroppedClass()) return false;
            return true;
          };
          $scope.shouldShowNLQSearch = function () {
            var shouldShowNLQSearchFeature = $window.NOW.hasOwnProperty(
              'shouldShowNLQSearch'
            )
              ? $window.NOW.shouldShowNLQSearch
              : false;
            var isWorkspaceActivated = $window.NOW.hasOwnProperty(
              'isCMDB_WS_PluginActivated'
            )
              ? $window.NOW.isCMDB_WS_PluginActivated
              : false;
            return (
              shouldShowNLQSearchFeature &&
              isWorkspaceActivated &&
              $scope.canWrite
            );
          };
          $scope.shouldShowFilters = function () {
            return queryBuilderCanvasUtil.getShowFilters();
          };
          $scope.getLatestTouched = function () {
            return queryBuilderCanvasUtil.getLatestTouched();
          };
          $scope.$on('queryBuilder.toggleShowFilters', function (event, args) {
            $scope.toggleShowFilters(args.event, args.node);
          });
          function resetToDefault() {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (latestTouched) latestTouched.touched = false;
            queryBuilderCanvasUtil.setLatestTouched(null);
            $scope.displayRightPanel = true;
            $scope.headerOffset = CONST.HEADEROFFSET;
            $scope.filterConfigRelated.encodedQuery = '';
            $scope.currentFilters = [];
            queryBuilderCanvasUtil.setShowFilters(false);
            if (queryBuilderSelection.hasSelection())
              queryBuilderSelection.clearSelection();
            $rootScope.$broadcast('queryBuilder.resetTableArea');
          }
          $scope.canvasAPI.openServiceQuery = $scope.openServiceQuery;
        },
      ],
    };
  },
]);
