/*! RESOURCE: /scripts/service-portal-designer/editor/editor_manager.js */
(function () {
  'use strict';
  angular
    .module('spd_editor_manager', [])
    .factory('editorManager', function (map, config, state, pageUpdate, text) {
      _.each(config.types, function (value) {
        text(_.startCase(config[value].type)).then(function (text) {
          config[value].translated = text;
        });
      });
      function findPosition(item, parent) {
        var result = false;
        _.forEach(
          parent[config.rules[parent.type].content],
          function (parentItem, key) {
            if (parentItem.id == item.id) {
              result = key;
            }
          }
        );
        return result;
      }
      function remove(item, moving) {
        if (typeof moving === 'undefined') {
          pageUpdate.remove(item);
        }
        var parent = map.getParent(item.id);
        var grandparent = map.getParent(parent.id);
        if (
          item.type === 'column' &&
          parent[config.rules[parent.type].content].length == 1
        ) {
          _.forEach(
            grandparent[config.rules[grandparent.type].content],
            function (row, key) {
              if (row.$$hashKey === parent.$$hashKey) {
                pageUpdate.remove(row);
                if (typeof moving === 'undefined') {
                  map.remove(row.id);
                }
                grandparent[config.rules[grandparent.type].content].splice(
                  key,
                  1
                );
                return false;
              }
            }
          );
          if (
            grandparent.type === 'container' &&
            grandparent[config.rules[grandparent.type].content].length == 0
          ) {
            grandparent.plusButton = true;
          }
          return grandparent;
        }
        if (
          parent.type === 'container' &&
          parent[config.rules[parent.type].content].length == 1
        ) {
          parent.plusButton = true;
        }
        map.remove(item.id);
        parent[config.rules[parent.type].content].splice(
          findPosition(item, parent),
          1
        );
        return parent;
      }
      function getRowsAndColumns() {
        var row,
          columnSizes,
          column,
          result = [];
        _.forEach(config.columnSizes, function (sizes) {
          columnSizes = sizes.split('-');
          row = angular.copy(config.row);
          _.forEach(columnSizes, function (size) {
            column = angular.copy(config.column);
            column.size_classes[config.columnDefaultType] = +size;
            row[config.rules.row.content].push(column);
          });
          result.push(row);
        });
        return result;
      }
      return {
        remove: remove,
        findPosition: findPosition,
        getRowsAndColumns: getRowsAndColumns,
      };
    });
})();
