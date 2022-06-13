/*! RESOURCE: /scripts/app.ngbsm/_ngbsm.js */
var app = angular.module('sn.ngbsm', [
  'ngAnimate',
  'ngResource',
  'ng.common',
  'angular-abortable-requests',
  'sn.table',
  'ng.amb',
  'cmdb.usageAnalytics',
]);
if (
  window.NOW &&
  window.NOW.flag_sa_metric_enabled &&
  window.NOW.bsm &&
  window.NOW.bsm.parameters &&
  window.NOW.bsm.parameters['metric_view']
) {
  app.requires.push('sn.sa.insights.explorer');
}