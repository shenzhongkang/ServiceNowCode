/*! RESOURCE: /scripts/heisenberg/custom/selects.js */
jQuery(function ($) {
  'use strict';
  window.NOW = window.NOW || {};
  var $select2 = $('select.select2, select.sn-select-basic').not(
    'select[readonly]'
  );
  $select2
    .each(function () {
      var required = $(this).prop('required');
      if (required) $(this).addClass('required');
    })
    .select2();
  $(window).bind('blur', function () {
    $select2.select2('close');
  });
});
