/*! RESOURCE: /scripts/app.ngbsm/factory.bsmActions.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmActions',
    function (
      $resource,
      $rootScope,
      bsmCamera,
      bsmGraph,
      bsmLinkLayout,
      bsmNodeLayout,
      bsmRelationships,
      bsmRenderer,
      bsmScriptEvaluator,
      bsmRESTService
    ) {
      'use strict';
      var cache = [];
      refreshCache();
      function refreshCache() {
        bsmRESTService.getActions().then(function (response) {
          response = JSON.parse(response);
          cache = [];
          cache = response.actions;
        });
      }
      function getActionsWithItemType(datum, itemType) {
        var list = [];
        for (var i = 0; i < cache.length; i++) {
          if (
            cache[i].item === itemType &&
            bsmScriptEvaluator.evaluateCondition(datum, cache[i].condition)
          ) {
            cache[i].action = function () {
              bsmScriptEvaluator.evaluateFunction(datum, this.script);
            };
            list.push(cache[i]);
          }
        }
        return list;
      }
      function getNodeActions(datum) {
        var base = [];
        return base.concat(getActionsWithItemType(datum, 'node'));
      }
      function getLinkActions(datum) {
        var base = [];
        return base.concat(getActionsWithItemType(datum, 'link'));
      }
      function getGenericActions() {
        var base = [];
        return base.concat(getActionsWithItemType({}, 'canvas'));
      }
      return {
        getActions: function (type, datum) {
          if (type === 'node') return getNodeActions(datum);
          else if (type === 'link') return getLinkActions(datum);
          else return getGenericActions();
        },
      };
    }
  );