/*! RESOURCE: /scripts/highcharts/highcharts-more.src.js */
('use strict');
(function (factory) {
  if (typeof module === 'object' && module.exports) {
    factory['default'] = factory;
    module.exports = factory;
  } else if (typeof define === 'function' && define.amd) {
    define('highcharts/highcharts-more', ['highcharts'], function (Highcharts) {
      factory(Highcharts);
      factory.Highcharts = Highcharts;
      return factory;
    });
  } else {
    factory(typeof Highcharts !== 'undefined' ? Highcharts : undefined);
  }
})(function (Highcharts) {
  var _modules = Highcharts ? Highcharts._modules : {};
  function _registerModule(obj, path, args, fn) {
    if (!obj.hasOwnProperty(path)) {
      obj[path] = fn.apply(null, args);
    }
  }
  _registerModule(
    _modules,
    'Extensions/Pane.js',
    [
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Pointer.js'],
      _modules['Core/Utilities.js'],
      _modules['Mixins/CenteredSeries.js'],
    ],
    function (Chart, H, Pointer, U, centeredSeriesMixin) {
      var addEvent = U.addEvent,
        extend = U.extend,
        merge = U.merge,
        pick = U.pick,
        splat = U.splat;
      Chart.prototype.collectionsWithUpdate.push('pane');
      var Pane = (function () {
        function Pane(options, chart) {
          this.background = void 0;
          this.center = void 0;
          this.chart = void 0;
          this.options = void 0;
          this.coll = 'pane';
          this.defaultOptions = {
            center: ['50%', '50%'],
            size: '85%',
            innerSize: '0%',
            startAngle: 0,
          };
          this.defaultBackgroundOptions = {
            shape: 'circle',
            borderWidth: 1,
            borderColor: '#cccccc',
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, '#ffffff'],
                [1, '#e6e6e6'],
              ],
            },
            from: -Number.MAX_VALUE,
            innerRadius: 0,
            to: Number.MAX_VALUE,
            outerRadius: '105%',
          };
          this.init(options, chart);
        }
        Pane.prototype.init = function (options, chart) {
          this.chart = chart;
          this.background = [];
          chart.pane.push(this);
          this.setOptions(options);
        };
        Pane.prototype.setOptions = function (options) {
          this.options = options = merge(
            this.defaultOptions,
            this.chart.angular ? { background: {} } : void 0,
            options
          );
        };
        Pane.prototype.render = function () {
          var options = this.options,
            backgroundOption = this.options.background,
            renderer = this.chart.renderer,
            len,
            i;
          if (!this.group) {
            this.group = renderer
              .g('pane-group')
              .attr({ zIndex: options.zIndex || 0 })
              .add();
          }
          this.updateCenter();
          if (backgroundOption) {
            backgroundOption = splat(backgroundOption);
            len = Math.max(
              backgroundOption.length,
              this.background.length || 0
            );
            for (i = 0; i < len; i++) {
              if (backgroundOption[i] && this.axis) {
                this.renderBackground(
                  merge(this.defaultBackgroundOptions, backgroundOption[i]),
                  i
                );
              } else if (this.background[i]) {
                this.background[i] = this.background[i].destroy();
                this.background.splice(i, 1);
              }
            }
          }
        };
        Pane.prototype.renderBackground = function (backgroundOptions, i) {
          var method = 'animate',
            attribs = {
              class: 'highcharts-pane ' + (backgroundOptions.className || ''),
            };
          if (!this.chart.styledMode) {
            extend(attribs, {
              fill: backgroundOptions.backgroundColor,
              stroke: backgroundOptions.borderColor,
              'stroke-width': backgroundOptions.borderWidth,
            });
          }
          if (!this.background[i]) {
            this.background[i] = this.chart.renderer.path().add(this.group);
            method = 'attr';
          }
          this.background[i][method]({
            d: this.axis.getPlotBandPath(
              backgroundOptions.from,
              backgroundOptions.to,
              backgroundOptions
            ),
          }).attr(attribs);
        };
        Pane.prototype.updateCenter = function (axis) {
          this.center = (axis || this.axis || {}).center =
            centeredSeriesMixin.getCenter.call(this);
        };
        Pane.prototype.update = function (options, redraw) {
          merge(true, this.options, options);
          merge(true, this.chart.options.pane, options);
          this.setOptions(this.options);
          this.render();
          this.chart.axes.forEach(function (axis) {
            if (axis.pane === this) {
              axis.pane = null;
              axis.update({}, redraw);
            }
          }, this);
        };
        return Pane;
      })();
      function isInsidePane(x, y, center) {
        return (
          Math.sqrt(Math.pow(x - center[0], 2) + Math.pow(y - center[1], 2)) <=
          center[2] / 2
        );
      }
      Chart.prototype.getHoverPane = function (eventArgs) {
        var chart = this;
        var hoverPane;
        if (eventArgs) {
          chart.pane.forEach(function (pane) {
            var plotX = eventArgs.chartX - chart.plotLeft,
              plotY = eventArgs.chartY - chart.plotTop,
              x = chart.inverted ? plotY : plotX,
              y = chart.inverted ? plotX : plotY;
            if (isInsidePane(x, y, pane.center)) {
              hoverPane = pane;
            }
          });
        }
        return hoverPane;
      };
      addEvent(Chart, 'afterIsInsidePlot', function (e) {
        var chart = this;
        if (chart.polar) {
          e.isInsidePlot = chart.pane.some(function (pane) {
            return isInsidePane(e.x, e.y, pane.center);
          });
        }
      });
      addEvent(Pointer, 'beforeGetHoverData', function (eventArgs) {
        var chart = this.chart;
        if (chart.polar) {
          chart.hoverPane = chart.getHoverPane(eventArgs);
          eventArgs.filter = function (s) {
            return (
              s.visible &&
              !(!eventArgs.shared && s.directTouch) &&
              pick(s.options.enableMouseTracking, true) &&
              (!chart.hoverPane || s.xAxis.pane === chart.hoverPane)
            );
          };
        }
      });
      addEvent(Pointer, 'afterGetHoverData', function (eventArgs) {
        var chart = this.chart;
        if (
          eventArgs.hoverPoint &&
          eventArgs.hoverPoint.plotX &&
          eventArgs.hoverPoint.plotY &&
          chart.hoverPane &&
          !isInsidePane(
            eventArgs.hoverPoint.plotX,
            eventArgs.hoverPoint.plotY,
            chart.hoverPane.center
          )
        ) {
          eventArgs.hoverPoint = void 0;
        }
      });
      H.Pane = Pane;
      return H.Pane;
    }
  );
  _registerModule(_modules, 'Core/Axis/HiddenAxis.js', [], function () {
    var HiddenAxis = (function () {
      function HiddenAxis() {}
      HiddenAxis.init = function (axis) {
        axis.getOffset = function () {};
        axis.redraw = function () {
          this.isDirty = false;
        };
        axis.render = function () {
          this.isDirty = false;
        };
        axis.createLabelCollector = function () {
          return function () {
            return;
          };
        };
        axis.setScale = function () {};
        axis.setCategories = function () {};
        axis.setTitle = function () {};
        axis.isHidden = true;
      };
      return HiddenAxis;
    })();
    return HiddenAxis;
  });
  _registerModule(
    _modules,
    'Core/Axis/RadialAxis.js',
    [
      _modules['Core/Axis/Axis.js'],
      _modules['Core/Axis/Tick.js'],
      _modules['Core/Axis/HiddenAxis.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Axis, Tick, HiddenAxis, U) {
      var addEvent = U.addEvent,
        correctFloat = U.correctFloat,
        defined = U.defined,
        extend = U.extend,
        fireEvent = U.fireEvent,
        isNumber = U.isNumber,
        merge = U.merge,
        pick = U.pick,
        pInt = U.pInt,
        relativeLength = U.relativeLength,
        wrap = U.wrap;
      var RadialAxis = (function () {
        function RadialAxis() {}
        RadialAxis.init = function (axis) {
          var axisProto = Axis.prototype;
          axis.setOptions = function (userOptions) {
            var options = (this.options = merge(
              axis.constructor.defaultOptions,
              this.defaultPolarOptions,
              userOptions
            ));
            if (!options.plotBands) {
              options.plotBands = [];
            }
            fireEvent(this, 'afterSetOptions');
          };
          axis.getOffset = function () {
            axisProto.getOffset.call(this);
            this.chart.axisOffset[this.side] = 0;
          };
          axis.getLinePath = function (_lineWidth, radius, innerRadius) {
            var center = this.pane.center,
              end,
              chart = this.chart,
              r = pick(radius, center[2] / 2 - this.offset),
              path;
            if (typeof innerRadius === 'undefined') {
              innerRadius = this.horiz ? 0 : this.center && -this.center[3] / 2;
            }
            if (innerRadius) {
              r += innerRadius;
            }
            if (this.isCircular || typeof radius !== 'undefined') {
              path = this.chart.renderer.symbols.arc(
                this.left + center[0],
                this.top + center[1],
                r,
                r,
                {
                  start: this.startAngleRad,
                  end: this.endAngleRad,
                  open: true,
                  innerR: 0,
                }
              );
              path.xBounds = [this.left + center[0]];
              path.yBounds = [this.top + center[1] - r];
            } else {
              end = this.postTranslate(this.angleRad, r);
              path = [
                [
                  'M',
                  this.center[0] + chart.plotLeft,
                  this.center[1] + chart.plotTop,
                ],
                ['L', end.x, end.y],
              ];
            }
            return path;
          };
          axis.setAxisTranslation = function () {
            axisProto.setAxisTranslation.call(this);
            if (this.center) {
              if (this.isCircular) {
                this.transA =
                  (this.endAngleRad - this.startAngleRad) /
                  (this.max - this.min || 1);
              } else {
                this.transA =
                  (this.center[2] - this.center[3]) /
                  2 /
                  (this.max - this.min || 1);
              }
              if (this.isXAxis) {
                this.minPixelPadding = this.transA * this.minPointOffset;
              } else {
                this.minPixelPadding = 0;
              }
            }
          };
          axis.beforeSetTickPositions = function () {
            this.autoConnect =
              this.isCircular &&
              typeof pick(this.userMax, this.options.max) === 'undefined' &&
              correctFloat(this.endAngleRad - this.startAngleRad) ===
                correctFloat(2 * Math.PI);
            if (!this.isCircular && this.chart.inverted) {
              this.max++;
            }
            if (this.autoConnect) {
              this.max +=
                (this.categories && 1) ||
                this.pointRange ||
                this.closestPointRange ||
                0;
            }
          };
          axis.setAxisSize = function () {
            var center, start;
            axisProto.setAxisSize.call(this);
            if (this.isRadial) {
              this.pane.updateCenter(this);
              center = this.center = extend([], this.pane.center);
              if (this.isCircular) {
                this.sector = this.endAngleRad - this.startAngleRad;
              } else {
                start = this.postTranslate(this.angleRad, center[3] / 2);
                center[0] = start.x - this.chart.plotLeft;
                center[1] = start.y - this.chart.plotTop;
              }
              this.len =
                this.width =
                this.height =
                  ((center[2] - center[3]) * pick(this.sector, 1)) / 2;
            }
          };
          axis.getPosition = function (value, length) {
            var translatedVal = this.translate(value);
            return this.postTranslate(
              this.isCircular ? translatedVal : this.angleRad,
              pick(
                this.isCircular
                  ? length
                  : translatedVal < 0
                  ? 0
                  : translatedVal,
                this.center[2] / 2
              ) - this.offset
            );
          };
          axis.postTranslate = function (angle, radius) {
            var chart = this.chart,
              center = this.center;
            angle = this.startAngleRad + angle;
            return {
              x: chart.plotLeft + center[0] + Math.cos(angle) * radius,
              y: chart.plotTop + center[1] + Math.sin(angle) * radius,
            };
          };
          axis.getPlotBandPath = function (from, to, options) {
            var radiusToPixels = function (radius) {
              if (typeof radius === 'string') {
                var r = parseInt(radius, 10);
                if (percentRegex.test(radius)) {
                  r = (r * fullRadius) / 100;
                }
                return r;
              }
              return radius;
            };
            var center = this.center,
              startAngleRad = this.startAngleRad,
              fullRadius = center[2] / 2,
              offset = Math.min(this.offset, 0),
              percentRegex = /%$/,
              start,
              end,
              angle,
              xOnPerimeter,
              open,
              isCircular = this.isCircular,
              path,
              outerRadius = pick(
                radiusToPixels(options.outerRadius),
                fullRadius
              ),
              innerRadius = radiusToPixels(options.innerRadius),
              thickness = pick(radiusToPixels(options.thickness), 10);
            if (this.options.gridLineInterpolation === 'polygon') {
              path = this.getPlotLinePath({ value: from }).concat(
                this.getPlotLinePath({ value: to, reverse: true })
              );
            } else {
              from = Math.max(from, this.min);
              to = Math.min(to, this.max);
              var transFrom = this.translate(from);
              var transTo = this.translate(to);
              if (!isCircular) {
                outerRadius = transFrom || 0;
                innerRadius = transTo || 0;
              }
              if (options.shape === 'circle' || !isCircular) {
                start = -Math.PI / 2;
                end = Math.PI * 1.5;
                open = true;
              } else {
                start = startAngleRad + (transFrom || 0);
                end = startAngleRad + (transTo || 0);
              }
              outerRadius -= offset;
              thickness -= offset;
              path = this.chart.renderer.symbols.arc(
                this.left + center[0],
                this.top + center[1],
                outerRadius,
                outerRadius,
                {
                  start: Math.min(start, end),
                  end: Math.max(start, end),
                  innerR: pick(innerRadius, outerRadius - thickness),
                  open: open,
                }
              );
              if (isCircular) {
                angle = (end + start) / 2;
                xOnPerimeter =
                  this.left + center[0] + (center[2] / 2) * Math.cos(angle);
                path.xBounds =
                  angle > -Math.PI / 2 && angle < Math.PI / 2
                    ? [xOnPerimeter, this.chart.plotWidth]
                    : [0, xOnPerimeter];
                path.yBounds = [
                  this.top + center[1] + (center[2] / 2) * Math.sin(angle),
                ];
                path.yBounds[0] +=
                  (angle > -Math.PI && angle < 0) || angle > Math.PI ? -10 : 10;
              }
            }
            return path;
          };
          axis.getCrosshairPosition = function (options, x1, y1) {
            var axis = this,
              value = options.value,
              center = axis.pane.center,
              shapeArgs,
              end,
              x2,
              y2;
            if (axis.isCircular) {
              if (!defined(value)) {
                x2 = options.chartX || 0;
                y2 = options.chartY || 0;
                value = axis.translate(
                  Math.atan2(y2 - y1, x2 - x1) - axis.startAngleRad,
                  true
                );
              } else if (options.point) {
                shapeArgs = options.point.shapeArgs || {};
                if (shapeArgs.start) {
                  value = axis.chart.inverted
                    ? axis.translate(options.point.rectPlotY, true)
                    : options.point.x;
                }
              }
              end = axis.getPosition(value);
              x2 = end.x;
              y2 = end.y;
            } else {
              if (!defined(value)) {
                x2 = options.chartX;
                y2 = options.chartY;
              }
              if (defined(x2) && defined(y2)) {
                y1 = center[1] + axis.chart.plotTop;
                value = axis.translate(
                  Math.min(
                    Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)),
                    center[2] / 2
                  ) -
                    center[3] / 2,
                  true
                );
              }
            }
            return [value, x2 || 0, y2 || 0];
          };
          axis.getPlotLinePath = function (options) {
            var axis = this,
              center = axis.pane.center,
              chart = axis.chart,
              inverted = chart.inverted,
              value = options.value,
              reverse = options.reverse,
              end = axis.getPosition(value),
              background = axis.pane.options.background
                ? axis.pane.options.background[0] ||
                  axis.pane.options.background
                : {},
              innerRadius = background.innerRadius || '0%',
              outerRadius = background.outerRadius || '100%',
              x1 = center[0] + chart.plotLeft,
              y1 = center[1] + chart.plotTop,
              x2 = end.x,
              y2 = end.y,
              height = axis.height,
              isCrosshair = options.isCrosshair,
              paneInnerR = center[3] / 2,
              innerRatio,
              distance,
              a,
              b,
              otherAxis,
              xy,
              tickPositions,
              crossPos,
              path;
            if (isCrosshair) {
              crossPos = this.getCrosshairPosition(options, x1, y1);
              value = crossPos[0];
              x2 = crossPos[1];
              y2 = crossPos[2];
            }
            if (axis.isCircular) {
              distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
              a =
                typeof innerRadius === 'string'
                  ? relativeLength(innerRadius, 1)
                  : innerRadius / distance;
              b =
                typeof outerRadius === 'string'
                  ? relativeLength(outerRadius, 1)
                  : outerRadius / distance;
              if (center && paneInnerR) {
                innerRatio = paneInnerR / distance;
                if (a < innerRatio) {
                  a = innerRatio;
                }
                if (b < innerRatio) {
                  b = innerRatio;
                }
              }
              path = [
                ['M', x1 + a * (x2 - x1), y1 - a * (y1 - y2)],
                ['L', x2 - (1 - b) * (x2 - x1), y2 + (1 - b) * (y1 - y2)],
              ];
            } else {
              value = axis.translate(value);
              if (value) {
                if (value < 0 || value > height) {
                  value = 0;
                }
              }
              if (axis.options.gridLineInterpolation === 'circle') {
                path = axis.getLinePath(0, value, paneInnerR);
              } else {
                path = [];
                chart[inverted ? 'yAxis' : 'xAxis'].forEach(function (a) {
                  if (a.pane === axis.pane) {
                    otherAxis = a;
                  }
                });
                if (otherAxis) {
                  tickPositions = otherAxis.tickPositions;
                  if (otherAxis.autoConnect) {
                    tickPositions = tickPositions.concat([tickPositions[0]]);
                  }
                  if (reverse) {
                    tickPositions = tickPositions.slice().reverse();
                  }
                  if (value) {
                    value += paneInnerR;
                  }
                  for (var i = 0; i < tickPositions.length; i++) {
                    xy = otherAxis.getPosition(tickPositions[i], value);
                    path.push(i ? ['L', xy.x, xy.y] : ['M', xy.x, xy.y]);
                  }
                }
              }
            }
            return path;
          };
          axis.getTitlePosition = function () {
            var center = this.center,
              chart = this.chart,
              titleOptions = this.options.title;
            return {
              x: chart.plotLeft + center[0] + (titleOptions.x || 0),
              y:
                chart.plotTop +
                center[1] -
                {
                  high: 0.5,
                  middle: 0.25,
                  low: 0,
                }[titleOptions.align] *
                  center[2] +
                (titleOptions.y || 0),
            };
          };
          axis.createLabelCollector = function () {
            var axis = this;
            return function () {
              if (
                axis.isRadial &&
                axis.tickPositions &&
                axis.options.labels.allowOverlap !== true
              ) {
                return axis.tickPositions
                  .map(function (pos) {
                    return axis.ticks[pos] && axis.ticks[pos].label;
                  })
                  .filter(function (label) {
                    return Boolean(label);
                  });
              }
            };
          };
        };
        RadialAxis.compose = function (AxisClass, TickClass) {
          addEvent(AxisClass, 'init', function (e) {
            var axis = this;
            var chart = axis.chart;
            var inverted = chart.inverted,
              angular = chart.angular,
              polar = chart.polar,
              isX = axis.isXAxis,
              coll = axis.coll,
              isHidden = angular && isX,
              isCircular,
              chartOptions = chart.options,
              paneIndex = e.userOptions.pane || 0,
              pane = (this.pane = chart.pane && chart.pane[paneIndex]);
            if (coll === 'colorAxis') {
              this.isRadial = false;
              return;
            }
            if (angular) {
              if (isHidden) {
                HiddenAxis.init(axis);
              } else {
                RadialAxis.init(axis);
              }
              isCircular = !isX;
              if (isCircular) {
                axis.defaultPolarOptions = RadialAxis.defaultRadialGaugeOptions;
              }
            } else if (polar) {
              RadialAxis.init(axis);
              isCircular = axis.horiz;
              axis.defaultPolarOptions = isCircular
                ? RadialAxis.defaultCircularOptions
                : merge(
                    coll === 'xAxis'
                      ? AxisClass.defaultOptions
                      : AxisClass.defaultYAxisOptions,
                    RadialAxis.defaultRadialOptions
                  );
              if (inverted && coll === 'yAxis') {
                axis.defaultPolarOptions.stackLabels =
                  AxisClass.defaultYAxisOptions.stackLabels;
              }
            }
            if (angular || polar) {
              axis.isRadial = true;
              chartOptions.chart.zoomType = null;
              if (!axis.labelCollector) {
                axis.labelCollector = axis.createLabelCollector();
              }
              if (axis.labelCollector) {
                chart.labelCollectors.push(axis.labelCollector);
              }
            } else {
              this.isRadial = false;
            }
            if (pane && isCircular) {
              pane.axis = axis;
            }
            axis.isCircular = isCircular;
          });
          addEvent(AxisClass, 'afterInit', function () {
            var axis = this;
            var chart = axis.chart,
              options = axis.options,
              isHidden = chart.angular && axis.isXAxis,
              pane = axis.pane,
              paneOptions = pane && pane.options;
            if (!isHidden && pane && (chart.angular || chart.polar)) {
              axis.angleRad = ((options.angle || 0) * Math.PI) / 180;
              axis.startAngleRad =
                ((paneOptions.startAngle - 90) * Math.PI) / 180;
              axis.endAngleRad =
                ((pick(paneOptions.endAngle, paneOptions.startAngle + 360) -
                  90) *
                  Math.PI) /
                180;
              axis.offset = options.offset || 0;
            }
          });
          addEvent(AxisClass, 'autoLabelAlign', function (e) {
            if (this.isRadial) {
              e.align = void 0;
              e.preventDefault();
            }
          });
          addEvent(AxisClass, 'destroy', function () {
            var axis = this;
            if (axis.chart && axis.chart.labelCollectors) {
              var index = axis.labelCollector
                ? axis.chart.labelCollectors.indexOf(axis.labelCollector)
                : -1;
              if (index >= 0) {
                axis.chart.labelCollectors.splice(index, 1);
              }
            }
          });
          addEvent(AxisClass, 'initialAxisTranslation', function () {
            var axis = this;
            if (axis.isRadial) {
              axis.beforeSetTickPositions();
            }
          });
          addEvent(TickClass, 'afterGetPosition', function (e) {
            var tick = this;
            if (tick.axis.getPosition) {
              extend(e.pos, tick.axis.getPosition(this.pos));
            }
          });
          addEvent(TickClass, 'afterGetLabelPosition', function (e) {
            var tick = this;
            var axis = tick.axis;
            var label = tick.label;
            if (!label) {
              return;
            }
            var labelBBox = label.getBBox(),
              labelOptions = axis.options.labels,
              optionsY = labelOptions.y,
              ret,
              centerSlot = 20,
              align = labelOptions.align,
              angle =
                (((axis.translate(this.pos) +
                  axis.startAngleRad +
                  Math.PI / 2) /
                  Math.PI) *
                  180) %
                360,
              correctAngle = Math.round(angle),
              labelDir = 'end',
              reducedAngle1 =
                correctAngle < 0 ? correctAngle + 360 : correctAngle,
              reducedAngle2 = reducedAngle1,
              translateY = 0,
              translateX = 0,
              labelYPosCorrection =
                labelOptions.y === null ? -labelBBox.height * 0.3 : 0;
            if (axis.isRadial) {
              ret = axis.getPosition(
                this.pos,
                axis.center[2] / 2 +
                  relativeLength(
                    pick(labelOptions.distance, -25),
                    axis.center[2] / 2,
                    -axis.center[2] / 2
                  )
              );
              if (labelOptions.rotation === 'auto') {
                label.attr({
                  rotation: angle,
                });
              } else if (optionsY === null) {
                optionsY =
                  axis.chart.renderer.fontMetrics(
                    label.styles && label.styles.fontSize
                  ).b -
                  labelBBox.height / 2;
              }
              if (align === null) {
                if (axis.isCircular) {
                  if (
                    labelBBox.width >
                    (axis.len * axis.tickInterval) / (axis.max - axis.min)
                  ) {
                    centerSlot = 0;
                  }
                  if (angle > centerSlot && angle < 180 - centerSlot) {
                    align = 'left';
                  } else if (
                    angle > 180 + centerSlot &&
                    angle < 360 - centerSlot
                  ) {
                    align = 'right';
                  } else {
                    align = 'center';
                  }
                } else {
                  align = 'center';
                }
                label.attr({
                  align: align,
                });
              }
              if (
                align === 'auto' &&
                axis.tickPositions.length === 2 &&
                axis.isCircular
              ) {
                if (reducedAngle1 > 90 && reducedAngle1 < 180) {
                  reducedAngle1 = 180 - reducedAngle1;
                } else if (reducedAngle1 > 270 && reducedAngle1 <= 360) {
                  reducedAngle1 = 540 - reducedAngle1;
                }
                if (reducedAngle2 > 180 && reducedAngle2 <= 360) {
                  reducedAngle2 = 360 - reducedAngle2;
                }
                if (
                  axis.pane.options.startAngle === correctAngle ||
                  axis.pane.options.startAngle === correctAngle + 360 ||
                  axis.pane.options.startAngle === correctAngle - 360
                ) {
                  labelDir = 'start';
                }
                if (
                  (correctAngle >= -90 && correctAngle <= 90) ||
                  (correctAngle >= -360 && correctAngle <= -270) ||
                  (correctAngle >= 270 && correctAngle <= 360)
                ) {
                  align = labelDir === 'start' ? 'right' : 'left';
                } else {
                  align = labelDir === 'start' ? 'left' : 'right';
                }
                if (reducedAngle2 > 70 && reducedAngle2 < 110) {
                  align = 'center';
                }
                if (
                  reducedAngle1 < 15 ||
                  (reducedAngle1 >= 180 && reducedAngle1 < 195)
                ) {
                  translateY = labelBBox.height * 0.3;
                } else if (reducedAngle1 >= 15 && reducedAngle1 <= 35) {
                  translateY =
                    labelDir === 'start' ? 0 : labelBBox.height * 0.75;
                } else if (reducedAngle1 >= 195 && reducedAngle1 <= 215) {
                  translateY =
                    labelDir === 'start' ? labelBBox.height * 0.75 : 0;
                } else if (reducedAngle1 > 35 && reducedAngle1 <= 90) {
                  translateY =
                    labelDir === 'start'
                      ? -labelBBox.height * 0.25
                      : labelBBox.height;
                } else if (reducedAngle1 > 215 && reducedAngle1 <= 270) {
                  translateY =
                    labelDir === 'start'
                      ? labelBBox.height
                      : -labelBBox.height * 0.25;
                }
                if (reducedAngle2 < 15) {
                  translateX =
                    labelDir === 'start'
                      ? -labelBBox.height * 0.15
                      : labelBBox.height * 0.15;
                } else if (reducedAngle2 > 165 && reducedAngle2 <= 180) {
                  translateX =
                    labelDir === 'start'
                      ? labelBBox.height * 0.15
                      : -labelBBox.height * 0.15;
                }
                label.attr({ align: align });
                label.translate(translateX, translateY + labelYPosCorrection);
              }
              e.pos.x = ret.x + labelOptions.x;
              e.pos.y = ret.y + optionsY;
            }
          });
          wrap(
            TickClass.prototype,
            'getMarkPath',
            function (proceed, x, y, tickLength, tickWidth, horiz, renderer) {
              var tick = this;
              var axis = tick.axis;
              var endPoint, ret;
              if (axis.isRadial) {
                endPoint = axis.getPosition(
                  this.pos,
                  axis.center[2] / 2 + tickLength
                );
                ret = ['M', x, y, 'L', endPoint.x, endPoint.y];
              } else {
                ret = proceed.call(
                  this,
                  x,
                  y,
                  tickLength,
                  tickWidth,
                  horiz,
                  renderer
                );
              }
              return ret;
            }
          );
        };
        RadialAxis.defaultCircularOptions = {
          gridLineWidth: 1,
          labels: {
            align: null,
            distance: 15,
            x: 0,
            y: null,
            style: {
              textOverflow: 'none',
            },
          },
          maxPadding: 0,
          minPadding: 0,
          showLastLabel: false,
          tickLength: 0,
        };
        RadialAxis.defaultRadialGaugeOptions = {
          labels: {
            align: 'center',
            x: 0,
            y: null,
          },
          minorGridLineWidth: 0,
          minorTickInterval: 'auto',
          minorTickLength: 10,
          minorTickPosition: 'inside',
          minorTickWidth: 1,
          tickLength: 10,
          tickPosition: 'inside',
          tickWidth: 2,
          title: {
            rotation: 0,
          },
          zIndex: 2,
        };
        RadialAxis.defaultRadialOptions = {
          gridLineInterpolation: 'circle',
          gridLineWidth: 1,
          labels: {
            align: 'right',
            x: -3,
            y: -2,
          },
          showLastLabel: false,
          title: {
            x: 4,
            text: null,
            rotation: 90,
          },
        };
        return RadialAxis;
      })();
      RadialAxis.compose(Axis, Tick);
      return RadialAxis;
    }
  );
  _registerModule(
    _modules,
    'Series/AreaRangeSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Series/Point.js'],
      _modules['Core/Utilities.js'],
    ],
    function (BaseSeries, H, Point, U) {
      var noop = H.noop;
      var defined = U.defined,
        extend = U.extend,
        isArray = U.isArray,
        isNumber = U.isNumber,
        pick = U.pick;
      var Series = H.Series,
        areaProto = BaseSeries.seriesTypes.area.prototype,
        columnProto = BaseSeries.seriesTypes.column.prototype,
        pointProto = Point.prototype,
        seriesProto = Series.prototype;
      BaseSeries.seriesType(
        'arearange',
        'area',
        {
          lineWidth: 1,
          threshold: null,
          tooltip: {
            pointFormat:
              '<span style="color:{series.color}">\u25CF</span> ' +
              '{series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>',
          },
          trackByArea: true,
          dataLabels: {
            align: void 0,
            verticalAlign: void 0,
            xLow: 0,
            xHigh: 0,
            yLow: 0,
            yHigh: 0,
          },
        },
        {
          pointArrayMap: ['low', 'high'],
          pointValKey: 'low',
          deferTranslatePolar: true,
          toYData: function (point) {
            return [point.low, point.high];
          },
          highToXY: function (point) {
            var chart = this.chart,
              xy = this.xAxis.postTranslate(
                point.rectPlotX,
                this.yAxis.len - point.plotHigh
              );
            point.plotHighX = xy.x - chart.plotLeft;
            point.plotHigh = xy.y - chart.plotTop;
            point.plotLowX = point.plotX;
          },
          translate: function () {
            var series = this,
              yAxis = series.yAxis,
              hasModifyValue = !!series.modifyValue;
            areaProto.translate.apply(series);
            series.points.forEach(function (point) {
              var high = point.high,
                plotY = point.plotY;
              if (point.isNull) {
                point.plotY = null;
              } else {
                point.plotLow = plotY;
                point.plotHigh = yAxis.translate(
                  hasModifyValue ? series.modifyValue(high, point) : high,
                  0,
                  1,
                  0,
                  1
                );
                if (hasModifyValue) {
                  point.yBottom = point.plotHigh;
                }
              }
            });
            if (this.chart.polar) {
              this.points.forEach(function (point) {
                series.highToXY(point);
                point.tooltipPos = [
                  (point.plotHighX + point.plotLowX) / 2,
                  (point.plotHigh + point.plotLow) / 2,
                ];
              });
            }
          },
          getGraphPath: function (points) {
            var highPoints = [],
              highAreaPoints = [],
              i,
              getGraphPath = areaProto.getGraphPath,
              point,
              pointShim,
              linePath,
              lowerPath,
              options = this.options,
              polar = this.chart.polar,
              connectEnds = polar && options.connectEnds !== false,
              connectNulls = options.connectNulls,
              step = options.step,
              higherPath,
              higherAreaPath;
            points = points || this.points;
            i = points.length;
            while (i--) {
              point = points[i];
              var highAreaPoint = polar
                ? {
                    plotX: point.rectPlotX,
                    plotY: point.yBottom,
                    doCurve: false,
                  }
                : {
                    plotX: point.plotX,
                    plotY: point.plotY,
                    doCurve: false,
                  };
              if (
                !point.isNull &&
                !connectEnds &&
                !connectNulls &&
                (!points[i + 1] || points[i + 1].isNull)
              ) {
                highAreaPoints.push(highAreaPoint);
              }
              pointShim = {
                polarPlotY: point.polarPlotY,
                rectPlotX: point.rectPlotX,
                yBottom: point.yBottom,
                plotX: pick(point.plotHighX, point.plotX),
                plotY: point.plotHigh,
                isNull: point.isNull,
              };
              highAreaPoints.push(pointShim);
              highPoints.push(pointShim);
              if (
                !point.isNull &&
                !connectEnds &&
                !connectNulls &&
                (!points[i - 1] || points[i - 1].isNull)
              ) {
                highAreaPoints.push(highAreaPoint);
              }
            }
            lowerPath = getGraphPath.call(this, points);
            if (step) {
              if (step === true) {
                step = 'left';
              }
              options.step = {
                left: 'right',
                center: 'center',
                right: 'left',
              }[step];
            }
            higherPath = getGraphPath.call(this, highPoints);
            higherAreaPath = getGraphPath.call(this, highAreaPoints);
            options.step = step;
            linePath = [].concat(lowerPath, higherPath);
            if (
              !this.chart.polar &&
              higherAreaPath[0] &&
              higherAreaPath[0][0] === 'M'
            ) {
              higherAreaPath[0] = [
                'L',
                higherAreaPath[0][1],
                higherAreaPath[0][2],
              ];
            }
            this.graphPath = linePath;
            this.areaPath = lowerPath.concat(higherAreaPath);
            linePath.isArea = true;
            linePath.xMap = lowerPath.xMap;
            this.areaPath.xMap = lowerPath.xMap;
            return linePath;
          },
          drawDataLabels: function () {
            var data = this.points,
              length = data.length,
              i,
              originalDataLabels = [],
              dataLabelOptions = this.options.dataLabels,
              point,
              up,
              inverted = this.chart.inverted,
              upperDataLabelOptions,
              lowerDataLabelOptions;
            if (isArray(dataLabelOptions)) {
              upperDataLabelOptions = dataLabelOptions[0] || { enabled: false };
              lowerDataLabelOptions = dataLabelOptions[1] || { enabled: false };
            } else {
              upperDataLabelOptions = extend({}, dataLabelOptions);
              upperDataLabelOptions.x = dataLabelOptions.xHigh;
              upperDataLabelOptions.y = dataLabelOptions.yHigh;
              lowerDataLabelOptions = extend({}, dataLabelOptions);
              lowerDataLabelOptions.x = dataLabelOptions.xLow;
              lowerDataLabelOptions.y = dataLabelOptions.yLow;
            }
            if (upperDataLabelOptions.enabled || this._hasPointLabels) {
              i = length;
              while (i--) {
                point = data[i];
                if (point) {
                  up = upperDataLabelOptions.inside
                    ? point.plotHigh < point.plotLow
                    : point.plotHigh > point.plotLow;
                  point.y = point.high;
                  point._plotY = point.plotY;
                  point.plotY = point.plotHigh;
                  originalDataLabels[i] = point.dataLabel;
                  point.dataLabel = point.dataLabelUpper;
                  point.below = up;
                  if (inverted) {
                    if (!upperDataLabelOptions.align) {
                      upperDataLabelOptions.align = up ? 'right' : 'left';
                    }
                  } else {
                    if (!upperDataLabelOptions.verticalAlign) {
                      upperDataLabelOptions.verticalAlign = up
                        ? 'top'
                        : 'bottom';
                    }
                  }
                }
              }
              this.options.dataLabels = upperDataLabelOptions;
              if (seriesProto.drawDataLabels) {
                seriesProto.drawDataLabels.apply(this, arguments);
              }
              i = length;
              while (i--) {
                point = data[i];
                if (point) {
                  point.dataLabelUpper = point.dataLabel;
                  point.dataLabel = originalDataLabels[i];
                  delete point.dataLabels;
                  point.y = point.low;
                  point.plotY = point._plotY;
                }
              }
            }
            if (lowerDataLabelOptions.enabled || this._hasPointLabels) {
              i = length;
              while (i--) {
                point = data[i];
                if (point) {
                  up = lowerDataLabelOptions.inside
                    ? point.plotHigh < point.plotLow
                    : point.plotHigh > point.plotLow;
                  point.below = !up;
                  if (inverted) {
                    if (!lowerDataLabelOptions.align) {
                      lowerDataLabelOptions.align = up ? 'left' : 'right';
                    }
                  } else {
                    if (!lowerDataLabelOptions.verticalAlign) {
                      lowerDataLabelOptions.verticalAlign = up
                        ? 'bottom'
                        : 'top';
                    }
                  }
                }
              }
              this.options.dataLabels = lowerDataLabelOptions;
              if (seriesProto.drawDataLabels) {
                seriesProto.drawDataLabels.apply(this, arguments);
              }
            }
            if (upperDataLabelOptions.enabled) {
              i = length;
              while (i--) {
                point = data[i];
                if (point) {
                  point.dataLabels = [
                    point.dataLabelUpper,
                    point.dataLabel,
                  ].filter(function (label) {
                    return !!label;
                  });
                }
              }
            }
            this.options.dataLabels = dataLabelOptions;
          },
          alignDataLabel: function () {
            columnProto.alignDataLabel.apply(this, arguments);
          },
          drawPoints: function () {
            var series = this,
              pointLength = series.points.length,
              point,
              i;
            seriesProto.drawPoints.apply(series, arguments);
            i = 0;
            while (i < pointLength) {
              point = series.points[i];
              point.origProps = {
                plotY: point.plotY,
                plotX: point.plotX,
                isInside: point.isInside,
                negative: point.negative,
                zone: point.zone,
                y: point.y,
              };
              point.lowerGraphic = point.graphic;
              point.graphic = point.upperGraphic;
              point.plotY = point.plotHigh;
              if (defined(point.plotHighX)) {
                point.plotX = point.plotHighX;
              }
              point.y = point.high;
              point.negative = point.high < (series.options.threshold || 0);
              point.zone = series.zones.length && point.getZone();
              if (!series.chart.polar) {
                point.isInside = point.isTopInside =
                  typeof point.plotY !== 'undefined' &&
                  point.plotY >= 0 &&
                  point.plotY <= series.yAxis.len &&
                  point.plotX >= 0 &&
                  point.plotX <= series.xAxis.len;
              }
              i++;
            }
            seriesProto.drawPoints.apply(series, arguments);
            i = 0;
            while (i < pointLength) {
              point = series.points[i];
              point.upperGraphic = point.graphic;
              point.graphic = point.lowerGraphic;
              extend(point, point.origProps);
              delete point.origProps;
              i++;
            }
          },
          setStackedPoints: noop,
        },
        {
          setState: function () {
            var prevState = this.state,
              series = this.series,
              isPolar = series.chart.polar;
            if (!defined(this.plotHigh)) {
              this.plotHigh = series.yAxis.toPixels(this.high, true);
            }
            if (!defined(this.plotLow)) {
              this.plotLow = this.plotY = series.yAxis.toPixels(this.low, true);
            }
            if (series.stateMarkerGraphic) {
              series.lowerStateMarkerGraphic = series.stateMarkerGraphic;
              series.stateMarkerGraphic = series.upperStateMarkerGraphic;
            }
            this.graphic = this.upperGraphic;
            this.plotY = this.plotHigh;
            if (isPolar) {
              this.plotX = this.plotHighX;
            }
            pointProto.setState.apply(this, arguments);
            this.state = prevState;
            this.plotY = this.plotLow;
            this.graphic = this.lowerGraphic;
            if (isPolar) {
              this.plotX = this.plotLowX;
            }
            if (series.stateMarkerGraphic) {
              series.upperStateMarkerGraphic = series.stateMarkerGraphic;
              series.stateMarkerGraphic = series.lowerStateMarkerGraphic;
              series.lowerStateMarkerGraphic = void 0;
            }
            pointProto.setState.apply(this, arguments);
          },
          haloPath: function () {
            var isPolar = this.series.chart.polar,
              path = [];
            this.plotY = this.plotLow;
            if (isPolar) {
              this.plotX = this.plotLowX;
            }
            if (this.isInside) {
              path = pointProto.haloPath.apply(this, arguments);
            }
            this.plotY = this.plotHigh;
            if (isPolar) {
              this.plotX = this.plotHighX;
            }
            if (this.isTopInside) {
              path = path.concat(pointProto.haloPath.apply(this, arguments));
            }
            return path;
          },
          destroyElements: function () {
            var graphics = ['lowerGraphic', 'upperGraphic'];
            graphics.forEach(function (graphicName) {
              if (this[graphicName]) {
                this[graphicName] = this[graphicName].destroy();
              }
            }, this);
            this.graphic = null;
            return pointProto.destroyElements.apply(this, arguments);
          },
          isValid: function () {
            return isNumber(this.low) && isNumber(this.high);
          },
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/AreaSplineRangeSeries.js',
    [_modules['Core/Series/Series.js']],
    function (BaseSeries) {
      BaseSeries.seriesType('areasplinerange', 'arearange', null, {
        getPointSpline: BaseSeries.seriesTypes.spline.prototype.getPointSpline,
      });
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/ColumnRangeSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Options.js'],
      _modules['Core/Utilities.js'],
    ],
    function (BaseSeries, H, O, U) {
      var noop = H.noop;
      var defaultOptions = O.defaultOptions;
      var clamp = U.clamp,
        merge = U.merge,
        pick = U.pick;
      var columnProto = BaseSeries.seriesTypes.column.prototype;
      var columnRangeOptions = {
        pointRange: null,
        marker: null,
        states: {
          hover: {
            halo: false,
          },
        },
      };
      BaseSeries.seriesType(
        'columnrange',
        'arearange',
        merge(
          defaultOptions.plotOptions.column,
          defaultOptions.plotOptions.arearange,
          columnRangeOptions
        ),
        {
          translate: function () {
            var series = this,
              yAxis = series.yAxis,
              xAxis = series.xAxis,
              startAngleRad = xAxis.startAngleRad,
              start,
              chart = series.chart,
              isRadial = series.xAxis.isRadial,
              safeDistance =
                Math.max(chart.chartWidth, chart.chartHeight) + 999,
              plotHigh;
            function safeBounds(pixelPos) {
              return clamp(pixelPos, -safeDistance, safeDistance);
            }
            columnProto.translate.apply(series);
            series.points.forEach(function (point) {
              var shapeArgs = point.shapeArgs,
                minPointLength = series.options.minPointLength,
                heightDifference,
                height,
                y;
              point.plotHigh = plotHigh = safeBounds(
                yAxis.translate(point.high, 0, 1, 0, 1)
              );
              point.plotLow = safeBounds(point.plotY);
              y = plotHigh;
              height = pick(point.rectPlotY, point.plotY) - plotHigh;
              if (Math.abs(height) < minPointLength) {
                heightDifference = minPointLength - height;
                height += heightDifference;
                y -= heightDifference / 2;
              } else if (height < 0) {
                height *= -1;
                y -= height;
              }
              if (isRadial) {
                start = point.barX + startAngleRad;
                point.shapeType = 'arc';
                point.shapeArgs = series.polarArc(
                  y + height,
                  y,
                  start,
                  start + point.pointWidth
                );
              } else {
                shapeArgs.height = height;
                shapeArgs.y = y;
                point.tooltipPos = chart.inverted
                  ? [
                      yAxis.len + yAxis.pos - chart.plotLeft - y - height / 2,
                      xAxis.len +
                        xAxis.pos -
                        chart.plotTop -
                        shapeArgs.x -
                        shapeArgs.width / 2,
                      height,
                    ]
                  : [
                      xAxis.left -
                        chart.plotLeft +
                        shapeArgs.x +
                        shapeArgs.width / 2,
                      yAxis.pos - chart.plotTop + y + height / 2,
                      height,
                    ];
              }
            });
          },
          directTouch: true,
          trackerGroups: ['group', 'dataLabelsGroup'],
          drawGraph: noop,
          getSymbol: noop,
          crispCol: function () {
            return columnProto.crispCol.apply(this, arguments);
          },
          drawPoints: function () {
            return columnProto.drawPoints.apply(this, arguments);
          },
          drawTracker: function () {
            return columnProto.drawTracker.apply(this, arguments);
          },
          getColumnMetrics: function () {
            return columnProto.getColumnMetrics.apply(this, arguments);
          },
          pointAttribs: function () {
            return columnProto.pointAttribs.apply(this, arguments);
          },
          animate: function () {
            return columnProto.animate.apply(this, arguments);
          },
          polarArc: function () {
            return columnProto.polarArc.apply(this, arguments);
          },
          translate3dPoints: function () {
            return columnProto.translate3dPoints.apply(this, arguments);
          },
          translate3dShapes: function () {
            return columnProto.translate3dShapes.apply(this, arguments);
          },
        },
        {
          setState: columnProto.pointClass.prototype.setState,
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/ColumnPyramidSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Series/ColumnSeries.js'],
      _modules['Core/Utilities.js'],
    ],
    function (BaseSeries, ColumnSeries, U) {
      var colProto = ColumnSeries.prototype;
      var clamp = U.clamp,
        pick = U.pick;
      BaseSeries.seriesType(
        'columnpyramid',
        'column',
        {},
        {
          translate: function () {
            var series = this,
              chart = series.chart,
              options = series.options,
              dense = (series.dense =
                series.closestPointRange * series.xAxis.transA < 2),
              borderWidth = (series.borderWidth = pick(
                options.borderWidth,
                dense ? 0 : 1
              )),
              yAxis = series.yAxis,
              threshold = options.threshold,
              translatedThreshold = (series.translatedThreshold =
                yAxis.getThreshold(threshold)),
              minPointLength = pick(options.minPointLength, 5),
              metrics = series.getColumnMetrics(),
              pointWidth = metrics.width,
              seriesBarW = (series.barW = Math.max(
                pointWidth,
                1 + 2 * borderWidth
              )),
              pointXOffset = (series.pointXOffset = metrics.offset);
            if (chart.inverted) {
              translatedThreshold -= 0.5;
            }
            if (options.pointPadding) {
              seriesBarW = Math.ceil(seriesBarW);
            }
            colProto.translate.apply(series);
            series.points.forEach(function (point) {
              var yBottom = pick(point.yBottom, translatedThreshold),
                safeDistance = 999 + Math.abs(yBottom),
                plotY = clamp(
                  point.plotY,
                  -safeDistance,
                  yAxis.len + safeDistance
                ),
                barX = point.plotX + pointXOffset,
                barW = seriesBarW / 2,
                barY = Math.min(plotY, yBottom),
                barH = Math.max(plotY, yBottom) - barY,
                stackTotal,
                stackHeight,
                topPointY,
                topXwidth,
                bottomXwidth,
                invBarPos,
                x1,
                x2,
                x3,
                x4,
                y1,
                y2;
              point.barX = barX;
              point.pointWidth = pointWidth;
              point.tooltipPos = chart.inverted
                ? [
                    yAxis.len + yAxis.pos - chart.plotLeft - plotY,
                    series.xAxis.len - barX - barW,
                    barH,
                  ]
                : [barX + barW, plotY + yAxis.pos - chart.plotTop, barH];
              stackTotal = threshold + (point.total || point.y);
              if (options.stacking === 'percent') {
                stackTotal = threshold + (point.y < 0) ? -100 : 100;
              }
              topPointY = yAxis.toPixels(stackTotal, true);
              stackHeight =
                chart.plotHeight -
                topPointY -
                (chart.plotHeight - translatedThreshold);
              topXwidth = stackHeight
                ? (barW * (barY - topPointY)) / stackHeight
                : 0;
              bottomXwidth = stackHeight
                ? (barW * (barY + barH - topPointY)) / stackHeight
                : 0;
              x1 = barX - topXwidth + barW;
              x2 = barX + topXwidth + barW;
              x3 = barX + bottomXwidth + barW;
              x4 = barX - bottomXwidth + barW;
              y1 = barY - minPointLength;
              y2 = barY + barH;
              if (point.y < 0) {
                y1 = barY;
                y2 = barY + barH + minPointLength;
              }
              if (chart.inverted) {
                invBarPos = chart.plotWidth - barY;
                stackHeight =
                  topPointY - (chart.plotWidth - translatedThreshold);
                topXwidth = (barW * (topPointY - invBarPos)) / stackHeight;
                bottomXwidth =
                  (barW * (topPointY - (invBarPos - barH))) / stackHeight;
                x1 = barX + barW + topXwidth;
                x2 = x1 - 2 * topXwidth;
                x3 = barX - bottomXwidth + barW;
                x4 = barX + bottomXwidth + barW;
                y1 = barY;
                y2 = barY + barH - minPointLength;
                if (point.y < 0) {
                  y2 = barY + barH + minPointLength;
                }
              }
              point.shapeType = 'path';
              point.shapeArgs = {
                x: x1,
                y: y1,
                width: x2 - x1,
                height: barH,
                d: [
                  ['M', x1, y1],
                  ['L', x2, y1],
                  ['L', x3, y2],
                  ['L', x4, y2],
                  ['Z'],
                ],
              };
            });
          },
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/GaugeSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Utilities.js'],
    ],
    function (BaseSeries, H, U) {
      var noop = H.noop;
      var clamp = U.clamp,
        isNumber = U.isNumber,
        merge = U.merge,
        pick = U.pick,
        pInt = U.pInt;
      var Series = H.Series,
        TrackerMixin = H.TrackerMixin;
      BaseSeries.seriesType(
        'gauge',
        'line',
        {
          dataLabels: {
            borderColor: '#cccccc',
            borderRadius: 3,
            borderWidth: 1,
            crop: false,
            defer: false,
            enabled: true,
            verticalAlign: 'top',
            y: 15,
            zIndex: 2,
          },
          dial: {},
          pivot: {},
          tooltip: {
            headerFormat: '',
          },
          showInLegend: false,
        },
        {
          angular: true,
          directTouch: true,
          drawGraph: noop,
          fixedBox: true,
          forceDL: true,
          noSharedTooltip: true,
          trackerGroups: ['group', 'dataLabelsGroup'],
          translate: function () {
            var series = this,
              yAxis = series.yAxis,
              options = series.options,
              center = yAxis.center;
            series.generatePoints();
            series.points.forEach(function (point) {
              var dialOptions = merge(options.dial, point.dial),
                radius =
                  (pInt(pick(dialOptions.radius, '80%')) * center[2]) / 200,
                baseLength =
                  (pInt(pick(dialOptions.baseLength, '70%')) * radius) / 100,
                rearLength =
                  (pInt(pick(dialOptions.rearLength, '10%')) * radius) / 100,
                baseWidth = dialOptions.baseWidth || 3,
                topWidth = dialOptions.topWidth || 1,
                overshoot = options.overshoot,
                rotation =
                  yAxis.startAngleRad +
                  yAxis.translate(point.y, null, null, null, true);
              if (isNumber(overshoot) || options.wrap === false) {
                overshoot = isNumber(overshoot)
                  ? (overshoot / 180) * Math.PI
                  : 0;
                rotation = clamp(
                  rotation,
                  yAxis.startAngleRad - overshoot,
                  yAxis.endAngleRad + overshoot
                );
              }
              rotation = (rotation * 180) / Math.PI;
              point.shapeType = 'path';
              var d = dialOptions.path || [
                ['M', -rearLength, -baseWidth / 2],
                ['L', baseLength, -baseWidth / 2],
                ['L', radius, -topWidth / 2],
                ['L', radius, topWidth / 2],
                ['L', baseLength, baseWidth / 2],
                ['L', -rearLength, baseWidth / 2],
                ['Z'],
              ];
              point.shapeArgs = {
                d: d,
                translateX: center[0],
                translateY: center[1],
                rotation: rotation,
              };
              point.plotX = center[0];
              point.plotY = center[1];
            });
          },
          drawPoints: function () {
            var series = this,
              chart = series.chart,
              center = series.yAxis.center,
              pivot = series.pivot,
              options = series.options,
              pivotOptions = options.pivot,
              renderer = chart.renderer;
            series.points.forEach(function (point) {
              var graphic = point.graphic,
                shapeArgs = point.shapeArgs,
                d = shapeArgs.d,
                dialOptions = merge(options.dial, point.dial);
              if (graphic) {
                graphic.animate(shapeArgs);
                shapeArgs.d = d;
              } else {
                point.graphic = renderer[point.shapeType](shapeArgs)
                  .attr({
                    rotation: shapeArgs.rotation,
                    zIndex: 1,
                  })
                  .addClass('highcharts-dial')
                  .add(series.group);
              }
              if (!chart.styledMode) {
                point.graphic[graphic ? 'animate' : 'attr']({
                  stroke: dialOptions.borderColor || 'none',
                  'stroke-width': dialOptions.borderWidth || 0,
                  fill: dialOptions.backgroundColor || '#000000',
                });
              }
            });
            if (pivot) {
              pivot.animate({
                translateX: center[0],
                translateY: center[1],
              });
            } else {
              series.pivot = renderer
                .circle(0, 0, pick(pivotOptions.radius, 5))
                .attr({
                  zIndex: 2,
                })
                .addClass('highcharts-pivot')
                .translate(center[0], center[1])
                .add(series.group);
              if (!chart.styledMode) {
                series.pivot.attr({
                  'stroke-width': pivotOptions.borderWidth || 0,
                  stroke: pivotOptions.borderColor || '#cccccc',
                  fill: pivotOptions.backgroundColor || '#000000',
                });
              }
            }
          },
          animate: function (init) {
            var series = this;
            if (!init) {
              series.points.forEach(function (point) {
                var graphic = point.graphic;
                if (graphic) {
                  graphic.attr({
                    rotation: (series.yAxis.startAngleRad * 180) / Math.PI,
                  });
                  graphic.animate(
                    {
                      rotation: point.shapeArgs.rotation,
                    },
                    series.options.animation
                  );
                }
              });
            }
          },
          render: function () {
            this.group = this.plotGroup(
              'group',
              'series',
              this.visible ? 'visible' : 'hidden',
              this.options.zIndex,
              this.chart.seriesGroup
            );
            Series.prototype.render.call(this);
            this.group.clip(this.chart.clipRect);
          },
          setData: function (data, redraw) {
            Series.prototype.setData.call(this, data, false);
            this.processData();
            this.generatePoints();
            if (pick(redraw, true)) {
              this.chart.redraw();
            }
          },
          hasData: function () {
            return !!this.points.length;
          },
          drawTracker: TrackerMixin && TrackerMixin.drawTrackerPoint,
        },
        {
          setState: function (state) {
            this.state = state;
          },
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/BoxPlotSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Series/ColumnSeries.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Series, ColumnSeries, H, U) {
      var columnProto = ColumnSeries.prototype;
      var noop = H.noop;
      var pick = U.pick;
      Series.seriesType(
        'boxplot',
        'column',
        {
          threshold: null,
          tooltip: {
            pointFormat:
              '<span style="color:{point.color}">\u25CF</span> <b> ' +
              '{series.name}</b><br/>' +
              'Maximum: {point.high}<br/>' +
              'Upper quartile: {point.q3}<br/>' +
              'Median: {point.median}<br/>' +
              'Lower quartile: {point.q1}<br/>' +
              'Minimum: {point.low}<br/>',
          },
          whiskerLength: '50%',
          fillColor: '#ffffff',
          lineWidth: 1,
          medianWidth: 2,
          whiskerWidth: 2,
        },
        {
          pointArrayMap: ['low', 'q1', 'median', 'q3', 'high'],
          toYData: function (point) {
            return [point.low, point.q1, point.median, point.q3, point.high];
          },
          pointValKey: 'high',
          pointAttribs: function () {
            return {};
          },
          drawDataLabels: noop,
          translate: function () {
            var series = this,
              yAxis = series.yAxis,
              pointArrayMap = series.pointArrayMap;
            columnProto.translate.apply(series);
            series.points.forEach(function (point) {
              pointArrayMap.forEach(function (key) {
                if (point[key] !== null) {
                  point[key + 'Plot'] = yAxis.translate(point[key], 0, 1, 0, 1);
                }
              });
              point.plotHigh = point.highPlot;
            });
          },
          drawPoints: function () {
            var series = this,
              points = series.points,
              options = series.options,
              chart = series.chart,
              renderer = chart.renderer,
              q1Plot,
              q3Plot,
              highPlot,
              lowPlot,
              medianPlot,
              medianPath,
              crispCorr,
              crispX = 0,
              boxPath,
              width,
              left,
              right,
              halfWidth,
              doQuartiles = series.doQuartiles !== false,
              pointWiskerLength,
              whiskerLength = series.options.whiskerLength;
            points.forEach(function (point) {
              var graphic = point.graphic,
                verb = graphic ? 'animate' : 'attr',
                shapeArgs = point.shapeArgs,
                boxAttr = {},
                stemAttr = {},
                whiskersAttr = {},
                medianAttr = {},
                color = point.color || series.color;
              if (typeof point.plotY !== 'undefined') {
                width = Math.round(shapeArgs.width);
                left = Math.floor(shapeArgs.x);
                right = left + width;
                halfWidth = Math.round(width / 2);
                q1Plot = Math.floor(doQuartiles ? point.q1Plot : point.lowPlot);
                q3Plot = Math.floor(doQuartiles ? point.q3Plot : point.lowPlot);
                highPlot = Math.floor(point.highPlot);
                lowPlot = Math.floor(point.lowPlot);
                if (!graphic) {
                  point.graphic = graphic = renderer
                    .g('point')
                    .add(series.group);
                  point.stem = renderer
                    .path()
                    .addClass('highcharts-boxplot-stem')
                    .add(graphic);
                  if (whiskerLength) {
                    point.whiskers = renderer
                      .path()
                      .addClass('highcharts-boxplot-whisker')
                      .add(graphic);
                  }
                  if (doQuartiles) {
                    point.box = renderer
                      .path(boxPath)
                      .addClass('highcharts-boxplot-box')
                      .add(graphic);
                  }
                  point.medianShape = renderer
                    .path(medianPath)
                    .addClass('highcharts-boxplot-median')
                    .add(graphic);
                }
                if (!chart.styledMode) {
                  stemAttr.stroke =
                    point.stemColor || options.stemColor || color;
                  stemAttr['stroke-width'] = pick(
                    point.stemWidth,
                    options.stemWidth,
                    options.lineWidth
                  );
                  stemAttr.dashstyle =
                    point.stemDashStyle ||
                    options.stemDashStyle ||
                    options.dashStyle;
                  point.stem.attr(stemAttr);
                  if (whiskerLength) {
                    whiskersAttr.stroke =
                      point.whiskerColor || options.whiskerColor || color;
                    whiskersAttr['stroke-width'] = pick(
                      point.whiskerWidth,
                      options.whiskerWidth,
                      options.lineWidth
                    );
                    whiskersAttr.dashstyle =
                      point.whiskerDashStyle ||
                      options.whiskerDashStyle ||
                      options.dashStyle;
                    point.whiskers.attr(whiskersAttr);
                  }
                  if (doQuartiles) {
                    boxAttr.fill =
                      point.fillColor || options.fillColor || color;
                    boxAttr.stroke = options.lineColor || color;
                    boxAttr['stroke-width'] = options.lineWidth || 0;
                    boxAttr.dashstyle =
                      point.boxDashStyle ||
                      options.boxDashStyle ||
                      options.dashStyle;
                    point.box.attr(boxAttr);
                  }
                  medianAttr.stroke =
                    point.medianColor || options.medianColor || color;
                  medianAttr['stroke-width'] = pick(
                    point.medianWidth,
                    options.medianWidth,
                    options.lineWidth
                  );
                  medianAttr.dashstyle =
                    point.medianDashStyle ||
                    options.medianDashStyle ||
                    options.dashStyle;
                  point.medianShape.attr(medianAttr);
                }
                var d = void 0;
                crispCorr = (point.stem.strokeWidth() % 2) / 2;
                crispX = left + halfWidth + crispCorr;
                d = [
                  ['M', crispX, q3Plot],
                  ['L', crispX, highPlot],
                  ['M', crispX, q1Plot],
                  ['L', crispX, lowPlot],
                ];
                point.stem[verb]({ d: d });
                if (doQuartiles) {
                  crispCorr = (point.box.strokeWidth() % 2) / 2;
                  q1Plot = Math.floor(q1Plot) + crispCorr;
                  q3Plot = Math.floor(q3Plot) + crispCorr;
                  left += crispCorr;
                  right += crispCorr;
                  d = [
                    ['M', left, q3Plot],
                    ['L', left, q1Plot],
                    ['L', right, q1Plot],
                    ['L', right, q3Plot],
                    ['L', left, q3Plot],
                    ['Z'],
                  ];
                  point.box[verb]({ d: d });
                }
                if (whiskerLength) {
                  crispCorr = (point.whiskers.strokeWidth() % 2) / 2;
                  highPlot = highPlot + crispCorr;
                  lowPlot = lowPlot + crispCorr;
                  pointWiskerLength = /%$/.test(whiskerLength)
                    ? (halfWidth * parseFloat(whiskerLength)) / 100
                    : whiskerLength / 2;
                  d = [
                    ['M', crispX - pointWiskerLength, highPlot],
                    ['L', crispX + pointWiskerLength, highPlot],
                    ['M', crispX - pointWiskerLength, lowPlot],
                    ['L', crispX + pointWiskerLength, lowPlot],
                  ];
                  point.whiskers[verb]({ d: d });
                }
                medianPlot = Math.round(point.medianPlot);
                crispCorr = (point.medianShape.strokeWidth() % 2) / 2;
                medianPlot = medianPlot + crispCorr;
                d = [
                  ['M', left, medianPlot],
                  ['L', right, medianPlot],
                ];
                point.medianShape[verb]({ d: d });
              }
            });
          },
          setStackedPoints: noop,
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/ErrorBarSeries.js',
    [_modules['Core/Series/Series.js'], _modules['Core/Globals.js']],
    function (BaseSeries, H) {
      var noop = H.noop,
        seriesTypes = BaseSeries.seriesTypes;
      BaseSeries.seriesType(
        'errorbar',
        'boxplot',
        {
          color: '#000000',
          grouping: false,
          linkedTo: ':previous',
          tooltip: {
            pointFormat:
              '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.low}</b> - <b>{point.high}</b><br/>',
          },
          whiskerWidth: null,
        },
        {
          type: 'errorbar',
          pointArrayMap: ['low', 'high'],
          toYData: function (point) {
            return [point.low, point.high];
          },
          pointValKey: 'high',
          doQuartiles: false,
          drawDataLabels: seriesTypes.arearange
            ? function () {
                var valKey = this.pointValKey;
                seriesTypes.arearange.prototype.drawDataLabels.call(this);
                this.data.forEach(function (point) {
                  point.y = point[valKey];
                });
              }
            : noop,
          getColumnMetrics: function () {
            return (
              (this.linkedParent && this.linkedParent.columnMetrics) ||
              seriesTypes.column.prototype.getColumnMetrics.call(this)
            );
          },
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/WaterfallSeries.js',
    [
      _modules['Core/Axis/Axis.js'],
      _modules['Core/Series/Series.js'],
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Series/Point.js'],
      _modules['Extensions/Stacking.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Axis, BaseSeries, Chart, H, Point, StackItem, U) {
      var seriesTypes = BaseSeries.seriesTypes;
      var addEvent = U.addEvent,
        arrayMax = U.arrayMax,
        arrayMin = U.arrayMin,
        correctFloat = U.correctFloat,
        isNumber = U.isNumber,
        objectEach = U.objectEach,
        pick = U.pick;
      var Series = H.Series;
      function ownProp(obj, key) {
        return Object.hasOwnProperty.call(obj, key);
      }
      var WaterfallAxis;
      (function (WaterfallAxis) {
        var Composition = (function () {
          function Composition(axis) {
            this.axis = axis;
            this.stacks = {
              changed: false,
            };
          }
          Composition.prototype.renderStackTotals = function () {
            var yAxis = this.axis,
              waterfallStacks = yAxis.waterfall.stacks,
              stackTotalGroup =
                yAxis.stacking && yAxis.stacking.stackTotalGroup,
              dummyStackItem = new StackItem(
                yAxis,
                yAxis.options.stackLabels,
                false,
                0,
                void 0
              );
            this.dummyStackItem = dummyStackItem;
            objectEach(waterfallStacks, function (type) {
              objectEach(type, function (stackItem) {
                dummyStackItem.total = stackItem.stackTotal;
                if (stackItem.label) {
                  dummyStackItem.label = stackItem.label;
                }
                StackItem.prototype.render.call(
                  dummyStackItem,
                  stackTotalGroup
                );
                stackItem.label = dummyStackItem.label;
                delete dummyStackItem.label;
              });
            });
            dummyStackItem.total = null;
          };
          return Composition;
        })();
        WaterfallAxis.Composition = Composition;
        function compose(AxisClass, ChartClass) {
          addEvent(AxisClass, 'init', onInit);
          addEvent(AxisClass, 'afterBuildStacks', onAfterBuildStacks);
          addEvent(AxisClass, 'afterRender', onAfterRender);
          addEvent(ChartClass, 'beforeRedraw', onBeforeRedraw);
        }
        WaterfallAxis.compose = compose;
        function onAfterBuildStacks() {
          var axis = this;
          var stacks = axis.waterfall.stacks;
          if (stacks) {
            stacks.changed = false;
            delete stacks.alreadyChanged;
          }
        }
        function onAfterRender() {
          var axis = this;
          var stackLabelOptions = axis.options.stackLabels;
          if (
            stackLabelOptions &&
            stackLabelOptions.enabled &&
            axis.waterfall.stacks
          ) {
            axis.waterfall.renderStackTotals();
          }
        }
        function onBeforeRedraw() {
          var axes = this.axes,
            series = this.series,
            i = series.length;
          while (i--) {
            if (series[i].options.stacking) {
              axes.forEach(function (axis) {
                if (!axis.isXAxis) {
                  axis.waterfall.stacks.changed = true;
                }
              });
              i = 0;
            }
          }
        }
        function onInit() {
          var axis = this;
          if (!axis.waterfall) {
            axis.waterfall = new Composition(axis);
          }
        }
      })(WaterfallAxis || (WaterfallAxis = {}));
      BaseSeries.seriesType(
        'waterfall',
        'column',
        {
          dataLabels: {
            inside: true,
          },
          lineWidth: 1,
          lineColor: '#333333',
          dashStyle: 'Dot',
          borderColor: '#333333',
          states: {
            hover: {
              lineWidthPlus: 0,
            },
          },
        },
        {
          pointValKey: 'y',
          showLine: true,
          generatePoints: function () {
            var point, len, i, y;
            seriesTypes.column.prototype.generatePoints.apply(this);
            for (i = 0, len = this.points.length; i < len; i++) {
              point = this.points[i];
              y = this.processedYData[i];
              if (point.isIntermediateSum || point.isSum) {
                point.y = correctFloat(y);
              }
            }
          },
          translate: function () {
            var series = this,
              options = series.options,
              yAxis = series.yAxis,
              len,
              i,
              points,
              point,
              shapeArgs,
              y,
              yValue,
              previousY,
              previousIntermediate,
              range,
              minPointLength = pick(options.minPointLength, 5),
              halfMinPointLength = minPointLength / 2,
              threshold = options.threshold,
              stacking = options.stacking,
              tooltipY,
              actualStack = yAxis.waterfall.stacks[series.stackKey],
              actualStackX,
              dummyStackItem,
              total,
              pointY,
              yPos,
              hPos;
            seriesTypes.column.prototype.translate.apply(series);
            previousY = previousIntermediate = threshold;
            points = series.points;
            for (i = 0, len = points.length; i < len; i++) {
              point = points[i];
              yValue = series.processedYData[i];
              shapeArgs = point.shapeArgs;
              range = [0, yValue];
              pointY = point.y;
              if (stacking) {
                if (actualStack) {
                  actualStackX = actualStack[i];
                  if (stacking === 'overlap') {
                    total = actualStackX.stackState[actualStackX.stateIndex--];
                    y = pointY >= 0 ? total : total - pointY;
                    if (ownProp(actualStackX, 'absolutePos')) {
                      delete actualStackX.absolutePos;
                    }
                    if (ownProp(actualStackX, 'absoluteNeg')) {
                      delete actualStackX.absoluteNeg;
                    }
                  } else {
                    if (pointY >= 0) {
                      total = actualStackX.threshold + actualStackX.posTotal;
                      actualStackX.posTotal -= pointY;
                      y = total;
                    } else {
                      total = actualStackX.threshold + actualStackX.negTotal;
                      actualStackX.negTotal -= pointY;
                      y = total - pointY;
                    }
                    if (!actualStackX.posTotal) {
                      if (ownProp(actualStackX, 'absolutePos')) {
                        actualStackX.posTotal = actualStackX.absolutePos;
                        delete actualStackX.absolutePos;
                      }
                    }
                    if (!actualStackX.negTotal) {
                      if (ownProp(actualStackX, 'absoluteNeg')) {
                        actualStackX.negTotal = actualStackX.absoluteNeg;
                        delete actualStackX.absoluteNeg;
                      }
                    }
                  }
                  if (!point.isSum) {
                    actualStackX.connectorThreshold =
                      actualStackX.threshold + actualStackX.stackTotal;
                  }
                  if (yAxis.reversed) {
                    yPos = pointY >= 0 ? y - pointY : y + pointY;
                    hPos = y;
                  } else {
                    yPos = y;
                    hPos = y - pointY;
                  }
                  point.below = yPos <= pick(threshold, 0);
                  shapeArgs.y = yAxis.translate(yPos, 0, 1, 0, 1);
                  shapeArgs.height = Math.abs(
                    shapeArgs.y - yAxis.translate(hPos, 0, 1, 0, 1)
                  );
                }
                dummyStackItem = yAxis.waterfall.dummyStackItem;
                if (dummyStackItem) {
                  dummyStackItem.x = i;
                  dummyStackItem.label = actualStack[i].label;
                  dummyStackItem.setOffset(
                    series.pointXOffset || 0,
                    series.barW || 0,
                    series.stackedYNeg[i],
                    series.stackedYPos[i]
                  );
                }
              } else {
                y = Math.max(previousY, previousY + pointY) + range[0];
                shapeArgs.y = yAxis.translate(y, 0, 1, 0, 1);
                if (point.isSum) {
                  shapeArgs.y = yAxis.translate(range[1], 0, 1, 0, 1);
                  shapeArgs.height =
                    Math.min(yAxis.translate(range[0], 0, 1, 0, 1), yAxis.len) -
                    shapeArgs.y;
                } else if (point.isIntermediateSum) {
                  if (pointY >= 0) {
                    yPos = range[1] + previousIntermediate;
                    hPos = previousIntermediate;
                  } else {
                    yPos = previousIntermediate;
                    hPos = range[1] + previousIntermediate;
                  }
                  if (yAxis.reversed) {
                    yPos ^= hPos;
                    hPos ^= yPos;
                    yPos ^= hPos;
                  }
                  shapeArgs.y = yAxis.translate(yPos, 0, 1, 0, 1);
                  shapeArgs.height = Math.abs(
                    shapeArgs.y -
                      Math.min(yAxis.translate(hPos, 0, 1, 0, 1), yAxis.len)
                  );
                  previousIntermediate += range[1];
                } else {
                  shapeArgs.height =
                    yValue > 0
                      ? yAxis.translate(previousY, 0, 1, 0, 1) - shapeArgs.y
                      : yAxis.translate(previousY, 0, 1, 0, 1) -
                        yAxis.translate(previousY - yValue, 0, 1, 0, 1);
                  previousY += yValue;
                  point.below = previousY < pick(threshold, 0);
                }
                if (shapeArgs.height < 0) {
                  shapeArgs.y += shapeArgs.height;
                  shapeArgs.height *= -1;
                }
              }
              point.plotY = shapeArgs.y =
                Math.round(shapeArgs.y) - (series.borderWidth % 2) / 2;
              shapeArgs.height = Math.max(Math.round(shapeArgs.height), 0.001);
              point.yBottom = shapeArgs.y + shapeArgs.height;
              if (shapeArgs.height <= minPointLength && !point.isNull) {
                shapeArgs.height = minPointLength;
                shapeArgs.y -= halfMinPointLength;
                point.plotY = shapeArgs.y;
                if (point.y < 0) {
                  point.minPointLengthOffset = -halfMinPointLength;
                } else {
                  point.minPointLengthOffset = halfMinPointLength;
                }
              } else {
                if (point.isNull) {
                  shapeArgs.width = 0;
                }
                point.minPointLengthOffset = 0;
              }
              tooltipY = point.plotY + (point.negative ? shapeArgs.height : 0);
              if (series.chart.inverted) {
                point.tooltipPos[0] = yAxis.len - tooltipY;
              } else {
                point.tooltipPos[1] = tooltipY;
              }
            }
          },
          processData: function (force) {
            var series = this,
              options = series.options,
              yData = series.yData,
              points = options.data,
              point,
              dataLength = yData.length,
              threshold = options.threshold || 0,
              subSum,
              sum,
              dataMin,
              dataMax,
              y,
              i;
            sum = subSum = dataMin = dataMax = 0;
            for (i = 0; i < dataLength; i++) {
              y = yData[i];
              point = points && points[i] ? points[i] : {};
              if (y === 'sum' || point.isSum) {
                yData[i] = correctFloat(sum);
              } else if (y === 'intermediateSum' || point.isIntermediateSum) {
                yData[i] = correctFloat(subSum);
                subSum = 0;
              } else {
                sum += y;
                subSum += y;
              }
              dataMin = Math.min(sum, dataMin);
              dataMax = Math.max(sum, dataMax);
            }
            Series.prototype.processData.call(this, force);
            if (!options.stacking) {
              series.dataMin = dataMin + threshold;
              series.dataMax = dataMax;
            }
            return;
          },
          toYData: function (pt) {
            if (pt.isSum) {
              return 'sum';
            }
            if (pt.isIntermediateSum) {
              return 'intermediateSum';
            }
            return pt.y;
          },
          updateParallelArrays: function (point, i) {
            Series.prototype.updateParallelArrays.call(this, point, i);
            if (
              this.yData[0] === 'sum' ||
              this.yData[0] === 'intermediateSum'
            ) {
              this.yData[0] = null;
            }
          },
          pointAttribs: function (point, state) {
            var upColor = this.options.upColor,
              attr;
            if (upColor && !point.options.color) {
              point.color = point.y > 0 ? upColor : null;
            }
            attr = seriesTypes.column.prototype.pointAttribs.call(
              this,
              point,
              state
            );
            delete attr.dashstyle;
            return attr;
          },
          getGraphPath: function () {
            return [['M', 0, 0]];
          },
          getCrispPath: function () {
            var data = this.data,
              yAxis = this.yAxis,
              length = data.length,
              graphNormalizer = (Math.round(this.graph.strokeWidth()) % 2) / 2,
              borderNormalizer = (Math.round(this.borderWidth) % 2) / 2,
              reversedXAxis = this.xAxis.reversed,
              reversedYAxis = this.yAxis.reversed,
              stacking = this.options.stacking,
              path = [],
              connectorThreshold,
              prevStack,
              prevStackX,
              prevPoint,
              yPos,
              isPos,
              prevArgs,
              pointArgs,
              i;
            for (i = 1; i < length; i++) {
              pointArgs = data[i].shapeArgs;
              prevPoint = data[i - 1];
              prevArgs = data[i - 1].shapeArgs;
              prevStack = yAxis.waterfall.stacks[this.stackKey];
              isPos = prevPoint.y > 0 ? -prevArgs.height : 0;
              if (prevStack && prevArgs && pointArgs) {
                prevStackX = prevStack[i - 1];
                if (stacking) {
                  connectorThreshold = prevStackX.connectorThreshold;
                  yPos =
                    Math.round(
                      yAxis.translate(connectorThreshold, 0, 1, 0, 1) +
                        (reversedYAxis ? isPos : 0)
                    ) - graphNormalizer;
                } else {
                  yPos =
                    prevArgs.y +
                    prevPoint.minPointLengthOffset +
                    borderNormalizer -
                    graphNormalizer;
                }
                path.push(
                  [
                    'M',
                    (prevArgs.x || 0) +
                      (reversedXAxis ? 0 : prevArgs.width || 0),
                    yPos,
                  ],
                  [
                    'L',
                    (pointArgs.x || 0) +
                      (reversedXAxis ? pointArgs.width || 0 : 0),
                    yPos,
                  ]
                );
              }
              if (
                !stacking &&
                path.length &&
                prevArgs &&
                ((prevPoint.y < 0 && !reversedYAxis) ||
                  (prevPoint.y > 0 && reversedYAxis))
              ) {
                path[path.length - 2][2] += prevArgs.height;
                path[path.length - 1][2] += prevArgs.height;
              }
            }
            return path;
          },
          drawGraph: function () {
            Series.prototype.drawGraph.call(this);
            this.graph.attr({
              d: this.getCrispPath(),
            });
          },
          setStackedPoints: function () {
            var series = this,
              options = series.options,
              waterfallStacks = series.yAxis.waterfall.stacks,
              seriesThreshold = options.threshold,
              stackThreshold = seriesThreshold || 0,
              interSum = stackThreshold,
              stackKey = series.stackKey,
              xData = series.xData,
              xLength = xData.length,
              actualStack,
              actualStackX,
              totalYVal,
              actualSum,
              prevSum,
              statesLen,
              posTotal,
              negTotal,
              xPoint,
              yVal,
              x,
              alreadyChanged,
              changed;
            function calculateStackState(firstS, nextS, sInx, sOff) {
              if (!statesLen) {
                actualStackX.stackState[0] = firstS;
                statesLen = actualStackX.stackState.length;
              } else {
                for (sInx; sInx < statesLen; sInx++) {
                  actualStackX.stackState[sInx] += sOff;
                }
              }
              actualStackX.stackState.push(
                actualStackX.stackState[statesLen - 1] + nextS
              );
            }
            series.yAxis.stacking.usePercentage = false;
            totalYVal = actualSum = prevSum = stackThreshold;
            if (
              series.visible ||
              !series.chart.options.chart.ignoreHiddenSeries
            ) {
              changed = waterfallStacks.changed;
              alreadyChanged = waterfallStacks.alreadyChanged;
              if (alreadyChanged && alreadyChanged.indexOf(stackKey) < 0) {
                changed = true;
              }
              if (!waterfallStacks[stackKey]) {
                waterfallStacks[stackKey] = {};
              }
              actualStack = waterfallStacks[stackKey];
              for (var i = 0; i < xLength; i++) {
                x = xData[i];
                if (!actualStack[x] || changed) {
                  actualStack[x] = {
                    negTotal: 0,
                    posTotal: 0,
                    stackTotal: 0,
                    threshold: 0,
                    stateIndex: 0,
                    stackState: [],
                    label:
                      changed && actualStack[x] ? actualStack[x].label : void 0,
                  };
                }
                actualStackX = actualStack[x];
                yVal = series.yData[i];
                if (yVal >= 0) {
                  actualStackX.posTotal += yVal;
                } else {
                  actualStackX.negTotal += yVal;
                }
                xPoint = options.data[i];
                posTotal = actualStackX.absolutePos = actualStackX.posTotal;
                negTotal = actualStackX.absoluteNeg = actualStackX.negTotal;
                actualStackX.stackTotal = posTotal + negTotal;
                statesLen = actualStackX.stackState.length;
                if (xPoint && xPoint.isIntermediateSum) {
                  calculateStackState(prevSum, actualSum, 0, prevSum);
                  prevSum = actualSum;
                  actualSum = seriesThreshold;
                  stackThreshold ^= interSum;
                  interSum ^= stackThreshold;
                  stackThreshold ^= interSum;
                } else if (xPoint && xPoint.isSum) {
                  calculateStackState(seriesThreshold, totalYVal, statesLen);
                  stackThreshold = seriesThreshold;
                } else {
                  calculateStackState(stackThreshold, yVal, 0, totalYVal);
                  if (xPoint) {
                    totalYVal += yVal;
                    actualSum += yVal;
                  }
                }
                actualStackX.stateIndex++;
                actualStackX.threshold = stackThreshold;
                stackThreshold += actualStackX.stackTotal;
              }
              waterfallStacks.changed = false;
              if (!waterfallStacks.alreadyChanged) {
                waterfallStacks.alreadyChanged = [];
              }
              waterfallStacks.alreadyChanged.push(stackKey);
            }
          },
          getExtremes: function () {
            var stacking = this.options.stacking,
              yAxis,
              waterfallStacks,
              stackedYNeg,
              stackedYPos;
            if (stacking) {
              yAxis = this.yAxis;
              waterfallStacks = yAxis.waterfall.stacks;
              stackedYNeg = this.stackedYNeg = [];
              stackedYPos = this.stackedYPos = [];
              if (stacking === 'overlap') {
                objectEach(waterfallStacks[this.stackKey], function (stackX) {
                  stackedYNeg.push(arrayMin(stackX.stackState));
                  stackedYPos.push(arrayMax(stackX.stackState));
                });
              } else {
                objectEach(waterfallStacks[this.stackKey], function (stackX) {
                  stackedYNeg.push(stackX.negTotal + stackX.threshold);
                  stackedYPos.push(stackX.posTotal + stackX.threshold);
                });
              }
              return {
                dataMin: arrayMin(stackedYNeg),
                dataMax: arrayMax(stackedYPos),
              };
            }
            return {
              dataMin: this.dataMin,
              dataMax: this.dataMax,
            };
          },
        },
        {
          getClassName: function () {
            var className = Point.prototype.getClassName.call(this);
            if (this.isSum) {
              className += ' highcharts-sum';
            } else if (this.isIntermediateSum) {
              className += ' highcharts-intermediate-sum';
            }
            return className;
          },
          isValid: function () {
            return (
              isNumber(this.y) || this.isSum || Boolean(this.isIntermediateSum)
            );
          },
        }
      );
      ('');
      WaterfallAxis.compose(Axis, Chart);
      return WaterfallAxis;
    }
  );
  _registerModule(
    _modules,
    'Series/PolygonSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Core/Globals.js'],
      _modules['Mixins/LegendSymbol.js'],
    ],
    function (BaseSeries, H, LegendSymbolMixin) {
      var seriesTypes = BaseSeries.seriesTypes;
      var noop = H.noop;
      var Series = H.Series;
      BaseSeries.seriesType(
        'polygon',
        'scatter',
        {
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
          stickyTracking: false,
          tooltip: {
            followPointer: true,
            pointFormat: '',
          },
          trackByArea: true,
        },
        {
          type: 'polygon',
          getGraphPath: function () {
            var graphPath = Series.prototype.getGraphPath.call(this),
              i = graphPath.length + 1;
            while (i--) {
              if (
                (i === graphPath.length || graphPath[i][0] === 'M') &&
                i > 0
              ) {
                graphPath.splice(i, 0, ['Z']);
              }
            }
            this.areaPath = graphPath;
            return graphPath;
          },
          drawGraph: function () {
            this.options.fillColor = this.color;
            seriesTypes.area.prototype.drawGraph.call(this);
          },
          drawLegendSymbol: LegendSymbolMixin.drawRectangle,
          drawTracker: Series.prototype.drawTracker,
          setStackedPoints: noop,
        }
      );
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/Bubble/BubbleLegend.js',
    [
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Color/Color.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Legend.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Chart, Color, H, Legend, U) {
      var color = Color.parse;
      var addEvent = U.addEvent,
        arrayMax = U.arrayMax,
        arrayMin = U.arrayMin,
        isNumber = U.isNumber,
        merge = U.merge,
        objectEach = U.objectEach,
        pick = U.pick,
        setOptions = U.setOptions,
        stableSort = U.stableSort,
        wrap = U.wrap;
      ('');
      var Series = H.Series,
        noop = H.noop;
      setOptions({
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
            enabled: false,
            labels: {
              className: void 0,
              allowOverlap: false,
              format: '',
              formatter: void 0,
              align: 'right',
              style: {
                fontSize: 10,
                color: void 0,
              },
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
            sizeByAbsoluteValue: false,
            zIndex: 1,
            zThreshold: 0,
          },
        },
      });
      var BubbleLegend = (function () {
        function BubbleLegend(options, legend) {
          this.chart = void 0;
          this.fontMetrics = void 0;
          this.legend = void 0;
          this.legendGroup = void 0;
          this.legendItem = void 0;
          this.legendItemHeight = void 0;
          this.legendItemWidth = void 0;
          this.legendSymbol = void 0;
          this.maxLabel = void 0;
          this.movementX = void 0;
          this.ranges = void 0;
          this.visible = void 0;
          this.symbols = void 0;
          this.options = void 0;
          this.setState = noop;
          this.init(options, legend);
        }
        BubbleLegend.prototype.init = function (options, legend) {
          this.options = options;
          this.visible = true;
          this.chart = legend.chart;
          this.legend = legend;
        };
        BubbleLegend.prototype.addToLegend = function (items) {
          items.splice(this.options.legendIndex, 0, this);
        };
        BubbleLegend.prototype.drawLegendSymbol = function (legend) {
          var chart = this.chart,
            options = this.options,
            size,
            itemDistance = pick(legend.options.itemDistance, 20),
            connectorSpace,
            ranges = options.ranges,
            radius,
            maxLabel,
            connectorDistance = options.connectorDistance;
          this.fontMetrics = chart.renderer.fontMetrics(
            options.labels.style.fontSize.toString() + 'px'
          );
          if (!ranges || !ranges.length || !isNumber(ranges[0].value)) {
            legend.options.bubbleLegend.autoRanges = true;
            return;
          }
          stableSort(ranges, function (a, b) {
            return b.value - a.value;
          });
          this.ranges = ranges;
          this.setOptions();
          this.render();
          maxLabel = this.getMaxLabelSize();
          radius = this.ranges[0].radius;
          size = radius * 2;
          connectorSpace = connectorDistance - radius + maxLabel.width;
          connectorSpace = connectorSpace > 0 ? connectorSpace : 0;
          this.maxLabel = maxLabel;
          this.movementX = options.labels.align === 'left' ? connectorSpace : 0;
          this.legendItemWidth = size + connectorSpace + itemDistance;
          this.legendItemHeight = size + this.fontMetrics.h / 2;
        };
        BubbleLegend.prototype.setOptions = function () {
          var ranges = this.ranges,
            options = this.options,
            series = this.chart.series[options.seriesIndex],
            baseline = this.legend.baseline,
            bubbleStyle = {
              'z-index': options.zIndex,
              'stroke-width': options.borderWidth,
            },
            connectorStyle = {
              'z-index': options.zIndex,
              'stroke-width': options.connectorWidth,
            },
            labelStyle = this.getLabelStyles(),
            fillOpacity = series.options.marker.fillOpacity,
            styledMode = this.chart.styledMode;
          ranges.forEach(function (range, i) {
            if (!styledMode) {
              bubbleStyle.stroke = pick(
                range.borderColor,
                options.borderColor,
                series.color
              );
              bubbleStyle.fill = pick(
                range.color,
                options.color,
                fillOpacity !== 1
                  ? color(series.color).setOpacity(fillOpacity).get('rgba')
                  : series.color
              );
              connectorStyle.stroke = pick(
                range.connectorColor,
                options.connectorColor,
                series.color
              );
            }
            ranges[i].radius = this.getRangeRadius(range.value);
            ranges[i] = merge(ranges[i], {
              center: ranges[0].radius - ranges[i].radius + baseline,
            });
            if (!styledMode) {
              merge(true, ranges[i], {
                bubbleStyle: merge(false, bubbleStyle),
                connectorStyle: merge(false, connectorStyle),
                labelStyle: labelStyle,
              });
            }
          }, this);
        };
        BubbleLegend.prototype.getLabelStyles = function () {
          var options = this.options,
            additionalLabelsStyle = {},
            labelsOnLeft = options.labels.align === 'left',
            rtl = this.legend.options.rtl;
          objectEach(options.labels.style, function (value, key) {
            if (key !== 'color' && key !== 'fontSize' && key !== 'z-index') {
              additionalLabelsStyle[key] = value;
            }
          });
          return merge(false, additionalLabelsStyle, {
            'font-size': options.labels.style.fontSize,
            fill: pick(options.labels.style.color, '#000000'),
            'z-index': options.zIndex,
            align: rtl || labelsOnLeft ? 'right' : 'left',
          });
        };
        BubbleLegend.prototype.getRangeRadius = function (value) {
          var options = this.options,
            seriesIndex = this.options.seriesIndex,
            bubbleSeries = this.chart.series[seriesIndex],
            zMax = options.ranges[0].value,
            zMin = options.ranges[options.ranges.length - 1].value,
            minSize = options.minSize,
            maxSize = options.maxSize;
          return bubbleSeries.getRadius.call(
            this,
            zMin,
            zMax,
            minSize,
            maxSize,
            value
          );
        };
        BubbleLegend.prototype.render = function () {
          var renderer = this.chart.renderer,
            zThreshold = this.options.zThreshold;
          if (!this.symbols) {
            this.symbols = {
              connectors: [],
              bubbleItems: [],
              labels: [],
            };
          }
          this.legendSymbol = renderer.g('bubble-legend');
          this.legendItem = renderer.g('bubble-legend-item');
          this.legendSymbol.translateX = 0;
          this.legendSymbol.translateY = 0;
          this.ranges.forEach(function (range) {
            if (range.value >= zThreshold) {
              this.renderRange(range);
            }
          }, this);
          this.legendSymbol.add(this.legendItem);
          this.legendItem.add(this.legendGroup);
          this.hideOverlappingLabels();
        };
        BubbleLegend.prototype.renderRange = function (range) {
          var mainRange = this.ranges[0],
            legend = this.legend,
            options = this.options,
            labelsOptions = options.labels,
            chart = this.chart,
            renderer = chart.renderer,
            symbols = this.symbols,
            labels = symbols.labels,
            label,
            elementCenter = range.center,
            absoluteRadius = Math.abs(range.radius),
            connectorDistance = options.connectorDistance || 0,
            labelsAlign = labelsOptions.align,
            rtl = legend.options.rtl,
            fontSize = labelsOptions.style.fontSize,
            connectorLength =
              rtl || labelsAlign === 'left'
                ? -connectorDistance
                : connectorDistance,
            borderWidth = options.borderWidth,
            connectorWidth = options.connectorWidth,
            posX = mainRange.radius || 0,
            posY =
              elementCenter -
              absoluteRadius -
              borderWidth / 2 +
              connectorWidth / 2,
            labelY,
            labelX,
            fontMetrics = this.fontMetrics,
            labelMovement = fontSize / 2 - (fontMetrics.h - fontSize) / 2,
            crispMovement =
              (posY % 1 ? 1 : 0.5) - (connectorWidth % 2 ? 0 : 0.5),
            styledMode = renderer.styledMode;
          if (labelsAlign === 'center') {
            connectorLength = 0;
            options.connectorDistance = 0;
            range.labelStyle.align = 'center';
          }
          labelY = posY + options.labels.y;
          labelX = posX + connectorLength + options.labels.x;
          symbols.bubbleItems.push(
            renderer
              .circle(posX, elementCenter + crispMovement, absoluteRadius)
              .attr(styledMode ? {} : range.bubbleStyle)
              .addClass(
                (styledMode
                  ? 'highcharts-color-' + this.options.seriesIndex + ' '
                  : '') +
                  'highcharts-bubble-legend-symbol ' +
                  (options.className || '')
              )
              .add(this.legendSymbol)
          );
          symbols.connectors.push(
            renderer
              .path(
                renderer.crispLine(
                  [
                    ['M', posX, posY],
                    ['L', posX + connectorLength, posY],
                  ],
                  options.connectorWidth
                )
              )
              .attr(styledMode ? {} : range.connectorStyle)
              .addClass(
                (styledMode
                  ? 'highcharts-color-' + this.options.seriesIndex + ' '
                  : '') +
                  'highcharts-bubble-legend-connectors ' +
                  (options.connectorClassName || '')
              )
              .add(this.legendSymbol)
          );
          label = renderer
            .text(this.formatLabel(range), labelX, labelY + labelMovement)
            .attr(styledMode ? {} : range.labelStyle)
            .addClass(
              'highcharts-bubble-legend-labels ' +
                (options.labels.className || '')
            )
            .add(this.legendSymbol);
          labels.push(label);
          label.placed = true;
          label.alignAttr = {
            x: labelX,
            y: labelY + labelMovement,
          };
        };
        BubbleLegend.prototype.getMaxLabelSize = function () {
          var labels = this.symbols.labels,
            maxLabel,
            labelSize;
          labels.forEach(function (label) {
            labelSize = label.getBBox(true);
            if (maxLabel) {
              maxLabel =
                labelSize.width > maxLabel.width ? labelSize : maxLabel;
            } else {
              maxLabel = labelSize;
            }
          });
          return maxLabel || {};
        };
        BubbleLegend.prototype.formatLabel = function (range) {
          var options = this.options,
            formatter = options.labels.formatter,
            format = options.labels.format;
          var numberFormatter = this.chart.numberFormatter;
          return format
            ? U.format(format, range)
            : formatter
            ? formatter.call(range)
            : numberFormatter(range.value, 1);
        };
        BubbleLegend.prototype.hideOverlappingLabels = function () {
          var chart = this.chart,
            allowOverlap = this.options.labels.allowOverlap,
            symbols = this.symbols;
          if (!allowOverlap && symbols) {
            chart.hideOverlappingLabels(symbols.labels);
            symbols.labels.forEach(function (label, index) {
              if (!label.newOpacity) {
                symbols.connectors[index].hide();
              } else if (label.newOpacity !== label.oldOpacity) {
                symbols.connectors[index].show();
              }
            });
          }
        };
        BubbleLegend.prototype.getRanges = function () {
          var bubbleLegend = this.legend.bubbleLegend,
            series = bubbleLegend.chart.series,
            ranges,
            rangesOptions = bubbleLegend.options.ranges,
            zData,
            minZ = Number.MAX_VALUE,
            maxZ = -Number.MAX_VALUE;
          series.forEach(function (s) {
            if (s.isBubble && !s.ignoreSeries) {
              zData = s.zData.filter(isNumber);
              if (zData.length) {
                minZ = pick(
                  s.options.zMin,
                  Math.min(
                    minZ,
                    Math.max(
                      arrayMin(zData),
                      s.options.displayNegative === false
                        ? s.options.zThreshold
                        : -Number.MAX_VALUE
                    )
                  )
                );
                maxZ = pick(s.options.zMax, Math.max(maxZ, arrayMax(zData)));
              }
            }
          });
          if (minZ === maxZ) {
            ranges = [{ value: maxZ }];
          } else {
            ranges = [
              { value: minZ },
              { value: (minZ + maxZ) / 2 },
              { value: maxZ, autoRanges: true },
            ];
          }
          if (rangesOptions.length && rangesOptions[0].radius) {
            ranges.reverse();
          }
          ranges.forEach(function (range, i) {
            if (rangesOptions && rangesOptions[i]) {
              ranges[i] = merge(false, rangesOptions[i], range);
            }
          });
          return ranges;
        };
        BubbleLegend.prototype.predictBubbleSizes = function () {
          var chart = this.chart,
            fontMetrics = this.fontMetrics,
            legendOptions = chart.legend.options,
            floating = legendOptions.floating,
            horizontal = legendOptions.layout === 'horizontal',
            lastLineHeight = horizontal ? chart.legend.lastLineHeight : 0,
            plotSizeX = chart.plotSizeX,
            plotSizeY = chart.plotSizeY,
            bubbleSeries = chart.series[this.options.seriesIndex],
            minSize = Math.ceil(bubbleSeries.minPxSize),
            maxPxSize = Math.ceil(bubbleSeries.maxPxSize),
            maxSize = bubbleSeries.options.maxSize,
            plotSize = Math.min(plotSizeY, plotSizeX),
            calculatedSize;
          if (floating || !/%$/.test(maxSize)) {
            calculatedSize = maxPxSize;
          } else {
            maxSize = parseFloat(maxSize);
            calculatedSize =
              ((plotSize + lastLineHeight - fontMetrics.h / 2) * maxSize) /
              100 /
              (maxSize / 100 + 1);
            if (
              (horizontal && plotSizeY - calculatedSize >= plotSizeX) ||
              (!horizontal && plotSizeX - calculatedSize >= plotSizeY)
            ) {
              calculatedSize = maxPxSize;
            }
          }
          return [minSize, Math.ceil(calculatedSize)];
        };
        BubbleLegend.prototype.updateRanges = function (min, max) {
          var bubbleLegendOptions = this.legend.options.bubbleLegend;
          bubbleLegendOptions.minSize = min;
          bubbleLegendOptions.maxSize = max;
          bubbleLegendOptions.ranges = this.getRanges();
        };
        BubbleLegend.prototype.correctSizes = function () {
          var legend = this.legend,
            chart = this.chart,
            bubbleSeries = chart.series[this.options.seriesIndex],
            bubbleSeriesSize = bubbleSeries.maxPxSize,
            bubbleLegendSize = this.options.maxSize;
          if (Math.abs(Math.ceil(bubbleSeriesSize) - bubbleLegendSize) > 1) {
            this.updateRanges(this.options.minSize, bubbleSeries.maxPxSize);
            legend.render();
          }
        };
        return BubbleLegend;
      })();
      addEvent(Legend, 'afterGetAllItems', function (e) {
        var legend = this,
          bubbleLegend = legend.bubbleLegend,
          legendOptions = legend.options,
          options = legendOptions.bubbleLegend,
          bubbleSeriesIndex = legend.chart.getVisibleBubbleSeriesIndex();
        if (bubbleLegend && bubbleLegend.ranges && bubbleLegend.ranges.length) {
          if (options.ranges.length) {
            options.autoRanges = !!options.ranges[0].autoRanges;
          }
          legend.destroyItem(bubbleLegend);
        }
        if (
          bubbleSeriesIndex >= 0 &&
          legendOptions.enabled &&
          options.enabled
        ) {
          options.seriesIndex = bubbleSeriesIndex;
          legend.bubbleLegend = new H.BubbleLegend(options, legend);
          legend.bubbleLegend.addToLegend(e.allItems);
        }
      });
      Chart.prototype.getVisibleBubbleSeriesIndex = function () {
        var series = this.series,
          i = 0;
        while (i < series.length) {
          if (
            series[i] &&
            series[i].isBubble &&
            series[i].visible &&
            series[i].zData.length
          ) {
            return i;
          }
          i++;
        }
        return -1;
      };
      Legend.prototype.getLinesHeights = function () {
        var items = this.allItems,
          lines = [],
          lastLine,
          length = items.length,
          i = 0,
          j = 0;
        for (i = 0; i < length; i++) {
          if (items[i].legendItemHeight) {
            items[i].itemHeight = items[i].legendItemHeight;
          }
          if (
            items[i] === items[length - 1] ||
            (items[i + 1] &&
              items[i]._legendItemPos[1] !== items[i + 1]._legendItemPos[1])
          ) {
            lines.push({ height: 0 });
            lastLine = lines[lines.length - 1];
            for (j; j <= i; j++) {
              if (items[j].itemHeight > lastLine.height) {
                lastLine.height = items[j].itemHeight;
              }
            }
            lastLine.step = i;
          }
        }
        return lines;
      };
      Legend.prototype.retranslateItems = function (lines) {
        var items = this.allItems,
          orgTranslateX,
          orgTranslateY,
          movementX,
          rtl = this.options.rtl,
          actualLine = 0;
        items.forEach(function (item, index) {
          orgTranslateX = item.legendGroup.translateX;
          orgTranslateY = item._legendItemPos[1];
          movementX = item.movementX;
          if (movementX || (rtl && item.ranges)) {
            movementX = rtl
              ? orgTranslateX - item.options.maxSize / 2
              : orgTranslateX + movementX;
            item.legendGroup.attr({ translateX: movementX });
          }
          if (index > lines[actualLine].step) {
            actualLine++;
          }
          item.legendGroup.attr({
            translateY: Math.round(
              orgTranslateY + lines[actualLine].height / 2
            ),
          });
          item._legendItemPos[1] = orgTranslateY + lines[actualLine].height / 2;
        });
      };
      addEvent(Series, 'legendItemClick', function () {
        var series = this,
          chart = series.chart,
          visible = series.visible,
          legend = series.chart.legend,
          status;
        if (legend && legend.bubbleLegend) {
          series.visible = !visible;
          series.ignoreSeries = visible;
          status = chart.getVisibleBubbleSeriesIndex() >= 0;
          if (legend.bubbleLegend.visible !== status) {
            legend.update({
              bubbleLegend: { enabled: status },
            });
            legend.bubbleLegend.visible = status;
          }
          series.visible = visible;
        }
      });
      wrap(
        Chart.prototype,
        'drawChartBox',
        function (proceed, options, callback) {
          var chart = this,
            legend = chart.legend,
            bubbleSeries = chart.getVisibleBubbleSeriesIndex() >= 0,
            bubbleLegendOptions,
            bubbleSizes;
          if (
            legend &&
            legend.options.enabled &&
            legend.bubbleLegend &&
            legend.options.bubbleLegend.autoRanges &&
            bubbleSeries
          ) {
            bubbleLegendOptions = legend.bubbleLegend.options;
            bubbleSizes = legend.bubbleLegend.predictBubbleSizes();
            legend.bubbleLegend.updateRanges(bubbleSizes[0], bubbleSizes[1]);
            if (!bubbleLegendOptions.placed) {
              legend.group.placed = false;
              legend.allItems.forEach(function (item) {
                item.legendGroup.translateY = null;
              });
            }
            legend.render();
            chart.getMargins();
            chart.axes.forEach(function (axis) {
              if (axis.visible) {
                axis.render();
              }
              if (!bubbleLegendOptions.placed) {
                axis.setScale();
                axis.updateNames();
                objectEach(axis.ticks, function (tick) {
                  tick.isNew = true;
                  tick.isNewLabel = true;
                });
              }
            });
            bubbleLegendOptions.placed = true;
            chart.getMargins();
            proceed.call(chart, options, callback);
            legend.bubbleLegend.correctSizes();
            legend.retranslateItems(legend.getLinesHeights());
          } else {
            proceed.call(chart, options, callback);
            if (legend && legend.options.enabled && legend.bubbleLegend) {
              legend.render();
              legend.retranslateItems(legend.getLinesHeights());
            }
          }
        }
      );
      H.BubbleLegend = BubbleLegend;
      return H.BubbleLegend;
    }
  );
  _registerModule(
    _modules,
    'Series/Bubble/BubbleSeries.js',
    [
      _modules['Core/Axis/Axis.js'],
      _modules['Core/Series/Series.js'],
      _modules['Core/Color/Color.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Series/Point.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Axis, BaseSeries, Color, H, Point, U) {
      var color = Color.parse;
      var noop = H.noop;
      var arrayMax = U.arrayMax,
        arrayMin = U.arrayMin,
        clamp = U.clamp,
        extend = U.extend,
        isNumber = U.isNumber,
        pick = U.pick,
        pInt = U.pInt;
      var Series = H.Series,
        seriesTypes = BaseSeries.seriesTypes;
      ('');
      BaseSeries.seriesType(
        'bubble',
        'scatter',
        {
          dataLabels: {
            formatter: function () {
              return this.point.z;
            },
            inside: true,
            verticalAlign: 'middle',
          },
          animationLimit: 250,
          marker: {
            lineColor: null,
            lineWidth: 1,
            fillOpacity: 0.5,
            radius: null,
            states: {
              hover: {
                radiusPlus: 0,
              },
            },
            symbol: 'circle',
          },
          minSize: 8,
          maxSize: '20%',
          softThreshold: false,
          states: {
            hover: {
              halo: {
                size: 5,
              },
            },
          },
          tooltip: {
            pointFormat: '({point.x}, {point.y}), Size: {point.z}',
          },
          turboThreshold: 0,
          zThreshold: 0,
          zoneAxis: 'z',
        },
        {
          pointArrayMap: ['y', 'z'],
          parallelArrays: ['x', 'y', 'z'],
          trackerGroups: ['group', 'dataLabelsGroup'],
          specialGroup: 'group',
          bubblePadding: true,
          zoneAxis: 'z',
          directTouch: true,
          isBubble: true,
          pointAttribs: function (point, state) {
            var markerOptions = this.options.marker,
              fillOpacity = markerOptions.fillOpacity,
              attr = Series.prototype.pointAttribs.call(this, point, state);
            if (fillOpacity !== 1) {
              attr.fill = color(attr.fill).setOpacity(fillOpacity).get('rgba');
            }
            return attr;
          },
          getRadii: function (zMin, zMax, series) {
            var len,
              i,
              zData = this.zData,
              yData = this.yData,
              minSize = series.minPxSize,
              maxSize = series.maxPxSize,
              radii = [],
              value;
            for (i = 0, len = zData.length; i < len; i++) {
              value = zData[i];
              radii.push(
                this.getRadius(zMin, zMax, minSize, maxSize, value, yData[i])
              );
            }
            this.radii = radii;
          },
          getRadius: function (zMin, zMax, minSize, maxSize, value, yValue) {
            var options = this.options,
              sizeByArea = options.sizeBy !== 'width',
              zThreshold = options.zThreshold,
              zRange = zMax - zMin,
              pos = 0.5;
            if (yValue === null || value === null) {
              return null;
            }
            if (isNumber(value)) {
              if (options.sizeByAbsoluteValue) {
                value = Math.abs(value - zThreshold);
                zMax = zRange = Math.max(
                  zMax - zThreshold,
                  Math.abs(zMin - zThreshold)
                );
                zMin = 0;
              }
              if (value < zMin) {
                return minSize / 2 - 1;
              }
              if (zRange > 0) {
                pos = (value - zMin) / zRange;
              }
            }
            if (sizeByArea && pos >= 0) {
              pos = Math.sqrt(pos);
            }
            return Math.ceil(minSize + pos * (maxSize - minSize)) / 2;
          },
          animate: function (init) {
            if (!init && this.points.length < this.options.animationLimit) {
              this.points.forEach(function (point) {
                var graphic = point.graphic;
                if (graphic && graphic.width) {
                  if (!this.hasRendered) {
                    graphic.attr({
                      x: point.plotX,
                      y: point.plotY,
                      width: 1,
                      height: 1,
                    });
                  }
                  graphic.animate(
                    this.markerAttribs(point),
                    this.options.animation
                  );
                }
              }, this);
            }
          },
          hasData: function () {
            return !!this.processedXData.length;
          },
          translate: function () {
            var i,
              data = this.data,
              point,
              radius,
              radii = this.radii;
            seriesTypes.scatter.prototype.translate.call(this);
            i = data.length;
            while (i--) {
              point = data[i];
              radius = radii ? radii[i] : 0;
              if (isNumber(radius) && radius >= this.minPxSize / 2) {
                point.marker = extend(point.marker, {
                  radius: radius,
                  width: 2 * radius,
                  height: 2 * radius,
                });
                point.dlBox = {
                  x: point.plotX - radius,
                  y: point.plotY - radius,
                  width: 2 * radius,
                  height: 2 * radius,
                };
              } else {
                point.shapeArgs = point.plotY = point.dlBox = void 0;
              }
            }
          },
          alignDataLabel: seriesTypes.column.prototype.alignDataLabel,
          buildKDTree: noop,
          applyZones: noop,
        },
        {
          haloPath: function (size) {
            return Point.prototype.haloPath.call(
              this,
              size === 0
                ? 0
                : (this.marker ? this.marker.radius || 0 : 0) + size
            );
          },
          ttBelow: false,
        }
      );
      Axis.prototype.beforePadding = function () {
        var axis = this,
          axisLength = this.len,
          chart = this.chart,
          pxMin = 0,
          pxMax = axisLength,
          isXAxis = this.isXAxis,
          dataKey = isXAxis ? 'xData' : 'yData',
          min = this.min,
          extremes = {},
          smallestSize = Math.min(chart.plotWidth, chart.plotHeight),
          zMin = Number.MAX_VALUE,
          zMax = -Number.MAX_VALUE,
          range = this.max - min,
          transA = axisLength / range,
          activeSeries = [];
        this.series.forEach(function (series) {
          var seriesOptions = series.options,
            zData;
          if (
            series.bubblePadding &&
            (series.visible || !chart.options.chart.ignoreHiddenSeries)
          ) {
            axis.allowZoomOutside = true;
            activeSeries.push(series);
            if (isXAxis) {
              ['minSize', 'maxSize'].forEach(function (prop) {
                var length = seriesOptions[prop],
                  isPercent = /%$/.test(length);
                length = pInt(length);
                extremes[prop] = isPercent
                  ? (smallestSize * length) / 100
                  : length;
              });
              series.minPxSize = extremes.minSize;
              series.maxPxSize = Math.max(extremes.maxSize, extremes.minSize);
              zData = series.zData.filter(isNumber);
              if (zData.length) {
                zMin = pick(
                  seriesOptions.zMin,
                  clamp(
                    arrayMin(zData),
                    seriesOptions.displayNegative === false
                      ? seriesOptions.zThreshold
                      : -Number.MAX_VALUE,
                    zMin
                  )
                );
                zMax = pick(
                  seriesOptions.zMax,
                  Math.max(zMax, arrayMax(zData))
                );
              }
            }
          }
        });
        activeSeries.forEach(function (series) {
          var data = series[dataKey],
            i = data.length,
            radius;
          if (isXAxis) {
            series.getRadii(zMin, zMax, series);
          }
          if (range > 0) {
            while (i--) {
              if (
                isNumber(data[i]) &&
                axis.dataMin <= data[i] &&
                data[i] <= axis.max
              ) {
                radius = series.radii ? series.radii[i] : 0;
                pxMin = Math.min((data[i] - min) * transA - radius, pxMin);
                pxMax = Math.max((data[i] - min) * transA + radius, pxMax);
              }
            }
          }
        });
        if (activeSeries.length && range > 0 && !this.logarithmic) {
          pxMax -= axisLength;
          transA *=
            (axisLength + Math.max(0, pxMin) - Math.min(pxMax, axisLength)) /
            axisLength;
          [
            ['min', 'userMin', pxMin],
            ['max', 'userMax', pxMax],
          ].forEach(function (keys) {
            if (
              typeof pick(axis.options[keys[0]], axis[keys[1]]) === 'undefined'
            ) {
              axis[keys[0]] += keys[2] / transA;
            }
          });
        }
      };
      ('');
    }
  );
  _registerModule(
    _modules,
    'Series/Networkgraph/DraggableNodes.js',
    [
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Chart, H, U) {
      var addEvent = U.addEvent;
      H.dragNodesMixin = {
        onMouseDown: function (point, event) {
          var normalizedEvent = this.chart.pointer.normalize(event);
          point.fixedPosition = {
            chartX: normalizedEvent.chartX,
            chartY: normalizedEvent.chartY,
            plotX: point.plotX,
            plotY: point.plotY,
          };
          point.inDragMode = true;
        },
        onMouseMove: function (point, event) {
          if (point.fixedPosition && point.inDragMode) {
            var series = this,
              chart = series.chart,
              normalizedEvent = chart.pointer.normalize(event),
              diffX = point.fixedPosition.chartX - normalizedEvent.chartX,
              diffY = point.fixedPosition.chartY - normalizedEvent.chartY,
              newPlotX,
              newPlotY,
              graphLayoutsLookup = chart.graphLayoutsLookup;
            if (Math.abs(diffX) > 5 || Math.abs(diffY) > 5) {
              newPlotX = point.fixedPosition.plotX - diffX;
              newPlotY = point.fixedPosition.plotY - diffY;
              if (chart.isInsidePlot(newPlotX, newPlotY)) {
                point.plotX = newPlotX;
                point.plotY = newPlotY;
                point.hasDragged = true;
                this.redrawHalo(point);
                graphLayoutsLookup.forEach(function (layout) {
                  layout.restartSimulation();
                });
              }
            }
          }
        },
        onMouseUp: function (point, event) {
          if (point.fixedPosition) {
            if (point.hasDragged) {
              if (this.layout.enableSimulation) {
                this.layout.start();
              } else {
                this.chart.redraw();
              }
            }
            point.inDragMode = point.hasDragged = false;
            if (!this.options.fixedDraggable) {
              delete point.fixedPosition;
            }
          }
        },
        redrawHalo: function (point) {
          if (point && this.halo) {
            this.halo.attr({
              d: point.haloPath(this.options.states.hover.halo.size),
            });
          }
        },
      };
      addEvent(Chart, 'load', function () {
        var chart = this,
          mousedownUnbinder,
          mousemoveUnbinder,
          mouseupUnbinder;
        if (chart.container) {
          mousedownUnbinder = addEvent(
            chart.container,
            'mousedown',
            function (event) {
              var point = chart.hoverPoint;
              if (
                point &&
                point.series &&
                point.series.hasDraggableNodes &&
                point.series.options.draggable
              ) {
                point.series.onMouseDown(point, event);
                mousemoveUnbinder = addEvent(
                  chart.container,
                  'mousemove',
                  function (e) {
                    return (
                      point &&
                      point.series &&
                      point.series.onMouseMove(point, e)
                    );
                  }
                );
                mouseupUnbinder = addEvent(
                  chart.container.ownerDocument,
                  'mouseup',
                  function (e) {
                    mousemoveUnbinder();
                    mouseupUnbinder();
                    return (
                      point && point.series && point.series.onMouseUp(point, e)
                    );
                  }
                );
              }
            }
          );
        }
        addEvent(chart, 'destroy', function () {
          mousedownUnbinder();
        });
      });
    }
  );
  _registerModule(
    _modules,
    'Series/Networkgraph/Integrations.js',
    [_modules['Core/Globals.js']],
    function (H) {
      H.networkgraphIntegrations = {
        verlet: {
          attractiveForceFunction: function (d, k) {
            return (k - d) / d;
          },
          repulsiveForceFunction: function (d, k) {
            return ((k - d) / d) * (k > d ? 1 : 0);
          },
          barycenter: function () {
            var gravitationalConstant = this.options.gravitationalConstant,
              xFactor = this.barycenter.xFactor,
              yFactor = this.barycenter.yFactor;
            xFactor =
              (xFactor - (this.box.left + this.box.width) / 2) *
              gravitationalConstant;
            yFactor =
              (yFactor - (this.box.top + this.box.height) / 2) *
              gravitationalConstant;
            this.nodes.forEach(function (node) {
              if (!node.fixedPosition) {
                node.plotX -= xFactor / node.mass / node.degree;
                node.plotY -= yFactor / node.mass / node.degree;
              }
            });
          },
          repulsive: function (node, force, distanceXY) {
            var factor =
              (force * this.diffTemperature) / node.mass / node.degree;
            if (!node.fixedPosition) {
              node.plotX += distanceXY.x * factor;
              node.plotY += distanceXY.y * factor;
            }
          },
          attractive: function (link, force, distanceXY) {
            var massFactor = link.getMass(),
              translatedX = -distanceXY.x * force * this.diffTemperature,
              translatedY = -distanceXY.y * force * this.diffTemperature;
            if (!link.fromNode.fixedPosition) {
              link.fromNode.plotX -=
                (translatedX * massFactor.fromNode) / link.fromNode.degree;
              link.fromNode.plotY -=
                (translatedY * massFactor.fromNode) / link.fromNode.degree;
            }
            if (!link.toNode.fixedPosition) {
              link.toNode.plotX +=
                (translatedX * massFactor.toNode) / link.toNode.degree;
              link.toNode.plotY +=
                (translatedY * massFactor.toNode) / link.toNode.degree;
            }
          },
          integrate: function (layout, node) {
            var friction = -layout.options.friction,
              maxSpeed = layout.options.maxSpeed,
              prevX = node.prevX,
              prevY = node.prevY,
              diffX = (node.plotX + node.dispX - prevX) * friction,
              diffY = (node.plotY + node.dispY - prevY) * friction,
              abs = Math.abs,
              signX = abs(diffX) / (diffX || 1),
              signY = abs(diffY) / (diffY || 1);
            diffX = signX * Math.min(maxSpeed, Math.abs(diffX));
            diffY = signY * Math.min(maxSpeed, Math.abs(diffY));
            node.prevX = node.plotX + node.dispX;
            node.prevY = node.plotY + node.dispY;
            node.plotX += diffX;
            node.plotY += diffY;
            node.temperature = layout.vectorLength({
              x: diffX,
              y: diffY,
            });
          },
          getK: function (layout) {
            return Math.pow(
              (layout.box.width * layout.box.height) / layout.nodes.length,
              0.5
            );
          },
        },
        euler: {
          attractiveForceFunction: function (d, k) {
            return (d * d) / k;
          },
          repulsiveForceFunction: function (d, k) {
            return (k * k) / d;
          },
          barycenter: function () {
            var gravitationalConstant = this.options.gravitationalConstant,
              xFactor = this.barycenter.xFactor,
              yFactor = this.barycenter.yFactor;
            this.nodes.forEach(function (node) {
              if (!node.fixedPosition) {
                var degree = node.getDegree(),
                  phi = degree * (1 + degree / 2);
                node.dispX +=
                  ((xFactor - node.plotX) * gravitationalConstant * phi) /
                  node.degree;
                node.dispY +=
                  ((yFactor - node.plotY) * gravitationalConstant * phi) /
                  node.degree;
              }
            });
          },
          repulsive: function (node, force, distanceXY, distanceR) {
            node.dispX += ((distanceXY.x / distanceR) * force) / node.degree;
            node.dispY += ((distanceXY.y / distanceR) * force) / node.degree;
          },
          attractive: function (link, force, distanceXY, distanceR) {
            var massFactor = link.getMass(),
              translatedX = (distanceXY.x / distanceR) * force,
              translatedY = (distanceXY.y / distanceR) * force;
            if (!link.fromNode.fixedPosition) {
              link.fromNode.dispX -=
                (translatedX * massFactor.fromNode) / link.fromNode.degree;
              link.fromNode.dispY -=
                (translatedY * massFactor.fromNode) / link.fromNode.degree;
            }
            if (!link.toNode.fixedPosition) {
              link.toNode.dispX +=
                (translatedX * massFactor.toNode) / link.toNode.degree;
              link.toNode.dispY +=
                (translatedY * massFactor.toNode) / link.toNode.degree;
            }
          },
          integrate: function (layout, node) {
            var distanceR;
            node.dispX += node.dispX * layout.options.friction;
            node.dispY += node.dispY * layout.options.friction;
            distanceR = node.temperature = layout.vectorLength({
              x: node.dispX,
              y: node.dispY,
            });
            if (distanceR !== 0) {
              node.plotX +=
                (node.dispX / distanceR) *
                Math.min(Math.abs(node.dispX), layout.temperature);
              node.plotY +=
                (node.dispY / distanceR) *
                Math.min(Math.abs(node.dispY), layout.temperature);
            }
          },
          getK: function (layout) {
            return Math.pow(
              (layout.box.width * layout.box.height) / layout.nodes.length,
              0.3
            );
          },
        },
      };
    }
  );
  _registerModule(
    _modules,
    'Series/Networkgraph/QuadTree.js',
    [_modules['Core/Globals.js'], _modules['Core/Utilities.js']],
    function (H, U) {
      var extend = U.extend;
      var QuadTreeNode = (H.QuadTreeNode = function (box) {
        this.box = box;
        this.boxSize = Math.min(box.width, box.height);
        this.nodes = [];
        this.isInternal = false;
        this.body = false;
        this.isEmpty = true;
      });
      extend(QuadTreeNode.prototype, {
        insert: function (point, depth) {
          var newQuadTreeNode;
          if (this.isInternal) {
            this.nodes[this.getBoxPosition(point)].insert(point, depth - 1);
          } else {
            this.isEmpty = false;
            if (!this.body) {
              this.isInternal = false;
              this.body = point;
            } else {
              if (depth) {
                this.isInternal = true;
                this.divideBox();
                if (this.body !== true) {
                  this.nodes[this.getBoxPosition(this.body)].insert(
                    this.body,
                    depth - 1
                  );
                  this.body = true;
                }
                this.nodes[this.getBoxPosition(point)].insert(point, depth - 1);
              } else {
                newQuadTreeNode = new QuadTreeNode({
                  top: point.plotX,
                  left: point.plotY,
                  width: 0.1,
                  height: 0.1,
                });
                newQuadTreeNode.body = point;
                newQuadTreeNode.isInternal = false;
                this.nodes.push(newQuadTreeNode);
              }
            }
          }
        },
        updateMassAndCenter: function () {
          var mass = 0,
            plotX = 0,
            plotY = 0;
          if (this.isInternal) {
            this.nodes.forEach(function (pointMass) {
              if (!pointMass.isEmpty) {
                mass += pointMass.mass;
                plotX += pointMass.plotX * pointMass.mass;
                plotY += pointMass.plotY * pointMass.mass;
              }
            });
            plotX /= mass;
            plotY /= mass;
          } else if (this.body) {
            mass = this.body.mass;
            plotX = this.body.plotX;
            plotY = this.body.plotY;
          }
          this.mass = mass;
          this.plotX = plotX;
          this.plotY = plotY;
        },
        divideBox: function () {
          var halfWidth = this.box.width / 2,
            halfHeight = this.box.height / 2;
          this.nodes[0] = new QuadTreeNode({
            left: this.box.left,
            top: this.box.top,
            width: halfWidth,
            height: halfHeight,
          });
          this.nodes[1] = new QuadTreeNode({
            left: this.box.left + halfWidth,
            top: this.box.top,
            width: halfWidth,
            height: halfHeight,
          });
          this.nodes[2] = new QuadTreeNode({
            left: this.box.left + halfWidth,
            top: this.box.top + halfHeight,
            width: halfWidth,
            height: halfHeight,
          });
          this.nodes[3] = new QuadTreeNode({
            left: this.box.left,
            top: this.box.top + halfHeight,
            width: halfWidth,
            height: halfHeight,
          });
        },
        getBoxPosition: function (point) {
          var left = point.plotX < this.box.left + this.box.width / 2,
            top = point.plotY < this.box.top + this.box.height / 2,
            index;
          if (left) {
            if (top) {
              index = 0;
            } else {
              index = 3;
            }
          } else {
            if (top) {
              index = 1;
            } else {
              index = 2;
            }
          }
          return index;
        },
      });
      var QuadTree = (H.QuadTree = function (x, y, width, height) {
        this.box = {
          left: x,
          top: y,
          width: width,
          height: height,
        };
        this.maxDepth = 25;
        this.root = new QuadTreeNode(this.box, '0');
        this.root.isInternal = true;
        this.root.isRoot = true;
        this.root.divideBox();
      });
      extend(QuadTree.prototype, {
        insertNodes: function (points) {
          points.forEach(function (point) {
            this.root.insert(point, this.maxDepth);
          }, this);
        },
        visitNodeRecursive: function (node, beforeCallback, afterCallback) {
          var goFurther;
          if (!node) {
            node = this.root;
          }
          if (node === this.root && beforeCallback) {
            goFurther = beforeCallback(node);
          }
          if (goFurther === false) {
            return;
          }
          node.nodes.forEach(function (qtNode) {
            if (qtNode.isInternal) {
              if (beforeCallback) {
                goFurther = beforeCallback(qtNode);
              }
              if (goFurther === false) {
                return;
              }
              this.visitNodeRecursive(qtNode, beforeCallback, afterCallback);
            } else if (qtNode.body) {
              if (beforeCallback) {
                beforeCallback(qtNode.body);
              }
            }
            if (afterCallback) {
              afterCallback(qtNode);
            }
          }, this);
          if (node === this.root && afterCallback) {
            afterCallback(node);
          }
        },
        calculateMassAndCenter: function () {
          this.visitNodeRecursive(null, null, function (node) {
            node.updateMassAndCenter();
          });
        },
      });
    }
  );
  _registerModule(
    _modules,
    'Series/Networkgraph/Layouts.js',
    [
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Animation/AnimationUtilities.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Utilities.js'],
    ],
    function (Chart, A, H, U) {
      var setAnimation = A.setAnimation;
      var addEvent = U.addEvent,
        clamp = U.clamp,
        defined = U.defined,
        extend = U.extend,
        isFunction = U.isFunction,
        pick = U.pick;
      H.layouts = {
        'reingold-fruchterman': function () {},
      };
      extend(H.layouts['reingold-fruchterman'].prototype, {
        init: function (options) {
          this.options = options;
          this.nodes = [];
          this.links = [];
          this.series = [];
          this.box = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          };
          this.setInitialRendering(true);
          this.integration = H.networkgraphIntegrations[options.integration];
          this.enableSimulation = options.enableSimulation;
          this.attractiveForce = pick(
            options.attractiveForce,
            this.integration.attractiveForceFunction
          );
          this.repulsiveForce = pick(
            options.repulsiveForce,
            this.integration.repulsiveForceFunction
          );
          this.approximation = options.approximation;
        },
        updateSimulation: function (enable) {
          this.enableSimulation = pick(enable, this.options.enableSimulation);
        },
        start: function () {
          var layout = this,
            series = this.series,
            options = this.options;
          layout.currentStep = 0;
          layout.forces = (series[0] && series[0].forces) || [];
          layout.chart = series[0] && series[0].chart;
          if (layout.initialRendering) {
            layout.initPositions();
            series.forEach(function (s) {
              s.finishedAnimating = true;
              s.render();
            });
          }
          layout.setK();
          layout.resetSimulation(options);
          if (layout.enableSimulation) {
            layout.step();
          }
        },
        step: function () {
          var layout = this,
            series = this.series,
            options = this.options;
          layout.currentStep++;
          if (layout.approximation === 'barnes-hut') {
            layout.createQuadTree();
            layout.quadTree.calculateMassAndCenter();
          }
          layout.forces.forEach(function (forceName) {
            layout[forceName + 'Forces'](layout.temperature);
          });
          layout.applyLimits(layout.temperature);
          layout.temperature = layout.coolDown(
            layout.startTemperature,
            layout.diffTemperature,
            layout.currentStep
          );
          layout.prevSystemTemperature = layout.systemTemperature;
          layout.systemTemperature = layout.getSystemTemperature();
          if (layout.enableSimulation) {
            series.forEach(function (s) {
              if (s.chart) {
                s.render();
              }
            });
            if (
              layout.maxIterations-- &&
              isFinite(layout.temperature) &&
              !layout.isStable()
            ) {
              if (layout.simulation) {
                H.win.cancelAnimationFrame(layout.simulation);
              }
              layout.simulation = H.win.requestAnimationFrame(function () {
                layout.step();
              });
            } else {
              layout.simulation = false;
            }
          }
        },
        stop: function () {
          if (this.simulation) {
            H.win.cancelAnimationFrame(this.simulation);
          }
        },
        setArea: function (x, y, w, h) {
          this.box = {
            left: x,
            top: y,
            width: w,
            height: h,
          };
        },
        setK: function () {
          this.k = this.options.linkLength || this.integration.getK(this);
        },
        addElementsToCollection: function (elements, collection) {
          elements.forEach(function (elem) {
            if (collection.indexOf(elem) === -1) {
              collection.push(elem);
            }
          });
        },
        removeElementFromCollection: function (element, collection) {
          var index = collection.indexOf(element);
          if (index !== -1) {
            collection.splice(index, 1);
          }
        },
        clear: function () {
          this.nodes.length = 0;
          this.links.length = 0;
          this.series.length = 0;
          this.resetSimulation();
        },
        resetSimulation: function () {
          this.forcedStop = false;
          this.systemTemperature = 0;
          this.setMaxIterations();
          this.setTemperature();
          this.setDiffTemperature();
        },
        restartSimulation: function () {
          if (!this.simulation) {
            this.setInitialRendering(false);
            if (!this.enableSimulation) {
              this.setMaxIterations(1);
            } else {
              this.start();
            }
            if (this.chart) {
              this.chart.redraw();
            }
            this.setInitialRendering(true);
          } else {
            this.resetSimulation();
          }
        },
        setMaxIterations: function (maxIterations) {
          this.maxIterations = pick(maxIterations, this.options.maxIterations);
        },
        setTemperature: function () {
          this.temperature = this.startTemperature = Math.sqrt(
            this.nodes.length
          );
        },
        setDiffTemperature: function () {
          this.diffTemperature =
            this.startTemperature / (this.options.maxIterations + 1);
        },
        setInitialRendering: function (enable) {
          this.initialRendering = enable;
        },
        createQuadTree: function () {
          this.quadTree = new H.QuadTree(
            this.box.left,
            this.box.top,
            this.box.width,
            this.box.height
          );
          this.quadTree.insertNodes(this.nodes);
        },
        initPositions: function () {
          var initialPositions = this.options.initialPositions;
          if (isFunction(initialPositions)) {
            initialPositions.call(this);
            this.nodes.forEach(function (node) {
              if (!defined(node.prevX)) {
                node.prevX = node.plotX;
              }
              if (!defined(node.prevY)) {
                node.prevY = node.plotY;
              }
              node.dispX = 0;
              node.dispY = 0;
            });
          } else if (initialPositions === 'circle') {
            this.setCircularPositions();
          } else {
            this.setRandomPositions();
          }
        },
        setCircularPositions: function () {
          var box = this.box,
            nodes = this.nodes,
            nodesLength = nodes.length + 1,
            angle = (2 * Math.PI) / nodesLength,
            rootNodes = nodes.filter(function (node) {
              return node.linksTo.length === 0;
            }),
            sortedNodes = [],
            visitedNodes = {},
            radius = this.options.initialPositionRadius;
          function addToNodes(node) {
            node.linksFrom.forEach(function (link) {
              if (!visitedNodes[link.toNode.id]) {
                visitedNodes[link.toNode.id] = true;
                sortedNodes.push(link.toNode);
                addToNodes(link.toNode);
              }
            });
          }
          rootNodes.forEach(function (rootNode) {
            sortedNodes.push(rootNode);
            addToNodes(rootNode);
          });
          if (!sortedNodes.length) {
            sortedNodes = nodes;
          } else {
            nodes.forEach(function (node) {
              if (sortedNodes.indexOf(node) === -1) {
                sortedNodes.push(node);
              }
            });
          }
          sortedNodes.forEach(function (node, index) {
            node.plotX = node.prevX = pick(
              node.plotX,
              box.width / 2 + radius * Math.cos(index * angle)
            );
            node.plotY = node.prevY = pick(
              node.plotY,
              box.height / 2 + radius * Math.sin(index * angle)
            );
            node.dispX = 0;
            node.dispY = 0;
          });
        },
        setRandomPositions: function () {
          var box = this.box,
            nodes = this.nodes,
            nodesLength = nodes.length + 1;
          function unrandom(n) {
            var rand = (n * n) / Math.PI;
            rand = rand - Math.floor(rand);
            return rand;
          }
          nodes.forEach(function (node, index) {
            node.plotX = node.prevX = pick(
              node.plotX,
              box.width * unrandom(index)
            );
            node.plotY = node.prevY = pick(
              node.plotY,
              box.height * unrandom(nodesLength + index)
            );
            node.dispX = 0;
            node.dispY = 0;
          });
        },
        force: function (name) {
          this.integration[name].apply(
            this,
            Array.prototype.slice.call(arguments, 1)
          );
        },
        barycenterForces: function () {
          this.getBarycenter();
          this.force('barycenter');
        },
        getBarycenter: function () {
          var systemMass = 0,
            cx = 0,
            cy = 0;
          this.nodes.forEach(function (node) {
            cx += node.plotX * node.mass;
            cy += node.plotY * node.mass;
            systemMass += node.mass;
          });
          this.barycenter = {
            x: cx,
            y: cy,
            xFactor: cx / systemMass,
            yFactor: cy / systemMass,
          };
          return this.barycenter;
        },
        barnesHutApproximation: function (node, quadNode) {
          var layout = this,
            distanceXY = layout.getDistXY(node, quadNode),
            distanceR = layout.vectorLength(distanceXY),
            goDeeper,
            force;
          if (node !== quadNode && distanceR !== 0) {
            if (quadNode.isInternal) {
              if (
                quadNode.boxSize / distanceR < layout.options.theta &&
                distanceR !== 0
              ) {
                force = layout.repulsiveForce(distanceR, layout.k);
                layout.force(
                  'repulsive',
                  node,
                  force * quadNode.mass,
                  distanceXY,
                  distanceR
                );
                goDeeper = false;
              } else {
                goDeeper = true;
              }
            } else {
              force = layout.repulsiveForce(distanceR, layout.k);
              layout.force(
                'repulsive',
                node,
                force * quadNode.mass,
                distanceXY,
                distanceR
              );
            }
          }
          return goDeeper;
        },
        repulsiveForces: function () {
          var layout = this;
          if (layout.approximation === 'barnes-hut') {
            layout.nodes.forEach(function (node) {
              layout.quadTree.visitNodeRecursive(null, function (quadNode) {
                return layout.barnesHutApproximation(node, quadNode);
              });
            });
          } else {
            layout.nodes.forEach(function (node) {
              layout.nodes.forEach(function (repNode) {
                var force, distanceR, distanceXY;
                if (node !== repNode && !node.fixedPosition) {
                  distanceXY = layout.getDistXY(node, repNode);
                  distanceR = layout.vectorLength(distanceXY);
                  if (distanceR !== 0) {
                    force = layout.repulsiveForce(distanceR, layout.k);
                    layout.force(
                      'repulsive',
                      node,
                      force * repNode.mass,
                      distanceXY,
                      distanceR
                    );
                  }
                }
              });
            });
          }
        },
        attractiveForces: function () {
          var layout = this,
            distanceXY,
            distanceR,
            force;
          layout.links.forEach(function (link) {
            if (link.fromNode && link.toNode) {
              distanceXY = layout.getDistXY(link.fromNode, link.toNode);
              distanceR = layout.vectorLength(distanceXY);
              if (distanceR !== 0) {
                force = layout.attractiveForce(distanceR, layout.k);
                layout.force('attractive', link, force, distanceXY, distanceR);
              }
            }
          });
        },
        applyLimits: function () {
          var layout = this,
            nodes = layout.nodes;
          nodes.forEach(function (node) {
            if (node.fixedPosition) {
              return;
            }
            layout.integration.integrate(layout, node);
            layout.applyLimitBox(node, layout.box);
            node.dispX = 0;
            node.dispY = 0;
          });
        },
        applyLimitBox: function (node, box) {
          var radius = node.radius;
          node.plotX = clamp(node.plotX, box.left + radius, box.width - radius);
          node.plotY = clamp(node.plotY, box.top + radius, box.height - radius);
        },
        coolDown: function (temperature, temperatureStep, currentStep) {
          return temperature - temperatureStep * currentStep;
        },
        isStable: function () {
          return (
            Math.abs(this.systemTemperature - this.prevSystemTemperature) <
              0.00001 || this.temperature <= 0
          );
        },
        getSystemTemperature: function () {
          return this.nodes.reduce(function (value, node) {
            return value + node.temperature;
          }, 0);
        },
        vectorLength: function (vector) {
          return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        },
        getDistR: function (nodeA, nodeB) {
          var distance = this.getDistXY(nodeA, nodeB);
          return this.vectorLength(distance);
        },
        getDistXY: function (nodeA, nodeB) {
          var xDist = nodeA.plotX - nodeB.plotX,
            yDist = nodeA.plotY - nodeB.plotY;
          return {
            x: xDist,
            y: yDist,
            absX: Math.abs(xDist),
            absY: Math.abs(yDist),
          };
        },
      });
      addEvent(Chart, 'predraw', function () {
        if (this.graphLayoutsLookup) {
          this.graphLayoutsLookup.forEach(function (layout) {
            layout.stop();
          });
        }
      });
      addEvent(Chart, 'render', function () {
        var systemsStable,
          afterRender = false;
        function layoutStep(layout) {
          if (
            layout.maxIterations-- &&
            isFinite(layout.temperature) &&
            !layout.isStable() &&
            !layout.enableSimulation
          ) {
            if (layout.beforeStep) {
              layout.beforeStep();
            }
            layout.step();
            systemsStable = false;
            afterRender = true;
          }
        }
        if (this.graphLayoutsLookup) {
          setAnimation(false, this);
          this.graphLayoutsLookup.forEach(function (layout) {
            layout.start();
          });
          while (!systemsStable) {
            systemsStable = true;
            this.graphLayoutsLookup.forEach(layoutStep);
          }
          if (afterRender) {
            this.series.forEach(function (s) {
              if (s && s.layout) {
                s.render();
              }
            });
          }
        }
      });
      addEvent(Chart, 'beforePrint', function () {
        if (this.graphLayoutsLookup) {
          this.graphLayoutsLookup.forEach(function (layout) {
            layout.updateSimulation(false);
          });
          this.redraw();
        }
      });
      addEvent(Chart, 'afterPrint', function () {
        if (this.graphLayoutsLookup) {
          this.graphLayoutsLookup.forEach(function (layout) {
            layout.updateSimulation();
          });
        }
        this.redraw();
      });
    }
  );
  _registerModule(
    _modules,
    'Series/PackedBubbleSeries.js',
    [
      _modules['Core/Series/Series.js'],
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Color/Color.js'],
      _modules['Core/Globals.js'],
      _modules['Core/Series/Point.js'],
      _modules['Core/Utilities.js'],
    ],
    function (BaseSeries, Chart, Color, H, Point, U) {
      var color = Color.parse;
      var addEvent = U.addEvent,
        clamp = U.clamp,
        defined = U.defined,
        extend = U.extend,
        extendClass = U.extendClass,
        fireEvent = U.fireEvent,
        isArray = U.isArray,
        isNumber = U.isNumber,
        merge = U.merge,
        pick = U.pick;
      var Series = H.Series,
        Reingold = H.layouts['reingold-fruchterman'],
        dragNodesMixin = H.dragNodesMixin;
      ('');
      Chart.prototype.getSelectedParentNodes = function () {
        var chart = this,
          series = chart.series,
          selectedParentsNodes = [];
        series.forEach(function (series) {
          if (series.parentNode && series.parentNode.selected) {
            selectedParentsNodes.push(series.parentNode);
          }
        });
        return selectedParentsNodes;
      };
      H.networkgraphIntegrations.packedbubble = {
        repulsiveForceFunction: function (d, k, node, repNode) {
          return Math.min(d, (node.marker.radius + repNode.marker.radius) / 2);
        },
        barycenter: function () {
          var layout = this,
            gravitationalConstant = layout.options.gravitationalConstant,
            box = layout.box,
            nodes = layout.nodes,
            centerX,
            centerY;
          nodes.forEach(function (node) {
            if (layout.options.splitSeries && !node.isParentNode) {
              centerX = node.series.parentNode.plotX;
              centerY = node.series.parentNode.plotY;
            } else {
              centerX = box.width / 2;
              centerY = box.height / 2;
            }
            if (!node.fixedPosition) {
              node.plotX -=
                ((node.plotX - centerX) * gravitationalConstant) /
                (node.mass * Math.sqrt(nodes.length));
              node.plotY -=
                ((node.plotY - centerY) * gravitationalConstant) /
                (node.mass * Math.sqrt(nodes.length));
            }
          });
        },
        repulsive: function (node, force, distanceXY, repNode) {
          var factor = (force * this.diffTemperature) / node.mass / node.degree,
            x = distanceXY.x * factor,
            y = distanceXY.y * factor;
          if (!node.fixedPosition) {
            node.plotX += x;
            node.plotY += y;
          }
          if (!repNode.fixedPosition) {
            repNode.plotX -= x;
            repNode.plotY -= y;
          }
        },
        integrate: H.networkgraphIntegrations.verlet.integrate,
        getK: H.noop,
      };
      H.layouts.packedbubble = extendClass(Reingold, {
        beforeStep: function () {
          if (this.options.marker) {
            this.series.forEach(function (series) {
              if (series) {
                series.calculateParentRadius();
              }
            });
          }
        },
        setCircularPositions: function () {
          var layout = this,
            box = layout.box,
            nodes = layout.nodes,
            nodesLength = nodes.length + 1,
            angle = (2 * Math.PI) / nodesLength,
            centerX,
            centerY,
            radius = layout.options.initialPositionRadius;
          nodes.forEach(function (node, index) {
            if (layout.options.splitSeries && !node.isParentNode) {
              centerX = node.series.parentNode.plotX;
              centerY = node.series.parentNode.plotY;
            } else {
              centerX = box.width / 2;
              centerY = box.height / 2;
            }
            node.plotX = node.prevX = pick(
              node.plotX,
              centerX + radius * Math.cos(node.index || index * angle)
            );
            node.plotY = node.prevY = pick(
              node.plotY,
              centerY + radius * Math.sin(node.index || index * angle)
            );
            node.dispX = 0;
            node.dispY = 0;
          });
        },
        repulsiveForces: function () {
          var layout = this,
            force,
            distanceR,
            distanceXY,
            bubblePadding = layout.options.bubblePadding;
          layout.nodes.forEach(function (node) {
            node.degree = node.mass;
            node.neighbours = 0;
            layout.nodes.forEach(function (repNode) {
              force = 0;
              if (
                node !== repNode &&
                !node.fixedPosition &&
                (layout.options.seriesInteraction ||
                  node.series === repNode.series)
              ) {
                distanceXY = layout.getDistXY(node, repNode);
                distanceR =
                  layout.vectorLength(distanceXY) -
                  (node.marker.radius + repNode.marker.radius + bubblePadding);
                if (distanceR < 0) {
                  node.degree += 0.01;
                  node.neighbours++;
                  force = layout.repulsiveForce(
                    -distanceR / Math.sqrt(node.neighbours),
                    layout.k,
                    node,
                    repNode
                  );
                }
                layout.force(
                  'repulsive',
                  node,
                  force * repNode.mass,
                  distanceXY,
                  repNode,
                  distanceR
                );
              }
            });
          });
        },
        applyLimitBox: function (node) {
          var layout = this,
            distanceXY,
            distanceR,
            factor = 0.01;
          if (
            layout.options.splitSeries &&
            !node.isParentNode &&
            layout.options.parentNodeLimit
          ) {
            distanceXY = layout.getDistXY(node, node.series.parentNode);
            distanceR =
              node.series.parentNodeRadius -
              node.marker.radius -
              layout.vectorLength(distanceXY);
            if (distanceR < 0 && distanceR > -2 * node.marker.radius) {
              node.plotX -= distanceXY.x * factor;
              node.plotY -= distanceXY.y * factor;
            }
          }
          Reingold.prototype.applyLimitBox.apply(this, arguments);
        },
      });
      BaseSeries.seriesType(
        'packedbubble',
        'bubble',
        {
          minSize: '10%',
          maxSize: '50%',
          sizeBy: 'area',
          zoneAxis: 'y',
          crisp: false,
          tooltip: {
            pointFormat: 'Value: {point.value}',
          },
          draggable: true,
          useSimulation: true,
          parentNode: {
            allowPointSelect: false,
          },
          dataLabels: {
            formatter: function () {
              return this.point.value;
            },
            parentNodeFormatter: function () {
              return this.name;
            },
            parentNodeTextPath: {
              enabled: true,
            },
            padding: 0,
            style: {
              transition: 'opacity 2000ms',
            },
          },
          layoutAlgorithm: {
            initialPositions: 'circle',
            initialPositionRadius: 20,
            bubblePadding: 5,
            parentNodeLimit: false,
            seriesInteraction: true,
            dragBetweenSeries: false,
            parentNodeOptions: {
              maxIterations: 400,
              gravitationalConstant: 0.03,
              maxSpeed: 50,
              initialPositionRadius: 100,
              seriesInteraction: true,
              marker: {
                fillColor: null,
                fillOpacity: 1,
                lineWidth: 1,
                lineColor: null,
                symbol: 'circle',
              },
            },
            enableSimulation: true,
            type: 'packedbubble',
            integration: 'packedbubble',
            maxIterations: 1000,
            splitSeries: false,
            maxSpeed: 5,
            gravitationalConstant: 0.01,
            friction: -0.981,
          },
        },
        {
          hasDraggableNodes: true,
          forces: ['barycenter', 'repulsive'],
          pointArrayMap: ['value'],
          trackerGroups: ['group', 'dataLabelsGroup', 'parentNodesGroup'],
          pointValKey: 'value',
          isCartesian: false,
          requireSorting: false,
          directTouch: true,
          axisTypes: [],
          noSharedTooltip: true,
          searchPoint: H.noop,
          accumulateAllPoints: function (series) {
            var chart = series.chart,
              allDataPoints = [],
              i,
              j;
            for (i = 0; i < chart.series.length; i++) {
              series = chart.series[i];
              if (
                (series.is('packedbubble') && series.visible) ||
                !chart.options.chart.ignoreHiddenSeries
              ) {
                for (j = 0; j < series.yData.length; j++) {
                  allDataPoints.push([
                    null,
                    null,
                    series.yData[j],
                    series.index,
                    j,
                    {
                      id: j,
                      marker: {
                        radius: 0,
                      },
                    },
                  ]);
                }
              }
            }
            return allDataPoints;
          },
          init: function () {
            Series.prototype.init.apply(this, arguments);
            addEvent(this, 'updatedData', function () {
              this.chart.series.forEach(function (s) {
                if (s.type === this.type) {
                  s.isDirty = true;
                }
              }, this);
            });
            return this;
          },
          render: function () {
            var series = this,
              dataLabels = [];
            Series.prototype.render.apply(this, arguments);
            if (!series.options.dataLabels.allowOverlap) {
              series.data.forEach(function (point) {
                if (isArray(point.dataLabels)) {
                  point.dataLabels.forEach(function (dataLabel) {
                    dataLabels.push(dataLabel);
                  });
                }
              });
              if (series.options.useSimulation) {
                series.chart.hideOverlappingLabels(dataLabels);
              }
            }
          },
          setVisible: function () {
            var series = this;
            Series.prototype.setVisible.apply(series, arguments);
            if (series.parentNodeLayout && series.graph) {
              if (series.visible) {
                series.graph.show();
                if (series.parentNode.dataLabel) {
                  series.parentNode.dataLabel.show();
                }
              } else {
                series.graph.hide();
                series.parentNodeLayout.removeElementFromCollection(
                  series.parentNode,
                  series.parentNodeLayout.nodes
                );
                if (series.parentNode.dataLabel) {
                  series.parentNode.dataLabel.hide();
                }
              }
            } else if (series.layout) {
              if (series.visible) {
                series.layout.addElementsToCollection(
                  series.points,
                  series.layout.nodes
                );
              } else {
                series.points.forEach(function (node) {
                  series.layout.removeElementFromCollection(
                    node,
                    series.layout.nodes
                  );
                });
              }
            }
          },
          drawDataLabels: function () {
            var textPath = this.options.dataLabels.textPath,
              points = this.points;
            Series.prototype.drawDataLabels.apply(this, arguments);
            if (this.parentNode) {
              this.parentNode.formatPrefix = 'parentNode';
              this.points = [this.parentNode];
              this.options.dataLabels.textPath =
                this.options.dataLabels.parentNodeTextPath;
              Series.prototype.drawDataLabels.apply(this, arguments);
              this.points = points;
              this.options.dataLabels.textPath = textPath;
            }
          },
          seriesBox: function () {
            var series = this,
              chart = series.chart,
              data = series.data,
              max = Math.max,
              min = Math.min,
              radius,
              bBox = [
                chart.plotLeft,
                chart.plotLeft + chart.plotWidth,
                chart.plotTop,
                chart.plotTop + chart.plotHeight,
              ];
            data.forEach(function (p) {
              if (defined(p.plotX) && defined(p.plotY) && p.marker.radius) {
                radius = p.marker.radius;
                bBox[0] = min(bBox[0], p.plotX - radius);
                bBox[1] = max(bBox[1], p.plotX + radius);
                bBox[2] = min(bBox[2], p.plotY - radius);
                bBox[3] = max(bBox[3], p.plotY + radius);
              }
            });
            return isNumber(bBox.width / bBox.height) ? bBox : null;
          },
          calculateParentRadius: function () {
            var series = this,
              bBox,
              parentPadding = 20,
              minParentRadius = 20;
            bBox = series.seriesBox();
            series.parentNodeRadius = clamp(
              Math.sqrt((2 * series.parentNodeMass) / Math.PI) + parentPadding,
              minParentRadius,
              bBox
                ? Math.max(
                    Math.sqrt(
                      Math.pow(bBox.width, 2) + Math.pow(bBox.height, 2)
                    ) /
                      2 +
                      parentPadding,
                    minParentRadius
                  )
                : Math.sqrt((2 * series.parentNodeMass) / Math.PI) +
                    parentPadding
            );
            if (series.parentNode) {
              series.parentNode.marker.radius = series.parentNode.radius =
                series.parentNodeRadius;
            }
          },
          drawGraph: function () {
            if (!this.layout || !this.layout.options.splitSeries) {
              return;
            }
            var series = this,
              chart = series.chart,
              parentAttribs = {},
              nodeMarker = this.layout.options.parentNodeOptions.marker,
              parentOptions = {
                fill:
                  nodeMarker.fillColor ||
                  color(series.color).brighten(0.4).get(),
                opacity: nodeMarker.fillOpacity,
                stroke: nodeMarker.lineColor || series.color,
                'stroke-width': nodeMarker.lineWidth,
              },
              visibility = series.visible ? 'inherit' : 'hidden';
            if (!this.parentNodesGroup) {
              series.parentNodesGroup = series.plotGroup(
                'parentNodesGroup',
                'parentNode',
                visibility,
                0.1,
                chart.seriesGroup
              );
              series.group.attr({
                zIndex: 2,
              });
            }
            this.calculateParentRadius();
            parentAttribs = merge(
              {
                x: series.parentNode.plotX - series.parentNodeRadius,
                y: series.parentNode.plotY - series.parentNodeRadius,
                width: series.parentNodeRadius * 2,
                height: series.parentNodeRadius * 2,
              },
              parentOptions
            );
            if (!series.parentNode.graphic) {
              series.graph = series.parentNode.graphic = chart.renderer
                .symbol(parentOptions.symbol)
                .add(series.parentNodesGroup);
            }
            series.parentNode.graphic.attr(parentAttribs);
          },
          createParentNodes: function () {
            var series = this,
              chart = series.chart,
              parentNodeLayout = series.parentNodeLayout,
              nodeAdded,
              parentNode = series.parentNode,
              PackedBubblePoint = series.pointClass;
            series.parentNodeMass = 0;
            series.points.forEach(function (p) {
              series.parentNodeMass += Math.PI * Math.pow(p.marker.radius, 2);
            });
            series.calculateParentRadius();
            parentNodeLayout.nodes.forEach(function (node) {
              if (node.seriesIndex === series.index) {
                nodeAdded = true;
              }
            });
            parentNodeLayout.setArea(0, 0, chart.plotWidth, chart.plotHeight);
            if (!nodeAdded) {
              if (!parentNode) {
                parentNode = new PackedBubblePoint().init(this, {
                  mass: series.parentNodeRadius / 2,
                  marker: {
                    radius: series.parentNodeRadius,
                  },
                  dataLabels: {
                    inside: false,
                  },
                  dataLabelOnNull: true,
                  degree: series.parentNodeRadius,
                  isParentNode: true,
                  seriesIndex: series.index,
                });
              }
              if (series.parentNode) {
                parentNode.plotX = series.parentNode.plotX;
                parentNode.plotY = series.parentNode.plotY;
              }
              series.parentNode = parentNode;
              parentNodeLayout.addElementsToCollection(
                [series],
                parentNodeLayout.series
              );
              parentNodeLayout.addElementsToCollection(
                [parentNode],
                parentNodeLayout.nodes
              );
            }
          },
          drawTracker: function () {
            var series = this,
              chart = series.chart,
              pointer = chart.pointer,
              onMouseOver = function (e) {
                var point = pointer.getPointFromEvent(e);
                if (typeof point !== 'undefined') {
                  pointer.isDirectTouch = true;
                  point.onMouseOver(e);
                }
              },
              parentNode = series.parentNode;
            var dataLabels;
            H.TrackerMixin.drawTrackerPoint.call(this);
            if (parentNode) {
              dataLabels = isArray(parentNode.dataLabels)
                ? parentNode.dataLabels
                : parentNode.dataLabel
                ? [parentNode.dataLabel]
                : [];
              if (parentNode.graphic) {
                parentNode.graphic.element.point = parentNode;
              }
              dataLabels.forEach(function (dataLabel) {
                if (dataLabel.div) {
                  dataLabel.div.point = parentNode;
                } else {
                  dataLabel.element.point = parentNode;
                }
              });
            }
          },
          addSeriesLayout: function () {
            var series = this,
              layoutOptions = series.options.layoutAlgorithm,
              graphLayoutsStorage = series.chart.graphLayoutsStorage,
              graphLayoutsLookup = series.chart.graphLayoutsLookup,
              parentNodeOptions = merge(
                layoutOptions,
                layoutOptions.parentNodeOptions,
                {
                  enableSimulation: series.layout.options.enableSimulation,
                }
              ),
              parentNodeLayout;
            parentNodeLayout =
              graphLayoutsStorage[layoutOptions.type + '-series'];
            if (!parentNodeLayout) {
              graphLayoutsStorage[layoutOptions.type + '-series'] =
                parentNodeLayout = new H.layouts[layoutOptions.type]();
              parentNodeLayout.init(parentNodeOptions);
              graphLayoutsLookup.splice(
                parentNodeLayout.index,
                0,
                parentNodeLayout
              );
            }
            series.parentNodeLayout = parentNodeLayout;
            this.createParentNodes();
          },
          addLayout: function () {
            var series = this,
              layoutOptions = series.options.layoutAlgorithm,
              graphLayoutsStorage = series.chart.graphLayoutsStorage,
              graphLayoutsLookup = series.chart.graphLayoutsLookup,
              chartOptions = series.chart.options.chart,
              layout;
            if (!graphLayoutsStorage) {
              series.chart.graphLayoutsStorage = graphLayoutsStorage = {};
              series.chart.graphLayoutsLookup = graphLayoutsLookup = [];
            }
            layout = graphLayoutsStorage[layoutOptions.type];
            if (!layout) {
              layoutOptions.enableSimulation = !defined(chartOptions.forExport)
                ? layoutOptions.enableSimulation
                : !chartOptions.forExport;
              graphLayoutsStorage[layoutOptions.type] = layout = new H.layouts[
                layoutOptions.type
              ]();
              layout.init(layoutOptions);
              graphLayoutsLookup.splice(layout.index, 0, layout);
            }
            series.layout = layout;
            series.points.forEach(function (node) {
              node.mass = 2;
              node.degree = 1;
              node.collisionNmb = 1;
            });
            layout.setArea(
              0,
              0,
              series.chart.plotWidth,
              series.chart.plotHeight
            );
            layout.addElementsToCollection([series], layout.series);
            layout.addElementsToCollection(series.points, layout.nodes);
          },
          deferLayout: function () {
            var series = this,
              layoutOptions = series.options.layoutAlgorithm;
            if (!series.visible) {
              return;
            }
            series.addLayout();
            if (layoutOptions.splitSeries) {
              series.addSeriesLayout();
            }
          },
          translate: function () {
            var series = this,
              chart = series.chart,
              data = series.data,
              index = series.index,
              point,
              radius,
              positions,
              i,
              useSimulation = series.options.useSimulation;
            series.processedXData = series.xData;
            series.generatePoints();
            if (!defined(chart.allDataPoints)) {
              chart.allDataPoints = series.accumulateAllPoints(series);
              series.getPointRadius();
            }
            if (useSimulation) {
              positions = chart.allDataPoints;
            } else {
              positions = series.placeBubbles(chart.allDataPoints);
              series.options.draggable = false;
            }
            for (i = 0; i < positions.length; i++) {
              if (positions[i][3] === index) {
                point = data[positions[i][4]];
                radius = positions[i][2];
                if (!useSimulation) {
                  point.plotX = positions[i][0] - chart.plotLeft + chart.diffX;
                  point.plotY = positions[i][1] - chart.plotTop + chart.diffY;
                }
                point.marker = extend(point.marker, {
                  radius: radius,
                  width: 2 * radius,
                  height: 2 * radius,
                });
                point.radius = radius;
              }
            }
            if (useSimulation) {
              series.deferLayout();
            }
            fireEvent(series, 'afterTranslate');
          },
          checkOverlap: function (bubble1, bubble2) {
            var diffX = bubble1[0] - bubble2[0],
              diffY = bubble1[1] - bubble2[1],
              sumRad = bubble1[2] + bubble2[2];
            return (
              Math.sqrt(diffX * diffX + diffY * diffY) - Math.abs(sumRad) <
              -0.001
            );
          },
          positionBubble: function (lastBubble, newOrigin, nextBubble) {
            var sqrt = Math.sqrt,
              asin = Math.asin,
              acos = Math.acos,
              pow = Math.pow,
              abs = Math.abs,
              distance = sqrt(
                pow(lastBubble[0] - newOrigin[0], 2) +
                  pow(lastBubble[1] - newOrigin[1], 2)
              ),
              alfa = acos(
                (pow(distance, 2) +
                  pow(nextBubble[2] + newOrigin[2], 2) -
                  pow(nextBubble[2] + lastBubble[2], 2)) /
                  (2 * (nextBubble[2] + newOrigin[2]) * distance)
              ),
              beta = asin(abs(lastBubble[0] - newOrigin[0]) / distance),
              gamma = lastBubble[1] - newOrigin[1] < 0 ? 0 : Math.PI,
              delta =
                (lastBubble[0] - newOrigin[0]) *
                  (lastBubble[1] - newOrigin[1]) <
                0
                  ? 1
                  : -1,
              finalAngle = gamma + alfa + beta * delta,
              cosA = Math.cos(finalAngle),
              sinA = Math.sin(finalAngle),
              posX = newOrigin[0] + (newOrigin[2] + nextBubble[2]) * sinA,
              posY = newOrigin[1] - (newOrigin[2] + nextBubble[2]) * cosA;
            return [posX, posY, nextBubble[2], nextBubble[3], nextBubble[4]];
          },
          placeBubbles: function (allDataPoints) {
            var series = this,
              checkOverlap = series.checkOverlap,
              positionBubble = series.positionBubble,
              bubblePos = [],
              stage = 1,
              j = 0,
              k = 0,
              calculatedBubble,
              sortedArr,
              arr = [],
              i;
            sortedArr = allDataPoints.sort(function (a, b) {
              return b[2] - a[2];
            });
            if (sortedArr.length) {
              bubblePos.push([
                [0, 0, sortedArr[0][2], sortedArr[0][3], sortedArr[0][4]],
              ]);
              if (sortedArr.length > 1) {
                bubblePos.push([
                  [
                    0,
                    0 - sortedArr[1][2] - sortedArr[0][2],
                    sortedArr[1][2],
                    sortedArr[1][3],
                    sortedArr[1][4],
                  ],
                ]);
                for (i = 2; i < sortedArr.length; i++) {
                  sortedArr[i][2] = sortedArr[i][2] || 1;
                  calculatedBubble = positionBubble(
                    bubblePos[stage][j],
                    bubblePos[stage - 1][k],
                    sortedArr[i]
                  );
                  if (checkOverlap(calculatedBubble, bubblePos[stage][0])) {
                    bubblePos.push([]);
                    k = 0;
                    bubblePos[stage + 1].push(
                      positionBubble(
                        bubblePos[stage][j],
                        bubblePos[stage][0],
                        sortedArr[i]
                      )
                    );
                    stage++;
                    j = 0;
                  } else if (
                    stage > 1 &&
                    bubblePos[stage - 1][k + 1] &&
                    checkOverlap(calculatedBubble, bubblePos[stage - 1][k + 1])
                  ) {
                    k++;
                    bubblePos[stage].push(
                      positionBubble(
                        bubblePos[stage][j],
                        bubblePos[stage - 1][k],
                        sortedArr[i]
                      )
                    );
                    j++;
                  } else {
                    j++;
                    bubblePos[stage].push(calculatedBubble);
                  }
                }
              }
              series.chart.stages = bubblePos;
              series.chart.rawPositions = [].concat.apply([], bubblePos);
              series.resizeRadius();
              arr = series.chart.rawPositions;
            }
            return arr;
          },
          resizeRadius: function () {
            var chart = this.chart,
              positions = chart.rawPositions,
              min = Math.min,
              max = Math.max,
              plotLeft = chart.plotLeft,
              plotTop = chart.plotTop,
              chartHeight = chart.plotHeight,
              chartWidth = chart.plotWidth,
              minX,
              maxX,
              minY,
              maxY,
              radius,
              bBox,
              spaceRatio,
              smallerDimension,
              i;
            minX = minY = Number.POSITIVE_INFINITY;
            maxX = maxY = Number.NEGATIVE_INFINITY;
            for (i = 0; i < positions.length; i++) {
              radius = positions[i][2];
              minX = min(minX, positions[i][0] - radius);
              maxX = max(maxX, positions[i][0] + radius);
              minY = min(minY, positions[i][1] - radius);
              maxY = max(maxY, positions[i][1] + radius);
            }
            bBox = [maxX - minX, maxY - minY];
            spaceRatio = [
              (chartWidth - plotLeft) / bBox[0],
              (chartHeight - plotTop) / bBox[1],
            ];
            smallerDimension = min.apply([], spaceRatio);
            if (Math.abs(smallerDimension - 1) > 1e-10) {
              for (i = 0; i < positions.length; i++) {
                positions[i][2] *= smallerDimension;
              }
              this.placeBubbles(positions);
            } else {
              chart.diffY =
                chartHeight / 2 + plotTop - minY - (maxY - minY) / 2;
              chart.diffX =
                chartWidth / 2 + plotLeft - minX - (maxX - minX) / 2;
            }
          },
          calculateZExtremes: function () {
            var chart = this.chart,
              zMin = this.options.zMin,
              zMax = this.options.zMax,
              valMin = Infinity,
              valMax = -Infinity;
            if (zMin && zMax) {
              return [zMin, zMax];
            }
            chart.series.forEach(function (s) {
              s.yData.forEach(function (p) {
                if (defined(p)) {
                  if (p > valMax) {
                    valMax = p;
                  }
                  if (p < valMin) {
                    valMin = p;
                  }
                }
              });
            });
            zMin = pick(zMin, valMin);
            zMax = pick(zMax, valMax);
            return [zMin, zMax];
          },
          getPointRadius: function () {
            var series = this,
              chart = series.chart,
              plotWidth = chart.plotWidth,
              plotHeight = chart.plotHeight,
              seriesOptions = series.options,
              useSimulation = seriesOptions.useSimulation,
              smallestSize = Math.min(plotWidth, plotHeight),
              extremes = {},
              radii = [],
              allDataPoints = chart.allDataPoints,
              minSize,
              maxSize,
              value,
              radius,
              zExtremes;
            ['minSize', 'maxSize'].forEach(function (prop) {
              var length = parseInt(seriesOptions[prop], 10),
                isPercent = /%$/.test(seriesOptions[prop]);
              extremes[prop] = isPercent
                ? (smallestSize * length) / 100
                : length * Math.sqrt(allDataPoints.length);
            });
            chart.minRadius = minSize =
              extremes.minSize / Math.sqrt(allDataPoints.length);
            chart.maxRadius = maxSize =
              extremes.maxSize / Math.sqrt(allDataPoints.length);
            zExtremes = useSimulation
              ? series.calculateZExtremes()
              : [minSize, maxSize];
            (allDataPoints || []).forEach(function (point, i) {
              value = useSimulation
                ? clamp(point[2], zExtremes[0], zExtremes[1])
                : point[2];
              radius = series.getRadius(
                zExtremes[0],
                zExtremes[1],
                minSize,
                maxSize,
                value
              );
              if (radius === 0) {
                radius = null;
              }
              allDataPoints[i][2] = radius;
              radii.push(radius);
            });
            series.radii = radii;
          },
          redrawHalo: dragNodesMixin.redrawHalo,
          onMouseDown: dragNodesMixin.onMouseDown,
          onMouseMove: dragNodesMixin.onMouseMove,
          onMouseUp: function (point) {
            if (point.fixedPosition && !point.removed) {
              var distanceXY,
                distanceR,
                layout = this.layout,
                parentNodeLayout = this.parentNodeLayout;
              if (parentNodeLayout && layout.options.dragBetweenSeries) {
                parentNodeLayout.nodes.forEach(function (node) {
                  if (
                    point &&
                    point.marker &&
                    node !== point.series.parentNode
                  ) {
                    distanceXY = layout.getDistXY(point, node);
                    distanceR =
                      layout.vectorLength(distanceXY) -
                      node.marker.radius -
                      point.marker.radius;
                    if (distanceR < 0) {
                      node.series.addPoint(
                        merge(point.options, {
                          plotX: point.plotX,
                          plotY: point.plotY,
                        }),
                        false
                      );
                      layout.removeElementFromCollection(point, layout.nodes);
                      point.remove();
                    }
                  }
                });
              }
              dragNodesMixin.onMouseUp.apply(this, arguments);
            }
          },
          destroy: function () {
            if (this.chart.graphLayoutsLookup) {
              this.chart.graphLayoutsLookup.forEach(function (layout) {
                layout.removeElementFromCollection(this, layout.series);
              }, this);
            }
            if (this.parentNode) {
              this.parentNodeLayout.removeElementFromCollection(
                this.parentNode,
                this.parentNodeLayout.nodes
              );
              if (this.parentNode.dataLabel) {
                this.parentNode.dataLabel = this.parentNode.dataLabel.destroy();
              }
            }
            H.Series.prototype.destroy.apply(this, arguments);
          },
          alignDataLabel: H.Series.prototype.alignDataLabel,
        },
        {
          destroy: function () {
            if (this.series.layout) {
              this.series.layout.removeElementFromCollection(
                this,
                this.series.layout.nodes
              );
            }
            return Point.prototype.destroy.apply(this, arguments);
          },
          firePointEvent: function (eventType, eventArgs, defaultFunction) {
            var point = this,
              series = this.series,
              seriesOptions = series.options;
            if (this.isParentNode && seriesOptions.parentNode) {
              var temp = seriesOptions.allowPointSelect;
              seriesOptions.allowPointSelect =
                seriesOptions.parentNode.allowPointSelect;
              Point.prototype.firePointEvent.apply(this, arguments);
              seriesOptions.allowPointSelect = temp;
            } else {
              Point.prototype.firePointEvent.apply(this, arguments);
            }
          },
          select: function (selected, accumulate) {
            var point = this,
              series = this.series,
              chart = series.chart;
            if (point.isParentNode) {
              chart.getSelectedPoints = chart.getSelectedParentNodes;
              Point.prototype.select.apply(this, arguments);
              chart.getSelectedPoints = Chart.prototype.getSelectedPoints;
            } else {
              Point.prototype.select.apply(this, arguments);
            }
          },
        }
      );
      addEvent(Chart, 'beforeRedraw', function () {
        if (this.allDataPoints) {
          delete this.allDataPoints;
        }
      });
      ('');
    }
  );
  _registerModule(
    _modules,
    'Extensions/Polar.js',
    [
      _modules['Core/Animation/AnimationUtilities.js'],
      _modules['Core/Chart/Chart.js'],
      _modules['Core/Globals.js'],
      _modules['Extensions/Pane.js'],
      _modules['Core/Pointer.js'],
      _modules['Core/Renderer/SVG/SVGRenderer.js'],
      _modules['Core/Utilities.js'],
    ],
    function (A, Chart, H, Pane, Pointer, SVGRenderer, U) {
      var animObject = A.animObject;
      var addEvent = U.addEvent,
        defined = U.defined,
        find = U.find,
        isNumber = U.isNumber,
        pick = U.pick,
        splat = U.splat,
        uniqueKey = U.uniqueKey,
        wrap = U.wrap;
      var Series = H.Series,
        seriesTypes = H.seriesTypes,
        seriesProto = Series.prototype,
        pointerProto = Pointer.prototype,
        colProto,
        arearangeProto;
      seriesProto.searchPointByAngle = function (e) {
        var series = this,
          chart = series.chart,
          xAxis = series.xAxis,
          center = xAxis.pane.center,
          plotX = e.chartX - center[0] - chart.plotLeft,
          plotY = e.chartY - center[1] - chart.plotTop;
        return this.searchKDTree({
          clientX: 180 + Math.atan2(plotX, plotY) * (-180 / Math.PI),
        });
      };
      seriesProto.getConnectors = function (
        segment,
        index,
        calculateNeighbours,
        connectEnds
      ) {
        var i,
          prevPointInd,
          nextPointInd,
          previousPoint,
          nextPoint,
          previousX,
          previousY,
          nextX,
          nextY,
          plotX,
          plotY,
          ret,
          smoothing = 1.5,
          denom = smoothing + 1,
          leftContX,
          leftContY,
          rightContX,
          rightContY,
          dLControlPoint,
          dRControlPoint,
          leftContAngle,
          rightContAngle,
          jointAngle,
          addedNumber = connectEnds ? 1 : 0;
        if (index >= 0 && index <= segment.length - 1) {
          i = index;
        } else if (index < 0) {
          i = segment.length - 1 + index;
        } else {
          i = 0;
        }
        prevPointInd = i - 1 < 0 ? segment.length - (1 + addedNumber) : i - 1;
        nextPointInd = i + 1 > segment.length - 1 ? addedNumber : i + 1;
        previousPoint = segment[prevPointInd];
        nextPoint = segment[nextPointInd];
        previousX = previousPoint.plotX;
        previousY = previousPoint.plotY;
        nextX = nextPoint.plotX;
        nextY = nextPoint.plotY;
        plotX = segment[i].plotX;
        plotY = segment[i].plotY;
        leftContX = (smoothing * plotX + previousX) / denom;
        leftContY = (smoothing * plotY + previousY) / denom;
        rightContX = (smoothing * plotX + nextX) / denom;
        rightContY = (smoothing * plotY + nextY) / denom;
        dLControlPoint = Math.sqrt(
          Math.pow(leftContX - plotX, 2) + Math.pow(leftContY - plotY, 2)
        );
        dRControlPoint = Math.sqrt(
          Math.pow(rightContX - plotX, 2) + Math.pow(rightContY - plotY, 2)
        );
        leftContAngle = Math.atan2(leftContY - plotY, leftContX - plotX);
        rightContAngle = Math.atan2(rightContY - plotY, rightContX - plotX);
        jointAngle = Math.PI / 2 + (leftContAngle + rightContAngle) / 2;
        if (Math.abs(leftContAngle - jointAngle) > Math.PI / 2) {
          jointAngle -= Math.PI;
        }
        leftContX = plotX + Math.cos(jointAngle) * dLControlPoint;
        leftContY = plotY + Math.sin(jointAngle) * dLControlPoint;
        rightContX = plotX + Math.cos(Math.PI + jointAngle) * dRControlPoint;
        rightContY = plotY + Math.sin(Math.PI + jointAngle) * dRControlPoint;
        ret = {
          rightContX: rightContX,
          rightContY: rightContY,
          leftContX: leftContX,
          leftContY: leftContY,
          plotX: plotX,
          plotY: plotY,
        };
        if (calculateNeighbours) {
          ret.prevPointCont = this.getConnectors(
            segment,
            prevPointInd,
            false,
            connectEnds
          );
        }
        return ret;
      };
      seriesProto.toXY = function (point) {
        var xy,
          chart = this.chart,
          xAxis = this.xAxis,
          yAxis = this.yAxis,
          plotX = point.plotX,
          plotY = point.plotY,
          series = point.series,
          inverted = chart.inverted,
          pointY = point.y,
          radius = inverted ? plotX : yAxis.len - plotY,
          clientX;
        if (inverted && series && !series.isRadialBar) {
          point.plotY = plotY =
            typeof pointY === 'number' ? yAxis.translate(pointY) || 0 : 0;
        }
        point.rectPlotX = plotX;
        point.rectPlotY = plotY;
        if (yAxis.center) {
          radius += yAxis.center[3] / 2;
        }
        xy = inverted
          ? yAxis.postTranslate(plotY, radius)
          : xAxis.postTranslate(plotX, radius);
        point.plotX = point.polarPlotX = xy.x - chart.plotLeft;
        point.plotY = point.polarPlotY = xy.y - chart.plotTop;
        if (this.kdByAngle) {
          clientX =
            ((plotX / Math.PI) * 180 + xAxis.pane.options.startAngle) % 360;
          if (clientX < 0) {
            clientX += 360;
          }
          point.clientX = clientX;
        } else {
          point.clientX = point.plotX;
        }
      };
      if (seriesTypes.spline) {
        wrap(
          seriesTypes.spline.prototype,
          'getPointSpline',
          function (proceed, segment, point, i) {
            var ret, connectors;
            if (this.chart.polar) {
              if (!i) {
                ret = ['M', point.plotX, point.plotY];
              } else {
                connectors = this.getConnectors(
                  segment,
                  i,
                  true,
                  this.connectEnds
                );
                ret = [
                  'C',
                  connectors.prevPointCont.rightContX,
                  connectors.prevPointCont.rightContY,
                  connectors.leftContX,
                  connectors.leftContY,
                  connectors.plotX,
                  connectors.plotY,
                ];
              }
            } else {
              ret = proceed.call(this, segment, point, i);
            }
            return ret;
          }
        );
        if (seriesTypes.areasplinerange) {
          seriesTypes.areasplinerange.prototype.getPointSpline =
            seriesTypes.spline.prototype.getPointSpline;
        }
      }
      addEvent(
        Series,
        'afterTranslate',
        function () {
          var series = this;
          var chart = series.chart;
          if (chart.polar && series.xAxis) {
            series.kdByAngle = chart.tooltip && chart.tooltip.shared;
            if (series.kdByAngle) {
              series.searchPoint = series.searchPointByAngle;
            } else {
              series.options.findNearestPointBy = 'xy';
            }
            if (!series.preventPostTranslate) {
              var points = series.points;
              var i = points.length;
              while (i--) {
                series.toXY(points[i]);
                if (
                  !chart.hasParallelCoordinates &&
                  !series.yAxis.reversed &&
                  points[i].y < series.yAxis.min
                ) {
                  points[i].isNull = true;
                }
              }
            }
            if (!this.hasClipCircleSetter) {
              this.hasClipCircleSetter = !!series.eventsToUnbind.push(
                addEvent(series, 'afterRender', function () {
                  var circ;
                  if (chart.polar) {
                    circ = this.yAxis.pane.center;
                    if (!this.clipCircle) {
                      this.clipCircle = chart.renderer.clipCircle(
                        circ[0],
                        circ[1],
                        circ[2] / 2,
                        circ[3] / 2
                      );
                    } else {
                      this.clipCircle.animate({
                        x: circ[0],
                        y: circ[1],
                        r: circ[2] / 2,
                        innerR: circ[3] / 2,
                      });
                    }
                    this.group.clip(this.clipCircle);
                    this.setClip = H.noop;
                  }
                })
              );
            }
          }
        },
        { order: 2 }
      );
      wrap(seriesProto, 'getGraphPath', function (proceed, points) {
        var series = this,
          i,
          firstValid,
          popLastPoint;
        if (this.chart.polar) {
          points = points || this.points;
          for (i = 0; i < points.length; i++) {
            if (!points[i].isNull) {
              firstValid = i;
              break;
            }
          }
          if (
            this.options.connectEnds !== false &&
            typeof firstValid !== 'undefined'
          ) {
            this.connectEnds = true;
            points.splice(points.length, 0, points[firstValid]);
            popLastPoint = true;
          }
          points.forEach(function (point) {
            if (typeof point.polarPlotY === 'undefined') {
              series.toXY(point);
            }
          });
        }
        var ret = proceed.apply(this, [].slice.call(arguments, 1));
        if (popLastPoint) {
          points.pop();
        }
        return ret;
      });
      var polarAnimate = function (proceed, init) {
        var series = this,
          chart = this.chart,
          animation = this.options.animation,
          group = this.group,
          markerGroup = this.markerGroup,
          center = this.xAxis.center,
          plotLeft = chart.plotLeft,
          plotTop = chart.plotTop,
          attribs,
          paneInnerR,
          graphic,
          shapeArgs,
          r,
          innerR;
        if (chart.polar) {
          if (series.isRadialBar) {
            if (!init) {
              series.startAngleRad = pick(
                series.translatedThreshold,
                series.xAxis.startAngleRad
              );
              H.seriesTypes.pie.prototype.animate.call(series, init);
            }
          } else {
            if (chart.renderer.isSVG) {
              animation = animObject(animation);
              if (series.is('column')) {
                if (!init) {
                  paneInnerR = center[3] / 2;
                  series.points.forEach(function (point) {
                    graphic = point.graphic;
                    shapeArgs = point.shapeArgs;
                    r = shapeArgs && shapeArgs.r;
                    innerR = shapeArgs && shapeArgs.innerR;
                    if (graphic && shapeArgs) {
                      graphic.attr({
                        r: paneInnerR,
                        innerR: paneInnerR,
                      });
                      graphic.animate(
                        {
                          r: r,
                          innerR: innerR,
                        },
                        series.options.animation
                      );
                    }
                  });
                }
              } else {
                if (init) {
                  attribs = {
                    translateX: center[0] + plotLeft,
                    translateY: center[1] + plotTop,
                    scaleX: 0.001,
                    scaleY: 0.001,
                  };
                  group.attr(attribs);
                  if (markerGroup) {
                    markerGroup.attr(attribs);
                  }
                } else {
                  attribs = {
                    translateX: plotLeft,
                    translateY: plotTop,
                    scaleX: 1,
                    scaleY: 1,
                  };
                  group.animate(attribs, animation);
                  if (markerGroup) {
                    markerGroup.animate(attribs, animation);
                  }
                }
              }
            }
          }
        } else {
          proceed.call(this, init);
        }
      };
      wrap(seriesProto, 'animate', polarAnimate);
      if (seriesTypes.column) {
        arearangeProto = seriesTypes.arearange.prototype;
        colProto = seriesTypes.column.prototype;
        colProto.polarArc = function (low, high, start, end) {
          var center = this.xAxis.center,
            len = this.yAxis.len,
            paneInnerR = center[3] / 2,
            r = len - high + paneInnerR,
            innerR = len - pick(low, len) + paneInnerR;
          if (this.yAxis.reversed) {
            if (r < 0) {
              r = paneInnerR;
            }
            if (innerR < 0) {
              innerR = paneInnerR;
            }
          }
          return {
            x: center[0],
            y: center[1],
            r: r,
            innerR: innerR,
            start: start,
            end: end,
          };
        };
        wrap(colProto, 'animate', polarAnimate);
        wrap(colProto, 'translate', function (proceed) {
          var series = this,
            options = series.options,
            threshold = options.threshold,
            stacking = options.stacking,
            chart = series.chart,
            xAxis = series.xAxis,
            yAxis = series.yAxis,
            reversed = yAxis.reversed,
            center = yAxis.center,
            startAngleRad = xAxis.startAngleRad,
            endAngleRad = xAxis.endAngleRad,
            visibleRange = endAngleRad - startAngleRad,
            thresholdAngleRad,
            points,
            point,
            i,
            yMin,
            yMax,
            start,
            end,
            tooltipPos,
            pointX,
            pointY,
            stackValues,
            stack,
            barX,
            innerR,
            r;
          series.preventPostTranslate = true;
          proceed.call(series);
          if (xAxis.isRadial) {
            points = series.points;
            i = points.length;
            yMin = yAxis.translate(yAxis.min);
            yMax = yAxis.translate(yAxis.max);
            threshold = options.threshold || 0;
            if (chart.inverted) {
              if (isNumber(threshold)) {
                thresholdAngleRad = yAxis.translate(threshold);
                if (defined(thresholdAngleRad)) {
                  if (thresholdAngleRad < 0) {
                    thresholdAngleRad = 0;
                  } else if (thresholdAngleRad > visibleRange) {
                    thresholdAngleRad = visibleRange;
                  }
                  series.translatedThreshold =
                    thresholdAngleRad + startAngleRad;
                }
              }
            }
            while (i--) {
              point = points[i];
              barX = point.barX;
              pointX = point.x;
              pointY = point.y;
              point.shapeType = 'arc';
              if (chart.inverted) {
                point.plotY = yAxis.translate(pointY);
                if (stacking && yAxis.stacking) {
                  stack =
                    yAxis.stacking.stacks[
                      (pointY < 0 ? '-' : '') + series.stackKey
                    ];
                  if (series.visible && stack && stack[pointX]) {
                    if (!point.isNull) {
                      stackValues =
                        stack[pointX].points[
                          series.getStackIndicator(void 0, pointX, series.index)
                            .key
                        ];
                      start = yAxis.translate(stackValues[0]);
                      end = yAxis.translate(stackValues[1]);
                      if (defined(start)) {
                        start = U.clamp(start, 0, visibleRange);
                      }
                    }
                  }
                } else {
                  start = thresholdAngleRad;
                  end = point.plotY;
                }
                if (start > end) {
                  end = [start, (start = end)][0];
                }
                if (!reversed) {
                  if (start < yMin) {
                    start = yMin;
                  } else if (end > yMax) {
                    end = yMax;
                  } else if (end < yMin || start > yMax) {
                    start = end = 0;
                  }
                } else {
                  if (end > yMin) {
                    end = yMin;
                  } else if (start < yMax) {
                    start = yMax;
                  } else if (start > yMin || end < yMax) {
                    start = end = visibleRange;
                  }
                }
                if (yAxis.min > yAxis.max) {
                  start = end = reversed ? visibleRange : 0;
                }
                start += startAngleRad;
                end += startAngleRad;
                if (center) {
                  point.barX = barX += center[3] / 2;
                }
                innerR = Math.max(barX, 0);
                r = Math.max(barX + point.pointWidth, 0);
                point.shapeArgs = {
                  x: center && center[0],
                  y: center && center[1],
                  r: r,
                  innerR: innerR,
                  start: start,
                  end: end,
                };
                point.opacity = start === end ? 0 : void 0;
                point.plotY =
                  (defined(series.translatedThreshold) &&
                    (start < series.translatedThreshold ? start : end)) -
                  startAngleRad;
              } else {
                start = barX + startAngleRad;
                point.shapeArgs = series.polarArc(
                  point.yBottom,
                  point.plotY,
                  start,
                  start + point.pointWidth
                );
              }
              series.toXY(point);
              if (chart.inverted) {
                tooltipPos = yAxis.postTranslate(
                  point.rectPlotY,
                  barX + point.pointWidth / 2
                );
                point.tooltipPos = [
                  tooltipPos.x - chart.plotLeft,
                  tooltipPos.y - chart.plotTop,
                ];
              } else {
                point.tooltipPos = [point.plotX, point.plotY];
              }
              if (center) {
                point.ttBelow = point.plotY > center[1];
              }
            }
          }
        });
        colProto.findAlignments = function (angle, options) {
          var align, verticalAlign;
          if (options.align === null) {
            if (angle > 20 && angle < 160) {
              align = 'left';
            } else if (angle > 200 && angle < 340) {
              align = 'right';
            } else {
              align = 'center';
            }
            options.align = align;
          }
          if (options.verticalAlign === null) {
            if (angle < 45 || angle > 315) {
              verticalAlign = 'bottom';
            } else if (angle > 135 && angle < 225) {
              verticalAlign = 'top';
            } else {
              verticalAlign = 'middle';
            }
            options.verticalAlign = verticalAlign;
          }
          return options;
        };
        if (arearangeProto) {
          arearangeProto.findAlignments = colProto.findAlignments;
        }
        wrap(
          colProto,
          'alignDataLabel',
          function (proceed, point, dataLabel, options, alignTo, isNew) {
            var chart = this.chart,
              inside = pick(options.inside, !!this.options.stacking),
              angle,
              shapeArgs,
              labelPos;
            if (chart.polar) {
              angle = (point.rectPlotX / Math.PI) * 180;
              if (!chart.inverted) {
                if (this.findAlignments) {
                  options = this.findAlignments(angle, options);
                }
              } else {
                this.forceDL = chart.isInsidePlot(
                  point.plotX,
                  Math.round(point.plotY),
                  false
                );
                if (inside && point.shapeArgs) {
                  shapeArgs = point.shapeArgs;
                  labelPos = this.yAxis.postTranslate(
                    (shapeArgs.start + shapeArgs.end) / 2 -
                      this.xAxis.startAngleRad,
                    point.barX + point.pointWidth / 2
                  );
                  alignTo = {
                    x: labelPos.x - chart.plotLeft,
                    y: labelPos.y - chart.plotTop,
                  };
                } else if (point.tooltipPos) {
                  alignTo = {
                    x: point.tooltipPos[0],
                    y: point.tooltipPos[1],
                  };
                }
                options.align = pick(options.align, 'center');
                options.verticalAlign = pick(options.verticalAlign, 'middle');
              }
              seriesProto.alignDataLabel.call(
                this,
                point,
                dataLabel,
                options,
                alignTo,
                isNew
              );
              if (
                this.isRadialBar &&
                point.shapeArgs &&
                point.shapeArgs.start === point.shapeArgs.end
              ) {
                dataLabel.hide(true);
              }
            } else {
              proceed.call(this, point, dataLabel, options, alignTo, isNew);
            }
          }
        );
      }
      wrap(pointerProto, 'getCoordinates', function (proceed, e) {
        var chart = this.chart,
          ret = {
            xAxis: [],
            yAxis: [],
          };
        if (chart.polar) {
          chart.axes.forEach(function (axis) {
            var isXAxis = axis.isXAxis,
              center = axis.center,
              x,
              y;
            if (axis.coll === 'colorAxis') {
              return;
            }
            x = e.chartX - center[0] - chart.plotLeft;
            y = e.chartY - center[1] - chart.plotTop;
            ret[isXAxis ? 'xAxis' : 'yAxis'].push({
              axis: axis,
              value: axis.translate(
                isXAxis
                  ? Math.PI - Math.atan2(x, y)
                  : Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),
                true
              ),
            });
          });
        } else {
          ret = proceed.call(this, e);
        }
        return ret;
      });
      SVGRenderer.prototype.clipCircle = function (x, y, r, innerR) {
        var wrapper,
          id = uniqueKey(),
          clipPath = this.createElement('clipPath')
            .attr({
              id: id,
            })
            .add(this.defs);
        wrapper = innerR
          ? this.arc(x, y, r, innerR, 0, 2 * Math.PI).add(clipPath)
          : this.circle(x, y, r).add(clipPath);
        wrapper.id = id;
        wrapper.clipPath = clipPath;
        return wrapper;
      };
      addEvent(Chart, 'getAxes', function () {
        if (!this.pane) {
          this.pane = [];
        }
        splat(this.options.pane).forEach(function (paneOptions) {
          new Pane(paneOptions, this);
        }, this);
      });
      addEvent(Chart, 'afterDrawChartBox', function () {
        this.pane.forEach(function (pane) {
          pane.render();
        });
      });
      addEvent(H.Series, 'afterInit', function () {
        var chart = this.chart;
        if (chart.inverted && chart.polar) {
          this.isRadialSeries = true;
          if (this.is('column')) {
            this.isRadialBar = true;
          }
        }
      });
      wrap(Chart.prototype, 'get', function (proceed, id) {
        return (
          find(this.pane, function (pane) {
            return pane.options.id === id;
          }) || proceed.call(this, id)
        );
      });
    }
  );
  _registerModule(
    _modules,
    'masters/highcharts-more.src.js',
    [],
    function () {}
  );
});
