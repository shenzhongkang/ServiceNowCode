/*! RESOURCE: /scripts/app.queryBuilder/services/service.encodedQueryService.js */
angular.module('sn.queryBuilder').factory('encodedQueryService', [
  '$resource',
  'i18n',
  function ($resource, i18n) {
    'use strict';
    var HUMANREADABLE = $resource(
      '/api/now/ui/query_parse/:table/map',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    function _getHumanReadable(table, encodedQuery) {
      return HUMANREADABLE.query({
        table: table,
        sysparm_query: encodedQuery,
      }).$promise.then(function (raw) {
        var toSend = [];
        if (raw.result && raw.result.predicates) {
          var predicates = raw.result.predicates;
          for (var i = 0; i < predicates.length; i++) {
            handlePredicate(predicates[i], toSend);
          }
        }
        return toSend;
      });
    }
    function handlePredicate(predicate, list) {
      if (predicate.subpredicates && predicate.subpredicates.length > 0) {
        if (predicate.is_related) {
          if (
            list.indexOf(
              i18n.getMessage('queryBuilder.general.relatedList') === -1
            )
          ) {
            list.push(i18n.getMessage('queryBuilder.general.relatedList'));
            var comparison = predicate.comparison;
            list.push(
              comparison.table_label +
                ' ' +
                comparison.quantity.operator +
                ' ' +
                comparison.quantity.value
            );
          }
        }
        for (var i = 0; i < predicate.subpredicates.length; i++) {
          if (
            predicate.subpredicates[i].subpredicates &&
            predicate.subpredicates[i].subpredicates.length > 0
          )
            handlePredicate(predicate.subpredicates[i], list);
          else {
            var subpredicatesLength = predicate.subpredicates.length;
            for (var j = 0; j < subpredicatesLength; j++) {
              var hasCompound =
                predicate.type === 'compound' && predicate.compound_type;
              var isNotAdded =
                list.indexOf(predicate.subpredicates[j].term_label) === -1;
              if (isNotAdded) {
                list.push(predicate.subpredicates[j].term_label);
                if (
                  hasCompound &&
                  subpredicatesLength > 1 &&
                  j < subpredicatesLength - 1
                )
                  list.push(predicate.compound_type);
                if (j === subpredicatesLength - 1) list.push('');
              }
            }
          }
        }
      }
    }
    return {
      getHumanReadable: _getHumanReadable,
    };
  },
]);
