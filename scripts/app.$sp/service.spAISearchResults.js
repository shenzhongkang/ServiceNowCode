/*! RESOURCE: /scripts/app.$sp/service.spAISearchResults.js */
angular
  .module('sn.$sp')
  .factory(
    'spAISearchResults',
    function ($location, $rootScope, spAriaFocusManager) {
      'use strict';
      function navigate(data, actionPayload, action) {
        if (actionPayload.url) {
          window.open(actionPayload.url);
          return;
        }
        var source =
          data.tableToSourceMap[actionPayload.table] || actionPayload.table;
        var assignmentId = 'd46f400473211010c342d5fdbdf6a7cf';
        if (action)
          assignmentId = action.assignmentId || action.actionAssignmentId;
        if (!source) return;
        var pageUrl = data.urlMap[source] && data.urlMap[source][assignmentId];
        if (!pageUrl) {
          pageUrl =
            '&id=form&table=' +
            actionPayload.table +
            '&sys_id=' +
            actionPayload.sysId;
        } else {
          var payload2QueryParamMap =
            data.sourceToPageMap[source] &&
            data.sourceToPageMap[source][assignmentId].payload2QueryParamMap;
          for (var key in actionPayload) {
            if (key === 'url') continue;
            var keyParam = key;
            if (key === 'sysId') keyParam = 'sys_id';
            if (payload2QueryParamMap && payload2QueryParamMap[key])
              keyParam = payload2QueryParamMap[key];
            pageUrl += '&' + keyParam + '=' + actionPayload[key];
          }
        }
        locationSearch(pageUrl);
      }
      function locationSearch(url) {
        $rootScope.$applyAsync(function () {
          var navigateToUrl = $location.search(url);
          spAriaFocusManager.navigateToLink(navigateToUrl.url());
        });
      }
      return {
        navigate: navigate,
        locationSearch: locationSearch,
      };
    }
  );
