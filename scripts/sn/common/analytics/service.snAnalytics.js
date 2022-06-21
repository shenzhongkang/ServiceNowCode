/*! RESOURCE: /scripts/sn/common/analytics/service.snAnalytics.js */
angular
  .module('sn.common.analytics')
  .factory('snAnalytics', function ($rootScope) {
    'use strict';
    var instanceLevelEnabled =
      NOW.analytics_enabled == true && NOW.sp_analytics_plugin_active == true;
    var authKeyPresent = !!NOW.instrumentation_authkey;
    var unauthenticatedUserTrackingEnabled =
      NOW.unauthenticated_user_tracking_enabled || false;
    initializeAnalyticsSDK();
    $rootScope.$on('sn.ucm.finished', function () {
      initializeAnalyticsSDK();
    });
    function initializeAnalyticsSDK() {
      if (!allowAnalytics()) return;
      var options = {
        serverEndpoint: NOW.instrumentation_api_host,
      };
      if (!unauthenticatedUserTrackingEnabled || NOW.user_name !== 'guest') {
        options['userId'] = NOW.user_id_hashed;
        options['trackingConsent'] = true;
      }
      SNAnalytics.start(getApiKey(), NOW.instrumentation_authkey, options);
      if (NOW.instance_name)
        setUserProperty('Instance Name', NOW.instance_name);
      if (NOW.domain_id) setUserProperty('Domain', NOW.domain_id);
    }
    function getApiKey() {
      return NOW.instance_id + ':' + NOW.portal_id;
    }
    function setUserProperty(name, value) {
      if (!allowAnalytics()) return;
      SNAnalytics.setUserProperty(name, value);
    }
    function setUserProperties(properties) {
      if (!allowAnalytics()) return;
      SNAnalytics.setUserProperties(properties);
    }
    function removeUserProperty(name) {
      if (!allowAnalytics()) return;
      SNAnalytics.removeUserProperty(name);
    }
    function appendToUserProperty(name, value) {
      if (!allowAnalytics()) return;
      SNAnalytics.appendToUserProperty(name, value);
    }
    function incUserProperty(name, value) {
      if (!allowAnalytics()) return;
      SNAnalytics.incUserProperty(name, value);
    }
    function setUserID(userID) {
      if (!allowAnalytics()) return;
      SNAnalytics.setUserId(userID);
    }
    function startPage(id, title) {
      if (!allowAnalytics()) return;
      SNAnalytics.startPage(id, title);
    }
    function multipleEventsInPayload(payload) {
      var eventName = payload.parentEvent.EventName || '';
      var eventPayload = payload.parentEvent.EventPayload;
      if (eventName && eventPayload)
        SNAnalytics.addEvent(eventName, eventPayload);
      var childEvents = payload.childEvents;
      if (childEvents) {
        var childEventName;
        var childEventPayload;
        for (var i = 0; i < childEvents.length; i++) {
          childEventName = childEvents[i]['EventName'];
          childEventPayload = childEvents[i]['EventPayload'];
          if (childEventName && childEventPayload)
            SNAnalytics.addEvent(childEventName, childEventPayload);
        }
      }
    }
    function addEvent(payload) {
      if (!allowAnalytics()) return;
      if (payload.parentEvent) {
        multipleEventsInPayload(payload);
        return;
      }
      if (payload.name && payload.data)
        SNAnalytics.addEvent(payload.name, payload.data);
    }
    function allowAnalytics() {
      if (!instanceLevelEnabled) return false;
      if (
        NOW.usage_tracking.usage_tracking_allowed_for_session &&
        authKeyPresent &&
        NOW.user_name !== 'guest'
      )
        return true;
      else if (
        unauthenticatedUserTrackingEnabled &&
        authKeyPresent &&
        NOW.user_name == 'guest'
      )
        return true;
      return false;
    }
    $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
      if (newUrl.indexOf('logout.do') != -1) {
        if (unauthenticatedUserTrackingEnabled && authKeyPresent)
          SNAnalytics.start(getApiKey(), NOW.instrumentation_authkey, {
            trackingConsent:
              NOW.usage_tracking.usage_tracking_allowed_for_session,
          });
        else if (allowAnalytics()) {
          setUserID(null);
          SNAnalytics.setTrackingConsent(false);
        }
      }
    });
    var util = {
      addEvent: addEvent,
      startPage: startPage,
      setUserProperty: setUserProperty,
      setUserProperties: setUserProperties,
      removeUserProperty: removeUserProperty,
      appendToUserProperty: appendToUserProperty,
      incUserProperty: incUserProperty,
    };
    return util;
  });
