/*! RESOURCE: /scripts/sp-tinymce/service.tinymce.js */
angular.module('ui.tinymce').factory('tinymceService', function ($http) {
  'use strict';
  function cachedScript(url, options) {
    options = $.extend(options || {}, {
      dataType: 'script',
      cache: true,
      url: url,
    });
    return $.ajax(options);
  }
  function loadTinyMCE(options) {
    options = options || {};
    if (!window.hasOwnProperty('tinyMCE')) {
      cachedScript(
        'scripts/js_includes_sp_tinymce.js?v=' + g_builddate,
        options
      );
    }
  }
  return {
    loadTinymceAsync: loadTinyMCE,
    loadTinymceSync: function () {
      loadTinyMCE({ async: false });
    },
  };
});
