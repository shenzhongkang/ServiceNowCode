/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderResultArea.js */
angular.module('sn.queryBuilder').directive('queryBuilderResultArea', [
  'CONSTQB',
  'UA',
  'getTemplateUrl',
  function (CONST, UA, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_result_area.xml'),
      controller: [
        '$scope',
        '$rootScope',
        'i18n',
        'queryBuilderUsageAnalytics',
        'queryBuilderCommon',
        'queryService',
        'snNotification',
        '$window',
        'queryBuilderCanvasUtil',
        '$timeout',
        'snCustomEvent',
        '$interval',
        function (
          $scope,
          $rootScope,
          i18n,
          queryBuilderUsageAnalytics,
          queryBuilderCommon,
          queryService,
          snNotification,
          $window,
          queryBuilderCanvasUtil,
          $timeout,
          snCustomEvent,
          $interval
        ) {
          var usageAnalytics =
            queryBuilderUsageAnalytics.registerUsageAnalytics();
          $scope.ranTab = null;
          $scope.showResults = false;
          $scope.showTable = false;
          $scope.loadListTableToDom = false;
          $scope.resultCount = 0;
          $scope.listenForLoadResults = false;
          $scope.queryBuilderResultsUrl = '';
          var order = [];
          var showThePage = false;
          var stopTrying = false;
          $scope.listQuery = '';
          $scope.pollingInterval = 5;
          var batch_time_limit = parseInt(window.NOW.batch_time_limit_property);
          if (isNaN(batch_time_limit)) batch_time_limit = 310000;
          var readyTimeout = 0;
          var readyLimit = batch_time_limit;
          var processingTimeout = 0;
          var processingLimit = batch_time_limit;
          $scope.isPausedResults = function () {
            if (
              $scope.runningStatus &&
              $scope.runningStatus === CONST.RESULT_STATUS.PAUSED &&
              !$scope.runningQuery
            )
              return true;
            return false;
          };
          $scope.resumeExecution = function () {
            if (
              $scope.runningStatus &&
              ($scope.runningStatus === CONST.RESULT_STATUS.PAUSED ||
                $scope.runningStatus === CONST.RESULT_STATUS.PROCESSING)
            ) {
              var uaLoadMoreClicked = usageAnalytics.getInstance(
                UA.EVENTS.LOAD_MORE_CLICKED
              );
              uaLoadMoreClicked.flush();
              $scope.currentQuery.query.graph.nodes = $scope.nodes;
              $scope.currentQuery.query.graph.edges = $scope.connections;
              var blob = queryBuilderCommon.flattenGraph(
                $scope.currentQuery.query,
                $scope.currentQuery.name
              );
              blob = JSON.stringify(blob);
              var uaQueryRun = usageAnalytics.getInstance(UA.EVENTS.QUERY_RUN);
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_TYPE,
                queryBuilderCommon.getQueryType(JSON.parse(blob))
              );
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_CLASSES,
                queryBuilderCommon.getClassCount(JSON.parse(blob))
              );
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_OPERATORS,
                queryBuilderCommon.getOperatorCount(JSON.parse(blob))
              );
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_DEPTH,
                queryBuilderCommon.getQueryDepth(
                  $scope.currentQuery.query.graph
                )
              );
              continueExecution(uaQueryRun);
            }
          };
          $scope.executeAllQuery = function () {
            if (
              $scope.runningStatus &&
              ($scope.runningStatus === CONST.RESULT_STATUS.PAUSED ||
                $scope.runningStatus === CONST.RESULT_STATUS.PROCESSING)
            ) {
              var uaLoadAllClicked = usageAnalytics.getInstance(
                UA.EVENTS.LOAD_ALL_CLICKED
              );
              uaLoadAllClicked.flush();
              $scope.currentQuery.query.graph.nodes = $scope.nodes;
              $scope.currentQuery.query.graph.edges = $scope.connections;
              var blob = queryBuilderCommon.flattenGraph(
                $scope.currentQuery.query,
                $scope.currentQuery.name
              );
              blob = JSON.stringify(blob);
              var uaQueryRun = usageAnalytics.getInstance(UA.EVENTS.QUERY_RUN);
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_TYPE,
                queryBuilderCommon.getQueryType(JSON.parse(blob))
              );
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_CLASSES,
                queryBuilderCommon.getClassCount(JSON.parse(blob))
              );
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_OPERATORS,
                queryBuilderCommon.getOperatorCount(JSON.parse(blob))
              );
              uaQueryRun.addMetric(
                UA.METRICS.QUERY_DEPTH,
                queryBuilderCommon.getQueryDepth(
                  $scope.currentQuery.query.graph
                )
              );
              executeAll(uaQueryRun);
            }
          };
          $scope.closeResults = function () {
            if ($scope.showResults) {
              resetTableArea();
              resetBasicTable();
            }
          };
          $scope.shouldShowResults = function () {
            if ($scope.showResults && $scope.activeTab === $scope.ranTab)
              return true;
            return false;
          };
          $scope.showLoadingSymbol = function () {
            if (
              $scope.shouldShowResults() &&
              ($scope.runningQuery ||
                $scope.processingQuery ||
                $scope.loadingMoreResults)
            )
              return true;
            return false;
          };
          $scope.showResultsTable = function () {
            if ($scope.shouldShowResults() && !$scope.runningQuery) return true;
            return false;
          };
          $scope.isQueryExecuting = function () {
            return $scope.runningQuery;
          };
          $scope.toggleLoadingModal = function () {
            if ($scope.runningQuery)
              return {
                display: 'block',
              };
            else
              return {
                display: 'none',
              };
          };
          $scope.registerAndExecute = function (blob, uaQueryRun, runInNewTab) {
            if (runInNewTab && window.isSafari) {
              showThePage = false;
              stopTrying = false;
              tryToOpenNewPageForSafari();
            }
            $scope.queryBuilderResultsUrl = '';
            queryService.registerQuery(blob, $scope.currentQuery.sys_id).then(
              function (result) {
                if (result.result == undefined) {
                  $scope.currentQuery.registeredValue = result.query_id;
                  $scope.currentQuery.resultTable = result.table_name;
                  $scope.isParallelFailure = false;
                  queryService
                    .executeQuery($scope.currentQuery.registeredValue)
                    .then(
                      function (executeResult) {
                        if (
                          (executeResult && !executeResult.status) ||
                          (executeResult &&
                            executeResult.status === 200 &&
                            executeResult.result &&
                            executeResult.result.worker_id)
                        ) {
                          if (isQueryFailedToRun(executeResult.result.status)) {
                            console.log(
                              "Error occurred while executing 'Run' query in background, state: " +
                                executeResult.result +
                                ' workerId: ',
                              executeResult.result.worker_id
                            );
                            $scope.isParallelFailure =
                              executeResult.result.worker_id === '-1';
                            $scope.emitRunProblem();
                            return;
                          }
                          $scope.currentQuery.workerId =
                            executeResult.result.worker_id;
                          $scope.ranTab = $scope.activeTab;
                          $scope.runningQuery = true;
                          $scope.disableCancelJob = false;
                          $scope.showCancelButton = false;
                          if (
                            window.NOW.worker_thread_status_interval <= 0 ||
                            window.NOW.worker_thread_status_interval >
                              $scope.pollingInterval
                          ) {
                            window.NOW.worker_thread_status_interval =
                              $scope.pollingInterval;
                          }
                          var intervalVal =
                            window.NOW.worker_thread_status_interval * 1000;
                          var eventName =
                            'queryBuilder.run.worker.thread.status';
                          $scope.eventName = eventName;
                          displayLoadingModal(
                            intervalVal,
                            $scope.currentQuery.workerId,
                            $scope.currentQuery.registeredValue,
                            eventName,
                            function (err, response) {
                              if (err) {
                                console.log(
                                  "Error occurred while executing 'Run' query in background, state: ",
                                  $scope.runningStatus
                                );
                                $scope.emitRunProblem();
                                return;
                              }
                              $scope.runningQuery = false;
                              $scope.$emit('queryBuilder.executedQuery', {
                                registeredValue:
                                  $scope.currentQuery.registeredValue,
                                uaQueryRun: uaQueryRun,
                                readyTimeout: 0,
                                processingTimeout: 0,
                                runInNewTab: runInNewTab,
                              });
                            }
                          );
                          displayQueryCancelButton();
                        } else {
                          $scope.emitRunProblem();
                        }
                      },
                      function () {
                        $scope.emitRunProblem();
                      }
                    );
                } else {
                  $scope.emitRunProblem();
                  snNotification
                    .show('error', result.result.error, CONST.NOTIFICATION_TIME)
                    .then(function (notificationElement) {
                      queryBuilderCommon.focusNotificationCloseButton(
                        notificationElement
                      );
                    });
                  if (result.result.node_id)
                    showErrorOffendor(result.result.node_id);
                }
              },
              function (err) {
                $scope.emitRunProblem();
              }
            );
          };
          $scope.emitRunProblem = function () {
            emitRunProblem();
          };
          $scope.getResultTable = function () {
            return (
              $scope.currentQuery.resultTable || CONST.DEFAULT_RESULT_TABLE
            );
          };
          $scope.showCancel = function () {
            return $scope.showCancelButton;
          };
          $scope.$on('queryBuilder.executedQuery', function (event, args) {
            readyTimeout = args.readyTimeout;
            processingTimeout = args.processingTimeout;
            runQuery(args);
          });
          $scope.$on('queryBuilder.continuedExecution', function (event, args) {
            appendResults(args);
          });
          $scope.$on('queryBuilder.executedAll', function (event, args) {
            appendResults(args);
          });
          $scope.$on('queryBuilder.resetTableArea', function () {
            resetTableArea();
          });
          $scope.$on('queryBuilder.resetBasicTable', function () {
            resetBasicTable();
          });
          $scope.cancelProgressWorker = function () {
            $scope.disableCancelJob = true;
            queryService
              .cancelWorkerThread(
                $scope.currentQuery.workerId,
                $scope.currentQuery.registeredValue
              )
              .then(function (executeResult) {
                if (
                  (executeResult && !executeResult.status) ||
                  (executeResult && executeResult.status === 200)
                ) {
                  $scope.$emit($scope.eventName, executeResult);
                } else {
                  $scope.emitRunProblem();
                }
              });
          };
          function continueExecution(uaQueryRun) {
            if ($scope.currentQuery.registeredValue) {
              $scope.runningStatus = null;
              $scope.loadingMoreResults = true;
              $scope.isParallelFailure = false;
              queryService
                .executeQuery($scope.currentQuery.registeredValue)
                .then(
                  function (executeResult) {
                    if (
                      (executeResult && !executeResult.status) ||
                      (executeResult &&
                        executeResult.status === 200 &&
                        executeResult.result &&
                        executeResult.result.worker_id)
                    ) {
                      if (isQueryFailedToRun(executeResult.result.status)) {
                        console.log(
                          "Error occurred while executing 'Load More' query in background, state: " +
                            executeResult.result +
                            ' workerId: ',
                          executeResult.result.worker_id
                        );
                        $scope.isParallelFailure =
                          executeResult.result.worker_id === '-1';
                        $scope.emitRunProblem();
                        return;
                      }
                      $scope.currentQuery.workerId =
                        executeResult.result.worker_id;
                      $scope.ranTab = $scope.activeTab;
                      $scope.runningQuery = true;
                      $scope.disableCancelJob = false;
                      $scope.showCancelButton = false;
                      if (
                        window.NOW.worker_thread_status_interval <= 0 ||
                        window.NOW.worker_thread_status_interval >
                          $scope.pollingInterval
                      ) {
                        window.NOW.worker_thread_status_interval =
                          $scope.pollingInterval;
                      }
                      var intervalVal =
                        window.NOW.worker_thread_status_interval * 1000;
                      var eventName =
                        'queryBuilder.load.more.worker.thread.status';
                      $scope.eventName = eventName;
                      displayLoadingModal(
                        intervalVal,
                        $scope.currentQuery.workerId,
                        $scope.currentQuery.registeredValue,
                        eventName,
                        function (err, response) {
                          if (err) {
                            console.log(
                              "Error occurred while executing 'Load More' query in background, state: ",
                              $scope.runningStatus
                            );
                            $scope.emitRunProblem();
                            return;
                          }
                          $scope.runningQuery = false;
                          $scope.$emit('queryBuilder.continuedExecution', {
                            registeredValue:
                              $scope.currentQuery.registeredValue,
                            uaQueryRun: uaQueryRun,
                            readyTimeout: 0,
                            processingTimeout: 0,
                          });
                        }
                      );
                      displayQueryCancelButton();
                    } else {
                      $scope.emitRunProblem();
                    }
                  },
                  function () {
                    $scope.emitRunProblem();
                  }
                );
            }
          }
          function executeAll(uaQueryRun) {
            if ($scope.currentQuery.registeredValue) {
              $scope.runningStatus = null;
              $scope.loadingMoreResults = true;
              $scope.isParallelFailure = false;
              queryService
                .executeAllQuery($scope.currentQuery.registeredValue)
                .then(
                  function (executeResult) {
                    if (
                      (executeResult && !executeResult.status) ||
                      (executeResult &&
                        executeResult.status === 200 &&
                        executeResult.result &&
                        executeResult.result.worker_id)
                    ) {
                      if (isQueryFailedToRun(executeResult.result.status)) {
                        console.log(
                          "Error occurred while executing 'Load All' query in background, state: " +
                            executeResult.result +
                            ' workerId: ',
                          executeResult.result.worker_id
                        );
                        $scope.isParallelFailure =
                          executeResult.result.worker_id === '-1';
                        $scope.emitRunProblem();
                        return;
                      }
                      $scope.currentQuery.workerId =
                        executeResult.result.worker_id;
                      $scope.runningQuery = true;
                      $scope.ranTab = $scope.activeTab;
                      $scope.runningQuery = true;
                      $scope.disableCancelJob = false;
                      $scope.showCancelButton = false;
                      if (window.NOW.worker_thread_status_interval <= 0) {
                        window.NOW.worker_thread_status_interval = 5;
                      }
                      var intervalVal =
                        window.NOW.worker_thread_status_interval * 1000;
                      var eventName = 'queryBuilder.worker.thread.status';
                      $scope.eventName = eventName;
                      displayLoadingModal(
                        intervalVal,
                        $scope.currentQuery.workerId,
                        $scope.currentQuery.registeredValue,
                        eventName,
                        function (err, response) {
                          if (err) {
                            console.log(
                              "Error occurred while executing 'Load All' query in background, state: ",
                              $scope.runningStatus
                            );
                            $scope.emitRunProblem();
                            return;
                          }
                          $scope.runningQuery = false;
                          $scope.$emit('queryBuilder.executedAll', {
                            registeredValue:
                              $scope.currentQuery.registeredValue,
                            uaQueryRun: uaQueryRun,
                            readyTimeout: 0,
                            processingTimeout: 0,
                          });
                        }
                      );
                      displayQueryCancelButton();
                    } else {
                      $scope.emitRunProblem();
                    }
                  },
                  function () {
                    $scope.emitRunProblem();
                  }
                );
            }
          }
          function displayQueryCancelButton() {
            var timeout = 15 * 1000;
            var timer = $timeout(function () {
              $scope.showCancelButton = true;
              $timeout.cancel(timer);
            }, timeout);
          }
          function displayLoadingModal(
            pollingInterval,
            workerId,
            queryId,
            eventName,
            done
          ) {
            var wtStatusInterval = $interval(
              getWorkerThredStatus,
              pollingInterval,
              0,
              true,
              workerId,
              queryId,
              eventName
            );
            var deRegister = $scope.$on(eventName, function (event, response) {
              if (response && response.result) {
                var state = response.result;
                $scope.runningStatus = state;
                if (state === CONST.RESULT_STATUS.CANCELLED) {
                  $scope.runningQuery = false;
                  $scope.processingQuery = false;
                  $scope.loadingMoreResults = false;
                  $interval.cancel(wtStatusInterval);
                  deRegister();
                  return;
                } else if (
                  state === CONST.RESULT_STATUS.FAILED ||
                  state === CONST.RESULT_STATUS.TIME_OUT
                ) {
                  $interval.cancel(wtStatusInterval);
                  deRegister();
                  done('error');
                } else if (
                  state === CONST.RESULT_STATUS.COMPLETE ||
                  state === CONST.RESULT_STATUS.MAX_LIMIT
                ) {
                  $interval.cancel(wtStatusInterval);
                  deRegister();
                  done(null, response);
                }
              }
            });
          }
          function isQueryFailedToRun(status) {
            $scope.runningStatus = status;
            return status === CONST.RESULT_STATUS.FAILED;
          }
          function getWorkerThredStatus(workerId, queryId, eventName) {
            queryService
              .getWorkerThreadStatus(workerId, queryId)
              .then(function (results) {
                if (
                  (results && !results.status) ||
                  (results && results.status === 200)
                ) {
                  $scope.$emit(eventName, results);
                } else {
                  $scope.$emit(eventName, {
                    result: CONST.RESULT_STATUS.FAILED,
                  });
                }
              });
          }
          function resetTableArea() {
            var mainArea = angular.element('.main-area');
            mainArea.attr('style', '');
            var tableArea = angular.element('.results-area');
            tableArea.attr('style', '');
            var tableAreaDivider = angular.element('.resize.resize-vertical');
            tableAreaDivider.attr('style', '');
          }
          function resetBasicTable() {
            $scope.showResults = false;
            $scope.ranTab = null;
            $scope.showTable = false;
            $scope.loadListTableToDom = false;
          }
          function runQuery(args) {
            var queryID = args.registeredValue;
            var uaQueryRun = args.uaQueryRun;
            $scope.listenForLoadResults = true;
            queryService.getQueryProcessingStatus(queryID).then(
              function (results) {
                if (results && results.result) {
                  $scope.showTable = false;
                  $timeout(function () {
                    $scope.listQuery = 'query=' + queryID;
                    processQuery(results, queryID, uaQueryRun);
                    if (args.runInNewTab) {
                      $scope.queryBuilderResultsUrl =
                        $scope.currentQuery.resultTable +
                        '_list.do?sysparm_query=' +
                        $scope.listQuery +
                        '&sysparm_list_mode=grid';
                      var resultWindow = $window.open(
                        $scope.queryBuilderResultsUrl,
                        'cmdb_query_builder_results'
                      );
                      if (resultWindow) resultWindow.focus();
                      if (
                        (!resultWindow ||
                          resultWindow.closed ||
                          typeof resultWindow.closed === 'undefined') &&
                        window.isSafari
                      )
                        showThePage = true;
                      else stopTrying = true;
                      return;
                    }
                    $scope.loadListTableToDom = true;
                    var elemListScope = angular.element('sn-list').scope();
                    if (elemListScope) {
                      elemListScope.parameters.sysparm_query = $scope.listQuery;
                      CustomEvent.fire(
                        'list_v3.list_reload',
                        Object.assign({}, elemListScope, {
                          table: $scope.currentQuery.resultTable,
                          concourse: true,
                        })
                      );
                    }
                  });
                } else {
                  emitRunProblem();
                }
              },
              function (err) {
                emitRunProblem();
              }
            );
          }
          function appendResults(args) {
            var queryID = args.registeredValue;
            var uaQueryRun = args.uaQueryRun;
            queryService.getQueryProcessingStatus(queryID).then(
              function (results) {
                if (results && results.result) {
                  var snListElement = angular.element('sn-list').isolateScope();
                  if (snListElement) snListElement.updateList();
                  processQuery(results, queryID, uaQueryRun);
                } else {
                  emitRunProblem();
                }
              },
              function (err) {
                emitRunProblem();
              }
            );
          }
          function emitRunProblem() {
            snNotification
              .show(
                'error',
                i18n.getMessage('queryBuilder.notifications.runQueryProblem'),
                CONST.NOTIFICATION_TIME
              )
              .then(function (notificationElement) {
                queryBuilderCommon.focusNotificationCloseButton(
                  notificationElement
                );
              });
            if ($scope.runningStatus === CONST.RESULT_STATUS.TIME_OUT) {
              snNotification
                .show(
                  'error',
                  i18n.getMessage('queryBuilder.notifications.queryTimeout'),
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
            }
            if ($scope.isParallelFailure) {
              snNotification
                .show(
                  'error',
                  i18n.getMessage(
                    'queryBuilder.notifications.parallelQueryRunProblem'
                  ),
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
            }
            $scope.disableCancelJob = false;
            $scope.closeResults();
            $scope.runningQuery = false;
            $scope.listenForLoadResults = false;
            if ($scope.processingQuery) $scope.processingQuery = false;
            if ($scope.loadingMoreResults) $scope.loadingMoreResults = false;
            $scope.ranTab = null;
            if (readyTimeout !== 0) readyTimeout = 0;
            if (processingTimeout !== 0) processingTimeout = 0;
          }
          function showErrorOffendor(node_id) {
            var found = null;
            for (var i = 0; i < $scope.nodes.length; i++) {
              if ($scope.nodes[i].nodeId === node_id) {
                found = $scope.nodes[i];
                break;
              }
            }
            if (found === null) {
              for (var i = 0; i < $scope.connections.length; i++) {
                if ($scope.connections[i].id === node_id) {
                  found = $scope.connections[i].info;
                  break;
                }
              }
            }
            if (found) {
              found.error = true;
              $scope.errorFound = found;
            }
          }
          function processQuery(results, queryID, uaQueryRun) {
            if (results.result) {
              $scope.runningStatus = results.result;
              if ($scope.runningStatus === CONST.RESULT_STATUS.FAILED) {
                emitRunProblem();
              } else if (
                $scope.runningStatus === CONST.RESULT_STATUS.TIME_OUT
              ) {
                emitRunProblem();
                snNotification
                  .show(
                    'error',
                    i18n.getMessage('queryBuilder.notifications.queryTimeout'),
                    CONST.NOTIFICATION_TIME
                  )
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
              } else {
                if (
                  $scope.runningStatus === CONST.RESULT_STATUS.PAUSED &&
                  !$scope.runInNewTab
                ) {
                  if (hasMultiLevelRelationship()) {
                    snNotification
                      .show(
                        'warning',
                        i18n.getMessage(
                          'queryBuilder.results.paused.plusMultiLevel'
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
                        'warning',
                        i18n.getMessage('queryBuilder.results.paused'),
                        CONST.NOTIFICATION_TIME
                      )
                      .then(function (notificationElement) {
                        queryBuilderCommon.focusNotificationCloseButton(
                          notificationElement
                        );
                      });
                  }
                  uaQueryRun.addMetric(UA.METRICS.HAS_LOAD_BUTTON, true);
                } else if (
                  $scope.runningStatus === CONST.RESULT_STATUS.MAX_LIMIT
                ) {
                  snNotification
                    .show(
                      'warning',
                      i18n.getMessage(
                        'queryBuilder.notifications.maxLimitReached'
                      ),
                      CONST.NOTIFICATION_TIME
                    )
                    .then(function (notificationElement) {
                      queryBuilderCommon.focusNotificationCloseButton(
                        notificationElement
                      );
                    });
                } else if (
                  $scope.runningStatus === CONST.RESULT_STATUS.COMPLETE &&
                  !$scope.runInNewTab
                ) {
                  if (hasMultiLevelRelationship()) {
                    snNotification
                      .show(
                        'success',
                        i18n.getMessage(
                          'queryBuilder.results.complete.plusMultiLevel'
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
                        i18n.getMessage('queryBuilder.results.complete'),
                        CONST.NOTIFICATION_TIME
                      )
                      .then(function (notificationElement) {
                        queryBuilderCommon.focusNotificationCloseButton(
                          notificationElement
                        );
                      });
                  }
                } else if (
                  $scope.runningStatus === CONST.RESULT_STATUS.PROCESSING
                ) {
                  checkStatusAgain(queryID, uaQueryRun);
                }
                var isProcessing =
                  $scope.runningStatus === CONST.RESULT_STATUS.PROCESSING;
                setRunningStatuses(isProcessing, false, false);
                if (uaQueryRun) uaQueryRun.flush();
              }
            } else {
              emitRunProblem();
            }
          }
          function removeListV3ContextItems() {
            var listv3ContextMenuButton = angular
              .element('.icon-menu.btn.btn-icon.list-btn')
              .scope();
            if (listv3ContextMenuButton) {
              var contextMenuItems = listv3ContextMenuButton.configurationMenu;
              for (var i = contextMenuItems.length - 1; i >= 0; i--) {
                if (contextMenuItems[i].name !== i18n.getMessage('Export')) {
                  contextMenuItems.splice(i, 1);
                }
              }
            } else {
              $timeout(function () {
                removeListV3ContextItems();
              }, 500);
            }
          }
          function checkStatusAgain(queryID, uaQueryRun) {
            queryService.getQueryProcessingStatus(queryID).then(
              function (results) {
                if (results && results.result)
                  processQuery(results, queryID, uaQueryRun);
                else {
                  emitRunProblem();
                }
              },
              function (err) {
                emitRunProblem();
              }
            );
          }
          function setRunningStatuses(processing, loading, running) {
            $scope.processingQuery = processing;
            $scope.loadingMoreResults = loading;
            $scope.runningQuery = running;
          }
          function hasMultiLevelRelationship() {
            for (var i = 0; i < $scope.connections.length; i++) {
              if (
                angular.isDefined(
                  $scope.connections[i].info.relationshipLevels
                ) &&
                $scope.connections[i].info.relationshipLevels > 1
              )
                return true;
            }
            return false;
          }
          CustomEvent.observe('table.render_finished', function () {
            if ($scope.listenForLoadResults) {
              var showResultsDelay = window.NOW.g_accessibility ? 1000 : 0;
              $timeout(function () {
                $scope.showTable = true;
                $scope.listenForLoadResults = false;
                removeListV3ContextItems();
              }, showResultsDelay);
            }
          });
          function tryToOpenNewPageForSafari() {
            $timeout(function () {
              if (stopTrying && !showThePage) return;
              if (showThePage && $scope.queryBuilderResultsUrl) {
                $window.open(
                  $scope.queryBuilderResultsUrl,
                  'cmdb_query_builder_results'
                );
                stopTrying = true;
              } else {
                tryToOpenNewPageForSafari();
              }
            }, 100);
          }
        },
      ],
    };
  },
]);
