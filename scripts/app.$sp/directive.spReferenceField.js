/*! RESOURCE: /scripts/app.$sp/directive.spReferenceField.js */
angular
  .module('sn.$sp')
  .directive(
    'spReferenceField',
    function (
      $rootScope,
      $injector,
      spUtil,
      $uibModal,
      $http,
      spAriaUtil,
      i18n
    ) {
      'use strict';
      return {
        restrict: 'E',
        replace: true,
        templateUrl: 'sp_reference_field.xml',
        controller: function ($scope) {
          var unregister;
          var opened = false;
          $scope.openReference = function (field, view) {
            var data = {
              table: field.refTable,
              sys_id: field.value,
              view: view,
              isPopup: true,
            };
            if (angular.isDefined(field.reference_key))
              data[field.reference_key] = field.value;
            else data.sys_id = field.value;
            if (unregister) unregister();
            unregister = $rootScope.$on(
              '$sp.openReference',
              function (evt, data) {
                if (opened) return;
                opened = true;
                unregister();
                unregister = null;
                if (!evt.defaultPrevented && evt.targetScope === $scope)
                  showForm(data);
              }
            );
            $scope.$emit('$sp.openReference', data);
          };
          $scope.$on('$destroy', function () {
            if (unregister) unregister();
            opened = false;
          });
          function showForm(data) {
            var url = spUtil.getWidgetURL('widget-form');
            var req = {
              method: 'POST',
              url: url,
              headers: spUtil.getHeaders(),
              data: data,
            };
            $http(req).then(qs, qe);
            function qs(response) {
              var r = response.data.result;
              showModal(r);
            }
            function qe(error) {
              console.error('Error ' + error.status + ' ' + error.statusText);
              opened = false;
            }
          }
          function showModal(form) {
            var opts = {
              size: 'lg',
              templateUrl: 'sp_form_modal',
              controller: ModalInstanceCtrl,
              resolve: {},
            };
            opts.resolve.item = function () {
              return angular.copy({
                form: form,
              });
            };
            var modalInstance = $uibModal.open(opts);
            var pageRoot = angular.element('.sp-page-root');
            function setModalAriaAttrs(modal) {
              modal.attr('aria-label', modal.find('.panel-title').html());
              modal.attr('aria-modal', 'true');
            }
            modalInstance.rendered.then(function () {
              var $uibModalStack = $injector.get('$uibModalStack');
              var modalObj = $uibModalStack.getTop();
              var modal = modalObj.value.modalDomEl;
              setModalAriaAttrs(modal);
              pageRoot.attr('aria-hidden', 'true');
            });
            modalInstance.result.then(
              function () {},
              function () {
                spAriaUtil.sendLiveMessage($scope.exitMsg);
              }
            );
            $scope.$on('$destroy', function () {
              modalInstance.close();
            });
            var unregister = $scope.$on(
              'sp.form.record.updated',
              function (evt, fields, savedFormSysId) {
                if (form.data.sys_id !== savedFormSysId) return;
                unregister();
                unregister = null;
                modalInstance.close();
                if (evt.stopPropagation) evt.stopPropagation();
                evt.preventDefault();
              }
            );
          }
          function ModalInstanceCtrl($scope, $uibModalInstance, item) {
            $scope.item = item;
            $scope.closeWindowMsg = i18n.getMessage('Close Window');
            $scope.ok = function () {
              $uibModalInstance.close();
            };
            $scope.$on('modal.closing', function () {
              var pageRoot = angular.element('.sp-page-root');
              pageRoot.attr('aria-hidden', 'false');
              opened = false;
            });
            $scope.cancel = function () {
              $uibModalInstance.dismiss('cancel');
            };
          }
        },
        link: function (scope, element) {
          i18n.getMessage('Closing modal page', function (msg) {
            scope.exitMsg = msg;
          });
        },
      };
    }
  );
