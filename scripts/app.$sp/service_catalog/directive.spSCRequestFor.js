/*! RESOURCE: /scripts/app.$sp/service_catalog/directive.spSCRequestFor.js */
angular
  .module('sn.$sp')
  .directive('spScRequestFor', function ($rootScope, i18n) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      templateUrl: 'sp_element_sc_request_for.xml',
      scope: {
        field: '=',
        formModel: '=',
        getGlideForm: '&glideForm',
      },
      controller: function ($scope, $timeout) {
        $scope.toggleUserSelect = function () {
          if (
            !$scope.sn_sc_also_request_for.value ||
            $scope.sn_sc_also_request_for.value.length == 0
          ) {
            $scope.showAlsoRequestFor = !$scope.showAlsoRequestFor;
            $scope.showList = !$scope.showList;
          } else {
            $scope.showList = !$scope.showList;
            $scope.showLess = !$scope.showLess;
          }
          var alsoRequestForButton = document.getElementById(
            'also_request_for_button'
          );
          if ($scope.showAlsoRequestFor) {
            $timeout(function () {
              if (alsoRequestForButton != null)
                $scope.actions.isAlsoRequestForExpanded = true;
              var alsoRequestForElement = document.getElementById(
                's2id_sp_formfield_sn_sc_also_request_for'
              );
              if (alsoRequestForElement != null) {
                var inputElement =
                  alsoRequestForElement.getElementsByClassName('select2-input');
                if (inputElement.length > 0) inputElement[0].focus();
              }
            }, 100);
          } else {
            if (alsoRequestForButton != null)
              $scope.actions.isAlsoRequestForExpanded = false;
          }
        };
      },
      link: function ($scope) {
        function init() {
          $scope.sn_sc_also_request_for = {
            ed: {
              reference: $scope.field.ed.reference,
              qualifier: $scope.field.ed.qualifier,
              searchField: $scope.field.ed.searchField,
              defaultOperator: $scope.field.ed.defaultOperator,
            },
            value: [],
            name: 'sn_sc_also_request_for',
            label: i18n.getMessage('Also request for'),
            parent: $scope.field,
            attributes: $scope.field.attributes,
            placeholder: i18n.getMessage('Request for multiple users'),
            _cat_variable: true,
            isMandatory: function () {
              return false;
            },
            display_value_list: [],
          };
          $scope.actions = { isAlsoRequestForExpanded: false };
        }
        $scope.alsoRequestForEnabled = function () {
          return (
            !$scope.formModel.native_mobile &&
            !$scope.formModel.isCartItem &&
            !$scope.formModel.hideAlsoRequestFor &&
            $scope.field.also_request_for
          );
        };
        if ($scope.alsoRequestForEnabled()) init();
        if ($scope.alsoRequestForEnabled()) {
          $scope
            .getGlideForm()
            .$private.events.on(
              'propertyChange',
              function (type, fieldName, propertyName, propertyValue) {
                if (
                  type == 'FIELD' &&
                  fieldName == $scope.field.name &&
                  propertyName == 'readonly'
                )
                  setReadonly(propertyValue);
              }
            );
        }
        function setReadonly(readonly) {
          if (readonly) {
            $scope.disabled = true;
            if ($scope.sn_sc_also_request_for.value.length == 0) {
              $scope.showAlsoRequestFor = false;
              $scope.showList = false;
              $scope.showLess = false;
            } else {
              $scope.showLess = true;
              $scope.showList = false;
            }
            return;
          }
          $scope.disabled = false;
          if ($scope.sn_sc_also_request_for.value.length == 0) return;
          $scope.showLess = false;
          $scope.showList = true;
        }
        if (
          $scope.getGlideForm().isReadOnly($scope.field.name) &&
          $scope.alsoRequestForEnabled()
        )
          setReadonly(true);
      },
    };
  });
