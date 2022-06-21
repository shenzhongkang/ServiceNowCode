/*! RESOURCE: /scripts/sn/common/clientScript/glideModalFactory.js */
(function (exports, undefined) {
  'use strict';
  var CONFIRM_BUTTON_TITLE = 'OK';
  var CANCEL_BUTTON_TITLE = 'Cancel';
  var DEFAULT_BUTTON_TYPE = 'default';
  var CONFIRM_BUTTON_TYPE = 'confirm';
  var DESTRUCTIVE_BUTTON_TYPE = 'destructive';
  exports.glideModalFactory = {
    create: create,
  };
  exports.addEventListener('unhandledrejection', function (event) {
    event.preventDefault();
  });
  function create(options, extras) {
    options = options || {};
    extras = extras || {};
    var alertHandler = options.alert || _browserAlertHandler;
    var confirmHandler = options.confirm || _browserConfirmHandler;
    var confirmDestroyHandler =
      options.confirmDestroy || _browserConfirmHandler;
    var frameHandler = options.showFrame;
    var fieldModalHandler = options.showFields;
    var customModals = Object.keys(options).filter(function (name) {
      return (
        [
          'alert',
          'confirm',
          'confirmDestroy',
          'showFields',
          'showFrame',
        ].indexOf(name) == -1
      );
    });
    var modals = {
      alert: function () {
        var args = _getArgs(arguments);
        var callback = args.callback;
        var alertOptions = {
          title: args.title || 'Alert',
          message: args.message,
          buttonTitle:
            args.style.buttonTitle ||
            _getMessage(CONFIRM_BUTTON_TITLE, extras.messages),
          buttonType: args.style.buttonType || DEFAULT_BUTTON_TYPE,
        };
        return alertHandler(alertOptions)
          .then(function () {
            if (callback) {
              callback();
            }
          })
          .catch(function () {});
      },
      confirm: function () {
        var args = _getArgs(arguments);
        var callback = args.callback;
        var alertOptions = {
          title: args.title || 'Confirm',
          message: args.message,
          cancelTitle:
            args.style.cancelTitle ||
            _getMessage(CANCEL_BUTTON_TITLE, extras.messages),
          confirmTitle:
            args.style.confirmTitle ||
            _getMessage(CONFIRM_BUTTON_TITLE, extras.messages),
          cancelType: args.style.cancelType || DEFAULT_BUTTON_TYPE,
          confirmType: args.style.confirmType || CONFIRM_BUTTON_TYPE,
        };
        return confirmHandler(alertOptions)
          .then(function () {
            if (callback) {
              callback(true);
            }
            return Promise.resolve(true);
          })
          .catch(function () {
            if (callback) {
              callback(false);
            }
            return Promise.reject(false);
          });
      },
      confirmDestroy: function () {
        var args = _getArgs(arguments);
        var callback = args.callback;
        var alertOptions = {
          title: args.title || 'Confirm',
          message: args.message,
          cancelTitle:
            args.style.cancelTitle ||
            _getMessage(CANCEL_BUTTON_TITLE, extras.messages),
          confirmTitle:
            args.style.confirmTitle ||
            _getMessage(CONFIRM_BUTTON_TITLE, extras.messages),
          cancelType: args.style.cancelType || DEFAULT_BUTTON_TYPE,
          confirmType: args.style.confirmType || DESTRUCTIVE_BUTTON_TYPE,
        };
        return confirmDestroyHandler(alertOptions)
          .then(function () {
            if (callback) {
              callback(true);
            }
            return Promise.resolve(true);
          })
          .catch(function () {
            if (callback) {
              callback(false);
            }
            return Promise.reject(false);
          });
      },
      showFields: function (options) {
        if (!fieldModalHandler) {
          return alertHandler({
            message: 'g_modal.showFields is not supported',
          });
        }
        if (!options || typeof options !== 'object') {
          return Promise.reject(false);
        }
        var callback = options.callback;
        var modalOptions = {
          title: options.title || ' ',
          fields: options.fields,
          size: options.size,
          cancelTitle:
            options.cancelTitle ||
            _getMessage(CANCEL_BUTTON_TITLE, extras.messages),
          confirmTitle:
            options.confirmTitle ||
            _getMessage(CONFIRM_BUTTON_TITLE, extras.messages),
          cancelType: options.cancelType || DEFAULT_BUTTON_TYPE,
          confirmType: options.confirmType || DESTRUCTIVE_BUTTON_TYPE,
        };
        if (options.instruction) modalOptions.instruction = options.instruction;
        return fieldModalHandler(modalOptions)
          .then(function (result) {
            if (callback) {
              callback(true, result);
            }
            return Promise.resolve(result);
          })
          .catch(function () {
            if (callback) {
              callback(false);
            }
            return Promise.reject(false);
          });
      },
      showFrame: function (options) {
        if (!frameHandler) {
          return alertHandler({
            message: 'g_modal.showFrame is not supported',
          });
        }
        if (!options || typeof options !== 'object') {
          return Promise.reject(false);
        }
        var callback = options.callback;
        var modalOptions = {
          title: options.title || ' ',
          url: options.url,
          size: options.size,
          height: options.height,
          autoCloseOn: options.autoCloseOn,
        };
        return frameHandler(modalOptions)
          .then(function (result) {
            if (callback) {
              callback(true, result);
            }
            return Promise.resolve(result);
          })
          .catch(function (result) {
            if (callback) {
              callback(false, result);
            }
            return Promise.reject(result);
          });
      },
    };
    customModals.forEach(function (name) {
      var customModal = {};
      Object.keys(options[name] || {}).forEach(function (fnName) {
        customModal[fnName] = function (params) {
          var callback = params.callback;
          return options[name][fnName](params)
            .then(function (result) {
              if (callback) {
                callback(true, result);
              }
              return Promise.resolve(result);
            })
            .catch(function () {
              if (callback) {
                callback(false);
              }
              return Promise.reject(false);
            });
        };
      });
      modals[name] = customModal;
    });
    return modals;
  }
  function _getArgs(args) {
    var title = args[0];
    var param = args[1];
    var callback = args[2];
    var style = args[3];
    if (typeof callback === 'object') {
      style = callback;
    }
    switch (typeof param) {
      case 'function':
        callback = param;
        param = title;
        title = null;
        break;
      case 'object':
        style = param;
        param = title;
        title = null;
        break;
      case 'undefined':
        param = title;
        title = null;
        break;
      default:
        break;
    }
    return {
      title: title,
      message: param,
      callback: callback,
      style: style || {},
    };
  }
  function _browserAlertHandler(options) {
    var message = options.message;
    return new Promise(function (resolve) {
      alert(message);
      if (resolve) {
        resolve();
      }
    });
  }
  function _browserConfirmHandler(options) {
    var message = options.message;
    return new Promise(function (resolve, reject) {
      if (confirm(message)) {
        if (resolve) {
          resolve();
        }
      } else {
        if (reject) {
          reject();
        }
      }
    });
  }
  function _getMessage(message, messages) {
    if (messages && messages[message]) return messages[message];
    return message;
  }
})(window);
