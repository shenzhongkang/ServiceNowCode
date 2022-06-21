/*! RESOURCE: /scripts/app.$sp/directive.spVariableAttachment.js */
angular
  .module('sn.$sp')
  .directive(
    'spVariableAttachment',
    function (
      spModal,
      getTemplateUrl,
      spScUtil,
      snAttachmentHandler,
      cabrillo,
      i18n,
      $http,
      spAriaUtil,
      $timeout
    ) {
      return {
        restrict: 'E',
        replace: true,
        templateUrl: getTemplateUrl('sp_variable_attachment.xml'),
        scope: {
          field: '=?',
          attachmentGuid: '=?',
          gForm: '&',
        },
        controller: function ($scope, $location) {
          $scope.isNative = cabrillo.isNative();
          $scope.uploading = false;
          $scope.uploadAttachment = function () {
            if ($scope.field.value && $scope.field.enableDeleteAttachment) {
              if (
                !confirm(
                  i18n.getMessage(
                    'Updating the attachment will delete the previous attachment permanently. Do you want to continue?'
                  )
                )
              )
                return;
            }
            cabrillo.attachments
              .addFile(
                'ZZ_YY' + $scope.getRecordTableName(),
                $scope.getRecordId(),
                null,
                null
              )
              .then(
                function (response) {
                  if (response) {
                    var file = {
                      name: response.file_name,
                      size: response.size_bytes,
                    };
                    if ($scope.validateAttachment(file)) {
                      var previousValue = $scope.field.value;
                      $scope.field.state = response.state;
                      $scope
                        .gForm()
                        .setValue(
                          $scope.field.name,
                          response.sys_id,
                          response.file_name
                        );
                      if ($scope.field.enableDeleteAttachment)
                        $scope.updateAttachmentBackendValues(
                          previousValue,
                          response.sys_id,
                          response.file_name
                        );
                    }
                  }
                },
                function () {
                  $scope.uploading = false;
                }
              );
          };
          $scope.isItemView = function () {
            return (
              $scope.getRecordTableName() == 'sc_cart_item' &&
              $location.$$search.edit != 'cart'
            );
          };
          $scope.updateAttachmentBackendValues = function (
            previousValue,
            newValue,
            newDisplayValue
          ) {
            if (previousValue) {
              $scope.deleteAttachmentAndUpdateOptions({
                name: $scope.field.name,
                value: previousValue,
                newValue: newValue,
                newDisplayValue: newDisplayValue,
                isUpdate: true,
              });
            } else if (!$scope.isItemView()) {
              var variablesData = {};
              variablesData[$scope.field.name] = $scope
                .gForm()
                .getValue($scope.field.name);
              spScUtil.saveVariables(
                $scope.getRecordTableName(),
                $scope.getRecordId(),
                variablesData
              );
            }
          };
        },
        link: function (scope, element) {
          var attachedMsg = i18n.getMessage('{0} Attached');
          scope.onAttachmentSelect = function ($files) {
            if ($files.length == 0) return;
            var file = {
              name: $files[0].name,
              size: $files[0].size,
            };
            if (scope.validateAttachment(file)) {
              var previousValue = scope.field.value;
              scope.uploading = true;
              scope.field.isInvalid = true;
              snAttachmentHandler
                .create(
                  'ZZ_YY' + scope.getRecordTableName(),
                  scope.getRecordId()
                )
                .uploadAttachment($files[0])
                .then(
                  function (response) {
                    scope.uploading = false;
                    scope.field.state = response.state;
                    scope
                      .gForm()
                      .setValue(
                        scope.field.name,
                        response.sys_id,
                        response.file_name
                      );
                    if (scope.field.enableDeleteAttachment)
                      scope.updateAttachmentBackendValues(
                        previousValue,
                        response.sys_id,
                        response.file_name
                      );
                    $timeout(function () {
                      spAriaUtil.sendLiveMessage(
                        attachedMsg.withValues([response.file_name])
                      );
                    }, 1000);
                  },
                  function (error) {
                    scope.uploading = false;
                    scope.field.isInvalid = false;
                  }
                );
            }
            $files[0] = '';
          };
          scope.openAttachmentSelector = function ($event) {
            if (scope.uploading) return;
            if (scope.field.value && scope.field.enableDeleteAttachment) {
              spModal
                .confirm(
                  i18n.getMessage(
                    'Updating the attachment will delete the previous attachment permanently. Do you want to continue?'
                  )
                )
                .then(function (confirmed) {
                  if (confirmed) {
                    $event.stopPropagation();
                    var input = element.find('input[type=file]');
                    input.click();
                  }
                });
            } else {
              $event.stopPropagation();
              var input = element.find('input[type=file]');
              input.click();
            }
          };
          scope.deleteAttachmentAndUpdateOptions = function (field) {
            snAttachmentHandler.deleteAttachment(field.value).then(
              function () {
                if (!field.isUpdate)
                  scope
                    .gForm()
                    .setValue(
                      field.name,
                      field.newValue,
                      field.newDisplayValue
                    );
                if (!scope.isItemView()) {
                  var variablesData = {};
                  variablesData[field.name] = field.newValue;
                  spScUtil.saveVariables(
                    scope.getRecordTableName(),
                    scope.getRecordId(),
                    variablesData
                  );
                }
                scope.setFocus('sp_formfield_' + field.name);
                spAriaUtil.sendLiveMessage(
                  i18n.getMessage('Attachment deleted successfully')
                );
              },
              function (error) {
                console.log('Failed to delete Attachment', error);
              }
            );
          };
          scope.deleteAttachment = function () {
            if (scope.field.enableDeleteAttachment) {
              if (scope.isNative) {
                if (confirm(i18n.getMessage('Delete Attachment?')))
                  scope.deleteAttachmentAndUpdateOptions({
                    name: scope.field.name,
                    value: scope.field.value,
                    newValue: '',
                    newDisplayValue: '',
                    isUpdate: false,
                  });
              } else {
                spModal
                  .confirm(i18n.getMessage('Delete Attachment?'))
                  .then(function (confirmed) {
                    if (confirmed)
                      scope.deleteAttachmentAndUpdateOptions({
                        name: scope.field.name,
                        value: scope.field.value,
                        newValue: '',
                        newDisplayValue: '',
                        isUpdate: false,
                      });
                  });
              }
            } else {
              scope.gForm().setValue(scope.field.name, '', '');
              scope.setFocus('sp_formfield_' + scope.field.name);
              spAriaUtil.sendLiveMessage(
                i18n.getMessage('Attachment deleted successfully')
              );
            }
          };
          scope.scanAttachment = function () {
            if (scope.field.state == 'not_available')
              snAttachmentHandler.showMessage(
                'error',
                i18n
                  .getMessage('Upload file scan failed')
                  .withValues([scope.field.displayValue])
              );
            else
              snAttachmentHandler.scanAttachment({ sys_id: scope.field.value });
          };
          scope.setFocus = function (id) {
            var ele = document.getElementById(id);
            if (ele) ele.focus();
          };
          scope.setAriaLabel = function (ariaLabel) {
            element
              .find('#sp_formfield_' + scope.field.name)
              .attr('aria-label', ariaLabel);
          };
          scope.validateAttachment = function (file) {
            var allowedExtensionArray = new Array();
            if (scope.field.attributes.allowed_extensions)
              allowedExtensionArray =
                scope.field.attributes.allowed_extensions.split(';');
            var field = {
              name: scope.field.name,
              allowedExtensions: allowedExtensionArray,
              allowedFileSize: scope.field.attributes.max_file_size,
            };
            var result = validateAttachmentVariable(file, field);
            scope.field.validated = true;
            if (result == ATTACHMENT_SIZE_ERROR) {
              var errMessage = i18n.format(
                i18n.getMessage(
                  'The size of the uploaded file cannot exceed {0} MB'
                ),
                field.allowedFileSize
              );
              scope.gForm().hideFieldMsg(field.name);
              $timeout(function () {
                scope.gForm().showFieldMsg(field.name, errMessage, 'error');
              }, 1000);
              return false;
            } else if (result == EXTENSION_ERROR) {
              var errMessage = i18n.format(
                i18n.getMessage(
                  'The uploaded file type is not permitted; allowed types are {0}'
                ),
                field.allowedExtensions.join(', ')
              );
              scope.gForm().hideFieldMsg(field.name);
              $timeout(function () {
                scope.gForm().showFieldMsg(field.name, errMessage, 'error');
              }, 1000);
              return false;
            }
            return true;
          };
          scope.getRecordId = function () {
            return scope.getRecordTableName() == 'sc_cart_item'
              ? scope.attachmentGuid
              : scope.field.recordSysId;
          };
          scope.getRecordTableName = function () {
            return scope.field.recordTableName || scope.gForm().recordTableName;
          };
        },
      };
    }
  );
