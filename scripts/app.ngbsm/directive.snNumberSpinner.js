/*! RESOURCE: /scripts/app.ngbsm/directive.snNumberSpinner.js */
angular.module('sn.ngbsm').directive('snNumberSpinner', function () {
  'use strict';
  function filterInt(value) {
    if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) return Number(value);
    return NaN;
  }
  return {
    restrict: 'E',
    replace: false,
    scope: {
      number: '=data',
      id: '@id',
    },
    templateUrl:
      '/angular.do?sysparm_type=get_partial&name=sn_number_spinner.xml',
    controller: function ($scope, $timeout, CONST) {
      $scope.id = $scope.id || 'number-spinner-' + scope.$id;
      $scope.$watch('current', function () {
        $scope.$root.$broadcast('bsm_spinner_value_change', $scope.current);
      });
      $scope.alert = false;
      var timer;
      $scope.$root.$on('bsm_spinner_value_set', function (event, value) {
        $scope.current = value;
        $scope.validate();
      });
      $scope.increment = function () {
        if (!$scope.valid) $scope.current = $scope.number;
        if ($scope.current < $scope.max) $scope.current += 1;
        $scope.validate();
      };
      $scope.decrement = function () {
        if (!$scope.valid) $scope.current = $scope.number;
        if ($scope.current > $scope.min) $scope.current -= 1;
        $scope.validate();
      };
      $scope.maximize = function () {
        if (!$scope.valid) $scope.current = $scope.number;
        $scope.current = $scope.max;
        $scope.validate();
      };
      $scope.minimize = function () {
        if (!$scope.valid) $scope.current = $scope.number;
        $scope.current = $scope.min;
        $scope.validate();
      };
      $scope.reset = function () {
        $scope.current = $scope.start;
        $scope.validate();
      };
      $scope.revert = function () {
        if (!$scope.valid) $scope.current = $scope.number;
        $scope.validate();
      };
      $scope.atMinimum = function () {
        return $scope.number <= $scope.min;
      };
      $scope.atMaximum = function () {
        return $scope.number >= $scope.max;
      };
      $scope.validate = function () {
        var val = ($scope.current = filterInt($scope.current));
        if (val !== NaN && val >= $scope.min && val <= $scope.max) {
          $scope.number = $scope.current;
          $scope.valid = true;
        } else $scope.valid = false;
      };
      $scope.keydown = function (event) {
        event.stopPropagation();
        if (event.keyCode === CONST.KEYCODE_UP) $scope.increment();
        else if (event.keyCode === CONST.KEYCODE_DOWN) $scope.decrement();
      };
    },
    link: function (scope, elem, attrs) {
      var defaultMin = Number.MIN_VALUE;
      var defaultMax = Number.MAX_VALUE;
      var defaultStart = 0;
      if (attrs['max'] && filterInt(attrs['max']) !== NaN)
        scope.max = filterInt(attrs['max']);
      else scope.max = defaultMax;
      if (attrs['min'] && filterInt(attrs['min']) !== NaN)
        scope.min = filterInt(attrs['min']);
      else scope.min = defaultMin;
      if (attrs['start'] && filterInt(attrs['start']) !== NaN)
        scope.start = filterInt(attrs['start']);
      else scope.start = defaultStart;
      if (filterInt(scope.number) !== NaN)
        scope.current = filterInt(scope.number);
      else {
        scope.current = scope.start;
        scope.number = scope.start;
      }
      scope.valid = true;
    },
  };
});