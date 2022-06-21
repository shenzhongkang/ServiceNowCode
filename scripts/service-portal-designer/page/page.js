/*! RESOURCE: /scripts/service-portal-designer/page/page.js */
(function () {
  'use strict';
  angular
    .module('spd_page', [])
    .factory(
      'page',
      function (
        $resource,
        config,
        utils,
        map,
        $q,
        state,
        record,
        $state,
        $rootScope,
        events
      ) {
        function exists(pageId) {
          record.select({ id: pageId }, config.pageExistsUri);
          return record.query().then(function (response) {
            return response.exists;
          });
        }
        function add(params) {
          record.select(null, config.pageUri, { save: { method: 'POST' } });
          return record.res.save(params).$promise.then(function (response) {
            return response.result;
          });
        }
        function remove(pageID) {
          record.select({ id: pageID }, config.pageRemoveUri, {
            remove: { method: 'POST' },
          });
          return record.res.remove().$promise.then(function (response) {
            return response.result;
          });
        }
        function render(type, data, parent) {
          var model;
          var list = data[type + 's'];
          _.forEach(list, function (item) {
            model = angular.copy(config[type]);
            _.forEach(config.rules[type].fields, function (field) {
              if (item[field]) {
                model[field] = item[field];
              }
            });
            if (type === 'container') {
              if (item.width) {
                model.ul = item.width;
              }
            }
            if (item.rows && item.rows.length > 0) {
              render('row', item, model);
            }
            if (type === 'row') {
              if (item.columns && item.columns.length > 0) {
                render('column', item, model);
              }
              parent.plusButton = false;
            }
            if (type === 'column') {
              if (item.widgets && item.widgets.length > 0) {
                render('widget', item, model);
              }
            }
            parent[config.rules[parent.type].content].push(model);
            if (type !== 'column') {
              map.setParent(model, parent);
            }
            _.forEach(
              parent[config.rules[parent.type].content],
              function (item) {
                if (item.sys_id == $state.params.sysId) {
                  $rootScope.$broadcast(events.itemSelect, item);
                }
              }
            );
          });
        }
        function get(pageId) {
          var methods = {
            get: {
              method: 'GET',
              headers: { 'x-portal': state.get('portalId') },
            },
          };
          var pageResource = $resource(
            utils.getUrl(config.pageGetUri),
            { id: pageId },
            methods
          );
          return pageResource.get().$promise.then(function (response) {
            state.set('themeInfo', response.result.theme);
            state.set('userInfo', response.result.user);
            state.set('pageInfo', response.result.page);
            return response;
          });
        }
        function getList() {
          record.select({ table: config.pageList.table });
          return record.query(config.pageList.params).then(function (response) {
            response.map(function (item) {
              item.title =
                item.title !== null && item.title.length > 0
                  ? item.title
                  : item.id;
              return item;
            });
            state.set('pageList', response);
            return response;
          });
        }
        return {
          exists: exists,
          render: render,
          add: add,
          get: get,
          remove: remove,
          getList: getList,
        };
      }
    );
})();
