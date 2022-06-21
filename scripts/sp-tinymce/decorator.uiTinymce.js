/*! RESOURCE: /scripts/sp-tinymce/decorator.uiTinymce.js */
angular
  .module('ui.tinymce')
  .decorator('uiTinymceDirective', function ($delegate, tinymceService) {
    tinymceService.loadTinymceSync();
    tinyMCE.baseURL = '/scripts/sp-tinymce';
    tinyMCE.suffix = '.min';
    $delegate[0].priority = 10;
    return $delegate;
  });
