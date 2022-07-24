/*! RESOURCE: /scripts/reportcommon/hc_legend_extension.js */
(function extendHCLegend($, Highcharts) {
  var HIDDEN_SERIES = 'hidden-series';
  Highcharts.wrap(
    Highcharts.Legend.prototype,
    'init',
    function replaceDefaultLegendWithStatsTable(proceed, chart) {
      if (
        chart.options.legend.statsTable &&
        chart.options.legend.statsTable.active
      )
        chart.options.legend.enabled = false;
      proceed.apply(this, Array.prototype.slice.call(arguments, 1));
      if (
        !chart.options.legend.statsTable ||
        !chart.options.legend.statsTable.active
      )
        return;
      chart.options.legend.height = 100;
      var $container = $(chart.container);
      var maxLegendWidth = chart.options.legend.width
        ? chart.options.legend.width
        : chart.options.chart.width - 10;
      var tableWidth = maxLegendWidth - 25;
      var expanded = false;
      var $htmlLegend = $(
        '<div><table style="border-spacing: 0 !important;">' +
          '<thead>' +
          '<tr>' +
          '<th class="number">' +
          '</th>' +
          '<th class="symbol">' +
          '</th>' +
          '<th class="series-name"></th>' +
          '<th class="controls"></th>' +
          '<th class="max">Max</th>' +
          '<th class="min">Min</th>' +
          '<th class="average">Avg</th>' +
          '<th class="total">Total</th>' +
          '</tr>' +
          '</thead>' +
          '<tbody></tbody>' +
          '</table></div>'
      )
        .addClass('stats-table')
        .css('max-width', maxLegendWidth)
        .css('height', chart.options.legend.height)
        .find('table')
        .css('max-width', tableWidth >= 450 ? tableWidth : 450)
        .css('min-width', 450)
        .end();
      var series = chart.series;
      for (var i = series.length - 1; i >= 0; i--) {
        var serie = series[i];
        $(
          '<tr>' +
            '<td class="number"></td>' +
            '<td class="symbol">' +
            '<div class="symbol"></div>' +
            '</td>' +
            '<td class="series-name"></td>' +
            '<td class="controls">' +
            '<button class="hide-others btn btn-default btn-xs">Hide Others</button>' +
            '<button class="hide-self btn btn-default btn-xs">Hide Self</button>' +
            '</td>' +
            '<td class="max">' +
            '</td>' +
            '<td class="min">' +
            '</td>' +
            '<td class="average">' +
            '</td>' +
            '<td class="total">' +
            '</td>' +
            '</tr>'
        )
          .find('td.number')
          .text(series.length - i + '.')
          .end()
          .find('td.series-name')
          .text(serie.name)
          .each(returnGenerateLinkIfDefined(serie))
          .end()
          .find('div.symbol')
          .css('background-color', serie.color)
          .end()
          .find('button.hide-others')
          .on('click', returnHideOtherSeries(serie))
          .end()
          .find('button.hide-self')
          .on('click', returnHideSelf(serie))
          .end()
          .find('td.max')
          .text(serie.options.max)
          .end()
          .find('td.min')
          .text(serie.options.min)
          .end()
          .find('td.average')
          .text(serie.options.average.toFixed(2))
          .end()
          .find('td.total')
          .text(serie.options.total)
          .end()
          .find('td.max, td.min, td.average, td.total')
          .each(returnAppendUnitIfDefined(serie))
          .end()
          .hover(returnHighlightSeries(serie), returnUnhighlightSeries(serie))
          .appendTo($htmlLegend.find('tbody'));
      }
      $container.after($htmlLegend);
    }
  );
  function returnHideSelf(serie) {
    return function hideSelf(event) {
      var $thisRow = $(this).closest('tr');
      event.stopPropagation();
      serie.setVisible();
      if (serie.visible) $thisRow.removeClass(HIDDEN_SERIES);
      else $thisRow.addClass(HIDDEN_SERIES);
    };
  }
  function returnHideOtherSeries(serie) {
    return function hideOtherSeries(event) {
      event.stopPropagation();
      var series = serie.chart.series;
      var $this = $(this);
      var $thisRow = $(this).closest('tr');
      var $allRows = $this.closest('table').find('tr');
      if (serie.onlyVisible) {
        serie.onlyVisible = false;
        for (var i = 0; i < series.length; i++)
          series[i].setVisible(true, false);
      } else {
        serie.onlyVisible = true;
        for (var i = 0; i < series.length; i++) {
          var possiblyOurSeries = series[i];
          if (possiblyOurSeries !== serie) {
            possiblyOurSeries.setVisible(false, false);
            possiblyOurSeries.onlyVisible = false;
          } else possiblyOurSeries.setVisible(true, false);
        }
      }
      serie.chart.redraw();
      if (serie.onlyVisible) {
        $thisRow.removeClass(HIDDEN_SERIES);
        $allRows.not($thisRow).addClass(HIDDEN_SERIES);
      } else $allRows.removeClass(HIDDEN_SERIES);
    };
  }
  function returnHighlightSeries(serie) {
    return function higlightSeries() {
      serie.setState('hover');
    };
  }
  function returnUnhighlightSeries(serie) {
    return function higlightSeries() {
      serie.setState('');
    };
  }
  function returnGenerateLinkIfDefined(serie) {
    return function generateLinkIfDefined() {
      if (serie.chart.options.legend.statsTable.seriesLinkGenerator) {
        $(this).wrapInner(
          '<a href="' +
            serie.chart.options.legend.statsTable.seriesLinkGenerator(serie) +
            '"></a>'
        );
      }
    };
  }
  function returnAppendUnitIfDefined(serie) {
    return function appendUnitIfDefined() {
      var $this = $(this);
      if (serie.chart.options.legend.statsTable.unit) {
        $this.text($this.text() + serie.chart.options.legend.statsTable.unit);
      }
    };
  }
})(jQuery, Highcharts);
