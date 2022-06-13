/*! RESOURCE: /scripts/app.ngbsm/config.js */
angular.module('sn.ngbsm').factory('CONFIG', function ($window, i18n) {
  if (!$window.NOW) $window.NOW = {};
  CONFIGURATION = {
    NOTIFICATION_DISPLAY_TIME: $window.NOW.notification_display_time || 5000,
    INDICATORS_FETCH_DELAY: 2000,
    REFRESH_INTERVAL: $window.NOW.refresh_interval || 60,
    AFFECTED_NEIGHBOR_COLOR:
      $window.NOW.color_affected_neighbors !== 'undefined'
        ? $window.NOW.color_affected_neighbors
        : '#fff',
    LINK_CURVE_WEIGHT: 0.25,
    LINK_RADIAL_CURVE_WEIGHT: 32,
    LINK_RADIAL_CONCAVITY_FLIP_MIN: 16,
    LINK_RADIAL_CONCAVITY_FLIP_MAX: 64,
    LINK_MARKER_OFFSET: 17,
    LAYOUT_FORCE_ITERATIONS: 200,
    LAYOUT_FORCE_EXPANSION_FACTOR: 10,
    LAYOUT_GROUP_GROUP_ITERATIONS: 100,
    LAYOUT_GROUP_NODE_ITERATIONS: 150,
    LAYOUT_GROUP_CHARGE_WEIGHT: -50,
    LAYOUT_GROUP_GROUP_EXPANSION_FACTOR: 3.0,
    LAYOUT_GROUP_NODES_EXPANSION_FACTOR: 4.0,
    LAYOUT_HORIZONTAL_SPACING_X: 200,
    LAYOUT_HORIZONTAL_SPACING_Y: 100,
    LAYOUT_VERTICAL_SPACING_X: 125,
    LAYOUT_VERTICAL_SPACING_Y: 125,
    SEARCH_CI_LIMIT: $window.NOW.search_ci_limit || 12,
    SEARCH_SERVICE_LIMIT: $window.NOW.search_service_limit || 6,
    SEARCH_REL_TYPE_LIMIT: $window.NOW.search_rel_type_limit || 8,
    SEARCH_COLUMNS:
      $window.NOW.search_columns !== 'undefined'
        ? $window.NOW.search_columns
        : 'sys_class_name',
    CAMERA_NODE_BOX_WIDTH: 150,
    CAMERA_NODE_BOX_HEIGHT: 50,
    CAMERA_TRANSLATE_AMOUNT: 100,
    CAMERA_SCALE_AMOUNT: 0.1,
    BOTTOM_PANEL_HEIGHT: 300,
    SIDE_PANEL_WIDTH: 360,
    DEFAULT_MAX_LEVELS: 3,
    FILTERS_REMOVE_FILTERED_ITEMS:
      $window.NOW.filters_remove_filtered_items || false,
    FILTERS_RUN_LAYOUT_AUTOMATICALLY:
      $window.NOW.filters_run_layout_automatically || false,
    FILTERS_FIT_TO_SCREEN_AUTOMATICALLY:
      $window.NOW.filters_fit_to_screen_automatically || false,
    PERFORMANCE_ALLOW_CURVES: $window.NOW.performance_allow_curves && true,
    FLAG_EVENT_MANAGEMENT_ENABLED:
      $window.NOW.flag_event_management_enabled || false,
    FLAG_SECURITY_INCIDENT_ENABLED:
      $window.NOW.flag_security_incident_enabled || false,
    FLAG_IS_FIREFOX: $window.NOW.flag_is_firefox || false,
    FLAG_IS_SAFARI: $window.NOW.flag_is_safari || false,
    FLAG_IS_IE9: $window.NOW.flag_is_ie9 || false,
    NODE_LABEL_WIDTH: 80,
    TRUNCATE_NODE_LABELS: true,
    FILTERS_DEFAULT: [
      {
        label: i18n.getMessage('Remove Filtered Items'),
        property: 'Remove Filtered Items',
        type: 'formElement',
        value: false,
        show: 'false',
        model: 'filterMode',
      },
      {
        label: i18n.getMessage('Run Layout Automatically'),
        property: 'Run Layout Automatically',
        type: 'formElement',
        value: false,
        show: 'false',
        model: 'filterAutoLayout',
      },
      {
        label: i18n.getMessage('Fit to Screen Automatically'),
        property: 'Fit to Screen Automatically',
        type: 'formElement',
        value: false,
        show: 'false',
        model: 'filterAutoFit',
      },
      {
        label: i18n.getMessage('Max Levels'),
        property: 'Max Levels',
        type: 'formElement',
        value: 3,
        show: 'false',
        model: 'current',
      },
      {
        label: i18n.getMessage('Map Script'),
        property: 'Map Script',
        type: 'formElement',
        value: {
          label: '<Default>',
          value: '',
        },
        show: 'true',
        model: 'mapscript',
      },
      {
        label: i18n.getMessage('Predefined Filters'),
        property: 'Predefined Filters',
        type: 'formElement',
        value: {
          label: '<Default>',
          value: '',
        },
        show: 'true',
        model: 'predefinedFilters',
      },
      {
        label: i18n.getMessage('dependencies.ngbsm.filteres.depth'),
        property: 'level',
        type: 'node',
        expanded: false,
        show: true,
        options: [],
      },
      {
        label: i18n.getMessage('dependencies.ngbsm.filteres.ci.type'),
        property: 'className',
        type: 'node',
        show: true,
        expanded: false,
        options: [],
      },
      {
        label: i18n.getMessage('dependencies.ngbsm.filteres.ci.location'),
        property: 'locationCity',
        type: 'node',
        expanded: false,
        show: true,
        options: [],
      },
      {
        label: i18n.getMessage('dependencies.ngbsm.filteres.ci.manufacturer'),
        property: 'manufacturerName',
        type: 'node',
        expanded: false,
        show: true,
        options: [],
      },
      {
        label: i18n.getMessage('dependencies.ngbsm.filteres.ci.audit'),
        property: 'auditFailures',
        type: 'node',
        show: true,
        expanded: false,
        options: [],
      },
      {
        label: i18n.getMessage(
          'dependencies.ngbsm.filteres.relationship.types'
        ),
        property: 'typeName',
        type: 'link',
        expanded: false,
        show: true,
        options: [],
      },
    ],
  };
  for (key in window.NOW.bsm.configuration.server) {
    CONFIGURATION[key] = window.NOW.bsm.configuration.server[key];
  }
  if (window.NOW.bsm.configuration.url) {
    var urlConfigJson = JSON.parse(window.NOW.bsm.configuration.url);
    for (key in urlConfigJson) {
      CONFIGURATION[key] = urlConfigJson[key];
    }
  }
  return CONFIGURATION;
});