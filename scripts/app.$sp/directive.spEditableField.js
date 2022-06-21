/*! RESOURCE: /scripts/app.$sp/directive.spEditableField.js */
angular
  .module('sn.$sp')
  .directive(
    'spEditableField',
    function (
      glideFormFactory,
      $http,
      spUtil,
      spModelUtil,
      $timeout,
      i18n,
      spAriaUtil
    ) {
      return {
        restrict: 'E',
        templateUrl: 'sp_editable_field.xml',
        scope: {
          fieldModel: '=',
          table: '@',
          tableId: '=',
          block: '=?',
          editableByUser: '=',
          onChange: '=?',
          onSubmit: '=?',
          asyncSubmitValidation: '=?',
        },
        transclude: true,
        replace: true,
        controller: function ($scope) {
          var REST_API_PATH = '/api/now/v2/table/';
          var fieldSavedMsg = i18n.getMessage('{0} saved');
          var g_form;
          this.createShadowModel = function () {
            spModelUtil.extendField($scope.fieldModel);
            $scope.shadowModel = angular.copy($scope.fieldModel);
            $scope.shadowModel.table = $scope.table;
            $scope.shadowModel.sys_id = $scope.tableId;
            $scope.blockDisplay = $scope.block ? { display: 'block' } : {};
            $scope.editable =
              !$scope.shadowModel.readonly && $scope.editableByUser;
            $scope.fieldID =
              $scope.table +
              '-' +
              $scope.shadowModel.name.replace('.', '_dot_') +
              '-' +
              $scope.tableId;
            initGlideForm();
          };
          this.createShadowModel();
          $scope.getGlideForm = function () {
            return g_form;
          };
          $scope.saveForm = function () {
            if (g_form) g_form.submit();
            if (angular.isDefined($scope.asyncSubmitValidation)) {
              $scope
                .asyncSubmitValidation(g_form, $scope.shadowModel)
                .then(function (result) {
                  if (result) completeSave();
                });
            }
          };
          function completeSave() {
            var url =
              REST_API_PATH +
              $scope.table +
              '/' +
              $scope.tableId +
              '?sysparm_display_value=all&sysparm_fields=' +
              $scope.shadowModel.name;
            if (
              $scope.shadowModel.type === 'password' ||
              $scope.shadowModel.type === 'password2'
            )
              url += '&sysparm_input_display_value=true';
            var data = {};
            data[$scope.shadowModel.name] = $scope.shadowModel.value;
            $http
              .put(url, data)
              .success(function (data) {
                if (data.result) updateFieldModel(data.result);
                $scope.closePopover();
              })
              .error(function (reason) {
                console.log('Field update failure', reason);
                spUtil.retrieveSessionMessages();
              });
          }
          $scope.checkNullChoiceOverride = function () {
            if ($scope.fieldModel.type != 'choice') return;
            if ($scope.fieldModel.value || $scope.fieldModel.displayValue)
              return;
            var choices = $scope.fieldModel.choices || [];
            for (var i = 0; i < choices.length; i++) {
              if (choices[i].value == '') {
                $scope.fieldModel.displayValue = choices[i].label;
                return;
              }
            }
          };
          function updateFieldModel(record) {
            if (record && $scope.fieldModel.name in record) {
              var updated = record[$scope.fieldModel.name];
              $scope.fieldModel.value = updated.value;
              $scope.fieldModel.displayValue = updated.display_value;
              $scope.checkNullChoiceOverride();
              spAriaUtil.sendLiveMessage(
                spUtil.format(fieldSavedMsg, {
                  0: $scope.fieldModel.label || '',
                })
              );
            }
          }
          function initGlideForm() {
            if (g_form) g_form.$private.events.cleanup();
            var uiMessageHandler = function (g_form, type, message) {
              switch (type) {
                case 'infoMessage':
                  spUtil.addInfoMessage(message);
                  break;
                case 'errorMessage':
                  spUtil.addErrorMessage(message);
                  break;
                case 'clearMessages':
                  spUtil.clearMessages();
                  break;
                default:
                  return false;
              }
            };
            g_form = glideFormFactory.create(
              $scope,
              $scope.table,
              $scope.tableId,
              [$scope.shadowModel],
              null,
              { uiMessageHandler: uiMessageHandler }
            );
            $scope.$emit(
              'spEditableField.gForm.initialized',
              g_form,
              $scope.shadowModel
            );
            if (angular.isDefined($scope.onChange))
              g_form.$private.events.on(
                'change',
                function (fieldName, oldValue, newValue) {
                  return $scope.onChange.call(
                    $scope.onChange,
                    g_form,
                    $scope.shadowModel,
                    oldValue,
                    newValue
                  );
                }
              );
            if (angular.isDefined($scope.onSubmit))
              g_form.$private.events.on('submit', function () {
                return $scope.onSubmit.call(
                  $scope.onSubmit,
                  g_form,
                  $scope.shadowModel
                );
              });
            if (!angular.isDefined($scope.asyncSubmitValidation)) {
              g_form.$private.events.on('submitted', function () {
                completeSave();
              });
            }
          }
        },
        link: function (scope, el, attrs, ctrl) {
          var returnFocus = true;
          scope.checkNullChoiceOverride();
          scope.closePopover = function () {
            if (scope.shadowModel.popoverIsOpen) ctrl.createShadowModel();
            scope.shadowModel.popoverIsOpen = false;
            if (returnFocus) {
              var trigger = el[0].querySelector(
                '.popover-trigger-' + scope.fieldID
              );
              trigger.focus();
            }
            $('body').off('keydown', executeEventHandlers);
            $('body').off('click', closePopoverOnOutsideClick);
          };
          scope.toggleClick = function ($event) {
            if ($event.type === 'click') {
              scope.togglePopover($event);
            }
          };
          scope.toggleKeydown = function ($event) {
            if ($event.which === 13 || $event.which === 32) {
              scope.togglePopover($event);
              $event.preventDefault();
              $event.stopPropagation();
            }
          };
          scope.togglePopover = function (evt) {
            scope.shadowModel.popoverIsOpen = !scope.shadowModel.popoverIsOpen;
            scope.shadowModel.value = scope.shadowModel.stagedValue =
              scope.fieldModel.value;
            scope.shadowModel.displayValue = scope.fieldModel.displayValue;
            $timeout(function () {
              var popOverElem = el.parent().find('.popover')[0];
              if (popOverElem) {
                popOverElem.setAttribute('role', 'dialog');
                popOverElem.setAttribute('aria-label', scope.shadowModel.label);
              }
            }, 0);
            var triggerEl = el.parent().find('.bs-popover')[0];
            if (triggerEl) {
              var expanded = triggerEl.getAttribute('aria-expanded');
              triggerEl.setAttribute(
                'aria-expanded',
                expanded === 'true' ? false : true
              );
            }
            if (scope.shadowModel.popoverIsOpen) {
              returnFocus = true;
              $('body').on('keydown', executeEventHandlers);
              $('body').on('click', closePopoverOnOutsideClick);
            }
          };
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
          function executeEventHandlers(event) {
            trapKeyboardFocus(event);
            closePopoverOnEscape(event);
          }
          function trapKeyboardFocus(event) {
            if (!scope.shadowModel.popoverIsOpen) return;
            var isModalElement = $(event.target).closest('.modal')[0];
            if (isModalElement) return;
            var domFocusableEls = window.tabbable(
              el[0].querySelector('[uib-popover-template-popup]')
            );
            if (!domFocusableEls.length) return;
            var selectionElem = el.find('.select2-focusser')[0];
            var clearElem = el.find('.select2-search-choice-close')[0];
            var selectionElemIndex = domFocusableEls.indexOf(selectionElem);
            var clearElemIndex = domFocusableEls.indexOf(clearElem);
            var focusableEls = [];
            var currentFocusableElemIndex, firstFocusableEl, lastFocusableEl;
            if (clearElemIndex !== -1)
              focusableEls = swapFocusableEls(
                domFocusableEls,
                clearElemIndex,
                selectionElemIndex
              );
            else focusableEls = domFocusableEls.slice();
            currentFocusableElemIndex = focusableEls.indexOf(
              document.activeElement
            );
            firstFocusableEl = focusableEls[0];
            lastFocusableEl = focusableEls[focusableEls.length - 1];
            if (currentFocusableElemIndex == -1) return;
            if (event.which === 9) {
              if (event.shiftKey) {
                if (document.activeElement === firstFocusableEl)
                  lastFocusableEl.focus();
                else if (focusableEls[currentFocusableElemIndex - 1])
                  focusableEls[currentFocusableElemIndex - 1].focus();
              } else {
                if (document.activeElement === lastFocusableEl)
                  firstFocusableEl.focus();
                else if (focusableEls[currentFocusableElemIndex + 1])
                  focusableEls[currentFocusableElemIndex + 1].focus();
              }
              event.preventDefault();
              event.stopPropagation();
            }
          }
          function isModalLaunchedFromPopOver() {
            var modal = $('.modal.in');
            return (
              modal.length && !modal.find('.sp-editable-field .popover').length
            );
          }
          function isTooltipContainedInPopOver() {
            return $('[uib-popover-template-popup]').find('.tooltip.in').length;
          }
          function closePopoverOnEscape(event) {
            if (
              event.which === 27 &&
              !isModalLaunchedFromPopOver() &&
              !isTooltipContainedInPopOver()
            )
              closePopover();
          }
          function closePopover() {
            scope.$evalAsync('closePopover()');
          }
          function closePopoverOnOutsideClick(event) {
            var $et = $(event.target);
            var closeButton =
              $et.attr('ng-click') && $et.attr('ng-click') === 'closePopover()';
            var saveButton =
              $et.attr('ng-click') && $et.attr('ng-click') === 'saveForm()';
            if (closeButton || saveButton) return;
            if (
              !(
                $et.closest('.popover-' + scope.fieldID).length ||
                $et.closest('.popover-trigger-' + scope.fieldID).length
              ) &&
              !$et.closest('[uib-popover-template-popup]').length &&
              $et.attr('uib-popover-template-popup') !== '' &&
              !isModalLaunchedFromPopOver()
            ) {
              returnFocus = false;
              scope.$evalAsync('closePopover()');
            }
          }
          scope.$on('$destroy', function () {
            $('body').off('keydown', executeEventHandlers);
            $('body').off('click', closePopoverOnOutsideClick);
          });
          scope.$on('sp.spFormField.rendered', function (e, element, input) {
            var parent = input.parent();
            var select2Input = parent[0].querySelector(
              '.select2-container input'
            );
            $timeout(
              function () {
                if (select2Input) select2Input.focus();
                else input.focus();
              },
              0,
              false
            );
          });
        },
      };
    }
  );
