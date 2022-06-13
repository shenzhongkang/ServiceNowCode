/*! RESOURCE: /scripts/util.usageAnalytics/factory.matomo.js */
angular.module('cmdb.usageAnalytics').factory('cmdbMatomo', [
  '$window',
  function ($window) {
    'use strict';
    function _trackPage() {
      if ($window.GlideWebAnalytics) $window.GlideWebAnalytics.trackPage();
    }
    function _trackEvent(category, key, value, additionalValue) {
      if ($window.GlideWebAnalytics) {
        if (angular.isDefined(additionalValue))
          $window.GlideWebAnalytics.trackEvent(
            category,
            key,
            value,
            additionalValue
          );
        else $window.GlideWebAnalytics.trackEvent(category, key, value);
      }
    }
    return {
      trackPage: _trackPage,
      trackEvent: _trackEvent,
    };
  },
]);