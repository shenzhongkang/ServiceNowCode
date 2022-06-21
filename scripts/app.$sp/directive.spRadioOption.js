/*! RESOURCE: /scripts/app.$sp/directive.spRadioOption.js */
angular.module('sn.$sp').directive('spRadioOption', function (spUtil, $http) {
  var REF_QUAL_ELEMENTS = 'ref_qual_elements';
  function isRefQualElement(field, fieldName) {
    var refQualElements = [];
    if (field.attributes && field.attributes.indexOf(REF_QUAL_ELEMENTS) > -1) {
      var attributes = spUtil.parseAttributes(field.attributes);
      refQualElements = attributes[REF_QUAL_ELEMENTS].split(',');
    }
    return (
      field.reference_qual.indexOf(fieldName) != -1 ||
      refQualElements.indexOf(fieldName) != -1
    );
  }
  return {
    template: '<ng-include src="getTemplateUrl()" />',
    restrict: 'E',
    scope: {
      field: '=',
      getGlideForm: '&glideForm',
      catItemSysId: '=?',
    },
    link: function (scope, element, attrs) {
      var g_form = scope.getGlideForm();
      var field = scope.field;
      var radioButtons = [];
      var valueToRadioButtonMap = {};
      keyCode = Object.freeze({
        RETURN: 13,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
      });
      scope.onButtonLoad = function () {
        var rb = element.find('input[type="radio"]').last();
        radioButtons.push(rb[0]);
        rb.on('keydown', onKeyDown);
        rb.on('click', onClick);
        if (this && this.c && angular.isDefined(this.c.value))
          valueToRadioButtonMap[this.c.value] = rb[0];
      };
      scope.getTemplateUrl = function () {
        return field.choice_direction === 'across'
          ? 'sp_element_radio_across.xml'
          : 'sp_element_radio_down.xml';
      };
      scope.fieldValue = function (newValue, displayValue) {
        if (angular.isDefined(newValue)) {
          g_form.setValue(field.name, newValue, displayValue);
          if (
            newValue !== field.value &&
            valueToRadioButtonMap.hasOwnProperty(field.value)
          )
            setChecked(valueToRadioButtonMap[field.value]);
        }
        return field.value;
      };
      initializeValue();
      g_form.$private.events.on(
        'change',
        function (fieldName, oldValue, newValue) {
          if (fieldName == field.name && newValue !== oldValue)
            getSelectedValueInChoices();
          else if (fieldName == field.dependentField) {
            field.dependentValue = newValue;
            refreshChoiceList();
          } else if (
            typeof field.variable_name !== 'undefined' &&
            field.reference_qual &&
            isRefQualElement(field, fieldName)
          )
            refreshReferenceChoices();
        }
      );
      function getSelectedValueInChoices() {
        var choice;
        Array.isArray(field.choices) &&
          field.choices.some(function (c) {
            if (field.value == c.value) {
              choice = c;
              return choice;
            }
          });
        if (g_choices_show_missing && !choice && field.value !== '') {
          choice = {
            value: field.value,
            label: field.displayValue || field.value,
          };
          field.choices.push(choice);
        }
        return choice;
      }
      function refreshChoiceList() {
        var params = {};
        params.table = g_form.getTableName();
        params.field = field.name;
        params.sysparm_dependent_value = field.dependentValue;
        params.sysparm_type = 'choice_list_data';
        var url = spUtil.getURL(params);
        return $http.get(url).success(function (data) {
          field.choices = [];
          angular.forEach(data.items, function (item) {
            field.choices.push(item);
          });
          selectValueOrNone();
        });
      }
      function selectValueOrNone() {
        var hasSelectedValue = false;
        angular.forEach(field.choices, function (c) {
          if (field.value == c.value) {
            hasSelectedValue = true;
          }
        });
        if (!hasSelectedValue && field.value && field.dependentField) {
          var choice = getSelectedValueInChoices();
          if (choice) {
            g_form.setValue(field.name, choice.value, choice.label);
            refreshChoiceList();
            return;
          }
        }
        if (!hasSelectedValue && field.choices.length > 0)
          g_form.setValue(
            field.name,
            field.choices[0].value,
            field.choices[0].label
          );
      }
      function initializeValue() {
        var isFieldValueInChoiceList = field.choices.some(function (choice) {
          return field.value == choice.value;
        });
        if (!isFieldValueInChoiceList) getSelectedValueInChoices();
      }
      function refreshReferenceChoices() {
        var params = {};
        params['qualifier'] = field.reference_qual;
        params['table'] = field.lookup_table;
        params['sysparm_include_variables'] = true;
        params['variable_ids'] = field.sys_id;
        var getFieldSequence = g_form.$private.options('getFieldSequence');
        if (getFieldSequence) {
          params['variable_sequence1'] = getFieldSequence();
        }
        var itemSysId = g_form.$private.options('itemSysId');
        params['sysparm_id'] = itemSysId;
        params['sysparm_query_refs'] = false;
        var getFieldParams = g_form.$private.options('getFieldParams');
        if (getFieldParams) {
          angular.extend(params, getFieldParams());
        }
        params.sysparm_type = 'sp_ref_list_data';
        var url = spUtil.getURL({ sysparm_type: 'sp_ref_list_data' });
        return $http.post(url, params).then(function (response) {
          if (!response.data) return;
          field.choices = [];
          angular.forEach(response.data.items, function (item) {
            item.label = item.$$displayValue;
            item.value = item.sys_id;
            field.choices.push(item);
          });
          if (field.choices.length === 0) g_form.clearValue(scope.field.name);
          else selectValueOrNone();
        });
      }
      function firstRadioButton() {
        if (radioButtons == null) return null;
        return radioButtons[0];
      }
      function lastRadioButton() {
        if (radioButtons == null) return null;
        return radioButtons[radioButtons.length - 1];
      }
      function onKeyDown() {
        var flag = false;
        switch (event.keyCode) {
          case keyCode.SPACE:
          case keyCode.RETURN:
            setChecked(this);
            flag = true;
            break;
          case keyCode.UP:
          case keyCode.LEFT:
            setCheckedToPreviousItem(this);
            flag = true;
            break;
          case keyCode.DOWN:
          case keyCode.RIGHT:
            setCheckedToNextItem(this);
            flag = true;
            break;
          default:
            break;
        }
        if (flag) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
      function setChecked(currentItem) {
        if (currentItem !== null) {
          currentItem.click();
          currentItem.focus();
        }
      }
      function onClick() {
        for (var i = 0; i < radioButtons.length; i++) {
          radioButtons[i].setAttribute('aria-checked', false);
          radioButtons[i].setAttribute('tabindex', -1);
        }
        this.setAttribute('aria-checked', true);
        this.setAttribute('tabindex', 0);
      }
      function setCheckedToPreviousItem(currentItem) {
        if (currentItem.$$hashKey === firstRadioButton().$$hashKey) {
          setChecked(lastRadioButton());
        } else {
          var currentIndex = getCurrentIndex(currentItem);
          if (currentIndex > 0) setChecked(radioButtons[currentIndex - 1]);
        }
      }
      function setCheckedToNextItem(currentItem) {
        if (currentItem.$$hashKey === lastRadioButton().$$hashKey) {
          setChecked(firstRadioButton());
        } else {
          var currentIndex = getCurrentIndex(currentItem);
          if (currentIndex > -1) setChecked(radioButtons[currentIndex + 1]);
        }
      }
      function getCurrentIndex(currentItem) {
        var index = -1;
        radioButtons.some(function (el, i) {
          if (el.$$hashKey === currentItem.$$hashKey) {
            index = i;
            return true;
          }
        });
        return index;
      }
    },
  };
});
