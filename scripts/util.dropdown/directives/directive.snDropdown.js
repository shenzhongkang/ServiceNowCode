/*! RESOURCE: /scripts/util.dropdown/directives/directive.snDropdown.js */
angular.module('sn.dropdown').directive('snDropdown', [
  '$timeout',
  function ($timeout) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {
        dropdown: '=data',
        disabled: '=?',
        disable: '=?',
        autoSelect: '=?',
        changed: '=?',
        required: '=?',
        placeholder: '@?',
        labelField: '@?',
        classesField: '@?',
        minimumResultsForSearch: '@?',
        allowClear: '@?',
        srLabel: '@?',
        dropdownId: '@?',
        labelId: '@?',
      },
      template:
        '' +
        '<div class="sn-dropdown-widget dropdown-container" ng-style="{ width: dropdown.width + \'px\' }">' +
        '    <select id="{{dropdownId ? dropdownId : \'sn-dropdown\'}}" aria-hidden="true" class="form-control select2" ng-disabled="isDisabled()">' +
        '        <option></option>' +
        '        <option ng-repeat="option in dropdown.options" ng-class="getClasses(option)" ng-value="$index" ng-disabled="getIsOptionDisabled(option)">{{getLabel(option)}}</option>' +
        '    </select>' +
        '</div>',
      controller: function ($scope) {
        $scope.getClasses = function (option) {
          if ($scope.classesField && option[$scope.classesField])
            return buildClassesObject(option[$scope.classesField]);
          return buildClassesObject(option.classes);
        };
        $scope.getLabel = function (option) {
          if ($scope.labelField && option[$scope.labelField])
            return option[$scope.labelField];
          return option.label;
        };
        $scope.isDisabled = function () {
          return $scope.disabled || $scope.disable ? true : false;
        };
        $scope.isRequired = function () {
          return $scope.required ? true : false;
        };
        $scope.getIsOptionDisabled = function (option) {
          if (angular.isDefined(option.disabled)) {
            return option.disabled;
          }
          return false;
        };
        function buildClassesObject(list) {
          var obj = {};
          if (list) {
            for (var i = 0; i < list.length; i++) obj[list[i]] = true;
          }
          return obj;
        }
      },
      link: function (scope, elem, attrs) {
        var select = elem.children().children()[0];
        jQuery(elem).on('keydown', function (event) {
          if (event.which === 32) {
            event.preventDefault();
            jQuery(select).select2('open');
          }
        });
        if (
          angular.isNumber(scope.dropdown.selected) &&
          scope.dropdown.options[scope.dropdown.selected]
        )
          scope.dropdown.selected =
            scope.dropdown.options[scope.dropdown.selected];
        if (attrs.autoSelect === undefined) {
          elem.attr('auto-select', 'true');
          scope.autoSelect = true;
        }
        scope.$watch('dropdown.options', updateDropdownOptions);
        scope.$watch('dropdown.selected', onAngularChange);
        function updateDropdownOptions() {
          var minimumResultsForSearch = 10;
          if (
            angular.isDefined(scope.minimumResultsForSearch) &&
            !isNaN(parseInt(scope.minimumResultsForSearch))
          )
            minimumResultsForSearch = parseInt(scope.minimumResultsForSearch);
          var picked = false;
          if (scope.dropdown.selected) {
            var index = scope.dropdown.options.indexOf(scope.dropdown.selected);
            if (index >= 0) picked = index;
          }
          if (scope.autoSelect && !picked) {
            if (scope.dropdown.options && scope.dropdown.options.length > 0) {
              var picked = 0;
            }
          }
          $timeout(function () {
            jQuery(select).off('change', onSelect2Change);
            jQuery(select).on('change', onSelect2Change);
            jQuery(window).off('blur', closeSelect2);
            jQuery(window).on('blur', closeSelect2);
            var s2 = jQuery(select).select2({
              minimumResultsForSearch: scope.dropdown.options
                ? scope.dropdown.options.length < minimumResultsForSearch
                  ? -1
                  : minimumResultsForSearch
                : -1,
              allowClear: scope.allowClear ? true : false,
              placeholder: scope.placeholder,
              elementId: attrs.id || (scope.dropdownId ? scope.dropdownId : ''),
              formatResult: function (item) {
                if (scope.dropdown.options[item.id].alternateText)
                  return (
                    '<div>' +
                    item.text +
                    '</div><div>' +
                    scope.dropdown.options[item.id].alternateText +
                    '</div>'
                  );
                return item.text;
              },
            });
            $timeout(function () {
              var id =
                attrs.id ||
                'dropdown-' + (scope.dropdownId ? scope.dropdownId : scope.$id);
              var chosen = jQuery(
                '.select2-container > .select2-choice > .select2-chosen',
                elem[0]
              );
              var label = jQuery('.select2-container > label', elem[0]);
              var focusser = jQuery(
                '.select2-container > .select2-focusser',
                elem[0]
              );
              var inputTag = jQuery(
                '.select2-container .select2-focusser',
                elem[0]
              );
              var ariaLabelledBy = inputTag.attr('aria-labelledby')
                ? inputTag.attr('aria-labelledby')
                : '';
              var ariaLabelledByValue =
                (scope.labelId ? scope.labelId : '') + ' ' + ariaLabelledBy;
              var isAriaRequired =
                scope.dropdown && scope.dropdown.ariaRequired
                  ? scope.dropdown.ariaRequired
                  : false;
              jQuery(select).attr('id', id + '-select');
              var anchorTag = jQuery(
                '.select2-container > .select2-choice',
                elem[0]
              );
              jQuery(anchorTag).attr('id', id + '-anchor');
              anchorTag.attr('aria-hidden', true);
              label.attr('id', id + '-label');
              focusser.attr(
                'aria-labelledby',
                chosen.attr('id') + ' ' + id + '-label'
              );
              focusser.attr('aria-expanded', false);
              inputTag.attr('aria-labelledby', ariaLabelledByValue);
              inputTag.attr('aria-required', isAriaRequired);
              var optionList = jQuery('.select2-results', elem[0]);
              optionList.removeAttr('id').attr('id', id + '-option-list');
              updateOffscreenLabel();
            });
            if (picked !== false) s2.select2('val', picked);
          });
        }
        function closeSelect2(event) {
          jQuery('#select2-drop-mask').click();
        }
        function onSelect2Change(event) {
          var index = event.currentTarget ? event.currentTarget.value : null;
          index = index || event.val;
          $timeout(function () {
            if (index)
              scope.dropdown.selected = scope.dropdown.options[parseInt(index)];
            else scope.dropdown.selected = null;
            updateOffscreenLabel();
          }, 0);
        }
        function onAngularChange() {
          var selected = scope.dropdown.selected;
          var value = scope.dropdown.options
            ? scope.dropdown.options.indexOf(selected)
            : -1;
          if (value < 0) value = null;
          jQuery(select).off('change', onSelect2Change);
          jQuery(select).val(value).trigger('change');
          jQuery(select).on('change', onSelect2Change);
          if (scope.changed && typeof scope.changed === 'function')
            scope.changed(selected);
          updateOffscreenLabel();
        }
        function updateOffscreenLabel() {
          var label = jQuery(
            '.select2-container > label.select2-offscreen',
            elem[0]
          );
          label.text(scope.srLabel ? ', ' + scope.srLabel : '');
        }
      },
    };
  },
]);