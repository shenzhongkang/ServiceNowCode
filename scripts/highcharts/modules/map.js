/*! RESOURCE: /scripts/highcharts/modules/map.js */
(function (a) {
  'object' === typeof module && module.exports
    ? ((a['default'] = a), (module.exports = a))
    : 'function' === typeof define && define.amd
    ? define('highcharts/modules/map', ['highcharts'], function (B) {
        a(B);
        a.Highcharts = B;
        return a;
      })
    : a('undefined' !== typeof Highcharts ? Highcharts : void 0);
})(function (a) {
  function B(a, n, h, q) {
    a.hasOwnProperty(n) || (a[n] = q.apply(null, h));
  }
  a = a ? a._modules : {};
  B(
    a,
    'Core/Axis/MapAxis.js',
    [a['Core/Axis/Axis.js'], a['Core/Utilities.js']],
    function (a, n) {
      var h = n.addEvent,
        q = n.pick,
        c = (function () {
          return function (a) {
            this.axis = a;
          };
        })();
      n = (function () {
        function a() {}
        a.compose = function (a) {
          a.keepProps.push('mapAxis');
          h(a, 'init', function () {
            this.mapAxis || (this.mapAxis = new c(this));
          });
          h(a, 'getSeriesExtremes', function () {
            if (this.mapAxis) {
              var a = [];
              this.isXAxis &&
                (this.series.forEach(function (c, m) {
                  c.useMapGeometry && ((a[m] = c.xData), (c.xData = []));
                }),
                (this.mapAxis.seriesXData = a));
            }
          });
          h(a, 'afterGetSeriesExtremes', function () {
            if (this.mapAxis) {
              var a = this.mapAxis.seriesXData || [],
                c;
              if (this.isXAxis) {
                var m = q(this.dataMin, Number.MAX_VALUE);
                var k = q(this.dataMax, -Number.MAX_VALUE);
                this.series.forEach(function (p, u) {
                  p.useMapGeometry &&
                    ((m = Math.min(m, q(p.minX, m))),
                    (k = Math.max(k, q(p.maxX, k))),
                    (p.xData = a[u]),
                    (c = !0));
                });
                c && ((this.dataMin = m), (this.dataMax = k));
                this.mapAxis.seriesXData = void 0;
              }
            }
          });
          h(a, 'afterSetAxisTranslation', function () {
            if (this.mapAxis) {
              var a = this.chart,
                c = a.plotWidth / a.plotHeight;
              a = a.xAxis[0];
              var m;
              'yAxis' === this.coll &&
                'undefined' !== typeof a.transA &&
                this.series.forEach(function (a) {
                  a.preserveAspectRatio && (m = !0);
                });
              if (
                m &&
                ((this.transA = a.transA = Math.min(this.transA, a.transA)),
                (c /= (a.max - a.min) / (this.max - this.min)),
                (c = 1 > c ? this : a),
                (a = (c.max - c.min) * c.transA),
                (c.mapAxis.pixelPadding = c.len - a),
                (c.minPixelPadding = c.mapAxis.pixelPadding / 2),
                (a = c.mapAxis.fixTo))
              ) {
                a = a[1] - c.toValue(a[0], !0);
                a *= c.transA;
                if (
                  Math.abs(a) > c.minPixelPadding ||
                  (c.min === c.dataMin && c.max === c.dataMax)
                )
                  a = 0;
                c.minPixelPadding -= a;
              }
            }
          });
          h(a, 'render', function () {
            this.mapAxis && (this.mapAxis.fixTo = void 0);
          });
        };
        return a;
      })();
      n.compose(a);
      return n;
    }
  );
  B(a, 'Mixins/ColorSeries.js', [], function () {
    return {
      colorPointMixin: {
        setVisible: function (a) {
          var n = this,
            h = a ? 'show' : 'hide';
          n.visible = n.options.visible = !!a;
          ['graphic', 'dataLabel'].forEach(function (a) {
            if (n[a]) n[a][h]();
          });
          this.series.buildKDTree();
        },
      },
      colorSeriesMixin: {
        optionalAxis: 'colorAxis',
        colorAxis: 0,
        translateColors: function () {
          var a = this,
            n = this.options.nullColor,
            h = this.colorAxis,
            q = this.colorKey;
          (this.data.length ? this.data : this.points).forEach(function (c) {
            var r = c.getNestedProperty(q);
            (r =
              c.options.color ||
              (c.isNull || null === c.value
                ? n
                : h && 'undefined' !== typeof r
                ? h.toColor(r, c)
                : c.color || a.color)) &&
              c.color !== r &&
              ((c.color = r),
              'point' === a.options.legendType &&
                c.legendItem &&
                a.chart.legend.colorizeItem(c, c.visible));
          });
        },
      },
    };
  });
  B(
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
    function (a, n, h, q, c, r, D, y, A, m, k) {
      var p =
          (this && this.__extends) ||
          (function () {
            var b = function (f, l) {
              b =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (l, f) {
                    l.__proto__ = f;
                  }) ||
                function (l, f) {
                  for (var b in f) f.hasOwnProperty(b) && (l[b] = f[b]);
                };
              return b(f, l);
            };
            return function (f, l) {
              function e() {
                this.constructor = f;
              }
              b(f, l);
              f.prototype =
                null === l
                  ? Object.create(l)
                  : ((e.prototype = l.prototype), new e());
            };
          })(),
        u = h.parse;
      h = q.colorPointMixin;
      q = q.colorSeriesMixin;
      var E = r.noop,
        x = k.addEvent,
        C = k.erase,
        g = k.extend,
        e = k.isNumber,
        b = k.merge,
        t = k.pick,
        d = k.splat;
      ('');
      g(A.prototype, q);
      g(m.prototype, h);
      n.prototype.collectionsWithUpdate.push('colorAxis');
      n.prototype.collectionsWithInit.colorAxis = [n.prototype.addColorAxis];
      var z = (function (d) {
        function f(l, f) {
          var b = d.call(this, l, f) || this;
          b.beforePadding = !1;
          b.chart = void 0;
          b.coll = 'colorAxis';
          b.dataClasses = void 0;
          b.legendItem = void 0;
          b.legendItems = void 0;
          b.name = '';
          b.options = void 0;
          b.stops = void 0;
          b.visible = !0;
          b.init(l, f);
          return b;
        }
        p(f, d);
        f.buildOptions = function (l, f, e) {
          l = l.options.legend || {};
          var d = e.layout ? 'vertical' !== e.layout : 'vertical' !== l.layout;
          return b(f, { side: d ? 2 : 1, reversed: !d }, e, {
            opposite: !d,
            showEmpty: !1,
            title: null,
            visible: l.enabled && (e ? !1 !== e.visible : !0),
          });
        };
        f.prototype.init = function (l, b) {
          var e = f.buildOptions(l, f.defaultOptions, b);
          this.coll = 'colorAxis';
          d.prototype.init.call(this, l, e);
          b.dataClasses && this.initDataClasses(b);
          this.initStops();
          this.horiz = !e.opposite;
          this.zoomEnabled = !1;
        };
        f.prototype.initDataClasses = function (l) {
          var f = this.chart,
            e,
            d = 0,
            t = f.options.chart.colorCount,
            g = this.options,
            a = l.dataClasses.length;
          this.dataClasses = e = [];
          this.legendItems = [];
          l.dataClasses.forEach(function (l, p) {
            l = b(l);
            e.push(l);
            if (f.styledMode || !l.color)
              'category' === g.dataClassColor
                ? (f.styledMode ||
                    ((p = f.options.colors), (t = p.length), (l.color = p[d])),
                  (l.colorIndex = d),
                  d++,
                  d === t && (d = 0))
                : (l.color = u(g.minColor).tweenTo(
                    u(g.maxColor),
                    2 > a ? 0.5 : p / (a - 1)
                  ));
          });
        };
        f.prototype.hasData = function () {
          return !!(this.tickPositions || []).length;
        };
        f.prototype.setTickPositions = function () {
          if (!this.dataClasses) return d.prototype.setTickPositions.call(this);
        };
        f.prototype.initStops = function () {
          this.stops = this.options.stops || [
            [0, this.options.minColor],
            [1, this.options.maxColor],
          ];
          this.stops.forEach(function (l) {
            l.color = u(l[1]);
          });
        };
        f.prototype.setOptions = function (l) {
          d.prototype.setOptions.call(this, l);
          this.options.crosshair = this.options.marker;
        };
        f.prototype.setAxisSize = function () {
          var l = this.legendSymbol,
            b = this.chart,
            e = b.options.legend || {},
            d,
            t;
          l
            ? ((this.left = e = l.attr('x')),
              (this.top = d = l.attr('y')),
              (this.width = t = l.attr('width')),
              (this.height = l = l.attr('height')),
              (this.right = b.chartWidth - e - t),
              (this.bottom = b.chartHeight - d - l),
              (this.len = this.horiz ? t : l),
              (this.pos = this.horiz ? e : d))
            : (this.len =
                (this.horiz ? e.symbolWidth : e.symbolHeight) ||
                f.defaultLegendLength);
        };
        f.prototype.normalizedValue = function (l) {
          this.logarithmic && (l = this.logarithmic.log2lin(l));
          return 1 - (this.max - l) / (this.max - this.min || 1);
        };
        f.prototype.toColor = function (l, f) {
          var b = this.dataClasses,
            e = this.stops,
            d;
          if (b)
            for (d = b.length; d--; ) {
              var t = b[d];
              var g = t.from;
              e = t.to;
              if (
                ('undefined' === typeof g || l >= g) &&
                ('undefined' === typeof e || l <= e)
              ) {
                var a = t.color;
                f && ((f.dataClass = d), (f.colorIndex = t.colorIndex));
                break;
              }
            }
          else {
            l = this.normalizedValue(l);
            for (d = e.length; d-- && !(l > e[d][0]); );
            g = e[d] || e[d + 1];
            e = e[d + 1] || g;
            l = 1 - (e[0] - l) / (e[0] - g[0] || 1);
            a = g.color.tweenTo(e.color, l);
          }
          return a;
        };
        f.prototype.getOffset = function () {
          var l = this.legendGroup,
            f = this.chart.axisOffset[this.side];
          l &&
            ((this.axisParent = l),
            d.prototype.getOffset.call(this),
            this.added ||
              ((this.added = !0),
              (this.labelLeft = 0),
              (this.labelRight = this.width)),
            (this.chart.axisOffset[this.side] = f));
        };
        f.prototype.setLegendColor = function () {
          var l = this.reversed,
            f = l ? 1 : 0;
          l = l ? 0 : 1;
          f = this.horiz ? [f, 0, l, 0] : [0, l, 0, f];
          this.legendColor = {
            linearGradient: { x1: f[0], y1: f[1], x2: f[2], y2: f[3] },
            stops: this.stops,
          };
        };
        f.prototype.drawLegendSymbol = function (l, b) {
          var e = l.padding,
            d = l.options,
            g = this.horiz,
            a = t(d.symbolWidth, g ? f.defaultLegendLength : 12),
            p = t(d.symbolHeight, g ? 12 : f.defaultLegendLength),
            c = t(d.labelPadding, g ? 16 : 30);
          d = t(d.itemDistance, 10);
          this.setLegendColor();
          b.legendSymbol = this.chart.renderer
            .rect(0, l.baseline - 11, a, p)
            .attr({ zIndex: 1 })
            .add(b.legendGroup);
          this.legendItemWidth = a + e + (g ? d : c);
          this.legendItemHeight = p + e + (g ? c : 0);
        };
        f.prototype.setState = function (f) {
          this.series.forEach(function (l) {
            l.setState(f);
          });
        };
        f.prototype.setVisible = function () {};
        f.prototype.getSeriesExtremes = function () {
          var f = this.series,
            b = f.length,
            e;
          this.dataMin = Infinity;
          for (this.dataMax = -Infinity; b--; ) {
            var d = f[b];
            var g = (d.colorKey = t(
              d.options.colorKey,
              d.colorKey,
              d.pointValKey,
              d.zoneAxis,
              'y'
            ));
            var a = d.pointArrayMap;
            var p = d[g + 'Min'] && d[g + 'Max'];
            if (d[g + 'Data']) var c = d[g + 'Data'];
            else if (a) {
              c = [];
              a = a.indexOf(g);
              var k = d.yData;
              if (0 <= a && k)
                for (e = 0; e < k.length; e++) c.push(t(k[e][a], k[e]));
            } else c = d.yData;
            p
              ? ((d.minColorValue = d[g + 'Min']),
                (d.maxColorValue = d[g + 'Max']))
              : ((c = A.prototype.getExtremes.call(d, c)),
                (d.minColorValue = c.dataMin),
                (d.maxColorValue = c.dataMax));
            'undefined' !== typeof d.minColorValue &&
              ((this.dataMin = Math.min(this.dataMin, d.minColorValue)),
              (this.dataMax = Math.max(this.dataMax, d.maxColorValue)));
            p || A.prototype.applyExtremes.call(d);
          }
        };
        f.prototype.drawCrosshair = function (f, b) {
          var l = b && b.plotX,
            e = b && b.plotY,
            g = this.pos,
            t = this.len;
          if (b) {
            var a = this.toPixels(b.getNestedProperty(b.series.colorKey));
            a < g ? (a = g - 2) : a > g + t && (a = g + t + 2);
            b.plotX = a;
            b.plotY = this.len - a;
            d.prototype.drawCrosshair.call(this, f, b);
            b.plotX = l;
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
        f.prototype.getPlotLinePath = function (f) {
          var l = this.left,
            b = f.translatedValue,
            g = this.top;
          return e(b)
            ? this.horiz
              ? [['M', b - 4, g - 6], ['L', b + 4, g - 6], ['L', b, g], ['Z']]
              : [['M', l, b], ['L', l - 6, b + 6], ['L', l - 6, b - 6], ['Z']]
            : d.prototype.getPlotLinePath.call(this, f);
        };
        f.prototype.update = function (l, e) {
          var g = this.chart,
            t = g.legend,
            a = f.buildOptions(g, {}, l);
          this.series.forEach(function (f) {
            f.isDirtyData = !0;
          });
          ((l.dataClasses && t.allItems) || this.dataClasses) &&
            this.destroyItems();
          g.options[this.coll] = b(this.userOptions, a);
          d.prototype.update.call(this, a, e);
          this.legendItem && (this.setLegendColor(), t.colorizeItem(this, !0));
        };
        f.prototype.destroyItems = function () {
          var f = this.chart;
          this.legendItem
            ? f.legend.destroyItem(this)
            : this.legendItems &&
              this.legendItems.forEach(function (l) {
                f.legend.destroyItem(l);
              });
          f.isDirtyLegend = !0;
        };
        f.prototype.remove = function (f) {
          this.destroyItems();
          d.prototype.remove.call(this, f);
        };
        f.prototype.getDataClassLegendSymbols = function () {
          var f = this,
            b = f.chart,
            d = f.legendItems,
            e = b.options.legend,
            t = e.valueDecimals,
            a = e.valueSuffix || '',
            p;
          d.length ||
            f.dataClasses.forEach(function (l, e) {
              var c = !0,
                k = l.from,
                v = l.to,
                z = b.numberFormatter;
              p = '';
              'undefined' === typeof k
                ? (p = '< ')
                : 'undefined' === typeof v && (p = '> ');
              'undefined' !== typeof k && (p += z(k, t) + a);
              'undefined' !== typeof k &&
                'undefined' !== typeof v &&
                (p += ' - ');
              'undefined' !== typeof v && (p += z(v, t) + a);
              d.push(
                g(
                  {
                    chart: b,
                    name: p,
                    options: {},
                    drawLegendSymbol: y.drawRectangle,
                    visible: !0,
                    setState: E,
                    isDataClass: !0,
                    setVisible: function () {
                      c = f.visible = !c;
                      f.series.forEach(function (f) {
                        f.points.forEach(function (f) {
                          f.dataClass === e && f.setVisible(c);
                        });
                      });
                      b.legend.colorizeItem(this, c);
                    },
                  },
                  l
                )
              );
            });
          return d;
        };
        f.defaultLegendLength = 200;
        f.defaultOptions = {
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
        f.keepProps = [
          'legendGroup',
          'legendItemHeight',
          'legendItemWidth',
          'legendItem',
          'legendSymbol',
        ];
        return f;
      })(a);
      Array.prototype.push.apply(a.keepProps, z.keepProps);
      r.ColorAxis = z;
      ['fill', 'stroke'].forEach(function (b) {
        c.prototype[b + 'Setter'] = function () {
          this.elem.attr(
            b,
            u(this.start).tweenTo(u(this.end), this.pos),
            null,
            !0
          );
        };
      });
      x(n, 'afterGetAxes', function () {
        var b = this,
          f = b.options;
        this.colorAxis = [];
        f.colorAxis &&
          ((f.colorAxis = d(f.colorAxis)),
          f.colorAxis.forEach(function (f, d) {
            f.index = d;
            new z(b, f);
          }));
      });
      x(A, 'bindAxes', function () {
        var b = this.axisTypes;
        b
          ? -1 === b.indexOf('colorAxis') && b.push('colorAxis')
          : (this.axisTypes = ['colorAxis']);
      });
      x(D, 'afterGetAllItems', function (b) {
        var f = [],
          l,
          d;
        (this.chart.colorAxis || []).forEach(function (d) {
          (l = d.options) &&
            l.showInLegend &&
            (l.dataClasses && l.visible
              ? (f = f.concat(d.getDataClassLegendSymbols()))
              : l.visible && f.push(d),
            d.series.forEach(function (f) {
              if (!f.options.showInLegend || l.dataClasses)
                'point' === f.options.legendType
                  ? f.points.forEach(function (f) {
                      C(b.allItems, f);
                    })
                  : C(b.allItems, f);
            }));
        });
        for (d = f.length; d--; ) b.allItems.unshift(f[d]);
      });
      x(D, 'afterColorizeItem', function (b) {
        b.visible &&
          b.item.legendColor &&
          b.item.legendSymbol.attr({ fill: b.item.legendColor });
      });
      x(D, 'afterUpdate', function () {
        var b = this.chart.colorAxis;
        b &&
          b.forEach(function (f, b, d) {
            f.update({}, d);
          });
      });
      x(A, 'afterTranslate', function () {
        ((this.chart.colorAxis && this.chart.colorAxis.length) ||
          this.colorAttribs) &&
          this.translateColors();
      });
      return z;
    }
  );
  B(
    a,
    'Mixins/ColorMapSeries.js',
    [a['Core/Globals.js'], a['Core/Series/Point.js'], a['Core/Utilities.js']],
    function (a, n, h) {
      var q = h.defined;
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
            n.prototype.setState.call(this, a);
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
            var c = {};
            q(a.color) && (c[this.colorProp || 'fill'] = a.color);
            return c;
          },
        },
      };
    }
  );
  B(
    a,
    'Maps/MapNavigation.js',
    [a['Core/Chart/Chart.js'], a['Core/Globals.js'], a['Core/Utilities.js']],
    function (a, n, h) {
      function q(a) {
        a &&
          (a.preventDefault && a.preventDefault(),
          a.stopPropagation && a.stopPropagation(),
          (a.cancelBubble = !0));
      }
      function c(a) {
        this.init(a);
      }
      var r = n.doc,
        D = h.addEvent,
        y = h.extend,
        w = h.merge,
        m = h.objectEach,
        k = h.pick;
      c.prototype.init = function (a) {
        this.chart = a;
        a.mapNavButtons = [];
      };
      c.prototype.update = function (a) {
        var p = this.chart,
          c = p.options.mapNavigation,
          r,
          h,
          g,
          e,
          b,
          t = function (b) {
            this.handler.call(p, b);
            q(b);
          },
          d = p.mapNavButtons;
        a && (c = p.options.mapNavigation = w(p.options.mapNavigation, a));
        for (; d.length; ) d.pop().destroy();
        k(c.enableButtons, c.enabled) &&
          !p.renderer.forExport &&
          m(c.buttons, function (a, k) {
            r = w(c.buttonOptions, a);
            p.styledMode ||
              ((h = r.theme),
              (h.style = w(r.theme.style, r.style)),
              (e = (g = h.states) && g.hover),
              (b = g && g.select));
            a = p.renderer
              .button(
                r.text,
                0,
                0,
                t,
                h,
                e,
                b,
                0,
                'zoomIn' === k ? 'topbutton' : 'bottombutton'
              )
              .addClass(
                'highcharts-map-navigation highcharts-' +
                  { zoomIn: 'zoom-in', zoomOut: 'zoom-out' }[k]
              )
              .attr({
                width: r.width,
                height: r.height,
                title: p.options.lang[k],
                padding: r.padding,
                zIndex: 5,
              })
              .add();
            a.handler = r.onclick;
            D(a.element, 'dblclick', q);
            d.push(a);
            var f = r,
              l = D(p, 'load', function () {
                a.align(
                  y(f, { width: a.width, height: 2 * a.height }),
                  null,
                  f.alignTo
                );
                l();
              });
          });
        this.updateEvents(c);
      };
      c.prototype.updateEvents = function (a) {
        var c = this.chart;
        k(a.enableDoubleClickZoom, a.enabled) || a.enableDoubleClickZoomTo
          ? (this.unbindDblClick =
              this.unbindDblClick ||
              D(c.container, 'dblclick', function (a) {
                c.pointer.onContainerDblClick(a);
              }))
          : this.unbindDblClick &&
            (this.unbindDblClick = this.unbindDblClick());
        k(a.enableMouseWheelZoom, a.enabled)
          ? (this.unbindMouseWheel =
              this.unbindMouseWheel ||
              D(
                c.container,
                'undefined' === typeof r.onmousewheel
                  ? 'DOMMouseScroll'
                  : 'mousewheel',
                function (a) {
                  c.pointer.onContainerMouseWheel(a);
                  q(a);
                  return !1;
                }
              ))
          : this.unbindMouseWheel &&
            (this.unbindMouseWheel = this.unbindMouseWheel());
      };
      y(a.prototype, {
        fitToBox: function (a, c) {
          [
            ['x', 'width'],
            ['y', 'height'],
          ].forEach(function (p) {
            var k = p[0];
            p = p[1];
            a[k] + a[p] > c[k] + c[p] &&
              (a[p] > c[p]
                ? ((a[p] = c[p]), (a[k] = c[k]))
                : (a[k] = c[k] + c[p] - a[p]));
            a[p] > c[p] && (a[p] = c[p]);
            a[k] < c[k] && (a[k] = c[k]);
          });
          return a;
        },
        mapZoom: function (a, c, r, m, h) {
          var g = this.xAxis[0],
            e = g.max - g.min,
            b = k(c, g.min + e / 2),
            t = e * a;
          e = this.yAxis[0];
          var d = e.max - e.min,
            p = k(r, e.min + d / 2);
          d *= a;
          b = this.fitToBox(
            {
              x: b - t * (m ? (m - g.pos) / g.len : 0.5),
              y: p - d * (h ? (h - e.pos) / e.len : 0.5),
              width: t,
              height: d,
            },
            {
              x: g.dataMin,
              y: e.dataMin,
              width: g.dataMax - g.dataMin,
              height: e.dataMax - e.dataMin,
            }
          );
          t =
            b.x <= g.dataMin &&
            b.width >= g.dataMax - g.dataMin &&
            b.y <= e.dataMin &&
            b.height >= e.dataMax - e.dataMin;
          m && g.mapAxis && (g.mapAxis.fixTo = [m - g.pos, c]);
          h && e.mapAxis && (e.mapAxis.fixTo = [h - e.pos, r]);
          'undefined' === typeof a || t
            ? (g.setExtremes(void 0, void 0, !1),
              e.setExtremes(void 0, void 0, !1))
            : (g.setExtremes(b.x, b.x + b.width, !1),
              e.setExtremes(b.y, b.y + b.height, !1));
          this.redraw();
        },
      });
      D(a, 'beforeRender', function () {
        this.mapNavigation = new c(this);
        this.mapNavigation.update();
      });
      n.MapNavigation = c;
    }
  );
  B(
    a,
    'Maps/MapPointer.js',
    [a['Core/Pointer.js'], a['Core/Utilities.js']],
    function (a, n) {
      var h = n.extend,
        q = n.pick;
      n = n.wrap;
      h(a.prototype, {
        onContainerDblClick: function (a) {
          var c = this.chart;
          a = this.normalize(a);
          c.options.mapNavigation.enableDoubleClickZoomTo
            ? c.pointer.inClass(a.target, 'highcharts-tracker') &&
              c.hoverPoint &&
              c.hoverPoint.zoomTo()
            : c.isInsidePlot(a.chartX - c.plotLeft, a.chartY - c.plotTop) &&
              c.mapZoom(
                0.5,
                c.xAxis[0].toValue(a.chartX),
                c.yAxis[0].toValue(a.chartY),
                a.chartX,
                a.chartY
              );
        },
        onContainerMouseWheel: function (a) {
          var c = this.chart;
          a = this.normalize(a);
          var h = a.detail || -(a.wheelDelta / 120);
          c.isInsidePlot(a.chartX - c.plotLeft, a.chartY - c.plotTop) &&
            c.mapZoom(
              Math.pow(c.options.mapNavigation.mouseWheelSensitivity, h),
              c.xAxis[0].toValue(a.chartX),
              c.yAxis[0].toValue(a.chartY),
              a.chartX,
              a.chartY
            );
        },
      });
      n(a.prototype, 'zoomOption', function (a) {
        var c = this.chart.options.mapNavigation;
        q(c.enableTouchZoom, c.enabled) &&
          (this.chart.options.chart.pinchType = 'xy');
        a.apply(this, [].slice.call(arguments, 1));
      });
      n(a.prototype, 'pinchTranslate', function (a, h, n, q, w, m, k) {
        a.call(this, h, n, q, w, m, k);
        'map' === this.chart.options.chart.type &&
          this.hasZoom &&
          ((a = q.scaleX > q.scaleY),
          this.pinchTranslateDirection(
            !a,
            h,
            n,
            q,
            w,
            m,
            k,
            a ? q.scaleX : q.scaleY
          ));
      });
    }
  );
  B(
    a,
    'Maps/Map.js',
    [
      a['Core/Chart/Chart.js'],
      a['Core/Globals.js'],
      a['Core/Options.js'],
      a['Core/Renderer/SVG/SVGRenderer.js'],
      a['Core/Utilities.js'],
    ],
    function (a, n, h, q, c) {
      function r(a, c, k, m, h, g, e, b) {
        return [
          ['M', a + h, c],
          ['L', a + k - g, c],
          ['C', a + k - g / 2, c, a + k, c + g / 2, a + k, c + g],
          ['L', a + k, c + m - e],
          ['C', a + k, c + m - e / 2, a + k - e / 2, c + m, a + k - e, c + m],
          ['L', a + b, c + m],
          ['C', a + b / 2, c + m, a, c + m - b / 2, a, c + m - b],
          ['L', a, c + h],
          ['C', a, c + h / 2, a + h / 2, c, a + h, c],
          ['Z'],
        ];
      }
      h = h.defaultOptions;
      var D = c.extend,
        w = c.getOptions,
        A = c.merge,
        m = c.pick;
      c = n.Renderer;
      var k = n.VMLRenderer;
      D(h.lang, { zoomIn: 'Zoom in', zoomOut: 'Zoom out' });
      h.mapNavigation = {
        buttonOptions: {
          alignTo: 'plotBox',
          align: 'left',
          verticalAlign: 'top',
          x: 0,
          width: 18,
          height: 18,
          padding: 5,
          style: { fontSize: '15px', fontWeight: 'bold' },
          theme: { 'stroke-width': 1, 'text-align': 'center' },
        },
        buttons: {
          zoomIn: {
            onclick: function () {
              this.mapZoom(0.5);
            },
            text: '+',
            y: 0,
          },
          zoomOut: {
            onclick: function () {
              this.mapZoom(2);
            },
            text: '-',
            y: 28,
          },
        },
        mouseWheelSensitivity: 1.1,
      };
      h = n.splitPath = function (a) {
        'string' === typeof a &&
          ((a = a
            .replace(/([A-Za-z])/g, ' $1 ')
            .replace(/^\s*/, '')
            .replace(/\s*$/, '')),
          (a = a.split(/[ ,;]+/).map(function (a) {
            return /[A-za-z]/.test(a) ? a : parseFloat(a);
          })));
        return q.prototype.pathToSegments(a);
      };
      n.maps = {};
      q.prototype.symbols.topbutton = function (a, c, k, m, h) {
        h = (h && h.r) || 0;
        return r(a - 1, c - 1, k, m, h, h, 0, 0);
      };
      q.prototype.symbols.bottombutton = function (a, c, k, m, h) {
        h = (h && h.r) || 0;
        return r(a - 1, c - 1, k, m, 0, 0, h, h);
      };
      c === k &&
        ['topbutton', 'bottombutton'].forEach(function (a) {
          k.prototype.symbols[a] = q.prototype.symbols[a];
        });
      return {
        mapChart:
          (n.Map = n.mapChart =
            function (c, k, h) {
              var p = 'string' === typeof c || c.nodeName,
                n = arguments[p ? 1 : 0],
                g = n,
                e = {
                  endOnTick: !1,
                  visible: !1,
                  minPadding: 0,
                  maxPadding: 0,
                  startOnTick: !1,
                },
                b = w().credits;
              var t = n.series;
              n.series = null;
              n = A(
                {
                  chart: { panning: { enabled: !0, type: 'xy' }, type: 'map' },
                  credits: {
                    mapText: m(
                      b.mapText,
                      ' \u00a9 <a href="{geojson.copyrightUrl}">{geojson.copyrightShort}</a>'
                    ),
                    mapTextFull: m(b.mapTextFull, '{geojson.copyright}'),
                  },
                  tooltip: { followTouchMove: !1 },
                  xAxis: e,
                  yAxis: A(e, { reversed: !0 }),
                },
                n,
                { chart: { inverted: !1, alignTicks: !1 } }
              );
              n.series = g.series = t;
              return p ? new a(c, n, h) : new a(n, k);
            }),
        maps: n.maps,
        splitPath: h,
      };
    }
  );
  B(
    a,
    'Series/MapSeries.js',
    [
      a['Core/Series/Series.js'],
      a['Mixins/ColorMapSeries.js'],
      a['Core/Globals.js'],
      a['Mixins/LegendSymbol.js'],
      a['Maps/Map.js'],
      a['Core/Series/Point.js'],
      a['Core/Renderer/SVG/SVGRenderer.js'],
      a['Core/Utilities.js'],
    ],
    function (a, n, h, q, c, r, D, y) {
      var w = n.colorMapPointMixin,
        m = h.noop,
        k = c.maps,
        p = c.splitPath,
        u = y.extend,
        E = y.fireEvent,
        x = y.getNestedProperty,
        C = y.isArray,
        g = y.isNumber,
        e = y.merge,
        b = y.objectEach,
        t = y.pick,
        d = y.splat,
        z = h.Series,
        v = a.seriesTypes;
      a.seriesType(
        'map',
        'scatter',
        {
          animation: !1,
          dataLabels: {
            crop: !1,
            formatter: function () {
              return this.point.value;
            },
            inside: !0,
            overflow: !1,
            padding: 0,
            verticalAlign: 'middle',
          },
          marker: null,
          nullColor: '#f7f7f7',
          stickyTracking: !1,
          tooltip: {
            followPointer: !0,
            pointFormat: '{point.name}: {point.value}<br/>',
          },
          turboThreshold: 0,
          allAreas: !0,
          borderColor: '#cccccc',
          borderWidth: 1,
          joinBy: 'hc-key',
          states: {
            hover: { halo: null, brightness: 0.2 },
            normal: { animation: !0 },
            select: { color: '#cccccc' },
            inactive: { opacity: 1 },
          },
        },
        e(n.colorMapSeriesMixin, {
          type: 'map',
          getExtremesFromAll: !0,
          useMapGeometry: !0,
          forceDL: !0,
          searchPoint: m,
          directTouch: !0,
          preserveAspectRatio: !0,
          pointArrayMap: ['value'],
          setOptions: function (a) {
            a = z.prototype.setOptions.call(this, a);
            var f = a.joinBy;
            null === f && (f = '_i');
            f = this.joinBy = d(f);
            f[1] || (f[1] = f[0]);
            return a;
          },
          getBox: function (a) {
            var f = Number.MAX_VALUE,
              b = -f,
              d = f,
              e = -f,
              g = f,
              c = f,
              k = this.xAxis,
              h = this.yAxis,
              z;
            (a || []).forEach(function (a) {
              if (a.path) {
                'string' === typeof a.path
                  ? (a.path = p(a.path))
                  : 'M' === a.path[0] &&
                    (a.path = D.prototype.pathToSegments(a.path));
                var l = a.path || [],
                  k = -f,
                  h = f,
                  m = -f,
                  v = f,
                  n = a.properties;
                a._foundBox ||
                  (l.forEach(function (a) {
                    var f = a[a.length - 2];
                    a = a[a.length - 1];
                    'number' === typeof f &&
                      'number' === typeof a &&
                      ((h = Math.min(h, f)),
                      (k = Math.max(k, f)),
                      (v = Math.min(v, a)),
                      (m = Math.max(m, a)));
                  }),
                  (a._midX =
                    h + (k - h) * t(a.middleX, n && n['hc-middle-x'], 0.5)),
                  (a._midY =
                    v + (m - v) * t(a.middleY, n && n['hc-middle-y'], 0.5)),
                  (a._maxX = k),
                  (a._minX = h),
                  (a._maxY = m),
                  (a._minY = v),
                  (a.labelrank = t(a.labelrank, (k - h) * (m - v))),
                  (a._foundBox = !0));
                b = Math.max(b, a._maxX);
                d = Math.min(d, a._minX);
                e = Math.max(e, a._maxY);
                g = Math.min(g, a._minY);
                c = Math.min(a._maxX - a._minX, a._maxY - a._minY, c);
                z = !0;
              }
            });
            z &&
              ((this.minY = Math.min(g, t(this.minY, f))),
              (this.maxY = Math.max(e, t(this.maxY, -f))),
              (this.minX = Math.min(d, t(this.minX, f))),
              (this.maxX = Math.max(b, t(this.maxX, -f))),
              k &&
                'undefined' === typeof k.options.minRange &&
                (k.minRange = Math.min(
                  5 * c,
                  (this.maxX - this.minX) / 5,
                  k.minRange || f
                )),
              h &&
                'undefined' === typeof h.options.minRange &&
                (h.minRange = Math.min(
                  5 * c,
                  (this.maxY - this.minY) / 5,
                  h.minRange || f
                )));
          },
          hasData: function () {
            return !!this.processedXData.length;
          },
          getExtremes: function () {
            var a = z.prototype.getExtremes.call(this, this.valueData),
              b = a.dataMin;
            a = a.dataMax;
            this.chart.hasRendered &&
              this.isDirtyData &&
              this.getBox(this.options.data);
            g(b) && (this.valueMin = b);
            g(a) && (this.valueMax = a);
            return { dataMin: this.minY, dataMax: this.maxY };
          },
          translatePath: function (a) {
            var f = this.xAxis,
              b = this.yAxis,
              d = f.min,
              e = f.transA,
              g = f.minPixelPadding,
              c = b.min,
              t = b.transA,
              k = b.minPixelPadding,
              h = [];
            a &&
              a.forEach(function (a) {
                'M' === a[0]
                  ? h.push([
                      'M',
                      (a[1] - (d || 0)) * e + g,
                      (a[2] - (c || 0)) * t + k,
                    ])
                  : 'L' === a[0]
                  ? h.push([
                      'L',
                      (a[1] - (d || 0)) * e + g,
                      (a[2] - (c || 0)) * t + k,
                    ])
                  : 'C' === a[0]
                  ? h.push([
                      'C',
                      (a[1] - (d || 0)) * e + g,
                      (a[2] - (c || 0)) * t + k,
                      (a[3] - (d || 0)) * e + g,
                      (a[4] - (c || 0)) * t + k,
                      (a[5] - (d || 0)) * e + g,
                      (a[6] - (c || 0)) * t + k,
                    ])
                  : 'Q' === a[0]
                  ? h.push([
                      'Q',
                      (a[1] - (d || 0)) * e + g,
                      (a[2] - (c || 0)) * t + k,
                      (a[3] - (d || 0)) * e + g,
                      (a[4] - (c || 0)) * t + k,
                    ])
                  : 'Z' === a[0] && h.push(['Z']);
              });
            return h;
          },
          setData: function (a, d, c, t) {
            var f = this.options,
              l = this.chart.options.chart,
              p = l && l.map,
              m = f.mapData,
              v = this.joinBy,
              n = f.keys || this.pointArrayMap,
              F = [],
              q = {},
              u = this.chart.mapTransforms;
            !m && p && (m = 'string' === typeof p ? k[p] : p);
            a &&
              a.forEach(function (b, d) {
                var e = 0;
                if (g(b)) a[d] = { value: b };
                else if (C(b)) {
                  a[d] = {};
                  !f.keys &&
                    b.length > n.length &&
                    'string' === typeof b[0] &&
                    ((a[d]['hc-key'] = b[0]), ++e);
                  for (var l = 0; l < n.length; ++l, ++e)
                    n[l] &&
                      'undefined' !== typeof b[e] &&
                      (0 < n[l].indexOf('.')
                        ? r.prototype.setNestedProperty(a[d], b[e], n[l])
                        : (a[d][n[l]] = b[e]));
                }
                v && '_i' === v[0] && (a[d]._i = d);
              });
            this.getBox(a);
            (this.chart.mapTransforms = u =
              (l && l.mapTransforms) || (m && m['hc-transform']) || u) &&
              b(u, function (a) {
                a.rotation &&
                  ((a.cosAngle = Math.cos(a.rotation)),
                  (a.sinAngle = Math.sin(a.rotation)));
              });
            if (m) {
              'FeatureCollection' === m.type &&
                ((this.mapTitle = m.title),
                (m = h.geojson(m, this.type, this)));
              this.mapData = m;
              this.mapMap = {};
              for (u = 0; u < m.length; u++)
                (l = m[u]),
                  (p = l.properties),
                  (l._i = u),
                  v[0] && p && p[v[0]] && (l[v[0]] = p[v[0]]),
                  (q[l[v[0]]] = l);
              this.mapMap = q;
              if (a && v[1]) {
                var G = v[1];
                a.forEach(function (a) {
                  a = x(G, a);
                  q[a] && F.push(q[a]);
                });
              }
              if (f.allAreas) {
                this.getBox(m);
                a = a || [];
                if (v[1]) {
                  var w = v[1];
                  a.forEach(function (a) {
                    F.push(x(w, a));
                  });
                }
                F =
                  '|' +
                  F.map(function (a) {
                    return a && a[v[0]];
                  }).join('|') +
                  '|';
                m.forEach(function (f) {
                  (v[0] && -1 !== F.indexOf('|' + f[v[0]] + '|')) ||
                    (a.push(e(f, { value: null })), (t = !1));
                });
              } else this.getBox(F);
            }
            z.prototype.setData.call(this, a, d, c, t);
          },
          drawGraph: m,
          drawDataLabels: m,
          doFullTranslate: function () {
            return (
              this.isDirtyData ||
              this.chart.isResizing ||
              this.chart.renderer.isVML ||
              !this.baseTrans
            );
          },
          translate: function () {
            var a = this,
              b = a.xAxis,
              d = a.yAxis,
              e = a.doFullTranslate();
            a.generatePoints();
            a.data.forEach(function (f) {
              g(f._midX) &&
                g(f._midY) &&
                ((f.plotX = b.toPixels(f._midX, !0)),
                (f.plotY = d.toPixels(f._midY, !0)));
              e &&
                ((f.shapeType = 'path'),
                (f.shapeArgs = { d: a.translatePath(f.path) }));
            });
            E(a, 'afterTranslate');
          },
          pointAttribs: function (a, b) {
            b = a.series.chart.styledMode
              ? this.colorAttribs(a)
              : v.column.prototype.pointAttribs.call(this, a, b);
            b['stroke-width'] = t(
              a.options[
                (this.pointAttrToOptions &&
                  this.pointAttrToOptions['stroke-width']) ||
                  'borderWidth'
              ],
              'inherit'
            );
            return b;
          },
          drawPoints: function () {
            var a = this,
              b = a.xAxis,
              d = a.yAxis,
              e = a.group,
              g = a.chart,
              c = g.renderer,
              k = this.baseTrans;
            a.transformGroup ||
              ((a.transformGroup = c.g().attr({ scaleX: 1, scaleY: 1 }).add(e)),
              (a.transformGroup.survive = !0));
            if (a.doFullTranslate())
              g.hasRendered &&
                !g.styledMode &&
                a.points.forEach(function (b) {
                  b.shapeArgs &&
                    (b.shapeArgs.fill = a.pointAttribs(b, b.state).fill);
                }),
                (a.group = a.transformGroup),
                v.column.prototype.drawPoints.apply(a),
                (a.group = e),
                a.points.forEach(function (b) {
                  if (b.graphic) {
                    var f = '';
                    b.name &&
                      (f +=
                        'highcharts-name-' +
                        b.name.replace(/ /g, '-').toLowerCase());
                    b.properties &&
                      b.properties['hc-key'] &&
                      (f +=
                        ' highcharts-key-' +
                        b.properties['hc-key'].toLowerCase());
                    f && b.graphic.addClass(f);
                    g.styledMode &&
                      b.graphic.css(
                        a.pointAttribs(b, (b.selected && 'select') || void 0)
                      );
                  }
                }),
                (this.baseTrans = {
                  originX: b.min - b.minPixelPadding / b.transA,
                  originY:
                    d.min -
                    d.minPixelPadding / d.transA +
                    (d.reversed ? 0 : d.len / d.transA),
                  transAX: b.transA,
                  transAY: d.transA,
                }),
                this.transformGroup.animate({
                  translateX: 0,
                  translateY: 0,
                  scaleX: 1,
                  scaleY: 1,
                });
            else {
              var h = b.transA / k.transAX;
              var m = d.transA / k.transAY;
              var p = b.toPixels(k.originX, !0);
              var z = d.toPixels(k.originY, !0);
              0.99 < h &&
                1.01 > h &&
                0.99 < m &&
                1.01 > m &&
                ((m = h = 1), (p = Math.round(p)), (z = Math.round(z)));
              var n = this.transformGroup;
              if (g.renderer.globalAnimation) {
                var r = n.attr('translateX');
                var q = n.attr('translateY');
                var u = n.attr('scaleX');
                var w = n.attr('scaleY');
                n.attr({ animator: 0 }).animate(
                  { animator: 1 },
                  {
                    step: function (a, b) {
                      n.attr({
                        translateX: r + (p - r) * b.pos,
                        translateY: q + (z - q) * b.pos,
                        scaleX: u + (h - u) * b.pos,
                        scaleY: w + (m - w) * b.pos,
                      });
                    },
                  }
                );
              } else
                n.attr({ translateX: p, translateY: z, scaleX: h, scaleY: m });
            }
            g.styledMode ||
              e.element.setAttribute(
                'stroke-width',
                t(
                  a.options[
                    (a.pointAttrToOptions &&
                      a.pointAttrToOptions['stroke-width']) ||
                      'borderWidth'
                  ],
                  1
                ) / (h || 1)
              );
            this.drawMapDataLabels();
          },
          drawMapDataLabels: function () {
            z.prototype.drawDataLabels.call(this);
            this.dataLabelsGroup &&
              this.dataLabelsGroup.clip(this.chart.clipRect);
          },
          render: function () {
            var a = this,
              b = z.prototype.render;
            a.chart.renderer.isVML && 3e3 < a.data.length
              ? setTimeout(function () {
                  b.call(a);
                })
              : b.call(a);
          },
          animate: function (a) {
            var b = this.options.animation,
              d = this.group,
              f = this.xAxis,
              e = this.yAxis,
              g = f.pos,
              c = e.pos;
            this.chart.renderer.isSVG &&
              (!0 === b && (b = { duration: 1e3 }),
              a
                ? d.attr({
                    translateX: g + f.len / 2,
                    translateY: c + e.len / 2,
                    scaleX: 0.001,
                    scaleY: 0.001,
                  })
                : d.animate(
                    { translateX: g, translateY: c, scaleX: 1, scaleY: 1 },
                    b
                  ));
          },
          animateDrilldown: function (a) {
            var b = this.chart.plotBox,
              d =
                this.chart.drilldownLevels[
                  this.chart.drilldownLevels.length - 1
                ],
              f = d.bBox,
              e = this.chart.options.drilldown.animation;
            a ||
              ((a = Math.min(f.width / b.width, f.height / b.height)),
              (d.shapeArgs = {
                scaleX: a,
                scaleY: a,
                translateX: f.x,
                translateY: f.y,
              }),
              this.points.forEach(function (a) {
                a.graphic &&
                  a.graphic
                    .attr(d.shapeArgs)
                    .animate(
                      { scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 },
                      e
                    );
              }));
          },
          drawLegendSymbol: q.drawRectangle,
          animateDrillupFrom: function (a) {
            v.column.prototype.animateDrillupFrom.call(this, a);
          },
          animateDrillupTo: function (a) {
            v.column.prototype.animateDrillupTo.call(this, a);
          },
        }),
        u(
          {
            applyOptions: function (a, b) {
              var d = this.series;
              a = r.prototype.applyOptions.call(this, a, b);
              b = d.joinBy;
              d.mapData &&
                d.mapMap &&
                ((b = r.prototype.getNestedProperty.call(a, b[1])),
                (b = 'undefined' !== typeof b && d.mapMap[b])
                  ? (d.xyFromShape && ((a.x = b._midX), (a.y = b._midY)),
                    u(a, b))
                  : (a.value = a.value || null));
              return a;
            },
            onMouseOver: function (a) {
              y.clearTimeout(this.colorInterval);
              if (null !== this.value || this.series.options.nullInteraction)
                r.prototype.onMouseOver.call(this, a);
              else this.series.onMouseOut(a);
            },
            zoomTo: function () {
              var a = this.series;
              a.xAxis.setExtremes(this._minX, this._maxX, !1);
              a.yAxis.setExtremes(this._minY, this._maxY, !1);
              a.chart.redraw();
            },
          },
          w
        )
      );
      ('');
    }
  );
  B(a, 'Series/MapLineSeries.js', [a['Core/Series/Series.js']], function (a) {
    var n = a.seriesTypes;
    a.seriesType(
      'mapline',
      'map',
      { lineWidth: 1, fillColor: 'none' },
      {
        type: 'mapline',
        colorProp: 'stroke',
        pointAttrToOptions: { stroke: 'color', 'stroke-width': 'lineWidth' },
        pointAttribs: function (a, q) {
          a = n.map.prototype.pointAttribs.call(this, a, q);
          a.fill = this.options.fillColor;
          return a;
        },
        drawLegendSymbol: n.line.prototype.drawLegendSymbol,
      }
    );
    ('');
  });
  B(
    a,
    'Series/MapPointSeries.js',
    [
      a['Core/Series/Series.js'],
      a['Core/Globals.js'],
      a['Core/Series/Point.js'],
      a['Core/Utilities.js'],
    ],
    function (a, n, h, q) {
      var c = q.merge,
        r = n.Series;
      a.seriesType(
        'mappoint',
        'scatter',
        {
          dataLabels: {
            crop: !1,
            defer: !1,
            enabled: !0,
            formatter: function () {
              return this.point.name;
            },
            overflow: !1,
            style: { color: '#000000' },
          },
        },
        {
          type: 'mappoint',
          forceDL: !0,
          drawDataLabels: function () {
            r.prototype.drawDataLabels.call(this);
            this.dataLabelsGroup &&
              this.dataLabelsGroup.clip(this.chart.clipRect);
          },
        },
        {
          applyOptions: function (a, n) {
            a =
              'undefined' !== typeof a.lat && 'undefined' !== typeof a.lon
                ? c(a, this.series.chart.fromLatLonToPoint(a))
                : a;
            return h.prototype.applyOptions.call(this, a, n);
          },
        }
      );
      ('');
    }
  );
  B(
    a,
    'Series/Bubble/BubbleLegend.js',
    [
      a['Core/Chart/Chart.js'],
      a['Core/Color/Color.js'],
      a['Core/Globals.js'],
      a['Core/Legend.js'],
      a['Core/Utilities.js'],
    ],
    function (a, n, h, q, c) {
      var r = n.parse;
      n = c.addEvent;
      var w = c.arrayMax,
        y = c.arrayMin,
        A = c.isNumber,
        m = c.merge,
        k = c.objectEach,
        p = c.pick,
        u = c.setOptions,
        E = c.stableSort,
        x = c.wrap;
      ('');
      var C = h.Series,
        g = h.noop;
      u({
        legend: {
          bubbleLegend: {
            borderColor: void 0,
            borderWidth: 2,
            className: void 0,
            color: void 0,
            connectorClassName: void 0,
            connectorColor: void 0,
            connectorDistance: 60,
            connectorWidth: 1,
            enabled: !1,
            labels: {
              className: void 0,
              allowOverlap: !1,
              format: '',
              formatter: void 0,
              align: 'right',
              style: { fontSize: 10, color: void 0 },
              x: 0,
              y: 0,
            },
            maxSize: 60,
            minSize: 10,
            legendIndex: 0,
            ranges: {
              value: void 0,
              borderColor: void 0,
              color: void 0,
              connectorColor: void 0,
            },
            sizeBy: 'area',
            sizeByAbsoluteValue: !1,
            zIndex: 1,
            zThreshold: 0,
          },
        },
      });
      u = (function () {
        function a(a, e) {
          this.options =
            this.symbols =
            this.visible =
            this.ranges =
            this.movementX =
            this.maxLabel =
            this.legendSymbol =
            this.legendItemWidth =
            this.legendItemHeight =
            this.legendItem =
            this.legendGroup =
            this.legend =
            this.fontMetrics =
            this.chart =
              void 0;
          this.setState = g;
          this.init(a, e);
        }
        a.prototype.init = function (a, e) {
          this.options = a;
          this.visible = !0;
          this.chart = e.chart;
          this.legend = e;
        };
        a.prototype.addToLegend = function (a) {
          a.splice(this.options.legendIndex, 0, this);
        };
        a.prototype.drawLegendSymbol = function (a) {
          var b = this.chart,
            d = this.options,
            e = p(a.options.itemDistance, 20),
            g = d.ranges;
          var f = d.connectorDistance;
          this.fontMetrics = b.renderer.fontMetrics(
            d.labels.style.fontSize.toString() + 'px'
          );
          g && g.length && A(g[0].value)
            ? (E(g, function (a, b) {
                return b.value - a.value;
              }),
              (this.ranges = g),
              this.setOptions(),
              this.render(),
              (b = this.getMaxLabelSize()),
              (g = this.ranges[0].radius),
              (a = 2 * g),
              (f = f - g + b.width),
              (f = 0 < f ? f : 0),
              (this.maxLabel = b),
              (this.movementX = 'left' === d.labels.align ? f : 0),
              (this.legendItemWidth = a + f + e),
              (this.legendItemHeight = a + this.fontMetrics.h / 2))
            : (a.options.bubbleLegend.autoRanges = !0);
        };
        a.prototype.setOptions = function () {
          var a = this.ranges,
            e = this.options,
            d = this.chart.series[e.seriesIndex],
            g = this.legend.baseline,
            c = { 'z-index': e.zIndex, 'stroke-width': e.borderWidth },
            f = { 'z-index': e.zIndex, 'stroke-width': e.connectorWidth },
            l = this.getLabelStyles(),
            k = d.options.marker.fillOpacity,
            h = this.chart.styledMode;
          a.forEach(function (b, t) {
            h ||
              ((c.stroke = p(b.borderColor, e.borderColor, d.color)),
              (c.fill = p(
                b.color,
                e.color,
                1 !== k ? r(d.color).setOpacity(k).get('rgba') : d.color
              )),
              (f.stroke = p(b.connectorColor, e.connectorColor, d.color)));
            a[t].radius = this.getRangeRadius(b.value);
            a[t] = m(a[t], { center: a[0].radius - a[t].radius + g });
            h ||
              m(!0, a[t], {
                bubbleStyle: m(!1, c),
                connectorStyle: m(!1, f),
                labelStyle: l,
              });
          }, this);
        };
        a.prototype.getLabelStyles = function () {
          var a = this.options,
            e = {},
            d = 'left' === a.labels.align,
            g = this.legend.options.rtl;
          k(a.labels.style, function (a, b) {
            'color' !== b && 'fontSize' !== b && 'z-index' !== b && (e[b] = a);
          });
          return m(!1, e, {
            'font-size': a.labels.style.fontSize,
            fill: p(a.labels.style.color, '#000000'),
            'z-index': a.zIndex,
            align: g || d ? 'right' : 'left',
          });
        };
        a.prototype.getRangeRadius = function (a) {
          var b = this.options;
          return this.chart.series[this.options.seriesIndex].getRadius.call(
            this,
            b.ranges[b.ranges.length - 1].value,
            b.ranges[0].value,
            b.minSize,
            b.maxSize,
            a
          );
        };
        a.prototype.render = function () {
          var a = this.chart.renderer,
            e = this.options.zThreshold;
          this.symbols ||
            (this.symbols = { connectors: [], bubbleItems: [], labels: [] });
          this.legendSymbol = a.g('bubble-legend');
          this.legendItem = a.g('bubble-legend-item');
          this.legendSymbol.translateX = 0;
          this.legendSymbol.translateY = 0;
          this.ranges.forEach(function (a) {
            a.value >= e && this.renderRange(a);
          }, this);
          this.legendSymbol.add(this.legendItem);
          this.legendItem.add(this.legendGroup);
          this.hideOverlappingLabels();
        };
        a.prototype.renderRange = function (a) {
          var b = this.options,
            d = b.labels,
            e = this.chart.renderer,
            g = this.symbols,
            f = g.labels,
            c = a.center,
            k = Math.abs(a.radius),
            h = b.connectorDistance || 0,
            m = d.align,
            p = d.style.fontSize;
          h = this.legend.options.rtl || 'left' === m ? -h : h;
          d = b.connectorWidth;
          var n = this.ranges[0].radius || 0,
            r = c - k - b.borderWidth / 2 + d / 2;
          p = p / 2 - (this.fontMetrics.h - p) / 2;
          var q = e.styledMode;
          'center' === m &&
            ((h = 0),
            (b.connectorDistance = 0),
            (a.labelStyle.align = 'center'));
          m = r + b.labels.y;
          var u = n + h + b.labels.x;
          g.bubbleItems.push(
            e
              .circle(n, c + ((r % 1 ? 1 : 0.5) - (d % 2 ? 0 : 0.5)), k)
              .attr(q ? {} : a.bubbleStyle)
              .addClass(
                (q
                  ? 'highcharts-color-' + this.options.seriesIndex + ' '
                  : '') +
                  'highcharts-bubble-legend-symbol ' +
                  (b.className || '')
              )
              .add(this.legendSymbol)
          );
          g.connectors.push(
            e
              .path(
                e.crispLine(
                  [
                    ['M', n, r],
                    ['L', n + h, r],
                  ],
                  b.connectorWidth
                )
              )
              .attr(q ? {} : a.connectorStyle)
              .addClass(
                (q
                  ? 'highcharts-color-' + this.options.seriesIndex + ' '
                  : '') +
                  'highcharts-bubble-legend-connectors ' +
                  (b.connectorClassName || '')
              )
              .add(this.legendSymbol)
          );
          a = e
            .text(this.formatLabel(a), u, m + p)
            .attr(q ? {} : a.labelStyle)
            .addClass(
              'highcharts-bubble-legend-labels ' + (b.labels.className || '')
            )
            .add(this.legendSymbol);
          f.push(a);
          a.placed = !0;
          a.alignAttr = { x: u, y: m + p };
        };
        a.prototype.getMaxLabelSize = function () {
          var a, e;
          this.symbols.labels.forEach(function (b) {
            e = b.getBBox(!0);
            a = a ? (e.width > a.width ? e : a) : e;
          });
          return a || {};
        };
        a.prototype.formatLabel = function (a) {
          var b = this.options,
            d = b.labels.formatter;
          b = b.labels.format;
          var e = this.chart.numberFormatter;
          return b ? c.format(b, a) : d ? d.call(a) : e(a.value, 1);
        };
        a.prototype.hideOverlappingLabels = function () {
          var a = this.chart,
            e = this.symbols;
          !this.options.labels.allowOverlap &&
            e &&
            (a.hideOverlappingLabels(e.labels),
            e.labels.forEach(function (a, b) {
              a.newOpacity
                ? a.newOpacity !== a.oldOpacity && e.connectors[b].show()
                : e.connectors[b].hide();
            }));
        };
        a.prototype.getRanges = function () {
          var a = this.legend.bubbleLegend,
            e = a.options.ranges,
            d,
            g = Number.MAX_VALUE,
            c = -Number.MAX_VALUE;
          a.chart.series.forEach(function (a) {
            a.isBubble &&
              !a.ignoreSeries &&
              ((d = a.zData.filter(A)),
              d.length &&
                ((g = p(
                  a.options.zMin,
                  Math.min(
                    g,
                    Math.max(
                      y(d),
                      !1 === a.options.displayNegative
                        ? a.options.zThreshold
                        : -Number.MAX_VALUE
                    )
                  )
                )),
                (c = p(a.options.zMax, Math.max(c, w(d))))));
          });
          var f =
            g === c
              ? [{ value: c }]
              : [
                  { value: g },
                  { value: (g + c) / 2 },
                  { value: c, autoRanges: !0 },
                ];
          e.length && e[0].radius && f.reverse();
          f.forEach(function (a, b) {
            e && e[b] && (f[b] = m(!1, e[b], a));
          });
          return f;
        };
        a.prototype.predictBubbleSizes = function () {
          var a = this.chart,
            e = this.fontMetrics,
            d = a.legend.options,
            g = 'horizontal' === d.layout,
            c = g ? a.legend.lastLineHeight : 0,
            f = a.plotSizeX,
            k = a.plotSizeY,
            h = a.series[this.options.seriesIndex];
          a = Math.ceil(h.minPxSize);
          var m = Math.ceil(h.maxPxSize);
          h = h.options.maxSize;
          var p = Math.min(k, f);
          if (d.floating || !/%$/.test(h)) e = m;
          else if (
            ((h = parseFloat(h)),
            (e = ((p + c - e.h / 2) * h) / 100 / (h / 100 + 1)),
            (g && k - e >= f) || (!g && f - e >= k))
          )
            e = m;
          return [a, Math.ceil(e)];
        };
        a.prototype.updateRanges = function (a, e) {
          var b = this.legend.options.bubbleLegend;
          b.minSize = a;
          b.maxSize = e;
          b.ranges = this.getRanges();
        };
        a.prototype.correctSizes = function () {
          var a = this.legend,
            e = this.chart.series[this.options.seriesIndex];
          1 < Math.abs(Math.ceil(e.maxPxSize) - this.options.maxSize) &&
            (this.updateRanges(this.options.minSize, e.maxPxSize), a.render());
        };
        return a;
      })();
      n(q, 'afterGetAllItems', function (a) {
        var b = this.bubbleLegend,
          e = this.options,
          d = e.bubbleLegend,
          g = this.chart.getVisibleBubbleSeriesIndex();
        b &&
          b.ranges &&
          b.ranges.length &&
          (d.ranges.length && (d.autoRanges = !!d.ranges[0].autoRanges),
          this.destroyItem(b));
        0 <= g &&
          e.enabled &&
          d.enabled &&
          ((d.seriesIndex = g),
          (this.bubbleLegend = new h.BubbleLegend(d, this)),
          this.bubbleLegend.addToLegend(a.allItems));
      });
      a.prototype.getVisibleBubbleSeriesIndex = function () {
        for (var a = this.series, b = 0; b < a.length; ) {
          if (a[b] && a[b].isBubble && a[b].visible && a[b].zData.length)
            return b;
          b++;
        }
        return -1;
      };
      q.prototype.getLinesHeights = function () {
        var a = this.allItems,
          b = [],
          g = a.length,
          d,
          c = 0;
        for (d = 0; d < g; d++)
          if (
            (a[d].legendItemHeight && (a[d].itemHeight = a[d].legendItemHeight),
            a[d] === a[g - 1] ||
              (a[d + 1] &&
                a[d]._legendItemPos[1] !== a[d + 1]._legendItemPos[1]))
          ) {
            b.push({ height: 0 });
            var k = b[b.length - 1];
            for (c; c <= d; c++)
              a[c].itemHeight > k.height && (k.height = a[c].itemHeight);
            k.step = d;
          }
        return b;
      };
      q.prototype.retranslateItems = function (a) {
        var b,
          e,
          d,
          g = this.options.rtl,
          c = 0;
        this.allItems.forEach(function (f, k) {
          b = f.legendGroup.translateX;
          e = f._legendItemPos[1];
          if ((d = f.movementX) || (g && f.ranges))
            (d = g ? b - f.options.maxSize / 2 : b + d),
              f.legendGroup.attr({ translateX: d });
          k > a[c].step && c++;
          f.legendGroup.attr({ translateY: Math.round(e + a[c].height / 2) });
          f._legendItemPos[1] = e + a[c].height / 2;
        });
      };
      n(C, 'legendItemClick', function () {
        var a = this.chart,
          b = this.visible,
          g = this.chart.legend;
        g &&
          g.bubbleLegend &&
          ((this.visible = !b),
          (this.ignoreSeries = b),
          (a = 0 <= a.getVisibleBubbleSeriesIndex()),
          g.bubbleLegend.visible !== a &&
            (g.update({ bubbleLegend: { enabled: a } }),
            (g.bubbleLegend.visible = a)),
          (this.visible = b));
      });
      x(a.prototype, 'drawChartBox', function (a, b, g) {
        var d = this.legend,
          e = 0 <= this.getVisibleBubbleSeriesIndex();
        if (
          d &&
          d.options.enabled &&
          d.bubbleLegend &&
          d.options.bubbleLegend.autoRanges &&
          e
        ) {
          var c = d.bubbleLegend.options;
          e = d.bubbleLegend.predictBubbleSizes();
          d.bubbleLegend.updateRanges(e[0], e[1]);
          c.placed ||
            ((d.group.placed = !1),
            d.allItems.forEach(function (a) {
              a.legendGroup.translateY = null;
            }));
          d.render();
          this.getMargins();
          this.axes.forEach(function (a) {
            a.visible && a.render();
            c.placed ||
              (a.setScale(),
              a.updateNames(),
              k(a.ticks, function (a) {
                a.isNew = !0;
                a.isNewLabel = !0;
              }));
          });
          c.placed = !0;
          this.getMargins();
          a.call(this, b, g);
          d.bubbleLegend.correctSizes();
          d.retranslateItems(d.getLinesHeights());
        } else a.call(this, b, g), d && d.options.enabled && d.bubbleLegend && (d.render(), d.retranslateItems(d.getLinesHeights()));
      });
      h.BubbleLegend = u;
      return h.BubbleLegend;
    }
  );
  B(
    a,
    'Series/Bubble/BubbleSeries.js',
    [
      a['Core/Axis/Axis.js'],
      a['Core/Series/Series.js'],
      a['Core/Color/Color.js'],
      a['Core/Globals.js'],
      a['Core/Series/Point.js'],
      a['Core/Utilities.js'],
    ],
    function (a, n, h, q, c, r) {
      var w = h.parse;
      h = q.noop;
      var y = r.arrayMax,
        A = r.arrayMin,
        m = r.clamp,
        k = r.extend,
        p = r.isNumber,
        u = r.pick,
        E = r.pInt,
        x = q.Series,
        C = n.seriesTypes;
      ('');
      n.seriesType(
        'bubble',
        'scatter',
        {
          dataLabels: {
            formatter: function () {
              return this.point.z;
            },
            inside: !0,
            verticalAlign: 'middle',
          },
          animationLimit: 250,
          marker: {
            lineColor: null,
            lineWidth: 1,
            fillOpacity: 0.5,
            radius: null,
            states: { hover: { radiusPlus: 0 } },
            symbol: 'circle',
          },
          minSize: 8,
          maxSize: '20%',
          softThreshold: !1,
          states: { hover: { halo: { size: 5 } } },
          tooltip: { pointFormat: '({point.x}, {point.y}), Size: {point.z}' },
          turboThreshold: 0,
          zThreshold: 0,
          zoneAxis: 'z',
        },
        {
          pointArrayMap: ['y', 'z'],
          parallelArrays: ['x', 'y', 'z'],
          trackerGroups: ['group', 'dataLabelsGroup'],
          specialGroup: 'group',
          bubblePadding: !0,
          zoneAxis: 'z',
          directTouch: !0,
          isBubble: !0,
          pointAttribs: function (a, e) {
            var b = this.options.marker.fillOpacity;
            a = x.prototype.pointAttribs.call(this, a, e);
            1 !== b && (a.fill = w(a.fill).setOpacity(b).get('rgba'));
            return a;
          },
          getRadii: function (a, e, b) {
            var g = this.zData,
              d = this.yData,
              c = b.minPxSize,
              k = b.maxPxSize,
              f = [];
            var l = 0;
            for (b = g.length; l < b; l++) {
              var h = g[l];
              f.push(this.getRadius(a, e, c, k, h, d[l]));
            }
            this.radii = f;
          },
          getRadius: function (a, e, b, c, d, k) {
            var g = this.options,
              f = 'width' !== g.sizeBy,
              l = g.zThreshold,
              h = e - a,
              m = 0.5;
            if (null === k || null === d) return null;
            if (p(d)) {
              g.sizeByAbsoluteValue &&
                ((d = Math.abs(d - l)),
                (h = Math.max(e - l, Math.abs(a - l))),
                (a = 0));
              if (d < a) return b / 2 - 1;
              0 < h && (m = (d - a) / h);
            }
            f && 0 <= m && (m = Math.sqrt(m));
            return Math.ceil(b + m * (c - b)) / 2;
          },
          animate: function (a) {
            !a &&
              this.points.length < this.options.animationLimit &&
              this.points.forEach(function (a) {
                var b = a.graphic;
                b &&
                  b.width &&
                  (this.hasRendered ||
                    b.attr({ x: a.plotX, y: a.plotY, width: 1, height: 1 }),
                  b.animate(this.markerAttribs(a), this.options.animation));
              }, this);
          },
          hasData: function () {
            return !!this.processedXData.length;
          },
          translate: function () {
            var a,
              e = this.data,
              b = this.radii;
            C.scatter.prototype.translate.call(this);
            for (a = e.length; a--; ) {
              var c = e[a];
              var d = b ? b[a] : 0;
              p(d) && d >= this.minPxSize / 2
                ? ((c.marker = k(c.marker, {
                    radius: d,
                    width: 2 * d,
                    height: 2 * d,
                  })),
                  (c.dlBox = {
                    x: c.plotX - d,
                    y: c.plotY - d,
                    width: 2 * d,
                    height: 2 * d,
                  }))
                : (c.shapeArgs = c.plotY = c.dlBox = void 0);
            }
          },
          alignDataLabel: C.column.prototype.alignDataLabel,
          buildKDTree: h,
          applyZones: h,
        },
        {
          haloPath: function (a) {
            return c.prototype.haloPath.call(
              this,
              0 === a ? 0 : (this.marker ? this.marker.radius || 0 : 0) + a
            );
          },
          ttBelow: !1,
        }
      );
      a.prototype.beforePadding = function () {
        var a = this,
          e = this.len,
          b = this.chart,
          c = 0,
          d = e,
          k = this.isXAxis,
          h = k ? 'xData' : 'yData',
          f = this.min,
          l = {},
          n = Math.min(b.plotWidth, b.plotHeight),
          r = Number.MAX_VALUE,
          q = -Number.MAX_VALUE,
          w = this.max - f,
          x = e / w,
          C = [];
        this.series.forEach(function (d) {
          var e = d.options;
          !d.bubblePadding ||
            (!d.visible && b.options.chart.ignoreHiddenSeries) ||
            ((a.allowZoomOutside = !0),
            C.push(d),
            k &&
              (['minSize', 'maxSize'].forEach(function (a) {
                var b = e[a],
                  d = /%$/.test(b);
                b = E(b);
                l[a] = d ? (n * b) / 100 : b;
              }),
              (d.minPxSize = l.minSize),
              (d.maxPxSize = Math.max(l.maxSize, l.minSize)),
              (d = d.zData.filter(p)),
              d.length &&
                ((r = u(
                  e.zMin,
                  m(
                    A(d),
                    !1 === e.displayNegative ? e.zThreshold : -Number.MAX_VALUE,
                    r
                  )
                )),
                (q = u(e.zMax, Math.max(q, y(d)))))));
        });
        C.forEach(function (b) {
          var e = b[h],
            g = e.length;
          k && b.getRadii(r, q, b);
          if (0 < w)
            for (; g--; )
              if (p(e[g]) && a.dataMin <= e[g] && e[g] <= a.max) {
                var l = b.radii ? b.radii[g] : 0;
                c = Math.min((e[g] - f) * x - l, c);
                d = Math.max((e[g] - f) * x + l, d);
              }
        });
        C.length &&
          0 < w &&
          !this.logarithmic &&
          ((d -= e),
          (x *= (e + Math.max(0, c) - Math.min(d, e)) / e),
          [
            ['min', 'userMin', c],
            ['max', 'userMax', d],
          ].forEach(function (b) {
            'undefined' === typeof u(a.options[b[0]], a[b[1]]) &&
              (a[b[0]] += b[2] / x);
          }));
      };
      ('');
    }
  );
  B(
    a,
    'Series/MapBubbleSeries.js',
    [
      a['Core/Series/Series.js'],
      a['Core/Series/Point.js'],
      a['Core/Utilities.js'],
    ],
    function (a, n, h) {
      var q = h.merge,
        c = a.seriesTypes;
      c.bubble &&
        a.seriesType(
          'mapbubble',
          'bubble',
          {
            animationLimit: 500,
            tooltip: { pointFormat: '{point.name}: {point.z}' },
          },
          {
            xyFromShape: !0,
            type: 'mapbubble',
            pointArrayMap: ['z'],
            getMapData: c.map.prototype.getMapData,
            getBox: c.map.prototype.getBox,
            setData: c.map.prototype.setData,
            setOptions: c.map.prototype.setOptions,
          },
          {
            applyOptions: function (a, h) {
              return a &&
                'undefined' !== typeof a.lat &&
                'undefined' !== typeof a.lon
                ? n.prototype.applyOptions.call(
                    this,
                    q(a, this.series.chart.fromLatLonToPoint(a)),
                    h
                  )
                : c.map.prototype.pointClass.prototype.applyOptions.call(
                    this,
                    a,
                    h
                  );
            },
            isValid: function () {
              return 'number' === typeof this.z;
            },
            ttBelow: !1,
          }
        );
      ('');
    }
  );
  B(
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
    function (a, n, h, q, c, r) {
      var w = n.colorMapPointMixin;
      n = n.colorMapSeriesMixin;
      var y = h.noop,
        A = r.clamp,
        m = r.extend,
        k = r.fireEvent,
        p = r.isNumber,
        u = r.merge,
        E = r.pick,
        x = h.Series;
      r = a.seriesTypes;
      var C = c.prototype.symbols;
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
        u(n, {
          pointArrayMap: ['y', 'value'],
          hasPointSpecificOptions: !0,
          getExtremesFromAll: !0,
          directTouch: !0,
          init: function () {
            x.prototype.init.apply(this, arguments);
            var a = this.options;
            a.pointRange = E(a.pointRange, a.colsize || 1);
            this.yAxis.axisPointRange = a.rowsize || 1;
            m(C, { ellipse: C.circle, rect: C.square });
          },
          getSymbol: x.prototype.getSymbol,
          setClip: function (a) {
            var e = this.chart;
            x.prototype.setClip.apply(this, arguments);
            (!1 !== this.options.clip || a) &&
              this.markerGroup.clip(
                (a || this.clipBox) && this.sharedClipKey
                  ? e[this.sharedClipKey]
                  : e.clipRect
              );
          },
          translate: function () {
            var a = this.options,
              e = (a.marker && a.marker.symbol) || '',
              b = C[e] ? e : 'rect';
            a = this.options;
            var c = -1 !== ['circle', 'square'].indexOf(b);
            this.generatePoints();
            this.points.forEach(function (a) {
              var d = a.getCellAttributes(),
                g = {
                  x: Math.min(d.x1, d.x2),
                  y: Math.min(d.y1, d.y2),
                  width: Math.max(Math.abs(d.x2 - d.x1), 0),
                  height: Math.max(Math.abs(d.y2 - d.y1), 0),
                };
              var f = (a.hasImage =
                0 ===
                ((a.marker && a.marker.symbol) || e || '').indexOf('url'));
              if (c) {
                var k = Math.abs(g.width - g.height);
                g.x = Math.min(d.x1, d.x2) + (g.width < g.height ? 0 : k / 2);
                g.y = Math.min(d.y1, d.y2) + (g.width < g.height ? k / 2 : 0);
                g.width = g.height = Math.min(g.width, g.height);
              }
              k = {
                plotX: (d.x1 + d.x2) / 2,
                plotY: (d.y1 + d.y2) / 2,
                clientX: (d.x1 + d.x2) / 2,
                shapeType: 'path',
                shapeArgs: u(!0, g, { d: C[b](g.x, g.y, g.width, g.height) }),
              };
              f && (a.marker = { width: g.width, height: g.height });
              m(a, k);
            });
            k(this, 'afterTranslate');
          },
          pointAttribs: function (a, e) {
            var b = x.prototype.pointAttribs.call(this, a, e),
              c = this.options || {},
              d = this.chart.options.plotOptions || {},
              g = d.series || {},
              k = d.heatmap || {};
            d = c.borderColor || k.borderColor || g.borderColor;
            g =
              c.borderWidth ||
              k.borderWidth ||
              g.borderWidth ||
              b['stroke-width'];
            b.stroke =
              (a && a.marker && a.marker.lineColor) ||
              (c.marker && c.marker.lineColor) ||
              d ||
              this.color;
            b['stroke-width'] = g;
            e &&
              ((a = u(
                c.states[e],
                c.marker && c.marker.states[e],
                (a.options.states && a.options.states[e]) || {}
              )),
              (e = a.brightness),
              (b.fill =
                a.color ||
                h
                  .color(b.fill)
                  .brighten(e || 0)
                  .get()),
              (b.stroke = a.lineColor));
            return b;
          },
          markerAttribs: function (a, e) {
            var b = a.marker || {},
              c = this.options.marker || {},
              d = a.shapeArgs || {},
              g = {};
            if (a.hasImage) return { x: a.plotX, y: a.plotY };
            if (e) {
              var k = c.states[e] || {};
              var f = (b.states && b.states[e]) || {};
              [
                ['width', 'x'],
                ['height', 'y'],
              ].forEach(function (a) {
                g[a[0]] =
                  (f[a[0]] || k[a[0]] || d[a[0]]) +
                  (f[a[0] + 'Plus'] || k[a[0] + 'Plus'] || 0);
                g[a[1]] = d[a[1]] + (d[a[0]] - g[a[0]]) / 2;
              });
            }
            return e ? g : d;
          },
          drawPoints: function () {
            var a = this;
            if ((this.options.marker || {}).enabled || this._hasPointMarkers)
              x.prototype.drawPoints.call(this),
                this.points.forEach(function (e) {
                  e.graphic &&
                    e.graphic[a.chart.styledMode ? 'css' : 'animate'](
                      a.colorAttribs(e)
                    );
                });
          },
          hasData: function () {
            return !!this.processedXData.length;
          },
          getValidPoints: function (a, e) {
            return x.prototype.getValidPoints.call(this, a, e, !0);
          },
          getBox: y,
          drawLegendSymbol: q.drawRectangle,
          alignDataLabel: r.column.prototype.alignDataLabel,
          getExtremes: function () {
            var a = x.prototype.getExtremes.call(this, this.valueData),
              e = a.dataMin;
            a = a.dataMax;
            p(e) && (this.valueMin = e);
            p(a) && (this.valueMax = a);
            return x.prototype.getExtremes.call(this);
          },
        }),
        u(w, {
          applyOptions: function (a, e) {
            a = h.Point.prototype.applyOptions.call(this, a, e);
            a.formatPrefix = a.isNull || null === a.value ? 'null' : 'point';
            return a;
          },
          isValid: function () {
            return Infinity !== this.value && -Infinity !== this.value;
          },
          haloPath: function (a) {
            if (!a) return [];
            var e = this.shapeArgs;
            return [
              'M',
              e.x - a,
              e.y - a,
              'L',
              e.x - a,
              e.y + e.height + a,
              e.x + e.width + a,
              e.y + e.height + a,
              e.x + e.width + a,
              e.y - a,
              'Z',
            ];
          },
          getCellAttributes: function () {
            var a = this.series,
              e = a.options,
              b = (e.colsize || 1) / 2,
              c = (e.rowsize || 1) / 2,
              d = a.xAxis,
              k = a.yAxis,
              h = this.options.marker || a.options.marker;
            a = a.pointPlacementToXValue();
            var f = E(this.pointPadding, e.pointPadding, 0),
              l = {
                x1: A(
                  Math.round(
                    d.len - (d.translate(this.x - b, !1, !0, !1, !0, -a) || 0)
                  ),
                  -d.len,
                  2 * d.len
                ),
                x2: A(
                  Math.round(
                    d.len - (d.translate(this.x + b, !1, !0, !1, !0, -a) || 0)
                  ),
                  -d.len,
                  2 * d.len
                ),
                y1: A(
                  Math.round(k.translate(this.y - c, !1, !0, !1, !0) || 0),
                  -k.len,
                  2 * k.len
                ),
                y2: A(
                  Math.round(k.translate(this.y + c, !1, !0, !1, !0) || 0),
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
              var d = a + '1',
                e = a + '2',
                c = Math.abs(l[d] - l[e]),
                k = (h && h.lineWidth) || 0,
                g = Math.abs(l[d] + l[e]) / 2;
              h[b] &&
                h[b] < c &&
                ((l[d] = g - h[b] / 2 - k / 2), (l[e] = g + h[b] / 2 + k / 2));
              f &&
                ('y' === a && ((d = e), (e = a + '1')),
                (l[d] += f),
                (l[e] -= f));
            });
            return l;
          },
        })
      );
      ('');
    }
  );
  B(
    a,
    'Extensions/GeoJSON.js',
    [a['Core/Chart/Chart.js'], a['Core/Globals.js'], a['Core/Utilities.js']],
    function (a, n, h) {
      function q(a, c) {
        var k,
          h = !1,
          m = a.x,
          n = a.y;
        a = 0;
        for (k = c.length - 1; a < c.length; k = a++) {
          var q = c[a][1] > n;
          var g = c[k][1] > n;
          q !== g &&
            m <
              ((c[k][0] - c[a][0]) * (n - c[a][1])) / (c[k][1] - c[a][1]) +
                c[a][0] &&
            (h = !h);
        }
        return h;
      }
      var c = n.win,
        r = h.error,
        w = h.extend,
        y = h.format,
        A = h.merge;
      h = h.wrap;
      ('');
      a.prototype.transformFromLatLon = function (a, k) {
        var h,
          m =
            (null === (h = this.userOptions.chart) || void 0 === h
              ? void 0
              : h.proj4) || c.proj4;
        if (!m) return r(21, !1, this), { x: 0, y: null };
        a = m(k.crs, [a.lon, a.lat]);
        h = k.cosAngle || (k.rotation && Math.cos(k.rotation));
        m = k.sinAngle || (k.rotation && Math.sin(k.rotation));
        a = k.rotation ? [a[0] * h + a[1] * m, -a[0] * m + a[1] * h] : a;
        return {
          x:
            ((a[0] - (k.xoffset || 0)) * (k.scale || 1) + (k.xpan || 0)) *
              (k.jsonres || 1) +
            (k.jsonmarginX || 0),
          y:
            (((k.yoffset || 0) - a[1]) * (k.scale || 1) + (k.ypan || 0)) *
              (k.jsonres || 1) -
            (k.jsonmarginY || 0),
        };
      };
      a.prototype.transformToLatLon = function (a, k) {
        if ('undefined' === typeof c.proj4) r(21, !1, this);
        else {
          a = {
            x:
              ((a.x - (k.jsonmarginX || 0)) / (k.jsonres || 1) -
                (k.xpan || 0)) /
                (k.scale || 1) +
              (k.xoffset || 0),
            y:
              ((-a.y - (k.jsonmarginY || 0)) / (k.jsonres || 1) +
                (k.ypan || 0)) /
                (k.scale || 1) +
              (k.yoffset || 0),
          };
          var h = k.cosAngle || (k.rotation && Math.cos(k.rotation)),
            m = k.sinAngle || (k.rotation && Math.sin(k.rotation));
          k = c.proj4(
            k.crs,
            'WGS84',
            k.rotation ? { x: a.x * h + a.y * -m, y: a.x * m + a.y * h } : a
          );
          return { lat: k.y, lon: k.x };
        }
      };
      a.prototype.fromPointToLatLon = function (a) {
        var c = this.mapTransforms,
          h;
        if (c) {
          for (h in c)
            if (
              Object.hasOwnProperty.call(c, h) &&
              c[h].hitZone &&
              q({ x: a.x, y: -a.y }, c[h].hitZone.coordinates[0])
            )
              return this.transformToLatLon(a, c[h]);
          return this.transformToLatLon(a, c['default']);
        }
        r(22, !1, this);
      };
      a.prototype.fromLatLonToPoint = function (a) {
        var c = this.mapTransforms,
          h;
        if (!c) return r(22, !1, this), { x: 0, y: null };
        for (h in c)
          if (Object.hasOwnProperty.call(c, h) && c[h].hitZone) {
            var m = this.transformFromLatLon(a, c[h]);
            if (q({ x: m.x, y: -m.y }, c[h].hitZone.coordinates[0])) return m;
          }
        return this.transformFromLatLon(a, c['default']);
      };
      n.geojson = function (a, c, h) {
        var k = [],
          m = [],
          n = function (a) {
            a.forEach(function (a, c) {
              0 === c ? m.push(['M', a[0], -a[1]]) : m.push(['L', a[0], -a[1]]);
            });
          };
        c = c || 'map';
        a.features.forEach(function (a) {
          var g = a.geometry,
            e = g.type;
          g = g.coordinates;
          a = a.properties;
          var b;
          m = [];
          'map' === c || 'mapbubble' === c
            ? ('Polygon' === e
                ? (g.forEach(n), m.push(['Z']))
                : 'MultiPolygon' === e &&
                  (g.forEach(function (a) {
                    a.forEach(n);
                  }),
                  m.push(['Z'])),
              m.length && (b = { path: m }))
            : 'mapline' === c
            ? ('LineString' === e
                ? n(g)
                : 'MultiLineString' === e && g.forEach(n),
              m.length && (b = { path: m }))
            : 'mappoint' === c && 'Point' === e && (b = { x: g[0], y: -g[1] });
          b && k.push(w(b, { name: a.name || a.NAME, properties: a }));
        });
        h &&
          a.copyrightShort &&
          ((h.chart.mapCredits = y(h.chart.options.credits.mapText, {
            geojson: a,
          })),
          (h.chart.mapCreditsFull = y(h.chart.options.credits.mapTextFull, {
            geojson: a,
          })));
        return k;
      };
      h(a.prototype, 'addCredits', function (a, c) {
        c = A(!0, this.options.credits, c);
        this.mapCredits && (c.href = null);
        a.call(this, c);
        this.credits &&
          this.mapCreditsFull &&
          this.credits.attr({ title: this.mapCreditsFull });
      });
    }
  );
  B(a, 'masters/modules/map.src.js', [], function () {});
});
