/*! RESOURCE: /scripts/sp_page_api.js */
(function (open) {
  XMLHttpRequest.prototype.open = function (method, url) {
    this._url = url;
    open.apply(this, arguments);
  };
})(XMLHttpRequest.prototype.open);
(function (send) {
  var headerValue =
    'Interface=Service-Portal,Interface-Type=' +
    NOW.portal_url_suffix +
    ',Interface-SysID=' +
    NOW.portal_id;
  var loc = window.location;
  var anchor = document.createElement('a');
  XMLHttpRequest.prototype.send = function (data) {
    anchor.href = this._url;
    if (
      anchor.hostname === loc.hostname &&
      anchor.port === loc.port &&
      anchor.protocol === loc.protocol
    )
      this.setRequestHeader('X-Transaction-Source', headerValue);
    send.call(this, data);
  };
})(XMLHttpRequest.prototype.send);
function parseKeyValue(keyValue) {
  var isDefined = function (value) {
    return typeof value !== 'undefined';
  };
  var obj = {};
  (keyValue || '').split('&').map(function (keyValue) {
    var splitPoint, key, val;
    if (keyValue) {
      key = keyValue = keyValue.replace(/\+/g, '%20');
      splitPoint = keyValue.indexOf('=');
      if (splitPoint !== -1) {
        key = keyValue.substring(0, splitPoint);
        val = keyValue.substring(splitPoint + 1);
      }
      key = decodeURIComponent(key);
      if (isDefined(key)) {
        val = isDefined(val) ? decodeURIComponent(val) : true;
        if (!hasOwnProperty.call(obj, key)) {
          obj[key] = val;
        } else if (Array.isArray(obj[key])) {
          obj[key].push(val);
        } else {
          obj[key] = [obj[key], val];
        }
      }
    }
  });
  return obj;
}
function getSpPageUrl() {
  var params = parseKeyValue(location.search.substr(1));
  params.time = new Date().getTime();
  params.portal_id = NOW.portal_id;
  params.request_uri = location.pathname + location.search;
  var url = '/api/now/sp/page';
  return url + '?' + $.param(params);
}
function getHeaders() {
  return {
    Accept: 'application/json',
    'x-portal': NOW.portal_id,
    'X-UserToken': window.g_ck,
  };
}
NOW.spPageResponse = $.ajax({
  method: 'GET',
  url: getSpPageUrl(),
  headers: getHeaders(),
});
