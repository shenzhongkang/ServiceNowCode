/*! RESOURCE: /scripts/service-portal-designer/config/config.js */
(function () {
  'use strict';
  angular.module('spd_config', []).constant('config', {
    types: ['container', 'row', 'column', 'widget'],
    column: {
      type: 'column',
      size_classes: {},
      content: [],
    },
    columnDefaultType: 'md',
    columnDefaultSize: 1,
    columnSizes: [
      '12',
      '6-6',
      '3-9',
      '9-3',
      '3-6-3',
      '4-4-4',
      '3-3-3-3',
      '2-2-2-2-2-2',
    ],
    columnMaxSize: 12,
    columnTypes: [
      { key: 'xs', label: 'Phone' },
      { key: 'sm', label: 'Tablet' },
      { key: 'md', label: 'Desktop' },
      { key: 'lg', label: 'Large Desktop' },
    ],
    columnSizeTpl: 'col-{type}-{size}',
    container: {
      type: 'container',
      width: 'container',
      plusButton: true,
      rows: [],
    },
    containerTypes: [
      { key: 'container', label: 'Fixed' },
      { key: 'container-fluid', label: 'Fluid' },
    ],
    currentWorkSaved: true,
    editorStyles: [
      '/styles/service-portal-designer/editor/bootstrap-overwrites.css',
      '/styles/service-portal-designer/editor/plus-button.css',
    ],
    themeStyles: [
      '/styles/css_includes_$sp.cssx',
      '/styles/scss/sp-bootstrap.scss?portal_id={portalId}',
      '/styles/sp-utility.css',
      '/scripts/icon-fonts/font-awesome/css/font-awesome.css',
    ],
    fixedItems: ['container', 'column', 'row'],
    formUri: 'api/now/v1/spd/form/:id',
    formFieldsUri: 'api/now/v1/spd/form/fields/:table',
    iframeUri: '/sp_config?id=page_edit&sys_id={sys_id}&table={table}',
    key_delete: 8,
    layout: {
      type: 'layout',
      containers: [],
    },
    leftMenuSelectedOption: 'widgets',
    pageUri: 'api/now/v1/spd/page',
    pageExistsUri: 'api/now/v1/spd/page/exists/:id',
    pageUpdateUri: 'api/now/v1/spd/page/update/:id',
    pageRemoveUri: 'api/now/spd/page/remove/:id',
    pageGetUri: 'api/now/v1/spd/page/:id',
    previewUri: '/{portal}/?id={id}',
    previewDeviceSizes: [
      { device: 'mobile', size: '375px' },
      { device: 'tablet', size: '758px' },
      { device: 'desktop', size: '100%' },
    ],
    previewStyle: 'styles/service-portal-designer/editor/preview-iframe.css',
    previewDefaultDevice: 'desktop',
    portalUri: '/sp_config?id=sp_theme&table=sp_theme&sys_id={id}',
    routes: {
      portalSelect: {
        url: '/portal/select',
        views: {
          content: {
            templateUrl: 'portal_select.html',
            controller: 'PortalSelectCtrl',
            controllerAs: 'portal',
          },
        },
      },
      pageSelect: {
        url: '/page/select',
        views: {
          content: {
            templateUrl: 'page_select.html',
            controller: 'PageSelectCtrl',
            controllerAs: 'ps',
          },
        },
      },
      pageAdd: {
        url: '/:portal/page/add',
        views: {
          content: {
            templateUrl: 'page_add.html',
            controller: 'PageAddCtrl',
            controllerAs: 'page',
          },
        },
      },
      preview: {
        url: '/:portal/preview/:device/:id',
        views: {
          content: {
            templateUrl: 'preview.html',
            controller: 'PreviewCtrl',
            controllerAs: 'p',
          },
        },
      },
      editor: {
        url: '/:portal/editor/:id/:sysId',
        views: {
          content: {
            templateUrl: 'editor.html',
            controller: 'EditorCtrl',
            controllerAs: 'vm',
          },
        },
      },
    },
    routeDefault: '/page/select',
    rules: {
      layout: {
        label: 'column',
        content: 'containers',
        allowedTypes: ['container'],
        li: 'layout-li',
        ul: 'layout-ul',
      },
      container: {
        label: 'container',
        content: 'rows',
        allowedTypes: ['row'],
        li: 'containers-list',
        fields: ['class_name', 'name', 'width', 'sys_id', 'background'],
      },
      row: {
        label: 'row',
        content: 'columns',
        allowedTypes: ['column'],
        li: 'rows-list',
        ul: 'row',
        fields: ['sys_id'],
      },
      column: {
        label: 'column',
        content: 'content',
        allowedTypes: ['widget', 'row'],
        li: 'column',
        ul: 'widget-wrap',
        fields: ['class_name', 'size_classes', 'sys_id'],
      },
      widget: {
        content: 'widgets',
        fields: ['widget', 'title', 'sys_id'],
      },
    },
    row: {
      type: 'row',
      columns: [],
    },
    spConfigUri:
      'sp_config/?id=page_edit&p={page}&table={table}&sys_id={sys_id}',
    portalList: {
      table: 'sp_portal',
      params: {
        sysparm_fields:
          'sys_id,title,url_suffix,homepage,login_page,notfound_page,theme',
        sysparm_display_value: true,
      },
    },
    pageList: {
      table: 'sp_page',
      params: {
        sysparm_query: 'internal!=true^ORinternalISEMPTY',
        sysparm_display_value: true,
        sysparm_fields: 'sys_id,title,id',
      },
    },
    tableUri: 'api/now/v1/table/:table',
    tableSaveUri: 'api/now/v1/table/:table/:sysId',
    themeName: 't',
    themeUri: 'api/now/v1/spd/portal/:url_suffix',
    widget: {
      type: 'widget',
      uri: 'api/now/v1/spd/widget/:sysId',
    },
    widgetFormExcludeFields: ['sp_widget', 'sp_column', 'order'],
    widgetList: {
      uri: 'api/now/v1/table/sp_widget',
      params: {
        sysparm_query: 'internal!=true^ORinternalISEMPTY^ORDERBYsys_updated_on',
        sysparm_display_value: true,
        sysparm_fields: 'name,sys_id,data_table',
      },
    },
    widgetListUri: 'api/now/table/sp_widget',
    widgetEditUri: 'sp_config?id=widget_editor&sys_id={sys_id}',
  });
})();
