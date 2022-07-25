/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderUsageAnalytics.js */
angular
  .module('sn.queryBuilder')
  .factory('queryBuilderUsageAnalytics', function (usageAnalytics, UA) {
    'use strict';
    function _registerUsageAnalytics() {
      usageAnalytics.register(UA.APP_NAME, {
        loadTimeInterval: 500,
        events: [
          {
            eventType: UA.EVENTS.APP_VIEWED,
            addLoadTime: true,
          },
          {
            eventType: UA.EVENTS.QUERY_SAVED,
            aggKeys: [
              UA.METRICS.QUERY_TYPE,
              UA.METRICS.QUERY_CLASSES,
              UA.METRICS.QUERY_OPERATORS,
              UA.METRICS.QUERY_DEPTH,
            ],
          },
          {
            eventType: UA.EVENTS.QUERY_RUN,
            aggKeys: [
              UA.METRICS.QUERY_TYPE,
              UA.METRICS.QUERY_CLASSES,
              UA.METRICS.QUERY_OPERATORS,
              UA.METRICS.QUERY_DEPTH,
              UA.METRICS.HAS_LOAD_BUTTON,
            ],
            addLoadTime: true,
          },
          {
            eventType: UA.EVENTS.LOAD_MORE_CLICKED,
            aggKeys: [UA.METRICS.EVENT_TYPE],
          },
          {
            eventType: UA.EVENTS.EXPORT_CLICKED,
            aggKeys: [UA.METRICS.EVENT_TYPE],
          },
        ],
      });
      return usageAnalytics;
    }
    return {
      registerUsageAnalytics: _registerUsageAnalytics,
    };
  });
