/*! RESOURCE: /scripts/highcharts/proj4.js */
!(function (t, s) {
  'object' == typeof exports && 'undefined' != typeof module
    ? (module.exports = s())
    : 'function' == typeof define && define.amd
    ? define(s)
    : (t.proj4 = s());
})(this, function () {
  'use strict';
  function t(t, s) {
    if (t[s]) return t[s];
    for (
      var i, a = Object.keys(t), h = s.toLowerCase().replace(dt, ''), e = -1;
      ++e < a.length;

    )
      if (((i = a[e]), i.toLowerCase().replace(dt, '') === h)) return t[i];
  }
  function s(t) {
    if ('string' != typeof t) throw new Error('not a string');
    (this.text = t.trim()),
      (this.level = 0),
      (this.place = 0),
      (this.root = null),
      (this.stack = []),
      (this.currentObject = null),
      (this.state = _t);
  }
  function i(t) {
    return new s(t).output();
  }
  function a(t, s, i) {
    Array.isArray(s) && (i.unshift(s), (s = null));
    var a = s ? {} : t,
      e = i.reduce(function (t, s) {
        return h(s, t), t;
      }, a);
    s && (t[s] = e);
  }
  function h(t, s) {
    if (Array.isArray(t)) {
      var i = t.shift();
      if (('PARAMETER' === i && (i = t.shift()), 1 === t.length))
        return Array.isArray(t[0])
          ? ((s[i] = {}), void h(t[0], s[i]))
          : void (s[i] = t[0]);
      if (t.length)
        if ('TOWGS84' !== i) {
          Array.isArray(i) || (s[i] = {});
          var e;
          switch (i) {
            case 'UNIT':
            case 'PRIMEM':
            case 'VERT_DATUM':
              return (
                (s[i] = { name: t[0].toLowerCase(), convert: t[1] }),
                void (3 === t.length && h(t[2], s[i]))
              );
            case 'SPHEROID':
            case 'ELLIPSOID':
              return (
                (s[i] = { name: t[0], a: t[1], rf: t[2] }),
                void (4 === t.length && h(t[3], s[i]))
              );
            case 'PROJECTEDCRS':
            case 'PROJCRS':
            case 'GEOGCS':
            case 'GEOCCS':
            case 'PROJCS':
            case 'LOCAL_CS':
            case 'GEODCRS':
            case 'GEODETICCRS':
            case 'GEODETICDATUM':
            case 'EDATUM':
            case 'ENGINEERINGDATUM':
            case 'VERT_CS':
            case 'VERTCRS':
            case 'VERTICALCRS':
            case 'COMPD_CS':
            case 'COMPOUNDCRS':
            case 'ENGINEERINGCRS':
            case 'ENGCRS':
            case 'FITTED_CS':
            case 'LOCAL_DATUM':
            case 'DATUM':
              return (t[0] = ['name', t[0]]), void a(s, i, t);
            default:
              for (e = -1; ++e < t.length; )
                if (!Array.isArray(t[e])) return h(t, s[i]);
              return a(s, i, t);
          }
        } else s[i] = t;
      else s[i] = !0;
    } else s[t] = !0;
  }
  function e(t, s) {
    var i = s[0],
      a = s[1];
    !(i in t) &&
      a in t &&
      ((t[i] = t[a]), 3 === s.length && (t[i] = s[2](t[i])));
  }
  function n(t) {
    return t * At;
  }
  function r(t) {
    function s(s) {
      return s * (t.to_meter || 1);
    }
    'GEOGCS' === t.type
      ? (t.projName = 'longlat')
      : 'LOCAL_CS' === t.type
      ? ((t.projName = 'identity'), (t.local = !0))
      : 'object' == typeof t.PROJECTION
      ? (t.projName = Object.keys(t.PROJECTION)[0])
      : (t.projName = t.PROJECTION),
      t.UNIT &&
        ((t.units = t.UNIT.name.toLowerCase()),
        'metre' === t.units && (t.units = 'meter'),
        t.UNIT.convert &&
          ('GEOGCS' === t.type
            ? t.DATUM &&
              t.DATUM.SPHEROID &&
              (t.to_meter = t.UNIT.convert * t.DATUM.SPHEROID.a)
            : (t.to_meter = t.UNIT.convert)));
    var i = t.GEOGCS;
    'GEOGCS' === t.type && (i = t),
      i &&
        (i.DATUM
          ? (t.datumCode = i.DATUM.name.toLowerCase())
          : (t.datumCode = i.name.toLowerCase()),
        'd_' === t.datumCode.slice(0, 2) &&
          (t.datumCode = t.datumCode.slice(2)),
        ('new_zealand_geodetic_datum_1949' !== t.datumCode &&
          'new_zealand_1949' !== t.datumCode) ||
          (t.datumCode = 'nzgd49'),
        'wgs_1984' === t.datumCode &&
          ('Mercator_Auxiliary_Sphere' === t.PROJECTION && (t.sphere = !0),
          (t.datumCode = 'wgs84')),
        '_ferro' === t.datumCode.slice(-6) &&
          (t.datumCode = t.datumCode.slice(0, -6)),
        '_jakarta' === t.datumCode.slice(-8) &&
          (t.datumCode = t.datumCode.slice(0, -8)),
        ~t.datumCode.indexOf('belge') && (t.datumCode = 'rnb72'),
        i.DATUM &&
          i.DATUM.SPHEROID &&
          ((t.ellps = i.DATUM.SPHEROID.name
            .replace('_19', '')
            .replace(/[Cc]larke\_18/, 'clrk')),
          'international' === t.ellps.toLowerCase().slice(0, 13) &&
            (t.ellps = 'intl'),
          (t.a = i.DATUM.SPHEROID.a),
          (t.rf = parseFloat(i.DATUM.SPHEROID.rf, 10))),
        i.DATUM && i.DATUM.TOWGS84 && (t.datum_params = i.DATUM.TOWGS84),
        ~t.datumCode.indexOf('osgb_1936') && (t.datumCode = 'osgb36'),
        ~t.datumCode.indexOf('osni_1952') && (t.datumCode = 'osni52'),
        (~t.datumCode.indexOf('tm65') ||
          ~t.datumCode.indexOf('geodetic_datum_of_1965')) &&
          (t.datumCode = 'ire65'),
        'ch1903+' === t.datumCode && (t.datumCode = 'ch1903'),
        ~t.datumCode.indexOf('israel') && (t.datumCode = 'isr93')),
      t.b && !isFinite(t.b) && (t.b = t.a);
    [
      ['standard_parallel_1', 'Standard_Parallel_1'],
      ['standard_parallel_2', 'Standard_Parallel_2'],
      ['false_easting', 'False_Easting'],
      ['false_northing', 'False_Northing'],
      ['central_meridian', 'Central_Meridian'],
      ['latitude_of_origin', 'Latitude_Of_Origin'],
      ['latitude_of_origin', 'Central_Parallel'],
      ['scale_factor', 'Scale_Factor'],
      ['k0', 'scale_factor'],
      ['latitude_of_center', 'Latitude_Of_Center'],
      ['latitude_of_center', 'Latitude_of_center'],
      ['lat0', 'latitude_of_center', n],
      ['longitude_of_center', 'Longitude_Of_Center'],
      ['longitude_of_center', 'Longitude_of_center'],
      ['longc', 'longitude_of_center', n],
      ['x0', 'false_easting', s],
      ['y0', 'false_northing', s],
      ['long0', 'central_meridian', n],
      ['lat0', 'latitude_of_origin', n],
      ['lat0', 'standard_parallel_1', n],
      ['lat1', 'standard_parallel_1', n],
      ['lat2', 'standard_parallel_2', n],
      ['azimuth', 'Azimuth'],
      ['alpha', 'azimuth', n],
      ['srsCode', 'name'],
    ].forEach(function (s) {
      return e(t, s);
    }),
      t.long0 ||
        !t.longc ||
        ('Albers_Conic_Equal_Area' !== t.projName &&
          'Lambert_Azimuthal_Equal_Area' !== t.projName) ||
        (t.long0 = t.longc),
      t.lat_ts ||
        !t.lat1 ||
        ('Stereographic_South_Pole' !== t.projName &&
          'Polar Stereographic (variant B)' !== t.projName) ||
        ((t.lat0 = n(t.lat1 > 0 ? 90 : -90)), (t.lat_ts = t.lat1));
  }
  function o(t) {
    var s = this;
    if (2 === arguments.length) {
      var i = arguments[1];
      'string' == typeof i
        ? '+' === i.charAt(0)
          ? (o[t] = yt(arguments[1]))
          : (o[t] = Ct(arguments[1]))
        : (o[t] = i);
    } else if (1 === arguments.length) {
      if (Array.isArray(t))
        return t.map(function (t) {
          Array.isArray(t) ? o.apply(s, t) : o(t);
        });
      if ('string' == typeof t) {
        if (t in o) return o[t];
      } else
        'EPSG' in t
          ? (o['EPSG:' + t.EPSG] = t)
          : 'ESRI' in t
          ? (o['ESRI:' + t.ESRI] = t)
          : 'IAU2000' in t
          ? (o['IAU2000:' + t.IAU2000] = t)
          : console.log(t);
      return;
    }
  }
  function l(t) {
    return 'string' == typeof t;
  }
  function M(t) {
    return t in o;
  }
  function c(t) {
    return Et.some(function (s) {
      return t.indexOf(s) > -1;
    });
  }
  function u(s) {
    var i = t(s, 'authority');
    if (i) {
      var a = t(i, 'epsg');
      return a && Pt.indexOf(a) > -1;
    }
  }
  function f(s) {
    var i = t(s, 'extension');
    if (i) return t(i, 'proj4');
  }
  function m(t) {
    return '+' === t[0];
  }
  function p(t) {
    if (!l(t)) return t;
    if (M(t)) return o[t];
    if (c(t)) {
      var s = Ct(t);
      if (u(s)) return o['EPSG:3857'];
      var i = f(s);
      return i ? yt(i) : s;
    }
    return m(t) ? yt(t) : void 0;
  }
  function d(t) {
    return t;
  }
  function y(t, s) {
    var i = Tt.length;
    return t.names
      ? ((Tt[i] = t),
        t.names.forEach(function (t) {
          Gt[t.toLowerCase()] = i;
        }),
        this)
      : (console.log(s), !0);
  }
  function _(t, s, i, a) {
    var h = t * t,
      e = s * s,
      n = (h - e) / h,
      r = 0;
    return (
      a
        ? ((h = (t *= 1 - n * (et + n * (nt + n * rt))) * t), (n = 0))
        : (r = Math.sqrt(n)),
      { es: n, e: r, ep2: (h - e) / e }
    );
  }
  function x(s, i, a, h, e) {
    if (!s) {
      var n = t(zt, h);
      n || (n = Lt), (s = n.a), (i = n.b), (a = n.rf);
    }
    return (
      a && !i && (i = (1 - 1 / a) * s),
      (0 === a || Math.abs(s - i) < ot) && ((e = !0), (i = s)),
      { a: s, b: i, rf: a, sphere: e }
    );
  }
  function v(t, s, i, a, h, e) {
    var n = {};
    return (
      (n.datum_type = void 0 === t || 'none' === t ? it : st),
      s &&
        ((n.datum_params = s.map(parseFloat)),
        (0 === n.datum_params[0] &&
          0 === n.datum_params[1] &&
          0 === n.datum_params[2]) ||
          (n.datum_type = $),
        n.datum_params.length > 3 &&
          ((0 === n.datum_params[3] &&
            0 === n.datum_params[4] &&
            0 === n.datum_params[5] &&
            0 === n.datum_params[6]) ||
            ((n.datum_type = tt),
            (n.datum_params[3] *= at),
            (n.datum_params[4] *= at),
            (n.datum_params[5] *= at),
            (n.datum_params[6] = n.datum_params[6] / 1e6 + 1)))),
      (n.a = i),
      (n.b = a),
      (n.es = h),
      (n.ep2 = e),
      n
    );
  }
  function Projection(s, i) {
    if (!(this instanceof Projection)) return new Projection(s);
    i =
      i ||
      function (t) {
        if (t) throw t;
      };
    var a = p(s);
    if ('object' == typeof a) {
      var h = Projection.projections.get(a.projName);
      if (h) {
        if (a.datumCode && 'none' !== a.datumCode) {
          var e = t(Dt, a.datumCode);
          e &&
            ((a.datum_params = e.towgs84 ? e.towgs84.split(',') : null),
            (a.ellps = e.ellipse),
            (a.datumName = e.datumName ? e.datumName : a.datumCode));
        }
        (a.k0 = a.k0 || 1),
          (a.axis = a.axis || 'enu'),
          (a.ellps = a.ellps || 'wgs84');
        var n = x(a.a, a.b, a.rf, a.ellps, a.sphere),
          r = _(n.a, n.b, n.rf, a.R_A),
          o = a.datum || v(a.datumCode, a.datum_params, n.a, n.b, r.es, r.ep2);
        Nt(this, a),
          Nt(this, h),
          (this.a = n.a),
          (this.b = n.b),
          (this.rf = n.rf),
          (this.sphere = n.sphere),
          (this.es = r.es),
          (this.e = r.e),
          (this.ep2 = r.ep2),
          (this.datum = o),
          this.init(),
          i(null, this);
      } else i(s);
    } else i(s);
  }
  function g(t, s) {
    return (
      t.datum_type === s.datum_type &&
      !(t.a !== s.a || Math.abs(t.es - s.es) > 5e-11) &&
      (t.datum_type === $
        ? t.datum_params[0] === s.datum_params[0] &&
          t.datum_params[1] === s.datum_params[1] &&
          t.datum_params[2] === s.datum_params[2]
        : t.datum_type !== tt ||
          (t.datum_params[0] === s.datum_params[0] &&
            t.datum_params[1] === s.datum_params[1] &&
            t.datum_params[2] === s.datum_params[2] &&
            t.datum_params[3] === s.datum_params[3] &&
            t.datum_params[4] === s.datum_params[4] &&
            t.datum_params[5] === s.datum_params[5] &&
            t.datum_params[6] === s.datum_params[6]))
    );
  }
  function b(t, s, i) {
    var a,
      h,
      e,
      n,
      r = t.x,
      o = t.y,
      l = t.z ? t.z : 0;
    if (o < -ht && o > -1.001 * ht) o = -ht;
    else if (o > ht && o < 1.001 * ht) o = ht;
    else {
      if (o < -ht) return { x: -1 / 0, y: -1 / 0, z: t.z };
      if (o > ht) return { x: 1 / 0, y: 1 / 0, z: t.z };
    }
    return (
      r > Math.PI && (r -= 2 * Math.PI),
      (h = Math.sin(o)),
      (n = Math.cos(o)),
      (e = h * h),
      (a = i / Math.sqrt(1 - s * e)),
      {
        x: (a + l) * n * Math.cos(r),
        y: (a + l) * n * Math.sin(r),
        z: (a * (1 - s) + l) * h,
      }
    );
  }
  function w(t, s, i, a) {
    var h,
      e,
      n,
      r,
      o,
      l,
      M,
      c,
      u,
      f,
      m,
      p,
      d,
      y,
      _,
      x,
      v = t.x,
      g = t.y,
      b = t.z ? t.z : 0;
    if (
      ((h = Math.sqrt(v * v + g * g)),
      (e = Math.sqrt(v * v + g * g + b * b)),
      h / i < 1e-12)
    ) {
      if (((y = 0), e / i < 1e-12))
        return (_ = ht), (x = -a), { x: t.x, y: t.y, z: t.z };
    } else y = Math.atan2(g, v);
    (n = b / e),
      (c =
        (r = h / e) * (1 - s) * (o = 1 / Math.sqrt(1 - s * (2 - s) * r * r))),
      (u = n * o),
      (d = 0);
    do {
      d++,
        (l =
          (s * (M = i / Math.sqrt(1 - s * u * u))) /
          (M + (x = h * c + b * u - M * (1 - s * u * u)))),
        (p =
          (m = n * (o = 1 / Math.sqrt(1 - l * (2 - l) * r * r))) * c -
          (f = r * (1 - l) * o) * u),
        (c = f),
        (u = m);
    } while (p * p > 1e-24 && d < 30);
    return (_ = Math.atan(m / Math.abs(f))), { x: y, y: _, z: x };
  }
  function A(t, s, i) {
    if (s === $) return { x: t.x + i[0], y: t.y + i[1], z: t.z + i[2] };
    if (s === tt) {
      var a = i[0],
        h = i[1],
        e = i[2],
        n = i[3],
        r = i[4],
        o = i[5],
        l = i[6];
      return {
        x: l * (t.x - o * t.y + r * t.z) + a,
        y: l * (o * t.x + t.y - n * t.z) + h,
        z: l * (-r * t.x + n * t.y + t.z) + e,
      };
    }
  }
  function C(t, s, i) {
    if (s === $) return { x: t.x - i[0], y: t.y - i[1], z: t.z - i[2] };
    if (s === tt) {
      var a = i[0],
        h = i[1],
        e = i[2],
        n = i[3],
        r = i[4],
        o = i[5],
        l = i[6],
        M = (t.x - a) / l,
        c = (t.y - h) / l,
        u = (t.z - e) / l;
      return {
        x: M + o * c - r * u,
        y: -o * M + c + n * u,
        z: r * M - n * c + u,
      };
    }
  }
  function E(t) {
    return t === $ || t === tt;
  }
  function P(t) {
    if ('function' == typeof Number.isFinite) {
      if (Number.isFinite(t)) return;
      throw new TypeError('coordinates must be finite numbers');
    }
    if ('number' != typeof t || t !== t || !isFinite(t))
      throw new TypeError('coordinates must be finite numbers');
  }
  function N(t, s) {
    return (
      ((t.datum.datum_type === $ || t.datum.datum_type === tt) &&
        'WGS84' !== s.datumCode) ||
      ((s.datum.datum_type === $ || s.datum.datum_type === tt) &&
        'WGS84' !== t.datumCode)
    );
  }
  function S(t, s, i) {
    var a;
    return (
      Array.isArray(i) && (i = Ft(i)),
      Qt(i),
      t.datum &&
        s.datum &&
        N(t, s) &&
        ((i = S(t, (a = new Projection('WGS84')), i)), (t = a)),
      'enu' !== t.axis && (i = Ut(t, !1, i)),
      'longlat' === t.projName
        ? (i = { x: i.x * lt, y: i.y * lt, z: i.z || 0 })
        : (t.to_meter &&
            (i = { x: i.x * t.to_meter, y: i.y * t.to_meter, z: i.z || 0 }),
          (i = t.inverse(i))),
      t.from_greenwich && (i.x += t.from_greenwich),
      (i = Bt(t.datum, s.datum, i)),
      s.from_greenwich &&
        (i = { x: i.x - s.from_greenwich, y: i.y, z: i.z || 0 }),
      'longlat' === s.projName
        ? (i = { x: i.x * Mt, y: i.y * Mt, z: i.z || 0 })
        : ((i = s.forward(i)),
          s.to_meter &&
            (i = { x: i.x / s.to_meter, y: i.y / s.to_meter, z: i.z || 0 })),
      'enu' !== s.axis ? Ut(s, !0, i) : i
    );
  }
  function k(t, s, i) {
    var a, h, e;
    return Array.isArray(i)
      ? ((a = S(t, s, i) || { x: NaN, y: NaN }),
        i.length > 2
          ? (void 0 !== t.name && 'geocent' === t.name) ||
            (void 0 !== s.name && 'geocent' === s.name)
            ? 'number' == typeof a.z
              ? [a.x, a.y, a.z].concat(i.splice(3))
              : [a.x, a.y, i[2]].concat(i.splice(3))
            : [a.x, a.y].concat(i.splice(2))
          : [a.x, a.y])
      : ((h = S(t, s, i)),
        2 === (e = Object.keys(i)).length
          ? h
          : (e.forEach(function (a) {
              if (
                (void 0 !== t.name && 'geocent' === t.name) ||
                (void 0 !== s.name && 'geocent' === s.name)
              ) {
                if ('x' === a || 'y' === a || 'z' === a) return;
              } else if ('x' === a || 'y' === a) return;
              h[a] = i[a];
            }),
            h));
  }
  function q(t) {
    return t instanceof Projection ? t : t.oProj ? t.oProj : Projection(t);
  }
  function I(t, s, i) {
    t = q(t);
    var a,
      h = !1;
    return (
      void 0 === s
        ? ((s = t), (t = Wt), (h = !0))
        : (void 0 !== s.x || Array.isArray(s)) &&
          ((i = s), (s = t), (t = Wt), (h = !0)),
      (s = q(s)),
      i
        ? k(t, s, i)
        : ((a = {
            forward: function (i) {
              return k(t, s, i);
            },
            inverse: function (i) {
              return k(s, t, i);
            },
          }),
          h && (a.oProj = s),
          a)
    );
  }
  function O(t, s) {
    return (s = s || 5), D(j({ lat: t[1], lon: t[0] }), s);
  }
  function R(t) {
    var s = z(Q(t.toUpperCase()));
    return s.lat && s.lon
      ? [s.lon, s.lat]
      : [(s.left + s.right) / 2, (s.top + s.bottom) / 2];
  }
  function G(t) {
    return t * (Math.PI / 180);
  }
  function T(t) {
    return (t / Math.PI) * 180;
  }
  function j(t) {
    var s,
      i,
      a,
      h,
      e,
      n,
      r,
      o = t.lat,
      l = t.lon,
      M = 6378137,
      c = G(o),
      u = G(l);
    (r = Math.floor((l + 180) / 6) + 1),
      180 === l && (r = 60),
      o >= 56 && o < 64 && l >= 3 && l < 12 && (r = 32),
      o >= 72 &&
        o < 84 &&
        (l >= 0 && l < 9
          ? (r = 31)
          : l >= 9 && l < 21
          ? (r = 33)
          : l >= 21 && l < 33
          ? (r = 35)
          : l >= 33 && l < 42 && (r = 37)),
      (n = G(6 * (r - 1) - 180 + 3)),
      (s = M / Math.sqrt(1 - 0.00669438 * Math.sin(c) * Math.sin(c))),
      (i = Math.tan(c) * Math.tan(c)),
      (a = 0.006739496752268451 * Math.cos(c) * Math.cos(c));
    var f =
        0.9996 *
          s *
          ((h = Math.cos(c) * (u - n)) +
            ((1 - i + a) * h * h * h) / 6 +
            ((5 - 18 * i + i * i + 72 * a - 0.39089081163157013) *
              h *
              h *
              h *
              h *
              h) /
              120) +
        5e5,
      m =
        0.9996 *
        ((e =
          M *
          (0.9983242984503243 * c -
            0.002514607064228144 * Math.sin(2 * c) +
            2639046602129982e-21 * Math.sin(4 * c) -
            3.418046101696858e-9 * Math.sin(6 * c))) +
          s *
            Math.tan(c) *
            ((h * h) / 2 +
              ((5 - i + 9 * a + 4 * a * a) * h * h * h * h) / 24 +
              ((61 - 58 * i + i * i + 600 * a - 2.2240339282485886) *
                h *
                h *
                h *
                h *
                h *
                h) /
                720));
    return (
      o < 0 && (m += 1e7),
      {
        northing: Math.round(m),
        easting: Math.round(f),
        zoneNumber: r,
        zoneLetter: L(o),
      }
    );
  }
  function z(t) {
    var s = t.northing,
      i = t.easting,
      a = t.zoneLetter,
      h = t.zoneNumber;
    if (h < 0 || h > 60) return null;
    var e,
      n,
      r,
      o,
      l,
      M,
      c,
      u,
      f = 6378137,
      m = (1 - Math.sqrt(0.99330562)) / (1 + Math.sqrt(0.99330562)),
      p = i - 5e5,
      d = s;
    a < 'N' && (d -= 1e7),
      (M = 6 * (h - 1) - 180 + 3),
      (u =
        (c = d / 0.9996 / 6367449.145945056) +
        ((3 * m) / 2 - (27 * m * m * m) / 32) * Math.sin(2 * c) +
        ((21 * m * m) / 16 - (55 * m * m * m * m) / 32) * Math.sin(4 * c) +
        ((151 * m * m * m) / 96) * Math.sin(6 * c)),
      (e = f / Math.sqrt(1 - 0.00669438 * Math.sin(u) * Math.sin(u))),
      (n = Math.tan(u) * Math.tan(u)),
      (r = 0.006739496752268451 * Math.cos(u) * Math.cos(u)),
      (o =
        (0.99330562 * f) /
        Math.pow(1 - 0.00669438 * Math.sin(u) * Math.sin(u), 1.5)),
      (l = p / (0.9996 * e));
    var y =
      u -
      ((e * Math.tan(u)) / o) *
        ((l * l) / 2 -
          ((5 + 3 * n + 10 * r - 4 * r * r - 0.06065547077041606) *
            l *
            l *
            l *
            l) /
            24 +
          ((61 +
            90 * n +
            298 * r +
            45 * n * n -
            1.6983531815716497 -
            3 * r * r) *
            l *
            l *
            l *
            l *
            l *
            l) /
            720);
    y = T(y);
    var _ =
      (l -
        ((1 + 2 * n + r) * l * l * l) / 6 +
        ((5 - 2 * r + 28 * n - 3 * r * r + 0.05391597401814761 + 24 * n * n) *
          l *
          l *
          l *
          l *
          l) /
          120) /
      Math.cos(u);
    _ = M + T(_);
    var x;
    if (t.accuracy) {
      var v = z({
        northing: t.northing + t.accuracy,
        easting: t.easting + t.accuracy,
        zoneLetter: t.zoneLetter,
        zoneNumber: t.zoneNumber,
      });
      x = { top: v.lat, right: v.lon, bottom: y, left: _ };
    } else x = { lat: y, lon: _ };
    return x;
  }
  function L(t) {
    var s = 'Z';
    return (
      84 >= t && t >= 72
        ? (s = 'X')
        : 72 > t && t >= 64
        ? (s = 'W')
        : 64 > t && t >= 56
        ? (s = 'V')
        : 56 > t && t >= 48
        ? (s = 'U')
        : 48 > t && t >= 40
        ? (s = 'T')
        : 40 > t && t >= 32
        ? (s = 'S')
        : 32 > t && t >= 24
        ? (s = 'R')
        : 24 > t && t >= 16
        ? (s = 'Q')
        : 16 > t && t >= 8
        ? (s = 'P')
        : 8 > t && t >= 0
        ? (s = 'N')
        : 0 > t && t >= -8
        ? (s = 'M')
        : -8 > t && t >= -16
        ? (s = 'L')
        : -16 > t && t >= -24
        ? (s = 'K')
        : -24 > t && t >= -32
        ? (s = 'J')
        : -32 > t && t >= -40
        ? (s = 'H')
        : -40 > t && t >= -48
        ? (s = 'G')
        : -48 > t && t >= -56
        ? (s = 'F')
        : -56 > t && t >= -64
        ? (s = 'E')
        : -64 > t && t >= -72
        ? (s = 'D')
        : -72 > t && t >= -80 && (s = 'C'),
      s
    );
  }
  function D(t, s) {
    var i = '00000' + t.easting,
      a = '00000' + t.northing;
    return (
      t.zoneNumber +
      t.zoneLetter +
      B(t.easting, t.northing, t.zoneNumber) +
      i.substr(i.length - 5, s) +
      a.substr(a.length - 5, s)
    );
  }
  function B(t, s, i) {
    var a = U(i);
    return F(Math.floor(t / 1e5), Math.floor(s / 1e5) % 20, a);
  }
  function U(t) {
    var s = t % Ht;
    return 0 === s && (s = Ht), s;
  }
  function F(t, s, i) {
    var a = i - 1,
      h = Kt.charCodeAt(a),
      e = Xt.charCodeAt(a),
      n = h + t - 1,
      r = e + s,
      o = !1;
    return (
      n > $t && ((n = n - $t + Jt - 1), (o = !0)),
      (n === Vt || (h < Vt && n > Vt) || ((n > Vt || h < Vt) && o)) && n++,
      (n === Zt || (h < Zt && n > Zt) || ((n > Zt || h < Zt) && o)) &&
        ++n === Vt &&
        n++,
      n > $t && (n = n - $t + Jt - 1),
      r > Yt ? ((r = r - Yt + Jt - 1), (o = !0)) : (o = !1),
      (r === Vt || (e < Vt && r > Vt) || ((r > Vt || e < Vt) && o)) && r++,
      (r === Zt || (e < Zt && r > Zt) || ((r > Zt || e < Zt) && o)) &&
        ++r === Vt &&
        r++,
      r > Yt && (r = r - Yt + Jt - 1),
      String.fromCharCode(n) + String.fromCharCode(r)
    );
  }
  function Q(t) {
    if (t && 0 === t.length) throw 'MGRSPoint coverting from nothing';
    for (
      var s, i = t.length, a = null, h = '', e = 0;
      !/[A-Z]/.test((s = t.charAt(e)));

    ) {
      if (e >= 2) throw 'MGRSPoint bad conversion from: ' + t;
      (h += s), e++;
    }
    var n = parseInt(h, 10);
    if (0 === e || e + 3 > i) throw 'MGRSPoint bad conversion from: ' + t;
    var r = t.charAt(e++);
    if (
      r <= 'A' ||
      'B' === r ||
      'Y' === r ||
      r >= 'Z' ||
      'I' === r ||
      'O' === r
    )
      throw 'MGRSPoint zone letter ' + r + ' not handled: ' + t;
    a = t.substring(e, (e += 2));
    for (var o = U(n), l = W(a.charAt(0), o), M = H(a.charAt(1), o); M < K(r); )
      M += 2e6;
    var c = i - e;
    if (c % 2 != 0)
      throw (
        'MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters' +
        t
      );
    var u,
      f,
      m,
      p,
      d,
      y = c / 2,
      _ = 0,
      x = 0;
    return (
      y > 0 &&
        ((u = 1e5 / Math.pow(10, y)),
        (f = t.substring(e, e + y)),
        (_ = parseFloat(f) * u),
        (m = t.substring(e + y)),
        (x = parseFloat(m) * u)),
      (p = _ + l),
      (d = x + M),
      { easting: p, northing: d, zoneLetter: r, zoneNumber: n, accuracy: u }
    );
  }
  function W(t, s) {
    for (
      var i = Kt.charCodeAt(s - 1), a = 1e5, h = !1;
      i !== t.charCodeAt(0);

    ) {
      if ((++i === Vt && i++, i === Zt && i++, i > $t)) {
        if (h) throw 'Bad character: ' + t;
        (i = Jt), (h = !0);
      }
      a += 1e5;
    }
    return a;
  }
  function H(t, s) {
    if (t > 'V') throw 'MGRSPoint given invalid Northing ' + t;
    for (var i = Xt.charCodeAt(s - 1), a = 0, h = !1; i !== t.charCodeAt(0); ) {
      if ((++i === Vt && i++, i === Zt && i++, i > Yt)) {
        if (h) throw 'Bad character: ' + t;
        (i = Jt), (h = !0);
      }
      a += 1e5;
    }
    return a;
  }
  function K(t) {
    var s;
    switch (t) {
      case 'C':
        s = 11e5;
        break;
      case 'D':
        s = 2e6;
        break;
      case 'E':
        s = 28e5;
        break;
      case 'F':
        s = 37e5;
        break;
      case 'G':
        s = 46e5;
        break;
      case 'H':
        s = 55e5;
        break;
      case 'J':
        s = 64e5;
        break;
      case 'K':
        s = 73e5;
        break;
      case 'L':
        s = 82e5;
        break;
      case 'M':
        s = 91e5;
        break;
      case 'N':
        s = 0;
        break;
      case 'P':
        s = 8e5;
        break;
      case 'Q':
        s = 17e5;
        break;
      case 'R':
        s = 26e5;
        break;
      case 'S':
        s = 35e5;
        break;
      case 'T':
        s = 44e5;
        break;
      case 'U':
        s = 53e5;
        break;
      case 'V':
        s = 62e5;
        break;
      case 'W':
        s = 7e6;
        break;
      case 'X':
        s = 79e5;
        break;
      default:
        s = -1;
    }
    if (s >= 0) return s;
    throw 'Invalid zone letter: ' + t;
  }
  function Point(t, s, i) {
    if (!(this instanceof Point)) return new Point(t, s, i);
    if (Array.isArray(t))
      (this.x = t[0]), (this.y = t[1]), (this.z = t[2] || 0);
    else if ('object' == typeof t)
      (this.x = t.x), (this.y = t.y), (this.z = t.z || 0);
    else if ('string' == typeof t && void 0 === s) {
      var a = t.split(',');
      (this.x = parseFloat(a[0], 10)),
        (this.y = parseFloat(a[1], 10)),
        (this.z = parseFloat(a[2], 10) || 0);
    } else (this.x = t), (this.y = s), (this.z = i || 0);
    console.warn('proj4.Point will be removed in version 3, use proj4.toPoint');
  }
  function X(t) {
    var s,
      i = [];
    return (
      (i[0] = t * Ts),
      (s = t * t),
      (i[0] += s * js),
      (i[1] = s * Ls),
      (s *= t),
      (i[0] += s * zs),
      (i[1] += s * Ds),
      (i[2] = s * Bs),
      i
    );
  }
  function J(t, s) {
    var i = t + t;
    return (
      t +
      s[0] * Math.sin(i) +
      s[1] * Math.sin(i + i) +
      s[2] * Math.sin(i + i + i)
    );
  }
  function V(t, s, i, a) {
    var h;
    return (
      t < ot
        ? ((a.value = ri.AREA_0), (h = 0))
        : ((h = Math.atan2(s, i)),
          Math.abs(h) <= ct
            ? (a.value = ri.AREA_0)
            : h > ct && h <= ht + ct
            ? ((a.value = ri.AREA_1), (h -= ht))
            : h > ht + ct || h <= -(ht + ct)
            ? ((a.value = ri.AREA_2), (h = h >= 0 ? h - ft : h + ft))
            : ((a.value = ri.AREA_3), (h += ht))),
      h
    );
  }
  function Z(t, s) {
    var i = t + s;
    return i < -ft ? (i += ut) : i > +ft && (i -= ut), i;
  }
  function Y(t, s, i, a) {
    for (var h = s; a; --a) {
      var e = t(h);
      if (((h -= e), Math.abs(e) < i)) break;
    }
    return h;
  }
  var $ = 1,
    tt = 2,
    st = 4,
    it = 5,
    at = 484813681109536e-20,
    ht = Math.PI / 2,
    et = 0.16666666666666666,
    nt = 0.04722222222222222,
    rt = 0.022156084656084655,
    ot = 1e-10,
    lt = 0.017453292519943295,
    Mt = 57.29577951308232,
    ct = Math.PI / 4,
    ut = 2 * Math.PI,
    ft = 3.14159265359,
    mt = {};
  (mt.greenwich = 0),
    (mt.lisbon = -9.131906111111),
    (mt.paris = 2.337229166667),
    (mt.bogota = -74.080916666667),
    (mt.madrid = -3.687938888889),
    (mt.rome = 12.452333333333),
    (mt.bern = 7.439583333333),
    (mt.jakarta = 106.807719444444),
    (mt.ferro = -17.666666666667),
    (mt.brussels = 4.367975),
    (mt.stockholm = 18.058277777778),
    (mt.athens = 23.7163375),
    (mt.oslo = 10.722916666667);
  var pt = { ft: { to_meter: 0.3048 }, 'us-ft': { to_meter: 1200 / 3937 } },
    dt = /[\s_\-\/\(\)]/g,
    yt = function (s) {
      var i,
        a,
        h,
        e = {},
        n = s
          .split('+')
          .map(function (t) {
            return t.trim();
          })
          .filter(function (t) {
            return t;
          })
          .reduce(function (t, s) {
            var i = s.split('=');
            return i.push(!0), (t[i[0].toLowerCase()] = i[1]), t;
          }, {}),
        r = {
          proj: 'projName',
          datum: 'datumCode',
          rf: function (t) {
            e.rf = parseFloat(t);
          },
          lat_0: function (t) {
            e.lat0 = t * lt;
          },
          lat_1: function (t) {
            e.lat1 = t * lt;
          },
          lat_2: function (t) {
            e.lat2 = t * lt;
          },
          lat_ts: function (t) {
            e.lat_ts = t * lt;
          },
          lon_0: function (t) {
            e.long0 = t * lt;
          },
          lon_1: function (t) {
            e.long1 = t * lt;
          },
          lon_2: function (t) {
            e.long2 = t * lt;
          },
          alpha: function (t) {
            e.alpha = parseFloat(t) * lt;
          },
          lonc: function (t) {
            e.longc = t * lt;
          },
          x_0: function (t) {
            e.x0 = parseFloat(t);
          },
          y_0: function (t) {
            e.y0 = parseFloat(t);
          },
          k_0: function (t) {
            e.k0 = parseFloat(t);
          },
          k: function (t) {
            e.k0 = parseFloat(t);
          },
          a: function (t) {
            e.a = parseFloat(t);
          },
          b: function (t) {
            e.b = parseFloat(t);
          },
          r_a: function () {
            e.R_A = !0;
          },
          zone: function (t) {
            e.zone = parseInt(t, 10);
          },
          south: function () {
            e.utmSouth = !0;
          },
          towgs84: function (t) {
            e.datum_params = t.split(',').map(function (t) {
              return parseFloat(t);
            });
          },
          to_meter: function (t) {
            e.to_meter = parseFloat(t);
          },
          units: function (s) {
            e.units = s;
            var i = t(pt, s);
            i && (e.to_meter = i.to_meter);
          },
          from_greenwich: function (t) {
            e.from_greenwich = t * lt;
          },
          pm: function (s) {
            var i = t(mt, s);
            e.from_greenwich = (i || parseFloat(s)) * lt;
          },
          nadgrids: function (t) {
            '@null' === t ? (e.datumCode = 'none') : (e.nadgrids = t);
          },
          axis: function (t) {
            3 === t.length &&
              -1 !== 'ewnsud'.indexOf(t.substr(0, 1)) &&
              -1 !== 'ewnsud'.indexOf(t.substr(1, 1)) &&
              -1 !== 'ewnsud'.indexOf(t.substr(2, 1)) &&
              (e.axis = t);
          },
        };
      for (i in n)
        (a = n[i]),
          i in r
            ? 'function' == typeof (h = r[i])
              ? h(a)
              : (e[h] = a)
            : (e[i] = a);
      return (
        'string' == typeof e.datumCode &&
          'WGS84' !== e.datumCode &&
          (e.datumCode = e.datumCode.toLowerCase()),
        e
      );
    },
    _t = 1,
    xt = /\s/,
    vt = /[A-Za-z]/,
    gt = /[A-Za-z84]/,
    bt = /[,\]]/,
    wt = /[\d\.E\-\+]/;
  (s.prototype.readCharicter = function () {
    var t = this.text[this.place++];
    if (4 !== this.state)
      for (; xt.test(t); ) {
        if (this.place >= this.text.length) return;
        t = this.text[this.place++];
      }
    switch (this.state) {
      case _t:
        return this.neutral(t);
      case 2:
        return this.keyword(t);
      case 4:
        return this.quoted(t);
      case 5:
        return this.afterquote(t);
      case 3:
        return this.number(t);
      case -1:
        return;
    }
  }),
    (s.prototype.afterquote = function (t) {
      if ('"' === t) return (this.word += '"'), void (this.state = 4);
      if (bt.test(t))
        return (this.word = this.word.trim()), void this.afterItem(t);
      throw new Error(
        'havn\'t handled "' + t + '" in afterquote yet, index ' + this.place
      );
    }),
    (s.prototype.afterItem = function (t) {
      return ',' === t
        ? (null !== this.word && this.currentObject.push(this.word),
          (this.word = null),
          void (this.state = _t))
        : ']' === t
        ? (this.level--,
          null !== this.word &&
            (this.currentObject.push(this.word), (this.word = null)),
          (this.state = _t),
          (this.currentObject = this.stack.pop()),
          void (this.currentObject || (this.state = -1)))
        : void 0;
    }),
    (s.prototype.number = function (t) {
      if (!wt.test(t)) {
        if (bt.test(t))
          return (this.word = parseFloat(this.word)), void this.afterItem(t);
        throw new Error(
          'havn\'t handled "' + t + '" in number yet, index ' + this.place
        );
      }
      this.word += t;
    }),
    (s.prototype.quoted = function (t) {
      '"' !== t ? (this.word += t) : (this.state = 5);
    }),
    (s.prototype.keyword = function (t) {
      if (gt.test(t)) this.word += t;
      else {
        if ('[' === t) {
          var s = [];
          return (
            s.push(this.word),
            this.level++,
            null === this.root ? (this.root = s) : this.currentObject.push(s),
            this.stack.push(this.currentObject),
            (this.currentObject = s),
            void (this.state = _t)
          );
        }
        if (!bt.test(t))
          throw new Error(
            'havn\'t handled "' + t + '" in keyword yet, index ' + this.place
          );
        this.afterItem(t);
      }
    }),
    (s.prototype.neutral = function (t) {
      if (vt.test(t)) return (this.word = t), void (this.state = 2);
      if ('"' === t) return (this.word = ''), void (this.state = 4);
      if (wt.test(t)) return (this.word = t), void (this.state = 3);
      {
        if (!bt.test(t))
          throw new Error(
            'havn\'t handled "' + t + '" in neutral yet, index ' + this.place
          );
        this.afterItem(t);
      }
    }),
    (s.prototype.output = function () {
      for (; this.place < this.text.length; ) this.readCharicter();
      if (-1 === this.state) return this.root;
      throw new Error(
        'unable to parse string "' + this.text + '". State is ' + this.state
      );
    });
  var At = 0.017453292519943295,
    Ct = function (t) {
      var s = i(t),
        a = s.shift(),
        e = s.shift();
      s.unshift(['name', e]), s.unshift(['type', a]);
      var n = {};
      return h(s, n), r(n), n;
    };
  !(function (t) {
    t(
      'EPSG:4326',
      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'
    ),
      t(
        'EPSG:4269',
        '+title=NAD83 (long/lat) +proj=longlat +a=6378137.0 +b=6356752.31414036 +ellps=GRS80 +datum=NAD83 +units=degrees'
      ),
      t(
        'EPSG:3857',
        '+title=WGS 84 / Pseudo-Mercator +proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs'
      ),
      (t.WGS84 = t['EPSG:4326']),
      (t['EPSG:3785'] = t['EPSG:3857']),
      (t.GOOGLE = t['EPSG:3857']),
      (t['EPSG:900913'] = t['EPSG:3857']),
      (t['EPSG:102113'] = t['EPSG:3857']);
  })(o);
  var Et = [
      'PROJECTEDCRS',
      'PROJCRS',
      'GEOGCS',
      'GEOCCS',
      'PROJCS',
      'LOCAL_CS',
      'GEODCRS',
      'GEODETICCRS',
      'GEODETICDATUM',
      'ENGCRS',
      'ENGINEERINGCRS',
    ],
    Pt = ['3857', '900913', '3785', '102113'],
    Nt = function (t, s) {
      t = t || {};
      var i, a;
      if (!s) return t;
      for (a in s) void 0 !== (i = s[a]) && (t[a] = i);
      return t;
    },
    St = function (t, s, i) {
      var a = t * s;
      return i / Math.sqrt(1 - a * a);
    },
    kt = function (t) {
      return t < 0 ? -1 : 1;
    },
    qt = function (t) {
      return Math.abs(t) <= ft ? t : t - kt(t) * ut;
    },
    It = function (t, s, i) {
      var a = t * i,
        h = 0.5 * t;
      return (a = Math.pow((1 - a) / (1 + a), h)), Math.tan(0.5 * (ht - s)) / a;
    },
    Ot = function (t, s) {
      for (
        var i, a, h = 0.5 * t, e = ht - 2 * Math.atan(s), n = 0;
        n <= 15;
        n++
      )
        if (
          ((i = t * Math.sin(e)),
          (a = ht - 2 * Math.atan(s * Math.pow((1 - i) / (1 + i), h)) - e),
          (e += a),
          Math.abs(a) <= 1e-10)
        )
          return e;
      return -9999;
    },
    Rt = [
      {
        init: function () {
          var t = this.b / this.a;
          (this.es = 1 - t * t),
            'x0' in this || (this.x0 = 0),
            'y0' in this || (this.y0 = 0),
            (this.e = Math.sqrt(this.es)),
            this.lat_ts
              ? this.sphere
                ? (this.k0 = Math.cos(this.lat_ts))
                : (this.k0 = St(
                    this.e,
                    Math.sin(this.lat_ts),
                    Math.cos(this.lat_ts)
                  ))
              : this.k0 || (this.k ? (this.k0 = this.k) : (this.k0 = 1));
        },
        forward: function (t) {
          var s = t.x,
            i = t.y;
          if (i * Mt > 90 && i * Mt < -90 && s * Mt > 180 && s * Mt < -180)
            return null;
          var a, h;
          if (Math.abs(Math.abs(i) - ht) <= ot) return null;
          if (this.sphere)
            (a = this.x0 + this.a * this.k0 * qt(s - this.long0)),
              (h =
                this.y0 + this.a * this.k0 * Math.log(Math.tan(ct + 0.5 * i)));
          else {
            var e = Math.sin(i),
              n = It(this.e, i, e);
            (a = this.x0 + this.a * this.k0 * qt(s - this.long0)),
              (h = this.y0 - this.a * this.k0 * Math.log(n));
          }
          return (t.x = a), (t.y = h), t;
        },
        inverse: function (t) {
          var s,
            i,
            a = t.x - this.x0,
            h = t.y - this.y0;
          if (this.sphere)
            i = ht - 2 * Math.atan(Math.exp(-h / (this.a * this.k0)));
          else {
            var e = Math.exp(-h / (this.a * this.k0));
            if (-9999 === (i = Ot(this.e, e))) return null;
          }
          return (
            (s = qt(this.long0 + a / (this.a * this.k0))),
            (t.x = s),
            (t.y = i),
            t
          );
        },
        names: [
          'Mercator',
          'Popular Visualisation Pseudo Mercator',
          'Mercator_1SP',
          'Mercator_Auxiliary_Sphere',
          'merc',
        ],
      },
      {
        init: function () {},
        forward: d,
        inverse: d,
        names: ['longlat', 'identity'],
      },
    ],
    Gt = {},
    Tt = [],
    jt = {
      start: function () {
        Rt.forEach(y);
      },
      add: y,
      get: function (t) {
        if (!t) return !1;
        var s = t.toLowerCase();
        return void 0 !== Gt[s] && Tt[Gt[s]] ? Tt[Gt[s]] : void 0;
      },
    },
    zt = {};
  (zt.MERIT = { a: 6378137, rf: 298.257, ellipseName: 'MERIT 1983' }),
    (zt.SGS85 = {
      a: 6378136,
      rf: 298.257,
      ellipseName: 'Soviet Geodetic System 85',
    }),
    (zt.GRS80 = {
      a: 6378137,
      rf: 298.257222101,
      ellipseName: 'GRS 1980(IUGG, 1980)',
    }),
    (zt.IAU76 = { a: 6378140, rf: 298.257, ellipseName: 'IAU 1976' }),
    (zt.airy = { a: 6377563.396, b: 6356256.91, ellipseName: 'Airy 1830' }),
    (zt.APL4 = { a: 6378137, rf: 298.25, ellipseName: 'Appl. Physics. 1965' }),
    (zt.NWL9D = {
      a: 6378145,
      rf: 298.25,
      ellipseName: 'Naval Weapons Lab., 1965',
    }),
    (zt.mod_airy = {
      a: 6377340.189,
      b: 6356034.446,
      ellipseName: 'Modified Airy',
    }),
    (zt.andrae = {
      a: 6377104.43,
      rf: 300,
      ellipseName: 'Andrae 1876 (Den., Iclnd.)',
    }),
    (zt.aust_SA = {
      a: 6378160,
      rf: 298.25,
      ellipseName: 'Australian Natl & S. Amer. 1969',
    }),
    (zt.GRS67 = {
      a: 6378160,
      rf: 298.247167427,
      ellipseName: 'GRS 67(IUGG 1967)',
    }),
    (zt.bessel = {
      a: 6377397.155,
      rf: 299.1528128,
      ellipseName: 'Bessel 1841',
    }),
    (zt.bess_nam = {
      a: 6377483.865,
      rf: 299.1528128,
      ellipseName: 'Bessel 1841 (Namibia)',
    }),
    (zt.clrk66 = { a: 6378206.4, b: 6356583.8, ellipseName: 'Clarke 1866' }),
    (zt.clrk80 = {
      a: 6378249.145,
      rf: 293.4663,
      ellipseName: 'Clarke 1880 mod.',
    }),
    (zt.clrk58 = {
      a: 6378293.645208759,
      rf: 294.2606763692654,
      ellipseName: 'Clarke 1858',
    }),
    (zt.CPM = {
      a: 6375738.7,
      rf: 334.29,
      ellipseName: 'Comm. des Poids et Mesures 1799',
    }),
    (zt.delmbr = {
      a: 6376428,
      rf: 311.5,
      ellipseName: 'Delambre 1810 (Belgium)',
    }),
    (zt.engelis = { a: 6378136.05, rf: 298.2566, ellipseName: 'Engelis 1985' }),
    (zt.evrst30 = {
      a: 6377276.345,
      rf: 300.8017,
      ellipseName: 'Everest 1830',
    }),
    (zt.evrst48 = {
      a: 6377304.063,
      rf: 300.8017,
      ellipseName: 'Everest 1948',
    }),
    (zt.evrst56 = {
      a: 6377301.243,
      rf: 300.8017,
      ellipseName: 'Everest 1956',
    }),
    (zt.evrst69 = {
      a: 6377295.664,
      rf: 300.8017,
      ellipseName: 'Everest 1969',
    }),
    (zt.evrstSS = {
      a: 6377298.556,
      rf: 300.8017,
      ellipseName: 'Everest (Sabah & Sarawak)',
    }),
    (zt.fschr60 = {
      a: 6378166,
      rf: 298.3,
      ellipseName: 'Fischer (Mercury Datum) 1960',
    }),
    (zt.fschr60m = { a: 6378155, rf: 298.3, ellipseName: 'Fischer 1960' }),
    (zt.fschr68 = { a: 6378150, rf: 298.3, ellipseName: 'Fischer 1968' }),
    (zt.helmert = { a: 6378200, rf: 298.3, ellipseName: 'Helmert 1906' }),
    (zt.hough = { a: 6378270, rf: 297, ellipseName: 'Hough' }),
    (zt.intl = {
      a: 6378388,
      rf: 297,
      ellipseName: 'International 1909 (Hayford)',
    }),
    (zt.kaula = { a: 6378163, rf: 298.24, ellipseName: 'Kaula 1961' }),
    (zt.lerch = { a: 6378139, rf: 298.257, ellipseName: 'Lerch 1979' }),
    (zt.mprts = { a: 6397300, rf: 191, ellipseName: 'Maupertius 1738' }),
    (zt.new_intl = {
      a: 6378157.5,
      b: 6356772.2,
      ellipseName: 'New International 1967',
    }),
    (zt.plessis = {
      a: 6376523,
      rf: 6355863,
      ellipseName: 'Plessis 1817 (France)',
    }),
    (zt.krass = { a: 6378245, rf: 298.3, ellipseName: 'Krassovsky, 1942' }),
    (zt.SEasia = {
      a: 6378155,
      b: 6356773.3205,
      ellipseName: 'Southeast Asia',
    }),
    (zt.walbeck = { a: 6376896, b: 6355834.8467, ellipseName: 'Walbeck' }),
    (zt.WGS60 = { a: 6378165, rf: 298.3, ellipseName: 'WGS 60' }),
    (zt.WGS66 = { a: 6378145, rf: 298.25, ellipseName: 'WGS 66' }),
    (zt.WGS7 = { a: 6378135, rf: 298.26, ellipseName: 'WGS 72' });
  var Lt = (zt.WGS84 = {
    a: 6378137,
    rf: 298.257223563,
    ellipseName: 'WGS 84',
  });
  zt.sphere = {
    a: 6370997,
    b: 6370997,
    ellipseName: 'Normal Sphere (r=6370997)',
  };
  var Dt = {};
  (Dt.wgs84 = { towgs84: '0,0,0', ellipse: 'WGS84', datumName: 'WGS84' }),
    (Dt.ch1903 = {
      towgs84: '674.374,15.056,405.346',
      ellipse: 'bessel',
      datumName: 'swiss',
    }),
    (Dt.ggrs87 = {
      towgs84: '-199.87,74.79,246.62',
      ellipse: 'GRS80',
      datumName: 'Greek_Geodetic_Reference_System_1987',
    }),
    (Dt.nad83 = {
      towgs84: '0,0,0',
      ellipse: 'GRS80',
      datumName: 'North_American_Datum_1983',
    }),
    (Dt.nad27 = {
      nadgrids: '@conus,@alaska,@ntv2_0.gsb,@ntv1_can.dat',
      ellipse: 'clrk66',
      datumName: 'North_American_Datum_1927',
    }),
    (Dt.potsdam = {
      towgs84: '606.0,23.0,413.0',
      ellipse: 'bessel',
      datumName: 'Potsdam Rauenberg 1950 DHDN',
    }),
    (Dt.carthage = {
      towgs84: '-263.0,6.0,431.0',
      ellipse: 'clark80',
      datumName: 'Carthage 1934 Tunisia',
    }),
    (Dt.hermannskogel = {
      towgs84: '653.0,-212.0,449.0',
      ellipse: 'bessel',
      datumName: 'Hermannskogel',
    }),
    (Dt.osni52 = {
      towgs84: '482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15',
      ellipse: 'airy',
      datumName: 'Irish National',
    }),
    (Dt.ire65 = {
      towgs84: '482.530,-130.596,564.557,-1.042,-0.214,-0.631,8.15',
      ellipse: 'mod_airy',
      datumName: 'Ireland 1965',
    }),
    (Dt.rassadiran = {
      towgs84: '-133.63,-157.5,-158.62',
      ellipse: 'intl',
      datumName: 'Rassadiran',
    }),
    (Dt.nzgd49 = {
      towgs84: '59.47,-5.04,187.44,0.47,-0.1,1.024,-4.5993',
      ellipse: 'intl',
      datumName: 'New Zealand Geodetic Datum 1949',
    }),
    (Dt.osgb36 = {
      towgs84: '446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894',
      ellipse: 'airy',
      datumName: 'Airy 1830',
    }),
    (Dt.s_jtsk = {
      towgs84: '589,76,480',
      ellipse: 'bessel',
      datumName: 'S-JTSK (Ferro)',
    }),
    (Dt.beduaram = {
      towgs84: '-106,-87,188',
      ellipse: 'clrk80',
      datumName: 'Beduaram',
    }),
    (Dt.gunung_segara = {
      towgs84: '-403,684,41',
      ellipse: 'bessel',
      datumName: 'Gunung Segara Jakarta',
    }),
    (Dt.rnb72 = {
      towgs84: '106.869,-52.2978,103.724,-0.33657,0.456955,-1.84218,1',
      ellipse: 'intl',
      datumName: 'Reseau National Belge 1972',
    }),
    (Projection.projections = jt),
    Projection.projections.start();
  var Bt = function (t, s, i) {
      return g(t, s)
        ? i
        : t.datum_type === it || s.datum_type === it
        ? i
        : t.es !== s.es || t.a !== s.a || E(t.datum_type) || E(s.datum_type)
        ? ((i = b(i, t.es, t.a)),
          E(t.datum_type) && (i = A(i, t.datum_type, t.datum_params)),
          E(s.datum_type) && (i = C(i, s.datum_type, s.datum_params)),
          w(i, s.es, s.a, s.b))
        : i;
    },
    Ut = function (t, s, i) {
      var a,
        h,
        e,
        n = i.x,
        r = i.y,
        o = i.z || 0,
        l = {};
      for (e = 0; e < 3; e++)
        if (!s || 2 !== e || void 0 !== i.z)
          switch (
            (0 === e
              ? ((a = n), (h = 'x'))
              : 1 === e
              ? ((a = r), (h = 'y'))
              : ((a = o), (h = 'z')),
            t.axis[e])
          ) {
            case 'e':
              l[h] = a;
              break;
            case 'w':
              l[h] = -a;
              break;
            case 'n':
              l[h] = a;
              break;
            case 's':
              l[h] = -a;
              break;
            case 'u':
              void 0 !== i[h] && (l.z = a);
              break;
            case 'd':
              void 0 !== i[h] && (l.z = -a);
              break;
            default:
              return null;
          }
      return l;
    },
    Ft = function (t) {
      var s = { x: t[0], y: t[1] };
      return t.length > 2 && (s.z = t[2]), t.length > 3 && (s.m = t[3]), s;
    },
    Qt = function (t) {
      P(t.x), P(t.y);
    },
    Wt = Projection('WGS84'),
    Ht = 6,
    Kt = 'AJSAJS',
    Xt = 'AFAFAF',
    Jt = 65,
    Vt = 73,
    Zt = 79,
    Yt = 86,
    $t = 90,
    ts = {
      forward: O,
      inverse: function (t) {
        var s = z(Q(t.toUpperCase()));
        return s.lat && s.lon
          ? [s.lon, s.lat, s.lon, s.lat]
          : [s.left, s.bottom, s.right, s.top];
      },
      toPoint: R,
    };
  (Point.fromMGRS = function (t) {
    return new Point(R(t));
  }),
    (Point.prototype.toMGRS = function (t) {
      return O([this.x, this.y], t);
    });
  var ss = 0.01068115234375,
    is = function (t) {
      var s = [];
      (s[0] = 1 - t * (0.25 + t * (0.046875 + t * (0.01953125 + t * ss)))),
        (s[1] = t * (0.75 - t * (0.046875 + t * (0.01953125 + t * ss))));
      var i = t * t;
      return (
        (s[2] =
          i *
          (0.46875 - t * (0.013020833333333334 + 0.007120768229166667 * t))),
        (i *= t),
        (s[3] = i * (0.3645833333333333 - 0.005696614583333333 * t)),
        (s[4] = i * t * 0.3076171875),
        s
      );
    },
    as = function (t, s, i, a) {
      return (
        (i *= s),
        (s *= s),
        a[0] * t - i * (a[1] + s * (a[2] + s * (a[3] + s * a[4])))
      );
    },
    hs = function (t, s, i) {
      for (var a = 1 / (1 - s), h = t, e = 20; e; --e) {
        var n = Math.sin(h),
          r = 1 - s * n * n;
        if (
          ((r = (as(h, n, Math.cos(h), i) - t) * (r * Math.sqrt(r)) * a),
          (h -= r),
          Math.abs(r) < ot)
        )
          return h;
      }
      return h;
    },
    es = {
      init: function () {
        (this.x0 = void 0 !== this.x0 ? this.x0 : 0),
          (this.y0 = void 0 !== this.y0 ? this.y0 : 0),
          (this.long0 = void 0 !== this.long0 ? this.long0 : 0),
          (this.lat0 = void 0 !== this.lat0 ? this.lat0 : 0),
          this.es &&
            ((this.en = is(this.es)),
            (this.ml0 = as(
              this.lat0,
              Math.sin(this.lat0),
              Math.cos(this.lat0),
              this.en
            )));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h = t.x,
          e = t.y,
          n = qt(h - this.long0),
          r = Math.sin(e),
          o = Math.cos(e);
        if (this.es) {
          var l = o * n,
            M = Math.pow(l, 2),
            c = this.ep2 * Math.pow(o, 2),
            u = Math.pow(c, 2),
            f = Math.abs(o) > ot ? Math.tan(e) : 0,
            m = Math.pow(f, 2),
            p = Math.pow(m, 2);
          (s = 1 - this.es * Math.pow(r, 2)), (l /= Math.sqrt(s));
          var d = as(e, r, o, this.en);
          (i =
            this.a *
              (this.k0 *
                l *
                (1 +
                  (M / 6) *
                    (1 -
                      m +
                      c +
                      (M / 20) *
                        (5 -
                          18 * m +
                          p +
                          14 * c -
                          58 * m * c +
                          (M / 42) * (61 + 179 * p - p * m - 479 * m))))) +
            this.x0),
            (a =
              this.a *
                (this.k0 *
                  (d -
                    this.ml0 +
                    ((r * n * l) / 2) *
                      (1 +
                        (M / 12) *
                          (5 -
                            m +
                            9 * c +
                            4 * u +
                            (M / 30) *
                              (61 +
                                p -
                                58 * m +
                                270 * c -
                                330 * m * c +
                                (M / 56) *
                                  (1385 + 543 * p - p * m - 3111 * m)))))) +
              this.y0);
        } else {
          var y = o * Math.sin(n);
          if (Math.abs(Math.abs(y) - 1) < ot) return 93;
          if (
            ((i =
              0.5 * this.a * this.k0 * Math.log((1 + y) / (1 - y)) + this.x0),
            (a = (o * Math.cos(n)) / Math.sqrt(1 - Math.pow(y, 2))),
            (y = Math.abs(a)) >= 1)
          ) {
            if (y - 1 > ot) return 93;
            a = 0;
          } else a = Math.acos(a);
          e < 0 && (a = -a), (a = this.a * this.k0 * (a - this.lat0) + this.y0);
        }
        return (t.x = i), (t.y = a), t;
      },
      inverse: function (t) {
        var s,
          i,
          a,
          h,
          e = (t.x - this.x0) * (1 / this.a),
          n = (t.y - this.y0) * (1 / this.a);
        if (this.es)
          if (
            ((s = this.ml0 + n / this.k0),
            (i = hs(s, this.es, this.en)),
            Math.abs(i) < ht)
          ) {
            var r = Math.sin(i),
              o = Math.cos(i),
              l = Math.abs(o) > ot ? Math.tan(i) : 0,
              M = this.ep2 * Math.pow(o, 2),
              c = Math.pow(M, 2),
              u = Math.pow(l, 2),
              f = Math.pow(u, 2);
            s = 1 - this.es * Math.pow(r, 2);
            var m = (e * Math.sqrt(s)) / this.k0,
              p = Math.pow(m, 2);
            (a =
              i -
              (((s *= l) * p) / (1 - this.es)) *
                0.5 *
                (1 -
                  (p / 12) *
                    (5 +
                      3 * u -
                      9 * M * u +
                      M -
                      4 * c -
                      (p / 30) *
                        (61 +
                          90 * u -
                          252 * M * u +
                          45 * f +
                          46 * M -
                          (p / 56) *
                            (1385 + 3633 * u + 4095 * f + 1574 * f * u))))),
              (h = qt(
                this.long0 +
                  (m *
                    (1 -
                      (p / 6) *
                        (1 +
                          2 * u +
                          M -
                          (p / 20) *
                            (5 +
                              28 * u +
                              24 * f +
                              8 * M * u +
                              6 * M -
                              (p / 42) *
                                (61 + 662 * u + 1320 * f + 720 * f * u))))) /
                    o
              ));
          } else (a = ht * kt(n)), (h = 0);
        else {
          var d = Math.exp(e / this.k0),
            y = 0.5 * (d - 1 / d),
            _ = this.lat0 + n / this.k0,
            x = Math.cos(_);
          (s = Math.sqrt((1 - Math.pow(x, 2)) / (1 + Math.pow(y, 2)))),
            (a = Math.asin(s)),
            n < 0 && (a = -a),
            (h = 0 === y && 0 === x ? 0 : qt(Math.atan2(y, x) + this.long0));
        }
        return (t.x = h), (t.y = a), t;
      },
      names: ['Transverse_Mercator', 'Transverse Mercator', 'tmerc'],
    },
    ns = function (t) {
      var s = Math.exp(t);
      return (s = (s - 1 / s) / 2);
    },
    rs = function (t, s) {
      (t = Math.abs(t)), (s = Math.abs(s));
      var i = Math.max(t, s),
        a = Math.min(t, s) / (i || 1);
      return i * Math.sqrt(1 + Math.pow(a, 2));
    },
    os = function (t) {
      var s = 1 + t,
        i = s - 1;
      return 0 === i ? t : (t * Math.log(s)) / i;
    },
    ls = function (t) {
      var s = Math.abs(t);
      return (s = os(s * (1 + s / (rs(1, s) + 1)))), t < 0 ? -s : s;
    },
    Ms = function (t, s) {
      for (
        var i, a = 2 * Math.cos(2 * s), h = t.length - 1, e = t[h], n = 0;
        --h >= 0;

      )
        (i = a * e - n + t[h]), (n = e), (e = i);
      return s + i * Math.sin(2 * s);
    },
    cs = function (t, s) {
      for (
        var i, a = 2 * Math.cos(s), h = t.length - 1, e = t[h], n = 0;
        --h >= 0;

      )
        (i = a * e - n + t[h]), (n = e), (e = i);
      return Math.sin(s) * i;
    },
    us = function (t) {
      var s = Math.exp(t);
      return (s = (s + 1 / s) / 2);
    },
    fs = function (t, s, i) {
      for (
        var a,
          h,
          e = Math.sin(s),
          n = Math.cos(s),
          r = ns(i),
          o = us(i),
          l = 2 * n * o,
          M = -2 * e * r,
          c = t.length - 1,
          u = t[c],
          f = 0,
          m = 0,
          p = 0;
        --c >= 0;

      )
        (a = m),
          (h = f),
          (u = l * (m = u) - a - M * (f = p) + t[c]),
          (p = M * m - h + l * f);
      return (l = e * o), (M = n * r), [l * u - M * p, l * p + M * u];
    },
    ms = {
      init: function () {
        if (void 0 === this.es || this.es <= 0)
          throw new Error('incorrect elliptical usage');
        (this.x0 = void 0 !== this.x0 ? this.x0 : 0),
          (this.y0 = void 0 !== this.y0 ? this.y0 : 0),
          (this.long0 = void 0 !== this.long0 ? this.long0 : 0),
          (this.lat0 = void 0 !== this.lat0 ? this.lat0 : 0),
          (this.cgb = []),
          (this.cbg = []),
          (this.utg = []),
          (this.gtu = []);
        var t = this.es / (1 + Math.sqrt(1 - this.es)),
          s = t / (2 - t),
          i = s;
        (this.cgb[0] =
          s *
          (2 +
            s *
              (-2 / 3 +
                s * (s * (116 / 45 + s * (26 / 45 + s * (-2854 / 675))) - 2)))),
          (this.cbg[0] =
            s *
            (s *
              (2 / 3 +
                s *
                  (4 / 3 +
                    s * (-82 / 45 + s * (32 / 45 + s * (4642 / 4725))))) -
              2)),
          (i *= s),
          (this.cgb[1] =
            i *
            (7 / 3 +
              s *
                (s * (-227 / 45 + s * (2704 / 315 + s * (2323 / 945))) - 1.6))),
          (this.cbg[1] =
            i *
            (5 / 3 +
              s *
                (-16 / 15 +
                  s * (-13 / 9 + s * (904 / 315 + s * (-1522 / 945)))))),
          (i *= s),
          (this.cgb[2] =
            i *
            (56 / 15 +
              s * (-136 / 35 + s * (-1262 / 105 + s * (73814 / 2835))))),
          (this.cbg[2] =
            i * (-26 / 15 + s * (34 / 21 + s * (1.6 + s * (-12686 / 2835))))),
          (i *= s),
          (this.cgb[3] =
            i * (4279 / 630 + s * (-332 / 35 + s * (-399572 / 14175)))),
          (this.cbg[3] = i * (1237 / 630 + s * (s * (-24832 / 14175) - 2.4))),
          (i *= s),
          (this.cgb[4] = i * (4174 / 315 + s * (-144838 / 6237))),
          (this.cbg[4] = i * (-734 / 315 + s * (109598 / 31185))),
          (i *= s),
          (this.cgb[5] = i * (601676 / 22275)),
          (this.cbg[5] = i * (444337 / 155925)),
          (i = Math.pow(s, 2)),
          (this.Qn =
            (this.k0 / (1 + s)) * (1 + i * (0.25 + i * (1 / 64 + i / 256)))),
          (this.utg[0] =
            s *
            (s *
              (2 / 3 +
                s *
                  (-37 / 96 +
                    s * (1 / 360 + s * (81 / 512 + s * (-96199 / 604800))))) -
              0.5)),
          (this.gtu[0] =
            s *
            (0.5 +
              s *
                (-2 / 3 +
                  s *
                    (5 / 16 +
                      s *
                        (41 / 180 + s * (-127 / 288 + s * (7891 / 37800))))))),
          (this.utg[1] =
            i *
            (-1 / 48 +
              s *
                (-1 / 15 +
                  s *
                    (437 / 1440 + s * (-46 / 105 + s * (1118711 / 3870720)))))),
          (this.gtu[1] =
            i *
            (13 / 48 +
              s *
                (s * (557 / 1440 + s * (281 / 630 + s * (-1983433 / 1935360))) -
                  0.6))),
          (i *= s),
          (this.utg[2] =
            i *
            (-17 / 480 +
              s * (37 / 840 + s * (209 / 4480 + s * (-5569 / 90720))))),
          (this.gtu[2] =
            i *
            (61 / 240 +
              s * (-103 / 140 + s * (15061 / 26880 + s * (167603 / 181440))))),
          (i *= s),
          (this.utg[3] =
            i * (-4397 / 161280 + s * (11 / 504 + s * (830251 / 7257600)))),
          (this.gtu[3] =
            i * (49561 / 161280 + s * (-179 / 168 + s * (6601661 / 7257600)))),
          (i *= s),
          (this.utg[4] = i * (-4583 / 161280 + s * (108847 / 3991680))),
          (this.gtu[4] = i * (34729 / 80640 + s * (-3418889 / 1995840))),
          (i *= s),
          (this.utg[5] = -0.03233083094085698 * i),
          (this.gtu[5] = 0.6650675310896665 * i);
        var a = Ms(this.cbg, this.lat0);
        this.Zb = -this.Qn * (a + cs(this.gtu, 2 * a));
      },
      forward: function (t) {
        var s = qt(t.x - this.long0),
          i = t.y;
        i = Ms(this.cbg, i);
        var a = Math.sin(i),
          h = Math.cos(i),
          e = Math.sin(s),
          n = Math.cos(s);
        (i = Math.atan2(a, n * h)),
          (s = Math.atan2(e * h, rs(a, h * n))),
          (s = ls(Math.tan(s)));
        var r = fs(this.gtu, 2 * i, 2 * s);
        (i += r[0]), (s += r[1]);
        var o, l;
        return (
          Math.abs(s) <= 2.623395162778
            ? ((o = this.a * (this.Qn * s) + this.x0),
              (l = this.a * (this.Qn * i + this.Zb) + this.y0))
            : ((o = 1 / 0), (l = 1 / 0)),
          (t.x = o),
          (t.y = l),
          t
        );
      },
      inverse: function (t) {
        var s = (t.x - this.x0) * (1 / this.a),
          i = (t.y - this.y0) * (1 / this.a);
        (i = (i - this.Zb) / this.Qn), (s /= this.Qn);
        var a, h;
        if (Math.abs(s) <= 2.623395162778) {
          var e = fs(this.utg, 2 * i, 2 * s);
          (i += e[0]), (s += e[1]), (s = Math.atan(ns(s)));
          var n = Math.sin(i),
            r = Math.cos(i),
            o = Math.sin(s),
            l = Math.cos(s);
          (i = Math.atan2(n * l, rs(o, l * r))),
            (s = Math.atan2(o, l * r)),
            (a = qt(s + this.long0)),
            (h = Ms(this.cgb, i));
        } else (a = 1 / 0), (h = 1 / 0);
        return (t.x = a), (t.y = h), t;
      },
      names: [
        'Extended_Transverse_Mercator',
        'Extended Transverse Mercator',
        'etmerc',
      ],
    },
    ps = function (t, s) {
      if (void 0 === t) {
        if ((t = Math.floor((30 * (qt(s) + Math.PI)) / Math.PI) + 1) < 0)
          return 0;
        if (t > 60) return 60;
      }
      return t;
    },
    ds = {
      init: function () {
        var t = ps(this.zone, this.long0);
        if (void 0 === t) throw new Error('unknown utm zone');
        (this.lat0 = 0),
          (this.long0 = (6 * Math.abs(t) - 183) * lt),
          (this.x0 = 5e5),
          (this.y0 = this.utmSouth ? 1e7 : 0),
          (this.k0 = 0.9996),
          ms.init.apply(this),
          (this.forward = ms.forward),
          (this.inverse = ms.inverse);
      },
      names: ['Universal Transverse Mercator System', 'utm'],
      dependsOn: 'etmerc',
    },
    ys = function (t, s) {
      return Math.pow((1 - t) / (1 + t), s);
    },
    _s = 20,
    xs = {
      init: function () {
        var t = Math.sin(this.lat0),
          s = Math.cos(this.lat0);
        (s *= s),
          (this.rc = Math.sqrt(1 - this.es) / (1 - this.es * t * t)),
          (this.C = Math.sqrt(1 + (this.es * s * s) / (1 - this.es))),
          (this.phic0 = Math.asin(t / this.C)),
          (this.ratexp = 0.5 * this.C * this.e),
          (this.K =
            Math.tan(0.5 * this.phic0 + ct) /
            (Math.pow(Math.tan(0.5 * this.lat0 + ct), this.C) *
              ys(this.e * t, this.ratexp)));
      },
      forward: function (t) {
        var s = t.x,
          i = t.y;
        return (
          (t.y =
            2 *
              Math.atan(
                this.K *
                  Math.pow(Math.tan(0.5 * i + ct), this.C) *
                  ys(this.e * Math.sin(i), this.ratexp)
              ) -
            ht),
          (t.x = this.C * s),
          t
        );
      },
      inverse: function (t) {
        for (
          var s = t.x / this.C,
            i = t.y,
            a = Math.pow(Math.tan(0.5 * i + ct) / this.K, 1 / this.C),
            h = _s;
          h > 0 &&
          ((i =
            2 * Math.atan(a * ys(this.e * Math.sin(t.y), -0.5 * this.e)) - ht),
          !(Math.abs(i - t.y) < 1e-14));
          --h
        )
          t.y = i;
        return h ? ((t.x = s), (t.y = i), t) : null;
      },
      names: ['gauss'],
    },
    vs = {
      init: function () {
        xs.init.apply(this),
          this.rc &&
            ((this.sinc0 = Math.sin(this.phic0)),
            (this.cosc0 = Math.cos(this.phic0)),
            (this.R2 = 2 * this.rc),
            this.title || (this.title = 'Oblique Stereographic Alternative'));
      },
      forward: function (t) {
        var s, i, a, h;
        return (
          (t.x = qt(t.x - this.long0)),
          xs.forward.apply(this, [t]),
          (s = Math.sin(t.y)),
          (i = Math.cos(t.y)),
          (a = Math.cos(t.x)),
          (h = (this.k0 * this.R2) / (1 + this.sinc0 * s + this.cosc0 * i * a)),
          (t.x = h * i * Math.sin(t.x)),
          (t.y = h * (this.cosc0 * s - this.sinc0 * i * a)),
          (t.x = this.a * t.x + this.x0),
          (t.y = this.a * t.y + this.y0),
          t
        );
      },
      inverse: function (t) {
        var s, i, a, h, e;
        if (
          ((t.x = (t.x - this.x0) / this.a),
          (t.y = (t.y - this.y0) / this.a),
          (t.x /= this.k0),
          (t.y /= this.k0),
          (e = Math.sqrt(t.x * t.x + t.y * t.y)))
        ) {
          var n = 2 * Math.atan2(e, this.R2);
          (s = Math.sin(n)),
            (i = Math.cos(n)),
            (h = Math.asin(i * this.sinc0 + (t.y * s * this.cosc0) / e)),
            (a = Math.atan2(
              t.x * s,
              e * this.cosc0 * i - t.y * this.sinc0 * s
            ));
        } else (h = this.phic0), (a = 0);
        return (
          (t.x = a),
          (t.y = h),
          xs.inverse.apply(this, [t]),
          (t.x = qt(t.x + this.long0)),
          t
        );
      },
      names: [
        'Stereographic_North_Pole',
        'Oblique_Stereographic',
        'Polar_Stereographic',
        'sterea',
        'Oblique Stereographic Alternative',
        'Double_Stereographic',
      ],
    },
    gs = {
      init: function () {
        (this.coslat0 = Math.cos(this.lat0)),
          (this.sinlat0 = Math.sin(this.lat0)),
          this.sphere
            ? 1 === this.k0 &&
              !isNaN(this.lat_ts) &&
              Math.abs(this.coslat0) <= ot &&
              (this.k0 = 0.5 * (1 + kt(this.lat0) * Math.sin(this.lat_ts)))
            : (Math.abs(this.coslat0) <= ot &&
                (this.lat0 > 0 ? (this.con = 1) : (this.con = -1)),
              (this.cons = Math.sqrt(
                Math.pow(1 + this.e, 1 + this.e) *
                  Math.pow(1 - this.e, 1 - this.e)
              )),
              1 === this.k0 &&
                !isNaN(this.lat_ts) &&
                Math.abs(this.coslat0) <= ot &&
                (this.k0 =
                  (0.5 *
                    this.cons *
                    St(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts))) /
                  It(
                    this.e,
                    this.con * this.lat_ts,
                    this.con * Math.sin(this.lat_ts)
                  )),
              (this.ms1 = St(this.e, this.sinlat0, this.coslat0)),
              (this.X0 =
                2 * Math.atan(this.ssfn_(this.lat0, this.sinlat0, this.e)) -
                ht),
              (this.cosX0 = Math.cos(this.X0)),
              (this.sinX0 = Math.sin(this.X0)));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r = t.x,
          o = t.y,
          l = Math.sin(o),
          M = Math.cos(o),
          c = qt(r - this.long0);
        return Math.abs(Math.abs(r - this.long0) - Math.PI) <= ot &&
          Math.abs(o + this.lat0) <= ot
          ? ((t.x = NaN), (t.y = NaN), t)
          : this.sphere
          ? ((s =
              (2 * this.k0) /
              (1 + this.sinlat0 * l + this.coslat0 * M * Math.cos(c))),
            (t.x = this.a * s * M * Math.sin(c) + this.x0),
            (t.y =
              this.a * s * (this.coslat0 * l - this.sinlat0 * M * Math.cos(c)) +
              this.y0),
            t)
          : ((i = 2 * Math.atan(this.ssfn_(o, l, this.e)) - ht),
            (h = Math.cos(i)),
            (a = Math.sin(i)),
            Math.abs(this.coslat0) <= ot
              ? ((e = It(this.e, o * this.con, this.con * l)),
                (n = (2 * this.a * this.k0 * e) / this.cons),
                (t.x = this.x0 + n * Math.sin(r - this.long0)),
                (t.y = this.y0 - this.con * n * Math.cos(r - this.long0)),
                t)
              : (Math.abs(this.sinlat0) < ot
                  ? ((s = (2 * this.a * this.k0) / (1 + h * Math.cos(c))),
                    (t.y = s * a))
                  : ((s =
                      (2 * this.a * this.k0 * this.ms1) /
                      (this.cosX0 *
                        (1 + this.sinX0 * a + this.cosX0 * h * Math.cos(c)))),
                    (t.y =
                      s * (this.cosX0 * a - this.sinX0 * h * Math.cos(c)) +
                      this.y0)),
                (t.x = s * h * Math.sin(c) + this.x0),
                t));
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y -= this.y0);
        var s,
          i,
          a,
          h,
          e,
          n = Math.sqrt(t.x * t.x + t.y * t.y);
        if (this.sphere) {
          var r = 2 * Math.atan(n / (2 * this.a * this.k0));
          return (
            (s = this.long0),
            (i = this.lat0),
            n <= ot
              ? ((t.x = s), (t.y = i), t)
              : ((i = Math.asin(
                  Math.cos(r) * this.sinlat0 +
                    (t.y * Math.sin(r) * this.coslat0) / n
                )),
                (s = qt(
                  Math.abs(this.coslat0) < ot
                    ? this.lat0 > 0
                      ? this.long0 + Math.atan2(t.x, -1 * t.y)
                      : this.long0 + Math.atan2(t.x, t.y)
                    : this.long0 +
                        Math.atan2(
                          t.x * Math.sin(r),
                          n * this.coslat0 * Math.cos(r) -
                            t.y * this.sinlat0 * Math.sin(r)
                        )
                )),
                (t.x = s),
                (t.y = i),
                t)
          );
        }
        if (Math.abs(this.coslat0) <= ot) {
          if (n <= ot)
            return (i = this.lat0), (s = this.long0), (t.x = s), (t.y = i), t;
          (t.x *= this.con),
            (t.y *= this.con),
            (a = (n * this.cons) / (2 * this.a * this.k0)),
            (i = this.con * Ot(this.e, a)),
            (s =
              this.con * qt(this.con * this.long0 + Math.atan2(t.x, -1 * t.y)));
        } else
          (h =
            2 *
            Math.atan((n * this.cosX0) / (2 * this.a * this.k0 * this.ms1))),
            (s = this.long0),
            n <= ot
              ? (e = this.X0)
              : ((e = Math.asin(
                  Math.cos(h) * this.sinX0 +
                    (t.y * Math.sin(h) * this.cosX0) / n
                )),
                (s = qt(
                  this.long0 +
                    Math.atan2(
                      t.x * Math.sin(h),
                      n * this.cosX0 * Math.cos(h) -
                        t.y * this.sinX0 * Math.sin(h)
                    )
                ))),
            (i = -1 * Ot(this.e, Math.tan(0.5 * (ht + e))));
        return (t.x = s), (t.y = i), t;
      },
      names: [
        'stere',
        'Stereographic_South_Pole',
        'Polar Stereographic (variant B)',
      ],
      ssfn_: function (t, s, i) {
        return (
          (s *= i),
          Math.tan(0.5 * (ht + t)) * Math.pow((1 - s) / (1 + s), 0.5 * i)
        );
      },
    },
    bs = {
      init: function () {
        var t = this.lat0;
        this.lambda0 = this.long0;
        var s = Math.sin(t),
          i = this.a,
          a = 1 / this.rf,
          h = 2 * a - Math.pow(a, 2),
          e = (this.e = Math.sqrt(h));
        (this.R = (this.k0 * i * Math.sqrt(1 - h)) / (1 - h * Math.pow(s, 2))),
          (this.alpha = Math.sqrt(
            1 + (h / (1 - h)) * Math.pow(Math.cos(t), 4)
          )),
          (this.b0 = Math.asin(s / this.alpha));
        var n = Math.log(Math.tan(Math.PI / 4 + this.b0 / 2)),
          r = Math.log(Math.tan(Math.PI / 4 + t / 2)),
          o = Math.log((1 + e * s) / (1 - e * s));
        this.K = n - this.alpha * r + ((this.alpha * e) / 2) * o;
      },
      forward: function (t) {
        var s = Math.log(Math.tan(Math.PI / 4 - t.y / 2)),
          i =
            (this.e / 2) *
            Math.log(
              (1 + this.e * Math.sin(t.y)) / (1 - this.e * Math.sin(t.y))
            ),
          a = -this.alpha * (s + i) + this.K,
          h = 2 * (Math.atan(Math.exp(a)) - Math.PI / 4),
          e = this.alpha * (t.x - this.lambda0),
          n = Math.atan(
            Math.sin(e) /
              (Math.sin(this.b0) * Math.tan(h) +
                Math.cos(this.b0) * Math.cos(e))
          ),
          r = Math.asin(
            Math.cos(this.b0) * Math.sin(h) -
              Math.sin(this.b0) * Math.cos(h) * Math.cos(e)
          );
        return (
          (t.y =
            (this.R / 2) * Math.log((1 + Math.sin(r)) / (1 - Math.sin(r))) +
            this.y0),
          (t.x = this.R * n + this.x0),
          t
        );
      },
      inverse: function (t) {
        for (
          var s = t.x - this.x0,
            i = t.y - this.y0,
            a = s / this.R,
            h = 2 * (Math.atan(Math.exp(i / this.R)) - Math.PI / 4),
            e = Math.asin(
              Math.cos(this.b0) * Math.sin(h) +
                Math.sin(this.b0) * Math.cos(h) * Math.cos(a)
            ),
            n = Math.atan(
              Math.sin(a) /
                (Math.cos(this.b0) * Math.cos(a) -
                  Math.sin(this.b0) * Math.tan(h))
            ),
            r = this.lambda0 + n / this.alpha,
            o = 0,
            l = e,
            M = -1e3,
            c = 0;
          Math.abs(l - M) > 1e-7;

        ) {
          if (++c > 20) return;
          (o =
            (1 / this.alpha) *
              (Math.log(Math.tan(Math.PI / 4 + e / 2)) - this.K) +
            this.e *
              Math.log(
                Math.tan(Math.PI / 4 + Math.asin(this.e * Math.sin(l)) / 2)
              )),
            (M = l),
            (l = 2 * Math.atan(Math.exp(o)) - Math.PI / 2);
        }
        return (t.x = r), (t.y = l), t;
      },
      names: ['somerc'],
    },
    ws = {
      init: function () {
        (this.no_off = this.no_off || !1),
          (this.no_rot = this.no_rot || !1),
          isNaN(this.k0) && (this.k0 = 1);
        var t = Math.sin(this.lat0),
          s = Math.cos(this.lat0),
          i = this.e * t;
        (this.bl = Math.sqrt(1 + (this.es / (1 - this.es)) * Math.pow(s, 4))),
          (this.al =
            (this.a * this.bl * this.k0 * Math.sqrt(1 - this.es)) /
            (1 - i * i));
        var a = It(this.e, this.lat0, t),
          h = (this.bl / s) * Math.sqrt((1 - this.es) / (1 - i * i));
        h * h < 1 && (h = 1);
        var e, n;
        if (isNaN(this.longc)) {
          var r = It(this.e, this.lat1, Math.sin(this.lat1)),
            o = It(this.e, this.lat2, Math.sin(this.lat2));
          this.lat0 >= 0
            ? (this.el = (h + Math.sqrt(h * h - 1)) * Math.pow(a, this.bl))
            : (this.el = (h - Math.sqrt(h * h - 1)) * Math.pow(a, this.bl));
          var l = Math.pow(r, this.bl),
            M = Math.pow(o, this.bl);
          n = 0.5 * ((e = this.el / l) - 1 / e);
          var c = (this.el * this.el - M * l) / (this.el * this.el + M * l),
            u = (M - l) / (M + l),
            f = qt(this.long1 - this.long2);
          (this.long0 =
            0.5 * (this.long1 + this.long2) -
            Math.atan((c * Math.tan(0.5 * this.bl * f)) / u) / this.bl),
            (this.long0 = qt(this.long0));
          var m = qt(this.long1 - this.long0);
          (this.gamma0 = Math.atan(Math.sin(this.bl * m) / n)),
            (this.alpha = Math.asin(h * Math.sin(this.gamma0)));
        } else
          (e =
            this.lat0 >= 0
              ? h + Math.sqrt(h * h - 1)
              : h - Math.sqrt(h * h - 1)),
            (this.el = e * Math.pow(a, this.bl)),
            (n = 0.5 * (e - 1 / e)),
            (this.gamma0 = Math.asin(Math.sin(this.alpha) / h)),
            (this.long0 =
              this.longc - Math.asin(n * Math.tan(this.gamma0)) / this.bl);
        this.no_off
          ? (this.uc = 0)
          : this.lat0 >= 0
          ? (this.uc =
              (this.al / this.bl) *
              Math.atan2(Math.sqrt(h * h - 1), Math.cos(this.alpha)))
          : (this.uc =
              ((-1 * this.al) / this.bl) *
              Math.atan2(Math.sqrt(h * h - 1), Math.cos(this.alpha)));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h = t.x,
          e = t.y,
          n = qt(h - this.long0);
        if (Math.abs(Math.abs(e) - ht) <= ot)
          (a = e > 0 ? -1 : 1),
            (i =
              (this.al / this.bl) *
              Math.log(Math.tan(ct + a * this.gamma0 * 0.5))),
            (s = (-1 * a * ht * this.al) / this.bl);
        else {
          var r = It(this.e, e, Math.sin(e)),
            o = this.el / Math.pow(r, this.bl),
            l = 0.5 * (o - 1 / o),
            M = 0.5 * (o + 1 / o),
            c = Math.sin(this.bl * n),
            u = (l * Math.sin(this.gamma0) - c * Math.cos(this.gamma0)) / M;
          (i =
            Math.abs(Math.abs(u) - 1) <= ot
              ? Number.POSITIVE_INFINITY
              : (0.5 * this.al * Math.log((1 - u) / (1 + u))) / this.bl),
            (s =
              Math.abs(Math.cos(this.bl * n)) <= ot
                ? this.al * this.bl * n
                : (this.al *
                    Math.atan2(
                      l * Math.cos(this.gamma0) + c * Math.sin(this.gamma0),
                      Math.cos(this.bl * n)
                    )) /
                  this.bl);
        }
        return (
          this.no_rot
            ? ((t.x = this.x0 + s), (t.y = this.y0 + i))
            : ((s -= this.uc),
              (t.x =
                this.x0 + i * Math.cos(this.alpha) + s * Math.sin(this.alpha)),
              (t.y =
                this.y0 + s * Math.cos(this.alpha) - i * Math.sin(this.alpha))),
          t
        );
      },
      inverse: function (t) {
        var s, i;
        this.no_rot
          ? ((i = t.y - this.y0), (s = t.x - this.x0))
          : ((i =
              (t.x - this.x0) * Math.cos(this.alpha) -
              (t.y - this.y0) * Math.sin(this.alpha)),
            (s =
              (t.y - this.y0) * Math.cos(this.alpha) +
              (t.x - this.x0) * Math.sin(this.alpha)),
            (s += this.uc));
        var a = Math.exp((-1 * this.bl * i) / this.al),
          h = 0.5 * (a - 1 / a),
          e = 0.5 * (a + 1 / a),
          n = Math.sin((this.bl * s) / this.al),
          r = (n * Math.cos(this.gamma0) + h * Math.sin(this.gamma0)) / e,
          o = Math.pow(this.el / Math.sqrt((1 + r) / (1 - r)), 1 / this.bl);
        return (
          Math.abs(r - 1) < ot
            ? ((t.x = this.long0), (t.y = ht))
            : Math.abs(r + 1) < ot
            ? ((t.x = this.long0), (t.y = -1 * ht))
            : ((t.y = Ot(this.e, o)),
              (t.x = qt(
                this.long0 -
                  Math.atan2(
                    h * Math.cos(this.gamma0) - n * Math.sin(this.gamma0),
                    Math.cos((this.bl * s) / this.al)
                  ) /
                    this.bl
              ))),
          t
        );
      },
      names: [
        'Hotine_Oblique_Mercator',
        'Hotine Oblique Mercator',
        'Hotine_Oblique_Mercator_Azimuth_Natural_Origin',
        'Hotine_Oblique_Mercator_Azimuth_Center',
        'omerc',
      ],
    },
    As = {
      init: function () {
        if (
          (this.lat2 || (this.lat2 = this.lat1),
          this.k0 || (this.k0 = 1),
          (this.x0 = this.x0 || 0),
          (this.y0 = this.y0 || 0),
          !(Math.abs(this.lat1 + this.lat2) < ot))
        ) {
          var t = this.b / this.a;
          this.e = Math.sqrt(1 - t * t);
          var s = Math.sin(this.lat1),
            i = Math.cos(this.lat1),
            a = St(this.e, s, i),
            h = It(this.e, this.lat1, s),
            e = Math.sin(this.lat2),
            n = Math.cos(this.lat2),
            r = St(this.e, e, n),
            o = It(this.e, this.lat2, e),
            l = It(this.e, this.lat0, Math.sin(this.lat0));
          Math.abs(this.lat1 - this.lat2) > ot
            ? (this.ns = Math.log(a / r) / Math.log(h / o))
            : (this.ns = s),
            isNaN(this.ns) && (this.ns = s),
            (this.f0 = a / (this.ns * Math.pow(h, this.ns))),
            (this.rh = this.a * this.f0 * Math.pow(l, this.ns)),
            this.title || (this.title = 'Lambert Conformal Conic');
        }
      },
      forward: function (t) {
        var s = t.x,
          i = t.y;
        Math.abs(2 * Math.abs(i) - Math.PI) <= ot &&
          (i = kt(i) * (ht - 2 * ot));
        var a,
          h,
          e = Math.abs(Math.abs(i) - ht);
        if (e > ot)
          (a = It(this.e, i, Math.sin(i))),
            (h = this.a * this.f0 * Math.pow(a, this.ns));
        else {
          if ((e = i * this.ns) <= 0) return null;
          h = 0;
        }
        var n = this.ns * qt(s - this.long0);
        return (
          (t.x = this.k0 * (h * Math.sin(n)) + this.x0),
          (t.y = this.k0 * (this.rh - h * Math.cos(n)) + this.y0),
          t
        );
      },
      inverse: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n = (t.x - this.x0) / this.k0,
          r = this.rh - (t.y - this.y0) / this.k0;
        this.ns > 0
          ? ((s = Math.sqrt(n * n + r * r)), (i = 1))
          : ((s = -Math.sqrt(n * n + r * r)), (i = -1));
        var o = 0;
        if (
          (0 !== s && (o = Math.atan2(i * n, i * r)), 0 !== s || this.ns > 0)
        ) {
          if (
            ((i = 1 / this.ns),
            (a = Math.pow(s / (this.a * this.f0), i)),
            -9999 === (h = Ot(this.e, a)))
          )
            return null;
        } else h = -ht;
        return (e = qt(o / this.ns + this.long0)), (t.x = e), (t.y = h), t;
      },
      names: [
        'Lambert Tangential Conformal Conic Projection',
        'Lambert_Conformal_Conic',
        'Lambert_Conformal_Conic_2SP',
        'lcc',
      ],
    },
    Cs = {
      init: function () {
        (this.a = 6377397.155),
          (this.es = 0.006674372230614),
          (this.e = Math.sqrt(this.es)),
          this.lat0 || (this.lat0 = 0.863937979737193),
          this.long0 || (this.long0 = 0.4334234309119251),
          this.k0 || (this.k0 = 0.9999),
          (this.s45 = 0.785398163397448),
          (this.s90 = 2 * this.s45),
          (this.fi0 = this.lat0),
          (this.e2 = this.es),
          (this.e = Math.sqrt(this.e2)),
          (this.alfa = Math.sqrt(
            1 + (this.e2 * Math.pow(Math.cos(this.fi0), 4)) / (1 - this.e2)
          )),
          (this.uq = 1.04216856380474),
          (this.u0 = Math.asin(Math.sin(this.fi0) / this.alfa)),
          (this.g = Math.pow(
            (1 + this.e * Math.sin(this.fi0)) /
              (1 - this.e * Math.sin(this.fi0)),
            (this.alfa * this.e) / 2
          )),
          (this.k =
            (Math.tan(this.u0 / 2 + this.s45) /
              Math.pow(Math.tan(this.fi0 / 2 + this.s45), this.alfa)) *
            this.g),
          (this.k1 = this.k0),
          (this.n0 =
            (this.a * Math.sqrt(1 - this.e2)) /
            (1 - this.e2 * Math.pow(Math.sin(this.fi0), 2))),
          (this.s0 = 1.37008346281555),
          (this.n = Math.sin(this.s0)),
          (this.ro0 = (this.k1 * this.n0) / Math.tan(this.s0)),
          (this.ad = this.s90 - this.uq);
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o = t.x,
          l = t.y,
          M = qt(o - this.long0);
        return (
          (s = Math.pow(
            (1 + this.e * Math.sin(l)) / (1 - this.e * Math.sin(l)),
            (this.alfa * this.e) / 2
          )),
          (i =
            2 *
            (Math.atan(
              (this.k * Math.pow(Math.tan(l / 2 + this.s45), this.alfa)) / s
            ) -
              this.s45)),
          (a = -M * this.alfa),
          (h = Math.asin(
            Math.cos(this.ad) * Math.sin(i) +
              Math.sin(this.ad) * Math.cos(i) * Math.cos(a)
          )),
          (e = Math.asin((Math.cos(i) * Math.sin(a)) / Math.cos(h))),
          (n = this.n * e),
          (r =
            (this.ro0 * Math.pow(Math.tan(this.s0 / 2 + this.s45), this.n)) /
            Math.pow(Math.tan(h / 2 + this.s45), this.n)),
          (t.y = (r * Math.cos(n)) / 1),
          (t.x = (r * Math.sin(n)) / 1),
          this.czech || ((t.y *= -1), (t.x *= -1)),
          t
        );
      },
      inverse: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o = t.x;
        (t.x = t.y),
          (t.y = o),
          this.czech || ((t.y *= -1), (t.x *= -1)),
          (e = Math.sqrt(t.x * t.x + t.y * t.y)),
          (h = Math.atan2(t.y, t.x) / Math.sin(this.s0)),
          (a =
            2 *
            (Math.atan(
              Math.pow(this.ro0 / e, 1 / this.n) *
                Math.tan(this.s0 / 2 + this.s45)
            ) -
              this.s45)),
          (s = Math.asin(
            Math.cos(this.ad) * Math.sin(a) -
              Math.sin(this.ad) * Math.cos(a) * Math.cos(h)
          )),
          (i = Math.asin((Math.cos(a) * Math.sin(h)) / Math.cos(s))),
          (t.x = this.long0 - i / this.alfa),
          (n = s),
          (r = 0);
        var l = 0;
        do {
          (t.y =
            2 *
            (Math.atan(
              Math.pow(this.k, -1 / this.alfa) *
                Math.pow(Math.tan(s / 2 + this.s45), 1 / this.alfa) *
                Math.pow(
                  (1 + this.e * Math.sin(n)) / (1 - this.e * Math.sin(n)),
                  this.e / 2
                )
            ) -
              this.s45)),
            Math.abs(n - t.y) < 1e-10 && (r = 1),
            (n = t.y),
            (l += 1);
        } while (0 === r && l < 15);
        return l >= 15 ? null : t;
      },
      names: ['Krovak', 'krovak'],
    },
    Es = function (t, s, i, a, h) {
      return (
        t * h - s * Math.sin(2 * h) + i * Math.sin(4 * h) - a * Math.sin(6 * h)
      );
    },
    Ps = function (t) {
      return 1 - 0.25 * t * (1 + (t / 16) * (3 + 1.25 * t));
    },
    Ns = function (t) {
      return 0.375 * t * (1 + 0.25 * t * (1 + 0.46875 * t));
    },
    Ss = function (t) {
      return 0.05859375 * t * t * (1 + 0.75 * t);
    },
    ks = function (t) {
      return t * t * t * (35 / 3072);
    },
    qs = function (t, s, i) {
      var a = s * i;
      return t / Math.sqrt(1 - a * a);
    },
    Is = function (t) {
      return Math.abs(t) < ht ? t : t - kt(t) * Math.PI;
    },
    Os = function (t, s, i, a, h) {
      var e, n;
      e = t / s;
      for (var r = 0; r < 15; r++)
        if (
          ((n =
            (t -
              (s * e -
                i * Math.sin(2 * e) +
                a * Math.sin(4 * e) -
                h * Math.sin(6 * e))) /
            (s -
              2 * i * Math.cos(2 * e) +
              4 * a * Math.cos(4 * e) -
              6 * h * Math.cos(6 * e))),
          (e += n),
          Math.abs(n) <= 1e-10)
        )
          return e;
      return NaN;
    },
    Rs = {
      init: function () {
        this.sphere ||
          ((this.e0 = Ps(this.es)),
          (this.e1 = Ns(this.es)),
          (this.e2 = Ss(this.es)),
          (this.e3 = ks(this.es)),
          (this.ml0 =
            this.a * Es(this.e0, this.e1, this.e2, this.e3, this.lat0)));
      },
      forward: function (t) {
        var s,
          i,
          a = t.x,
          h = t.y;
        if (((a = qt(a - this.long0)), this.sphere))
          (s = this.a * Math.asin(Math.cos(h) * Math.sin(a))),
            (i = this.a * (Math.atan2(Math.tan(h), Math.cos(a)) - this.lat0));
        else {
          var e = Math.sin(h),
            n = Math.cos(h),
            r = qs(this.a, this.e, e),
            o = Math.tan(h) * Math.tan(h),
            l = a * Math.cos(h),
            M = l * l,
            c = (this.es * n * n) / (1 - this.es);
          (s = r * l * (1 - M * o * (1 / 6 - ((8 - o + 8 * c) * M) / 120))),
            (i =
              this.a * Es(this.e0, this.e1, this.e2, this.e3, h) -
              this.ml0 +
              ((r * e) / n) * M * (0.5 + ((5 - o + 6 * c) * M) / 24));
        }
        return (t.x = s + this.x0), (t.y = i + this.y0), t;
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y -= this.y0);
        var s,
          i,
          a = t.x / this.a,
          h = t.y / this.a;
        if (this.sphere) {
          var e = h + this.lat0;
          (s = Math.asin(Math.sin(e) * Math.cos(a))),
            (i = Math.atan2(Math.tan(a), Math.cos(e)));
        } else {
          var n = this.ml0 / this.a + h,
            r = Os(n, this.e0, this.e1, this.e2, this.e3);
          if (Math.abs(Math.abs(r) - ht) <= ot)
            return (t.x = this.long0), (t.y = ht), h < 0 && (t.y *= -1), t;
          var o = qs(this.a, this.e, Math.sin(r)),
            l = ((o * o * o) / this.a / this.a) * (1 - this.es),
            M = Math.pow(Math.tan(r), 2),
            c = (a * this.a) / o,
            u = c * c;
          (s =
            r -
            ((o * Math.tan(r)) / l) *
              c *
              c *
              (0.5 - ((1 + 3 * M) * c * c) / 24)),
            (i =
              (c * (1 - u * (M / 3 + ((1 + 3 * M) * M * u) / 15))) /
              Math.cos(r));
        }
        return (t.x = qt(i + this.long0)), (t.y = Is(s)), t;
      },
      names: ['Cassini', 'Cassini_Soldner', 'cass'],
    },
    Gs = function (t, s) {
      var i;
      return t > 1e-7
        ? ((i = t * s),
          (1 - t * t) *
            (s / (1 - i * i) - (0.5 / t) * Math.log((1 - i) / (1 + i))))
        : 2 * s;
    },
    Ts = 0.3333333333333333,
    js = 0.17222222222222222,
    zs = 0.10257936507936508,
    Ls = 0.06388888888888888,
    Ds = 0.0664021164021164,
    Bs = 0.016415012942191543,
    Us = {
      init: function () {
        var t = Math.abs(this.lat0);
        if (
          (Math.abs(t - ht) < ot
            ? (this.mode = this.lat0 < 0 ? this.S_POLE : this.N_POLE)
            : Math.abs(t) < ot
            ? (this.mode = this.EQUIT)
            : (this.mode = this.OBLIQ),
          this.es > 0)
        ) {
          var s;
          switch (
            ((this.qp = Gs(this.e, 1)),
            (this.mmf = 0.5 / (1 - this.es)),
            (this.apa = X(this.es)),
            this.mode)
          ) {
            case this.N_POLE:
            case this.S_POLE:
              this.dd = 1;
              break;
            case this.EQUIT:
              (this.rq = Math.sqrt(0.5 * this.qp)),
                (this.dd = 1 / this.rq),
                (this.xmf = 1),
                (this.ymf = 0.5 * this.qp);
              break;
            case this.OBLIQ:
              (this.rq = Math.sqrt(0.5 * this.qp)),
                (s = Math.sin(this.lat0)),
                (this.sinb1 = Gs(this.e, s) / this.qp),
                (this.cosb1 = Math.sqrt(1 - this.sinb1 * this.sinb1)),
                (this.dd =
                  Math.cos(this.lat0) /
                  (Math.sqrt(1 - this.es * s * s) * this.rq * this.cosb1)),
                (this.ymf = (this.xmf = this.rq) / this.dd),
                (this.xmf *= this.dd);
          }
        } else
          this.mode === this.OBLIQ &&
            ((this.sinph0 = Math.sin(this.lat0)),
            (this.cosph0 = Math.cos(this.lat0)));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o,
          l,
          M,
          c = t.x,
          u = t.y;
        if (((c = qt(c - this.long0)), this.sphere)) {
          if (
            ((e = Math.sin(u)),
            (M = Math.cos(u)),
            (a = Math.cos(c)),
            this.mode === this.OBLIQ || this.mode === this.EQUIT)
          ) {
            if (
              (i =
                this.mode === this.EQUIT
                  ? 1 + M * a
                  : 1 + this.sinph0 * e + this.cosph0 * M * a) <= ot
            )
              return null;
            (s = (i = Math.sqrt(2 / i)) * M * Math.sin(c)),
              (i *=
                this.mode === this.EQUIT
                  ? e
                  : this.cosph0 * e - this.sinph0 * M * a);
          } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
            if (
              (this.mode === this.N_POLE && (a = -a),
              Math.abs(u + this.phi0) < ot)
            )
              return null;
            (i = ct - 0.5 * u),
              (s =
                (i =
                  2 * (this.mode === this.S_POLE ? Math.cos(i) : Math.sin(i))) *
                Math.sin(c)),
              (i *= a);
          }
        } else {
          switch (
            ((r = 0),
            (o = 0),
            (l = 0),
            (a = Math.cos(c)),
            (h = Math.sin(c)),
            (e = Math.sin(u)),
            (n = Gs(this.e, e)),
            (this.mode !== this.OBLIQ && this.mode !== this.EQUIT) ||
              ((r = n / this.qp), (o = Math.sqrt(1 - r * r))),
            this.mode)
          ) {
            case this.OBLIQ:
              l = 1 + this.sinb1 * r + this.cosb1 * o * a;
              break;
            case this.EQUIT:
              l = 1 + o * a;
              break;
            case this.N_POLE:
              (l = ht + u), (n = this.qp - n);
              break;
            case this.S_POLE:
              (l = u - ht), (n = this.qp + n);
          }
          if (Math.abs(l) < ot) return null;
          switch (this.mode) {
            case this.OBLIQ:
            case this.EQUIT:
              (l = Math.sqrt(2 / l)),
                (i =
                  this.mode === this.OBLIQ
                    ? this.ymf * l * (this.cosb1 * r - this.sinb1 * o * a)
                    : (l = Math.sqrt(2 / (1 + o * a))) * r * this.ymf),
                (s = this.xmf * l * o * h);
              break;
            case this.N_POLE:
            case this.S_POLE:
              n >= 0
                ? ((s = (l = Math.sqrt(n)) * h),
                  (i = a * (this.mode === this.S_POLE ? l : -l)))
                : (s = i = 0);
          }
        }
        return (t.x = this.a * s + this.x0), (t.y = this.a * i + this.y0), t;
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y -= this.y0);
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o = t.x / this.a,
          l = t.y / this.a;
        if (this.sphere) {
          var M,
            c = 0,
            u = 0;
          if (((M = Math.sqrt(o * o + l * l)), (i = 0.5 * M) > 1)) return null;
          switch (
            ((i = 2 * Math.asin(i)),
            (this.mode !== this.OBLIQ && this.mode !== this.EQUIT) ||
              ((u = Math.sin(i)), (c = Math.cos(i))),
            this.mode)
          ) {
            case this.EQUIT:
              (i = Math.abs(M) <= ot ? 0 : Math.asin((l * u) / M)),
                (o *= u),
                (l = c * M);
              break;
            case this.OBLIQ:
              (i =
                Math.abs(M) <= ot
                  ? this.phi0
                  : Math.asin(c * this.sinph0 + (l * u * this.cosph0) / M)),
                (o *= u * this.cosph0),
                (l = (c - Math.sin(i) * this.sinph0) * M);
              break;
            case this.N_POLE:
              (l = -l), (i = ht - i);
              break;
            case this.S_POLE:
              i -= ht;
          }
          s =
            0 !== l || (this.mode !== this.EQUIT && this.mode !== this.OBLIQ)
              ? Math.atan2(o, l)
              : 0;
        } else {
          if (((r = 0), this.mode === this.OBLIQ || this.mode === this.EQUIT)) {
            if (
              ((o /= this.dd),
              (l *= this.dd),
              (n = Math.sqrt(o * o + l * l)) < ot)
            )
              return (t.x = 0), (t.y = this.phi0), t;
            (h = 2 * Math.asin((0.5 * n) / this.rq)),
              (a = Math.cos(h)),
              (o *= h = Math.sin(h)),
              this.mode === this.OBLIQ
                ? ((r = a * this.sinb1 + (l * h * this.cosb1) / n),
                  (e = this.qp * r),
                  (l = n * this.cosb1 * a - l * this.sinb1 * h))
                : ((r = (l * h) / n), (e = this.qp * r), (l = n * a));
          } else if (this.mode === this.N_POLE || this.mode === this.S_POLE) {
            if ((this.mode === this.N_POLE && (l = -l), !(e = o * o + l * l)))
              return (t.x = 0), (t.y = this.phi0), t;
            (r = 1 - e / this.qp), this.mode === this.S_POLE && (r = -r);
          }
          (s = Math.atan2(o, l)), (i = J(Math.asin(r), this.apa));
        }
        return (t.x = qt(this.long0 + s)), (t.y = i), t;
      },
      names: [
        'Lambert Azimuthal Equal Area',
        'Lambert_Azimuthal_Equal_Area',
        'laea',
      ],
      S_POLE: 1,
      N_POLE: 2,
      EQUIT: 3,
      OBLIQ: 4,
    },
    Fs = function (t) {
      return Math.abs(t) > 1 && (t = t > 1 ? 1 : -1), Math.asin(t);
    },
    Qs = {
      init: function () {
        Math.abs(this.lat1 + this.lat2) < ot ||
          ((this.temp = this.b / this.a),
          (this.es = 1 - Math.pow(this.temp, 2)),
          (this.e3 = Math.sqrt(this.es)),
          (this.sin_po = Math.sin(this.lat1)),
          (this.cos_po = Math.cos(this.lat1)),
          (this.t1 = this.sin_po),
          (this.con = this.sin_po),
          (this.ms1 = St(this.e3, this.sin_po, this.cos_po)),
          (this.qs1 = Gs(this.e3, this.sin_po, this.cos_po)),
          (this.sin_po = Math.sin(this.lat2)),
          (this.cos_po = Math.cos(this.lat2)),
          (this.t2 = this.sin_po),
          (this.ms2 = St(this.e3, this.sin_po, this.cos_po)),
          (this.qs2 = Gs(this.e3, this.sin_po, this.cos_po)),
          (this.sin_po = Math.sin(this.lat0)),
          (this.cos_po = Math.cos(this.lat0)),
          (this.t3 = this.sin_po),
          (this.qs0 = Gs(this.e3, this.sin_po, this.cos_po)),
          Math.abs(this.lat1 - this.lat2) > ot
            ? (this.ns0 =
                (this.ms1 * this.ms1 - this.ms2 * this.ms2) /
                (this.qs2 - this.qs1))
            : (this.ns0 = this.con),
          (this.c = this.ms1 * this.ms1 + this.ns0 * this.qs1),
          (this.rh =
            (this.a * Math.sqrt(this.c - this.ns0 * this.qs0)) / this.ns0));
      },
      forward: function (t) {
        var s = t.x,
          i = t.y;
        (this.sin_phi = Math.sin(i)), (this.cos_phi = Math.cos(i));
        var a = Gs(this.e3, this.sin_phi, this.cos_phi),
          h = (this.a * Math.sqrt(this.c - this.ns0 * a)) / this.ns0,
          e = this.ns0 * qt(s - this.long0),
          n = h * Math.sin(e) + this.x0,
          r = this.rh - h * Math.cos(e) + this.y0;
        return (t.x = n), (t.y = r), t;
      },
      inverse: function (t) {
        var s, i, a, h, e, n;
        return (
          (t.x -= this.x0),
          (t.y = this.rh - t.y + this.y0),
          this.ns0 >= 0
            ? ((s = Math.sqrt(t.x * t.x + t.y * t.y)), (a = 1))
            : ((s = -Math.sqrt(t.x * t.x + t.y * t.y)), (a = -1)),
          (h = 0),
          0 !== s && (h = Math.atan2(a * t.x, a * t.y)),
          (a = (s * this.ns0) / this.a),
          this.sphere
            ? (n = Math.asin((this.c - a * a) / (2 * this.ns0)))
            : ((i = (this.c - a * a) / this.ns0), (n = this.phi1z(this.e3, i))),
          (e = qt(h / this.ns0 + this.long0)),
          (t.x = e),
          (t.y = n),
          t
        );
      },
      names: ['Albers_Conic_Equal_Area', 'Albers', 'aea'],
      phi1z: function (t, s) {
        var i,
          a,
          h,
          e,
          n,
          r = Fs(0.5 * s);
        if (t < ot) return r;
        for (var o = t * t, l = 1; l <= 25; l++)
          if (
            ((i = Math.sin(r)),
            (a = Math.cos(r)),
            (h = t * i),
            (e = 1 - h * h),
            (n =
              ((0.5 * e * e) / a) *
              (s / (1 - o) - i / e + (0.5 / t) * Math.log((1 - h) / (1 + h)))),
            (r += n),
            Math.abs(n) <= 1e-7)
          )
            return r;
        return null;
      },
    },
    Ws = {
      init: function () {
        (this.sin_p14 = Math.sin(this.lat0)),
          (this.cos_p14 = Math.cos(this.lat0)),
          (this.infinity_dist = 1e3 * this.a),
          (this.rc = 1);
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o = t.x,
          l = t.y;
        return (
          (a = qt(o - this.long0)),
          (s = Math.sin(l)),
          (i = Math.cos(l)),
          (h = Math.cos(a)),
          (e = this.sin_p14 * s + this.cos_p14 * i * h) > 0 || Math.abs(e) <= ot
            ? ((n = this.x0 + (1 * this.a * i * Math.sin(a)) / e),
              (r =
                this.y0 +
                (1 * this.a * (this.cos_p14 * s - this.sin_p14 * i * h)) / e))
            : ((n = this.x0 + this.infinity_dist * i * Math.sin(a)),
              (r =
                this.y0 +
                this.infinity_dist *
                  (this.cos_p14 * s - this.sin_p14 * i * h))),
          (t.x = n),
          (t.y = r),
          t
        );
      },
      inverse: function (t) {
        var s, i, a, h, e, n;
        return (
          (t.x = (t.x - this.x0) / this.a),
          (t.y = (t.y - this.y0) / this.a),
          (t.x /= this.k0),
          (t.y /= this.k0),
          (s = Math.sqrt(t.x * t.x + t.y * t.y))
            ? ((h = Math.atan2(s, this.rc)),
              (i = Math.sin(h)),
              (a = Math.cos(h)),
              (n = Fs(a * this.sin_p14 + (t.y * i * this.cos_p14) / s)),
              (e = Math.atan2(
                t.x * i,
                s * this.cos_p14 * a - t.y * this.sin_p14 * i
              )),
              (e = qt(this.long0 + e)))
            : ((n = this.phic0), (e = 0)),
          (t.x = e),
          (t.y = n),
          t
        );
      },
      names: ['gnom'],
    },
    Hs = function (t, s) {
      var i = 1 - ((1 - t * t) / (2 * t)) * Math.log((1 - t) / (1 + t));
      if (Math.abs(Math.abs(s) - i) < 1e-6) return s < 0 ? -1 * ht : ht;
      for (var a, h, e, n, r = Math.asin(0.5 * s), o = 0; o < 30; o++)
        if (
          ((h = Math.sin(r)),
          (e = Math.cos(r)),
          (n = t * h),
          (a =
            (Math.pow(1 - n * n, 2) / (2 * e)) *
            (s / (1 - t * t) -
              h / (1 - n * n) +
              (0.5 / t) * Math.log((1 - n) / (1 + n)))),
          (r += a),
          Math.abs(a) <= 1e-10)
        )
          return r;
      return NaN;
    },
    Ks = {
      init: function () {
        this.sphere ||
          (this.k0 = St(this.e, Math.sin(this.lat_ts), Math.cos(this.lat_ts)));
      },
      forward: function (t) {
        var s,
          i,
          a = t.x,
          h = t.y,
          e = qt(a - this.long0);
        if (this.sphere)
          (s = this.x0 + this.a * e * Math.cos(this.lat_ts)),
            (i = this.y0 + (this.a * Math.sin(h)) / Math.cos(this.lat_ts));
        else {
          var n = Gs(this.e, Math.sin(h));
          (s = this.x0 + this.a * this.k0 * e),
            (i = this.y0 + (this.a * n * 0.5) / this.k0);
        }
        return (t.x = s), (t.y = i), t;
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y -= this.y0);
        var s, i;
        return (
          this.sphere
            ? ((s = qt(this.long0 + t.x / this.a / Math.cos(this.lat_ts))),
              (i = Math.asin((t.y / this.a) * Math.cos(this.lat_ts))))
            : ((i = Hs(this.e, (2 * t.y * this.k0) / this.a)),
              (s = qt(this.long0 + t.x / (this.a * this.k0)))),
          (t.x = s),
          (t.y = i),
          t
        );
      },
      names: ['cea'],
    },
    Xs = {
      init: function () {
        (this.x0 = this.x0 || 0),
          (this.y0 = this.y0 || 0),
          (this.lat0 = this.lat0 || 0),
          (this.long0 = this.long0 || 0),
          (this.lat_ts = this.lat_ts || 0),
          (this.title = this.title || 'Equidistant Cylindrical (Plate Carre)'),
          (this.rc = Math.cos(this.lat_ts));
      },
      forward: function (t) {
        var s = t.x,
          i = t.y,
          a = qt(s - this.long0),
          h = Is(i - this.lat0);
        return (
          (t.x = this.x0 + this.a * a * this.rc),
          (t.y = this.y0 + this.a * h),
          t
        );
      },
      inverse: function (t) {
        var s = t.x,
          i = t.y;
        return (
          (t.x = qt(this.long0 + (s - this.x0) / (this.a * this.rc))),
          (t.y = Is(this.lat0 + (i - this.y0) / this.a)),
          t
        );
      },
      names: ['Equirectangular', 'Equidistant_Cylindrical', 'eqc'],
    },
    Js = 20,
    Vs = {
      init: function () {
        (this.temp = this.b / this.a),
          (this.es = 1 - Math.pow(this.temp, 2)),
          (this.e = Math.sqrt(this.es)),
          (this.e0 = Ps(this.es)),
          (this.e1 = Ns(this.es)),
          (this.e2 = Ss(this.es)),
          (this.e3 = ks(this.es)),
          (this.ml0 =
            this.a * Es(this.e0, this.e1, this.e2, this.e3, this.lat0));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h = t.x,
          e = t.y,
          n = qt(h - this.long0);
        if (((a = n * Math.sin(e)), this.sphere))
          Math.abs(e) <= ot
            ? ((s = this.a * n), (i = -1 * this.a * this.lat0))
            : ((s = (this.a * Math.sin(a)) / Math.tan(e)),
              (i =
                this.a *
                (Is(e - this.lat0) + (1 - Math.cos(a)) / Math.tan(e))));
        else if (Math.abs(e) <= ot) (s = this.a * n), (i = -1 * this.ml0);
        else {
          var r = qs(this.a, this.e, Math.sin(e)) / Math.tan(e);
          (s = r * Math.sin(a)),
            (i =
              this.a * Es(this.e0, this.e1, this.e2, this.e3, e) -
              this.ml0 +
              r * (1 - Math.cos(a)));
        }
        return (t.x = s + this.x0), (t.y = i + this.y0), t;
      },
      inverse: function (t) {
        var s, i, a, h, e, n, r, o, l;
        if (((a = t.x - this.x0), (h = t.y - this.y0), this.sphere))
          if (Math.abs(h + this.a * this.lat0) <= ot)
            (s = qt(a / this.a + this.long0)), (i = 0);
          else {
            (n = this.lat0 + h / this.a),
              (r = (a * a) / this.a / this.a + n * n),
              (o = n);
            var M;
            for (e = Js; e; --e)
              if (
                ((M = Math.tan(o)),
                (l =
                  (-1 * (n * (o * M + 1) - o - 0.5 * (o * o + r) * M)) /
                  ((o - n) / M - 1)),
                (o += l),
                Math.abs(l) <= ot)
              ) {
                i = o;
                break;
              }
            s = qt(
              this.long0 + Math.asin((a * Math.tan(o)) / this.a) / Math.sin(i)
            );
          }
        else if (Math.abs(h + this.ml0) <= ot)
          (i = 0), (s = qt(this.long0 + a / this.a));
        else {
          (n = (this.ml0 + h) / this.a),
            (r = (a * a) / this.a / this.a + n * n),
            (o = n);
          var c, u, f, m, p;
          for (e = Js; e; --e)
            if (
              ((p = this.e * Math.sin(o)),
              (c = Math.sqrt(1 - p * p) * Math.tan(o)),
              (u = this.a * Es(this.e0, this.e1, this.e2, this.e3, o)),
              (f =
                this.e0 -
                2 * this.e1 * Math.cos(2 * o) +
                4 * this.e2 * Math.cos(4 * o) -
                6 * this.e3 * Math.cos(6 * o)),
              (m = u / this.a),
              (l =
                (n * (c * m + 1) - m - 0.5 * c * (m * m + r)) /
                ((this.es * Math.sin(2 * o) * (m * m + r - 2 * n * m)) /
                  (4 * c) +
                  (n - m) * (c * f - 2 / Math.sin(2 * o)) -
                  f)),
              (o -= l),
              Math.abs(l) <= ot)
            ) {
              i = o;
              break;
            }
          (c = Math.sqrt(1 - this.es * Math.pow(Math.sin(i), 2)) * Math.tan(i)),
            (s = qt(this.long0 + Math.asin((a * c) / this.a) / Math.sin(i)));
        }
        return (t.x = s), (t.y = i), t;
      },
      names: ['Polyconic', 'poly'],
    },
    Zs = {
      init: function () {
        (this.A = []),
          (this.A[1] = 0.6399175073),
          (this.A[2] = -0.1358797613),
          (this.A[3] = 0.063294409),
          (this.A[4] = -0.02526853),
          (this.A[5] = 0.0117879),
          (this.A[6] = -0.0055161),
          (this.A[7] = 0.0026906),
          (this.A[8] = -0.001333),
          (this.A[9] = 67e-5),
          (this.A[10] = -34e-5),
          (this.B_re = []),
          (this.B_im = []),
          (this.B_re[1] = 0.7557853228),
          (this.B_im[1] = 0),
          (this.B_re[2] = 0.249204646),
          (this.B_im[2] = 0.003371507),
          (this.B_re[3] = -0.001541739),
          (this.B_im[3] = 0.04105856),
          (this.B_re[4] = -0.10162907),
          (this.B_im[4] = 0.01727609),
          (this.B_re[5] = -0.26623489),
          (this.B_im[5] = -0.36249218),
          (this.B_re[6] = -0.6870983),
          (this.B_im[6] = -1.1651967),
          (this.C_re = []),
          (this.C_im = []),
          (this.C_re[1] = 1.3231270439),
          (this.C_im[1] = 0),
          (this.C_re[2] = -0.577245789),
          (this.C_im[2] = -0.007809598),
          (this.C_re[3] = 0.508307513),
          (this.C_im[3] = -0.112208952),
          (this.C_re[4] = -0.15094762),
          (this.C_im[4] = 0.18200602),
          (this.C_re[5] = 1.01418179),
          (this.C_im[5] = 1.64497696),
          (this.C_re[6] = 1.9660549),
          (this.C_im[6] = 2.5127645),
          (this.D = []),
          (this.D[1] = 1.5627014243),
          (this.D[2] = 0.5185406398),
          (this.D[3] = -0.03333098),
          (this.D[4] = -0.1052906),
          (this.D[5] = -0.0368594),
          (this.D[6] = 0.007317),
          (this.D[7] = 0.0122),
          (this.D[8] = 0.00394),
          (this.D[9] = -0.0013);
      },
      forward: function (t) {
        var s,
          i = t.x,
          a = t.y - this.lat0,
          h = i - this.long0,
          e = (a / at) * 1e-5,
          n = h,
          r = 1,
          o = 0;
        for (s = 1; s <= 10; s++) (r *= e), (o += this.A[s] * r);
        var l,
          M = o,
          c = n,
          u = 1,
          f = 0,
          m = 0,
          p = 0;
        for (s = 1; s <= 6; s++)
          (l = f * M + u * c),
            (u = u * M - f * c),
            (f = l),
            (m = m + this.B_re[s] * u - this.B_im[s] * f),
            (p = p + this.B_im[s] * u + this.B_re[s] * f);
        return (t.x = p * this.a + this.x0), (t.y = m * this.a + this.y0), t;
      },
      inverse: function (t) {
        var s,
          i,
          a = t.x,
          h = t.y,
          e = a - this.x0,
          n = (h - this.y0) / this.a,
          r = e / this.a,
          o = 1,
          l = 0,
          M = 0,
          c = 0;
        for (s = 1; s <= 6; s++)
          (i = l * n + o * r),
            (o = o * n - l * r),
            (l = i),
            (M = M + this.C_re[s] * o - this.C_im[s] * l),
            (c = c + this.C_im[s] * o + this.C_re[s] * l);
        for (var u = 0; u < this.iterations; u++) {
          var f,
            m = M,
            p = c,
            d = n,
            y = r;
          for (s = 2; s <= 6; s++)
            (f = p * M + m * c),
              (m = m * M - p * c),
              (p = f),
              (d += (s - 1) * (this.B_re[s] * m - this.B_im[s] * p)),
              (y += (s - 1) * (this.B_im[s] * m + this.B_re[s] * p));
          (m = 1), (p = 0);
          var _ = this.B_re[1],
            x = this.B_im[1];
          for (s = 2; s <= 6; s++)
            (f = p * M + m * c),
              (m = m * M - p * c),
              (p = f),
              (_ += s * (this.B_re[s] * m - this.B_im[s] * p)),
              (x += s * (this.B_im[s] * m + this.B_re[s] * p));
          var v = _ * _ + x * x;
          (M = (d * _ + y * x) / v), (c = (y * _ - d * x) / v);
        }
        var g = M,
          b = c,
          w = 1,
          A = 0;
        for (s = 1; s <= 9; s++) (w *= g), (A += this.D[s] * w);
        var C = this.lat0 + A * at * 1e5,
          E = this.long0 + b;
        return (t.x = E), (t.y = C), t;
      },
      names: ['New_Zealand_Map_Grid', 'nzmg'],
    },
    Ys = {
      init: function () {},
      forward: function (t) {
        var s = t.x,
          i = t.y,
          a = qt(s - this.long0),
          h = this.x0 + this.a * a,
          e =
            this.y0 + this.a * Math.log(Math.tan(Math.PI / 4 + i / 2.5)) * 1.25;
        return (t.x = h), (t.y = e), t;
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y -= this.y0);
        var s = qt(this.long0 + t.x / this.a),
          i = 2.5 * (Math.atan(Math.exp((0.8 * t.y) / this.a)) - Math.PI / 4);
        return (t.x = s), (t.y = i), t;
      },
      names: ['Miller_Cylindrical', 'mill'],
    },
    $s = 20,
    ti = {
      init: function () {
        this.sphere
          ? ((this.n = 1),
            (this.m = 0),
            (this.es = 0),
            (this.C_y = Math.sqrt((this.m + 1) / this.n)),
            (this.C_x = this.C_y / (this.m + 1)))
          : (this.en = is(this.es));
      },
      forward: function (t) {
        var s,
          i,
          a = t.x,
          h = t.y;
        if (((a = qt(a - this.long0)), this.sphere)) {
          if (this.m)
            for (var e = this.n * Math.sin(h), n = $s; n; --n) {
              var r = (this.m * h + Math.sin(h) - e) / (this.m + Math.cos(h));
              if (((h -= r), Math.abs(r) < ot)) break;
            }
          else h = 1 !== this.n ? Math.asin(this.n * Math.sin(h)) : h;
          (s = this.a * this.C_x * a * (this.m + Math.cos(h))),
            (i = this.a * this.C_y * h);
        } else {
          var o = Math.sin(h),
            l = Math.cos(h);
          (i = this.a * as(h, o, l, this.en)),
            (s = (this.a * a * l) / Math.sqrt(1 - this.es * o * o));
        }
        return (t.x = s), (t.y = i), t;
      },
      inverse: function (t) {
        var s, i, a, h;
        return (
          (t.x -= this.x0),
          (a = t.x / this.a),
          (t.y -= this.y0),
          (s = t.y / this.a),
          this.sphere
            ? ((s /= this.C_y),
              (a /= this.C_x * (this.m + Math.cos(s))),
              this.m
                ? (s = Fs((this.m * s + Math.sin(s)) / this.n))
                : 1 !== this.n && (s = Fs(Math.sin(s) / this.n)),
              (a = qt(a + this.long0)),
              (s = Is(s)))
            : ((s = hs(t.y / this.a, this.es, this.en)),
              (h = Math.abs(s)) < ht
                ? ((h = Math.sin(s)),
                  (i =
                    this.long0 +
                    (t.x * Math.sqrt(1 - this.es * h * h)) /
                      (this.a * Math.cos(s))),
                  (a = qt(i)))
                : h - ot < ht && (a = this.long0)),
          (t.x = a),
          (t.y = s),
          t
        );
      },
      names: ['Sinusoidal', 'sinu'],
    },
    si = {
      init: function () {},
      forward: function (t) {
        for (
          var s = t.x,
            i = t.y,
            a = qt(s - this.long0),
            h = i,
            e = Math.PI * Math.sin(i);
          ;

        ) {
          var n = -(h + Math.sin(h) - e) / (1 + Math.cos(h));
          if (((h += n), Math.abs(n) < ot)) break;
        }
        (h /= 2), Math.PI / 2 - Math.abs(i) < ot && (a = 0);
        var r = 0.900316316158 * this.a * a * Math.cos(h) + this.x0,
          o = 1.4142135623731 * this.a * Math.sin(h) + this.y0;
        return (t.x = r), (t.y = o), t;
      },
      inverse: function (t) {
        var s, i;
        (t.x -= this.x0),
          (t.y -= this.y0),
          (i = t.y / (1.4142135623731 * this.a)),
          Math.abs(i) > 0.999999999999 && (i = 0.999999999999),
          (s = Math.asin(i));
        var a = qt(this.long0 + t.x / (0.900316316158 * this.a * Math.cos(s)));
        a < -Math.PI && (a = -Math.PI),
          a > Math.PI && (a = Math.PI),
          (i = (2 * s + Math.sin(2 * s)) / Math.PI),
          Math.abs(i) > 1 && (i = 1);
        var h = Math.asin(i);
        return (t.x = a), (t.y = h), t;
      },
      names: ['Mollweide', 'moll'],
    },
    ii = {
      init: function () {
        Math.abs(this.lat1 + this.lat2) < ot ||
          ((this.lat2 = this.lat2 || this.lat1),
          (this.temp = this.b / this.a),
          (this.es = 1 - Math.pow(this.temp, 2)),
          (this.e = Math.sqrt(this.es)),
          (this.e0 = Ps(this.es)),
          (this.e1 = Ns(this.es)),
          (this.e2 = Ss(this.es)),
          (this.e3 = ks(this.es)),
          (this.sinphi = Math.sin(this.lat1)),
          (this.cosphi = Math.cos(this.lat1)),
          (this.ms1 = St(this.e, this.sinphi, this.cosphi)),
          (this.ml1 = Es(this.e0, this.e1, this.e2, this.e3, this.lat1)),
          Math.abs(this.lat1 - this.lat2) < ot
            ? (this.ns = this.sinphi)
            : ((this.sinphi = Math.sin(this.lat2)),
              (this.cosphi = Math.cos(this.lat2)),
              (this.ms2 = St(this.e, this.sinphi, this.cosphi)),
              (this.ml2 = Es(this.e0, this.e1, this.e2, this.e3, this.lat2)),
              (this.ns = (this.ms1 - this.ms2) / (this.ml2 - this.ml1))),
          (this.g = this.ml1 + this.ms1 / this.ns),
          (this.ml0 = Es(this.e0, this.e1, this.e2, this.e3, this.lat0)),
          (this.rh = this.a * (this.g - this.ml0)));
      },
      forward: function (t) {
        var s,
          i = t.x,
          a = t.y;
        if (this.sphere) s = this.a * (this.g - a);
        else {
          var h = Es(this.e0, this.e1, this.e2, this.e3, a);
          s = this.a * (this.g - h);
        }
        var e = this.ns * qt(i - this.long0),
          n = this.x0 + s * Math.sin(e),
          r = this.y0 + this.rh - s * Math.cos(e);
        return (t.x = n), (t.y = r), t;
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y = this.rh - t.y + this.y0);
        var s, i, a, h;
        this.ns >= 0
          ? ((i = Math.sqrt(t.x * t.x + t.y * t.y)), (s = 1))
          : ((i = -Math.sqrt(t.x * t.x + t.y * t.y)), (s = -1));
        var e = 0;
        if ((0 !== i && (e = Math.atan2(s * t.x, s * t.y)), this.sphere))
          return (
            (h = qt(this.long0 + e / this.ns)),
            (a = Is(this.g - i / this.a)),
            (t.x = h),
            (t.y = a),
            t
          );
        var n = this.g - i / this.a;
        return (
          (a = Os(n, this.e0, this.e1, this.e2, this.e3)),
          (h = qt(this.long0 + e / this.ns)),
          (t.x = h),
          (t.y = a),
          t
        );
      },
      names: ['Equidistant_Conic', 'eqdc'],
    },
    ai = {
      init: function () {
        this.R = this.a;
      },
      forward: function (t) {
        var s,
          i,
          a = t.x,
          h = t.y,
          e = qt(a - this.long0);
        Math.abs(h) <= ot && ((s = this.x0 + this.R * e), (i = this.y0));
        var n = Fs(2 * Math.abs(h / Math.PI));
        (Math.abs(e) <= ot || Math.abs(Math.abs(h) - ht) <= ot) &&
          ((s = this.x0),
          (i =
            h >= 0
              ? this.y0 + Math.PI * this.R * Math.tan(0.5 * n)
              : this.y0 + Math.PI * this.R * -Math.tan(0.5 * n)));
        var r = 0.5 * Math.abs(Math.PI / e - e / Math.PI),
          o = r * r,
          l = Math.sin(n),
          M = Math.cos(n),
          c = M / (l + M - 1),
          u = c * c,
          f = c * (2 / l - 1),
          m = f * f,
          p =
            (Math.PI *
              this.R *
              (r * (c - m) +
                Math.sqrt(o * (c - m) * (c - m) - (m + o) * (u - m)))) /
            (m + o);
        e < 0 && (p = -p), (s = this.x0 + p);
        var d = o + c;
        return (
          (p =
            (Math.PI *
              this.R *
              (f * d - r * Math.sqrt((m + o) * (o + 1) - d * d))) /
            (m + o)),
          (i = h >= 0 ? this.y0 + p : this.y0 - p),
          (t.x = s),
          (t.y = i),
          t
        );
      },
      inverse: function (t) {
        var s, i, a, h, e, n, r, o, l, M, c, u, f;
        return (
          (t.x -= this.x0),
          (t.y -= this.y0),
          (c = Math.PI * this.R),
          (a = t.x / c),
          (h = t.y / c),
          (e = a * a + h * h),
          (n = -Math.abs(h) * (1 + e)),
          (r = n - 2 * h * h + a * a),
          (o = -2 * n + 1 + 2 * h * h + e * e),
          (f =
            (h * h) / o +
            ((2 * r * r * r) / o / o / o - (9 * n * r) / o / o) / 27),
          (l = (n - (r * r) / 3 / o) / o),
          (M = 2 * Math.sqrt(-l / 3)),
          (c = (3 * f) / l / M),
          Math.abs(c) > 1 && (c = c >= 0 ? 1 : -1),
          (u = Math.acos(c) / 3),
          (i =
            t.y >= 0
              ? (-M * Math.cos(u + Math.PI / 3) - r / 3 / o) * Math.PI
              : -(-M * Math.cos(u + Math.PI / 3) - r / 3 / o) * Math.PI),
          (s =
            Math.abs(a) < ot
              ? this.long0
              : qt(
                  this.long0 +
                    (Math.PI *
                      (e - 1 + Math.sqrt(1 + 2 * (a * a - h * h) + e * e))) /
                      2 /
                      a
                )),
          (t.x = s),
          (t.y = i),
          t
        );
      },
      names: ['Van_der_Grinten_I', 'VanDerGrinten', 'vandg'],
    },
    hi = {
      init: function () {
        (this.sin_p12 = Math.sin(this.lat0)),
          (this.cos_p12 = Math.cos(this.lat0));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o,
          l,
          M,
          c,
          u,
          f,
          m,
          p,
          d,
          y,
          _,
          x,
          v,
          g,
          b,
          w,
          A = t.x,
          C = t.y,
          E = Math.sin(t.y),
          P = Math.cos(t.y),
          N = qt(A - this.long0);
        return this.sphere
          ? Math.abs(this.sin_p12 - 1) <= ot
            ? ((t.x = this.x0 + this.a * (ht - C) * Math.sin(N)),
              (t.y = this.y0 - this.a * (ht - C) * Math.cos(N)),
              t)
            : Math.abs(this.sin_p12 + 1) <= ot
            ? ((t.x = this.x0 + this.a * (ht + C) * Math.sin(N)),
              (t.y = this.y0 + this.a * (ht + C) * Math.cos(N)),
              t)
            : ((_ = this.sin_p12 * E + this.cos_p12 * P * Math.cos(N)),
              (d = Math.acos(_)),
              (y = d / Math.sin(d)),
              (t.x = this.x0 + this.a * y * P * Math.sin(N)),
              (t.y =
                this.y0 +
                this.a *
                  y *
                  (this.cos_p12 * E - this.sin_p12 * P * Math.cos(N))),
              t)
          : ((s = Ps(this.es)),
            (i = Ns(this.es)),
            (a = Ss(this.es)),
            (h = ks(this.es)),
            Math.abs(this.sin_p12 - 1) <= ot
              ? ((e = this.a * Es(s, i, a, h, ht)),
                (n = this.a * Es(s, i, a, h, C)),
                (t.x = this.x0 + (e - n) * Math.sin(N)),
                (t.y = this.y0 - (e - n) * Math.cos(N)),
                t)
              : Math.abs(this.sin_p12 + 1) <= ot
              ? ((e = this.a * Es(s, i, a, h, ht)),
                (n = this.a * Es(s, i, a, h, C)),
                (t.x = this.x0 + (e + n) * Math.sin(N)),
                (t.y = this.y0 + (e + n) * Math.cos(N)),
                t)
              : ((r = E / P),
                (o = qs(this.a, this.e, this.sin_p12)),
                (l = qs(this.a, this.e, E)),
                (M = Math.atan(
                  (1 - this.es) * r + (this.es * o * this.sin_p12) / (l * P)
                )),
                (c = Math.atan2(
                  Math.sin(N),
                  this.cos_p12 * Math.tan(M) - this.sin_p12 * Math.cos(N)
                )),
                (x =
                  0 === c
                    ? Math.asin(
                        this.cos_p12 * Math.sin(M) - this.sin_p12 * Math.cos(M)
                      )
                    : Math.abs(Math.abs(c) - Math.PI) <= ot
                    ? -Math.asin(
                        this.cos_p12 * Math.sin(M) - this.sin_p12 * Math.cos(M)
                      )
                    : Math.asin((Math.sin(N) * Math.cos(M)) / Math.sin(c))),
                (u = (this.e * this.sin_p12) / Math.sqrt(1 - this.es)),
                (f =
                  (this.e * this.cos_p12 * Math.cos(c)) /
                  Math.sqrt(1 - this.es)),
                (m = u * f),
                (p = f * f),
                (v = x * x),
                (g = v * x),
                (b = g * x),
                (w = b * x),
                (d =
                  o *
                  x *
                  (1 -
                    (v * p * (1 - p)) / 6 +
                    (g / 8) * m * (1 - 2 * p) +
                    (b / 120) * (p * (4 - 7 * p) - 3 * u * u * (1 - 7 * p)) -
                    (w / 48) * m)),
                (t.x = this.x0 + d * Math.sin(c)),
                (t.y = this.y0 + d * Math.cos(c)),
                t));
      },
      inverse: function (t) {
        (t.x -= this.x0), (t.y -= this.y0);
        var s, i, a, h, e, n, r, o, l, M, c, u, f, m, p, d, y, _, x, v, g, b, w;
        if (this.sphere) {
          if ((s = Math.sqrt(t.x * t.x + t.y * t.y)) > 2 * ht * this.a) return;
          return (
            (i = s / this.a),
            (a = Math.sin(i)),
            (h = Math.cos(i)),
            (e = this.long0),
            Math.abs(s) <= ot
              ? (n = this.lat0)
              : ((n = Fs(h * this.sin_p12 + (t.y * a * this.cos_p12) / s)),
                (r = Math.abs(this.lat0) - ht),
                (e = qt(
                  Math.abs(r) <= ot
                    ? this.lat0 >= 0
                      ? this.long0 + Math.atan2(t.x, -t.y)
                      : this.long0 - Math.atan2(-t.x, t.y)
                    : this.long0 +
                        Math.atan2(
                          t.x * a,
                          s * this.cos_p12 * h - t.y * this.sin_p12 * a
                        )
                ))),
            (t.x = e),
            (t.y = n),
            t
          );
        }
        return (
          (o = Ps(this.es)),
          (l = Ns(this.es)),
          (M = Ss(this.es)),
          (c = ks(this.es)),
          Math.abs(this.sin_p12 - 1) <= ot
            ? ((u = this.a * Es(o, l, M, c, ht)),
              (s = Math.sqrt(t.x * t.x + t.y * t.y)),
              (f = u - s),
              (n = Os(f / this.a, o, l, M, c)),
              (e = qt(this.long0 + Math.atan2(t.x, -1 * t.y))),
              (t.x = e),
              (t.y = n),
              t)
            : Math.abs(this.sin_p12 + 1) <= ot
            ? ((u = this.a * Es(o, l, M, c, ht)),
              (s = Math.sqrt(t.x * t.x + t.y * t.y)),
              (f = s - u),
              (n = Os(f / this.a, o, l, M, c)),
              (e = qt(this.long0 + Math.atan2(t.x, t.y))),
              (t.x = e),
              (t.y = n),
              t)
            : ((s = Math.sqrt(t.x * t.x + t.y * t.y)),
              (d = Math.atan2(t.x, t.y)),
              (m = qs(this.a, this.e, this.sin_p12)),
              (y = Math.cos(d)),
              (_ = this.e * this.cos_p12 * y),
              (x = (-_ * _) / (1 - this.es)),
              (v =
                (3 * this.es * (1 - x) * this.sin_p12 * this.cos_p12 * y) /
                (1 - this.es)),
              (g = s / m),
              (b =
                g -
                (x * (1 + x) * Math.pow(g, 3)) / 6 -
                (v * (1 + 3 * x) * Math.pow(g, 4)) / 24),
              (w = 1 - (x * b * b) / 2 - (g * b * b * b) / 6),
              (p = Math.asin(
                this.sin_p12 * Math.cos(b) + this.cos_p12 * Math.sin(b) * y
              )),
              (e = qt(
                this.long0 +
                  Math.asin((Math.sin(d) * Math.sin(b)) / Math.cos(p))
              )),
              (n = Math.atan(
                ((1 - (this.es * w * this.sin_p12) / Math.sin(p)) *
                  Math.tan(p)) /
                  (1 - this.es)
              )),
              (t.x = e),
              (t.y = n),
              t)
        );
      },
      names: ['Azimuthal_Equidistant', 'aeqd'],
    },
    ei = {
      init: function () {
        (this.sin_p14 = Math.sin(this.lat0)),
          (this.cos_p14 = Math.cos(this.lat0));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o = t.x,
          l = t.y;
        return (
          (a = qt(o - this.long0)),
          (s = Math.sin(l)),
          (i = Math.cos(l)),
          (h = Math.cos(a)),
          ((e = this.sin_p14 * s + this.cos_p14 * i * h) > 0 ||
            Math.abs(e) <= ot) &&
            ((n = 1 * this.a * i * Math.sin(a)),
            (r =
              this.y0 +
              1 * this.a * (this.cos_p14 * s - this.sin_p14 * i * h))),
          (t.x = n),
          (t.y = r),
          t
        );
      },
      inverse: function (t) {
        var s, i, a, h, e, n, r;
        return (
          (t.x -= this.x0),
          (t.y -= this.y0),
          (s = Math.sqrt(t.x * t.x + t.y * t.y)),
          (i = Fs(s / this.a)),
          (a = Math.sin(i)),
          (h = Math.cos(i)),
          (n = this.long0),
          Math.abs(s) <= ot
            ? ((r = this.lat0), (t.x = n), (t.y = r), t)
            : ((r = Fs(h * this.sin_p14 + (t.y * a * this.cos_p14) / s)),
              (e = Math.abs(this.lat0) - ht),
              Math.abs(e) <= ot
                ? ((n = qt(
                    this.lat0 >= 0
                      ? this.long0 + Math.atan2(t.x, -t.y)
                      : this.long0 - Math.atan2(-t.x, t.y)
                  )),
                  (t.x = n),
                  (t.y = r),
                  t)
                : ((n = qt(
                    this.long0 +
                      Math.atan2(
                        t.x * a,
                        s * this.cos_p14 * h - t.y * this.sin_p14 * a
                      )
                  )),
                  (t.x = n),
                  (t.y = r),
                  t))
        );
      },
      names: ['ortho'],
    },
    ni = { FRONT: 1, RIGHT: 2, BACK: 3, LEFT: 4, TOP: 5, BOTTOM: 6 },
    ri = { AREA_0: 1, AREA_1: 2, AREA_2: 3, AREA_3: 4 },
    oi = {
      init: function () {
        (this.x0 = this.x0 || 0),
          (this.y0 = this.y0 || 0),
          (this.lat0 = this.lat0 || 0),
          (this.long0 = this.long0 || 0),
          (this.lat_ts = this.lat_ts || 0),
          (this.title = this.title || 'Quadrilateralized Spherical Cube'),
          this.lat0 >= ht - ct / 2
            ? (this.face = ni.TOP)
            : this.lat0 <= -(ht - ct / 2)
            ? (this.face = ni.BOTTOM)
            : Math.abs(this.long0) <= ct
            ? (this.face = ni.FRONT)
            : Math.abs(this.long0) <= ht + ct
            ? (this.face = this.long0 > 0 ? ni.RIGHT : ni.LEFT)
            : (this.face = ni.BACK),
          0 !== this.es &&
            ((this.one_minus_f = 1 - (this.a - this.b) / this.a),
            (this.one_minus_f_squared = this.one_minus_f * this.one_minus_f));
      },
      forward: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r = { x: 0, y: 0 },
          o = { value: 0 };
        if (
          ((t.x -= this.long0),
          (s =
            0 !== this.es
              ? Math.atan(this.one_minus_f_squared * Math.tan(t.y))
              : t.y),
          (i = t.x),
          this.face === ni.TOP)
        )
          (h = ht - s),
            i >= ct && i <= ht + ct
              ? ((o.value = ri.AREA_0), (a = i - ht))
              : i > ht + ct || i <= -(ht + ct)
              ? ((o.value = ri.AREA_1), (a = i > 0 ? i - ft : i + ft))
              : i > -(ht + ct) && i <= -ct
              ? ((o.value = ri.AREA_2), (a = i + ht))
              : ((o.value = ri.AREA_3), (a = i));
        else if (this.face === ni.BOTTOM)
          (h = ht + s),
            i >= ct && i <= ht + ct
              ? ((o.value = ri.AREA_0), (a = -i + ht))
              : i < ct && i >= -ct
              ? ((o.value = ri.AREA_1), (a = -i))
              : i < -ct && i >= -(ht + ct)
              ? ((o.value = ri.AREA_2), (a = -i - ht))
              : ((o.value = ri.AREA_3), (a = i > 0 ? -i + ft : -i - ft));
        else {
          var l, M, c, u, f, m;
          this.face === ni.RIGHT
            ? (i = Z(i, +ht))
            : this.face === ni.BACK
            ? (i = Z(i, +ft))
            : this.face === ni.LEFT && (i = Z(i, -ht)),
            (u = Math.sin(s)),
            (f = Math.cos(s)),
            (m = Math.sin(i)),
            (l = f * Math.cos(i)),
            (M = f * m),
            (c = u),
            this.face === ni.FRONT
              ? (a = V((h = Math.acos(l)), c, M, o))
              : this.face === ni.RIGHT
              ? (a = V((h = Math.acos(M)), c, -l, o))
              : this.face === ni.BACK
              ? (a = V((h = Math.acos(-l)), c, -M, o))
              : this.face === ni.LEFT
              ? (a = V((h = Math.acos(-M)), c, l, o))
              : ((h = a = 0), (o.value = ri.AREA_0));
        }
        return (
          (n = Math.atan(
            (12 / ft) * (a + Math.acos(Math.sin(a) * Math.cos(ct)) - ht)
          )),
          (e = Math.sqrt(
            (1 - Math.cos(h)) /
              (Math.cos(n) * Math.cos(n)) /
              (1 - Math.cos(Math.atan(1 / Math.cos(a))))
          )),
          o.value === ri.AREA_1
            ? (n += ht)
            : o.value === ri.AREA_2
            ? (n += ft)
            : o.value === ri.AREA_3 && (n += 1.5 * ft),
          (r.x = e * Math.cos(n)),
          (r.y = e * Math.sin(n)),
          (r.x = r.x * this.a + this.x0),
          (r.y = r.y * this.a + this.y0),
          (t.x = r.x),
          (t.y = r.y),
          t
        );
      },
      inverse: function (t) {
        var s,
          i,
          a,
          h,
          e,
          n,
          r,
          o,
          l,
          M = { lam: 0, phi: 0 },
          c = { value: 0 };
        if (
          ((t.x = (t.x - this.x0) / this.a),
          (t.y = (t.y - this.y0) / this.a),
          (i = Math.atan(Math.sqrt(t.x * t.x + t.y * t.y))),
          (s = Math.atan2(t.y, t.x)),
          t.x >= 0 && t.x >= Math.abs(t.y)
            ? (c.value = ri.AREA_0)
            : t.y >= 0 && t.y >= Math.abs(t.x)
            ? ((c.value = ri.AREA_1), (s -= ht))
            : t.x < 0 && -t.x >= Math.abs(t.y)
            ? ((c.value = ri.AREA_2), (s = s < 0 ? s + ft : s - ft))
            : ((c.value = ri.AREA_3), (s += ht)),
          (l = (ft / 12) * Math.tan(s)),
          (e = Math.sin(l) / (Math.cos(l) - 1 / Math.sqrt(2))),
          (n = Math.atan(e)),
          (a = Math.cos(s)),
          (h = Math.tan(i)),
          (r = 1 - a * a * h * h * (1 - Math.cos(Math.atan(1 / Math.cos(n))))) <
          -1
            ? (r = -1)
            : r > 1 && (r = 1),
          this.face === ni.TOP)
        )
          (o = Math.acos(r)),
            (M.phi = ht - o),
            c.value === ri.AREA_0
              ? (M.lam = n + ht)
              : c.value === ri.AREA_1
              ? (M.lam = n < 0 ? n + ft : n - ft)
              : c.value === ri.AREA_2
              ? (M.lam = n - ht)
              : (M.lam = n);
        else if (this.face === ni.BOTTOM)
          (o = Math.acos(r)),
            (M.phi = o - ht),
            c.value === ri.AREA_0
              ? (M.lam = -n + ht)
              : c.value === ri.AREA_1
              ? (M.lam = -n)
              : c.value === ri.AREA_2
              ? (M.lam = -n - ht)
              : (M.lam = n < 0 ? -n - ft : -n + ft);
        else {
          var u, f, m;
          (l = (u = r) * u),
            (f =
              (l += (m = l >= 1 ? 0 : Math.sqrt(1 - l) * Math.sin(n)) * m) >= 1
                ? 0
                : Math.sqrt(1 - l)),
            c.value === ri.AREA_1
              ? ((l = f), (f = -m), (m = l))
              : c.value === ri.AREA_2
              ? ((f = -f), (m = -m))
              : c.value === ri.AREA_3 && ((l = f), (f = m), (m = -l)),
            this.face === ni.RIGHT
              ? ((l = u), (u = -f), (f = l))
              : this.face === ni.BACK
              ? ((u = -u), (f = -f))
              : this.face === ni.LEFT && ((l = u), (u = f), (f = -l)),
            (M.phi = Math.acos(-m) - ht),
            (M.lam = Math.atan2(f, u)),
            this.face === ni.RIGHT
              ? (M.lam = Z(M.lam, -ht))
              : this.face === ni.BACK
              ? (M.lam = Z(M.lam, -ft))
              : this.face === ni.LEFT && (M.lam = Z(M.lam, +ht));
        }
        if (0 !== this.es) {
          var p, d, y;
          (p = M.phi < 0 ? 1 : 0),
            (d = Math.tan(M.phi)),
            (y = this.b / Math.sqrt(d * d + this.one_minus_f_squared)),
            (M.phi = Math.atan(
              Math.sqrt(this.a * this.a - y * y) / (this.one_minus_f * y)
            )),
            p && (M.phi = -M.phi);
        }
        return (M.lam += this.long0), (t.x = M.lam), (t.y = M.phi), t;
      },
      names: [
        'Quadrilateralized Spherical Cube',
        'Quadrilateralized_Spherical_Cube',
        'qsc',
      ],
    },
    li = [
      [1, 2.2199e-17, -715515e-10, 31103e-10],
      [0.9986, -482243e-9, -24897e-9, -13309e-10],
      [0.9954, -83103e-8, -448605e-10, -9.86701e-7],
      [0.99, -0.00135364, -59661e-9, 36777e-10],
      [0.9822, -0.00167442, -449547e-11, -572411e-11],
      [0.973, -0.00214868, -903571e-10, 1.8736e-8],
      [0.96, -0.00305085, -900761e-10, 164917e-11],
      [0.9427, -0.00382792, -653386e-10, -26154e-10],
      [0.9216, -0.00467746, -10457e-8, 481243e-11],
      [0.8962, -0.00536223, -323831e-10, -543432e-11],
      [0.8679, -0.00609363, -113898e-9, 332484e-11],
      [0.835, -0.00698325, -640253e-10, 9.34959e-7],
      [0.7986, -0.00755338, -500009e-10, 9.35324e-7],
      [0.7597, -0.00798324, -35971e-9, -227626e-11],
      [0.7186, -0.00851367, -701149e-10, -86303e-10],
      [0.6732, -0.00986209, -199569e-9, 191974e-10],
      [0.6213, -0.010418, 883923e-10, 624051e-11],
      [0.5722, -0.00906601, 182e-6, 624051e-11],
      [0.5322, -0.00677797, 275608e-9, 624051e-11],
    ],
    Mi = [
      [-5.20417e-18, 0.0124, 1.21431e-18, -8.45284e-11],
      [0.062, 0.0124, -1.26793e-9, 4.22642e-10],
      [0.124, 0.0124, 5.07171e-9, -1.60604e-9],
      [0.186, 0.0123999, -1.90189e-8, 6.00152e-9],
      [0.248, 0.0124002, 7.10039e-8, -2.24e-8],
      [0.31, 0.0123992, -2.64997e-7, 8.35986e-8],
      [0.372, 0.0124029, 9.88983e-7, -3.11994e-7],
      [0.434, 0.0123893, -369093e-11, -4.35621e-7],
      [0.4958, 0.0123198, -102252e-10, -3.45523e-7],
      [0.5571, 0.0121916, -154081e-10, -5.82288e-7],
      [0.6176, 0.0119938, -241424e-10, -5.25327e-7],
      [0.6769, 0.011713, -320223e-10, -5.16405e-7],
      [0.7346, 0.0113541, -397684e-10, -6.09052e-7],
      [0.7903, 0.0109107, -489042e-10, -104739e-11],
      [0.8435, 0.0103431, -64615e-9, -1.40374e-9],
      [0.8936, 0.00969686, -64636e-9, -8547e-9],
      [0.9394, 0.00840947, -192841e-9, -42106e-10],
      [0.9761, 0.00616527, -256e-6, -42106e-10],
      [1, 0.00328947, -319159e-9, -42106e-10],
    ],
    ci = 0.8487,
    ui = 1.3523,
    fi = Mt / 5,
    mi = 1 / fi,
    pi = 18,
    di = function (t, s) {
      return t[0] + s * (t[1] + s * (t[2] + s * t[3]));
    },
    yi = function (t, s) {
      return t[1] + s * (2 * t[2] + 3 * s * t[3]);
    },
    _i = {
      init: function () {
        (this.x0 = this.x0 || 0),
          (this.y0 = this.y0 || 0),
          (this.long0 = this.long0 || 0),
          (this.es = 0),
          (this.title = this.title || 'Robinson');
      },
      forward: function (t) {
        var s = qt(t.x - this.long0),
          i = Math.abs(t.y),
          a = Math.floor(i * fi);
        a < 0 ? (a = 0) : a >= pi && (a = pi - 1), (i = Mt * (i - mi * a));
        var h = { x: di(li[a], i) * s, y: di(Mi[a], i) };
        return (
          t.y < 0 && (h.y = -h.y),
          (h.x = h.x * this.a * ci + this.x0),
          (h.y = h.y * this.a * ui + this.y0),
          h
        );
      },
      inverse: function (t) {
        var s = {
          x: (t.x - this.x0) / (this.a * ci),
          y: Math.abs(t.y - this.y0) / (this.a * ui),
        };
        if (s.y >= 1) (s.x /= li[pi][0]), (s.y = t.y < 0 ? -ht : ht);
        else {
          var i = Math.floor(s.y * pi);
          for (i < 0 ? (i = 0) : i >= pi && (i = pi - 1); ; )
            if (Mi[i][0] > s.y) --i;
            else {
              if (!(Mi[i + 1][0] <= s.y)) break;
              ++i;
            }
          var a = Mi[i],
            h = (5 * (s.y - a[0])) / (Mi[i + 1][0] - a[0]);
          (h = Y(
            function (t) {
              return (di(a, t) - s.y) / yi(a, t);
            },
            h,
            ot,
            100
          )),
            (s.x /= di(li[i], h)),
            (s.y = (5 * i + h) * lt),
            t.y < 0 && (s.y = -s.y);
        }
        return (s.x = qt(s.x + this.long0)), s;
      },
      names: ['Robinson', 'robin'],
    },
    xi = {
      init: function () {
        this.name = 'geocent';
      },
      forward: function (t) {
        return b(t, this.es, this.a);
      },
      inverse: function (t) {
        return w(t, this.es, this.a, this.b);
      },
      names: ['Geocentric', 'geocentric', 'geocent', 'Geocent'],
    };
  return (
    (I.defaultDatum = 'WGS84'),
    (I.Proj = Projection),
    (I.WGS84 = new I.Proj('WGS84')),
    (I.Point = Point),
    (I.toPoint = Ft),
    (I.defs = o),
    (I.transform = S),
    (I.mgrs = ts),
    (I.version = '2.6.0'),
    (function (proj4) {
      proj4.Proj.projections.add(es),
        proj4.Proj.projections.add(ms),
        proj4.Proj.projections.add(ds),
        proj4.Proj.projections.add(vs),
        proj4.Proj.projections.add(gs),
        proj4.Proj.projections.add(bs),
        proj4.Proj.projections.add(ws),
        proj4.Proj.projections.add(As),
        proj4.Proj.projections.add(Cs),
        proj4.Proj.projections.add(Rs),
        proj4.Proj.projections.add(Us),
        proj4.Proj.projections.add(Qs),
        proj4.Proj.projections.add(Ws),
        proj4.Proj.projections.add(Ks),
        proj4.Proj.projections.add(Xs),
        proj4.Proj.projections.add(Vs),
        proj4.Proj.projections.add(Zs),
        proj4.Proj.projections.add(Ys),
        proj4.Proj.projections.add(ti),
        proj4.Proj.projections.add(si),
        proj4.Proj.projections.add(ii),
        proj4.Proj.projections.add(ai),
        proj4.Proj.projections.add(hi),
        proj4.Proj.projections.add(ei),
        proj4.Proj.projections.add(oi),
        proj4.Proj.projections.add(_i),
        proj4.Proj.projections.add(xi);
    })(I),
    I
  );
});
(function (H) {
  'use strict';
  var isEdge = navigator.userAgent.indexOf('Edge/') > 0;
  var isMSIE11 = navigator.userAgent.indexOf('Trident/') > 0;
  var isMSBrowser = window.isMSIE || isMSIE11 || isEdge;
  var plotOptions = H.getOptions().plotOptions;
  plotOptions.series = plotOptions.series || {};
  plotOptions.series.animation = !isMSBrowser;
  plotOptions.series.states = plotOptions.series.states || {};
  plotOptions.series.states.inactive = plotOptions.series.states.inactive || {};
  plotOptions.series.states.inactive.enabled = false;
  plotOptions.series.borderWidth = 0;
  var legendOptions = H.getOptions().legend;
  legendOptions.symbolRadius = 0;
  H.SVGRenderer.prototype.getContrast = function (color) {
    color = H.Color(color).rgba;
    return color[0] + color[1] + color[2] > 384 ? '#000' : '#FFF';
  };
  updateHighchartsWithMethodsFromVersion611(H);
})(Highcharts);
function updateHighchartsWithMethodsFromVersion611(Highcharts) {
  Highcharts.wrap(
    Highcharts.Axis.prototype,
    'getPlotLinePath',
    function (proceed) {
      var path = proceed.apply(this, Array.prototype.slice.call(arguments, 1));
      if (path) {
        path.flat = false;
      }
      return path;
    }
  );
}
