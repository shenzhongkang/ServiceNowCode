/*! RESOURCE: /scripts/service-portal-designer/utils/utils.js */
(function () {
  'use strict';
  angular.module('spd_utils', []).factory('utils', function ($location) {
    function getHost() {
      var host = $location.protocol() + '://' + $location.host();
      if ($location.port()) {
        host += ':' + $location.port();
      }
      return host;
    }
    function getUrl(uri) {
      return getHost() + '/' + uri;
    }
    function format(tpl, data) {
      var re = /{([^}]+)?}/g,
        match;
      while ((match = new RegExp(re).exec(tpl))) {
        tpl = tpl.replace(match[0], data[match[1]]);
      }
      return tpl;
    }
    function styleSheet(link) {
      var cssLink = document.createElement('link');
      cssLink.href = link;
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      return cssLink;
    }
    function createUid() {
      return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r, v;
        r = (Math.random() * 16) | 0;
        v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    return {
      getUrl: getUrl,
      format: format,
      styleSheet: styleSheet,
      createUid: createUid,
    };
  });
})();
