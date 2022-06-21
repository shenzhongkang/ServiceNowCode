/*! RESOURCE: /scripts/service-portal-designer/config/message.js */
(function () {
  'use strict';
  angular
    .module('spd_message', [])
    .factory('message', function (text, $modal, $rootScope, $window) {
      return function (conf) {
        var modalScope = $rootScope.$new(true);
        var modalInstance = $modal({
          scope: modalScope,
          template: 'modal.html',
          show: false,
        });
        if (conf.okBtn) {
          modalScope.okBtn = true;
        }
        text(conf.title).then(function (title) {
          modalScope.title = title;
        });
        modalScope.confirm = modalScope.close = function () {
          $window.location.reload();
        };
        modalInstance.$promise.then(modalInstance.show);
      };
    });
})();
