/*! RESOURCE: /scripts/highcharts/modules/pattern-fill.js */
(function (c) {
  'object' === typeof module && module.exports
    ? ((c['default'] = c), (module.exports = c))
    : 'function' === typeof define && define.amd
    ? define('highcharts/modules/pattern-fill', ['highcharts'], function (f) {
        c(f);
        c.Highcharts = f;
        return c;
      })
    : c('undefined' !== typeof Highcharts ? Highcharts : void 0);
})(function (c) {
  function f(c, f, p, n) {
    c.hasOwnProperty(f) || (c[f] = n.apply(null, p));
  }
  c = c ? c._modules : {};
  f(
    c,
    'Extensions/PatternFill.js',
    [
      c['Core/Animation/AnimationUtilities.js'],
      c['Core/Chart/Chart.js'],
      c['Core/Globals.js'],
      c['Core/Series/Point.js'],
      c['Core/Renderer/SVG/SVGRenderer.js'],
      c['Core/Utilities.js'],
    ],
    function (c, f, p, n, r, e) {
      function t(a, b) {
        a = JSON.stringify(a);
        var c = a.length || 0,
          g = 0,
          d = 0;
        if (b) {
          b = Math.max(Math.floor(c / 500), 1);
          for (var m = 0; m < c; m += b) g += a.charCodeAt(m);
          g &= g;
        }
        for (; d < c; ++d)
          (b = a.charCodeAt(d)), (g = (g << 5) - g + b), (g &= g);
        return g.toString(16).replace('-', '1');
      }
      var w = c.animObject;
      c = e.addEvent;
      var x = e.erase,
        y = e.getOptions,
        u = e.merge,
        q = e.pick,
        z = e.removeEvent;
      e = e.wrap;
      ('');
      var v = (function () {
        var a = [],
          b = y().colors;
        'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11;M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9;M 3 0 L 3 10 M 8 0 L 8 10;M 0 3 L 10 3 M 0 8 L 10 8;M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7;M 3 3 L 8 3 L 8 8 L 3 8 Z;M 5 5 m -4 0 a 4 4 0 1 1 8 0 a 4 4 0 1 1 -8 0;M 10 3 L 5 3 L 5 0 M 5 10 L 5 7 L 0 7;M 2 5 L 5 2 L 8 5 L 5 8 Z;M 0 0 L 5 10 L 10 0'
          .split(';')
          .forEach(function (c, g) {
            a.push({ path: c, color: b[g], width: 10, height: 10 });
          });
        return a;
      })();
      n.prototype.calculatePatternDimensions = function (a) {
        if (!a.width || !a.height) {
          var b =
              (this.graphic &&
                ((this.graphic.getBBox && this.graphic.getBBox(!0)) ||
                  (this.graphic.element && this.graphic.element.getBBox()))) ||
              {},
            c = this.shapeArgs;
          c &&
            ((b.width = c.width || b.width),
            (b.height = c.height || b.height),
            (b.x = c.x || b.x),
            (b.y = c.y || b.y));
          if (a.image) {
            if (!b.width || !b.height) {
              a._width = 'defer';
              a._height = 'defer';
              return;
            }
            a.aspectRatio &&
              ((b.aspectRatio = b.width / b.height),
              a.aspectRatio > b.aspectRatio
                ? (b.aspectWidth = b.height * a.aspectRatio)
                : (b.aspectHeight = b.width / a.aspectRatio));
            a._width = a.width || Math.ceil(b.aspectWidth || b.width);
            a._height = a.height || Math.ceil(b.aspectHeight || b.height);
          }
          a.width ||
            ((a._x = a.x || 0),
            (a._x +=
              b.x -
              Math.round(
                b.aspectWidth ? Math.abs(b.aspectWidth - b.width) / 2 : 0
              )));
          a.height ||
            ((a._y = a.y || 0),
            (a._y +=
              b.y -
              Math.round(
                b.aspectHeight ? Math.abs(b.aspectHeight - b.height) / 2 : 0
              )));
        }
      };
      r.prototype.addPattern = function (a, b) {
        b = q(b, !0);
        var c = w(b),
          g = a.width || a._width || 32,
          d = a.height || a._height || 32,
          m = a.color || '#343434',
          k = a.id,
          f = this,
          e = function (a) {
            f.rect(0, 0, g, d).attr({ fill: a }).add(l);
          };
        k ||
          ((this.idCounter = this.idCounter || 0),
          (k =
            'highcharts-pattern-' +
            this.idCounter +
            '-' +
            (this.chartIndex || 0)),
          ++this.idCounter);
        this.forExport && (k += '-export');
        this.defIds = this.defIds || [];
        if (!(-1 < this.defIds.indexOf(k))) {
          this.defIds.push(k);
          var h = {
            id: k,
            patternUnits: 'userSpaceOnUse',
            patternContentUnits: a.patternContentUnits || 'userSpaceOnUse',
            width: g,
            height: d,
            x: a._x || a.x || 0,
            y: a._y || a.y || 0,
          };
          a.patternTransform && (h.patternTransform = a.patternTransform);
          var l = this.createElement('pattern').attr(h).add(this.defs);
          l.id = k;
          a.path
            ? ((h = a.path),
              a.backgroundColor && e(a.backgroundColor),
              (e = { d: h.d || h }),
              this.styledMode ||
                ((e.stroke = h.stroke || m),
                (e['stroke-width'] = q(h.strokeWidth, 2)),
                (e.fill = h.fill || 'none')),
              h.transform && (e.transform = h.transform),
              this.createElement('path').attr(e).add(l),
              (l.color = m))
            : a.image &&
              (b
                ? this.image(a.image, 0, 0, g, d, function () {
                    this.animate({ opacity: q(a.opacity, 1) }, c);
                    z(this.element, 'load');
                  })
                    .attr({ opacity: 0 })
                    .add(l)
                : this.image(a.image, 0, 0, g, d).add(l));
          (a.image && b) ||
            'undefined' === typeof a.opacity ||
            [].forEach.call(l.element.childNodes, function (b) {
              b.setAttribute('opacity', a.opacity);
            });
          this.patternElements = this.patternElements || {};
          return (this.patternElements[k] = l);
        }
      };
      e(p.Series.prototype, 'getColor', function (a) {
        var b = this.options.color;
        b && b.pattern && !b.pattern.color
          ? (delete this.options.color,
            a.apply(this, Array.prototype.slice.call(arguments, 1)),
            (b.pattern.color = this.color),
            (this.color = this.options.color = b))
          : a.apply(this, Array.prototype.slice.call(arguments, 1));
      });
      c(p.Series, 'render', function () {
        var a = this.chart.isResizing;
        (this.isDirtyData || a || !this.chart.hasRendered) &&
          (this.points || []).forEach(function (b) {
            var c = b.options && b.options.color;
            c &&
              c.pattern &&
              (!a || (b.shapeArgs && b.shapeArgs.width && b.shapeArgs.height)
                ? b.calculatePatternDimensions(c.pattern)
                : ((c.pattern._width = 'defer'),
                  (c.pattern._height = 'defer')));
          });
      });
      c(n, 'afterInit', function () {
        var a = this.options.color;
        a &&
          a.pattern &&
          ('string' === typeof a.pattern.path &&
            (a.pattern.path = { d: a.pattern.path }),
          (this.color = this.options.color = u(this.series.options.color, a)));
      });
      c(r, 'complexColor', function (a) {
        var b = a.args[0],
          c = a.args[1];
        a = a.args[2];
        var g = this.chartIndex || 0,
          d = b.pattern,
          e = '#343434';
        'undefined' !== typeof b.patternIndex && v && (d = v[b.patternIndex]);
        if (!d) return !0;
        if (d.image || 'string' === typeof d.path || (d.path && d.path.d)) {
          var f = a.parentNode && a.parentNode.getAttribute('class');
          f = f && -1 < f.indexOf('highcharts-legend');
          ('defer' !== d._width && 'defer' !== d._height) ||
            n.prototype.calculatePatternDimensions.call(
              { graphic: { element: a } },
              d
            );
          if (f || !d.id)
            (d = u({}, d)),
              (d.id = 'highcharts-pattern-' + g + '-' + t(d) + t(d, !0));
          this.addPattern(
            d,
            !this.forExport &&
              q(d.animation, this.globalAnimation, { duration: 100 })
          );
          e =
            'url(' +
            this.url +
            '#' +
            (d.id + (this.forExport ? '-export' : '')) +
            ')';
        } else e = d.color || e;
        a.setAttribute(c, e);
        b.toString = function () {
          return e;
        };
        return !1;
      });
      c(f, 'endResize', function () {
        ((this.renderer && this.renderer.defIds) || []).filter(function (a) {
          return a && a.indexOf && 0 === a.indexOf('highcharts-pattern-');
        }).length &&
          (this.series.forEach(function (a) {
            a.points.forEach(function (a) {
              (a = a.options && a.options.color) &&
                a.pattern &&
                ((a.pattern._width = 'defer'), (a.pattern._height = 'defer'));
            });
          }),
          this.redraw(!1));
      });
      c(f, 'redraw', function () {
        var a = {},
          b = this.renderer,
          c = (b.defIds || []).filter(function (a) {
            return a.indexOf && 0 === a.indexOf('highcharts-pattern-');
          });
        c.length &&
          ([].forEach.call(
            this.renderTo.querySelectorAll(
              '[color^="url("], [fill^="url("], [stroke^="url("]'
            ),
            function (c) {
              if (
                (c =
                  c.getAttribute('fill') ||
                  c.getAttribute('color') ||
                  c.getAttribute('stroke'))
              )
                (c = c
                  .replace(b.url, '')
                  .replace('url(#', '')
                  .replace(')', '')),
                  (a[c] = !0);
            }
          ),
          c.forEach(function (c) {
            a[c] ||
              (x(b.defIds, c),
              b.patternElements[c] &&
                (b.patternElements[c].destroy(), delete b.patternElements[c]));
          }));
      });
    }
  );
  f(c, 'masters/modules/pattern-fill.src.js', [], function () {});
});