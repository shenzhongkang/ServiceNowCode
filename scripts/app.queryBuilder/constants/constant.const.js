/*! RESOURCE: /scripts/app.queryBuilder/constants/constant.const.js */
angular.module('sn.queryBuilder').constant('CONSTQB', {
  SIDE_PANEL_WIDTH: 325,
  SIDE_PANEL_TOGGLE_WIDTH: 7,
  HEADEROFFSET: 132,
  CLASS_HIERARCHY_OFFSET: 132,
  OBJECT_TYPES: {
    NODE: 'node',
    SERVICE: 'service',
    CONNECTION: 'connection',
    NON_CMDB: 'nonCmdb',
  },
  NODETYPE: {
    CLASS: 'class',
    OPERATOR: 'operator',
    SERVICE: 'service',
    SERVICE_ELEMENT: 'serviceElement',
    SERVICE_QUERY: 'serviceQuery',
  },
  OPERATOR: {
    AND: 'AND',
    OR: 'OR',
  },
  INFOBOX: {
    MAXHEIGHT: 455,
  },
  DROPDOWN: {
    MAXHEIGHT: 250,
  },
  QUERY_TYPES: {
    GENERAL: 'cmdb',
    SERVICE: 'business_service',
  },
  RIGHTPANELOFFSET: 85,
  EDGE_TYPES: {
    RELATION: 'relation',
    REFERENCE: 'reference',
    NO_RELATION: 'noRelation',
    BELONGS: 'belongsToService',
    APP_FLOW: 'applicativeFlow',
    EMPTY: 'empty',
    ANY_RELATION: 'anyRelation',
    APPLY_TO_ALL: 'applicativeFlowRef',
  },
  RESULT_RELATIONS: {
    NO_RELATION: 'Has No Relation',
    BELONGS_TO_SERVICE: 'Belongs To Service',
    NOT_BELONG_TO_SERVICE: 'Not Belongs To Service',
    REFERENCE_TYPE: 'Reference',
  },
  BASE_SERVICE_CLASS: 'cmdb_ci_service_auto',
  BASE_ENDPOINT_CLASS: 'cmdb_ci_endpoint',
  RESULT_STATUS: {
    READY: 'READY',
    PROCESSING: 'PROCESSING',
    PAUSED: 'PAUSED',
    COMPLETE: 'COMPLETE',
    FAILED: 'FAILED',
    TIME_OUT: 'TIME_OUT',
    MAX_LIMIT: 'MAX_LIMIT',
    CANCELLED: 'CANCELLED',
  },
  MAX_CLASSES: 20,
  D3: {
    LINKCURVEWEIGHT: 0.2,
    INTERPOLATIONMODE: 'basis',
    ARROWOFFSET: 10,
    DXMAX: 60,
    STEMLENGTH: 50,
  },
  MULTISEARCH: {
    MAX_RESULTS: 5,
  },
  ACCESSIBILITY: {
    NODE_MOVE_AMOUNT: 5,
  },
  NOTIFICATION_TIME: 10000,
  KEY_CODES: {
    TAB_KEY: 9,
    ENTER_KEY: 13,
    SPACE_KEY: 32,
    LEFT_ARROW: 37,
    UP_ARROW: 38,
    RIGHT_ARROW: 39,
    DOWN_ARROW: 40,
    ESCAPE_KEY: 27,
  },
  DEFAULT_RESULT_TABLE: 'cmdb_ci',
  LABEL: 'label',
  CLASSES: 'classes',
  LEFT: 'left',
  RIGHT: 'right',
  SAVED_QUERIES: 'savedQueries',
  USER_PREFERENCES: {
    SHOW_SUGGESTED_CONNECTIONS: 'cmdb.query.showSuggestedConnections',
    SHOW_RELATIONSHIPS_IN_RESULTS: 'cmdb.query.showRelationships',
    SHOW_LIST_SAVED_CARDS: 'cmdb.query.showListSavedCards',
    SHOW_RESULTS_IN_NEW_TAB: 'cmdb.query.showResultsInNewTab',
  },
  APPLICATION_SERVICE_TABLE: 'cmdb_ci_service_auto',
  QB_QUERY_STATUS_TABLE: 'qb_query_status',
  NLQ_QUERY_ORIGIN: 'cmdb_qb',
  DEFAULT_CLASS_NODE_IMAGE: 'images/app.ngbsm/generic.svg',
});
