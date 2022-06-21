/*! RESOURCE: /scripts/service-portal-designer/utils/state.js */
(function () {
  'use strict';
  angular
    .module('spd_state', ['spd_config'])
    .factory('state', function (config) {
      var state = angular.copy(config);
      var listeners = {};
      function notify(key, value) {
        if (listeners[key]) {
          _.forEach(listeners[key], function (scope) {
            if (angular.isFunction(scope)) {
              scope(value, key);
            } else {
              scope[key] = value;
            }
          });
        }
      }
      var getter = function getter(value) {
        return state[value] || null;
      };
      var setter = function setter(key, value) {
        state[key] = state[key] || value;
        notify(key, value);
        state[key] = value;
        return value;
      };
      var onChange = function onChange(key) {
        function update($scope) {
          listeners[key] = listeners[key] || [];
          listeners[key].push($scope);
          $scope[key] = state[key];
        }
        function call(fn) {
          listeners[key] = listeners[key] || [];
          listeners[key].push(fn);
        }
        return {
          update: update,
          call: call,
        };
      };
      return {
        get: getter,
        set: setter,
        onChange: onChange,
      };
    });
})();
