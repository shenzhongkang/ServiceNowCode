/*! RESOURCE: /scripts/app.ngbsm/directive.snChecklist.js */
angular
  .module('sn.ngbsm')
  .directive('snChecklist', function ($animate, $timeout, bsmIcons) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {
        checklist: '=data',
        dvtag: '@',
        uniqueLabel: '@',
      },
      templateUrl: '/angular.do?sysparm_type=get_partial&name=sn_checklist.xml',
      controller: function ($scope, $element, CONST) {
        $scope.uitype = $element.attr('uitype') || 'checkbox';
        $scope.toggle = function () {
          $scope.checklist.expanded = !$scope.checklist.expanded;
        };
        $scope.hasIcon = function (option) {
          return (
            $scope.checklist.property === 'className' ||
            $scope.checklist.property === 'name'
          );
        };
        $scope.iconPath = function (option) {
          return option.icon.endsWith('.svg')
            ? option.icon
            : bsmIcons.get(option.icon);
        };
        $scope.checkboxToggle = function (event, key, scope) {
          scope = scope || $scope;
          if (event.keyCode === CONST.KEYCODE_SPACE) {
            scope[key] = !scope[key];
            event.preventDefault();
          }
        };
        $scope.getUniqueLabel = function (label, group) {
          if (!(label && group)) {
            return 'dv_label_unavailable';
          }
          group = group.replace(/\s+/g, '');
          label = label.replace(/\s+/g, '');
          return 'dv_label_' + group + '_' + label + '_' + $scope.uniqueLabel;
        };
      },
      link: function (scope, elem, attrs) {
        scope.$watchCollection('checklist.options', onChecklistOptionsChanged);
        scope.$watch('checklist.expanded', onExpandedStateChanged);
        $timeout(onExpandedStateChanged, 1000);
        function onChecklistOptionsChanged() {
          $timeout(onExpandedStateChanged);
        }
        function onExpandedStateChanged() {
          var holder = angular.element(elem[0].children[1]);
          var measure = angular.element(elem[0].children[1].children[0]);
          $animate.enabled(false, holder);
          if (scope.checklist.expanded) {
            holder.css('display', 'block');
            holder.css('height', measure.css('height'));
          } else {
            holder.css('height', '0px');
            $timeout(function () {
              holder.css('display', 'none');
            }, 350);
          }
        }
      },
    };
  });