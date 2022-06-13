/*! RESOURCE: /scripts/app.ngbsm/directive.snPopoverMenu.js */
angular
  .module('sn.ngbsm')
  .directive('snPopoverMenu', function ($rootScope, bsmActions) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {},
      templateUrl:
        '/angular.do?sysparm_type=get_partial&name=sn_popover_menu.xml',
      controller: function ($scope, $element, CONST) {
        var x = -1000;
        var y = -1000;
        $scope.active = false;
        $scope.title = '';
        $scope.options = [];
        $scope.focused = 0;
        $scope.$on('ngbsm.open_menu', function (event, data) {
          $scope.focused = -1;
          var mapH = data.mapH;
          var mapW = data.mapW;
          var tmp_x = data.x;
          var tmp_y = data.y;
          var menuH = data.options.length * 19;
          if (tmp_x + 200 > mapW) x = tmp_x - 203 < 0 ? 0 : tmp_x - 203;
          else x = tmp_x;
          if (tmp_y + menuH > mapH) y = tmp_y - menuH < 0 ? 0 : tmp_y - menuH;
          else y = tmp_y;
          $scope.active = true;
          $scope.title = data.title;
          $scope.options = data.options;
        });
        $scope.keydown = function (e) {
          if (~[38, 40, 27, 9].indexOf(e.keyCode)) {
            e.stopPropagation();
            var options = $element.find('[tabindex].selectable');
            if (e.keyCode === CONST.KEYCODE_DOWN) {
              $scope.focused++;
              if ($scope.focused === options.length) {
                $scope.focused = 0;
              }
              options[$scope.focused].focus();
            } else if (e.keyCode === CONST.KEYCODE_UP) {
              $scope.focused--;
              if ($scope.focused < 0) {
                $scope.focused = options.length - 1;
              }
              options[$scope.focused].focus();
            } else if (e.keyCode === CONST.KEYCODE_ESC) {
              $scope.close();
            } else if (e.keyCode === CONST.KEYCODE_TAB) {
              e.preventDefault();
            }
          }
        };
        $scope.focus = function () {
          $scope.inFocus = true;
        };
        $scope.blur = function () {
          setTimeout(function () {
            if (!$scope.inFocus) {
              $scope.close();
            }
          });
          $scope.inFocus = false;
        };
        $scope.location = function () {
          return {
            top: y - 4 + 'px',
            left: x - 4 + 'px',
          };
        };
        $scope.close = function () {
          $scope.active = false;
        };
        $scope.execute = function (option) {
          $scope.close();
          if (option && option.action) option.action();
        };
      },
    };
  });