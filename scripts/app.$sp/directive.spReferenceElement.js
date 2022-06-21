/*! RESOURCE: /scripts/app.$sp/directive.spReferenceElement.js */
angular
  .module('sn.$sp')
  .directive(
    'spReferenceElement',
    function (
      $http,
      spUtil,
      filterExpressionParser,
      escapeHtml,
      i18n,
      md5,
      spIs,
      spAriaUtil,
      select2EventBroker,
      spAriaFocusManager
    ) {
      'use strict';
      var defaultPlaceholder = '    ';
      return {
        restrict: 'E',
        replace: true,
        scope: {
          ed: '=?',
          field: '=',
          refTable: '=?',
          refId: '=?',
          snOptions: '=?',
          snOnBlur: '&',
          snOnClose: '&',
          minimumInputLength: '@',
          snDisabled: '=',
          dropdownCssClass: '@',
          formatResultCssClass: '&',
          displayColumn: '@',
          recordValues: '&',
          getGlideForm: '&glideForm',
          domain: '@',
          snSelectWidth: '@',
          labelId: '@?',
        },
        template:
          '<input type="text" id="sp_formfield_{{::field.name}}" name="{{::field.name}}" ng-disabled="snDisabled" class="input-field-min-width" aria-hidden="true" />',
        link: function (scope, element, attrs, ctrl) {
          scope.cacheData = {};
          scope.ed = scope.ed || scope.field.ed;
          scope.selectWidth = scope.snSelectWidth || '100%';
          element.css('opacity', 0);
          var isOpen = false;
          var fireReadyEvent = true;
          var g_form;
          var field = scope.field;
          var isMultiple = scope.snOptions && scope.snOptions.multiple === true;
          if (angular.isDefined(scope.getGlideForm))
            g_form = scope.getGlideForm();
          var tableAttributes = field.table_attributes || {};
          var fieldAttributes = {};
          if (field.attributes && typeof scope.ed.attributes == 'undefined')
            if (Array.isArray(field.attributes))
              fieldAttributes = field.attributes;
            else fieldAttributes = spUtil.parseAttributes(field.attributes);
          else fieldAttributes = spUtil.parseAttributes(scope.ed.attributes);
          var refOrderBy = getFieldOrTableAttribute('ref_ac_order_by');
          var columnsSearch =
            getFieldOrTableAttribute('ref_ac_columns_search') == 'true';
          var displayColumns = getFieldOrTableAttribute('ref_ac_columns');
          var refAutoCompleter =
            getFieldOrTableAttribute('ref_auto_completer') ||
            'AJAXReferenceCompleter';
          function getFieldOrTableAttribute(name) {
            if (angular.isDefined(fieldAttributes[name]))
              return fieldAttributes[name];
            if (angular.isDefined(tableAttributes[name]))
              return tableAttributes[name];
            return '';
          }
          function getPlaceholder() {
            var ph = defaultPlaceholder;
            if (field.placeholder) {
              ph = field.placeholder;
            }
            if (scope.snOptions && scope.snOptions.placeholder) {
              ph = scope.snOptions.placeholder;
            }
            return ph;
          }
          var s2Helpers = {
            formatSelection: function (item) {
              return escapeHtml(getDisplayValue(item));
            },
            formatSelectionCssClass: function (item, el) {
              var anchorEl = el.parent().find('a');
              anchorEl.removeAttr('tabindex');
              anchorEl.addClass('fa fa-times');
              var ariaLabel = i18n
                .getMessage('Remove {0} from {1}')
                .withValues([getDisplayValue(item), field.label]);
              anchorEl.attr('aria-label', ariaLabel);
            },
            formatResult: function (item) {
              var displayValues = getDisplayValues(item);
              if (displayValues.length == 1)
                return escapeHtml(displayValues[0]);
              if (displayValues.length > 1) {
                var width = 100 / displayValues.length;
                var markup = '';
                for (var i = 0; i < displayValues.length; i++)
                  markup +=
                    "<div style='width: " +
                    width +
                    "%;display: inline-block;word-wrap:break-word;vertical-align:top' class='select2-result-cell'>" +
                    escapeHtml(displayValues[i]) +
                    '</div>';
                return markup;
              }
              return '';
            },
            search: function (queryParams) {
              var key = md5(JSON.stringify(queryParams.data));
              var cachedResponse = scope.cacheData[key];
              if (cachedResponse) return queryParams.success(cachedResponse);
              var url = spUtil.getURL({
                sysparm_type: 'sp_ref_list_data',
                sysparm_cancelable: true,
              });
              return $http
                .post(url, queryParams.data)
                .then(function (response) {
                  if (response.data && response.data.items) {
                    scope.cacheData[key] = response;
                    queryParams.success(response);
                  }
                });
            },
            initSelection: function (elem, callback) {
              if (field.displayValue) {
                if (isMultiple) {
                  var isPricingField =
                    field._pricing &&
                    field._pricing.pricing_implications === true;
                  var items = [];
                  var values =
                    typeof field.value === 'string'
                      ? field.value.split(',')
                      : field.value;
                  var displayValues = field.display_value_list;
                  var priceValues = [];
                  if (isPricingField) priceValues = field.price_value_list;
                  if (Array.isArray(field.displayValue)) {
                    displayValues.length = 0;
                    for (var i in field.displayValue)
                      displayValues[i] = field.displayValue[i];
                    field.displayValue = displayValues.join(
                      g_glide_list_separator
                    );
                  } else if (values.length == 1) {
                    displayValues.length = 0;
                    displayValues[0] = field.displayValue;
                  } else if (
                    field.displayValue !=
                    displayValues.join(g_glide_list_separator)
                  ) {
                    displayValues.length = 0;
                    var split = field.displayValue.split(',');
                    for (var i in split) displayValues[i] = split[i];
                  }
                  for (var i = 0; i < values.length; i++) {
                    if (isPricingField) {
                      items.push({
                        sys_id: values[i],
                        name: displayValues[i],
                        pricing: priceValues[i],
                      });
                    } else {
                      items.push({
                        sys_id: values[i],
                        name: displayValues[i],
                      });
                    }
                  }
                  callback(items);
                } else {
                  callback({
                    sys_id: field.value,
                    name: field.displayValue,
                  });
                }
              } else callback([]);
            },
            onSelecting: function (e) {
              var selectedItem = e.choice;
              if ('sys_id' in selectedItem) {
                var values =
                  typeof field.value === 'string'
                    ? field.value === ''
                      ? []
                      : field.value.split(',')
                    : field.value;
                var displayValues = field.display_value_list;
                var priceValues = field.price_value_list;
                values.push(selectedItem.sys_id);
                displayValues.push(getDisplayValue(selectedItem));
                if (
                  field['_cat_variable'] === true &&
                  field._pricing &&
                  field._pricing.pricing_implications === true
                ) {
                  var priceSelected = getPriceValue(selectedItem);
                  updatePrice(priceSelected, true);
                  if (priceValues) priceValues.push(priceSelected);
                }
                g_form.setValue(field.name, values.join(','), displayValues);
                e.preventDefault();
                element.select2('val', values).select2('close');
                element
                  .parent()
                  .find('.select2-input')
                  .removeAttr('aria-activedescendant');
                element
                  .parent()
                  .find(".select2-choices input[role='combobox']")
                  .focus();
              }
            },
            onRemoving: function (e) {
              var removed = e.choice;
              var values =
                typeof field.value === 'string'
                  ? field.value.split(',')
                  : field.value;
              var displayValues = field.display_value_list;
              var priceValues = field.price_value_list;
              for (var i = values.length - 1; i >= 0; i--) {
                if (removed.sys_id == values[i]) {
                  values.splice(i, 1);
                  displayValues.splice(i, 1);
                  if (
                    field['_cat_variable'] === true &&
                    field._pricing &&
                    field._pricing.pricing_implications === true
                  ) {
                    if (priceValues && priceValues.length > i) {
                      var priceRemoved = priceValues[i];
                      updatePrice(priceRemoved, false);
                      priceValues.splice(i, 1);
                    }
                  }
                  break;
                }
              }
              g_form.setValue(field.name, values.join(','), displayValues);
              e.preventDefault();
              element.select2('val', values);
            },
            select2Change: function (e) {
              e.stopImmediatePropagation();
              if (e.added) {
                var selectedItem = e.added;
                var value = selectedItem.ref_key_value || selectedItem.sys_id;
                var displayValue = value ? getDisplayValue(selectedItem) : '';
                if (
                  field['_cat_variable'] === true &&
                  ('price' in selectedItem || 'recurring_price' in selectedItem)
                )
                  setPrice(selectedItem.price, selectedItem.recurring_price);
                g_form.setValue(field.name, value, displayValue);
                field.refTable = field.ed.reference;
              } else if (e.removed) {
                if (field['_cat_variable'] === true) setPrice(0, 0);
                g_form.clearValue(field.name);
              }
              if (e.type == 'select2-removed')
                $(e.currentTarget).parent().find('.select2-focusser').focus();
              setAccessiblePlaceholder();
            },
            onOpening: function (e) {
              select2EventBroker.publishSelect2Opening();
            },
          };
          var lookupMsg = jQuery("<span class='sr-only' />");
          lookupMsg.text(i18n.getMessage('Lookup using list'));
          function setAccessiblePlaceholder() {
            if (!field.value && getPlaceholder() === defaultPlaceholder)
              element.parent().find('.select2-chosen').append(lookupMsg);
            if (defaultPlaceholder !== getPlaceholder())
              element
                .parent()
                .find('.select2-input')
                .attr('placeholder', getPlaceholder());
          }
          function clearPlaceholder() {
            element.parent().find('.select2-input').attr('placeholder', '');
          }
          var config = {
            width: scope.selectWidth,
            placeholder: getPlaceholder(),
            minimumInputLength: scope.minimumInputLength
              ? parseInt(scope.minimumInputLength, 10)
              : 0,
            containerCssClass: 'select2-reference ng-form-element',
            formatSearching: '',
            allowClear: attrs.allowClear !== 'false',
            id: function (item) {
              return item.sys_id;
            },
            sortResults:
              scope.snOptions && scope.snOptions.sortResults
                ? scope.snOptions.sortResults
                : undefined,
            ajax: {
              quietMillis: NOW.ac_wait_time,
              data: function (filterText, page) {
                var filterExpression = filterExpressionParser.parse(
                  filterText,
                  scope.ed.defaultOperator
                );
                var q = '';
                var columnsToSearch = getReferenceColumnsToSearch();
                var queryArr = [];
                var query;
                var notNullRequired = filterText === '';
                columnsToSearch.forEach(function (colToSearch) {
                  query = '';
                  if (field.ed.queryString) query += field.ed.queryString + '^';
                  query +=
                    colToSearch +
                    filterExpression.operator +
                    filterExpression.filterText;
                  if (
                    notNullRequired &&
                    (!g_sort_elements_by_session_language || g_lang === 'en')
                  )
                    query += '^' + colToSearch + 'ISNOTEMPTY';
                  query += getExcludedValues();
                  queryArr.push(query);
                });
                q += queryArr.join('^NQ');
                if (refOrderBy) {
                  var orderByArr = refOrderBy.split(';');
                  for (var i = 0; i < orderByArr.length; i++)
                    q += '^ORDERBY' + orderByArr[i].trim();
                }
                q += '^EQ';
                var params = {
                  start: scope.pageSize * (page - 1),
                  count: scope.pageSize,
                  sysparm_target_table: scope.refTable,
                  sysparm_target_sys_id: scope.refId,
                  sysparm_target_field: field.name,
                  table: scope.ed.reference,
                  qualifier: scope.ed.qualifier,
                  data_adapter: scope.ed.data_adapter,
                  attributes: scope.ed.attributes,
                  dependent_field: scope.ed.dependent_field,
                  dependent_table: scope.ed.dependent_table,
                  dependent_value: scope.ed.dependent_value,
                  p: scope.ed.reference,
                  q: q,
                  r: scope.ed.qualifier,
                };
                if (displayColumns)
                  params.required_fields = displayColumns.split(';').join(':');
                if (scope.domain) {
                  params.sysparm_domain = scope.domain;
                }
                if (
                  angular.isDefined(field) &&
                  field['_cat_variable'] === true
                ) {
                  delete params['sysparm_target_table'];
                  params['sysparm_include_variables'] = true;
                  params['variable_ids'] = field.sys_id;
                  var getFieldSequence =
                    g_form.$private.options('getFieldSequence');
                  if (getFieldSequence) {
                    params['variable_sequence1'] = getFieldSequence();
                  }
                  var itemSysId = g_form.$private.options('itemSysId');
                  params['sysparm_id'] = itemSysId;
                  params['sysparm_query_refs'] = false;
                  var getFieldParams =
                    g_form.$private.options('getFieldParams');
                  if (getFieldParams) {
                    angular.extend(params, getFieldParams());
                  }
                }
                if (scope.recordValues)
                  params.sysparm_record_values = scope.recordValues();
                var encodedRecord =
                  g_form.getEncodedRecord && g_form.getEncodedRecord();
                if (encodedRecord)
                  params.sysparm_encoded_record = encodedRecord;
                return params;
              },
              results: function (data, page) {
                return ctrl.filterResults(data, page, scope.pageSize);
              },
              transport: s2Helpers.search,
            },
            formatSelection: s2Helpers.formatSelection,
            formatSelectionCssClass: s2Helpers.formatSelectionCssClass,
            formatResult: s2Helpers.formatResult,
            initSelection: s2Helpers.initSelection,
            dropdownCssClass: attrs.dropdownCssClass,
            formatResultCssClass: scope.formatResultCssClass || null,
            multiple: isMultiple,
          };
          if (
            isMultiple &&
            scope.ed.reference == 'sys_user' &&
            !scope.field._cat_variable
          ) {
            config.createSearchChoice = function (term) {
              if (spIs.an.email(term)) {
                return {
                  email: term,
                  name: term,
                  user_name: term,
                  sys_id: term,
                };
              }
            };
          }
          if (scope.snOptions && scope.snOptions.width) {
            config.width = scope.snOptions.width;
          }
          function getReferenceColumnsToSearch() {
            var colNames = ['name'];
            if (columnsSearch && displayColumns) {
              colNames = displayColumns.split(';');
              if (scope.ed.searchField) colNames.push(scope.ed.searchField);
            } else if (scope.ed.searchField) colNames = [scope.ed.searchField];
            else if (refOrderBy) colNames = [refOrderBy];
            return colNames.filter(onlyUnique);
          }
          function getExcludedValues() {
            if (scope.ed.excludeValues && scope.ed.excludeValues != '') {
              return '^sys_idNOT IN' + scope.ed.excludeValues;
            }
            return '';
          }
          function init() {
            scope.$evalAsync(function () {
              i18n.getMessage('Searching...', function (searchingMsg) {
                config.formatSearching = function () {
                  return searchingMsg;
                };
              });
              i18n.getMessage('No matches found', function (msg) {
                config.formatNoMatches = function () {
                  return msg;
                };
              });
              i18n.getMessage('Loading more results...', function (msg) {
                config.formatLoadMore = function (pageNumber) {
                  return msg;
                };
              });
              element.css('opacity', 1);
              element.select2('destroy');
              var select2 = element.select2(config);
              element.select2(
                'val',
                typeof field.value === 'string'
                  ? field.value.split(',')
                  : field.value
              );
              if (!isMultiple && spAriaUtil.g_accessibility == 'true') {
                var closeButton = element
                  .parent()
                  .find('.select2-search-choice-close');
                closeButton.attr('aria-label', i18n.getMessage('Clear'));
                closeButton.attr('tabindex', 0);
                closeButton.attr('role', 'button');
                closeButton.on('keydown', function (e) {
                  if (e.which === 13 || e.which === 32)
                    element.select2('val', '', true);
                });
              }
              if (isMultiple) {
                element.bind('select2-selecting', s2Helpers.onSelecting);
                element.bind('select2-removing', s2Helpers.onRemoving);
                element
                  .parent()
                  .on('keyup', '.select2-search-choice-close', function (evt) {
                    if (evt.which === 32) {
                      evt.stopImmediatePropagation();
                      evt.target.click();
                    }
                  });
              } else {
                element.bind('change select2-removed', s2Helpers.select2Change);
              }
              element.bind('select2-opening', s2Helpers.onOpening);
              element.bind('select2-blur', function () {
                scope.$evalAsync(function () {
                  scope.snOnBlur();
                  if (field.value === '') return;
                  var values =
                    typeof field.value === 'string'
                      ? field.value.split(',')
                      : field.value;
                  var displayValues = field.display_value_list;
                  g_form.setValue(field.name, values.join(','), displayValues);
                });
              });
              element.bind('select2-open', function () {
                if (element.data('select2').search.val() === ' ')
                  element.select2('search', '');
                isOpen = true;
                if (isMultiple) {
                  element
                    .parent()
                    .find(".select2-choices input[role='combobox']")
                    .attr('aria-expanded', isOpen);
                  setAccessiblePlaceholder();
                } else element.parent().find('.select2-focusser').attr('aria-expanded', isOpen);
              });
              element.bind('select2-close', function () {
                isOpen = false;
                if (isMultiple) {
                  element
                    .parent()
                    .find(".select2-choices input[role='combobox']")
                    .attr('aria-expanded', isOpen);
                  clearPlaceholder();
                } else element.parent().find('.select2-focusser').attr('aria-expanded', isOpen);
              });
              if (fireReadyEvent) {
                scope.$emit('select2.ready', element);
                fireReadyEvent = false;
              }
              setAccessiblePlaceholder();
              element
                .parent()
                .find('.select2-input')
                .attr('autocomplete', 'off');
              $(element).on('select2.disabled.toggle', function (element) {
                spAriaFocusManager.enableFocusOnDisabledSelect2(element);
              });
              var select2Results = element.parent().find('ul.select2-results');
              if (isMultiple) {
                var select2ComboBox = element
                  .parent()
                  .find(".select2-choices input[role='combobox']");
                element.parent().find('ul.select2-choices').removeAttr('role');
                select2ComboBox.attr('aria-expanded', isOpen);
                select2ComboBox.attr('aria-owns', select2Results.attr('id'));
                var select2Choices = element.parent().find('.select2-choices');
                select2Choices.addClass('form-control');
              } else {
                var select2Focusser = element
                  .parent()
                  .find('.select2-focusser');
                select2Focusser.removeAttr('aria-labelledby');
                select2Focusser.attr('aria-label', getAriaLabel());
                select2Focusser.attr('aria-required', field.isMandatory());
                select2Focusser.attr('aria-expanded', isOpen);
                select2Focusser.attr('aria-owns', select2Results.attr('id'));
              }
              select2Results.attr('aria-label', field.label);
              var select2Choice = element.parent().find('.select2-choice');
              var select2ChoiceClose = element
                .parent()
                .find('.select2-search-choice-close');
              select2Choice.attr('aria-hidden', 'true');
              select2ChoiceClose.on('focus blur', function (e) {
                if (e.type === 'focus')
                  select2Choice.attr('aria-hidden', 'false');
                else {
                  setTimeout(function () {
                    select2Choice.attr('aria-hidden', 'true');
                  }, 50);
                }
              });
              select2Choice.addClass('form-control');
              element
                .parent()
                .find('.select2-focusser')
                .on('keydown', function (e) {
                  if (e.which === 40 || e.which === 38) element.select2('open');
                });
              if (!isMultiple) {
                element.on('click', function (e) {
                  var selectionElem = element
                    .parent()
                    .find('.select2-focusser')[0];
                  if (
                    selectionElem &&
                    selectionElem.getAttribute('tabindex') === '-1'
                  )
                    selectionElem.removeAttribute('tabindex');
                });
                function swapFocusableEls(
                  domFocusableElems,
                  clearElemIndex,
                  selectionElemIndex
                ) {
                  var elem = domFocusableElems[clearElemIndex];
                  domFocusableElems[clearElemIndex] =
                    domFocusableElems[selectionElemIndex];
                  domFocusableElems[selectionElemIndex] = elem;
                  return domFocusableElems;
                }
                var referenceContainer = element.parent().parent();
                referenceContainer.on('keydown', function (e) {
                  var isPopoverContent = $(e.target).closest(
                    '.popover-content'
                  )[0];
                  if (isPopoverContent) return;
                  var selectionElem = element
                    .parent()
                    .find('.select2-focusser')[0];
                  if (selectionElem) selectionElem.removeAttribute('tabindex');
                  var domFocusableEls = window.tabbable(referenceContainer[0]);
                  if (!domFocusableEls.length) return;
                  var clearElem = element
                    .parent()
                    .find('.select2-search-choice-close')[0];
                  var selectionElemIndex =
                    domFocusableEls.indexOf(selectionElem);
                  var clearElemIndex = domFocusableEls.indexOf(clearElem);
                  if (clearElemIndex === -1) return;
                  var customFocusableEls = swapFocusableEls(
                    domFocusableEls,
                    clearElemIndex,
                    selectionElemIndex
                  );
                  var currentFocusableElemIndex = customFocusableEls.indexOf(
                    document.activeElement
                  );
                  var firstFocusableEl = customFocusableEls[0];
                  if (currentFocusableElemIndex == -1) return;
                  if (document.activeElement === clearElem && !e.shiftKey)
                    selectionElem.setAttribute('tabindex', '-1');
                  if (e.which === 9) {
                    if (e.shiftKey) {
                      if (document.activeElement === firstFocusableEl) return;
                      else if (
                        customFocusableEls[currentFocusableElemIndex - 1]
                      )
                        customFocusableEls[
                          currentFocusableElemIndex - 1
                        ].focus();
                    } else {
                      if (document.activeElement === clearElem) return;
                      else if (
                        customFocusableEls[currentFocusableElemIndex + 1]
                      )
                        customFocusableEls[
                          currentFocusableElemIndex + 1
                        ].focus();
                    }
                    event.preventDefault();
                    event.stopPropagation();
                  }
                });
              }
              var el = element.parent().find('.select2-focusser')[0];
              if (el) {
                var currentBindings = $._data(el, 'events')['keydown'];
                if ($.isArray(currentBindings))
                  currentBindings.unshift(currentBindings.pop());
              }
            });
          }
          function getAriaLabel() {
            var label = '';
            label += field.label;
            if (field.displayValue) {
              label += ' ' + field.displayValue;
            }
            return label;
          }
          function getDisplayValue(selectedItem) {
            var displayValue = '';
            if (
              selectedItem &&
              (selectedItem.ref_key_value || selectedItem.sys_id)
            ) {
              if (
                scope.displayColumn &&
                typeof selectedItem[scope.displayColumn] != 'undefined'
              )
                displayValue = selectedItem[scope.displayColumn];
              else if (selectedItem.$$displayValue)
                displayValue = selectedItem.$$displayValue;
              else if (selectedItem.name) displayValue = selectedItem.name;
              else if (selectedItem.title) displayValue = selectedItem.title;
            }
            return displayValue;
          }
          function getPriceValue(selectedItem) {
            var priceValue = {};
            if (selectedItem && selectedItem.sys_id) {
              priceValue.price = selectedItem.price ? selectedItem.price : 0.0;
              priceValue.recurring_price = selectedItem.recurring_price
                ? selectedItem.recurring_price
                : 0.0;
            }
            return priceValue;
          }
          function getDisplayValues(selectedItem) {
            var displayValues = [];
            if (selectedItem && selectedItem.sys_id) {
              displayValues.push(getDisplayValue(selectedItem));
            }
            if (displayColumns && refAutoCompleter === 'AJAXTableCompleter') {
              var columns = displayColumns.split(';');
              var defaultDisplayColumn =
                selectedItem && selectedItem.$$displayField;
              for (var i = 0; i < columns.length; i++) {
                if (defaultDisplayColumn === columns[i]) continue;
                var column = columns[i];
                displayValues.push(
                  selectedItem[column] ? selectedItem[column] : ''
                );
              }
            }
            return displayValues;
          }
          function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
          }
          function setPrice(p, rp) {
            field.price = p;
            field.recurring_price = rp;
          }
          function updatePrice(priceToUpdate, add) {
            field.price = Number(field.price);
            field.recurring_price = Number(field.recurring_price);
            if (!field.price) {
              field.price = 0.0;
            }
            if (!field.recurring_price) field.recurring_price = 0.0;
            if (add == true) {
              field.price += Number(priceToUpdate.price);
              field.recurring_price += Number(priceToUpdate.recurring_price);
            } else {
              field.price -= Number(priceToUpdate.price);
              field.recurring_price -= Number(priceToUpdate.recurring_price);
            }
          }
          g_form.$private.events.on(
            'change',
            function (fieldName, oldValue, value) {
              if (fieldName == field.name) {
                if (value == '' && field.display_value_list) {
                  field.display_value_list.length = 0;
                  if (field.price_value_list) field.price_value_list.length = 0;
                }
                if (!isMultiple && !oldValue && value) {
                  var ariaLiveMessage = i18n.format(
                    'To preview {0} details go back to preview button',
                    field.displayValue
                  );
                  spAriaUtil.sendLiveMessage(ariaLiveMessage);
                }
                element.select2(
                  'val',
                  typeof value == 'string' ? value.split(',') : value
                );
                element
                  .parent()
                  .find('.select2-focusser')
                  .attr('aria-label', getAriaLabel());
                element
                  .parent()
                  .find('.select2-focusser')
                  .attr('aria-required', field.isMandatory());
              }
            }
          );
          scope.$on('snReferencePicker.activate', function (evt, parms) {
            $scope.$evalAsync(function () {
              element.select2('open');
            });
          });
          scope.$on('select2.ready', function () {
            if (
              scope.labelId &&
              scope.field.type === 'reference' &&
              spAriaUtil.g_accessibility == 'true'
            ) {
              element
                .parent()
                .find('.select2-focusser')
                .attr('aria-labelledby', scope.labelId);
            }
          });
          init();
        },
        controller: function ($scope, $rootScope) {
          $scope.pageSize = NOW.ac_max_search_matches;
          this.filterResults = function (data, page) {
            return {
              results: data.data.items,
              more: page * $scope.pageSize < data.data.total,
            };
          };
        },
      };
    }
  );
