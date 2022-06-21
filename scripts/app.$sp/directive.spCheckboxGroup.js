/*! RESOURCE: /scripts/app.$sp/directive.spCheckboxGroup.js */
angular
  .module('sn.$sp')
  .directive(
    'spCheckboxGroup',
    function ($sce, $timeout, spLabelHelper, spAriaUtil, i18n) {
      'use strict';
      return {
        restrict: 'E',
        templateUrl: 'sp_checkbox_group.xml',
        scope: {
          getGlideForm: '&glideForm',
          containers: '=containers',
          formModel: '=formModel',
          name: '=',
        },
        controllerAs: 'c',
        link: function ($scope, element, attrs, ngModelCtrl) {
          $timeout(function () {
            $scope.labelElement = element.find('legend');
          });
          $scope.syncFieldAriaLabel = spLabelHelper.syncFieldAriaLabel;
          $scope.getFieldAriaLabel = spLabelHelper.getFieldAriaLabel;
          $scope.accessible = spAriaUtil.isAccessibilityEnabled();
        },
        controller: function ($scope) {
          var c = this;
          var field;
          $scope.field = $scope.formModel._fields[$scope.name];
          field = $scope.field;
          $scope.getVarID = function (v) {
            if (typeof v.name != 'undefined' && hasVariablePrefix(v.name))
              return v.name.substring(3);
            return v.name;
          };
          $scope
            .getGlideForm()
            .$private.events.on(
              'propertyChange',
              function (type, fieldName, propertyName, propertyValue) {
                if ($scope.field._children.indexOf(fieldName) == -1) return;
                if (propertyName === 'readonly')
                  $scope.syncFieldAriaLabel($scope);
              }
            );
          $scope.trustedHTML = function (html) {
            return $sce.trustAsHtml(html);
          };
          function hasVariablePrefix(v) {
            return v.indexOf('IO:') == 0;
          }
        },
      };
    }
  );
