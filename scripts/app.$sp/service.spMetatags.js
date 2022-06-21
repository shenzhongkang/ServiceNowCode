/*! RESOURCE: /scripts/app.$sp/service.spMetatags.js */
angular.module('sn.$sp').factory('spMetatagService', function () {
  'use strict';
  var metatagMap = {};
  var seoMap = {};
  var subscribeCallbackArr = [];
  var subscribeCallbackArrSEO = [];
  function notifySubscribers() {
    for (var i = 0; i < subscribeCallbackArr.length; i++)
      subscribeCallbackArr[i](metatagMap);
  }
  function notifySubscribersSEO() {
    for (var i = 0; i < subscribeCallbackArrSEO.length; i++)
      subscribeCallbackArrSEO[i](seoMap);
  }
  return {
    setTags: function (tagArr) {
      metatagMap = {};
      if (tagArr && tagArr.length) {
        for (var i = 0; i < tagArr.length; i++)
          metatagMap[tagArr[i].name] = tagArr[i].content;
      }
      notifySubscribers();
    },
    setSeoTags: function (tagArr) {
      seoMap = tagArr[0];
      notifySubscribersSEO();
    },
    subscribe: function (callback) {
      subscribeCallbackArr.push(callback);
    },
    subscribeSEO: function (callback) {
      subscribeCallbackArrSEO.push(callback);
    },
  };
});
