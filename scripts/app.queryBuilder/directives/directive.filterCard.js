/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.filterCard.js */
angular.module('sn.queryBuilder').directive('filterCard', [
  'i18n',
  'CONSTQB',
  function (i18n, CONST) {
    'use strict';
    return {
      restrict: 'E',
      template:
        '' +
        '<div class="filter-cards" ng-repeat="filter in currentFilters">' +
        '	<div class="filter-card" ng-class="{selected: filter.node.touched}" ng-click="filterCardClicked(filter)" role="presentation" tabindex="0">' +
        '		<div class="filter-card-header">' +
        '			<img role="presentation" draggable="false" style="width: 24px; height: 24px; margin-right: 8px;" ng-src="{{::filter.node.image}}" ng-if="showFilterCardImage(filter)"/>' +
        '			{{filter.node.name}}' +
        '			<button class="btn btn-icon icon-cross delete-button navbar-right" title="' +
        i18n.getMessage('queryBuilder.general.removeFilter') +
        '" ng-click="removeFilter($index, filter)" aria-label="' +
        i18n.getMessage('queryBuilder.general.removeFilter') +
        '" ng-if="canWrite"></button>' +
        '		</div>' +
        '		<div class="filter-card-content">' +
        '			<div ng-show="filter.applied_filters">' +
        '				<span>' +
        i18n.getMessage('queryBuilder.general.attributeConditions') +
        '</span>' +
        '				<br />' +
        '				<p ng-repeat="readable in filter.humanReadable_attrib track by $index" style="min-height: 13px;">' +
        '					{{readable}}' +
        '				</p>' +
        '			</div>' +
        '		</div>' +
        '	</div>' +
        '</div>',
      controller: [
        '$scope',
        '$rootScope',
        '$timeout',
        'encodedQueryService',
        'queryBuilderCanvasUtil',
        'queryBuilderCommon',
        function (
          $scope,
          $rootScope,
          $timeout,
          encodedQueryService,
          queryBuilderCanvasUtil,
          queryBuilderCommon
        ) {
          $scope.filterCardClicked = function (filter) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (latestTouched && latestTouched.touched)
              latestTouched.touched = false;
            if ($scope.currentQuery.touched)
              $scope.currentQuery.touched = false;
            filter.node.touched = true;
            if (angular.isDefined(filter.node.nodeType)) {
              queryBuilderCanvasUtil.setLatestTouched(filter.node);
              latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              latestTouched.touched = true;
              if (filter.node.nodeType === CONST.NODETYPE.CLASS)
                latestTouched.touchedType = CONST.OBJECT_TYPES.NODE;
              else if (filter.node.nodeType === CONST.NODETYPE.SERVICE)
                latestTouched.touchedType = CONST.OBJECT_TYPES.SERVICE;
              else if (filter.node.nodeType === CONST.OBJECT_TYPES.NON_CMDB)
                latestTouched.touchedType = CONST.OBJECT_TYPES.NON_CMDB;
            } else {
              queryBuilderCanvasUtil.setLatestTouched(null);
              latestTouched = filter.node;
            }
            if (queryBuilderCanvasUtil.getShowFilters())
              queryBuilderCanvasUtil.setShowFilters(false);
            if (
              latestTouched.filters &&
              latestTouched.filters.platform &&
              $scope.canWrite
            ) {
              $scope.showFilterType = latestTouched.filters.platform;
              $scope.filterConfigRelated.encodedQuery =
                latestTouched.applied_filters;
              $timeout(function () {
                queryBuilderCanvasUtil.setShowFilters(true);
              });
            } else if (
              $scope.canWrite &&
              latestTouched.query.query_type === CONST.QUERY_TYPES.SERVICE
            ) {
              $scope.showFilterType = CONST.BASE_SERVICE_CLASS;
              $scope.filterConfigRelated.encodedQuery =
                latestTouched.query.applied_filters;
              $timeout(function () {
                queryBuilderCanvasUtil.setShowFilters(true);
              });
            }
          };
          $scope.removeFilter = function (index, filter) {
            if (filter.node && filter.node.applied_filters)
              filter.node.applied_filters = '';
            else if (
              filter.node &&
              filter.node.query &&
              filter.node.query.applied_filters
            )
              filter.node.query.applied_filters = '';
            $scope.currentFilters.splice(index, 1);
            if (
              queryBuilderCanvasUtil.getShowFilters() &&
              (queryBuilderCanvasUtil.getLatestTouched() === filter.node ||
                $scope.currentQuery === filter.node)
            ) {
              queryBuilderCanvasUtil.setShowFilters(false);
              $scope.filterConfigRelated.encodedQuery = '';
              $timeout(function () {
                queryBuilderCanvasUtil.setShowFilters(true);
              });
            }
          };
          $scope.showFilterCardImage = function (filter) {
            if (
              !isServiceNode(filter.node, CONST.NODETYPE.SERVICE) &&
              $scope.currentQuery.name !== filter.nodeId
            )
              return true;
            return false;
          };
          $scope.$on('removeFilters', function (event, data) {
            for (var i = 0; i < $scope.currentFilters.length; i++) {
              if ($scope.currentFilters[i].node === data.node) {
                $scope.currentFilters.splice(i, 1);
                $timeout(function () {
                  queryBuilderCanvasUtil.setShowFilters(false);
                });
              }
            }
          });
          $scope.$on('snfilter:update_query', function (event, query, table) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (latestTouched) {
              addFilters(latestTouched, event, query, table);
            } else if (
              !latestTouched &&
              queryBuilderCommon.isServiceQuery($scope.currentQuery)
            ) {
              addFilters($scope.currentQuery.query, event, query, table);
            }
          });
          $scope.$on('queryBuilder.addNewFilter', function (event, data) {
            var newFilterCard = data.filter;
            if (newFilterCard) $scope.currentFilters.push(newFilterCard);
          });
          function isServiceNode(node, type) {
            if (node && type) return node.nodeType === type ? true : false;
            return false;
          }
          function addFilters(addTo, event, query, table) {
            var addingToService = false;
            if (
              addTo.query_type &&
              addTo.query_type === CONST.QUERY_TYPES.SERVICE
            ) {
              addTo.type = CONST.BASE_SERVICE_CLASS;
              addingToService = true;
            }
            if (table === addTo.type) addTo.applied_filters = query;
            if (addTo.nodeId) {
              query = query.replace('^ORDERBYname', '');
              query = query.replace('^ORDERBYnull', '');
              var nodeExists = false;
              var index = 0;
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              for (var i = 0; i < $scope.currentFilters.length; i++) {
                if ($scope.currentFilters[i].nodeId === latestTouched.nodeId) {
                  nodeExists = true;
                  index = i;
                  break;
                }
              }
              if (!nodeExists) {
                var newFilterCard = {
                  nodeId: addTo.nodeId,
                  filters_attrib: table == addTo.type ? query : '',
                  applied_filters: table == addTo.type ? query : '',
                  humanReadable_attrib: [],
                  node: addTo,
                };
                if (newFilterCard.applied_filters != '') {
                  if (table === addTo.type) {
                    encodedQueryService
                      .getHumanReadable(table, query)
                      .then(function (results) {
                        newFilterCard.humanReadable_attrib = results;
                      });
                  }
                  $scope.currentFilters.push(newFilterCard);
                }
              } else {
                if (
                  table === addTo.type &&
                  query != $scope.currentFilters[index].applied_filters
                ) {
                  $scope.currentFilters[index].applied_filters = query;
                  encodedQueryService
                    .getHumanReadable(table, query)
                    .then(function (results) {
                      $scope.currentFilters[index].humanReadable_attrib =
                        results;
                      ensureFilterApplicable(index);
                    });
                }
              }
            } else if (addingToService) {
              query = query.replace('^ORDERBYname', '');
              query = query.replace('^ORDERBYnull', '');
              var cardExists = false;
              var index = 0;
              for (var i = 0; i < $scope.currentFilters.length; i++) {
                if (
                  $scope.currentFilters[i].nodeId === $scope.currentQuery.name
                ) {
                  cardExists = true;
                  index = i;
                  break;
                }
              }
              if (!cardExists) {
                var newFilterCard = {
                  nodeId: $scope.currentQuery.name,
                  filters_attrib: table == addTo.type ? query : '',
                  applied_filters: table == addTo.type ? query : '',
                  humanReadable_attrib: [],
                  node: $scope.currentQuery,
                };
                if (newFilterCard.applied_filters != '') {
                  if (table === addTo.type) {
                    encodedQueryService
                      .getHumanReadable(table, query)
                      .then(function (results) {
                        newFilterCard.humanReadable_attrib = results;
                      });
                  }
                  $scope.currentFilters.push(newFilterCard);
                }
              } else {
                if (
                  table === addTo.type &&
                  query != $scope.currentFilters[index].applied_filters
                ) {
                  $scope.currentFilters[index].applied_filters = query;
                  encodedQueryService
                    .getHumanReadable(table, query)
                    .then(function (results) {
                      $scope.currentFilters[index].humanReadable_attrib =
                        results;
                      ensureFilterApplicable(index);
                    });
                }
              }
            }
          }
          function ensureFilterApplicable(index) {
            if (
              $scope.currentFilters[index].humanReadable_attrib.length === 0 ||
              $scope.currentFilters[index].applied_filters === ''
            ) {
              if (index >= 0) $scope.currentFilters.splice(index, 1);
            }
          }
        },
      ],
    };
  },
]);
