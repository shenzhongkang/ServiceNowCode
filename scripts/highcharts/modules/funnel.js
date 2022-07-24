/*! RESOURCE: /scripts/highcharts/modules/funnel.js */
(function (b) {
  'object' === typeof module && module.exports
    ? ((b['default'] = b), (module.exports = b))
    : 'function' === typeof define && define.amd
    ? define('highcharts/modules/funnel', ['highcharts'], function (d) {
        b(d);
        b.Highcharts = d;
        return b;
      })
    : b('undefined' !== typeof Highcharts ? Highcharts : void 0);
})(function (b) {
  function d(b, e, d, l) {
    b.hasOwnProperty(e) || (b[e] = l.apply(null, d));
  }
  var e = b ? b._modules : {};
  d(
    e,
    'Series/FunnelSeries.js',
    [
      e['Core/Series/Series.js'],
      e['Core/Chart/Chart.js'],
      e['Core/Globals.js'],
      e['Core/Utilities.js'],
    ],
    function (e, d, q, l) {
      var E = e.seriesTypes,
        F = q.noop;
      q = l.addEvent;
      var I = l.fireEvent,
        J = l.isArray,
        G = l.pick;
      e.seriesType(
        'funnel',
        'pie',
        {
          animation: !1,
          center: ['50%', '50%'],
          width: '90%',
          neckWidth: '30%',
          height: '100%',
          neckHeight: '25%',
          reversed: !1,
          size: !0,
          dataLabels: { connectorWidth: 1, verticalAlign: 'middle' },
          states: { select: { color: '#cccccc', borderColor: '#000000' } },
        },
        {
          animate: F,
          translate: function () {
            function a(a, c) {
              return /%$/.test(a)
                ? (c * parseInt(a, 10)) / 100
                : parseInt(a, 10);
            }
            var w = 0,
              c = this,
              h = c.chart,
              g = c.options,
              H = g.reversed,
              f = g.ignoreHiddenPoint,
              b = h.plotWidth;
            h = h.plotHeight;
            var e = 0,
              d = g.center,
              k = a(d[0], b),
              m = a(d[1], h),
              l = a(g.width, b),
              t,
              u = a(g.height, h),
              y = a(g.neckWidth, b),
              q = a(g.neckHeight, h),
              z = m - u / 2 + u - q;
            b = c.data;
            var B,
              C,
              E = 'left' === g.dataLabels.position ? 1 : 0,
              A,
              n,
              D,
              v,
              p,
              x,
              r;
            c.getWidthAt = function (a) {
              var c = m - u / 2;
              return a > z || u === q
                ? y
                : y + (l - y) * (1 - (a - c) / (u - q));
            };
            c.getX = function (a, f, b) {
              return (
                k +
                (f ? -1 : 1) *
                  (c.getWidthAt(H ? 2 * m - a : a) / 2 + b.labelDistance)
              );
            };
            c.center = [k, m, u];
            c.centerX = k;
            b.forEach(function (a) {
              (f && !1 === a.visible) || (w += a.y);
            });
            b.forEach(function (a) {
              r = null;
              C = w ? a.y / w : 0;
              n = m - u / 2 + e * u;
              p = n + C * u;
              t = c.getWidthAt(n);
              A = k - t / 2;
              D = A + t;
              t = c.getWidthAt(p);
              v = k - t / 2;
              x = v + t;
              n > z
                ? ((A = v = k - y / 2), (D = x = k + y / 2))
                : p > z &&
                  ((r = p),
                  (t = c.getWidthAt(z)),
                  (v = k - t / 2),
                  (x = v + t),
                  (p = z));
              H &&
                ((n = 2 * m - n),
                (p = 2 * m - p),
                null !== r && (r = 2 * m - r));
              B = [
                ['M', A, n],
                ['L', D, n],
                ['L', x, p],
              ];
              null !== r && B.push(['L', x, r], ['L', v, r]);
              B.push(['L', v, p], ['Z']);
              a.shapeType = 'path';
              a.shapeArgs = { d: B };
              a.percentage = 100 * C;
              a.plotX = k;
              a.plotY = (n + (r || p)) / 2;
              a.tooltipPos = [k, a.plotY];
              a.dlBox = {
                x: v,
                y: n,
                topWidth: D - A,
                bottomWidth: x - v,
                height: Math.abs(G(r, p) - n),
                width: NaN,
              };
              a.slice = F;
              a.half = E;
              (f && !1 === a.visible) || (e += C);
            });
            I(c, 'afterTranslate');
          },
          sortByAngle: function (a) {
            a.sort(function (a, c) {
              return a.plotY - c.plotY;
            });
          },
          drawDataLabels: function () {
            var a = this.data,
              b = this.options.dataLabels.distance,
              c,
              h = a.length;
            for (this.center[2] -= 2 * b; h--; ) {
              var g = a[h];
              var e = (c = g.half) ? 1 : -1;
              var f = g.plotY;
              g.labelDistance = G(
                g.options.dataLabels && g.options.dataLabels.distance,
                b
              );
              this.maxLabelDistance = Math.max(
                g.labelDistance,
                this.maxLabelDistance || 0
              );
              var d = this.getX(f, c, g);
              g.labelPosition = {
                natural: { x: 0, y: f },
                final: {},
                alignment: c ? 'right' : 'left',
                connectorPosition: {
                  breakAt: { x: d + (g.labelDistance - 5) * e, y: f },
                  touchingSliceAt: { x: d + g.labelDistance * e, y: f },
                },
              };
            }
            E[
              this.options.dataLabels.inside ? 'column' : 'pie'
            ].prototype.drawDataLabels.call(this);
          },
          alignDataLabel: function (a, e, c, h, g) {
            var d = a.series;
            h = d.options.reversed;
            var f = a.dlBox || a.shapeArgs,
              w = c.align,
              l = c.verticalAlign,
              q = ((d.options || {}).dataLabels || {}).inside,
              k = d.center[1];
            d = d.getWidthAt(
              (h ? 2 * k - a.plotY : a.plotY) - f.height / 2 + e.height
            );
            d =
              'middle' === l
                ? (f.topWidth - f.bottomWidth) / 4
                : (d - f.bottomWidth) / 2;
            k = f.y;
            var m = f.x;
            'middle' === l
              ? (k = f.y - f.height / 2 + e.height / 2)
              : 'top' === l && (k = f.y - f.height + e.height + c.padding);
            if (('top' === l && !h) || ('bottom' === l && h) || 'middle' === l)
              'right' === w
                ? (m = f.x - c.padding + d)
                : 'left' === w && (m = f.x + c.padding - d);
            h = {
              x: m,
              y: h ? k - f.height : k,
              width: f.bottomWidth,
              height: f.height,
            };
            c.verticalAlign = 'bottom';
            (q && !a.visible) ||
              b.Series.prototype.alignDataLabel.call(this, a, e, c, h, g);
            q &&
              (!a.visible && a.dataLabel && (a.dataLabel.placed = !1),
              a.contrastColor && e.css({ color: a.contrastColor }));
          },
        }
      );
      q(d, 'afterHideAllOverlappingLabels', function () {
        this.series.forEach(function (a) {
          var b = a.options && a.options.dataLabels;
          J(b) && (b = b[0]);
          a.is('pie') &&
            a.placeDataLabels &&
            b &&
            !b.inside &&
            a.placeDataLabels();
        });
      });
      e.seriesType('pyramid', 'funnel', {
        neckWidth: '0%',
        neckHeight: '0%',
        reversed: !0,
      });
      ('');
    }
  );
  d(e, 'masters/modules/funnel.src.js', [], function () {});
});
