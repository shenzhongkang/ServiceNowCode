/*! RESOURCE: /scripts/app.ngbsm/factory.bsmSearchRepository.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmSearchRepository',
    function ($resource, $interval, $http, CONFIG, bsmRESTService) {
      'use strict';
      var relationshipType = $resource('/api/now/table/cmdb_rel_type');
      return {
        searchCi: function (term) {
          return bsmRESTService.searchCI(term).then(
            function (response) {
              response = JSON.parse(response);
              return {
                term: term,
                result: response.result,
              };
            },
            function () {
              return {
                term: term,
                result: [],
              };
            }
          );
        },
        searchService: function (term) {
          return bsmRESTService.searchServices(term).then(
            function (response) {
              response = JSON.parse(response);
              return {
                term: term,
                result: response.result,
              };
            },
            function () {
              return {
                term: term,
                result: [],
              };
            }
          );
        },
        searchRelationshipTypes: function (term) {
          return relationshipType
            .get({
              sysparm_query: 'name>=' + term + '^nameLIKE' + term,
              sysparm_limit: CONFIG.SEARCH_REL_TYPE_LIMIT,
            })
            .$promise.then(
              function (response) {
                return {
                  term: term,
                  result: response.result,
                };
              },
              function () {
                return {
                  term: term,
                  result: [],
                };
              }
            );
        },
      };
    }
  );