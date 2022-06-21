/*! RESOURCE: /scripts/app.$sp/service_catalog/service.spSCNavStateManager.js */
angular
  .module('sn.$sp')
  .factory(
    'spSCNavStateManager',
    function ($rootScope, $window, spModal, i18n, cabrillo) {
      'use strict';
      var registeredForms = {};
      var isModalOpen = false;
      var nativeMobile;
      var previewMode = false;
      function registerForm(form) {
        registeredForms[form.getSysId()] = form;
      }
      function isNative(native) {
        nativeMobile = native;
      }
      function isPreview(preview) {
        previewMode = preview;
      }
      function unregisterForms(sysIds) {
        sysIds.forEach(function (sysId) {
          delete registeredForms[sysId];
        });
      }
      function clearUserModifiedFields() {
        var includedForms = Object.keys(registeredForms);
        includedForms.forEach(function (includedForm) {
          if (registeredForms[includedForm].isUserModified())
            registeredForms[
              includedForm
            ].$private.userState.clearModifiedFields();
        });
      }
      function checkForDirtyForms() {
        if (!g_dirty_form_warning_enabled || previewMode) return false;
        var isFormDirty = false;
        var includedForms = Object.keys(registeredForms);
        for (var i in includedForms) {
          if (registeredForms[includedForms[i]].isUserModified()) {
            isFormDirty = true;
            break;
          }
        }
        return isFormDirty;
      }
      function clearCabrilloButtons() {
        if (cabrillo.isNative() && nativeMobile) {
          cabrillo.viewLayout.setTitle('');
          cabrillo.viewLayout.setNavigationBarButtons();
          cabrillo.viewLayout.setBottomButtons();
        }
      }
      $rootScope.$on('$locationChangeStart', function (event, next) {
        if (!isModalOpen) {
          if (checkForDirtyForms()) {
            event.preventDefault();
            var options = {
              title: i18n.getMessage('Leave page?'),
              headerStyle: { border: 'none', 'padding-bottom': 0 },
              footerStyle: { border: 'none', 'padding-top': 0 },
              message: i18n.getMessage('Changes you made will be lost.'),
              buttons: [
                { label: i18n.getMessage('Cancel'), value: 'cancel' },
                {
                  label: i18n.getMessage('Leave'),
                  primary: true,
                  value: 'leave',
                },
              ],
            };
            if (cabrillo.isNative() && nativeMobile) {
              var title = i18n.format(
                '{0} {1}',
                options.title,
                options.message
              );
              if (confirm(title)) {
                clearCabrilloButtons();
                clearUserModifiedFields();
                $window.location = next;
              }
            } else {
              isModalOpen = true;
              spModal.open(options).then(
                function (confirm) {
                  isModalOpen = false;
                  if (confirm.value == 'leave') {
                    clearUserModifiedFields();
                    $window.location = next;
                  }
                },
                function () {
                  isModalOpen = false;
                }
              );
            }
          } else {
            clearCabrilloButtons();
          }
        } else {
          event.preventDefault();
        }
      });
      $rootScope.$on('$locationChangeSuccess', function () {
        if (!g_persist_msgs_through_page_nav)
          $rootScope.$broadcast('$$uiNotification.dismiss');
      });
      $window.onbeforeunload = function () {
        if (checkForDirtyForms()) return true;
      };
      $window.onpagehide = function () {
        clearCabrilloButtons();
      };
      return {
        register: registerForm,
        unregisterForms: unregisterForms,
        isNative: isNative,
        isPreview: isPreview,
      };
    }
  );