angular
  .module('sn.$sp')
  .directive(
    'spEditableField2',
    function (glideFormFactory, $http, spUtil, spModelUtil) {
      return {
        restrict: 'E',
        templateUrl: 'sp_editable_field2.xml',
        scope: {
          fieldModel: '=',
          table: '@',
          tableId: '=',
          block: '=?',
          editableByUser: '=',
          onChange: '=?',
          onSubmit: '=?',
          label: '@?',
        },
        transclude: true,
        replace: true,
        controller: function ($scope) {
          var REST_API_PATH = '/api/now/v2/table/';
          var g_form;
          $scope.fieldModel = $scope.fieldModel || {};
          if (angular.isDefined($scope.label))
            $scope.fieldModel.label = $scope.label;
          $scope.editable =
            !$scope.fieldModel.readonly && $scope.editableByUser;
          $scope.fieldID =
            $scope.table + '-' + $scope.fieldModel.name + '-' + $scope.tableId;
          initGlideForm();
          $scope.getGlideForm = function () {
            return g_form;
          };
          $scope.$on('sp.spEditableField.save', function (e, fieldModel) {
            if (fieldModel == $scope.fieldModel) $scope.saveForm();
          });
          $scope.saveForm = function () {
            if (g_form) g_form.submit();
          };
          function completeSave() {
            var url =
              REST_API_PATH +
              $scope.table +
              '/' +
              $scope.tableId +
              '?sysparm_fields=' +
              $scope.fieldModel.name;
            var data = {};
            data[$scope.fieldModel.name] = $scope.fieldModel.value;
            $http
              .put(url, data)
              .success(function (data) {
                console.log('Field update successful', data);
              })
              .error(function (reason) {
                console.log('Field update failure', reason);
                spUtil.retrieveSessionMessages();
              });
          }
          function initGlideForm() {
            if (g_form) g_form.$private.events.cleanup();
            var uiMessageHandler = function (g_form, type, message) {
              switch (type) {
                case 'addInfoMessage':
                  spUtil.addInfoMessage(message);
                  break;
                case 'addErrorMessage':
                  spUtil.addErrorMessage(message);
                  break;
                case 'clearMessages':
                  break;
                default:
              }
            };
            spModelUtil.extendField($scope.fieldModel);
            g_form = glideFormFactory.create(
              $scope,
              $scope.table,
              $scope.tableId,
              [$scope.fieldModel],
              null,
              { uiMessageHandler: uiMessageHandler }
            );
            $scope.$emit(
              'spEditableField.gForm.initialized',
              g_form,
              $scope.fieldModel
            );
            if (angular.isDefined($scope.onChange)) {
              g_form.$private.events.on(
                'change',
                function (fieldName, oldValue, newValue) {
                  return $scope.onChange.call(
                    $scope.onChange,
                    g_form,
                    $scope.fieldModel,
                    oldValue,
                    newValue
                  );
                }
              );
            }
            if (angular.isDefined($scope.onSubmit))
              g_form.$private.events.on('submit', function () {
                return $scope.onSubmit.call($scope.onSubmit, g_form);
              });
            g_form.$private.events.on('submitted', function () {
              completeSave();
            });
          }
        },
      };
    }
  );
