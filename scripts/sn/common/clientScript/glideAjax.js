/*! RESOURCE: /scripts/sn/common/clientScript/glideAjax.js */
(function (exports, undefined) {
  'use strict';
  var url = '/xmlhttp.do';
  var logError = function () {
    if (console && console.error) console.error.apply(console, arguments);
  };
  function GlideAjax() {
    this.initialize.apply(this, arguments);
  }
  GlideAjax.glideRequest = exports.glideRequest;
  GlideAjax.logError = logError;
  GlideAjax.prototype = {
    initialize: function (targetProcessor, targetURL) {
      this.processor = null;
      this.params = {};
      this.callbackFn = function () {};
      this.errorCallbackFn = function (e) {
        GlideAjax.logError('Unhandled exception in GlideAjax.', e.responseText);
      };
      this.wantAnswer = false;
      this.requestObject = null;
      this.setProcessor(targetProcessor);
      url = targetURL || url;
    },
    addParam: function (name, value) {
      this.params[name] = value;
    },
    getXML: function (callback) {
      this.wantAnswer = false;
      this.callbackFn = callback;
      this.execute();
    },
    getXMLWait: function () {
      GlideAjax.logError('GlideAjax.getXMLWait is no longer supported');
    },
    getXMLAnswer: function (callback) {
      this.wantAnswer = true;
      this.callbackFn = callback;
      this.execute();
    },
    getAnswer: function () {
      return this.responseXML
        ? this.responseXML.documentElement.getAttribute('answer')
        : null;
    },
    setErrorCallback: function (errorCallback) {
      this.errorCallbackFn = errorCallback;
    },
    getURL: function () {
      return url;
    },
    getParams: function () {
      return this.params;
    },
    setProcessor: function (p) {
      this.addParam('sysparm_processor', p);
      if (!p) {
        GlideAjax.logError('GlideAjax.initalize: must specify a processor');
      }
      this.processor = p;
    },
    execute: function () {
      var that = this;
      var executeCallBack = function (that, ajaxResponse) {
        var args = [that.wantAnswer ? that.getAnswer() : ajaxResponse];
        try {
          that.callbackFn.apply(null, args);
        } catch (e) {
          if (that.errorCallbackFn) {
            that.errorCallbackFn({
              type: 'unhandled exception',
              responseText: e.message,
            });
          } else
            GlideAjax.logError('Unhandled exception in GlideAjax callback.', e);
        }
      };
      GlideAjax.glideRequest
        .post(url, {
          data: this.params,
          dataType: 'xml',
        })
        .then(function (response) {
          if (response.responseXML) {
            that.responseXML = response.responseXML;
            that.responseText = response.responseText;
            var ajaxResponse = {
              type: response.type,
              responseText: response.responseText,
              responseXML: response.responseXML,
            };
            executeCallBack(that, ajaxResponse);
          } else {
            return response.text().then(function (data) {
              try {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(data, 'text/xml');
                that.responseXML = xmlDoc;
                that.responseText = data;
                var ajaxResponse = {
                  type: 'xml',
                  responseText: data,
                  responseXML: xmlDoc,
                };
                executeCallBack(that, ajaxResponse);
              } catch (e) {
                log('Error while parsing the response ' + e.getMessage());
              }
            });
          }
        })
        .catch(function (error) {
          var errorResponse = {
            type: error.type,
            status: error.status,
            responseText: error.responseText,
            responseXML: error.responseXML,
          };
          if (that.errorCallbackFn) {
            that.errorCallbackFn(errorResponse);
          }
        });
    },
    setScope: function (scope) {
      if (scope) {
        this.addParam('sysparm_scope', scope);
      }
      return this;
    },
  };
  exports.GlideAjax = GlideAjax;
})(window);
