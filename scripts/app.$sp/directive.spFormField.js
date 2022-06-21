/*! RESOURCE: /scripts/app.$sp/directive.spFormField.js */
angular
  .module('sn.$sp')
  .directive(
    'spFormField',
    function (
      $location,
      glideFormFieldFactory,
      $timeout,
      spLabelHelper,
      spAriaUtil,
      i18n,
      spModelUtil,
      $ocLazyLoad,
      $sce,
      spUtil,
      $rootScope
    ) {
      'use strict';
      function getDeps(fieldType) {
        var deps = {
          codeMirror: [
            '/styles/sp_codemirror_includes.css',
            '/scripts/libs/sp_codemirror_includes.js',
          ],
          spectrum: ['/styles/spectrum.css', '/scripts/lib/spectrum.js'],
        };
        deps.momentLocale = function () {
          var localeMap = spUtil.localeMap;
          if (localeMap[g_lang]) {
            return ['/scripts/libs/moment/locale/' + localeMap[g_lang] + '.js'];
          }
          return;
        };
        return {
          css: deps.codeMirror,
          xml: deps.codeMirror,
          json: deps.codeMirror,
          script: deps.codeMirror,
          properties: deps.codeMirror,
          script_server: deps.codeMirror,
          html_template: deps.codeMirror,
          color: deps.spectrum,
          glide_date: deps.momentLocale(),
          glide_date_time: deps.momentLocale(),
        }[fieldType];
      }
      return {
        restrict: 'E',
        templateUrl: 'sp_form_field.xml',
        replace: true,
        controllerAs: 'c',
        scope: {
          field: '=',
          formModel: '=',
          getGlideForm: '&glideForm',
          setDefaultValue: '&defaultValueSetter',
        },
        controller: function ($element, $scope) {
          var c = this;
          var field = $scope.field;
          if (!field) throw 'spFormField used without providing a field.';
          c.depsLoaded = false;
          c.getAttachmentGuid = function () {
            if ($scope.formModel) {
              return $scope.formModel._attachmentGUID;
            }
            return '';
          };
          var deps = getDeps(field.type);
          if (deps && deps.length) {
            $ocLazyLoad.load(deps).then(function () {
              c.depsLoaded = true;
              if (field.type == 'glide_date' || field.type == 'glide_date_time')
                $rootScope.$emit('sp.date.depsLoaded');
            });
          } else {
            c.depsLoaded = true;
          }
          if (typeof field.isMandatory === 'undefined')
            spModelUtil.extendField(field);
          var _setDefaultValue = $scope.setDefaultValue;
          $scope.setDefaultValue = function (
            fieldName,
            fieldInternalValue,
            fieldDisplayValue
          ) {
            _setDefaultValue({
              fieldName: fieldName,
              fieldInternalValue: fieldInternalValue,
              fieldDisplayValue: fieldDisplayValue,
            });
          };
          $scope
            .getGlideForm()
            .$private.events.on(
              'change',
              function (fieldName, oldValue, newValue) {
                if (fieldName == field.name) field.stagedValue = newValue;
              }
            );
          $scope.stagedValueChange = function () {
            $scope.$emit('sp.spFormField.stagedValueChange', null);
          };
          $scope.fieldValue = function (newValue, displayValue) {
            if (angular.isDefined(newValue)) {
              $scope
                .getGlideForm()
                .setValue(field.name, newValue, displayValue);
            }
            return field.value;
          };
          $scope.getEncodedRecordValues = function () {
            var result = {};
            angular.forEach($scope.formModel._fields, function (f) {
              if (f.type != 'user_image') result[f.name] = f.value;
              else if (f.value) result[f.name] = 'data:image/jpeg;base64,A==';
            });
            return result;
          };
          $scope.formatNumber = function () {
            if (!field.noFormat)
              field.stagedValue = formatNumber(field.stagedValue);
          };
          $scope.onImageUpload = function (thumbnail, sys_id) {
            $scope.getGlideForm().setValue(field.name, sys_id, thumbnail);
          };
          $scope.onImageDelete = function () {
            $scope.getGlideForm().setValue(field.name, '');
          };
          $scope.hasValueOrFocus = function () {
            var val = $scope.hasFocus || glideFormFieldFactory.hasValue(field);
            if (field.type == 'user_image') val = true;
            return val;
          };
          $scope.getAutocompleteValue = function () {
            var attributes = spUtil.parseAttributes(field.attributes);
            if (typeof attributes.autocomplete !== 'undefined')
              return attributes.autocomplete;
            return 'off';
          };
          c.showLabel = function showLabel(field) {
            return (
              field.type != 'boolean' &&
              field.type != 'boolean_confirm' &&
              field.type != 'glide_duration' &&
              field.type != 'rich_text_label' &&
              field._class_name != 'MacroQuestion' &&
              (field.isMandatory() || (field.label && field.label.trim() != ''))
            );
          };
        },
        link: function (scope, element, attr) {
          scope.$applyAsync(function () {
            if (
              scope.field.type != 'boolean' &&
              scope.field.type != 'glide_duration'
            ) {
              scope.labelElement = element
                .closest('.form-group')
                .find('.field-label');
            }
            var inputField;
            switch (scope.field.type) {
              case 'field_list':
              case 'glide_list':
              case 'reference':
              case 'field_name':
              case 'table_name':
              case 'masked':
                return;
                break;
              case 'multiple_choice':
              case 'numericscale':
                inputField = element.find('input[type=radio]');
                break;
              default:
                inputField = element.find("[name='" + scope.field.name + "']");
                break;
            }
            var focusHandler = function () {
              scope.hasFocus = true;
              scope.$emit('sp.spFormField.focus', element, inputField);
              if (!scope.$root.$$phase) scope.$apply();
            };
            var blurHandler = function () {
              scope.fieldValue(scope.field.stagedValue);
              scope.hasFocus = false;
              scope.$emit('sp.spFormField.blur', element, inputField);
              scope.$broadcast('sp.spFormField.unFocus');
              if (!scope.$root.$$phase) scope.$apply();
            };
            inputField.on('focus', focusHandler).on('blur', blurHandler);
            scope.$on('$destroy', function () {
              inputField.off('focus', focusHandler).off('blur', blurHandler);
            });
            scope.$emit('sp.spFormField.rendered', element, inputField);
          });
          scope.$on('select2.ready', function (e, $el) {
            e.stopPropagation();
            var focusHandler = function (e) {
              $el.select2('open');
            };
            $el.on('focus', focusHandler);
            scope.$on('$destroy', function () {
              $el.off('focus', focusHandler);
            });
            scope.$emit('sp.spFormField.rendered', element, $el);
          });
          scope.$on('sp.spFormField.rendered', function (e, element, $el) {
            var controlElement;
            switch (scope.field.type) {
              case 'glide_date':
              case 'glide_date_time':
              case 'multiple_choice':
              case 'multi_two_lines':
              case 'multi_small':
              case 'numericscale':
              case 'password':
              case 'password2':
              case 'textarea':
              case 'integer':
              case 'decimal':
              case 'float':
              case 'email':
              case 'string':
              case 'url':
              case 'boolean':
                controlElement = $el;
                break;
              case 'glide_list':
                controlElement = $el.parent().find('.select2-input');
                break;
              case 'reference':
              case 'choice':
                controlElement = $el.parent().find('.select2-focusser');
                break;
              default:
                return;
            }
            scope.controlElement = controlElement;
            syncFieldAriaDescribedBy();
          });
          scope
            .getGlideForm()
            .$private.events.on(
              'propertyChange',
              function (type, fieldName, propertyName, propertyValue) {
                if (fieldName != scope.field.name) return;
                if (propertyName === 'messages') syncFieldAriaDescribedBy();
                if (propertyName === 'isInvalid') syncAriaInvalid();
                if (propertyName === 'readonly')
                  scope.syncFieldAriaLabel(scope);
              }
            );
          function syncAriaInvalid() {
            var field = scope.field;
            var controlElement = scope.controlElement;
            if (!field || !controlElement) return;
            switch (field.type) {
              case 'glide_list':
              case 'reference':
              case 'choice':
                controlElement.attr('aria-invalid', field.isInvalid);
              default:
                return;
            }
          }
          function syncFieldAriaDescribedBy() {
            var controlElement = scope.controlElement;
            if (!controlElement) return;
            var messages = scope.field.messages;
            var fieldMsgs = messages && messages.length;
            var ariaDescribedBy = controlElement.attr('aria-describedby');
            var ariaDescribedByList = ariaDescribedBy
              ? ariaDescribedBy.split(' ')
              : [];
            var fmAriaDescribedBy =
              'sp_formfield_' + scope.field.name + '_fieldmsgs_container';
            if (fieldMsgs) {
              if (ariaDescribedByList.indexOf(fmAriaDescribedBy) === -1) {
                ariaDescribedByList.push(fmAriaDescribedBy);
                controlElement.attr(
                  'aria-describedby',
                  ariaDescribedByList.join(' ')
                );
              }
            } else {
              if (ariaDescribedByList.indexOf(fmAriaDescribedBy) !== -1) {
                ariaDescribedByList.splice(
                  ariaDescribedByList.indexOf(fmAriaDescribedBy),
                  1
                );
                if (ariaDescribedByList.length)
                  controlElement.attr(
                    'aria-describedby',
                    ariaDescribedByList.join(' ')
                  );
                else controlElement.removeAttr('aria-describedby');
              }
            }
          }
          scope.getFieldAriaHidden = function (field) {
            var fieldTypes = [
              'boolean',
              'choice',
              'boolean_confirm',
              'color',
              'css',
              'document_id',
              'domain_id',
              'schedule_date_time',
              'integer_date',
              'glide_duration',
              'url',
              'field_list',
              'field_name',
              'glide_date',
              'glide_date_time',
              'glide_list',
              'glyphicon',
              'xml',
              'html_template',
              'json',
              'masked',
              'multiple_choice',
              'multi_two_lines',
              'multi_small',
              'numericscale',
              'price',
              'currency',
              'password',
              'password2',
              'properties',
              'reference',
              'script_server',
              'script',
              'table_name',
              'textarea',
              'html',
              'translated_html',
              'user_image',
              'widget',
              'widget_value',
              'integer',
              'decimal',
              'float',
              'sc_multi_row',
              'email',
              'rich_text_label',
              'sc_attachment',
            ];
            var ariaHiddenFields = [
              'email',
              'url',
              'boolean',
              'string',
              'textarea',
              'sc_attachment',
              'glide_date',
              'glide_date_time',
              'choice',
              'html',
              'translated_html',
              'widget',
              'ph_number',
              'masked',
              'multi_two_lines',
            ];
            return (
              fieldTypes.indexOf(field.type) < 0 ||
              ariaHiddenFields.indexOf(field.type) > -1
            );
          };
          scope.getReferenceLabelContents = function (field) {
            return spLabelHelper.getReferenceLabelContents(field);
          };
          scope.syncFieldAriaLabel = spLabelHelper.syncFieldAriaLabel;
          scope.getFieldAriaLabel = spLabelHelper.getFieldAriaLabel;
          scope.accessible = spAriaUtil.isAccessibilityEnabled();
          scope.enhancePriceLabels = function (field) {
            return (
              field._pricing && field._pricing.enhance_price_labels === true
            );
          };
          scope.getCheckBoxPrice = function (field) {
            return spLabelHelper.getPriceLabelForCheckbox(field);
          };
          scope.setPriceLabelForChoice = function (field) {
            if (angular.isDefined(field) && field._cat_variable === true) {
              if (!scope.enhancePriceLabels(field)) return;
              var labelArrayPromise = spLabelHelper.getPriceLabelForChoices(
                field,
                scope.formModel.recurring_price_frequency
              );
              labelArrayPromise.then(
                function (labelArray) {
                  if (!labelArray || field.choices.length != labelArray.length)
                    return;
                  for (var i = 0; i < field.choices.length; i++) {
                    field.choices[i].priceLabel = labelArray[i];
                  }
                },
                function (errorMessage) {
                  console.log(errorMessage);
                }
              );
            }
          };
          scope.trustedHTML = function (html) {
            return $sce.trustAsHtml(html);
          };
          if (
            scope.field.type == 'integer' ||
            scope.field.type == 'decimal' ||
            scope.field.type == 'float'
          ) {
            if (!scope.field.noFormat) {
              scope.field.stagedValue = scope.field.displayValue;
            }
            return;
          }
          if (scope.field.encrypted)
            scope.field.stagedValue = scope.field.displayValue;
          if (
            scope.field._cat_variable &&
            scope.field.type == 'choice' &&
            scope.field._pricing &&
            scope.field._pricing.enhance_price_labels === true
          ) {
            scope.$on('sp.sc.refresh_label_choices', function (event, field) {
              if (scope.field.name == field.name) {
                event.stopPropagation();
                scope.setPriceLabelForChoice(field);
              }
            });
          }
          var fieldChangeHandlers = [
            {
              types: ['choice', 'multiple_choice'],
              handler: function ($event, payload) {
                scope.setPriceLabelForChoice(payload.field);
              },
            },
            {
              types: ['boolean', 'boolean_confirm'],
              handler: function ($event, payload) {
                var newValue = (
                  payload.newValue.toString() === 'true' ||
                  payload.newValue.toString() === '1'
                ).toString();
                if (newValue !== payload.field.value) {
                  scope.field.value = newValue;
                }
              },
            },
            {
              types: ['journal_input', 'journal'],
              handler: function ($event, payload) {
                scope.field.journalInputChanged = true;
              },
            },
          ];
          fieldChangeHandlers.some(function (fch) {
            if (fch.types.indexOf(scope.field.type) > -1) {
              scope.$on('field.change.' + scope.field.name, fch.handler);
              return true;
            }
          });
        },
      };
    }
  );
