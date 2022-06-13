/*! RESOURCE: /scripts/app.ngbsm/directive.snNotifier.js */
angular
  .module('sn.ngbsm')
  .directive('snNotifier', function ($log, $timeout, CONFIG, i18n) {
    'use strict';
    return {
      restrict: 'E',
      replace: false,
      scope: {},
      template:
        '<div class="sn-notification-holder">' +
        '   <div class="sn-notification-entry notification" role="alert" ng-repeat="notification in notifications track by notification.id"  ng-class="indicatorClass(notification)" ng-style="offset($index)" sn-center-horizontally=""  ng-bind-html="notification.message">' +
        '       {{notification.message}}' +
        '   </div>' +
        '</div>',
      controller: function ($scope) {
        var ids = 0;
        $scope.notifications = [];
        $scope.$on('ngbsm.view_saved', function (event, data) {
          if (!data || !angular.isString(data.name)) return;
          var translatedMsg = i18n.getMessage(
            'dependencies.ngbsm.notifier.saved.succeed'
          );
          addNotification({
            id: ids++,
            message: translatedMsg + " '" + data.name + "'",
          });
        });
        $scope.$on('ngbsm.view_loaded', function (event, data) {
          if (!data || !angular.isString(data.name)) return;
          var translatedMsg = i18n.getMessage(
            'dependencies.ngbsm.notifier.loaded.succeed'
          );
          addNotification({
            id: ids++,
            message: translatedMsg + " '" + data.name + "'",
          });
        });
        $scope.$on('ngbsm.success', function (event, data) {
          if (!data || !data.success) return;
          if (angular.isUndefined(data.id)) {
            addNotification({
              id: ids++,
              message: data.success,
            });
          } else {
            addNotification({
              id: data.id,
              message: data.success,
            });
          }
        });
        $scope.$on('ngbsm.warning', function (event, data) {
          if (!data || !data.warning) return;
          if (angular.isUndefined(data.id)) {
            addNotification({
              id: ids++,
              message: data.warning,
            });
          } else {
            addNotification({
              id: data.id,
              message: data.warning,
            });
          }
        });
        $scope.$on('ngbsm.error', function (event, data) {
          if (!data || !data.error) return;
          if (angular.isUndefined(data.id)) {
            addNotification({
              id: ids++,
              message: data.error,
              type: 'negative',
            });
          } else {
            addNotification({
              id: data.id,
              message: data.error,
              type: 'negative',
            });
          }
        });
        $scope.offset = function (index) {
          return {
            top: index * 48 + 'px',
          };
        };
        $scope.indicatorClass = function (notification) {
          return {
            'notification-info':
              notification.type !== 'negative' ? true : false,
            'notification-error':
              notification.type === 'negative' ? true : false,
          };
        };
        function addNotification(entry) {
          var doNotNotify = false;
          if (entry.id) {
            angular.forEach($scope.notifications, function (value) {
              if (value.id) {
                if (value.id === entry.id) {
                  doNotNotify = true;
                }
              }
            });
          }
          if (!doNotNotify) {
            $scope.notifications.push(entry);
            $log.warn('User notification: ' + entry.message);
            $timeout(function () {
              $scope.notifications.shift();
            }, CONFIG.NOTIFICATION_DISPLAY_TIME);
          }
        }
      },
    };
  });