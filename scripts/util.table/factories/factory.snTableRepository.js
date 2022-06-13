/*! RESOURCE: /scripts/util.table/factories/factory.snTableRepository.js */
angular.module('sn.table').factory('snTableRepository', [
  '$http',
  '$q',
  'snTableCommon',
  function ($http, $q, snTableCommon) {
    'use strict';
    function getColumns(config) {
      if (!config.table) return false;
      return $http
        .get('api/now/cmdb/ui/table/' + config.table + '/columns', {
          params: {
            sysparm_view: config.view,
          },
        })
        .then(function (response) {
          return response.data.result;
        });
    }
    function getColumnChoiceList(config, column, filter) {
      if (!config.table) return false;
      return $http
        .get(
          'api/now/cmdb/ui/table/' +
            config.table +
            '/' +
            column +
            '/choiceList',
          {
            params: {
              sysparm_view: config.view,
              sysparm_filter: filter,
            },
          }
        )
        .then(function (response) {
          return response.data.result;
        });
    }
    function saveColumns(config, columns) {
      if (!config.table) return false;
      return $http({
        method: 'POST',
        url: 'api/now/cmdb/ui/table/' + config.table + '/columns',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          sysparm_view: config.view,
          sysparm_columns: snTableCommon.getColumnList(columns, true),
        },
      }).then(function (response) {});
    }
    function getRows(config, columns) {
      if (!config.table) return false;
      var columnList = snTableCommon.getColumnList(columns);
      if (columnList === 'sys_id') return false;
      var filterBy = getFilterByQuery(columns);
      var orderBy = snTableCommon.getOrderByQuery(config);
      var query = '';
      query += config.query ? config.query : '';
      query += query.length === 0 ? filterBy.substring(1) : filterBy;
      query += query.length === 0 ? orderBy.substring(1) : orderBy;
      var offset = config.groupBy ? undefined : config.targetRow - 1;
      var limit = config.groupBy ? undefined : config.rowsPerPage;
      var promise = $q.defer();
      $http({
        method: 'POST',
        url: 'api/now/cmdb/ui/table/' + config.table + '/rows',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          sysparm_fields: columnList,
          sysparm_query: query,
          sysparm_display_value: true,
          sysparm_suppress_pagination_header: true,
          sysparm_limit: limit,
          sysparm_offset: offset,
        },
      }).then(
        function (response) {
          config.availableRows = response.headers('X-Total-Count');
          promise.resolve(response.data);
        },
        function (response) {
          if (response.data && response.data.error) {
            promise.resolve({
              result: [],
            });
          } else promise.reject(response);
        }
      );
      return promise.promise;
    }
    function getFilterByQuery(columns) {
      var filterBy = '';
      for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        if (column.filter) {
          filterBy += '^' + column.name + column.query;
        }
      }
      return filterBy;
    }
    function saveSorting(config) {
      if (!config.table) return false;
      return $http({
        method: 'POST',
        url: 'api/now/cmdb/ui/table/' + config.table + '/sorting',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          sysparm_column: config.sortBy,
          sysparm_direction: config.sort,
        },
      }).then(function (response) {});
    }
    function commitNewRow(row, config) {
      if (!config.table) return false;
      var promise = $q.defer();
      var sendObject = row;
      if (config.commitRowAdditionalParams) {
        for (var key in config.commitRowAdditionalParams) {
          sendObject[key] = config.commitRowAdditionalParams[key];
        }
      }
      $http({
        method: 'POST',
        url: 'api/now/table/' + config.table,
        params: {
          sysparm_display_value: true,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        data: sendObject,
      }).then(
        function (response) {
          if (response && response.data && response.data.result)
            promise.resolve(response.data.result);
        },
        function (response) {
          if (response && response.data && response.data.error)
            promise.reject(response.data);
          else promise.reject();
        }
      );
      return promise.promise;
    }
    function updateRow(row, config, changed) {
      if (!config.table) return false;
      if (!row.sys_id) return false;
      if (!changed) return false;
      var promise = $q.defer();
      $http({
        method: 'PUT',
        url: 'api/now/table/' + config.table + '/' + row.sys_id,
        params: {
          sysparm_display_value: true,
        },
        headers: {
          'Content-Type': 'application/json',
        },
        data: changed,
      }).then(
        function (response) {
          if (response && response.data && response.data.result)
            promise.resolve(response.data.result);
        },
        function (response) {
          if (response && response.data && response.data.error)
            promise.reject(response.data);
          else promise.reject();
        }
      );
      return promise.promise;
    }
    return {
      getColumns: getColumns,
      getColumnChoiceList: getColumnChoiceList,
      saveColumns: saveColumns,
      getRows: getRows,
      saveSorting: saveSorting,
      commitNewRow: commitNewRow,
      updateRow: updateRow,
    };
  },
]);