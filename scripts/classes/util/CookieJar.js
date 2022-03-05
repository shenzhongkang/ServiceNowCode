/*! RESOURCE: /scripts/classes/util/CookieJar.js */
var CookieJar = Class.create({
  appendString: '__CJ_',
  initialize: function (options) {
    this.options = {
      expires: 3600,
      path: '',
      domain: '',
      sameSite: '',
      secure: '',
    };
    Object.extend(this.options, options || {});
    if (this.options.expires != '') {
      var date = new Date();
      date = new Date(date.getTime() + this.options.expires * 1000);
      this.options.expires = '; Expires=' + date.toGMTString();
    }
    if (this.options.path != '') {
      this.options.path = '; Path=' + escape(this.options.path);
    }
    if (this.options.domain != '') {
      this.options.domain = '; Domain=' + escape(this.options.domain);
    }
    if (this.options.sameSite != '') {
      this.options.sameSite = '; SameSite=' + escape(this.options.sameSite);
    }
    if (this.options.secure == 'secure') {
      this.options.secure = '; Secure';
    } else {
      this.options.secure = '';
    }
  },
  put: function (name, value) {
    name = this.appendString + name;
    cookie = this.options;
    var type = typeof value;
    switch (type) {
      case 'undefined':
      case 'function':
      case 'unknown':
        return false;
      case 'boolean':
      case 'string':
      case 'number':
        value = String(value.toString());
    }
    var cookie_str = name + '=' + escape(Object.toJSON(value));
    try {
      document.cookie =
        cookie_str +
        cookie.expires +
        cookie.path +
        cookie.domain +
        cookie.sameSite +
        cookie.secure;
    } catch (e) {
      return false;
    }
    return true;
  },
  get: function (name) {
    name = this.appendString + name;
    var cookies = document.cookie.match(name + '=(.*?)(;|$)');
    if (cookies) {
      return unescape(cookies[1]).evalJSON();
    } else {
      return null;
    }
  },
});
