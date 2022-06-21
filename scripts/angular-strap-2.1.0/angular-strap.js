/*! RESOURCE: /scripts/angular-strap-2.1.0/angular-strap.js */
(function (window, document, undefined) {
  'use strict';
  angular.module('mgcrea.ngStrap', [
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.aside',
    'mgcrea.ngStrap.alert',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.select',
    'mgcrea.ngStrap.datepicker',
    'mgcrea.ngStrap.timepicker',
    'mgcrea.ngStrap.navbar',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.dropdown',
    'mgcrea.ngStrap.typeahead',
    'mgcrea.ngStrap.scrollspy',
    'mgcrea.ngStrap.affix',
    'mgcrea.ngStrap.tab',
    'mgcrea.ngStrap.collapse',
  ]);
  angular
    .module('mgcrea.ngStrap.affix', [
      'mgcrea.ngStrap.helpers.dimensions',
      'mgcrea.ngStrap.helpers.debounce',
    ])
    .provider('$affix', function () {
      var defaults = (this.defaults = {
        offsetTop: 'auto',
      });
      this.$get = [
        '$window',
        'debounce',
        'dimensions',
        function ($window, debounce, dimensions) {
          var bodyEl = angular.element($window.document.body);
          var windowEl = angular.element($window);
          function AffixFactory(element, config) {
            var $affix = {};
            var options = angular.extend({}, defaults, config);
            var targetEl = options.target;
            var reset = 'affix affix-top affix-bottom',
              initialAffixTop = 0,
              initialOffsetTop = 0,
              offsetTop = 0,
              offsetBottom = 0,
              affixed = null,
              unpin = null;
            var parent = element.parent();
            if (options.offsetParent) {
              if (options.offsetParent.match(/^\d+$/)) {
                for (var i = 0; i < options.offsetParent * 1 - 1; i++) {
                  parent = parent.parent();
                }
              } else {
                parent = angular.element(options.offsetParent);
              }
            }
            $affix.init = function () {
              $affix.$parseOffsets();
              initialOffsetTop =
                dimensions.offset(element[0]).top + initialAffixTop;
              targetEl.on('scroll', $affix.checkPosition);
              targetEl.on('click', $affix.checkPositionWithEventLoop);
              windowEl.on('resize', $affix.$debouncedOnResize);
              $affix.checkPosition();
              $affix.checkPositionWithEventLoop();
            };
            $affix.destroy = function () {
              targetEl.off('scroll', $affix.checkPosition);
              targetEl.off('click', $affix.checkPositionWithEventLoop);
              windowEl.off('resize', $affix.$debouncedOnResize);
            };
            $affix.checkPositionWithEventLoop = function () {
              setTimeout($affix.checkPosition, 1);
            };
            $affix.checkPosition = function () {
              var scrollTop = getScrollTop();
              var position = dimensions.offset(element[0]);
              var elementHeight = dimensions.height(element[0]);
              var affix = getRequiredAffixClass(unpin, position, elementHeight);
              if (affixed === affix) return;
              affixed = affix;
              element
                .removeClass(reset)
                .addClass('affix' + (affix !== 'middle' ? '-' + affix : ''));
              if (affix === 'top') {
                unpin = null;
                element.css('position', options.offsetParent ? '' : 'relative');
                element.css('top', '');
              } else if (affix === 'bottom') {
                if (options.offsetUnpin) {
                  unpin = -(options.offsetUnpin * 1);
                } else {
                  unpin = position.top - scrollTop;
                }
                element.css('position', options.offsetParent ? '' : 'relative');
                element.css(
                  'top',
                  options.offsetParent
                    ? ''
                    : bodyEl[0].offsetHeight -
                        offsetBottom -
                        elementHeight -
                        initialOffsetTop +
                        'px'
                );
              } else {
                unpin = null;
                element.css('position', 'fixed');
                element.css('top', initialAffixTop + 'px');
              }
            };
            $affix.$onResize = function () {
              $affix.$parseOffsets();
              $affix.checkPosition();
            };
            $affix.$debouncedOnResize = debounce($affix.$onResize, 50);
            $affix.$parseOffsets = function () {
              element.css('position', options.offsetParent ? '' : 'relative');
              if (options.offsetTop) {
                if (options.offsetTop === 'auto') {
                  options.offsetTop = '+0';
                }
                if (options.offsetTop.match(/^[-+]\d+$/)) {
                  initialAffixTop = -options.offsetTop * 1;
                  if (options.offsetParent) {
                    offsetTop =
                      dimensions.offset(parent[0]).top + options.offsetTop * 1;
                  } else {
                    offsetTop =
                      dimensions.offset(element[0]).top -
                      dimensions.css(element[0], 'marginTop', true) +
                      options.offsetTop * 1;
                  }
                } else {
                  offsetTop = options.offsetTop * 1;
                }
              }
              if (options.offsetBottom) {
                if (
                  options.offsetParent &&
                  options.offsetBottom.match(/^[-+]\d+$/)
                ) {
                  offsetBottom =
                    getScrollHeight() -
                    (dimensions.offset(parent[0]).top +
                      dimensions.height(parent[0])) +
                    options.offsetBottom * 1 +
                    1;
                } else {
                  offsetBottom = options.offsetBottom * 1;
                }
              }
            };
            function getRequiredAffixClass(unpin, position, elementHeight) {
              var scrollTop = getScrollTop();
              var scrollHeight = getScrollHeight();
              if (scrollTop <= offsetTop) {
                return 'top';
              } else if (unpin !== null && scrollTop + unpin <= position.top) {
                return 'middle';
              } else if (
                offsetBottom !== null &&
                position.top + elementHeight + initialAffixTop >=
                  scrollHeight - offsetBottom
              ) {
                return 'bottom';
              } else {
                return 'middle';
              }
            }
            function getScrollTop() {
              return targetEl[0] === $window
                ? $window.pageYOffset
                : targetEl[0].scrollTop;
            }
            function getScrollHeight() {
              return targetEl[0] === $window
                ? $window.document.body.scrollHeight
                : targetEl[0].scrollHeight;
            }
            $affix.init();
            return $affix;
          }
          return AffixFactory;
        },
      ];
    })
    .directive('bsAffix', [
      '$affix',
      '$window',
      function ($affix, $window) {
        return {
          restrict: 'EAC',
          require: '^?bsAffixTarget',
          link: function postLink(scope, element, attr, affixTarget) {
            var options = {
              scope: scope,
              offsetTop: 'auto',
              target: affixTarget
                ? affixTarget.$element
                : angular.element($window),
            };
            angular.forEach(
              ['offsetTop', 'offsetBottom', 'offsetParent', 'offsetUnpin'],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            var affix = $affix(element, options);
            scope.$on('$destroy', function () {
              affix && affix.destroy();
              options = null;
              affix = null;
            });
          },
        };
      },
    ])
    .directive('bsAffixTarget', function () {
      return {
        controller: [
          '$element',
          function ($element) {
            this.$element = $element;
          },
        ],
      };
    });
  angular
    .module('mgcrea.ngStrap.aside', ['mgcrea.ngStrap.modal'])
    .provider('$aside', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade-and-slide-right',
        prefixClass: 'aside',
        placement: 'right',
        template: 'aside/aside.tpl.html',
        contentTemplate: false,
        container: false,
        element: null,
        backdrop: true,
        keyboard: true,
        html: false,
        show: true,
      });
      this.$get = [
        '$modal',
        function ($modal) {
          function AsideFactory(config) {
            var $aside = {};
            var options = angular.extend({}, defaults, config);
            $aside = $modal(options);
            return $aside;
          }
          return AsideFactory;
        },
      ];
    })
    .directive('bsAside', [
      '$window',
      '$sce',
      '$aside',
      function ($window, $sce, $aside) {
        var requestAnimationFrame =
          $window.requestAnimationFrame || $window.setTimeout;
        return {
          restrict: 'EAC',
          scope: true,
          link: function postLink(scope, element, attr, transclusion) {
            var options = { scope: scope, element: element, show: false };
            angular.forEach(
              [
                'template',
                'contentTemplate',
                'placement',
                'backdrop',
                'keyboard',
                'html',
                'container',
                'animation',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            angular.forEach(['title', 'content'], function (key) {
              attr[key] &&
                attr.$observe(key, function (newValue, oldValue) {
                  scope[key] = $sce.trustAsHtml(newValue);
                });
            });
            attr.bsAside &&
              scope.$watch(
                attr.bsAside,
                function (newValue, oldValue) {
                  if (angular.isObject(newValue)) {
                    angular.extend(scope, newValue);
                  } else {
                    scope.content = newValue;
                  }
                },
                true
              );
            var aside = $aside(options);
            element.on(attr.trigger || 'click', aside.toggle);
            scope.$on('$destroy', function () {
              if (aside) aside.destroy();
              options = null;
              aside = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.alert', ['mgcrea.ngStrap.modal'])
    .provider('$alert', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        prefixClass: 'alert',
        placement: null,
        template: 'alert/alert.tpl.html',
        container: false,
        element: null,
        backdrop: false,
        keyboard: true,
        show: true,
        duration: false,
        type: false,
        dismissable: true,
      });
      this.$get = [
        '$modal',
        '$timeout',
        function ($modal, $timeout) {
          function AlertFactory(config) {
            var $alert = {};
            var options = angular.extend({}, defaults, config);
            $alert = $modal(options);
            $alert.$scope.dismissable = !!options.dismissable;
            if (options.type) {
              $alert.$scope.type = options.type;
            }
            var show = $alert.show;
            if (options.duration) {
              $alert.show = function () {
                show();
                $timeout(function () {
                  $alert.hide();
                }, options.duration * 1000);
              };
            }
            return $alert;
          }
          return AlertFactory;
        },
      ];
    })
    .directive('bsAlert', [
      '$window',
      '$sce',
      '$alert',
      function ($window, $sce, $alert) {
        var requestAnimationFrame =
          $window.requestAnimationFrame || $window.setTimeout;
        return {
          restrict: 'EAC',
          scope: true,
          link: function postLink(scope, element, attr, transclusion) {
            var options = { scope: scope, element: element, show: false };
            angular.forEach(
              [
                'template',
                'placement',
                'keyboard',
                'html',
                'container',
                'animation',
                'duration',
                'dismissable',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            angular.forEach(['title', 'content', 'type'], function (key) {
              attr[key] &&
                attr.$observe(key, function (newValue, oldValue) {
                  scope[key] = $sce.trustAsHtml(newValue);
                });
            });
            attr.bsAlert &&
              scope.$watch(
                attr.bsAlert,
                function (newValue, oldValue) {
                  if (angular.isObject(newValue)) {
                    angular.extend(scope, newValue);
                  } else {
                    scope.content = newValue;
                  }
                },
                true
              );
            var alert = $alert(options);
            element.on(attr.trigger || 'click', alert.toggle);
            scope.$on('$destroy', function () {
              if (alert) alert.destroy();
              options = null;
              alert = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.button', [])
    .provider('$button', function () {
      var defaults = (this.defaults = {
        activeClass: 'active',
        toggleEvent: 'click',
      });
      this.$get = function () {
        return { defaults: defaults };
      };
    })
    .directive('bsCheckboxGroup', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        compile: function postLink(element, attr) {
          element.attr('data-toggle', 'buttons');
          element.removeAttr('ng-model');
          var children = element[0].querySelectorAll('input[type="checkbox"]');
          angular.forEach(children, function (child) {
            var childEl = angular.element(child);
            childEl.attr('bs-checkbox', '');
            childEl.attr(
              'ng-model',
              attr.ngModel + '.' + childEl.attr('value')
            );
          });
        },
      };
    })
    .directive('bsCheckbox', [
      '$button',
      '$$rAF',
      function ($button, $$rAF) {
        var defaults = $button.defaults;
        var constantValueRegExp = /^(true|false|\d+)$/;
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function postLink(scope, element, attr, controller) {
            var options = defaults;
            var isInput = element[0].nodeName === 'INPUT';
            var activeElement = isInput ? element.parent() : element;
            var trueValue = angular.isDefined(attr.trueValue)
              ? attr.trueValue
              : true;
            if (constantValueRegExp.test(attr.trueValue)) {
              trueValue = scope.$eval(attr.trueValue);
            }
            var falseValue = angular.isDefined(attr.falseValue)
              ? attr.falseValue
              : false;
            if (constantValueRegExp.test(attr.falseValue)) {
              falseValue = scope.$eval(attr.falseValue);
            }
            var hasExoticValues =
              typeof trueValue !== 'boolean' || typeof falseValue !== 'boolean';
            if (hasExoticValues) {
              controller.$parsers.push(function (viewValue) {
                return viewValue ? trueValue : falseValue;
              });
              scope.$watch(attr.ngModel, function (newValue, oldValue) {
                controller.$render();
              });
            }
            controller.$render = function () {
              var isActive = angular.equals(controller.$modelValue, trueValue);
              $$rAF(function () {
                if (isInput) element[0].checked = isActive;
                activeElement.toggleClass(options.activeClass, isActive);
              });
            };
            element.bind(options.toggleEvent, function () {
              scope.$apply(function () {
                if (!isInput) {
                  controller.$setViewValue(!activeElement.hasClass('active'));
                }
                if (!hasExoticValues) {
                  controller.$render();
                }
              });
            });
          },
        };
      },
    ])
    .directive('bsRadioGroup', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        compile: function postLink(element, attr) {
          element.attr('data-toggle', 'buttons');
          element.removeAttr('ng-model');
          var children = element[0].querySelectorAll('input[type="radio"]');
          angular.forEach(children, function (child) {
            angular.element(child).attr('bs-radio', '');
            angular.element(child).attr('ng-model', attr.ngModel);
          });
        },
      };
    })
    .directive('bsRadio', [
      '$button',
      '$$rAF',
      function ($button, $$rAF) {
        var defaults = $button.defaults;
        var constantValueRegExp = /^(true|false|\d+)$/;
        return {
          restrict: 'A',
          require: 'ngModel',
          link: function postLink(scope, element, attr, controller) {
            var options = defaults;
            var isInput = element[0].nodeName === 'INPUT';
            var activeElement = isInput ? element.parent() : element;
            var value = constantValueRegExp.test(attr.value)
              ? scope.$eval(attr.value)
              : attr.value;
            controller.$render = function () {
              var isActive = angular.equals(controller.$modelValue, value);
              $$rAF(function () {
                if (isInput) element[0].checked = isActive;
                activeElement.toggleClass(options.activeClass, isActive);
              });
            };
            element.bind(options.toggleEvent, function () {
              scope.$apply(function () {
                controller.$setViewValue(value);
                controller.$render();
              });
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.collapse', [])
    .provider('$collapse', function () {
      var defaults = (this.defaults = {
        animation: 'am-collapse',
        disallowToggle: false,
        activeClass: 'in',
      });
      var controller = (this.controller = function ($scope, $element, $attrs) {
        var self = this;
        self.$options = angular.copy(defaults);
        angular.forEach(
          ['animation', 'disallowToggle', 'activeClass'],
          function (key) {
            if (angular.isDefined($attrs[key]))
              self.$options[key] = $attrs[key];
          }
        );
        self.$toggles = [];
        self.$targets = [];
        self.$viewChangeListeners = [];
        self.$registerToggle = function (element) {
          self.$toggles.push(element);
        };
        self.$registerTarget = function (element) {
          self.$targets.push(element);
        };
        self.$targets.$active = 0;
        self.$setActive = $scope.$setActive = function (value) {
          if (!self.$options.disallowToggle) {
            self.$targets.$active =
              self.$targets.$active === value ? -1 : value;
          } else {
            self.$targets.$active = value;
          }
          self.$viewChangeListeners.forEach(function (fn) {
            fn();
          });
        };
      });
      this.$get = function () {
        var $collapse = {};
        $collapse.defaults = defaults;
        $collapse.controller = controller;
        return $collapse;
      };
    })
    .directive('bsCollapse', [
      '$window',
      '$animate',
      '$collapse',
      function ($window, $animate, $collapse) {
        var defaults = $collapse.defaults;
        return {
          require: ['?ngModel', 'bsCollapse'],
          controller: ['$scope', '$element', '$attrs', $collapse.controller],
          link: function postLink(scope, element, attrs, controllers) {
            var ngModelCtrl = controllers[0];
            var bsCollapseCtrl = controllers[1];
            if (ngModelCtrl) {
              bsCollapseCtrl.$viewChangeListeners.push(function () {
                ngModelCtrl.$setViewValue(bsCollapseCtrl.$targets.$active);
              });
              ngModelCtrl.$formatters.push(function (modelValue) {
                bsCollapseCtrl.$setActive(modelValue * 1);
                return modelValue;
              });
            }
          },
        };
      },
    ])
    .directive('bsCollapseToggle', function () {
      return {
        require: ['^?ngModel', '^bsCollapse'],
        link: function postLink(scope, element, attrs, controllers) {
          var ngModelCtrl = controllers[0];
          var bsCollapseCtrl = controllers[1];
          element.attr('data-toggle', 'collapse');
          bsCollapseCtrl.$registerToggle(element);
          element.on('click', function () {
            var index =
              attrs.bsCollapseToggle ||
              bsCollapseCtrl.$toggles.indexOf(element);
            bsCollapseCtrl.$setActive(index * 1);
            scope.$apply();
          });
        },
      };
    })
    .directive('bsCollapseTarget', [
      '$animate',
      function ($animate) {
        return {
          require: ['^?ngModel', '^bsCollapse'],
          link: function postLink(scope, element, attrs, controllers) {
            var ngModelCtrl = controllers[0];
            var bsCollapseCtrl = controllers[1];
            element.addClass('collapse');
            if (bsCollapseCtrl.$options.animation) {
              element.addClass(bsCollapseCtrl.$options.animation);
            }
            bsCollapseCtrl.$registerTarget(element);
            function render() {
              var index = bsCollapseCtrl.$targets.indexOf(element);
              var active = bsCollapseCtrl.$targets.$active;
              $animate[index === active ? 'addClass' : 'removeClass'](
                element,
                bsCollapseCtrl.$options.activeClass
              );
            }
            bsCollapseCtrl.$viewChangeListeners.push(function () {
              render();
            });
            render();
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.datepicker', [
      'mgcrea.ngStrap.helpers.dateParser',
      'mgcrea.ngStrap.tooltip',
    ])
    .provider('$datepicker', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        prefixClass: 'datepicker',
        placement: 'bottom-left',
        template: 'datepicker/datepicker.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        useNative: false,
        dateType: 'date',
        dateFormat: 'shortDate',
        modelDateFormat: null,
        dayFormat: 'dd',
        strictFormat: false,
        autoclose: false,
        minDate: -Infinity,
        maxDate: +Infinity,
        startView: 0,
        minView: 0,
        startWeek: 0,
        daysOfWeekDisabled: '',
        iconLeft: 'glyphicon glyphicon-chevron-left',
        iconRight: 'glyphicon glyphicon-chevron-right',
      });
      this.$get = [
        '$window',
        '$document',
        '$rootScope',
        '$sce',
        '$locale',
        'dateFilter',
        'datepickerViews',
        '$tooltip',
        function (
          $window,
          $document,
          $rootScope,
          $sce,
          $locale,
          dateFilter,
          datepickerViews,
          $tooltip
        ) {
          var bodyEl = angular.element($window.document.body);
          var isNative = /(ip(a|o)d|iphone|android)/gi.test(
            $window.navigator.userAgent
          );
          var isTouch = 'createTouch' in $window.document && isNative;
          if (!defaults.lang) defaults.lang = $locale.id;
          function DatepickerFactory(element, controller, config) {
            var $datepicker = $tooltip(
              element,
              angular.extend({}, defaults, config)
            );
            var parentScope = config.scope;
            var options = $datepicker.$options;
            var scope = $datepicker.$scope;
            if (options.startView) options.startView -= options.minView;
            var pickerViews = datepickerViews($datepicker);
            $datepicker.$views = pickerViews.views;
            var viewDate = pickerViews.viewDate;
            scope.$mode = options.startView;
            scope.$iconLeft = options.iconLeft;
            scope.$iconRight = options.iconRight;
            var $picker = $datepicker.$views[scope.$mode];
            scope.$select = function (date) {
              $datepicker.select(date);
            };
            scope.$selectPane = function (value) {
              $datepicker.$selectPane(value);
            };
            scope.$toggleMode = function () {
              $datepicker.setMode(
                (scope.$mode + 1) % $datepicker.$views.length
              );
            };
            $datepicker.update = function (date) {
              if (angular.isDate(date) && !isNaN(date.getTime())) {
                $datepicker.$date = date;
                $picker.update.call($picker, date);
              }
              $datepicker.$build(true);
            };
            $datepicker.updateDisabledDates = function (dateRanges) {
              options.disabledDateRanges = dateRanges;
              for (var i = 0, l = scope.rows.length; i < l; i++) {
                angular.forEach(scope.rows[i], $datepicker.$setDisabledEl);
              }
            };
            $datepicker.select = function (date, keep) {
              if (!angular.isDate(controller.$dateValue))
                controller.$dateValue = new Date(date);
              if (!scope.$mode || keep) {
                controller.$setViewValue(angular.copy(date));
                controller.$render();
                if (options.autoclose && !keep) {
                  $datepicker.hide(true);
                }
              } else {
                angular.extend(viewDate, {
                  year: date.getFullYear(),
                  month: date.getMonth(),
                  date: date.getDate(),
                });
                $datepicker.setMode(scope.$mode - 1);
                $datepicker.$build();
              }
            };
            $datepicker.setMode = function (mode) {
              scope.$mode = mode;
              $picker = $datepicker.$views[scope.$mode];
              $datepicker.$build();
            };
            $datepicker.$build = function (pristine) {
              if (pristine === true && $picker.built) return;
              if (pristine === false && !$picker.built) return;
              $picker.build.call($picker);
            };
            $datepicker.$updateSelected = function () {
              for (var i = 0, l = scope.rows.length; i < l; i++) {
                angular.forEach(scope.rows[i], updateSelected);
              }
            };
            $datepicker.$isSelected = function (date) {
              return $picker.isSelected(date);
            };
            $datepicker.$setDisabledEl = function (el) {
              el.disabled = $picker.isDisabled(el.date);
            };
            $datepicker.$selectPane = function (value) {
              var steps = $picker.steps;
              var targetDate = new Date(
                Date.UTC(
                  viewDate.year + (steps.year || 0) * value,
                  viewDate.month + (steps.month || 0) * value,
                  viewDate.date + (steps.day || 0) * value
                )
              );
              angular.extend(viewDate, {
                year: targetDate.getUTCFullYear(),
                month: targetDate.getUTCMonth(),
                date: targetDate.getUTCDate(),
              });
              $datepicker.$build();
            };
            $datepicker.$onMouseDown = function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              if (isTouch) {
                var targetEl = angular.element(evt.target);
                if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                  targetEl = targetEl.parent();
                }
                targetEl.triggerHandler('click');
              }
            };
            $datepicker.$onKeyDown = function (evt) {
              if (
                !/(38|37|39|40|13)/.test(evt.keyCode) ||
                evt.shiftKey ||
                evt.altKey
              )
                return;
              evt.preventDefault();
              evt.stopPropagation();
              if (evt.keyCode === 13) {
                if (!scope.$mode) {
                  return $datepicker.hide(true);
                } else {
                  return scope.$apply(function () {
                    $datepicker.setMode(scope.$mode - 1);
                  });
                }
              }
              $picker.onKeyDown(evt);
              parentScope.$digest();
            };
            function updateSelected(el) {
              el.selected = $datepicker.$isSelected(el.date);
            }
            function focusElement() {
              element[0].focus();
            }
            var _init = $datepicker.init;
            $datepicker.init = function () {
              if (isNative && options.useNative) {
                element.prop('type', 'date');
                element.css('-webkit-appearance', 'textfield');
                return;
              } else if (isTouch) {
                element.prop('type', 'text');
                element.attr('readonly', 'true');
                element.on('click', focusElement);
              }
              _init();
            };
            var _destroy = $datepicker.destroy;
            $datepicker.destroy = function () {
              if (isNative && options.useNative) {
                element.off('click', focusElement);
              }
              _destroy();
            };
            var _show = $datepicker.show;
            $datepicker.show = function () {
              _show();
              setTimeout(function () {
                $datepicker.$element.on(
                  isTouch ? 'touchstart' : 'mousedown',
                  $datepicker.$onMouseDown
                );
                if (options.keyboard) {
                  element.on('keydown', $datepicker.$onKeyDown);
                }
              });
            };
            var _hide = $datepicker.hide;
            $datepicker.hide = function (blur) {
              $datepicker.$element.off(
                isTouch ? 'touchstart' : 'mousedown',
                $datepicker.$onMouseDown
              );
              if (options.keyboard) {
                element.off('keydown', $datepicker.$onKeyDown);
              }
              _hide(blur);
            };
            return $datepicker;
          }
          DatepickerFactory.defaults = defaults;
          return DatepickerFactory;
        },
      ];
    })
    .directive('bsDatepicker', [
      '$window',
      '$parse',
      '$q',
      '$locale',
      'dateFilter',
      '$datepicker',
      '$dateParser',
      '$timeout',
      function (
        $window,
        $parse,
        $q,
        $locale,
        dateFilter,
        $datepicker,
        $dateParser,
        $timeout
      ) {
        var defaults = $datepicker.defaults;
        var isNative = /(ip(a|o)d|iphone|android)/gi.test(
          $window.navigator.userAgent
        );
        var isNumeric = function (n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        };
        return {
          restrict: 'EAC',
          require: 'ngModel',
          link: function postLink(scope, element, attr, controller) {
            var options = { scope: scope, controller: controller };
            angular.forEach(
              [
                'placement',
                'container',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'template',
                'autoclose',
                'dateType',
                'dateFormat',
                'modelDateFormat',
                'dayFormat',
                'strictFormat',
                'startWeek',
                'startDate',
                'useNative',
                'lang',
                'startView',
                'minView',
                'iconLeft',
                'iconRight',
                'daysOfWeekDisabled',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            attr.bsShow &&
              scope.$watch(attr.bsShow, function (newValue, oldValue) {
                if (!datepicker || !angular.isDefined(newValue)) return;
                if (angular.isString(newValue))
                  newValue = !!newValue.match(',?(datepicker),?');
                newValue === true ? datepicker.show() : datepicker.hide();
              });
            var datepicker = $datepicker(element, controller, options);
            options = datepicker.$options;
            if (isNative && options.useNative)
              options.dateFormat = 'yyyy-MM-dd';
            angular.forEach(['minDate', 'maxDate'], function (key) {
              angular.isDefined(attr[key]) &&
                attr.$observe(key, function (newValue) {
                  if (newValue === 'today') {
                    var today = new Date();
                    datepicker.$options[key] = +new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      today.getDate() + (key === 'maxDate' ? 1 : 0),
                      0,
                      0,
                      0,
                      key === 'minDate' ? 0 : -1
                    );
                  } else if (
                    angular.isString(newValue) &&
                    newValue.match(/^".+"$/)
                  ) {
                    datepicker.$options[key] = +new Date(
                      newValue.substr(1, newValue.length - 2)
                    );
                  } else if (isNumeric(newValue)) {
                    datepicker.$options[key] = +new Date(
                      parseInt(newValue, 10)
                    );
                  } else if (
                    angular.isString(newValue) &&
                    0 === newValue.length
                  ) {
                    datepicker.$options[key] =
                      key === 'maxDate' ? +Infinity : -Infinity;
                  } else {
                    datepicker.$options[key] = +new Date(newValue);
                  }
                  !isNaN(datepicker.$options[key]) && datepicker.$build(false);
                });
            });
            scope.$watch(
              attr.ngModel,
              function (newValue, oldValue) {
                datepicker.update(controller.$dateValue);
              },
              true
            );
            function normalizeDateRanges(ranges) {
              if (!ranges || !ranges.length) return null;
              return ranges;
            }
            if (angular.isDefined(attr.disabledDates)) {
              scope.$watch(
                attr.disabledDates,
                function (disabledRanges, previousValue) {
                  disabledRanges = normalizeDateRanges(disabledRanges);
                  previousValue = normalizeDateRanges(previousValue);
                  if (disabledRanges !== previousValue) {
                    datepicker.updateDisabledDates(disabledRanges);
                  }
                }
              );
            }
            var dateParser = $dateParser({
              format: options.dateFormat,
              lang: options.lang,
              strict: options.strictFormat,
            });
            controller.$parsers.unshift(function (viewValue) {
              if (!viewValue) {
                controller.$setValidity('date', true);
                return;
              }
              var parsedDate = dateParser.parse(
                viewValue,
                controller.$dateValue
              );
              if (!parsedDate || isNaN(parsedDate.getTime())) {
                controller.$setValidity('date', false);
                return;
              } else {
                var isMinValid =
                  isNaN(datepicker.$options.minDate) ||
                  parsedDate.getTime() >= datepicker.$options.minDate;
                var isMaxValid =
                  isNaN(datepicker.$options.maxDate) ||
                  parsedDate.getTime() <= datepicker.$options.maxDate;
                var isValid = isMinValid && isMaxValid;
                controller.$setValidity('date', isValid);
                controller.$setValidity('min', isMinValid);
                controller.$setValidity('max', isMaxValid);
                if (isValid) controller.$dateValue = parsedDate;
              }
              if (options.dateType === 'string') {
                return dateFilter(
                  parsedDate,
                  options.modelDateFormat || options.dateFormat
                );
              } else if (options.dateType === 'number') {
                return controller.$dateValue.getTime();
              } else if (options.dateType === 'iso') {
                return controller.$dateValue.toISOString();
              } else {
                return new Date(controller.$dateValue);
              }
            });
            controller.$formatters.push(function (modelValue) {
              var date;
              if (angular.isUndefined(modelValue) || modelValue === null) {
                date = NaN;
              } else if (angular.isDate(modelValue)) {
                date = modelValue;
              } else if (options.dateType === 'string') {
                date = dateParser.parse(
                  modelValue,
                  null,
                  options.modelDateFormat
                );
              } else {
                date = new Date(modelValue);
              }
              controller.$dateValue = date;
              return controller.$dateValue;
            });
            controller.$render = function () {
              element.val(
                !controller.$dateValue || isNaN(controller.$dateValue.getTime())
                  ? ''
                  : dateFilter(controller.$dateValue, options.dateFormat)
              );
            };
            scope.$on('$destroy', function () {
              if (datepicker) datepicker.destroy();
              options = null;
              datepicker = null;
            });
          },
        };
      },
    ])
    .provider('datepickerViews', function () {
      var defaults = (this.defaults = {
        dayFormat: 'dd',
        daySplit: 7,
      });
      function split(arr, size) {
        var arrays = [];
        while (arr.length > 0) {
          arrays.push(arr.splice(0, size));
        }
        return arrays;
      }
      function mod(n, m) {
        return ((n % m) + m) % m;
      }
      this.$get = [
        '$locale',
        '$sce',
        'dateFilter',
        function ($locale, $sce, dateFilter) {
          return function (picker) {
            var scope = picker.$scope;
            var options = picker.$options;
            var weekDaysMin = $locale.DATETIME_FORMATS.SHORTDAY;
            var weekDaysLabels = weekDaysMin
              .slice(options.startWeek)
              .concat(weekDaysMin.slice(0, options.startWeek));
            var weekDaysLabelsHtml = $sce.trustAsHtml(
              '<th class="dow text-center">' +
                weekDaysLabels.join('</th><th class="dow text-center">') +
                '</th>'
            );
            var startDate =
              picker.$date ||
              (options.startDate ? new Date(options.startDate) : new Date());
            var viewDate = {
              year: startDate.getFullYear(),
              month: startDate.getMonth(),
              date: startDate.getDate(),
            };
            var timezoneOffset = startDate.getTimezoneOffset() * 6e4;
            var views = [
              {
                format: options.dayFormat,
                split: 7,
                steps: { month: 1 },
                update: function (date, force) {
                  if (
                    !this.built ||
                    force ||
                    date.getFullYear() !== viewDate.year ||
                    date.getMonth() !== viewDate.month
                  ) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate(),
                    });
                    picker.$build();
                  } else if (date.getDate() !== viewDate.date) {
                    viewDate.date = picker.$date.getDate();
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstDayOfMonth = new Date(
                      viewDate.year,
                      viewDate.month,
                      1
                    ),
                    firstDayOfMonthOffset = firstDayOfMonth.getTimezoneOffset();
                  var firstDate = new Date(
                      +firstDayOfMonth -
                        mod(firstDayOfMonth.getDay() - options.startWeek, 7) *
                          864e5
                    ),
                    firstDateOffset = firstDate.getTimezoneOffset();
                  var today = new Date().toDateString();
                  if (firstDateOffset !== firstDayOfMonthOffset)
                    firstDate = new Date(
                      +firstDate +
                        (firstDateOffset - firstDayOfMonthOffset) * 60e3
                    );
                  var days = [],
                    day;
                  for (var i = 0; i < 42; i++) {
                    day = new Date(
                      firstDate.getFullYear(),
                      firstDate.getMonth(),
                      firstDate.getDate() + i
                    );
                    days.push({
                      date: day,
                      isToday: day.toDateString() === today,
                      label: dateFilter(day, this.format),
                      selected: picker.$date && this.isSelected(day),
                      muted: day.getMonth() !== viewDate.month,
                      disabled: this.isDisabled(day),
                    });
                  }
                  scope.title = dateFilter(firstDayOfMonth, 'MMMM yyyy');
                  scope.showLabels = true;
                  scope.labels = weekDaysLabelsHtml;
                  scope.rows = split(days, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return (
                    picker.$date &&
                    date.getFullYear() === picker.$date.getFullYear() &&
                    date.getMonth() === picker.$date.getMonth() &&
                    date.getDate() === picker.$date.getDate()
                  );
                },
                isDisabled: function (date) {
                  var time = date.getTime();
                  if (time < options.minDate || time > options.maxDate)
                    return true;
                  if (options.daysOfWeekDisabled.indexOf(date.getDay()) !== -1)
                    return true;
                  if (options.disabledDateRanges) {
                    for (
                      var i = 0;
                      i < options.disabledDateRanges.length;
                      i++
                    ) {
                      if (time >= options.disabledDateRanges[i].start) {
                        if (time <= options.disabledDateRanges[i].end)
                          return true;
                        return false;
                      }
                    }
                  }
                  return false;
                },
                onKeyDown: function (evt) {
                  var actualTime = picker.$date.getTime();
                  var newDate;
                  if (evt.keyCode === 37)
                    newDate = new Date(actualTime - 1 * 864e5);
                  else if (evt.keyCode === 38)
                    newDate = new Date(actualTime - 7 * 864e5);
                  else if (evt.keyCode === 39)
                    newDate = new Date(actualTime + 1 * 864e5);
                  else if (evt.keyCode === 40)
                    newDate = new Date(actualTime + 7 * 864e5);
                  if (!this.isDisabled(newDate)) picker.select(newDate, true);
                },
              },
              {
                name: 'month',
                format: 'MMM',
                split: 4,
                steps: { year: 1 },
                update: function (date, force) {
                  if (!this.built || date.getFullYear() !== viewDate.year) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate(),
                    });
                    picker.$build();
                  } else if (date.getMonth() !== viewDate.month) {
                    angular.extend(viewDate, {
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate(),
                    });
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstMonth = new Date(viewDate.year, 0, 1);
                  var months = [],
                    month;
                  for (var i = 0; i < 12; i++) {
                    month = new Date(viewDate.year, i, 1);
                    months.push({
                      date: month,
                      label: dateFilter(month, this.format),
                      selected: picker.$isSelected(month),
                      disabled: this.isDisabled(month),
                    });
                  }
                  scope.title = dateFilter(month, 'yyyy');
                  scope.showLabels = false;
                  scope.rows = split(months, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return (
                    picker.$date &&
                    date.getFullYear() === picker.$date.getFullYear() &&
                    date.getMonth() === picker.$date.getMonth()
                  );
                },
                isDisabled: function (date) {
                  var lastDate = +new Date(
                    date.getFullYear(),
                    date.getMonth() + 1,
                    0
                  );
                  return (
                    lastDate < options.minDate ||
                    date.getTime() > options.maxDate
                  );
                },
                onKeyDown: function (evt) {
                  var actualMonth = picker.$date.getMonth();
                  var newDate = new Date(picker.$date);
                  if (evt.keyCode === 37) newDate.setMonth(actualMonth - 1);
                  else if (evt.keyCode === 38)
                    newDate.setMonth(actualMonth - 4);
                  else if (evt.keyCode === 39)
                    newDate.setMonth(actualMonth + 1);
                  else if (evt.keyCode === 40)
                    newDate.setMonth(actualMonth + 4);
                  if (!this.isDisabled(newDate)) picker.select(newDate, true);
                },
              },
              {
                name: 'year',
                format: 'yyyy',
                split: 4,
                steps: { year: 12 },
                update: function (date, force) {
                  if (
                    !this.built ||
                    force ||
                    parseInt(date.getFullYear() / 20, 10) !==
                      parseInt(viewDate.year / 20, 10)
                  ) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate(),
                    });
                    picker.$build();
                  } else if (date.getFullYear() !== viewDate.year) {
                    angular.extend(viewDate, {
                      year: picker.$date.getFullYear(),
                      month: picker.$date.getMonth(),
                      date: picker.$date.getDate(),
                    });
                    picker.$updateSelected();
                  }
                },
                build: function () {
                  var firstYear =
                    viewDate.year - (viewDate.year % (this.split * 3));
                  var years = [],
                    year;
                  for (var i = 0; i < 12; i++) {
                    year = new Date(firstYear + i, 0, 1);
                    years.push({
                      date: year,
                      label: dateFilter(year, this.format),
                      selected: picker.$isSelected(year),
                      disabled: this.isDisabled(year),
                    });
                  }
                  scope.title =
                    years[0].label + '-' + years[years.length - 1].label;
                  scope.showLabels = false;
                  scope.rows = split(years, this.split);
                  this.built = true;
                },
                isSelected: function (date) {
                  return (
                    picker.$date &&
                    date.getFullYear() === picker.$date.getFullYear()
                  );
                },
                isDisabled: function (date) {
                  var lastDate = +new Date(date.getFullYear() + 1, 0, 0);
                  return (
                    lastDate < options.minDate ||
                    date.getTime() > options.maxDate
                  );
                },
                onKeyDown: function (evt) {
                  var actualYear = picker.$date.getFullYear(),
                    newDate = new Date(picker.$date);
                  if (evt.keyCode === 37) newDate.setYear(actualYear - 1);
                  else if (evt.keyCode === 38) newDate.setYear(actualYear - 4);
                  else if (evt.keyCode === 39) newDate.setYear(actualYear + 1);
                  else if (evt.keyCode === 40) newDate.setYear(actualYear + 4);
                  if (!this.isDisabled(newDate)) picker.select(newDate, true);
                },
              },
            ];
            return {
              views: options.minView
                ? Array.prototype.slice.call(views, options.minView)
                : views,
              viewDate: viewDate,
            };
          };
        },
      ];
    });
  angular
    .module('mgcrea.ngStrap.dropdown', ['mgcrea.ngStrap.tooltip'])
    .provider('$dropdown', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        prefixClass: 'dropdown',
        placement: 'bottom-left',
        template: 'dropdown/dropdown.tpl.html',
        trigger: 'click',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
      });
      this.$get = [
        '$window',
        '$rootScope',
        '$tooltip',
        function ($window, $rootScope, $tooltip) {
          var bodyEl = angular.element($window.document.body);
          var matchesSelector =
            Element.prototype.matchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector;
          function DropdownFactory(element, config) {
            var $dropdown = {};
            var options = angular.extend({}, defaults, config);
            var scope = ($dropdown.$scope =
              (options.scope && options.scope.$new()) || $rootScope.$new());
            $dropdown = $tooltip(element, options);
            var parentEl = element.parent();
            $dropdown.$onKeyDown = function (evt) {
              if (!/(38|40)/.test(evt.keyCode)) return;
              evt.preventDefault();
              evt.stopPropagation();
              var items = angular.element(
                $dropdown.$element[0].querySelectorAll('li:not(.divider) a')
              );
              if (!items.length) return;
              var index;
              angular.forEach(items, function (el, i) {
                if (matchesSelector && matchesSelector.call(el, ':focus'))
                  index = i;
              });
              if (evt.keyCode === 38 && index > 0) index--;
              else if (evt.keyCode === 40 && index < items.length - 1) index++;
              else if (angular.isUndefined(index)) index = 0;
              items.eq(index)[0].focus();
            };
            var show = $dropdown.show;
            $dropdown.show = function () {
              show();
              setTimeout(function () {
                options.keyboard &&
                  $dropdown.$element.on('keydown', $dropdown.$onKeyDown);
                bodyEl.on('click', onBodyClick);
              });
              parentEl.hasClass('dropdown') && parentEl.addClass('open');
            };
            var hide = $dropdown.hide;
            $dropdown.hide = function () {
              options.keyboard &&
                $dropdown.$element.off('keydown', $dropdown.$onKeyDown);
              bodyEl.off('click', onBodyClick);
              parentEl.hasClass('dropdown') && parentEl.removeClass('open');
              hide();
            };
            function onBodyClick(evt) {
              if (evt.target === element[0]) return;
              return evt.target !== element[0] && $dropdown.hide();
            }
            return $dropdown;
          }
          return DropdownFactory;
        },
      ];
    })
    .directive('bsDropdown', [
      '$window',
      '$sce',
      '$dropdown',
      function ($window, $sce, $dropdown) {
        return {
          restrict: 'EAC',
          scope: true,
          link: function postLink(scope, element, attr, transclusion) {
            var options = { scope: scope };
            angular.forEach(
              [
                'placement',
                'container',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'template',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            attr.bsDropdown &&
              scope.$watch(
                attr.bsDropdown,
                function (newValue, oldValue) {
                  scope.content = newValue;
                },
                true
              );
            attr.bsShow &&
              scope.$watch(attr.bsShow, function (newValue, oldValue) {
                if (!dropdown || !angular.isDefined(newValue)) return;
                if (angular.isString(newValue))
                  newValue = !!newValue.match(',?(dropdown),?');
                newValue === true ? dropdown.show() : dropdown.hide();
              });
            var dropdown = $dropdown(element, options);
            scope.$on('$destroy', function () {
              if (dropdown) dropdown.destroy();
              options = null;
              dropdown = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.helpers.dateParser', [])
    .provider('$dateParser', [
      '$localeProvider',
      function ($localeProvider) {
        var proto = Date.prototype;
        function noop() {}
        function isNumeric(n) {
          return !isNaN(parseFloat(n)) && isFinite(n);
        }
        var defaults = (this.defaults = {
          format: 'shortDate',
          strict: false,
        });
        this.$get = [
          '$locale',
          'dateFilter',
          function ($locale, dateFilter) {
            var DateParserFactory = function (config) {
              var options = angular.extend({}, defaults, config);
              var $dateParser = {};
              var regExpMap = {
                sss: '[0-9]{3}',
                ss: '[0-5][0-9]',
                s: options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
                mm: '[0-5][0-9]',
                m: options.strict ? '[1-5]?[0-9]' : '[0-9]|[0-5][0-9]',
                HH: '[01][0-9]|2[0-3]',
                H: options.strict ? '1?[0-9]|2[0-3]' : '[01]?[0-9]|2[0-3]',
                hh: '[0][1-9]|[1][012]',
                h: options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
                a: 'AM|PM',
                EEEE: $locale.DATETIME_FORMATS.DAY.join('|'),
                EEE: $locale.DATETIME_FORMATS.SHORTDAY.join('|'),
                dd: '0[1-9]|[12][0-9]|3[01]',
                d: options.strict
                  ? '[1-9]|[1-2][0-9]|3[01]'
                  : '0?[1-9]|[1-2][0-9]|3[01]',
                MMMM: $locale.DATETIME_FORMATS.MONTH.join('|'),
                MMM: $locale.DATETIME_FORMATS.SHORTMONTH.join('|'),
                MM: '0[1-9]|1[012]',
                M: options.strict ? '[1-9]|1[012]' : '0?[1-9]|1[012]',
                yyyy: '[1]{1}[0-9]{3}|[2]{1}[0-9]{3}',
                yy: '[0-9]{2}',
                y: options.strict ? '-?(0|[1-9][0-9]{0,3})' : '-?0*[0-9]{1,4}',
              };
              var setFnMap = {
                sss: proto.setMilliseconds,
                ss: proto.setSeconds,
                s: proto.setSeconds,
                mm: proto.setMinutes,
                m: proto.setMinutes,
                HH: proto.setHours,
                H: proto.setHours,
                hh: proto.setHours,
                h: proto.setHours,
                EEEE: noop,
                EEE: noop,
                dd: proto.setDate,
                d: proto.setDate,
                a: function (value) {
                  var hours = this.getHours();
                  return this.setHours(value.match(/pm/i) ? hours + 12 : hours);
                },
                MMMM: function (value) {
                  return this.setMonth(
                    $locale.DATETIME_FORMATS.MONTH.indexOf(value)
                  );
                },
                MMM: function (value) {
                  return this.setMonth(
                    $locale.DATETIME_FORMATS.SHORTMONTH.indexOf(value)
                  );
                },
                MM: function (value) {
                  return this.setMonth(1 * value - 1);
                },
                M: function (value) {
                  return this.setMonth(1 * value - 1);
                },
                yyyy: proto.setFullYear,
                yy: function (value) {
                  return this.setFullYear(2000 + 1 * value);
                },
                y: proto.setFullYear,
              };
              var regex, setMap;
              $dateParser.init = function () {
                $dateParser.$format =
                  $locale.DATETIME_FORMATS[options.format] || options.format;
                regex = regExpForFormat($dateParser.$format);
                setMap = setMapForFormat($dateParser.$format);
              };
              $dateParser.isValid = function (date) {
                if (angular.isDate(date)) return !isNaN(date.getTime());
                return regex.test(date);
              };
              $dateParser.parse = function (value, baseDate, format) {
                if (angular.isDate(value))
                  value = dateFilter(value, format || $dateParser.$format);
                var formatRegex = format ? regExpForFormat(format) : regex;
                var formatSetMap = format ? setMapForFormat(format) : setMap;
                var matches = formatRegex.exec(value);
                if (!matches) return false;
                var date = baseDate || new Date(0, 0, 1);
                for (var i = 0; i < matches.length - 1; i++) {
                  formatSetMap[i] && formatSetMap[i].call(date, matches[i + 1]);
                }
                return date;
              };
              function setMapForFormat(format) {
                var keys = Object.keys(setFnMap),
                  i;
                var map = [],
                  sortedMap = [];
                var clonedFormat = format;
                for (i = 0; i < keys.length; i++) {
                  if (format.split(keys[i]).length > 1) {
                    var index = clonedFormat.search(keys[i]);
                    format = format.split(keys[i]).join('');
                    if (setFnMap[keys[i]]) {
                      map[index] = setFnMap[keys[i]];
                    }
                  }
                }
                angular.forEach(map, function (v) {
                  if (v) sortedMap.push(v);
                });
                return sortedMap;
              }
              function escapeReservedSymbols(text) {
                return text
                  .replace(/\//g, '[\\/]')
                  .replace('/-/g', '[-]')
                  .replace(/\./g, '[.]')
                  .replace(/\\s/g, '[\\s]');
              }
              function regExpForFormat(format) {
                var keys = Object.keys(regExpMap),
                  i;
                var re = format;
                for (i = 0; i < keys.length; i++) {
                  re = re.split(keys[i]).join('');
                }
                for (i = 0; i < keys.length; i++) {
                  re = re.split('').join('(' + regExpMap[keys[i]] + ')');
                }
                format = escapeReservedSymbols(format);
                return new RegExp('^' + re + '$', ['i']);
              }
              $dateParser.init();
              return $dateParser;
            };
            return DateParserFactory;
          },
        ];
      },
    ]);
  angular
    .module('mgcrea.ngStrap.helpers.debounce', [])
    .constant('debounce', function (func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      return function () {
        context = this;
        args = arguments;
        timestamp = new Date();
        var later = function () {
          var last = new Date() - timestamp;
          if (last < wait) {
            timeout = setTimeout(later, wait - last);
          } else {
            timeout = null;
            if (!immediate) result = func.apply(context, args);
          }
        };
        var callNow = immediate && !timeout;
        if (!timeout) {
          timeout = setTimeout(later, wait);
        }
        if (callNow) result = func.apply(context, args);
        return result;
      };
    })
    .constant('throttle', function (func, wait, options) {
      var context, args, result;
      var timeout = null;
      var previous = 0;
      options || (options = {});
      var later = function () {
        previous = options.leading === false ? 0 : new Date();
        timeout = null;
        result = func.apply(context, args);
      };
      return function () {
        var now = new Date();
        if (!previous && options.leading === false) previous = now;
        var remaining = wait - (now - previous);
        context = this;
        args = arguments;
        if (remaining <= 0) {
          clearTimeout(timeout);
          timeout = null;
          previous = now;
          result = func.apply(context, args);
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
        return result;
      };
    });
  angular
    .module('mgcrea.ngStrap.helpers.dimensions', [])
    .factory('dimensions', [
      '$document',
      '$window',
      function ($document, $window) {
        var jqLite = angular.element;
        var fn = {};
        var nodeName = (fn.nodeName = function (element, name) {
          return (
            element.nodeName &&
            element.nodeName.toLowerCase() === name.toLowerCase()
          );
        });
        fn.css = function (element, prop, extra) {
          var value;
          if (element.currentStyle) {
            value = element.currentStyle[prop];
          } else if (window.getComputedStyle) {
            value = window.getComputedStyle(element)[prop];
          } else {
            value = element.style[prop];
          }
          return extra === true ? parseFloat(value) || 0 : value;
        };
        fn.offset = function (element) {
          var boxRect = element.getBoundingClientRect();
          var docElement = element.ownerDocument;
          return {
            width: boxRect.width || element.offsetWidth,
            height: boxRect.height || element.offsetHeight,
            top:
              boxRect.top +
              (window.pageYOffset || docElement.documentElement.scrollTop) -
              (docElement.documentElement.clientTop || 0),
            left:
              boxRect.left +
              (window.pageXOffset || docElement.documentElement.scrollLeft) -
              (docElement.documentElement.clientLeft || 0),
          };
        };
        fn.position = function (element) {
          var offsetParentRect = { top: 0, left: 0 },
            offsetParentElement,
            offset;
          if (fn.css(element, 'position') === 'fixed') {
            offset = element.getBoundingClientRect();
          } else {
            offsetParentElement = offsetParent(element);
            offset = fn.offset(element);
            offset = fn.offset(element);
            if (!nodeName(offsetParentElement, 'html')) {
              offsetParentRect = fn.offset(offsetParentElement);
            }
            offsetParentRect.top += fn.css(
              offsetParentElement,
              'borderTopWidth',
              true
            );
            offsetParentRect.left += fn.css(
              offsetParentElement,
              'borderLeftWidth',
              true
            );
          }
          return {
            width: element.offsetWidth,
            height: element.offsetHeight,
            top:
              offset.top -
              offsetParentRect.top -
              fn.css(element, 'marginTop', true),
            left:
              offset.left -
              offsetParentRect.left -
              fn.css(element, 'marginLeft', true),
          };
        };
        var offsetParent = function offsetParentElement(element) {
          var docElement = element.ownerDocument;
          var offsetParent = element.offsetParent || docElement;
          if (nodeName(offsetParent, '#document'))
            return docElement.documentElement;
          while (
            offsetParent &&
            !nodeName(offsetParent, 'html') &&
            fn.css(offsetParent, 'position') === 'static'
          ) {
            offsetParent = offsetParent.offsetParent;
          }
          return offsetParent || docElement.documentElement;
        };
        fn.height = function (element, outer) {
          var value = element.offsetHeight;
          if (outer) {
            value +=
              fn.css(element, 'marginTop', true) +
              fn.css(element, 'marginBottom', true);
          } else {
            value -=
              fn.css(element, 'paddingTop', true) +
              fn.css(element, 'paddingBottom', true) +
              fn.css(element, 'borderTopWidth', true) +
              fn.css(element, 'borderBottomWidth', true);
          }
          return value;
        };
        fn.width = function (element, outer) {
          var value = element.offsetWidth;
          if (outer) {
            value +=
              fn.css(element, 'marginLeft', true) +
              fn.css(element, 'marginRight', true);
          } else {
            value -=
              fn.css(element, 'paddingLeft', true) +
              fn.css(element, 'paddingRight', true) +
              fn.css(element, 'borderLeftWidth', true) +
              fn.css(element, 'borderRightWidth', true);
          }
          return value;
        };
        return fn;
      },
    ]);
  angular
    .module('mgcrea.ngStrap.helpers.parseOptions', [])
    .provider('$parseOptions', function () {
      var defaults = (this.defaults = {
        regexp:
          /^\s*(.*?)(?:\s+as\s+(.*?))?(?:\s+group\s+by\s+(.*))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+(.*?)(?:\s+track\s+by\s+(.*?))?$/,
      });
      this.$get = [
        '$parse',
        '$q',
        function ($parse, $q) {
          function ParseOptionsFactory(attr, config) {
            var $parseOptions = {};
            var options = angular.extend({}, defaults, config);
            $parseOptions.$values = [];
            var match,
              displayFn,
              valueName,
              keyName,
              groupByFn,
              valueFn,
              valuesFn;
            $parseOptions.init = function () {
              $parseOptions.$match = match = attr.match(options.regexp);
              (displayFn = $parse(match[2] || match[1])),
                (valueName = match[4] || match[6]),
                (keyName = match[5]),
                (groupByFn = $parse(match[3] || '')),
                (valueFn = $parse(match[2] ? match[1] : valueName)),
                (valuesFn = $parse(match[7]));
            };
            $parseOptions.valuesFn = function (scope, controller) {
              return $q
                .when(valuesFn(scope, controller))
                .then(function (values) {
                  $parseOptions.$values = values
                    ? parseValues(values, scope)
                    : {};
                  return $parseOptions.$values;
                });
            };
            function parseValues(values, scope) {
              return values.map(function (match, index) {
                var locals = {},
                  label,
                  value;
                locals[valueName] = match;
                label = displayFn(scope, locals);
                value = valueFn(scope, locals) || index;
                return { label: label, value: value };
              });
            }
            $parseOptions.init();
            return $parseOptions;
          }
          return ParseOptionsFactory;
        },
      ];
    });
  angular.version.minor < 3 &&
    angular.version.dot < 14 &&
    angular.module('ng').factory('$$rAF', [
      '$window',
      '$timeout',
      function ($window, $timeout) {
        var requestAnimationFrame =
          $window.requestAnimationFrame ||
          $window.webkitRequestAnimationFrame ||
          $window.mozRequestAnimationFrame;
        var cancelAnimationFrame =
          $window.cancelAnimationFrame ||
          $window.webkitCancelAnimationFrame ||
          $window.mozCancelAnimationFrame ||
          $window.webkitCancelRequestAnimationFrame;
        var rafSupported = !!requestAnimationFrame;
        var raf = rafSupported
          ? function (fn) {
              var id = requestAnimationFrame(fn);
              return function () {
                cancelAnimationFrame(id);
              };
            }
          : function (fn) {
              var timer = $timeout(fn, 16.66, false);
              return function () {
                $timeout.cancel(timer);
              };
            };
        raf.supported = rafSupported;
        return raf;
      },
    ]);
  angular
    .module('mgcrea.ngStrap.modal', ['mgcrea.ngStrap.helpers.dimensions'])
    .provider('$modal', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        backdropAnimation: 'am-fade',
        prefixClass: 'modal',
        prefixEvent: 'modal',
        placement: 'top',
        template: 'modal/modal.tpl.html',
        contentTemplate: false,
        container: false,
        element: null,
        backdrop: true,
        keyboard: true,
        html: false,
        show: true,
      });
      this.$get = [
        '$window',
        '$rootScope',
        '$compile',
        '$q',
        '$templateCache',
        '$http',
        '$animate',
        '$timeout',
        '$sce',
        'dimensions',
        function (
          $window,
          $rootScope,
          $compile,
          $q,
          $templateCache,
          $http,
          $animate,
          $timeout,
          $sce,
          dimensions
        ) {
          var forEach = angular.forEach;
          var trim = String.prototype.trim;
          var requestAnimationFrame =
            $window.requestAnimationFrame || $window.setTimeout;
          var bodyElement = angular.element($window.document.body);
          var htmlReplaceRegExp = /ng-bind="/gi;
          function ModalFactory(config) {
            var $modal = {};
            var options = ($modal.$options = angular.extend(
              {},
              defaults,
              config
            ));
            $modal.$promise = fetchTemplate(options.template);
            var scope = ($modal.$scope =
              (options.scope && options.scope.$new()) || $rootScope.$new());
            if (!options.element && !options.container) {
              options.container = 'body';
            }
            forEach(['title', 'content'], function (key) {
              if (options[key]) scope[key] = $sce.trustAsHtml(options[key]);
            });
            scope.$hide = function () {
              scope.$$postDigest(function () {
                $modal.hide();
              });
            };
            scope.$show = function () {
              scope.$$postDigest(function () {
                $modal.show();
              });
            };
            scope.$toggle = function () {
              scope.$$postDigest(function () {
                $modal.toggle();
              });
            };
            if (options.contentTemplate) {
              $modal.$promise = $modal.$promise.then(function (template) {
                var templateEl = angular.element(template);
                return fetchTemplate(options.contentTemplate).then(function (
                  contentTemplate
                ) {
                  var contentEl = findElement(
                    '[ng-bind="content"]',
                    templateEl[0]
                  )
                    .removeAttr('ng-bind')
                    .html(contentTemplate);
                  if (!config.template) contentEl.next().remove();
                  return templateEl[0].outerHTML;
                });
              });
            }
            var modalLinker, modalElement;
            var backdropElement = angular.element(
              '<div class="' + options.prefixClass + '-backdrop"/>'
            );
            $modal.$promise.then(function (template) {
              if (angular.isObject(template)) template = template.data;
              if (options.html)
                template = template.replace(
                  htmlReplaceRegExp,
                  'ng-bind-html="'
                );
              template = trim.apply(template);
              modalLinker = $compile(template);
              $modal.init();
            });
            $modal.init = function () {
              if (options.show) {
                scope.$$postDigest(function () {
                  $modal.show();
                });
              }
            };
            $modal.destroy = function () {
              if (modalElement) {
                modalElement.remove();
                modalElement = null;
              }
              if (backdropElement) {
                backdropElement.remove();
                backdropElement = null;
              }
              scope.$destroy();
            };
            $modal.show = function () {
              scope.$emit(options.prefixEvent + '.show.before', $modal);
              var parent;
              if (angular.isElement(options.container)) {
                parent = options.container;
              } else {
                parent = options.container
                  ? findElement(options.container)
                  : null;
              }
              var after = options.container ? null : options.element;
              modalElement = $modal.$element = modalLinker(
                scope,
                function (clonedElement, scope) {}
              );
              modalElement
                .css({ display: 'block' })
                .addClass(options.placement);
              if (options.animation) {
                if (options.backdrop) {
                  backdropElement.addClass(options.backdropAnimation);
                }
                modalElement.addClass(options.animation);
              }
              if (options.backdrop) {
                $animate.enter(
                  backdropElement,
                  bodyElement,
                  null,
                  function () {}
                );
              }
              $animate.enter(modalElement, parent, after, function () {
                scope.$emit(options.prefixEvent + '.show', $modal);
              });
              scope.$isShown = true;
              scope.$$phase ||
                (scope.$root && scope.$root.$$phase) ||
                scope.$digest();
              var el = modalElement[0];
              requestAnimationFrame(function () {
                el.focus();
              });
              bodyElement.addClass(options.prefixClass + '-open');
              if (options.animation) {
                bodyElement.addClass(
                  options.prefixClass + '-with-' + options.animation
                );
              }
              if (options.backdrop) {
                modalElement.on('click', hideOnBackdropClick);
                backdropElement.on('click', hideOnBackdropClick);
              }
              if (options.keyboard) {
                modalElement.on('keyup', $modal.$onKeyUp);
              }
            };
            $modal.hide = function () {
              scope.$emit(options.prefixEvent + '.hide.before', $modal);
              $animate.leave(modalElement, function () {
                scope.$emit(options.prefixEvent + '.hide', $modal);
                bodyElement.removeClass(options.prefixClass + '-open');
                if (options.animation) {
                  bodyElement.removeClass(
                    options.prefixClass + '-with-' + options.animation
                  );
                }
              });
              if (options.backdrop) {
                $animate.leave(backdropElement, function () {});
              }
              scope.$isShown = false;
              scope.$$phase ||
                (scope.$root && scope.$root.$$phase) ||
                scope.$digest();
              if (options.backdrop) {
                modalElement.off('click', hideOnBackdropClick);
                backdropElement.off('click', hideOnBackdropClick);
              }
              if (options.keyboard) {
                modalElement.off('keyup', $modal.$onKeyUp);
              }
            };
            $modal.toggle = function () {
              scope.$isShown ? $modal.hide() : $modal.show();
            };
            $modal.focus = function () {
              modalElement[0].focus();
            };
            $modal.$onKeyUp = function (evt) {
              if (evt.which === 27 && scope.$isShown) {
                $modal.hide();
                evt.stopPropagation();
              }
            };
            function hideOnBackdropClick(evt) {
              if (evt.target !== evt.currentTarget) return;
              options.backdrop === 'static' ? $modal.focus() : $modal.hide();
            }
            return $modal;
          }
          function findElement(query, element) {
            return angular.element(
              (element || document).querySelectorAll(query)
            );
          }
          function fetchTemplate(template) {
            return $q
              .when($templateCache.get(template) || $http.get(template))
              .then(function (res) {
                if (angular.isObject(res)) {
                  $templateCache.put(template, res.data);
                  return res.data;
                }
                return res;
              });
          }
          return ModalFactory;
        },
      ];
    })
    .directive('bsModal', [
      '$window',
      '$sce',
      '$modal',
      function ($window, $sce, $modal) {
        return {
          restrict: 'EAC',
          scope: true,
          link: function postLink(scope, element, attr, transclusion) {
            var options = { scope: scope, element: element, show: false };
            angular.forEach(
              [
                'template',
                'contentTemplate',
                'placement',
                'backdrop',
                'keyboard',
                'html',
                'container',
                'animation',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            angular.forEach(['title', 'content'], function (key) {
              attr[key] &&
                attr.$observe(key, function (newValue, oldValue) {
                  scope[key] = $sce.trustAsHtml(newValue);
                });
            });
            attr.bsModal &&
              scope.$watch(
                attr.bsModal,
                function (newValue, oldValue) {
                  if (angular.isObject(newValue)) {
                    angular.extend(scope, newValue);
                  } else {
                    scope.content = newValue;
                  }
                },
                true
              );
            var modal = $modal(options);
            element.on(attr.trigger || 'click', modal.toggle);
            scope.$on('$destroy', function () {
              if (modal) modal.destroy();
              options = null;
              modal = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.navbar', [])
    .provider('$navbar', function () {
      var defaults = (this.defaults = {
        activeClass: 'active',
        routeAttr: 'data-match-route',
        strict: false,
      });
      this.$get = function () {
        return { defaults: defaults };
      };
    })
    .directive('bsNavbar', [
      '$window',
      '$location',
      '$navbar',
      function ($window, $location, $navbar) {
        var defaults = $navbar.defaults;
        return {
          restrict: 'A',
          link: function postLink(scope, element, attr, controller) {
            var options = angular.copy(defaults);
            angular.forEach(Object.keys(defaults), function (key) {
              if (angular.isDefined(attr[key])) options[key] = attr[key];
            });
            scope.$watch(
              function () {
                return $location.path();
              },
              function (newValue, oldValue) {
                var liElements = element[0].querySelectorAll(
                  'li[' + options.routeAttr + ']'
                );
                angular.forEach(liElements, function (li) {
                  var liElement = angular.element(li);
                  var pattern = liElement
                    .attr(options.routeAttr)
                    .replace('/', '\\/');
                  if (options.strict) {
                    pattern = '^' + pattern + '$';
                  }
                  var regexp = new RegExp(pattern, ['i']);
                  if (regexp.test(newValue)) {
                    liElement.addClass(options.activeClass);
                  } else {
                    liElement.removeClass(options.activeClass);
                  }
                });
              }
            );
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.popover', ['mgcrea.ngStrap.tooltip'])
    .provider('$popover', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        customClass: '',
        container: false,
        target: false,
        placement: 'right',
        template: 'popover/popover.tpl.html',
        contentTemplate: false,
        trigger: 'click',
        keyboard: true,
        html: false,
        title: '',
        content: '',
        delay: 0,
      });
      this.$get = [
        '$tooltip',
        function ($tooltip) {
          function PopoverFactory(element, config) {
            var options = angular.extend({}, defaults, config);
            var $popover = $tooltip(element, options);
            if (options.content) {
              $popover.$scope.content = options.content;
            }
            return $popover;
          }
          return PopoverFactory;
        },
      ];
    })
    .directive('bsPopover', [
      '$window',
      '$sce',
      '$popover',
      function ($window, $sce, $popover) {
        var requestAnimationFrame =
          $window.requestAnimationFrame || $window.setTimeout;
        return {
          restrict: 'EAC',
          scope: true,
          link: function postLink(scope, element, attr) {
            var options = { scope: scope };
            angular.forEach(
              [
                'template',
                'contentTemplate',
                'placement',
                'container',
                'target',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'customClass',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            angular.forEach(['title', 'content'], function (key) {
              attr[key] &&
                attr.$observe(key, function (newValue, oldValue) {
                  scope[key] = $sce.trustAsHtml(newValue);
                  angular.isDefined(oldValue) &&
                    requestAnimationFrame(function () {
                      popover && popover.$applyPlacement();
                    });
                });
            });
            attr.bsPopover &&
              scope.$watch(
                attr.bsPopover,
                function (newValue, oldValue) {
                  if (angular.isObject(newValue)) {
                    angular.extend(scope, newValue);
                  } else {
                    scope.content = newValue;
                  }
                  angular.isDefined(oldValue) &&
                    requestAnimationFrame(function () {
                      popover && popover.$applyPlacement();
                    });
                },
                true
              );
            attr.bsShow &&
              scope.$watch(attr.bsShow, function (newValue, oldValue) {
                if (!popover || !angular.isDefined(newValue)) return;
                if (angular.isString(newValue))
                  newValue = !!newValue.match(',?(popover),?');
                newValue === true ? popover.show() : popover.hide();
              });
            var popover = $popover(element, options);
            scope.$on('$destroy', function () {
              if (popover) popover.destroy();
              options = null;
              popover = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.scrollspy', [
      'mgcrea.ngStrap.helpers.debounce',
      'mgcrea.ngStrap.helpers.dimensions',
    ])
    .provider('$scrollspy', function () {
      var spies = (this.$$spies = {});
      var defaults = (this.defaults = {
        debounce: 150,
        throttle: 100,
        offset: 100,
      });
      this.$get = [
        '$window',
        '$document',
        '$rootScope',
        'dimensions',
        'debounce',
        'throttle',
        function (
          $window,
          $document,
          $rootScope,
          dimensions,
          debounce,
          throttle
        ) {
          var windowEl = angular.element($window);
          var docEl = angular.element($document.prop('documentElement'));
          var bodyEl = angular.element($window.document.body);
          function nodeName(element, name) {
            return (
              element[0].nodeName &&
              element[0].nodeName.toLowerCase() === name.toLowerCase()
            );
          }
          function ScrollSpyFactory(config) {
            var options = angular.extend({}, defaults, config);
            if (!options.element) options.element = bodyEl;
            var isWindowSpy = nodeName(options.element, 'body');
            var scrollEl = isWindowSpy ? windowEl : options.element;
            var scrollId = isWindowSpy ? 'window' : options.id;
            if (spies[scrollId]) {
              spies[scrollId].$$count++;
              return spies[scrollId];
            }
            var $scrollspy = {};
            var unbindViewContentLoaded, unbindIncludeContentLoaded;
            var trackedElements = ($scrollspy.$trackedElements = []);
            var sortedElements = [];
            var activeTarget;
            var debouncedCheckPosition;
            var throttledCheckPosition;
            var debouncedCheckOffsets;
            var viewportHeight;
            var scrollTop;
            $scrollspy.init = function () {
              this.$$count = 1;
              debouncedCheckPosition = debounce(
                this.checkPosition,
                options.debounce
              );
              throttledCheckPosition = throttle(
                this.checkPosition,
                options.throttle
              );
              scrollEl.on('click', this.checkPositionWithEventLoop);
              windowEl.on('resize', debouncedCheckPosition);
              scrollEl.on('scroll', throttledCheckPosition);
              debouncedCheckOffsets = debounce(
                this.checkOffsets,
                options.debounce
              );
              unbindViewContentLoaded = $rootScope.$on(
                '$viewContentLoaded',
                debouncedCheckOffsets
              );
              unbindIncludeContentLoaded = $rootScope.$on(
                '$includeContentLoaded',
                debouncedCheckOffsets
              );
              debouncedCheckOffsets();
              if (scrollId) {
                spies[scrollId] = $scrollspy;
              }
            };
            $scrollspy.destroy = function () {
              this.$$count--;
              if (this.$$count > 0) {
                return;
              }
              scrollEl.off('click', this.checkPositionWithEventLoop);
              windowEl.off('resize', debouncedCheckPosition);
              scrollEl.off('scroll', debouncedCheckPosition);
              unbindViewContentLoaded();
              unbindIncludeContentLoaded();
              if (scrollId) {
                delete spies[scrollId];
              }
            };
            $scrollspy.checkPosition = function () {
              if (!sortedElements.length) return;
              scrollTop =
                (isWindowSpy
                  ? $window.pageYOffset
                  : scrollEl.prop('scrollTop')) || 0;
              viewportHeight = Math.max(
                $window.innerHeight,
                docEl.prop('clientHeight')
              );
              if (
                scrollTop < sortedElements[0].offsetTop &&
                activeTarget !== sortedElements[0].target
              ) {
                return $scrollspy.$activateElement(sortedElements[0]);
              }
              for (var i = sortedElements.length; i--; ) {
                if (
                  angular.isUndefined(sortedElements[i].offsetTop) ||
                  sortedElements[i].offsetTop === null
                )
                  continue;
                if (activeTarget === sortedElements[i].target) continue;
                if (scrollTop < sortedElements[i].offsetTop) continue;
                if (
                  sortedElements[i + 1] &&
                  scrollTop > sortedElements[i + 1].offsetTop
                )
                  continue;
                return $scrollspy.$activateElement(sortedElements[i]);
              }
            };
            $scrollspy.checkPositionWithEventLoop = function () {
              setTimeout(this.checkPosition, 1);
            };
            $scrollspy.$activateElement = function (element) {
              if (activeTarget) {
                var activeElement = $scrollspy.$getTrackedElement(activeTarget);
                if (activeElement) {
                  activeElement.source.removeClass('active');
                  if (
                    nodeName(activeElement.source, 'li') &&
                    nodeName(activeElement.source.parent().parent(), 'li')
                  ) {
                    activeElement.source
                      .parent()
                      .parent()
                      .removeClass('active');
                  }
                }
              }
              activeTarget = element.target;
              element.source.addClass('active');
              if (
                nodeName(element.source, 'li') &&
                nodeName(element.source.parent().parent(), 'li')
              ) {
                element.source.parent().parent().addClass('active');
              }
            };
            $scrollspy.$getTrackedElement = function (target) {
              return trackedElements.filter(function (obj) {
                return obj.target === target;
              })[0];
            };
            $scrollspy.checkOffsets = function () {
              angular.forEach(trackedElements, function (trackedElement) {
                var targetElement = document.querySelector(
                  trackedElement.target
                );
                trackedElement.offsetTop = targetElement
                  ? dimensions.offset(targetElement).top
                  : null;
                if (options.offset && trackedElement.offsetTop !== null)
                  trackedElement.offsetTop -= options.offset * 1;
              });
              sortedElements = trackedElements
                .filter(function (el) {
                  return el.offsetTop !== null;
                })
                .sort(function (a, b) {
                  return a.offsetTop - b.offsetTop;
                });
              debouncedCheckPosition();
            };
            $scrollspy.trackElement = function (target, source) {
              trackedElements.push({ target: target, source: source });
            };
            $scrollspy.untrackElement = function (target, source) {
              var toDelete;
              for (var i = trackedElements.length; i--; ) {
                if (
                  trackedElements[i].target === target &&
                  trackedElements[i].source === source
                ) {
                  toDelete = i;
                  break;
                }
              }
              trackedElements = trackedElements.splice(toDelete, 1);
            };
            $scrollspy.activate = function (i) {
              trackedElements[i].addClass('active');
            };
            $scrollspy.init();
            return $scrollspy;
          }
          return ScrollSpyFactory;
        },
      ];
    })
    .directive('bsScrollspy', [
      '$rootScope',
      'debounce',
      'dimensions',
      '$scrollspy',
      function ($rootScope, debounce, dimensions, $scrollspy) {
        return {
          restrict: 'EAC',
          link: function postLink(scope, element, attr) {
            var options = { scope: scope };
            angular.forEach(['offset', 'target'], function (key) {
              if (angular.isDefined(attr[key])) options[key] = attr[key];
            });
            var scrollspy = $scrollspy(options);
            scrollspy.trackElement(options.target, element);
            scope.$on('$destroy', function () {
              if (scrollspy) {
                scrollspy.untrackElement(options.target, element);
                scrollspy.destroy();
              }
              options = null;
              scrollspy = null;
            });
          },
        };
      },
    ])
    .directive('bsScrollspyList', [
      '$rootScope',
      'debounce',
      'dimensions',
      '$scrollspy',
      function ($rootScope, debounce, dimensions, $scrollspy) {
        return {
          restrict: 'A',
          compile: function postLink(element, attr) {
            var children = element[0].querySelectorAll('li > a[href]');
            angular.forEach(children, function (child) {
              var childEl = angular.element(child);
              childEl
                .parent()
                .attr('bs-scrollspy', '')
                .attr('data-target', childEl.attr('href'));
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.select', [
      'mgcrea.ngStrap.tooltip',
      'mgcrea.ngStrap.helpers.parseOptions',
    ])
    .provider('$select', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        prefixClass: 'select',
        prefixEvent: '$select',
        placement: 'bottom-left',
        template: 'select/select.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        multiple: false,
        allNoneButtons: false,
        sort: true,
        caretHtml: '&nbsp;<span class="caret"></span>',
        placeholder: 'Choose among the following...',
        maxLength: 3,
        maxLengthHtml: 'selected',
        iconCheckmark: 'glyphicon glyphicon-ok',
      });
      this.$get = [
        '$window',
        '$document',
        '$rootScope',
        '$tooltip',
        function ($window, $document, $rootScope, $tooltip) {
          var bodyEl = angular.element($window.document.body);
          var isNative = /(ip(a|o)d|iphone|android)/gi.test(
            $window.navigator.userAgent
          );
          var isTouch = 'createTouch' in $window.document && isNative;
          function SelectFactory(element, controller, config) {
            var $select = {};
            var options = angular.extend({}, defaults, config);
            $select = $tooltip(element, options);
            var scope = $select.$scope;
            scope.$matches = [];
            scope.$activeIndex = 0;
            scope.$isMultiple = options.multiple;
            scope.$showAllNoneButtons =
              options.allNoneButtons && options.multiple;
            scope.$iconCheckmark = options.iconCheckmark;
            scope.$activate = function (index) {
              scope.$$postDigest(function () {
                $select.activate(index);
              });
            };
            scope.$select = function (index, evt) {
              scope.$$postDigest(function () {
                $select.select(index);
              });
            };
            scope.$isVisible = function () {
              return $select.$isVisible();
            };
            scope.$isActive = function (index) {
              return $select.$isActive(index);
            };
            scope.$selectAll = function () {
              for (var i = 0; i < scope.$matches.length; i++) {
                if (!scope.$isActive(i)) {
                  scope.$select(i);
                }
              }
            };
            scope.$selectNone = function () {
              for (var i = 0; i < scope.$matches.length; i++) {
                if (scope.$isActive(i)) {
                  scope.$select(i);
                }
              }
            };
            $select.update = function (matches) {
              scope.$matches = matches;
              $select.$updateActiveIndex();
            };
            $select.activate = function (index) {
              if (options.multiple) {
                scope.$activeIndex.sort();
                $select.$isActive(index)
                  ? scope.$activeIndex.splice(
                      scope.$activeIndex.indexOf(index),
                      1
                    )
                  : scope.$activeIndex.push(index);
                if (options.sort) scope.$activeIndex.sort();
              } else {
                scope.$activeIndex = index;
              }
              return scope.$activeIndex;
            };
            $select.select = function (index) {
              var value = scope.$matches[index].value;
              scope.$apply(function () {
                $select.activate(index);
                if (options.multiple) {
                  controller.$setViewValue(
                    scope.$activeIndex.map(function (index) {
                      return scope.$matches[index].value;
                    })
                  );
                } else {
                  controller.$setViewValue(value);
                  $select.hide();
                }
              });
              scope.$emit(options.prefixEvent + '.select', value, index);
            };
            $select.$updateActiveIndex = function () {
              if (controller.$modelValue && scope.$matches.length) {
                if (
                  options.multiple &&
                  angular.isArray(controller.$modelValue)
                ) {
                  scope.$activeIndex = controller.$modelValue.map(function (
                    value
                  ) {
                    return $select.$getIndex(value);
                  });
                } else {
                  scope.$activeIndex = $select.$getIndex(
                    controller.$modelValue
                  );
                }
              } else if (scope.$activeIndex >= scope.$matches.length) {
                scope.$activeIndex = options.multiple ? [] : 0;
              }
            };
            $select.$isVisible = function () {
              if (!options.minLength || !controller) {
                return scope.$matches.length;
              }
              return (
                scope.$matches.length &&
                controller.$viewValue.length >= options.minLength
              );
            };
            $select.$isActive = function (index) {
              if (options.multiple) {
                return scope.$activeIndex.indexOf(index) !== -1;
              } else {
                return scope.$activeIndex === index;
              }
            };
            $select.$getIndex = function (value) {
              var l = scope.$matches.length,
                i = l;
              if (!l) return;
              for (i = l; i--; ) {
                if (scope.$matches[i].value === value) break;
              }
              if (i < 0) return;
              return i;
            };
            $select.$onMouseDown = function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              if (isTouch) {
                var targetEl = angular.element(evt.target);
                targetEl.triggerHandler('click');
              }
            };
            $select.$onKeyDown = function (evt) {
              if (!/(9|13|38|40)/.test(evt.keyCode)) return;
              evt.preventDefault();
              evt.stopPropagation();
              if (
                !options.multiple &&
                (evt.keyCode === 13 || evt.keyCode === 9)
              ) {
                return $select.select(scope.$activeIndex);
              }
              if (evt.keyCode === 38 && scope.$activeIndex > 0)
                scope.$activeIndex--;
              else if (
                evt.keyCode === 40 &&
                scope.$activeIndex < scope.$matches.length - 1
              )
                scope.$activeIndex++;
              else if (angular.isUndefined(scope.$activeIndex))
                scope.$activeIndex = 0;
              scope.$digest();
            };
            var _show = $select.show;
            $select.show = function () {
              _show();
              if (options.multiple) {
                $select.$element.addClass('select-multiple');
              }
              setTimeout(function () {
                $select.$element.on(
                  isTouch ? 'touchstart' : 'mousedown',
                  $select.$onMouseDown
                );
                if (options.keyboard) {
                  element.on('keydown', $select.$onKeyDown);
                }
              });
            };
            var _hide = $select.hide;
            $select.hide = function () {
              $select.$element.off(
                isTouch ? 'touchstart' : 'mousedown',
                $select.$onMouseDown
              );
              if (options.keyboard) {
                element.off('keydown', $select.$onKeyDown);
              }
              _hide(true);
            };
            return $select;
          }
          SelectFactory.defaults = defaults;
          return SelectFactory;
        },
      ];
    })
    .directive('bsSelect', [
      '$window',
      '$parse',
      '$q',
      '$select',
      '$parseOptions',
      function ($window, $parse, $q, $select, $parseOptions) {
        var defaults = $select.defaults;
        return {
          restrict: 'EAC',
          require: 'ngModel',
          link: function postLink(scope, element, attr, controller) {
            var options = { scope: scope };
            angular.forEach(
              [
                'placement',
                'container',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'template',
                'placeholder',
                'multiple',
                'allNoneButtons',
                'maxLength',
                'maxLengthHtml',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            if (element[0].nodeName.toLowerCase() === 'select') {
              var inputEl = element;
              inputEl.css('display', 'none');
              element = angular.element(
                '<button type="button" class="btn btn-default"></button>'
              );
              inputEl.after(element);
            }
            var parsedOptions = $parseOptions(attr.ngOptions);
            var select = $select(element, controller, options);
            var watchedOptions = parsedOptions.$match[7]
              .replace(/\|.+/, '')
              .trim();
            scope.$watch(
              watchedOptions,
              function (newValue, oldValue) {
                parsedOptions
                  .valuesFn(scope, controller)
                  .then(function (values) {
                    select.update(values);
                    controller.$render();
                  });
              },
              true
            );
            scope.$watch(
              attr.ngModel,
              function (newValue, oldValue) {
                select.$updateActiveIndex();
                controller.$render();
              },
              true
            );
            controller.$render = function () {
              var selected, index;
              if (options.multiple && angular.isArray(controller.$modelValue)) {
                selected = controller.$modelValue
                  .map(function (value) {
                    index = select.$getIndex(value);
                    return angular.isDefined(index)
                      ? select.$scope.$matches[index].label
                      : false;
                  })
                  .filter(angular.isDefined);
                if (
                  selected.length > (options.maxLength || defaults.maxLength)
                ) {
                  selected =
                    selected.length +
                    ' ' +
                    (options.maxLengthHtml || defaults.maxLengthHtml);
                } else {
                  selected = selected.join(', ');
                }
              } else {
                index = select.$getIndex(controller.$modelValue);
                selected = angular.isDefined(index)
                  ? select.$scope.$matches[index].label
                  : false;
              }
              element.html(
                (selected
                  ? selected
                  : attr.placeholder || defaults.placeholder) +
                  defaults.caretHtml
              );
            };
            scope.$on('$destroy', function () {
              if (select) select.destroy();
              options = null;
              select = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.tab', [])
    .provider('$tab', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        template: 'tab/tab.tpl.html',
        navClass: 'nav-tabs',
        activeClass: 'active',
      });
      var controller = (this.controller = function ($scope, $element, $attrs) {
        var self = this;
        self.$options = angular.copy(defaults);
        angular.forEach(
          ['animation', 'navClass', 'activeClass'],
          function (key) {
            if (angular.isDefined($attrs[key]))
              self.$options[key] = $attrs[key];
          }
        );
        $scope.$navClass = self.$options.navClass;
        $scope.$activeClass = self.$options.activeClass;
        self.$panes = $scope.$panes = [];
        self.$viewChangeListeners = [];
        self.$push = function (pane) {
          self.$panes.push(pane);
        };
        self.$panes.$active = 0;
        self.$setActive = $scope.$setActive = function (value) {
          self.$panes.$active = value;
          self.$viewChangeListeners.forEach(function (fn) {
            fn();
          });
        };
      });
      this.$get = function () {
        var $tab = {};
        $tab.defaults = defaults;
        $tab.controller = controller;
        return $tab;
      };
    })
    .directive('bsTabs', [
      '$window',
      '$animate',
      '$tab',
      function ($window, $animate, $tab) {
        var defaults = $tab.defaults;
        return {
          require: ['?ngModel', 'bsTabs'],
          transclude: true,
          scope: true,
          controller: ['$scope', '$element', '$attrs', $tab.controller],
          templateUrl: function (element, attr) {
            return attr.template || defaults.template;
          },
          link: function postLink(scope, element, attrs, controllers) {
            var ngModelCtrl = controllers[0];
            var bsTabsCtrl = controllers[1];
            if (ngModelCtrl) {
              bsTabsCtrl.$viewChangeListeners.push(function () {
                ngModelCtrl.$setViewValue(bsTabsCtrl.$panes.$active);
              });
              ngModelCtrl.$formatters.push(function (modelValue) {
                bsTabsCtrl.$setActive(modelValue * 1);
                return modelValue;
              });
            }
          },
        };
      },
    ])
    .directive('bsPane', [
      '$window',
      '$animate',
      '$sce',
      function ($window, $animate, $sce) {
        return {
          require: ['^?ngModel', '^bsTabs'],
          scope: true,
          link: function postLink(scope, element, attrs, controllers) {
            var ngModelCtrl = controllers[0];
            var bsTabsCtrl = controllers[1];
            element.addClass('tab-pane');
            attrs.$observe('title', function (newValue, oldValue) {
              scope.title = $sce.trustAsHtml(newValue);
            });
            if (bsTabsCtrl.$options.animation) {
              element.addClass(bsTabsCtrl.$options.animation);
            }
            bsTabsCtrl.$push(scope);
            function render() {
              var index = bsTabsCtrl.$panes.indexOf(scope);
              var active = bsTabsCtrl.$panes.$active;
              $animate[index === active ? 'addClass' : 'removeClass'](
                element,
                bsTabsCtrl.$options.activeClass
              );
            }
            bsTabsCtrl.$viewChangeListeners.push(function () {
              render();
            });
            render();
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.timepicker', [
      'mgcrea.ngStrap.helpers.dateParser',
      'mgcrea.ngStrap.tooltip',
    ])
    .provider('$timepicker', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        prefixClass: 'timepicker',
        placement: 'bottom-left',
        template: 'timepicker/timepicker.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        useNative: true,
        timeType: 'date',
        timeFormat: 'shortTime',
        modelTimeFormat: null,
        autoclose: false,
        minTime: -Infinity,
        maxTime: +Infinity,
        length: 5,
        hourStep: 1,
        minuteStep: 5,
        iconUp: 'glyphicon glyphicon-chevron-up',
        iconDown: 'glyphicon glyphicon-chevron-down',
        arrowBehavior: 'pager',
      });
      this.$get = [
        '$window',
        '$document',
        '$rootScope',
        '$sce',
        '$locale',
        'dateFilter',
        '$tooltip',
        function (
          $window,
          $document,
          $rootScope,
          $sce,
          $locale,
          dateFilter,
          $tooltip
        ) {
          var bodyEl = angular.element($window.document.body);
          var isNative = /(ip(a|o)d|iphone|android)/gi.test(
            $window.navigator.userAgent
          );
          var isTouch = 'createTouch' in $window.document && isNative;
          if (!defaults.lang) defaults.lang = $locale.id;
          function timepickerFactory(element, controller, config) {
            var $timepicker = $tooltip(
              element,
              angular.extend({}, defaults, config)
            );
            var parentScope = config.scope;
            var options = $timepicker.$options;
            var scope = $timepicker.$scope;
            var selectedIndex = 0;
            var startDate = controller.$dateValue || new Date();
            var viewDate = {
              hour: startDate.getHours(),
              meridian: startDate.getHours() < 12,
              minute: startDate.getMinutes(),
              second: startDate.getSeconds(),
              millisecond: startDate.getMilliseconds(),
            };
            var format =
              $locale.DATETIME_FORMATS[options.timeFormat] ||
              options.timeFormat;
            var formats = /(h+)([:\.])?(m+)[ ]?(a?)/i.exec(format).slice(1);
            scope.$iconUp = options.iconUp;
            scope.$iconDown = options.iconDown;
            scope.$select = function (date, index) {
              $timepicker.select(date, index);
            };
            scope.$moveIndex = function (value, index) {
              $timepicker.$moveIndex(value, index);
            };
            scope.$switchMeridian = function (date) {
              $timepicker.switchMeridian(date);
            };
            $timepicker.update = function (date) {
              if (angular.isDate(date) && !isNaN(date.getTime())) {
                $timepicker.$date = date;
                angular.extend(viewDate, {
                  hour: date.getHours(),
                  minute: date.getMinutes(),
                  second: date.getSeconds(),
                  millisecond: date.getMilliseconds(),
                });
                $timepicker.$build();
              } else if (!$timepicker.$isBuilt) {
                $timepicker.$build();
              }
            };
            $timepicker.select = function (date, index, keep) {
              if (
                !controller.$dateValue ||
                isNaN(controller.$dateValue.getTime())
              )
                controller.$dateValue = new Date(1970, 0, 1);
              if (!angular.isDate(date)) date = new Date(date);
              if (index === 0) controller.$dateValue.setHours(date.getHours());
              else if (index === 1)
                controller.$dateValue.setMinutes(date.getMinutes());
              controller.$setViewValue(controller.$dateValue);
              controller.$render();
              if (options.autoclose && !keep) {
                $timepicker.hide(true);
              }
            };
            $timepicker.switchMeridian = function (date) {
              var hours = (date || controller.$dateValue).getHours();
              controller.$dateValue.setHours(
                hours < 12 ? hours + 12 : hours - 12
              );
              controller.$setViewValue(controller.$dateValue);
              controller.$render();
            };
            $timepicker.$build = function () {
              var i,
                midIndex = (scope.midIndex = parseInt(options.length / 2, 10));
              var hours = [],
                hour;
              for (i = 0; i < options.length; i++) {
                hour = new Date(
                  1970,
                  0,
                  1,
                  viewDate.hour - (midIndex - i) * options.hourStep
                );
                hours.push({
                  date: hour,
                  label: dateFilter(hour, formats[0]),
                  selected:
                    $timepicker.$date && $timepicker.$isSelected(hour, 0),
                  disabled: $timepicker.$isDisabled(hour, 0),
                });
              }
              var minutes = [],
                minute;
              for (i = 0; i < options.length; i++) {
                minute = new Date(
                  1970,
                  0,
                  1,
                  0,
                  viewDate.minute - (midIndex - i) * options.minuteStep
                );
                minutes.push({
                  date: minute,
                  label: dateFilter(minute, formats[2]),
                  selected:
                    $timepicker.$date && $timepicker.$isSelected(minute, 1),
                  disabled: $timepicker.$isDisabled(minute, 1),
                });
              }
              var rows = [];
              for (i = 0; i < options.length; i++) {
                rows.push([hours[i], minutes[i]]);
              }
              scope.rows = rows;
              scope.showAM = !!formats[3];
              scope.isAM =
                ($timepicker.$date || hours[midIndex].date).getHours() < 12;
              scope.timeSeparator = formats[1];
              $timepicker.$isBuilt = true;
            };
            $timepicker.$isSelected = function (date, index) {
              if (!$timepicker.$date) return false;
              else if (index === 0) {
                return date.getHours() === $timepicker.$date.getHours();
              } else if (index === 1) {
                return date.getMinutes() === $timepicker.$date.getMinutes();
              }
            };
            $timepicker.$isDisabled = function (date, index) {
              var selectedTime;
              if (index === 0) {
                selectedTime = date.getTime() + viewDate.minute * 6e4;
              } else if (index === 1) {
                selectedTime = date.getTime() + viewDate.hour * 36e5;
              }
              return (
                selectedTime < options.minTime * 1 ||
                selectedTime > options.maxTime * 1
              );
            };
            scope.$arrowAction = function (value, index) {
              if (options.arrowBehavior === 'picker') {
                $timepicker.$setTimeByStep(value, index);
              } else {
                $timepicker.$moveIndex(value, index);
              }
            };
            $timepicker.$setTimeByStep = function (value, index) {
              var newDate = new Date($timepicker.$date);
              var hours = newDate.getHours(),
                hoursLength = dateFilter(newDate, 'h').length;
              var minutes = newDate.getMinutes(),
                minutesLength = dateFilter(newDate, 'mm').length;
              if (index === 0) {
                newDate.setHours(
                  hours - parseInt(options.hourStep, 10) * value
                );
              } else {
                newDate.setMinutes(
                  minutes - parseInt(options.minuteStep, 10) * value
                );
              }
              $timepicker.select(newDate, index, true);
              parentScope.$digest();
            };
            $timepicker.$moveIndex = function (value, index) {
              var targetDate;
              if (index === 0) {
                targetDate = new Date(
                  1970,
                  0,
                  1,
                  viewDate.hour + value * options.length,
                  viewDate.minute
                );
                angular.extend(viewDate, { hour: targetDate.getHours() });
              } else if (index === 1) {
                targetDate = new Date(
                  1970,
                  0,
                  1,
                  viewDate.hour,
                  viewDate.minute + value * options.length * options.minuteStep
                );
                angular.extend(viewDate, { minute: targetDate.getMinutes() });
              }
              $timepicker.$build();
            };
            $timepicker.$onMouseDown = function (evt) {
              if (evt.target.nodeName.toLowerCase() !== 'input')
                evt.preventDefault();
              evt.stopPropagation();
              if (isTouch) {
                var targetEl = angular.element(evt.target);
                if (targetEl[0].nodeName.toLowerCase() !== 'button') {
                  targetEl = targetEl.parent();
                }
                targetEl.triggerHandler('click');
              }
            };
            $timepicker.$onKeyDown = function (evt) {
              if (
                !/(38|37|39|40|13)/.test(evt.keyCode) ||
                evt.shiftKey ||
                evt.altKey
              )
                return;
              evt.preventDefault();
              evt.stopPropagation();
              if (evt.keyCode === 13) return $timepicker.hide(true);
              var newDate = new Date($timepicker.$date);
              var hours = newDate.getHours(),
                hoursLength = dateFilter(newDate, 'h').length;
              var minutes = newDate.getMinutes(),
                minutesLength = dateFilter(newDate, 'mm').length;
              var lateralMove = /(37|39)/.test(evt.keyCode);
              var count = 2 + !!formats[3] * 1;
              if (lateralMove) {
                if (evt.keyCode === 37)
                  selectedIndex =
                    selectedIndex < 1 ? count - 1 : selectedIndex - 1;
                else if (evt.keyCode === 39)
                  selectedIndex =
                    selectedIndex < count - 1 ? selectedIndex + 1 : 0;
              }
              var selectRange = [0, hoursLength];
              if (selectedIndex === 0) {
                if (evt.keyCode === 38)
                  newDate.setHours(hours - parseInt(options.hourStep, 10));
                else if (evt.keyCode === 40)
                  newDate.setHours(hours + parseInt(options.hourStep, 10));
                selectRange = [0, hoursLength];
              } else if (selectedIndex === 1) {
                if (evt.keyCode === 38)
                  newDate.setMinutes(
                    minutes - parseInt(options.minuteStep, 10)
                  );
                else if (evt.keyCode === 40)
                  newDate.setMinutes(
                    minutes + parseInt(options.minuteStep, 10)
                  );
                selectRange = [
                  hoursLength + 1,
                  hoursLength + 1 + minutesLength,
                ];
              } else if (selectedIndex === 2) {
                if (!lateralMove) $timepicker.switchMeridian();
                selectRange = [
                  hoursLength + 1 + minutesLength + 1,
                  hoursLength + 1 + minutesLength + 3,
                ];
              }
              $timepicker.select(newDate, selectedIndex, true);
              createSelection(selectRange[0], selectRange[1]);
              parentScope.$digest();
            };
            function createSelection(start, end) {
              if (element[0].createTextRange) {
                var selRange = element[0].createTextRange();
                selRange.collapse(true);
                selRange.moveStart('character', start);
                selRange.moveEnd('character', end);
                selRange.select();
              } else if (element[0].setSelectionRange) {
                element[0].setSelectionRange(start, end);
              } else if (angular.isUndefined(element[0].selectionStart)) {
                element[0].selectionStart = start;
                element[0].selectionEnd = end;
              }
            }
            function focusElement() {
              element[0].focus();
            }
            var _init = $timepicker.init;
            $timepicker.init = function () {
              if (isNative && options.useNative) {
                element.prop('type', 'time');
                element.css('-webkit-appearance', 'textfield');
                return;
              } else if (isTouch) {
                element.prop('type', 'text');
                element.attr('readonly', 'true');
                element.on('click', focusElement);
              }
              _init();
            };
            var _destroy = $timepicker.destroy;
            $timepicker.destroy = function () {
              if (isNative && options.useNative) {
                element.off('click', focusElement);
              }
              _destroy();
            };
            var _show = $timepicker.show;
            $timepicker.show = function () {
              _show();
              setTimeout(function () {
                $timepicker.$element.on(
                  isTouch ? 'touchstart' : 'mousedown',
                  $timepicker.$onMouseDown
                );
                if (options.keyboard) {
                  element.on('keydown', $timepicker.$onKeyDown);
                }
              });
            };
            var _hide = $timepicker.hide;
            $timepicker.hide = function (blur) {
              $timepicker.$element.off(
                isTouch ? 'touchstart' : 'mousedown',
                $timepicker.$onMouseDown
              );
              if (options.keyboard) {
                element.off('keydown', $timepicker.$onKeyDown);
              }
              _hide(blur);
            };
            return $timepicker;
          }
          timepickerFactory.defaults = defaults;
          return timepickerFactory;
        },
      ];
    })
    .directive('bsTimepicker', [
      '$window',
      '$parse',
      '$q',
      '$locale',
      'dateFilter',
      '$timepicker',
      '$dateParser',
      '$timeout',
      function (
        $window,
        $parse,
        $q,
        $locale,
        dateFilter,
        $timepicker,
        $dateParser,
        $timeout
      ) {
        var defaults = $timepicker.defaults;
        var isNative = /(ip(a|o)d|iphone|android)/gi.test(
          $window.navigator.userAgent
        );
        var requestAnimationFrame =
          $window.requestAnimationFrame || $window.setTimeout;
        return {
          restrict: 'EAC',
          require: 'ngModel',
          link: function postLink(scope, element, attr, controller) {
            var options = { scope: scope, controller: controller };
            angular.forEach(
              [
                'placement',
                'container',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'template',
                'autoclose',
                'timeType',
                'timeFormat',
                'modelTimeFormat',
                'useNative',
                'hourStep',
                'minuteStep',
                'length',
                'arrowBehavior',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            attr.bsShow &&
              scope.$watch(attr.bsShow, function (newValue, oldValue) {
                if (!timepicker || !angular.isDefined(newValue)) return;
                if (angular.isString(newValue))
                  newValue = !!newValue.match(',?(timepicker),?');
                newValue === true ? timepicker.show() : timepicker.hide();
              });
            if (isNative && (options.useNative || defaults.useNative))
              options.timeFormat = 'HH:mm';
            var timepicker = $timepicker(element, controller, options);
            options = timepicker.$options;
            var dateParser = $dateParser({
              format: options.timeFormat,
              lang: options.lang,
            });
            angular.forEach(['minTime', 'maxTime'], function (key) {
              angular.isDefined(attr[key]) &&
                attr.$observe(key, function (newValue) {
                  if (newValue === 'now') {
                    timepicker.$options[key] = new Date().setFullYear(
                      1970,
                      0,
                      1
                    );
                  } else if (
                    angular.isString(newValue) &&
                    newValue.match(/^".+"$/)
                  ) {
                    timepicker.$options[key] = +new Date(
                      newValue.substr(1, newValue.length - 2)
                    );
                  } else {
                    timepicker.$options[key] = dateParser.parse(
                      newValue,
                      new Date(1970, 0, 1, 0)
                    );
                  }
                  !isNaN(timepicker.$options[key]) && timepicker.$build();
                });
            });
            scope.$watch(
              attr.ngModel,
              function (newValue, oldValue) {
                timepicker.update(controller.$dateValue);
              },
              true
            );
            controller.$parsers.unshift(function (viewValue) {
              if (!viewValue) {
                controller.$setValidity('date', true);
                return;
              }
              var parsedTime = angular.isDate(viewValue)
                ? viewValue
                : dateParser.parse(viewValue, controller.$dateValue);
              if (!parsedTime || isNaN(parsedTime.getTime())) {
                controller.$setValidity('date', false);
              } else {
                var isValid =
                  parsedTime.getTime() >= options.minTime &&
                  parsedTime.getTime() <= options.maxTime;
                controller.$setValidity('date', isValid);
                if (isValid) controller.$dateValue = parsedTime;
              }
              if (options.timeType === 'string') {
                return dateFilter(
                  parsedTime,
                  options.modelTimeFormat || options.timeFormat
                );
              } else if (options.timeType === 'number') {
                return controller.$dateValue.getTime();
              } else if (options.timeType === 'iso') {
                return controller.$dateValue.toISOString();
              } else {
                return new Date(controller.$dateValue);
              }
            });
            controller.$formatters.push(function (modelValue) {
              var date;
              if (angular.isUndefined(modelValue) || modelValue === null) {
                date = NaN;
              } else if (angular.isDate(modelValue)) {
                date = modelValue;
              } else if (options.timeType === 'string') {
                date = dateParser.parse(
                  modelValue,
                  null,
                  options.modelTimeFormat
                );
              } else {
                date = new Date(modelValue);
              }
              controller.$dateValue = date;
              return controller.$dateValue;
            });
            controller.$render = function () {
              element.val(
                !controller.$dateValue || isNaN(controller.$dateValue.getTime())
                  ? ''
                  : dateFilter(controller.$dateValue, options.timeFormat)
              );
            };
            scope.$on('$destroy', function () {
              if (timepicker) timepicker.destroy();
              options = null;
              timepicker = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.tooltip', ['mgcrea.ngStrap.helpers.dimensions'])
    .provider('$tooltip', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        customClass: '',
        prefixClass: 'tooltip',
        prefixEvent: 'tooltip',
        container: false,
        target: false,
        placement: 'top',
        template: 'tooltip/tooltip.tpl.html',
        contentTemplate: false,
        trigger: 'hover focus',
        keyboard: false,
        html: false,
        show: false,
        title: '',
        type: '',
        delay: 0,
      });
      this.$get = [
        '$window',
        '$rootScope',
        '$compile',
        '$q',
        '$templateCache',
        '$http',
        '$animate',
        'dimensions',
        '$$rAF',
        function (
          $window,
          $rootScope,
          $compile,
          $q,
          $templateCache,
          $http,
          $animate,
          dimensions,
          $$rAF
        ) {
          var trim = String.prototype.trim;
          var isTouch = 'createTouch' in $window.document;
          var htmlReplaceRegExp = /ng-bind="/gi;
          function TooltipFactory(element, config) {
            var $tooltip = {};
            var nodeName = element[0].nodeName.toLowerCase();
            var options = ($tooltip.$options = angular.extend(
              {},
              defaults,
              config
            ));
            $tooltip.$promise = fetchTemplate(options.template);
            var scope = ($tooltip.$scope =
              (options.scope && options.scope.$new()) || $rootScope.$new());
            if (options.delay && angular.isString(options.delay)) {
              options.delay = parseFloat(options.delay);
            }
            if (options.title) {
              $tooltip.$scope.title = options.title;
            }
            scope.$hide = function () {
              scope.$$postDigest(function () {
                $tooltip.hide();
              });
            };
            scope.$show = function () {
              scope.$$postDigest(function () {
                $tooltip.show();
              });
            };
            scope.$toggle = function () {
              scope.$$postDigest(function () {
                $tooltip.toggle();
              });
            };
            $tooltip.$isShown = scope.$isShown = false;
            var timeout, hoverState;
            if (options.contentTemplate) {
              $tooltip.$promise = $tooltip.$promise.then(function (template) {
                var templateEl = angular.element(template);
                return fetchTemplate(options.contentTemplate).then(function (
                  contentTemplate
                ) {
                  var contentEl = findElement(
                    '[ng-bind="content"]',
                    templateEl[0]
                  );
                  if (!contentEl.length)
                    contentEl = findElement('[ng-bind="title"]', templateEl[0]);
                  contentEl.removeAttr('ng-bind').html(contentTemplate);
                  return templateEl[0].outerHTML;
                });
              });
            }
            var tipLinker, tipElement, tipTemplate, tipContainer;
            $tooltip.$promise.then(function (template) {
              if (angular.isObject(template)) template = template.data;
              if (options.html)
                template = template.replace(
                  htmlReplaceRegExp,
                  'ng-bind-html="'
                );
              template = trim.apply(template);
              tipTemplate = template;
              tipLinker = $compile(template);
              $tooltip.init();
            });
            $tooltip.init = function () {
              if (options.delay && angular.isNumber(options.delay)) {
                options.delay = {
                  show: options.delay,
                  hide: options.delay,
                };
              }
              if (options.container === 'self') {
                tipContainer = element;
              } else if (angular.isElement(options.container)) {
                tipContainer = options.container;
              } else if (options.container) {
                tipContainer = findElement(options.container);
              }
              var triggers = options.trigger.split(' ');
              angular.forEach(triggers, function (trigger) {
                if (trigger === 'click') {
                  element.on('click', $tooltip.toggle);
                } else if (trigger !== 'manual') {
                  element.on(
                    trigger === 'hover' ? 'mouseenter' : 'focus',
                    $tooltip.enter
                  );
                  element.on(
                    trigger === 'hover' ? 'mouseleave' : 'blur',
                    $tooltip.leave
                  );
                  nodeName === 'button' &&
                    trigger !== 'hover' &&
                    element.on(
                      isTouch ? 'touchstart' : 'mousedown',
                      $tooltip.$onFocusElementMouseDown
                    );
                }
              });
              if (options.target) {
                options.target = angular.isElement(options.target)
                  ? options.target
                  : findElement(options.target);
              }
              if (options.show) {
                scope.$$postDigest(function () {
                  options.trigger === 'focus'
                    ? element[0].focus()
                    : $tooltip.show();
                });
              }
            };
            $tooltip.destroy = function () {
              var triggers = options.trigger.split(' ');
              for (var i = triggers.length; i--; ) {
                var trigger = triggers[i];
                if (trigger === 'click') {
                  element.off('click', $tooltip.toggle);
                } else if (trigger !== 'manual') {
                  element.off(
                    trigger === 'hover' ? 'mouseenter' : 'focus',
                    $tooltip.enter
                  );
                  element.off(
                    trigger === 'hover' ? 'mouseleave' : 'blur',
                    $tooltip.leave
                  );
                  nodeName === 'button' &&
                    trigger !== 'hover' &&
                    element.off(
                      isTouch ? 'touchstart' : 'mousedown',
                      $tooltip.$onFocusElementMouseDown
                    );
                }
              }
              if (tipElement) {
                tipElement.remove();
                tipElement = null;
              }
              clearTimeout(timeout);
              scope.$destroy();
            };
            $tooltip.enter = function () {
              clearTimeout(timeout);
              hoverState = 'in';
              if (!options.delay || !options.delay.show) {
                return $tooltip.show();
              }
              timeout = setTimeout(function () {
                if (hoverState === 'in') $tooltip.show();
              }, options.delay.show);
            };
            $tooltip.show = function () {
              scope.$emit(options.prefixEvent + '.show.before', $tooltip);
              var parent = options.container ? tipContainer : null;
              var after = options.container ? null : element;
              if (tipElement) tipElement.remove();
              tipElement = $tooltip.$element = tipLinker(
                scope,
                function (clonedElement, scope) {}
              );
              tipElement
                .css({
                  top: '-9999px',
                  left: '-9999px',
                  display: 'block',
                  visibility: 'hidden',
                })
                .addClass(options.placement);
              if (options.animation) tipElement.addClass(options.animation);
              if (options.type)
                tipElement.addClass(options.prefixClass + '-' + options.type);
              if (options.customClass) tipElement.addClass(options.customClass);
              $animate.enter(tipElement, parent, after, function () {
                scope.$emit(options.prefixEvent + '.show', $tooltip);
              });
              $tooltip.$isShown = scope.$isShown = true;
              scope.$$phase ||
                (scope.$root && scope.$root.$$phase) ||
                scope.$digest();
              $$rAF(function () {
                $tooltip.$applyPlacement();
                tipElement.css({ visibility: 'visible' });
              });
              if (options.keyboard) {
                if (options.trigger !== 'focus') {
                  $tooltip.focus();
                  tipElement.on('keyup', $tooltip.$onKeyUp);
                } else {
                  element.on('keyup', $tooltip.$onFocusKeyUp);
                }
              }
            };
            $tooltip.leave = function () {
              clearTimeout(timeout);
              hoverState = 'out';
              if (!options.delay || !options.delay.hide) {
                return $tooltip.hide();
              }
              timeout = setTimeout(function () {
                if (hoverState === 'out') {
                  $tooltip.hide();
                }
              }, options.delay.hide);
            };
            $tooltip.hide = function (blur) {
              if (!$tooltip.$isShown) return;
              scope.$emit(options.prefixEvent + '.hide.before', $tooltip);
              $animate.leave(tipElement, function () {
                scope.$emit(options.prefixEvent + '.hide', $tooltip);
                if (blur && options.trigger === 'focus') {
                  return element[0].blur();
                }
              });
              $tooltip.$isShown = scope.$isShown = false;
              scope.$$phase ||
                (scope.$root && scope.$root.$$phase) ||
                scope.$digest();
              if (options.keyboard && tipElement !== null) {
                tipElement.off('keyup', $tooltip.$onKeyUp);
              }
            };
            $tooltip.toggle = function () {
              $tooltip.$isShown ? $tooltip.leave() : $tooltip.enter();
            };
            $tooltip.focus = function () {
              tipElement[0].focus();
            };
            $tooltip.$applyPlacement = function () {
              if (!tipElement) return;
              var elementPosition = getPosition();
              var tipWidth = tipElement.prop('offsetWidth'),
                tipHeight = tipElement.prop('offsetHeight');
              var tipPosition = getCalculatedOffset(
                options.placement,
                elementPosition,
                tipWidth,
                tipHeight
              );
              tipPosition.top += 'px';
              tipPosition.left += 'px';
              tipElement.css(tipPosition);
            };
            $tooltip.$onKeyUp = function (evt) {
              if (evt.which === 27 && $tooltip.$isShown) {
                $tooltip.hide();
                evt.stopPropagation();
              }
            };
            $tooltip.$onFocusKeyUp = function (evt) {
              if (evt.which === 27) {
                element[0].blur();
                evt.stopPropagation();
              }
            };
            $tooltip.$onFocusElementMouseDown = function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
              $tooltip.$isShown ? element[0].blur() : element[0].focus();
            };
            function getPosition() {
              if (options.container === 'body') {
                return dimensions.offset(options.target[0] || element[0]);
              } else {
                return dimensions.position(options.target[0] || element[0]);
              }
            }
            function getCalculatedOffset(
              placement,
              position,
              actualWidth,
              actualHeight
            ) {
              var offset;
              var split = placement.split('-');
              switch (split[0]) {
                case 'right':
                  offset = {
                    top: position.top + position.height / 2 - actualHeight / 2,
                    left: position.left + position.width,
                  };
                  break;
                case 'bottom':
                  offset = {
                    top: position.top + position.height,
                    left: position.left + position.width / 2 - actualWidth / 2,
                  };
                  break;
                case 'left':
                  offset = {
                    top: position.top + position.height / 2 - actualHeight / 2,
                    left: position.left - actualWidth,
                  };
                  break;
                default:
                  offset = {
                    top: position.top - actualHeight,
                    left: position.left + position.width / 2 - actualWidth / 2,
                  };
                  break;
              }
              if (!split[1]) {
                return offset;
              }
              if (split[0] === 'top' || split[0] === 'bottom') {
                switch (split[1]) {
                  case 'left':
                    offset.left = position.left;
                    break;
                  case 'right':
                    offset.left = position.left + position.width - actualWidth;
                }
              } else if (split[0] === 'left' || split[0] === 'right') {
                switch (split[1]) {
                  case 'top':
                    offset.top = position.top - actualHeight;
                    break;
                  case 'bottom':
                    offset.top = position.top + position.height;
                }
              }
              return offset;
            }
            return $tooltip;
          }
          function findElement(query, element) {
            return angular.element(
              (element || document).querySelectorAll(query)
            );
          }
          function fetchTemplate(template) {
            return $q
              .when($templateCache.get(template) || $http.get(template))
              .then(function (res) {
                if (angular.isObject(res)) {
                  $templateCache.put(template, res.data);
                  return res.data;
                }
                return res;
              });
          }
          return TooltipFactory;
        },
      ];
    })
    .directive('bsTooltip', [
      '$window',
      '$location',
      '$sce',
      '$tooltip',
      '$$rAF',
      function ($window, $location, $sce, $tooltip, $$rAF) {
        return {
          restrict: 'EAC',
          scope: true,
          link: function postLink(scope, element, attr, transclusion) {
            var options = { scope: scope };
            angular.forEach(
              [
                'template',
                'contentTemplate',
                'placement',
                'container',
                'target',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'type',
                'customClass',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            angular.forEach(['title'], function (key) {
              attr.$observe(key, function (newValue, oldValue) {
                scope[key] = $sce.trustAsHtml(newValue);
                angular.isDefined(oldValue) &&
                  $$rAF(function () {
                    tooltip && tooltip.$applyPlacement();
                  });
              });
            });
            attr.bsTooltip &&
              scope.$watch(
                attr.bsTooltip,
                function (newValue, oldValue) {
                  if (angular.isObject(newValue)) {
                    angular.extend(scope, newValue);
                  } else {
                    scope.title = newValue;
                  }
                  angular.isDefined(oldValue) &&
                    $$rAF(function () {
                      tooltip && tooltip.$applyPlacement();
                    });
                },
                true
              );
            attr.bsShow &&
              scope.$watch(attr.bsShow, function (newValue, oldValue) {
                if (!tooltip || !angular.isDefined(newValue)) return;
                if (angular.isString(newValue))
                  newValue = !!newValue.match(',?(tooltip),?');
                newValue === true ? tooltip.show() : tooltip.hide();
              });
            var tooltip = $tooltip(element, options);
            scope.$on('$destroy', function () {
              if (tooltip) tooltip.destroy();
              options = null;
              tooltip = null;
            });
          },
        };
      },
    ]);
  angular
    .module('mgcrea.ngStrap.typeahead', [
      'mgcrea.ngStrap.tooltip',
      'mgcrea.ngStrap.helpers.parseOptions',
    ])
    .provider('$typeahead', function () {
      var defaults = (this.defaults = {
        animation: 'am-fade',
        prefixClass: 'typeahead',
        prefixEvent: '$typeahead',
        placement: 'bottom-left',
        template: 'typeahead/typeahead.tpl.html',
        trigger: 'focus',
        container: false,
        keyboard: true,
        html: false,
        delay: 0,
        minLength: 1,
        filter: 'filter',
        limit: 6,
      });
      this.$get = [
        '$window',
        '$rootScope',
        '$tooltip',
        function ($window, $rootScope, $tooltip) {
          var bodyEl = angular.element($window.document.body);
          function TypeaheadFactory(element, controller, config) {
            var $typeahead = {};
            var options = angular.extend({}, defaults, config);
            $typeahead = $tooltip(element, options);
            var parentScope = config.scope;
            var scope = $typeahead.$scope;
            scope.$resetMatches = function () {
              scope.$matches = [];
              scope.$activeIndex = 0;
            };
            scope.$resetMatches();
            scope.$activate = function (index) {
              scope.$$postDigest(function () {
                $typeahead.activate(index);
              });
            };
            scope.$select = function (index, evt) {
              scope.$$postDigest(function () {
                $typeahead.select(index);
              });
            };
            scope.$isVisible = function () {
              return $typeahead.$isVisible();
            };
            $typeahead.update = function (matches) {
              scope.$matches = matches;
              if (scope.$activeIndex >= matches.length) {
                scope.$activeIndex = 0;
              }
            };
            $typeahead.activate = function (index) {
              scope.$activeIndex = index;
            };
            $typeahead.select = function (index) {
              var value = scope.$matches[index].value;
              controller.$setViewValue(value);
              controller.$render();
              scope.$resetMatches();
              if (parentScope) parentScope.$digest();
              scope.$emit(options.prefixEvent + '.select', value, index);
            };
            $typeahead.$isVisible = function () {
              if (!options.minLength || !controller) {
                return !!scope.$matches.length;
              }
              return (
                scope.$matches.length &&
                angular.isString(controller.$viewValue) &&
                controller.$viewValue.length >= options.minLength
              );
            };
            $typeahead.$getIndex = function (value) {
              var l = scope.$matches.length,
                i = l;
              if (!l) return;
              for (i = l; i--; ) {
                if (scope.$matches[i].value === value) break;
              }
              if (i < 0) return;
              return i;
            };
            $typeahead.$onMouseDown = function (evt) {
              evt.preventDefault();
              evt.stopPropagation();
            };
            $typeahead.$onKeyDown = function (evt) {
              if (!/(38|40|13)/.test(evt.keyCode)) return;
              if ($typeahead.$isVisible()) {
                evt.preventDefault();
                evt.stopPropagation();
              }
              if (evt.keyCode === 13 && scope.$matches.length) {
                $typeahead.select(scope.$activeIndex);
              } else if (evt.keyCode === 38 && scope.$activeIndex > 0)
                scope.$activeIndex--;
              else if (
                evt.keyCode === 40 &&
                scope.$activeIndex < scope.$matches.length - 1
              )
                scope.$activeIndex++;
              else if (angular.isUndefined(scope.$activeIndex))
                scope.$activeIndex = 0;
              scope.$digest();
            };
            var show = $typeahead.show;
            $typeahead.show = function () {
              show();
              setTimeout(function () {
                $typeahead.$element.on('mousedown', $typeahead.$onMouseDown);
                if (options.keyboard) {
                  element.on('keydown', $typeahead.$onKeyDown);
                }
              });
            };
            var hide = $typeahead.hide;
            $typeahead.hide = function () {
              $typeahead.$element.off('mousedown', $typeahead.$onMouseDown);
              if (options.keyboard) {
                element.off('keydown', $typeahead.$onKeyDown);
              }
              hide();
            };
            return $typeahead;
          }
          TypeaheadFactory.defaults = defaults;
          return TypeaheadFactory;
        },
      ];
    })
    .directive('bsTypeahead', [
      '$window',
      '$parse',
      '$q',
      '$typeahead',
      '$parseOptions',
      function ($window, $parse, $q, $typeahead, $parseOptions) {
        var defaults = $typeahead.defaults;
        return {
          restrict: 'EAC',
          require: 'ngModel',
          link: function postLink(scope, element, attr, controller) {
            var options = { scope: scope };
            angular.forEach(
              [
                'placement',
                'container',
                'delay',
                'trigger',
                'keyboard',
                'html',
                'animation',
                'template',
                'filter',
                'limit',
                'minLength',
                'watchOptions',
                'selectMode',
              ],
              function (key) {
                if (angular.isDefined(attr[key])) options[key] = attr[key];
              }
            );
            var filter = options.filter || defaults.filter;
            var limit = options.limit || defaults.limit;
            var ngOptions = attr.ngOptions;
            if (filter) ngOptions += ' | ' + filter + ':$viewValue';
            if (limit) ngOptions += ' | limitTo:' + limit;
            var parsedOptions = $parseOptions(ngOptions);
            var typeahead = $typeahead(element, controller, options);
            if (options.watchOptions) {
              var watchedOptions = parsedOptions.$match[7]
                .replace(/\|.+/, '')
                .replace(/\(.*\)/g, '')
                .trim();
              scope.$watch(
                watchedOptions,
                function (newValue, oldValue) {
                  parsedOptions
                    .valuesFn(scope, controller)
                    .then(function (values) {
                      typeahead.update(values);
                      controller.$render();
                    });
                },
                true
              );
            }
            scope.$watch(attr.ngModel, function (newValue, oldValue) {
              scope.$modelValue = newValue;
              parsedOptions.valuesFn(scope, controller).then(function (values) {
                if (
                  options.selectMode &&
                  !values.length &&
                  newValue.length > 0
                ) {
                  controller.$setViewValue(
                    controller.$viewValue.substring(
                      0,
                      controller.$viewValue.length - 1
                    )
                  );
                  return;
                }
                if (values.length > limit) values = values.slice(0, limit);
                var isVisible = typeahead.$isVisible();
                isVisible && typeahead.update(values);
                if (values.length === 1 && values[0].value === newValue) return;
                !isVisible && typeahead.update(values);
                controller.$render();
              });
            });
            controller.$render = function () {
              if (controller.$isEmpty(controller.$viewValue))
                return element.val('');
              var index = typeahead.$getIndex(controller.$modelValue);
              var selected = angular.isDefined(index)
                ? typeahead.$scope.$matches[index].label
                : controller.$viewValue;
              selected = angular.isObject(selected) ? selected.label : selected;
              element.val(selected.replace(/<(?:.|\n)*?>/gm, '').trim());
            };
            scope.$on('$destroy', function () {
              if (typeahead) typeahead.destroy();
              options = null;
              typeahead = null;
            });
          },
        };
      },
    ]);
})(window, document);
