/*! RESOURCE: /scripts/highcharts/modules/boost.js */
(function (d) {
  'object' === typeof module && module.exports
    ? ((d['default'] = d), (module.exports = d))
    : 'function' === typeof define && define.amd
    ? define('highcharts/modules/boost', ['highcharts'], function (r) {
        d(r);
        d.Highcharts = r;
        return d;
      })
    : d('undefined' !== typeof Highcharts ? Highcharts : void 0);
})(function (d) {
  function r(d, C, q, l) {
    d.hasOwnProperty(C) || (d[C] = l.apply(null, q));
  }
  d = d ? d._modules : {};
  r(d, 'Extensions/Boost/Boostables.js', [], function () {
    return 'area arearange column columnrange bar line scatter heatmap bubble treemap'.split(
      ' '
    );
  });
  r(
    d,
    'Extensions/Boost/BoostableMap.js',
    [d['Extensions/Boost/Boostables.js']],
    function (d) {
      var x = {};
      d.forEach(function (d) {
        x[d] = 1;
      });
      return x;
    }
  );
  r(d, 'Extensions/Boost/WGLShader.js', [d['Core/Utilities.js']], function (d) {
    var x = d.clamp,
      q = d.error,
      l = d.pick;
    return function (b) {
      function d() {
        g.length && q('[highcharts boost] shader error - ' + g.join('\n'));
      }
      function w(a, c) {
        var f = b.createShader(
          'vertex' === c ? b.VERTEX_SHADER : b.FRAGMENT_SHADER
        );
        b.shaderSource(f, a);
        b.compileShader(f);
        return b.getShaderParameter(f, b.COMPILE_STATUS)
          ? f
          : (g.push(
              'when compiling ' + c + ' shader:\n' + b.getShaderInfoLog(f)
            ),
            !1);
      }
      function p() {
        function a(a) {
          return b.getUniformLocation(h, a);
        }
        var L = w(
            '#version 100\n#define LN10 2.302585092994046\nprecision highp float;\nattribute vec4 aVertexPosition;\nattribute vec4 aColor;\nvarying highp vec2 position;\nvarying highp vec4 vColor;\nuniform mat4 uPMatrix;\nuniform float pSize;\nuniform float translatedThreshold;\nuniform bool hasThreshold;\nuniform bool skipTranslation;\nuniform float xAxisTrans;\nuniform float xAxisMin;\nuniform float xAxisMinPad;\nuniform float xAxisPointRange;\nuniform float xAxisLen;\nuniform bool  xAxisPostTranslate;\nuniform float xAxisOrdinalSlope;\nuniform float xAxisOrdinalOffset;\nuniform float xAxisPos;\nuniform bool  xAxisCVSCoord;\nuniform bool  xAxisIsLog;\nuniform bool  xAxisReversed;\nuniform float yAxisTrans;\nuniform float yAxisMin;\nuniform float yAxisMinPad;\nuniform float yAxisPointRange;\nuniform float yAxisLen;\nuniform bool  yAxisPostTranslate;\nuniform float yAxisOrdinalSlope;\nuniform float yAxisOrdinalOffset;\nuniform float yAxisPos;\nuniform bool  yAxisCVSCoord;\nuniform bool  yAxisIsLog;\nuniform bool  yAxisReversed;\nuniform bool  isBubble;\nuniform bool  bubbleSizeByArea;\nuniform float bubbleZMin;\nuniform float bubbleZMax;\nuniform float bubbleZThreshold;\nuniform float bubbleMinSize;\nuniform float bubbleMaxSize;\nuniform bool  bubbleSizeAbs;\nuniform bool  isInverted;\nfloat bubbleRadius(){\nfloat value = aVertexPosition.w;\nfloat zMax = bubbleZMax;\nfloat zMin = bubbleZMin;\nfloat radius = 0.0;\nfloat pos = 0.0;\nfloat zRange = zMax - zMin;\nif (bubbleSizeAbs){\nvalue = value - bubbleZThreshold;\nzMax = max(zMax - bubbleZThreshold, zMin - bubbleZThreshold);\nzMin = 0.0;\n}\nif (value < zMin){\nradius = bubbleZMin / 2.0 - 1.0;\n} else {\npos = zRange > 0.0 ? (value - zMin) / zRange : 0.5;\nif (bubbleSizeByArea && pos > 0.0){\npos = sqrt(pos);\n}\nradius = ceil(bubbleMinSize + pos * (bubbleMaxSize - bubbleMinSize)) / 2.0;\n}\nreturn radius * 2.0;\n}\nfloat translate(float val,\nfloat pointPlacement,\nfloat localA,\nfloat localMin,\nfloat minPixelPadding,\nfloat pointRange,\nfloat len,\nbool  cvsCoord,\nbool  isLog,\nbool  reversed\n){\nfloat sign = 1.0;\nfloat cvsOffset = 0.0;\nif (cvsCoord) {\nsign *= -1.0;\ncvsOffset = len;\n}\nif (isLog) {\nval = log(val) / LN10;\n}\nif (reversed) {\nsign *= -1.0;\ncvsOffset -= sign * len;\n}\nreturn sign * (val - localMin) * localA + cvsOffset + \n(sign * minPixelPadding);\n}\nfloat xToPixels(float value) {\nif (skipTranslation){\nreturn value;// + xAxisPos;\n}\nreturn translate(value, 0.0, xAxisTrans, xAxisMin, xAxisMinPad, xAxisPointRange, xAxisLen, xAxisCVSCoord, xAxisIsLog, xAxisReversed);// + xAxisPos;\n}\nfloat yToPixels(float value, float checkTreshold) {\nfloat v;\nif (skipTranslation){\nv = value;// + yAxisPos;\n} else {\nv = translate(value, 0.0, yAxisTrans, yAxisMin, yAxisMinPad, yAxisPointRange, yAxisLen, yAxisCVSCoord, yAxisIsLog, yAxisReversed);// + yAxisPos;\nif (v > yAxisLen) {\nv = yAxisLen;\n}\n}\nif (checkTreshold > 0.0 && hasThreshold) {\nv = min(v, translatedThreshold);\n}\nreturn v;\n}\nvoid main(void) {\nif (isBubble){\ngl_PointSize = bubbleRadius();\n} else {\ngl_PointSize = pSize;\n}\nvColor = aColor;\nif (skipTranslation && isInverted) {\ngl_Position = uPMatrix * vec4(aVertexPosition.y + yAxisPos, aVertexPosition.x + xAxisPos, 0.0, 1.0);\n} else if (isInverted) {\ngl_Position = uPMatrix * vec4(yToPixels(aVertexPosition.y, aVertexPosition.z) + yAxisPos, xToPixels(aVertexPosition.x) + xAxisPos, 0.0, 1.0);\n} else {\ngl_Position = uPMatrix * vec4(xToPixels(aVertexPosition.x) + xAxisPos, yToPixels(aVertexPosition.y, aVertexPosition.z) + yAxisPos, 0.0, 1.0);\n}\n}',
            'vertex'
          ),
          f = w(
            'precision highp float;\nuniform vec4 fillColor;\nvarying highp vec2 position;\nvarying highp vec4 vColor;\nuniform sampler2D uSampler;\nuniform bool isCircle;\nuniform bool hasColor;\nvoid main(void) {\nvec4 col = fillColor;\nvec4 tcol = texture2D(uSampler, gl_PointCoord.st);\nif (hasColor) {\ncol = vColor;\n}\nif (isCircle) {\ncol *= tcol;\nif (tcol.r < 0.0) {\ndiscard;\n} else {\ngl_FragColor = col;\n}\n} else {\ngl_FragColor = col;\n}\n}',
            'fragment'
          );
        if (!L || !f) return (h = !1), d(), !1;
        h = b.createProgram();
        b.attachShader(h, L);
        b.attachShader(h, f);
        b.linkProgram(h);
        if (!b.getProgramParameter(h, b.LINK_STATUS))
          return g.push(b.getProgramInfoLog(h)), d(), (h = !1);
        b.useProgram(h);
        b.bindAttribLocation(h, 0, 'aVertexPosition');
        e = a('uPMatrix');
        n = a('pSize');
        m = a('fillColor');
        P = a('isBubble');
        t = a('bubbleSizeAbs');
        k = a('bubbleSizeByArea');
        K = a('uSampler');
        G = a('skipTranslation');
        c = a('isCircle');
        u = a('isInverted');
        return !0;
      }
      function D(a, c) {
        b &&
          h &&
          ((a = y[a] = y[a] || b.getUniformLocation(h, a)), b.uniform1f(a, c));
      }
      var y = {},
        h,
        e,
        n,
        m,
        P,
        t,
        k,
        G,
        c,
        u,
        g = [],
        K;
      return b && !p()
        ? !1
        : {
            psUniform: function () {
              return n;
            },
            pUniform: function () {
              return e;
            },
            fillColorUniform: function () {
              return m;
            },
            setBubbleUniforms: function (a, g, f) {
              var u = a.options,
                e = Number.MAX_VALUE,
                d = -Number.MAX_VALUE;
              b &&
                h &&
                'bubble' === a.type &&
                ((e = l(
                  u.zMin,
                  x(
                    g,
                    !1 === u.displayNegative ? u.zThreshold : -Number.MAX_VALUE,
                    e
                  )
                )),
                (d = l(u.zMax, Math.max(d, f))),
                b.uniform1i(P, 1),
                b.uniform1i(c, 1),
                b.uniform1i(k, 'width' !== a.options.sizeBy),
                b.uniform1i(t, a.options.sizeByAbsoluteValue),
                D('bubbleZMin', e),
                D('bubbleZMax', d),
                D('bubbleZThreshold', a.options.zThreshold),
                D('bubbleMinSize', a.minPxSize),
                D('bubbleMaxSize', a.maxPxSize));
            },
            bind: function () {
              b && h && b.useProgram(h);
            },
            program: function () {
              return h;
            },
            create: p,
            setUniform: D,
            setPMatrix: function (a) {
              b && h && b.uniformMatrix4fv(e, !1, a);
            },
            setColor: function (a) {
              b &&
                h &&
                b.uniform4f(m, a[0] / 255, a[1] / 255, a[2] / 255, a[3]);
            },
            setPointSize: function (a) {
              b && h && b.uniform1f(n, a);
            },
            setSkipTranslation: function (a) {
              b && h && b.uniform1i(G, !0 === a ? 1 : 0);
            },
            setTexture: function (a) {
              b && h && b.uniform1i(K, a);
            },
            setDrawAsCircle: function (a) {
              b && h && b.uniform1i(c, a ? 1 : 0);
            },
            reset: function () {
              b && h && (b.uniform1i(P, 0), b.uniform1i(c, 0));
            },
            setInverted: function (a) {
              b && h && b.uniform1i(u, a);
            },
            destroy: function () {
              b && h && (b.deleteProgram(h), (h = !1));
            },
          };
    };
  });
  r(d, 'Extensions/Boost/WGLVBuffer.js', [], function () {
    return function (d, C, q) {
      function l() {
        b && (d.deleteBuffer(b), (x = b = !1));
        D = 0;
        w = q || 2;
        y = [];
      }
      var b = !1,
        x = !1,
        w = q || 2,
        p = !1,
        D = 0,
        y;
      return {
        destroy: l,
        bind: function () {
          if (!b) return !1;
          d.vertexAttribPointer(x, w, d.FLOAT, !1, 0, 0);
        },
        data: y,
        build: function (h, e, n) {
          var m;
          y = h || [];
          if (!((y && 0 !== y.length) || p)) return l(), !1;
          w = n || w;
          b && d.deleteBuffer(b);
          p || (m = new Float32Array(y));
          b = d.createBuffer();
          d.bindBuffer(d.ARRAY_BUFFER, b);
          d.bufferData(d.ARRAY_BUFFER, p || m, d.STATIC_DRAW);
          x = d.getAttribLocation(C.program(), e);
          d.enableVertexAttribArray(x);
          return !0;
        },
        render: function (h, e, n) {
          var m = p ? p.length : y.length;
          if (!b || !m) return !1;
          if (!h || h > m || 0 > h) h = 0;
          if (!e || e > m) e = m;
          d.drawArrays(d[(n || 'points').toUpperCase()], h / w, (e - h) / w);
          return !0;
        },
        allocate: function (d) {
          D = -1;
          p = new Float32Array(4 * d);
        },
        push: function (d, e, b, m) {
          p && ((p[++D] = d), (p[++D] = e), (p[++D] = b), (p[++D] = m));
        },
      };
    };
  });
  r(
    d,
    'Extensions/Boost/WGLRenderer.js',
    [
      d['Core/Color/Color.js'],
      d['Extensions/Boost/WGLShader.js'],
      d['Extensions/Boost/WGLVBuffer.js'],
      d['Core/Globals.js'],
      d['Core/Utilities.js'],
    ],
    function (d, C, q, l, b) {
      var x = d.parse,
        w = l.doc,
        p = b.isNumber,
        D = b.isObject,
        y = b.merge,
        h = b.objectEach,
        e = b.pick;
      return function (b) {
        function m(a) {
          if (a.isSeriesBoosting) {
            var c = !!a.options.stacking;
            var g = a.xData || a.options.xData || a.processedXData;
            c = (c ? a.data : g || a.options.data).length;
            'treemap' === a.type
              ? (c *= 12)
              : 'heatmap' === a.type
              ? (c *= 6)
              : ia[a.type] && (c *= 2);
            return c;
          }
          return 0;
        }
        function n() {
          f.clear(f.COLOR_BUFFER_BIT | f.DEPTH_BUFFER_BIT);
        }
        function t(a, c) {
          function g(a) {
            a &&
              (c.colorData.push(a[0]),
              c.colorData.push(a[1]),
              c.colorData.push(a[2]),
              c.colorData.push(a[3]));
          }
          function f(a, c, f, u, d) {
            g(d);
            z.usePreallocated
              ? L.push(a, c, f ? 1 : 0, u || 1)
              : (R.push(a), R.push(c), R.push(f ? 1 : 0), R.push(u || 1));
          }
          function u() {
            c.segments.length &&
              (c.segments[c.segments.length - 1].to = R.length);
          }
          function e() {
            (c.segments.length &&
              c.segments[c.segments.length - 1].from === R.length) ||
              (u(), c.segments.push({ from: R.length }));
          }
          function b(a, c, u, d, e) {
            g(e);
            f(a + u, c);
            g(e);
            f(a, c);
            g(e);
            f(a, c + d);
            g(e);
            f(a, c + d);
            g(e);
            f(a + u, c + d);
            g(e);
            f(a + u, c);
          }
          function K(a, g) {
            z.useGPUTranslations ||
              ((c.skipTranslation = !0),
              (a.x = G.toPixels(a.x, !0)),
              (a.y = P.toPixels(a.y, !0)));
            g ? (R = [a.x, a.y, 0, 2].concat(R)) : f(a.x, a.y, 0, 2);
          }
          var h = a.pointArrayMap && 'low,high' === a.pointArrayMap.join(','),
            n = a.chart,
            E = a.options,
            m = !!E.stacking,
            T = E.data,
            k = a.xAxis.getExtremes(),
            p = k.min;
          k = k.max;
          var l = a.yAxis.getExtremes(),
            X = l.min;
          l = l.max;
          var t = a.xData || E.xData || a.processedXData,
            y = a.yData || E.yData || a.processedYData,
            q = a.zData || E.zData || a.processedZData,
            P = a.yAxis,
            G = a.xAxis,
            B = a.chart.plotWidth,
            w = !t || 0 === t.length,
            C = E.connectNulls,
            v = a.points || !1,
            M = !1,
            r = !1,
            Q;
          t = m ? a.data : t || T;
          var I = { x: Number.MAX_VALUE, y: 0 },
            O = { x: -Number.MAX_VALUE, y: 0 },
            N = 0,
            Fa = !1,
            J = -1,
            Y = !1,
            fa = !1,
            Z = 'undefined' === typeof n.index,
            ya = !1,
            V = !1;
          var A = !1;
          var Ma = ia[a.type],
            za = !1,
            Ia = !0,
            Ba = !0,
            ma = E.zones || !1,
            ha = !1,
            Ga = E.threshold,
            Aa = !1;
          if (!(E.boostData && 0 < E.boostData.length)) {
            E.gapSize &&
              (Aa =
                'value' !== E.gapUnit
                  ? E.gapSize * a.closestPointRange
                  : E.gapSize);
            ma &&
              (ma.some(function (a) {
                return 'undefined' === typeof a.value
                  ? ((ha = new d(a.color)), !0)
                  : !1;
              }),
              ha ||
                ((ha = (a.pointAttribs && a.pointAttribs().fill) || a.color),
                (ha = new d(ha))));
            n.inverted && (B = a.chart.plotHeight);
            a.closestPointRangePx = Number.MAX_VALUE;
            e();
            if (v && 0 < v.length)
              (c.skipTranslation = !0),
                (c.drawMode = 'triangles'),
                v[0].node &&
                  v[0].node.levelDynamic &&
                  v.sort(function (a, c) {
                    if (a.node) {
                      if (a.node.levelDynamic > c.node.levelDynamic) return 1;
                      if (a.node.levelDynamic < c.node.levelDynamic) return -1;
                    }
                    return 0;
                  }),
                v.forEach(function (c) {
                  var g = c.plotY;
                  if ('undefined' !== typeof g && !isNaN(g) && null !== c.y) {
                    g = c.shapeArgs;
                    var f = n.styledMode
                      ? c.series.colorAttribs(c)
                      : (f = c.series.pointAttribs(c));
                    c = f['stroke-width'] || 0;
                    A = x(f.fill).rgba;
                    A[0] /= 255;
                    A[1] /= 255;
                    A[2] /= 255;
                    'treemap' === a.type &&
                      ((c = c || 1),
                      (Q = x(f.stroke).rgba),
                      (Q[0] /= 255),
                      (Q[1] /= 255),
                      (Q[2] /= 255),
                      b(g.x, g.y, g.width, g.height, Q),
                      (c /= 2));
                    'heatmap' === a.type &&
                      n.inverted &&
                      ((g.x = G.len - g.x),
                      (g.y = P.len - g.y),
                      (g.width = -g.width),
                      (g.height = -g.height));
                    b(g.x + c, g.y + c, g.width - 2 * c, g.height - 2 * c, A);
                  }
                });
            else {
              for (; J < t.length - 1; ) {
                var H = t[++J];
                if (Z) break;
                v = T && T[J];
                !w &&
                  D(v, !0) &&
                  v.color &&
                  ((A = x(v.color).rgba),
                  (A[0] /= 255),
                  (A[1] /= 255),
                  (A[2] /= 255));
                if (w) {
                  v = H[0];
                  var F = H[1];
                  t[J + 1] && (fa = t[J + 1][0]);
                  t[J - 1] && (Y = t[J - 1][0]);
                  if (3 <= H.length) {
                    var Ha = H[2];
                    H[2] > c.zMax && (c.zMax = H[2]);
                    H[2] < c.zMin && (c.zMin = H[2]);
                  }
                } else
                  (v = H),
                    (F = y[J]),
                    t[J + 1] && (fa = t[J + 1]),
                    t[J - 1] && (Y = t[J - 1]),
                    q &&
                      q.length &&
                      ((Ha = q[J]),
                      q[J] > c.zMax && (c.zMax = q[J]),
                      q[J] < c.zMin && (c.zMin = q[J]));
                if (C || (null !== v && null !== F)) {
                  fa && fa >= p && fa <= k && (ya = !0);
                  Y && Y >= p && Y <= k && (V = !0);
                  if (h) {
                    w && (F = H.slice(1, 3));
                    var sa = F[0];
                    F = F[1];
                  } else m && ((v = H.x), (F = H.stackY), (sa = F - H.y));
                  null !== X &&
                    'undefined' !== typeof X &&
                    null !== l &&
                    'undefined' !== typeof l &&
                    (Ia = F >= X && F <= l);
                  v > k && O.x < k && ((O.x = v), (O.y = F));
                  v < p && I.x > p && ((I.x = v), (I.y = F));
                  if (null !== F || !C)
                    if (null !== F && (Ia || ya || V)) {
                      if (
                        ((fa >= p || v >= p) && (Y <= k || v <= k) && (za = !0),
                        za || ya || V)
                      ) {
                        Aa && v - Y > Aa && e();
                        ma &&
                          ((A = ha.rgba),
                          ma.some(function (a, c) {
                            c = ma[c - 1];
                            if (
                              'undefined' !== typeof a.value &&
                              F <= a.value
                            ) {
                              if (!c || F >= c.value) A = x(a.color).rgba;
                              return !0;
                            }
                            return !1;
                          }),
                          (A[0] /= 255),
                          (A[1] /= 255),
                          (A[2] /= 255));
                        if (
                          !z.useGPUTranslations &&
                          ((c.skipTranslation = !0),
                          (v = G.toPixels(v, !0)),
                          (F = P.toPixels(F, !0)),
                          v > B && 'points' === c.drawMode)
                        )
                          continue;
                        if (Ma) {
                          H = sa;
                          if (!1 === sa || 'undefined' === typeof sa)
                            H = 0 > F ? F : 0;
                          h || m || (H = Math.max(null === Ga ? X : Ga, X));
                          z.useGPUTranslations || (H = P.toPixels(H, !0));
                          f(v, H, 0, 0, A);
                        }
                        c.hasMarkers &&
                          za &&
                          !1 !== M &&
                          (a.closestPointRangePx = Math.min(
                            a.closestPointRangePx,
                            Math.abs(v - M)
                          ));
                        !z.useGPUTranslations &&
                        !z.usePreallocated &&
                        M &&
                        1 > Math.abs(v - M) &&
                        r &&
                        1 > Math.abs(F - r)
                          ? z.debug.showSkipSummary && ++N
                          : (E.step && !Ba && f(v, r, 0, 2, A),
                            f(v, F, 0, 'bubble' === a.type ? Ha || 1 : 2, A),
                            (M = v),
                            (r = F),
                            (Fa = !0),
                            (Ba = !1));
                      }
                    } else e();
                } else e();
              }
              z.debug.showSkipSummary && console.log('skipped points:', N);
              Fa ||
                !1 === C ||
                'line_strip' !== a.drawMode ||
                (I.x < Number.MAX_VALUE && K(I, !0),
                O.x > -Number.MAX_VALUE && K(O));
            }
            u();
          }
        }
        function k() {
          I = [];
          r.data = R = [];
          Q = [];
          L && L.destroy();
        }
        function G(c) {
          a &&
            (a.setUniform('xAxisTrans', c.transA),
            a.setUniform('xAxisMin', c.min),
            a.setUniform('xAxisMinPad', c.minPixelPadding),
            a.setUniform('xAxisPointRange', c.pointRange),
            a.setUniform('xAxisLen', c.len),
            a.setUniform('xAxisPos', c.pos),
            a.setUniform('xAxisCVSCoord', !c.horiz),
            a.setUniform('xAxisIsLog', !!c.logarithmic),
            a.setUniform('xAxisReversed', !!c.reversed));
        }
        function c(c) {
          a &&
            (a.setUniform('yAxisTrans', c.transA),
            a.setUniform('yAxisMin', c.min),
            a.setUniform('yAxisMinPad', c.minPixelPadding),
            a.setUniform('yAxisPointRange', c.pointRange),
            a.setUniform('yAxisLen', c.len),
            a.setUniform('yAxisPos', c.pos),
            a.setUniform('yAxisCVSCoord', !c.horiz),
            a.setUniform('yAxisIsLog', !!c.logarithmic),
            a.setUniform('yAxisReversed', !!c.reversed));
        }
        function u(c, g) {
          a.setUniform('hasThreshold', c);
          a.setUniform('translatedThreshold', g);
        }
        function g(g) {
          if (g) (M = g.chartWidth || 800), (B = g.chartHeight || 400);
          else return !1;
          if (!(f && M && B && a)) return !1;
          z.debug.timeRendering && console.time('gl rendering');
          f.canvas.width = M;
          f.canvas.height = B;
          a.bind();
          f.viewport(0, 0, M, B);
          a.setPMatrix([
            2 / M,
            0,
            0,
            0,
            0,
            -(2 / B),
            0,
            0,
            0,
            0,
            -2,
            0,
            -1,
            1,
            -1,
            1,
          ]);
          1 < z.lineWidth && !l.isMS && f.lineWidth(z.lineWidth);
          L.build(r.data, 'aVertexPosition', 4);
          L.bind();
          a.setInverted(g.inverted);
          I.forEach(function (b, K) {
            var n = b.series.options,
              h = n.marker;
            var m = 'undefined' !== typeof n.lineWidth ? n.lineWidth : 1;
            var k = n.threshold,
              E = p(k),
              t = b.series.yAxis.getThreshold(k);
            k = e(
              n.marker ? n.marker.enabled : null,
              b.series.xAxis.isRadial ? !0 : null,
              b.series.closestPointRangePx >
                2 * ((n.marker ? n.marker.radius : 10) || 10)
            );
            h = V[(h && h.symbol) || b.series.symbol] || V.circle;
            if (
              !(
                0 === b.segments.length ||
                (b.segmentslength && b.segments[0].from === b.segments[0].to)
              )
            ) {
              h.isReady &&
                (f.bindTexture(f.TEXTURE_2D, h.handle), a.setTexture(h.handle));
              g.styledMode
                ? (h =
                    b.series.markerGroup &&
                    b.series.markerGroup.getStyle('fill'))
                : ((h =
                    (b.series.pointAttribs && b.series.pointAttribs().fill) ||
                    b.series.color),
                  n.colorByPoint && (h = b.series.chart.options.colors[K]));
              b.series.fillOpacity &&
                n.fillOpacity &&
                (h = new d(h).setOpacity(e(n.fillOpacity, 1)).get());
              h = x(h).rgba;
              z.useAlpha || (h[3] = 1);
              'lines' === b.drawMode && z.useAlpha && 1 > h[3] && (h[3] /= 10);
              'add' === n.boostBlending
                ? (f.blendFunc(f.SRC_ALPHA, f.ONE), f.blendEquation(f.FUNC_ADD))
                : 'mult' === n.boostBlending || 'multiply' === n.boostBlending
                ? f.blendFunc(f.DST_COLOR, f.ZERO)
                : 'darken' === n.boostBlending
                ? (f.blendFunc(f.ONE, f.ONE), f.blendEquation(f.FUNC_MIN))
                : f.blendFuncSeparate(
                    f.SRC_ALPHA,
                    f.ONE_MINUS_SRC_ALPHA,
                    f.ONE,
                    f.ONE_MINUS_SRC_ALPHA
                  );
              a.reset();
              0 < b.colorData.length &&
                (a.setUniform('hasColor', 1),
                (K = q(f, a)),
                K.build(b.colorData, 'aColor', 4),
                K.bind());
              a.setColor(h);
              G(b.series.xAxis);
              c(b.series.yAxis);
              u(E, t);
              'points' === b.drawMode &&
                (n.marker && p(n.marker.radius)
                  ? a.setPointSize(2 * n.marker.radius)
                  : a.setPointSize(1));
              a.setSkipTranslation(b.skipTranslation);
              'bubble' === b.series.type &&
                a.setBubbleUniforms(b.series, b.zMin, b.zMax);
              a.setDrawAsCircle(Z[b.series.type] || !1);
              if (0 < m || 'line_strip' !== b.drawMode)
                for (m = 0; m < b.segments.length; m++)
                  L.render(b.segments[m].from, b.segments[m].to, b.drawMode);
              if (b.hasMarkers && k)
                for (
                  n.marker && p(n.marker.radius)
                    ? a.setPointSize(2 * n.marker.radius)
                    : a.setPointSize(10),
                    a.setDrawAsCircle(!0),
                    m = 0;
                  m < b.segments.length;
                  m++
                )
                  L.render(b.segments[m].from, b.segments[m].to, 'POINTS');
            }
          });
          z.debug.timeRendering && console.timeEnd('gl rendering');
          b && b();
          k();
        }
        function K(a) {
          n();
          if (a.renderer.forExport) return g(a);
          O
            ? g(a)
            : setTimeout(function () {
                K(a);
              }, 1);
        }
        var a = !1,
          L = !1,
          f = !1,
          M = 0,
          B = 0,
          R = !1,
          Q = !1,
          r = {},
          O = !1,
          I = [],
          V = {},
          ia = {
            column: !0,
            columnrange: !0,
            bar: !0,
            area: !0,
            arearange: !0,
          },
          Z = { scatter: !0, bubble: !0 },
          z = {
            pointSize: 1,
            lineWidth: 1,
            fillColor: '#AA00AA',
            useAlpha: !0,
            usePreallocated: !1,
            useGPUTranslations: !1,
            debug: {
              timeRendering: !1,
              timeSeriesProcessing: !1,
              timeSetup: !1,
              timeBufferCopy: !1,
              timeKDTree: !1,
              showSkipSummary: !1,
            },
          };
        return (r = {
          allocateBufferForSingleSeries: function (a) {
            var c = 0;
            z.usePreallocated &&
              (a.isSeriesBoosting && (c = m(a)), L.allocate(c));
          },
          pushSeries: function (a) {
            0 < I.length &&
              I[I.length - 1].hasMarkers &&
              (I[I.length - 1].markerTo = Q.length);
            z.debug.timeSeriesProcessing &&
              console.time('building ' + a.type + ' series');
            I.push({
              segments: [],
              markerFrom: Q.length,
              colorData: [],
              series: a,
              zMin: Number.MAX_VALUE,
              zMax: -Number.MAX_VALUE,
              hasMarkers: a.options.marker
                ? !1 !== a.options.marker.enabled
                : !1,
              showMarkers: !0,
              drawMode:
                {
                  area: 'lines',
                  arearange: 'lines',
                  areaspline: 'line_strip',
                  column: 'lines',
                  columnrange: 'lines',
                  bar: 'lines',
                  line: 'line_strip',
                  scatter: 'points',
                  heatmap: 'triangles',
                  treemap: 'triangles',
                  bubble: 'points',
                }[a.type] || 'line_strip',
            });
            t(a, I[I.length - 1]);
            z.debug.timeSeriesProcessing &&
              console.timeEnd('building ' + a.type + ' series');
          },
          setSize: function (c, g) {
            (M === c && B === g) ||
              !a ||
              ((M = c),
              (B = g),
              a.bind(),
              a.setPMatrix([
                2 / M,
                0,
                0,
                0,
                0,
                -(2 / B),
                0,
                0,
                0,
                0,
                -2,
                0,
                -1,
                1,
                -1,
                1,
              ]));
          },
          inited: function () {
            return O;
          },
          setThreshold: u,
          init: function (c, g) {
            function b(a, c) {
              var g = {
                  isReady: !1,
                  texture: w.createElement('canvas'),
                  handle: f.createTexture(),
                },
                b = g.texture.getContext('2d');
              V[a] = g;
              g.texture.width = 512;
              g.texture.height = 512;
              b.mozImageSmoothingEnabled = !1;
              b.webkitImageSmoothingEnabled = !1;
              b.msImageSmoothingEnabled = !1;
              b.imageSmoothingEnabled = !1;
              b.strokeStyle = 'rgba(255, 255, 255, 0)';
              b.fillStyle = '#FFF';
              c(b);
              try {
                f.activeTexture(f.TEXTURE0),
                  f.bindTexture(f.TEXTURE_2D, g.handle),
                  f.texImage2D(
                    f.TEXTURE_2D,
                    0,
                    f.RGBA,
                    f.RGBA,
                    f.UNSIGNED_BYTE,
                    g.texture
                  ),
                  f.texParameteri(
                    f.TEXTURE_2D,
                    f.TEXTURE_WRAP_S,
                    f.CLAMP_TO_EDGE
                  ),
                  f.texParameteri(
                    f.TEXTURE_2D,
                    f.TEXTURE_WRAP_T,
                    f.CLAMP_TO_EDGE
                  ),
                  f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MAG_FILTER, f.LINEAR),
                  f.texParameteri(f.TEXTURE_2D, f.TEXTURE_MIN_FILTER, f.LINEAR),
                  f.bindTexture(f.TEXTURE_2D, null),
                  (g.isReady = !0);
              } catch (U) {}
            }
            var u = 0,
              d = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
            O = !1;
            if (!c) return !1;
            for (
              z.debug.timeSetup && console.time('gl setup');
              u < d.length && !(f = c.getContext(d[u], {}));
              u++
            );
            if (f) g || k();
            else return !1;
            f.enable(f.BLEND);
            f.blendFunc(f.SRC_ALPHA, f.ONE_MINUS_SRC_ALPHA);
            f.disable(f.DEPTH_TEST);
            f.depthFunc(f.LESS);
            a = C(f);
            if (!a) return !1;
            L = q(f, a);
            b('circle', function (a) {
              a.beginPath();
              a.arc(256, 256, 256, 0, 2 * Math.PI);
              a.stroke();
              a.fill();
            });
            b('square', function (a) {
              a.fillRect(0, 0, 512, 512);
            });
            b('diamond', function (a) {
              a.beginPath();
              a.moveTo(256, 0);
              a.lineTo(512, 256);
              a.lineTo(256, 512);
              a.lineTo(0, 256);
              a.lineTo(256, 0);
              a.fill();
            });
            b('triangle', function (a) {
              a.beginPath();
              a.moveTo(0, 512);
              a.lineTo(256, 0);
              a.lineTo(512, 512);
              a.lineTo(0, 512);
              a.fill();
            });
            b('triangle-down', function (a) {
              a.beginPath();
              a.moveTo(0, 0);
              a.lineTo(256, 512);
              a.lineTo(512, 0);
              a.lineTo(0, 0);
              a.fill();
            });
            O = !0;
            z.debug.timeSetup && console.timeEnd('gl setup');
            return !0;
          },
          render: K,
          settings: z,
          valid: function () {
            return !1 !== f;
          },
          clear: n,
          flush: k,
          setXAxis: G,
          setYAxis: c,
          data: R,
          gl: function () {
            return f;
          },
          allocateBuffer: function (a) {
            var c = 0;
            z.usePreallocated &&
              (a.series.forEach(function (a) {
                a.isSeriesBoosting && (c += m(a));
              }),
              L.allocate(c));
          },
          destroy: function () {
            k();
            L.destroy();
            a.destroy();
            f &&
              (h(V, function (a) {
                a.handle && f.deleteTexture(a.handle);
              }),
              (f.canvas.width = 1),
              (f.canvas.height = 1));
          },
          setOptions: function (a) {
            y(!0, z, a);
          },
        });
      };
    }
  );
  r(
    d,
    'Extensions/Boost/BoostAttach.js',
    [
      d['Core/Chart/Chart.js'],
      d['Extensions/Boost/WGLRenderer.js'],
      d['Core/Globals.js'],
      d['Core/Utilities.js'],
    ],
    function (d, C, q, l) {
      var b = q.doc,
        x = l.error,
        w = b.createElement('canvas');
      return function (p, l) {
        var q = p.chartWidth,
          h = p.chartHeight,
          e = p,
          n = p.seriesGroup || l.group,
          m = b.implementation.hasFeature(
            'www.http://w3.org/TR/SVG11/feature#Extensibility',
            '1.1'
          );
        e = p.isChartSeriesBoosting() ? p : l;
        m = !1;
        e.renderTarget ||
          ((e.canvas = w),
          p.renderer.forExport || !m
            ? ((e.renderTarget = p.renderer
                .image('', 0, 0, q, h)
                .addClass('highcharts-boost-canvas')
                .add(n)),
              (e.boostClear = function () {
                e.renderTarget.attr({ href: '' });
              }),
              (e.boostCopy = function () {
                e.boostResizeTarget();
                e.renderTarget.attr({ href: e.canvas.toDataURL('image/png') });
              }))
            : ((e.renderTargetFo = p.renderer
                .createElement('foreignObject')
                .add(n)),
              (e.renderTarget = b.createElement('canvas')),
              (e.renderTargetCtx = e.renderTarget.getContext('2d')),
              e.renderTargetFo.element.appendChild(e.renderTarget),
              (e.boostClear = function () {
                e.renderTarget.width = e.canvas.width;
                e.renderTarget.height = e.canvas.height;
              }),
              (e.boostCopy = function () {
                e.renderTarget.width = e.canvas.width;
                e.renderTarget.height = e.canvas.height;
                e.renderTargetCtx.drawImage(e.canvas, 0, 0);
              })),
          (e.boostResizeTarget = function () {
            q = p.chartWidth;
            h = p.chartHeight;
            (e.renderTargetFo || e.renderTarget)
              .attr({ x: 0, y: 0, width: q, height: h })
              .css({
                pointerEvents: 'none',
                mixedBlendMode: 'normal',
                opacity: 1,
              });
            e instanceof d && e.markerGroup.translate(p.plotLeft, p.plotTop);
          }),
          (e.boostClipRect = p.renderer.clipRect()),
          (e.renderTargetFo || e.renderTarget).clip(e.boostClipRect),
          e instanceof d &&
            ((e.markerGroup = e.renderer.g().add(n)),
            e.markerGroup.translate(l.xAxis.pos, l.yAxis.pos)));
        e.canvas.width = q;
        e.canvas.height = h;
        e.boostClipRect.attr(p.getBoostClipRect(e));
        e.boostResizeTarget();
        e.boostClear();
        e.ogl ||
          ((e.ogl = C(function () {
            e.ogl.settings.debug.timeBufferCopy && console.time('buffer copy');
            e.boostCopy();
            e.ogl.settings.debug.timeBufferCopy &&
              console.timeEnd('buffer copy');
          })),
          e.ogl.init(e.canvas) ||
            x('[highcharts boost] - unable to init WebGL renderer'),
          e.ogl.setOptions(p.options.boost || {}),
          e instanceof d && e.ogl.allocateBuffer(p));
        e.ogl.setSize(q, h);
        return e.ogl;
      };
    }
  );
  r(
    d,
    'Extensions/Boost/BoostUtils.js',
    [
      d['Core/Globals.js'],
      d['Extensions/Boost/BoostableMap.js'],
      d['Extensions/Boost/BoostAttach.js'],
      d['Core/Utilities.js'],
    ],
    function (d, C, q, l) {
      function b() {
        for (var b = [], d = 0; d < arguments.length; d++) b[d] = arguments[d];
        var e = -Number.MAX_VALUE;
        b.forEach(function (b) {
          if (
            'undefined' !== typeof b &&
            null !== b &&
            'undefined' !== typeof b.length &&
            0 < b.length
          )
            return (e = b.length), !0;
        });
        return e;
      }
      function x(b, d, e) {
        b &&
          d.renderTarget &&
          d.canvas &&
          !(e || d.chart).isChartSeriesBoosting() &&
          b.render(e || d.chart);
      }
      function w(b, d) {
        b &&
          d.renderTarget &&
          d.canvas &&
          !d.chart.isChartSeriesBoosting() &&
          b.allocateBufferForSingleSeries(d);
      }
      function p(b, d, e, h, k, l) {
        k = k || 0;
        h = h || 3e3;
        for (var c = k + h, u = !0; u && k < c && k < b.length; )
          (u = d(b[k], k)), ++k;
        u &&
          (k < b.length
            ? l
              ? p(b, d, e, h, k, l)
              : y.requestAnimationFrame
              ? y.requestAnimationFrame(function () {
                  p(b, d, e, h, k);
                })
              : setTimeout(function () {
                  p(b, d, e, h, k);
                })
            : e && e());
      }
      function r() {
        var b = 0,
          d,
          e = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'],
          p = !1;
        if ('undefined' !== typeof y.WebGLRenderingContext)
          for (d = h.createElement('canvas'); b < e.length; b++)
            try {
              if (
                ((p = d.getContext(e[b])),
                'undefined' !== typeof p && null !== p)
              )
                return !0;
            } catch (k) {}
        return !1;
      }
      var y = d.win,
        h = d.doc,
        e = l.pick;
      l = {
        patientMax: b,
        boostEnabled: function (b) {
          return e(
            b && b.options && b.options.boost && b.options.boost.enabled,
            !0
          );
        },
        shouldForceChartSeriesBoosting: function (d) {
          var h = 0,
            p = 0,
            n = e(d.options.boost && d.options.boost.allowForce, !0);
          if ('undefined' !== typeof d.boostForceChartBoost)
            return d.boostForceChartBoost;
          if (1 < d.series.length)
            for (var k = 0; k < d.series.length; k++) {
              var l = d.series[k];
              0 !== l.options.boostThreshold &&
                !1 !== l.visible &&
                'heatmap' !== l.type &&
                (C[l.type] && ++p,
                b(l.processedXData, l.options.data, l.points) >=
                  (l.options.boostThreshold || Number.MAX_VALUE) && ++h);
            }
          d.boostForceChartBoost =
            n && ((p === d.series.length && 0 < h) || 5 < h);
          return d.boostForceChartBoost;
        },
        renderIfNotSeriesBoosting: x,
        allocateIfNotSeriesBoosting: w,
        eachAsync: p,
        hasWebGLSupport: r,
        pointDrawHandler: function (b) {
          var d = !0;
          this.chart.options &&
            this.chart.options.boost &&
            (d =
              'undefined' === typeof this.chart.options.boost.enabled
                ? !0
                : this.chart.options.boost.enabled);
          if (!d || !this.isSeriesBoosting) return b.call(this);
          this.chart.isBoosting = !0;
          if ((b = q(this.chart, this))) w(b, this), b.pushSeries(this);
          x(b, this);
        },
      };
      d.hasWebGLSupport = r;
      return l;
    }
  );
  r(
    d,
    'Extensions/Boost/BoostInit.js',
    [
      d['Core/Chart/Chart.js'],
      d['Core/Globals.js'],
      d['Core/Utilities.js'],
      d['Extensions/Boost/BoostUtils.js'],
      d['Extensions/Boost/BoostAttach.js'],
    ],
    function (d, r, q, l, b) {
      var x = q.addEvent,
        w = q.extend,
        p = q.fireEvent,
        C = q.wrap,
        y = r.Series,
        h = r.seriesTypes,
        e = function () {},
        n = l.eachAsync,
        m = l.pointDrawHandler,
        P = l.allocateIfNotSeriesBoosting,
        t = l.renderIfNotSeriesBoosting,
        k = l.shouldForceChartSeriesBoosting,
        G;
      return function () {
        w(y.prototype, {
          renderCanvas: function () {
            function c(a, c) {
              var b = !1,
                g = 'undefined' === typeof k.index,
                d = !0;
              if (!g) {
                if (ka) {
                  var u = a[0];
                  var e = a[1];
                } else (u = a), (e = q[c]);
                aa
                  ? (ka && (e = a.slice(1, 3)), (b = e[0]), (e = e[1]))
                  : ja && ((u = a.x), (e = a.stackY), (b = e - a.y));
                ta || (d = e >= C && e <= y);
                if (null !== e && u >= r && u <= w && d)
                  if (((a = f.toPixels(u, !0)), z)) {
                    if ('undefined' === typeof U || a === D) {
                      aa || (b = e);
                      if ('undefined' === typeof da || e > ca)
                        (ca = e), (da = c);
                      if ('undefined' === typeof U || b < S) (S = b), (U = c);
                    }
                    a !== D &&
                      ('undefined' !== typeof U &&
                        ((e = l.toPixels(ca, !0)),
                        (T = l.toPixels(S, !0)),
                        ea(a, e, da),
                        T !== e && ea(a, T, U)),
                      (U = da = void 0),
                      (D = a));
                  } else (e = Math.ceil(l.toPixels(e, !0))), ea(a, e, c);
              }
              return !g;
            }
            function d() {
              p(g, 'renderedCanvas');
              delete g.buildKDTree;
              g.buildKDTree();
              qa.debug.timeKDTree && console.timeEnd('kd tree building');
            }
            var g = this,
              h = g.options || {},
              a = !1,
              k = g.chart,
              f = this.xAxis,
              l = this.yAxis,
              m = h.xData || g.processedXData,
              q = h.yData || g.processedYData,
              x = h.data;
            a = f.getExtremes();
            var r = a.min,
              w = a.max;
            a = l.getExtremes();
            var C = a.min,
              y = a.max,
              B = {},
              D,
              z = !!g.sampling,
              E = !1 !== h.enableMouseTracking,
              T = l.getThreshold(h.threshold),
              aa = g.pointArrayMap && 'low,high' === g.pointArrayMap.join(','),
              ja = !!h.stacking,
              na = g.cropStart || 0,
              ta = g.requireSorting,
              ka = !m,
              S,
              ca,
              U,
              da,
              pa = 'x' === h.findNearestPointBy,
              la =
                this.xData || this.options.xData || this.processedXData || !1,
              ea = function (a, c, b) {
                a = Math.ceil(a);
                G = pa ? a : a + ',' + c;
                E &&
                  !B[G] &&
                  ((B[G] = !0),
                  k.inverted && ((a = f.len - a), (c = l.len - c)),
                  ra.push({
                    x: la ? la[na + b] : !1,
                    clientX: a,
                    plotX: a,
                    plotY: c,
                    i: na + b,
                  }));
              };
            a = b(k, g);
            k.isBoosting = !0;
            var qa = a.settings;
            if (this.visible) {
              (this.points || this.graph) && this.destroyGraphics();
              k.isChartSeriesBoosting()
                ? (this.markerGroup &&
                    this.markerGroup !== k.markerGroup &&
                    this.markerGroup.destroy(),
                  (this.markerGroup = k.markerGroup),
                  this.renderTarget &&
                    (this.renderTarget = this.renderTarget.destroy()))
                : (this.markerGroup === k.markerGroup &&
                    (this.markerGroup = void 0),
                  (this.markerGroup = g.plotGroup(
                    'markerGroup',
                    'markers',
                    !0,
                    1,
                    k.seriesGroup
                  )));
              var ra = (this.points = []);
              g.buildKDTree = e;
              a && (P(a, this), a.pushSeries(g), t(a, this, k));
              k.renderer.forExport ||
                (qa.debug.timeKDTree && console.time('kd tree building'),
                n(ja ? g.data : m || x, c, d));
            }
          },
        });
        ['heatmap', 'treemap'].forEach(function (c) {
          h[c] && C(h[c].prototype, 'drawPoints', m);
        });
        h.bubble &&
          (delete h.bubble.prototype.buildKDTree,
          C(h.bubble.prototype, 'markerAttribs', function (c) {
            return this.isSeriesBoosting
              ? !1
              : c.apply(this, [].slice.call(arguments, 1));
          }));
        h.scatter.prototype.fill = !0;
        w(h.area.prototype, { fill: !0, fillOpacity: !0, sampling: !0 });
        w(h.column.prototype, { fill: !0, sampling: !0 });
        d.prototype.callbacks.push(function (c) {
          x(c, 'predraw', function () {
            c.boostForceChartBoost = void 0;
            c.boostForceChartBoost = k(c);
            c.isBoosting = !1;
            !c.isChartSeriesBoosting() && c.didBoost && (c.didBoost = !1);
            c.boostClear && c.boostClear();
            c.canvas &&
              c.ogl &&
              c.isChartSeriesBoosting() &&
              ((c.didBoost = !0), c.ogl.allocateBuffer(c));
            c.markerGroup &&
              c.xAxis &&
              0 < c.xAxis.length &&
              c.yAxis &&
              0 < c.yAxis.length &&
              c.markerGroup.translate(c.xAxis[0].pos, c.yAxis[0].pos);
          });
          x(c, 'render', function () {
            c.ogl && c.isChartSeriesBoosting() && c.ogl.render(c);
          });
        });
      };
    }
  );
  r(
    d,
    'Extensions/BoostCanvas.js',
    [
      d['Core/Chart/Chart.js'],
      d['Core/Color/Color.js'],
      d['Core/Globals.js'],
      d['Series/LineSeries.js'],
      d['Core/Series/Series.js'],
      d['Core/Utilities.js'],
    ],
    function (d, r, q, l, b, B) {
      var x = r.parse,
        p = q.doc,
        C = q.noop,
        y = B.addEvent,
        h = B.extend,
        e = B.fireEvent,
        n = B.isNumber,
        m = B.merge,
        P = B.pick,
        t = B.wrap,
        k = b.seriesTypes,
        G;
      return function () {
        q.seriesTypes.heatmap &&
          t(q.seriesTypes.heatmap.prototype, 'drawPoints', function () {
            var c = this.chart,
              b = this.getContext(),
              g = this.chart.inverted,
              d = this.xAxis,
              a = this.yAxis;
            b
              ? (this.points.forEach(function (e) {
                  var f = e.plotY;
                  'undefined' === typeof f ||
                    isNaN(f) ||
                    null === e.y ||
                    ((f = e.shapeArgs),
                    (e = c.styledMode
                      ? e.series.colorAttribs(e)
                      : e.series.pointAttribs(e)),
                    (b.fillStyle = e.fill),
                    g
                      ? b.fillRect(
                          a.len - f.y + d.left,
                          d.len - f.x + a.top,
                          -f.height,
                          -f.width
                        )
                      : b.fillRect(
                          f.x + d.left,
                          f.y + a.top,
                          f.width,
                          f.height
                        ));
                }),
                this.canvasToSVG())
              : this.chart.showLoading(
                  "Your browser doesn't support HTML5 canvas, <br>please use a modern browser"
                );
          });
        h(l.prototype, {
          getContext: function () {
            var c = this.chart,
              b = c.chartWidth,
              g = c.chartHeight,
              d = c.seriesGroup || this.group,
              a = this,
              e = function (a, c, b, g, d, e, f) {
                a.call(this, b, c, g, d, e, f);
              };
            c.isChartSeriesBoosting() && ((a = c), (d = c.seriesGroup));
            var f = a.ctx;
            a.canvas ||
              ((a.canvas = p.createElement('canvas')),
              (a.renderTarget = c.renderer
                .image('', 0, 0, b, g)
                .addClass('highcharts-boost-canvas')
                .add(d)),
              (a.ctx = f = a.canvas.getContext('2d')),
              c.inverted &&
                ['moveTo', 'lineTo', 'rect', 'arc'].forEach(function (a) {
                  t(f, a, e);
                }),
              (a.boostCopy = function () {
                a.renderTarget.attr({ href: a.canvas.toDataURL('image/png') });
              }),
              (a.boostClear = function () {
                f.clearRect(0, 0, a.canvas.width, a.canvas.height);
                a === this && a.renderTarget.attr({ href: '' });
              }),
              (a.boostClipRect = c.renderer.clipRect()),
              a.renderTarget.clip(a.boostClipRect));
            a.canvas.width !== b && (a.canvas.width = b);
            a.canvas.height !== g && (a.canvas.height = g);
            a.renderTarget.attr({
              x: 0,
              y: 0,
              width: b,
              height: g,
              style: 'pointer-events: none',
              href: '',
            });
            a.boostClipRect.attr(c.getBoostClipRect(a));
            return f;
          },
          canvasToSVG: function () {
            this.chart.isChartSeriesBoosting()
              ? this.boostClear && this.boostClear()
              : (this.boostCopy || this.chart.boostCopy) &&
                (this.boostCopy || this.chart.boostCopy)();
          },
          cvsLineTo: function (c, b, g) {
            c.lineTo(b, g);
          },
          renderCanvas: function () {
            var c = this,
              b = c.options,
              g = c.chart,
              d = this.xAxis,
              a = this.yAxis,
              k = (g.options.boost || {}).timeRendering || !1,
              f = 0,
              l = c.processedXData,
              p = c.processedYData,
              w = b.data,
              t = d.getExtremes(),
              D = t.min,
              O = t.max;
            t = a.getExtremes();
            var I = t.min,
              V = t.max,
              ia = {},
              Z,
              z = !!c.sampling,
              E = b.marker && b.marker.radius,
              T = this.cvsDrawPoint,
              aa = b.lineWidth ? this.cvsLineTo : void 0,
              ja = E && 1 >= E ? this.cvsMarkerSquare : this.cvsMarkerCircle,
              na = this.cvsStrokeBatch || 1e3,
              ta = !1 !== b.enableMouseTracking,
              ka;
            t = b.threshold;
            var S = a.getThreshold(t),
              ca = n(t),
              U = S,
              da = this.fill,
              pa = c.pointArrayMap && 'low,high' === c.pointArrayMap.join(','),
              la = !!b.stacking,
              ea = c.cropStart || 0;
            t = g.options.loading;
            var qa = c.requireSorting,
              ra,
              X = b.connectNulls,
              Ca = !l,
              ua,
              va,
              ba,
              oa,
              wa,
              W = la ? c.data : l || w,
              Ja = c.fillOpacity
                ? new r(c.color).setOpacity(P(b.fillOpacity, 0.75)).get()
                : c.color,
              v = function () {
                da
                  ? ((N.fillStyle = Ja), N.fill())
                  : ((N.strokeStyle = c.color),
                    (N.lineWidth = b.lineWidth),
                    N.stroke());
              },
              Da = function (a, b, d, e) {
                0 === f && (N.beginPath(), aa && (N.lineJoin = 'round'));
                g.scroller &&
                'highcharts-navigator-series' === c.options.className
                  ? ((b += g.scroller.top), d && (d += g.scroller.top))
                  : (b += g.plotTop);
                a += g.plotLeft;
                ra
                  ? N.moveTo(a, b)
                  : T
                  ? T(N, a, b, d, ka)
                  : aa
                  ? aa(N, a, b)
                  : ja && ja.call(c, N, a, b, E, e);
                f += 1;
                f === na && (v(), (f = 0));
                ka = { clientX: a, plotY: b, yBottom: d };
              },
              Ka = 'x' === b.findNearestPointBy,
              Ea =
                this.xData || this.options.xData || this.processedXData || !1,
              xa = function (c, b, e) {
                wa = Ka ? c : c + ',' + b;
                ta &&
                  !ia[wa] &&
                  ((ia[wa] = !0),
                  g.inverted && ((c = d.len - c), (b = a.len - b)),
                  La.push({
                    x: Ea ? Ea[ea + e] : !1,
                    clientX: c,
                    plotX: c,
                    plotY: b,
                    i: ea + e,
                  }));
              };
            this.renderTarget && this.renderTarget.attr({ href: '' });
            (this.points || this.graph) && this.destroyGraphics();
            c.plotGroup(
              'group',
              'series',
              c.visible ? 'visible' : 'hidden',
              b.zIndex,
              g.seriesGroup
            );
            c.markerGroup = c.group;
            y(c, 'destroy', function () {
              c.markerGroup = null;
            });
            var La = (this.points = []);
            var N = this.getContext();
            c.buildKDTree = C;
            this.boostClear && this.boostClear();
            this.visible &&
              (99999 < w.length &&
                ((g.options.loading = m(t, {
                  labelStyle: {
                    backgroundColor: x('#ffffff').setOpacity(0.75).get(),
                    padding: '1em',
                    borderRadius: '0.5em',
                  },
                  style: { backgroundColor: 'none', opacity: 1 },
                })),
                B.clearTimeout(G),
                g.showLoading('Drawing...'),
                (g.options.loading = t)),
              k && console.time('canvas rendering'),
              q.eachAsync(
                W,
                function (b, e) {
                  var f = !1,
                    u = !1,
                    h = !1,
                    k = !1,
                    l = 'undefined' === typeof g.index,
                    K = !0;
                  if (!l) {
                    if (Ca) {
                      var n = b[0];
                      var m = b[1];
                      W[e + 1] && (h = W[e + 1][0]);
                      W[e - 1] && (k = W[e - 1][0]);
                    } else
                      (n = b),
                        (m = p[e]),
                        W[e + 1] && (h = W[e + 1]),
                        W[e - 1] && (k = W[e - 1]);
                    h && h >= D && h <= O && (f = !0);
                    k && k >= D && k <= O && (u = !0);
                    if (pa) {
                      Ca && (m = b.slice(1, 3));
                      var q = m[0];
                      m = m[1];
                    } else la && ((n = b.x), (m = b.stackY), (q = m - b.y));
                    b = null === m;
                    qa || (K = m >= I && m <= V);
                    if (!b && ((n >= D && n <= O && K) || f || u))
                      if (((n = Math.round(d.toPixels(n, !0))), z)) {
                        if ('undefined' === typeof ba || n === Z) {
                          pa || (q = m);
                          if ('undefined' === typeof oa || m > va)
                            (va = m), (oa = e);
                          if ('undefined' === typeof ba || q < ua)
                            (ua = q), (ba = e);
                        }
                        n !== Z &&
                          ('undefined' !== typeof ba &&
                            ((m = a.toPixels(va, !0)),
                            (S = a.toPixels(ua, !0)),
                            Da(
                              n,
                              ca ? Math.min(m, U) : m,
                              ca ? Math.max(S, U) : S,
                              e
                            ),
                            xa(n, m, oa),
                            S !== m && xa(n, S, ba)),
                          (ba = oa = void 0),
                          (Z = n));
                      } else
                        (m = Math.round(a.toPixels(m, !0))),
                          Da(n, m, S, e),
                          xa(n, m, e);
                    ra = b && !X;
                    0 === e % 5e4 &&
                      (c.boostCopy || c.chart.boostCopy) &&
                      (c.boostCopy || c.chart.boostCopy)();
                  }
                  return !l;
                },
                function () {
                  var a = g.loadingDiv,
                    b = g.loadingShown;
                  v();
                  c.canvasToSVG();
                  k && console.timeEnd('canvas rendering');
                  e(c, 'renderedCanvas');
                  b &&
                    (h(a.style, { transition: 'opacity 250ms', opacity: 0 }),
                    (g.loadingShown = !1),
                    (G = setTimeout(function () {
                      a.parentNode && a.parentNode.removeChild(a);
                      g.loadingDiv = g.loadingSpan = null;
                    }, 250)));
                  delete c.buildKDTree;
                  c.buildKDTree();
                },
                g.renderer.forExport ? Number.MAX_VALUE : void 0
              ));
          },
        });
        k.scatter.prototype.cvsMarkerCircle = function (c, b, d, e) {
          c.moveTo(b, d);
          c.arc(b, d, e, 0, 2 * Math.PI, !1);
        };
        k.scatter.prototype.cvsMarkerSquare = function (c, b, d, e) {
          c.rect(b - e, d - e, 2 * e, 2 * e);
        };
        k.scatter.prototype.fill = !0;
        k.bubble &&
          ((k.bubble.prototype.cvsMarkerCircle = function (c, b, d, e, a) {
            c.moveTo(b, d);
            c.arc(b, d, this.radii && this.radii[a], 0, 2 * Math.PI, !1);
          }),
          (k.bubble.prototype.cvsStrokeBatch = 1));
        h(k.area.prototype, {
          cvsDrawPoint: function (c, b, d, e, a) {
            a &&
              b !== a.clientX &&
              (c.moveTo(a.clientX, a.yBottom),
              c.lineTo(a.clientX, a.plotY),
              c.lineTo(b, d),
              c.lineTo(b, e));
          },
          fill: !0,
          fillOpacity: !0,
          sampling: !0,
        });
        h(k.column.prototype, {
          cvsDrawPoint: function (c, b, d, e) {
            c.rect(b - 1, d, 1, e - d);
          },
          fill: !0,
          sampling: !0,
        });
        d.prototype.callbacks.push(function (b) {
          y(b, 'predraw', function () {
            b.renderTarget && b.renderTarget.attr({ href: '' });
            b.canvas &&
              b.canvas
                .getContext('2d')
                .clearRect(0, 0, b.canvas.width, b.canvas.height);
          });
          y(b, 'render', function () {
            b.boostCopy && b.boostCopy();
          });
        });
      };
    }
  );
  r(
    d,
    'Extensions/Boost/BoostOverrides.js',
    [
      d['Core/Chart/Chart.js'],
      d['Core/Globals.js'],
      d['Core/Series/Point.js'],
      d['Core/Utilities.js'],
      d['Extensions/Boost/BoostUtils.js'],
      d['Extensions/Boost/Boostables.js'],
      d['Extensions/Boost/BoostableMap.js'],
    ],
    function (d, r, q, l, b, B, w) {
      var p = l.addEvent,
        x = l.error,
        y = l.getOptions,
        h = l.isArray,
        e = l.isNumber,
        n = l.pick,
        m = l.wrap,
        C = b.boostEnabled,
        t = b.shouldForceChartSeriesBoosting,
        k = r.Series,
        G = r.seriesTypes,
        c = y().plotOptions;
      d.prototype.isChartSeriesBoosting = function () {
        return (
          n(this.options.boost && this.options.boost.seriesThreshold, 50) <=
            this.series.length || t(this)
        );
      };
      d.prototype.getBoostClipRect = function (b) {
        var c = {
          x: this.plotLeft,
          y: this.plotTop,
          width: this.plotWidth,
          height: this.plotHeight,
        };
        b === this &&
          this.yAxis.forEach(function (b) {
            c.y = Math.min(b.pos, c.y);
            c.height = Math.max(b.pos - this.plotTop + b.len, c.height);
          }, this);
        return c;
      };
      k.prototype.getPoint = function (b) {
        var c = b,
          d = this.xData || this.options.xData || this.processedXData || !1;
        !b ||
          b instanceof this.pointClass ||
          ((c = new this.pointClass().init(
            this,
            this.options.data[b.i],
            d ? d[b.i] : void 0
          )),
          (c.category = n(
            this.xAxis.categories ? this.xAxis.categories[c.x] : c.x,
            c.x
          )),
          (c.dist = b.dist),
          (c.distX = b.distX),
          (c.plotX = b.plotX),
          (c.plotY = b.plotY),
          (c.index = b.i),
          (c.isInside = this.isPointInside(b)));
        return c;
      };
      m(k.prototype, 'searchPoint', function (b) {
        return this.getPoint(b.apply(this, [].slice.call(arguments, 1)));
      });
      m(q.prototype, 'haloPath', function (b) {
        var c = this.series,
          d = this.plotX,
          a = this.plotY,
          e = c.chart.inverted;
        c.isSeriesBoosting &&
          e &&
          ((this.plotX = c.yAxis.len - a), (this.plotY = c.xAxis.len - d));
        var f = b.apply(this, Array.prototype.slice.call(arguments, 1));
        c.isSeriesBoosting && e && ((this.plotX = d), (this.plotY = a));
        return f;
      });
      m(k.prototype, 'markerAttribs', function (b, c) {
        var d = c.plotX,
          a = c.plotY,
          e = this.chart.inverted;
        this.isSeriesBoosting &&
          e &&
          ((c.plotX = this.yAxis.len - a), (c.plotY = this.xAxis.len - d));
        var f = b.apply(this, Array.prototype.slice.call(arguments, 1));
        this.isSeriesBoosting && e && ((c.plotX = d), (c.plotY = a));
        return f;
      });
      p(k, 'destroy', function () {
        var b = this,
          c = b.chart;
        c.markerGroup === b.markerGroup && (b.markerGroup = null);
        c.hoverPoints &&
          (c.hoverPoints = c.hoverPoints.filter(function (c) {
            return c.series === b;
          }));
        c.hoverPoint && c.hoverPoint.series === b && (c.hoverPoint = null);
      });
      m(k.prototype, 'getExtremes', function (b) {
        return this.isSeriesBoosting && this.hasExtremes && this.hasExtremes()
          ? {}
          : b.apply(this, Array.prototype.slice.call(arguments, 1));
      });
      [
        'translate',
        'generatePoints',
        'drawTracker',
        'drawPoints',
        'render',
      ].forEach(function (b) {
        function c(c) {
          var a =
            this.options.stacking &&
            ('translate' === b || 'generatePoints' === b);
          if (
            !this.isSeriesBoosting ||
            a ||
            !C(this.chart) ||
            'heatmap' === this.type ||
            'treemap' === this.type ||
            !w[this.type] ||
            0 === this.options.boostThreshold
          )
            c.call(this);
          else if (this[b + 'Canvas']) this[b + 'Canvas']();
        }
        m(k.prototype, b, c);
        'translate' === b &&
          'column bar arearange columnrange heatmap treemap'
            .split(' ')
            .forEach(function (d) {
              G[d] && m(G[d].prototype, b, c);
            });
      });
      m(k.prototype, 'processData', function (b) {
        function c(a) {
          return (
            d.chart.isChartSeriesBoosting() ||
            (a ? a.length : 0) >= (d.options.boostThreshold || Number.MAX_VALUE)
          );
        }
        var d = this,
          a = this.options.data;
        C(this.chart) && w[this.type]
          ? ((c(a) &&
              'heatmap' !== this.type &&
              'treemap' !== this.type &&
              !this.options.stacking &&
              this.hasExtremes &&
              this.hasExtremes(!0)) ||
              (b.apply(this, Array.prototype.slice.call(arguments, 1)),
              (a = this.processedXData)),
            (this.isSeriesBoosting = c(a))
              ? ((a = this.getFirstValidPoint(this.options.data)),
                e(a) || h(a) || x(12, !1, this.chart),
                this.enterBoost())
              : this.exitBoost && this.exitBoost())
          : b.apply(this, Array.prototype.slice.call(arguments, 1));
      });
      p(k, 'hide', function () {
        this.canvas &&
          this.renderTarget &&
          (this.ogl && this.ogl.clear(), this.boostClear());
      });
      k.prototype.enterBoost = function () {
        this.alteredByBoost = [];
        ['allowDG', 'directTouch', 'stickyTracking'].forEach(function (b) {
          this.alteredByBoost.push({
            prop: b,
            val: this[b],
            own: Object.hasOwnProperty.call(this, b),
          });
        }, this);
        this.directTouch = this.allowDG = !1;
        this.finishedAnimating = this.stickyTracking = !0;
        this.labelBySeries &&
          (this.labelBySeries = this.labelBySeries.destroy());
      };
      k.prototype.exitBoost = function () {
        (this.alteredByBoost || []).forEach(function (b) {
          b.own ? (this[b.prop] = b.val) : delete this[b.prop];
        }, this);
        this.boostClear && this.boostClear();
      };
      k.prototype.hasExtremes = function (b) {
        var c = this.options,
          d = this.xAxis && this.xAxis.options,
          a = this.yAxis && this.yAxis.options,
          h = this.colorAxis && this.colorAxis.options;
        return (
          c.data.length > (c.boostThreshold || Number.MAX_VALUE) &&
          e(a.min) &&
          e(a.max) &&
          (!b || (e(d.min) && e(d.max))) &&
          (!h || (e(h.min) && e(h.max)))
        );
      };
      k.prototype.destroyGraphics = function () {
        var b = this,
          c = this.points,
          d,
          a;
        if (c)
          for (a = 0; a < c.length; a += 1)
            (d = c[a]) && d.destroyElements && d.destroyElements();
        ['graph', 'area', 'tracker'].forEach(function (a) {
          b[a] && (b[a] = b[a].destroy());
        });
      };
      B.forEach(function (b) {
        c[b] &&
          ((c[b].boostThreshold = 5e3),
          (c[b].boostData = []),
          (G[b].prototype.fillOpacity = !0));
      });
    }
  );
  r(
    d,
    'Extensions/Boost/NamedColors.js',
    [d['Core/Color/Color.js']],
    function (d) {
      var r = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dodgerblue: '#1e90ff',
        feldspar: '#d19275',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgrey: '#d3d3d3',
        lightgreen: '#90ee90',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslateblue: '#8470ff',
        lightslategray: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370d8',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#d87093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        violetred: '#d02090',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32',
      };
      return (d.names = r);
    }
  );
  r(
    d,
    'Extensions/Boost/Boost.js',
    [
      d['Extensions/Boost/BoostUtils.js'],
      d['Extensions/Boost/BoostInit.js'],
      d['Extensions/BoostCanvas.js'],
      d['Core/Utilities.js'],
    ],
    function (d, r, q, l) {
      l = l.error;
      d = d.hasWebGLSupport;
      d() ? r() : 'undefined' !== typeof q ? q() : l(26);
    }
  );
  r(d, 'masters/modules/boost.src.js', [], function () {});
});
