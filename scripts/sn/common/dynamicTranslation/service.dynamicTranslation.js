/*! RESOURCE: /scripts/sn/common/dynamicTranslation/service.dynamicTranslation.js */
angular
  .module('sn.common.dynamicTranslation')
  .provider('dynamicTranslation', function () {
    function getDynamicTranslationRequestConfig() {
      return {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      };
    }
    function setSourceInParms(parms) {
      parms = parms || {};
      parms.event = parms.event || {};
      parms.event.source = 'portalAPI';
      return parms;
    }
    function isNotValidInputText(msg) {
      return typeof msg !== 'string';
    }
    function isNotValidString(str) {
      return str == null || typeof str !== 'string'
        ? true
        : str.trim().length === 0;
    }
    function isNotValidTranslator(translator) {
      return translator != null && typeof translator !== 'string';
    }
    function isNotValidTargetLanguages(targetLanguages) {
      if (!Array.isArray(targetLanguages) || targetLanguages.length === 0) {
        return true;
      }
      for (var index = 0; index < targetLanguages.length; index++) {
        if (isNotValidString(targetLanguages[index])) {
          return true;
        }
      }
      return false;
    }
    function isNotValidAdditionalParameters(additionalParameters) {
      if (
        !Array.isArray(additionalParameters) ||
        additionalParameters.length === 0
      ) {
        return true;
      } else {
        for (var index = 0; index < additionalParameters.length; index++) {
          var additionalParameter = additionalParameters[index];
          if (
            !additionalParameter ||
            additionalParameter.constructor !== {}.constructor ||
            Object.keys(additionalParameter).length !== 2
          ) {
            return true;
          }
          for (eachkey in additionalParameter) {
            if (
              !(eachkey === 'parameterName' || eachkey === 'parameterValue') ||
              isNotValidString(additionalParameter[eachkey])
            ) {
              return true;
            }
          }
        }
      }
      return false;
    }
    function isNotValidTexts(texts) {
      if (!Array.isArray(texts) || texts.length === 0) {
        return true;
      }
      for (var index = 0; index < texts.length; index++) {
        if (isNotValidInputText(texts[index])) {
          return true;
        }
      }
      return false;
    }
    var errorHandler = {
      rejectErrorMessage: function (response) {
        if (this.hasMultipleTexts) {
          this.defer.reject({
            code: this.code,
            message: response,
            status: 'Error',
          });
        } else {
          this.defer.reject({
            code: this.code,
            message: response,
          });
        }
      },
    };
    function validateOptionalParameters(
      parms,
      defer,
      i18n,
      isTranslation,
      hasMultipleTexts
    ) {
      errorHandler['hasMultipleTexts'] = hasMultipleTexts;
      errorHandler['defer'] = defer;
      if (parms.constructor !== {}.constructor) {
        errorHandler['code'] = '40006';
        i18n.getMessage(
          'Additional parameters are invalid',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
        return false;
      }
      if (isNotValidTranslator(parms.translator)) {
        errorHandler['code'] = '40003';
        i18n.getMessage(
          'Translator ("translator" field) is invalid',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
        return false;
      }
      if (isTranslation) {
        if (
          parms.sourceLanguage != null &&
          isNotValidString(parms.sourceLanguage)
        ) {
          errorHandler['code'] = '40008';
          i18n.getMessage(
            'Source language ("sourceLanguage" field) is invalid',
            errorHandler.rejectErrorMessage.bind(errorHandler)
          );
          return false;
        }
        if (
          parms.targetLanguages &&
          isNotValidTargetLanguages(parms.targetLanguages)
        ) {
          errorHandler['code'] = '40007';
          i18n.getMessage(
            'Target languages ("targetLanguages" field) are invalid',
            errorHandler.rejectErrorMessage.bind(errorHandler)
          );
          return false;
        }
        if (
          parms.additionalParameters &&
          isNotValidAdditionalParameters(parms.additionalParameters)
        ) {
          errorHandler['code'] = '40006';
          i18n.getMessage(
            'Additional parameters are invalid',
            errorHandler.rejectErrorMessage.bind(errorHandler)
          );
          return false;
        }
      }
      return true;
    }
    function handleErrorResponse(response, defer, i18n, hasMultipleTexts) {
      errorHandler['hasMultipleTexts'] = hasMultipleTexts;
      errorHandler['defer'] = defer;
      if (response === 400) {
        errorHandler['code'] = '40001';
        i18n.getMessage(
          'Dynamic Translation plugin is not installed',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
      } else {
        errorHandler['code'] = '40051';
        i18n.getMessage(
          'Unknown error occurred',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
      }
    }
    this.$get = function ($http, $q, i18n) {
      return {
        getTranslation: function (textToTranslate, parms) {
          var GET_DYNAMIC_TRANSLATION =
            '/api/sn_dt/v1/dynamic_translation/get_dynamic_translation';
          function getOnSuccessResponse(data) {
            var successResponse = {
              translations: data.result.translations,
              translator: data.result.translator,
            };
            if (data.result.detectedLanguage) {
              successResponse['detectedLanguage'] =
                data.result.detectedLanguage;
            }
            return successResponse;
          }
          function getOnErrorResponse(data) {
            return JSON.parse(data.result.errorMessage);
          }
          var defer = $q.defer();
          if (isNotValidInputText(textToTranslate)) {
            errorHandler['defer'] = defer;
            errorHandler['code'] = '40000';
            i18n.getMessage(
              'Text is missing or invalid',
              errorHandler.rejectErrorMessage.bind(errorHandler)
            );
          } else if (
            !parms ||
            validateOptionalParameters(parms, defer, i18n, true, false)
          ) {
            var requestBody = {
              textToTranslate: textToTranslate,
              parms: setSourceInParms(parms),
            };
            var config = getDynamicTranslationRequestConfig();
            $http
              .post(GET_DYNAMIC_TRANSLATION, requestBody, config)
              .success(function (data) {
                if (!data.result.isError)
                  defer.resolve(getOnSuccessResponse(data));
                else defer.reject(getOnErrorResponse(data));
              })
              .error(function (error, status) {
                handleErrorResponse(status, defer, i18n, false);
              });
          }
          return defer.promise;
        },
        getTranslations: function (textsToTranslate, parms) {
          var GET_DYNAMIC_TRANSLATIONS =
            '/api/sn_dt/v1/dynamic_translation/get_dynamic_translations';
          function getOnSuccessResponse(response) {
            var successResponse = {
              status: response.result.status,
              translations: response.result.translations,
              translator: response.result.translator,
            };
            return successResponse;
          }
          function getOnErrorResponse(response) {
            var errorDetails = JSON.parse(response.result.errorMessage);
            var errorResponse = {
              status: errorDetails.status,
              code: errorDetails.code,
              message: errorDetails.message,
            };
            if (errorDetails['translations']) {
              errorResponse['translations'] = errorDetails['translations'];
            }
            return errorDetails;
          }
          var defer = $q.defer();
          if (!textsToTranslate || isNotValidTexts(textsToTranslate)) {
            errorHandler['defer'] = defer;
            errorHandler['code'] = '40000';
            errorHandler['hasMultipleTexts'] = true;
            i18n.getMessage(
              'Text is missing or invalid',
              errorHandler.rejectErrorMessage.bind(errorHandler)
            );
          } else if (
            !parms ||
            validateOptionalParameters(parms, defer, i18n, true, true)
          ) {
            var requestBody = {
              textsToTranslate: textsToTranslate,
              parms: setSourceInParms(parms),
            };
            var config = getDynamicTranslationRequestConfig();
            $http
              .post(GET_DYNAMIC_TRANSLATIONS, requestBody, config)
              .success(function (data) {
                if (!data.result.isError)
                  defer.resolve(getOnSuccessResponse(data));
                else defer.reject(getOnErrorResponse(data));
              })
              .error(function (error, status) {
                handleErrorResponse(status, defer, i18n, true);
              });
          }
          return defer.promise;
        },
        isTranslationEnabled: function (translator) {
          var defer = $q.defer();
          if (translator && typeof translator !== 'string') {
            i18n.getMessage(
              'Translator ("translator" field) is invalid',
              function (response) {
                defer.reject({
                  code: '40003',
                  message: response,
                });
              }
            );
          } else {
            var params = {
              event: {
                eventName: 'isTranslationEnabled',
              },
              translator: translator,
            };
            this.isEnabled(params).then(
              function (data) {
                defer.resolve(data.translation);
              },
              function (data) {
                defer.reject(false);
              }
            );
          }
          return defer.promise;
        },
        getDetectedLanguage: function (text, parms) {
          var GET_DETECTED_LANGUAGE =
            '/api/sn_dt/v1/dynamic_translation/get_detected_language';
          function getOnSuccessResponse(data) {
            return {
              detectedLanguage: data.result.detectedLanguage,
              alternatives: data.result.alternatives,
              translator: data.result.translator,
            };
          }
          function getOnErrorResponse(data) {
            return JSON.parse(data.result.errorMessage);
          }
          var defer = $q.defer();
          if (isNotValidInputText(text)) {
            errorHandler['defer'] = defer;
            errorHandler['code'] = '40000';
            i18n.getMessage(
              'Text is missing or invalid',
              errorHandler.rejectErrorMessage.bind(errorHandler)
            );
          } else if (
            !parms ||
            validateOptionalParameters(parms, defer, i18n, false, false)
          ) {
            var requestBody = {
              text: text,
              parms: setSourceInParms(parms),
            };
            var config = getDynamicTranslationRequestConfig();
            $http
              .post(GET_DETECTED_LANGUAGE, requestBody, config)
              .success(function (data) {
                if (!data.result.isError)
                  defer.resolve(getOnSuccessResponse(data));
                else defer.reject(getOnErrorResponse(data));
              })
              .error(function (response, status) {
                handleErrorResponse(status, defer, i18n, false);
              });
          }
          return defer.promise;
        },
        getDetectedLanguages: function (texts, parms) {
          var GET_DETECTED_LANGUAGES =
            '/api/sn_dt/v1/dynamic_translation/get_detected_languages';
          function getOnSuccessResponse(response) {
            var successResponse = {
              status: response.result.status,
              detections: response.result.detections,
              translator: response.result.translator,
            };
            return successResponse;
          }
          function getOnErrorResponse(response) {
            var errorDetails = JSON.parse(response.result.errorMessage);
            var errorResponse = {
              status: errorDetails.status,
              code: errorDetails.code,
              message: errorDetails.message,
            };
            if (errorDetails['detections']) {
              errorResponse['detections'] = errorDetails['detections'];
            }
            return errorDetails;
          }
          var defer = $q.defer();
          if (!texts || isNotValidTexts(texts)) {
            errorHandler['defer'] = defer;
            errorHandler['code'] = '40000';
            errorHandler['hasMultipleTexts'] = true;
            i18n.getMessage(
              'Text is missing or invalid',
              errorHandler.rejectErrorMessage.bind(errorHandler)
            );
          } else if (
            !parms ||
            validateOptionalParameters(parms, defer, i18n, false, true)
          ) {
            var requestBody = {
              texts: texts,
              parms: setSourceInParms(parms),
            };
            var config = getDynamicTranslationRequestConfig();
            $http
              .post(GET_DETECTED_LANGUAGES, requestBody, config)
              .success(function (data) {
                if (!data.result.isError)
                  defer.resolve(getOnSuccessResponse(data));
                else defer.reject(getOnErrorResponse(data));
              })
              .error(function (response, status) {
                handleErrorResponse(status, defer, i18n, true);
              });
          }
          return defer.promise;
        },
        isEnabled: function (parms) {
          var IS_ENABLED = '/api/sn_dt/v1/dynamic_translation/is_enabled';
          function isValidTranslator(translator) {
            return translator && typeof translator !== 'string' ? false : true;
          }
          var defer = $q.defer();
          var translator =
            parms && parms.constructor === {}.constructor
              ? parms.translator
              : parms;
          if (isValidTranslator(translator)) {
            parms =
              typeof parms === 'string'
                ? {
                    translator: translator,
                  }
                : parms;
            var requestBody = {
              parms: setSourceInParms(parms),
            };
            var config = getDynamicTranslationRequestConfig();
            $http
              .post(IS_ENABLED, requestBody, config)
              .success(function (data) {
                defer.resolve(data.result);
              })
              .error(function (response, status) {
                defer.resolve({
                  translation: false,
                  detection: false,
                  batchTranslation: false,
                  batchDetection: false,
                });
              });
          } else {
            i18n.getMessage(
              'Translator ("translator" field) is invalid',
              function (response) {
                defer.reject({
                  code: '40003',
                  message: response,
                });
              }
            );
          }
          return defer.promise;
        },
      };
    };
  });