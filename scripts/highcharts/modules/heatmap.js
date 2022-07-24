/*! RESOURCE: /scripts/highcharts/modules/heatmap.js */
(function (a) {
  'object' === typeof module && module.exports
    ? ((a['default'] = a), (module.exports = a))
    : 'function' === typeof define && define.amd
    ? define('highcharts/modules/heatmap', ['highcharts'], function (t) {
        a(t);
        a.Highcharts = t;
        return a;
      })
    : a('undefined' !== typeof Highcharts ? Highcharts : void 0);
})(function (a) {
  function t(a, h, q, v) {
    a.hasOwnProperty(h) || (a[h] = v.apply(null, q));
  }
  a = a ? a._modules : {};
  t(a, 'Mixins/ColorSeries.js', [], function () {
    return {
      colorPointMixin: {
        setVisible: function (a) {
          var h = this,
            q = a ? 'show' : 'hide';
          h.visible = h.options.visible = !!a;
          ['graphic', 'dataLabel'].forEach(function (a) {
            if (h[a]) h[a][q]();
          });
          this.series.buildKDTree();
        },
      },
      colorSeriesMixin: {
        optionalAxis: 'colorAxis',
        colorAxis: 0,
        translateColors: function () {
          var a = this,
            h = this.options.nullColor,
            q = this.colorAxis,
            v = this.colorKey;
          (this.data.length ? this.data : this.points).forEach(function (p) {
            var r = p.getNestedProperty(v);
            (r =
              p.options.color ||
              (p.isNull || null === p.value
                ? h
                : q && 'undefined' !== typeof r
                ? q.toColor(r, p)
                : p.color || a.color)) &&
              p.color !== r &&
              ((p.color = r),
              'point' === a.options.legendType &&
                p.legendItem &&
                a.chart.legend.colorizeItem(p, p.visible));
          });
        },
      },
    };
  });
  t(
    a,
    'Core/Axis/ColorAxis.js',
    [
      a['Core/Axis/Axis.js'],
      a['Core/Chart/Chart.js'],
      a['Core/Color/Color.js'],
      a['Mixins/ColorSeries.js'],
      a['Core/Animation/Fx.js'],
      a['Core/Globals.js'],
      a['Core/Legend.js'],
      a['Mixins/LegendSymbol.js'],
      a['Series/LineSeries.js'],
      a['Core/Series/Point.js'],
      a['Core/Utilities.js'],
    ],
    function (a, h, q, v, p, r, t, D, w, B, y) {
      var G =
          (this && this.__extends) ||
          (function () {
            var b = function (d, c) {
              b =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (c, l) {
                    c.__proto__ = l;
                  }) ||
                function (c, l) {
                  for (var e in l) l.hasOwnProperty(e) && (c[e] = l[e]);
                };
              return b(d, c);
            };
            return function (d, c) {
              function m() {
                this.constructor = d;
              }
              b(d, c);
              d.prototype =
                null === c
                  ? Object.create(c)
                  : ((m.prototype = c.prototype), new m());
            };
          })(),
        x = q.parse;
      q = v.colorPointMixin;
      v = v.colorSeriesMixin;
      var C = r.noop,
        u = y.addEvent,
        z = y.erase,
        b = y.extend,
        f = y.isNumber,
        E = y.merge,
        A = y.pick,
        n = y.splat;
      ('');
      b(w.prototype, v);
      b(B.prototype, q);
      h.prototype.collectionsWithUpdate.push('colorAxis');
      h.prototype.collectionsWithInit.colorAxis = [h.prototype.addColorAxis];
      var k = (function (d) {
        function g(c, m) {
          var l = d.call(this, c, m) || this;
          l.beforePadding = !1;
          l.chart = void 0;
          l.coll = 'colorAxis';
          l.dataClasses = void 0;
          l.legendItem = void 0;
          l.legendItems = void 0;
          l.name = '';
          l.options = void 0;
          l.stops = void 0;
          l.visible = !0;
          l.init(c, m);
          return l;
        }
        G(g, d);
        g.buildOptions = function (c, m, l) {
          c = c.options.legend || {};
          var e = l.layout ? 'vertical' !== l.layout : 'vertical' !== c.layout;
          return E(m, { side: e ? 2 : 1, reversed: !e }, l, {
            opposite: !e,
            showEmpty: !1,
            title: null,
            visible: c.enabled && (l ? !1 !== l.visible : !0),
          });
        };
        g.prototype.init = function (c, m) {
          var l = g.buildOptions(c, g.defaultOptions, m);
          this.coll = 'colorAxis';
          d.prototype.init.call(this, c, l);
          m.dataClasses && this.initDataClasses(m);
          this.initStops();
          this.horiz = !l.opposite;
          this.zoomEnabled = !1;
        };
        g.prototype.initDataClasses = function (c) {
          var m = this.chart,
            l,
            e = 0,
            b = m.options.chart.colorCount,
            d = this.options,
            g = c.dataClasses.length;
          this.dataClasses = l = [];
          this.legendItems = [];
          c.dataClasses.forEach(function (c, a) {
            c = E(c);
            l.push(c);
            if (m.styledMode || !c.color)
              'category' === d.dataClassColor
                ? (m.styledMode ||
                    ((a = m.options.colors), (b = a.length), (c.color = a[e])),
                  (c.colorIndex = e),
                  e++,
                  e === b && (e = 0))
                : (c.color = x(d.minColor).tweenTo(
                    x(d.maxColor),
                    2 > g ? 0.5 : a / (g - 1)
                  ));
          });
        };
        g.prototype.hasData = function () {
          return !!(this.tickPositions || []).length;
        };
        g.prototype.setTickPositions = function () {
          if (!this.dataClasses) return d.prototype.setTickPositions.call(this);
        };
        g.prototype.initStops = function () {
          this.stops = this.options.stops || [
            [0, this.options.minColor],
            [1, this.options.maxColor],
          ];
          this.stops.forEach(function (c) {
            c.color = x(c[1]);
          });
        };
        g.prototype.setOptions = function (c) {
          d.prototype.setOptions.call(this, c);
          this.options.crosshair = this.options.marker;
        };
        g.prototype.setAxisSize = function () {
          var c = this.legendSymbol,
            m = this.chart,
            l = m.options.legend || {},
            e,
            b;
          c
            ? ((this.left = l = c.attr('x')),
              (this.top = e = c.attr('y')),
              (this.width = b = c.attr('width')),
              (this.height = c = c.attr('height')),
              (this.right = m.chartWidth - l - b),
              (this.bottom = m.chartHeight - e - c),
              (this.len = this.horiz ? b : c),
              (this.pos = this.horiz ? l : e))
            : (this.len =
                (this.horiz ? l.symbolWidth : l.symbolHeight) ||
                g.defaultLegendLength);
        };
        g.prototype.normalizedValue = function (c) {
          this.logarithmic && (c = this.logarithmic.log2lin(c));
          return 1 - (this.max - c) / (this.max - this.min || 1);
        };
        g.prototype.toColor = function (c, m) {
          var b = this.dataClasses,
            e = this.stops,
            d;
          if (b)
            for (d = b.length; d--; ) {
              var g = b[d];
              var a = g.from;
              e = g.to;
              if (
                ('undefined' === typeof a || c >= a) &&
                ('undefined' === typeof e || c <= e)
              ) {
                var f = g.color;
                m && ((m.dataClass = d), (m.colorIndex = g.colorIndex));
                break;
              }
            }
          else {
            c = this.normalizedValue(c);
            for (d = e.length; d-- && !(c > e[d][0]); );
            a = e[d] || e[d + 1];
            e = e[d + 1] || a;
            c = 1 - (e[0] - c) / (e[0] - a[0] || 1);
            f = a.color.tweenTo(e.color, c);
          }
          return f;
        };
        g.prototype.getOffset = function () {
          var c = this.legendGroup,
            b = this.chart.axisOffset[this.side];
          c &&
            ((this.axisParent = c),
            d.prototype.getOffset.call(this),
            this.added ||
              ((this.added = !0),
              (this.labelLeft = 0),
              (this.labelRight = this.width)),
            (this.chart.axisOffset[this.side] = b));
        };
        g.prototype.setLegendColor = function () {
          var c = this.reversed,
            d = c ? 1 : 0;
          c = c ? 0 : 1;
          d = this.horiz ? [d, 0, c, 0] : [0, c, 0, d];
          this.legendColor = {
            linearGradient: { x1: d[0], y1: d[1], x2: d[2], y2: d[3] },
            stops: this.stops,
          };
        };
        g.prototype.drawLegendSymbol = function (c, d) {
          var b = c.padding,
            e = c.options,
            m = this.horiz,
            a = A(e.symbolWidth, m ? g.defaultLegendLength : 12),
            f = A(e.symbolHeight, m ? 12 : g.defaultLegendLength),
            k = A(e.labelPadding, m ? 16 : 30);
          e = A(e.itemDistance, 10);
          this.setLegendColor();
          d.legendSymbol = this.chart.renderer
            .rect(0, c.baseline - 11, a, f)
            .attr({ zIndex: 1 })
            .add(d.legendGroup);
          this.legendItemWidth = a + b + (m ? e : k);
          this.legendItemHeight = f + b + (m ? k : 0);
        };
        g.prototype.setState = function (c) {
          this.series.forEach(function (d) {
            d.setState(c);
          });
        };
        g.prototype.setVisible = function () {};
        g.prototype.getSeriesExtremes = function () {
          var c = this.series,
            d = c.length,
            b;
          this.dataMin = Infinity;
          for (this.dataMax = -Infinity; d--; ) {
            var e = c[d];
            var a = (e.colorKey = A(
              e.options.colorKey,
              e.colorKey,
              e.pointValKey,
              e.zoneAxis,
              'y'
            ));
            var g = e.pointArrayMap;
            var f = e[a + 'Min'] && e[a + 'Max'];
            if (e[a + 'Data']) var k = e[a + 'Data'];
            else if (g) {
              k = [];
              g = g.indexOf(a);
              var n = e.yData;
              if (0 <= g && n)
                for (b = 0; b < n.length; b++) k.push(A(n[b][g], n[b]));
            } else k = e.yData;
            f
              ? ((e.minColorValue = e[a + 'Min']),
                (e.maxColorValue = e[a + 'Max']))
              : ((k = w.prototype.getExtremes.call(e, k)),
                (e.minColorValue = k.dataMin),
                (e.maxColorValue = k.dataMax));
            'undefined' !== typeof e.minColorValue &&
              ((this.dataMin = Math.min(this.dataMin, e.minColorValue)),
              (this.dataMax = Math.max(this.dataMax, e.maxColorValue)));
            f || w.prototype.applyExtremes.call(e);
          }
        };
        g.prototype.drawCrosshair = function (c, b) {
          var a = b && b.plotX,
            e = b && b.plotY,
            g = this.pos,
            m = this.len;
          if (b) {
            var f = this.toPixels(b.getNestedProperty(b.series.colorKey));
            f < g ? (f = g - 2) : f > g + m && (f = g + m + 2);
            b.plotX = f;
            b.plotY = this.len - f;
            d.prototype.drawCrosshair.call(this, c, b);
            b.plotX = a;
            b.plotY = e;
            this.cross &&
              !this.cross.addedToColorAxis &&
              this.legendGroup &&
              (this.cross
                .addClass('highcharts-coloraxis-marker')
                .add(this.legendGroup),
              (this.cross.addedToColorAxis = !0),
              !this.chart.styledMode &&
                this.crosshair &&
                this.cross.attr({ fill: this.crosshair.color }));
          }
        };
        g.prototype.getPlotLinePath = function (c) {
          var b = this.left,
            a = c.translatedValue,
            e = this.top;
          return f(a)
            ? this.horiz
              ? [['M', a - 4, e - 6], ['L', a + 4, e - 6], ['L', a, e], ['Z']]
              : [['M', b, a], ['L', b - 6, a + 6], ['L', b - 6, a - 6], ['Z']]
            : d.prototype.getPlotLinePath.call(this, c);
        };
        g.prototype.update = function (c, b) {
          var a = this.chart,
            e = a.legend,
            f = g.buildOptions(a, {}, c);
          this.series.forEach(function (c) {
            c.isDirtyData = !0;
          });
          ((c.dataClasses && e.allItems) || this.dataClasses) &&
            this.destroyItems();
          a.options[this.coll] = E(this.userOptions, f);
          d.prototype.update.call(this, f, b);
          this.legendItem && (this.setLegendColor(), e.colorizeItem(this, !0));
        };
        g.prototype.destroyItems = function () {
          var c = this.chart;
          this.legendItem
            ? c.legend.destroyItem(this)
            : this.legendItems &&
              this.legendItems.forEach(function (b) {
                c.legend.destroyItem(b);
              });
          c.isDirtyLegend = !0;
        };
        g.prototype.remove = function (c) {
          this.destroyItems();
          d.prototype.remove.call(this, c);
        };
        g.prototype.getDataClassLegendSymbols = function () {
          var c = this,
            d = c.chart,
            a = c.legendItems,
            e = d.options.legend,
            g = e.valueDecimals,
            f = e.valueSuffix || '',
            k;
          a.length ||
            c.dataClasses.forEach(function (e, m) {
              var l = !0,
                n = e.from,
                h = e.to,
                p = d.numberFormatter;
              k = '';
              'undefined' === typeof n
                ? (k = '< ')
                : 'undefined' === typeof h && (k = '> ');
              'undefined' !== typeof n && (k += p(n, g) + f);
              'undefined' !== typeof n &&
                'undefined' !== typeof h &&
                (k += ' - ');
              'undefined' !== typeof h && (k += p(h, g) + f);
              a.push(
                b(
                  {
                    chart: d,
                    name: k,
                    options: {},
                    drawLegendSymbol: D.drawRectangle,
                    visible: !0,
                    setState: C,
                    isDataClass: !0,
                    setVisible: function () {
                      l = c.visible = !l;
                      c.series.forEach(function (c) {
                        c.points.forEach(function (c) {
                          c.dataClass === m && c.setVisible(l);
                        });
                      });
                      d.legend.colorizeItem(this, l);
                    },
                  },
                  e
                )
              );
            });
          return a;
        };
        g.defaultLegendLength = 200;
        g.defaultOptions = {
          lineWidth: 0,
          minPadding: 0,
          maxPadding: 0,
          gridLineWidth: 1,
          tickPixelInterval: 72,
          startOnTick: !0,
          endOnTick: !0,
          offset: 0,
          marker: {
            animation: { duration: 50 },
            width: 0.01,
            color: '#999999',
          },
          labels: { overflow: 'justify', rotation: 0 },
          minColor: '#e6ebf5',
          maxColor: '#003399',
          tickLength: 5,
          showInLegend: !0,
        };
        g.keepProps = [
          'legendGroup',
          'legendItemHeight',
          'legendItemWidth',
          'legendItem',
          'legendSymbol',
        ];
        return g;
      })(a);
      Array.prototype.push.apply(a.keepProps, k.keepProps);
      r.ColorAxis = k;
      ['fill', 'stroke'].forEach(function (b) {
        p.prototype[b + 'Setter'] = function () {
          this.elem.attr(
            b,
            x(this.start).tweenTo(x(this.end), this.pos),
            null,
            !0
          );
        };
      });
      u(h, 'afterGetAxes', function () {
        var b = this,
          a = b.options;
        this.colorAxis = [];
        a.colorAxis &&
          ((a.colorAxis = n(a.colorAxis)),
          a.colorAxis.forEach(function (c, d) {
            c.index = d;
            new k(b, c);
          }));
      });
      u(w, 'bindAxes', function () {
        var b = this.axisTypes;
        b
          ? -1 === b.indexOf('colorAxis') && b.push('colorAxis')
          : (this.axisTypes = ['colorAxis']);
      });
      u(t, 'afterGetAllItems', function (b) {
        var a = [],
          c,
          d;
        (this.chart.colorAxis || []).forEach(function (d) {
          (c = d.options) &&
            c.showInLegend &&
            (c.dataClasses && c.visible
              ? (a = a.concat(d.getDataClassLegendSymbols()))
              : c.visible && a.push(d),
            d.series.forEach(function (a) {
              if (!a.options.showInLegend || c.dataClasses)
                'point' === a.options.legendType
                  ? a.points.forEach(function (c) {
                      z(b.allItems, c);
                    })
                  : z(b.allItems, a);
            }));
        });
        for (d = a.length; d--; ) b.allItems.unshift(a[d]);
      });
      u(t, 'afterColorizeItem', function (b) {
        b.visible &&
          b.item.legendColor &&
          b.item.legendSymbol.attr({ fill: b.item.legendColor });
      });
      u(t, 'afterUpdate', function () {
        var b = this.chart.colorAxis;
        b &&
          b.forEach(function (b, c, a) {
            b.update({}, a);
          });
      });
      u(w, 'afterTranslate', function () {
        ((this.chart.colorAxis && this.chart.colorAxis.length) ||
          this.colorAttribs) &&
          this.translateColors();
      });
      return k;
    }
  );
  t(
    a,
    'Mixins/ColorMapSeries.js',
    [a['Core/Globals.js'], a['Core/Series/Point.js'], a['Core/Utilities.js']],
    function (a, h, q) {
      var t = q.defined;
      return {
        colorMapPointMixin: {
          dataLabelOnNull: !0,
          isValid: function () {
            return (
              null !== this.value &&
              Infinity !== this.value &&
              -Infinity !== this.value
            );
          },
          setState: function (a) {
            h.prototype.setState.call(this, a);
            this.graphic &&
              this.graphic.attr({ zIndex: 'hover' === a ? 1 : 0 });
          },
        },
        colorMapSeriesMixin: {
          pointArrayMap: ['value'],
          axisTypes: ['xAxis', 'yAxis', 'colorAxis'],
          trackerGroups: ['group', 'markerGroup', 'dataLabelsGroup'],
          getSymbol: a.noop,
          parallelArrays: ['x', 'y', 'value'],
          colorKey: 'value',
          pointAttribs: a.seriesTypes.column.prototype.pointAttribs,
          colorAttribs: function (a) {
            var h = {};
            t(a.color) && (h[this.colorProp || 'fill'] = a.color);
            return h;
          },
        },
      };
    }
  );
  t(
    a,
    'Series/HeatmapSeries.js',
    [
      a['Core/Series/Series.js'],
      a['Mixins/ColorMapSeries.js'],
      a['Core/Globals.js'],
      a['Mixins/LegendSymbol.js'],
      a['Core/Renderer/SVG/SVGRenderer.js'],
      a['Core/Utilities.js'],
    ],
    function (a, h, q, t, p, r) {
      var v = h.colorMapPointMixin;
      h = h.colorMapSeriesMixin;
      var D = q.noop,
        w = r.clamp,
        B = r.extend,
        y = r.fireEvent,
        F = r.isNumber,
        x = r.merge,
        C = r.pick,
        u = q.Series;
      r = a.seriesTypes;
      var z = p.prototype.symbols;
      ('');
      a.seriesType(
        'heatmap',
        'scatter',
        {
          animation: !1,
          borderWidth: 0,
          nullColor: '#f7f7f7',
          dataLabels: {
            formatter: function () {
              return this.point.value;
            },
            inside: !0,
            verticalAlign: 'middle',
            crop: !1,
            overflow: !1,
            padding: 0,
          },
          marker: {
            symbol: 'rect',
            radius: 0,
            lineColor: void 0,
            states: { hover: { lineWidthPlus: 0 }, select: {} },
          },
          clip: !0,
          pointRange: null,
          tooltip: { pointFormat: '{point.x}, {point.y}: {point.value}<br/>' },
          states: { hover: { halo: !1, brightness: 0.2 } },
        },
        x(h, {
          pointArrayMap: ['y', 'value'],
          hasPointSpecificOptions: !0,
          getExtremesFromAll: !0,
          directTouch: !0,
          init: function () {
            u.prototype.init.apply(this, arguments);
            var b = this.options;
            b.pointRange = C(b.pointRange, b.colsize || 1);
            this.yAxis.axisPointRange = b.rowsize || 1;
            B(z, { ellipse: z.circle, rect: z.square });
          },
          getSymbol: u.prototype.getSymbol,
          setClip: function (b) {
            var a = this.chart;
            u.prototype.setClip.apply(this, arguments);
            (!1 !== this.options.clip || b) &&
              this.markerGroup.clip(
                (b || this.clipBox) && this.sharedClipKey
                  ? a[this.sharedClipKey]
                  : a.clipRect
              );
          },
          translate: function () {
            var b = this.options,
              a = (b.marker && b.marker.symbol) || '',
              h = z[a] ? a : 'rect';
            b = this.options;
            var A = -1 !== ['circle', 'square'].indexOf(h);
            this.generatePoints();
            this.points.forEach(function (b) {
              var f = b.getCellAttributes(),
                d = {
                  x: Math.min(f.x1, f.x2),
                  y: Math.min(f.y1, f.y2),
                  width: Math.max(Math.abs(f.x2 - f.x1), 0),
                  height: Math.max(Math.abs(f.y2 - f.y1), 0),
                };
              var g = (b.hasImage =
                0 ===
                ((b.marker && b.marker.symbol) || a || '').indexOf('url'));
              if (A) {
                var c = Math.abs(d.width - d.height);
                d.x = Math.min(f.x1, f.x2) + (d.width < d.height ? 0 : c / 2);
                d.y = Math.min(f.y1, f.y2) + (d.width < d.height ? c / 2 : 0);
                d.width = d.height = Math.min(d.width, d.height);
              }
              c = {
                plotX: (f.x1 + f.x2) / 2,
                plotY: (f.y1 + f.y2) / 2,
                clientX: (f.x1 + f.x2) / 2,
                shapeType: 'path',
                shapeArgs: x(!0, d, { d: z[h](d.x, d.y, d.width, d.height) }),
              };
              g && (b.marker = { width: d.width, height: d.height });
              B(b, c);
            });
            y(this, 'afterTranslate');
          },
          pointAttribs: function (b, a) {
            var f = u.prototype.pointAttribs.call(this, b, a),
              h = this.options || {},
              n = this.chart.options.plotOptions || {},
              k = n.series || {},
              d = n.heatmap || {};
            n = h.borderColor || d.borderColor || k.borderColor;
            k =
              h.borderWidth ||
              d.borderWidth ||
              k.borderWidth ||
              f['stroke-width'];
            f.stroke =
              (b && b.marker && b.marker.lineColor) ||
              (h.marker && h.marker.lineColor) ||
              n ||
              this.color;
            f['stroke-width'] = k;
            a &&
              ((b = x(
                h.states[a],
                h.marker && h.marker.states[a],
                (b.options.states && b.options.states[a]) || {}
              )),
              (a = b.brightness),
              (f.fill =
                b.color ||
                q
                  .color(f.fill)
                  .brighten(a || 0)
                  .get()),
              (f.stroke = b.lineColor));
            return f;
          },
          markerAttribs: function (b, a) {
            var f = b.marker || {},
              h = this.options.marker || {},
              n = b.shapeArgs || {},
              k = {};
            if (b.hasImage) return { x: b.plotX, y: b.plotY };
            if (a) {
              var d = h.states[a] || {};
              var g = (f.states && f.states[a]) || {};
              [
                ['width', 'x'],
                ['height', 'y'],
              ].forEach(function (b) {
                k[b[0]] =
                  (g[b[0]] || d[b[0]] || n[b[0]]) +
                  (g[b[0] + 'Plus'] || d[b[0] + 'Plus'] || 0);
                k[b[1]] = n[b[1]] + (n[b[0]] - k[b[0]]) / 2;
              });
            }
            return a ? k : n;
          },
          drawPoints: function () {
            var b = this;
            if ((this.options.marker || {}).enabled || this._hasPointMarkers)
              u.prototype.drawPoints.call(this),
                this.points.forEach(function (a) {
                  a.graphic &&
                    a.graphic[b.chart.styledMode ? 'css' : 'animate'](
                      b.colorAttribs(a)
                    );
                });
          },
          hasData: function () {
            return !!this.processedXData.length;
          },
          getValidPoints: function (b, a) {
            return u.prototype.getValidPoints.call(this, b, a, !0);
          },
          getBox: D,
          drawLegendSymbol: t.drawRectangle,
          alignDataLabel: r.column.prototype.alignDataLabel,
          getExtremes: function () {
            var b = u.prototype.getExtremes.call(this, this.valueData),
              a = b.dataMin;
            b = b.dataMax;
            F(a) && (this.valueMin = a);
            F(b) && (this.valueMax = b);
            return u.prototype.getExtremes.call(this);
          },
        }),
        x(v, {
          applyOptions: function (b, a) {
            b = q.Point.prototype.applyOptions.call(this, b, a);
            b.formatPrefix = b.isNull || null === b.value ? 'null' : 'point';
            return b;
          },
          isValid: function () {
            return Infinity !== this.value && -Infinity !== this.value;
          },
          haloPath: function (b) {
            if (!b) return [];
            var a = this.shapeArgs;
            return [
              'M',
              a.x - b,
              a.y - b,
              'L',
              a.x - b,
              a.y + a.height + b,
              a.x + a.width + b,
              a.y + a.height + b,
              a.x + a.width + b,
              a.y - b,
              'Z',
            ];
          },
          getCellAttributes: function () {
            var a = this.series,
              f = a.options,
              h = (f.colsize || 1) / 2,
              p = (f.rowsize || 1) / 2,
              n = a.xAxis,
              k = a.yAxis,
              d = this.options.marker || a.options.marker;
            a = a.pointPlacementToXValue();
            var g = C(this.pointPadding, f.pointPadding, 0),
              c = {
                x1: w(
                  Math.round(
                    n.len - (n.translate(this.x - h, !1, !0, !1, !0, -a) || 0)
                  ),
                  -n.len,
                  2 * n.len
                ),
                x2: w(
                  Math.round(
                    n.len - (n.translate(this.x + h, !1, !0, !1, !0, -a) || 0)
                  ),
                  -n.len,
                  2 * n.len
                ),
                y1: w(
                  Math.round(k.translate(this.y - p, !1, !0, !1, !0) || 0),
                  -k.len,
                  2 * k.len
                ),
                y2: w(
                  Math.round(k.translate(this.y + p, !1, !0, !1, !0) || 0),
                  -k.len,
                  2 * k.len
                ),
              };
            [
              ['width', 'x'],
              ['height', 'y'],
            ].forEach(function (a) {
              var b = a[0];
              a = a[1];
              var e = a + '1',
                f = a + '2',
                h = Math.abs(c[e] - c[f]),
                k = (d && d.lineWidth) || 0,
                m = Math.abs(c[e] + c[f]) / 2;
              d[b] &&
                d[b] < h &&
                ((c[e] = m - d[b] / 2 - k / 2), (c[f] = m + d[b] / 2 + k / 2));
              g &&
                ('y' === a && ((e = f), (f = a + '1')),
                (c[e] += g),
                (c[f] -= g));
            });
            return c;
          },
        })
      );
      ('');
    }
  );
  t(a, 'masters/modules/heatmap.src.js', [], function () {});
});
