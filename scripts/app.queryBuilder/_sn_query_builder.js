/*! RESOURCE: /scripts/app.queryBuilder/_sn_query_builder.js */
var app = angular.module('sn.queryBuilder', [
  'sn.auth',
  'ngResource',
  'sn.common.i18n',
  'sn.filter_widget',
  'sn.dnd',
  'sn.messaging',
  'sn.dropdown',
  'sn.table',
  'cmdb.usageAnalytics',
  'sn.tooltip',
  'cmdb.customEvents',
  'cmdb.dialogBox',
  'sn.multiSearch',
  'sn.list',
  'ngRoute',
  'ng.amb',
  'cmdb.requests',
]);
app.config([
  '$routeProvider',
  '$locationProvider',
  function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
      rewriteLinks: false,
    });
  },
]);
