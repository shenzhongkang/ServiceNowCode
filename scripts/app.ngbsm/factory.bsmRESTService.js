/*! RESOURCE: /scripts/app.ngbsm/factory.bsmRESTService.js */
angular.module('sn.ngbsm').factory('bsmRESTService', [
  '$resource',
  function ($resource) {
    'use strict';
    var LOAD_MAP = $resource(
      'api/now/bsm/map/:sys_id',
      { sys_id: '@sys_id' },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_RELATED_BUSINESS_SERVICES = $resource(
      'api/now/bsm/related-services',
      {},
      {
        query: {
          method: 'POST',
          isArray: false,
        },
      }
    );
    var GET_INDICATORS = $resource(
      'api/now/bsm/indicators',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var ADD_RELATION = $resource(
      'api/now/bsm/add-rel',
      {},
      {
        query: {
          method: 'POST',
          isArray: false,
        },
      }
    );
    var DELETE_RELATION = $resource(
      'api/now/bsm/delete-rel/:id',
      { id: '@id' },
      {
        query: {
          method: 'DELETE',
          isArray: false,
        },
      }
    );
    var EDIT_RELATION = $resource(
      'api/now/bsm/edit-rel',
      {},
      {
        query: {
          method: 'PATCH',
          isArray: false,
        },
      }
    );
    var GET_ICONS = $resource(
      'api/now/bsm/icons',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_COLORS = $resource(
      'api/now/bsm/colors',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_ACTIONS = $resource(
      'api/now/bsm/actions',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var SEARCH_SERVICES = $resource(
      'api/now/bsm/search-services',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var SEARCH_CI = $resource(
      'api/now/bsm/search-ci',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var GET_LAST_MAP = $resource(
      'api/now/bsm/lastmap',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
          headers: {
            Accept: 'application/json',
            'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        },
      }
    );
    var SAVE_LAST_MAP = $resource(
      'api/now/bsm/savelastmap',
      {},
      {
        query: {
          method: 'POST',
          isArray: false,
          headers: {
            'If-Modified-Since': 'Mon, 26 Jul 1997 05:00:00 GMT',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
        },
      }
    );
    var GET_FILTERS = $resource(
      'api/now/bsm/filters',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    function _loadMap(
      id,
      fStickyNodes,
      sLevel,
      fPreFilterId,
      fActionType,
      fScriptID,
      fMapScriptParams,
      isService
    ) {
      return LOAD_MAP.query({
        sys_id: id,
        stickyNodes: fStickyNodes,
        level: sLevel,
        preFilterId: fPreFilterId,
        actionType: fActionType,
        scriptID: fScriptID,
        mapScriptParams: fMapScriptParams,
        serviceMode: isService,
        cacheKill: new Date().getTime(),
      }).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getRelatedServices(fList) {
      var sendObject = {
        list: fList,
      };
      return GET_RELATED_BUSINESS_SERVICES.query({}, sendObject).$promise.then(
        function (raw) {
          return raw.result.related_business_services;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getIndicators() {
      return GET_INDICATORS.query().$promise.then(
        function (raw) {
          return raw.result.active_indicators;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _addRelation(fParent, fChild, fType) {
      var sendObject = {
        parent: fParent,
        child: fChild,
        type: fType,
      };
      return ADD_RELATION.query({}, sendObject).$promise.then(
        function (raw) {
          return raw.result.edge;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _removeRelation(sys_id) {
      return DELETE_RELATION.query({ id: sys_id }).$promise.then(
        function (raw) {
          return raw.result.status_message;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _editRelation(sys_id, fType) {
      var sendObject = {
        id: sys_id,
        type: fType,
      };
      return EDIT_RELATION.query({}, sendObject).$promise.then(
        function (raw) {
          return raw.result.status_message;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getIcons() {
      return GET_ICONS.query().$promise.then(
        function (raw) {
          return raw.result.icons;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getColors() {
      return GET_COLORS.query().$promise.then(
        function (raw) {
          return raw.result.colors;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getActions() {
      return GET_ACTIONS.query().$promise.then(
        function (raw) {
          return raw.result.actions;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _searchServices(fText) {
      return SEARCH_SERVICES.query({ text: fText }).$promise.then(
        function (raw) {
          return raw.result.services;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _searchCI(fText) {
      return SEARCH_CI.query({ text: fText }).$promise.then(
        function (raw) {
          return raw.result.ci;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getLastMap() {
      return GET_LAST_MAP.query().$promise.then(
        function (raw) {
          return raw.result.last_map;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _saveLastMap(fTable, fCI) {
      var sendObject = {
        table: fTable,
        ci: fCI,
      };
      return SAVE_LAST_MAP.query({}, sendObject).$promise.then(
        function (raw) {
          return raw.result.saved_map;
        },
        function (err) {
          return err.data;
        }
      );
    }
    function _getFilters() {
      return GET_FILTERS.query().$promise.then(
        function (raw) {
          return raw.result.filter_list;
        },
        function (err) {
          return err.data;
        }
      );
    }
    return {
      loadMap: _loadMap,
      getRelatedServices: _getRelatedServices,
      getIndicators: _getIndicators,
      addRelation: _addRelation,
      removeRelation: _removeRelation,
      editRelation: _editRelation,
      getIcons: _getIcons,
      getColors: _getColors,
      getActions: _getActions,
      searchServices: _searchServices,
      searchCI: _searchCI,
      getLastMap: _getLastMap,
      saveLastMap: _saveLastMap,
      getFilters: _getFilters,
    };
  },
]);