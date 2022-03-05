/*! RESOURCE: /scripts/doctype/DynamicTranslation.js */
var GET_DYNAMIC_TRANSLATION =
  '/api/sn_dt/v1/dynamic_translation/get_dynamic_translation';
var GET_DYNAMIC_TRANSLATIONS =
  '/api/sn_dt/v1/dynamic_translation/get_dynamic_translations';
var GET_DETECTED_LANGUAGE =
  '/api/sn_dt/v1/dynamic_translation/get_detected_language';
var GET_DETECTED_LANGUAGES =
  '/api/sn_dt/v1/dynamic_translation/get_detected_languages';
var IS_ENABLED = '/api/sn_dt/v1/dynamic_translation/is_enabled';
function setSourceInParms(parms) {
  parms = parms || {};
  parms.event = parms.event || {};
  parms.event.source = 'clientAPI';
  return parms;
}
function isNotValidInputText(msg) {
  return typeof msg != 'string';
}
function isNotValidString(str) {
  return str === null || typeof str !== 'string'
    ? true
    : str.trim().length === 0;
}
function isNotValidTranslator(translator) {
  return translator != null && typeof translator != 'string';
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
        additionalParameter.constructor != {}.constructor ||
        Object.keys(additionalParameter).length != 2
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
      this.reject({
        code: this.code,
        message: response,
        status: 'Error',
      });
    } else {
      this.reject({
        code: this.code,
        message: response,
      });
    }
  },
};
function validateOptionalParameters(parms, isTranslation, hasMultipleTexts) {
  errorHandler['hasMultipleTexts'] = hasMultipleTexts;
  if (parms.constructor != {}.constructor) {
    errorHandler['code'] = '40006';
    getMessage(
      'Additional parameters are invalid',
      errorHandler.rejectErrorMessage.bind(errorHandler)
    );
    return false;
  }
  if (isNotValidTranslator(parms.translator)) {
    errorHandler['code'] = '40003';
    getMessage(
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
      getMessage(
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
      getMessage(
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
      getMessage(
        'Additional parameters are invalid',
        errorHandler.rejectErrorMessage.bind(errorHandler)
      );
      return false;
    }
  }
  return true;
}
function handleErrorResponse(response, hasMultipleTexts) {
  errorHandler['hasMultipleTexts'] = hasMultipleTexts;
  if (response.status === 400) {
    errorHandler['code'] = '40001';
    getMessage(
      'Dynamic Translation plugin is not installed',
      errorHandler.rejectErrorMessage.bind(errorHandler)
    );
  } else {
    errorHandler['code'] = '40051';
    getMessage(
      'Unknown error occurred',
      errorHandler.rejectErrorMessage.bind(errorHandler)
    );
  }
}
var DynamicTranslation = Class.create({
  getTranslation: function (msg, parms) {
    function getOnSuccessResponse(response) {
      var successResponse = {
        translations: response.result.translations,
        translator: response.result.translator,
      };
      if (response.result.detectedLanguage) {
        successResponse['detectedLanguage'] = response.result.detectedLanguage;
      }
      return successResponse;
    }
    function getOnErrorResponse(response) {
      return JSON.parse(response.result.errorMessage);
    }
    return new Promise(function (resolve, reject) {
      errorHandler['reject'] = reject;
      if (isNotValidInputText(msg)) {
        errorHandler['code'] = '40000';
        getMessage(
          'Text is missing or invalid',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
      } else if (!parms || validateOptionalParameters(parms, true, false)) {
        translationRequest = JSON.stringify({
          textToTranslate: msg,
          parms: setSourceInParms(parms),
        });
        $j.ajaxSetup({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        $j.post(
          GET_DYNAMIC_TRANSLATION,
          translationRequest,
          function (response) {
            if (!response.result.isError)
              resolve(getOnSuccessResponse(response));
            else reject(getOnErrorResponse(response));
          }
        ).fail(function (response) {
          handleErrorResponse(response, false);
        });
      }
    });
  },
  getTranslations: function (msg, parms) {
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
    return new Promise(function (resolve, reject) {
      errorHandler['reject'] = reject;
      if (!msg || isNotValidTexts(msg)) {
        errorHandler['code'] = '40000';
        errorHandler['hasMultipleTexts'] = true;
        getMessage(
          'Text is missing or invalid',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
      } else if (!parms || validateOptionalParameters(parms, true, true)) {
        translationRequest = JSON.stringify({
          textsToTranslate: msg,
          parms: setSourceInParms(parms),
        });
        $j.ajaxSetup({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        $j.post(
          GET_DYNAMIC_TRANSLATIONS,
          translationRequest,
          function (response) {
            if (!response.result.isError)
              resolve(getOnSuccessResponse(response));
            else reject(getOnErrorResponse(response));
          }
        ).fail(function (response) {
          handleErrorResponse(response, true);
        });
      }
    });
  },
  isTranslationEnabled: function (translator) {
    var isEnabled = this.isEnabled;
    return new Promise(function (resolve, reject) {
      if (isNotValidTranslator(translator)) {
        getMessage(
          'Translator ("translator" field) is invalid',
          function (response) {
            reject({
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
        isEnabled(params).then(
          function (response) {
            resolve(response.translation);
          },
          function (response) {
            reject(false);
          }
        );
      }
    });
  },
  getDetectedLanguage: function (text, parms) {
    function getOnSuccessResponse(response) {
      return {
        detectedLanguage: response.result.detectedLanguage,
        alternatives: response.result.alternatives,
        translator: response.result.translator,
      };
    }
    function getOnErrorResponse(response) {
      return JSON.parse(response.result.errorMessage);
    }
    return new Promise(function (resolve, reject) {
      errorHandler['reject'] = reject;
      if (isNotValidInputText(text)) {
        errorHandler['code'] = '40000';
        getMessage(
          'Text is missing or invalid',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
      } else if (!parms || validateOptionalParameters(parms, false, false)) {
        detectionRequest = JSON.stringify({
          text: text,
          parms: setSourceInParms(parms),
        });
        $j.ajaxSetup({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        $j.post(GET_DETECTED_LANGUAGE, detectionRequest, function (response) {
          if (!response.result.isError) resolve(getOnSuccessResponse(response));
          else reject(getOnErrorResponse(response));
        }).fail(function (response) {
          handleErrorResponse(response, false);
        });
      }
    });
  },
  getDetectedLanguages: function (texts, parms) {
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
    return new Promise(function (resolve, reject) {
      errorHandler['reject'] = reject;
      if (!texts || isNotValidTexts(texts)) {
        errorHandler['code'] = '40000';
        errorHandler['hasMultipleTexts'] = true;
        getMessage(
          'Text is missing or invalid',
          errorHandler.rejectErrorMessage.bind(errorHandler)
        );
      } else if (!parms || validateOptionalParameters(parms, false, true)) {
        detectionRequest = JSON.stringify({
          texts: texts,
          parms: setSourceInParms(parms),
        });
        $j.ajaxSetup({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        $j.post(GET_DETECTED_LANGUAGES, detectionRequest, function (response) {
          if (!response.result.isError) resolve(getOnSuccessResponse(response));
          else reject(getOnErrorResponse(response));
        }).fail(function (response) {
          handleErrorResponse(response, true);
        });
      }
    });
  },
  isEnabled: function (parms) {
    function isValidTranslator(translator) {
      return translator && typeof translator != 'string' ? false : true;
    }
    return new Promise(function (resolve, reject) {
      var translator =
        parms && parms.constructor == {}.constructor ? parms.translator : parms;
      if (isValidTranslator(translator)) {
        parms =
          typeof parms === 'string'
            ? {
                translator: translator,
              }
            : parms;
        isEnabledRequest = JSON.stringify({
          parms: setSourceInParms(parms),
        });
        $j.ajaxSetup({
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        $j.post(IS_ENABLED, isEnabledRequest, function (response) {
          var res = response.result;
          resolve(res);
        }).fail(function () {
          resolve({
            translation: false,
            detection: false,
            batchTranslation: false,
            batchDetection: false,
          });
        });
      } else {
        getMessage(
          'Translator ("translator" field) is invalid',
          function (response) {
            reject({
              code: '40003',
              message: response,
            });
          }
        );
      }
    });
  },
});
DynamicTranslation.getTranslation = function (textToTranslate, parms) {
  return new DynamicTranslation().getTranslation(textToTranslate, parms);
};
DynamicTranslation.getTranslations = function (textsToTranslate, parms) {
  return new DynamicTranslation().getTranslations(textsToTranslate, parms);
};
DynamicTranslation.isTranslationEnabled = function (translator) {
  return new DynamicTranslation().isTranslationEnabled(translator);
};
DynamicTranslation.getDetectedLanguage = function (text, parms) {
  return new DynamicTranslation().getDetectedLanguage(text, parms);
};
DynamicTranslation.getDetectedLanguages = function (texts, parms) {
  return new DynamicTranslation().getDetectedLanguages(texts, parms);
};
DynamicTranslation.isEnabled = function (parms) {
  return new DynamicTranslation().isEnabled(parms);
};
