/*! RESOURCE: /scripts/app.$sp/service_catalog/directive.snSCAlsoRequestFor.js */
angular
  .module('sn.$sp')
  .directive(
    'snScAlsoRequestFor',
    function (
      $http,
      spUtil,
      filterExpressionParser,
      escapeHtml,
      i18n,
      md5,
      spAriaUtil,
      select2EventBroker,
      spAriaFocusManager,
      spScUtil,
      spSCConf
    ) {
      'use strict';
      return {
        restrict: 'E',
        replace: true,
        scope: {
          ed: '=?',
          field: '=',
          refTable: '=?',
          refId: '=?',
          snOptions: '=?',
          requestedFor: '=?',
          formatResultCssClass: '&',
          displayColumn: '@',
          recordValues: '&',
          getGlideForm: '&glideForm',
          domain: '@',
          snSelectWidth: '@',
        },
        template:
          '<input type="text" id="sp_formfield_{{::field.name}}" name="{{::field.name}}" style="min-width: 150px;" aria-hidden="true" />',
        controller: function ($scope, $rootScope) {
          $scope.pageSize = NOW.ac_max_search_matches;
          this.filterResults = function (data, page) {
            return {
              results: data.data.items,
              more: page * $scope.pageSize < data.data.total,
            };
          };
          this.handleServerValidation = function (itemId, field) {
            if (field.parent) {
              field.parent.also_request_for_Invalid = true;
              field.parent.isServerValidationDone = false;
              if (field.value == '') {
                handleSuccess(field);
                return;
              }
              if (field.value) {
                spScUtil
                  .validateDelegationForMultipleUsers(
                    itemId,
                    field.value.toString()
                  )
                  .then(
                    function () {
                      handleSuccess(field);
                    },
                    function (response) {
                      handleFailure(response, field);
                    }
                  );
              }
            }
          };
          function handleSuccess(field) {
            field.parent.isServerValidationDone = true;
            field.parent.also_request_for_Invalid = false;
            clearValidationMessage(field);
            $rootScope.$broadcast(
              '$sp.service_catalog.form_validation_complete'
            );
          }
          function handleFailure(response, field) {
            field.parent.isServerValidationDone = true;
            clearValidationMessage(field);
            addValidationMessage(
              field,
              i18n.format(
                i18n.getMessage('Item is unavailable for {0}'),
                response.data.result.invalidUsers.join(', ')
              ),
              'error'
            );
            field.parent.also_request_for_Invalid = true;
            $rootScope.$broadcast(
              '$sp.service_catalog.form_validation_complete'
            );
          }
          function clearValidationMessage(field) {
            if (!Array.isArray(field.validationMessages)) return;
            $scope.$evalAsync(field.validationMessages.shift());
          }
          function addValidationMessage(field, message) {
            if (!field.validationMessages) field.validationMessages = [];
            $scope.$evalAsync(
              field.validationMessages.push({
                message: message,
                type: 'error',
              })
            );
            spAriaUtil.sendLiveMessage(message);
          }
        },
        link: function (scope, element, attrs, ctrl) {
          scope.cacheData = {};
          scope.ed = scope.ed || scope.field.ed;
          scope.selectWidth = scope.snSelectWidth || '100%';
          element.css('opacity', 0);
          var isOpen = false;
          var fireReadyEvent = true;
          var g_form;
          var displayColumns;
          var refAutoCompleter;
          var refOrderBy;
          var field = scope.field;
          var isMultiple = true;
          if (angular.isDefined(scope.getGlideForm))
            g_form = scope.getGlideForm();
          var fieldAttributes = {};
          if (field.attributes && typeof scope.ed.attributes == 'undefined')
            if (Array.isArray(field.attributes))
              fieldAttributes = field.attributes;
            else fieldAttributes = spUtil.parseAttributes(field.attributes);
          else fieldAttributes = spUtil.parseAttributes(scope.ed.attributes);
          if (angular.isDefined(fieldAttributes['ref_ac_columns']))
            displayColumns = fieldAttributes['ref_ac_columns'];
          if (angular.isDefined(fieldAttributes['ref_auto_completer']))
            refAutoCompleter = fieldAttributes['ref_auto_completer'];
          else refAutoCompleter = 'AJAXReferenceCompleter';
          if (angular.isDefined(fieldAttributes['ref_ac_order_by']))
            refOrderBy = fieldAttributes['ref_ac_order_by'];
          var remove = i18n.getMessage('Remove');
          function getRemoveItem(label) {
            return jQuery("<span class='sr-only' />").text(
              remove + ' ' + label
            );
          }
          var s2Helpers = {
            formatSelection: function (item) {
              return escapeHtml(getDisplayValue(item));
            },
            formatSelectionCssClass: function (item, el) {
              var parentEl = el.parent();
              var anchorEl = parentEl.find('a');
              anchorEl.removeAttr('tabindex');
              anchorEl.addClass('fa fa-times');
              anchorEl.append(getRemoveItem(getDisplayValue(item)));
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
            onSelecting: function (e) {
              var selectedItem = e.choice;
              if ('sys_id' in selectedItem) {
                var values = field.value;
                var displayValues = field.display_value_list;
                values.push(selectedItem.sys_id);
                displayValues.push(getDisplayValue(selectedItem));
                setValue(values, displayValues);
                element
                  .parent()
                  .find('.select2-input')
                  .removeAttr('aria-activedescendant');
              }
            },
            onRemoving: function (e) {
              var removed = e.choice;
              var values = field.value;
              var displayValues = field.display_value_list;
              for (var i = values.length - 1; i >= 0; i--) {
                if (removed.sys_id == values[i]) {
                  values.splice(i, 1);
                  displayValues.splice(i, 1);
                  break;
                }
              }
              setValue(values, displayValues);
            },
            onOpening: function (e) {
              select2EventBroker.publishSelect2Opening();
            },
          };
          var config = {
            width: scope.selectWidth,
            placeholder: field.placeholder,
            maximumSelectionSize: spSCConf.MAX_ALSO_REQUEST_FOR,
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
                  sysparm_target_field: field.parent
                    ? field.parent.name
                    : field.name,
                  table: scope.ed.reference,
                  qualifier: scope.ed.qualifier,
                  data_adapter: scope.ed.data_adapter,
                  attributes: scope.ed.attributes,
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
                  params['variable_ids'] = field.parent
                    ? field.parent.sys_id
                    : field.sys_id;
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
            formatResultCssClass: scope.formatResultCssClass || null,
            multiple: isMultiple,
          };
          function getExcludedValues() {
            if (scope.requestedFor && scope.requestedFor != '')
              return '^sys_idNOT IN' + scope.requestedFor;
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
              element.bind('select2-selecting', s2Helpers.onSelecting);
              element.bind('select2-removing', s2Helpers.onRemoving);
              element.bind('select2-opening', s2Helpers.onOpening);
              element.bind('select2-blur', function () {
                scope.$evalAsync(function () {
                  var values = field.value;
                  var displayValues = field.display_value_list;
                  setValue(values, displayValues);
                });
              });
              element.bind('select2-open', function () {
                if (element.data('select2').search.val() === ' ')
                  element.select2('search', '');
                isOpen = true;
                element
                  .parent()
                  .find(".select2-choices input[role='combobox']")
                  .attr('aria-expanded', isOpen);
              });
              element.bind('select2-close', function () {
                isOpen = false;
                element
                  .parent()
                  .find(".select2-choices input[role='combobox']")
                  .attr('aria-expanded', isOpen);
              });
              if (fireReadyEvent) {
                scope.$emit('select2.ready', element);
                fireReadyEvent = false;
              }
              element
                .parent()
                .find('.select2-input')
                .attr('autocomplete', 'sp_formfield_' + field.name);
              $(element).on('select2.disabled.toggle', function (element) {
                spAriaFocusManager.enableFocusOnDisabledSelect2(element);
              });
              element.parent().find('ul.select2-choices').removeAttr('role');
              element
                .parent()
                .find(".select2-choices input[role='combobox']")
                .attr('aria-expanded', isOpen);
              var select2Choice = element.parent().find('.select2-choice');
              select2Choice.attr('aria-hidden', 'true');
              select2Choice.addClass('form-control');
              element
                .parent()
                .find('.select2-focusser')
                .on('keydown', function (e) {
                  if (e.which === 40 || e.which === 38)
                    e.stopImmediatePropagation();
                });
              var el = element.parent().find('.select2-focusser')[0];
              if (el) {
                var currentBindings = $._data(el, 'events')['keydown'];
                if ($.isArray(currentBindings))
                  currentBindings.unshift(currentBindings.pop());
              }
            });
          }
          if (scope.snOptions && scope.snOptions.width) {
            config.width = scope.snOptions.width;
          }
          function setValue(values, displayValues) {
            field.value = values;
            field.display_value_list = displayValues;
            field.parent.also_request_for_value = values.toString();
            ctrl.handleServerValidation(g_form.getSysId(), field);
          }
          function getReferenceColumnsToSearch() {
            var colNames = ['name'];
            if (
              fieldAttributes['ref_ac_columns_search'] == 'true' &&
              'ref_ac_columns' in fieldAttributes &&
              fieldAttributes['ref_ac_columns'] != ''
            ) {
              colNames = fieldAttributes['ref_ac_columns'].split(';');
              if (scope.ed.searchField) colNames.push(scope.ed.searchField);
            } else if (scope.ed.searchField) colNames = [scope.ed.searchField];
            else if (fieldAttributes['ref_ac_order_by'])
              colNames = [fieldAttributes['ref_ac_order_by']];
            return colNames.filter(onlyUnique);
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
          init();
        },
      };
    }
  );
