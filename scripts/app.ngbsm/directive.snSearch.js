/*! RESOURCE: /scripts/app.ngbsm/directive.snSearch.js */
angular
  .module('sn.ngbsm')
  .directive('snSearch', function ($document, $timeout, i18n, $q, CONST) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {
        search: '=data',
      },
      templateUrl: '/angular.do?sysparm_type=get_partial&name=sn_search.xml',
      controller: function ($scope) {
        $scope.considered = null;
        $scope.open = false;
        $scope.providers = [];
        $scope.$watch('search.term', termChanged);
        $scope.focus = function () {
          $scope.alertMessage = '';
          $scope.open = true;
        };
        $scope.blur = function () {
          $scope.open = false;
        };
        $scope.isConsidered = function (providerIndex, index) {
          return (
            calculateAbsoluteIndex(providerIndex, index) === $scope.considered
          );
        };
        $scope.consider = function (providerIndex, index) {
          $scope.considered = calculateAbsoluteIndex(providerIndex, index);
        };
        $scope.select = function (index) {
          $scope.search.selected = {
            provider: getProviderFromAbsoluteIndex(index),
            result: getResultFromAbsoluteIndex(index),
          };
          alert(i18n.getMessage('Selected'));
          $scope.blur();
        };
        $scope.keydown = function (event) {
          event.stopPropagation();
          if (isUsedKey(event)) {
            event.preventDefault();
            if (event.keyCode === CONST.KEYCODE_UP) {
              if ($scope.considered !== null && $scope.considered > 0)
                $scope.considered--;
              else $scope.considered = maxAbsoluteIndex();
              alertResult($scope.considered);
            } else if (event.keyCode === CONST.KEYCODE_DOWN) {
              if (
                $scope.considered !== null &&
                $scope.considered < maxAbsoluteIndex()
              )
                $scope.considered++;
              else $scope.considered = 0;
              alertResult($scope.considered);
            } else if (event.keyCode === CONST.KEYCODE_ENTER) {
              $scope.select($scope.considered);
            }
          }
        };
        $scope.layoutStyles = function () {
          return {
            float: $scope.search.align,
            'margin-left': $scope.search.align === 'left' ? '0px' : '5px',
            'margin-right': $scope.search.align === 'left' ? '5px' : '0px',
          };
        };
        function alert($message) {
          $scope.alertMessage = $message;
        }
        function alertResult(index) {
          var result = getResultFromAbsoluteIndex(index);
          alert(result.name + ', ' + result.sys_class_name);
        }
        function isUsedKey(event) {
          if (event.keyCode === CONST.KEYCODE_UP) return true;
          if (event.keyCode === CONST.KEYCODE_DOWN) return true;
          if (event.keyCode === CONST.KEYCODE_ENTER) return true;
          return false;
        }
        function maxAbsoluteIndex() {
          var max = 0;
          for (var i = 0; i < $scope.providers.length; i++)
            max += $scope.providers[i].results.length;
          return max - 1;
        }
        function calculateAbsoluteIndex(providerIndex, index) {
          var absolute = 0;
          for (var i = 0; i < providerIndex; i++)
            absolute += $scope.providers[i].results.length;
          return absolute + index;
        }
        function getProviderFromAbsoluteIndex(index) {
          for (var i = 0; i < $scope.providers.length; i++) {
            if (index < $scope.providers[i].results.length)
              return $scope.providers[i];
            else index -= $scope.providers[i].results.length;
          }
          return $scope.providers[$scope.providers.length - 1];
        }
        function getResultFromAbsoluteIndex(index) {
          for (var i = 0; i < $scope.providers.length; i++) {
            if (index < $scope.providers[i].results.length)
              return $scope.providers[i].results[index];
            else index -= $scope.providers[i].results.length;
          }
          return null;
        }
        function termChanged(current, previous) {
          if (current && current.length >= 2) {
            var promises = [];
            $scope.providers.forEach(function (provider) {
              provider.stale = true;
              provider.requested = current;
              promises.push(
                provider.call(current).then(function (response) {
                  if (provider.stale && response.term === provider.requested) {
                    provider.stale = false;
                    provider.results = response.result.sort(function (a, b) {
                      return naturalSort(a.name, b.name);
                    });
                  }
                })
              );
            });
            $q.all(promises).then(function () {
              alert(
                i18n
                  .getMessage('{0} results')
                  .replace('NUM', [maxAbsoluteIndex() + 1])
              );
            });
          } else {
            $scope.providers.forEach(function (provider) {
              provider.stale = false;
              provider.results = [];
            });
          }
        }
        function naturalSort(as, bs) {
          var a,
            b,
            a1,
            b1,
            i = 0,
            n,
            L,
            rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
          if (as === bs) return 0;
          a = as.toLowerCase().match(rx);
          b = bs.toLowerCase().match(rx);
          L = a.length;
          while (i < L) {
            if (!b[i]) return 1;
            (a1 = a[i]), (b1 = b[i++]);
            if (a1 !== b1) {
              n = a1 - b1;
              if (!isNaN(n)) return n;
              return a1 > b1 ? 1 : -1;
            }
          }
          return b[i] ? -1 : 0;
        }
      },
      link: function (scope, elem, attrs) {
        if (scope.search.align !== 'left' && scope.search.align !== 'right')
          scope.search.align = 'left';
        scope.$watch('search.providers', updateWithNewProviders);
        scope.$watch('open', ensureBlurOnClose);
        function updateWithNewProviders() {
          if (scope.search.providers && scope.search.providers.length > 0) {
            scope.providers = [];
            for (var i = 0; i < scope.search.providers.length; i++) {
              scope.providers.push({
                label: scope.search.providers[i].label,
                results: [],
                stale: false,
                columns: scope.search.providers[i].columns,
                call: scope.search.providers[i].call,
              });
            }
            scope.considered = null;
            scope.search.selected = null;
          }
        }
        function ensureBlurOnClose(newVal, oldVal) {
          if (newVal === false) {
            $timeout(function () {
              angular.element(elem).find('input')[0].blur();
            });
          }
        }
      },
    };
  });