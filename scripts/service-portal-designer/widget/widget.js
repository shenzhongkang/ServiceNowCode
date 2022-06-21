/*! RESOURCE: /scripts/service-portal-designer/widget/widget.js */
(function () {
  'use strict';
  angular
    .module('spd_widget', [])
    .factory(
      'widget',
      function (
        $q,
        config,
        $compile,
        page,
        record,
        state,
        $window,
        $timeout,
        utils,
        spServer,
        $rootScope,
        text
      ) {
        var cache = {
          form: {},
          list: {},
        };
        function getFormFields(id) {
          if (cache.form[id]) {
            var deferred = $q.defer();
            deferred.resolve(cache.form[id]);
            return deferred.promise;
          }
          record.select({ id: id }, config.formUri);
          return record.query().then(function (response) {
            cache.form[id] = response;
            return response;
          });
        }
        function prepareList(data) {
          var i;
          var result = data.map(function (item) {
            i = {
              label: item.name,
              type: 'widget',
              sp_widget: item.sys_id,
              data_table: item.data_table,
            };
            cache.list[item.sys_id] = i;
            return i;
          });
          return result;
        }
        function getById(id) {
          return cache.list[id];
        }
        function getWidget(sysId) {
          record.select({ sysId: sysId }, config.widget.uri, {
            get: {
              method: 'GET',
              headers: { 'x-portal': state.get('portalId') },
            },
          });
          return record.query(config.widgetList.params);
        }
        function save(table, sysId, data) {
          record.select({ table: table, sysId: sysId }, config.tableSaveUri, {
            save: { method: 'PATCH' },
          });
          return record.res.save(data).$promise;
        }
        function getList() {
          record.select(config.widgetList.params, config.widgetList.uri);
          return record
            .query(config.widgetList.params)
            .then(prepareList, function (error) {
              return error;
            });
        }
        function edit(item) {
          $window.open(
            utils.getUrl(
              utils.format(config.widgetEditUri, { sys_id: item.sp_widget })
            )
          );
        }
        function render(scope, element, template) {
          var html = $(template);
          var el1 = $compile(html)(scope);
          var wrapHTML =
            '<div class="widget-wrapper"><div class="widget-hover-menu"></div></div>';
          var el2 = $compile(wrapHTML)(scope);
          el2.append(el1);
          element.replaceWith(el2);
          $timeout(function () {
            if (el1.is(':empty')) {
              text('No preview available').then(function (message) {
                var previewHTML = utils.format(
                  '<div class="spd-no-preview">{name} <br/> {message}</div>',
                  {
                    name: scope.widget.name,
                    message: message,
                  }
                );
                el2.append(previewHTML);
              });
            }
          }, 250);
        }
        function initGlobals(scope) {
          scope.page = scope.page || state.get('pageInfo');
          scope.user = state.get('userInfo');
          scope.theme = state.get('themeInfo');
          scope.portal = $rootScope.portal = $rootScope.portal || {};
          scope.server = spServer.set(scope);
        }
        return {
          save: save,
          edit: edit,
          getList: getList,
          getById: getById,
          getWidget: getWidget,
          getFormFields: getFormFields,
          render: render,
          initGlobals: initGlobals,
        };
      }
    );
})();
