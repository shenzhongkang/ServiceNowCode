/*! RESOURCE: /scripts/service-portal-designer/config/events.js */
(function () {
  'use strict';
  angular.module('spd_events', []).constant('events', {
    fieldTableUpdated: 'spd_field_table_updated',
    itemSelected: 'spd_item_selected',
    itemSelect: 'spd_item_select',
    loadingIndicator: 'sp_loading_indicator',
    pageSelectionDataHasLoaded: 'sp_page_select_loaded',
    refresh: 'spd_refresh_page',
    save: 'spd_save',
    scrollUp: 'spd_scroll_up',
    stateChanged: '$stateChangeSuccess',
    widgetRemove: 'spd_widget_remove',
    displayFormModal: 'spd_form_modal',
    widgetFieldUpdated: 'spd_widget_field_updated',
  });
})();
