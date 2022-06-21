/*! RESOURCE: /scripts/app.$sp/directive.spNotifications.js */
angular
  .module('sn.$sp')
  .directive(
    'spNotifications',
    function ($timeout, spAriaUtil, spAriaFocusManager, i18n) {
      var str = 'CONSOLE:';
      function isConsoleMsg(msg) {
        if (!msg) return false;
        return msg.startsWith(str);
      }
      function outputToConsole(msg) {
        var output = msg.substring(str.length);
        var reg = new RegExp('^\\{|^\\[');
        if (reg.test(output)) {
          try {
            output = jQuery.parseJSON(output);
          } catch (err) {}
        }
        console.warn(output);
      }
      return {
        restrict: 'E',
        replace: true,
        template:
          '<div id="uiNotificationContainer" role="status" aria-atomic="false">\
  <div ng-repeat="m in c.notifications"\
  class="alert" ng-class="{\'alert-danger\' : m.type == \'error\', \'alert-warning\' : m.type == \'warning\', \'alert-success\' : m.type != \'warning\' && m.type != \'error\'}">\
  <span ng-if="m.type == \'error\' " class="fa fa-exclamation-triangle m-r-xs" aria-hidden="true"></span>\
  <span ng-if="m.type == \'error\' " class="sr-only">{{c.errorMsg}}</span>\
  <span class="alert-msg" ng-bind-html="m.displayMessage" ng-click="::c.dismissOnAnchorClick($event)" role="presentation"></span>\
  <button class="btn btn-link fa fa-close dismiss-notifications" ng-click="::c.dismissNotification($index)" aria-label="Close Notification"></button>\
  </div>\
  </div>',
        controllerAs: 'c',
        controller: function ($scope, $element) {
          var c = this;
          var dismissedNotifications = [];
          c.errorMsg = i18n.getMessage('Error');
          c.notifications = [];
          var timer;
          var duplicateNotfCheck = function (
            notifications,
            n,
            useDisplayMessage
          ) {
            for (var i = 0; i < notifications.length; i++)
              if (
                n.message ===
                  (useDisplayMessage
                    ? notifications[i].displayMessage
                    : notifications[i].message) &&
                notifications[i].type === n.type
              )
                return i;
            return -1;
          };
          function addNotification(notification) {
            if (!notification) return;
            if (isConsoleMsg(notification.message)) {
              outputToConsole(notification.message);
              return;
            }
            if (typeof notification.message === 'undefined') {
              console.warn(
                'Invalid message "' +
                  notification +
                  '" passed to spNotifications directive, expected an Object {type:[type], message:[message]}'
              );
              return;
            }
            $element.on('mouseover', function () {
              $element.off();
              c.cancelAutoDismiss();
            });
            notification.displayMessage = notification.message;
            var notificationIndex = duplicateNotfCheck(
              c.notifications,
              notification,
              false
            );
            $timeout(function () {
              if (notificationIndex < 0) {
                var dismissedMsgIndex = duplicateNotfCheck(
                  dismissedNotifications,
                  notification,
                  true
                );
                if (dismissedMsgIndex > -1)
                  notification.displayMessage += '&nbsp';
                c.notifications.push(notification);
              } else {
                if (
                  c.notifications[notificationIndex].message ===
                  c.notifications[notificationIndex].displayMessage
                )
                  c.notifications[notificationIndex].displayMessage += '&nbsp';
                else
                  c.notifications[notificationIndex].displayMessage =
                    c.notifications[notificationIndex].message;
              }
            }, 500);
            if (spAriaUtil.g_accessibility === 'true') {
              if (notification.type === 'error') $element.attr('role', 'alert');
            } else {
              timer = autoDismiss();
              $timeout(function () {
                focusFirstErrorField();
              }, 50);
            }
          }
          function focusFirstErrorField() {
            var hasErrorField = $('.has-error:first');
            var elements = [
              'input:visible',
              'textarea:visible',
              'button:visible',
            ];
            var hasErrorHtmlField = hasErrorField.find('iframe:visible');
            if (
              hasErrorField.hasClass('type-html') &&
              hasErrorHtmlField.length
            ) {
              hasErrorHtmlField.contents().find('body').focus();
              return true;
            }
            for (var i = 0; i < elements.length; i++) {
              var errorElement = hasErrorField.find(elements[i]);
              if (errorElement.length) {
                errorElement[0].focus();
                return true;
              }
            }
            return false;
          }
          function addNotifications(e, notifications) {
            if (!notifications) {
              console.warn(
                '$$uiNotification event fired with invalid or missing notifications parameter'
              );
              return;
            }
            if (Array.isArray(notifications)) {
              for (var x in notifications) addNotification(notifications[x]);
            } else {
              addNotification(notifications);
            }
          }
          $scope.$on('$$uiNotification', addNotifications);
          var updateDismissedNotifications = function (n) {
            var index = duplicateNotfCheck(dismissedNotifications, n, false);
            if (index < 0) dismissedNotifications.push(n);
            else dismissedNotifications[index] = n;
          };
          c.dismissNotification = function (index) {
            updateDismissedNotifications(c.notifications[index]);
            if (index > -1) c.notifications.splice(index, 1);
            if (spAriaUtil.isAccessibilityEnabled()) {
              if (c.notifications.length > 0) {
                var focusableIndex =
                  index === c.notifications.length ? 0 : index + 1;
                $scope.focusOnNotificationCloseButton(focusableIndex);
              } else if (!focusFirstErrorField())
                spAriaFocusManager.focusOnPageTitle();
            }
          };
          c.dismissNotifications = function () {
            c.notifications.forEach(function (n) {
              updateDismissedNotifications(n);
            });
            c.notifications.length = 0;
          };
          c.dismissOnAnchorClick = function (e) {
            if (!g_persist_msgs_through_page_nav) return;
            if (e.target.nodeName == 'A') c.dismissNotifications();
          };
          c.getMilliSeconds = function () {
            var msgTimeout =
              typeof g_notif_timeout !== 'undefined' ? g_notif_timeout : 5;
            var seconds = areTrivial(c.notifications) ? 3 : msgTimeout;
            return seconds * 1000;
          };
          function areTrivial(input) {
            return (
              input.length >= 1 &&
              input.every(function (item) {
                return item && item.type === 'trivial';
              })
            );
          }
          function autoDismiss() {
            if (timer) $timeout.cancel(timer);
            var milliSeconds = c.getMilliSeconds();
            if (milliSeconds > 0)
              return $timeout(c.dismissNotifications, milliSeconds);
          }
          c.cancelAutoDismiss = function () {
            if (areTrivial(c.notifications)) return;
            $timeout.cancel(timer);
          };
          $scope.$on('$$uiNotification.dismiss', c.dismissNotifications);
        },
        link: function (scope, element, attrs, ctrl) {
          scope.focusOnNotificationCloseButton = function (index) {
            $timeout(function () {
              $('#uiNotificationContainer .dismiss-notifications')[
                index
              ].focus();
            });
          };
        },
      };
    }
  );
