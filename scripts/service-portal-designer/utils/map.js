/*! RESOURCE: /scripts/service-portal-designer/utils/map.js */
(function () {
  'use strict';
  angular
    .module('spd_map', ['spd_config', 'spd_utils'])
    .factory('map', function (config, utils) {
      var map = {};
      if (debug) {
        debug.map = function () {
          return map;
        };
      }
      function get(id) {
        return map[id];
      }
      function setProp(id, key, value) {
        map[id] = map[id] || {};
        map[id][key] = value;
      }
      function setProps(item, parent) {
        item.id = utils.createUid();
        setProp(item.id, 'parent', parent);
        setProp(item.id, 'type', item.type);
        setProp(
          item.id,
          config.rules[item.type].content,
          item[config.rules[item.type].content]
        );
      }
      function setParent(item, parent) {
        setProps(item, parent);
        if (item.type === 'row') {
          _.each(item.columns, function (column) {
            setProps(column, item);
          });
        }
      }
      function getParent(id) {
        if (map[id] && map[id].parent) {
          return map[id].parent;
        }
        return null;
      }
      function remove(id) {
        if (
          map[id] &&
          map[id][config.rules[map[id].type].content] &&
          map[id][config.rules[map[id].type].content].length > 0
        ) {
          _.forEach(
            map[id][config.rules[map[id].type].content],
            function (item) {
              remove(item.id);
            }
          );
        }
        delete map[id];
      }
      function removeAll() {
        map = {};
      }
      return {
        setParent: setParent,
        getParent: getParent,
        remove: remove,
        removeAll: removeAll,
        setProps: setProps,
        setProp: setProp,
        get: get,
      };
    });
})();
