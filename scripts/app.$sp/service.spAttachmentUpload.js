/*! RESOURCE: /scripts/app.$sp/service.spAttachmentUpload.js */
angular
  .module('sn.$sp')
  .factory('spAttachmentUpload', function (spModal, $q, i18n) {
    'use strict';
    return {
      uploadAttachments: function (attachmentHandler, files) {
        if (!files || !files.length) return;
        if (!g_has_encryption_context) {
          attachmentHandler.onFileSelect(files);
          return;
        }
        var context = '';
        var title =
          files.length > 1
            ? i18n.getMessage('Encrypt attachments?')
            : i18n.getMessage('Encrypt attachment?');
        spModal
          .open({
            title: title,
            shared: { files: files },
            backdrop: 'static',
            keyboard: false,
            widget: 'encryption-context-picker',
            buttons: [
              {
                label: i18n.getMessage('Upload Without Encrypting'),
                value: 'no',
              },
              {
                label: i18n.getMessage('Upload and Encrypt'),
                primary: true,
                value: 'yes',
              },
            ],
            onSubmit: function () {
              context = this.shared.context.value;
              return $q(function (resolve, reject) {
                resolve({ status: 'ok' });
              });
            },
          })
          .then(function (clickedButton) {
            if (clickedButton.value == 'yes')
              attachmentHandler.setEncryptionContext(context);
            else attachmentHandler.setEncryptionContext('');
            attachmentHandler.onFileSelect(files);
          });
      },
    };
  });
