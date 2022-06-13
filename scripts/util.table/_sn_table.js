/*! RESOURCE: /scripts/util.table/_sn_table.js */
angular.module('sn.table', [
  'sn.auth',
  'sn.tooltip',
  'sn.accessibility',
  'sn.dropdown',
  'ngAnimate',
  'sn.common.i18n',
  'ngSanitize',
]);
angular.module('sn.table').config(function ($animateProvider) {
  $animateProvider.classNameFilter(/allow-animation/);
});
