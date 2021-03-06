/*! RESOURCE: /scripts/sn/common/notification/service.snNotification.js */
angular
  .module('sn.common.notification')
  .factory(
    'snNotification',
    function (
      $document,
      $templateCache,
      $compile,
      $rootScope,
      $timeout,
      $q,
      getTemplateUrl,
      $http,
      i18n
    ) {
      'use strict';
      var openNotifications = [],
        timeouts = {},
        options = {
          top: 20,
          gap: 10,
          duration: 5000,
        },
        a11yContainer,
        a11yDuration = 5000;
      return {
        show: function (type, message, duration, onClick, container) {
          return createNotificationElement(type, message).then(function (
            element
          ) {
            return displayAndDestroyNotification(element, container, duration);
          });
        },
        showScreenReaderOnly: function (
          type,
          message,
          duration,
          onClick,
          container
        ) {
          return createNotificationElement(type, message, true).then(function (
            element
          ) {
            return displayAndDestroyNotification(element, container, duration);
          });
        },
        hide: hide,
        setOptions: function (opts) {
          if (angular.isObject(opts)) angular.extend(options, opts);
        },
      };
      function displayAndDestroyNotification(element, container, duration) {
        displayNotification(element, container);
        checkAndSetDestroyDuration(element, duration);
        return element;
      }
      function getTemplate() {
        var templateName = 'sn_notification.xml',
          template = $templateCache.get(templateName),
          deferred = $q.defer();
        if (!template) {
          var url = getTemplateUrl(templateName);
          $http.get(url).then(
            function (result) {
              $templateCache.put(templateName, result.data);
              deferred.resolve(result.data);
            },
            function (reason) {
              return $q.reject(reason);
            }
          );
        } else deferred.resolve(template);
        return deferred.promise;
      }
      function createNotificationElement(type, message, screenReaderOnly) {
        var thisScope, thisElement;
        var icon = 'icon-info';
        screenReaderOnly =
          typeof screenReaderOnly === 'undefined' ? false : screenReaderOnly;
        if (type == 'error') {
          icon = 'icon-cross-circle';
        } else if (type == 'warning') {
          icon = 'icon-alert';
        } else if (type == 'success') {
          icon = 'icon-check-circle';
        }
        return getTemplate().then(function (template) {
          thisScope = $rootScope.$new();
          thisScope.type = type;
          thisScope.message = message;
          thisScope.icon = icon;
          thisScope.screenReaderOnly = screenReaderOnly;
          thisElement = $compile(template)(thisScope);
          return angular.element(thisElement[0]);
        });
      }
      function displayNotification(element, container) {
        if (!a11yContainer) {
          a11yContainer = angular.element(
            '<div class="notification-a11y-container sr-only" aria-live="assertive">'
          );
          $document.find('body').append(a11yContainer);
        }
        var container = $document.find(container || 'body'),
          id = 'elm' + Date.now(),
          pos;
        container.append(element);
        pos =
          options.top + openNotifications.length * getElementHeight(element);
        positionElement(element, pos);
        element.addClass('visible');
        element.attr('id', id);
        element.find('button').bind('click', function (e) {
          hideElement(element);
        });
        openNotifications.push(element);
        if (options.duration > 0)
          timeouts[id] = $timeout(function () {
            hideNext();
          }, options.duration);
        $timeout(
          function () {
            var srElement = angular.element('<div>').text(element.text());
            a11yContainer.append(srElement);
            $timeout(
              function () {
                srElement.remove();
              },
              a11yDuration,
              false
            );
          },
          0,
          false
        );
      }
      function hide(element) {
        $timeout.cancel(timeouts[element.attr('id')]);
        element.removeClass('visible');
        element.addClass('hidden');
        element.find('button').eq(0).unbind();
        element.scope().$destroy();
        element.remove();
        repositionAll();
      }
      function hideElement(element) {
        var index = openNotifications.indexOf(element);
        openNotifications.splice(index, 1);
        hide(element);
      }
      function hideNext() {
        var element = openNotifications.shift();
        if (element) hide(element);
      }
      function getElementHeight(element) {
        return element[0].offsetHeight + options.gap;
      }
      function positionElement(element, pos) {
        element[0].style.top = pos + 'px';
      }
      function repositionAll() {
        var pos = options.top;
        openNotifications.forEach(function (element) {
          positionElement(element, pos);
          pos += getElementHeight(element);
        });
      }
      function checkAndSetDestroyDuration(element, duration) {
        if (duration) {
          timeouts[element.attr('id')] = $timeout(function () {
            hideElement(element);
          }, duration);
        }
      }
    }
  );
