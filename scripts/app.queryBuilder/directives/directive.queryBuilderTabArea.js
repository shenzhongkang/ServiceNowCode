/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderTabArea.js */
angular.module('sn.queryBuilder').directive('queryBuilderTabArea', [
  'i18n',
  'CONSTQB',
  function (i18n, CONST) {
    'use strict';
    return {
      restrict: 'E',
      template:
        '' +
        '<div class="tab-area nav-tabs" role="tablist">' +
        '	<div class="queryBuilder-tab saved-queries-tab tabs2_tab" ng-class="{\'active\': activeTab === 1}" ng-click="tabClicked($event, 1)" role="tab" tabindex="{{getQueryTabsTabIndex(1)}}" sn-enter-click="" id="queryBuilder-queries-tab-1">' +
        '		<p class="tab-title">' +
        i18n.getMessage('queryBuilder.tabs.savedQueries') +
        '</p>' +
        '	</div>' +
        '	<div class="queryBuilder-tab canvas-tab tabs2_tab" ng-class="{\'active\': activeTab === 2}" ng-click="tabClicked($event, 2)" ng-show="tab2.active" role="tab" tabindex="{{getQueryTabsTabIndex(2)}}" aria-label="{{tabName(2)}}" sn-enter-click="" id="queryBuilder-queries-tab-2">' +
        '		<p class="tab-title" sn-tooltip-basic="{{tabName(2)}}" overflow-only="true">{{tabName(2)}}</p>' +
        '		<button class="btn btn-icon close icon-cross navbar-right tab-close-button" title="' +
        i18n.getMessage('queryBuilder.tabs.closeQuery') +
        '" ng-click="closeActiveCanvas($event, 2)">' +
        '			<span class="sr-only">' +
        i18n.getMessage('queryBuilder.tabs.closeQuery') +
        '</span>' +
        '		</button>' +
        '	</div>' +
        '	<div class="queryBuilder-tab canvas-tab tabs2_tab" ng-class="{\'active\': activeTab === 3}" ng-click="tabClicked($event, 3)" ng-show="tab3.active" role="tab" tabindex="{{getQueryTabsTabIndex(3)}}" aria-label="{{tabName(3)}}" sn-enter-click="" id="queryBuilder-queries-tab-3">' +
        '		<p class="tab-title" sn-tooltip-basic="{{tabName(3)}}" overflow-only="true">{{tabName(3)}}</p>' +
        '		<button class="btn btn-icon close icon-cross navbar-right tab-close-button" title="' +
        i18n.getMessage('queryBuilder.tabs.closeQuery') +
        '" ng-click="closeActiveCanvas($event, 3)">' +
        '			<span class="sr-only">' +
        i18n.getMessage('queryBuilder.tabs.closeQuery') +
        '</span>' +
        '		</button>' +
        '	</div>' +
        '</div>',
      controller: [
        '$scope',
        '$rootScope',
        'queryBuilderCommon',
        '$timeout',
        function ($scope, $rootScope, queryBuilderCommon, $timeout) {
          $scope.activeTab = 1;
          $scope.tab2 = {};
          $scope.tab3 = {};
          $scope.tabClicked = function (event, tab, focusElement) {
            if (event) event.stopPropagation();
            var previousTab = $scope.activeTab;
            $scope.activeTab = tab;
            if (focusElement) {
              var tab = angular.element('#queryBuilder-queries-tab-' + tab);
              tab.focus();
            }
            if (previousTab !== $scope.activeTab) {
              $rootScope.$broadcast('queryBuilder.resetTableArea');
              $rootScope.$broadcast('queryBuilder.closeInfoBox');
              if (tab === 1) {
                if ($scope.tab2 && $scope.tab2.name && previousTab === 2) {
                  $scope.tab2 = angular.copy($scope.currentQuery);
                  $scope.tab2Before.registeredValue =
                    $scope.tab2.registeredValue;
                  $scope.tab2Before.resultTable = $scope.tab2.resultTable;
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
                  $scope.tab2Before.tags = $scope.tab2.tags;
                  $scope.tab2.changed = !angular.equals(
                    $scope.tab2Before,
                    $scope.tab2
                  );
                  if ($scope.tab2.query.graph.nodes.length === 0)
                    $scope.tab2.changed = false;
                } else if (
                  $scope.tab3 &&
                  $scope.tab3.name &&
                  previousTab === 3
                ) {
                  $scope.tab3 = angular.copy($scope.currentQuery);
                  $scope.tab3Before.registeredValue =
                    $scope.tab3.registeredValue;
                  $scope.tab3Before.resultTable = $scope.tab3.resultTable;
                  $scope.tab3Before.hasEntryPoint = $scope.tab3.hasEntryPoint;
                  $scope.tab3.query.graph.nodes = $scope.nodes;
                  $scope.tab3.query.graph.edges = $scope.connections;
                  $scope.tab3After = angular.copy($scope.tab3);
                  $scope.tab3.query = queryBuilderCommon.flattenLocally(
                    $scope.tab3.query
                  );
                  $scope.tab3AfterFlattened = angular.copy($scope.tab3After);
                  $scope.tab3AfterFlattened.query =
                    queryBuilderCommon.flattenGraph(
                      $scope.tab3AfterFlattened.query,
                      $scope.tab3AfterFlattened.name,
                      $scope.tab3AfterFlattened.usedNames
                    );
                  $scope.tab3Before.tags = $scope.tab3.tags;
                  $scope.tab3.changed = !angular.equals(
                    $scope.tab3Before,
                    $scope.tab3
                  );
                  if ($scope.tab3.query.graph.nodes.length === 0)
                    $scope.tab3.changed = false;
                }
                queryBuilderCommon.updateSavedQueryURLParameter(null);
              } else if (tab === 2) {
                if ($scope.tab3 && $scope.tab3.name && previousTab === 3) {
                  $scope.tab3 = angular.copy($scope.currentQuery);
                  $scope.tab3Before.registeredValue =
                    $scope.tab3.registeredValue;
                  $scope.tab3Before.resultTable = $scope.tab3.resultTable;
                  $scope.tab3Before.hasEntryPoint = $scope.tab3.hasEntryPoint;
                  $scope.tab3.query.graph.nodes = $scope.nodes;
                  $scope.tab3.query.graph.edges = $scope.connections;
                  $scope.tab3After = angular.copy($scope.tab3);
                  $scope.tab3.query = queryBuilderCommon.flattenLocally(
                    $scope.tab3.query
                  );
                  $scope.tab3AfterFlattened = angular.copy($scope.tab3After);
                  $scope.tab3AfterFlattened.query =
                    queryBuilderCommon.flattenGraph(
                      $scope.tab3AfterFlattened.query,
                      $scope.tab3AfterFlattened.name,
                      $scope.tab3AfterFlattened.usedNames
                    );
                  $scope.tab3Before.tags = $scope.tab3.tags;
                  $scope.tab3.changed = !angular.equals(
                    $scope.tab3Before,
                    $scope.tab3
                  );
                  if ($scope.tab3.query.graph.nodes.length === 0)
                    $scope.tab3.changed = false;
                }
                $scope.currentQuery = angular.copy($scope.tab2);
                $scope.loadingNodes = true;
                $scope.clearCanvas();
                $rootScope.$broadcast(
                  'queryBuilder.loadQuery',
                  $scope.currentQuery.query.graph
                );
                queryBuilderCommon.updateSavedQueryURLParameter(
                  $scope.currentQuery.sys_id
                );
              } else if (tab === 3) {
                if ($scope.tab2 && $scope.tab2.name && previousTab === 2) {
                  $scope.tab2 = angular.copy($scope.currentQuery);
                  $scope.tab2Before.registeredValue =
                    $scope.tab2.registeredValue;
                  $scope.tab2Before.resultTable = $scope.tab2.resultTable;
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
                  $scope.tab2Before.tags = $scope.tab2.tags;
                  $scope.tab2.changed = !angular.equals(
                    $scope.tab2Before,
                    $scope.tab2
                  );
                  if ($scope.tab2.query.graph.nodes.length === 0)
                    $scope.tab2.changed = false;
                }
                $scope.currentQuery = angular.copy($scope.tab3);
                if ($scope.currentQuery.query.returnValues.length > 0)
                  $scope.currentQuery.query.returnValues =
                    $scope.expandOptionLabels($scope.currentQuery.query);
                $scope.loadingNodes = true;
                $scope.clearCanvas();
                $rootScope.$broadcast(
                  'queryBuilder.loadQuery',
                  $scope.currentQuery.query.graph
                );
                queryBuilderCommon.updateSavedQueryURLParameter(
                  $scope.currentQuery.sys_id
                );
              }
            }
          };
          $scope.closeActiveCanvas = function (event, tab, fromDelete) {
            if (event) event.stopPropagation();
            $rootScope.$broadcast('queryBuilder.closeInfoBox');
            if ($scope.activeTab === tab) {
              $scope['tab' + tab] = angular.copy($scope.currentQuery);
              $scope['tab' + tab].query.graph.nodes = $scope.nodes;
              $scope['tab' + tab].query.graph.edges = $scope.connections;
              $scope['tab' + tab + 'After'] = angular.copy($scope['tab' + tab]);
              $scope['tab' + tab + 'Before'].registeredValue =
                $scope['tab' + tab].registeredValue;
              $scope['tab' + tab + 'Before'].resultTable =
                $scope['tab' + tab].resultTable;
              $scope['tab' + tab + 'Before'].hasEntryPoint =
                $scope['tab' + tab].hasEntryPoint;
              $scope['tab' + tab + 'Before'].tags = $scope['tab' + tab].tags;
              $scope['tab' + tab + 'Before'].humanReadable =
                $scope['tab' + tab].humanReadable;
              $scope['tab' + tab].query = queryBuilderCommon.flattenLocally(
                $scope['tab' + tab].query
              );
              $scope['tab' + tab + 'AfterFlattened'] = angular.copy(
                $scope['tab' + tab + 'After']
              );
              $scope['tab' + tab + 'AfterFlattened'].query =
                queryBuilderCommon.flattenGraph(
                  $scope['tab' + tab + 'AfterFlattened'].query,
                  $scope['tab' + tab + 'AfterFlattened'].name,
                  $scope['tab' + tab + 'AfterFlattened'].usedNames
                );
              $scope['tab' + tab].changed = !angular.equals(
                $scope['tab' + tab + 'Before'],
                $scope['tab' + tab]
              );
              if ($scope['tab' + tab].query.graph.nodes.length === 0)
                $scope['tab' + tab].changed = false;
              if (
                $scope['tab' + tab].changed &&
                $scope.canWrite &&
                !fromDelete
              ) {
                promptForSaveCloseTab(event, {
                  tab: tab,
                });
              } else {
                $timeout(function () {
                  var previousTab = $scope.activeTab;
                  $scope.activeTab = 1;
                  $scope['tab' + tab].active = false;
                  $scope['tab' + tab] = {};
                  queryBuilderCommon.updateSavedQueryURLParameter(null);
                  if ($scope.showResults) $scope.showResults = false;
                });
              }
            } else if ($scope.activeTab !== tab) {
              if (
                $scope['tab' + tab].changed &&
                $scope.canWrite &&
                !fromDelete
              ) {
                promptForSaveCloseTab(event, {
                  tab: tab,
                });
              } else {
                $timeout(function () {
                  $scope['tab' + tab].active = false;
                  $scope['tab' + tab] = {};
                  if ($scope.showResults) $scope.showResults = false;
                });
              }
            }
          };
          $scope.tabName = function (tab) {
            if (tab === $scope.activeTab) return $scope.currentQuery.name;
            else if (
              tab !== $scope.activeTab &&
              $scope['tab' + tab] &&
              $scope['tab' + tab].name
            )
              return $scope['tab' + tab].name;
            return '';
          };
          $scope.getQueryTabsTabIndex = function (tab) {
            return tab === $scope.activeTab ? 0 : -1;
          };
          $scope.$on(
            'queryBuilder.switchTabFromArrows',
            function (event, args) {
              if (args.panel === CONST.SAVED_QUERIES) {
                if (args.arrow === CONST.KEY_CODES.LEFT_ARROW) {
                  if ($scope.activeTab === 1) {
                    if ($scope.tab3.active) {
                      $scope.tabClicked(null, 3, true);
                    } else if ($scope.tab2.active) {
                      $scope.tabClicked(null, 2, true);
                    }
                  } else if ($scope.activeTab === 2) {
                    $scope.tabClicked(null, 1, true);
                  } else if ($scope.activeTab === 3) {
                    if ($scope.tab2.active) {
                      $scope.tabClicked(null, 2, true);
                    } else {
                      $scope.tabClicked(null, 1, true);
                    }
                  }
                } else if (args.arrow === CONST.KEY_CODES.RIGHT_ARROW) {
                  if ($scope.activeTab === 1) {
                    if ($scope.tab2.active) {
                      $scope.tabClicked(null, 2, true);
                    } else if ($scope.tab3.active) {
                      $scope.tabClicked(null, 3, true);
                    }
                  } else if ($scope.activeTab === 2) {
                    if ($scope.tab3.active) {
                      $scope.tabClicked(null, 3, true);
                    } else {
                      $scope.tabClicked(null, 1, true);
                    }
                  } else if ($scope.activeTab === 3) {
                    $scope.tabClicked(null, 1, true);
                  }
                }
              }
            }
          );
          function promptForSaveCloseTab(event, data) {
            var tab = data.tab;
            $scope.dialogInfo = {
              header: i18n.getMessage('queryBuilder.dialog.box.label'),
              message:
                i18n.getMessage('queryBuilder.dialog.box.message1') +
                ' ' +
                $scope['tab' + tab].name +
                '. ' +
                i18n.getMessage('queryBuilder.dialog.box.message2'),
              buttons: [
                {
                  label: i18n.getMessage('queryBuilder.dialog.box.cancel'),
                  callBack: function () {
                    leaveWithoutSaveCloseTab(event, data);
                  },
                },
                {
                  label: i18n.getMessage('queryBuilder.dialog.box.confirm'),
                  callBack: function () {
                    $scope.saveQueryFromPromptCloseTab(event, data);
                  },
                  primary: true,
                },
              ],
            };
            $rootScope.$broadcast('dialogBox.open');
          }
          function leaveWithoutSaveCloseTab(event, data) {
            $scope['tab' + data.tab].changed = false;
            if ($scope.activeTab === data.tab) {
              $timeout(function () {
                var previousTab = $scope.activeTab;
                $scope.activeTab = 1;
                $scope['tab' + data.tab].active = false;
                $scope['tab' + data.tab] = {};
                if ($scope.showResults) $scope.showResults = false;
                queryBuilderCommon.updateSavedQueryURLParameter(null);
              });
            } else if ($scope.activeTab !== data.tab)
              $scope.closeActiveCanvas(event, data.tab);
          }
        },
      ],
    };
  },
]);
