/*! RESOURCE: /scripts/service-portal-designer/app.js */
if (top.location != self.location) {
  top.location = self.location.href;
}
var debug = {};
(function () {
  'use strict';
  angular
    .module('ng_spd', [
      'dndLists',
      'ui.router',
      'ngResource',
      'mgcrea.ngStrap',
      'spd_column_left',
      'spd_config',
      'spd_editor',
      'spd_events',
      'spd_editor_manager',
      'spd_focus_on_directive',
      'spd_header',
      'spd_ignore_keys_directive',
      'spd_item_hover',
      'spd_main',
      'spd_map',
      'spd_message',
      'spd_now',
      'spd_page',
      'spd_page_add',
      'spd_page_update',
      'spd_page_select',
      'spd_preview',
      'spd_preview_directive',
      'spd_portal',
      'spd_portal_select',
      'spd_record',
      'spd_state',
      'spd_text',
      'spd_theme_directive',
      'spd_scroll_on_directive',
      'spd_sub_header',
      'spd_ucfirst_filter',
      'spd_utils',
      'spd_widget',
      'spd_widget_directive',
      'spd_widget_hover_directive',
      'sn.$sp',
    ])
    .config(function (
      $controllerProvider,
      $compileProvider,
      $stateProvider,
      $urlRouterProvider,
      $httpProvider,
      config,
      lazyLoaderProvider,
      $provide
    ) {
      lazyLoaderProvider.set({
        register: $controllerProvider.register,
        directive: $compileProvider.directive,
        factory: $provide.factory,
        value: $provide.value,
        service: $provide.service,
      });
      $urlRouterProvider.otherwise(config.routeDefault);
      _.forEach(config.routes, function (value, key) {
        $stateProvider.state(key, value);
      });
      $httpProvider.interceptors.push('spInterceptor');
    });
})();
