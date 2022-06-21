/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.nowAttachmentHandler.js */
angular
  .module('sn.common.attachments')
  .factory(
    'nowAttachmentHandler',
    function (
      $http,
      nowServer,
      $upload,
      $q,
      $rootScope,
      $timeout,
      snNotification,
      snAttachmentHandler,
      i18n
    ) {
      'use strict';
      $rootScope.$on('attachment.updated', function (evt, options) {
        if (options.operation === 'update' && options.state === 'not_available')
          snAttachmentHandler.showMessage(
            'error',
            i18n
              .getMessage('Upload file scan failed')
              .withValues([options.filename])
          );
      });
      return function (setAttachments, appendError) {
        var self = this;
        self.cardUploading = '';
        self.setAttachments = setAttachments;
        self.appendError = appendError;
        self.encryptionContext = '';
        self.ADDED = 'added';
        self.DELETED = 'deleted';
        self.RENAMED = 'renamed';
        self.getAttachmentList = function (action) {
          var url = nowServer.getURL('ngk_attachments', {
            action: 'list',
            sys_id: self.tableId,
            table: self.tableName,
          });
          var worker = $http.get;
          if (!self.tableId) {
            worker = function () {
              return $q(function (resolve) {
                resolve({ data: { files: [] } });
              });
            };
          }
          worker(url).then(function (response) {
            var attachments = response.data.files || [];
            attachments = self.canViewImage(attachments);
            self.setAttachments(attachments, action);
            if (self.startedUploadingTimeout || self.errorTimeout) {
              self.stopAllUploading();
              $rootScope.$broadcast('board.uploading.end');
            }
          });
        };
        self.canViewImage = function (attachments) {
          if (
            typeof g_attachment_force_download_all_mime_types != 'undefined' &&
            typeof g_attachment_force_download_mime_type != 'undefined'
          ) {
            var contentTypes = g_attachment_force_download_mime_type.split(',');
            for (var i = 0; i < attachments.length; i++) {
              var attachmentFile = attachments[i];
              var canDownloadAttachmentFromThumbSrc =
                g_attachment_force_download_all_mime_types;
              if (!canDownloadAttachmentFromThumbSrc) {
                if (contentTypes.indexOf(attachmentFile.content_type) != -1)
                  canDownloadAttachmentFromThumbSrc = true;
              }
              attachmentFile.viewImage =
                (attachmentFile.thumbSrc || attachmentFile.thumbnail_path) &&
                !canDownloadAttachmentFromThumbSrc;
            }
          }
          return attachments;
        };
        self.stopAllUploading = function () {
          $timeout.cancel(self.errorTimeout);
          $timeout.cancel(self.startedUploadingTimeout);
          hideProgressBar();
          $rootScope.$broadcast('attachment.upload.stop');
        };
        self.setEncryptionContext = function (context) {
          self.encryptionContext = context;
        };
        self.manageFocus = function () {
          if (
            self.attachmentAction === self.RENAMED &&
            self.updatedAttachmentSysId
          ) {
            $timeout(function () {
              var editButton = $(
                '#' + self.updatedAttachmentSysId + ' button'
              )[0];
              if (editButton) editButton.focus();
              delete self.attachmentAction;
              delete self.updatedAttachmentSysId;
              delete self.editButton;
            });
          }
        };
        self.onFileSelect = function ($files) {
          if (!$files.length) return;
          var url = nowServer.getURL('ngk_attachments', {
            sys_id: self.tableId,
            table: self.tableName,
            action: 'add',
          });
          self.cardUploading = self.tableId;
          self.maxfiles = $files.length;
          self.fileCount = 1;
          self.filesUploaded = self.maxfiles;
          self.startedUploadingTimeout = $timeout(showUploaderDialog, 1500);
          for (var i = 0; i < self.maxfiles; i++) {
            if (parseInt($files[i].size) > parseInt(self.fileUploadSizeLimit)) {
              self.stopAllUploading();
              $rootScope.$broadcast('dialog.upload_too_large.show');
              return;
            }
          }
          var fields = {
            attachments_modified: 'true',
            sysparm_table: self.tableName,
            sysparm_sys_id: self.tableId,
            sysparm_nostack: 'yes',
            sysparm_encryption_context: self.encryptionContext,
            sysparm_ck: window.g_ck,
          };
          var idx = 0;
          var fileNames = [];
          var processFile = function () {
            $rootScope.$broadcast('attachment.upload.start');
            var ff = $files[idx];
            self.upload = $upload
              .upload({
                url: url,
                fields: fields,
                fileFormDataName: 'attachFile',
                file: ff,
              })
              .progress(function (evt) {
                var percent = parseInt((100.0 * evt.loaded) / evt.total, 10);
                updateProgress(percent);
              })
              .success(function (data, status, headers, config) {
                processError(data);
                if (!data.error) fileNames.push(data.file_name);
                if (self.filesUploaded <= 0) self.cardUploading = '';
                idx++;
                if (idx < $files.length) processFile();
                else {
                  self.stopAllUploading();
                  self.getAttachmentList(self.ADDED);
                  if (fileNames.length)
                    $rootScope.$broadcast('attachment.upload.success', {
                      names: fileNames.join(','),
                    });
                }
              });
          };
          processFile();
        };
        self.downloadAttachment = function (attachment) {
          var url = '/sys_attachment.do?sys_id=' + attachment.sys_id;
          window.open(url, '_blank');
        };
        self.viewAttachment = function ($event, attachment) {
          var url = window.location.protocol + '//' + window.location.host;
          url +=
            '/sys_attachment.do?sysparm_referring_url=tear_off&view=true&sys_id=' +
            attachment.sys_id;
          window.open(
            url,
            attachment.sys_id,
            'toolbar=no,menubar=no,personalbar=no,width=800,height=600,scrollbars=yes,resizable=yes'
          );
        };
        self.editAttachment = function ($event, attachment) {
          self.editButton = $event.currentTarget;
          var parent = $(self.editButton).closest('.file-attachment');
          var thumbnail = parent.find('.thumbnail');
          var input = parent.find('input');
          var tools = parent.find('.tools');
          var fileName = attachment.file_name;
          if (attachment.file_name.indexOf('.') !== -1) {
            attachment.ext = fileName.match(/(\.[^\.]+)$/i)[0];
            fileName = attachment.file_name.replace(/(\.[^\.]+)$/i, '');
          }
          input.val(fileName);
          var w = input.prev().width();
          input.width(w);
          input.prev().hide();
          input.css('display', 'block');
          thumbnail.addClass('state-locked');
          tools.find('.delete-edit').hide();
          tools.find('.rename-cancel').css('display', 'inline-block');
          input.focus();
        };
        self.onKeyDown = function ($event, attachment) {
          var keyCode = $event.keyCode;
          if (keyCode === 13) {
            $event.stopPropagation();
            $event.preventDefault();
            self.updateAttachment($event, attachment);
          } else if (keyCode === 27) {
            $event.stopPropagation();
            $event.preventDefault();
            self.updateAttachment($event);
          }
        };
        self.updateAttachment = function ($event, attachment) {
          if (self.renameInProgress) return;
          var el = $($event.currentTarget);
          var parent = el.closest('.file-attachment');
          var thumbnail = parent.find('.thumbnail');
          var input = parent.find('input');
          var link = parent.find('a');
          var tools = parent.find('.tools');
          if (attachment) {
            var fileName = input.val();
            if (fileName.length) {
              fileName += attachment.ext;
              if (fileName !== attachment.file_name) {
                link.text(fileName);
                self.renameAttachment(attachment, fileName);
              } else setFocus();
            }
          }
          input.hide();
          input.prev().show();
          tools.find('.rename-cancel').hide();
          thumbnail.removeClass('state-locked');
          tools.find('.delete-edit').css('display', 'inline-block');
          self.editButton && self.editButton.focus();
        };
        self.dismissMsg = function ($event, $index, errorMessages) {
          var msg = $($event.currentTarget);
          msg.addClass('remove');
          setTimeout(function () {
            msg.remove();
            errorMessages.splice($index, 1);
          }, 500);
        };
        $rootScope.$on('dialog.comment_form.close', function () {
          hideProgressBar();
        });
        self.openSelector = function ($event) {
          $event.stopPropagation();
          $event.preventDefault();
          var target = $($event.currentTarget);
          var input = target.parent().find('input[type=file]');
          $timeout(function () {
            input.click();
          });
        };
        self.deleteAttachment = function (attachment) {
          if (attachment && attachment.sys_id) {
            $('#' + attachment.sys_id).hide();
            var url = nowServer.getURL('ngk_attachments', {
              action: 'delete',
              sys_id: attachment.sys_id,
            });
            $http.get(url).then(function (response) {
              processError(response.data);
              self.getAttachmentList(self.DELETED);
              if (!response.data.error)
                $rootScope.$broadcast('attachment.delete.success');
            });
          }
        };
        function setFocus() {
          if (self.editButton) {
            $(self.editButton).focus();
            delete self.editButton;
          }
        }
        self.renameAttachment = function (attachment, newName) {
          self.renameInProgress = true;
          $http({
            url: nowServer.getURL('ngk_attachments'),
            method: 'POST',
            params: {
              action: 'rename',
              sys_id: attachment.sys_id,
              new_name: newName,
            },
          }).then(function (response) {
            processError(response.data);
            self.attachmentAction = self.RENAMED;
            self.updatedAttachmentSysId = attachment.sys_id;
            self.getAttachmentList(self.RENAMED);
            self.renameInProgress = false;
            if (!response.data.error)
              $rootScope.$broadcast('attachment.rename.success');
          });
        };
        self.scanAttachment = function (attachment) {
          snAttachmentHandler.scanAttachment(attachment);
        };
        function showUploaderDialog() {
          $rootScope.$broadcast('board.uploading.start', self.tableId);
        }
        function updateProgress(percent) {
          if (self.prevPercent === percent && self.fileCount <= self.maxfiles)
            return;
          if (self.fileCount <= self.maxfiles) {
            if (percent > 99) self.fileCount++;
            if (self.fileCount <= self.maxfiles) {
              $timeout.cancel(self.errorTimeout);
              self.errorTimeout = $timeout(broadcastError, 15000);
              $('.progress-label').text(
                'Uploading file ' + self.fileCount + ' of ' + self.maxfiles
              );
              $('.upload-progress').val(percent);
              $('.progress-wrapper').show();
            }
          }
          self.prevPercent = percent;
        }
        function hideProgressBar() {
          try {
            $('.progress-wrapper').hide();
          } catch (e) {}
        }
        self.setParams = function (tableName, tableId, fileUploadSizeLimit) {
          self.tableName = tableName;
          self.tableId = tableId;
          self.fileUploadSizeLimit = fileUploadSizeLimit;
        };
        function broadcastError() {
          $rootScope.$broadcast('board.uploading.end');
          snNotification.show(
            'error',
            'An error occured when trying to upload your file. Please try again.'
          );
          self.stopAllUploading();
        }
        function processError(data) {
          if (!data.error) return;
          self.appendError({
            msg: data.error,
            fileName: '',
          });
        }
      };
    }
  );
