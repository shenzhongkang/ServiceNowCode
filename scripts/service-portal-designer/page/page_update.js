/*! RESOURCE: /scripts/service-portal-designer/page/page_update.js */
(function () {
  'use strict';
  angular
    .module('spd_page_update', [
      'spd_map',
      'spd_config',
      'spd_record',
      'spd_utils',
      'spd_message',
    ])
    .factory('pageUpdate', function (map, config, record, state, message) {
      var removeQueue = {};
      function remove(element) {
        if (element.sys_id) {
          removeQueue[element.type] = removeQueue[element.type] || [];
          removeQueue[element.type].push(element.sys_id);
        }
      }
      function addOrder(model) {
        var type;
        var content = config.rules[model.type].content;
        for (var i = 0; i < model[content].length; i++) {
          type = model[content][i].type;
          if (model[content][i][config.rules[type].content]) {
            addOrder(model[content][i]);
          }
          model[content][i].order = i + 1 + '';
        }
        return model;
      }
      function updateModel(model) {
        var type;
        var content = config.rules[model.type].content;
        for (var i = 0; i < model[content].length; i++) {
          type = model[content][i].type;
          if (model[content][i][config.rules[type].content]) {
            updateModel(model[content][i]);
          }
          if (type === 'column') {
            var content2 = config.rules[model[content][i].type].content;
            if (model[content][i][content2].length > 0) {
              if (model[content][i][content2][0].type === 'widget') {
                _.forEach(model[content][i][content2], function (item) {
                  if (item.widget && item.widget.template) {
                    delete item.widget.template;
                  }
                });
                model[content][i].widgets = model[content][i][content2];
              }
              if (model[content][i][content2][0].type === 'row') {
                model[content][i].rows = model[content][i][content2];
              }
              delete model[content][i][content2];
            }
          }
        }
        return model;
      }
      function update(pageId, model) {
        model.remove = removeQueue;
        record.select({ id: pageId }, config.pageUpdateUri, {
          save: {
            method: 'POST',
            headers: { 'x-portal': state.get('portalId') },
          },
        });
        return record.res.save(model).$promise.then(
          function (response) {
            removeQueue = {};
            return response.result;
          },
          function (response) {
            message({ title: response.data.error.detail, okBtn: true });
          }
        );
      }
      return {
        addOrder: addOrder,
        updateModel: updateModel,
        update: update,
        remove: remove,
      };
    });
})();
