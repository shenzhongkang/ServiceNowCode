/*! RESOURCE: /scripts/app.queryBuilder/constants/constant.ua.js */
angular.module('sn.queryBuilder').constant('UA', {
  APP_NAME: 'cmdb.query.builder',
  EVENTS: {
    APP_VIEWED: 'app_viewed',
    QUERY_SAVED: 'query_saved',
    QUERY_RUN: 'query_run',
    LOAD_MORE_CLICKED: 'load_more_clicked',
    LOAD_ALL_CLICKED: 'load_all_clicked',
    EXPORT_CLICKED: 'export_clicked',
  },
  METRICS: {
    EVENT_TYPE: 'event.type',
    QUERY_CLASSES: 'query.classes',
    QUERY_OPERATORS: 'query.operators',
    QUERY_TYPE: 'query.type',
    QUERY_DEPTH: 'query.depth',
    HAS_LOAD_BUTTON: 'results.has_load',
    RESULT_ROWS: 'result.rows',
    RESULT_COLUMNS: 'result.columns',
  },
  MATOMO: {
    CATEGORY: 'CMDB Query Builder',
    EVENTS: {
      QB_ACCESSED: 'CMDB Query Builder Accessed',
      QB_QUERY_CREATED: 'CMDB Query Builder Query Created',
    },
  },
});
