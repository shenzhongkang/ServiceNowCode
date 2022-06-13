/*! RESOURCE: /scripts/app.ngbsm/factory.bsmScriptEvaluator.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmScriptEvaluator',
    function (
      $rootScope,
      bsmCamera,
      bsmFilters,
      bsmGraph,
      bsmLinkLayout,
      bsmNodeLayout,
      bsmRelationships,
      bsmRenderer,
      bsmRepository,
      bsmSelection,
      bsmURL,
      i18n
    ) {
      'use strict';
      var graphWasChanged = false;
      $rootScope.$on('ngbsm.original.graph.changed', function (event, data) {
        graphWasChanged = true;
      });
      function evaluateString(item, script) {
        if (script === '') return true;
        else return eval(script);
      }
      return {
        evaluateCondition: function (item, script) {
          try {
            return evaluateString(item, script);
          } catch (e) {
            var translatedMsg = i18n.getMessage(
              'dependencies.ngbsm.script.eval.error'
            );
            $rootScope.$broadcast('ngbsm.error', {
              error:
                translatedMsg +
                " '" +
                (script.length > 64
                  ? script.substring(0, 64) + ' ...'
                  : script) +
                "'",
            });
            console.log('Error evaluating custom condition:');
            console.log(e);
          }
          return false;
        },
        evaluateFunction: function (item, script) {
          try {
            evaluateString(item, script);
          } catch (e) {
            var translatedMsg = i18n.getMessage(
              'dependencies.ngbsm.script.execute.error'
            );
            $rootScope.$broadcast('ngbsm.error', {
              error:
                translatedMsg +
                " '" +
                (script.length > 64
                  ? script.substring(0, 64) + ' ...'
                  : script) +
                "'",
            });
            console.log('Error evaluating custom function:');
            console.log(e);
          }
        },
      };
    }
  );