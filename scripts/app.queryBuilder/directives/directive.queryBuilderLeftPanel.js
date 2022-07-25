/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderLeftPanel.js */
angular.module('sn.queryBuilder').directive('queryBuilderLeftPanel', [
  'CONSTQB',
  'getTemplateUrl',
  function (CONST, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_left_panel.xml'),
      controller: [
        '$scope',
        '$rootScope',
        'i18n',
        '$window',
        '$timeout',
        'queryBuilderTreeUtil',
        'queryBuilderCommon',
        function (
          $scope,
          $rootScope,
          i18n,
          $window,
          $timeout,
          queryBuilderTreeUtil,
          queryBuilderCommon
        ) {
          var options = [];
          $scope.ciClassHierarchyConfig = {
            searchForCI: false,
            width: '318px',
            height: $window.innerHeight - CONST.CLASS_HIERARCHY_OFFSET + 'px',
            options: options,
            showContext: false,
            showHighlight: false,
            showDrag: true,
            showCICount: true,
            searchPlaceholder: i18n.getMessage(
              'queryBuilder.general.searchArtifacts'
            ),
          };
          $scope.leftViews = [];
          $scope.leftViews.push({
            id: 1,
            viewName: i18n.getMessage('queryBuilder.leftTabs.classes'),
          });
          $scope.leftViews.push({
            id: 2,
            viewName: i18n.getMessage('queryBuilder.leftTabs.nonCmdbTables'),
          });
          $scope.leftViews.push({
            id: 3,
            viewName: i18n.getMessage(
              'queryBuilder.leftTabs.savedServiceQueries'
            ),
          });
          $scope.activeLeftView = 1;
          $scope.leftContainerClosed = !$scope.canWrite ? true : false;
          $scope.serviceQueriesSearchTerm = '';
          $scope.setDropImage = function (event, classes) {
            var element = document.getElementById('dnd-image');
            element.innerHTML = classes.name;
            event.dataTransfer.setDragImage(element, 0, 0);
          };
          $scope.toggleNavigation = function (side) {
            if (side === 'leftContainer')
              $scope.leftContainerClosed = !$scope.leftContainerClosed;
            else {
              $scope.rightContainerClosed = !$scope.rightContainerClosed;
              $timeout(function () {
                $scope.displayRightPanel = !$scope.rightContainerClosed;
              });
            }
          };
          $scope.stylesForLeftContainer = function () {
            var w = CONST.SIDE_PANEL_WIDTH;
            var widthInPx = w < 0 ? '0px' : w + 'px';
            var leftPanel = angular.element('.left-panel');
            if (leftPanel && leftPanel[0]) {
              var leftPanelWidth = leftPanel[0].clientWidth;
              return {
                'max-width': widthInPx,
                left: $scope.leftContainerClosed
                  ? CONST.SIDE_PANEL_TOGGLE_WIDTH - leftPanelWidth + 'px'
                  : '0px',
              };
            }
            return {};
          };
          $scope.stylesForLeftContainerContent = function () {
            var w = $scope.leftContainerClosed
              ? 0
              : CONST.SIDE_PANEL_WIDTH - CONST.SIDE_PANEL_TOGGLE_WIDTH;
            var widthInPx = w < 0 ? '0px' : w + 'px';
            return {
              'max-width': widthInPx,
              left: $scope.leftContainerClosed
                ? '-' +
                  (CONST.SIDE_PANEL_WIDTH - CONST.SIDE_PANEL_TOGGLE_WIDTH) +
                  'px'
                : '0px',
            };
          };
          $scope.changeActiveLeft = function (view, focusElement) {
            if ($scope.activeLeftView !== view) {
              $scope.activeLeftView = view;
              if (focusElement) {
                var tab = angular.element(
                  '#queryBuilder-left-panel-tab-' + view
                );
                tab.focus();
              }
              if ($scope.activeLeftView === 1) {
                $rootScope.$broadcast('queryBuilder.loadTreeType', {
                  type: CONST.QUERY_TYPES.GENERAL,
                });
              } else if ($scope.activeLeftView === 2) {
                $rootScope.$broadcast('queryBuilder.loadTreeType', {
                  type: CONST.OBJECT_TYPES.NON_CMDB,
                });
              }
            }
          };
          $scope.savedServiceQueries = function (queries) {
            var savedServiceQueries = [];
            for (var i = 0; i < queries.length; i++) {
              if (queries[i].query.query_type === CONST.QUERY_TYPES.SERVICE)
                savedServiceQueries.push(queries[i]);
            }
            return savedServiceQueries;
          };
          $scope.loadingTree = function () {
            return queryBuilderTreeUtil.getLoadingTree();
          };
          $scope.showTreeArea = function () {
            return $scope.activeLeftView === 1 || $scope.activeLeftView === 2;
          };
          $scope.showSavedServiceCards = function () {
            return $scope.activeLeftView === 3;
          };
          $scope.savedServiceQueryKeyUp = function (e, savedServiceQuery) {
            if (
              queryBuilderCommon.hasAccessibilityEnabled() &&
              e.keyCode === CONST.KEY_CODES.ENTER_KEY
            ) {
              var drop = {
                data: savedServiceQuery,
                type: 'services',
              };
              $rootScope.$broadcast('queryBuilder.accessibility.addNode', {
                drop: drop,
              });
            }
          };
          $scope.getLeftTreeSearchText = function () {
            return queryBuilderTreeUtil.getCurrentTreeType() ===
              CONST.OBJECT_TYPES.NON_CMDB
              ? i18n.getMessage('queryBuilder.leftTabs.search.nonCmdb')
              : i18n.getMessage('queryBuilder.leftTabs.search.classes');
          };
          $scope.getLeftTabsTabIndex = function (view) {
            return view.id === $scope.activeLeftView ? 0 : -1;
          };
          $scope.$on('queryBuilder.loadQuery', function (event, args) {
            $scope.changeActiveLeft(1);
          });
          $scope.$on('queryBuilder.resetLeftTabs', function (event, args) {
            $scope.changeActiveLeft(1);
          });
          $scope.$on(
            'queryBuilder.switchTabFromArrows',
            function (event, args) {
              if (args.panel === CONST.LEFT) {
                if (args.arrow === CONST.KEY_CODES.LEFT_ARROW) {
                  if ($scope.activeLeftView === 1) {
                    $scope.changeActiveLeft($scope.leftViews.length, true);
                  } else {
                    $scope.changeActiveLeft($scope.activeLeftView - 1, true);
                  }
                } else if (args.arrow === CONST.KEY_CODES.RIGHT_ARROW) {
                  if ($scope.activeLeftView === $scope.leftViews.length) {
                    $scope.changeActiveLeft(1, true);
                  } else {
                    $scope.changeActiveLeft($scope.activeLeftView + 1, true);
                  }
                }
              }
            }
          );
        },
      ],
    };
  },
]);
