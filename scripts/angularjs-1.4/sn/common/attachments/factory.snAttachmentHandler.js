/*! RESOURCE: /scripts/angularjs-1.4/sn/common/attachments/factory.snAttachmentHandler.js */
angular
  .module('sn.common.attachments')
  .factory(
    'snAttachmentHandler',
    function (urlTools, $http, $upload, $window, $q, $rootScope, i18n) {
      'use strict';
      return {
        getViewUrl: getViewUrl,
        create: createAttachmentHandler,
        deleteAttachment: deleteAttachmentBySysID,
        renameAttachment: renameAttachmentBySysID,
        showMessage: showMessage,
        scanAttachment: scanAttachment,
      };
      function getViewUrl(sysId) {
        return '/sys_attachment.do?sys_id=' + sysId;
      }
      function showMessage(type, message) {
        $rootScope.$broadcast('$$uiNotification', {
          type: type,
          message: message,
        });
      }
      function deleteAttachmentBySysID(sysID) {
        var url = urlTools.getURL('ngk_attachments', {
          action: 'delete',
          sys_id: sysID,
        });
        return $http.get(url);
      }
      function renameAttachmentBySysID(sysID, newName) {
        var url = urlTools.getURL('ngk_attachments', {
          action: 'rename',
          sys_id: sysID,
          new_name: newName,
        });
        return $http.post(url);
      }
      var isAjaxInProgress = false;
      function updateState(options) {
        this.state = options.state;
        $rootScope.$broadcast('sn.attachment.scanned');
        if (options.msg) showMessage(options.type, options.msg);
      }
      function scanAttachment(attachment) {
        if (isAjaxInProgress) return;
        isAjaxInProgress = true;
        var updateAttachmentState = updateState.bind(attachment);
        var url = '/sys_attachment.do?sys_id=' + attachment.sys_id;
        $http({
          url: '/xmlhttp.do',
          method: 'POST',
          params: {
            sysparm_processor: 'AntiVirusAttachmentDescriptor',
            sysparm_name: 'getAttachmentState',
            sysparm_sysid: attachment.sys_id,
          },
          dataType: 'xml',
        }).then(function (response) {
          var element = new DOMParser()
            .parseFromString(response.data, 'text/xml')
            .getElementsByTagName('xml')[0];
          var answer = element.getAttribute('answer');
          var options = {};
          options.state = answer;
          if (answer === 'available') {
            window.open(url, '_blank');
          } else if (answer === 'not_available') {
            options.type = 'error';
            options.msg = i18n.getMessage('File not available');
          } else if (answer === 'pending') {
            options.type = 'error';
            options.msg = i18n.getMessage('File pending');
          }
          updateAttachmentState(options);
          isAjaxInProgress = false;
        });
      }
      function createAttachmentHandler(tableName, sysID, options) {
        var _tableName = tableName;
        var _sysID = sysID;
        var _files = [];
        function getTableName() {
          return _tableName;
        }
        function getSysID() {
          return _sysID;
        }
        function getAttachments() {
          var url = urlTools.getURL('ngk_attachments', {
            action: 'list',
            sys_id: _sysID,
            table: _tableName,
          });
          var worker = $http.get;
          if (!_sysID) {
            worker = function () {
              return $q(function (resolve) {
                resolve({ data: { files: [] } });
              });
            };
          }
          return worker(url).then(function (response) {
            var files = response.data.files;
            if (_files.length == 0) {
              files.forEach(function (file) {
                if (file && file.sys_id) {
                  _transformFileResponse(file);
                  _files.push(file);
                }
              });
            } else {
              _files = files;
            }
            return _files;
          });
        }
        function addAttachment(attachment) {
          _files.unshift(attachment);
        }
        function deleteAttachment(attachment) {
          var index = _files.indexOf(attachment);
          if (index !== -1) {
            return deleteAttachmentBySysID(attachment.sys_id).then(function () {
              _files.splice(index, 1);
            });
          }
        }
        function uploadAttachments(files, uploadFields) {
          var defer = $q.defer();
          var promises = [];
          var fileData = [];
          angular.forEach(files, function (file) {
            promises.push(
              uploadAttachment(file, uploadFields).then(function (response) {
                fileData.push(response);
              })
            );
          });
          $q.all(promises).then(function () {
            defer.resolve(fileData);
          });
          return defer.promise;
        }
        function uploadAttachment(file, uploadFields, uploadMethods) {
          var url = urlTools.getURL('ngk_attachments', {
            action: 'add',
            sys_id: _sysID,
            table: _tableName,
            load_attachment_record: 'true',
          });
          var fields = {
            attachments_modified: 'true',
            sysparm_table: _tableName,
            sysparm_sys_id: _sysID,
            sysparm_nostack: 'yes',
            sysparm_encryption_context: '',
          };
          if (typeof $window.g_ck !== 'undefined') {
            fields['sysparm_ck'] = $window.g_ck;
          }
          if (uploadFields) {
            angular.extend(fields, uploadFields);
          }
          var upload = $upload.upload({
            url: url,
            fields: fields,
            fileFormDataName: 'attachFile',
            file: file,
            fileName: file.file_name || file.name,
          });
          if (uploadMethods !== undefined) {
            if (uploadMethods.hasOwnProperty('progress')) {
              upload.progress(uploadMethods.progress);
            }
            if (uploadMethods.hasOwnProperty('success')) {
              upload.success(uploadMethods.success);
            }
            if (uploadMethods.hasOwnProperty('error')) {
              upload.error(uploadMethods.error);
            }
          }
          return upload.then(function (response) {
            var sysFile = response.data;
            if (sysFile.error) {
              return $q.reject(
                'Exception when adding attachment: ' + sysFile.error
              );
            }
            if (
              typeof sysFile === 'object' &&
              sysFile.hasOwnProperty('sys_id')
            ) {
              _transformFileResponse(sysFile);
              addAttachment(sysFile);
            }
            if (options && options.onUploadComplete) {
              options.onUploadComplete(sysFile);
            }
            return sysFile;
          });
        }
        function _transformFileResponse(file) {
          file.isImage = false;
          file.canPreview = false;
          if (file.content_type.indexOf('image') !== -1) {
            file.isImage = true;
            if (!file.thumbSrc) {
            } else if (file.thumbSrc[0] !== '/') {
              file.thumbSrc = '/' + file.thumbSrc;
            }
            file.canPreview = file.content_type.indexOf('tiff') === -1;
          }
          file.viewUrl = getViewUrl(file.sys_id);
        }
        return {
          getSysID: getSysID,
          getTableName: getTableName,
          getAttachments: getAttachments,
          addAttachment: addAttachment,
          deleteAttachment: deleteAttachment,
          uploadAttachment: uploadAttachment,
          uploadAttachments: uploadAttachments,
        };
      }
    }
  );
