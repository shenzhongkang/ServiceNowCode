/*! RESOURCE: /scripts/app.$sp/service_catalog/service.spSCFieldPropertyDecorator.js */
angular
  .module('sn.$sp')
  .factory(
    'spSCFieldPropertyDecorator',
    function (
      snAttachmentHandler,
      spScUtil,
      spSCConf,
      glideFormFieldFactory,
      $rootScope,
      $http,
      i18n
    ) {
      var PROPERTY_CHANGE_FIELD = 'FIELD';
      function isContainerType(field) {
        return (
          field.type == spSCConf.CONTAINER_START ||
          field.type == spSCConf.CHECKBOX_CONTAINER
        );
      }
      function isCheckboxEmpty(value) {
        return value == 'false' || value == '';
      }
      return {
        decorate: decorateCatalogFields,
      };
      function decorateCatalogFields(fields, g_form) {
        var _fields = fields;
        _addValidationScript(fields, g_form);
        _fields.forEach(function (field) {
          if (!spScUtil.isCatalogVariable(field)) return;
          field._visible = field.visible;
          field._readonly = field.readonly;
          field._mandatory = field.mandatory;
          switch (field.type) {
            case spSCConf.CONTAINER_START:
              _overLoadContainerMandatoryProperty(field, g_form);
              _overLoadContainerVisibleProperty(field, g_form);
              _overLoadContainerValueProperty(field, g_form);
              _overLoadContainerReadonlyProperty(field, g_form);
              _overLoadContainerInvalidProperty(field, g_form);
              return;
            case spSCConf.CHECKBOX_CONTAINER:
              _overLoadCheckboxContainerMandatoryProperty(field, g_form);
              _overLoadCheckboxContainerVisibleProperty(field, g_form);
              _overLoadCheckboxContainerReadonlyProperty(field, g_form);
              _overLoadCheckboxContainerValueProperty(field, g_form);
              _overLoadCheckboxContainerLabelProperty(field, g_form);
              return;
            case spSCConf.CHECKBOX:
              _overLoadCheckboxMandatoryProperty(field, g_form);
              _overLoadCheckboxVisibleProperty(field, g_form);
              _overLoadCheckboxReadonlyProperty(field, g_form);
              return;
            case spSCConf.LABEL:
            case spSCConf.RICH_TEXT_LABEL:
              _overLoadLabelMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              _overLoadLabelValueProperty(field, g_form);
              return;
            case spSCConf.MASKED:
              _overLoadMaskedValueProperty(field, g_form);
              _overLoadDefaultMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              return;
            case spSCConf.BREAK:
              _overLoadFormattersMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              return;
            case spSCConf.HTML:
              _overLoadHTMLReadOnlyProperty(field, g_form);
              _overLoadDefaultMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              return;
            case spSCConf.REFERENCE:
              _overLoadInvalidProperty(field, g_form);
              _overLoadDefaultMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              return;
            case spSCConf.SC_ATTACHMENT:
              _overLoadAttachmentValueProperty(field, g_form);
              _overLoadDefaultMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              return;
            case spSCConf.MULTI_ROW_TYPE:
              _overLoadMultiRowValueProperty(field, g_form);
              _overLoadDefaultMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              _overLoadDefaultReadOnlyProperty(field, g_form);
              return;
            case spSCConf.FORMATTER:
              _overLoadFormattersMandatoryProperty(field, g_form);
              _overLoadFormattersVisibleProperty(field, g_form);
              return;
            case spSCConf.STRING:
              _overLoadInvalidProperty(field, g_form);
            default:
              _overLoadDefaultMandatoryProperty(field, g_form);
              _overLoadDefaultVisibleProperty(field, g_form);
              _overLoadDefaultReadOnlyProperty(field, g_form);
              return;
          }
        });
        function _getField(fieldName) {
          for (var i = 0, iM = _fields.length; i < iM; i++) {
            var field = _fields[i];
            if (field.variable_name === fieldName || field.name === fieldName) {
              return field;
            }
          }
          return null;
        }
        function _isCheckboxGroupMandatorySatisfied(field) {
          if (field.type !== spSCConf.CHECKBOX_CONTAINER) return false;
          for (var i = 0; i < field._children.length; i++) {
            var child = _getField(field._children[i]);
            if (!isCheckboxEmpty(child.value)) return true;
          }
          return false;
        }
        function canHideOrDisableCheckbox(field) {
          var parent = _getField(field._parent);
          if (!parent._mandatory || _isCheckboxGroupMandatorySatisfied(parent))
            return true;
          var visibleEditableCheckboxes = parent._children
            .map(_getField)
            .filter(function (child) {
              return child._visible && !child._readonly;
            });
          if (visibleEditableCheckboxes.length == 1)
            return field !== visibleEditableCheckboxes[0];
          return visibleEditableCheckboxes.length > 1;
        }
        function canHideOrDisable(field) {
          if (isContainerType(field)) return canHideOrDisableContainer(field);
          if (field.type == spSCConf.CHECKBOX) {
            return canHideOrDisableCheckbox(field);
          } else if (
            glideFormFieldFactory.isMandatory(field) &&
            !glideFormFieldFactory.hasValue(field)
          )
            return false;
          return true;
        }
        function canHideOrDisableCheckboxContainer(field) {
          if (!field._mandatory || _isCheckboxGroupMandatorySatisfied(field))
            return true;
          return false;
        }
        function canHideOrDisableContainer(field) {
          if (field.type == spSCConf.CHECKBOX_CONTAINER)
            return canHideOrDisableCheckboxContainer(field);
          for (var i = 0; i < field._children.length; i++) {
            if (!canHideOrDisable(_getField(field._children[i]))) return false;
          }
          return true;
        }
        function isServerValidationRequired(field) {
          if (!field) return false;
          if (field.type == 'string' && field.validate_regex) return true;
          else if (
            field.type == spSCConf.REFERENCE &&
            field.is_requested_for &&
            field.validate_on_change
          )
            return true;
          return false;
        }
        function handleServerValidation(
          field,
          sysId,
          value,
          validationFunc,
          errorMessage
        ) {
          field.isServerInvalid = false;
          if (value) {
            field.isServerInvalid = true;
            field.isServerValidationDone = false;
            validationFunc(sysId, value).then(
              function () {
                handleSuccess(field);
              },
              function () {
                handleFailure(field, errorMessage);
              }
            );
          }
        }
        function handleSuccess(field) {
          field.isServerValidationDone = true;
          field.isServerInvalid = false;
          $rootScope.$broadcast('$sp.service_catalog.form_validation_complete');
        }
        function handleFailure(field, errorMessage) {
          field.isServerValidationDone = true;
          field.isServerInvalid = true;
          $rootScope.$broadcast('$sp.service_catalog.form_validation_complete');
          if (g_form.hideFieldMsg) g_form.hideFieldMsg(field.name);
          if (g_form.showFieldMsg)
            g_form.showFieldMsg(field.name, errorMessage, 'error');
        }
        function onChangeVariableValidation(fieldName, oldValue, newValue) {
          if (fieldName.startsWith('IO:')) return;
          var field = g_form.getField(fieldName);
          if (!isServerValidationRequired(field)) return;
          if (field.validate_regex)
            handleServerValidation(
              field,
              field.sys_id,
              newValue,
              spScUtil.validateRegex,
              field.validation_message
            );
          else if (field.is_requested_for)
            handleServerValidation(
              field,
              g_form.getSysId(),
              newValue,
              spScUtil.validateRequestedForAccess,
              i18n.getMessage('Item is unavailable for this user')
            );
        }
        function _addValidationScript(fields, g_form) {
          g_form.$private.events.on('change', onChangeVariableValidation);
        }
        function _overLoadDefaultMandatoryProperty(field, g_form) {
          Object.defineProperty(field, 'mandatory', {
            set: function (isMandatory) {
              if (field.sys_readonly) return;
              this._mandatory = isMandatory;
              if (typeof this._parent != 'undefined' && this._parent) {
                walkToRootAndSetVisibility(
                  g_form,
                  _getField(this._parent),
                  true
                );
              }
            },
            get: function () {
              return this._mandatory;
            },
            configurable: true,
          });
        }
        function _overLoadDefaultVisibleProperty(field, g_form) {
          Object.defineProperty(field, 'visible', {
            set: function (isVisible) {
              this._visible = isVisible;
              if (typeof this._parent != 'undefined' && this._parent) {
                walkToRootAndSetVisibility(
                  g_form,
                  _getField(this._parent),
                  isVisible
                );
              }
              return;
            },
            get: function () {
              return field._visible;
            },
            configurable: true,
          });
        }
        function walkToRootAndSetVisibility(g_form, field, isVisible) {
          if (!isContainerType(field)) return;
          if (!isVisible) {
            for (var i = 0; i < field._children.length; i++) {
              if (g_form.isVisible(field._children[i])) return false;
            }
            field.visible = isVisible;
            if (typeof field._parent == 'string' && _getField(field._parent))
              walkToRootAndSetVisibility(
                g_form,
                _getField(field._parent),
                isVisible
              );
            field._cascade_hidden = true;
            return;
          } else {
            if (field._cascade_hidden || !canHideOrDisableContainer(field)) {
              field._cascade_hidden = false;
              field.visible = isVisible;
              if (typeof field._parent == 'string' && _getField(field._parent))
                walkToRootAndSetVisibility(
                  g_form,
                  _getField(field._parent),
                  isVisible
                );
            }
          }
        }
        function _overLoadContainerValueProperty(field, g_form) {
          Object.defineProperty(field, 'value', {
            get: function () {
              for (var i = 0; i < this._children.length; i++) {
                var child = _getField(this._children[i]);
                if (glideFormFieldFactory.hasValue(child)) return 'true';
              }
              return this.mandatory ? 'true' : '';
            },
            set: function (value) {
              return;
            },
            configurable: true,
          });
        }
        function _overLoadContainerMandatoryProperty(field, g_form) {
          Object.defineProperty(field, 'mandatory', {
            set: function (isMandatory) {
              this._mandatory = isMandatory;
              var canHideContainer = true;
              for (var i = 0; i < this._children.length; i++) {
                var child = _getField(this._children[i]);
                g_form.setMandatory(child.name, isMandatory);
                canHideContainer = canHideContainer && canHideOrDisable(child);
              }
              if (isMandatory) {
                if (!this._visible && canHideContainer) {
                  return;
                }
                if (typeof this._parent != 'undefined' && this._parent)
                  walkToRootAndSetVisibility(
                    g_form,
                    _getField(this._parent),
                    true
                  );
              }
            },
            get: function () {
              for (var i = 0; i < this._children.length; i++) {
                var child = _getField(this._children[i]);
                if (g_form.isMandatory(child.name)) return true;
              }
              return this._mandatory;
            },
            configurable: true,
          });
        }
        function _overLoadContainerVisibleProperty(field, g_form) {
          Object.defineProperty(field, 'visible', {
            set: function (isVisible) {
              if (isVisible) {
                if (!this._visible && this._cascade_hidden) {
                  return;
                }
              } else {
                if (!canHideOrDisableContainer(this)) {
                  return;
                }
              }
              this._visible = isVisible;
              this._cascade_hidden = false;
              if (typeof this._parent != 'undefined' && this._parent)
                walkToRootAndSetVisibility(
                  g_form,
                  _getField(this._parent),
                  isVisible
                );
            },
            get: function () {
              return field._visible;
            },
            configurable: true,
          });
        }
        function _overLoadContainerReadonlyProperty(field, g_form) {
          Object.defineProperty(field, 'readonly', {
            set: function (isReadonly) {
              for (var i = 0; i < this._children.length; i++) {
                var child = _getField(this._children[i]);
                if (
                  isContainerType(child) ||
                  !isReadonly ||
                  (isReadonly && canHideOrDisable(child))
                ) {
                  if (child.sys_readonly) continue;
                  child.readonly = isReadonly;
                }
              }
              this._readonly = isReadonly;
            },
            get: function () {
              return this._readonly;
            },
            configurable: true,
          });
        }
        function _overLoadContainerInvalidProperty(field, g_form) {
          Object.defineProperty(field, 'isInvalid', {
            set: function (isReadonly) {
              return;
            },
            get: function () {
              return false;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxContainerMandatoryProperty(field, g_form) {
          if (field.render_label) {
            for (var i = 0; i < field._children.length; i++) {
              if (_getField(field._children[i]).mandatory) {
                field._mandatory = true;
                break;
              }
            }
          } else {
            var childCheckbox = _getField(field._children[0]);
            if (childCheckbox.mandatory) field._mandatory = true;
          }
          Object.defineProperty(field, 'mandatory', {
            set: function (isMandatory) {
              var forceOpenChildren =
                isMandatory && !_isCheckboxGroupMandatorySatisfied(this);
              for (var i = 0; i < field._children.length; i++) {
                var child = _getField(field._children[i]);
                if (forceOpenChildren) {
                  child._visible = true;
                  child.readonly = false;
                }
                g_form.setMandatory(field._children[i], isMandatory);
              }
              this._mandatory = isMandatory;
            },
            get: function () {
              return this._mandatory;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxContainerVisibleProperty(field, g_form) {
          Object.defineProperty(field, 'visible', {
            set: function (isVisible) {
              if (isVisible) {
                if (!this._visible && this._cascade_hidden) {
                  return;
                }
              } else {
                if (!canHideOrDisableCheckboxContainer(this)) return;
              }
              this._visible = isVisible;
              this._cascade_hidden = false;
              if (typeof this._parent != 'undefined' && this._parent) {
                walkToRootAndSetVisibility(
                  g_form,
                  _getField(this._parent),
                  isVisible
                );
              }
            },
            get: function () {
              return field._visible;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxContainerReadonlyProperty(field, g_form) {
          Object.defineProperty(field, 'readonly', {
            set: function (isReadonly) {
              if (isReadonly && !canHideOrDisableCheckboxContainer(this)) {
                return;
              }
              for (var i = 0; i < field._children.length; i++) {
                g_form.setReadonly(field._children[i], isReadonly);
              }
              this._readonly = isReadonly;
              this._cascade_readonly = true;
            },
            get: function () {
              return this._readonly;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxContainerValueProperty(field, g_form) {
          Object.defineProperty(field, 'value', {
            get: function () {
              if (this._mandatory && _isCheckboxGroupMandatorySatisfied(this))
                return 'true';
              return this._mandatory ? '' : 'false';
            },
            set: function (value) {
              return;
            },
            configurable: true,
          });
          Object.defineProperty(field, 'stagedValue', {
            get: function () {
              if (this._mandatory && _isCheckboxGroupMandatorySatisfied(this))
                return 'true';
              return this._mandatory ? '' : 'false';
            },
            set: function (value) {
              return;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxContainerLabelProperty(field, g_form) {
          if (field.render_label) return;
          Object.defineProperty(field, 'label', {
            get: function () {
              var childCheckbox = _getField(this._children[0]);
              return childCheckbox.label;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxMandatoryProperty(field, g_form) {
          Object.defineProperty(field, 'mandatory', {
            set: function (isMandatory) {
              var checkboxContainer = _getField(this._parent);
              if (isMandatory && isCheckboxEmpty(this.value)) {
                this._mandatory = isMandatory;
                checkboxContainer._mandatory = isMandatory;
                var groupSatisfied =
                  _isCheckboxGroupMandatorySatisfied(checkboxContainer);
                if (!checkboxContainer._visible && groupSatisfied) {
                  return;
                }
                if (!groupSatisfied) {
                  if (!this._visible) this._visible = true;
                  if (this._readonly) this._readonly = false;
                }
                checkboxContainer._visible = true;
                checkboxContainer._readonly = false;
                if (
                  typeof checkboxContainer._parent != 'undefined' &&
                  checkboxContainer._parent
                )
                  walkToRootAndSetVisibility(
                    g_form,
                    _getField(checkboxContainer._parent),
                    true
                  );
              }
              this._mandatory = isMandatory;
              if (isMandatory) {
                checkboxContainer._mandatory = true;
                return;
              }
              for (var i = 0; i < checkboxContainer._children.length; i++) {
                if (_getField(checkboxContainer._children[i])._mandatory) {
                  checkboxContainer._mandatory = true;
                  return;
                }
              }
              checkboxContainer._mandatory = isMandatory;
              checkboxContainer.isInvalid = false;
            },
            get: function () {
              return this._mandatory;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxVisibleProperty(field, g_form) {
          Object.defineProperty(field, 'visible', {
            set: function (isVisible) {
              if (!isVisible && !canHideOrDisableCheckbox(this)) {
                return;
              }
              this._visible = isVisible;
              if (typeof this._parent != 'undefined' && this._parent) {
                var parent = _getField(this._parent);
                if (isVisible && !parent.visible && !parent._cascade_hidden)
                  return;
                if (!isVisible) {
                  if (
                    parent._mandatory &&
                    !_isCheckboxGroupMandatorySatisfied(parent)
                  ) {
                    var visibleCheckboxes = parent._children
                      .map(_getField)
                      .filter(function (child) {
                        return child._visible;
                      });
                    if (visibleCheckboxes.length > 0) return;
                  }
                  return walkToRootAndSetVisibility(g_form, parent, false);
                }
                parent._visible = isVisible;
                parent._cascade_hidden = !isVisible;
                if (typeof parent._parent != 'undefined' && parent._parent)
                  walkToRootAndSetVisibility(
                    g_form,
                    _getField(parent._parent),
                    isVisible
                  );
              }
            },
            get: function () {
              return field._visible;
            },
            configurable: true,
          });
        }
        function _overLoadCheckboxReadonlyProperty(field, g_form) {
          Object.defineProperty(field, 'readonly', {
            set: function (isReadonly) {
              if (isReadonly && !canHideOrDisableCheckbox(this)) return false;
              this._readonly = isReadonly;
              if (_getField(this._parent)._cascade_readonly) {
                _getField(this._parent)._cascade_readonly = false;
                _getField(this._parent)._readonly = false;
              }
            },
            get: function () {
              return this._readonly;
            },
            configurable: true,
          });
        }
        function _overLoadLabelMandatoryProperty(field, g_form) {
          Object.defineProperty(field, 'mandatory', {
            set: function (isMandatory) {
              console.log(
                "setMandatory not applicable for 'Label' variable type"
              );
              return;
            },
            configurable: true,
          });
        }
        function _overLoadLabelValueProperty(field, g_form) {
          Object.defineProperty(field, 'value', {
            get: function () {
              return '';
            },
            set: function () {},
            configurable: true,
          });
        }
        function _overLoadMaskedValueProperty(field, g_form) {
          field._value = field.value;
          Object.defineProperty(field, 'value', {
            set: function (value) {
              field._value = value;
              if (field._setFromModel) field._setFromModel = false;
              else {
                field.confirmPassword = value;
                field.isInvalid = false;
              }
            },
            get: function () {
              return field._value;
            },
            configurable: true,
          });
        }
        function _overLoadAttachmentValueProperty(field, g_form) {
          field._value = field.value;
          Object.defineProperty(field, 'value', {
            set: function (value) {
              if (value == '') {
                field._value = field.displayValue = field.originalValue = '';
                field.isInvalid = false;
                return;
              }
              field.isInvalid = true;
              if (!field.validated) {
                $http.get('/api/now/attachment/' + value).then(
                  function (response) {
                    var allowedExtensionArray = new Array();
                    if (field.attributes.allowed_extensions)
                      allowedExtensionArray =
                        field.attributes.allowed_extensions.split(';');
                    var file = {
                      name: response.data.result.file_name,
                      size: response.data.result.size_bytes,
                    };
                    var _field = {
                      name: field.name,
                      allowedExtensions: allowedExtensionArray,
                      allowedFileSize: field.attributes.max_file_size,
                    };
                    var result = validateAttachmentVariable(file, _field);
                    field._value = '';
                    if (result == ATTACHMENT_SIZE_ERROR) {
                      g_form.hideFieldMsg(_field.name);
                      g_form.showFieldMsg(
                        _field.name,
                        i18n.format(
                          i18n.getMessage(
                            'The size of the uploaded file cannot exceed {0} MB'
                          ),
                          _field.allowedFileSize
                        ),
                        'error'
                      );
                    } else if (result == EXTENSION_ERROR) {
                      g_form.hideFieldMsg(_field.name);
                      g_form.showFieldMsg(
                        _field.name,
                        i18n.format(
                          i18n.getMessage(
                            'The uploaded file type is not permitted; allowed types are {0}'
                          ),
                          _field.allowedExtensions.join(', ')
                        ),
                        'error'
                      );
                    } else {
                      field._value = field.originalValue = value;
                      field.displayValue = field.displayValue
                        ? response.data.result.file_name
                        : field.displayValue;
                    }
                  },
                  function (error) {
                    g_form.showFieldMsg(
                      field.name,
                      i18n.getMessage('Invalid value'),
                      'error'
                    );
                    field._value =
                      field.displayValue =
                      field.originalValue =
                        '';
                    return;
                  }
                );
              } else {
                field._value = field.originalValue = value;
                field.validated = false;
              }
              field.isInvalid = false;
            },
            get: function () {
              return field._value;
            },
            configurable: true,
          });
        }
        function _overLoadMultiRowValueProperty(field, g_form) {
          field._value =
            field.value && typeof field.value === 'string'
              ? JSON.parse(field.value)
              : field.value;
          Object.defineProperty(field, 'value', {
            set: function (value) {
              if (value == '') {
                field._value = field._displayValue = [];
                return;
              }
              field.isInvalid = true;
              if (!field.validated) {
                var data = [];
                if (Array.isArray(value)) {
                  try {
                    data = JSON.stringify(value);
                  } catch (e) {
                    _logWarn(
                      'JSON parse error',
                      'Invalid value for table variable'
                    );
                    return;
                  }
                } else if (typeof value != 'string') {
                  _logWarn('Invalid Input', 'Invalid value for table variable');
                  return;
                }
                var uniqueColumnData = {};
                var fieldsMeta = field.columns_meta;
                for (var index in fieldsMeta) {
                  if (fieldsMeta[index].unique)
                    uniqueColumnData[fieldsMeta[index].name] =
                      fieldsMeta[index].label;
                }
                var parsedValue = JSON.parse(value);
                if (
                  !hasDuplicateColumnData(uniqueColumnData, parsedValue) &&
                  !isMaxRowExceeded(field.max_rows, parsedValue, field.label)
                ) {
                  field._value = parsedValue;
                  _setMultiRowDisplayValue(field, value);
                } else {
                  var parsedValue = [];
                  var fieldValue = field._value;
                  if (fieldValue) {
                    var isfieldValueAString = typeof fieldValue === 'string';
                    field._value = isfieldValueAString
                      ? JSON.parse(fieldValue)
                      : fieldValue;
                    var displayFieldValue = isfieldValueAString
                      ? fieldValue
                      : JSON.stringify(fieldValue);
                    _setMultiRowDisplayValue(field, displayFieldValue);
                  } else field._value = field._displayValue = parsedValue;
                  field.skipOnChangeUpdate = true;
                }
              } else {
                field._value = JSON.parse(value);
                field.skipOnChangeUpdate = false;
                field.validated = false;
              }
              field.isInvalid = false;
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
        }
        function hasDuplicateColumnData(uniqueColumnNames, value) {
          if (uniqueColumnNames && value) {
            var duplicateUniqueFields = getDuplicateFields(
              uniqueColumnNames,
              value
            );
            if (duplicateUniqueFields.length > 0) {
              _logWarn(
                'Duplicate Data',
                'Some fields are not unique: ' +
                  duplicateUniqueFields.join(', ')
              );
              return true;
            }
          }
          return false;
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
        function _setMultiRowDisplayValue(field, fieldValue) {
          spScUtil
            .getDisplayValueForMultiRowSet(field.id, fieldValue)
            .then(function (response) {
              if (!response && !response.data) return;
              field._displayValue = JSON.parse(response.data.result);
            });
        }
        function _logWarn(code, msg) {
          if (console && console.warn) {
            console.warn('(g_form) [' + code + '] ' + msg);
          }
        }
        function _overLoadInvalidProperty(field, g_form) {
          Object.defineProperty(field, 'isInvalid', {
            set: function (isInvalid) {
              field._isInvalid = isInvalid;
            },
            get: function () {
              if (isServerValidationRequired(field))
                return (
                  field._isInvalid ||
                  field.isServerInvalid ||
                  field.also_request_for_Invalid
                );
              return field._isInvalid;
            },
            configurable: true,
          });
        }
        function _overLoadFormattersMandatoryProperty(field, g_form) {
          Object.defineProperty(field, 'mandatory', {
            set: function () {},
            get: function () {
              return false;
            },
          });
        }
        function _overLoadFormattersVisibleProperty(field, g_form) {
          Object.defineProperty(field, 'visible', {
            set: function () {},
            get: function () {
              return false;
            },
          });
        }
        function _overLoadHTMLReadOnlyProperty(field, g_form) {
          Object.defineProperty(field, 'readonly', {
            set: function (isReadOnly) {
              field._readonly = isReadOnly;
              g_form.$private.events.propertyChange(
                PROPERTY_CHANGE_FIELD,
                field.name,
                'readonly',
                isReadOnly
              );
            },
            get: function () {
              return this._readonly;
            },
            configurable: true,
          });
        }
        function _overLoadDefaultReadOnlyProperty(field, g_form) {
          Object.defineProperty(field, 'readonly', {
            set: function (isReadOnly) {
              field._readonly = isReadOnly;
              setPlaceholder(isReadOnly, field);
            },
            get: function () {
              return this._readonly;
            },
            configurable: true,
          });
        }
        function setPlaceholder(isReadOnly, field) {
          if (isReadOnly && field.placeholder) {
            field._placeholder = field.placeholder;
            field.placeholder = '';
          } else if (!isReadOnly && field._placeholder) {
            field.placeholder = field._placeholder;
            field._placeholder = '';
          }
        }
      }
    }
  );
