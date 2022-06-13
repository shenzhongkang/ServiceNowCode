/*! RESOURCE: /scripts/sn/common/controls/directive.snTableReference.js */
angular
  .module('sn.common.controls')
  .directive('snTableReference', function ($timeout) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      scope: {
        field: '=',
        snChange: '&',
        snDisabled: '=',
      },
      template:
        '<select ng-disabled="snDisabled" style="min-width: 150px;" name="{{::field.name}}" ng-model="fieldValue" ng-model-options="{getterSetter: true}" ng-options="choice.value as choice.label for choice in field.choices"></select>',
      controller: function ($scope) {
        $scope.fieldValue = function (selected) {
          if (angular.isDefined(selected)) {
            $scope.snChange({ newValue: selected });
          }
          return $scope.field.value;
        };
      },
      link: function (scope, element) {
        var initTimeout = null;
        var fireReadyEvent = true;
        var field = scope.field;
        var isOpen = false;
        element.css('opacity', 0);
        function render() {
          var select2Focusser = element.parent().find('.select2-focusser');
          $timeout.cancel(initTimeout);
          initTimeout = $timeout(function () {
            element.css('opacity', 1);
            element.select2('destroy');
            element.select2();
            if (select2Focusser.length > 0) setAccessibilityRoles();
            if (fireReadyEvent) {
              scope.$emit('select2.ready', element);
              fireReadyEvent = false;
            }
          });
        }
        element.bind('select2-open', function () {
          isOpen = true;
          element
            .parent()
            .find('.select2-focusser')
            .attr('aria-expanded', isOpen);
        });
        element.bind('select2-close', function () {
          isOpen = false;
          element
            .parent()
            .find('.select2-focusser')
            .attr('aria-expanded', isOpen);
        });
        scope.$on('select2.ready', function () {
          setAccessibilityRoles();
        });
        function setAccessibilityRoles() {
          var select2Results = element.parent().find('ul.select2-results');
          var select2Focusser = element.parent().find('.select2-focusser');
          var select2Choice = element.parent().find('.select2-choice');
          select2Focusser.removeAttr('aria-labelledby');
          select2Focusser.attr('aria-label', getAriaLabel());
          select2Focusser.attr('aria-required', field.isMandatory());
          select2Focusser.attr('aria-expanded', isOpen);
          select2Focusser.attr('aria-owns', select2Results.attr('id'));
          select2Choice.attr('aria-hidden', true);
        }
        function getAriaLabel() {
          var displayValue = '';
          var label = '';
          label += field.label;
          displayValue = element
            .parent()
            .find('.select2-choice .select2-chosen')
            .text();
          if (displayValue) {
            label += ' ' + displayValue;
          }
          return label;
        }
        scope.$watch('field.displayValue', function (newValue, oldValue) {
          if (newValue !== undefined && newValue != oldValue) {
            render();
          }
        });
        render();
      },
    };
  });
