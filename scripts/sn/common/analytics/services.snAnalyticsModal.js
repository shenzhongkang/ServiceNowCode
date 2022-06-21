/*! RESOURCE: /scripts/sn/common/analytics/service.snAnalyticsModal.js */
angular
  .module('sn.common.analytics')
  .factory(
    'snAnalyticsConsentModal',
    function ($q, $uibModal, i18n, $templateCache) {
      'use strict';
      var templateName = 'sn-analytics-consent-modal.xml';
      function open(options) {
        var options = initOptions(options);
        var defer = $q.defer();
        _open(options, defer);
        return defer.promise;
      }
      function _open(options, defer) {
        var pageRoot = angular.element(
          options.pageRootElement || '.sp-page-root'
        );
        var modal = $uibModal.open({
          templateUrl: templateName,
          controller: snModalCtrl,
          size: options.size,
          appendTo: options.appendTo,
          backdrop: options.backdrop != undefined ? options.backdrop : 'static',
          keyboard: options.keyboard != undefined ? options.keyboard : false,
          resolve: {
            options: function () {
              return options;
            },
          },
        });
        modal.result.then(
          function (result) {
            defer.resolve(result.button);
          },
          function () {
            defer.reject();
          }
        );
        modal.rendered.then(function () {
          var h1 = angular.element('#modal-title');
          var modal = h1.closest('div.modal');
          modal.attr('aria-labelledby', 'modal-title');
          modal.attr('aria-describedby', 'modal-body');
          pageRoot.attr('aria-hidden', 'true');
          setTimeout(function () {
            modal.find('.btn-focus').focus();
          }, 0);
        });
        modal.closed.then(function () {
          pageRoot.attr('aria-hidden', 'false');
        });
      }
      function initOptions(options) {
        var defaults = {
          title: '',
          message: '',
          messageOnly: false,
          size: '',
          noDismiss: false,
          buttons: [
            { label: i18n.getMessage('No'), cancel: true },
            { label: i18n.getMessage('Yes'), primary: true },
          ],
        };
        options = options || {};
        for (var key in defaults) {
          if (options[key] === undefined) {
            options[key] = defaults[key];
          }
        }
        if (options.messageOnly) {
          options.headerStyle = { border: 'none' };
          options.footerStyle = { border: 'none', 'padding-top': 0 };
        }
        if (options.noDismiss) options.headerStyle = { display: 'none' };
        return options;
      }
      function snModalCtrl($scope, options) {
        $scope.options = options;
        $scope.buttonClicked = function (button) {
          if (button.cancel) {
            $scope.$dismiss();
            return;
          }
          $scope.$close({ button: button });
        };
      }
      $templateCache.put(
        templateName,
        '<div>' +
          '	<div class="modal-header" ng-style="options.headerStyle">' +
          '		<h1 class="modal-title h4" ng-bind-html="options.title" id="modal-title"></h1>' +
          '	</div>' +
          '	<div class="modal-body" id="modal-body">' +
          '		<p ng-if="options.message" ng-bind-html="options.message"></p>' +
          '	</div>' +
          '	<div class="modal-footer" ng-style="options.footerStyle">' +
          '		<button ng-repeat="button in options.buttons track by button.label" class="btn btn-default {{button.class}}"' +
          '			ng-class="{\'btn-primary\':button.primary, \'btn-focus\':button.focus}" ng-click="buttonClicked(button)">{{button.label}}</button>' +
          '	</div>' +
          '</div>'
      );
      var snAnalyticsConsentModal = { open: open };
      return snAnalyticsConsentModal;
    }
  );
