/*! RESOURCE: /scripts/sn/common/clientScript/catalogVariableHandler.js */
(function (exports) {
  'use strict';
  var scConf = {
    MULTI_ROW_TYPE: 'one_to_many',
    CONTAINER: 'container',
    CHECKBOX: 'boolean',
    CHECKBOX_MANDATORY: 'boolean_confirm',
    CHECKBOX_CONTAINER: 'checkbox_container',
    RICH_TEXT_LABEL: 'rich_text_label',
    LABEL: 'label',
    MASKED: 'masked',
    STRING: 'string',
    MULTIPLE_CHOICE: 'multiple_choice',
    DEFAULT: 'default',
    CAT_VARIABLE: '_cat_variable',
  };
  function _firePropertyChangeEvent(gForm, name, property, value) {
    gForm.$private.events.propertyChange('FIELD', name, property, value);
  }
  function setPrivateProperty(gForm, field, property, value) {
    field['_' + property] = value;
    _firePropertyChangeEvent(gForm, field.name, property, value);
  }
  function isContainerType(field) {
    return field.type == scConf.CONTAINER;
  }
  function isCheckboxEmpty(value) {
    return (
      typeof value === 'undefined' ||
      value === null ||
      value == 'false' ||
      value == ''
    );
  }
  function canHideOrDisableCheckboxContainer(context, field) {
    if (!field._mandatory || _isCheckboxGroupMandatorySatisfied(context, field))
      return true;
    return false;
  }
  function canHideOrDisableContainer(context, field) {
    if (
      field.type == scConf.CONTAINER &&
      field.containerType == scConf.CHECKBOX_CONTAINER
    )
      return canHideOrDisableCheckboxContainer(context, field);
    if (field._children) {
      for (var i = 0; i < field._children.length; i++) {
        if (!canHideOrDisable(context, context.getField(field._children[i])))
          return false;
      }
    }
    return true;
  }
  function canHideOrDisable(context, field) {
    if (isContainerType(field))
      return canHideOrDisableContainer(context, field);
    if (field.type == scConf.CHECKBOX) {
      return canHideOrDisableCheckbox(context, field);
    } else if (
      glideFormFieldFactory.isMandatory(field) &&
      !glideFormFieldFactory.hasValue(field)
    )
      return false;
    return true;
  }
  function canHideOrDisableCheckbox(context, field) {
    var parent = context.getField(field._parent);
    if (
      !parent._mandatory ||
      _isCheckboxGroupMandatorySatisfied(context, parent)
    )
      return true;
    var visibleEditableCheckboxes = (parent._children || [])
      .map(context.getField)
      .filter(function (child) {
        return child._visible && !child._readonly;
      });
    if (visibleEditableCheckboxes.length == 1)
      return field !== visibleEditableCheckboxes[0];
    return visibleEditableCheckboxes.length > 1;
  }
  function _isCheckboxGroupMandatorySatisfied(context, field) {
    if (
      field.type !== scConf.CONTAINER ||
      field.containerType !== scConf.CHECKBOX_CONTAINER
    )
      return false;
    if (field._children) {
      for (var i = 0; i < field._children.length; i++) {
        var child = context.getField(field._children[i]);
        if (!isCheckboxEmpty(child.value)) return true;
      }
    }
    return false;
  }
  function walkToRootAndSetVisibility(context, field, isVisible) {
    if (!isContainerType(field)) return;
    if (!isVisible) {
      if (field._children) {
        for (var i = 0; i < field._children.length; i++) {
          if (context.g_form.isVisible(field._children[i])) return false;
        }
      }
      context.g_form.setVisible(field.name, isVisible);
      if (typeof field._parent == 'string' && context.getField(field._parent))
        walkToRootAndSetVisibility(
          context,
          context.getField(field._parent),
          isVisible
        );
      setPrivateProperty(context.g_form, field, 'cascade_hidden', true);
      return;
    } else {
      if (field._cascade_hidden || !canHideOrDisableContainer(context, field)) {
        setPrivateProperty(context.g_form, field, 'cascade_hidden', false);
        context.g_form.setVisible(field.name, isVisible);
        if (typeof field._parent == 'string' && context.getField(field._parent))
          walkToRootAndSetVisibility(
            context,
            context.getField(field._parent),
            isVisible
          );
      }
    }
  }
  var checkboxOverloads = {
    visible: function (context, field) {
      Object.defineProperty(field, 'visible', {
        set: function (isVisible) {
          if (!isVisible && !canHideOrDisableCheckbox(context, field)) {
            return;
          }
          field._visible = isVisible;
          if (typeof field._parent != 'undefined' && field._parent) {
            var parent = context.getField(field._parent);
            if (isVisible && !parent._visible && !parent._cascade_hidden)
              return;
            if (!isVisible) {
              if (
                parent._mandatory &&
                !_isCheckboxGroupMandatorySatisfied(context, parent)
              ) {
                var visibleCheckboxes = (parent._children || [])
                  .map(context.getField)
                  .filter(function (child) {
                    return child._visible;
                  });
                if (visibleCheckboxes.length > 0) return;
              }
              return walkToRootAndSetVisibility(context, parent, false);
            }
            setPrivateProperty(context.g_form, parent, 'visible', isVisible);
            setPrivateProperty(
              context.g_form,
              parent,
              'cascade_hidden',
              !isVisible
            );
            if (typeof parent._parent != 'undefined' && parent._parent)
              walkToRootAndSetVisibility(
                context,
                context.getField(parent._parent),
                isVisible
              );
          }
        },
        get: function () {
          return field._visible;
        },
        configurable: true,
      });
    },
    readOnly: function (context, field) {
      Object.defineProperty(field, 'readonly', {
        set: function (isReadonly) {
          if (isReadonly && !canHideOrDisableCheckbox(context, field))
            return false;
          if (!field.sys_readonly) {
            field._readonly = isReadonly;
          }
          var parent = context.getField(field._parent);
          if (parent._cascade_readonly) {
            setPrivateProperty(
              context.g_form,
              parent,
              'cascade_readonly',
              false
            );
            setPrivateProperty(context.g_form, parent, 'readonly', false);
          }
        },
        get: function () {
          return field.sys_readonly || field._readonly;
        },
        configurable: true,
      });
    },
    mandatory: function (context, field) {
      Object.defineProperty(field, 'mandatory', {
        set: function (isMandatory) {
          var checkboxContainer = context.getField(field._parent);
          if (isMandatory && isCheckboxEmpty(field.value)) {
            field._mandatory = isMandatory;
            setPrivateProperty(
              context.g_form,
              checkboxContainer,
              'mandatory',
              isMandatory
            );
            var groupSatisfied = _isCheckboxGroupMandatorySatisfied(
              context,
              checkboxContainer
            );
            if (!checkboxContainer._visible && groupSatisfied) {
              return;
            }
            if (!groupSatisfied) {
              if (!field._visible) field._visible = true;
              if (field._readonly) field._readonly = false;
            }
            setPrivateProperty(
              context.g_form,
              checkboxContainer,
              'visible',
              true
            );
            setPrivateProperty(
              context.g_form,
              checkboxContainer,
              'readonly',
              false
            );
            if (
              typeof checkboxContainer._parent != 'undefined' &&
              checkboxContainer._parent
            )
              walkToRootAndSetVisibility(
                context,
                context.getField(checkboxContainer._parent),
                true
              );
          }
          field._mandatory = isMandatory;
          if (isMandatory) {
            setPrivateProperty(
              context.g_form,
              checkboxContainer,
              'mandatory',
              true
            );
            return;
          }
          for (var i = 0; i < (checkboxContainer._children || []).length; i++) {
            if (context.getField(checkboxContainer._children[i])._mandatory) {
              setPrivateProperty(
                context.g_form,
                checkboxContainer,
                'mandatory',
                true
              );
              return;
            }
          }
          setPrivateProperty(
            context.g_form,
            checkboxContainer,
            'mandatory',
            isMandatory
          );
          checkboxContainer.isInvalid = false;
          _firePropertyChangeEvent(
            context.g_form,
            checkboxContainer.name,
            'isInvalid',
            false
          );
        },
        get: function () {
          return field._mandatory;
        },
        configurable: true,
      });
    },
  };
  var checkboxContainerOverloads = {
    visible: function (context, field) {
      Object.defineProperty(field, 'visible', {
        set: function (isVisible) {
          if (isVisible) {
            if (!field._visible && field._cascade_hidden) {
              return;
            }
          } else {
            if (!canHideOrDisableCheckboxContainer(context, field)) return;
          }
          field._visible = isVisible;
          field._cascade_hidden = false;
          if (typeof field._parent != 'undefined' && field._parent) {
            walkToRootAndSetVisibility(
              context,
              context.getField(field._parent),
              isVisible
            );
          }
        },
        get: function () {
          return field._visible;
        },
        configurable: true,
      });
    },
    readOnly: function (context, field) {
      Object.defineProperty(field, 'readonly', {
        set: function (isReadonly) {
          if (
            isReadonly &&
            !canHideOrDisableCheckboxContainer(context, field)
          ) {
            return;
          }
          if (field._children) {
            for (var i = 0; i < field._children.length; i++) {
              context.g_form.setReadOnly(field._children[i], isReadonly);
            }
          }
          if (!field.sys_readonly) {
            field._readonly = isReadonly;
            field._cascade_readonly = true;
          }
        },
        get: function () {
          return field.sys_readonly || field._readonly;
        },
        configurable: true,
      });
    },
    mandatory: function (context, field) {
      if (field.render_label) {
        if (field._children) {
          for (var i = 0; i < field._children.length; i++) {
            if (context.getField(field._children[i]).mandatory) {
              field._mandatory = true;
              break;
            }
          }
        }
      } else {
        if (field._children) {
          var childCheckbox = context.getField(field._children[0]);
          if (childCheckbox && childCheckbox.mandatory) field._mandatory = true;
        }
      }
      Object.defineProperty(field, 'mandatory', {
        set: function (isMandatory) {
          var forceOpenChildren =
            isMandatory && !_isCheckboxGroupMandatorySatisfied(context, field);
          if (field._children) {
            for (var i = 0; i < field._children.length; i++) {
              var child = context.getField(field._children[i]);
              if (forceOpenChildren) {
                setPrivateProperty(context.g_form, child, 'visible', true);
                setPrivateProperty(context.g_form, child, 'readonly', false);
              }
              context.g_form.setMandatory(child.name, isMandatory);
            }
          }
          field._mandatory = isMandatory;
        },
        get: function () {
          return field._mandatory;
        },
        configurable: true,
      });
    },
    label: function (context, field) {
      var render_label = field.render_label || field.displayTitle;
      if (render_label) return;
      Object.defineProperty(field, 'label', {
        get: function () {
          var child = context.getField((field._children || [])[0]) || {};
          return child.label;
        },
        configurable: true,
      });
    },
    value: function (context, field) {
      Object.defineProperty(field, 'value', {
        set: function (value) {
          return;
        },
        get: function () {
          if (
            field._mandatory &&
            _isCheckboxGroupMandatorySatisfied(context, field)
          )
            return 'true';
          return this._mandatory ? '' : 'false';
        },
        configurable: true,
      });
    },
  };
  var containerStartOverloads = {
    visible: function (context, field) {
      Object.defineProperty(field, 'visible', {
        set: function (isVisible) {
          if (isVisible) {
            if (!field._visible && field._cascade_hidden) {
              return;
            }
          } else {
            if (!canHideOrDisableContainer(context, field)) {
              return;
            }
          }
          field._visible = isVisible;
          field._cascade_hidden = false;
          if (typeof field._parent != 'undefined' && field._parent)
            walkToRootAndSetVisibility(
              context,
              context.getField(field._parent),
              isVisible
            );
        },
        get: function () {
          return field._visible;
        },
        configurable: true,
      });
    },
    invalid: function (context, field) {
      Object.defineProperty(field, 'isInvalid', {
        set: function (isInvalid) {
          return;
        },
        get: function () {
          return false;
        },
        configurable: true,
      });
    },
    mandatory: function (context, field) {
      Object.defineProperty(field, 'mandatory', {
        set: function (isMandatory) {
          field._mandatory = isMandatory;
          var canHideContainer = true;
          if (field._children) {
            for (var i = 0; i < field._children.length; i++) {
              var child = context.getField(field._children[i]);
              context.g_form.setMandatory(child.name, isMandatory);
              canHideContainer =
                canHideContainer && canHideOrDisable(context, child);
            }
          }
          if (isMandatory) {
            if (!field._visible && canHideContainer) {
              return;
            }
            if (typeof field._parent != 'undefined' && field._parent)
              walkToRootAndSetVisibility(
                context,
                context.getField(field._parent),
                true
              );
          }
        },
        get: function () {
          if (field._children) {
            for (var i = 0; i < field._children.length; i++) {
              var child = context.getField(field._children[i]);
              if (context.g_form.isMandatory(child.name)) return true;
            }
          }
          return field._mandatory;
        },
        configurable: true,
      });
    },
    readOnly: function (context, field) {
      Object.defineProperty(field, 'readonly', {
        set: function (isReadonly) {
          if (field._children) {
            for (var i = 0; i < field._children.length; i++) {
              var child = context.getField(field._children[i]);
              if (
                isContainerType(child) ||
                !isReadonly ||
                (isReadonly && canHideOrDisable(context, child))
              ) {
                if (child.sys_readonly) continue;
                child.readonly = isReadonly;
                _firePropertyChangeEvent(
                  context.g_form,
                  child.name,
                  'readonly',
                  isReadonly
                );
              }
            }
          }
          if (!field.sys_readonly) {
            field._readonly = isReadonly;
          }
        },
        get: function () {
          return field.sys_readonly || field._readonly;
        },
        configurable: true,
      });
    },
    value: function (context, field) {
      Object.defineProperty(field, 'value', {
        set: function (value) {
          return;
        },
        get: function () {
          if (field._children) {
            for (var i = 0; i < field._children.length; i++) {
              var child = context.getField(field._children[i]);
              if (glideFormFieldFactory.hasValue(child)) return 'true';
            }
          }
          return this.mandatory ? 'true' : '';
        },
        configurable: true,
      });
    },
  };
  var labelOverloads = {
    mandatory: function (context, field) {
      Object.defineProperty(field, 'mandatory', {
        set: function (isMandatory) {
          console.log("setMandatory not applicable for 'Label' variable type");
          return;
        },
        configurable: true,
      });
    },
    value: function (context, field) {
      Object.defineProperty(field, 'value', {
        set: function (value) {
          console.log("setValue not applicable for 'Label' variable type");
          return;
        },
        get: function () {
          return '';
        },
        configurable: true,
      });
    },
  };
  var maskedOverloads = {
    value: function (context, field) {
      field._value = field.value;
      Object.defineProperty(field, 'value', {
        set: function (value) {
          field._value = value;
          if (!!field.useConfirmation) {
            field.isInvalid = false;
            field.confirmPassword = value;
            field._confirmationValue = value;
          }
        },
        get: function () {
          return field._value;
        },
        configurable: true,
      });
    },
    confirmationValue: function (context, field) {
      if (typeof field.confirmationValue === 'undefined')
        field._confirmationValue = field.value;
      else field._confirmationValue = field.confirmationValue;
      Object.defineProperty(field, 'confirmationValue', {
        set: function (confirmationValue) {
          field._confirmationValue = confirmationValue;
          if (field.value === confirmationValue) field.isInvalid = false;
          else field.isInvalid = true;
        },
        get: function () {
          return field._confirmationValue;
        },
        configurable: true,
      });
    },
  };
  var multipleChoiceOverloads = {
    displayValue: function (context, field) {
      field._displayValue = field.displayValue;
      Object.defineProperty(field, 'displayValue', {
        set: function (displayValue) {
          if (typeof displayValue === 'undefined') displayValue = field.value;
          if (field.choices && displayValue === field.value) {
            var items = field.choices.items || field.choices;
            var valueStr = String(field.value);
            for (var i = 0; i < items.length; i++) {
              var choice = items[i];
              if (String(choice.value) === valueStr) {
                displayValue = choice.displayValue || choice.label;
                break;
              }
            }
          }
          field._displayValue = displayValue;
        },
        get: function () {
          return field._displayValue;
        },
      });
    },
  };
  var multiRowValueOverloads = {
    value: function (context, field) {
      field._value =
        field.value && typeof field.value === 'string'
          ? JSON.parse(field.value)
          : field.value;
      Object.defineProperty(field, 'value', {
        set: function (value) {
          handleMultiRowFieldProperty(field, '_value', value);
        },
        get: function () {
          if (field._value && field._value.length > 0)
            return typeof field._value === 'string'
              ? field._value
              : JSON.stringify(field._value);
          else return '';
        },
        configurable: true,
      });
    },
    displayValue: function (context, field) {
      field._displayValue =
        field.displayValue && typeof field.displayValue === 'string'
          ? JSON.parse(field.displayValue)
          : field.displayValue;
      Object.defineProperty(field, 'displayValue', {
        set: function (displayValue) {
          handleMultiRowFieldProperty(field, '_displayValue', displayValue);
        },
        get: function () {
          if (field._displayValue && field._displayValue.length > 0)
            return typeof field._displayValue === 'string'
              ? field._displayValue
              : JSON.stringify(field._displayValue);
          else return '';
        },
        configurable: true,
      });
    },
  };
  function handleMultiRowFieldProperty(field, property, val) {
    if (val == '') {
      field[property] = [];
      return;
    }
    var data = [];
    if (Array.isArray(val)) {
      try {
        data = JSON.stringify(val);
      } catch (e) {
        _logWarn('JSON parse error', 'Invalid value for table variable');
        return;
      }
    } else if (typeof val != 'string') {
      _logWarn('Invalid Input', 'Invalid value for table variable');
      return;
    }
    var uniqueColumnData = {};
    var fieldsMeta = field.fields;
    for (var index in fieldsMeta) {
      if (fieldsMeta[index].unique)
        uniqueColumnData[fieldsMeta[index].name] = fieldsMeta[index].label;
    }
    var parsedValue = JSON.parse(val);
    if (
      !isMaxRowExceeded(field.maxRows, parsedValue, field.label) &&
      !hasDuplicateColumnData(uniqueColumnData, parsedValue)
    ) {
      field[property] = parsedValue;
    }
  }
  function hasDuplicateColumnData(uniqueColumnNames, value) {
    if (uniqueColumnNames && value) {
      var duplicateUniqueFields = _getDuplicateFields(uniqueColumnNames, value);
      if (duplicateUniqueFields.length > 0) {
        _logWarn(
          'Duplicate Data',
          'Some fields are not unique: ' + duplicateUniqueFields.join(', ')
        );
        return true;
      }
    }
    return false;
  }
  function _getDuplicateFields(uniqueColumnNames, value) {
    var uniqueColumnData = new Map();
    var duplicateUniqueFields = new Set();
    var duplicateUniqueFieldsArray = [];
    for (var name in uniqueColumnNames) {
      uniqueColumnData.set(name, new Map());
    }
    if (Object.keys(uniqueColumnNames).length > 0) {
      if (Array.isArray(value) && value.length > 0) {
        for (var i = 0; i < value.length; i++) {
          var row = value[i];
          if (row !== null && typeof row === 'object') {
            for (var uniqueColumnName in uniqueColumnNames) {
              var columnValue = row[uniqueColumnName];
              if (columnValue) {
                columnValue = columnValue.toString().toLowerCase();
                if (!uniqueColumnData.get(uniqueColumnName).has(columnValue))
                  uniqueColumnData.get(uniqueColumnName).set(columnValue, true);
                else
                  duplicateUniqueFields.add(
                    uniqueColumnNames[uniqueColumnName]
                  );
              }
            }
          }
        }
      }
    }
    if (duplicateUniqueFields) {
      duplicateUniqueFields.forEach(function (element) {
        duplicateUniqueFieldsArray.push(element);
      });
    }
    return duplicateUniqueFieldsArray;
  }
  function _logWarn(code, msg) {
    if (console && console.warn) {
      console.warn('(g_form) [' + code + '] ' + msg);
    }
  }
  function isMaxRowExceeded(rowLimit, value, varName) {
    if (value && value.length > rowLimit) {
      _logWarn(
        'Maximum Row Limit Exceeded',
        'The number of rows specified in the multi-row variable set ' +
          varName +
          ' exceeds the maximum limit of: ' +
          rowLimit
      );
      return true;
    }
    return false;
  }
  var defaultOverloads = {
    visible: function (context, field) {
      Object.defineProperty(field, 'visible', {
        set: function (isVisible) {
          field._visible = isVisible;
          if (typeof field._parent != 'undefined' && field._parent) {
            walkToRootAndSetVisibility(
              context,
              context.getField(field._parent),
              isVisible
            );
          }
        },
        get: function () {
          return field._visible;
        },
        configurable: true,
      });
    },
    mandatory: function (context, field) {
      Object.defineProperty(field, 'mandatory', {
        set: function (isMandatory) {
          if (field.sys_readonly) return;
          field._mandatory = isMandatory;
          if (typeof field._parent != 'undefined' && field._parent) {
            walkToRootAndSetVisibility(
              context,
              context.getField(field._parent),
              true
            );
          }
        },
        get: function () {
          return field._mandatory;
        },
        configurable: true,
      });
    },
  };
  function _isFieldHandler(field) {
    return field.is_handler === true;
  }
  function _isVariable(field) {
    return field[scConf.CAT_VARIABLE] === true;
  }
  function _createFieldHandler(field) {
    if (_isFieldHandler(field)) {
      return field;
    }
    field.is_handler = true;
    field._visible = field.visible;
    field._readonly = field.readonly;
    field._mandatory = field.mandatory;
    return field;
  }
  function create(context, field) {
    if (!_isVariable(field)) {
      return null;
    }
    if (_isFieldHandler(field)) {
      return field;
    }
    field = _createFieldHandler(field);
    var type = field.type;
    if (type === scConf.CONTAINER) {
      if (field.containerType === scConf.CHECKBOX_CONTAINER) {
        type = field.containerType;
      } else if (field.containerType === scConf.MULTI_ROW_TYPE) {
        type = scConf.MULTI_ROW_TYPE;
      }
    }
    switch (type) {
      case scConf.CONTAINER:
        containerStartOverloads.mandatory(context, field);
        containerStartOverloads.visible(context, field);
        containerStartOverloads.value(context, field);
        containerStartOverloads.readOnly(context, field);
        containerStartOverloads.invalid(context, field);
        break;
      case scConf.CHECKBOX_CONTAINER:
        checkboxContainerOverloads.value(context, field);
        checkboxContainerOverloads.readOnly(context, field);
        checkboxContainerOverloads.visible(context, field);
        checkboxContainerOverloads.mandatory(context, field);
        checkboxContainerOverloads.label(context, field);
        break;
      case scConf.CHECKBOX:
        checkboxOverloads.visible(context, field);
        checkboxOverloads.mandatory(context, field);
        checkboxOverloads.readOnly(context, field);
        break;
      case scConf.MULTI_ROW_TYPE:
        multiRowValueOverloads.value(context, field);
        multiRowValueOverloads.displayValue(context, field);
        defaultOverloads.visible(context, field);
        defaultOverloads.mandatory(context, field);
        break;
      case scConf.RICH_TEXT_LABEL:
      case scConf.LABEL:
        labelOverloads.mandatory(context, field);
        defaultOverloads.visible(context, field);
        labelOverloads.value(context, field);
        break;
      case scConf.MASKED:
        defaultOverloads.mandatory(context, field);
        defaultOverloads.visible(context, field);
        maskedOverloads.value(context, field);
        if (field.useConfirmation) {
          maskedOverloads.confirmationValue(context, field);
        }
      case scConf.MULTIPLE_CHOICE:
        defaultOverloads.visible(context, field);
        defaultOverloads.mandatory(context, field);
        multipleChoiceOverloads.displayValue(context, field);
      default:
        defaultOverloads.visible(context, field);
        defaultOverloads.mandatory(context, field);
        break;
    }
    return field;
  }
  exports.catalogVariableHandler = {
    create: create,
  };
})(window);
