/*! RESOURCE: /scripts/sn/common/ui/directive.snDialog.js */
angular
  .module('sn.common.ui')
  .directive('snDialog', function ($timeout, $rootScope, $document) {
    'use strict';
    return {
      restrict: 'AE',
      transclude: true,
      scope: {
        modal: '=?',
        disableAutoFocus: '=?',
        classCheck: '=',
      },
      replace: true,
      template:
        '<dialog ng-keydown="escape($event)"><div ng-click="onClickClose()" title="Close" class="close-button icon-button icon-cross"></div></dialog>',
      link: function (scope, element, attrs, ctrl, transcludeFn) {
        var transcludeScope = {};
        var _focusTrap = null;
        scope.isOpen = function () {
          return element[0].open;
        };
        transcludeFn(element.scope().$new(), function (a, b) {
          element.prepend(
            '<i class="sn-dialog-focus-trap-boundary" tabindex="0" ></i>'
          );
          element.append(a);
          element.append(
            '<i class="sn-dialog-focus-trap-boundary" tabindex="0" ></i>'
          );
          transcludeScope = b;
        });
        element.click(function (event) {
          event.stopPropagation();
          if (
            event.offsetX < 0 ||
            event.offsetX > element[0].offsetWidth ||
            event.offsetY < 0 ||
            event.offsetY > element[0].offsetHeight
          )
            if (!scope.classCheck) scope.onClickClose();
            else {
              var classes = scope.classCheck.split(',');
              var found = false;
              for (var i = 0; i < classes.length; i++)
                if (
                  angular.element(event.target).closest(classes[i]).length > 0
                )
                  found = true;
              if (!found) scope.onClickClose();
            }
        });
        scope.show = function () {
          var d = element[0];
          if (!d.showModal || true) {
            dialogPolyfill.registerDialog(d);
            d.setDisableAutoFocus(scope.disableAutoFocus);
          }
          if (scope.modal) d.showModal();
          else d.show();
          if (!angular.element(d).hasClass('sn-alert')) {
            $timeout(function () {
              if (d.dialogPolyfillInfo && d.dialogPolyfillInfo.backdrop) {
                angular
                  .element(d.dialogPolyfillInfo.backdrop)
                  .one('click', function (event) {
                    if (
                      !scope.classCheck ||
                      angular
                        .element(event.srcElement)
                        .closest(scope.classCheck).length == 0
                    )
                      scope.onClickClose();
                  });
              } else {
                $document.on('click', function (event) {
                  if (
                    !scope.classCheck ||
                    angular.element(event.srcElement).closest(scope.classCheck)
                      .length == 0
                  )
                    scope.onClickClose();
                });
              }
            });
          }
          element.find('.btn-primary').eq(0).focus();
        };
        scope.setPosition = function (data) {
          var contextData = scope.getContextData(data);
          if (contextData && element && element[0]) {
            if (contextData.position) {
              element[0].style.top = contextData.position.top + 'px';
              element[0].style.left = contextData.position.left + 'px';
              element[0].style.margin = '0px';
            }
            if (contextData.dimensions) {
              element[0].style.width = contextData.dimensions.width + 'px';
              element[0].style.height = contextData.dimensions.height + 'px';
            }
          }
        };
        scope.$on('dialog.' + attrs.name + '.move', function (event, data) {
          scope.setPosition(data);
        });
        scope.$on('dialog.' + attrs.name + '.show', function (event, data) {
          scope.setPosition(data);
          scope.setKeyEvents(data);
          if (scope.isOpen() === true) scope.close();
          else scope.show();
          angular.element('.sn-dialog-menu').each(function (index, value) {
            var name = angular.element(this).attr('name');
            if (name != attrs.name && !angular.element(this).attr('open')) {
              return true;
            }
            if (name != attrs.name && angular.element(this).attr('open')) {
              $rootScope.$broadcast('dialog.' + name + '.close');
            }
          });
          activateFocusTrap();
        });
        scope.onClickClose = function () {
          if (scope.isOpen())
            $rootScope.$broadcast('dialog.' + attrs.name + '.close');
        };
        scope.escape = function ($event) {
          if ($event.keyCode === 27) {
            scope.onClickClose();
          }
        };
        scope.close = function () {
          var d = element[0];
          d.close();
          scope.removeListeners();
          deactivateFocusTrap();
        };
        scope.ok = function (contextData) {
          contextData.ok();
          scope.removeListeners();
        };
        scope.cancel = function (contextData) {
          contextData.cancel();
          scope.removeListeners();
        };
        scope.removeListeners = function () {
          element[0].removeEventListener('ok', scope.handleContextOk, false);
          element[0].removeEventListener(
            'cancel',
            scope.handleContextCancel,
            false
          );
        };
        scope.setKeyEvents = function (data) {
          var contextData = scope.getContextData(data);
          if (contextData && contextData.cancel) {
            scope.handleContextOk = function () {
              scope.ok(contextData);
            };
            scope.handleContextCancel = function () {
              scope.cancel(contextData);
            };
            element[0].addEventListener('ok', scope.handleContextOk, false);
            element[0].addEventListener(
              'cancel',
              scope.handleContextCancel,
              false
            );
          }
        };
        scope.getContextData = function (data) {
          var context = attrs.context;
          var contextData = null;
          if (context && data && context in data) {
            contextData = data[context];
            transcludeScope[context] = contextData;
          }
          return contextData;
        };
        scope.$on('dialog.' + attrs.name + '.close', scope.close);
        function focusTrap(element) {
          var getSentinelElements = function () {
            var boundarySelector = '.sn-dialog-focus-trap-boundary';
            var sentinelNodes = element.querySelectorAll(boundarySelector);
            return sentinelNodes;
          };
          var getTabbableElements = function (elm, selector) {
            var tabbables = window.tabbable
              ? window.tabbable(elm, selector)
              : [];
            return tabbables;
          };
          var focusElement = function (reverse) {
            return function (e) {
              var selectors =
                'iframe, input, select, a[href], textarea, button, [tabindex]:not(.sn-dialog-focus-trap-boundary), [contenteditable]:not([contenteditable="false"])';
              var tabbables = getTabbableElements(element, selectors);
              if (tabbables.length === 0) return;
              var newTarget = reverse
                ? tabbables[tabbables.length - 1]
                : tabbables[0];
              if (newTarget.tagName == 'IFRAME') {
                var frameElements = getTabbableElements(
                  newTarget.contentDocument
                );
                if (frameElements.length > 0)
                  newTarget = reverse
                    ? frameElements[frameElements.length - 1]
                    : frameElements[0];
              }
              newTarget.focus();
            };
          };
          var sentinelElements = getSentinelElements();
          var topSentinelElement = sentinelElements[0];
          var bottomSentinelElement = sentinelElements[1];
          var nodeFocusedBeforeActivation = null;
          var forwardTrap = focusElement(true);
          var reverseTrap = focusElement(false);
          var activate = function () {
            nodeFocusedBeforeActivation = document.activeElement;
            topSentinelElement.addEventListener('focusin', forwardTrap);
            bottomSentinelElement.addEventListener('focusin', reverseTrap);
          };
          var deactivate = function () {
            if (nodeFocusedBeforeActivation)
              nodeFocusedBeforeActivation.focus();
            topSentinelElement.removeEventListener('focusin', forwardTrap);
            bottomSentinelElement.removeEventListener('focusin', reverseTrap);
          };
          return {
            activate: activate,
            deactivate: deactivate,
          };
        }
        function activateFocusTrap() {
          if (_focusTrap) return;
          _focusTrap = focusTrap(element[0]);
          _focusTrap.activate();
        }
        function deactivateFocusTrap() {
          if (!_focusTrap) return;
          _focusTrap.deactivate();
          _focusTrap = null;
        }
      },
    };
  });