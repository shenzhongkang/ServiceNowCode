/*! RESOURCE: /scripts/app.$sp/service_catalog/constant.spSCConf.js */
(function () {
  var scConf = {
    MULTI_ROW_TYPE: 'sc_multi_row',
    CONTAINER_START: 'container_start',
    CHECKBOX: 'boolean',
    CHECKBOX_MANDATORY: 'boolean_confirm',
    CHECKBOX_CONTAINER: 'checkbox_container',
    REFERENCE: 'reference',
    LABEL: 'label',
    MASKED: 'masked',
    STRING: 'string',
    BREAK: 'break',
    FORMATTER: 'formatter',
    HTML: 'html',
    RICH_TEXT_LABEL: 'rich_text_label',
    SC_ATTACHMENT: 'sc_attachment',
    _CAT_VARIABLE: '_cat_variable',
    MAX_ALSO_REQUEST_FOR: 50,
  };
  angular.module('sn.$sp').constant('spSCConf', scConf);
})();
