/*! RESOURCE: /scripts/app.ngbsm/factory.bsmURL.js */
angular.module('sn.ngbsm').factory('bsmURL', function ($resource) {
  'use strict';
  function URLEncode(data) {
    var payload = '';
    for (var property in data) {
      if (data.hasOwnProperty(property)) {
        payload += property + '=' + encodeURI(data[property]) + '&';
      }
    }
    return payload;
  }
  function extract(param) {
    var query = decodeURI(location.search).substring(1);
    if (query !== '') {
      var parameters = query.split('&');
      for (var i = 0; i < parameters.length; i++) {
        var split = parameters[i].indexOf('=');
        var name = parameters[i].substring(0, split);
        var value = parameters[i].substring(split + 1, parameters[i].length);
        if (name == param) return value;
      }
    }
    return null;
  }
  return {
    getParameter: function (param) {
      return extract(param);
    },
    URLEncode: function (data) {
      return URLEncode(data);
    },
  };
});