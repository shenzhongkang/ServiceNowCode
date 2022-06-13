/*! RESOURCE: /scripts/app.ngbsm/directive.snTaskPopover.js */
angular
  .module('sn.ngbsm')
  .directive('snTaskPopover', function ($rootScope, bsmIndicators) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {},
      templateUrl:
        '/angular.do?sysparm_type=get_partial&name=sn_task_popover.xml',
      controller: function ($scope) {
        $scope.active = false;
        $scope.tasks = [];
        $scope.loading = false;
        $scope.target = null;
        $scope.count = 0;
        $scope.position = {
          x: -1000,
          y: -1000,
        };
        $rootScope.$on('ngbsm.view_task_popover', updateAndLoadTasks);
        $scope.close = function () {
          $scope.active = false;
        };
        $scope.offsets = function () {
          return {
            top: $scope.position.y + 50 + 'px',
            left: $scope.position.x + 'px',
          };
        };
        function updateAndLoadTasks(event, data) {
          $scope.target = data.target;
          $scope.count = data.count;
          $scope.position = data.position;
          loadTasks();
        }
        function loadTasks() {
          $scope.tasks = [];
          bsmIndicators.getTasksForCI($scope.target).then(function (data) {
            $scope.tasks = data;
            $scope.active = true;
          });
        }
      },
      link: function (scope, elem, attrs) {
        var element = elem.children(0).children(0);
        var firstHeight = true;
        var firstWidth = true;
        scope.$watch(
          function () {
            return element.css('height');
          },
          heightChanged,
          true
        );
        scope.$watch(
          function () {
            return element.css('width');
          },
          widthChanged,
          true
        );
        function heightChanged(newValue, oldValue) {
          if (newValue !== oldValue || firstHeight) {
            firstHeight = false;
            element.css('top', '-' + Math.round(parseInt(newValue) / 2) + 'px');
          }
        }
        function widthChanged(newValue, oldValue) {
          if (newValue !== oldValue || firstWidth) {
            firstWidth = false;
            element.css('left', '-' + Math.round(parseInt(newValue)) + 'px');
          }
        }
      },
    };
  });