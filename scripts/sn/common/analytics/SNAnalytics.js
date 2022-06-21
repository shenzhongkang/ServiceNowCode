/*! RESOURCE: /scripts/sn/common/analytics/SNAnalytics.js */
!(function (t, e) {
  'object' == typeof exports && 'object' == typeof module
    ? (module.exports = e())
    : 'function' == typeof define && define.amd
    ? define([], e)
    : 'object' == typeof exports
    ? (exports.SNAnalytics = e())
    : (t.SNAnalytics = e());
})(this, function () {
  return (function (t) {
    var e = {};
    function r(n) {
      if (e[n]) return e[n].exports;
      var o = (e[n] = { i: n, l: !1, exports: {} });
      return t[n].call(o.exports, o, o.exports, r), (o.l = !0), o.exports;
    }
    return (
      (r.m = t),
      (r.c = e),
      (r.d = function (t, e, n) {
        r.o(t, e) || Object.defineProperty(t, e, { enumerable: !0, get: n });
      }),
      (r.r = function (t) {
        'undefined' != typeof Symbol &&
          Symbol.toStringTag &&
          Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
          Object.defineProperty(t, '__esModule', { value: !0 });
      }),
      (r.t = function (t, e) {
        if ((1 & e && (t = r(t)), 8 & e)) return t;
        if (4 & e && 'object' == typeof t && t && t.__esModule) return t;
        var n = Object.create(null);
        if (
          (r.r(n),
          Object.defineProperty(n, 'default', { enumerable: !0, value: t }),
          2 & e && 'string' != typeof t)
        )
          for (var o in t)
            r.d(
              n,
              o,
              function (e) {
                return t[e];
              }.bind(null, o)
            );
        return n;
      }),
      (r.n = function (t) {
        var e =
          t && t.__esModule
            ? function () {
                return t.default;
              }
            : function () {
                return t;
              };
        return r.d(e, 'a', e), e;
      }),
      (r.o = function (t, e) {
        return Object.prototype.hasOwnProperty.call(t, e);
      }),
      (r.p = ''),
      r((r.s = 202))
    );
  })([
    function (t, e, r) {
      'use strict';
      var n = r(7),
        o = r(54).f,
        i = r(139),
        u = r(5),
        a = r(56),
        c = r(24),
        s = r(18),
        f = function (t) {
          var e = function (e, r, n) {
            if (this instanceof t) {
              switch (arguments.length) {
                case 0:
                  return new t();
                case 1:
                  return new t(e);
                case 2:
                  return new t(e, r);
              }
              return new t(e, r, n);
            }
            return t.apply(this, arguments);
          };
          return (e.prototype = t.prototype), e;
        };
      t.exports = function (t, e) {
        var r,
          l,
          p,
          d,
          v,
          h,
          y,
          g,
          b = t.target,
          m = t.global,
          x = t.stat,
          w = t.proto,
          S = m ? n : x ? n[b] : (n[b] || {}).prototype,
          A = m ? u : u[b] || (u[b] = {}),
          E = A.prototype;
        for (p in e)
          (r = !i(m ? p : b + (x ? '.' : '#') + p, t.forced) && S && s(S, p)),
            (v = A[p]),
            r && (h = t.noTargetGet ? (g = o(S, p)) && g.value : S[p]),
            (d = r && h ? h : e[p]),
            (r && typeof v == typeof d) ||
              ((y =
                t.bind && r
                  ? a(d, n)
                  : t.wrap && r
                  ? f(d)
                  : w && 'function' == typeof d
                  ? a(Function.call, d)
                  : d),
              (t.sham || (d && d.sham) || (v && v.sham)) && c(y, 'sham', !0),
              (A[p] = y),
              w &&
                (s(u, (l = b + 'Prototype')) || c(u, l, {}),
                (u[l][p] = d),
                t.real && E && !E[p] && c(E, p, d)));
      };
    },
    function (t, e) {
      t.exports = function (t) {
        return t && t.__esModule ? t : { default: t };
      };
    },
    function (t, e, r) {
      t.exports = r(203);
    },
    function (t, e, r) {
      'use strict';
      var n,
        o = r(185),
        i = r(15),
        u = r(4),
        a = r(20),
        c = r(17),
        s = r(93),
        f = r(27),
        l = r(28),
        p = r(21).f,
        d = r(91),
        v = r(64),
        h = r(11),
        y = r(124),
        g = u.Int8Array,
        b = g && g.prototype,
        m = u.Uint8ClampedArray,
        x = m && m.prototype,
        w = g && d(g),
        S = b && d(b),
        A = Object.prototype,
        E = A.isPrototypeOf,
        T = h('toStringTag'),
        O = y('TYPED_ARRAY_TAG'),
        P = o && !!v && 'Opera' !== s(u.opera),
        _ = !1,
        I = {
          Int8Array: 1,
          Uint8Array: 1,
          Uint8ClampedArray: 1,
          Int16Array: 2,
          Uint16Array: 2,
          Int32Array: 4,
          Uint32Array: 4,
          Float32Array: 4,
          Float64Array: 8,
        },
        j = function (t) {
          return a(t) && c(I, s(t));
        };
      for (n in I) u[n] || (P = !1);
      if (
        (!P || 'function' != typeof w || w === Function.prototype) &&
        ((w = function () {
          throw TypeError('Incorrect invocation');
        }),
        P)
      )
        for (n in I) u[n] && v(u[n], w);
      if ((!P || !S || S === A) && ((S = w.prototype), P))
        for (n in I) u[n] && v(u[n].prototype, S);
      if ((P && d(x) !== S && v(x, S), i && !c(S, T)))
        for (n in ((_ = !0),
        p(S, T, {
          get: function () {
            return a(this) ? this[O] : void 0;
          },
        }),
        I))
          u[n] && f(u[n], O, n);
      t.exports = {
        NATIVE_ARRAY_BUFFER_VIEWS: P,
        TYPED_ARRAY_TAG: _ && O,
        aTypedArray: function (t) {
          if (j(t)) return t;
          throw TypeError('Target is not a typed array');
        },
        aTypedArrayConstructor: function (t) {
          if (v) {
            if (E.call(w, t)) return t;
          } else
            for (var e in I)
              if (c(I, n)) {
                var r = u[e];
                if (r && (t === r || E.call(r, t))) return t;
              }
          throw TypeError('Target is not a typed array constructor');
        },
        exportTypedArrayMethod: function (t, e, r) {
          if (i) {
            if (r)
              for (var n in I) {
                var o = u[n];
                o && c(o.prototype, t) && delete o.prototype[t];
              }
            (S[t] && !r) || l(S, t, r ? e : (P && b[t]) || e);
          }
        },
        exportTypedArrayStaticMethod: function (t, e, r) {
          var n, o;
          if (i) {
            if (v) {
              if (r) for (n in I) (o = u[n]) && c(o, t) && delete o[t];
              if (w[t] && !r) return;
              try {
                return l(w, t, r ? e : (P && g[t]) || e);
              } catch (t) {}
            }
            for (n in I) !(o = u[n]) || (o[t] && !r) || l(o, t, e);
          }
        },
        isView: function (t) {
          var e = s(t);
          return 'DataView' === e || c(I, e);
        },
        isTypedArray: j,
        TypedArray: w,
        TypedArrayPrototype: S,
      };
    },
    function (t, e, r) {
      (function (e) {
        var r = function (t) {
          return t && t.Math == Math && t;
        };
        t.exports =
          r('object' == typeof globalThis && globalThis) ||
          r('object' == typeof window && window) ||
          r('object' == typeof self && self) ||
          r('object' == typeof e && e) ||
          Function('return this')();
      }.call(this, r(96)));
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e) {
      t.exports = function (t) {
        try {
          return !!t();
        } catch (t) {
          return !0;
        }
      };
    },
    function (t, e, r) {
      (function (e) {
        var r = function (t) {
          return t && t.Math == Math && t;
        };
        t.exports =
          r('object' == typeof globalThis && globalThis) ||
          r('object' == typeof window && window) ||
          r('object' == typeof self && self) ||
          r('object' == typeof e && e) ||
          Function('return this')();
      }.call(this, r(96)));
    },
    function (t, e) {
      t.exports = function (t) {
        try {
          return !!t();
        } catch (t) {
          return !0;
        }
      };
    },
    function (t, e, r) {
      var n = r(7),
        o = r(100),
        i = r(18),
        u = r(77),
        a = r(101),
        c = r(143),
        s = o('wks'),
        f = n.Symbol,
        l = c ? f : (f && f.withoutSetter) || u;
      t.exports = function (t) {
        return (
          i(s, t) || (a && i(f, t) ? (s[t] = f[t]) : (s[t] = l('Symbol.' + t))),
          s[t]
        );
      };
    },
    function (t, e, r) {
      var n = r(5),
        o = r(18),
        i = r(99),
        u = r(22).f;
      t.exports = function (t) {
        var e = n.Symbol || (n.Symbol = {});
        o(e, t) || u(e, t, { value: i.f(t) });
      };
    },
    function (t, e, r) {
      var n = r(4),
        o = r(172),
        i = r(17),
        u = r(124),
        a = r(174),
        c = r(274),
        s = o('wks'),
        f = n.Symbol,
        l = c ? f : (f && f.withoutSetter) || u;
      t.exports = function (t) {
        return (
          i(s, t) || (a && i(f, t) ? (s[t] = f[t]) : (s[t] = l('Symbol.' + t))),
          s[t]
        );
      };
    },
    function (t, e, r) {
      var n = r(8);
      t.exports = !n(function () {
        return (
          7 !=
          Object.defineProperty({}, 1, {
            get: function () {
              return 7;
            },
          })[1]
        );
      });
    },
    function (t, e) {
      t.exports = function (t) {
        return 'object' == typeof t ? null !== t : 'function' == typeof t;
      };
    },
    function (t, e, r) {
      var n = r(32),
        o = Math.min;
      t.exports = function (t) {
        return t > 0 ? o(n(t), 9007199254740991) : 0;
      };
    },
    function (t, e, r) {
      var n = r(6);
      t.exports = !n(function () {
        return (
          7 !=
          Object.defineProperty({}, 1, {
            get: function () {
              return 7;
            },
          })[1]
        );
      });
    },
    function (t, e, r) {
      var n = r(20);
      t.exports = function (t) {
        if (!n(t)) throw TypeError(String(t) + ' is not an object');
        return t;
      };
    },
    function (t, e) {
      var r = {}.hasOwnProperty;
      t.exports = function (t, e) {
        return r.call(t, e);
      };
    },
    function (t, e) {
      var r = {}.hasOwnProperty;
      t.exports = function (t, e) {
        return r.call(t, e);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(271), r(88), r(70);
      var o = n(r(281)),
        i = n(r(285)),
        u = n(r(293)),
        a = n(r(297)),
        c = n(r(301));
      (0, n(r(2)).default)(e, '__esModule', { value: !0 }),
        (e.isUndefined = function (t) {
          return void 0 === t;
        }),
        (e.isDefined = function (t) {
          return !e.isUndefined(t);
        }),
        (e.isNullOrUndefined = function (t) {
          return e.isUndefined(t) || null === t;
        }),
        (e.isString = function (t) {
          return 'string' == typeof t;
        }),
        (e.isNonEmptyString = function (t) {
          return e.isString(t) && Boolean((0, c.default)(t).call(t));
        }),
        (e.isNumber = function (t) {
          return 'number' == typeof t && !(0, a.default)(t);
        }),
        (e.isInteger = function (t) {
          return e.isNumber(t) && t % 1 == 0;
        }),
        (e.isPositiveInteger = function (t) {
          return e.isInteger(t) && t > 0;
        }),
        (e.isBoolean = function (t) {
          return 'boolean' == typeof t;
        }),
        (e.isDate = function (t) {
          return t instanceof Date;
        }),
        (e.isObject = function (t) {
          return t === Object(t) && t.constructor === Object;
        }),
        (e.isArray = function (t) {
          return (0, u.default)(t);
        }),
        (e.isFunction = function (t) {
          return 'function' == typeof t;
        }),
        (e.isPromise = function (t) {
          return !!t && e.isFunction(t.then) && e.isFunction(t.catch);
        }),
        (e.isEnum = function (t, e) {
          var r;
          return (0, i.default)((r = (0, o.default)(t))).call(r, e);
        });
      var s = new RegExp(
        '^(?:(?:https?)://)(?:\\S+(?::\\S*)?@)?(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+(?:[a-z\\u00a1-\\uffff]{2,}\\.?)|localhost)(?::\\d{2,5})?(?:[/?#]\\S*)?$',
        'i'
      );
      e.isUrl = function (t) {
        return e.isNonEmptyString(t) && Boolean(s.exec(t));
      };
    },
    function (t, e) {
      t.exports = function (t) {
        return 'object' == typeof t ? null !== t : 'function' == typeof t;
      };
    },
    function (t, e, r) {
      var n = r(15),
        o = r(170),
        i = r(16),
        u = r(84),
        a = Object.defineProperty;
      e.f = n
        ? a
        : function (t, e, r) {
            if ((i(t), (e = u(e, !0)), i(r), o))
              try {
                return a(t, e, r);
              } catch (t) {}
            if ('get' in r || 'set' in r)
              throw TypeError('Accessors not supported');
            return 'value' in r && (t[e] = r.value), t;
          };
    },
    function (t, e, r) {
      var n = r(12),
        o = r(138),
        i = r(30),
        u = r(76),
        a = Object.defineProperty;
      e.f = n
        ? a
        : function (t, e, r) {
            if ((i(t), (e = u(e, !0)), i(r), o))
              try {
                return a(t, e, r);
              } catch (t) {}
            if ('get' in r || 'set' in r)
              throw TypeError('Accessors not supported');
            return 'value' in r && (t[e] = r.value), t;
          };
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(131);
      var o,
        i = n(r(2)),
        u = n(r(178)),
        a = n(r(179)),
        c =
          ((o = function (t, e) {
            return (o =
              a.default ||
              ({ __proto__: [] } instanceof Array &&
                function (t, e) {
                  t.__proto__ = e;
                }) ||
              function (t, e) {
                for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
              })(t, e);
          }),
          function (t, e) {
            function r() {
              this.constructor = t;
            }
            o(t, e),
              (t.prototype =
                null === e
                  ? (0, u.default)(e)
                  : ((r.prototype = e.prototype), new r()));
          });
      function s(t, e) {
        (0, a.default)(t, e.prototype), (t.name = t.constructor.name);
      }
      (0, i.default)(e, '__esModule', { value: !0 });
      var f = (function (t) {
        function e(r) {
          var n = t.call(this, '[SNAnalytics] ' + r) || this;
          return s(n, e), n;
        }
        return c(e, t), e;
      })(Error);
      e.SNError = f;
      var l = (function (t) {
        function e(r) {
          var n = t.call(this, r) || this;
          return s(n, e), n;
        }
        return c(e, t), e;
      })(f);
      e.SNTypeError = l;
      var p = (function (t) {
        function e(r) {
          var n = t.call(this, 'Server call failed: ' + r) || this;
          return s(n, e), (n.errorCode = r), n;
        }
        return c(e, t), e;
      })(f);
      e.HttpError = p;
    },
    function (t, e, r) {
      var n = r(12),
        o = r(22),
        i = r(55);
      t.exports = n
        ? function (t, e, r) {
            return o.f(t, e, i(1, r));
          }
        : function (t, e, r) {
            return (t[e] = r), t;
          };
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(167)),
        i = n(r(116)),
        u = n(r(117)),
        a = n(r(2)),
        c = n(r(113)),
        s = n(r(114)),
        f = function (t, e, r, n) {
          var o,
            i = arguments.length,
            u = i < 3 ? e : null === n ? (n = (0, s.default)(e, r)) : n;
          if (
            'object' ===
              ('undefined' == typeof Reflect
                ? 'undefined'
                : (0, c.default)(Reflect)) &&
            'function' == typeof Reflect.decorate
          )
            u = Reflect.decorate(t, e, r, n);
          else
            for (var f = t.length - 1; f >= 0; f--)
              (o = t[f]) &&
                (u = (i < 3 ? o(u) : i > 3 ? o(e, r, u) : o(e, r)) || u);
          return i > 3 && u && (0, a.default)(e, r, u), u;
        },
        l = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, a.default)(e, '__esModule', { value: !0 });
      var p = l(r(63)),
        d = r(130),
        v = r(19),
        h = r(95),
        y = r(134),
        g = { 0: ['debug'], 1: ['info'], 2: ['warn'], 3: ['error'] },
        b = (function () {
          function t() {
            this.handleLogLevel(p.default.DEFAULT_LOG_LEVEL);
            try {
              var t;
              (this.channel = new BroadcastChannel('SNAnalytics.Logger')),
                (this.channel.onmessage = (0, u.default)(
                  (t = this.onBroadcastMessage)
                ).call(t, this));
            } catch (t) {
              this.debug('Broadcast channel is not supported');
            }
          }
          return (
            (t.prototype.onBroadcastMessage = function (t) {
              this.handleLogLevel(t.data.logLevel);
            }),
            (t.prototype.notify = function (t) {
              var e;
              return null === (e = this.channel) || void 0 === e
                ? void 0
                : e.postMessage({ logLevel: t });
            }),
            (t.prototype.handleLogLevel = function (t, e) {
              void 0 === e && (e = !1);
              var r = h.tryGetEnumValue(t, d.LogLevel);
              if (v.isUndefined(r)) this.warn('Ignoring invalid log level:', t);
              else if (this.logLevel !== r) {
                for (var n = 0, a = (0, i.default)(g); n < a.length; n++)
                  for (
                    var c = a[n], s = c[0], f = 0, l = c[1];
                    f < l.length;
                    f++
                  ) {
                    var p,
                      y = l[f];
                    this[y] =
                      (0, o.default)(s, 10) >= r
                        ? (0, u.default)((p = console[y])).call(
                            p,
                            console,
                            '[SNAnalytics]'
                          )
                        : function () {};
                  }
                e && this.notify(r), (this.logLevel = r);
              }
            }),
            (t.prototype.setDebugLevel = function (t) {
              this.handleLogLevel(t, !0);
            }),
            (t.prototype.debug = function (t) {
              for (var e = [], r = 1; r < arguments.length; r++)
                e[r - 1] = arguments[r];
            }),
            (t.prototype.info = function (t) {
              for (var e = [], r = 1; r < arguments.length; r++)
                e[r - 1] = arguments[r];
            }),
            (t.prototype.warn = function (t) {
              for (var e = [], r = 1; r < arguments.length; r++)
                e[r - 1] = arguments[r];
            }),
            (t.prototype.error = function (t) {
              for (var e = [], r = 1; r < arguments.length; r++)
                e[r - 1] = arguments[r];
            }),
            f(
              [y.Catch(Error, function () {})],
              t.prototype,
              'onBroadcastMessage',
              null
            ),
            t
          );
        })();
      e.default = new b();
    },
    function (t, e, r) {
      var n = r(5);
      t.exports = function (t) {
        return n[t + 'Prototype'];
      };
    },
    function (t, e, r) {
      var n = r(15),
        o = r(21),
        i = r(87);
      t.exports = n
        ? function (t, e, r) {
            return o.f(t, e, i(1, r));
          }
        : function (t, e, r) {
            return (t[e] = r), t;
          };
    },
    function (t, e, r) {
      var n = r(4),
        o = r(27),
        i = r(17),
        u = r(123),
        a = r(126),
        c = r(50),
        s = c.get,
        f = c.enforce,
        l = String(String).split('String');
      (t.exports = function (t, e, r, a) {
        var c = !!a && !!a.unsafe,
          s = !!a && !!a.enumerable,
          p = !!a && !!a.noTargetGet;
        'function' == typeof r &&
          ('string' != typeof e || i(r, 'name') || o(r, 'name', e),
          (f(r).source = l.join('string' == typeof e ? e : ''))),
          t !== n
            ? (c ? !p && t[e] && (s = !0) : delete t[e],
              s ? (t[e] = r) : o(t, e, r))
            : s
            ? (t[e] = r)
            : u(e, r);
      })(Function.prototype, 'toString', function () {
        return ('function' == typeof this && s(this).source) || a(this);
      });
    },
    function (t, e, r) {
      var n = r(97),
        o = r(43);
      t.exports = function (t) {
        return n(o(t));
      };
    },
    function (t, e, r) {
      var n = r(13);
      t.exports = function (t) {
        if (!n(t)) throw TypeError(String(t) + ' is not an object');
        return t;
      };
    },
    function (t, e) {
      var r = {}.toString;
      t.exports = function (t) {
        return r.call(t).slice(8, -1);
      };
    },
    function (t, e) {
      var r = Math.ceil,
        n = Math.floor;
      t.exports = function (t) {
        return isNaN((t = +t)) ? 0 : (t > 0 ? n : r)(t);
      };
    },
    function (t, e, r) {
      var n = r(66);
      t.exports = function (t) {
        return Object(n(t));
      };
    },
    function (t, e, r) {
      var n = r(94),
        o = r(85),
        i = r(33),
        u = r(14),
        a = r(335),
        c = [].push,
        s = function (t) {
          var e = 1 == t,
            r = 2 == t,
            s = 3 == t,
            f = 4 == t,
            l = 6 == t,
            p = 5 == t || l;
          return function (d, v, h, y) {
            for (
              var g,
                b,
                m = i(d),
                x = o(m),
                w = n(v, h, 3),
                S = u(x.length),
                A = 0,
                E = y || a,
                T = e ? E(d, S) : r ? E(d, 0) : void 0;
              S > A;
              A++
            )
              if ((p || A in x) && ((b = w((g = x[A]), A, m)), t))
                if (e) T[A] = b;
                else if (b)
                  switch (t) {
                    case 3:
                      return !0;
                    case 5:
                      return g;
                    case 6:
                      return A;
                    case 2:
                      c.call(T, g);
                  }
                else if (f) return !1;
            return l ? -1 : s || f ? f : T;
          };
        };
      t.exports = {
        forEach: s(0),
        map: s(1),
        filter: s(2),
        some: s(3),
        every: s(4),
        find: s(5),
        findIndex: s(6),
      };
    },
    function (t, e) {
      var r = {}.toString;
      t.exports = function (t) {
        return r.call(t).slice(8, -1);
      };
    },
    function (t, e, r) {
      t.exports = r(207);
    },
    function (t, e) {
      t.exports = !0;
    },
    function (t, e, r) {
      var n = r(5),
        o = r(7),
        i = function (t) {
          return 'function' == typeof t ? t : void 0;
        };
      t.exports = function (t, e) {
        return arguments.length < 2
          ? i(n[t]) || i(o[t])
          : (n[t] && n[t][e]) || (o[t] && o[t][e]);
      };
    },
    function (t, e, r) {
      var n = r(106),
        o = r(22).f,
        i = r(24),
        u = r(18),
        a = r(214),
        c = r(9)('toStringTag');
      t.exports = function (t, e, r, s) {
        if (t) {
          var f = r ? t : t.prototype;
          u(f, c) || o(f, c, { configurable: !0, value: e }),
            s && !n && i(f, 'toString', a);
        }
      };
    },
    function (t, e, r) {
      t.exports = r(217);
    },
    function (t, e, r) {
      t.exports = r(235);
    },
    function (t, e, r) {
      'use strict';
      var n = r(1)(r(2)),
        o = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, n.default)(e, '__esModule', { value: !0 });
      var i = o(r(395)),
        u = o(r(400)),
        a = o(r(411)),
        c = o(r(419)),
        s = r(420),
        f = r(23),
        l = o(r(63)),
        p = function (t, e, r) {
          return {
            set: function (r) {
              return t.set(e, r);
            },
            get: function () {
              var n;
              return null !== (n = t.get(e)) && void 0 !== n ? n : r;
            },
            remove: function () {
              return t.remove(e);
            },
          };
        },
        d = function (t) {
          if (!t)
            throw new f.SNError('Need to call setKeys with a valid apiKey');
          return t;
        },
        v = (function () {
          function t() {}
          return (
            (t.prototype.setKeys = function (t, e) {
              var r = new s.TabStore(t),
                n = new s.BrowserStore(t);
              (this.configurationProvider = new i.default(r, t, e)),
                (this.dataPointsProvider = new u.default(r)),
                (this.browserIdProvider = new a.default(n)),
                (this.tabIdProvider = new c.default(r)),
                (this.currentPageProvider = p(r, 'page', '')),
                (this.clientIdProvider = p(
                  n,
                  'client',
                  l.default.DEFAULT_CLIENT_ID
                )),
                (this.appUserIdProvider = p(n, 'user')),
                (this.trackingConsentProvider = p(n, 'consent', !0));
            }),
            (0, n.default)(t.prototype, 'configuration', {
              get: function () {
                return d(this.configurationProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'dataPoints', {
              get: function () {
                return d(this.dataPointsProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'browserId', {
              get: function () {
                return d(this.browserIdProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'tabId', {
              get: function () {
                return d(this.tabIdProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'currentPage', {
              get: function () {
                return d(this.currentPageProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'clientId', {
              get: function () {
                return d(this.clientIdProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'appUserId', {
              get: function () {
                return d(this.appUserIdProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'trackingConsent', {
              get: function () {
                return d(this.trackingConsentProvider);
              },
              enumerable: !0,
              configurable: !0,
            }),
            t
          );
        })();
      e.default = new v();
    },
    function (t, e) {
      t.exports = function (t) {
        if (null == t) throw TypeError("Can't call method on " + t);
        return t;
      };
    },
    function (t, e) {
      t.exports = function (t) {
        if ('function' != typeof t)
          throw TypeError(String(t) + ' is not a function');
        return t;
      };
    },
    function (t, e, r) {
      var n,
        o,
        i,
        u = r(210),
        a = r(7),
        c = r(13),
        s = r(24),
        f = r(18),
        l = r(78),
        p = r(57),
        d = a.WeakMap;
      if (u) {
        var v = new d(),
          h = v.get,
          y = v.has,
          g = v.set;
        (n = function (t, e) {
          return g.call(v, t, e), e;
        }),
          (o = function (t) {
            return h.call(v, t) || {};
          }),
          (i = function (t) {
            return y.call(v, t);
          });
      } else {
        var b = l('state');
        (p[b] = !0),
          (n = function (t, e) {
            return s(t, b, e), e;
          }),
          (o = function (t) {
            return f(t, b) ? t[b] : {};
          }),
          (i = function (t) {
            return f(t, b);
          });
      }
      t.exports = {
        set: n,
        get: o,
        has: i,
        enforce: function (t) {
          return i(t) ? o(t) : n(t, {});
        },
        getterFor: function (t) {
          return function (e) {
            var r;
            if (!c(e) || (r = o(e)).type !== t)
              throw TypeError('Incompatible receiver, ' + t + ' required');
            return r;
          };
        },
      };
    },
    function (t, e, r) {
      var n = r(43);
      t.exports = function (t) {
        return Object(n(t));
      };
    },
    function (t, e, r) {
      var n = r(103),
        o = Math.min;
      t.exports = function (t) {
        return t > 0 ? o(n(t), 9007199254740991) : 0;
      };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e, r) {
      var n = r(85),
        o = r(66);
      t.exports = function (t) {
        return n(o(t));
      };
    },
    function (t, e, r) {
      var n,
        o,
        i,
        u = r(275),
        a = r(4),
        c = r(20),
        s = r(27),
        f = r(17),
        l = r(127),
        p = r(121),
        d = a.WeakMap;
      if (u) {
        var v = new d(),
          h = v.get,
          y = v.has,
          g = v.set;
        (n = function (t, e) {
          return g.call(v, t, e), e;
        }),
          (o = function (t) {
            return h.call(v, t) || {};
          }),
          (i = function (t) {
            return y.call(v, t);
          });
      } else {
        var b = l('state');
        (p[b] = !0),
          (n = function (t, e) {
            return s(t, b, e), e;
          }),
          (o = function (t) {
            return f(t, b) ? t[b] : {};
          }),
          (i = function (t) {
            return f(t, b);
          });
      }
      t.exports = {
        set: n,
        get: o,
        has: i,
        enforce: function (t) {
          return i(t) ? o(t) : n(t, {});
        },
        getterFor: function (t) {
          return function (e) {
            var r;
            if (!c(e) || (r = o(e)).type !== t)
              throw TypeError('Incompatible receiver, ' + t + ' required');
            return r;
          };
        },
      };
    },
    function (t, e, r) {
      var n = r(4),
        o = r(69).f,
        i = r(27),
        u = r(28),
        a = r(123),
        c = r(278),
        s = r(83);
      t.exports = function (t, e) {
        var r,
          f,
          l,
          p,
          d,
          v = t.target,
          h = t.global,
          y = t.stat;
        if ((r = h ? n : y ? n[v] || a(v, {}) : (n[v] || {}).prototype))
          for (f in e) {
            if (
              ((p = e[f]),
              (l = t.noTargetGet ? (d = o(r, f)) && d.value : r[f]),
              !s(h ? f : v + (y ? '.' : '#') + f, t.forced) && void 0 !== l)
            ) {
              if (typeof p == typeof l) continue;
              c(p, l);
            }
            (t.sham || (l && l.sham)) && i(p, 'sham', !0), u(r, f, p, t);
          }
      };
    },
    function (t, e, r) {
      var n = r(16),
        o = r(73),
        i = r(11)('species');
      t.exports = function (t, e) {
        var r,
          u = n(t).constructor;
        return void 0 === u || null == (r = n(u)[i]) ? e : o(r);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(88),
        r(189),
        (0, n(r(2)).default)(e, '__esModule', { value: !0 }),
        (e.toISOString = function (t) {
          return new Date(t).toISOString();
        }),
        (e.toDateString = function (t) {
          return t
            .toLocaleString('en-GB', { timeZone: 'UTC' })
            .replace(/,/g, '');
        }),
        (e.getTime = function () {
          return new Date().getTime();
        });
      var o = e.getTime();
      e.getUniqueTime = function () {
        var t = e.getTime();
        return (o = o >= t ? o + 1 : t);
      };
    },
    function (t, e, r) {
      var n = r(12),
        o = r(75),
        i = r(55),
        u = r(29),
        a = r(76),
        c = r(18),
        s = r(138),
        f = Object.getOwnPropertyDescriptor;
      e.f = n
        ? f
        : function (t, e) {
            if (((t = u(t)), (e = a(e, !0)), s))
              try {
                return f(t, e);
              } catch (t) {}
            if (c(t, e)) return i(!o.f.call(t, e), t[e]);
          };
    },
    function (t, e) {
      t.exports = function (t, e) {
        return {
          enumerable: !(1 & t),
          configurable: !(2 & t),
          writable: !(4 & t),
          value: e,
        };
      };
    },
    function (t, e, r) {
      var n = r(44);
      t.exports = function (t, e, r) {
        if ((n(t), void 0 === e)) return t;
        switch (r) {
          case 0:
            return function () {
              return t.call(e);
            };
          case 1:
            return function (r) {
              return t.call(e, r);
            };
          case 2:
            return function (r, n) {
              return t.call(e, r, n);
            };
          case 3:
            return function (r, n, o) {
              return t.call(e, r, n, o);
            };
        }
        return function () {
          return t.apply(e, arguments);
        };
      };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e, r) {
      var n = r(147),
        o = r(105);
      t.exports =
        Object.keys ||
        function (t) {
          return n(t, o);
        };
    },
    function (t, e, r) {
      var n = r(24);
      t.exports = function (t, e, r, o) {
        o && o.enumerable ? (t[e] = r) : n(t, e, r);
      };
    },
    function (t, e, r) {
      var n = r(35);
      t.exports =
        Array.isArray ||
        function (t) {
          return 'Array' == n(t);
        };
    },
    function (t, e, r) {
      var n = r(56),
        o = r(97),
        i = r(46),
        u = r(47),
        a = r(156),
        c = [].push,
        s = function (t) {
          var e = 1 == t,
            r = 2 == t,
            s = 3 == t,
            f = 4 == t,
            l = 6 == t,
            p = 5 == t || l;
          return function (d, v, h, y) {
            for (
              var g,
                b,
                m = i(d),
                x = o(m),
                w = n(v, h, 3),
                S = u(x.length),
                A = 0,
                E = y || a,
                T = e ? E(d, S) : r ? E(d, 0) : void 0;
              S > A;
              A++
            )
              if ((p || A in x) && ((b = w((g = x[A]), A, m)), t))
                if (e) T[A] = b;
                else if (b)
                  switch (t) {
                    case 3:
                      return !0;
                    case 5:
                      return g;
                    case 6:
                      return A;
                    case 2:
                      c.call(T, g);
                  }
                else if (f) return !1;
            return l ? -1 : s || f ? f : T;
          };
        };
      t.exports = {
        forEach: s(0),
        map: s(1),
        filter: s(2),
        some: s(3),
        every: s(4),
        find: s(5),
        findIndex: s(6),
      };
    },
    function (t, e, r) {
      var n = r(30),
        o = r(238),
        i = r(47),
        u = r(56),
        a = r(239),
        c = r(240),
        s = function (t, e) {
          (this.stopped = t), (this.result = e);
        };
      (t.exports = function (t, e, r, f, l) {
        var p,
          d,
          v,
          h,
          y,
          g,
          b,
          m = u(e, r, f ? 2 : 1);
        if (l) p = t;
        else {
          if ('function' != typeof (d = a(t)))
            throw TypeError('Target is not iterable');
          if (o(d)) {
            for (v = 0, h = i(t.length); h > v; v++)
              if (
                (y = f ? m(n((b = t[v]))[0], b[1]) : m(t[v])) &&
                y instanceof s
              )
                return y;
            return new s(!1);
          }
          p = d.call(t);
        }
        for (g = p.next; !(b = g.call(p)).done; )
          if (
            'object' == typeof (y = c(p, m, b.value, f)) &&
            y &&
            y instanceof s
          )
            return y;
        return new s(!1);
      }).stop = function (t) {
        return new s(!0, t);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(1)(r(2));
      (0, n.default)(e, '__esModule', { value: !0 });
      var o = r(19),
        i = r(130),
        u = r(23),
        a = r(89),
        c = (function () {
          function t() {}
          return (
            (0, n.default)(t, 'IS_PRODUCTION', {
              get: function () {
                return 'production' === this.ENV;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t, 'DEFAULT_LOG_LEVEL', {
              get: function () {
                return t.IS_PRODUCTION ? i.LogLevel.error : i.LogLevel.debug;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t, 'baseUrl', {
              get: function () {
                return this.baseServerUrl;
              },
              set: function (t) {
                if (!o.isUrl(t)) throw new u.SNTypeError('URL is not valid');
                this.baseServerUrl = a.removeTrailingSlash(t);
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.ENV = 'production'),
            (t.baseServerUrl = 'https://api-appsee.service-now.com'),
            (t.VERSION = '1.0.0'),
            (t.DEFAULT_CLIENT_ID = '0'),
            t
          );
        })();
      e.default = c;
    },
    function (t, e, r) {
      var n = r(16),
        o = r(272);
      t.exports =
        Object.setPrototypeOf ||
        ('__proto__' in {}
          ? (function () {
              var t,
                e = !1,
                r = {};
              try {
                (t = Object.getOwnPropertyDescriptor(
                  Object.prototype,
                  '__proto__'
                ).set).call(r, []),
                  (e = r instanceof Array);
              } catch (t) {}
              return function (r, i) {
                return n(r), o(i), e ? t.call(r, i) : (r.__proto__ = i), r;
              };
            })()
          : void 0);
    },
    function (t, e, r) {
      var n = r(171),
        o = r(122).concat('length', 'prototype');
      e.f =
        Object.getOwnPropertyNames ||
        function (t) {
          return n(t, o);
        };
    },
    function (t, e) {
      t.exports = function (t) {
        if (null == t) throw TypeError("Can't call method on " + t);
        return t;
      };
    },
    function (t, e, r) {
      var n = r(32),
        o = Math.max,
        i = Math.min;
      t.exports = function (t, e) {
        var r = n(t);
        return r < 0 ? o(r + e, 0) : i(r, e);
      };
    },
    function (t, e, r) {
      var n = r(276),
        o = r(4),
        i = function (t) {
          return 'function' == typeof t ? t : void 0;
        };
      t.exports = function (t, e) {
        return arguments.length < 2
          ? i(n[t]) || i(o[t])
          : (n[t] && n[t][e]) || (o[t] && o[t][e]);
      };
    },
    function (t, e, r) {
      var n = r(15),
        o = r(277),
        i = r(87),
        u = r(49),
        a = r(84),
        c = r(17),
        s = r(170),
        f = Object.getOwnPropertyDescriptor;
      e.f = n
        ? f
        : function (t, e) {
            if (((t = u(t)), (e = a(e, !0)), s))
              try {
                return f(t, e);
              } catch (t) {}
            if (c(t, e)) return i(!o.f.call(t, e), t[e]);
          };
    },
    function (t, e, r) {
      'use strict';
      var n = r(28),
        o = r(16),
        i = r(6),
        u = r(125),
        a = RegExp.prototype,
        c = a.toString,
        s = i(function () {
          return '/a/b' != c.call({ source: 'a', flags: 'b' });
        }),
        f = 'toString' != c.name;
      (s || f) &&
        n(
          RegExp.prototype,
          'toString',
          function () {
            var t = o(this),
              e = String(t.source),
              r = t.flags;
            return (
              '/' +
              e +
              '/' +
              String(
                void 0 === r && t instanceof RegExp && !('flags' in a)
                  ? u.call(t)
                  : r
              )
            );
          },
          { unsafe: !0 }
        );
    },
    function (t, e, r) {
      var n = r(12),
        o = r(8),
        i = r(18),
        u = Object.defineProperty,
        a = {},
        c = function (t) {
          throw t;
        };
      t.exports = function (t, e) {
        if (i(a, t)) return a[t];
        e || (e = {});
        var r = [][t],
          s = !!i(e, 'ACCESSORS') && e.ACCESSORS,
          f = i(e, 0) ? e[0] : c,
          l = i(e, 1) ? e[1] : void 0;
        return (a[t] =
          !!r &&
          !o(function () {
            if (s && !n) return !0;
            var t = { length: -1 };
            s ? u(t, 1, { enumerable: !0, get: c }) : (t[1] = 1),
              r.call(t, f, l);
          }));
      };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e) {
      t.exports = function (t) {
        if ('function' != typeof t)
          throw TypeError(String(t) + ' is not a function');
        return t;
      };
    },
    function (t, e, r) {
      var n = r(133),
        o = r(28),
        i = r(325);
      n || o(Object.prototype, 'toString', i, { unsafe: !0 });
    },
    function (t, e, r) {
      'use strict';
      var n = {}.propertyIsEnumerable,
        o = Object.getOwnPropertyDescriptor,
        i = o && !n.call({ 1: 2 }, 1);
      e.f = i
        ? function (t) {
            var e = o(this, t);
            return !!e && e.enumerable;
          }
        : n;
    },
    function (t, e, r) {
      var n = r(13);
      t.exports = function (t, e) {
        if (!n(t)) return t;
        var r, o;
        if (e && 'function' == typeof (r = t.toString) && !n((o = r.call(t))))
          return o;
        if ('function' == typeof (r = t.valueOf) && !n((o = r.call(t))))
          return o;
        if (!e && 'function' == typeof (r = t.toString) && !n((o = r.call(t))))
          return o;
        throw TypeError("Can't convert object to primitive value");
      };
    },
    function (t, e) {
      var r = 0,
        n = Math.random();
      t.exports = function (t) {
        return (
          'Symbol(' +
          String(void 0 === t ? '' : t) +
          ')_' +
          (++r + n).toString(36)
        );
      };
    },
    function (t, e, r) {
      var n = r(100),
        o = r(77),
        i = n('keys');
      t.exports = function (t) {
        return i[t] || (i[t] = o(t));
      };
    },
    function (t, e, r) {
      var n,
        o = r(30),
        i = r(213),
        u = r(105),
        a = r(57),
        c = r(150),
        s = r(98),
        f = r(78),
        l = f('IE_PROTO'),
        p = function () {},
        d = function (t) {
          return '<script>' + t + '</script>';
        },
        v = function () {
          try {
            n = document.domain && new ActiveXObject('htmlfile');
          } catch (t) {}
          var t, e;
          v = n
            ? (function (t) {
                t.write(d('')), t.close();
                var e = t.parentWindow.Object;
                return (t = null), e;
              })(n)
            : (((e = s('iframe')).style.display = 'none'),
              c.appendChild(e),
              (e.src = String('javascript:')),
              (t = e.contentWindow.document).open(),
              t.write(d('document.F=Object')),
              t.close(),
              t.F);
          for (var r = u.length; r--; ) delete v.prototype[u[r]];
          return v();
        };
      (a[l] = !0),
        (t.exports =
          Object.create ||
          function (t, e) {
            var r;
            return (
              null !== t
                ? ((p.prototype = o(t)),
                  (r = new p()),
                  (p.prototype = null),
                  (r[l] = t))
                : (r = v()),
              void 0 === e ? r : i(r, e)
            );
          });
    },
    function (t, e, r) {
      var n = r(106),
        o = r(35),
        i = r(9)('toStringTag'),
        u =
          'Arguments' ==
          o(
            (function () {
              return arguments;
            })()
          );
      t.exports = n
        ? o
        : function (t) {
            var e, r, n;
            return void 0 === t
              ? 'Undefined'
              : null === t
              ? 'Null'
              : 'string' ==
                typeof (r = (function (t, e) {
                  try {
                    return t[e];
                  } catch (t) {}
                })((e = Object(t)), i))
              ? r
              : u
              ? o(e)
              : 'Object' == (n = o(e)) && 'function' == typeof e.callee
              ? 'Arguments'
              : n;
          };
    },
    function (t, e, r) {
      r(152);
      var n = r(216),
        o = r(7),
        i = r(80),
        u = r(24),
        a = r(48),
        c = r(9)('toStringTag');
      for (var s in n) {
        var f = o[s],
          l = f && f.prototype;
        l && i(l) !== c && u(l, c, s), (a[s] = a.Array);
      }
    },
    function (t, e, r) {
      var n = r(8),
        o = r(9),
        i = r(108),
        u = o('species');
      t.exports = function (t) {
        return (
          i >= 51 ||
          !n(function () {
            var e = [];
            return (
              ((e.constructor = {})[u] = function () {
                return { foo: 1 };
              }),
              1 !== e[t](Boolean).foo
            );
          })
        );
      };
    },
    function (t, e, r) {
      var n = r(6),
        o = /#|\.prototype\./,
        i = function (t, e) {
          var r = a[u(t)];
          return r == s || (r != c && ('function' == typeof e ? n(e) : !!e));
        },
        u = (i.normalize = function (t) {
          return String(t).replace(o, '.').toLowerCase();
        }),
        a = (i.data = {}),
        c = (i.NATIVE = 'N'),
        s = (i.POLYFILL = 'P');
      t.exports = i;
    },
    function (t, e, r) {
      var n = r(20);
      t.exports = function (t, e) {
        if (!n(t)) return t;
        var r, o;
        if (e && 'function' == typeof (r = t.toString) && !n((o = r.call(t))))
          return o;
        if ('function' == typeof (r = t.valueOf) && !n((o = r.call(t))))
          return o;
        if (!e && 'function' == typeof (r = t.toString) && !n((o = r.call(t))))
          return o;
        throw TypeError("Can't convert object to primitive value");
      };
    },
    function (t, e, r) {
      var n = r(6),
        o = r(31),
        i = ''.split;
      t.exports = n(function () {
        return !Object('z').propertyIsEnumerable(0);
      })
        ? function (t) {
            return 'String' == o(t) ? i.call(t, '') : Object(t);
          }
        : Object;
    },
    function (t, e) {
      t.exports = !1;
    },
    function (t, e) {
      t.exports = function (t, e) {
        return {
          enumerable: !(1 & t),
          configurable: !(2 & t),
          writable: !(4 & t),
          value: e,
        };
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(51),
        o = r(129);
      n({ target: 'RegExp', proto: !0, forced: /./.exec !== o }, { exec: o });
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(180),
        r(319),
        r(320),
        r(322),
        r(74),
        r(88),
        r(70),
        r(189),
        r(330),
        r(337),
        r(339),
        r(340),
        r(341),
        r(342),
        r(343),
        r(344),
        r(345),
        r(346),
        r(347),
        r(348),
        r(349),
        r(352),
        r(353),
        r(354),
        r(355),
        r(356),
        r(357),
        r(358),
        r(359),
        r(360),
        r(361),
        r(362),
        (0, n(r(2)).default)(e, '__esModule', { value: !0 }),
        (e.removeTrailingSlash = function (t) {
          return t.replace(/\/+$/, '');
        });
      var o = function () {
        return [1e7, 1e3, 4e3, 8e3, 1e11]
          .join('-')
          .replace(/[018]/g, function (t) {
            return (
              Number(t) ^
              ((window.crypto
                ? 15 & window.crypto.getRandomValues(new Uint8Array(1))[0]
                : (16 * Math.random()) | 0) >>
                (Number(t) / 4))
            ).toString(16);
          });
      };
      e.getGuid = function () {
        return o().replace(/-/g, '').toLowerCase();
      };
    },
    function (t, e, r) {
      var n,
        o = r(16),
        i = r(314),
        u = r(122),
        a = r(121),
        c = r(181),
        s = r(119),
        f = r(127),
        l = f('IE_PROTO'),
        p = function () {},
        d = function (t) {
          return '<script>' + t + '</script>';
        },
        v = function () {
          try {
            n = document.domain && new ActiveXObject('htmlfile');
          } catch (t) {}
          var t, e;
          v = n
            ? (function (t) {
                t.write(d('')), t.close();
                var e = t.parentWindow.Object;
                return (t = null), e;
              })(n)
            : (((e = s('iframe')).style.display = 'none'),
              c.appendChild(e),
              (e.src = String('javascript:')),
              (t = e.contentWindow.document).open(),
              t.write(d('document.F=Object')),
              t.close(),
              t.F);
          for (var r = u.length; r--; ) delete v.prototype[u[r]];
          return v();
        };
      (a[l] = !0),
        (t.exports =
          Object.create ||
          function (t, e) {
            var r;
            return (
              null !== t
                ? ((p.prototype = o(t)),
                  (r = new p()),
                  (p.prototype = null),
                  (r[l] = t))
                : (r = v()),
              void 0 === e ? r : i(r, e)
            );
          });
    },
    function (t, e, r) {
      var n = r(17),
        o = r(33),
        i = r(127),
        u = r(318),
        a = i('IE_PROTO'),
        c = Object.prototype;
      t.exports = u
        ? Object.getPrototypeOf
        : function (t) {
            return (
              (t = o(t)),
              n(t, a)
                ? t[a]
                : 'function' == typeof t.constructor &&
                  t instanceof t.constructor
                ? t.constructor.prototype
                : t instanceof Object
                ? c
                : null
            );
          };
    },
    function (t, e, r) {
      var n = r(21).f,
        o = r(17),
        i = r(11)('toStringTag');
      t.exports = function (t, e, r) {
        t &&
          !o((t = r ? t : t.prototype), i) &&
          n(t, i, { configurable: !0, value: e });
      };
    },
    function (t, e, r) {
      var n = r(133),
        o = r(31),
        i = r(11)('toStringTag'),
        u =
          'Arguments' ==
          o(
            (function () {
              return arguments;
            })()
          );
      t.exports = n
        ? o
        : function (t) {
            var e, r, n;
            return void 0 === t
              ? 'Undefined'
              : null === t
              ? 'Null'
              : 'string' ==
                typeof (r = (function (t, e) {
                  try {
                    return t[e];
                  } catch (t) {}
                })((e = Object(t)), i))
              ? r
              : u
              ? o(e)
              : 'Object' == (n = o(e)) && 'function' == typeof e.callee
              ? 'Arguments'
              : n;
          };
    },
    function (t, e, r) {
      var n = r(73);
      t.exports = function (t, e, r) {
        if ((n(t), void 0 === e)) return t;
        switch (r) {
          case 0:
            return function () {
              return t.call(e);
            };
          case 1:
            return function (r) {
              return t.call(e, r);
            };
          case 2:
            return function (r, n) {
              return t.call(e, r, n);
            };
          case 3:
            return function (r, n, o) {
              return t.call(e, r, n, o);
            };
        }
        return function () {
          return t.apply(e, arguments);
        };
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(167)),
        i = n(r(363)),
        u = n(r(370)),
        a = n(r(377)),
        c = n(r(116)),
        s = n(r(382)),
        f = n(r(387)),
        l = n(r(391));
      (0, n(r(2)).default)(e, '__esModule', { value: !0 });
      var p = r(19);
      (e.isEmptyObject = function (t) {
        return 0 === (0, l.default)(t).length;
      }),
        (e.removeFalsyEntries = function (t) {
          var e;
          return (0, f.default)(
            (0, s.default)((e = (0, c.default)(t))).call(e, function (t) {
              var e = t[1];
              return Boolean(e);
            })
          );
        }),
        (e.mapKeys = function (t, e) {
          var r;
          return (0, f.default)(
            (0, a.default)((r = (0, c.default)(t))).call(r, function (t) {
              var r = t[0],
                n = t[1];
              return [e(n, r), n];
            })
          );
        }),
        (e.mapValues = function (t, e) {
          var r;
          return (0, f.default)(
            (0, a.default)((r = (0, c.default)(t))).call(r, function (t) {
              var r = t[0],
                n = t[1];
              return [r, e(n, r)];
            })
          );
        }),
        (e.tryGetEnumValue = function (t, e) {
          var r;
          try {
            var n,
              a = new u.default(),
              s = new u.default();
            return (
              (0, i.default)((n = (0, c.default)(e))).call(n, function (t) {
                var e = t[0],
                  r = t[1];
                p.isNumber((0, o.default)(e, 10)) || (a.set(e, r), s.set(r, r));
              }),
              null !== (r = a.get(t)) && void 0 !== r ? r : s.get(t)
            );
          } catch (t) {
            return;
          }
        }),
        (e.getValueOrDefault = function (t, e, r) {
          return r(t) ? t : e;
        }),
        (e.getValuesOrDefaults = function (t, r, n) {
          return e.mapValues(r, function (r, o) {
            return e.getValueOrDefault(t[o], r, n[o]);
          });
        });
    },
    function (t, e) {
      var r;
      r = (function () {
        return this;
      })();
      try {
        r = r || new Function('return this')();
      } catch (t) {
        'object' == typeof window && (r = window);
      }
      t.exports = r;
    },
    function (t, e, r) {
      var n = r(8),
        o = r(35),
        i = ''.split;
      t.exports = n(function () {
        return !Object('z').propertyIsEnumerable(0);
      })
        ? function (t) {
            return 'String' == o(t) ? i.call(t, '') : Object(t);
          }
        : Object;
    },
    function (t, e, r) {
      var n = r(7),
        o = r(13),
        i = n.document,
        u = o(i) && o(i.createElement);
      t.exports = function (t) {
        return u ? i.createElement(t) : {};
      };
    },
    function (t, e, r) {
      var n = r(9);
      e.f = n;
    },
    function (t, e, r) {
      var n = r(37),
        o = r(142);
      (t.exports = function (t, e) {
        return o[t] || (o[t] = void 0 !== e ? e : {});
      })('versions', []).push({
        version: '3.6.4',
        mode: n ? 'pure' : 'global',
        copyright: '© 2020 Denis Pushkarev (zloirock.ru)',
      });
    },
    function (t, e, r) {
      var n = r(8);
      t.exports =
        !!Object.getOwnPropertySymbols &&
        !n(function () {
          return !String(Symbol());
        });
    },
    function (t, e, r) {
      'use strict';
      var n = r(209).charAt,
        o = r(45),
        i = r(104),
        u = o.set,
        a = o.getterFor('String Iterator');
      i(
        String,
        'String',
        function (t) {
          u(this, { type: 'String Iterator', string: String(t), index: 0 });
        },
        function () {
          var t,
            e = a(this),
            r = e.string,
            o = e.index;
          return o >= r.length
            ? { value: void 0, done: !0 }
            : ((t = n(r, o)), (e.index += t.length), { value: t, done: !1 });
        }
      );
    },
    function (t, e) {
      var r = Math.ceil,
        n = Math.floor;
      t.exports = function (t) {
        return isNaN((t = +t)) ? 0 : (t > 0 ? n : r)(t);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(211),
        i = r(146),
        u = r(151),
        a = r(39),
        c = r(24),
        s = r(59),
        f = r(9),
        l = r(37),
        p = r(48),
        d = r(145),
        v = d.IteratorPrototype,
        h = d.BUGGY_SAFARI_ITERATORS,
        y = f('iterator'),
        g = function () {
          return this;
        };
      t.exports = function (t, e, r, f, d, b, m) {
        o(r, e, f);
        var x,
          w,
          S,
          A = function (t) {
            if (t === d && _) return _;
            if (!h && t in O) return O[t];
            switch (t) {
              case 'keys':
              case 'values':
              case 'entries':
                return function () {
                  return new r(this, t);
                };
            }
            return function () {
              return new r(this);
            };
          },
          E = e + ' Iterator',
          T = !1,
          O = t.prototype,
          P = O[y] || O['@@iterator'] || (d && O[d]),
          _ = (!h && P) || A(d),
          I = ('Array' == e && O.entries) || P;
        if (
          (I &&
            ((x = i(I.call(new t()))),
            v !== Object.prototype &&
              x.next &&
              (l ||
                i(x) === v ||
                (u ? u(x, v) : 'function' != typeof x[y] && c(x, y, g)),
              a(x, E, !0, !0),
              l && (p[E] = g))),
          'values' == d &&
            P &&
            'values' !== P.name &&
            ((T = !0),
            (_ = function () {
              return P.call(this);
            })),
          (l && !m) || O[y] === _ || c(O, y, _),
          (p[e] = _),
          d)
        )
          if (
            ((w = {
              values: A('values'),
              keys: b ? _ : A('keys'),
              entries: A('entries'),
            }),
            m)
          )
            for (S in w) (h || T || !(S in O)) && s(O, S, w[S]);
          else n({ target: e, proto: !0, forced: h || T }, w);
        return w;
      };
    },
    function (t, e) {
      t.exports = [
        'constructor',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString',
        'toString',
        'valueOf',
      ];
    },
    function (t, e, r) {
      var n = {};
      (n[r(9)('toStringTag')] = 'z'), (t.exports = '[object z]' === String(n));
    },
    function (t, e, r) {
      'use strict';
      var n = r(76),
        o = r(22),
        i = r(55);
      t.exports = function (t, e, r) {
        var u = n(e);
        u in t ? o.f(t, u, i(0, r)) : (t[u] = r);
      };
    },
    function (t, e, r) {
      var n,
        o,
        i = r(7),
        u = r(109),
        a = i.process,
        c = a && a.versions,
        s = c && c.v8;
      s
        ? (o = (n = s.split('.'))[0] + n[1])
        : u &&
          (!(n = u.match(/Edge\/(\d+)/)) || n[1] >= 74) &&
          (n = u.match(/Chrome\/(\d+)/)) &&
          (o = n[1]),
        (t.exports = o && +o);
    },
    function (t, e, r) {
      var n = r(38);
      t.exports = n('navigator', 'userAgent') || '';
    },
    function (t, e) {},
    function (t, e) {
      t.exports = function (t, e, r) {
        if (!(t instanceof e))
          throw TypeError('Incorrect ' + (r ? r + ' ' : '') + 'invocation');
        return t;
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(44),
        o = function (t) {
          var e, r;
          (this.promise = new t(function (t, n) {
            if (void 0 !== e || void 0 !== r)
              throw TypeError('Bad Promise constructor');
            (e = t), (r = n);
          })),
            (this.resolve = n(e)),
            (this.reject = n(r));
        };
      t.exports.f = function (t) {
        return new o(t);
      };
    },
    function (t, e, r) {
      var n = r(247),
        o = r(249);
      function i(e) {
        return (
          (t.exports = i =
            'function' == typeof o && 'symbol' == typeof n
              ? function (t) {
                  return typeof t;
                }
              : function (t) {
                  return t &&
                    'function' == typeof o &&
                    t.constructor === o &&
                    t !== o.prototype
                    ? 'symbol'
                    : typeof t;
                }),
          i(e)
        );
      }
      t.exports = i;
    },
    function (t, e, r) {
      t.exports = r(256);
    },
    function (t, e) {
      t.exports = '\t\n\v\f\r                　\u2028\u2029\ufeff';
    },
    function (t, e, r) {
      t.exports = r(263);
    },
    function (t, e, r) {
      t.exports = r(266);
    },
    function (t, e, r) {
      var n = r(20),
        o = r(64);
      t.exports = function (t, e, r) {
        var i, u;
        return (
          o &&
            'function' == typeof (i = e.constructor) &&
            i !== r &&
            n((u = i.prototype)) &&
            u !== r.prototype &&
            o(t, u),
          t
        );
      };
    },
    function (t, e, r) {
      var n = r(4),
        o = r(20),
        i = n.document,
        u = o(i) && o(i.createElement);
      t.exports = function (t) {
        return u ? i.createElement(t) : {};
      };
    },
    function (t, e, r) {
      var n = r(49),
        o = r(14),
        i = r(67),
        u = function (t) {
          return function (e, r, u) {
            var a,
              c = n(e),
              s = o(c.length),
              f = i(u, s);
            if (t && r != r) {
              for (; s > f; ) if ((a = c[f++]) != a) return !0;
            } else
              for (; s > f; f++)
                if ((t || f in c) && c[f] === r) return t || f || 0;
            return !t && -1;
          };
        };
      t.exports = { includes: u(!0), indexOf: u(!1) };
    },
    function (t, e) {
      t.exports = {};
    },
    function (t, e) {
      t.exports = [
        'constructor',
        'hasOwnProperty',
        'isPrototypeOf',
        'propertyIsEnumerable',
        'toLocaleString',
        'toString',
        'valueOf',
      ];
    },
    function (t, e, r) {
      var n = r(4),
        o = r(27);
      t.exports = function (t, e) {
        try {
          o(n, t, e);
        } catch (r) {
          n[t] = e;
        }
        return e;
      };
    },
    function (t, e) {
      var r = 0,
        n = Math.random();
      t.exports = function (t) {
        return (
          'Symbol(' +
          String(void 0 === t ? '' : t) +
          ')_' +
          (++r + n).toString(36)
        );
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(16);
      t.exports = function () {
        var t = n(this),
          e = '';
        return (
          t.global && (e += 'g'),
          t.ignoreCase && (e += 'i'),
          t.multiline && (e += 'm'),
          t.dotAll && (e += 's'),
          t.unicode && (e += 'u'),
          t.sticky && (e += 'y'),
          e
        );
      };
    },
    function (t, e, r) {
      var n = r(173),
        o = Function.toString;
      'function' != typeof n.inspectSource &&
        (n.inspectSource = function (t) {
          return o.call(t);
        }),
        (t.exports = n.inspectSource);
    },
    function (t, e, r) {
      var n = r(172),
        o = r(124),
        i = n('keys');
      t.exports = function (t) {
        return i[t] || (i[t] = o(t));
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(68),
        o = r(21),
        i = r(11),
        u = r(15),
        a = i('species');
      t.exports = function (t) {
        var e = n(t),
          r = o.f;
        u &&
          e &&
          !e[a] &&
          r(e, a, {
            configurable: !0,
            get: function () {
              return this;
            },
          });
      };
    },
    function (t, e, r) {
      'use strict';
      var n,
        o,
        i = r(125),
        u = r(175),
        a = RegExp.prototype.exec,
        c = String.prototype.replace,
        s = a,
        f =
          ((n = /a/),
          (o = /b*/g),
          a.call(n, 'a'),
          a.call(o, 'a'),
          0 !== n.lastIndex || 0 !== o.lastIndex),
        l = u.UNSUPPORTED_Y || u.BROKEN_CARET,
        p = void 0 !== /()??/.exec('')[1];
      (f || p || l) &&
        (s = function (t) {
          var e,
            r,
            n,
            o,
            u = this,
            s = l && u.sticky,
            d = i.call(u),
            v = u.source,
            h = 0,
            y = t;
          return (
            s &&
              (-1 === (d = d.replace('y', '')).indexOf('g') && (d += 'g'),
              (y = String(t).slice(u.lastIndex)),
              u.lastIndex > 0 &&
                (!u.multiline ||
                  (u.multiline && '\n' !== t[u.lastIndex - 1])) &&
                ((v = '(?: ' + v + ')'), (y = ' ' + y), h++),
              (r = new RegExp('^(?:' + v + ')', d))),
            p && (r = new RegExp('^' + v + '$(?!\\s)', d)),
            f && (e = u.lastIndex),
            (n = a.call(s ? r : u, y)),
            s
              ? n
                ? ((n.input = n.input.slice(h)),
                  (n[0] = n[0].slice(h)),
                  (n.index = u.lastIndex),
                  (u.lastIndex += n[0].length))
                : (u.lastIndex = 0)
              : f && n && (u.lastIndex = u.global ? n.index + n[0].length : e),
            p &&
              n &&
              n.length > 1 &&
              c.call(n[0], r, function () {
                for (o = 1; o < arguments.length - 2; o++)
                  void 0 === arguments[o] && (n[o] = void 0);
              }),
            n
          );
        }),
        (t.exports = s);
    },
    function (t, e, r) {
      'use strict';
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 }),
        (function (t) {
          (t[(t.debug = 0)] = 'debug'),
            (t[(t.info = 1)] = 'info'),
            (t[(t.warn = 2)] = 'warn'),
            (t[(t.error = 3)] = 'error');
        })(e.LogLevel || (e.LogLevel = {}));
    },
    function (t, e, r) {
      var n = r(15),
        o = r(21).f,
        i = Function.prototype,
        u = i.toString,
        a = /^\s*function ([^ (]*)/;
      n &&
        !('name' in i) &&
        o(i, 'name', {
          configurable: !0,
          get: function () {
            try {
              return u.call(this).match(a)[1];
            } catch (t) {
              return '';
            }
          },
        });
    },
    function (t, e) {
      t.exports = function (t, e, r) {
        if (!(t instanceof e))
          throw TypeError('Incorrect ' + (r ? r + ' ' : '') + 'invocation');
        return t;
      };
    },
    function (t, e, r) {
      var n = {};
      (n[r(11)('toStringTag')] = 'z'), (t.exports = '[object z]' === String(n));
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(74), r(70);
      var o = function (t) {
        return t && t.__esModule ? t : { default: t };
      };
      (0, n(r(2)).default)(e, '__esModule', { value: !0 });
      var i = o(r(25)),
        u = r(19),
        a = function (t, e, r, n, o) {
          if (u.isFunction(r) && n instanceof e) return r(n, t, o.toString());
          throw n;
        };
      (e.Catch = function (t, e) {
        return function (r, n, o) {
          var i = o.value;
          return (
            (o.value = function () {
              for (var r = this, o = [], c = 0; c < arguments.length; c++)
                o[c] = arguments[c];
              try {
                var s = i.apply(this, o);
                return u.isPromise(s)
                  ? s.catch(function (o) {
                      return a(r, t, e, o, n);
                    })
                  : s;
              } catch (r) {
                return a(this, t, e, r, n);
              }
            }),
            o
          );
        };
      }),
        (e.CatchAllAndReturn = function (t) {
          return e.Catch(Error, function (e, r, n) {
            return (
              i.default.error(
                'Fatal error in SNAnalytics:' + n + '.',
                e.message
              ),
              t
            );
          });
        }),
        (e.CatchAll = e.CatchAllAndReturn(void 0));
    },
    function (t, e, r) {
      t.exports = r(396);
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(74), r(70);
      var o = n(r(116)),
        i = n(r(406)),
        u = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, n(r(2)).default)(e, '__esModule', { value: !0 });
      var a = r(19),
        c = u(r(25)),
        s = r(53);
      (e.addSystemPropertyPrefix = function (t) {
        return 'SN_' + t;
      }),
        (e.isSystemPropertyKey = function (t) {
          return (0, i.default)(t).call(t, 'SN_');
        });
      var f = function (t, e) {
          return (
            null === t ||
            (a.isArray(t)
              ? e
              : a.isNumber(t)
              ? t !== 1 / 0 && t !== -1 / 0
              : a.isString(t) || a.isDate(t) || a.isBoolean(t))
          );
        },
        l = function (t) {
          return a.isDate(t)
            ? s.toDateString(t)
            : a.isBoolean(t)
            ? t.toString()
            : t;
        };
      e.getValidProperties = function (t, r, n) {
        for (var i = {}, u = 0, s = (0, o.default)(t); u < s.length; u++) {
          var p = s[u],
            d = p[0],
            v = p[1];
          if (a.isNonEmptyString(d))
            if (e.isSystemPropertyKey(d))
              c.default.error('Invalid property prefix for name:', d);
            else if (f((v = null != v ? v : n ? null : ''), r))
              if (a.isArray(v)) {
                for (var h = [], y = 0, g = v; y < g.length; y++) {
                  var b = g[y];
                  a.isString(b)
                    ? h.push(b)
                    : c.default.error('Invalid value', b, 'for list', d);
                }
                i[d] = h;
              } else i[d] = l(v);
            else c.default.error('Invalid value', v, 'for property', d);
          else c.default.error('Invalid property name:', d);
        }
        return i;
      };
    },
    function (t, e, r) {
      t.exports = r(413);
    },
    function (t, e, r) {
      var n = r(12),
        o = r(8),
        i = r(98);
      t.exports =
        !n &&
        !o(function () {
          return (
            7 !=
            Object.defineProperty(i('div'), 'a', {
              get: function () {
                return 7;
              },
            }).a
          );
        });
    },
    function (t, e, r) {
      var n = r(8),
        o = /#|\.prototype\./,
        i = function (t, e) {
          var r = a[u(t)];
          return r == s || (r != c && ('function' == typeof e ? n(e) : !!e));
        },
        u = (i.normalize = function (t) {
          return String(t).replace(o, '.').toLowerCase();
        }),
        a = (i.data = {}),
        c = (i.NATIVE = 'N'),
        s = (i.POLYFILL = 'P');
      t.exports = i;
    },
    function (t, e, r) {
      r(141), r(102), r(81);
      var n = r(99);
      t.exports = n.f('iterator');
    },
    function (t, e, r) {
      r(10)('iterator');
    },
    function (t, e, r) {
      var n = r(7),
        o = r(208),
        i = n['__core-js_shared__'] || o('__core-js_shared__', {});
      t.exports = i;
    },
    function (t, e, r) {
      var n = r(101);
      t.exports = n && !Symbol.sham && 'symbol' == typeof Symbol.iterator;
    },
    function (t, e, r) {
      var n = r(142),
        o = Function.toString;
      'function' != typeof n.inspectSource &&
        (n.inspectSource = function (t) {
          return o.call(t);
        }),
        (t.exports = n.inspectSource);
    },
    function (t, e, r) {
      'use strict';
      var n,
        o,
        i,
        u = r(146),
        a = r(24),
        c = r(18),
        s = r(9),
        f = r(37),
        l = s('iterator'),
        p = !1;
      [].keys &&
        ('next' in (i = [].keys())
          ? (o = u(u(i))) !== Object.prototype && (n = o)
          : (p = !0)),
        null == n && (n = {}),
        f ||
          c(n, l) ||
          a(n, l, function () {
            return this;
          }),
        (t.exports = { IteratorPrototype: n, BUGGY_SAFARI_ITERATORS: p });
    },
    function (t, e, r) {
      var n = r(18),
        o = r(46),
        i = r(78),
        u = r(212),
        a = i('IE_PROTO'),
        c = Object.prototype;
      t.exports = u
        ? Object.getPrototypeOf
        : function (t) {
            return (
              (t = o(t)),
              n(t, a)
                ? t[a]
                : 'function' == typeof t.constructor &&
                  t instanceof t.constructor
                ? t.constructor.prototype
                : t instanceof Object
                ? c
                : null
            );
          };
    },
    function (t, e, r) {
      var n = r(18),
        o = r(29),
        i = r(148).indexOf,
        u = r(57);
      t.exports = function (t, e) {
        var r,
          a = o(t),
          c = 0,
          s = [];
        for (r in a) !n(u, r) && n(a, r) && s.push(r);
        for (; e.length > c; ) n(a, (r = e[c++])) && (~i(s, r) || s.push(r));
        return s;
      };
    },
    function (t, e, r) {
      var n = r(29),
        o = r(47),
        i = r(149),
        u = function (t) {
          return function (e, r, u) {
            var a,
              c = n(e),
              s = o(c.length),
              f = i(u, s);
            if (t && r != r) {
              for (; s > f; ) if ((a = c[f++]) != a) return !0;
            } else
              for (; s > f; f++)
                if ((t || f in c) && c[f] === r) return t || f || 0;
            return !t && -1;
          };
        };
      t.exports = { includes: u(!0), indexOf: u(!1) };
    },
    function (t, e, r) {
      var n = r(103),
        o = Math.max,
        i = Math.min;
      t.exports = function (t, e) {
        var r = n(t);
        return r < 0 ? o(r + e, 0) : i(r, e);
      };
    },
    function (t, e, r) {
      var n = r(38);
      t.exports = n('document', 'documentElement');
    },
    function (t, e, r) {
      var n = r(30),
        o = r(215);
      t.exports =
        Object.setPrototypeOf ||
        ('__proto__' in {}
          ? (function () {
              var t,
                e = !1,
                r = {};
              try {
                (t = Object.getOwnPropertyDescriptor(
                  Object.prototype,
                  '__proto__'
                ).set).call(r, []),
                  (e = r instanceof Array);
              } catch (t) {}
              return function (r, i) {
                return n(r), o(i), e ? t.call(r, i) : (r.__proto__ = i), r;
              };
            })()
          : void 0);
    },
    function (t, e, r) {
      'use strict';
      var n = r(29),
        o = r(153),
        i = r(48),
        u = r(45),
        a = r(104),
        c = u.set,
        s = u.getterFor('Array Iterator');
      (t.exports = a(
        Array,
        'Array',
        function (t, e) {
          c(this, { type: 'Array Iterator', target: n(t), index: 0, kind: e });
        },
        function () {
          var t = s(this),
            e = t.target,
            r = t.kind,
            n = t.index++;
          return !e || n >= e.length
            ? ((t.target = void 0), { value: void 0, done: !0 })
            : 'keys' == r
            ? { value: n, done: !1 }
            : 'values' == r
            ? { value: e[n], done: !1 }
            : { value: [n, e[n]], done: !1 };
        },
        'values'
      )),
        (i.Arguments = i.Array),
        o('keys'),
        o('values'),
        o('entries');
    },
    function (t, e) {
      t.exports = function () {};
    },
    function (t, e, r) {
      r(155),
        r(110),
        r(218),
        r(220),
        r(221),
        r(222),
        r(223),
        r(141),
        r(224),
        r(225),
        r(226),
        r(227),
        r(228),
        r(229),
        r(230),
        r(231),
        r(232),
        r(233),
        r(234);
      var n = r(5);
      t.exports = n.Symbol;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(8),
        i = r(60),
        u = r(13),
        a = r(46),
        c = r(47),
        s = r(107),
        f = r(156),
        l = r(82),
        p = r(9),
        d = r(108),
        v = p('isConcatSpreadable'),
        h =
          d >= 51 ||
          !o(function () {
            var t = [];
            return (t[v] = !1), t.concat()[0] !== t;
          }),
        y = l('concat'),
        g = function (t) {
          if (!u(t)) return !1;
          var e = t[v];
          return void 0 !== e ? !!e : i(t);
        };
      n(
        { target: 'Array', proto: !0, forced: !h || !y },
        {
          concat: function (t) {
            var e,
              r,
              n,
              o,
              i,
              u = a(this),
              l = f(u, 0),
              p = 0;
            for (e = -1, n = arguments.length; e < n; e++)
              if (g((i = -1 === e ? u : arguments[e]))) {
                if (p + (o = c(i.length)) > 9007199254740991)
                  throw TypeError('Maximum allowed index exceeded');
                for (r = 0; r < o; r++, p++) r in i && s(l, p, i[r]);
              } else {
                if (p >= 9007199254740991)
                  throw TypeError('Maximum allowed index exceeded');
                s(l, p++, i);
              }
            return (l.length = p), l;
          },
        }
      );
    },
    function (t, e, r) {
      var n = r(13),
        o = r(60),
        i = r(9)('species');
      t.exports = function (t, e) {
        var r;
        return (
          o(t) &&
            ('function' != typeof (r = t.constructor) ||
            (r !== Array && !o(r.prototype))
              ? n(r) && null === (r = r[i]) && (r = void 0)
              : (r = void 0)),
          new (void 0 === r ? Array : r)(0 === e ? 0 : e)
        );
      };
    },
    function (t, e, r) {
      var n = r(147),
        o = r(105).concat('length', 'prototype');
      e.f =
        Object.getOwnPropertyNames ||
        function (t) {
          return n(t, o);
        };
    },
    function (t, e) {
      e.f = Object.getOwnPropertySymbols;
    },
    function (t, e, r) {
      var n = r(7);
      t.exports = n.Promise;
    },
    function (t, e, r) {
      var n = r(59);
      t.exports = function (t, e, r) {
        for (var o in e)
          r && r.unsafe && t[o] ? (t[o] = e[o]) : n(t, o, e[o], r);
        return t;
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(38),
        o = r(22),
        i = r(9),
        u = r(12),
        a = i('species');
      t.exports = function (t) {
        var e = n(t),
          r = o.f;
        u &&
          e &&
          !e[a] &&
          r(e, a, {
            configurable: !0,
            get: function () {
              return this;
            },
          });
      };
    },
    function (t, e, r) {
      var n = r(30),
        o = r(44),
        i = r(9)('species');
      t.exports = function (t, e) {
        var r,
          u = n(t).constructor;
        return void 0 === u || null == (r = n(u)[i]) ? e : o(r);
      };
    },
    function (t, e, r) {
      var n,
        o,
        i,
        u = r(7),
        a = r(8),
        c = r(35),
        s = r(56),
        f = r(150),
        l = r(98),
        p = r(164),
        d = u.location,
        v = u.setImmediate,
        h = u.clearImmediate,
        y = u.process,
        g = u.MessageChannel,
        b = u.Dispatch,
        m = 0,
        x = {},
        w = function (t) {
          if (x.hasOwnProperty(t)) {
            var e = x[t];
            delete x[t], e();
          }
        },
        S = function (t) {
          return function () {
            w(t);
          };
        },
        A = function (t) {
          w(t.data);
        },
        E = function (t) {
          u.postMessage(t + '', d.protocol + '//' + d.host);
        };
      (v && h) ||
        ((v = function (t) {
          for (var e = [], r = 1; arguments.length > r; )
            e.push(arguments[r++]);
          return (
            (x[++m] = function () {
              ('function' == typeof t ? t : Function(t)).apply(void 0, e);
            }),
            n(m),
            m
          );
        }),
        (h = function (t) {
          delete x[t];
        }),
        'process' == c(y)
          ? (n = function (t) {
              y.nextTick(S(t));
            })
          : b && b.now
          ? (n = function (t) {
              b.now(S(t));
            })
          : g && !p
          ? ((i = (o = new g()).port2),
            (o.port1.onmessage = A),
            (n = s(i.postMessage, i, 1)))
          : !u.addEventListener ||
            'function' != typeof postMessage ||
            u.importScripts ||
            a(E) ||
            'file:' === d.protocol
          ? (n =
              'onreadystatechange' in l('script')
                ? function (t) {
                    f.appendChild(l('script')).onreadystatechange =
                      function () {
                        f.removeChild(this), w(t);
                      };
                  }
                : function (t) {
                    setTimeout(S(t), 0);
                  })
          : ((n = E), u.addEventListener('message', A, !1))),
        (t.exports = { set: v, clear: h });
    },
    function (t, e, r) {
      var n = r(109);
      t.exports = /(iphone|ipod|ipad).*applewebkit/i.test(n);
    },
    function (t, e, r) {
      var n = r(30),
        o = r(13),
        i = r(112);
      t.exports = function (t, e) {
        if ((n(t), o(e) && e.constructor === t)) return e;
        var r = i.f(t);
        return (0, r.resolve)(e), r.promise;
      };
    },
    function (t, e) {
      t.exports = function (t) {
        try {
          return { error: !1, value: t() };
        } catch (t) {
          return { error: !0, value: t };
        }
      };
    },
    function (t, e, r) {
      t.exports = r(259);
    },
    function (t, e, r) {
      var n = r(43),
        o = '[' + r(115) + ']',
        i = RegExp('^' + o + o + '*'),
        u = RegExp(o + o + '*$'),
        a = function (t) {
          return function (e) {
            var r = String(n(e));
            return (
              1 & t && (r = r.replace(i, '')),
              2 & t && (r = r.replace(u, '')),
              r
            );
          };
        };
      t.exports = { start: a(1), end: a(2), trim: a(3) };
    },
    function (t, e, r) {
      var n = r(12),
        o = r(58),
        i = r(29),
        u = r(75).f,
        a = function (t) {
          return function (e) {
            for (
              var r, a = i(e), c = o(a), s = c.length, f = 0, l = [];
              s > f;

            )
              (r = c[f++]),
                (n && !u.call(a, r)) || l.push(t ? [r, a[r]] : a[r]);
            return l;
          };
        };
      t.exports = { entries: a(!0), values: a(!1) };
    },
    function (t, e, r) {
      var n = r(15),
        o = r(6),
        i = r(119);
      t.exports =
        !n &&
        !o(function () {
          return (
            7 !=
            Object.defineProperty(i('div'), 'a', {
              get: function () {
                return 7;
              },
            }).a
          );
        });
    },
    function (t, e, r) {
      var n = r(17),
        o = r(49),
        i = r(120).indexOf,
        u = r(121);
      t.exports = function (t, e) {
        var r,
          a = o(t),
          c = 0,
          s = [];
        for (r in a) !n(u, r) && n(a, r) && s.push(r);
        for (; e.length > c; ) n(a, (r = e[c++])) && (~i(s, r) || s.push(r));
        return s;
      };
    },
    function (t, e, r) {
      var n = r(86),
        o = r(173);
      (t.exports = function (t, e) {
        return o[t] || (o[t] = void 0 !== e ? e : {});
      })('versions', []).push({
        version: '3.6.5',
        mode: n ? 'pure' : 'global',
        copyright: '© 2020 Denis Pushkarev (zloirock.ru)',
      });
    },
    function (t, e, r) {
      var n = r(4),
        o = r(123),
        i = n['__core-js_shared__'] || o('__core-js_shared__', {});
      t.exports = i;
    },
    function (t, e, r) {
      var n = r(6);
      t.exports =
        !!Object.getOwnPropertySymbols &&
        !n(function () {
          return !String(Symbol());
        });
    },
    function (t, e, r) {
      'use strict';
      var n = r(6);
      function o(t, e) {
        return RegExp(t, e);
      }
      (e.UNSUPPORTED_Y = n(function () {
        var t = o('a', 'y');
        return (t.lastIndex = 2), null != t.exec('abcd');
      })),
        (e.BROKEN_CARET = n(function () {
          var t = o('^r', 'gy');
          return (t.lastIndex = 2), null != t.exec('str');
        }));
    },
    function (t, e, r) {
      var n = r(292);
      t.exports = function (t) {
        if (n(t))
          throw TypeError("The method doesn't accept regular expressions");
        return t;
      };
    },
    function (t, e, r) {
      var n = r(9)('match');
      t.exports = function (t) {
        var e = /./;
        try {
          '/./'[t](e);
        } catch (r) {
          try {
            return (e[n] = !1), '/./'[t](e);
          } catch (t) {}
        }
        return !1;
      };
    },
    function (t, e, r) {
      t.exports = r(307);
    },
    function (t, e, r) {
      t.exports = r(310);
    },
    function (t, e, r) {
      'use strict';
      var n = r(49),
        o = r(313),
        i = r(72),
        u = r(50),
        a = r(316),
        c = u.set,
        s = u.getterFor('Array Iterator');
      (t.exports = a(
        Array,
        'Array',
        function (t, e) {
          c(this, { type: 'Array Iterator', target: n(t), index: 0, kind: e });
        },
        function () {
          var t = s(this),
            e = t.target,
            r = t.kind,
            n = t.index++;
          return !e || n >= e.length
            ? ((t.target = void 0), { value: void 0, done: !0 })
            : 'keys' == r
            ? { value: n, done: !1 }
            : 'values' == r
            ? { value: e[n], done: !1 }
            : { value: [n, e[n]], done: !1 };
        },
        'values'
      )),
        (i.Arguments = i.Array),
        o('keys'),
        o('values'),
        o('entries');
    },
    function (t, e, r) {
      var n = r(68);
      t.exports = n('document', 'documentElement');
    },
    function (t, e, r) {
      'use strict';
      var n,
        o,
        i,
        u = r(91),
        a = r(27),
        c = r(17),
        s = r(11),
        f = r(86),
        l = s('iterator'),
        p = !1;
      [].keys &&
        ('next' in (i = [].keys())
          ? (o = u(u(i))) !== Object.prototype && (n = o)
          : (p = !0)),
        null == n && (n = {}),
        f ||
          c(n, l) ||
          a(n, l, function () {
            return this;
          }),
        (t.exports = { IteratorPrototype: n, BUGGY_SAFARI_ITERATORS: p });
    },
    function (t, e, r) {
      'use strict';
      var n = r(6);
      t.exports = function (t, e) {
        var r = [][t];
        return (
          !!r &&
          n(function () {
            r.call(
              null,
              e ||
                function () {
                  throw 1;
                },
              1
            );
          })
        );
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(4),
        o = r(15),
        i = r(185),
        u = r(27),
        a = r(186),
        c = r(6),
        s = r(132),
        f = r(32),
        l = r(14),
        p = r(187),
        d = r(321),
        v = r(91),
        h = r(64),
        y = r(65).f,
        g = r(21).f,
        b = r(188),
        m = r(92),
        x = r(50),
        w = x.get,
        S = x.set,
        A = n.ArrayBuffer,
        E = A,
        T = n.DataView,
        O = T && T.prototype,
        P = Object.prototype,
        _ = n.RangeError,
        I = d.pack,
        j = d.unpack,
        R = function (t) {
          return [255 & t];
        },
        C = function (t) {
          return [255 & t, (t >> 8) & 255];
        },
        k = function (t) {
          return [255 & t, (t >> 8) & 255, (t >> 16) & 255, (t >> 24) & 255];
        },
        L = function (t) {
          return (t[3] << 24) | (t[2] << 16) | (t[1] << 8) | t[0];
        },
        M = function (t) {
          return I(t, 23, 4);
        },
        N = function (t) {
          return I(t, 52, 8);
        },
        D = function (t, e) {
          g(t.prototype, e, {
            get: function () {
              return w(this)[e];
            },
          });
        },
        U = function (t, e, r, n) {
          var o = p(r),
            i = w(t);
          if (o + e > i.byteLength) throw _('Wrong index');
          var u = w(i.buffer).bytes,
            a = o + i.byteOffset,
            c = u.slice(a, a + e);
          return n ? c : c.reverse();
        },
        F = function (t, e, r, n, o, i) {
          var u = p(r),
            a = w(t);
          if (u + e > a.byteLength) throw _('Wrong index');
          for (
            var c = w(a.buffer).bytes, s = u + a.byteOffset, f = n(+o), l = 0;
            l < e;
            l++
          )
            c[s + l] = f[i ? l : e - l - 1];
        };
      if (i) {
        if (
          !c(function () {
            A(1);
          }) ||
          !c(function () {
            new A(-1);
          }) ||
          c(function () {
            return new A(), new A(1.5), new A(NaN), 'ArrayBuffer' != A.name;
          })
        ) {
          for (
            var B,
              G = ((E = function (t) {
                return s(this, E), new A(p(t));
              }).prototype = A.prototype),
              W = y(A),
              H = 0;
            W.length > H;

          )
            (B = W[H++]) in E || u(E, B, A[B]);
          G.constructor = E;
        }
        h && v(O) !== P && h(O, P);
        var V = new T(new E(2)),
          K = O.setInt8;
        V.setInt8(0, 2147483648),
          V.setInt8(1, 2147483649),
          (!V.getInt8(0) && V.getInt8(1)) ||
            a(
              O,
              {
                setInt8: function (t, e) {
                  K.call(this, t, (e << 24) >> 24);
                },
                setUint8: function (t, e) {
                  K.call(this, t, (e << 24) >> 24);
                },
              },
              { unsafe: !0 }
            );
      } else
        (E = function (t) {
          s(this, E, 'ArrayBuffer');
          var e = p(t);
          S(this, { bytes: b.call(new Array(e), 0), byteLength: e }),
            o || (this.byteLength = e);
        }),
          (T = function (t, e, r) {
            s(this, T, 'DataView'), s(t, E, 'DataView');
            var n = w(t).byteLength,
              i = f(e);
            if (i < 0 || i > n) throw _('Wrong offset');
            if (i + (r = void 0 === r ? n - i : l(r)) > n)
              throw _('Wrong length');
            S(this, { buffer: t, byteLength: r, byteOffset: i }),
              o ||
                ((this.buffer = t),
                (this.byteLength = r),
                (this.byteOffset = i));
          }),
          o &&
            (D(E, 'byteLength'),
            D(T, 'buffer'),
            D(T, 'byteLength'),
            D(T, 'byteOffset')),
          a(T.prototype, {
            getInt8: function (t) {
              return (U(this, 1, t)[0] << 24) >> 24;
            },
            getUint8: function (t) {
              return U(this, 1, t)[0];
            },
            getInt16: function (t) {
              var e = U(
                this,
                2,
                t,
                arguments.length > 1 ? arguments[1] : void 0
              );
              return (((e[1] << 8) | e[0]) << 16) >> 16;
            },
            getUint16: function (t) {
              var e = U(
                this,
                2,
                t,
                arguments.length > 1 ? arguments[1] : void 0
              );
              return (e[1] << 8) | e[0];
            },
            getInt32: function (t) {
              return L(
                U(this, 4, t, arguments.length > 1 ? arguments[1] : void 0)
              );
            },
            getUint32: function (t) {
              return (
                L(
                  U(this, 4, t, arguments.length > 1 ? arguments[1] : void 0)
                ) >>> 0
              );
            },
            getFloat32: function (t) {
              return j(
                U(this, 4, t, arguments.length > 1 ? arguments[1] : void 0),
                23
              );
            },
            getFloat64: function (t) {
              return j(
                U(this, 8, t, arguments.length > 1 ? arguments[1] : void 0),
                52
              );
            },
            setInt8: function (t, e) {
              F(this, 1, t, R, e);
            },
            setUint8: function (t, e) {
              F(this, 1, t, R, e);
            },
            setInt16: function (t, e) {
              F(this, 2, t, C, e, arguments.length > 2 ? arguments[2] : void 0);
            },
            setUint16: function (t, e) {
              F(this, 2, t, C, e, arguments.length > 2 ? arguments[2] : void 0);
            },
            setInt32: function (t, e) {
              F(this, 4, t, k, e, arguments.length > 2 ? arguments[2] : void 0);
            },
            setUint32: function (t, e) {
              F(this, 4, t, k, e, arguments.length > 2 ? arguments[2] : void 0);
            },
            setFloat32: function (t, e) {
              F(this, 4, t, M, e, arguments.length > 2 ? arguments[2] : void 0);
            },
            setFloat64: function (t, e) {
              F(this, 8, t, N, e, arguments.length > 2 ? arguments[2] : void 0);
            },
          });
      m(E, 'ArrayBuffer'),
        m(T, 'DataView'),
        (t.exports = { ArrayBuffer: E, DataView: T });
    },
    function (t, e) {
      t.exports =
        'undefined' != typeof ArrayBuffer && 'undefined' != typeof DataView;
    },
    function (t, e, r) {
      var n = r(28);
      t.exports = function (t, e, r) {
        for (var o in e) n(t, o, e[o], r);
        return t;
      };
    },
    function (t, e, r) {
      var n = r(32),
        o = r(14);
      t.exports = function (t) {
        if (void 0 === t) return 0;
        var e = n(t),
          r = o(e);
        if (e !== r) throw RangeError('Wrong length or index');
        return r;
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(33),
        o = r(67),
        i = r(14);
      t.exports = function (t) {
        for (
          var e = n(this),
            r = i(e.length),
            u = arguments.length,
            a = o(u > 1 ? arguments[1] : void 0, r),
            c = u > 2 ? arguments[2] : void 0,
            s = void 0 === c ? r : o(c, r);
          s > a;

        )
          e[a++] = t;
        return e;
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(326),
        o = r(16),
        i = r(33),
        u = r(14),
        a = r(32),
        c = r(66),
        s = r(327),
        f = r(329),
        l = Math.max,
        p = Math.min,
        d = Math.floor,
        v = /\$([$&'`]|\d\d?|<[^>]*>)/g,
        h = /\$([$&'`]|\d\d?)/g;
      n('replace', 2, function (t, e, r, n) {
        var y = n.REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE,
          g = n.REPLACE_KEEPS_$0,
          b = y ? '$' : '$0';
        return [
          function (r, n) {
            var o = c(this),
              i = null == r ? void 0 : r[t];
            return void 0 !== i ? i.call(r, o, n) : e.call(String(o), r, n);
          },
          function (t, n) {
            if ((!y && g) || ('string' == typeof n && -1 === n.indexOf(b))) {
              var i = r(e, t, this, n);
              if (i.done) return i.value;
            }
            var c = o(t),
              d = String(this),
              v = 'function' == typeof n;
            v || (n = String(n));
            var h = c.global;
            if (h) {
              var x = c.unicode;
              c.lastIndex = 0;
            }
            for (var w = []; ; ) {
              var S = f(c, d);
              if (null === S) break;
              if ((w.push(S), !h)) break;
              '' === String(S[0]) && (c.lastIndex = s(d, u(c.lastIndex), x));
            }
            for (var A, E = '', T = 0, O = 0; O < w.length; O++) {
              S = w[O];
              for (
                var P = String(S[0]),
                  _ = l(p(a(S.index), d.length), 0),
                  I = [],
                  j = 1;
                j < S.length;
                j++
              )
                I.push(void 0 === (A = S[j]) ? A : String(A));
              var R = S.groups;
              if (v) {
                var C = [P].concat(I, _, d);
                void 0 !== R && C.push(R);
                var k = String(n.apply(void 0, C));
              } else k = m(P, d, _, I, R, n);
              _ >= T && ((E += d.slice(T, _) + k), (T = _ + P.length));
            }
            return E + d.slice(T);
          },
        ];
        function m(t, r, n, o, u, a) {
          var c = n + t.length,
            s = o.length,
            f = h;
          return (
            void 0 !== u && ((u = i(u)), (f = v)),
            e.call(a, f, function (e, i) {
              var a;
              switch (i.charAt(0)) {
                case '$':
                  return '$';
                case '&':
                  return t;
                case '`':
                  return r.slice(0, n);
                case "'":
                  return r.slice(c);
                case '<':
                  a = u[i.slice(1, -1)];
                  break;
                default:
                  var f = +i;
                  if (0 === f) return e;
                  if (f > s) {
                    var l = d(f / 10);
                    return 0 === l
                      ? e
                      : l <= s
                      ? void 0 === o[l - 1]
                        ? i.charAt(1)
                        : o[l - 1] + i.charAt(1)
                      : e;
                  }
                  a = o[f - 1];
              }
              return void 0 === a ? '' : a;
            })
          );
        }
      });
    },
    function (t, e, r) {
      var n = r(11)('iterator'),
        o = !1;
      try {
        var i = 0,
          u = {
            next: function () {
              return { done: !!i++ };
            },
            return: function () {
              o = !0;
            },
          };
        (u[n] = function () {
          return this;
        }),
          Array.from(u, function () {
            throw 2;
          });
      } catch (t) {}
      t.exports = function (t, e) {
        if (!e && !o) return !1;
        var r = !1;
        try {
          var i = {};
          (i[n] = function () {
            return {
              next: function () {
                return { done: (r = !0) };
              },
            };
          }),
            t(i);
        } catch (t) {}
        return r;
      };
    },
    function (t, e, r) {
      var n = r(333);
      t.exports = function (t, e) {
        var r = n(t);
        if (r % e) throw RangeError('Wrong offset');
        return r;
      };
    },
    function (t, e, r) {
      var n = r(93),
        o = r(72),
        i = r(11)('iterator');
      t.exports = function (t) {
        if (null != t) return t[i] || t['@@iterator'] || o[n(t)];
      };
    },
    function (t, e, r) {
      var n = r(11),
        o = r(72),
        i = n('iterator'),
        u = Array.prototype;
      t.exports = function (t) {
        return void 0 !== t && (o.Array === t || u[i] === t);
      };
    },
    function (t, e, r) {
      var n = r(73),
        o = r(33),
        i = r(85),
        u = r(14),
        a = function (t) {
          return function (e, r, a, c) {
            n(r);
            var s = o(e),
              f = i(s),
              l = u(s.length),
              p = t ? l - 1 : 0,
              d = t ? -1 : 1;
            if (a < 2)
              for (;;) {
                if (p in f) {
                  (c = f[p]), (p += d);
                  break;
                }
                if (((p += d), t ? p < 0 : l <= p))
                  throw TypeError(
                    'Reduce of empty array with no initial value'
                  );
              }
            for (; t ? p >= 0 : l > p; p += d) p in f && (c = r(c, f[p], p, s));
            return c;
          };
        };
      t.exports = { left: a(!1), right: a(!0) };
    },
    function (t, e, r) {
      var n = r(57),
        o = r(13),
        i = r(18),
        u = r(22).f,
        a = r(77),
        c = r(375),
        s = a('meta'),
        f = 0,
        l =
          Object.isExtensible ||
          function () {
            return !0;
          },
        p = function (t) {
          u(t, s, { value: { objectID: 'O' + ++f, weakData: {} } });
        },
        d = (t.exports = {
          REQUIRED: !1,
          fastKey: function (t, e) {
            if (!o(t))
              return 'symbol' == typeof t
                ? t
                : ('string' == typeof t ? 'S' : 'P') + t;
            if (!i(t, s)) {
              if (!l(t)) return 'F';
              if (!e) return 'E';
              p(t);
            }
            return t[s].objectID;
          },
          getWeakData: function (t, e) {
            if (!i(t, s)) {
              if (!l(t)) return !0;
              if (!e) return !1;
              p(t);
            }
            return t[s].weakData;
          },
          onFreeze: function (t) {
            return c && d.REQUIRED && l(t) && !i(t, s) && p(t), t;
          },
        });
      n[s] = !0;
    },
    function (t, e, r) {
      t.exports = r(401);
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(36)),
        i = n(r(40)),
        u = n(r(41)),
        a = n(r(2)),
        c = n(r(113)),
        s = n(r(114)),
        f = function (t, e, r, n) {
          var o,
            i = arguments.length,
            u = i < 3 ? e : null === n ? (n = (0, s.default)(e, r)) : n;
          if (
            'object' ===
              ('undefined' == typeof Reflect
                ? 'undefined'
                : (0, c.default)(Reflect)) &&
            'function' == typeof Reflect.decorate
          )
            u = Reflect.decorate(t, e, r, n);
          else
            for (var f = t.length - 1; f >= 0; f--)
              (o = t[f]) &&
                (u = (i < 3 ? o(u) : i > 3 ? o(e, r, u) : o(e, r)) || u);
          return i > 3 && u && (0, a.default)(e, r, u), u;
        },
        l = function (t, e, r, n) {
          return new (r || (r = u.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        p = function (t, e) {
          var r,
            n,
            u,
            a,
            c = {
              label: 0,
              sent: function () {
                if (1 & u[0]) throw u[1];
                return u[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (a = { next: s(0), throw: s(1), return: s(2) }),
            'function' == typeof i.default &&
              (a[o.default] = function () {
                return this;
              }),
            a
          );
          function s(o) {
            return function (i) {
              return (function (o) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; c; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (u =
                          2 & o[0]
                            ? n.return
                            : o[0]
                            ? n.throw || ((u = n.return) && u.call(n), 0)
                            : n.next) &&
                        !(u = u.call(n, o[1])).done)
                    )
                      return u;
                    switch (((n = 0), u && (o = [2 & o[0], u.value]), o[0])) {
                      case 0:
                      case 1:
                        u = o;
                        break;
                      case 4:
                        return c.label++, { value: o[1], done: !1 };
                      case 5:
                        c.label++, (n = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = c.ops.pop()), c.trys.pop();
                        continue;
                      default:
                        if (
                          !((u = c.trys),
                          (u = u.length > 0 && u[u.length - 1]) ||
                            (6 !== o[0] && 2 !== o[0]))
                        ) {
                          c = 0;
                          continue;
                        }
                        if (
                          3 === o[0] &&
                          (!u || (o[1] > u[0] && o[1] < u[3]))
                        ) {
                          c.label = o[1];
                          break;
                        }
                        if (6 === o[0] && c.label < u[1]) {
                          (c.label = u[1]), (u = o);
                          break;
                        }
                        if (u && c.label < u[2]) {
                          (c.label = u[2]), c.ops.push(o);
                          break;
                        }
                        u[2] && c.ops.pop(), c.trys.pop();
                        continue;
                    }
                    o = e.call(t, c);
                  } catch (t) {
                    (o = [6, t]), (n = 0);
                  } finally {
                    r = u = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, i]);
            };
          }
        },
        d = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, a.default)(e, '__esModule', { value: !0 });
      var v = d(r(42)),
        h = d(r(426)),
        y = r(427),
        g = r(23),
        b = r(53),
        m = r(89),
        x = r(134),
        w = d(r(25)),
        S = function (t) {
          return { ok: !1, errorCode: t };
        },
        A = (function () {
          function t() {}
          return (
            (t.getConfiguration = function () {
              return l(this, void 0, void 0, function () {
                var t, e, r, n;
                return p(this, function (o) {
                  switch (o.label) {
                    case 0:
                      return (
                        (t = h.default.getScreenDimension()),
                        (e = t.height),
                        (r = t.width),
                        [
                          4,
                          y.postData(
                            'config',
                            {
                              RequestId: m.getGuid(),
                              TabId: v.default.tabId.getOrCreate(),
                              SystemLocale: h.default.getSystemLocale(),
                              AppUserId: v.default.appUserId.get(),
                              ScreenHeight: e,
                              ScreenWidth: r,
                              ClientTime: b.toISOString(b.getTime()),
                            },
                            6e4
                          ),
                        ]
                      );
                    case 1:
                      return (
                        (n = o.sent()),
                        v.default.configuration.fillWithJson(n),
                        v.default.configuration.updateServerResponseTime(),
                        w.default.debug('Networker got configuration'),
                        [2, { ok: !0 }]
                      );
                  }
                });
              });
            }),
            (t.sendHeartbeat = function (t) {
              return l(this, void 0, void 0, function () {
                return p(this, function (e) {
                  switch (e.label) {
                    case 0:
                      return [
                        4,
                        y.postData(
                          'heartbeat',
                          {
                            SessionId: v.default.configuration.get('SessionId'),
                            DataPoints: t,
                            TabId: v.default.tabId.getOrCreate(),
                            ClientTime: b.toISOString(b.getTime()),
                            ConfigReceivedTime: b.toISOString(
                              v.default.configuration.get('ConfigReceivedTime')
                            ),
                          },
                          6e4
                        ),
                      ];
                    case 1:
                      return (
                        e.sent(),
                        v.default.configuration.updateServerResponseTime(),
                        [2, { ok: !0 }]
                      );
                  }
                });
              });
            }),
            (t.deleteUserData = function (t) {
              return l(this, void 0, void 0, function () {
                return p(this, function (e) {
                  switch (e.label) {
                    case 0:
                      return [
                        4,
                        y.postData('delete-data', { AppUserId: t }, 6e4),
                      ];
                    case 1:
                      return e.sent(), [2, { ok: !0 }];
                  }
                });
              });
            }),
            f(
              [
                x.Catch(Error, function () {
                  return S();
                }),
              ],
              t,
              'getConfiguration',
              null
            ),
            f(
              [
                x.Catch(Error, function () {
                  return S();
                }),
                x.Catch(g.HttpError, function (t) {
                  return S(t.errorCode);
                }),
              ],
              t,
              'sendHeartbeat',
              null
            ),
            f(
              [
                x.Catch(Error, function () {
                  return S();
                }),
              ],
              t,
              'deleteUserData',
              null
            ),
            t
          );
        })();
      e.default = A;
    },
    function (t, e, r) {
      var n,
        o,
        i,
        u = r(4),
        a = r(6),
        c = r(31),
        s = r(94),
        f = r(181),
        l = r(119),
        p = r(199),
        d = u.location,
        v = u.setImmediate,
        h = u.clearImmediate,
        y = u.process,
        g = u.MessageChannel,
        b = u.Dispatch,
        m = 0,
        x = {},
        w = function (t) {
          if (x.hasOwnProperty(t)) {
            var e = x[t];
            delete x[t], e();
          }
        },
        S = function (t) {
          return function () {
            w(t);
          };
        },
        A = function (t) {
          w(t.data);
        },
        E = function (t) {
          u.postMessage(t + '', d.protocol + '//' + d.host);
        };
      (v && h) ||
        ((v = function (t) {
          for (var e = [], r = 1; arguments.length > r; )
            e.push(arguments[r++]);
          return (
            (x[++m] = function () {
              ('function' == typeof t ? t : Function(t)).apply(void 0, e);
            }),
            n(m),
            m
          );
        }),
        (h = function (t) {
          delete x[t];
        }),
        'process' == c(y)
          ? (n = function (t) {
              y.nextTick(S(t));
            })
          : b && b.now
          ? (n = function (t) {
              b.now(S(t));
            })
          : g && !p
          ? ((i = (o = new g()).port2),
            (o.port1.onmessage = A),
            (n = s(i.postMessage, i, 1)))
          : !u.addEventListener ||
            'function' != typeof postMessage ||
            u.importScripts ||
            a(E) ||
            'file:' === d.protocol
          ? (n =
              'onreadystatechange' in l('script')
                ? function (t) {
                    f.appendChild(l('script')).onreadystatechange =
                      function () {
                        f.removeChild(this), w(t);
                      };
                  }
                : function (t) {
                    setTimeout(S(t), 0);
                  })
          : ((n = E), u.addEventListener('message', A, !1))),
        (t.exports = { set: v, clear: h });
    },
    function (t, e, r) {
      var n = r(200);
      t.exports = /(iphone|ipod|ipad).*applewebkit/i.test(n);
    },
    function (t, e, r) {
      var n = r(68);
      t.exports = n('navigator', 'userAgent') || '';
    },
    function (t, e, r) {
      'use strict';
      var n = r(73),
        o = function (t) {
          var e, r;
          (this.promise = new t(function (t, n) {
            if (void 0 !== e || void 0 !== r)
              throw TypeError('Bad Promise constructor');
            (e = t), (r = n);
          })),
            (this.resolve = n(e)),
            (this.reject = n(r));
        };
      t.exports.f = function (t) {
        return new o(t);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = function (t) {
        return t && t.__esModule ? t : { default: t };
      };
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 });
      var o = n(r(206));
      e.default = o.default;
    },
    function (t, e, r) {
      var n = r(204);
      t.exports = n;
    },
    function (t, e, r) {
      r(205);
      var n = r(5).Object,
        o = (t.exports = function (t, e, r) {
          return n.defineProperty(t, e, r);
        });
      n.defineProperty.sham && (o.sham = !0);
    },
    function (t, e, r) {
      var n = r(0),
        o = r(12);
      n(
        { target: 'Object', stat: !0, forced: !o, sham: !o },
        { defineProperty: r(22).f }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(2)),
        i = n(r(36)),
        u = n(r(40)),
        a = n(r(41)),
        c = function (t, e, r, n) {
          return new (r || (r = a.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        s = function (t, e) {
          var r,
            n,
            o,
            a,
            c = {
              label: 0,
              sent: function () {
                if (1 & o[0]) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (a = { next: s(0), throw: s(1), return: s(2) }),
            'function' == typeof u.default &&
              (a[i.default] = function () {
                return this;
              }),
            a
          );
          function s(i) {
            return function (u) {
              return (function (i) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; c; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (o =
                          2 & i[0]
                            ? n.return
                            : i[0]
                            ? n.throw || ((o = n.return) && o.call(n), 0)
                            : n.next) &&
                        !(o = o.call(n, i[1])).done)
                    )
                      return o;
                    switch (((n = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return c.label++, { value: i[1], done: !1 };
                      case 5:
                        c.label++, (n = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = c.ops.pop()), c.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = c.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          c = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          c.label = i[1];
                          break;
                        }
                        if (6 === i[0] && c.label < o[1]) {
                          (c.label = o[1]), (o = i);
                          break;
                        }
                        if (o && c.label < o[2]) {
                          (c.label = o[2]), c.ops.push(i);
                          break;
                        }
                        o[2] && c.ops.pop(), c.trys.pop();
                        continue;
                    }
                    i = e.call(t, c);
                  } catch (t) {
                    (i = [6, t]), (n = 0);
                  } finally {
                    r = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, u]);
            };
          }
        },
        f = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, o.default)(e, '__esModule', { value: !0 });
      var l = f(r(246)),
        p = (function () {
          function t() {}
          return (
            (t.start = function (t, e, r) {
              l.default.start(t, e, r);
            }),
            (t.startPage = function (t, e) {
              l.default.startPage(t, e);
            }),
            (t.addEvent = function (t, e) {
              l.default.addEvent(t, e);
            }),
            (t.setUserId = function (t) {
              l.default.setUserId(t);
            }),
            (t.setUserProperty = function (t, e) {
              l.default.setUserProperty(t, e);
            }),
            (t.setUserProperties = function (t) {
              l.default.setUserProperties(t);
            }),
            (t.removeUserProperty = function (t) {
              l.default.removeUserProperty(t);
            }),
            (t.incUserProperty = function (t, e) {
              l.default.incUserProperty(t, e);
            }),
            (t.appendToUserProperty = function (t, e) {
              l.default.appendToUserProperty(t, e);
            }),
            (t.setTrackingConsent = function (t) {
              l.default.setTrackingConsent(t);
            }),
            (t.getTrackingConsent = function () {
              return l.default.getTrackingConsent();
            }),
            (t.deleteCurrentUserData = function () {
              return c(this, void 0, void 0, function () {
                return s(this, function (t) {
                  return [2, l.default.deleteCurrentUserData()];
                });
              });
            }),
            (t.setDebugLevel = function (t) {
              l.default.setDebugLevel(t);
            }),
            t
          );
        })();
      e.default = p;
    },
    function (t, e, r) {
      var n = r(140);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(7),
        o = r(24);
      t.exports = function (t, e) {
        try {
          o(n, t, e);
        } catch (r) {
          n[t] = e;
        }
        return e;
      };
    },
    function (t, e, r) {
      var n = r(103),
        o = r(43),
        i = function (t) {
          return function (e, r) {
            var i,
              u,
              a = String(o(e)),
              c = n(r),
              s = a.length;
            return c < 0 || c >= s
              ? t
                ? ''
                : void 0
              : (i = a.charCodeAt(c)) < 55296 ||
                i > 56319 ||
                c + 1 === s ||
                (u = a.charCodeAt(c + 1)) < 56320 ||
                u > 57343
              ? t
                ? a.charAt(c)
                : i
              : t
              ? a.slice(c, c + 2)
              : u - 56320 + ((i - 55296) << 10) + 65536;
          };
        };
      t.exports = { codeAt: i(!1), charAt: i(!0) };
    },
    function (t, e, r) {
      var n = r(7),
        o = r(144),
        i = n.WeakMap;
      t.exports = 'function' == typeof i && /native code/.test(o(i));
    },
    function (t, e, r) {
      'use strict';
      var n = r(145).IteratorPrototype,
        o = r(79),
        i = r(55),
        u = r(39),
        a = r(48),
        c = function () {
          return this;
        };
      t.exports = function (t, e, r) {
        var s = e + ' Iterator';
        return (
          (t.prototype = o(n, { next: i(1, r) })),
          u(t, s, !1, !0),
          (a[s] = c),
          t
        );
      };
    },
    function (t, e, r) {
      var n = r(8);
      t.exports = !n(function () {
        function t() {}
        return (
          (t.prototype.constructor = null),
          Object.getPrototypeOf(new t()) !== t.prototype
        );
      });
    },
    function (t, e, r) {
      var n = r(12),
        o = r(22),
        i = r(30),
        u = r(58);
      t.exports = n
        ? Object.defineProperties
        : function (t, e) {
            i(t);
            for (var r, n = u(e), a = n.length, c = 0; a > c; )
              o.f(t, (r = n[c++]), e[r]);
            return t;
          };
    },
    function (t, e, r) {
      'use strict';
      var n = r(106),
        o = r(80);
      t.exports = n
        ? {}.toString
        : function () {
            return '[object ' + o(this) + ']';
          };
    },
    function (t, e, r) {
      var n = r(13);
      t.exports = function (t) {
        if (!n(t) && null !== t)
          throw TypeError("Can't set " + String(t) + ' as a prototype');
        return t;
      };
    },
    function (t, e) {
      t.exports = {
        CSSRuleList: 0,
        CSSStyleDeclaration: 0,
        CSSValueList: 0,
        ClientRectList: 0,
        DOMRectList: 0,
        DOMStringList: 0,
        DOMTokenList: 1,
        DataTransferItemList: 0,
        FileList: 0,
        HTMLAllCollection: 0,
        HTMLCollection: 0,
        HTMLFormElement: 0,
        HTMLSelectElement: 0,
        MediaList: 0,
        MimeTypeArray: 0,
        NamedNodeMap: 0,
        NodeList: 1,
        PaintRequestList: 0,
        Plugin: 0,
        PluginArray: 0,
        SVGLengthList: 0,
        SVGNumberList: 0,
        SVGPathSegList: 0,
        SVGPointList: 0,
        SVGStringList: 0,
        SVGTransformList: 0,
        SourceBufferList: 0,
        StyleSheetList: 0,
        TextTrackCueList: 0,
        TextTrackList: 0,
        TouchList: 0,
      };
    },
    function (t, e, r) {
      var n = r(154);
      t.exports = n;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(7),
        i = r(38),
        u = r(37),
        a = r(12),
        c = r(101),
        s = r(143),
        f = r(8),
        l = r(18),
        p = r(60),
        d = r(13),
        v = r(30),
        h = r(46),
        y = r(29),
        g = r(76),
        b = r(55),
        m = r(79),
        x = r(58),
        w = r(157),
        S = r(219),
        A = r(158),
        E = r(54),
        T = r(22),
        O = r(75),
        P = r(24),
        _ = r(59),
        I = r(100),
        j = r(78),
        R = r(57),
        C = r(77),
        k = r(9),
        L = r(99),
        M = r(10),
        N = r(39),
        D = r(45),
        U = r(61).forEach,
        F = j('hidden'),
        B = k('toPrimitive'),
        G = D.set,
        W = D.getterFor('Symbol'),
        H = Object.prototype,
        V = o.Symbol,
        K = i('JSON', 'stringify'),
        z = E.f,
        Y = T.f,
        q = S.f,
        $ = O.f,
        J = I('symbols'),
        X = I('op-symbols'),
        Q = I('string-to-symbol-registry'),
        Z = I('symbol-to-string-registry'),
        tt = I('wks'),
        et = o.QObject,
        rt = !et || !et.prototype || !et.prototype.findChild,
        nt =
          a &&
          f(function () {
            return (
              7 !=
              m(
                Y({}, 'a', {
                  get: function () {
                    return Y(this, 'a', { value: 7 }).a;
                  },
                })
              ).a
            );
          })
            ? function (t, e, r) {
                var n = z(H, e);
                n && delete H[e], Y(t, e, r), n && t !== H && Y(H, e, n);
              }
            : Y,
        ot = function (t, e) {
          var r = (J[t] = m(V.prototype));
          return (
            G(r, { type: 'Symbol', tag: t, description: e }),
            a || (r.description = e),
            r
          );
        },
        it = s
          ? function (t) {
              return 'symbol' == typeof t;
            }
          : function (t) {
              return Object(t) instanceof V;
            },
        ut = function (t, e, r) {
          t === H && ut(X, e, r), v(t);
          var n = g(e, !0);
          return (
            v(r),
            l(J, n)
              ? (r.enumerable
                  ? (l(t, F) && t[F][n] && (t[F][n] = !1),
                    (r = m(r, { enumerable: b(0, !1) })))
                  : (l(t, F) || Y(t, F, b(1, {})), (t[F][n] = !0)),
                nt(t, n, r))
              : Y(t, n, r)
          );
        },
        at = function (t, e) {
          v(t);
          var r = y(e),
            n = x(r).concat(lt(r));
          return (
            U(n, function (e) {
              (a && !ct.call(r, e)) || ut(t, e, r[e]);
            }),
            t
          );
        },
        ct = function (t) {
          var e = g(t, !0),
            r = $.call(this, e);
          return (
            !(this === H && l(J, e) && !l(X, e)) &&
            (!(r || !l(this, e) || !l(J, e) || (l(this, F) && this[F][e])) || r)
          );
        },
        st = function (t, e) {
          var r = y(t),
            n = g(e, !0);
          if (r !== H || !l(J, n) || l(X, n)) {
            var o = z(r, n);
            return (
              !o || !l(J, n) || (l(r, F) && r[F][n]) || (o.enumerable = !0), o
            );
          }
        },
        ft = function (t) {
          var e = q(y(t)),
            r = [];
          return (
            U(e, function (t) {
              l(J, t) || l(R, t) || r.push(t);
            }),
            r
          );
        },
        lt = function (t) {
          var e = t === H,
            r = q(e ? X : y(t)),
            n = [];
          return (
            U(r, function (t) {
              !l(J, t) || (e && !l(H, t)) || n.push(J[t]);
            }),
            n
          );
        };
      (c ||
        (_(
          (V = function () {
            if (this instanceof V)
              throw TypeError('Symbol is not a constructor');
            var t =
                arguments.length && void 0 !== arguments[0]
                  ? String(arguments[0])
                  : void 0,
              e = C(t),
              r = function (t) {
                this === H && r.call(X, t),
                  l(this, F) && l(this[F], e) && (this[F][e] = !1),
                  nt(this, e, b(1, t));
              };
            return a && rt && nt(H, e, { configurable: !0, set: r }), ot(e, t);
          }).prototype,
          'toString',
          function () {
            return W(this).tag;
          }
        ),
        _(V, 'withoutSetter', function (t) {
          return ot(C(t), t);
        }),
        (O.f = ct),
        (T.f = ut),
        (E.f = st),
        (w.f = S.f = ft),
        (A.f = lt),
        (L.f = function (t) {
          return ot(k(t), t);
        }),
        a &&
          (Y(V.prototype, 'description', {
            configurable: !0,
            get: function () {
              return W(this).description;
            },
          }),
          u || _(H, 'propertyIsEnumerable', ct, { unsafe: !0 }))),
      n({ global: !0, wrap: !0, forced: !c, sham: !c }, { Symbol: V }),
      U(x(tt), function (t) {
        M(t);
      }),
      n(
        { target: 'Symbol', stat: !0, forced: !c },
        {
          for: function (t) {
            var e = String(t);
            if (l(Q, e)) return Q[e];
            var r = V(e);
            return (Q[e] = r), (Z[r] = e), r;
          },
          keyFor: function (t) {
            if (!it(t)) throw TypeError(t + ' is not a symbol');
            if (l(Z, t)) return Z[t];
          },
          useSetter: function () {
            rt = !0;
          },
          useSimple: function () {
            rt = !1;
          },
        }
      ),
      n(
        { target: 'Object', stat: !0, forced: !c, sham: !a },
        {
          create: function (t, e) {
            return void 0 === e ? m(t) : at(m(t), e);
          },
          defineProperty: ut,
          defineProperties: at,
          getOwnPropertyDescriptor: st,
        }
      ),
      n(
        { target: 'Object', stat: !0, forced: !c },
        { getOwnPropertyNames: ft, getOwnPropertySymbols: lt }
      ),
      n(
        {
          target: 'Object',
          stat: !0,
          forced: f(function () {
            A.f(1);
          }),
        },
        {
          getOwnPropertySymbols: function (t) {
            return A.f(h(t));
          },
        }
      ),
      K) &&
        n(
          {
            target: 'JSON',
            stat: !0,
            forced:
              !c ||
              f(function () {
                var t = V();
                return (
                  '[null]' != K([t]) ||
                  '{}' != K({ a: t }) ||
                  '{}' != K(Object(t))
                );
              }),
          },
          {
            stringify: function (t, e, r) {
              for (var n, o = [t], i = 1; arguments.length > i; )
                o.push(arguments[i++]);
              if (((n = e), (d(e) || void 0 !== t) && !it(t)))
                return (
                  p(e) ||
                    (e = function (t, e) {
                      if (
                        ('function' == typeof n && (e = n.call(this, t, e)),
                        !it(e))
                      )
                        return e;
                    }),
                  (o[1] = e),
                  K.apply(null, o)
                );
            },
          }
        );
      V.prototype[B] || P(V.prototype, B, V.prototype.valueOf),
        N(V, 'Symbol'),
        (R[F] = !0);
    },
    function (t, e, r) {
      var n = r(29),
        o = r(157).f,
        i = {}.toString,
        u =
          'object' == typeof window && window && Object.getOwnPropertyNames
            ? Object.getOwnPropertyNames(window)
            : [];
      t.exports.f = function (t) {
        return u && '[object Window]' == i.call(t)
          ? (function (t) {
              try {
                return o(t);
              } catch (t) {
                return u.slice();
              }
            })(t)
          : o(n(t));
      };
    },
    function (t, e, r) {
      r(10)('asyncIterator');
    },
    function (t, e) {},
    function (t, e, r) {
      r(10)('hasInstance');
    },
    function (t, e, r) {
      r(10)('isConcatSpreadable');
    },
    function (t, e, r) {
      r(10)('match');
    },
    function (t, e, r) {
      r(10)('matchAll');
    },
    function (t, e, r) {
      r(10)('replace');
    },
    function (t, e, r) {
      r(10)('search');
    },
    function (t, e, r) {
      r(10)('species');
    },
    function (t, e, r) {
      r(10)('split');
    },
    function (t, e, r) {
      r(10)('toPrimitive');
    },
    function (t, e, r) {
      r(10)('toStringTag');
    },
    function (t, e, r) {
      r(10)('unscopables');
    },
    function (t, e, r) {
      r(39)(Math, 'Math', !0);
    },
    function (t, e, r) {
      var n = r(7);
      r(39)(n.JSON, 'JSON', !0);
    },
    function (t, e, r) {
      var n = r(236);
      t.exports = n;
    },
    function (t, e, r) {
      r(110), r(102), r(81), r(237), r(244), r(245);
      var n = r(5);
      t.exports = n.Promise;
    },
    function (t, e, r) {
      'use strict';
      var n,
        o,
        i,
        u,
        a = r(0),
        c = r(37),
        s = r(7),
        f = r(38),
        l = r(159),
        p = r(59),
        d = r(160),
        v = r(39),
        h = r(161),
        y = r(13),
        g = r(44),
        b = r(111),
        m = r(35),
        x = r(144),
        w = r(62),
        S = r(241),
        A = r(162),
        E = r(163).set,
        T = r(242),
        O = r(165),
        P = r(243),
        _ = r(112),
        I = r(166),
        j = r(45),
        R = r(139),
        C = r(9),
        k = r(108),
        L = C('species'),
        M = 'Promise',
        N = j.get,
        D = j.set,
        U = j.getterFor(M),
        F = l,
        B = s.TypeError,
        G = s.document,
        W = s.process,
        H = f('fetch'),
        V = _.f,
        K = V,
        z = 'process' == m(W),
        Y = !!(G && G.createEvent && s.dispatchEvent),
        q = R(M, function () {
          if (!(x(F) !== String(F))) {
            if (66 === k) return !0;
            if (!z && 'function' != typeof PromiseRejectionEvent) return !0;
          }
          if (c && !F.prototype.finally) return !0;
          if (k >= 51 && /native code/.test(F)) return !1;
          var t = F.resolve(1),
            e = function (t) {
              t(
                function () {},
                function () {}
              );
            };
          return (
            ((t.constructor = {})[L] = e),
            !(t.then(function () {}) instanceof e)
          );
        }),
        $ =
          q ||
          !S(function (t) {
            F.all(t).catch(function () {});
          }),
        J = function (t) {
          var e;
          return !(!y(t) || 'function' != typeof (e = t.then)) && e;
        },
        X = function (t, e, r) {
          if (!e.notified) {
            e.notified = !0;
            var n = e.reactions;
            T(function () {
              for (var o = e.value, i = 1 == e.state, u = 0; n.length > u; ) {
                var a,
                  c,
                  s,
                  f = n[u++],
                  l = i ? f.ok : f.fail,
                  p = f.resolve,
                  d = f.reject,
                  v = f.domain;
                try {
                  l
                    ? (i || (2 === e.rejection && et(t, e), (e.rejection = 1)),
                      !0 === l
                        ? (a = o)
                        : (v && v.enter(),
                          (a = l(o)),
                          v && (v.exit(), (s = !0))),
                      a === f.promise
                        ? d(B('Promise-chain cycle'))
                        : (c = J(a))
                        ? c.call(a, p, d)
                        : p(a))
                    : d(o);
                } catch (t) {
                  v && !s && v.exit(), d(t);
                }
              }
              (e.reactions = []),
                (e.notified = !1),
                r && !e.rejection && Z(t, e);
            });
          }
        },
        Q = function (t, e, r) {
          var n, o;
          Y
            ? (((n = G.createEvent('Event')).promise = e),
              (n.reason = r),
              n.initEvent(t, !1, !0),
              s.dispatchEvent(n))
            : (n = { promise: e, reason: r }),
            (o = s['on' + t])
              ? o(n)
              : 'unhandledrejection' === t &&
                P('Unhandled promise rejection', r);
        },
        Z = function (t, e) {
          E.call(s, function () {
            var r,
              n = e.value;
            if (
              tt(e) &&
              ((r = I(function () {
                z
                  ? W.emit('unhandledRejection', n, t)
                  : Q('unhandledrejection', t, n);
              })),
              (e.rejection = z || tt(e) ? 2 : 1),
              r.error)
            )
              throw r.value;
          });
        },
        tt = function (t) {
          return 1 !== t.rejection && !t.parent;
        },
        et = function (t, e) {
          E.call(s, function () {
            z
              ? W.emit('rejectionHandled', t)
              : Q('rejectionhandled', t, e.value);
          });
        },
        rt = function (t, e, r, n) {
          return function (o) {
            t(e, r, o, n);
          };
        },
        nt = function (t, e, r, n) {
          e.done ||
            ((e.done = !0),
            n && (e = n),
            (e.value = r),
            (e.state = 2),
            X(t, e, !0));
        },
        ot = function (t, e, r, n) {
          if (!e.done) {
            (e.done = !0), n && (e = n);
            try {
              if (t === r) throw B("Promise can't be resolved itself");
              var o = J(r);
              o
                ? T(function () {
                    var n = { done: !1 };
                    try {
                      o.call(r, rt(ot, t, n, e), rt(nt, t, n, e));
                    } catch (r) {
                      nt(t, n, r, e);
                    }
                  })
                : ((e.value = r), (e.state = 1), X(t, e, !1));
            } catch (r) {
              nt(t, { done: !1 }, r, e);
            }
          }
        };
      q &&
        ((F = function (t) {
          b(this, F, M), g(t), n.call(this);
          var e = N(this);
          try {
            t(rt(ot, this, e), rt(nt, this, e));
          } catch (t) {
            nt(this, e, t);
          }
        }),
        ((n = function (t) {
          D(this, {
            type: M,
            done: !1,
            notified: !1,
            parent: !1,
            reactions: [],
            rejection: !1,
            state: 0,
            value: void 0,
          });
        }).prototype = d(F.prototype, {
          then: function (t, e) {
            var r = U(this),
              n = V(A(this, F));
            return (
              (n.ok = 'function' != typeof t || t),
              (n.fail = 'function' == typeof e && e),
              (n.domain = z ? W.domain : void 0),
              (r.parent = !0),
              r.reactions.push(n),
              0 != r.state && X(this, r, !1),
              n.promise
            );
          },
          catch: function (t) {
            return this.then(void 0, t);
          },
        })),
        (o = function () {
          var t = new n(),
            e = N(t);
          (this.promise = t),
            (this.resolve = rt(ot, t, e)),
            (this.reject = rt(nt, t, e));
        }),
        (_.f = V =
          function (t) {
            return t === F || t === i ? new o(t) : K(t);
          }),
        c ||
          'function' != typeof l ||
          ((u = l.prototype.then),
          p(
            l.prototype,
            'then',
            function (t, e) {
              var r = this;
              return new F(function (t, e) {
                u.call(r, t, e);
              }).then(t, e);
            },
            { unsafe: !0 }
          ),
          'function' == typeof H &&
            a(
              { global: !0, enumerable: !0, forced: !0 },
              {
                fetch: function (t) {
                  return O(F, H.apply(s, arguments));
                },
              }
            ))),
        a({ global: !0, wrap: !0, forced: q }, { Promise: F }),
        v(F, M, !1, !0),
        h(M),
        (i = f(M)),
        a(
          { target: M, stat: !0, forced: q },
          {
            reject: function (t) {
              var e = V(this);
              return e.reject.call(void 0, t), e.promise;
            },
          }
        ),
        a(
          { target: M, stat: !0, forced: c || q },
          {
            resolve: function (t) {
              return O(c && this === i ? F : this, t);
            },
          }
        ),
        a(
          { target: M, stat: !0, forced: $ },
          {
            all: function (t) {
              var e = this,
                r = V(e),
                n = r.resolve,
                o = r.reject,
                i = I(function () {
                  var r = g(e.resolve),
                    i = [],
                    u = 0,
                    a = 1;
                  w(t, function (t) {
                    var c = u++,
                      s = !1;
                    i.push(void 0),
                      a++,
                      r.call(e, t).then(function (t) {
                        s || ((s = !0), (i[c] = t), --a || n(i));
                      }, o);
                  }),
                    --a || n(i);
                });
              return i.error && o(i.value), r.promise;
            },
            race: function (t) {
              var e = this,
                r = V(e),
                n = r.reject,
                o = I(function () {
                  var o = g(e.resolve);
                  w(t, function (t) {
                    o.call(e, t).then(r.resolve, n);
                  });
                });
              return o.error && n(o.value), r.promise;
            },
          }
        );
    },
    function (t, e, r) {
      var n = r(9),
        o = r(48),
        i = n('iterator'),
        u = Array.prototype;
      t.exports = function (t) {
        return void 0 !== t && (o.Array === t || u[i] === t);
      };
    },
    function (t, e, r) {
      var n = r(80),
        o = r(48),
        i = r(9)('iterator');
      t.exports = function (t) {
        if (null != t) return t[i] || t['@@iterator'] || o[n(t)];
      };
    },
    function (t, e, r) {
      var n = r(30);
      t.exports = function (t, e, r, o) {
        try {
          return o ? e(n(r)[0], r[1]) : e(r);
        } catch (e) {
          var i = t.return;
          throw (void 0 !== i && n(i.call(t)), e);
        }
      };
    },
    function (t, e, r) {
      var n = r(9)('iterator'),
        o = !1;
      try {
        var i = 0,
          u = {
            next: function () {
              return { done: !!i++ };
            },
            return: function () {
              o = !0;
            },
          };
        (u[n] = function () {
          return this;
        }),
          Array.from(u, function () {
            throw 2;
          });
      } catch (t) {}
      t.exports = function (t, e) {
        if (!e && !o) return !1;
        var r = !1;
        try {
          var i = {};
          (i[n] = function () {
            return {
              next: function () {
                return { done: (r = !0) };
              },
            };
          }),
            t(i);
        } catch (t) {}
        return r;
      };
    },
    function (t, e, r) {
      var n,
        o,
        i,
        u,
        a,
        c,
        s,
        f,
        l = r(7),
        p = r(54).f,
        d = r(35),
        v = r(163).set,
        h = r(164),
        y = l.MutationObserver || l.WebKitMutationObserver,
        g = l.process,
        b = l.Promise,
        m = 'process' == d(g),
        x = p(l, 'queueMicrotask'),
        w = x && x.value;
      w ||
        ((n = function () {
          var t, e;
          for (m && (t = g.domain) && t.exit(); o; ) {
            (e = o.fn), (o = o.next);
            try {
              e();
            } catch (t) {
              throw (o ? u() : (i = void 0), t);
            }
          }
          (i = void 0), t && t.enter();
        }),
        m
          ? (u = function () {
              g.nextTick(n);
            })
          : y && !h
          ? ((a = !0),
            (c = document.createTextNode('')),
            new y(n).observe(c, { characterData: !0 }),
            (u = function () {
              c.data = a = !a;
            }))
          : b && b.resolve
          ? ((s = b.resolve(void 0)),
            (f = s.then),
            (u = function () {
              f.call(s, n);
            }))
          : (u = function () {
              v.call(l, n);
            })),
        (t.exports =
          w ||
          function (t) {
            var e = { fn: t, next: void 0 };
            i && (i.next = e), o || ((o = e), u()), (i = e);
          });
    },
    function (t, e, r) {
      var n = r(7);
      t.exports = function (t, e) {
        var r = n.console;
        r && r.error && (1 === arguments.length ? r.error(t) : r.error(t, e));
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(44),
        i = r(112),
        u = r(166),
        a = r(62);
      n(
        { target: 'Promise', stat: !0 },
        {
          allSettled: function (t) {
            var e = this,
              r = i.f(e),
              n = r.resolve,
              c = r.reject,
              s = u(function () {
                var r = o(e.resolve),
                  i = [],
                  u = 0,
                  c = 1;
                a(t, function (t) {
                  var o = u++,
                    a = !1;
                  i.push(void 0),
                    c++,
                    r.call(e, t).then(
                      function (t) {
                        a ||
                          ((a = !0),
                          (i[o] = { status: 'fulfilled', value: t }),
                          --c || n(i));
                      },
                      function (t) {
                        a ||
                          ((a = !0),
                          (i[o] = { status: 'rejected', reason: t }),
                          --c || n(i));
                      }
                    );
                }),
                  --c || n(i);
              });
            return s.error && c(s.value), r.promise;
          },
        }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(37),
        i = r(159),
        u = r(8),
        a = r(38),
        c = r(162),
        s = r(165),
        f = r(59);
      n(
        {
          target: 'Promise',
          proto: !0,
          real: !0,
          forced:
            !!i &&
            u(function () {
              i.prototype.finally.call(
                { then: function () {} },
                function () {}
              );
            }),
        },
        {
          finally: function (t) {
            var e = c(this, a('Promise')),
              r = 'function' == typeof t;
            return this.then(
              r
                ? function (r) {
                    return s(e, t()).then(function () {
                      return r;
                    });
                  }
                : t,
              r
                ? function (r) {
                    return s(e, t()).then(function () {
                      throw r;
                    });
                  }
                : t
            );
          },
        }
      ),
        o ||
          'function' != typeof i ||
          i.prototype.finally ||
          f(i.prototype, 'finally', a('Promise').prototype.finally);
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(36)),
        i = n(r(40)),
        u = n(r(41)),
        a = n(r(2)),
        c = n(r(113)),
        s = n(r(114)),
        f = function (t, e, r, n) {
          var o,
            i = arguments.length,
            u = i < 3 ? e : null === n ? (n = (0, s.default)(e, r)) : n;
          if (
            'object' ===
              ('undefined' == typeof Reflect
                ? 'undefined'
                : (0, c.default)(Reflect)) &&
            'function' == typeof Reflect.decorate
          )
            u = Reflect.decorate(t, e, r, n);
          else
            for (var f = t.length - 1; f >= 0; f--)
              (o = t[f]) &&
                (u = (i < 3 ? o(u) : i > 3 ? o(e, r, u) : o(e, r)) || u);
          return i > 3 && u && (0, a.default)(e, r, u), u;
        },
        l = function (t, e, r, n) {
          return new (r || (r = u.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        p = function (t, e) {
          var r,
            n,
            u,
            a,
            c = {
              label: 0,
              sent: function () {
                if (1 & u[0]) throw u[1];
                return u[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (a = { next: s(0), throw: s(1), return: s(2) }),
            'function' == typeof i.default &&
              (a[o.default] = function () {
                return this;
              }),
            a
          );
          function s(o) {
            return function (i) {
              return (function (o) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; c; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (u =
                          2 & o[0]
                            ? n.return
                            : o[0]
                            ? n.throw || ((u = n.return) && u.call(n), 0)
                            : n.next) &&
                        !(u = u.call(n, o[1])).done)
                    )
                      return u;
                    switch (((n = 0), u && (o = [2 & o[0], u.value]), o[0])) {
                      case 0:
                      case 1:
                        u = o;
                        break;
                      case 4:
                        return c.label++, { value: o[1], done: !1 };
                      case 5:
                        c.label++, (n = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = c.ops.pop()), c.trys.pop();
                        continue;
                      default:
                        if (
                          !((u = c.trys),
                          (u = u.length > 0 && u[u.length - 1]) ||
                            (6 !== o[0] && 2 !== o[0]))
                        ) {
                          c = 0;
                          continue;
                        }
                        if (
                          3 === o[0] &&
                          (!u || (o[1] > u[0] && o[1] < u[3]))
                        ) {
                          c.label = o[1];
                          break;
                        }
                        if (6 === o[0] && c.label < u[1]) {
                          (c.label = u[1]), (u = o);
                          break;
                        }
                        if (u && c.label < u[2]) {
                          (c.label = u[2]), c.ops.push(o);
                          break;
                        }
                        u[2] && c.ops.pop(), c.trys.pop();
                        continue;
                    }
                    o = e.call(t, c);
                  } catch (t) {
                    (o = [6, t]), (n = 0);
                  } finally {
                    r = u = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, i]);
            };
          }
        },
        d = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, a.default)(e, '__esModule', { value: !0 });
      var v = d(r(25)),
        h = d(r(42)),
        y = r(134),
        g = d(r(421)),
        b = d(r(425)),
        m = d(r(63)),
        x = r(19),
        w = r(23),
        S = d(r(197)),
        A = (function () {
          function t() {
            (this.isWired = !1),
              (this.isGettingConfiguration = !1),
              (this.heartbeatManager = new b.default()),
              (this.metadataRecorder = new g.default());
          }
          return (
            (t.prototype.start = function (t, e, r) {
              if (
                (v.default.info(
                  'Start session - API Key:',
                  t,
                  ', API Auth:',
                  e,
                  ', Options:',
                  r
                ),
                this.isWired)
              )
                v.default.info('Session is already running');
              else {
                if (!x.isNonEmptyString(t))
                  throw new w.SNTypeError(
                    '"apiKey" must be a string and cannot be empty'
                  );
                if (!x.isNonEmptyString(e))
                  throw new w.SNTypeError(
                    '"apiAuth" must be a string and cannot be empty'
                  );
                if (x.isDefined(r)) {
                  if (!x.isObject(r))
                    throw new w.SNTypeError('"options" must be an object');
                  x.isDefined(r.serverEndpoint) &&
                    (m.default.baseUrl = r.serverEndpoint);
                }
                try {
                  this.wire(t, e);
                } catch (t) {
                  return (
                    v.default.error('SDK wiring failed', t), void this.unwire()
                  );
                }
              }
              if (x.isObject(r)) {
                if (x.isDefined(r.userId))
                  try {
                    v.default.info('Set user id before config');
                    var n = this.metadataRecorder.user.normalizeAppUserId(
                      r.userId
                    );
                    this.metadataRecorder.user.setAppUserId(n);
                  } catch (t) {
                    v.default.error(t.message);
                  }
                x.isDefined(r.trackingConsent) &&
                  this.setTrackingConsent(r.trackingConsent);
              }
              this.startNewSessionIfNeeded();
            }),
            (t.prototype.startPage = function (t, e) {
              v.default.info('Start page - Name:', t, ', Description:', e),
                this.metadataRecorder.page.start(t, e);
            }),
            (t.prototype.addEvent = function (t, e) {
              v.default.info('Add event - Name:', t, ', Properties:', e),
                this.metadataRecorder.event.add(t, e);
            }),
            (t.prototype.setUserId = function (t) {
              v.default.info('Set user id:', t);
              var e = this.metadataRecorder.user.normalizeAppUserId(t);
              this.metadataRecorder.user.setAppUserId(e);
            }),
            (t.prototype.setUserProperty = function (t, e) {
              v.default.info('Set user property:', t, '-', e),
                this.metadataRecorder.user.setProperty(t, e);
            }),
            (t.prototype.setUserProperties = function (t) {
              v.default.info('Set user properties:', t),
                this.metadataRecorder.user.setProperties(t);
            }),
            (t.prototype.removeUserProperty = function (t) {
              v.default.info('Remove user property:', t),
                this.metadataRecorder.user.removeProperty(t);
            }),
            (t.prototype.incUserProperty = function (t, e) {
              v.default.info('Inc user property:', t, '-', e),
                this.metadataRecorder.user.incProperty(t, e);
            }),
            (t.prototype.appendToUserProperty = function (t, e) {
              v.default.info('Append to user property:', t, '-', e),
                this.metadataRecorder.user.appendToProperty(t, e);
            }),
            (t.prototype.setTrackingConsent = function (t) {
              if (
                (v.default.info('Set tracking consent to:', t), !x.isBoolean(t))
              )
                throw new w.SNError('"consentGiven" must be a boolean');
              t !== h.default.trackingConsent.get()
                ? (h.default.trackingConsent.set(t),
                  v.default.info('Consent is now:', t),
                  t
                    ? this.startNewSessionIfNeeded() &&
                      this.metadataRecorder.event.add(
                        'SNAnalyticsTrackingEnabled'
                      )
                    : h.default.configuration.isSessionAlive() &&
                      this.metadataRecorder.event.add(
                        'SNAnalyticsTrackingDisabled'
                      ))
                : v.default.debug('Consent is the same:', t);
            }),
            (t.prototype.getTrackingConsent = function () {
              return (
                v.default.info('Get tracking consent'),
                h.default.trackingConsent.get()
              );
            }),
            (t.prototype.deleteCurrentUserData = function () {
              return l(this, void 0, void 0, function () {
                var t, e;
                return p(this, function (r) {
                  switch (r.label) {
                    case 0:
                      return (
                        v.default.info('Deleting current user data'),
                        this.setTrackingConsent(!1),
                        (t = h.default.clientId.get()) &&
                        t !== m.default.DEFAULT_CLIENT_ID
                          ? ((e = h.default.appUserId.get()),
                            [4, S.default.deleteUserData(e)])
                          : (v.default.warn(
                              'SNAnalytics was never started on the device'
                            ),
                            [2, !0])
                      );
                    case 1:
                      if (!r.sent().ok)
                        throw new w.SNError(
                          'Server could not delete user ' + e
                        );
                      return (
                        h.default.appUserId.remove(),
                        this.handleSessionDeletion(),
                        [2, !0]
                      );
                  }
                });
              });
            }),
            (t.prototype.setDebugLevel = function (t) {
              v.default.info('Set debug level:', t), v.default.setDebugLevel(t);
            }),
            (t.prototype.StartSession = function (t, e, r) {
              var n = r.value;
              return (
                (r.value = function () {
                  for (var t = [], e = 0; e < arguments.length; e++)
                    t[e] = arguments[e];
                  return this.startNewSessionIfNeeded()
                    ? n.apply(this, t)
                    : void 0;
                }),
                r
              );
            }),
            (0, a.default)(t, 'StartSession', {
              get: function () {
                return t.prototype.StartSession;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.EnsureWired = function (t, e, r) {
              var n = r.value;
              return (
                (r.value = function () {
                  for (var t = [], e = 0; e < arguments.length; e++)
                    t[e] = arguments[e];
                  if (this.isWired) return n.apply(this, t);
                  throw new w.SNError(
                    'Unable to run function. Must call SNAnalytics.start beforehand'
                  );
                }),
                r
              );
            }),
            (0, a.default)(t, 'EnsureWired', {
              get: function () {
                return t.prototype.EnsureWired;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.startNewSessionIfNeeded = function () {
              try {
                return this.isWired
                  ? h.default.trackingConsent.get()
                    ? (h.default.configuration.isSessionAlive()
                        ? h.default.configuration.get('RecordMetadata') &&
                          this.heartbeatManager.startHeartbeats()
                        : this.isGettingConfiguration ||
                          (this.handleSessionDeletion(),
                          this.startNewSession()),
                      h.default.configuration.get('RecordMetadata'))
                    : (v.default.error('No tracking consent given'), !1)
                  : (v.default.error('Must call SNAnalytics.start beforehand'),
                    !1);
              } catch (t) {
                return (
                  v.default.error('Could not start a session:', t),
                  this.heartbeatManager.stopHeartbeats(),
                  !1
                );
              }
            }),
            (t.prototype.wire = function (t, e) {
              v.default.info('Wiring SDK...'),
                h.default.setKeys(t, e),
                (this.isWired = !0),
                v.default.info('SDK is Wired');
            }),
            (t.prototype.unwire = function () {
              (this.isWired = !1), this.heartbeatManager.stopHeartbeats();
            }),
            (t.prototype.handleSessionDeletion = function (t) {
              void 0 === t && (t = !1),
                this.heartbeatManager.stopHeartbeats(),
                h.default.dataPoints.deleteAll(),
                t || h.default.configuration.deleteData();
            }),
            (t.prototype.startNewSession = function () {
              return l(this, void 0, void 0, function () {
                var t;
                return p(this, function (e) {
                  switch (e.label) {
                    case 0:
                      return (
                        v.default.info('Starting new session'),
                        (this.isGettingConfiguration = !0),
                        [4, S.default.getConfiguration()]
                      );
                    case 1:
                      return (
                        (t = e.sent()),
                        (this.isGettingConfiguration = !1),
                        t.ok && this.gotConfiguration(),
                        [2]
                      );
                  }
                });
              });
            }),
            (t.prototype.gotConfiguration = function () {
              v.default.info(
                'Got session id:',
                h.default.configuration.get('SessionId')
              );
              var t = h.default.configuration.get('LogLevel');
              x.isDefined(t) &&
                (m.default.IS_PRODUCTION
                  ? v.default.setDebugLevel(t)
                  : v.default.warn(
                      'Log level can be changed from config response only in production'
                    )),
                h.default.clientId.set(h.default.configuration.get('ClientId')),
                h.default.configuration.get('RecordMetadata')
                  ? (this.heartbeatManager.startHeartbeats(),
                    this.metadataRecorder.user.setAppUserId(
                      h.default.appUserId.get()
                    ))
                  : this.handleSessionDeletion(!0);
            }),
            f([y.CatchAll, t.StartSession], t.prototype, 'startPage', null),
            f([y.CatchAll, t.StartSession], t.prototype, 'addEvent', null),
            f([y.CatchAll, t.StartSession], t.prototype, 'setUserId', null),
            f(
              [y.CatchAll, t.StartSession],
              t.prototype,
              'setUserProperty',
              null
            ),
            f(
              [y.CatchAll, t.StartSession],
              t.prototype,
              'setUserProperties',
              null
            ),
            f(
              [y.CatchAll, t.StartSession],
              t.prototype,
              'removeUserProperty',
              null
            ),
            f(
              [y.CatchAll, t.StartSession],
              t.prototype,
              'incUserProperty',
              null
            ),
            f(
              [y.CatchAll, t.StartSession],
              t.prototype,
              'appendToUserProperty',
              null
            ),
            f(
              [y.CatchAll, t.EnsureWired],
              t.prototype,
              'setTrackingConsent',
              null
            ),
            f(
              [y.CatchAllAndReturn(!1), t.EnsureWired],
              t.prototype,
              'getTrackingConsent',
              null
            ),
            f(
              [y.CatchAllAndReturn(!1), t.EnsureWired],
              t.prototype,
              'deleteCurrentUserData',
              null
            ),
            f([y.CatchAll], t.prototype, 'setDebugLevel', null),
            f([y.CatchAll], t.prototype, 'unwire', null),
            f([y.CatchAll], t.prototype, 'startNewSession', null),
            t
          );
        })();
      e.default = new A();
    },
    function (t, e, r) {
      t.exports = r(248);
    },
    function (t, e, r) {
      var n = r(140);
      t.exports = n;
    },
    function (t, e, r) {
      t.exports = r(250);
    },
    function (t, e, r) {
      var n = r(154);
      r(251), r(252), r(253), r(254), r(255), (t.exports = n);
    },
    function (t, e, r) {
      r(10)('asyncDispose');
    },
    function (t, e, r) {
      r(10)('dispose');
    },
    function (t, e, r) {
      r(10)('observable');
    },
    function (t, e, r) {
      r(10)('patternMatch');
    },
    function (t, e, r) {
      r(10)('replaceAll');
    },
    function (t, e, r) {
      var n = r(257);
      t.exports = n;
    },
    function (t, e, r) {
      r(258);
      var n = r(5).Object,
        o = (t.exports = function (t, e) {
          return n.getOwnPropertyDescriptor(t, e);
        });
      n.getOwnPropertyDescriptor.sham && (o.sham = !0);
    },
    function (t, e, r) {
      var n = r(0),
        o = r(8),
        i = r(29),
        u = r(54).f,
        a = r(12),
        c = o(function () {
          u(1);
        });
      n(
        { target: 'Object', stat: !0, forced: !a || c, sham: !a },
        {
          getOwnPropertyDescriptor: function (t, e) {
            return u(i(t), e);
          },
        }
      );
    },
    function (t, e, r) {
      var n = r(260);
      t.exports = n;
    },
    function (t, e, r) {
      r(261);
      var n = r(5);
      t.exports = n.parseInt;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(262);
      n({ global: !0, forced: parseInt != o }, { parseInt: o });
    },
    function (t, e, r) {
      var n = r(7),
        o = r(168).trim,
        i = r(115),
        u = n.parseInt,
        a = /^[+-]?0[Xx]/,
        c = 8 !== u(i + '08') || 22 !== u(i + '0x16');
      t.exports = c
        ? function (t, e) {
            var r = o(String(t));
            return u(r, e >>> 0 || (a.test(r) ? 16 : 10));
          }
        : u;
    },
    function (t, e, r) {
      var n = r(264);
      t.exports = n;
    },
    function (t, e, r) {
      r(265);
      var n = r(5);
      t.exports = n.Object.entries;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(169).entries;
      n(
        { target: 'Object', stat: !0 },
        {
          entries: function (t) {
            return o(t);
          },
        }
      );
    },
    function (t, e, r) {
      var n = r(267);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(268),
        o = Function.prototype;
      t.exports = function (t) {
        var e = t.bind;
        return t === o || (t instanceof Function && e === o.bind) ? n : e;
      };
    },
    function (t, e, r) {
      r(269);
      var n = r(26);
      t.exports = n('Function').bind;
    },
    function (t, e, r) {
      r(0)({ target: 'Function', proto: !0 }, { bind: r(270) });
    },
    function (t, e, r) {
      'use strict';
      var n = r(44),
        o = r(13),
        i = [].slice,
        u = {},
        a = function (t, e, r) {
          if (!(e in u)) {
            for (var n = [], o = 0; o < e; o++) n[o] = 'a[' + o + ']';
            u[e] = Function('C,a', 'return new C(' + n.join(',') + ')');
          }
          return u[e](t, r);
        };
      t.exports =
        Function.bind ||
        function (t) {
          var e = n(this),
            r = i.call(arguments, 1),
            u = function () {
              var n = r.concat(i.call(arguments));
              return this instanceof u ? a(e, n.length, n) : e.apply(t, n);
            };
          return o(e.prototype) && (u.prototype = e.prototype), u;
        };
    },
    function (t, e, r) {
      var n = r(15),
        o = r(4),
        i = r(83),
        u = r(118),
        a = r(21).f,
        c = r(65).f,
        s = r(273),
        f = r(125),
        l = r(175),
        p = r(28),
        d = r(6),
        v = r(50).set,
        h = r(128),
        y = r(11)('match'),
        g = o.RegExp,
        b = g.prototype,
        m = /a/g,
        x = /a/g,
        w = new g(m) !== m,
        S = l.UNSUPPORTED_Y;
      if (
        n &&
        i(
          'RegExp',
          !w ||
            S ||
            d(function () {
              return (x[y] = !1), g(m) != m || g(x) == x || '/a/i' != g(m, 'i');
            })
        )
      ) {
        for (
          var A = function (t, e) {
              var r,
                n = this instanceof A,
                o = s(t),
                i = void 0 === e;
              if (!n && o && t.constructor === A && i) return t;
              w
                ? o && !i && (t = t.source)
                : t instanceof A && (i && (e = f.call(t)), (t = t.source)),
                S &&
                  (r = !!e && e.indexOf('y') > -1) &&
                  (e = e.replace(/y/g, ''));
              var a = u(w ? new g(t, e) : g(t, e), n ? this : b, A);
              return S && r && v(a, { sticky: r }), a;
            },
            E = function (t) {
              (t in A) ||
                a(A, t, {
                  configurable: !0,
                  get: function () {
                    return g[t];
                  },
                  set: function (e) {
                    g[t] = e;
                  },
                });
            },
            T = c(g),
            O = 0;
          T.length > O;

        )
          E(T[O++]);
        (b.constructor = A), (A.prototype = b), p(o, 'RegExp', A);
      }
      h('RegExp');
    },
    function (t, e, r) {
      var n = r(20);
      t.exports = function (t) {
        if (!n(t) && null !== t)
          throw TypeError("Can't set " + String(t) + ' as a prototype');
        return t;
      };
    },
    function (t, e, r) {
      var n = r(20),
        o = r(31),
        i = r(11)('match');
      t.exports = function (t) {
        var e;
        return n(t) && (void 0 !== (e = t[i]) ? !!e : 'RegExp' == o(t));
      };
    },
    function (t, e, r) {
      var n = r(174);
      t.exports = n && !Symbol.sham && 'symbol' == typeof Symbol.iterator;
    },
    function (t, e, r) {
      var n = r(4),
        o = r(126),
        i = n.WeakMap;
      t.exports = 'function' == typeof i && /native code/.test(o(i));
    },
    function (t, e, r) {
      var n = r(4);
      t.exports = n;
    },
    function (t, e, r) {
      'use strict';
      var n = {}.propertyIsEnumerable,
        o = Object.getOwnPropertyDescriptor,
        i = o && !n.call({ 1: 2 }, 1);
      e.f = i
        ? function (t) {
            var e = o(this, t);
            return !!e && e.enumerable;
          }
        : n;
    },
    function (t, e, r) {
      var n = r(17),
        o = r(279),
        i = r(69),
        u = r(21);
      t.exports = function (t, e) {
        for (var r = o(e), a = u.f, c = i.f, s = 0; s < r.length; s++) {
          var f = r[s];
          n(t, f) || a(t, f, c(e, f));
        }
      };
    },
    function (t, e, r) {
      var n = r(68),
        o = r(65),
        i = r(280),
        u = r(16);
      t.exports =
        n('Reflect', 'ownKeys') ||
        function (t) {
          var e = o.f(u(t)),
            r = i.f;
          return r ? e.concat(r(t)) : e;
        };
    },
    function (t, e) {
      e.f = Object.getOwnPropertySymbols;
    },
    function (t, e, r) {
      t.exports = r(282);
    },
    function (t, e, r) {
      var n = r(283);
      t.exports = n;
    },
    function (t, e, r) {
      r(284);
      var n = r(5);
      t.exports = n.Object.values;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(169).values;
      n(
        { target: 'Object', stat: !0 },
        {
          values: function (t) {
            return o(t);
          },
        }
      );
    },
    function (t, e, r) {
      t.exports = r(286);
    },
    function (t, e, r) {
      var n = r(287);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(288),
        o = r(290),
        i = Array.prototype,
        u = String.prototype;
      t.exports = function (t) {
        var e = t.includes;
        return t === i || (t instanceof Array && e === i.includes)
          ? n
          : 'string' == typeof t ||
            t === u ||
            (t instanceof String && e === u.includes)
          ? o
          : e;
      };
    },
    function (t, e, r) {
      r(289);
      var n = r(26);
      t.exports = n('Array').includes;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(148).includes,
        i = r(153);
      n(
        {
          target: 'Array',
          proto: !0,
          forced: !r(71)('indexOf', { ACCESSORS: !0, 1: 0 }),
        },
        {
          includes: function (t) {
            return o(this, t, arguments.length > 1 ? arguments[1] : void 0);
          },
        }
      ),
        i('includes');
    },
    function (t, e, r) {
      r(291);
      var n = r(26);
      t.exports = n('String').includes;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(176),
        i = r(43);
      n(
        { target: 'String', proto: !0, forced: !r(177)('includes') },
        {
          includes: function (t) {
            return !!~String(i(this)).indexOf(
              o(t),
              arguments.length > 1 ? arguments[1] : void 0
            );
          },
        }
      );
    },
    function (t, e, r) {
      var n = r(13),
        o = r(35),
        i = r(9)('match');
      t.exports = function (t) {
        var e;
        return n(t) && (void 0 !== (e = t[i]) ? !!e : 'RegExp' == o(t));
      };
    },
    function (t, e, r) {
      t.exports = r(294);
    },
    function (t, e, r) {
      var n = r(295);
      t.exports = n;
    },
    function (t, e, r) {
      r(296);
      var n = r(5);
      t.exports = n.Array.isArray;
    },
    function (t, e, r) {
      r(0)({ target: 'Array', stat: !0 }, { isArray: r(60) });
    },
    function (t, e, r) {
      t.exports = r(298);
    },
    function (t, e, r) {
      var n = r(299);
      t.exports = n;
    },
    function (t, e, r) {
      r(300);
      var n = r(5);
      t.exports = n.Number.isNaN;
    },
    function (t, e, r) {
      r(0)(
        { target: 'Number', stat: !0 },
        {
          isNaN: function (t) {
            return t != t;
          },
        }
      );
    },
    function (t, e, r) {
      t.exports = r(302);
    },
    function (t, e, r) {
      var n = r(303);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(304),
        o = String.prototype;
      t.exports = function (t) {
        var e = t.trim;
        return 'string' == typeof t ||
          t === o ||
          (t instanceof String && e === o.trim)
          ? n
          : e;
      };
    },
    function (t, e, r) {
      r(305);
      var n = r(26);
      t.exports = n('String').trim;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(168).trim;
      n(
        { target: 'String', proto: !0, forced: r(306)('trim') },
        {
          trim: function () {
            return o(this);
          },
        }
      );
    },
    function (t, e, r) {
      var n = r(8),
        o = r(115);
      t.exports = function (t) {
        return n(function () {
          return !!o[t]() || '​᠎' != '​᠎'[t]() || o[t].name !== t;
        });
      };
    },
    function (t, e, r) {
      var n = r(308);
      t.exports = n;
    },
    function (t, e, r) {
      r(309);
      var n = r(5).Object;
      t.exports = function (t, e) {
        return n.create(t, e);
      };
    },
    function (t, e, r) {
      r(0)({ target: 'Object', stat: !0, sham: !r(12) }, { create: r(79) });
    },
    function (t, e, r) {
      var n = r(311);
      t.exports = n;
    },
    function (t, e, r) {
      r(312);
      var n = r(5);
      t.exports = n.Object.setPrototypeOf;
    },
    function (t, e, r) {
      r(0)({ target: 'Object', stat: !0 }, { setPrototypeOf: r(151) });
    },
    function (t, e, r) {
      var n = r(11),
        o = r(90),
        i = r(21),
        u = n('unscopables'),
        a = Array.prototype;
      null == a[u] && i.f(a, u, { configurable: !0, value: o(null) }),
        (t.exports = function (t) {
          a[u][t] = !0;
        });
    },
    function (t, e, r) {
      var n = r(15),
        o = r(21),
        i = r(16),
        u = r(315);
      t.exports = n
        ? Object.defineProperties
        : function (t, e) {
            i(t);
            for (var r, n = u(e), a = n.length, c = 0; a > c; )
              o.f(t, (r = n[c++]), e[r]);
            return t;
          };
    },
    function (t, e, r) {
      var n = r(171),
        o = r(122);
      t.exports =
        Object.keys ||
        function (t) {
          return n(t, o);
        };
    },
    function (t, e, r) {
      'use strict';
      var n = r(51),
        o = r(317),
        i = r(91),
        u = r(64),
        a = r(92),
        c = r(27),
        s = r(28),
        f = r(11),
        l = r(86),
        p = r(72),
        d = r(182),
        v = d.IteratorPrototype,
        h = d.BUGGY_SAFARI_ITERATORS,
        y = f('iterator'),
        g = function () {
          return this;
        };
      t.exports = function (t, e, r, f, d, b, m) {
        o(r, e, f);
        var x,
          w,
          S,
          A = function (t) {
            if (t === d && _) return _;
            if (!h && t in O) return O[t];
            switch (t) {
              case 'keys':
              case 'values':
              case 'entries':
                return function () {
                  return new r(this, t);
                };
            }
            return function () {
              return new r(this);
            };
          },
          E = e + ' Iterator',
          T = !1,
          O = t.prototype,
          P = O[y] || O['@@iterator'] || (d && O[d]),
          _ = (!h && P) || A(d),
          I = ('Array' == e && O.entries) || P;
        if (
          (I &&
            ((x = i(I.call(new t()))),
            v !== Object.prototype &&
              x.next &&
              (l ||
                i(x) === v ||
                (u ? u(x, v) : 'function' != typeof x[y] && c(x, y, g)),
              a(x, E, !0, !0),
              l && (p[E] = g))),
          'values' == d &&
            P &&
            'values' !== P.name &&
            ((T = !0),
            (_ = function () {
              return P.call(this);
            })),
          (l && !m) || O[y] === _ || c(O, y, _),
          (p[e] = _),
          d)
        )
          if (
            ((w = {
              values: A('values'),
              keys: b ? _ : A('keys'),
              entries: A('entries'),
            }),
            m)
          )
            for (S in w) (h || T || !(S in O)) && s(O, S, w[S]);
          else n({ target: e, proto: !0, forced: h || T }, w);
        return w;
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(182).IteratorPrototype,
        o = r(90),
        i = r(87),
        u = r(92),
        a = r(72),
        c = function () {
          return this;
        };
      t.exports = function (t, e, r) {
        var s = e + ' Iterator';
        return (
          (t.prototype = o(n, { next: i(1, r) })),
          u(t, s, !1, !0),
          (a[s] = c),
          t
        );
      };
    },
    function (t, e, r) {
      var n = r(6);
      t.exports = !n(function () {
        function t() {}
        return (
          (t.prototype.constructor = null),
          Object.getPrototypeOf(new t()) !== t.prototype
        );
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(51),
        o = r(85),
        i = r(49),
        u = r(183),
        a = [].join,
        c = o != Object,
        s = u('join', ',');
      n(
        { target: 'Array', proto: !0, forced: c || !s },
        {
          join: function (t) {
            return a.call(i(this), void 0 === t ? ',' : t);
          },
        }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(51),
        o = r(6),
        i = r(184),
        u = r(16),
        a = r(67),
        c = r(14),
        s = r(52),
        f = i.ArrayBuffer,
        l = i.DataView,
        p = f.prototype.slice;
      n(
        {
          target: 'ArrayBuffer',
          proto: !0,
          unsafe: !0,
          forced: o(function () {
            return !new f(2).slice(1, void 0).byteLength;
          }),
        },
        {
          slice: function (t, e) {
            if (void 0 !== p && void 0 === e) return p.call(u(this), t);
            for (
              var r = u(this).byteLength,
                n = a(t, r),
                o = a(void 0 === e ? r : e, r),
                i = new (s(this, f))(c(o - n)),
                d = new l(this),
                v = new l(i),
                h = 0;
              n < o;

            )
              v.setUint8(h++, d.getUint8(n++));
            return i;
          },
        }
      );
    },
    function (t, e) {
      var r = Math.abs,
        n = Math.pow,
        o = Math.floor,
        i = Math.log,
        u = Math.LN2;
      t.exports = {
        pack: function (t, e, a) {
          var c,
            s,
            f,
            l = new Array(a),
            p = 8 * a - e - 1,
            d = (1 << p) - 1,
            v = d >> 1,
            h = 23 === e ? n(2, -24) - n(2, -77) : 0,
            y = t < 0 || (0 === t && 1 / t < 0) ? 1 : 0,
            g = 0;
          for (
            (t = r(t)) != t || t === 1 / 0
              ? ((s = t != t ? 1 : 0), (c = d))
              : ((c = o(i(t) / u)),
                t * (f = n(2, -c)) < 1 && (c--, (f *= 2)),
                (t += c + v >= 1 ? h / f : h * n(2, 1 - v)) * f >= 2 &&
                  (c++, (f /= 2)),
                c + v >= d
                  ? ((s = 0), (c = d))
                  : c + v >= 1
                  ? ((s = (t * f - 1) * n(2, e)), (c += v))
                  : ((s = t * n(2, v - 1) * n(2, e)), (c = 0)));
            e >= 8;
            l[g++] = 255 & s, s /= 256, e -= 8
          );
          for (
            c = (c << e) | s, p += e;
            p > 0;
            l[g++] = 255 & c, c /= 256, p -= 8
          );
          return (l[--g] |= 128 * y), l;
        },
        unpack: function (t, e) {
          var r,
            o = t.length,
            i = 8 * o - e - 1,
            u = (1 << i) - 1,
            a = u >> 1,
            c = i - 7,
            s = o - 1,
            f = t[s--],
            l = 127 & f;
          for (f >>= 7; c > 0; l = 256 * l + t[s], s--, c -= 8);
          for (
            r = l & ((1 << -c) - 1), l >>= -c, c += e;
            c > 0;
            r = 256 * r + t[s], s--, c -= 8
          );
          if (0 === l) l = 1 - a;
          else {
            if (l === u) return r ? NaN : f ? -1 / 0 : 1 / 0;
            (r += n(2, e)), (l -= a);
          }
          return (f ? -1 : 1) * r * n(2, l - e);
        },
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(15),
        o = r(4),
        i = r(83),
        u = r(28),
        a = r(17),
        c = r(31),
        s = r(118),
        f = r(84),
        l = r(6),
        p = r(90),
        d = r(65).f,
        v = r(69).f,
        h = r(21).f,
        y = r(323).trim,
        g = o.Number,
        b = g.prototype,
        m = 'Number' == c(p(b)),
        x = function (t) {
          var e,
            r,
            n,
            o,
            i,
            u,
            a,
            c,
            s = f(t, !1);
          if ('string' == typeof s && s.length > 2)
            if (43 === (e = (s = y(s)).charCodeAt(0)) || 45 === e) {
              if (88 === (r = s.charCodeAt(2)) || 120 === r) return NaN;
            } else if (48 === e) {
              switch (s.charCodeAt(1)) {
                case 66:
                case 98:
                  (n = 2), (o = 49);
                  break;
                case 79:
                case 111:
                  (n = 8), (o = 55);
                  break;
                default:
                  return +s;
              }
              for (u = (i = s.slice(2)).length, a = 0; a < u; a++)
                if ((c = i.charCodeAt(a)) < 48 || c > o) return NaN;
              return parseInt(i, n);
            }
          return +s;
        };
      if (i('Number', !g(' 0o1') || !g('0b1') || g('+0x1'))) {
        for (
          var w,
            S = function (t) {
              var e = arguments.length < 1 ? 0 : t,
                r = this;
              return r instanceof S &&
                (m
                  ? l(function () {
                      b.valueOf.call(r);
                    })
                  : 'Number' != c(r))
                ? s(new g(x(e)), r, S)
                : x(e);
            },
            A = n
              ? d(g)
              : 'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'.split(
                  ','
                ),
            E = 0;
          A.length > E;
          E++
        )
          a(g, (w = A[E])) && !a(S, w) && h(S, w, v(g, w));
        (S.prototype = b), (b.constructor = S), u(o, 'Number', S);
      }
    },
    function (t, e, r) {
      var n = r(66),
        o = '[' + r(324) + ']',
        i = RegExp('^' + o + o + '*'),
        u = RegExp(o + o + '*$'),
        a = function (t) {
          return function (e) {
            var r = String(n(e));
            return (
              1 & t && (r = r.replace(i, '')),
              2 & t && (r = r.replace(u, '')),
              r
            );
          };
        };
      t.exports = { start: a(1), end: a(2), trim: a(3) };
    },
    function (t, e) {
      t.exports = '\t\n\v\f\r                　\u2028\u2029\ufeff';
    },
    function (t, e, r) {
      'use strict';
      var n = r(133),
        o = r(93);
      t.exports = n
        ? {}.toString
        : function () {
            return '[object ' + o(this) + ']';
          };
    },
    function (t, e, r) {
      'use strict';
      r(88);
      var n = r(28),
        o = r(6),
        i = r(11),
        u = r(129),
        a = r(27),
        c = i('species'),
        s = !o(function () {
          var t = /./;
          return (
            (t.exec = function () {
              var t = [];
              return (t.groups = { a: '7' }), t;
            }),
            '7' !== ''.replace(t, '$<a>')
          );
        }),
        f = '$0' === 'a'.replace(/./, '$0'),
        l = i('replace'),
        p = !!/./[l] && '' === /./[l]('a', '$0'),
        d = !o(function () {
          var t = /(?:)/,
            e = t.exec;
          t.exec = function () {
            return e.apply(this, arguments);
          };
          var r = 'ab'.split(t);
          return 2 !== r.length || 'a' !== r[0] || 'b' !== r[1];
        });
      t.exports = function (t, e, r, l) {
        var v = i(t),
          h = !o(function () {
            var e = {};
            return (
              (e[v] = function () {
                return 7;
              }),
              7 != ''[t](e)
            );
          }),
          y =
            h &&
            !o(function () {
              var e = !1,
                r = /a/;
              return (
                'split' === t &&
                  (((r = {}).constructor = {}),
                  (r.constructor[c] = function () {
                    return r;
                  }),
                  (r.flags = ''),
                  (r[v] = /./[v])),
                (r.exec = function () {
                  return (e = !0), null;
                }),
                r[v](''),
                !e
              );
            });
        if (
          !h ||
          !y ||
          ('replace' === t && (!s || !f || p)) ||
          ('split' === t && !d)
        ) {
          var g = /./[v],
            b = r(
              v,
              ''[t],
              function (t, e, r, n, o) {
                return e.exec === u
                  ? h && !o
                    ? { done: !0, value: g.call(e, r, n) }
                    : { done: !0, value: t.call(r, e, n) }
                  : { done: !1 };
              },
              {
                REPLACE_KEEPS_$0: f,
                REGEXP_REPLACE_SUBSTITUTES_UNDEFINED_CAPTURE: p,
              }
            ),
            m = b[0],
            x = b[1];
          n(String.prototype, t, m),
            n(
              RegExp.prototype,
              v,
              2 == e
                ? function (t, e) {
                    return x.call(t, this, e);
                  }
                : function (t) {
                    return x.call(t, this);
                  }
            );
        }
        l && a(RegExp.prototype[v], 'sham', !0);
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(328).charAt;
      t.exports = function (t, e, r) {
        return e + (r ? n(t, e).length : 1);
      };
    },
    function (t, e, r) {
      var n = r(32),
        o = r(66),
        i = function (t) {
          return function (e, r) {
            var i,
              u,
              a = String(o(e)),
              c = n(r),
              s = a.length;
            return c < 0 || c >= s
              ? t
                ? ''
                : void 0
              : (i = a.charCodeAt(c)) < 55296 ||
                i > 56319 ||
                c + 1 === s ||
                (u = a.charCodeAt(c + 1)) < 56320 ||
                u > 57343
              ? t
                ? a.charAt(c)
                : i
              : t
              ? a.slice(c, c + 2)
              : u - 56320 + ((i - 55296) << 10) + 65536;
          };
        };
      t.exports = { codeAt: i(!1), charAt: i(!0) };
    },
    function (t, e, r) {
      var n = r(31),
        o = r(129);
      t.exports = function (t, e) {
        var r = t.exec;
        if ('function' == typeof r) {
          var i = r.call(t, e);
          if ('object' != typeof i)
            throw TypeError(
              'RegExp exec method returned something other than an Object or null'
            );
          return i;
        }
        if ('RegExp' !== n(t))
          throw TypeError('RegExp#exec called on incompatible receiver');
        return o.call(t, e);
      };
    },
    function (t, e, r) {
      r(331)('Uint8', function (t) {
        return function (e, r, n) {
          return t(this, e, r, n);
        };
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(51),
        o = r(4),
        i = r(15),
        u = r(332),
        a = r(3),
        c = r(184),
        s = r(132),
        f = r(87),
        l = r(27),
        p = r(14),
        d = r(187),
        v = r(191),
        h = r(84),
        y = r(17),
        g = r(93),
        b = r(20),
        m = r(90),
        x = r(64),
        w = r(65).f,
        S = r(334),
        A = r(34).forEach,
        E = r(128),
        T = r(21),
        O = r(69),
        P = r(50),
        _ = r(118),
        I = P.get,
        j = P.set,
        R = T.f,
        C = O.f,
        k = Math.round,
        L = o.RangeError,
        M = c.ArrayBuffer,
        N = c.DataView,
        D = a.NATIVE_ARRAY_BUFFER_VIEWS,
        U = a.TYPED_ARRAY_TAG,
        F = a.TypedArray,
        B = a.TypedArrayPrototype,
        G = a.aTypedArrayConstructor,
        W = a.isTypedArray,
        H = function (t, e) {
          for (var r = 0, n = e.length, o = new (G(t))(n); n > r; )
            o[r] = e[r++];
          return o;
        },
        V = function (t, e) {
          R(t, e, {
            get: function () {
              return I(this)[e];
            },
          });
        },
        K = function (t) {
          var e;
          return (
            t instanceof M ||
            'ArrayBuffer' == (e = g(t)) ||
            'SharedArrayBuffer' == e
          );
        },
        z = function (t, e) {
          return (
            W(t) && 'symbol' != typeof e && e in t && String(+e) == String(e)
          );
        },
        Y = function (t, e) {
          return z(t, (e = h(e, !0))) ? f(2, t[e]) : C(t, e);
        },
        q = function (t, e, r) {
          return !(z(t, (e = h(e, !0))) && b(r) && y(r, 'value')) ||
            y(r, 'get') ||
            y(r, 'set') ||
            r.configurable ||
            (y(r, 'writable') && !r.writable) ||
            (y(r, 'enumerable') && !r.enumerable)
            ? R(t, e, r)
            : ((t[e] = r.value), t);
        };
      i
        ? (D ||
            ((O.f = Y),
            (T.f = q),
            V(B, 'buffer'),
            V(B, 'byteOffset'),
            V(B, 'byteLength'),
            V(B, 'length')),
          n(
            { target: 'Object', stat: !0, forced: !D },
            { getOwnPropertyDescriptor: Y, defineProperty: q }
          ),
          (t.exports = function (t, e, r) {
            var i = t.match(/\d+$/)[0] / 8,
              a = t + (r ? 'Clamped' : '') + 'Array',
              c = 'get' + t,
              f = 'set' + t,
              h = o[a],
              y = h,
              g = y && y.prototype,
              T = {},
              O = function (t, e) {
                R(t, e, {
                  get: function () {
                    return (function (t, e) {
                      var r = I(t);
                      return r.view[c](e * i + r.byteOffset, !0);
                    })(this, e);
                  },
                  set: function (t) {
                    return (function (t, e, n) {
                      var o = I(t);
                      r && (n = (n = k(n)) < 0 ? 0 : n > 255 ? 255 : 255 & n),
                        o.view[f](e * i + o.byteOffset, n, !0);
                    })(this, e, t);
                  },
                  enumerable: !0,
                });
              };
            D
              ? u &&
                ((y = e(function (t, e, r, n) {
                  return (
                    s(t, y, a),
                    _(
                      b(e)
                        ? K(e)
                          ? void 0 !== n
                            ? new h(e, v(r, i), n)
                            : void 0 !== r
                            ? new h(e, v(r, i))
                            : new h(e)
                          : W(e)
                          ? H(y, e)
                          : S.call(y, e)
                        : new h(d(e)),
                      t,
                      y
                    )
                  );
                })),
                x && x(y, F),
                A(w(h), function (t) {
                  t in y || l(y, t, h[t]);
                }),
                (y.prototype = g))
              : ((y = e(function (t, e, r, n) {
                  s(t, y, a);
                  var o,
                    u,
                    c,
                    f = 0,
                    l = 0;
                  if (b(e)) {
                    if (!K(e)) return W(e) ? H(y, e) : S.call(y, e);
                    (o = e), (l = v(r, i));
                    var h = e.byteLength;
                    if (void 0 === n) {
                      if (h % i) throw L('Wrong length');
                      if ((u = h - l) < 0) throw L('Wrong length');
                    } else if ((u = p(n) * i) + l > h) throw L('Wrong length');
                    c = u / i;
                  } else (c = d(e)), (o = new M((u = c * i)));
                  for (
                    j(t, {
                      buffer: o,
                      byteOffset: l,
                      byteLength: u,
                      length: c,
                      view: new N(o),
                    });
                    f < c;

                  )
                    O(t, f++);
                })),
                x && x(y, F),
                (g = y.prototype = m(B))),
              g.constructor !== y && l(g, 'constructor', y),
              U && l(g, U, a),
              (T[a] = y),
              n({ global: !0, forced: y != h, sham: !D }, T),
              'BYTES_PER_ELEMENT' in y || l(y, 'BYTES_PER_ELEMENT', i),
              'BYTES_PER_ELEMENT' in g || l(g, 'BYTES_PER_ELEMENT', i),
              E(a);
          }))
        : (t.exports = function () {});
    },
    function (t, e, r) {
      var n = r(4),
        o = r(6),
        i = r(190),
        u = r(3).NATIVE_ARRAY_BUFFER_VIEWS,
        a = n.ArrayBuffer,
        c = n.Int8Array;
      t.exports =
        !u ||
        !o(function () {
          c(1);
        }) ||
        !o(function () {
          new c(-1);
        }) ||
        !i(function (t) {
          new c(), new c(null), new c(1.5), new c(t);
        }, !0) ||
        o(function () {
          return 1 !== new c(new a(2), 1, void 0).length;
        });
    },
    function (t, e, r) {
      var n = r(32);
      t.exports = function (t) {
        var e = n(t);
        if (e < 0) throw RangeError("The argument can't be less than 0");
        return e;
      };
    },
    function (t, e, r) {
      var n = r(33),
        o = r(14),
        i = r(192),
        u = r(193),
        a = r(94),
        c = r(3).aTypedArrayConstructor;
      t.exports = function (t) {
        var e,
          r,
          s,
          f,
          l,
          p,
          d = n(t),
          v = arguments.length,
          h = v > 1 ? arguments[1] : void 0,
          y = void 0 !== h,
          g = i(d);
        if (null != g && !u(g))
          for (p = (l = g.call(d)).next, d = []; !(f = p.call(l)).done; )
            d.push(f.value);
        for (
          y && v > 2 && (h = a(h, arguments[2], 2)),
            r = o(d.length),
            s = new (c(this))(r),
            e = 0;
          r > e;
          e++
        )
          s[e] = y ? h(d[e], e) : d[e];
        return s;
      };
    },
    function (t, e, r) {
      var n = r(20),
        o = r(336),
        i = r(11)('species');
      t.exports = function (t, e) {
        var r;
        return (
          o(t) &&
            ('function' != typeof (r = t.constructor) ||
            (r !== Array && !o(r.prototype))
              ? n(r) && null === (r = r[i]) && (r = void 0)
              : (r = void 0)),
          new (void 0 === r ? Array : r)(0 === e ? 0 : e)
        );
      };
    },
    function (t, e, r) {
      var n = r(31);
      t.exports =
        Array.isArray ||
        function (t) {
          return 'Array' == n(t);
        };
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(338),
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('copyWithin', function (t, e) {
        return o.call(
          i(this),
          t,
          e,
          arguments.length > 2 ? arguments[2] : void 0
        );
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(33),
        o = r(67),
        i = r(14),
        u = Math.min;
      t.exports =
        [].copyWithin ||
        function (t, e) {
          var r = n(this),
            a = i(r.length),
            c = o(t, a),
            s = o(e, a),
            f = arguments.length > 2 ? arguments[2] : void 0,
            l = u((void 0 === f ? a : o(f, a)) - s, a - c),
            p = 1;
          for (
            s < c && c < s + l && ((p = -1), (s += l - 1), (c += l - 1));
            l-- > 0;

          )
            s in r ? (r[c] = r[s]) : delete r[c], (c += p), (s += p);
          return r;
        };
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).every,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('every', function (t) {
        return o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(188),
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('fill', function (t) {
        return o.apply(i(this), arguments);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).filter,
        i = r(52),
        u = n.aTypedArray,
        a = n.aTypedArrayConstructor;
      (0, n.exportTypedArrayMethod)('filter', function (t) {
        for (
          var e = o(u(this), t, arguments.length > 1 ? arguments[1] : void 0),
            r = i(this, this.constructor),
            n = 0,
            c = e.length,
            s = new (a(r))(c);
          c > n;

        )
          s[n] = e[n++];
        return s;
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).find,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('find', function (t) {
        return o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).findIndex,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('findIndex', function (t) {
        return o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).forEach,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('forEach', function (t) {
        o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(120).includes,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('includes', function (t) {
        return o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(120).indexOf,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('indexOf', function (t) {
        return o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(4),
        o = r(3),
        i = r(180),
        u = r(11)('iterator'),
        a = n.Uint8Array,
        c = i.values,
        s = i.keys,
        f = i.entries,
        l = o.aTypedArray,
        p = o.exportTypedArrayMethod,
        d = a && a.prototype[u],
        v = !!d && ('values' == d.name || null == d.name),
        h = function () {
          return c.call(l(this));
        };
      p('entries', function () {
        return f.call(l(this));
      }),
        p('keys', function () {
          return s.call(l(this));
        }),
        p('values', h, !v),
        p(u, h, !v);
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = n.aTypedArray,
        i = n.exportTypedArrayMethod,
        u = [].join;
      i('join', function (t) {
        return u.apply(o(this), arguments);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(350),
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('lastIndexOf', function (t) {
        return o.apply(i(this), arguments);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(49),
        o = r(32),
        i = r(14),
        u = r(183),
        a = r(351),
        c = Math.min,
        s = [].lastIndexOf,
        f = !!s && 1 / [1].lastIndexOf(1, -0) < 0,
        l = u('lastIndexOf'),
        p = a('indexOf', { ACCESSORS: !0, 1: 0 }),
        d = f || !l || !p;
      t.exports = d
        ? function (t) {
            if (f) return s.apply(this, arguments) || 0;
            var e = n(this),
              r = i(e.length),
              u = r - 1;
            for (
              arguments.length > 1 && (u = c(u, o(arguments[1]))),
                u < 0 && (u = r + u);
              u >= 0;
              u--
            )
              if (u in e && e[u] === t) return u || 0;
            return -1;
          }
        : s;
    },
    function (t, e, r) {
      var n = r(15),
        o = r(6),
        i = r(17),
        u = Object.defineProperty,
        a = {},
        c = function (t) {
          throw t;
        };
      t.exports = function (t, e) {
        if (i(a, t)) return a[t];
        e || (e = {});
        var r = [][t],
          s = !!i(e, 'ACCESSORS') && e.ACCESSORS,
          f = i(e, 0) ? e[0] : c,
          l = i(e, 1) ? e[1] : void 0;
        return (a[t] =
          !!r &&
          !o(function () {
            if (s && !n) return !0;
            var t = { length: -1 };
            s ? u(t, 1, { enumerable: !0, get: c }) : (t[1] = 1),
              r.call(t, f, l);
          }));
      };
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).map,
        i = r(52),
        u = n.aTypedArray,
        a = n.aTypedArrayConstructor;
      (0, n.exportTypedArrayMethod)('map', function (t) {
        return o(
          u(this),
          t,
          arguments.length > 1 ? arguments[1] : void 0,
          function (t, e) {
            return new (a(i(t, t.constructor)))(e);
          }
        );
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(194).left,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('reduce', function (t) {
        return o(
          i(this),
          t,
          arguments.length,
          arguments.length > 1 ? arguments[1] : void 0
        );
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(194).right,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('reduceRight', function (t) {
        return o(
          i(this),
          t,
          arguments.length,
          arguments.length > 1 ? arguments[1] : void 0
        );
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = n.aTypedArray,
        i = n.exportTypedArrayMethod,
        u = Math.floor;
      i('reverse', function () {
        for (var t, e = o(this).length, r = u(e / 2), n = 0; n < r; )
          (t = this[n]), (this[n++] = this[--e]), (this[e] = t);
        return this;
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(14),
        i = r(191),
        u = r(33),
        a = r(6),
        c = n.aTypedArray;
      (0, n.exportTypedArrayMethod)(
        'set',
        function (t) {
          c(this);
          var e = i(arguments.length > 1 ? arguments[1] : void 0, 1),
            r = this.length,
            n = u(t),
            a = o(n.length),
            s = 0;
          if (a + e > r) throw RangeError('Wrong length');
          for (; s < a; ) this[e + s] = n[s++];
        },
        a(function () {
          new Int8Array(1).set({});
        })
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(52),
        i = r(6),
        u = n.aTypedArray,
        a = n.aTypedArrayConstructor,
        c = n.exportTypedArrayMethod,
        s = [].slice;
      c(
        'slice',
        function (t, e) {
          for (
            var r = s.call(u(this), t, e),
              n = o(this, this.constructor),
              i = 0,
              c = r.length,
              f = new (a(n))(c);
            c > i;

          )
            f[i] = r[i++];
          return f;
        },
        i(function () {
          new Int8Array(1).slice();
        })
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(34).some,
        i = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('some', function (t) {
        return o(i(this), t, arguments.length > 1 ? arguments[1] : void 0);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = n.aTypedArray,
        i = n.exportTypedArrayMethod,
        u = [].sort;
      i('sort', function (t) {
        return u.call(o(this), t);
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(3),
        o = r(14),
        i = r(67),
        u = r(52),
        a = n.aTypedArray;
      (0, n.exportTypedArrayMethod)('subarray', function (t, e) {
        var r = a(this),
          n = r.length,
          c = i(t, n);
        return new (u(r, r.constructor))(
          r.buffer,
          r.byteOffset + c * r.BYTES_PER_ELEMENT,
          o((void 0 === e ? n : i(e, n)) - c)
        );
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(4),
        o = r(3),
        i = r(6),
        u = n.Int8Array,
        a = o.aTypedArray,
        c = o.exportTypedArrayMethod,
        s = [].toLocaleString,
        f = [].slice,
        l =
          !!u &&
          i(function () {
            s.call(new u(1));
          });
      c(
        'toLocaleString',
        function () {
          return s.apply(l ? f.call(a(this)) : a(this), arguments);
        },
        i(function () {
          return [1, 2].toLocaleString() != new u([1, 2]).toLocaleString();
        }) ||
          !i(function () {
            u.prototype.toLocaleString.call([1, 2]);
          })
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(3).exportTypedArrayMethod,
        o = r(6),
        i = r(4).Uint8Array,
        u = (i && i.prototype) || {},
        a = [].toString,
        c = [].join;
      o(function () {
        a.call({});
      }) &&
        (a = function () {
          return c.call(this);
        });
      var s = u.toString != a;
      n('toString', a, s);
    },
    function (t, e, r) {
      t.exports = r(364);
    },
    function (t, e, r) {
      r(81);
      var n = r(365),
        o = r(80),
        i = Array.prototype,
        u = { DOMTokenList: !0, NodeList: !0 };
      t.exports = function (t) {
        var e = t.forEach;
        return t === i ||
          (t instanceof Array && e === i.forEach) ||
          u.hasOwnProperty(o(t))
          ? n
          : e;
      };
    },
    function (t, e, r) {
      var n = r(366);
      t.exports = n;
    },
    function (t, e, r) {
      r(367);
      var n = r(26);
      t.exports = n('Array').forEach;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(368);
      n(
        { target: 'Array', proto: !0, forced: [].forEach != o },
        { forEach: o }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(61).forEach,
        o = r(369),
        i = r(71),
        u = o('forEach'),
        a = i('forEach');
      t.exports =
        u && a
          ? [].forEach
          : function (t) {
              return n(this, t, arguments.length > 1 ? arguments[1] : void 0);
            };
    },
    function (t, e, r) {
      'use strict';
      var n = r(8);
      t.exports = function (t, e) {
        var r = [][t];
        return (
          !!r &&
          n(function () {
            r.call(
              null,
              e ||
                function () {
                  throw 1;
                },
              1
            );
          })
        );
      };
    },
    function (t, e, r) {
      t.exports = r(371);
    },
    function (t, e, r) {
      var n = r(372);
      t.exports = n;
    },
    function (t, e, r) {
      r(373), r(110), r(102), r(81);
      var n = r(5);
      t.exports = n.Map;
    },
    function (t, e, r) {
      'use strict';
      var n = r(374),
        o = r(376);
      t.exports = n(
        'Map',
        function (t) {
          return function () {
            return t(this, arguments.length ? arguments[0] : void 0);
          };
        },
        o
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(7),
        i = r(195),
        u = r(8),
        a = r(24),
        c = r(62),
        s = r(111),
        f = r(13),
        l = r(39),
        p = r(22).f,
        d = r(61).forEach,
        v = r(12),
        h = r(45),
        y = h.set,
        g = h.getterFor;
      t.exports = function (t, e, r) {
        var h,
          b = -1 !== t.indexOf('Map'),
          m = -1 !== t.indexOf('Weak'),
          x = b ? 'set' : 'add',
          w = o[t],
          S = w && w.prototype,
          A = {};
        if (
          v &&
          'function' == typeof w &&
          (m ||
            (S.forEach &&
              !u(function () {
                new w().entries().next();
              })))
        ) {
          h = e(function (e, r) {
            y(s(e, h, t), { type: t, collection: new w() }),
              null != r && c(r, e[x], e, b);
          });
          var E = g(t);
          d(
            [
              'add',
              'clear',
              'delete',
              'forEach',
              'get',
              'has',
              'set',
              'keys',
              'values',
              'entries',
            ],
            function (t) {
              var e = 'add' == t || 'set' == t;
              !(t in S) ||
                (m && 'clear' == t) ||
                a(h.prototype, t, function (r, n) {
                  var o = E(this).collection;
                  if (!e && m && !f(r)) return 'get' == t && void 0;
                  var i = o[t](0 === r ? 0 : r, n);
                  return e ? this : i;
                });
            }
          ),
            m ||
              p(h.prototype, 'size', {
                configurable: !0,
                get: function () {
                  return E(this).collection.size;
                },
              });
        } else (h = r.getConstructor(e, t, b, x)), (i.REQUIRED = !0);
        return (
          l(h, t, !1, !0),
          (A[t] = h),
          n({ global: !0, forced: !0 }, A),
          m || r.setStrong(h, t, b),
          h
        );
      };
    },
    function (t, e, r) {
      var n = r(8);
      t.exports = !n(function () {
        return Object.isExtensible(Object.preventExtensions({}));
      });
    },
    function (t, e, r) {
      'use strict';
      var n = r(22).f,
        o = r(79),
        i = r(160),
        u = r(56),
        a = r(111),
        c = r(62),
        s = r(104),
        f = r(161),
        l = r(12),
        p = r(195).fastKey,
        d = r(45),
        v = d.set,
        h = d.getterFor;
      t.exports = {
        getConstructor: function (t, e, r, s) {
          var f = t(function (t, n) {
              a(t, f, e),
                v(t, {
                  type: e,
                  index: o(null),
                  first: void 0,
                  last: void 0,
                  size: 0,
                }),
                l || (t.size = 0),
                null != n && c(n, t[s], t, r);
            }),
            d = h(e),
            y = function (t, e, r) {
              var n,
                o,
                i = d(t),
                u = g(t, e);
              return (
                u
                  ? (u.value = r)
                  : ((i.last = u =
                      {
                        index: (o = p(e, !0)),
                        key: e,
                        value: r,
                        previous: (n = i.last),
                        next: void 0,
                        removed: !1,
                      }),
                    i.first || (i.first = u),
                    n && (n.next = u),
                    l ? i.size++ : t.size++,
                    'F' !== o && (i.index[o] = u)),
                t
              );
            },
            g = function (t, e) {
              var r,
                n = d(t),
                o = p(e);
              if ('F' !== o) return n.index[o];
              for (r = n.first; r; r = r.next) if (r.key == e) return r;
            };
          return (
            i(f.prototype, {
              clear: function () {
                for (var t = d(this), e = t.index, r = t.first; r; )
                  (r.removed = !0),
                    r.previous && (r.previous = r.previous.next = void 0),
                    delete e[r.index],
                    (r = r.next);
                (t.first = t.last = void 0), l ? (t.size = 0) : (this.size = 0);
              },
              delete: function (t) {
                var e = d(this),
                  r = g(this, t);
                if (r) {
                  var n = r.next,
                    o = r.previous;
                  delete e.index[r.index],
                    (r.removed = !0),
                    o && (o.next = n),
                    n && (n.previous = o),
                    e.first == r && (e.first = n),
                    e.last == r && (e.last = o),
                    l ? e.size-- : this.size--;
                }
                return !!r;
              },
              forEach: function (t) {
                for (
                  var e,
                    r = d(this),
                    n = u(t, arguments.length > 1 ? arguments[1] : void 0, 3);
                  (e = e ? e.next : r.first);

                )
                  for (n(e.value, e.key, this); e && e.removed; )
                    e = e.previous;
              },
              has: function (t) {
                return !!g(this, t);
              },
            }),
            i(
              f.prototype,
              r
                ? {
                    get: function (t) {
                      var e = g(this, t);
                      return e && e.value;
                    },
                    set: function (t, e) {
                      return y(this, 0 === t ? 0 : t, e);
                    },
                  }
                : {
                    add: function (t) {
                      return y(this, (t = 0 === t ? 0 : t), t);
                    },
                  }
            ),
            l &&
              n(f.prototype, 'size', {
                get: function () {
                  return d(this).size;
                },
              }),
            f
          );
        },
        setStrong: function (t, e, r) {
          var n = e + ' Iterator',
            o = h(e),
            i = h(n);
          s(
            t,
            e,
            function (t, e) {
              v(this, {
                type: n,
                target: t,
                state: o(t),
                kind: e,
                last: void 0,
              });
            },
            function () {
              for (var t = i(this), e = t.kind, r = t.last; r && r.removed; )
                r = r.previous;
              return t.target && (t.last = r = r ? r.next : t.state.first)
                ? 'keys' == e
                  ? { value: r.key, done: !1 }
                  : 'values' == e
                  ? { value: r.value, done: !1 }
                  : { value: [r.key, r.value], done: !1 }
                : ((t.target = void 0), { value: void 0, done: !0 });
            },
            r ? 'entries' : 'values',
            !r,
            !0
          ),
            f(e);
        },
      };
    },
    function (t, e, r) {
      t.exports = r(378);
    },
    function (t, e, r) {
      var n = r(379);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(380),
        o = Array.prototype;
      t.exports = function (t) {
        var e = t.map;
        return t === o || (t instanceof Array && e === o.map) ? n : e;
      };
    },
    function (t, e, r) {
      r(381);
      var n = r(26);
      t.exports = n('Array').map;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(61).map,
        i = r(82),
        u = r(71),
        a = i('map'),
        c = u('map');
      n(
        { target: 'Array', proto: !0, forced: !a || !c },
        {
          map: function (t) {
            return o(this, t, arguments.length > 1 ? arguments[1] : void 0);
          },
        }
      );
    },
    function (t, e, r) {
      t.exports = r(383);
    },
    function (t, e, r) {
      var n = r(384);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(385),
        o = Array.prototype;
      t.exports = function (t) {
        var e = t.filter;
        return t === o || (t instanceof Array && e === o.filter) ? n : e;
      };
    },
    function (t, e, r) {
      r(386);
      var n = r(26);
      t.exports = n('Array').filter;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(61).filter,
        i = r(82),
        u = r(71),
        a = i('filter'),
        c = u('filter');
      n(
        { target: 'Array', proto: !0, forced: !a || !c },
        {
          filter: function (t) {
            return o(this, t, arguments.length > 1 ? arguments[1] : void 0);
          },
        }
      );
    },
    function (t, e, r) {
      t.exports = r(388);
    },
    function (t, e, r) {
      var n = r(389);
      t.exports = n;
    },
    function (t, e, r) {
      r(152), r(390);
      var n = r(5);
      t.exports = n.Object.fromEntries;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(62),
        i = r(107);
      n(
        { target: 'Object', stat: !0 },
        {
          fromEntries: function (t) {
            var e = {};
            return (
              o(
                t,
                function (t, r) {
                  i(e, t, r);
                },
                void 0,
                !0
              ),
              e
            );
          },
        }
      );
    },
    function (t, e, r) {
      t.exports = r(392);
    },
    function (t, e, r) {
      var n = r(393);
      t.exports = n;
    },
    function (t, e, r) {
      r(394);
      var n = r(5);
      t.exports = n.Object.keys;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(46),
        i = r(58);
      n(
        {
          target: 'Object',
          stat: !0,
          forced: r(8)(function () {
            i(1);
          }),
        },
        {
          keys: function (t) {
            return i(o(t));
          },
        }
      );
    },
    function (t, e, r) {
      'use strict';
      var n,
        o = r(1),
        i = o(r(117)),
        u = o(r(2)),
        a = o(r(135)),
        c = function () {
          return (c =
            a.default ||
            function (t) {
              for (var e, r = 1, n = arguments.length; r < n; r++)
                for (var o in (e = arguments[r]))
                  Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
              return t;
            }).apply(this, arguments);
        },
        s = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, u.default)(e, '__esModule', { value: !0 });
      var f = r(19),
        l = r(130),
        p = s(r(63)),
        d = r(95),
        v = r(53),
        h = r(23),
        y = {
          ClientId: p.default.DEFAULT_CLIENT_ID,
          SessionId: '',
          LogLevel: void 0,
          MaxDataPointsPerHeartbeat: 1e4,
          HeartbeatInterval: 5e3,
          SessionTimeout: 18e5,
          RecordMetadata: !0,
          ConfigReceivedTime: 0,
        },
        g = {
          ClientId: f.isString,
          SessionId: f.isString,
          LogLevel: (0, i.default)((n = f.isEnum)).call(n, null, l.LogLevel),
          MaxDataPointsPerHeartbeat: f.isPositiveInteger,
          HeartbeatInterval: f.isPositiveInteger,
          SessionTimeout: f.isPositiveInteger,
          RecordMetadata: f.isBoolean,
          ConfigReceivedTime: f.isInteger,
        },
        b = (function () {
          function t(t, e, r) {
            (this.tabStore = t),
              (this.apiKey = e),
              (this.apiAuth = r),
              (this.configuration = this.buildConfiguration());
          }
          return (
            (t.prototype.buildConfiguration = function () {
              return c(
                c(
                  {},
                  d.getValuesOrDefaults(this.tabStore.get('config') || {}, y, g)
                ),
                {
                  LastServerResponseTime: d.getValueOrDefault(
                    this.tabStore.get('srt'),
                    0,
                    f.isInteger
                  ),
                  ApiKey: this.apiKey,
                  ApiAuth: this.apiAuth,
                }
              );
            }),
            (t.prototype.isSessionTimedOut = function () {
              return (
                v.getTime() - this.configuration.LastServerResponseTime >
                this.configuration.SessionTimeout
              );
            }),
            (t.prototype.get = function (t) {
              return this.configuration[t];
            }),
            (t.prototype.fillWithJson = function (t) {
              t.ConfigReceivedTime = v.getTime();
              var e = function (e) {
                if (!(e in t))
                  throw new h.SNError(e + ' is missing from config response!');
              };
              e('ClientId'),
                e('HeartbeatInterval'),
                e('SessionTimeout'),
                e('MaxDataPointsPerHeartbeat'),
                this.tabStore.set('config', t),
                (this.configuration = this.buildConfiguration());
            }),
            (t.prototype.isSessionAlive = function () {
              return (
                Boolean(this.configuration.SessionId) &&
                !this.isSessionTimedOut()
              );
            }),
            (t.prototype.deleteData = function () {
              this.tabStore.remove('srt'),
                this.tabStore.remove('config'),
                (this.configuration = this.buildConfiguration());
            }),
            (t.prototype.updateServerResponseTime = function () {
              var t = v.getTime();
              (this.configuration.LastServerResponseTime = t),
                this.tabStore.set('srt', t);
            }),
            t
          );
        })();
      e.default = b;
    },
    function (t, e, r) {
      var n = r(397);
      t.exports = n;
    },
    function (t, e, r) {
      r(398);
      var n = r(5);
      t.exports = n.Object.assign;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(399);
      n(
        { target: 'Object', stat: !0, forced: Object.assign !== o },
        { assign: o }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(12),
        o = r(8),
        i = r(58),
        u = r(158),
        a = r(75),
        c = r(46),
        s = r(97),
        f = Object.assign,
        l = Object.defineProperty;
      t.exports =
        !f ||
        o(function () {
          if (
            n &&
            1 !==
              f(
                { b: 1 },
                f(
                  l({}, 'a', {
                    enumerable: !0,
                    get: function () {
                      l(this, 'b', { value: 3, enumerable: !1 });
                    },
                  }),
                  { b: 2 }
                )
              ).b
          )
            return !0;
          var t = {},
            e = {},
            r = Symbol();
          return (
            (t[r] = 7),
            'abcdefghijklmnopqrst'.split('').forEach(function (t) {
              e[t] = t;
            }),
            7 != f({}, t)[r] || 'abcdefghijklmnopqrst' != i(f({}, e)).join('')
          );
        })
          ? function (t, e) {
              for (
                var r = c(t), o = arguments.length, f = 1, l = u.f, p = a.f;
                o > f;

              )
                for (
                  var d,
                    v = s(arguments[f++]),
                    h = l ? i(v).concat(l(v)) : i(v),
                    y = h.length,
                    g = 0;
                  y > g;

                )
                  (d = h[g++]), (n && !p.call(v, d)) || (r[d] = v[d]);
              return r;
            }
          : f;
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(131);
      var o = n(r(196)),
        i = n(r(2)),
        u = n(r(135)),
        a = function () {
          return (a =
            u.default ||
            function (t) {
              for (var e, r = 1, n = arguments.length; r < n; r++)
                for (var o in (e = arguments[r]))
                  Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
              return t;
            }).apply(this, arguments);
        };
      (0, i.default)(e, '__esModule', { value: !0 });
      var c = r(405),
        s = r(53),
        f = r(19),
        l = r(95),
        p = r(136),
        d = (function () {
          function t(t) {
            this.tabStore = t;
          }
          return (
            (t.prototype.get = function () {
              return this.tabStore.get('data') || [];
            }),
            (t.prototype.set = function (t) {
              this.tabStore.set('data', t);
            }),
            (t.prototype.add = function (t, e, r) {
              var n,
                o = void 0 === r ? {} : r,
                i = o.properties,
                u = o.systemProperties,
                d =
                  (((n = {})[c.DataPointField.type] = t),
                  (n[c.DataPointField.timestamp] = s.getUniqueTime()),
                  (n[c.DataPointField.name] = e),
                  n);
              f.isDefined(u) &&
                (u = a(
                  {},
                  l.mapKeys(u, function (t, e) {
                    return p.addSystemPropertyPrefix(e);
                  })
                ));
              var v = a(a({}, u), i);
              l.isEmptyObject(v) || (d[c.DataPointField.properties] = v);
              var h = this.get();
              h.push(d), this.set(h);
            }),
            (t.prototype.deleteAll = function () {
              this.tabStore.remove('data');
            }),
            (t.prototype.deleteByCount = function (t) {
              var e;
              this.set((0, o.default)((e = this.get())).call(e, t));
            }),
            (t.prototype.select = function (t) {
              var e;
              return (0, o.default)((e = this.get())).call(e, 0, t);
            }),
            t
          );
        })();
      e.default = d;
    },
    function (t, e, r) {
      var n = r(402);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(403),
        o = Array.prototype;
      t.exports = function (t) {
        var e = t.slice;
        return t === o || (t instanceof Array && e === o.slice) ? n : e;
      };
    },
    function (t, e, r) {
      r(404);
      var n = r(26);
      t.exports = n('Array').slice;
    },
    function (t, e, r) {
      'use strict';
      var n = r(0),
        o = r(13),
        i = r(60),
        u = r(149),
        a = r(47),
        c = r(29),
        s = r(107),
        f = r(9),
        l = r(82),
        p = r(71),
        d = l('slice'),
        v = p('slice', { ACCESSORS: !0, 0: 0, 1: 2 }),
        h = f('species'),
        y = [].slice,
        g = Math.max;
      n(
        { target: 'Array', proto: !0, forced: !d || !v },
        {
          slice: function (t, e) {
            var r,
              n,
              f,
              l = c(this),
              p = a(l.length),
              d = u(t, p),
              v = u(void 0 === e ? p : e, p);
            if (
              i(l) &&
              ('function' != typeof (r = l.constructor) ||
              (r !== Array && !i(r.prototype))
                ? o(r) && null === (r = r[h]) && (r = void 0)
                : (r = void 0),
              r === Array || void 0 === r)
            )
              return y.call(l, d, v);
            for (
              n = new (void 0 === r ? Array : r)(g(v - d, 0)), f = 0;
              d < v;
              d++, f++
            )
              d in l && s(n, f, l[d]);
            return (n.length = f), n;
          },
        }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(131),
        (0, n(r(2)).default)(e, '__esModule', { value: !0 }),
        (function (t) {
          (t.type = 't'),
            (t.timestamp = 'd'),
            (t.name = 'n'),
            (t.properties = 'p');
        })(e.DataPointField || (e.DataPointField = {}));
    },
    function (t, e, r) {
      t.exports = r(407);
    },
    function (t, e, r) {
      var n = r(408);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(409),
        o = String.prototype;
      t.exports = function (t) {
        var e = t.startsWith;
        return 'string' == typeof t ||
          t === o ||
          (t instanceof String && e === o.startsWith)
          ? n
          : e;
      };
    },
    function (t, e, r) {
      r(410);
      var n = r(26);
      t.exports = n('String').startsWith;
    },
    function (t, e, r) {
      'use strict';
      var n,
        o = r(0),
        i = r(54).f,
        u = r(47),
        a = r(176),
        c = r(43),
        s = r(177),
        f = r(37),
        l = ''.startsWith,
        p = Math.min,
        d = s('startsWith');
      o(
        {
          target: 'String',
          proto: !0,
          forced:
            !!(
              f ||
              d ||
              ((n = i(String.prototype, 'startsWith')), !n || n.writable)
            ) && !d,
        },
        {
          startsWith: function (t) {
            var e = String(c(this));
            a(t);
            var r = u(
                p(arguments.length > 1 ? arguments[1] : void 0, e.length)
              ),
              n = String(t);
            return l ? l.call(e, n, r) : e.slice(r, r + n.length) === n;
          },
        }
      );
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(2)),
        i = n(r(36)),
        u = n(r(40)),
        a = n(r(41)),
        c = function (t, e, r, n) {
          return new (r || (r = a.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        s = function (t, e) {
          var r,
            n,
            o,
            a,
            c = {
              label: 0,
              sent: function () {
                if (1 & o[0]) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (a = { next: s(0), throw: s(1), return: s(2) }),
            'function' == typeof u.default &&
              (a[i.default] = function () {
                return this;
              }),
            a
          );
          function s(i) {
            return function (u) {
              return (function (i) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; c; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (o =
                          2 & i[0]
                            ? n.return
                            : i[0]
                            ? n.throw || ((o = n.return) && o.call(n), 0)
                            : n.next) &&
                        !(o = o.call(n, i[1])).done)
                    )
                      return o;
                    switch (((n = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return c.label++, { value: i[1], done: !1 };
                      case 5:
                        c.label++, (n = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = c.ops.pop()), c.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = c.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          c = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          c.label = i[1];
                          break;
                        }
                        if (6 === i[0] && c.label < o[1]) {
                          (c.label = o[1]), (o = i);
                          break;
                        }
                        if (o && c.label < o[2]) {
                          (c.label = o[2]), c.ops.push(i);
                          break;
                        }
                        o[2] && c.ops.pop(), c.trys.pop();
                        continue;
                    }
                    i = e.call(t, c);
                  } catch (t) {
                    (i = [6, t]), (n = 0);
                  } finally {
                    r = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, u]);
            };
          }
        },
        f = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, o.default)(e, '__esModule', { value: !0 });
      var l = f(r(412)),
        p = r(89),
        d = new l.default('create-browser-id'),
        v = (function () {
          function t(t) {
            this.browserStore = t;
          }
          return (
            (t.prototype.get = function () {
              return this.browserStore.get('browser');
            }),
            (t.prototype.getOrCreate = function () {
              return c(this, void 0, void 0, function () {
                var t, e;
                return s(this, function (r) {
                  switch (r.label) {
                    case 0:
                      return (t = this.get()) ? [3, 2] : [4, d.acquire()];
                    case 1:
                      (e = r.sent()),
                        (t = this.get()) ||
                          ((t = p.getGuid()),
                          this.browserStore.set('browser', t)),
                        e.release(),
                        (r.label = 2);
                    case 2:
                      return [2, t];
                  }
                });
              });
            }),
            t
          );
        })();
      e.default = v;
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(74), r(70);
      var o = n(r(137)),
        i = n(r(117)),
        u = n(r(416)),
        a = n(r(196)),
        c = n(r(2)),
        s = n(r(36)),
        f = n(r(40)),
        l = n(r(41)),
        p = function (t, e, r, n) {
          return new (r || (r = l.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        d = function (t, e) {
          var r,
            n,
            o,
            i,
            u = {
              label: 0,
              sent: function () {
                if (1 & o[0]) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (i = { next: a(0), throw: a(1), return: a(2) }),
            'function' == typeof f.default &&
              (i[s.default] = function () {
                return this;
              }),
            i
          );
          function a(i) {
            return function (a) {
              return (function (i) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; u; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (o =
                          2 & i[0]
                            ? n.return
                            : i[0]
                            ? n.throw || ((o = n.return) && o.call(n), 0)
                            : n.next) &&
                        !(o = o.call(n, i[1])).done)
                    )
                      return o;
                    switch (((n = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return u.label++, { value: i[1], done: !1 };
                      case 5:
                        u.label++, (n = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = u.ops.pop()), u.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = u.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          u = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          u.label = i[1];
                          break;
                        }
                        if (6 === i[0] && u.label < o[1]) {
                          (u.label = o[1]), (o = i);
                          break;
                        }
                        if (o && u.label < o[2]) {
                          (u.label = o[2]), u.ops.push(i);
                          break;
                        }
                        o[2] && u.ops.pop(), u.trys.pop();
                        continue;
                    }
                    i = e.call(t, u);
                  } catch (t) {
                    (i = [6, t]), (n = 0);
                  } finally {
                    r = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, a]);
            };
          }
        },
        v = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, c.default)(e, '__esModule', { value: !0 });
      var h = r(23),
        y = v(r(25)),
        g = r(53),
        b = function (t) {
          return (
            void 0 === t && (t = 0),
            new l.default(function (e) {
              return (0, u.default)(e, t);
            })
          );
        },
        m = (function () {
          function t(t, e) {
            if (
              (void 0 === e && (e = 3e3),
              (this.key = t),
              (this.expiry = e),
              (this.id = (function t() {
                var e,
                  r = Math.random();
                return r
                  ? (0, a.default)((e = r.toString(36))).call(e, 2)
                  : t();
              })()),
              (this.localStorage = window.localStorage),
              this.expiry < 100)
            )
              throw new Error('Lock should have a minimum expiry of 100ms');
          }
          return (
            (t.prototype.lockName = function (t) {
              return 'sn:' + this.key + t;
            }),
            (0, c.default)(t.prototype, 'outerLock', {
              get: function () {
                return this.lockName(':X');
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, c.default)(t.prototype, 'innerLock', {
              get: function () {
                return this.lockName(':Y');
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.tryGetLock = function () {
              return p(this, void 0, void 0, function () {
                return d(this, function (t) {
                  switch (t.label) {
                    case 0:
                      return (
                        this.setLockHolder(this.outerLock),
                        this.getLockHolderIdAndRemoveExpired(this.innerLock)
                          ? [2, !1]
                          : (this.setLockHolder(this.innerLock), [4, b()])
                      );
                    case 1:
                      return (
                        t.sent(),
                        this.getLockHolderIdAndRemoveExpired(this.outerLock) ===
                        this.id
                          ? [2, !0]
                          : [4, b(50)]
                      );
                    case 2:
                      return (
                        t.sent(),
                        [
                          2,
                          this.getLockHolderIdAndRemoveExpired(
                            this.innerLock
                          ) === this.id,
                        ]
                      );
                  }
                });
              });
            }),
            (t.prototype.acquire = function () {
              return p(this, void 0, void 0, function () {
                var t;
                return d(this, function (e) {
                  switch (e.label) {
                    case 0:
                      (t = g.getTime()), (e.label = 1);
                    case 1:
                      return g.getTime() - t < this.expiry
                        ? [4, this.tryGetLock()]
                        : [3, 4];
                    case 2:
                      var r;
                      return e.sent()
                        ? (y.default.debug("Lock '" + this.key + "' acquired"),
                          [
                            2,
                            {
                              release: (0, i.default)((r = this.release)).call(
                                r,
                                this
                              ),
                            },
                          ])
                        : [4, b(25 * Math.random())];
                    case 3:
                      return e.sent(), [3, 1];
                    case 4:
                      throw new h.SNError(
                        'Lock could not be acquired within ' +
                          this.expiry +
                          'ms'
                      );
                  }
                });
              });
            }),
            (t.prototype.release = function () {
              this.localStorage.removeItem(this.outerLock),
                this.localStorage.removeItem(this.innerLock),
                y.default.debug("Lock '" + this.key + "' released");
            }),
            (t.prototype.setLockHolder = function (t) {
              var e = { id: this.id, expiresAt: g.getTime() + this.expiry };
              this.localStorage.setItem(t, (0, o.default)(e));
            }),
            (t.prototype.getLockHolderIdAndRemoveExpired = function (t) {
              var e = this.localStorage.getItem(t);
              if (e) {
                var r = JSON.parse(e);
                if (!(g.getTime() > r.expiresAt)) return r.id;
                this.localStorage.removeItem(t);
              }
            }),
            t
          );
        })();
      e.default = m;
    },
    function (t, e, r) {
      var n = r(414);
      t.exports = n;
    },
    function (t, e, r) {
      r(415);
      var n = r(5);
      n.JSON || (n.JSON = { stringify: JSON.stringify }),
        (t.exports = function (t, e, r) {
          return n.JSON.stringify.apply(null, arguments);
        });
    },
    function (t, e, r) {
      var n = r(0),
        o = r(38),
        i = r(8),
        u = o('JSON', 'stringify'),
        a = /[\uD800-\uDFFF]/g,
        c = /^[\uD800-\uDBFF]$/,
        s = /^[\uDC00-\uDFFF]$/,
        f = function (t, e, r) {
          var n = r.charAt(e - 1),
            o = r.charAt(e + 1);
          return (c.test(t) && !s.test(o)) || (s.test(t) && !c.test(n))
            ? '\\u' + t.charCodeAt(0).toString(16)
            : t;
        },
        l = i(function () {
          return (
            '"\\udf06\\ud834"' !== u('\udf06\ud834') ||
            '"\\udead"' !== u('\udead')
          );
        });
      u &&
        n(
          { target: 'JSON', stat: !0, forced: l },
          {
            stringify: function (t, e, r) {
              var n = u.apply(null, arguments);
              return 'string' == typeof n ? n.replace(a, f) : n;
            },
          }
        );
    },
    function (t, e, r) {
      t.exports = r(417);
    },
    function (t, e, r) {
      r(418);
      var n = r(5);
      t.exports = n.setTimeout;
    },
    function (t, e, r) {
      var n = r(0),
        o = r(7),
        i = r(109),
        u = [].slice,
        a = function (t) {
          return function (e, r) {
            var n = arguments.length > 2,
              o = n ? u.call(arguments, 2) : void 0;
            return t(
              n
                ? function () {
                    ('function' == typeof e ? e : Function(e)).apply(this, o);
                  }
                : e,
              r
            );
          };
        };
      n(
        { global: !0, bind: !0, forced: /MSIE .\./.test(i) },
        { setTimeout: a(o.setTimeout), setInterval: a(o.setInterval) }
      );
    },
    function (t, e, r) {
      'use strict';
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 });
      var n = r(89),
        o = (function () {
          function t(t) {
            this.tabStore = t;
          }
          return (
            (t.prototype.getOrCreate = function () {
              var t = this.tabStore.get('tab');
              return t || ((t = n.getGuid()), this.tabStore.set('tab', t)), t;
            }),
            t
          );
        })();
      e.default = o;
    },
    function (t, e, r) {
      'use strict';
      var n,
        o = r(1),
        i = o(r(137)),
        u = o(r(2)),
        a = o(r(178)),
        c = o(r(179)),
        s =
          ((n = function (t, e) {
            return (n =
              c.default ||
              ({ __proto__: [] } instanceof Array &&
                function (t, e) {
                  t.__proto__ = e;
                }) ||
              function (t, e) {
                for (var r in e) e.hasOwnProperty(r) && (t[r] = e[r]);
              })(t, e);
          }),
          function (t, e) {
            function r() {
              this.constructor = t;
            }
            n(t, e),
              (t.prototype =
                null === e
                  ? (0, a.default)(e)
                  : ((r.prototype = e.prototype), new r()));
          });
      (0, u.default)(e, '__esModule', { value: !0 });
      var f = r(23),
        l = r(19),
        p = (function () {
          function t(t, e) {
            if (
              ((this.apiKey = t),
              (this.isPersistent = e),
              !l.isNonEmptyString(this.apiKey))
            )
              throw new f.SNError(
                'Must supply an API key to initialize a store instance'
              );
            try {
              this.storage.setItem(this.getStoreKey('test'), 'ok'),
                this.storage.removeItem(this.getStoreKey('test'));
            } catch (t) {
              throw new f.SNError('Web storage is not supported');
            }
          }
          return (
            (0, u.default)(t.prototype, 'storage', {
              get: function () {
                return this.isPersistent
                  ? window.localStorage
                  : window.sessionStorage;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (t.prototype.getStoreKey = function (t) {
              return 'sn:' + this.apiKey + ':' + t;
            }),
            (t.prototype.set = function (t, e) {
              return l.isNullOrUndefined(e)
                ? this.remove(t)
                : this.storage.setItem(this.getStoreKey(t), (0, i.default)(e));
            }),
            (t.prototype.get = function (t) {
              var e = this.storage.getItem(this.getStoreKey(t));
              return null === e ? void 0 : JSON.parse(e);
            }),
            (t.prototype.remove = function (t) {
              this.storage.removeItem(this.getStoreKey(t));
            }),
            t
          );
        })();
      e.Store = p;
      var d = (function (t) {
        function e(e) {
          return t.call(this, e, !1) || this;
        }
        return s(e, t), e;
      })(p);
      e.TabStore = d;
      var v = (function (t) {
        function e(e) {
          return t.call(this, e, !0) || this;
        }
        return s(e, t), e;
      })(p);
      e.BrowserStore = v;
    },
    function (t, e, r) {
      'use strict';
      var n = r(1)(r(2)),
        o = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, n.default)(e, '__esModule', { value: !0 });
      var i = o(r(422)),
        u = o(r(423)),
        a = o(r(424)),
        c = (function () {
          function t() {
            (this.eventRecorder = new i.default()),
              (this.pageRecorder = new u.default()),
              (this.userRecorder = new a.default());
          }
          return (
            (0, n.default)(t.prototype, 'event', {
              get: function () {
                return this.eventRecorder;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'page', {
              get: function () {
                return this.pageRecorder;
              },
              enumerable: !0,
              configurable: !0,
            }),
            (0, n.default)(t.prototype, 'user', {
              get: function () {
                return this.userRecorder;
              },
              enumerable: !0,
              configurable: !0,
            }),
            t
          );
        })();
      e.default = c;
    },
    function (t, e, r) {
      'use strict';
      var n = function (t) {
        return t && t.__esModule ? t : { default: t };
      };
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 });
      var o = r(19),
        i = r(23),
        u = n(r(42)),
        a = r(136),
        c = n(r(25)),
        s = (function () {
          function t() {}
          return (
            (t.prototype.add = function (t, e) {
              if (!o.isNonEmptyString(t))
                throw new i.SNTypeError("Invalid event name: ''");
              o.isDefined(e) &&
                (o.isObject(e)
                  ? (e = a.getValidProperties(e, !1, !1))
                  : ((e = void 0),
                    c.default.error('Invalid event properties for event', t)));
              var r = { Page: u.default.currentPage.get() };
              u.default.dataPoints.add(1, t, {
                properties: e,
                systemProperties: r,
              });
            }),
            t
          );
        })();
      e.default = s;
    },
    function (t, e, r) {
      'use strict';
      var n = function (t) {
        return t && t.__esModule ? t : { default: t };
      };
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 });
      var o = r(19),
        i = r(23),
        u = n(r(25)),
        a = n(r(42)),
        c = (function () {
          function t() {}
          return (
            (t.prototype.start = function (t, e) {
              if (((t = null != t ? t : ''), !o.isString(t)))
                throw new i.SNTypeError('Page name must be a string');
              var r = {};
              o.isDefined(e) &&
                (o.isNonEmptyString(e)
                  ? e.length > 100
                    ? u.default.error(
                        'Ignoring description too long (greater than 100)'
                      )
                    : (r.Description = e)
                  : u.default.error('Ignoring empty page description')),
                a.default.currentPage.set(t),
                a.default.dataPoints.add(0, t, { systemProperties: r });
            }),
            t
          );
        })();
      e.default = c;
    },
    function (t, e, r) {
      'use strict';
      var n = function (t) {
        return t && t.__esModule ? t : { default: t };
      };
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 });
      var o = r(19),
        i = r(23),
        u = n(r(25)),
        a = n(r(42)),
        c = r(136),
        s = (function () {
          function t() {}
          return (
            (t.prototype.getAppUserIdOrNull = function () {
              return a.default.appUserId.get() || null;
            }),
            (t.prototype.normalizeAppUserId = function (t) {
              if (!o.isNullOrUndefined(t) && !o.isString(t))
                throw new i.SNTypeError('User id must be a non empty string');
              return t || void 0;
            }),
            (t.prototype.setAppUserId = function (t) {
              a.default.appUserId.set(t),
                a.default.dataPoints.add(2, t || null);
            }),
            (t.prototype.removeProperty = function (t) {
              this.setProperty(t, null);
            }),
            (t.prototype.setProperty = function (t, e) {
              var r;
              this.setProperties((((r = {})[t] = e), r));
            }),
            (t.prototype.setProperties = function (t) {
              o.isObject(t)
                ? ((t = c.getValidProperties(t, !0, !0)),
                  a.default.dataPoints.add(2, this.getAppUserIdOrNull(), {
                    properties: t,
                  }))
                : u.default.error('Invalid user properties');
            }),
            (t.prototype.incProperty = function (t, e) {
              if (!o.isNumber(e))
                throw new i.SNTypeError('Property value must be a number');
              e
                ? this.operationToProperty(t, e, '$inc')
                : u.default.debug('Ignoring inc user property by zero');
            }),
            (t.prototype.appendToProperty = function (t, e) {
              if (!o.isString(e))
                throw new i.SNTypeError('Property value must be a string');
              this.operationToProperty(t, [e], '$appendToList');
            }),
            (t.prototype.operationToProperty = function (t, e, r) {
              var n, u;
              if (!o.isNonEmptyString(t))
                throw new i.SNTypeError('Property name must be a string');
              if (c.isSystemPropertyKey(t))
                throw new i.SNTypeError('Property name has invalid prefix');
              a.default.dataPoints.add(2, this.getAppUserIdOrNull(), {
                properties:
                  ((n = {}),
                  (n[t] = ((u = {}), (u.op = r), (u.val = e), u)),
                  n),
              });
            }),
            t
          );
        })();
      e.default = s;
    },
    function (t, e, r) {
      'use strict';
      var n = r(1),
        o = n(r(2)),
        i = n(r(36)),
        u = n(r(40)),
        a = n(r(41)),
        c = function (t, e, r, n) {
          return new (r || (r = a.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        s = function (t, e) {
          var r,
            n,
            o,
            a,
            c = {
              label: 0,
              sent: function () {
                if (1 & o[0]) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (a = { next: s(0), throw: s(1), return: s(2) }),
            'function' == typeof u.default &&
              (a[i.default] = function () {
                return this;
              }),
            a
          );
          function s(i) {
            return function (u) {
              return (function (i) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; c; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (o =
                          2 & i[0]
                            ? n.return
                            : i[0]
                            ? n.throw || ((o = n.return) && o.call(n), 0)
                            : n.next) &&
                        !(o = o.call(n, i[1])).done)
                    )
                      return o;
                    switch (((n = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return c.label++, { value: i[1], done: !1 };
                      case 5:
                        c.label++, (n = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = c.ops.pop()), c.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = c.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          c = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          c.label = i[1];
                          break;
                        }
                        if (6 === i[0] && c.label < o[1]) {
                          (c.label = o[1]), (o = i);
                          break;
                        }
                        if (o && c.label < o[2]) {
                          (c.label = o[2]), c.ops.push(i);
                          break;
                        }
                        o[2] && c.ops.pop(), c.trys.pop();
                        continue;
                    }
                    i = e.call(t, c);
                  } catch (t) {
                    (i = [6, t]), (n = 0);
                  } finally {
                    r = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, u]);
            };
          }
        },
        f = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, o.default)(e, '__esModule', { value: !0 });
      var l = f(r(25)),
        p = f(r(42)),
        d = f(r(197)),
        v = (function () {
          function t() {
            this.heartbeatTimeoutId = 0;
          }
          return (
            (t.prototype.startHeartbeats = function () {
              var t = this;
              if (!this.heartbeatTimeoutId) {
                l.default.info('Starting heartbeats');
                this.heartbeatTimeoutId = window.setTimeout(function e() {
                  return c(t, void 0, void 0, function () {
                    var t;
                    return s(this, function (r) {
                      switch (r.label) {
                        case 0:
                          return (
                            r.trys.push([0, 2, , 3]), [4, this.sendHeartbeat()]
                          );
                        case 1:
                          return r.sent(), [3, 3];
                        case 2:
                          return (
                            (t = r.sent()),
                            l.default.warn('Heartbeat failed', t),
                            [3, 3]
                          );
                        case 3:
                          return (
                            (this.heartbeatTimeoutId = window.setTimeout(
                              e,
                              p.default.configuration.get('HeartbeatInterval')
                            )),
                            [2]
                          );
                      }
                    });
                  });
                });
              }
            }),
            (t.prototype.stopHeartbeats = function () {
              l.default.info('Stop heartbeats'),
                clearTimeout(this.heartbeatTimeoutId),
                (this.heartbeatTimeoutId = 0);
            }),
            (t.prototype.sendHeartbeat = function () {
              return c(this, void 0, void 0, function () {
                var t, e;
                return s(this, function (r) {
                  switch (r.label) {
                    case 0:
                      return p.default.configuration.isSessionAlive()
                        ? (t = p.default.dataPoints.select(
                            p.default.configuration.get(
                              'MaxDataPointsPerHeartbeat'
                            )
                          )).length
                          ? (l.default.info('Send heartbeat:', t),
                            [4, d.default.sendHeartbeat(t)])
                          : (l.default.debug(
                              'Heartbeat skipped: No data points to send'
                            ),
                            [2])
                        : (l.default.debug(
                            'Heartbeat skipped: Session is not alive'
                          ),
                          [2]);
                    case 1:
                      return (
                        (e = r.sent()).ok
                          ? (l.default.info('Heartbeat sent successfully'),
                            p.default.dataPoints.deleteByCount(t.length))
                          : 1 === e.errorCode &&
                            (l.default.info(
                              'Session not found for Heartbeat. Deleting session configuration'
                            ),
                            p.default.configuration.deleteData()),
                        [2]
                      );
                  }
                });
              });
            }),
            t
          );
        })();
      e.default = v;
    },
    function (t, e, r) {
      'use strict';
      (0, r(1)(r(2)).default)(e, '__esModule', { value: !0 });
      var n = (function () {
        function t() {}
        return (
          (t.getScreenDimension = function () {
            var t = window.screen;
            return { height: t.height || 0, width: t.width || 0 };
          }),
          (t.getSystemLocale = function () {
            return window.navigator.language.toLowerCase();
          }),
          t
        );
      })();
      e.default = n;
    },
    function (t, e, r) {
      'use strict';
      var n = r(1);
      r(74), r(428);
      var o = n(r(137)),
        i = n(r(437)),
        u = n(r(2)),
        a = n(r(36)),
        c = n(r(40)),
        s = n(r(41)),
        f = n(r(135)),
        l = function () {
          return (l =
            f.default ||
            function (t) {
              for (var e, r = 1, n = arguments.length; r < n; r++)
                for (var o in (e = arguments[r]))
                  Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
              return t;
            }).apply(this, arguments);
        },
        p = function (t, e, r, n) {
          return new (r || (r = s.default))(function (o, i) {
            function u(t) {
              try {
                c(n.next(t));
              } catch (t) {
                i(t);
              }
            }
            function a(t) {
              try {
                c(n.throw(t));
              } catch (t) {
                i(t);
              }
            }
            function c(t) {
              var e;
              t.done
                ? o(t.value)
                : ((e = t.value),
                  e instanceof r
                    ? e
                    : new r(function (t) {
                        t(e);
                      })).then(u, a);
            }
            c((n = n.apply(t, e || [])).next());
          });
        },
        d = function (t, e) {
          var r,
            n,
            o,
            i,
            u = {
              label: 0,
              sent: function () {
                if (1 & o[0]) throw o[1];
                return o[1];
              },
              trys: [],
              ops: [],
            };
          return (
            (i = { next: s(0), throw: s(1), return: s(2) }),
            'function' == typeof c.default &&
              (i[a.default] = function () {
                return this;
              }),
            i
          );
          function s(i) {
            return function (a) {
              return (function (i) {
                if (r) throw new TypeError('Generator is already executing.');
                for (; u; )
                  try {
                    if (
                      ((r = 1),
                      n &&
                        (o =
                          2 & i[0]
                            ? n.return
                            : i[0]
                            ? n.throw || ((o = n.return) && o.call(n), 0)
                            : n.next) &&
                        !(o = o.call(n, i[1])).done)
                    )
                      return o;
                    switch (((n = 0), o && (i = [2 & i[0], o.value]), i[0])) {
                      case 0:
                      case 1:
                        o = i;
                        break;
                      case 4:
                        return u.label++, { value: i[1], done: !1 };
                      case 5:
                        u.label++, (n = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = u.ops.pop()), u.trys.pop();
                        continue;
                      default:
                        if (
                          !((o = u.trys),
                          (o = o.length > 0 && o[o.length - 1]) ||
                            (6 !== i[0] && 2 !== i[0]))
                        ) {
                          u = 0;
                          continue;
                        }
                        if (
                          3 === i[0] &&
                          (!o || (i[1] > o[0] && i[1] < o[3]))
                        ) {
                          u.label = i[1];
                          break;
                        }
                        if (6 === i[0] && u.label < o[1]) {
                          (u.label = o[1]), (o = i);
                          break;
                        }
                        if (o && u.label < o[2]) {
                          (u.label = o[2]), u.ops.push(i);
                          break;
                        }
                        o[2] && u.ops.pop(), u.trys.pop();
                        continue;
                    }
                    i = e.call(t, u);
                  } catch (t) {
                    (i = [6, t]), (n = 0);
                  } finally {
                    r = o = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, a]);
            };
          }
        },
        v = function (t) {
          return t && t.__esModule ? t : { default: t };
        };
      (0, u.default)(e, '__esModule', { value: !0 }), r(441), r(442);
      var h = v(r(25)),
        y = v(r(42)),
        g = v(r(63)),
        b = r(23),
        m = r(95),
        x = r(53),
        w = function (t, e, r) {
          return p(void 0, void 0, void 0, function () {
            var n, u, a, c, f, v, x, w, S, A, E, T;
            return d(this, function (O) {
              switch (O.label) {
                case 0:
                  (n = 0), (O.label = 1);
                case 1:
                  return (
                    O.trys.push([1, 8, 9, 10]),
                    (u = new AbortController()),
                    (a = u.signal),
                    (f = fetch),
                    (v = [g.default.baseUrl + '/web/' + t]),
                    (x = { method: 'POST', mode: 'cors', cache: 'no-cache' }),
                    (w = [{}]),
                    [
                      4,
                      p(void 0, void 0, void 0, function () {
                        var t, e;
                        return d(this, function (r) {
                          switch (r.label) {
                            case 0:
                              return (
                                (t = m.removeFalsyEntries),
                                (e = {
                                  Version: g.default.VERSION,
                                  APIKey: y.default.configuration.get('ApiKey'),
                                  APIAuth:
                                    y.default.configuration.get('ApiAuth'),
                                }),
                                [4, y.default.browserId.getOrCreate()]
                              );
                            case 1:
                              return [
                                2,
                                t.apply(void 0, [
                                  ((e.BrowserId = r.sent()),
                                  (e.ClientId = y.default.clientId.get()),
                                  e),
                                ]),
                              ];
                          }
                        });
                      }),
                    ]
                  );
                case 2:
                  return (
                    (c = f.apply(
                      void 0,
                      (0, i.default)(v).call(v, [
                        ((x.headers = l.apply(void 0, [
                          l.apply(
                            void 0,
                            (0, i.default)(w).call(w, [O.sent()])
                          ),
                          { 'Content-Type': 'application/json' },
                        ])),
                        (x.referrer = 'no-referrer'),
                        (x.body = (0, o.default)(e)),
                        (x.signal = a),
                        x),
                      ])
                    )),
                    (n = window.setTimeout(function () {
                      return u.abort();
                    }, r)),
                    [4, c]
                  );
                case 3:
                  (S = O.sent()), (O.label = 4);
                case 4:
                  return O.trys.push([4, 6, , 7]), [4, S.json()];
                case 5:
                  return (
                    (A = O.sent()),
                    S.ok
                      ? [2, A]
                      : (h.default.warn(
                          "Server call to '" + t + "' failed. Response is",
                          S.status,
                          ':',
                          A.Error
                        ),
                        [2, s.default.reject(new b.HttpError(A.ErrorCode))])
                  );
                case 6:
                  return (
                    (E = O.sent()),
                    h.default.warn(
                      "Server call to '" + t + "' failed. Response is",
                      S.status,
                      E
                    ),
                    [2, s.default.reject(new b.HttpError())]
                  );
                case 7:
                  return [3, 10];
                case 8:
                  return (
                    (T = O.sent()),
                    h.default.warn("Server call to '" + t + "' failed.", T),
                    [2, s.default.reject(new b.HttpError())]
                  );
                case 9:
                  return clearTimeout(n), [7];
                case 10:
                  return [2];
              }
            });
          });
        };
      e.postData = function (t, e, r) {
        return p(void 0, void 0, void 0, function () {
          var n, o;
          return d(this, function (i) {
            switch (i.label) {
              case 0:
                return (n = x.getTime()), [4, w(t, e, r)];
              case 1:
                return (
                  (o = i.sent()),
                  h.default.debug(
                    "Profiler: '" + t + "' request took",
                    x.getTime() - n,
                    'ms'
                  ),
                  [2, o]
                );
            }
          });
        });
      };
    },
    function (t, e, r) {
      'use strict';
      var n,
        o,
        i,
        u,
        a = r(51),
        c = r(86),
        s = r(4),
        f = r(68),
        l = r(429),
        p = r(28),
        d = r(186),
        v = r(92),
        h = r(128),
        y = r(20),
        g = r(73),
        b = r(132),
        m = r(31),
        x = r(126),
        w = r(430),
        S = r(190),
        A = r(52),
        E = r(198).set,
        T = r(432),
        O = r(433),
        P = r(434),
        _ = r(201),
        I = r(435),
        j = r(50),
        R = r(83),
        C = r(11),
        k = r(436),
        L = C('species'),
        M = 'Promise',
        N = j.get,
        D = j.set,
        U = j.getterFor(M),
        F = l,
        B = s.TypeError,
        G = s.document,
        W = s.process,
        H = f('fetch'),
        V = _.f,
        K = V,
        z = 'process' == m(W),
        Y = !!(G && G.createEvent && s.dispatchEvent),
        q = R(M, function () {
          if (!(x(F) !== String(F))) {
            if (66 === k) return !0;
            if (!z && 'function' != typeof PromiseRejectionEvent) return !0;
          }
          if (c && !F.prototype.finally) return !0;
          if (k >= 51 && /native code/.test(F)) return !1;
          var t = F.resolve(1),
            e = function (t) {
              t(
                function () {},
                function () {}
              );
            };
          return (
            ((t.constructor = {})[L] = e),
            !(t.then(function () {}) instanceof e)
          );
        }),
        $ =
          q ||
          !S(function (t) {
            F.all(t).catch(function () {});
          }),
        J = function (t) {
          var e;
          return !(!y(t) || 'function' != typeof (e = t.then)) && e;
        },
        X = function (t, e, r) {
          if (!e.notified) {
            e.notified = !0;
            var n = e.reactions;
            T(function () {
              for (var o = e.value, i = 1 == e.state, u = 0; n.length > u; ) {
                var a,
                  c,
                  s,
                  f = n[u++],
                  l = i ? f.ok : f.fail,
                  p = f.resolve,
                  d = f.reject,
                  v = f.domain;
                try {
                  l
                    ? (i || (2 === e.rejection && et(t, e), (e.rejection = 1)),
                      !0 === l
                        ? (a = o)
                        : (v && v.enter(),
                          (a = l(o)),
                          v && (v.exit(), (s = !0))),
                      a === f.promise
                        ? d(B('Promise-chain cycle'))
                        : (c = J(a))
                        ? c.call(a, p, d)
                        : p(a))
                    : d(o);
                } catch (t) {
                  v && !s && v.exit(), d(t);
                }
              }
              (e.reactions = []),
                (e.notified = !1),
                r && !e.rejection && Z(t, e);
            });
          }
        },
        Q = function (t, e, r) {
          var n, o;
          Y
            ? (((n = G.createEvent('Event')).promise = e),
              (n.reason = r),
              n.initEvent(t, !1, !0),
              s.dispatchEvent(n))
            : (n = { promise: e, reason: r }),
            (o = s['on' + t])
              ? o(n)
              : 'unhandledrejection' === t &&
                P('Unhandled promise rejection', r);
        },
        Z = function (t, e) {
          E.call(s, function () {
            var r,
              n = e.value;
            if (
              tt(e) &&
              ((r = I(function () {
                z
                  ? W.emit('unhandledRejection', n, t)
                  : Q('unhandledrejection', t, n);
              })),
              (e.rejection = z || tt(e) ? 2 : 1),
              r.error)
            )
              throw r.value;
          });
        },
        tt = function (t) {
          return 1 !== t.rejection && !t.parent;
        },
        et = function (t, e) {
          E.call(s, function () {
            z
              ? W.emit('rejectionHandled', t)
              : Q('rejectionhandled', t, e.value);
          });
        },
        rt = function (t, e, r, n) {
          return function (o) {
            t(e, r, o, n);
          };
        },
        nt = function (t, e, r, n) {
          e.done ||
            ((e.done = !0),
            n && (e = n),
            (e.value = r),
            (e.state = 2),
            X(t, e, !0));
        },
        ot = function (t, e, r, n) {
          if (!e.done) {
            (e.done = !0), n && (e = n);
            try {
              if (t === r) throw B("Promise can't be resolved itself");
              var o = J(r);
              o
                ? T(function () {
                    var n = { done: !1 };
                    try {
                      o.call(r, rt(ot, t, n, e), rt(nt, t, n, e));
                    } catch (r) {
                      nt(t, n, r, e);
                    }
                  })
                : ((e.value = r), (e.state = 1), X(t, e, !1));
            } catch (r) {
              nt(t, { done: !1 }, r, e);
            }
          }
        };
      q &&
        ((F = function (t) {
          b(this, F, M), g(t), n.call(this);
          var e = N(this);
          try {
            t(rt(ot, this, e), rt(nt, this, e));
          } catch (t) {
            nt(this, e, t);
          }
        }),
        ((n = function (t) {
          D(this, {
            type: M,
            done: !1,
            notified: !1,
            parent: !1,
            reactions: [],
            rejection: !1,
            state: 0,
            value: void 0,
          });
        }).prototype = d(F.prototype, {
          then: function (t, e) {
            var r = U(this),
              n = V(A(this, F));
            return (
              (n.ok = 'function' != typeof t || t),
              (n.fail = 'function' == typeof e && e),
              (n.domain = z ? W.domain : void 0),
              (r.parent = !0),
              r.reactions.push(n),
              0 != r.state && X(this, r, !1),
              n.promise
            );
          },
          catch: function (t) {
            return this.then(void 0, t);
          },
        })),
        (o = function () {
          var t = new n(),
            e = N(t);
          (this.promise = t),
            (this.resolve = rt(ot, t, e)),
            (this.reject = rt(nt, t, e));
        }),
        (_.f = V =
          function (t) {
            return t === F || t === i ? new o(t) : K(t);
          }),
        c ||
          'function' != typeof l ||
          ((u = l.prototype.then),
          p(
            l.prototype,
            'then',
            function (t, e) {
              var r = this;
              return new F(function (t, e) {
                u.call(r, t, e);
              }).then(t, e);
            },
            { unsafe: !0 }
          ),
          'function' == typeof H &&
            a(
              { global: !0, enumerable: !0, forced: !0 },
              {
                fetch: function (t) {
                  return O(F, H.apply(s, arguments));
                },
              }
            ))),
        a({ global: !0, wrap: !0, forced: q }, { Promise: F }),
        v(F, M, !1, !0),
        h(M),
        (i = f(M)),
        a(
          { target: M, stat: !0, forced: q },
          {
            reject: function (t) {
              var e = V(this);
              return e.reject.call(void 0, t), e.promise;
            },
          }
        ),
        a(
          { target: M, stat: !0, forced: c || q },
          {
            resolve: function (t) {
              return O(c && this === i ? F : this, t);
            },
          }
        ),
        a(
          { target: M, stat: !0, forced: $ },
          {
            all: function (t) {
              var e = this,
                r = V(e),
                n = r.resolve,
                o = r.reject,
                i = I(function () {
                  var r = g(e.resolve),
                    i = [],
                    u = 0,
                    a = 1;
                  w(t, function (t) {
                    var c = u++,
                      s = !1;
                    i.push(void 0),
                      a++,
                      r.call(e, t).then(function (t) {
                        s || ((s = !0), (i[c] = t), --a || n(i));
                      }, o);
                  }),
                    --a || n(i);
                });
              return i.error && o(i.value), r.promise;
            },
            race: function (t) {
              var e = this,
                r = V(e),
                n = r.reject,
                o = I(function () {
                  var o = g(e.resolve);
                  w(t, function (t) {
                    o.call(e, t).then(r.resolve, n);
                  });
                });
              return o.error && n(o.value), r.promise;
            },
          }
        );
    },
    function (t, e, r) {
      var n = r(4);
      t.exports = n.Promise;
    },
    function (t, e, r) {
      var n = r(16),
        o = r(193),
        i = r(14),
        u = r(94),
        a = r(192),
        c = r(431),
        s = function (t, e) {
          (this.stopped = t), (this.result = e);
        };
      (t.exports = function (t, e, r, f, l) {
        var p,
          d,
          v,
          h,
          y,
          g,
          b,
          m = u(e, r, f ? 2 : 1);
        if (l) p = t;
        else {
          if ('function' != typeof (d = a(t)))
            throw TypeError('Target is not iterable');
          if (o(d)) {
            for (v = 0, h = i(t.length); h > v; v++)
              if (
                (y = f ? m(n((b = t[v]))[0], b[1]) : m(t[v])) &&
                y instanceof s
              )
                return y;
            return new s(!1);
          }
          p = d.call(t);
        }
        for (g = p.next; !(b = g.call(p)).done; )
          if (
            'object' == typeof (y = c(p, m, b.value, f)) &&
            y &&
            y instanceof s
          )
            return y;
        return new s(!1);
      }).stop = function (t) {
        return new s(!0, t);
      };
    },
    function (t, e, r) {
      var n = r(16);
      t.exports = function (t, e, r, o) {
        try {
          return o ? e(n(r)[0], r[1]) : e(r);
        } catch (e) {
          var i = t.return;
          throw (void 0 !== i && n(i.call(t)), e);
        }
      };
    },
    function (t, e, r) {
      var n,
        o,
        i,
        u,
        a,
        c,
        s,
        f,
        l = r(4),
        p = r(69).f,
        d = r(31),
        v = r(198).set,
        h = r(199),
        y = l.MutationObserver || l.WebKitMutationObserver,
        g = l.process,
        b = l.Promise,
        m = 'process' == d(g),
        x = p(l, 'queueMicrotask'),
        w = x && x.value;
      w ||
        ((n = function () {
          var t, e;
          for (m && (t = g.domain) && t.exit(); o; ) {
            (e = o.fn), (o = o.next);
            try {
              e();
            } catch (t) {
              throw (o ? u() : (i = void 0), t);
            }
          }
          (i = void 0), t && t.enter();
        }),
        m
          ? (u = function () {
              g.nextTick(n);
            })
          : y && !h
          ? ((a = !0),
            (c = document.createTextNode('')),
            new y(n).observe(c, { characterData: !0 }),
            (u = function () {
              c.data = a = !a;
            }))
          : b && b.resolve
          ? ((s = b.resolve(void 0)),
            (f = s.then),
            (u = function () {
              f.call(s, n);
            }))
          : (u = function () {
              v.call(l, n);
            })),
        (t.exports =
          w ||
          function (t) {
            var e = { fn: t, next: void 0 };
            i && (i.next = e), o || ((o = e), u()), (i = e);
          });
    },
    function (t, e, r) {
      var n = r(16),
        o = r(20),
        i = r(201);
      t.exports = function (t, e) {
        if ((n(t), o(e) && e.constructor === t)) return e;
        var r = i.f(t);
        return (0, r.resolve)(e), r.promise;
      };
    },
    function (t, e, r) {
      var n = r(4);
      t.exports = function (t, e) {
        var r = n.console;
        r && r.error && (1 === arguments.length ? r.error(t) : r.error(t, e));
      };
    },
    function (t, e) {
      t.exports = function (t) {
        try {
          return { error: !1, value: t() };
        } catch (t) {
          return { error: !0, value: t };
        }
      };
    },
    function (t, e, r) {
      var n,
        o,
        i = r(4),
        u = r(200),
        a = i.process,
        c = a && a.versions,
        s = c && c.v8;
      s
        ? (o = (n = s.split('.'))[0] + n[1])
        : u &&
          (!(n = u.match(/Edge\/(\d+)/)) || n[1] >= 74) &&
          (n = u.match(/Chrome\/(\d+)/)) &&
          (o = n[1]),
        (t.exports = o && +o);
    },
    function (t, e, r) {
      t.exports = r(438);
    },
    function (t, e, r) {
      var n = r(439);
      t.exports = n;
    },
    function (t, e, r) {
      var n = r(440),
        o = Array.prototype;
      t.exports = function (t) {
        var e = t.concat;
        return t === o || (t instanceof Array && e === o.concat) ? n : e;
      };
    },
    function (t, e, r) {
      r(155);
      var n = r(26);
      t.exports = n('Array').concat;
    },
    function (t, e, r) {
      'use strict';
      r.r(e),
        r.d(e, 'Headers', function () {
          return d;
        }),
        r.d(e, 'Request', function () {
          return x;
        }),
        r.d(e, 'Response', function () {
          return S;
        }),
        r.d(e, 'DOMException', function () {
          return E;
        }),
        r.d(e, 'fetch', function () {
          return T;
        });
      var n = 'URLSearchParams' in self,
        o = 'Symbol' in self && 'iterator' in Symbol,
        i =
          'FileReader' in self &&
          'Blob' in self &&
          (function () {
            try {
              return new Blob(), !0;
            } catch (t) {
              return !1;
            }
          })(),
        u = 'FormData' in self,
        a = 'ArrayBuffer' in self;
      if (a)
        var c = [
            '[object Int8Array]',
            '[object Uint8Array]',
            '[object Uint8ClampedArray]',
            '[object Int16Array]',
            '[object Uint16Array]',
            '[object Int32Array]',
            '[object Uint32Array]',
            '[object Float32Array]',
            '[object Float64Array]',
          ],
          s =
            ArrayBuffer.isView ||
            function (t) {
              return t && c.indexOf(Object.prototype.toString.call(t)) > -1;
            };
      function f(t) {
        if (
          ('string' != typeof t && (t = String(t)),
          /[^a-z0-9\-#$%&'*+.^_`|~]/i.test(t))
        )
          throw new TypeError('Invalid character in header field name');
        return t.toLowerCase();
      }
      function l(t) {
        return 'string' != typeof t && (t = String(t)), t;
      }
      function p(t) {
        var e = {
          next: function () {
            var e = t.shift();
            return { done: void 0 === e, value: e };
          },
        };
        return (
          o &&
            (e[Symbol.iterator] = function () {
              return e;
            }),
          e
        );
      }
      function d(t) {
        (this.map = {}),
          t instanceof d
            ? t.forEach(function (t, e) {
                this.append(e, t);
              }, this)
            : Array.isArray(t)
            ? t.forEach(function (t) {
                this.append(t[0], t[1]);
              }, this)
            : t &&
              Object.getOwnPropertyNames(t).forEach(function (e) {
                this.append(e, t[e]);
              }, this);
      }
      function v(t) {
        if (t.bodyUsed) return Promise.reject(new TypeError('Already read'));
        t.bodyUsed = !0;
      }
      function h(t) {
        return new Promise(function (e, r) {
          (t.onload = function () {
            e(t.result);
          }),
            (t.onerror = function () {
              r(t.error);
            });
        });
      }
      function y(t) {
        var e = new FileReader(),
          r = h(e);
        return e.readAsArrayBuffer(t), r;
      }
      function g(t) {
        if (t.slice) return t.slice(0);
        var e = new Uint8Array(t.byteLength);
        return e.set(new Uint8Array(t)), e.buffer;
      }
      function b() {
        return (
          (this.bodyUsed = !1),
          (this._initBody = function (t) {
            var e;
            (this._bodyInit = t),
              t
                ? 'string' == typeof t
                  ? (this._bodyText = t)
                  : i && Blob.prototype.isPrototypeOf(t)
                  ? (this._bodyBlob = t)
                  : u && FormData.prototype.isPrototypeOf(t)
                  ? (this._bodyFormData = t)
                  : n && URLSearchParams.prototype.isPrototypeOf(t)
                  ? (this._bodyText = t.toString())
                  : a && i && (e = t) && DataView.prototype.isPrototypeOf(e)
                  ? ((this._bodyArrayBuffer = g(t.buffer)),
                    (this._bodyInit = new Blob([this._bodyArrayBuffer])))
                  : a && (ArrayBuffer.prototype.isPrototypeOf(t) || s(t))
                  ? (this._bodyArrayBuffer = g(t))
                  : (this._bodyText = t = Object.prototype.toString.call(t))
                : (this._bodyText = ''),
              this.headers.get('content-type') ||
                ('string' == typeof t
                  ? this.headers.set('content-type', 'text/plain;charset=UTF-8')
                  : this._bodyBlob && this._bodyBlob.type
                  ? this.headers.set('content-type', this._bodyBlob.type)
                  : n &&
                    URLSearchParams.prototype.isPrototypeOf(t) &&
                    this.headers.set(
                      'content-type',
                      'application/x-www-form-urlencoded;charset=UTF-8'
                    ));
          }),
          i &&
            ((this.blob = function () {
              var t = v(this);
              if (t) return t;
              if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
              if (this._bodyArrayBuffer)
                return Promise.resolve(new Blob([this._bodyArrayBuffer]));
              if (this._bodyFormData)
                throw new Error('could not read FormData body as blob');
              return Promise.resolve(new Blob([this._bodyText]));
            }),
            (this.arrayBuffer = function () {
              return this._bodyArrayBuffer
                ? v(this) || Promise.resolve(this._bodyArrayBuffer)
                : this.blob().then(y);
            })),
          (this.text = function () {
            var t,
              e,
              r,
              n = v(this);
            if (n) return n;
            if (this._bodyBlob)
              return (
                (t = this._bodyBlob),
                (e = new FileReader()),
                (r = h(e)),
                e.readAsText(t),
                r
              );
            if (this._bodyArrayBuffer)
              return Promise.resolve(
                (function (t) {
                  for (
                    var e = new Uint8Array(t), r = new Array(e.length), n = 0;
                    n < e.length;
                    n++
                  )
                    r[n] = String.fromCharCode(e[n]);
                  return r.join('');
                })(this._bodyArrayBuffer)
              );
            if (this._bodyFormData)
              throw new Error('could not read FormData body as text');
            return Promise.resolve(this._bodyText);
          }),
          u &&
            (this.formData = function () {
              return this.text().then(w);
            }),
          (this.json = function () {
            return this.text().then(JSON.parse);
          }),
          this
        );
      }
      (d.prototype.append = function (t, e) {
        (t = f(t)), (e = l(e));
        var r = this.map[t];
        this.map[t] = r ? r + ', ' + e : e;
      }),
        (d.prototype.delete = function (t) {
          delete this.map[f(t)];
        }),
        (d.prototype.get = function (t) {
          return (t = f(t)), this.has(t) ? this.map[t] : null;
        }),
        (d.prototype.has = function (t) {
          return this.map.hasOwnProperty(f(t));
        }),
        (d.prototype.set = function (t, e) {
          this.map[f(t)] = l(e);
        }),
        (d.prototype.forEach = function (t, e) {
          for (var r in this.map)
            this.map.hasOwnProperty(r) && t.call(e, this.map[r], r, this);
        }),
        (d.prototype.keys = function () {
          var t = [];
          return (
            this.forEach(function (e, r) {
              t.push(r);
            }),
            p(t)
          );
        }),
        (d.prototype.values = function () {
          var t = [];
          return (
            this.forEach(function (e) {
              t.push(e);
            }),
            p(t)
          );
        }),
        (d.prototype.entries = function () {
          var t = [];
          return (
            this.forEach(function (e, r) {
              t.push([r, e]);
            }),
            p(t)
          );
        }),
        o && (d.prototype[Symbol.iterator] = d.prototype.entries);
      var m = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];
      function x(t, e) {
        var r,
          n,
          o = (e = e || {}).body;
        if (t instanceof x) {
          if (t.bodyUsed) throw new TypeError('Already read');
          (this.url = t.url),
            (this.credentials = t.credentials),
            e.headers || (this.headers = new d(t.headers)),
            (this.method = t.method),
            (this.mode = t.mode),
            (this.signal = t.signal),
            o || null == t._bodyInit || ((o = t._bodyInit), (t.bodyUsed = !0));
        } else this.url = String(t);
        if (
          ((this.credentials =
            e.credentials || this.credentials || 'same-origin'),
          (!e.headers && this.headers) || (this.headers = new d(e.headers)),
          (this.method =
            ((r = e.method || this.method || 'GET'),
            (n = r.toUpperCase()),
            m.indexOf(n) > -1 ? n : r)),
          (this.mode = e.mode || this.mode || null),
          (this.signal = e.signal || this.signal),
          (this.referrer = null),
          ('GET' === this.method || 'HEAD' === this.method) && o)
        )
          throw new TypeError('Body not allowed for GET or HEAD requests');
        this._initBody(o);
      }
      function w(t) {
        var e = new FormData();
        return (
          t
            .trim()
            .split('&')
            .forEach(function (t) {
              if (t) {
                var r = t.split('='),
                  n = r.shift().replace(/\+/g, ' '),
                  o = r.join('=').replace(/\+/g, ' ');
                e.append(decodeURIComponent(n), decodeURIComponent(o));
              }
            }),
          e
        );
      }
      function S(t, e) {
        e || (e = {}),
          (this.type = 'default'),
          (this.status = void 0 === e.status ? 200 : e.status),
          (this.ok = this.status >= 200 && this.status < 300),
          (this.statusText = 'statusText' in e ? e.statusText : 'OK'),
          (this.headers = new d(e.headers)),
          (this.url = e.url || ''),
          this._initBody(t);
      }
      (x.prototype.clone = function () {
        return new x(this, { body: this._bodyInit });
      }),
        b.call(x.prototype),
        b.call(S.prototype),
        (S.prototype.clone = function () {
          return new S(this._bodyInit, {
            status: this.status,
            statusText: this.statusText,
            headers: new d(this.headers),
            url: this.url,
          });
        }),
        (S.error = function () {
          var t = new S(null, { status: 0, statusText: '' });
          return (t.type = 'error'), t;
        });
      var A = [301, 302, 303, 307, 308];
      S.redirect = function (t, e) {
        if (-1 === A.indexOf(e)) throw new RangeError('Invalid status code');
        return new S(null, { status: e, headers: { location: t } });
      };
      var E = self.DOMException;
      try {
        new E();
      } catch (t) {
        ((E = function (t, e) {
          (this.message = t), (this.name = e);
          var r = Error(t);
          this.stack = r.stack;
        }).prototype = Object.create(Error.prototype)),
          (E.prototype.constructor = E);
      }
      function T(t, e) {
        return new Promise(function (r, n) {
          var o = new x(t, e);
          if (o.signal && o.signal.aborted)
            return n(new E('Aborted', 'AbortError'));
          var u = new XMLHttpRequest();
          function a() {
            u.abort();
          }
          (u.onload = function () {
            var t,
              e,
              n = {
                status: u.status,
                statusText: u.statusText,
                headers:
                  ((t = u.getAllResponseHeaders() || ''),
                  (e = new d()),
                  t
                    .replace(/\r?\n[\t ]+/g, ' ')
                    .split(/\r?\n/)
                    .forEach(function (t) {
                      var r = t.split(':'),
                        n = r.shift().trim();
                      if (n) {
                        var o = r.join(':').trim();
                        e.append(n, o);
                      }
                    }),
                  e),
              };
            n.url =
              'responseURL' in u
                ? u.responseURL
                : n.headers.get('X-Request-URL');
            var o = 'response' in u ? u.response : u.responseText;
            r(new S(o, n));
          }),
            (u.onerror = function () {
              n(new TypeError('Network request failed'));
            }),
            (u.ontimeout = function () {
              n(new TypeError('Network request failed'));
            }),
            (u.onabort = function () {
              n(new E('Aborted', 'AbortError'));
            }),
            u.open(o.method, o.url, !0),
            'include' === o.credentials
              ? (u.withCredentials = !0)
              : 'omit' === o.credentials && (u.withCredentials = !1),
            'responseType' in u && i && (u.responseType = 'blob'),
            o.headers.forEach(function (t, e) {
              u.setRequestHeader(e, t);
            }),
            o.signal &&
              (o.signal.addEventListener('abort', a),
              (u.onreadystatechange = function () {
                4 === u.readyState && o.signal.removeEventListener('abort', a);
              })),
            u.send(void 0 === o._bodyInit ? null : o._bodyInit);
        });
      }
      (T.polyfill = !0),
        self.fetch ||
          ((self.fetch = T),
          (self.Headers = d),
          (self.Request = x),
          (self.Response = S));
    },
    function (t, e, r) {
      (function (n) {
        var o, i;
        void 0 ===
          (i =
            'function' ==
            typeof (o = function () {
              'use strict';
              function t(t, e) {
                if (!(t instanceof e))
                  throw new TypeError('Cannot call a class as a function');
              }
              function e(t, e) {
                for (var r = 0; r < e.length; r++) {
                  var n = e[r];
                  (n.enumerable = n.enumerable || !1),
                    (n.configurable = !0),
                    'value' in n && (n.writable = !0),
                    Object.defineProperty(t, n.key, n);
                }
              }
              function r(t, r, n) {
                return r && e(t.prototype, r), n && e(t, n), t;
              }
              function o(t) {
                return (o = Object.setPrototypeOf
                  ? Object.getPrototypeOf
                  : function (t) {
                      return t.__proto__ || Object.getPrototypeOf(t);
                    })(t);
              }
              function i(t, e) {
                return (i =
                  Object.setPrototypeOf ||
                  function (t, e) {
                    return (t.__proto__ = e), t;
                  })(t, e);
              }
              function u(t) {
                if (void 0 === t)
                  throw new ReferenceError(
                    "this hasn't been initialised - super() hasn't been called"
                  );
                return t;
              }
              function a(t, e, r) {
                return (a =
                  'undefined' != typeof Reflect && Reflect.get
                    ? Reflect.get
                    : function (t, e, r) {
                        var n = (function (t, e) {
                          for (
                            ;
                            !Object.prototype.hasOwnProperty.call(t, e) &&
                            null !== (t = o(t));

                          );
                          return t;
                        })(t, e);
                        if (n) {
                          var i = Object.getOwnPropertyDescriptor(n, e);
                          return i.get ? i.get.call(r) : i.value;
                        }
                      })(t, e, r || t);
              }
              var c = (function () {
                  function e() {
                    t(this, e),
                      Object.defineProperty(this, 'listeners', {
                        value: {},
                        writable: !0,
                        configurable: !0,
                      });
                  }
                  return (
                    r(e, [
                      {
                        key: 'addEventListener',
                        value: function (t, e) {
                          t in this.listeners || (this.listeners[t] = []),
                            this.listeners[t].push(e);
                        },
                      },
                      {
                        key: 'removeEventListener',
                        value: function (t, e) {
                          if (t in this.listeners)
                            for (
                              var r = this.listeners[t], n = 0, o = r.length;
                              n < o;
                              n++
                            )
                              if (r[n] === e) return void r.splice(n, 1);
                        },
                      },
                      {
                        key: 'dispatchEvent',
                        value: function (t) {
                          var e = this;
                          if (t.type in this.listeners) {
                            for (
                              var r = function (r) {
                                  setTimeout(function () {
                                    return r.call(e, t);
                                  });
                                },
                                n = this.listeners[t.type],
                                o = 0,
                                i = n.length;
                              o < i;
                              o++
                            )
                              r(n[o]);
                            return !t.defaultPrevented;
                          }
                        },
                      },
                    ]),
                    e
                  );
                })(),
                s = (function (e) {
                  function n() {
                    var e;
                    return (
                      t(this, n),
                      (e = (function (t, e) {
                        return !e ||
                          ('object' != typeof e && 'function' != typeof e)
                          ? u(t)
                          : e;
                      })(this, o(n).call(this))).listeners || c.call(u(e)),
                      Object.defineProperty(u(e), 'aborted', {
                        value: !1,
                        writable: !0,
                        configurable: !0,
                      }),
                      Object.defineProperty(u(e), 'onabort', {
                        value: null,
                        writable: !0,
                        configurable: !0,
                      }),
                      e
                    );
                  }
                  return (
                    (function (t, e) {
                      if ('function' != typeof e && null !== e)
                        throw new TypeError(
                          'Super expression must either be null or a function'
                        );
                      (t.prototype = Object.create(e && e.prototype, {
                        constructor: {
                          value: t,
                          writable: !0,
                          configurable: !0,
                        },
                      })),
                        e && i(t, e);
                    })(n, e),
                    r(n, [
                      {
                        key: 'toString',
                        value: function () {
                          return '[object AbortSignal]';
                        },
                      },
                      {
                        key: 'dispatchEvent',
                        value: function (t) {
                          'abort' === t.type &&
                            ((this.aborted = !0),
                            'function' == typeof this.onabort &&
                              this.onabort.call(this, t)),
                            a(o(n.prototype), 'dispatchEvent', this).call(
                              this,
                              t
                            );
                        },
                      },
                    ]),
                    n
                  );
                })(c),
                f = (function () {
                  function e() {
                    t(this, e),
                      Object.defineProperty(this, 'signal', {
                        value: new s(),
                        writable: !0,
                        configurable: !0,
                      });
                  }
                  return (
                    r(e, [
                      {
                        key: 'abort',
                        value: function () {
                          var t;
                          try {
                            t = new Event('abort');
                          } catch (e) {
                            'undefined' != typeof document
                              ? document.createEvent
                                ? (t = document.createEvent('Event')).initEvent(
                                    'abort',
                                    !1,
                                    !1
                                  )
                                : ((t = document.createEventObject()).type =
                                    'abort')
                              : (t = {
                                  type: 'abort',
                                  bubbles: !1,
                                  cancelable: !1,
                                });
                          }
                          this.signal.dispatchEvent(t);
                        },
                      },
                      {
                        key: 'toString',
                        value: function () {
                          return '[object AbortController]';
                        },
                      },
                    ]),
                    e
                  );
                })();
              'undefined' != typeof Symbol &&
                Symbol.toStringTag &&
                ((f.prototype[Symbol.toStringTag] = 'AbortController'),
                (s.prototype[Symbol.toStringTag] = 'AbortSignal')),
                (function (t) {
                  (function (t) {
                    return t.__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL
                      ? (console.log(
                          '__FORCE_INSTALL_ABORTCONTROLLER_POLYFILL=true is set, will force install polyfill'
                        ),
                        !0)
                      : ('function' == typeof t.Request &&
                          !t.Request.prototype.hasOwnProperty('signal')) ||
                          !t.AbortController;
                  })(t) && ((t.AbortController = f), (t.AbortSignal = s));
                })('undefined' != typeof self ? self : n);
            })
              ? o.call(e, r, e, t)
              : o) || (t.exports = i);
      }.call(this, r(96)));
    },
  ]).default;
});
/*! RESOURCE: /scripts/sn/common/analytics/service.snAnalyticsUtil.js */
angular
  .module('sn.common.analytics')
  .factory(
    'snAnalyticsUtil',
    function (
      $http,
      $rootScope,
      snAnalyticsConsentModal,
      i18n,
      userPreferences
    ) {
      'use strict';
      function invokeUCMEngine() {
        NOW.usage_tracking = NOW.usage_tracking || {};
        if (
          NOW.user_name == 'guest' ||
          NOW.user_impersonating ||
          (NOW.usage_tracking.user_consent == 'NoConsentRequired' &&
            NOW.ucm_portal_id == NOW.portal_id)
        )
          return;
        $http
          .get('/api/now/consent/getConsentDetails', {
            params: { portal_id: NOW.portal_id },
          })
          .then(function (response) {
            var consent = {};
            if (response && response.data && isJsonString(response.data.result))
              consent = JSON.parse(response.data.result);
            NOW.usage_tracking.user_consent = consent.user_consent;
            NOW.usage_tracking.usage_tracking_allowed_for_session =
              consent.usage_tracking_allowed_for_session;
            NOW.usage_tracking.user_analytics_consent_text =
              consent.user_analytics_consent_text;
            NOW.usage_tracking.ucm_encountered_exception =
              consent.ucm_encountered_exception;
            NOW.sp_analytics_portal_override = consent.portal_override;
            NOW.ucm_invocations = consent.ucm_invocations;
            NOW.ucm_portal_id = consent.ucm_portal_id;
            if (NOW.usage_tracking.user_consent != 'NoConsentRequired') {
              var buttonNotice = [
                {
                  label: i18n.getMessage('Agree'),
                  primary: true,
                  focus: true,
                  user_consent: 'N/A',
                },
              ];
              var buttonsConsent = [
                { label: i18n.getMessage('No'), user_consent: 'N' },
                {
                  label: i18n.getMessage('Yes'),
                  user_consent: 'Y',
                  primary: true,
                  focus: true,
                },
              ];
              var btnsObj =
                NOW.usage_tracking.user_consent == 'ExplicitOptIn'
                  ? buttonsConsent
                  : buttonNotice;
              var options = {
                title: i18n.getMessage('Enable Analytics'),
                message: NOW.usage_tracking.user_analytics_consent_text,
                buttons: btnsObj,
              };
              snAnalyticsConsentModal.open(options).then(updateUserConsent);
            } else $rootScope.$emit('sn.ucm.finished', $rootScope);
          });
      }
      var updateUserConsent = function (obj) {
        var params = { user_consented: obj.user_consent };
        $http.post('/api/now/consent/update', params).then(function (response) {
          var allowTracking = obj.user_consent != 'N';
          NOW.usage_tracking.usage_tracking_allowed_for_session = allowTracking;
          NOW.usage_tracking.user_consent = 'NoConsentRequired';
          NOW.usage_tracking.user_analytics_consent_text = null;
          userPreferences.setPreference('enable_analytics', allowTracking);
          $rootScope.$emit('sn.ucm.finished', $rootScope);
        });
      };
      function isJsonString(str) {
        try {
          JSON.parse(str);
        } catch (e) {
          return false;
        }
        return true;
      }
      var util = {
        invokeUCMEngine: invokeUCMEngine,
      };
      return util;
    }
  );
