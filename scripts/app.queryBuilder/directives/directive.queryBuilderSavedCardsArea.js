/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderSavedCardsArea.js */
angular.module('sn.queryBuilder').directive('queryBuilderSavedCardsArea', [
  'getTemplateUrl',
  function (getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_saved_cards_area.xml'),
      controller: [
        '$scope',
        'i18n',
        'queryService',
        '$q',
        'CONSTQB',
        'snNotification',
        'queryBuilderCommon',
        '$timeout',
        '$rootScope',
        '$filter',
        'userPreferences',
        function (
          $scope,
          i18n,
          queryService,
          $q,
          CONST,
          snNotification,
          queryBuilderCommon,
          $timeout,
          $rootScope,
          $filter,
          userPreferences
        ) {
          $scope.savedQueries = [];
          queryService.getAllQueries().then(
            function (queries) {
              if (!queries.status) {
                $scope.savedQueries = queries;
                $scope.savedCardsSearch.searchable = $scope.savedQueries;
                checkUrlForSavedQuery();
              } else
                snNotification
                  .show(
                    'error',
                    i18n.getMessage(
                      'queryBuilder.notifications.loadAllSavedQueriesProblem'
                    ),
                    CONST.NOTIFICATION_TIME
                  )
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
            },
            function () {
              snNotification
                .show(
                  'error',
                  i18n.getMessage(
                    'queryBuilder.notifications.loadAllSavedQueriesProblem'
                  ),
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
            }
          );
          $scope.$on(
            'queryBuilder.importQuery.success',
            function (event, args) {
              queryService.getAllQueries().then(
                function (queries) {
                  if (!queries.status) {
                    if ($scope.savedQueries.length === queries.length) {
                      $rootScope.$broadcast('queryBuilder.importQuery.failure');
                      snNotification
                        .show(
                          'error',
                          i18n.getMessage(
                            'queryBuilder.notifications.importQueryFailed'
                          ),
                          CONST.NOTIFICATION_TIME
                        )
                        .then(function (notificationElement) {
                          queryBuilderCommon.focusNotificationCloseButton(
                            notificationElement
                          );
                        });
                    } else {
                      snNotification
                        .show(
                          'success',
                          i18n.getMessage(
                            'queryBuilder.notifications.importQuerySuccess'
                          ),
                          CONST.NOTIFICATION_TIME
                        )
                        .then(function (notificationElement) {
                          queryBuilderCommon.focusNotificationCloseButton(
                            notificationElement
                          );
                        });
                    }
                    $scope.savedQueries = queries;
                    $scope.savedCardsSearch.searchable = $scope.savedQueries;
                  } else
                    snNotification
                      .show(
                        'error',
                        i18n.getMessage(
                          'queryBuilder.notifications.loadAllSavedQueriesProblem'
                        ),
                        CONST.NOTIFICATION_TIME
                      )
                      .then(function (notificationElement) {
                        queryBuilderCommon.focusNotificationCloseButton(
                          notificationElement
                        );
                      });
                },
                function () {
                  snNotification
                    .show(
                      'error',
                      i18n.getMessage(
                        'queryBuilder.notifications.loadAllSavedQueriesProblem'
                      ),
                      CONST.NOTIFICATION_TIME
                    )
                    .then(function (notificationElement) {
                      queryBuilderCommon.focusNotificationCloseButton(
                        notificationElement
                      );
                    });
                }
              );
            }
          );
          $scope.savedQueriesSearchTerm = '';
          $scope.savedQueriesSortBy = {
            options: [
              {
                label: i18n.getMessage('queryBuilder.savedCards.lastUpdated'),
                other: 'raw_updated_on',
                value: 1,
              },
              {
                label: i18n.getMessage('queryBuilder.general.latestCreated'),
                other: 'raw_created_on',
                value: 2,
              },
              {
                label: i18n.getMessage('queryBuilder.infoBox.queryName'),
                other: 'name',
                value: 3,
              },
              {
                label: i18n.getMessage('queryBuilder.savedCards.createdBy'),
                other: 'created_by',
                value: 4,
              },
              {
                label: i18n.getMessage('queryBuilder.infoBox.updatedBy'),
                other: 'updated_by',
                value: 5,
              },
              {
                label: i18n.getMessage('queryBuilder.dialogBox.queryType'),
                other: 'humanReadable',
                value: 6,
              },
            ],
            selected: null,
          };
          $scope.savedQueriesSortBy.selected =
            $scope.savedQueriesSortBy.options[0];
          $scope.savedQueriesSortTerm = 'raw_updated_on';
          $scope.showQueriesTable = true;
          userPreferences
            .getPreference(CONST.USER_PREFERENCES.SHOW_LIST_SAVED_CARDS)
            .then(function (value) {
              if (value === 'true') $scope.showQueriesList = true;
              else $scope.showQueriesList = false;
            });
          $scope.savedQueriesTableColumns = [
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.queryName'),
              name: 'name',
              sys_id: 'name',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.queryDescription'),
              name: 'description',
              sys_id: 'description',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.dialogBox.queryType'),
              name: 'humanReadable',
              sys_id: 'humanReadable',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.queryTags'),
              name: 'tags',
              sys_id: 'tags',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.ownedBy'),
              name: 'created_by',
              sys_id: 'created_by',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.updatedBy'),
              name: 'updated_by',
              sys_id: 'updated_by',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.createdOn'),
              name: 'created_on',
              sys_id: 'created_on',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.lastModified'),
              name: 'updated_on',
              sys_id: 'updated_on',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.schedules'),
              name: 'schedules',
              sys_id: 'schedules',
            },
            {
              active: true,
              label: i18n.getMessage('queryBuilder.infoBox.groups'),
              name: 'groups',
              sys_id: 'groups',
            },
          ];
          for (var i = 0; i < $scope.savedQueriesTableColumns.length; i++) {
            $scope.savedQueriesTableColumns[i].order = i;
          }
          $scope.savedQueriesTableRows = getFilteredQueries();
          $scope.savedQueriesTableConfig = {
            disallowManualGrouping: true,
            groupBy: null,
            openable: false,
            selectable: false,
            filterable: false,
            configurable: false,
            rowsPerPage: 10,
            clickCallback: true,
            cellClickCallBack: tableItemClicked,
            sortByValue: [],
          };
          $scope.sortByChanged = function (option) {
            if (option) {
              $scope.savedQueriesSortTerm = option.other;
              $scope.savedQueriesTableConfig.sortByValue = [option.other];
            }
          };
          $scope.showSavedCardsArea = function () {
            return $scope.activeTab === 1;
          };
          $scope.getSearchValues = function (provider, term) {
            var defer = $q.defer();
            var searchResult = [];
            if (provider.value === 'name') defer.resolve([term]);
            else if (provider.value === 'humanReadable') {
              var queryTypes = ['CMDB Query'];
              if (window.NOW.service_watch_enabled)
                queryTypes.push('Service Mapping Query');
              for (var i = 0; i < queryTypes.length; i++) {
                if (searchResult.length < CONST.MULTISEARCH.MAX_RESULTS) {
                  if (
                    queryTypes[i].toLowerCase().indexOf(term.toLowerCase()) > -1
                  )
                    searchResult.push(queryTypes[i]);
                }
              }
            } else if (provider.value === 'tags') {
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                for (var j = 0; j < $scope.savedQueries[i].tags.length; j++) {
                  if (searchResult.length < CONST.MULTISEARCH.MAX_RESULTS) {
                    if (
                      $scope.savedQueries[i].tags[j].display_value &&
                      $scope.savedQueries[i].tags[j].display_value
                        .toLowerCase()
                        .indexOf(term.toLowerCase()) > -1 &&
                      searchResult.indexOf(
                        $scope.savedQueries[i].tags[j].display_value
                      ) === -1
                    )
                      searchResult.push(
                        $scope.savedQueries[i].tags[j].display_value
                      );
                  }
                }
              }
            } else if (provider.value === 'created_by') {
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if (searchResult.length < CONST.MULTISEARCH.MAX_RESULTS) {
                  if (
                    $scope.savedQueries[i].created_by
                      .toLowerCase()
                      .indexOf(term.toLowerCase()) > -1 &&
                    searchResult.indexOf($scope.savedQueries[i].created_by) ===
                      -1
                  )
                    searchResult.push($scope.savedQueries[i].created_by);
                }
              }
            } else if (provider.value === 'updated_by') {
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if (searchResult.length < CONST.MULTISEARCH.MAX_RESULTS) {
                  if (
                    $scope.savedQueries[i].updated_by
                      .toLowerCase()
                      .indexOf(term.toLowerCase()) > -1 &&
                    searchResult.indexOf($scope.savedQueries[i].updated_by) ===
                      -1
                  )
                    searchResult.push($scope.savedQueries[i].updated_by);
                }
              }
            }
            defer.resolve(searchResult);
            return defer.promise;
          };
          $scope.savedCardsSearch = {
            htmlID: 'savedQueriesSearch',
            placeholder: i18n.getMessage(
              'queryBuilder.savedCards.search.placeholder'
            ),
            tabArea: 250,
            providers: [
              {
                label: i18n.getMessage(
                  'queryBuilder.savedCards.search.label.title'
                ),
                value: 'name',
                call: $scope.getSearchValues,
              },
              {
                label: i18n.getMessage(
                  'queryBuilder.savedCards.search.label.queryType'
                ),
                value: 'humanReadable',
                call: $scope.getSearchValues,
              },
              {
                label: i18n.getMessage(
                  'queryBuilder.savedCards.search.label.tags'
                ),
                value: 'tags',
                call: $scope.getSearchValues,
              },
              {
                label: i18n.getMessage(
                  'queryBuilder.savedCards.search.label.createdBy'
                ),
                value: 'created_by',
                call: $scope.getSearchValues,
              },
              {
                label: i18n.getMessage(
                  'queryBuilder.savedCards.search.label.updatedBy'
                ),
                value: 'updated_by',
                call: $scope.getSearchValues,
              },
            ],
          };
          $scope.getViewSelectionButtonClass = function (button) {
            var classObj = {
              active: false,
            };
            if (button === 'list' && $scope.showQueriesList)
              classObj.active = true;
            else if (button === 'cards' && !$scope.showQueriesList)
              classObj.active = true;
            return classObj;
          };
          $scope.changeViewSelection = function (button) {
            if (button === 'list') $scope.showQueriesList = true;
            else $scope.showQueriesList = false;
            userPreferences.setPreference(
              CONST.USER_PREFERENCES.SHOW_LIST_SAVED_CARDS,
              $scope.showQueriesList
            );
          };
          $scope.$watch(
            'savedQueries',
            function () {
              updateTableInformation();
            },
            true
          );
          $scope.$watch(
            'savedCardsSearch.selected.length',
            function (newVal, oldVal) {
              updateTableInformation();
            }
          );
          $scope.$watch('savedQueriesSortTerm', function () {
            updateTableInformation();
          });
          function checkUrlForSavedQuery() {
            var urlParameter = queryBuilderCommon.getURLParameter(
              'sysparm_saved_qb_query'
            );
            if (urlParameter) {
              var foundQuery = -1;
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if ($scope.savedQueries[i].sys_id === urlParameter) {
                  foundQuery = i;
                  break;
                }
              }
              if (foundQuery > -1) {
                $scope.$broadcast(
                  'queryBuilder.loadSavedQuery',
                  $scope.savedQueries[foundQuery]
                );
              }
            }
          }
          function getFilteredQueries() {
            var filtered = [];
            if (!$scope.savedCardsSearch) return filtered;
            var selected = $scope.savedCardsSearch.selected;
            if (!selected || selected.length === 0)
              filtered = $scope.savedQueries;
            else {
              filtered = $scope.savedQueries.filter(matchesAll);
            }
            var adjustedFiltered = angular.copy(filtered);
            adjustedFiltered = adjustQueriesForList(adjustedFiltered);
            adjustedFiltered = $filter('orderObjectBy')(
              adjustedFiltered,
              $scope.savedQueriesSortTerm
            );
            return adjustedFiltered;
          }
          function matchesAll(query) {
            var selected = $scope.savedCardsSearch.selected;
            var total = selected.length;
            var matched = 0;
            for (var i = 0; i < selected.length; i++) {
              var val = selected[i].provider.value;
              var res = selected[i].result;
              if (val === 'name') {
                if (query.name.toLowerCase().indexOf(res.toLowerCase()) > -1)
                  matched++;
              } else if (val === 'tags') {
                for (var j = 0; j < query.tags.length; j++) {
                  if (
                    query.tags[j].display_value.toLowerCase() ===
                    res.toLowerCase()
                  )
                    matched++;
                }
              } else {
                if (query[val] === res) matched++;
              }
            }
            if (total === matched) return true;
            return false;
          }
          function adjustQueriesForList(queries) {
            for (var i = 0; i < queries.length; i++) {
              var newName = {
                display_value: queries[i].name,
                link: '#',
              };
              queries[i].name = newName;
              if (angular.isDefined(queries[i].tags)) {
                var newTags = [];
                for (var j = 0; j < queries[i].tags.length; j++) {
                  newTags.push(queries[i].tags[j].display_value);
                }
                queries[i].tags = newTags.toString();
              }
              if (angular.isDefined(queries[i].schedules)) {
                var newSchedules = [];
                for (var j = 0; j < queries[i].schedules.length; j++) {
                  newSchedules.push(queries[i].schedules[j].name);
                }
                queries[i].schedules = newSchedules.toString();
              }
              if (angular.isDefined(queries[i].groups)) {
                var newGroups = [];
                for (var j = 0; j < queries[i].groups.length; j++) {
                  newGroups.push(queries[i].groups[j].name);
                }
                queries[i].groups = newGroups.toString();
              }
            }
            return queries;
          }
          function tableItemClicked(e, row, column, config) {
            if (column.name === 'name') {
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if ($scope.savedQueries[i].sys_id === row.sys_id) {
                  $rootScope.$broadcast(
                    'queryBuilder.loadSavedQuery',
                    $scope.savedQueries[i]
                  );
                  break;
                }
              }
            }
          }
          function updateTableInformation() {
            $scope.showQueriesTable = false;
            $scope.savedQueriesTableRows = getFilteredQueries();
            $timeout(function () {
              $scope.showQueriesTable = true;
            });
          }
        },
      ],
    };
  },
]);
