/*! RESOURCE: /scripts/app.ngbsm/lib/request-factory.js */
('use strict');
angular
  .module('angular-abortable-requests', ['ngResource'])
  .factory('RequestFactory', [
    '$resource',
    '$http',
    'Util',
    '$q',
    function ($resource, $http, Util, $q) {
      function abortablePromiseWrap(promise, deferred, outstanding) {
        promise.then(function () {
          deferred.resolve.apply(deferred, arguments);
        });
        promise.catch(function () {
          deferred.reject.apply(deferred, arguments);
        });
        deferred.promise.finally(function () {
          Util.removeFromArray(outstanding, deferred);
        });
        outstanding.push(deferred);
      }
      function createSageResource(config, cacheConfig) {
        var actions = config.actions || {},
          resource,
          outstanding = [];
        resource = $resource(config.url, config.options || null, actions);
        Object.keys(actions).forEach(function (action) {
          var method = resource[action];
          resource[action] = function () {
            var deferred = $q.defer(),
              promise = method.apply(null, arguments).$promise;
            abortablePromiseWrap(promise, deferred, outstanding);
            return {
              promise: deferred.promise,
              abort: function () {
                deferred.reject('ABORT');
              },
            };
          };
        });
        resource.abortAll = function () {
          angular.forEach(outstanding, function (deferred) {
            deferred.reject('ABORT');
          });
          outstanding = [];
        };
        return resource;
      }
      function getHttpConfig(url) {
        return {
          method: 'GET',
          url: url,
        };
      }
      function httpRequester(config) {
        var interpolateUrl = config.url,
          outstanding = [];
        return {
          abortAll: function () {
            angular.forEach(outstanding, function (deferred) {
              deferred.reject('ABORT');
            });
            outstanding = [];
          },
          execute: function (options, params, data) {
            var uri, promise, deferred;
            config.url = interpolateUrl;
            if (config.url.substring(0, 4) === 'http') {
              uri = Util.disuniteHttp(config.url);
              config.url = uri.protocol + Util.interpolate(uri.url, options);
            } else {
              config.url = Util.interpolate(config.url, options);
            }
            angular.extend(config, params, data);
            deferred = $q.defer();
            promise = $http(config);
            abortablePromiseWrap(promise, deferred, outstanding);
            return {
              promise: deferred.promise,
              abort: function () {
                deferred.reject('ABORT');
              },
            };
          },
        };
      }
      return {
        createResource: function (config) {
          return createSageResource(config);
        },
        createHttpRequester: function (config) {
          if (angular.isString(config)) {
            config = getHttpConfig(config);
          }
          return httpRequester(config);
        },
      };
    },
  ]);