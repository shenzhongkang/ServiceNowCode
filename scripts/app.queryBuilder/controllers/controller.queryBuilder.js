/*! RESOURCE: /scripts/app.queryBuilder/controllers/controller.queryBuilder.js */
angular.module('sn.queryBuilder').controller('queryBuilder', [
  '$scope',
  '$window',
  '$rootScope',
  '$timeout',
  'CONSTQB',
  'i18n',
  'snNotification',
  '$document',
  'queryService',
  '$q',
  'queryBuilderCommon',
  'queryBuilderValidation',
  'queryBuilderUsageAnalytics',
  'UA',
  'encodedQueryService',
  'userPreferences',
  'queryBuilderSelection',
  'queryBuilderTreeUtil',
  'queryBuilderCanvasUtil',
  'cmdbMatomo',
  'snCustomEvent',
  'amb',
  function (
    $scope,
    $window,
    $rootScope,
    $timeout,
    CONST,
    i18n,
    snNotification,
    $document,
    queryService,
    $q,
    queryBuilderCommon,
    queryBuilderValidation,
    queryBuilderUsageAnalytics,
    UA,
    encodedQueryService,
    userPreferences,
    queryBuilderSelection,
    queryBuilderTreeUtil,
    queryBuilderCanvasUtil,
    cmdbMatomo,
    snCustomEvent,
    amb
  ) {
    var usageAnalytics = queryBuilderUsageAnalytics.registerUsageAnalytics();
    var uaAppViewed = usageAnalytics.getInstance(UA.EVENTS.APP_VIEWED).flush();
    var isSourceNlq = false;
    cmdbMatomo.trackEvent(
      UA.MATOMO.CATEGORY,
      UA.MATOMO.EVENTS.QB_ACCESSED,
      UA.MATOMO.EVENTS.QB_ACCESSED
    );
    $scope.dialogInfo = {
      header: i18n.getMessage('queryBuilder.dialog.box.label'),
      message: i18n.getMessage('queryBuilder.dialog.box.message1'),
      buttons: [
        {
          label: i18n.getMessage('queryBuilder.dialog.box.button.no'),
          callBack: leaveWithoutSave,
        },
        {
          label: i18n.getMessage('queryBuilder.dialog.box.button.yes'),
          callBack: saveQuery,
          primary: true,
        },
      ],
    };
    $scope.connectionDisplayValueForward = '';
    $scope.connectionDisplayValueReverse = '';
    $scope.nodes = [];
    $scope.connections = [];
    $scope.headerOffset = CONST.HEADEROFFSET;
    $scope.runInNewTab = true;
    $scope.currentQuery = {};
    $scope.currentQuery.active = false;
    $scope.g_tz_offset = window.g_tz_offset;
    $scope.service_watch_enabled = window.NOW.service_watch_enabled;
    $scope.canWrite = window.NOW.can_write;
    $scope.canCreateReport =
      window.NOW.can_write && window.NOW.can_create_report;
    var previouslyRan = {};
    var images = {};
    $scope.showRelationships = true;
    $scope.showSuggestedConnections = true;
    userPreferences
      .getPreference(CONST.USER_PREFERENCES.SHOW_RELATIONSHIPS_IN_RESULTS)
      .then(function (value) {
        if (value === 'false') $scope.showRelationships = false;
        else $scope.showRelationships = true;
      });
    userPreferences
      .getPreference(CONST.USER_PREFERENCES.SHOW_SUGGESTED_CONNECTIONS)
      .then(function (value) {
        if (value === 'false') $scope.showSuggestedConnections = false;
        else $scope.showSuggestedConnections = true;
      });
    userPreferences
      .getPreference(CONST.USER_PREFERENCES.SHOW_RESULTS_IN_NEW_TAB)
      .then(function (value) {
        if (value === 'false') $scope.runInNewTab = false;
        else $scope.runInNewTab = true;
      });
    $scope.errorFound = null;
    $scope.loadingCmdbTree = true;
    $scope.$on('queryBuilder.loadedCmdbTree', function () {
      $scope.loadingCmdbTree = false;
    });
    queryService.getAllIcons().then(
      function (imageResult) {
        images = imageResult;
      },
      function (err) {
        var notificationMessage = i18n.getMessage(
          'queryBuilder.notifications.getIconsError'
        );
        snNotification
          .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
          .then(function (notificationElement) {
            queryBuilderCommon.focusNotificationCloseButton(
              notificationElement
            );
          });
      }
    );
    queryService.getAllRelations().then(
      function (relations) {
        queryBuilderCanvasUtil.setAllRelationships(relations);
      },
      function () {
        snNotification
          .show(
            'error',
            i18n.getMessage(
              'queryBuilder.notifications.loadAllRelationsProblem'
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
    $scope.saveQuery = function () {
      if ($scope.currentQuery.changed) {
        $scope.currentQuery.execution_id = null;
        if ($scope.currentQuery.containsReport) {
          snNotification.show(
            'warning',
            i18n.getMessage('queryBuilder.notifications.queryReportWarning'),
            3000
          );
        }
      }
      $scope.currentQuery.query.graph.nodes = $scope.nodes;
      $scope.currentQuery.query.graph.edges = $scope.connections;
      var name = $scope.currentQuery.name;
      var description = $scope.currentQuery.description;
      var newQuery = $scope.currentQuery.new;
      var duplicateQuery = $scope.currentQuery.duplicate;
      var blob = queryBuilderCommon.flattenGraph(
        $scope.currentQuery.query,
        $scope.currentQuery.name,
        $scope.currentQuery.usedNames
      );
      saveQuery(
        $scope.currentQuery,
        blob,
        name,
        description,
        newQuery,
        duplicateQuery,
        null
      );
    };
    $scope.setScheduleQuery = function () {
      var url = '#';
      if ($scope.isSavedQuery($scope.currentQuery)) {
        if (
          $scope.currentQuery &&
          $scope.currentQuery.schedules &&
          $scope.currentQuery.schedules.length > 0
        )
          url =
            '/sysauto_query_builder_list.do?sysparm_query=query=' +
            $scope.currentQuery.sys_id;
        else
          url =
            '/sysauto_query_builder.do?sysparm_query=query=' +
            $scope.currentQuery.sys_id +
            '&sys_id=-1';
      }
      $window.location = url;
    };
    $window.addEventListener('beforeunload', function (event) {
      if ($scope.currentQuery.changed) {
        var confirmationMessage = 'o/';
        event.returnValue = confirmationMessage;
        return confirmationMessage;
      }
    });
    $window.addEventListener('resize', function (event) {
      $scope.$apply();
    });
    $scope.getScheduleButtonTabIndex = function () {
      if ($scope.isSavedQuery($scope.currentQuery)) return 0;
      return -1;
    };
    $scope.runQuery = function () {
      if (!queryBuilderSelection.hasSelection()) {
        if (
          queryBuilderValidation.isValidQuery(
            'run',
            $scope.currentQuery,
            $scope.connections,
            $scope.nodes
          )
        ) {
          resetBasic();
          var blob = createBlob($scope.nodes, $scope.connections);
          var uaQueryRun = createUaQueryRun(blob);
          resetValuesForExecute($scope.runInNewTab);
          $scope.registerAndExecute(blob, uaQueryRun, $scope.runInNewTab);
        }
      } else {
        var currentSelection = queryBuilderSelection.getSelection();
        if (
          queryBuilderValidation.isValidQuery(
            'run',
            $scope.currentQuery,
            currentSelection.connections,
            currentSelection.nodes
          )
        ) {
          if (
            !queryBuilderCommon.isValidPatternSelection(currentSelection.nodes)
          ) {
            snNotification.show(
              'error',
              i18n.getMessage('queryBuilder.notifications.invalidPattern'),
              CONST.NOTIFICATION_TIME
            );
            return;
          }
          resetBasic();
          var blob = createBlob(
            currentSelection.nodes,
            currentSelection.connections
          );
          var uaQueryRun = createUaQueryRun(blob);
          resetValuesForExecute($scope.runInNewTab);
          $scope.registerAndExecute(blob, uaQueryRun, $scope.runInNewTab);
        }
      }
    };
    $scope.initializeLoadQuery = function (query, duplicate) {
      initializeLoadQuery(query, duplicate);
    };
    $scope.createNewClicked = function () {
      $rootScope.$emit('queryBuilder.dialogBox.createNew.open');
    };
    $scope.isGeneralQueryWithServiceWatch = function () {
      return (
        queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
        hasServiceWatchEnabled()
      );
    };
    $scope.isGeneralQueryWithoutServiceWatch = function () {
      return (
        queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
        !hasServiceWatchEnabled()
      );
    };
    $scope.isServiceQuery = function () {
      return queryBuilderCommon.isServiceQuery($scope.currentQuery);
    };
    $scope.shouldShowClear = function (searchValue) {
      if ($scope[searchValue]) return true;
      return false;
    };
    $scope.clearSearch = function (event, searchValue) {
      event.stopPropagation();
      $scope[searchValue] = '';
      $rootScope.$broadcast('queryBuilder.searchCleared', {
        searchValue: searchValue,
      });
    };
    $scope.hasServiceWatchEnabled = function () {
      return hasServiceWatchEnabled();
    };
    $scope.isSavedQuery = function () {
      if ($scope.currentQuery && $scope.currentQuery.sys_id) return true;
      return false;
    };
    $scope.displaySettings = function (event) {
      $rootScope.$broadcast('queryBuilder.displaySettings', {
        event: event,
      });
      event.stopPropagation();
    };
    $scope.disableRun = function () {
      if (!queryBuilderCanvasUtil.getDroppedClass()) return true;
      if ($scope.runningQuery) return true;
      if (!$scope.hasCmdbNode()) return true;
      if (
        $scope.loadingCmdbTree &&
        !$scope.canWrite &&
        queryBuilderCanvasUtil.getDroppedClass()
      )
        return false;
      if ($scope.loadingCmdbTree) return true;
      return false;
    };
    $scope.disableSave = function () {
      if (!queryBuilderCanvasUtil.getDroppedClass()) return true;
      return false;
    };
    $scope.showRelationshipsChanged = function () {
      userPreferences.setPreference(
        CONST.USER_PREFERENCES.SHOW_RELATIONSHIPS_IN_RESULTS,
        $scope.showRelationships
      );
    };
    $scope.showSuggestedConnectionsChanged = function () {
      userPreferences.setPreference(
        CONST.USER_PREFERENCES.SHOW_SUGGESTED_CONNECTIONS,
        $scope.showSuggestedConnections
      );
      $rootScope.$broadcast('queryBuilder.suggestedConnectionsChanged', {
        showSuggestedConnections: $scope.showSuggestedConnections,
      });
    };
    $scope.showResultsInNewTabChanged = function () {
      userPreferences.setPreference(
        CONST.USER_PREFERENCES.SHOW_RESULTS_IN_NEW_TAB,
        $scope.runInNewTab
      );
    };
    $scope.saveQueryFromPromptCloseTab = function (event, data) {
      if ($scope.currentQuery.changed) {
        $scope.currentQuery.execution_id = null;
        if ($scope.currentQuery.containsReport) {
          snNotification.show(
            'warning',
            i18n.getMessage('queryBuilder.notifications.queryReportWarning'),
            3000
          );
        }
      }
      var tab = data.tab;
      var query = $scope['tab' + tab + 'After'];
      var blob = $scope['tab' + tab + 'AfterFlattened'].query;
      var name = $scope['tab' + tab].name;
      var description = $scope['tab' + tab].description;
      var newQuery = $scope['tab' + tab].new;
      var duplicate = $scope['tab' + tab].duplicate;
      saveQuery(query, blob, name, description, newQuery, duplicate, tab).then(
        function () {
          $scope.closeActiveCanvas(event, data.tab);
        }
      );
    };
    $scope.expandOptionLabels = function (query) {
      var allProperties = queryBuilderCanvasUtil.getAllProperties();
      var props = allProperties[CONST.BASE_SERVICE_CLASS];
      var newOptions = [];
      for (var i = 0; i < query.returnValues.length; i++)
        for (var j = 0; j < props.length; j++)
          if (props[j].element === query.returnValues[i])
            newOptions.push({
              label: props[j].label,
              element: query.returnValues[i],
            });
      return newOptions;
    };
    $scope.getImage = function (node) {
      var image = images[node.type];
      if (!image) image = CONST.DEFAULT_CLASS_NODE_IMAGE;
      return image;
    };
    $scope.exportCurrentQuery = function () {
      queryBuilderCanvasUtil.setExportQuerySysId(null);
      $rootScope.$broadcast('queryBuilder.exportSavedQuery.open');
      var queryIDs = $scope.currentQuery.sys_id;
      if (
        $scope.currentQuery.dependencies != null &&
        $scope.currentQuery.dependencies != ''
      ) {
        queryIDs += ',' + $scope.currentQuery.dependencies;
      }
      queryService.exportSavedQueryInit(queryIDs).then(
        function (job_id) {
          exportPoll(job_id);
        },
        function (result) {
          $rootScope.$broadcast('queryBuilder.exportSavedQuery.failure');
        }
      );
    };
    $scope.hasCmdbNode = function () {
      var cmdbNode = false;
      for (var i = 0; i < $scope.nodes.length; i++) {
        if ($scope.nodes[i].nodeType === CONST.NODETYPE.CLASS) {
          cmdbNode = true;
          break;
        }
      }
      return cmdbNode;
    };
    function checkJobStatus(response, job_id) {
      var status = response.slice(0, 8);
      if (status != 'complete') {
        exportPoll(job_id);
      } else {
        queryBuilderCanvasUtil.setExportQuerySysId(
          response.slice(9, response.length)
        );
        $rootScope.$broadcast('queryBuilder.exportSavedQuery.success');
      }
    }
    function exportPoll(job_id) {
      queryService.exportSavedQueryPoll(job_id).then(
        function (response) {
          checkJobStatus(response, job_id);
        },
        function (err) {
          $rootScope.$broadcast('queryBuilder.exportSavedQuery.failure');
        }
      );
    }
    $scope.showImportButton = $window.NOW.can_write;
    $scope.importQuery = function () {
      var importInput = angular.element('#query-import');
      importInput.click();
    };
    $scope.importChanged = function (event) {
      if (event.target.files && event.target.files.length > 0) {
        var file = event.target.files[0];
        var fd = new FormData();
        fd.append('sysparm_target', 'qb_saved_query');
        fd.append('attachFile', file, file.name);
        queryService.importQuery(fd);
        event.target.value = null;
      }
    };
    $scope.enableScheduleButton = function () {
      return !$scope.currentQuery.changed && $scope.isSavedQuery();
    };
    $scope.showReportButtonWithTooltip = function () {
      return $scope.canCreateReport && !$scope.enableReportButton();
    };
    $scope.enableReportButton = function () {
      if (!$scope.currentQuery.sys_id) {
        return false;
      }
      if (!$scope.currentQuery.execution_id && !$scope.hasSentOutRequest) {
        $scope.hasSentOutRequest = true;
        $timeout(function () {
          queryService.getLatestExecutionId($scope.currentQuery.sys_id).then(
            function (response) {
              $scope.hasSentOutRequest = false;
              $scope.currentQuery.execution_id = null;
              if (response && response.result)
                $scope.currentQuery.execution_id = response.result.execution_id;
              if (!$scope.currentQuery.execution_id) {
                return false;
              }
            },
            function (err) {
              $scope.currentQuery.execution_id = null;
              return false;
            }
          );
        }, 5000);
      }
      return (
        $scope.canCreateReport &&
        !$scope.currentQuery.changed &&
        $scope.isSavedQuery() &&
        $scope.currentQuery.execution_id &&
        $scope.currentQuery.schedules &&
        $scope.currentQuery.schedules.length > 0
      );
    };
    $scope.getReportButtonTabIndex = function () {
      if ($scope.enableReportButton()) return 0;
      return -1;
    };
    $scope.createReport = function (savedQueryID) {
      queryService.getReportURL(savedQueryID).then(
        function (response) {
          $window.location = response.result;
        },
        function (err) {
          $rootScope.$broadcast('queryBuilder.getReportURL.failure');
        }
      );
    };
    $scope.reportButtonTooltip = i18n.getMessage(
      'queryBuilder.notifications.reportButtonTooltip'
    );
    $scope.moveFocusToBannerButtons = function () {
      queryBuilderCommon.focusFirstElement(
        '.query-builder-navbar .toolbar-buttons'
      );
    };
    $scope.moveFocusToLeftPanel = function () {
      queryBuilderCommon.focusFirstElement(
        '.left-panel .panel-default.content'
      );
    };
    $scope.moveFocusToMainContent = function () {
      queryBuilderCommon.focusFirstElement('.main-content');
    };
    $scope.moveFocusToRightPanel = function () {
      queryBuilderCommon.focusFirstElement('.right-panel-nav .right-panel');
    };
    $scope.isSourceNlq = function () {
      return isSourceNlq;
    };
    function hasServiceWatchEnabled() {
      if ($scope.service_watch_enabled) return true;
      return false;
    }
    function resetBasic() {
      var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
      if (latestTouched) latestTouched.touched = false;
      queryBuilderCanvasUtil.setLatestTouched(null);
      queryBuilderCanvasUtil.setShowFilters(false);
      $scope.filterConfigRelated.encodedQuery = '';
      $rootScope.$broadcast('queryBuilder.resetTableArea');
      var operatorLines = queryBuilderCanvasUtil.getOperatorLines();
      if (operatorLines.length > 0) {
        for (var i = 0; i < operatorLines.length; i++)
          operatorLines[i].touched = false;
        queryBuilderCanvasUtil.setOperatorLines([]);
      }
      $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
      $rootScope.$broadcast('queryBuilder.closeInfoBox');
      $rootScope.$broadcast('queryBuilder.resetTree');
    }
    $scope.$on('canvas_touched', function (event, args) {
      if ($scope.errorFound) {
        delete $scope.errorFound.error;
        $scope.errorFound = null;
      }
      toggleSelected(queryBuilderCanvasUtil.getLatestTouched());
      queryBuilderCanvasUtil.setLatestTouched(null);
      $rootScope.$broadcast('queryBuilder.closeInfoBox');
      if (queryBuilderCommon.isServiceQuery($scope.currentQuery))
        $scope.showFilterType = CONST.BASE_SERVICE_CLASS;
    });
    $scope.$on('node_touched', function (event, args) {
      if (queryBuilderSelection.hasSelection())
        queryBuilderSelection.clearSelection();
      nodeTouched(args);
      $rootScope.$broadcast('queryBuilder.closeInfoBox');
    });
    $scope.$on('connection_touched', function (event, args) {
      $rootScope.$broadcast('queryBuilder.closeInfoBox');
      $rootScope.$broadcast('queryBuilder.resetTree');
      if (queryBuilderSelection.hasSelection())
        queryBuilderSelection.clearSelection();
      if ($scope.errorFound) {
        delete $scope.errorFound.error;
        $scope.errorFound = null;
      }
      var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
      if (latestTouched && latestTouched.touched)
        var sameConnection = latestTouched === args.connection;
      if (!sameConnection && latestTouched && latestTouched.touched)
        toggleSelected(latestTouched);
      if (sameConnection) {
        toggleSelected(latestTouched);
        queryBuilderCanvasUtil.setLatestTouched(null);
      } else {
        $timeout(function () {
          if (queryBuilderValidation.isOnMultipleSide(args.connection)) {
            var parent = args.connection.first;
            var child = args.connection.second;
            if (parent.nodeType === CONST.NODETYPE.OPERATOR)
              parent = queryBuilderCommon.getTrueParent(parent);
            if (child.nodeType === CONST.NODETYPE.OPERATOR)
              child = queryBuilderCommon.getTrueChild(child);
            if (parent != null && child != null) {
              args.connection.touchedType = 'connection';
              queryBuilderCanvasUtil.setLatestTouched(args.connection);
              $scope.suggestedRelations = $scope.getSuggestedRelations(
                parent,
                child
              );
              $scope.suggestedReferences = $scope.getSuggestedReferences(
                parent,
                child
              );
              if (queryBuilderCommon.isGeneralQuery($scope.currentQuery)) {
                $scope.connectionDisplayValueForward =
                  parent.name +
                  ' [' +
                  i18n.getMessage('queryBuilder.general.parent') +
                  '] - ' +
                  child.name +
                  ' [' +
                  i18n.getMessage('queryBuilder.general.child') +
                  ']';
                $scope.connectionDisplayValueReverse =
                  child.name +
                  ' [' +
                  i18n.getMessage('queryBuilder.general.parent') +
                  '] - ' +
                  parent.name +
                  ' [' +
                  i18n.getMessage('queryBuilder.general.child') +
                  ']';
              } else if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery)
              ) {
                $scope.connectionDisplayValueForward =
                  parent.name + ' - ' + child.name;
                $scope.connectionDisplayValueReverse =
                  child.name + ' - ' + parent.name;
              }
            } else {
              $scope.suggestedRelations = [];
              snNotification
                .show(
                  'error',
                  i18n.getMessage('queryBuilder.connection.invalid'),
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
            }
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            toggleSelected(latestTouched);
            selectOtherSideOfOperator(latestTouched);
            $scope.$broadcast('queryBuilder.update_right_panel_items', args);
            if (queryBuilderCanvasUtil.getShowFilters()) {
              queryBuilderCanvasUtil.setShowFilters(false);
              $scope.filterConfigRelated.encodedQuery = '';
            }
          } else queryBuilderCanvasUtil.setLatestTouched(null);
        });
      }
    });
    $scope.$on('node_dropped', function (event, args) {
      setDroppedNodeProperties();
      addProperties(args.node);
      nodeTouched(args);
    });
    $scope.$on('node_recreated', function (event, args) {
      setDroppedNodeProperties();
    });
    $scope.$on('queryBuilder.createNewQueryClicked', $scope.createNewClicked);
    $scope.$on('queryBuilder.newQuery', function (event, data) {
      $rootScope.$broadcast('ciClassHierarchy.clearSearch');
      var tabCheck = null;
      if (data.type === CONST.QUERY_TYPES.GENERAL) tabCheck = '2';
      else if (data.type === CONST.QUERY_TYPES.SERVICE) tabCheck = '3';
      if (
        ($scope['tab' + tabCheck] && !$scope['tab' + tabCheck].changed) ||
        !$scope['tab' + tabCheck]
      ) {
        var title = data.title;
        var type = data.type;
        $scope.clearCanvas();
        $rootScope.$broadcast('queryBuilder.resetTree');
        $rootScope.$broadcast('queryBuilder.resetTableArea');
        $rootScope.$broadcast('queryBuilder.loadingQueryType', {
          type: data.type,
        });
        $rootScope.$broadcast('queryBuilder.resetLeftTabs');
        $scope.currentQuery = {};
        $scope.currentQuery.active = true;
        $scope.currentQuery.new = true;
        $scope.currentQuery.duplicate = false;
        $scope.currentQuery.changed = false;
        $scope.currentQuery.scheduleMessageButton = i18n.getMessage(
          'queryBuilder.general.createSchedule'
        );
        $scope.currentQuery.query = {};
        $scope.currentQuery.name = title;
        $scope.currentQuery.description = $scope.currentQuery.description
          ? $scope.currentQuery.description
          : '';
        $scope.currentQuery.query.query_type = type;
        $scope.currentQuery.query.graph = {};
        $scope.currentQuery.query.graph.nodes = [];
        $scope.currentQuery.query.graph.edges = [];
        $scope.humanReadableType($scope.currentQuery);
        $scope.currentQuery.usedNames = {};
        $scope.currentQuery.tags = [];
        if (type === CONST.QUERY_TYPES.GENERAL) {
          $scope.showFilterType = 'cmdb_ci';
          $scope.activeTab = 2;
          initializeTab();
        } else if (type === CONST.QUERY_TYPES.SERVICE) {
          $scope.currentQuery.query.returnValues = [];
          $scope.currentQuery.query.applied_filters = '';
          $scope.currentQuery.query.includesGraph = true;
          $scope.currentQuery.hasEntryPoint = false;
          $scope.activeTab = 3;
          queryBuilderCanvasUtil.setLoadingTableProperties(true);
          queryService
            .getCIProperties(CONST.BASE_SERVICE_CLASS)
            .then(function (results) {
              queryBuilderCanvasUtil.addProperty(
                CONST.BASE_SERVICE_CLASS,
                results
              );
              queryBuilderCanvasUtil.setLoadingTableProperties(false);
            });
          $scope.showFilterType = CONST.BASE_SERVICE_CLASS;
          $scope.tab3 = angular.copy($scope.currentQuery);
          $scope.tab3Before = angular.copy($scope.tab3);
        }
        if ($scope.activeTab === $scope.ranTab)
          $rootScope.$broadcast('queryBuilder.resetBasicTable');
        $scope.currentQuery.query.graph = {};
        queryBuilderCommon.updateSavedQueryURLParameter(null);
      } else
        promptForSave(event, {
          data: data,
          tab: tabCheck,
        });
    });
    $scope.$on('queryBuilder.setTabBeforeState', function () {
      if ($scope.activeTab === 2) {
        initializeTab();
      }
    });
    $scope.$on('queryBuilder.loadSavedQuery', function (event, data) {
      isSourceNlq = data.source === 'NLQ';
      var tabCheck = null;
      if (data.query.query_type === CONST.QUERY_TYPES.GENERAL) tabCheck = '2';
      else if (data.query.query_type === CONST.QUERY_TYPES.SERVICE)
        tabCheck = '3';
      if (
        ($scope['tab' + tabCheck] && !$scope['tab' + tabCheck].changed) ||
        !$scope['tab' + tabCheck] ||
        ($scope['tab' + tabCheck] &&
          $scope['tab' + tabCheck].changed &&
          !$scope.canWrite)
      )
        initializeLoadQuery(data, false);
      else
        promptForSave(event, {
          data: data,
          tab: tabCheck,
        });
    });
    $scope.$on('queryBuilder.duplicateQuery', function (event, data) {
      var tabCheck = null;
      if (data.query.query_type === CONST.QUERY_TYPES.GENERAL) tabCheck = '2';
      else if (data.query.query_type === CONST.QUERY_TYPES.SERVICE)
        tabCheck = '3';
      if (
        ($scope['tab' + tabCheck] && !$scope['tab' + tabCheck].changed) ||
        !$scope['tab' + tabCheck]
      )
        initializeLoadQuery(data, true);
      else
        promptForSave(event, {
          data: data,
          tab: tabCheck,
        });
    });
    snCustomEvent.observe(
      'queryBuilder:input-nlq-callback',
      function (payload) {
        if (payload.apiResult.data_configurations.length > 0) {
          var data = {
            name: $scope.currentQuery.name,
            description: payload.userQuestion,
            query: {
              query_type: 'cmdb',
              graph: {
                nodes: payload.apiResult.data_configurations[0].nodes,
                edges: payload.apiResult.data_configurations[0].edges,
              },
            },
            usedNames: payload.apiResult.data_configurations[0].usedNames,
          };
          if ($scope.currentQuery.sys_id) {
            data.sys_id = $scope.currentQuery.sys_id;
          }
          initializeLoadQuery(data, false);
        }
      }
    );
    snCustomEvent.observe('snfilter:activated', function () {
      $timeout(function () {
        queryBuilderCommon.focusFilterArea();
      });
    });
    function initializeLoadQuery(data, duplicate) {
      $rootScope.$broadcast('ciClassHierarchy.clearSearch');
      $rootScope.$broadcast('queryBuilder.closeInfoBox');
      $scope.$broadcast('queryBuilder.hide_right_dropdown');
      $scope.clearCanvas();
      $rootScope.$broadcast('queryBuilder.resetTableArea');
      $rootScope.$broadcast('queryBuilder.loadingQueryType', {
        type: data.query.query_type,
      });
      $scope.activeView = 1;
      $scope.currentQuery = angular.copy(data);
      $scope.currentQuery.active = true;
      $scope.currentQuery.new = $scope.currentQuery.sys_id ? false : true;
      $scope.currentQuery.duplicate = duplicate;
      $scope.currentQuery.changed = false;
      if ($scope.currentQuery.containsReport) {
        confirmReportAttached();
      }
      if (duplicate) {
        $scope.currentQuery.name +=
          ' - ' + i18n.getMessage('queryBuilder.general.copy');
        $scope.currentQuery.name = $scope.currentQuery.name.substring(
          0,
          window.NOW.max_name_length
        );
        $scope.currentQuery.sys_id = '';
        $scope.currentQuery.created_by = '';
        $scope.currentQuery.created_on = '';
        $scope.currentQuery.updated_by = '';
        $scope.currentQuery.updated_on = '';
        data.schedules = [];
        $scope.currentQuery.schedules = [];
        data.groups = [];
        $scope.currentQuery.groups = [];
      }
      if (data.schedules && data.schedules.length > 0)
        $scope.currentQuery.scheduleMessageButton = i18n.getMessage(
          'queryBuilder.general.viewSchedule'
        );
      else if (!data.schedules || data.schedules.length === 0)
        $scope.currentQuery.scheduleMessageButton = i18n.getMessage(
          'queryBuilder.general.createSchedule'
        );
      if (data.query.query_type === CONST.QUERY_TYPES.GENERAL) {
        $scope.activeTab = 2;
        initializeTab();
      } else if (data.query.query_type === CONST.QUERY_TYPES.SERVICE) {
        $scope.activeTab = 3;
        queryBuilderCanvasUtil.setLoadingTableProperties(true);
        queryService
          .getCIProperties(CONST.BASE_SERVICE_CLASS)
          .then(function (results) {
            queryBuilderCanvasUtil.setLoadingTableProperties(false);
            queryBuilderCanvasUtil.addProperty(
              CONST.BASE_SERVICE_CLASS,
              results
            );
            $scope.currentQuery.query.returnValues = $scope.expandOptionLabels(
              $scope.currentQuery.query
            );
          });
        $scope.showFilterType = CONST.BASE_SERVICE_CLASS;
        recreateServiceFilterCard($scope.currentQuery);
        $scope.tab3 = angular.copy($scope.currentQuery);
        $scope.tab3Before = angular.copy($scope.tab3);
      }
      $scope.humanReadableType($scope.currentQuery);
      if ($scope.activeTab === $scope.ranTab)
        $rootScope.$broadcast('queryBuilder.resetBasicTable');
      $rootScope.$broadcast(
        'queryBuilder.loadQuery',
        $scope.currentQuery.query.graph
      );
      if ($scope.currentQuery.sys_id)
        queryBuilderCommon.updateSavedQueryURLParameter(
          $scope.currentQuery.sys_id
        );
      else queryBuilderCommon.updateSavedQueryURLParameter(null);
    }
    $scope.$on('queryBuilder.deleteQuery', function (event, data) {
      confirmDelete(event, data);
    });
    $scope.$on('queryBuilder.showProperties', function (event, data) {
      if ($scope.showPropertyHeaderIcon()) $scope.toggleShowProperties();
    });
    function recreateServiceFilterCard(serviceQuery) {
      serviceQuery.query.applied_filters =
        serviceQuery.query.applied_filters.replace('^ORDERBYname', '');
      serviceQuery.query.applied_filters =
        serviceQuery.query.applied_filters.replace('^ORDERBYnull', '');
      var newFilterCard = {
        nodeId: serviceQuery.name,
        filters_attrib: serviceQuery.query.applied_filters,
        applied_filters: serviceQuery.query.applied_filters,
        humanReadable_attrib: [],
        node: serviceQuery,
      };
      if (newFilterCard.applied_filters != '') {
        encodedQueryService
          .getHumanReadable(
            $scope.showFilterType,
            serviceQuery.query.applied_filters
          )
          .then(function (results) {
            newFilterCard.humanReadable_attrib = results;
          });
        $scope.currentFilters.push(newFilterCard);
      }
    }
    function toggleSelected(node) {
      if (node) {
        node.touched = !node.touched;
        var operatorLines = queryBuilderCanvasUtil.getOperatorLines();
        if (operatorLines.length > 0) {
          for (var i = 0; i < operatorLines.length; i++)
            operatorLines[i].touched = false;
          queryBuilderCanvasUtil.setOperatorLines([]);
        }
        $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
      }
    }
    function addProperties(classes) {
      var allProperties = queryBuilderCanvasUtil.getAllProperties();
      if (allProperties && !allProperties[classes.type]) {
        queryBuilderCanvasUtil.setLoadingTableProperties(true);
        queryService.getCIProperties(classes.type).then(function (results) {
          queryBuilderCanvasUtil.setLoadingTableProperties(false);
          queryBuilderCanvasUtil.addProperty(classes.type, results);
        });
      }
    }
    function promptForSave(event, data) {
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
              leaveWithoutSave(event, data);
            },
          },
          {
            label: i18n.getMessage('queryBuilder.dialog.box.confirm'),
            callBack: function () {
              saveQueryFromPrompt(event, data);
            },
            primary: true,
          },
        ],
      };
      $rootScope.$broadcast('dialogBox.open');
    }
    function warnAboutGroup(event, data) {
      var defer = $q.defer();
      $scope.dialogInfo = {
        header: i18n.getMessage('queryBuilder.dialog.box.label'),
        message: i18n.getMessage('queryBuilder.dialog.box.groupWarning'),
        buttons: [
          {
            label: i18n.getMessage('queryBuilder.dialog.box.cancel'),
            callBack: function () {
              defer.reject();
            },
          },
          {
            label: i18n.getMessage('queryBuilder.dialog.box.confirm'),
            callBack: function () {
              defer.resolve();
            },
            primary: true,
          },
        ],
      };
      $rootScope.$broadcast('dialogBox.open');
      return defer.promise;
    }
    function confirmDelete(event, data) {
      var confirmMessage = '';
      if (data.savedQuery.groups && data.savedQuery.groups.length > 0)
        confirmMessage +=
          i18n.getMessage('queryBuilder.dialog.box.deleteWarnGroup') + ' ';
      confirmMessage +=
        i18n.getMessage('queryBuilder.dialog.box.deleteMessage') +
        ' ' +
        data.savedQuery.name +
        '?';
      $scope.dialogInfo = {
        header: i18n.getMessage('queryBuilder.dialog.box.confirmDelete'),
        message: confirmMessage,
        buttons: [
          {
            label: i18n.getMessage('queryBuilder.dialog.box.cancel'),
          },
          {
            label: i18n.getMessage('queryBuilder.dialog.box.confirm'),
            callBack: function () {
              deleteQuery(event, data);
            },
            primary: true,
          },
        ],
      };
      $rootScope.$broadcast('dialogBox.open');
    }
    function confirmReportAttached() {
      var confirmMessage = i18n.getMessage(
        'queryBuilder.dialog.box.reportWarning'
      );
      $scope.dialogInfo = {
        header: i18n.getMessage('queryBuilder.dialog.box.reportAttached'),
        message: confirmMessage,
        buttons: [
          {
            label: i18n.getMessage('queryBuilder.dialog.box.confirm'),
            primary: true,
          },
        ],
      };
      $rootScope.$broadcast('dialogBox.open');
    }
    function leaveWithoutSave(event, data) {
      resetCurrentQueryValues();
      if (data.tab) $scope['tab' + data.tab].changed = false;
      $rootScope.$broadcast(event.name, data.data);
    }
    function saveQueryFromPrompt(event, data) {
      var tab = data.tab;
      var query = $scope['tab' + tab + 'After'];
      var blob = $scope['tab' + tab + 'AfterFlattened'].query;
      var name = $scope['tab' + tab].name;
      var description = $scope['tab' + tab].description;
      var newQuery = $scope['tab' + tab].new;
      var duplicate = $scope['tab' + tab].duplicate;
      saveQuery(query, blob, name, description, newQuery, duplicate, tab).then(
        function () {
          resetCurrentQueryValues();
          if (data.data.sys_id && data.data.sys_id === query.sys_id) {
            for (var i = 0; i < $scope.savedQueries.length; i++) {
              if ($scope.savedQueries[i].sys_id === data.data.sys_id) {
                $rootScope.$broadcast(event.name, $scope.savedQueries[i]);
                break;
              }
            }
          } else $rootScope.$broadcast(event.name, data.data);
        }
      );
    }
    function deleteQuery(event, data) {
      var savedQuery = data.savedQuery;
      queryService.deleteQuery(savedQuery).then(
        function (result) {
          if (result.saved_query_id) {
            if ($scope.tab2 && $scope.tab2.sys_id === savedQuery.sys_id)
              $scope.closeActiveCanvas(null, 2, true);
            else if ($scope.tab3 && $scope.tab3.sys_id === savedQuery.sys_id)
              $scope.closeActiveCanvas(null, 3, true);
            removeCard(savedQuery);
            var notificationMessage =
              i18n.getMessage('queryBuilder.notifications.deleteSuccess') +
              ' ' +
              result.name;
            snNotification
              .show('success', notificationMessage, CONST.NOTIFICATION_TIME)
              .then(function (notificationElement) {
                queryBuilderCommon.focusNotificationCloseButton(
                  notificationElement
                );
              });
          } else {
            var notificationMessage =
              i18n.getMessage('queryBuilder.notifications.deleteProblem') +
              ' ' +
              result.name;
            if (result.error) notificationMessage += '. ' + result.error;
            else if (
              result.data &&
              result.data.result &&
              result.data.result.error
            )
              notificationMessage += '. ' + result.data.result.error;
            snNotification
              .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
              .then(function (notificationElement) {
                queryBuilderCommon.focusNotificationCloseButton(
                  notificationElement
                );
              });
          }
        },
        function (failure) {
          var notificationMessage =
            i18n.getMessage('queryBuilder.notifications.deleteProblem') +
            ' ' +
            escapeHtml(savedQuery.name);
          snNotification
            .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
            .then(function (notificationElement) {
              queryBuilderCommon.focusNotificationCloseButton(
                notificationElement
              );
            });
        }
      );
    }
    function removeCard(savedQuery) {
      var index = -1;
      for (var i = 0; i < $scope.savedQueries.length; i++) {
        if ($scope.savedQueries[i].sys_id === savedQuery.sys_id) index = i;
      }
      if (index > -1) $scope.savedQueries.splice(index, 1);
    }
    function resetCurrentQueryValues() {
      $scope.currentQuery.new = false;
      $scope.currentQuery.duplicate = false;
      $scope.currentQuery.changed = false;
      $scope.currentQuery.query = {};
    }
    function setDroppedNodeProperties() {
      queryBuilderCanvasUtil.setDroppedClass(true);
      if (!$scope.rightContainerClosed) $scope.displayRightPanel = true;
      $scope.headerOffset = 0;
      $rootScope.$broadcast('queryBuilder.resetTableArea');
    }
    function nodeTouched(args) {
      if ($scope.errorFound) {
        delete $scope.errorFound.error;
        $scope.errorFound = null;
      }
      if (
        args.node.nodeType === CONST.NODETYPE.CLASS ||
        args.node.nodeType === CONST.NODETYPE.SERVICE ||
        args.node.nodeType === CONST.OBJECT_TYPES.NON_CMDB
      ) {
        var sameNode = compareLatestTouched(args.node);
        if (sameNode) {
          toggleSelected(queryBuilderCanvasUtil.getLatestTouched());
          queryBuilderCanvasUtil.setLatestTouched(null);
          queryBuilderCanvasUtil.setShowFilters(false);
        } else {
          if (args.node.nodeType === CONST.NODETYPE.CLASS)
            args.node.touchedType = CONST.OBJECT_TYPES.NODE;
          else if (args.node.nodeType === CONST.NODETYPE.SERVICE)
            args.node.touchedType = CONST.OBJECT_TYPES.SERVICE;
          else if (args.node.nodeType === CONST.OBJECT_TYPES.NON_CMDB)
            args.node.touchedType = CONST.OBJECT_TYPES.NON_CMDB;
          queryBuilderCanvasUtil.setLatestTouched(args.node);
          if (args.node.nodeType !== CONST.NODETYPE.SERVICE)
            $scope.showFilterType = args.node.filters.platform;
          var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
          toggleSelected(latestTouched);
          queryBuilderCanvasUtil.setDroppedClass(true);
          $scope.headerOffset = 0;
          if (queryBuilderCanvasUtil.getShowFilters()) {
            queryBuilderCanvasUtil.setShowFilters(false);
            $scope.filterConfigRelated.encodedQuery =
              latestTouched.applied_filters;
            $timeout(function () {
              queryBuilderCanvasUtil.setShowFilters(true);
            });
          } else {
            $scope.filterConfigRelated.encodedQuery =
              latestTouched.applied_filters;
          }
        }
      } else if (
        args.node.nodeType === CONST.NODETYPE.OPERATOR &&
        $scope.canWrite
      ) {
        if (args.node.name === CONST.OPERATOR.AND) {
          args.node.name = CONST.OPERATOR.OR;
        } else if (args.node.name == CONST.OPERATOR.OR) {
          args.node.name = CONST.OPERATOR.AND;
        }
      }
    }
    function compareLatestTouched(node) {
      var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
      var sameNode = latestTouched === node;
      if (!sameNode && latestTouched && latestTouched.touched)
        toggleSelected(latestTouched);
      return sameNode;
    }
    function selectOtherSideOfOperator(latest) {
      if (latest) {
        var first = latest.first;
        var second = latest.second;
        if (first.nodeType === CONST.NODETYPE.OPERATOR) {
          while (first && first.nodeType === CONST.NODETYPE.OPERATOR) {
            var left = findLeftConnectionIndex(first);
            if (left > -1) {
              $scope.connections[left].info.touched = true;
              queryBuilderCanvasUtil.pushOperatorLines(
                $scope.connections[left].info
              );
              first.touched = true;
              queryBuilderCanvasUtil.pushOperatorLines(first);
            }
            first = first.leftConnections[0];
          }
        }
        if (second.nodeType === CONST.NODETYPE.OPERATOR) {
          while (second && second.nodeType === CONST.NODETYPE.OPERATOR) {
            var right = findRightConnectionIndex(second);
            if (right > -1) {
              $scope.connections[right].info.touched = true;
              queryBuilderCanvasUtil.pushOperatorLines(
                $scope.connections[right].info
              );
              second.touched = true;
              queryBuilderCanvasUtil.pushOperatorLines(second);
            }
            second = second.rightConnections[0];
          }
        }
      }
    }
    function findLeftConnectionIndex(operator) {
      var index = -1;
      for (var i = 0; i < $scope.connections.length; i++) {
        if (
          $scope.connections[i].info.second === operator &&
          $scope.connections[i].info.first === operator.leftConnections[0]
        )
          index = i;
      }
      return index;
    }
    function findRightConnectionIndex(operator) {
      var index = -1;
      for (var i = 0; i < $scope.connections.length; i++) {
        if (
          $scope.connections[i].info.first === operator &&
          $scope.connections[i].info.second === operator.rightConnections[0]
        )
          index = i;
      }
      return index;
    }
    function handleKeyPress(event) {
      $scope.$apply(function () {
        if (event.target.origin === CONST.NLQ_QUERY_ORIGIN) return;
        if (
          (event.which === 8 || event.which === 46) &&
          event.target.nodeName !== 'INPUT' &&
          event.target.nodeName !== 'SELECT' &&
          event.target.nodeName !== 'TEXTAREA' &&
          $scope.canWrite
        ) {
          var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
          if (latestTouched && latestTouched.touchedType === 'connection')
            $rootScope.$broadcast('queryBuilder.deleteSpecificConnection', {
              conn: latestTouched,
            });
          if (
            latestTouched &&
            (latestTouched.touchedType === CONST.OBJECT_TYPES.NODE ||
              latestTouched.touchedType === 'service' ||
              latestTouched.touchedType === CONST.OBJECT_TYPES.NON_CMDB)
          )
            $rootScope.$broadcast('queryBuilder.deleteNode', {
              node: latestTouched,
            });
          event.preventDefault();
        } else if (
          event.which === CONST.KEY_CODES.LEFT_ARROW ||
          event.which === CONST.KEY_CODES.RIGHT_ARROW
        ) {
          var target = angular.element(event.target);
          if (
            target[0].classList.contains('saved-queries-tab') ||
            target[0].classList.contains('canvas-tab')
          ) {
            $rootScope.$broadcast('queryBuilder.switchTabFromArrows', {
              arrow: event.which,
              panel: CONST.SAVED_QUERIES,
            });
          } else {
            var parents = target.parents();
            var panel = null;
            for (var i = 0; i < parents.length; i++) {
              var specific = angular.element(parents[i]);
              if (specific && specific[0] && specific[0].classList.length > 0) {
                if (specific[0].classList.contains('left-panel')) {
                  panel = CONST.LEFT;
                  break;
                } else if (specific[0].classList.contains('right-panel-nav')) {
                  panel = CONST.RIGHT;
                  break;
                }
              }
            }
            if (panel) {
              $rootScope.$broadcast('queryBuilder.switchTabFromArrows', {
                arrow: event.which,
                panel: panel,
              });
            }
          }
        }
      });
    }
    $document.on('keydown', function (e) {
      handleKeyPress(e);
    });
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    function saveQuery(
      savingQuery,
      blob,
      name,
      description,
      newQuery,
      duplicateQuery,
      tab
    ) {
      var defer = $q.defer();
      var connections = savingQuery.query.graph.edges;
      var nodes = savingQuery.query.graph.nodes;
      if (
        queryBuilderValidation.isValidQuery(
          'save',
          savingQuery,
          connections,
          nodes,
          name
        )
      ) {
        blob = JSON.stringify(blob);
        if (savingQuery.new || savingQuery.duplicate) {
          var dependencies = savingQuery.dependencies || [];
          queryService.saveQuery(name, blob, description, dependencies).then(
            function (result) {
              if (result.saved_query_id) {
                var sys_id = result.saved_query_id;
                var uaQuerySaved = usageAnalytics.getInstance(
                  UA.EVENTS.QUERY_SAVED
                );
                uaQuerySaved.addMetric(
                  UA.METRICS.QUERY_TYPE,
                  queryBuilderCommon.getQueryType(JSON.parse(blob))
                );
                uaQuerySaved.addMetric(
                  UA.METRICS.QUERY_CLASSES,
                  queryBuilderCommon.getClassCount(JSON.parse(blob))
                );
                uaQuerySaved.addMetric(
                  UA.METRICS.QUERY_OPERATORS,
                  queryBuilderCommon.getOperatorCount(JSON.parse(blob))
                );
                uaQuerySaved.addMetric(
                  UA.METRICS.QUERY_DEPTH,
                  queryBuilderCommon.getQueryDepth(savingQuery.query.graph)
                );
                uaQuerySaved.flush();
                savingQuery.new = false;
                savingQuery.duplicate = false;
                savingQuery.changed = false;
                savingQuery.sys_id = sys_id;
                if (window.NOW && window.NOW.user) {
                  savingQuery.created_by = window.NOW.user.name;
                  savingQuery.updated_by = window.NOW.user.name;
                }
                var currentTime = queryBuilderCommon.getCurrentTimeInUserFormat(
                  $scope.g_tz_offset
                );
                var currentRawTime = queryBuilderCommon.getCurrentRawTime();
                savingQuery.updated_on = currentTime;
                savingQuery.raw_updated_on = currentRawTime;
                savingQuery.created_on = currentTime;
                savingQuery.raw_created_on = currentRawTime;
                cmdbMatomo.trackEvent(
                  UA.MATOMO.CATEGORY,
                  UA.MATOMO.EVENTS.QB_QUERY_CREATED,
                  UA.MATOMO.EVENTS.QB_QUERY_CREATED
                );
                if (tab !== null) {
                  $scope['tab' + tab].changed = false;
                  $scope['tab' + tab + 'Before'] = angular.copy(savingQuery);
                  $scope['tab' + tab + 'Before'].query =
                    queryBuilderCommon.flattenLocally(
                      $scope['tab' + tab + 'Before'].query
                    );
                  if (tab === $scope.activeTab) {
                    $scope.currentQuery = angular.copy(savingQuery);
                  }
                } else if (tab === null && $scope.activeTab > 1) {
                  $scope['tab' + $scope.activeTab + 'Before'] =
                    angular.copy(savingQuery);
                  $scope['tab' + $scope.activeTab + 'Before'].query =
                    queryBuilderCommon.flattenLocally(
                      $scope['tab' + $scope.activeTab + 'Before'].query
                    );
                }
                var saveCardQuery = angular.copy(savingQuery);
                saveCardQuery.query = queryBuilderCommon.flattenLocally(
                  saveCardQuery.query
                );
                $scope.savedQueries.push(saveCardQuery);
                var notificationMessage =
                  i18n.getMessage('queryBuilder.notifications.saveSuccess') +
                  ' ' +
                  result.name;
                snNotification
                  .show('success', notificationMessage, CONST.NOTIFICATION_TIME)
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
                queryBuilderCommon.updateSavedQueryURLParameter(sys_id);
                defer.resolve();
              } else {
                var notificationMessage =
                  i18n.getMessage('queryBuilder.notifications.saveProblem') +
                  ' ' +
                  result.name;
                if (result.error) notificationMessage += '. ' + result.error;
                else if (
                  result.data &&
                  result.data.result &&
                  result.data.result.error
                )
                  notificationMessage += '. ' + result.data.result.error;
                snNotification
                  .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
                defer.reject();
              }
            },
            function (err) {
              var notificationMessage =
                i18n.getMessage('queryBuilder.notifications.saveProblem') +
                ' ' +
                escapeHtml(name);
              snNotification
                .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
              defer.reject();
            }
          );
        } else if (!savingQuery.new && !savingQuery.duplicate) {
          if (savingQuery.groups && savingQuery.groups.length > 0) {
            warnAboutGroup().then(function () {
              updateQuery(savingQuery, name, blob, description, tab).then(
                function () {
                  defer.resolve();
                },
                function () {
                  defer.reject();
                }
              );
            });
          } else {
            updateQuery(savingQuery, name, blob, description, tab).then(
              function () {
                defer.resolve();
              },
              function () {
                defer.reject();
              }
            );
          }
        }
      }
      return defer.promise;
    }
    function updateQuery(updatingQuery, name, blob, description, tab) {
      var defer = $q.defer();
      var sys_id = updatingQuery.sys_id;
      var dependencies = updatingQuery.dependencies || [];
      queryService
        .updateQuery(sys_id, name, blob, description, dependencies)
        .then(
          function (result) {
            if (result.saved_query_id) {
              isSourceNlq = false;
              var sys_id = result.saved_query_id;
              var uaQuerySaved = usageAnalytics.getInstance(
                UA.EVENTS.QUERY_SAVED
              );
              uaQuerySaved.addMetric(
                UA.METRICS.QUERY_TYPE,
                queryBuilderCommon.getQueryType(JSON.parse(blob))
              );
              uaQuerySaved.addMetric(
                UA.METRICS.QUERY_CLASSES,
                queryBuilderCommon.getClassCount(JSON.parse(blob))
              );
              uaQuerySaved.addMetric(
                UA.METRICS.QUERY_OPERATORS,
                queryBuilderCommon.getOperatorCount(JSON.parse(blob))
              );
              uaQuerySaved.addMetric(
                UA.METRICS.QUERY_DEPTH,
                queryBuilderCommon.getQueryDepth(updatingQuery.query.graph)
              );
              uaQuerySaved.flush();
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if (sys_id === $scope.savedQueries[i].sys_id) {
                  updatingQuery.changed = false;
                  updatingQuery.updated_on =
                    queryBuilderCommon.getCurrentTimeInUserFormat(
                      $scope.g_tz_offset
                    );
                  updatingQuery.raw_updated_on =
                    queryBuilderCommon.getCurrentRawTime();
                  if (tab !== null) {
                    $scope['tab' + tab].changed = false;
                    $scope['tab' + tab + 'Before'] =
                      angular.copy(updatingQuery);
                    $scope['tab' + tab + 'Before'].query =
                      queryBuilderCommon.flattenLocally(
                        $scope['tab' + tab + 'Before'].query
                      );
                    if (tab === $scope.activeTab) {
                      $scope.currentQuery.updated_on = updatingQuery.updated_on;
                      $scope.currentQuery = angular.copy(updatingQuery);
                    }
                  } else if (tab === null && $scope.activeTab > 1) {
                    $scope['tab' + $scope.activeTab + 'Before'] =
                      angular.copy(updatingQuery);
                    $scope['tab' + $scope.activeTab + 'Before'].query =
                      queryBuilderCommon.flattenLocally(
                        $scope['tab' + $scope.activeTab + 'Before'].query
                      );
                  }
                  $scope.savedQueries[i] = angular.copy(updatingQuery);
                  $scope.savedQueries[i].query =
                    queryBuilderCommon.flattenLocally(
                      $scope.savedQueries[i].query
                    );
                }
              }
              var notificationMessage =
                i18n.getMessage('queryBuilder.notifications.updateSuccess') +
                ' ' +
                result.name;
              snNotification
                .show('success', notificationMessage, CONST.NOTIFICATION_TIME)
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
              defer.resolve();
            } else {
              var notificationMessage =
                i18n.getMessage('queryBuilder.notifications.updateProblem') +
                ' ' +
                result.name;
              if (result.error) notificationMessage += '. ' + result.error;
              else if (
                result.data &&
                result.data.result &&
                result.data.result.error
              )
                notificationMessage += '. ' + result.data.result.error;
              snNotification
                .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
              defer.reject();
            }
          },
          function (err) {
            var notificationMessage =
              i18n.getMessage('queryBuilder.notifications.updateProblem') +
              ' ' +
              escapeHtml(name);
            snNotification
              .show('error', notificationMessage, CONST.NOTIFICATION_TIME)
              .then(function (notificationElement) {
                queryBuilderCommon.focusNotificationCloseButton(
                  notificationElement
                );
              });
            defer.reject();
          }
        );
      return defer.promise;
    }
    function createBlob(nodes, connections) {
      $scope.currentQuery.query.graph.nodes = nodes;
      $scope.currentQuery.query.graph.edges = connections;
      return JSON.stringify(
        queryBuilderCommon.flattenGraph(
          $scope.currentQuery.query,
          $scope.currentQuery.name
        )
      );
    }
    function createUaQueryRun(blob) {
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
        queryBuilderCommon.getQueryDepth($scope.currentQuery.query.graph)
      );
      return uaQueryRun;
    }
    function resetValuesForExecute(runInNewTab) {
      $scope.resultCount = 0;
      $scope.resultRows = [];
      $scope.resultColumns = [];
      $scope.runningQuery = true;
      $scope.processingQuery = false;
      $scope.loadingMoreResults = false;
      if (!runInNewTab) $scope.showResults = true;
      else $scope.showResults = false;
    }
    function initializeTab() {
      var queryVar = angular.copy($scope.currentQuery);
      queryVar.query.graph.nodes = $scope.nodes;
      queryVar.query.graph.edges = $scope.connections;
      queryVar.query = queryBuilderCommon.flattenLocally(queryVar.query);
      $scope.tab2 = angular.copy(queryVar);
      $scope.tab2Before = angular.copy($scope.tab2);
    }
    $scope.canvasAPI = {
      getImage: $scope.getImage,
      g_tz_offset: $scope.g_tz_offset,
      showSuggestedConnections: $scope.showSuggestedConnections,
      isGeneralQueryWithServiceWatch: $scope.isGeneralQueryWithServiceWatch,
      isGeneralQueryWithoutServiceWatch:
        $scope.isGeneralQueryWithoutServiceWatch,
      isServiceQuery: $scope.isServiceQuery,
    };
  },
]);
