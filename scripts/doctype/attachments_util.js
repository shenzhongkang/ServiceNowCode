/*! RESOURCE: /scripts/doctype/attachments_util.js */
var ATTACHMENT_SIZE_ERROR = 1;
var EXTENSION_ERROR = 2;
var SUCCESS = 3;
var MB_TO_BYTES = 1048576;
function validateAttachmentVariable(file, field) {
  if (field.allowedFileSize) {
    var attrMaxSize = parseInt(field.allowedFileSize);
    var allowedSizeInBytes = attrMaxSize * MB_TO_BYTES;
    if (file.size > allowedSizeInBytes) {
      return ATTACHMENT_SIZE_ERROR;
    }
  }
  if (field.allowedExtensions && field.allowedExtensions.length) {
    var dot = file.name.lastIndexOf('.') + 1;
    var suffix = file.name.substring(dot).toLowerCase();
    for (var i = 0; i < field.allowedExtensions.length; i++) {
      if (suffix === field.allowedExtensions[i].toLowerCase()) return SUCCESS;
    }
    return EXTENSION_ERROR;
  }
  return SUCCESS;
}
