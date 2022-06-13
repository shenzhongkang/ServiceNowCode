/*! RESOURCE: /scripts/app.ngbsm/directive.snBsmMenu.js */
angular.module('sn.ngbsm').directive('snBsmMenu', function ($timeout, CONST) {
  'use strict';
  return {
    restrict: 'E',
    replace: false,
    scope: {
      menu: '=data',
    },
    templateUrl: '/angular.do?sysparm_type=get_partial&name=sn_menu.xml',
    controller: function ($scope) {
      $scope.considered = 0;
      $scope.open = false;
      $scope.focusIsInMenu = false;
      $scope.menuElements = [];
      $scope.focus = function () {
        $scope.open = true;
        $scope.focusIsInMenu = true;
      };
      $scope.blur = function () {
        $scope.focusIsInMenu = false;
        $timeout(function () {
          if (!$scope.focusIsInMenu) {
            $scope.open = false;
          }
        });
      };
      $scope.selectItem = function (index) {
        angular.element('#sn-menu-item-' + index).focus();
      };
      $scope.clicked = function (event) {
        $scope.considered = -1;
        $scope.open = true;
      };
      $scope.isConsidered = function (index) {
        return index === $scope.considered;
      };
      $scope.consider = function (index) {
        $scope.considered = index;
      };
      $scope.click = function (index) {
        $scope.blur();
        $scope.menu.options[index].action();
      };
      $scope.keydown = function (event) {
        if (isUsedKey(event)) {
          event.stopPropagation();
          event.preventDefault();
          if (event.keyCode === CONST.KEYCODE_UP) {
            if ($scope.considered !== null && $scope.considered > 0)
              $scope.considered--;
            else $scope.considered = $scope.menu.options.length - 1;
            $scope.selectItem($scope.considered);
          } else if (event.keyCode === CONST.KEYCODE_DOWN) {
            if (
              $scope.considered !== null &&
              $scope.considered < $scope.menu.options.length - 1
            )
              $scope.considered++;
            else $scope.considered = 0;
            $scope.selectItem($scope.considered);
          } else if (event.keyCode === CONST.KEYCODE_ESC) {
            $scope.focusIsInMenu = false;
            $scope.blur();
          }
        }
      };
      $scope.iconClass = function (option) {
        var icon = {};
        icon[option.icon] = true;
        return icon;
      };
      $scope.setElement = function (index, elem) {
        $scope.menuElements[index] = elem;
      };
      function isUsedKey(event) {
        if (event.keyCode === CONST.KEYCODE_UP) return true;
        if (event.keyCode === CONST.KEYCODE_DOWN) return true;
        if (event.keyCode === CONST.KEYCODE_ESC) return true;
        return false;
      }
    },
    link: function (scope, elem, attrs) {
      scope.$watch('menu.options', updateMenuOptions);
      function updateMenuOptions() {
        if (scope.menu.options && scope.menu.options.length > 0) {
          scope.considered = null;
        }
      }
    },
  };
});