/*! RESOURCE: /scripts/app.$sp/service.spAria.js */
angular
  .module('sn.$sp')
  .factory('spAriaUtil', function ($window, $rootScope) {
    'use strict';
    var g_accessibility = $window.g_accessibility;
    function link(role, forced, index) {
      return function ($scope, $element, attr) {
        if (g_accessibility && (_.isEmpty(attr['role']) || forced))
          $element.attr('role', role);
        tabindex($element, attr, index);
      };
    }
    function tabindex($element, attr, index) {
      if (!_.isEmpty(attr['tabindex'])) index = attr['tabindex'];
      if (!_.isEmpty(index)) $element.attr('tabindex', index);
    }
    function attr($element, name, value) {
      if (g_accessibility) $element.attr(name, value);
    }
    var liveMessageHandler;
    function registerLiveMessageHandler(callbackFn) {
      liveMessageHandler = callbackFn;
    }
    function sendLiveMessage(message, type) {
      if (liveMessageHandler) liveMessageHandler(message, type);
    }
    function isAccessibilityEnabled() {
      return g_accessibility === true || g_accessibility === 'true';
    }
    function init() {
      if (window.g_accessibility_resizeText) {
        $(window).on('load', function () {
          if (window.NOW.portal_id === '26f2fffb77322300454792718a1061e5') {
            var initialRootFontSize = 16;
            var currentRootFontSize = parseInt(
              window.getComputedStyle(document.documentElement).fontSize,
              10
            );
            var zoomPercent =
              Math.ceil(
                ((currentRootFontSize / initialRootFontSize) * 100) / 10
              ) * 10;
            if (zoomPercent >= 150)
              document.body.setAttribute('text-zoom', 'true');
            else document.body.removeAttribute('text-zoom');
          } else {
            var initialRootFontSize = parseInt(
              window.getComputedStyle(document.documentElement).fontSize,
              10
            );
            var iframe = document.createElement('iframe');
            iframe.setAttribute('tabindex', '-1');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.id = 'text_only_resize_iframe';
            iframe.style.top = '-999px';
            iframe.style.left = '-999px';
            iframe.style.position = 'absolute';
            iframe.style.height = '1em';
            iframe.onload = function (event) {
              iframe.contentWindow.addEventListener('resize', function (event) {
                var currentRootFontSize = parseInt(
                  window.getComputedStyle(document.documentElement).fontSize,
                  10
                );
                var zoomPercent =
                  Math.ceil(
                    ((currentRootFontSize / initialRootFontSize) * 100) / 10
                  ) * 10;
                $rootScope.$broadcast('sp.textOnlyZoom', zoomPercent);
                if (zoomPercent >= 150)
                  document.body.setAttribute('text-zoom', 'true');
                else document.body.removeAttribute('text-zoom');
              });
            };
            document.body.insertBefore(iframe, document.body.childNodes[0]);
          }
        });
      }
    }
    return {
      init: init,
      link: link,
      tabindex: tabindex,
      g_accessibility: g_accessibility,
      sendLiveMessage: sendLiveMessage,
      onLiveMessage: registerLiveMessageHandler,
      isAccessibilityEnabled: isAccessibilityEnabled,
    };
  })
  .directive('spa11y', function (spAriaUtil) {
    function link($scope, $element, attr) {
      $element.attr('accessibility', g_accessibility);
    }
    return {
      restrict: 'A',
      link: link,
    };
  })
  .directive('spAria', function (spAriaUtil) {
    function link($scope, $element, attr) {
      var role = attr['spAria'];
      if (spAriaUtil.g_accessibility && !_.isEmpty(role))
        $element.attr('role', role);
    }
    return {
      restrict: 'A',
      link: link,
    };
  })
  .directive(
    'body',
    function (spAriaUtil, spAriaFocusManager, $location, $browser, $window) {
      return {
        restrict: 'E',
        link: function (scope, elem) {
          angular.element(elem).on('click', 'a', function () {
            scope.$applyAsync(function () {
              spAriaFocusManager.navigateToLink($location.url());
              var hash = $location.hash();
              if ($location.absUrl() === $browser.url() && hash) {
                var elm =
                  document.getElementById(hash) ||
                  $('a:visible[name=' + hash + ']')[0];
                if (elm) elm.scrollIntoView();
                else if (hash === 'top') $window.scrollTo(0, 0);
              }
            });
          });
        },
      };
    }
  )
  .directive('form', function (spAriaUtil) {
    return {
      restrict: 'E',
      link: spAriaUtil.link('form'),
    };
  })
  .directive('img', function (spAriaUtil) {
    return {
      restrict: 'E',
      link: spAriaUtil.link('presentation'),
    };
  })
  .directive('textarea', function (spAriaUtil) {
    return {
      restrict: 'E',
      link: spAriaUtil.link('textbox', false, 0),
    };
  })
  .directive('input', function (spAriaUtil) {
    function link($scope, $element, attr) {
      var role;
      switch (attr['type']) {
        case 'email':
        case 'password':
        case 'tel':
        case 'text':
        case 'url':
          role = 'textbox';
          break;
        case 'button':
        case 'checkbox':
        case 'radio':
          role = attr['type'];
          break;
        case 'hidden':
          break;
        case 'image':
        case 'reset':
        case 'submit':
          role = 'button';
          break;
        case 'number':
          role = 'spinbutton';
          break;
        case 'range':
          role = 'slider';
          break;
        case 'search':
          role = 'searchbox';
          break;
      }
      if (spAriaUtil.g_accessibility && !_.isEmpty(role))
        spAriaUtil.link(role, false, 0)($scope, $element, attr);
    }
    return {
      restrict: 'E',
      link: link,
    };
  })
  .directive('span', function (spAriaUtil) {
    function link($scope, $element, attr) {
      var role;
      if (attr['style'] && attr['style'].indexOf('background') > -1) {
        role = 'presentation';
        attr['aria-hidden'] = true;
      }
      if (spAriaUtil.g_accessibility && !_.isEmpty(role))
        spAriaUtil.link(role, false, 0)($scope, $element, attr);
    }
    return {
      restrict: 'E',
      link: link,
    };
  })
  .directive('role', function (spAriaUtil) {
    function link($scope, $element, attr) {
      var role = attr['role'];
      if (role === 'slider') {
        spAriaUtil.tabindex($element, attr, -1);
        $element.find('i[aria-valuetext]').each(function (idx, el) {
          $(el).attr('tabindex', 0);
        });
      }
    }
    return {
      restrict: 'A',
      link: link,
    };
  })
  .directive('spAriaLive', function (spAriaUtil, spUtil) {
    function link(scope, elem, attr) {
      var track = { status: false, alert: false };
      var isMobile = spUtil.isMobile(),
        ariaLiveTimeout;
      var liveMsgFunc = function (message, type) {
        ariaLiveTimeout && clearTimeout(ariaLiveTimeout);
        if (isMobile)
          $(elem)
            .find(type == 'status' ? '.sp-aria-live-polite' : '.sp-aria-live')
            .removeAttr('style');
        type = type || 'alert';
        if (!message.length) {
          $(elem)
            .find(type == 'status' ? '.sp-aria-live-polite' : '.sp-aria-live')
            .html('');
          return;
        }
        var uniqueMessage = [];
        message.forEach(function (item, index) {
          if (uniqueMessage.indexOf(item.message) == -1)
            uniqueMessage.push(item.message);
        });
        if (message.length === 1) track[type] = !track[type];
        var parentDiv = document.createElement('div');
        uniqueMessage.forEach(function (item, index) {
          uniqueMessage[index] = track[type]
            ? uniqueMessage[index] + '&nbsp'
            : uniqueMessage[index];
          var childDiv = document.createElement('div');
          childDiv.innerHTML = uniqueMessage[index];
          parentDiv.appendChild(childDiv);
        });
        $(elem)
          .find(type == 'status' ? '.sp-aria-live-polite' : '.sp-aria-live')
          .html('')
          .append(parentDiv);
        if (isMobile) {
          setTimeout(function () {
            document.querySelector(
              type == 'status' ? '.sp-aria-live-polite' : '.sp-aria-live'
            ).style.display = 'none';
          }, 200);
        }
        ariaLiveTimeout = setTimeout(function () {
          $(elem).find('.sp-aria-live-polite')[0].innerHTML = '';
          $(elem).find('.sp-aria-live')[0].innerHTML = '';
        }, 1000);
      };
      var timeout;
      var prevMessage;
      spAriaUtil.onLiveMessage(function (msg, type) {
        var message = typeof msg === 'object' ? msg : [{ message: msg }];
        if (message.length === 1) {
          if (msg == prevMessage) {
            timeout && clearTimeout(timeout);
            timeout = setTimeout(function () {
              liveMsgFunc(message, type);
            }, 150);
          } else liveMsgFunc(message, type);
          prevMessage = msg;
        } else {
          timeout && clearTimeout(timeout);
          liveMsgFunc(message, type);
          prevMessage = '';
        }
      });
    }
    return {
      template: [
        '<div>',
        '<div aria-live="assertive" class="sr-only sp-aria-live"></div>',
        '<div aria-live="polite" class="sr-only sp-aria-live-polite"></div>',
        '</div>',
      ].join(''),
      restrict: 'E',
      link: link,
    };
  })
  .directive('spRating', function ($timeout, i18n) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        var ratingDescriptionMsg = i18n.getMessage('{0} out of {1} selected');
        $timeout(function () {
          if (attrs.readonly === true || attrs.readonly === 'true') {
            angular.element(elem).removeAttr('tabindex');
          }
          scope.$watch(attrs.ngModel, function (newValue) {
            angular
              .element(elem)
              .attr(
                'aria-valuetext',
                ratingDescriptionMsg.withValues([newValue, attrs.max])
              );
          });
        });
      },
    };
  });
