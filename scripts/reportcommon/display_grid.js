/*! RESOURCE: /scripts/reportcommon/display_grid.js */
function checkAndEnableDisplayGrid(chartData, args) {
  args.otherDisplay = 'Other';
  args.otherDisplayMore = '(more...)';
  if ('report_properties' in chartData) {
    args.otherDisplay = chartData.report_properties.other_display;
    args.otherDisplayMore = chartData.report_properties.other_display_more;
  }
  var $gridTable = getGridTable(args);
  var hasData =
    (chartData.series[0].xvalues && chartData.series[0].xvalues.length) ||
    args.chart_type === 'solid_gauge' ||
    args.chart_type === 'angular_gauge';
  if ($gridTable.length && hasData) {
    $gridTable.html(
      '<thead>' +
        '<tr class="header display_grid_header">' +
        '</tr>' +
        '</thead>' +
        '<tbody class="display_grid_body"/>'
    );
    enableDisplayGrid($gridTable, chartData, args);
  } else $gridTable.empty();
}
function enableDisplayGrid($gridTable, chartData, args) {
  if (args.chart_type === 'box' || args.chart_type === 'tbox')
    createBoxDisplayGrid($gridTable, chartData);
  else if (args.chart_type === 'control')
    showControlDisplayGrid($gridTable, chartData);
  else if (
    args.chart_type === 'solid_gauge' ||
    args.chart_type === 'angular_gauge'
  )
    createGaugeDisplayGrid($gridTable, chartData);
  else
    showDisplayGrid($gridTable, chartData, isTwoLevelDisplayGrid(args), args);
  if (args.display_grid) $gridTable.show();
  else $gridTable.hide();
  addAccessibility($gridTable, chartData, args);
}
function showDisplayGrid($gridTable, chartData, hasStacking, args) {
  var otherKey = 'zzyynomatchaabb';
  var $gridTableBody = getGridTableBody($gridTable);
  var yDispValsExist = false;
  if (chartData.series.length) {
    var seriesData = chartData.series[0];
    if ('ydisplayvalues' in seriesData && seriesData.ydisplayvalues !== '')
      yDispValsExist = true;
    var trClass = 'odd';
    var omitOther = false;
    if ('display_grid_xvalues' in seriesData) omitOther = true;
    if (seriesData.xvalues !== undefined && seriesData.xvalues.length) {
      createBasicDisplayGridHeader(
        $gridTable,
        seriesData,
        chartData.report_properties.percents_from_count,
        hasStacking
      );
      var multipleOther = false;
      for (var j = 0; j < seriesData.xvalues.length; j++) {
        var value = seriesData.xvalues[j];
        if (value === otherKey && omitOther)
          if (j === seriesData.xvalues.length - 1) break;
        if (value === args.otherDisplay && j < seriesData.xvalues.length - 1)
          multipleOther = true;
        if (value === otherKey) {
          if (multipleOther)
            value = args.otherDisplay + ' ' + args.otherDisplayMore;
          else value = args.otherDisplay;
        }
        if (yDispValsExist) var yVal = seriesData.ydisplayvalues[j];
        else yVal = seriesData.yvalues[j];
        if (yVal) {
          if (seriesData.span_dates && seriesData.span_dates[j])
            value += seriesData.span_dates[j];
          var row = createRowForGrid(
            trClass,
            value,
            yVal,
            seriesData.percentages[j],
            hasStacking,
            seriesData.total_label
          );
          if (trClass === 'odd') trClass = 'even';
          else trClass = 'odd';
          $gridTableBody.append(row);
        }
      }
      if ('display_grid_xvalues' in seriesData) {
        var additionalGridYDispValsExist = false;
        if ('display_grid_ydisplayvalues' in seriesData)
          additionalGridYDispValsExist = true;
        for (j = 0; j < seriesData.display_grid_xvalues.length; j++) {
          value = seriesData.display_grid_xvalues[j];
          yVal = null;
          if (additionalGridYDispValsExist)
            yVal = seriesData.display_grid_ydisplayvalues[j];
          else yVal = seriesData.display_grid_yvalues[j];
          if (yVal) {
            row = createRowForGrid(
              trClass,
              value,
              yVal,
              seriesData.display_grid_percents[j],
              hasStacking,
              seriesData.total_label
            );
            if (trClass === 'odd') trClass = 'even';
            else trClass = 'odd';
            $gridTableBody.append(row);
          }
        }
      }
      if (hasStacking)
        createTwoLevelDisplayGridTable(chartData, args, $gridTableBody);
      displayGridTotal(
        $gridTableBody,
        seriesData.display_grid_total,
        seriesData.total_label,
        hasStacking
      );
    }
  }
}
function addAccessibility($gridTable, chartData, args) {
  if (
    window.g_accessibility_screen_reader_table === 'true' ||
    window.g_accessibility_screen_reader_table === true
  ) {
    var $displayGridToggle = getGridExpandAnchor(args);
    var id = $gridTable.attr('id');
    var gwtMessage = window.GwtMessage
      ? new GwtMessage()
      : new SNC.reporting.L10nMessages();
    var buttonAriaLabel = gwtMessage.getMessage(
      'Toggles data grid for report {0}',
      chartData.title
    );
    if ($displayGridToggle.length) $displayGridToggle.remove();
    var imgAltTxt = gwtMessage.getMessage('Plus sign');
    var btnTitle = gwtMessage.getMessage('Chart data');
    var btnImage = 'images/section_hide.gifx';
    var isExpanded = args.display_grid;
    if (args.display_grid) {
      imgAltTxt = gwtMessage.getMessage('Minus sign');
      btnImage = 'images/section_reveal.gifx';
    }
    var toggleButton =
      '<button id="expand.' +
      id +
      '"' +
      ' tabindex="0"' +
      ' aria-controls="' +
      id +
      '"' +
      ' class="grid-toggle"' +
      ' aria-label="' +
      buttonAriaLabel +
      '"' +
      ' aria-expanded="' +
      isExpanded +
      '"' +
      ' onclick="toggleDisplayGrid(\'' +
      id +
      '\', this)">' +
      '</button>';
    $displayGridToggle = jQuery(toggleButton);
    $displayGridToggle.append(
      '<img src="' +
        btnImage +
        '" title="' +
        btnTitle +
        '" alt="' +
        imgAltTxt +
        '" width="16px" height="16px" />'
    );
    var $btnDiv = jQuery('<div></div>');
    $btnDiv.append($displayGridToggle);
    $gridTable.before($btnDiv);
    $gridTable.prepend(
      '<caption><b>' + chartData.series[0].display_grid_title + '</b></caption>'
    );
  }
}
function createTwoLevelDisplayGridTable(chartData, args, $body) {
  var additionalGridValuesExist = false;
  var seriesData = chartData.series[0];
  var subSeriesData = chartData.series[0].sub_series;
  if (subSeriesData && subSeriesData[0]) {
    createSecondLevelHeader(
      $body,
      seriesData,
      chartData.report_properties.percents_from_count
    );
    if (
      'display_grid_xvalues' in seriesData &&
      'dispGridSubSeries' in seriesData
    )
      additionalGridValuesExist = true;
    var isDuration = false;
    if ('yaxis_duration' in seriesData && seriesData.yaxis_duration)
      isDuration = true;
    createSecondLevelDisplayGrid(
      seriesData.xvalues,
      subSeriesData,
      isDuration,
      $body,
      args,
      additionalGridValuesExist,
      seriesData.span_dates
    );
    if (additionalGridValuesExist) {
      var dispGridSubSeries = chartData.series[0].dispGridSubSeries;
      createSecondLevelDisplayGrid(
        seriesData.display_grid_xvalues,
        dispGridSubSeries,
        isDuration,
        $body,
        args,
        additionalGridValuesExist,
        seriesData.span_dates
      );
    }
  }
}
function createSecondLevelDisplayGrid(
  xValues,
  subSeriesData,
  isDuration,
  $body,
  args,
  additionalGridValuesExist,
  span_dates
) {
  var otherKey = 'zzyynomatchaabb';
  var trClass = 'even';
  var multipleOther = false;
  for (var i = 0; i < subSeriesData.length; i++) {
    var firstLevelXVal = xValues[i];
    if (additionalGridValuesExist && firstLevelXVal === otherKey) {
      continue;
    }
    if (!additionalGridValuesExist) {
      if (firstLevelXVal === args.otherDisplay && i < xValues.length - 1)
        multipleOther = true;
      if (firstLevelXVal === otherKey) {
        if (multipleOther)
          firstLevelXVal = args.otherDisplay + ' ' + args.otherDisplayMore;
        else firstLevelXVal = args.otherDisplay;
      }
    }
    if (Array.isArray(span_dates) && span_dates[i])
      firstLevelXVal += span_dates[i];
    var curSubSeries = subSeriesData[i];
    if (curSubSeries) {
      var curSubSeriesHasYDispVals = false;
      if (
        'ydisplayvalues' in curSubSeries &&
        curSubSeries.ydisplayvalues !== ''
      )
        curSubSeriesHasYDispVals = true;
      for (var j = 0; j < curSubSeries.xvalues.length; j++) {
        var row = document.createElement('tr');
        row.className = trClass;
        var chartClass = 'chart';
        if (j === curSubSeries.xvalues.length - 1) chartClass = 'chart-spacer';
        if (j === 0)
          row.appendChild(
            createDisplayGridHeaderCell(
              'chart-spacer',
              firstLevelXVal,
              null,
              null,
              null,
              curSubSeries.xvalues.length
            )
          );
        xValue = curSubSeries.xvalues[j].displayValue;
        if (xValue === undefined) xValue = curSubSeries.xvalues[j];
        row.appendChild(createDisplayGridCell(chartClass, xValue));
        if (curSubSeriesHasYDispVals)
          row.appendChild(
            createDisplayGridCell(
              chartClass,
              curSubSeries.ydisplayvalues[j],
              'right'
            )
          );
        else
          row.appendChild(
            createDisplayGridCell(chartClass, curSubSeries.yvalues[j], 'right')
          );
        row.appendChild(
          createDisplayGridCell(
            chartClass,
            curSubSeries.percentages[j] + '%',
            'right'
          )
        );
        if (trClass === 'odd') trClass = 'even';
        else trClass = 'odd';
        $body.append(row);
      }
    }
    trClass = 'even';
  }
}
function createBasicDisplayGridHeader(
  $table,
  series,
  computePercent,
  hasStacking
) {
  var $header = getGridTableHeader($table);
  var totals = '';
  var colSpan = 1;
  if (hasStacking) {
    totals = ' ' + series.totals_label;
    colSpan = 2;
  }
  $header
    .append(
      createDisplayGridHeaderCell(
        'chart',
        series.group_by_label + totals,
        null,
        true,
        colSpan
      )
    )
    .append(
      createDisplayGridHeaderCell(
        'chart',
        series.yTitle + totals,
        'right',
        true
      )
    );
  var percentLabel = series.percentage_label + series.aggregate_label;
  if (computePercent || isPieType(series.series_plot_type))
    percentLabel = series.percentage_label + series.table_display_plural;
  $header.append(
    createDisplayGridHeaderCell('chart', percentLabel, 'right', true)
  );
  series.completePercentLabel = percentLabel;
}
function createSecondLevelHeader($body, series) {
  var $secondHeader = jQuery('<tr class="header display_grid_header"/>');
  $body.append($secondHeader);
  $secondHeader
    .append(
      createDisplayGridHeaderCell('chart', series.group_by_label, null, true)
    )
    .append(
      createDisplayGridHeaderCell(
        'chart',
        series.second_group_by_label,
        null,
        true
      )
    )
    .append(createDisplayGridHeaderCell('chart', series.yTitle, 'right', true))
    .append(
      createDisplayGridHeaderCell(
        'chart',
        series.completePercentLabel,
        'right',
        true
      )
    );
}
function createBoxDisplayGrid($gridTable, chartData) {
  if (chartData.series.length > 0) {
    var $gridTableBody = getGridTableBody($gridTable);
    var seriesData = chartData.series[0];
    var trClass = 'odd';
    var $header = getGridTableHeader($gridTable);
    $header
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.group_by_label,
          null,
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.mean_label,
          'right',
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.minimum_label,
          'right',
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.first_quartile_label,
          'right',
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.median_label,
          'right',
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.third_quartile_label,
          'right',
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.maximum_label,
          'right',
          true
        )
      );
    for (var j = 0; j < seriesData.xvalues.length; j++) {
      var row = document.createElement('tr');
      row.className = trClass;
      var value = seriesData.xvalues[j];
      var style = 'chart';
      var groupByStyle = 'chart';
      row.appendChild(createDisplayGridHeaderCell(groupByStyle, value));
      row.appendChild(
        createDisplayGridCell(style, seriesData.ydisplayvalues[j], 'right')
      );
      var boxDisplayVals = seriesData.boxdisplayvalues[j];
      for (var k = 0; k < 5; k++)
        row.appendChild(
          createDisplayGridCell(style, boxDisplayVals[k], 'right')
        );
      if (trClass === 'odd') trClass = 'even';
      else trClass = 'odd';
      $gridTableBody.append(row);
    }
  }
}
function showControlDisplayGrid($gridTable, chartData) {
  var $gridTableBody = getGridTableBody($gridTable);
  var isDuration = false;
  if (chartData.series.length > 0) {
    var seriesData = chartData.series[0];
    if ('yaxis_duration' in seriesData && seriesData.yaxis_duration)
      isDuration = true;
    var $header = getGridTableHeader($gridTable);
    $header
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.group_by_label +
            ' ' +
            seriesData.per +
            ' ' +
            seriesData.trend,
          null,
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.aggregate_label + ' ' + seriesData.data_points_label,
          'right',
          true
        )
      )
      .append(
        createDisplayGridHeaderCell(
          'chart',
          seriesData.aggregate_label + ' ' + seriesData.trend_line_label,
          'right',
          true
        )
      );
    var trClass = 'odd';
    for (var j = 0; j < seriesData.xvalues.length; j++) {
      row = document.createElement('tr');
      row.className = trClass;
      var style = 'chart';
      row.appendChild(createDisplayGridCell(style, seriesData.xvalues[j]));
      row.appendChild(
        createDisplayGridCell(style, seriesData.ydisplayvalues[j], 'right')
      );
      row.appendChild(
        createDisplayGridCell(
          style,
          isDuration === true
            ? seriesData.trenddisplayvalues[j]
            : seriesData.trendvalues[j],
          'right'
        )
      );
      $gridTableBody.append(row);
      if (trClass === 'odd') trClass = 'even';
      else trClass = 'odd';
    }
    var row = document.createElement('tr');
    row.className = 'header display_grid_header';
    row.appendChild(createDisplayGridHeaderCell(style, 'Control Values'));
    row.appendChild(
      createDisplayGridHeaderCell(style, seriesData.aggregate_label, 'right')
    );
    row.appendChild(createDisplayGridHeaderCell(style, ''));
    $gridTableBody.append(row);
    var standDev = seriesData.standard_deviation_label;
    row = document.createElement('tr');
    row.className = 'odd';
    row.appendChild(createDisplayGridCell(style, '-3 ' + standDev));
    row.appendChild(
      createDisplayGridCell(
        style,
        isDuration === true
          ? seriesData.controldisplayvalues[0]
          : seriesData.controlvalues[0],
        'right'
      )
    );
    row.appendChild(createDisplayGridCell(style, ''));
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'even';
    row.appendChild(createDisplayGridCell(style, '-2 ' + standDev));
    row.appendChild(
      createDisplayGridCell(
        style,
        isDuration === true
          ? seriesData.controldisplayvalues[1]
          : seriesData.controlvalues[1],
        'right'
      )
    );
    row.appendChild(createDisplayGridCell(style, ''));
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'odd';
    row.appendChild(createDisplayGridCell(style, seriesData.mean_label));
    row.appendChild(
      createDisplayGridCell(
        style,
        isDuration === true
          ? seriesData.controldisplayvalues[2]
          : seriesData.controlvalues[2],
        'right'
      )
    );
    row.appendChild(createDisplayGridCell(style, ''));
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'even';
    row.appendChild(createDisplayGridCell(style, '+2 ' + standDev));
    row.appendChild(
      createDisplayGridCell(
        style,
        isDuration === true
          ? seriesData.controldisplayvalues[3]
          : seriesData.controlvalues[3],
        'right'
      )
    );
    row.appendChild(createDisplayGridCell(style, ''));
    $gridTableBody.append(row);
    row = document.createElement('tr');
    row.className = 'odd';
    row.appendChild(createDisplayGridCell(style, '+3 ' + standDev));
    row.appendChild(
      createDisplayGridCell(
        style,
        isDuration === true
          ? seriesData.controldisplayvalues[4]
          : seriesData.controlvalues[4],
        'right'
      )
    );
    row.appendChild(createDisplayGridCell(style, ''));
    $gridTableBody.append(row);
  }
}
function createGaugeDisplayGrid($gridTable, chartData) {
  if (chartData.series.length) {
    var seriesData = chartData.series[0];
    var $gridTableBody = getGridTableBody($gridTable);
    var yDispValsExist;
    var $header = getGridTableHeader($gridTable);
    $header.append(
      createDisplayGridHeaderCell('chart', seriesData.yTitle, 'center', true)
    );
    if ('ydisplayvalues' in seriesData && seriesData.ydisplayvalues !== '')
      yDispValsExist = true;
    var row = document.createElement('tr');
    row.className = 'odd';
    var style = 'chart';
    var value;
    if (yDispValsExist) value = seriesData.ydisplayvalues;
    else value = seriesData.yvalues;
    row.appendChild(createDisplayGridCell(style, value, 'center'));
    $gridTableBody.append(row);
  }
}
function displayGridTotal($body, total, totalLabel, hasStacking) {
  var $totalRow = jQuery('<tr class="display-grid-total-row" />');
  $body.append($totalRow);
  var colSpan = 1;
  if (hasStacking) colSpan = 2;
  $totalRow
    .append(
      createDisplayGridHeaderCell(
        'chart_total',
        totalLabel,
        null,
        null,
        colSpan
      )
    )
    .append(createDisplayGridCell('chart_total', total, 'right'))
    .append(createDisplayGridCell('chart_total', '100%', 'right'));
}
function createRowForGrid(
  trClass,
  xVal,
  yVal,
  percent,
  hasStacking,
  totalLabel
) {
  var row = document.createElement('tr');
  row.className = trClass;
  var style = 'chart';
  var groupByStyle = 'chart';
  var colSpan = 1;
  if (hasStacking) {
    xVal += ' ' + totalLabel;
    style = 'chart_subtotal';
    groupByStyle = 'chart_subtotal_text';
    colSpan = 2;
  }
  row.appendChild(
    createDisplayGridHeaderCell(groupByStyle, xVal, null, null, colSpan)
  );
  row.appendChild(createDisplayGridCell(style, yVal, 'right'));
  if (percent && percent !== '')
    row.appendChild(createDisplayGridCell(style, percent + '%', 'right'));
  else row.appendChild(createDisplayGridCell(style, 'N/A', 'right'));
  return row;
}
function createDisplayGridHeaderCell(
  cssClass,
  value,
  alignment,
  isHead,
  colSpan,
  rowSpan
) {
  var gridCell = document.createElement('th');
  var scope = 'row';
  if (isHead) {
    scope = 'col';
  }
  gridCell.setAttribute('scope', scope);
  createDisplayGridCellCommon(
    gridCell,
    cssClass,
    value,
    alignment,
    colSpan,
    rowSpan
  );
  return gridCell;
}
function createDisplayGridCell(cssClass, value, alignment) {
  var gridCell = document.createElement('td');
  createDisplayGridCellCommon(gridCell, cssClass, value, alignment);
  return gridCell;
}
function createDisplayGridCellCommon(
  gridCell,
  cssClass,
  value,
  alignment,
  colSpan,
  rowSpan
) {
  gridCell.className = cssClass;
  gridCell.style.textAlign = 'left';
  if (alignment) gridCell.style.textAlign = alignment;
  if (colSpan) gridCell.setAttribute('colspan', colSpan);
  if (rowSpan) gridCell.setAttribute('rowspan', rowSpan);
  gridCell.appendChild(document.createTextNode(value));
}
function isDisplayGridApplicable(chartType) {
  if (
    chartType === 'bar' ||
    chartType === 'horizontal_bar' ||
    isPieType(chartType) ||
    chartType === 'line_bar' ||
    chartType === 'line' ||
    chartType === 'step_line' ||
    chartType === 'area' ||
    chartType === 'spline' ||
    chartType === 'availability' ||
    chartType === 'pareto' ||
    chartType === 'trend' ||
    chartType === 'map' ||
    chartType === 'solid_gauge' ||
    chartType === 'angular_gauge'
  )
    return true;
  return false;
}
function getGridTable(args) {
  return jQuery('#display-grid-table-' + args.report_uuid);
}
function getGridTableHeader($table) {
  return $table.find('.display_grid_header');
}
function getGridTableBody($table) {
  return $table.children('.display_grid_body');
}
function getGridExpandAnchor(args) {
  return jQuery('#expand\\.display_grid_table' + args.report_uuid);
}
function isTwoLevelDisplayGrid(args) {
  if (args.stacked_field !== '' && isBarType(args.chart_type)) return true;
  if (
    args.group_by !== '' &&
    (args.chart_type === 'trend' ||
      args.chart_type === 'line' ||
      args.chart_type === 'step_line' ||
      args.chart_type === 'area' ||
      args.chart_type === 'spline' ||
      args.chart_type === 'line_bar')
  )
    return true;
  return false;
}
function toggleDisplayGrid(name, target) {
  var tableEl = jQuery('#' + name);
  if (!tableEl) return;
  var gwtMessage = window.GwtMessage
    ? new GwtMessage()
    : new SNC.reporting.L10nMessages();
  var targetEl = jQuery(target);
  if (targetEl.attr('aria-expanded') === 'true') {
    tableEl.hide();
    targetEl
      .children()
      .attr('src', 'images/section_hide.gifx')
      .attr('alt', gwtMessage.getMessage('Plus sign'));
    targetEl.attr('aria-expanded', false);
  } else {
    tableEl.show();
    targetEl
      .children()
      .attr('src', 'images/section_reveal.gifx')
      .attr('alt', gwtMessage.getMessage('Minus sign'));
    targetEl.attr('aria-expanded', true);
  }
}
if (!window.SNC) SNC = {};
if (!window.SNC.reporting) SNC.reporting = {};
SNC.reporting.L10nMessages = function () {
  function format() {
    var s = arguments[0];
    var i = arguments.length;
    while (--i) {
      s = s.replace('{' + (i - 1) + '}', arguments[i]);
    }
    return s;
  }
  function getMessage() {
    return String.format
      ? String.format.apply(null, arguments)
      : format.apply(null, arguments);
  }
  return {
    getMessage: getMessage,
  };
};
