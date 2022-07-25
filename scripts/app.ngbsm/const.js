/*! RESOURCE: /scripts/app.ngbsm/const.js */
angular.module('sn.ngbsm').factory('CONST', function () {
  var CONSTANTS = {
    KEYCODE_ENTER: 13,
    KEYCODE_TAB: 9,
    KEYCODE_SPACE: 32,
    KEYCODE_ESC: 27,
    KEYCODE_LEFT: 37,
    KEYCODE_UP: 38,
    KEYCODE_RIGHT: 39,
    KEYCODE_DOWN: 40,
    KEYCODE_PLUS: 107,
    KEYCODE_MINUS: 109,
    KEYCODE_ONE: 49,
    KEYCODE_TWO: 50,
    KEYCODE_EQUALS: 187,
    KEYCODE_DASH: 189,
    TABLES: {
      SVC_CI_ASSOC: 'svc_ci_assoc',
    },
    VIEWS: {
      SVC_CI_ASSOC_DEP: 'svc_ci_assoc_dep',
    },
    SYS_IDS: {
      BSM_INDICATOR_SVC_CI_ASSOC_RECORD: 'b3cba3b873c5201045cadfcd3bf6a75c',
    },
  };
  return CONSTANTS;
});
