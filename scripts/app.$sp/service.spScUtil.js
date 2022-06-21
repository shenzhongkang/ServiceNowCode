/*! RESOURCE: /scripts/app.$sp/service.spScUtil.js */
angular
  .module('sn.$sp')
  .factory(
    'spScUtil',
    function (
      $http,
      $q,
      $log,
      $window,
      spSCConf,
      $httpParamSerializer,
      spUtil,
      i18n
    ) {
      'use strict';
      var baseCatalogUrl = '/api/sn_sc/v1/servicecatalog/';
      var baseTableApi = '/api/now/table/';
      var angProcessorUrl = 'angular.do';
      function addAdditionalParms(req, parms) {
        for (var key in parms) req[key] = parms[key];
      }
      function getCart() {
        return $http.get(baseCatalogUrl + 'cart');
      }
      function submitProducer(
        producerId,
        variables,
        newRecordID,
        additionalParms
      ) {
        var request = {
          variables: variables,
          sysparm_item_guid: newRecordID,
          get_portal_messages: 'true',
          sysparm_no_validation: 'true',
        };
        addAdditionalParms(request, additionalParms);
        return $http
          .post(
            baseCatalogUrl + 'items/' + producerId + '/submit_producer',
            request
          )
          .then(null, onFail);
      }
      function submitStdChgProducer(
        producerId,
        twoStep,
        currentVersion,
        newRecordID,
        portalSuffix,
        additionalParms,
        chgModel
      ) {
        var promise;
        if (twoStep) {
          var urlParameters = {};
          urlParameters['sys_id'] = '-1';
          urlParameters['id'] = 'form';
          urlParameters['table'] = 'change_request';
          if (chgModel)
            urlParameters['query'] =
              'chg_model=' +
              chgModel +
              '^std_change_producer_version=' +
              currentVersion;
          else
            urlParameters['query'] =
              'type=standard^std_change_producer_version=' + currentVersion;
          if (additionalParms && additionalParms['target_query'])
            urlParameters['query'] += '^' + additionalParms['target_query'];
          var completeUrl =
            portalSuffix + '?' + $httpParamSerializer(urlParameters);
          var resp = {};
          resp['redirect_portal_url'] = completeUrl;
          resp['redirect_url'] = completeUrl;
          resp['table'] = 'change_request';
          promise = $q.resolve({ data: { result: resp } });
        } else {
          promise = this.submitProducer(producerId, {}, newRecordID, null);
          promise.then(function (response) {
            var params;
            if (additionalParms && additionalParms['target_query']) {
              var pairs = additionalParms['target_query'].split('^');
              params = {};
              pairs.forEach(function (pair) {
                pair = pair.split('=');
                params[pair[0]] = pair[1];
              });
            }
            var table = response.data.result.table;
            var recordId = response.data.result.sys_id;
            if (table && recordId && params)
              $http.patch(baseTableApi + table + '/' + recordId, params);
          });
        }
        return promise;
      }
      function orderNow(
        itemId,
        quantity,
        variables,
        newRecordID,
        additionalParms,
        alsoRequestFor
      ) {
        var request = {
          sysparm_quantity: quantity,
          variables: variables,
          sysparm_item_guid: newRecordID,
          get_portal_messages: 'true',
          sysparm_no_validation: 'true',
          sysparm_also_request_for: alsoRequestFor,
        };
        addAdditionalParms(request, additionalParms);
        return $http
          .post(baseCatalogUrl + 'items/' + itemId + '/order_now', request)
          .then(null, onFail);
      }
      function addToCart(
        itemId,
        quantity,
        variables,
        newRecordID,
        alsoRequestFor
      ) {
        return $http
          .post(baseCatalogUrl + 'items/' + itemId + '/add_to_cart', {
            sysparm_quantity: quantity,
            variables: variables,
            sysparm_item_guid: newRecordID,
            sysparm_no_validation: 'true',
            sysparm_also_request_for: alsoRequestFor,
          })
          .then(null, onFail);
      }
      function updateCart(itemId, quantity, variables) {
        return $http
          .put(baseCatalogUrl + 'cart/' + itemId, {
            sysparm_quantity: quantity,
            variables: variables,
            sysparm_no_validation: 'true',
          })
          .then(null, onFail);
      }
      function addToWishlist(itemId, quantity, variables, newRecordID) {
        return $http
          .post(baseCatalogUrl + 'items/' + itemId + '/add_to_wishlist', {
            sysparm_quantity: quantity,
            variables: variables,
            sysparm_item_guid: newRecordID,
          })
          .then(null, onFail);
      }
      function orderWishlistedItem(
        itemId,
        quantity,
        variables,
        savedItemId,
        additionalParms
      ) {
        var request = {
          sysparm_quantity: quantity,
          variables: variables,
          saved_item_id: savedItemId,
          get_portal_messages: 'true',
          sysparm_no_validation: 'true',
        };
        addAdditionalParms(request, additionalParms);
        return $http
          .post(baseCatalogUrl + 'items/' + itemId + '/order_now', request)
          .then(null, onFail);
      }
      function addWishlistedItemToCart(
        itemId,
        quantity,
        variables,
        savedItemId
      ) {
        return $http
          .post(baseCatalogUrl + 'items/' + itemId + '/add_to_cart', {
            sysparm_quantity: quantity,
            variables: variables,
            saved_item_id: savedItemId,
            sysparm_no_validation: 'true',
          })
          .then(null, onFail);
      }
      function submitWishlistedProducer(
        producerId,
        variables,
        savedItemId,
        additionalParms
      ) {
        var request = {
          variables: variables,
          sysparm_item_guid: savedItemId,
          get_portal_messages: 'true',
          saved_item_id: savedItemId,
          sysparm_no_validation: 'true',
        };
        addAdditionalParms(request, additionalParms);
        return $http
          .post(
            baseCatalogUrl + 'items/' + producerId + '/submit_producer',
            request
          )
          .then(null, onFail);
      }
      function getDisplayValueForMultiRowSet(multiRowSetId, value) {
        var params = {};
        params['sysparm_value'] = value;
        var url =
          baseCatalogUrl + 'variables/' + multiRowSetId + '/display_value';
        return $http.post(url, params).then(null, onFail);
      }
      function onFail(response) {
        $log.info('REST Failure');
        $log.info(response);
        if (!isCustomRestException(response))
          spUtil.addErrorMessage(
            i18n.getMessage(
              'Something went wrong and your request could not be submitted. Please contact your system administrator'
            )
          );
        return $q.reject(response);
      }
      function isCustomRestException(response) {
        if (response.data.result && response.data.result.errMsg) return true;
        return false;
      }
      function isCatalogVariable(field) {
        return '' + field[spSCConf._CAT_VARIABLE] == 'true';
      }
      function isRegexDone(fields) {
        return isServerValidationDone(fields);
      }
      function isServerValidationDone(fields) {
        for (var field in fields) {
          if (
            fields.hasOwnProperty(field) &&
            fields[field].isServerValidationDone === false
          )
            return false;
        }
        return true;
      }
      function queryRecord(table, recordId) {
        return $http.get(baseTableApi + table + '/' + recordId);
      }
      function queryMultipleRecords(table, queryObj) {
        var query = '';
        for (var obj in queryObj) query += obj + '=' + queryObj[obj] + '&';
        return $http.get(baseTableApi + table + '?' + query);
      }
      function validateRegex(variableId, value) {
        var params = {};
        params['sysparm_value'] = value;
        var url =
          baseCatalogUrl + 'variables/' + variableId + '/validate_regex';
        return $http.post(url, params).then(null, onFail);
      }
      function validateRequestedForAccess(itemId, value) {
        var url = baseCatalogUrl + 'items/' + itemId + '/delegation/' + value;
        return $http.get(url).then(function (response) {
          if (!response.data.result.result) return $q.reject(response);
        });
      }
      function validateDelegationForMultipleUsers(itemId, userSysIds) {
        var url =
          baseCatalogUrl + 'items/' + itemId + '/get_invalid_delegated_users';
        var request = { sysparm_also_request_for: userSysIds };
        return $http.post(url, request).then(function (response) {
          if (response.data.result.invalidUsers.length > 0)
            return $q.reject(response);
        });
      }
      function isPublicUser() {
        var n = $.param({
          sysparm_type: 'get_user',
          sysparm_ck: $window.g_ck,
        });
        return $http.post(angProcessorUrl + '?' + n);
      }
      function getPreference(pref, callback) {
        isPublicUser().then(function (response) {
          if (response.data.userName !== 'guest')
            spUtil.getPreference(pref, callback);
          else callback('');
        });
      }
      function setPreference(pref, value) {
        isPublicUser().then(function (response) {
          if (response.data.userName !== 'guest')
            spUtil.setPreference(pref, value);
        });
      }
      function saveVariables(tableName, tableSysId, variablesData) {
        $http
          .put(
            baseCatalogUrl + 'variables/' + tableName + '/' + tableSysId,
            variablesData
          )
          .then(null, onFail);
      }
      return {
        getCart: getCart,
        submitProducer: submitProducer,
        submitStdChgProducer: submitStdChgProducer,
        orderNow: orderNow,
        addToCart: addToCart,
        updateCart: updateCart,
        addToWishlist: addToWishlist,
        orderWishlistedItem: orderWishlistedItem,
        addWishlistedItemToCart: addWishlistedItemToCart,
        submitWishlistedProducer: submitWishlistedProducer,
        getDisplayValueForMultiRowSet: getDisplayValueForMultiRowSet,
        isCatalogVariable: isCatalogVariable,
        queryRecord: queryRecord,
        queryMultipleRecords: queryMultipleRecords,
        isRegexDone: isRegexDone,
        validateRegex: validateRegex,
        validateRequestedForAccess: validateRequestedForAccess,
        validateDelegationForMultipleUsers: validateDelegationForMultipleUsers,
        isServerValidationDone: isServerValidationDone,
        getPreference: getPreference,
        setPreference: setPreference,
        saveVariables: saveVariables,
      };
    }
  );
