/*! RESOURCE: /scripts/app.ngbsm/directive.snBsmBottomRelated.js */
(function () {
  'use strict';
  var app = angular.module('sn.ngbsm');
  app.directive('snSetTitleOnOverflow', function () {
    var MAX_WIDTH = 160 - (2 * 6 + 2 * 1.111);
    return {
      restrict: 'A',
      scope: {
        title: '=titleBind',
      },
      link: function (scope, elem) {
        if (!elem || elem.length === 0) return;
        elem.text(scope.title);
        var w = elem.width();
        var roundedWidth = Math.round(w * 1000) / 1000;
        if (roundedWidth < MAX_WIDTH) return;
        elem.attr('title', scope.title);
        if (!elem.data('bs.tooltip')) {
          elem.tooltip();
          elem.hideFix();
        }
      },
    };
  });
  app.directive(
    'snBsmBottomRelated',
    function (
      $rootScope,
      $timeout,
      $window,
      bsmCamera,
      bsmCanvas,
      bsmGraph,
      bsmRelatedBusinessServices,
      bsmIndicators,
      CONFIG,
      i18n,
      CONST
    ) {
      return {
        restrict: 'E',
        replace: false,
        scope: {
          bottomRelated: '=data',
        },
        templateUrl:
          '/angular.do?sysparm_type=get_partial&name=sn_bsm_bottom_related.xml',
        controller: function ($scope, $element, CONST, bsmAccessibility) {
          var currentSelectedBS = '';
          var currentSelectedBSMetadata = {};
          var lastUserSelectedTab = 0;
          var activeIndicators = null;
          $scope.accessibility = bsmAccessibility.state;
          $scope.selectionAlert = '';
          angular.element('sn-bsm-bottom-related').css('display', 'none');
          function initializeRelated() {
            currentSelectedBS = '';
            currentSelectedBSMetadata = {};
          }
          function sortTabsByLabel(a, b) {
            return a.label > b.label ? 1 : -1;
          }
          function filterActiveIndicators(items) {
            var active = [];
            if (!activeIndicators) return items;
            for (var i in items) {
              if (activeIndicators[items[i].id]) active.push(items[i]);
            }
            return active;
          }
          function initializeIndicators() {
            $scope.selectedTab = '';
            lastUserSelectedTab = 0;
            $scope.flagInitial = true;
            for (var key in $scope.indicators) {
              $scope.displayTable(key);
            }
            $scope.businessServices = $scope.filteredBusinessServices();
            $timeout(function () {
              var sortByDesc = [];
              angular.forEach($scope.indicators, function (item, key) {
                item.id = key;
                if ($scope.indicatorDisplayFilter(item)) {
                  sortByDesc.push(item);
                }
              });
              sortByDesc.sort(sortTabsByLabel);
              $scope.sortedIndicators = sortByDesc;
              $scope.activeIndicators = filterActiveIndicators(
                $scope.sortedIndicators
              );
              $scope.selectTab(pickActiveTab());
              $timeout(function () {
                $scope.flagInitial = false;
              }, 200);
            }, 800);
          }
          function clearSelectedBS() {
            angular.forEach(currentSelectedBSMetadata._cis, function (ci_id) {
              angular.element('#' + ci_id).css({
                fill: '',
                stroke: '',
              });
            });
            initializeRelated();
          }
          $scope.flagInitial = true;
          $scope.RELATED_TAB = 'tab_related_business_services';
          $scope.businessServices = [];
          $scope.selectedTab = '';
          $scope.mapSelectedNode = '';
          $scope.indicators = {};
          $scope.sortedIndicators = [];
          $scope.activeIndicators = [];
          $scope.$on(
            'ngbsm.related_business_services_loaded',
            function (event, data) {
              initializeRelated();
              initializeIndicators();
            }
          );
          $scope.$on('ngbsm.indicators_loaded', function (event, data) {
            $scope.indicators = bsmRelatedBusinessServices.getIndicators();
            initializeIndicators();
          });
          var filtersChangedListener = $rootScope.$on(
            'ngbsm.filters_changed',
            function () {
              var active = bsmIndicators.buildActiveFilterMap();
              if (angular.isObject(active) && Object.keys(active).length !== 0)
                activeIndicators = active;
              else return;
              $scope.activeIndicators = filterActiveIndicators(
                $scope.sortedIndicators
              );
              if (!$scope.flagInitial) {
                var active = pickActiveTab();
                setActiveTab(active);
              }
            }
          );
          $element.on('$destroy', function () {
            filtersChangedListener();
            $scope.$destroy();
          });
          $scope.$on('ngbsm.node_selected', function (event, nodeSelected) {
            if (typeof nodeSelected === 'undefined' || nodeSelected === null) {
              console.error(
                'directive.snBsmBottomRelated.js-> failed retrieveing selected node'
              );
            } else {
              $scope.mapSelectedNode =
                typeof nodeSelected.id === 'undefined' ? '' : nodeSelected.id;
              clearSelectedBS();
              $scope.businessServices = $scope.filteredBusinessServices();
              if ($scope.selectedTab !== $scope.RELATED_TAB) {
                $scope.displayTable($scope.selectedTab);
              }
              if (!$scope.flagInitial) {
                var active = pickActiveTab();
                setActiveTab(active);
              }
            }
          });
          $scope.$watch('bottomRelated.open', function (isNowTrue) {
            if (bsmGraph.current()) {
              if (isNowTrue) {
                angular
                  .element('sn-bsm-bottom-related')
                  .css('display', 'block');
                bsmCamera.fitToScreen(bsmGraph.current());
                bsmCamera.moveCamera(500);
              } else {
                $timeout(function () {
                  bsmCamera.fitToScreen(bsmGraph.current());
                  bsmCamera.moveCamera(650).done(function () {
                    angular
                      .element('sn-bsm-bottom-related')
                      .css('display', 'none');
                    $scope.$apply();
                  });
                }, 50);
              }
            }
          });
          $scope.indicatorDisplayFilter = function (indicatorMetadata) {
            return (
              indicatorMetadata.table && indicatorMetadata.table !== 'task_ci'
            );
          };
          $scope.filteredBusinessServices = function () {
            return bsmRelatedBusinessServices.getBusinessServicesforCI(
              $scope.mapSelectedNode
            );
          };
          $scope.isBSSelected = function (bsID) {
            return currentSelectedBS === bsID;
          };
          $scope.doSelectBS = function (BS) {
            clearSelectedBS();
            if (BS.id !== currentSelectedBS) {
              currentSelectedBS = BS.id;
              currentSelectedBSMetadata = BS;
              var ciNames = [];
              angular.forEach(BS._cis, function (ci_id) {
                var elem = angular.element('#' + ci_id).css({
                  fill: '#fff1b2',
                  stroke: '#ffca1f',
                });
                ciNames.push(
                  elem
                    .siblings('.node-content-indicators')
                    .find('.label')
                    .text()
                );
              });
              $scope.selectionAlert =
                i18n.getMessage('accessibility.ngbsm.selected_cis') +
                ' ' +
                ciNames.join(', ');
            }
          };
          $scope.keyboardAction = function (e, BS, isMappingPluginEnabled) {
            if (e.keyCode === CONST.KEYCODE_SPACE) {
              $scope.openTopologyMap(BS, isMappingPluginEnabled);
            }
          };
          $scope.openTopologyMap = function (BS, isMappingPluginEnabled) {
            var URL = '';
            if (isMappingPluginEnabled) {
              switch (BS.type) {
                case 'REGULAR':
                  URL =
                    '$sw_topology_map.do?sysparm_bsid=' +
                    BS.id +
                    '&sysparm_bsname=' +
                    BS.name +
                    '&sysparm_plugin_mode=mapping&sysparam_back_ref=disabled';
                  break;
                case 'MANUAL':
                  URL =
                    '$sa_manual_bs_map.do?sysparm_bsid=' +
                    BS.id +
                    '&sysparm_bsname=' +
                    BS.name +
                    '&sysparm_plugin_mode=assurance&sysparam_back_ref=manual_table';
                  break;
                case 'TECHNICAL':
                  URL =
                    '$sa_qbs_view.do?sysparm_bsid=' +
                    BS.id +
                    '&sysparm_bsname=' +
                    BS.name +
                    '&sysparm_plugin_mode=mapping&sysparam_back_ref=disabled';
                  break;
              }
              $window.open(URL, '_blank');
            }
          };
          $scope.panelHeight = function () {
            return CONFIG.BOTTOM_PANEL_HEIGHT + 'px';
          };
          $scope.panelOffset = function () {
            if ($scope.bottomRelated.open) return '0px';
            return -CONFIG.BOTTOM_PANEL_HEIGHT + 'px';
          };
          $scope.contentHeight = function () {
            return CONFIG.BOTTOM_PANEL_HEIGHT - 8 + 'px';
          };
          $scope.listHeight = function () {
            return CONFIG.BOTTOM_PANEL_HEIGHT - (8 + 50 + 30) + 'px';
          };
          $scope.tableHeight = function () {
            var tabsHeight = angular.element('#headerTabs')[0].offsetHeight;
            return CONFIG.BOTTOM_PANEL_HEIGHT - 8 - tabsHeight + 'px';
          };
          $scope.toggleOpen = function () {
            $scope.bottomRelated.open = !$scope.bottomRelated.open;
          };
          $scope.isActive = function (uniqueTabIdentifier) {
            var res = $scope.selectedTab === uniqueTabIdentifier;
            return res;
          };
          $scope.isEnabled = function (tabId) {
            if (tabId === $scope.RELATED_TAB)
              return $scope.hasAny($scope.filteredBusinessServices());
            if (activeIndicators && !activeIndicators[tabId]) return false;
            return $scope.hasAnyEvents(tabId);
          };
          $scope.selectTab = function (tabId) {
            setActiveTab(tabId);
            lastUserSelectedTab = tabId;
          };
          function setActiveTab(tabId) {
            if ($scope.selectedTab === tabId) return;
            $scope.selectedTab = tabId;
            if ($scope.selectedTab !== $scope.RELATED_TAB) {
              $scope.displayTable($scope.selectedTab);
            }
          }
          function pickActiveTab() {
            if (lastUserSelectedTab === $scope.RELATED_TAB) {
              if ($scope.isEnabled($scope.RELATED_TAB))
                return lastUserSelectedTab;
            } else if ($scope.isEnabled(lastUserSelectedTab)) {
              return lastUserSelectedTab;
            }
            var curr;
            for (var i = 0; i < $scope.activeIndicators.length; i++) {
              curr = $scope.activeIndicators[i];
              if (
                $scope.indicatorDisplayFilter(curr) &&
                $scope.isEnabled(curr.id)
              )
                return curr.id;
            }
            if ($scope.isEnabled($scope.RELATED_TAB)) return $scope.RELATED_TAB;
            return $scope.selectedTab;
          }
          $scope.count = function (array) {
            if (array) return array.length;
            return 0;
          };
          $scope.hasAny = function (array) {
            return array.length > 0 ? true : false;
          };
          $scope.hasAnyEvents = function (indicatorID) {
            if (!$scope.indicators[indicatorID]) return false;
            return !angular.equals({}, $scope.indicators[indicatorID]._cis);
          };
          $scope.hasAnyEventsForCurrentCI = function () {
            if (!$scope.selectedTab) return false;
            var hasEvents = $scope.hasAnyEvents($scope.selectedTab);
            if ($scope.mapSelectedNode !== '') {
              hasEvents =
                hasEvents &&
                $scope.indicators[$scope.selectedTab]._cis.hasOwnProperty(
                  $scope.mapSelectedNode
                );
            }
            return hasEvents;
          };
          $scope.eventsEnabled = function () {
            return CONFIG.FLAG_EVENT_MANAGEMENT_ENABLED;
          };
          $scope.displayTabels = function () {
            if ($scope.flagInitial) return 'none';
            var allTabsDisabled = true;
            for (var key in $scope.activeIndicators) {
              if ($scope.hasAnyEvents($scope.activeIndicators[key].id)) {
                allTabsDisabled = false;
                break;
              }
            }
            if (allTabsDisabled) return 'none';
            else return '';
          };
          $scope.tableConfig = {
            condensed: true,
            openable: true,
            selectable: false,
            filterable: true,
            configurable: false,
            disallowManualGrouping: true,
            linkToNewTab: true,
            disableFooterPagination: true,
            rowsPerPage: 6,
            table: '',
            query: '',
            rowTemplate: null,
            columnTemplates: null,
            view: '',
          };
          $scope.displayTable = function (indicatorKey) {
            if (!indicatorKey || !$scope.indicators[indicatorKey]) return;
            var cisList = [];
            if ($scope.mapSelectedNode === '') {
              var nodeArray = bsmGraph.current().nodes;
              angular.forEach(
                nodeArray,
                function (node) {
                  cisList.push(node.id);
                },
                cisList
              );
            } else {
              cisList.push($scope.mapSelectedNode);
            }
            var tableName = $scope.indicators[indicatorKey].table;
            var tableQuery = bsmRelatedBusinessServices.getIndicatorsQuery(
              indicatorKey,
              cisList
            );
            $scope.tableConfig.table = tableName;
            $scope.tableConfig.query = tableQuery;
            if (tableName === CONST.TABLES.SVC_CI_ASSOC)
              $scope.tableConfig.view = CONST.VIEWS.SVC_CI_ASSOC_DEP;
            $scope.$broadcast('sn_table_reset_pagination', $scope.tableConfig);
          };
        },
        link: function ($scope, $element, $attr) {},
      };
    }
  );
})();