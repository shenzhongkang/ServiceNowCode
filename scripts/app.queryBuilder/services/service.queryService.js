/*! RESOURCE: /scripts/app.queryBuilder/services/service.queryService.js */
angular.module('sn.queryBuilder').factory('queryService', [
  '$resource',
  'CONSTQB',
  'snNotification',
  'i18n',
  'tagsService',
  '$http',
  '$rootScope',
  'queryBuilderCommon',
  function (
    $resource,
    CONST,
    snNotification,
    i18n,
    tagsService,
    $http,
    $rootScope,
    queryBuilderCommon
  ) {
    'use strict';
    var GET_QUERIES = $resource(
      '/api/now/cmdbquerybuilder/queries',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var SAVE_QUERY = $resource(
      '/api/now/cmdbquerybuilder/queries/',
      {},
      {
        query: {
          method: 'POST',
          isArray: false,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        },
      }
    );
    var UPDATE_QUERY = $resource(
      '/api/now/cmdbquerybuilder/queries/:sys_id',
      {
        sys_id: '@sys_id',
      },
      {
        query: {
          method: 'PUT',
          isArray: false,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        },
      }
    );
    var DELETE_QUERY = $resource(
      '/api/now/cmdbquerybuilder/queries/:sys_id',
      {
        sys_id: '@sys_id',
      },
      {
        query: {
          method: 'DELETE',
          isArray: false,
        },
      }
    );
    var GET_RELATIONS = $resource(
      '/api/now/cmdbquerybuilder/relations',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_RELATION_TYPES = $resource(
      '/api/now/cmdbquerybuilder/relationTypes',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_ICONS = $resource(
      '/api/now/table/ngbsm_ci_type_icon',
      {
        sysparm_fields: 'sys_id,ci_type,icon.url',
        sysparm_display_value: false,
        sysparm_exclude_reference_link: true,
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_PROPERTIES = $resource(
      '/api/now/cmdbquerybuilder/properties/:table',
      {
        table: '@table',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var REGISTER_QUERY = $resource(
      '/api/now/cmdbquerybuilder/register/:saved_query_id',
      {
        saved_query_id: '@saved_query_id',
      },
      {
        query: {
          method: 'POST',
          isArray: false,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        },
      }
    );
    var EXECUTE_QUERY = $resource(
      '/api/now/cmdbquerybuilder/queries/bg/:query_id/execute',
      {
        query_id: '@query_id',
        sysparm_rest_integration_pool: true,
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var EXECUTE_ALL_QUERY = $resource(
      '/api/now/cmdbquerybuilder/queries/bg/:query_id/executeAll',
      {
        query_id: '@query_id',
        sysparm_rest_integration_pool: true,
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_QUERY_RESULTS = $resource(
      '/api/now/cmdbquerybuilder/queries/:query_id/result/:batch_start',
      {
        query_id: '@query_id',
        batch_start: '@batch_start',
        sysparm_rest_integration_pool: true,
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_QUERY_STATUS = $resource(
      '/api/now/cmdbquerybuilder/queries/:query_id/processStatus',
      {
        query_id: '@query_id',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_EXPORT_STATUS = $resource(
      '/api/now/cmdbquerybuilder/queries/:query_id/exportStatus',
      {
        query_id: '@query_id',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_FULL_CLASS_HIERARCHY_WITH_COUNT = $resource(
      '/api/now/cmdbquerybuilder/getFullClassHierarchyWithCount',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_CI_COUNTS = $resource(
      '/api/now/cimodel/classhierarchy/cicount',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var POLL_PROCESSOR = $resource(
      '/poll_processor.do',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_NON_CMDB_CLASSES = $resource(
      '/api/now/cmdbquerybuilder/noncmdb/gettables',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_REPORT_URL = $resource(
      '/api/now/cmdbquerybuilder/getReportUrl/:saved_query_id',
      {
        saved_query_id: '@saved_query_id',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_LATEST_EXCUTION_ID = $resource(
      '/api/now/cmdbquerybuilder/getLatestExecutionId/:saved_query_id',
      {
        saved_query_id: '@saved_query_id',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var CANCEL_WORKER_THREAD = $resource(
      '/api/now/cmdbquerybuilder/queries/bg/cancel/:worker_id/:query_id',
      {
        worker_id: '@worker_id',
        query_id: '@query_id',
      },
      {
        query: {
          method: 'PUT',
          isArray: false,
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
        },
      }
    );
    var GET_WORKER_THREAD_STATUS = $resource(
      '/api/now/cmdbquerybuilder/queries/bg/status/:worker_id/:query_id',
      {
        worker_id: '@worker_id',
        query_id: '@query_id',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    function _getAllQueries() {
      return GET_QUERIES.query().$promise.then(
        function (raw) {
          var queries = [];
          var savedQueryIDs = [];
          for (var i = 0; i < raw.result.length; i++) {
            if (raw.result[i].query) {
              var savedQuery = {};
              savedQuery.sys_id = raw.result[i].sys_id;
              savedQuery.name = raw.result[i].name;
              savedQuery.description = raw.result[i].description;
              savedQuery.created_by = raw.result[i].sys_created_by;
              savedQuery.updated_by = raw.result[i].sys_updated_by;
              savedQuery.utc_updated_on = raw.result[i].sys_updated_on;
              savedQuery.raw_updated_on = getRawDate(
                raw.result[i].sys_updated_on
              );
              savedQuery.updated_on = formatDate(raw.result[i].sys_updated_on);
              savedQuery.utc_created_on = raw.result[i].sys_created_on;
              savedQuery.raw_created_on = getRawDate(
                raw.result[i].sys_created_on
              );
              savedQuery.created_on = formatDate(raw.result[i].sys_created_on);
              savedQuery.groups = buildGroups(raw.result[i].groups);
              savedQuery.schedules = buildSchedules(raw.result[i].schedules);
              savedQuery.dependencies =
                raw.result[i].dependencies == null
                  ? []
                  : raw.result[i].dependencies.split(',');
              savedQuery.execution_id = raw.result[i].execution_id;
              savedQuery.containsReport = raw.result[i].report_availability;
              savedQuery.reportSource = buildReportSource(
                raw.result[i].name,
                raw.result[i].reportSourceId
              );
              savedQuery.tags = [];
              savedQuery.source = raw.result[i].source;
              var queryParsed = JSON.parse(raw.result[i].query);
              if (hasNeededProperties(queryParsed)) {
                savedQuery.query = {
                  query_type: queryParsed.type,
                  graph: {
                    nodes: queryParsed.nodes,
                    edges: queryParsed.edges,
                  },
                };
                if (queryParsed.usedNames)
                  savedQuery.usedNames = queryParsed.usedNames;
                else savedQuery.usedNames = {};
                if (savedQuery.query.query_type === CONST.QUERY_TYPES.SERVICE) {
                  var createdNode = null;
                  var nodeIndex = -1;
                  var connIndex = -1;
                  for (
                    var j = 0;
                    j < savedQuery.query.graph.nodes.length;
                    j++
                  ) {
                    if (
                      savedQuery.query.graph.nodes[j].type ===
                      CONST.NODETYPE.SERVICE
                    ) {
                      createdNode = savedQuery.query.graph.nodes[j];
                      nodeIndex = j;
                    } else if (
                      savedQuery.query.graph.nodes[j].type ===
                      CONST.NODETYPE.SERVICE_ELEMENT
                    )
                      savedQuery.query.graph.nodes[j].type =
                        CONST.NODETYPE.CLASS;
                  }
                  savedQuery.query.returnValues = createdNode.returnValues;
                  savedQuery.query.filters_attrib = createdNode.filters_attrib;
                  savedQuery.query.applied_filters = createdNode.applied_filters
                    ? createdNode.applied_filters
                    : createdNode.filters_attrib;
                  if (nodeIndex > -1)
                    savedQuery.query.graph.nodes.splice(nodeIndex, 1);
                  for (
                    var k = 0;
                    k < savedQuery.query.graph.edges.length;
                    k++
                  ) {
                    if (savedQuery.query.graph.edges[k].from === createdNode.id)
                      connIndex = k;
                  }
                  savedQuery.query.includesGraph = !queryParsed.isNot;
                  if (connIndex > -1)
                    savedQuery.query.graph.edges.splice(connIndex, 1);
                } else {
                  for (
                    var j = 0;
                    j < savedQuery.query.graph.nodes.length;
                    j++
                  ) {
                    if (savedQuery.query.graph.nodes[j].isPattern) {
                      savedQuery.query.graph.nodes[j].nodeType =
                        CONST.NODETYPE.CLASS;
                      savedQuery.query.graph.nodes[j].type =
                        CONST.NODETYPE.CLASS;
                    }
                  }
                }
                queries.push(savedQuery);
                savedQueryIDs.push(savedQuery.sys_id);
              } else
                snNotification
                  .show(
                    'error',
                    i18n.getMessage(
                      'queryBuilder.notifications.loadQueryProblem'
                    ) +
                      ': ' +
                      raw.result[i].name,
                    CONST.NOTIFICATION_TIME
                  )
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
            } else
              snNotification
                .show(
                  'error',
                  i18n.getMessage(
                    'queryBuilder.notifications.loadQueryProblem'
                  ) +
                    ': ' +
                    raw.result[i].name,
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
          }
          if (savedQueryIDs.length > 0) getTagsForAll(savedQueryIDs, queries);
          return queries;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _saveQuery(name, blob, description, dependencies) {
      var sendObject = {
        name: name,
        description: description,
        query: blob,
        dependencies: dependencies.toString(),
      };
      return SAVE_QUERY.query({}, sendObject).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          if (raw.data.result) return raw.data.result;
          return raw;
        }
      );
    }
    function _updateQuery(sys_id, name, blob, description, dependencies) {
      var sendObject = {
        name: name,
        description: description,
        query: blob,
        dependencies: dependencies.toString(),
        source: 'QB',
      };
      return UPDATE_QUERY.query(
        {
          sys_id: sys_id,
        },
        sendObject
      ).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          if (raw.data.result) return raw.data.result;
          return raw;
        }
      );
    }
    function _deleteQuery(query) {
      return DELETE_QUERY.query({
        sys_id: query.sys_id,
      }).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          if (raw.data.result) return raw.data.result;
          return raw;
        }
      );
    }
    function _getAllRelations() {
      return GET_RELATIONS.query().$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getRelationTypes() {
      return GET_RELATION_TYPES.query().$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getAllIcons() {
      return GET_ICONS.query().$promise.then(
        function (raw) {
          var icons = [];
          var results = raw.result;
          for (var i = 0; i < results.length; i++) {
            var data = results[i];
            icons[data['ci_type']] = data['icon.url'];
          }
          return icons;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getCIProperties(table) {
      return GET_PROPERTIES.query({
        table: table,
      }).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _registerQuery(blob, sysId) {
      var sendObject = {
        query: blob,
      };
      return REGISTER_QUERY.query(
        {
          saved_query_id: sysId,
        },
        sendObject
      ).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          return raw.data;
        }
      );
    }
    function _executeQuery(queryID) {
      return EXECUTE_QUERY.query({
        query_id: queryID,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _executeAllQuery(queryID) {
      return EXECUTE_ALL_QUERY.query({
        query_id: queryID,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getQueryResults(queryID, batchStart) {
      return GET_QUERY_RESULTS.query({
        query_id: queryID,
        batch_start: batchStart,
      }).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getQueryProcessingStatus(queryID) {
      return GET_QUERY_STATUS.query({
        query_id: queryID,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getExportStatus(queryID) {
      return GET_EXPORT_STATUS.query({
        query_id: queryID,
      }).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getLeftTree(queryType) {
      if (queryType === 'nonCmdb') {
        return GET_NON_CMDB_CLASSES.query().$promise.then(
          function (raw) {
            var formattedTree = raw.result;
            formattedTree = alterNonCmdbTables(formattedTree);
            return formattedTree;
          },
          function (raw) {
            return raw;
          }
        );
      } else {
        return GET_FULL_CLASS_HIERARCHY_WITH_COUNT.query().$promise.then(
          function (raw) {
            var count = raw.result.ciCountsForClasses;
            return GET_ICONS.query().$promise.then(function (images) {
              var icons = [];
              var results = images.result;
              for (var i = 0; i < results.length; i++) {
                var data = results[i];
                icons[data['ci_type']] = data['icon.url'];
              }
              var formattedTree = raw.result.ciClassHierarchy;
              formattedTree = alterClassHierarchy(formattedTree, count, icons);
              return formattedTree;
            });
          }
        );
      }
    }
    function _exportSavedQueryInit(queryIDs) {
      var ids = queryIDs.split(',');
      var sys_query = ids.join('^ORsys_id=');
      sys_query = 'sys_id=' + sys_query;
      return POLL_PROCESSOR.query({
        sysparm_processor: 'poll_processor',
        sysparm_scope: 'global',
        sysparm_want_session_messages: 'true',
        sysparm_target: 'qb_saved_query',
        sysparm_export: 'unload_xml',
        sysparm_rows: ids.length,
        sys_action: 'init',
        is_admin: 'true',
        sysparm_query: sys_query,
      }).$promise.then(
        function (raw) {
          raw = JSON.parse(JSON.stringify(raw));
          var job = '';
          for (var key in raw) {
            if (raw.hasOwnProperty(key)) {
              job += raw[key];
            }
          }
          return job;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _exportSavedQueryPoll(job) {
      return POLL_PROCESSOR.query({
        sysparm_processor: 'poll_processor',
        sysparm_scope: 'global',
        sysparm_want_session_messages: 'true',
        sys_action: 'poll',
        job_id: job,
      }).$promise.then(
        function (raw) {
          raw = JSON.parse(JSON.stringify(raw));
          var result = '';
          for (var key in raw) {
            if (raw.hasOwnProperty(key)) {
              result += raw[key];
            }
          }
          return result;
        },
        function (error) {
          return error.data;
        }
      );
    }
    function _importQuery(formData) {
      $http
        .post('/import_query.do', formData, {
          transformRequest: angular.identity,
          headers: { 'Content-Type': undefined },
        })
        .then(
          function success(response) {
            $rootScope.$broadcast('queryBuilder.importQuery.success');
          },
          function error(response) {}
        );
    }
    function _getReportURL(queryID) {
      return GET_REPORT_URL.query({
        saved_query_id: queryID,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getLatestExecutionId(queryID) {
      return GET_LATEST_EXCUTION_ID.query({
        saved_query_id: queryID,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function getRawDate(dateString) {
      dateString = dateString.replace(new RegExp('-', 'g'), '/');
      dateString += ' GMT';
      var date = new Date(dateString);
      return date.getTime();
    }
    function formatDate(dateString) {
      dateString = moment.utc(dateString, 'YYYY-MM-DD HH:mm:ss');
      var timezone = window.timezone;
      var local = moment.tz(dateString, timezone);
      var userDateFormat = window.NOW.g_user_date_format.toUpperCase();
      var userTimeFormat = window.NOW.g_user_time_format.replace(
        window.NOW.g_user_date_format,
        ''
      );
      var userDateTimeFormat = userDateFormat + userTimeFormat;
      return local.format(userDateTimeFormat);
    }
    function buildGroups(groups) {
      var sendGroups = [];
      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          sendGroups.push({
            name: groups[i].group_name,
            link: '/cmdb_group.do?sys_id=' + groups[i].sys_id,
          });
        }
      }
      return sendGroups;
    }
    function buildSchedules(schedules) {
      var sendSchedules = [];
      if (schedules) {
        for (var i = 0; i < schedules.length; i++) {
          sendSchedules.push({
            name: schedules[i].name,
            link: '/sysauto_query_builder.do?sys_id=' + schedules[i].sys_id,
            sys_id: schedules[i].sys_id,
          });
        }
      }
      return sendSchedules;
    }
    function buildReportSource(savedQueryName, reportSourceId) {
      return {
        name: savedQueryName,
        link: '/sys_report_source.do?sys_id=' + reportSourceId,
        sys_id: reportSourceId,
      };
    }
    function hasNeededProperties(parsedQuery) {
      if (parsedQuery !== null) {
        if (
          !parsedQuery.type ||
          (parsedQuery.type !== CONST.QUERY_TYPES.GENERAL &&
            parsedQuery.type !== CONST.QUERY_TYPES.SERVICE)
        )
          return false;
        if (!parsedQuery.nodes || parsedQuery.nodes.length === 0) return false;
      }
      return true;
    }
    function alterClassHierarchy(tempTree, ciCount, icons) {
      tempTree.label = tempTree.ci_type_label;
      tempTree.searchable_term = tempTree.ci_type_label;
      tempTree.node_type = tempTree.node_type;
      var totalCis = getCiCount(ciCount, tempTree);
      if (totalCis !== 0) tempTree.label += ' (' + totalCis + ')';
      tempTree.data = {};
      tempTree.data.label = tempTree.ci_type_label;
      tempTree.data.unique_id = tempTree.sys_id;
      tempTree.data.nodeType = tempTree.node_type;
      tempTree.data.image = '';
      tempTree.data.properties = '';
      tempTree.data.allowed_connections = [];
      tempTree.data.filters = {};
      tempTree.data.filters.platform = tempTree.ci_type;
      tempTree.data.filters.custom = '';
      tempTree.data.ci_type = tempTree.ci_type;
      tempTree.data.ci_type_label = tempTree.ci_type_label;
      tempTree.data.sys_id = tempTree.sys_id;
      if (icons[tempTree.data.ci_type])
        tempTree.data.image = icons[tempTree.data.ci_type];
      else tempTree.data.image = CONST.DEFAULT_CLASS_NODE_IMAGE;
      delete tempTree.ci_type;
      delete tempTree.ci_type_label;
      delete tempTree.has_extensions;
      delete tempTree.node_type;
      delete tempTree.sys_id;
      if (tempTree.children && tempTree.children.length > 0) {
        for (var i = 0; i < tempTree.children.length; i++) {
          alterClassHierarchy(tempTree.children[i], ciCount, icons);
        }
      }
      return tempTree;
    }
    function alterNonCmdbTables(tree) {
      var tempTree = [];
      for (var i = 0; i < tree.length; i++) {
        var newObject = {};
        newObject.label = tree[i].label ? tree[i].label : tree[i].table_name;
        newObject.searchable_term = tree[i].label
          ? tree[i].label
          : tree[i].table_name;
        newObject.table_name = tree[i].table_name;
        newObject.data = {};
        newObject.data.label = newObject.label;
        newObject.data.unique_id = tree[i].table_name;
        newObject.data.nodeType = CONST.OBJECT_TYPES.NON_CMDB;
        newObject.data.image = 'images/nonCmdb.svg';
        newObject.data.properties = '';
        newObject.data.allowed_connections = [];
        newObject.data.filters = {};
        newObject.data.filters.platform = tree[i].table_name;
        newObject.data.filters.custom = '';
        newObject.data.referenceColumns = tree[i].columns;
        tempTree.push(newObject);
      }
      return tempTree;
    }
    function getCiCount(ciCount, ci) {
      var count = 0;
      if (ciCount && ci && ci.ci_type) {
        if (ciCount[ci.ci_type]) count += ciCount[ci.ci_type];
        if (ci.children && ci.children.length > 0) {
          for (var i = 0; i < ci.children.length; i++) {
            count += getCiCount(ciCount, ci.children[i]);
          }
        }
      }
      return count;
    }
    function getTagsForAll(sys_ids, savedQueries) {
      tagsService.getTagsForMultiple(sys_ids).then(function (tags) {
        if (tags && !tags.failed) {
          for (var i = 0; i < savedQueries.length; i++) {
            if (tags[savedQueries[i].sys_id]) {
              for (var j = 0; j < tags[savedQueries[i].sys_id].length; j++) {
                if (tags[savedQueries[i].sys_id][j])
                  savedQueries[i].tags.push(tags[savedQueries[i].sys_id][j]);
              }
            }
          }
        }
      });
    }
    function _cancelWorkerThread(worker_id, query_id) {
      return CANCEL_WORKER_THREAD.query(
        {
          worker_id: worker_id,
          query_id: query_id,
        },
        {}
      ).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    function _getProgressWorkerStatus(worker_id, query_id) {
      return GET_WORKER_THREAD_STATUS.query({
        worker_id: worker_id,
        query_id: query_id,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          return raw;
        }
      );
    }
    return {
      getAllQueries: _getAllQueries,
      saveQuery: _saveQuery,
      updateQuery: _updateQuery,
      deleteQuery: _deleteQuery,
      getAllRelations: _getAllRelations,
      getAllIcons: _getAllIcons,
      getRelationsTypes: _getRelationTypes,
      getCIProperties: _getCIProperties,
      registerQuery: _registerQuery,
      executeQuery: _executeQuery,
      executeAllQuery: _executeAllQuery,
      getQueryResults: _getQueryResults,
      getQueryProcessingStatus: _getQueryProcessingStatus,
      getExportStatus: _getExportStatus,
      getLeftTree: _getLeftTree,
      exportSavedQueryInit: _exportSavedQueryInit,
      exportSavedQueryPoll: _exportSavedQueryPoll,
      importQuery: _importQuery,
      getReportURL: _getReportURL,
      getLatestExecutionId: _getLatestExecutionId,
      cancelWorkerThread: _cancelWorkerThread,
      getWorkerThreadStatus: _getProgressWorkerStatus,
    };
  },
]);
