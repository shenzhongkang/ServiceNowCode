/*! RESOURCE: /scripts/app.queryBuilder/services/service.tagsService.js */
angular.module('sn.queryBuilder').factory('tagsService', [
  '$resource',
  function ($resource) {
    'use strict';
    var GET_TAGS_FOR_MULTIPLE = $resource(
      '/api/now/ui/labels/retrieve_multiple/qb_saved_query/:sys_ids',
      {
        sys_ids: '@sys_ids',
      },
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    var ADD_TAG_FOR_SINGLE = $resource(
      '/api/now/ui/labels/create/qb_saved_query/:sys_id',
      {
        sys_id: '@sys_id',
      },
      {
        query: {
          method: 'PUT',
          isArray: false,
        },
      }
    );
    var REMOVE_TAG_FOR_SINGLE = $resource(
      '/api/now/ui/labels/remove/qb_saved_query/:sys_id/:labelID',
      {
        sys_id: '@sys_id',
        labelID: '@labelID',
      },
      {
        query: {
          method: 'POST',
          isArray: false,
        },
      }
    );
    var GET_RECENT_TAGS = $resource(
      '/api/now/ui/labels/retrieve_recent',
      {},
      {
        query: {
          method: 'GET',
          isArray: false,
        },
      }
    );
    function _getTagsForMultiple(sys_ids) {
      return GET_TAGS_FOR_MULTIPLE.query({
        sys_ids: sys_ids,
      }).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          var send = {
            failed: raw,
          };
          return send;
        }
      );
    }
    function _addTagForSingle(sys_id, tag) {
      var sendObject = {
        label: tag,
      };
      return ADD_TAG_FOR_SINGLE.query(
        {
          sys_id: sys_id,
        },
        sendObject
      ).$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          var send = {
            failed: raw,
          };
          return send;
        }
      );
    }
    function _removeTagFromSingle(sys_id, labelID) {
      return REMOVE_TAG_FOR_SINGLE.query({
        sys_id: sys_id,
        labelID: labelID,
      }).$promise.then(
        function (raw) {
          return raw;
        },
        function (raw) {
          var send = {
            failed: raw,
          };
          return send;
        }
      );
    }
    function _getRecentTags() {
      return GET_RECENT_TAGS.query().$promise.then(
        function (raw) {
          return raw.result;
        },
        function (raw) {
          var send = {
            failed: raw,
          };
          return send;
        }
      );
    }
    return {
      getTagsForMultiple: _getTagsForMultiple,
      addTagForSingle: _addTagForSingle,
      removeTagFromSingle: _removeTagFromSingle,
      getRecentTags: _getRecentTags,
    };
  },
]);
