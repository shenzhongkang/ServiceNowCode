/*! RESOURCE: /scripts/reportcommon/buildhcoptions.js */
function sanitizeHTMLContent(text) {
  var whitelistTags = ['b', 'br', 'span', 'div'];
  var tagsRegex = /<\/?([a-z]+)[^>]*>/gi;
  var sanitizedContent = text.replace(tagsRegex, function (snippet, tag) {
    if (whitelistTags.indexOf(tag.toLowerCase()) == -1) {
      return escapeHTML(snippet);
    }
    return snippet;
  });
  return sanitizedContent;
}
function hc_configureChartProportions(
  chartType,
  chartData,
  hcOptions,
  isGauge,
  isUI
) {
  hc_configureLegendAlignment(
    chartType,
    chartData.report_properties,
    hcOptions,
    isGauge,
    isUI
  );
  if (chartData.report_properties.is_polaris_enabled == 'true') {
    hc_setLegendPolarisStyle(chartData.report_properties, hcOptions);
  }
  if (hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.plotOptions.column = {};
    var closestPointRange = hc_differenceOfClosestStringDateTimesInSeries(
      chartData.series[0].xvalues
    );
    if (closestPointRange !== 0)
      hcOptions.plotOptions.column.pointRange = closestPointRange;
  }
}
function hc_configureLegendAlignment(
  chartType,
  reportProperties,
  hcOptions,
  isGauge,
  isUI
) {
  var legendVerticalAlign = reportProperties.legend_vertical_alignment;
  var legendHorizontalAlign = reportProperties.legend_horizontal_alignment;
  var legendItemsLeftAlign = reportProperties.legend_items_left_align;
  var hasLegend = hcOptions.legend.enabled;
  var titleVerticalAlign = reportProperties.title_vertical_alignment;
  var showChartTitle =
    !reportProperties.custom_chart_title_position &&
    (reportProperties.show_chart_title === 'always' ||
      (!isGauge && reportProperties.show_chart_title === 'report'));
  var titleSize = Number(reportProperties.chart_title_size);
  var chartWidth = Number(hcOptions.chart.width);
  var chartHeight = Number(hcOptions.chart.height);
  if (hasLegend) {
    if (legendHorizontalAlign === 'right') {
      if (legendVerticalAlign === 'top') {
        hcOptions.legend.y = 25;
      } else if (legendVerticalAlign === 'bottom') {
        hcOptions.legend.maxHeight = chartHeight - 70;
      } else if (legendVerticalAlign === 'middle') {
        hcOptions.legend.maxHeight = chartHeight - 100;
      }
    } else if (legendHorizontalAlign === 'center') {
      if (
        legendItemsLeftAlign ||
        chartType === 'heatmap' ||
        chartType === 'map'
      )
        hcOptions.legend.width = chartWidth - 20;
      if (isUI) hcOptions.legend.maxHeight = chartHeight / 6;
      if (chartType === 'heatmap' || chartType === 'map') {
        hcOptions.legend.symbolWidth = hcOptions.legend.width - 10;
        hcOptions.legend.maxHeight = '';
      }
      if (legendVerticalAlign === 'top') {
        hcOptions.legend.y = -2;
        if (showChartTitle && titleVerticalAlign === 'top')
          hcOptions.legend.y = titleSize + 10;
      }
    }
    if (
      legendVerticalAlign === 'bottom' &&
      showChartTitle &&
      titleVerticalAlign === 'bottom'
    ) {
      hcOptions.legend.y = 0 - (titleSize + 10);
    }
  }
  if (
    (!hasLegend ||
      legendHorizontalAlign !== 'center' ||
      legendVerticalAlign !== 'bottom') &&
    showChartTitle &&
    titleVerticalAlign === 'bottom' &&
    chartType !== 'solid_gauge'
  ) {
    if (
      chartType === 'pie' ||
      chartType === 'donut' ||
      chartType === 'semi_donut' ||
      chartType === 'angular_gauge'
    )
      hcOptions.chart.marginBottom = titleSize;
    else if (chartType === 'funnel' || chartType === 'pyramid')
      hcOptions.chart.marginBottom = titleSize + 40;
    else hcOptions.chart.marginBottom = titleSize + 75;
  }
}
function hc_setLegendPolarisStyle(reportProps, hcOptions) {
  if (hcOptions.legend.enabled) {
    hcOptions.legend.itemStyle = {};
    hcOptions.legend.itemStyle.color = reportProps.legend_item_style_color;
    hcOptions.legend.itemStyle.fontSize =
      reportProps.legend_item_style_font_size;
  }
}
function hc_setLegendLabelFormatter(hcOptions, isUI, isPercent) {
  var isCentered = hcOptions.legend.align === 'center';
  if (isUI) {
    if (isCentered && isPercent) {
      hcOptions.legend.labelFormatter = hc_legendLabelPercentFormatter;
    } else if (!isCentered) {
      if (isPercent) {
        hcOptions.legend.labelFormatter =
          hc_legendLabelShortenedPercentFormatter;
      } else {
        hcOptions.legend.labelFormatter = hc_legendLabelShortenedFormatter;
      }
    }
  } else {
    if (isCentered) {
      if (isPercent) {
        hcOptions.legend.labelFormatter = 'hc_legendLabelPercentFormatter';
      }
    } else {
      if (isPercent) {
        hcOptions.legend.labelFormatter =
          'hc_legendLabelShortenedPercentFormatter';
      } else {
        hcOptions.legend.labelFormatter = 'hc_legendLabelShortenedFormatter';
      }
    }
  }
}
function hc_generateChartOptions(
  chartType,
  chartData,
  aggType,
  stackedField,
  chartHeight,
  chartWidth,
  chartSize,
  isRtl,
  formattingConfiguration,
  columnName,
  datasetsFormattingConfiguration
) {
  var hcOptions = {};
  var chartProps = hc_initDefaultChartOptions(
    hcOptions,
    chartData,
    chartType,
    chartSize,
    false,
    false,
    '',
    aggType,
    stackedField,
    false,
    chartHeight,
    chartWidth,
    isRtl
  );
  hc_sanitizeXValues(chartData, chartProps);
  hc_setLegendLabelFormatter(hcOptions, false, false);
  chartProps.formattingConfiguration = formattingConfiguration;
  chartProps.agg_field = columnName;
  chartProps.datasetsFormattingConfiguration = datasetsFormattingConfiguration;
  if (chartType == 'bubble') {
    hcOptions.series = hc_createBubbleSeriesData(chartData, chartProps, true);
    hcOptions.xAxis = chartData.series[0].xAxis;
    hcOptions.yAxis = chartData.series[0].yAxis;
    hc_addBubbleChartOptions(
      hcOptions,
      true,
      chartData.series[0].legend.enabled
    );
  } else if (chartType == 'heatmap') {
    var curSeries = hc_createHeatmapSeriesData(chartData, chartProps, true);
    hcOptions.series.push(curSeries);
    hc_addHeatmapChartOptions(
      hcOptions,
      chartProps,
      true,
      chartData,
      curSeries
    );
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, true);
    hc_addHeatmapAxisCategories(hcOptions, chartData);
  } else if (
    chartType == 'pie' ||
    chartType == 'semi_donut' ||
    chartType == 'donut'
  ) {
    hc_addPieChartOptions(
      hcOptions,
      chartProps,
      false,
      chartType == 'semi_donut'
    );
    var curSeries = hc_createSingleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    if (chartType == 'semi_donut' || chartType == 'donut') {
      curSeries.innerSize =
        100 - chartProps.report_properties.donut_width_percent + '%';
      if (chartProps.report_properties.show_chart_total)
        hc_addTotal(hcOptions, chartProps, curSeries, chartData, false);
    }
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'funnel') {
    hc_addFunnelChartOptions(hcOptions, chartProps, false, chartData);
    var curSeries = hc_createSingleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'pyramid') {
    hc_addPyramidChartOptions(hcOptions, chartProps, false, chartData);
    var curSeries = hc_createSingleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'angular_gauge' || chartType == 'solid_gauge') {
    hc_addGaugeChartOptions(
      hcOptions,
      chartProps,
      chartData,
      hc_getHighChartsType(chartType),
      false
    );
    var curSeries = hc_createSingleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(curSeries);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'bar' || chartType == 'horizontal_bar') {
    if (stackedField == '')
      hc_addBarChartOptions(
        hcOptions,
        chartProps,
        chartData,
        hc_getHighChartsType(chartType),
        false
      );
    else
      hc_addStackedBarChartOptions(
        hcOptions,
        chartProps,
        chartData,
        hc_getHighChartsType(chartType),
        false
      );
    var series;
    series = hc_createMultipleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series = series;
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'hist') {
    hc_addHistogramOptions(hcOptions, chartProps, chartData, false);
    var curSeries = hc_createSingleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(curSeries);
  } else if (chartType == 'pareto') {
    hc_addBarChartOptions(hcOptions, chartProps, chartData, 'column', false);
    var series0 = hc_createSingleSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(series0);
    var cumulative_series = hc_createParetoCumulSeries(
      hcOptions,
      chartProps,
      series0,
      false
    );
    hcOptions.series.push(cumulative_series);
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'control') {
    hc_addControlChartOptions(hcOptions, chartProps, chartData, false);
    hcOptions.series = hc_createControlSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'box' || chartType == 'tbox') {
    hc_addBoxChartOptions(hcOptions, chartProps, chartData, false);
    var boxSeries = hc_createBoxPlotData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(boxSeries);
    var meanSeries = hc_createBoxMeanData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hcOptions.series.push(meanSeries);
  } else if (chartType == 'trend') {
    var curSeries;
    if ('sub_series' in chartData.series[0]) {
      hc_addStackedBarChartOptions(
        hcOptions,
        chartProps,
        chartData,
        hc_getHighChartsType(chartType),
        false
      );
      hcOptions.series = hc_createMultipleSeriesData(
        hcOptions,
        chartData,
        chartProps,
        false
      );
    } else {
      hc_addBarChartOptions(
        hcOptions,
        chartProps,
        chartData,
        hc_getHighChartsType(chartType),
        false
      );
      curSeries = hc_createSingleSeriesData(
        hcOptions,
        chartData,
        chartProps,
        false
      );
      hcOptions.series.push(curSeries);
    }
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (isLineType(chartType) || chartType == 'availability') {
    if (chartType == 'availability')
      hc_addAvailChartOptions(hcOptions, chartProps, chartData, false);
    else
      hc_addLineChartOptions(
        hcOptions,
        chartProps,
        chartData,
        false,
        chartType
      );
    hcOptions.series = hc_createLineSeriesData(
      hcOptions,
      chartData,
      chartProps,
      false
    );
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, false);
  } else if (chartType == 'map') {
    hc_addMapChartOptions(hcOptions, chartProps, false, chartData);
    var curSeries = hc_createMapSeriesData(
      hcOptions,
      chartData,
      chartProps,
      true
    );
    hcOptions.series = curSeries;
    hc_addDataLabelOptions(hcOptions, chartProps, chartData, chartType, true);
    hc_updateDataLabelOptionsGeographical(hcOptions, chartData, chartType);
    hc_updateMapVisualizationOptions(hcOptions, chartData, chartProps);
  }
  hc_configureChartProportions(chartType, chartData, hcOptions, false, false);
  return hcOptions;
}
function hc_updateMapVisualizationOptions(hcOptions, chartData, chartProps) {
  var chartSerieProps;
  if (chartData.report_properties_series == undefined)
    chartSerieProps = chartProps;
  else chartSerieProps = chartData.report_properties_series[0];
  var mapVisualizationProperties = {};
  if ('report_drilldown' in chartSerieProps)
    mapVisualizationProperties.report_drilldown =
      chartSerieProps.report_drilldown;
  if ('report_id' in chartSerieProps)
    mapVisualizationProperties.report_id = chartSerieProps.report_id;
  if ('report_drilldown_zoom' in chartSerieProps)
    mapVisualizationProperties.report_drilldown_zoom =
      chartSerieProps.report_drilldown_zoom;
  if ('report_drilldown_map' in chartSerieProps)
    mapVisualizationProperties.report_drilldown_map =
      chartSerieProps.report_drilldown_map;
  if ('sysparm_full_query' in chartSerieProps)
    mapVisualizationProperties.full_query = chartSerieProps.sysparm_full_query;
  mapVisualizationProperties.show_data_label =
    chartSerieProps.show_chart_data_label;
  mapVisualizationProperties.show_geographical_label =
    chartSerieProps.show_geographical_label;
  hcOptions.mapVisualization = mapVisualizationProperties;
}
function isLineType(type) {
  return (
    type == 'line' ||
    type == 'area' ||
    type == 'spline' ||
    type == 'line_bar' ||
    type == 'step_line'
  );
}
function hc_getHighChartsType(snType, lineType) {
  if (snType == 'bar' || snType == 'trend') return 'column';
  else if (snType == 'horizontal_bar') return 'bar';
  else if (snType == 'pie') return 'pie';
  else if (snType == 'semi_donut') return 'pie';
  else if (snType == 'donut') return 'pie';
  else if (snType == 'funnel') return 'funnel';
  else if (snType == 'pyramid') return 'funnel';
  else if (snType == 'box') return 'boxplot';
  else if (snType == 'spline') return 'spline';
  else if (snType == 'area') return 'area';
  else if (snType == 'line_bar') return 'column';
  else if (snType == 'line' || snType == 'step_line') return 'line';
  else if (snType == 'heatmap') return 'heatmap';
  else if (snType == 'angular_gauge') return 'gauge';
  else if (snType == 'solid_gauge') return 'solidgauge';
  else if (snType == 'bubble') return 'bubble';
  else if (snType == 'map') return 'map';
  else return '';
}
function hc_setupChartProperties(
  hcOptions,
  chartData,
  chartType,
  chartSize,
  isGauge,
  isPub,
  aggType,
  stackedField
) {
  var chartProps = {};
  chartProps.defaultFontFamily = 'Arial';
  chartProps.fontSize = '10pt';
  chartProps.otherDisplay = 'Other';
  chartProps.otherDisplayMore = '(more...)';
  chartProps.report_properties = {};
  if ('report_properties' in chartData) {
    chartProps.report_properties = chartData.report_properties;
    if (
      'font_family' in chartProps.report_properties &&
      chartProps.report_properties.font_family != ''
    )
      chartProps.defaultFontFamily = chartProps.report_properties.font_family;
    if (
      'font_size' in chartProps.report_properties &&
      chartProps.report_properties.font_size != ''
    )
      chartProps.fontSize = chartProps.report_properties.font_size;
    chartProps.otherDisplay = chartProps.report_properties.other_display;
    chartProps.otherDisplayMore =
      chartProps.report_properties.other_display_more;
  }
  chartProps.isGauge = isGauge;
  chartProps.isPub = isPub;
  chartProps.origXValues = [];
  chartProps.xValues = [];
  chartProps.maxAllowedLabelLen = 20;
  chartProps.grayColor = '#666666';
  chartProps.blackColor = '#000';
  chartProps.aggType = aggType;
  chartProps.stackedField = stackedField;
  chartProps.otherKey = 'zzyynomatchaabb';
  chartProps.chartType = chartType;
  chartProps.chartSize = chartSize;
  chartProps.titleMargin = 50;
  return chartProps;
}
function hc_sanitizeXValues(chartData, chartProps) {
  if (!chartData.series || !chartData.series[0].xvalues) return;
  chartProps.origXValues = chartData.series[0].xvalues;
  if (
    'truncate_x_axis_labels' in chartProps.report_properties &&
    chartProps.report_properties.truncate_x_axis_labels
  ) {
    var removeLeading = false;
    if (
      'xaxis_labels_remove_leading' in chartProps.report_properties &&
      chartProps.report_properties.xaxis_labels_remove_leading
    )
      removeLeading = true;
    for (var i = 0; i < chartProps.origXValues.length; i++) {
      if (chartProps.origXValues[i].length > chartProps.maxAllowedLabelLen) {
        if (removeLeading)
          chartProps.xValues.push(
            '...' +
              chartProps.origXValues[i].substring(
                chartProps.origXValues[i].length -
                  chartProps.maxAllowedLabelLen +
                  3
              )
          );
        else
          chartProps.xValues.push(
            chartProps.origXValues[i].substring(
              0,
              chartProps.maxAllowedLabelLen - 3
            ) + '...'
          );
      } else chartProps.xValues.push(chartProps.origXValues[i]);
    }
  } else {
    for (var i = 0; i < chartProps.origXValues.length; i++)
      chartProps.xValues.push(chartProps.origXValues[i]);
  }
  var indx = hc_isPresentInArray(chartProps.origXValues, chartProps.otherKey);
  if (indx >= 0) {
    var indx2 = hc_isPresentInArray(
      chartProps.origXValues,
      chartProps.otherDisplay
    );
    if (indx2 >= 0)
      chartProps.xValues[indx] =
        chartProps.otherDisplay + ' ' + chartProps.otherDisplayMore;
    else chartProps.xValues[indx] = chartProps.otherDisplay;
  }
}
function hc_sanitizeCategoryValues(hcOptions, chartProps) {
  if (hcOptions.xAxis.categories)
    hcOptions.xAxis.categories = hc_sanitizeAxisCategoriesValues(
      hcOptions.xAxis.categories,
      chartProps
    );
  if (hcOptions.yAxis[0].categories)
    hcOptions.yAxis[0].categories = hc_sanitizeAxisCategoriesValues(
      hcOptions.yAxis[0].categories,
      chartProps
    );
}
function hc_sanitizeAxisCategoriesValues(categories, chartProps) {
  if (!categories) return;
  var newValues = [];
  var origValues = categories;
  if (
    'truncate_x_axis_labels' in chartProps.report_properties &&
    chartProps.report_properties.truncate_x_axis_labels
  ) {
    var removeLeading = false;
    if (
      'xaxis_labels_remove_leading' in chartProps.report_properties &&
      chartProps.report_properties.xaxis_labels_remove_leading
    )
      removeLeading = true;
    for (var i = 0; i < origValues.length; i++) {
      if (origValues[i].length > chartProps.maxAllowedLabelLen) {
        if (removeLeading)
          newValues.push(
            '...' +
              origValues[i].substring(
                origValues[i].length - chartProps.maxAllowedLabelLen + 3
              )
          );
        else
          newValues.push(
            origValues[i].substring(0, chartProps.maxAllowedLabelLen - 3) +
              '...'
          );
      } else newValues.push(origValues[i]);
    }
  } else {
    for (var i = 0; i < origValues.length; i++) newValues.push(origValues[i]);
  }
  var indx = hc_isPresentInArray(origValues, chartProps.otherKey);
  if (indx >= 0) {
    var indx2 = hc_isPresentInArray(origValues, chartProps.otherDisplay);
    if (indx2 >= 0)
      newValues[indx] =
        chartProps.otherDisplay + ' ' + chartProps.otherDisplayMore;
    else newValues[indx] = chartProps.otherDisplay;
  }
  return newValues;
}
function hc_initDefaultChartOptions(
  hcOptions,
  chartData,
  chartType,
  chartSize,
  isGauge,
  isPub,
  containerId,
  aggType,
  stackedField,
  isUI,
  chartHeight,
  chartWidth,
  isRtl
) {
  hcOptions.chart = {};
  if (containerId != '') {
    hcOptions.chart.renderTo = containerId;
  }
  if (!isUI) {
    hcOptions.chart.height = chartHeight;
    hcOptions.chart.width = chartWidth;
  } else {
    var isCustomChartSize =
      chartData.report_properties &&
      chartData.report_properties.custom_chart_size;
    hc_setHeightWidthChart(
      hcOptions,
      chartData,
      chartSize,
      isGauge,
      containerId,
      isCustomChartSize,
      chartHeight,
      chartWidth
    );
  }
  hcOptions.lang = hcOptions.lang || {};
  hcOptions.lang.noData = chartData.noDataToDisplayMsg;
  hcOptions.noData = hcOptions.noData || {};
  hcOptions.noData.style = {};
  hcOptions.noData.style.fontFamily = 'Arial';
  hc_setI18nTranslations(hcOptions, chartData.report_properties.translation);
  hcOptions.credits = {};
  hcOptions.credits.enabled = false;
  hcOptions.legend = {};
  var isMultiSeries = chartData.series.length > 1;
  if (
    (!isMultiSeries &&
      (chartType == 'bar' || chartType == 'horizontal_bar') &&
      stackedField === '') ||
    chartType === 'angular_gauge' ||
    chartType === 'solid_gauge' ||
    chartType === 'box' ||
    chartType === 'tbox' ||
    chartType === 'hist' ||
    chartType === 'pareto'
  )
    hcOptions.legend.enabled = false;
  else hcOptions.legend.enabled = chartData.report_properties.show_legend;
  hcOptions.legend.verticalAlign =
    chartData.report_properties.legend_vertical_alignment;
  hcOptions.legend.align =
    chartData.report_properties.legend_horizontal_alignment;
  if (hcOptions.legend.align === 'left' || hcOptions.legend.align === 'right') {
    hcOptions.legend.layout = 'vertical';
  }
  hcOptions.legend.itemStyle = {};
  hcOptions.legend.itemStyle.fontFamily = 'Arial';
  hcOptions.legend.backgroundColor =
    chartData.report_properties.legend_background_color_value;
  if (chartData.report_properties.show_legend_border === true) {
    hcOptions.legend.borderWidth =
      chartData.report_properties.legend_border_width;
    hcOptions.legend.borderRadius =
      chartData.report_properties.legend_border_radius;
    hcOptions.legend.borderColor =
      chartData.report_properties.legend_border_color_value;
  }
  hcOptions.tooltip = {};
  hcOptions.tooltip.style = {};
  hcOptions.tooltip.style.fontFamily = 'Arial';
  hcOptions.tooltip.style.fontSize = '10pt';
  hcOptions.tooltip.outside = true;
  hcOptions.tooltip.useHTML = true;
  if (isRtl) {
    hcOptions.legend.useHTML = true;
  }
  hcOptions.title = {};
  if (!chartData.report_properties.custom_chart_title_position) {
    if (chartData.report_properties.title_vertical_alignment !== 'top')
      hcOptions.title.verticalAlign =
        chartData.report_properties.title_vertical_alignment;
    if (hcOptions.title.verticalAlign === 'bottom') hcOptions.title.y = 0;
    hcOptions.title.align =
      chartData.report_properties.title_horizontal_alignment;
    if (
      hcOptions.title.align === 'right' &&
      chartData.report_properties.title_vertical_alignment === 'top'
    )
      hcOptions.title.x = -40;
  } else {
    hcOptions.title.x = chartData.report_properties.chart_title_x_position;
    hcOptions.title.y = chartData.report_properties.chart_title_y_position;
  }
  hcOptions.title.style = {};
  hcOptions.title.style.color =
    chartData.report_properties.chart_title_color_value;
  hcOptions.title.style.fontFamily = 'Arial';
  hcOptions.title.style.fontSize =
    chartData.report_properties.chart_title_size + 'px';
  hcOptions.chart.backgroundColor =
    chartData.report_properties.chart_background_color_value;
  if (chartData.report_properties.show_chart_border === true) {
    hcOptions.chart.borderWidth =
      chartData.report_properties.chart_border_width;
    hcOptions.chart.borderRadius =
      chartData.report_properties.chart_border_radius;
    hcOptions.chart.borderColor =
      chartData.report_properties.chart_border_color_value;
  }
  hcOptions.chart.style = {};
  hcOptions.chart.style.margin = '0 auto';
  if ('report_properties' in chartData) {
    if (
      'font_family' in chartData.report_properties &&
      chartData.report_properties.font_family != ''
    ) {
      const fontFamily = chartData.report_properties.font_family;
      hcOptions.chart.style.fontFamily = fontFamily;
      hcOptions.legend.itemStyle.fontFamily = fontFamily;
      hcOptions.title.style.fontFamily = fontFamily;
      hcOptions.tooltip.style.fontFamily = fontFamily;
      hcOptions.noData.style.fontFamily = fontFamily;
    }
    if (
      'font_size' in chartData.report_properties &&
      chartData.report_properties.font_size != ''
    ) {
      hcOptions.tooltip.style.fontSize = chartData.report_properties.font_size;
    }
  }
  var title = chartData.title;
  if (chartData.report_properties.chart_title)
    title = chartData.report_properties.chart_title;
  if (isUI) title = title ? escapeHTML(title) : '';
  if (
    chartData.report_properties.show_chart_title === 'always' ||
    (!isGauge && chartData.report_properties.show_chart_title === 'report')
  ) {
    hcOptions.title.text = title;
  } else {
    hcOptions.title = {};
    hcOptions.title.text = '';
  }
  hcOptions.accessibility = hcOptions.accessibility || {};
  hcOptions.accessibility.screenReaderSection = {
    beforeChartFormat:
      '<div>' +
      title +
      '</div>' +
      '<div>{typeDescription}</div>' +
      '<div>{chartSubtitle}</div>' +
      '<div>{chartLongdesc}</div>' +
      '<div>{playAsSoundButton}</div>' +
      '<div>{xAxisDescription}</div>' +
      '<div>{yAxisDescription}</div>' +
      '<div>{annotationsTitle}{annotationsList}</div>',
  };
  hcOptions.series = [];
  return hc_setupChartProperties(
    hcOptions,
    chartData,
    chartType,
    chartSize,
    isGauge,
    isPub,
    aggType,
    stackedField
  );
}
function escapeHTML(html) {
  if (html)
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  return html;
}
function hc_setHeightWidthChart(
  hcOptions,
  chartData,
  chartSize,
  isGauge,
  containerId,
  customChartSize,
  chartHeight,
  chartWidth
) {
  var containerDimensions = {};
  var ie_dynamic_sizing;
  if (typeof chartData !== 'undefined' && chartData.report_properties)
    ie_dynamic_sizing = chartData.report_properties.ie_dynamic_sizing;
  if (
    (window.SNC && window.SNC.canvas) ||
    !isGauge ||
    !(window.isMSIE || window.isMSIE11) ||
    ie_dynamic_sizing
  )
    containerDimensions = hc_getDimensions(containerId);
  if (containerDimensions.height && containerDimensions.height > 50)
    hcOptions.chart.height = containerDimensions.height;
  else if (chartHeight != undefined && chartHeight != '' && customChartSize)
    hcOptions.chart.height = chartHeight;
  else {
    hcOptions.chart.height = '375';
    if (chartSize == 'large') hcOptions.chart.height = '550';
    else if (chartSize == 'medium') hcOptions.chart.height = '450';
  }
  if (containerDimensions.width)
    hcOptions.chart.width = containerDimensions.width;
  else if (chartWidth != undefined && chartWidth != '' && customChartSize)
    hcOptions.chart.width = chartWidth;
  else {
    hcOptions.chart.width = '450';
    if (chartSize == 'large') hcOptions.chart.width = '750';
    else if (chartSize == 'medium') hcOptions.chart.width = '600';
  }
}
function hc_setI18nTranslations(hcOptions, i18n) {
  var lang = hcOptions.lang;
  lang.months = [
    i18n.month.january,
    i18n.month.february,
    i18n.month.march,
    i18n.month.april,
    i18n.month.may,
    i18n.month.june,
    i18n.month.july,
    i18n.month.august,
    i18n.month.september,
    i18n.month.october,
    i18n.month.november,
    i18n.month.december,
  ];
  lang.weekdays = [
    i18n.weekdays.sunday,
    i18n.weekdays.monday,
    i18n.weekdays.tuesday,
    i18n.weekdays.wednesday,
    i18n.weekdays.thursday,
    i18n.weekdays.friday,
    i18n.weekdays.saturday,
  ];
  lang.shortMonths = [
    i18n.month.shortName.january,
    i18n.month.shortName.february,
    i18n.month.shortName.march,
    i18n.month.shortName.april,
    i18n.month.shortName.may,
    i18n.month.shortName.june,
    i18n.month.shortName.july,
    i18n.month.shortName.august,
    i18n.month.shortName.september,
    i18n.month.shortName.october,
    i18n.month.shortName.november,
    i18n.month.shortName.december,
  ];
  lang.exportButtonTitle = i18n.exportButtonTitle;
  lang.printButtonTitle = i18n.printButtonTitle;
  lang.rangeSelectorFrom = i18n.rangeSelectorFrom;
  lang.rangeSelectorTo = i18n.rangeSelectorTo;
  lang.rangeSelectorZoom = i18n.rangeSelectorZoom;
  lang.downloadPNG = i18n.downloadPNG;
  lang.downloadJPEG = i18n.downloadJPEG;
  lang.downloadPDF = i18n.downloadPDF;
  lang.downloadSVG = i18n.downloadSVG;
  lang.printChart = i18n.printChart;
  lang.resetZoom = i18n.resetZoom;
  lang.resetZoomTitle = i18n.resetZoomTitle;
  lang.thousandsSep = i18n.thousandsSep;
  lang.decimalPoint = i18n.decimalPoint;
  lang.contextButtonTitle = i18n.contextButtonTitle;
  lang.days = i18n.days;
  lang.hours = i18n.hours;
  lang.minutes = i18n.minutes;
  lang.seconds = i18n.seconds;
  lang.days_short = i18n.days_short;
  lang.hours_short = i18n.hours_short;
  lang.minutes_short = i18n.minutes_short;
  lang.seconds_short = i18n.seconds_short;
}
function hc_getDimensions(containerId, isResize) {
  function getParentContainer() {
    var $parent = $container.parent().parent();
    if (
      isInCanvas &&
      containerId.indexOf('preview') == -1 &&
      !isLegacyWidgetWrapper
    )
      $parent = $container.closest('.grid-widget-content');
    else if ($container.closest('.report_content').length)
      $parent = $container.closest('.report_content').parent();
    if ($parent.is('rendered_body')) $parent = $parent.parent();
    return $parent;
  }
  var containerHeight, containerWidth;
  var mustSubtractChildren = false;
  var isInCanvas =
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.canvasUtils &&
    SNC.canvas.isGridCanvasActive;
  var $container = jQuery('#' + containerId);
  var isLegacyWidgetWrapper = window.SNC && !!SNC.legacyWidgetWrapper;
  var $parent = getParentContainer();
  if (!isResize && $container.height() > 25)
    containerHeight = $container.height();
  else {
    containerHeight = $parent.height();
    mustSubtractChildren = true;
  }
  if (!isResize && $container.width() !== 0)
    containerWidth = $container.width();
  else {
    containerWidth = $parent.width();
  }
  if (mustSubtractChildren) {
    if (
      window.g_accessibility_screen_reader_table === 'true' ||
      window.g_accessibility_screen_reader_table === true
    )
      containerHeight -= 22;
    var children = $container.parent().siblings();
    for (var i = 0; i < children.length; i++) {
      if (
        children[i].className.indexOf('gauge-size-handle') > -1 ||
        children[i].className.indexOf('timingDiv') > -1
      )
        containerHeight -= children[i].offsetHeight;
    }
  }
  return { height: containerHeight, width: containerWidth };
}
function hc_saveChart(inputType, outputType, inputData) {
  var ONE_MB = 1048576;
  if (inputData.length > ONE_MB) {
    var errDlg = new GlideDialogWindow('glide_alert_standard');
    errDlg.setTitle(new GwtMessage().getMessage('Error'));
    errDlg.setPreference('warning', true);
    errDlg.setPreference(
      'title',
      new GwtMessage().getMessage('Chart data too large to be saved')
    );
    errDlg.setPreference('invokePromptCallBack', function () {
      this.destroy();
    });
    errDlg.render();
    return;
  }
  var dialog = new GwtPollDialog(inputType, inputData, 0, '', outputType);
  dialog.execute();
}
function hc_addHeatmapChartOptions(
  hcOptions,
  chartProps,
  isUI,
  chartData,
  curSeries
) {
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  hcOptions.plotOptions.heatmap = {};
  hcOptions.plotOptions.heatmap.cursor = 'pointer';
  if (chartData.report_properties.use_color_heatmap === true) {
    hcOptions.colorAxis = {};
    hcOptions.colorAxis.min = chartData.series[0].min_value;
    hcOptions.colorAxis.max = chartData.series[0].max_value;
    hcOptions.colorAxis.minColor = chartData.report_properties.axis_min_color;
    hcOptions.colorAxis.maxColor = chartData.report_properties.axis_max_color;
  } else {
    hcOptions.legend.enabled = false;
  }
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatHeatmapTooltip;
    hcOptions.plotOptions.heatmap.point = {};
    hcOptions.plotOptions.heatmap.point.events = {};
    hcOptions.plotOptions.heatmap.point.events.click = hc_dataPointClicked;
  }
}
function hc_addMapChartOptions(hcOptions, chartProps, isUI, chartData) {
  hcOptions.mapNavigation = {};
  hcOptions.mapNavigation.enabled = true;
  hcOptions.mapNavigation.enableMouseWheelZoom = false;
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  var useLatLon = chartData.report_properties_series[0].map_source.use_lat_lon;
  if (!useLatLon && chartData.report_properties.use_color_heatmap === true) {
    hcOptions.colorAxis = {};
    hcOptions.colorAxis.min = parseInt(chartData.series[0].ymin);
    hcOptions.colorAxis.max = parseInt(chartData.series[0].ymax);
    hcOptions.colorAxis.minColor = chartData.report_properties.axis_min_color;
    hcOptions.colorAxis.maxColor = chartData.report_properties.axis_max_color;
  } else hcOptions.legend.enabled = false;
  if (isUI) {
    hcOptions.title.align =
      chartData.report_properties.title_horizontal_alignment;
    if (
      hcOptions.title.align === 'right' &&
      chartData.report_properties.title_vertical_alignment === 'top'
    )
      hcOptions.title.x = -80;
    var hasLegend = hcOptions.legend.enabled;
    var legendHorizontalAlign =
      chartData.report_properties.legend_horizontal_alignment;
    if (hasLegend) {
      if (legendHorizontalAlign === 'left') {
        if (!hcOptions.mapNavigation.buttonOptions)
          hcOptions.mapNavigation.buttonOptions = {};
        hcOptions.mapNavigation.buttonOptions.x = 70;
        hcOptions.mapNavigation.buttonOptions.y = -30;
      }
    }
    hcOptions.tooltip.formatter = hc_formatMapTooltip;
    hcOptions.plotOptions.series = {};
    hcOptions.plotOptions.series.borderWidth = 1;
    hcOptions.plotOptions.series.point = {};
    hcOptions.plotOptions.series.point.events = {};
    hcOptions.plotOptions.series.point.events.click = hc_dataPointClicked;
    hcOptions.plotOptions.series.point.dataLabels = {};
    hcOptions.plotOptions.series.point.dataLabels.allowOverlap = true;
    hcOptions.plotOptions.series.animation = false;
  }
}
function drillDownButton(event, exactPoint) {
  if (this.series.length > 0 && this.series[0].data.length > 0) {
    var point = this.series[0].data[0];
    var reportDrilldown = point.report_drilldown;
    var element = event.srcElement;
    if (!element) element = event.target;
    var content = jQuery(element).closest('.report_content');
    if (reportDrilldown) {
      var mapParams = '&sysparm_report_map_exact_points=' + exactPoint;
      var actualMap = point.report_drilldown_map;
      if (actualMap) mapParams += '&sysparm_report_map_parent=' + actualMap;
      drillReport(content.parent(), reportDrilldown, '', mapParams);
    }
  }
  return;
}
function hc_addBubbleChartOptions(hcOptions, isUI, isLegendEnabled) {
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  hcOptions.plotOptions.bubble = {};
  hcOptions.plotOptions.bubble.cursor = 'pointer';
  hcOptions.plotOptions.bubble.minSize = 8;
  hcOptions.plotOptions.bubble.maxSize = 70;
  if (isLegendEnabled == false) hcOptions.legend.enabled = false;
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatHeatmapTooltip;
    hcOptions.plotOptions.bubble.point = {};
    hcOptions.plotOptions.bubble.point.events = {};
    hcOptions.plotOptions.bubble.point.events.click = hc_dataPointClicked;
  }
}
function hc_addPieChartOptions(
  hcOptions,
  chartProps,
  isUI,
  isSemiDonut,
  isPublisher
) {
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  hcOptions.plotOptions.pie = {};
  if (isPublisher)
    (hcOptions.plotOptions.pie.allowPointSelect = true),
      (hcOptions.plotOptions.pie.cursor = 'pointer');
  hcOptions.plotOptions.pie.size = '90%';
  if (isSemiDonut) {
    hcOptions.plotOptions.pie.startAngle = -90;
    hcOptions.plotOptions.pie.endAngle = 90;
    hcOptions.plotOptions.pie.center = ['50%', '75%'];
  }
  hcOptions.plotOptions.pie.showInLegend = true;
  hcOptions.plotOptions.pie.borderWidth = 2;
  hc_setLegendLabelFormatter(hcOptions, isUI, true);
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatPie;
    hcOptions.plotOptions.pie.point = {};
    hcOptions.plotOptions.pie.point.events = {};
    if (isPublisher) {
      hcOptions.plotOptions.pie.point.events.select = hc_dataPointSelected;
      hcOptions.plotOptions.pie.point.events.unselect = hc_dataPointUnselected;
      hcOptions.plotOptions.pie.point.events.legendItemClick =
        hc_dataPointLegendClick;
    } else hcOptions.plotOptions.pie.point.events.click = hc_dataPointClicked;
  }
}
function hc_addFunnelChartOptions(
  hcOptions,
  chartProps,
  isUI,
  chartData,
  isPublisher
) {
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  hcOptions.plotOptions.funnel = {};
  if (isPublisher) hcOptions.plotOptions.funnel.allowPointSelect = true;
  hcOptions.plotOptions.funnel.cursor = 'pointer';
  hcOptions.plotOptions.funnel.size = '90%';
  hcOptions.plotOptions.funnel.showInLegend = true;
  hc_setLegendLabelFormatter(hcOptions, isUI, true);
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatPie;
    hcOptions.plotOptions.funnel.point = {};
    hcOptions.plotOptions.funnel.point.events = {};
    if (isPublisher) {
      hcOptions.plotOptions.funnel.point.events.select = hc_dataPointSelected;
      hcOptions.plotOptions.funnel.point.events.unselect =
        hc_dataPointUnselected;
      hcOptions.plotOptions.funnel.point.events.legendItemClick =
        hc_dataPointLegendClick;
    } else
      hcOptions.plotOptions.funnel.point.events.click = hc_dataPointClicked;
  }
  hcOptions.plotOptions.series = {};
  hcOptions.plotOptions.series.center = ['50%', '60%'];
  hcOptions.plotOptions.series.width = '80%';
  if (chartProps.report_properties.funnel_neck_percent)
    hcOptions.plotOptions.series.neckHeight =
      chartProps.report_properties.funnel_neck_percent + '%';
}
function hc_addPyramidChartOptions(
  hcOptions,
  chartProps,
  isUI,
  chartData,
  isPublisher
) {
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  hcOptions.plotOptions.funnel = {};
  if (isPublisher) hcOptions.plotOptions.funnel.allowPointSelect = true;
  hcOptions.plotOptions.funnel.cursor = 'pointer';
  hcOptions.plotOptions.funnel.size = '90%';
  hcOptions.plotOptions.funnel.showInLegend = true;
  hc_setLegendLabelFormatter(hcOptions, isUI, true);
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatPie;
    hcOptions.plotOptions.funnel.point = {};
    hcOptions.plotOptions.funnel.point.events = {};
    if (isPublisher) {
      hcOptions.plotOptions.funnel.point.events.select = hc_dataPointSelected;
      hcOptions.plotOptions.funnel.point.events.unselect =
        hc_dataPointUnselected;
      hcOptions.plotOptions.funnel.point.events.legendItemClick =
        hc_dataPointLegendClick;
    } else
      hcOptions.plotOptions.funnel.point.events.click = hc_dataPointClicked;
  }
  hcOptions.plotOptions.series = {};
  hcOptions.plotOptions.series.neckHeight = '0%';
  hcOptions.plotOptions.series.neckWidth = '0%';
  hcOptions.plotOptions.series.center = ['50%', '60%'];
  hcOptions.plotOptions.series.width = '80%';
  hcOptions.plotOptions.funnel.reversed = true;
}
function hc_addGaugeChartOptions(
  hcOptions,
  chartProps,
  chartData,
  chartType,
  isUI
) {
  hcOptions.chart.type = chartType;
  hcOptions.pane = {};
  var yAxis = {};
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  var value = parseFloat(chartData.series[0].yvalues[0]);
  var min = 0;
  var max = 0;
  if (
    !chartProps.report_properties.gauge_autoscale &&
    chartProps.report_properties.from
  )
    min = parseInt(chartProps.report_properties.from);
  else if (value < 0) min = value * 1.5;
  if (
    !chartProps.report_properties.gauge_autoscale &&
    chartProps.report_properties.to
  )
    max = parseInt(chartProps.report_properties.to);
  else if (value == 0) max = 10;
  else if (value > 0) max = value * 1.5;
  var lower = null;
  var upper = null;
  if (
    chartProps.report_properties.lower_limit ||
    chartProps.report_properties.lower_limit === 0 ||
    chartProps.report_properties.lower_limit === '0'
  )
    lower = parseInt(chartProps.report_properties.lower_limit);
  if (
    chartProps.report_properties.upper_limit ||
    chartProps.report_properties.upper_limit === 0 ||
    chartProps.report_properties.upper_limit === '0'
  )
    upper = parseInt(chartProps.report_properties.upper_limit);
  if (lower !== null && upper !== null) {
    if (lower < min && lower <= 0) min = lower * 1.5;
    if (upper > max && upper >= 0) max = upper * 1.5;
    var total = max - min;
    var middleColor = '#ffca1f';
    var topColor;
    var bottomColor;
    if (chartProps.report_properties.direction == 'maximize') {
      topColor = '#4bd762';
      bottomColor = '#ff402c';
    } else {
      topColor = '#ff402c';
      bottomColor = '#4bd762';
    }
    if (chartType == 'solidgauge') {
      yAxis.stops = [];
      if (chartProps.report_properties.direction == 'maximize') {
        yAxis.stops.push([(lower - min) / total, bottomColor]);
        yAxis.stops.push([(upper - min) / total, middleColor]);
        yAxis.stops.push([1, topColor]);
      } else {
        yAxis.stops.push([0, bottomColor]);
        yAxis.stops.push([(lower - min) / total, middleColor]);
        yAxis.stops.push([(upper - min) / total, topColor]);
      }
    } else {
      yAxis.plotBands = [];
      yAxis.plotBands.push({ from: min, to: lower, color: bottomColor });
      yAxis.plotBands.push({ from: lower, to: upper, color: middleColor });
      yAxis.plotBands.push({ from: upper, to: max, color: topColor });
    }
  } else {
    if (chartType == 'solidgauge') {
      yAxis.stops = [];
      color = chartData.series[0].colors[0];
      yAxis.stops.push([0, color]);
      yAxis.stops.push([1, color]);
    }
  }
  yAxis.min = min;
  yAxis.max = max;
  if (chartType == 'solidgauge') {
    hcOptions.pane.size = '100%';
    hcOptions.pane.center = ['50%', '50%'];
    hcOptions.pane.startAngle = -90;
    hcOptions.pane.endAngle = 90;
    hcOptions.pane.background = {};
    hcOptions.pane.background.innerRadius = '60%';
    hcOptions.pane.background.outerRadius = '100%';
    hcOptions.pane.background.shape = 'arc';
    hcOptions.pane.background.backgroundColor = '#EEE';
    hcOptions.tooltip = {};
    hcOptions.tooltip.enabled = false;
    yAxis.tickWidth = 0;
    yAxis.lineWidth = 0;
    yAxis.minorTickInterval = null;
    yAxis.tickPositions = [min, max];
    yAxis.labels = {};
    yAxis.labels.y = 14;
    if (!hcOptions.plotOptions.solidgauge)
      hcOptions.plotOptions.solidgauge = {};
    hcOptions.plotOptions.solidgauge.point = {};
    hcOptions.plotOptions.solidgauge.point.events = {};
    hcOptions.plotOptions.solidgauge.point.events.click = hc_dataPointClicked;
  } else {
    hcOptions.chart.plotBackgroundColor = '#ffffff';
    hcOptions.chart.plotBackgroundImage = null;
    hcOptions.chart.plotBorderWidth = 0;
    hcOptions.chart.plotShadow = false;
    hcOptions.pane.startAngle = -150;
    hcOptions.pane.endAngle = 150;
    if (!hcOptions.plotOptions.gauge) hcOptions.plotOptions.gauge = {};
    hcOptions.plotOptions.gauge.point = {};
    hcOptions.plotOptions.gauge.point.events = {};
    hcOptions.plotOptions.gauge.point.events.click = hc_dataPointClicked;
    hcOptions.plotOptions.gauge.wrap = false;
    hcOptions.pane.background = [];
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff',
      borderWidth: 0,
      outerRadius: '109%',
    });
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff',
      borderWidth: 0,
      outerRadius: '107%',
    });
    hcOptions.pane.background.push({ backgroundColor: '#ffffff' });
    hcOptions.pane.background.push({
      backgroundColor: '#ffffff',
      borderWidth: 0,
      outerRadius: '105%',
      innerRadius: '103%',
    });
    yAxis.minorTickWidth = 1;
    yAxis.minorTickLength = 10;
    yAxis.minorTickPosition = 'inside';
    yAxis.tickPixelInterval = 30;
    yAxis.tickWidth = 2;
    yAxis.tickPosition = 'inside';
    yAxis.tickLength = 10;
    yAxis.labels = {};
    yAxis.labels.step = 2;
    yAxis.labels.rotation = 'auto';
    if (lower !== null && upper !== null) {
      yAxis.minorTickColor = '#ffffff';
      yAxis.tickColor = '#ffffff';
    } else {
      yAxis.minorTickColor = '#828890';
      yAxis.tickColor = '#828890';
    }
  }
  hcOptions.yAxis = [];
  hcOptions.yAxis.push(yAxis);
}
function hc_addBarChartOptions(
  hcOptions,
  chartProps,
  chartData,
  barType,
  isUI
) {
  hc_addCommonBarChartOptions(hcOptions, chartProps, chartData, barType, isUI);
  hcOptions.plotOptions.series.minPointLength = 2;
  if (chartData.series.length === 1)
    hc_addYAxisMax(chartProps, hcOptions, chartData, chartProps.chartType);
  if (isUI) hcOptions.tooltip.formatter = hc_formatToolTip;
}
function addPropertyIfExists(
  sourceObject,
  sourcePropertyName,
  destinationObject,
  destinationPropertyName
) {
  if (sourcePropertyName in sourceObject && sourceObject[sourcePropertyName]) {
    destinationObject[destinationPropertyName] =
      sourceObject[sourcePropertyName];
  }
}
function addDataLabelPropertiesForPolaris(
  report_properties,
  hcPlotOptionsDataLabelObject
) {
  addPropertyIfExists(
    report_properties,
    'data_label_background',
    hcPlotOptionsDataLabelObject,
    'backgroundColor'
  );
  addPropertyIfExists(
    report_properties,
    'data_label_padding',
    hcPlotOptionsDataLabelObject,
    'padding'
  );
  addPropertyIfExists(
    report_properties,
    'data_label_border_radius',
    hcPlotOptionsDataLabelObject,
    'borderRadius'
  );
}
function hc_updateDataLabelOptionsGeographical(
  hcOptions,
  chartData,
  chartType
) {
  if ('map' === chartType) {
    if (hcOptions.series[0].dataLabels == null)
      hcOptions.series[0].dataLabels = {};
    hcOptions.series[0].dataLabels.enabled = true;
    hcOptions.series[0].dataLabels.color = '#000';
    hcOptions.series[0].dataLabels.show_geographical_label =
      chartData.report_properties_series[0].show_geographical_label;
    hcOptions.series[0].dataLabels.show_data_label =
      chartData.report_properties_series[0].show_chart_data_label;
    hcOptions.series[0].dataLabels.formatter = hc_formatMapDataLabels;
  }
}
function hasPropertyValue(reportProps, propertyName) {
  return (
    reportProps &&
    propertyName in reportProps &&
    reportProps[propertyName] !== ''
  );
}
function addGaugeCommonDataLabelsOptions(reportProps, dataLabels) {
  dataLabels.style = {
    fontFamily: hasPropertyValue(reportProps, 'gauge_data_label_font_family')
      ? reportProps.gauge_data_label_font_family
      : 'Arial',
    fontSize: hasPropertyValue(reportProps, 'gauge_data_label_font_size')
      ? reportProps.gauge_data_label_font_size
      : '25px',
    fontWeight: hasPropertyValue(reportProps, 'gauge_data_label_font_weight')
      ? reportProps.gauge_data_label_font_weight
      : '300',
    color: hasPropertyValue(reportProps, 'gauge_data_label_color')
      ? reportProps.gauge_data_label_color
      : 'black',
  };
}
function hc_addDataLabelOptions(
  hcOptions,
  chartProps,
  chartData,
  chartType,
  isUI
) {
  var dataLabelColor = '#606060';
  if (
    chartData.report_properties_series != undefined &&
    chartData.report_properties_series[0].show_chart_data_label === true
  ) {
    if ('pie' === chartType) {
      if (hcOptions.plotOptions.pie == null) hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = true;
      hcOptions.plotOptions.pie.dataLabels.softConnector = false;
      hcOptions.plotOptions.pie.dataLabels.distance = 15;
      hcOptions.plotOptions.pie.dataLabels.style = {};
      hcOptions.plotOptions.pie.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.pie.dataLabels.style.fontSize = convertToPx('10pt');
      hcOptions.plotOptions.pie.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fontWeight = 'normal';
      if (
        'font_family' in chartProps.report_properties &&
        chartProps.report_properties.font_family != ''
      )
        hcOptions.plotOptions.pie.dataLabels.style.fontFamily =
          chartProps.report_properties.font_family;
      if (
        'font_size' in chartProps.report_properties &&
        chartProps.report_properties.font_size != ''
      )
        hcOptions.plotOptions.pie.dataLabels.style.fontSize = convertToPx(
          chartProps.report_properties.font_size
        );
      if (isUI)
        hcOptions.plotOptions.pie.dataLabels.formatter =
          hc_formatNameValueLabel;
      else
        hcOptions.plotOptions.pie.dataLabels.formatter =
          'hc_formatNameValueLabel';
    } else if ('semi_donut' === chartType || 'donut' === chartType) {
      if (hcOptions.plotOptions.pie == null) hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = true;
      hcOptions.plotOptions.pie.dataLabels.softConnector = false;
      hcOptions.plotOptions.pie.dataLabels.distance = 15;
      hcOptions.plotOptions.pie.dataLabels.style = {};
      hcOptions.plotOptions.pie.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.pie.dataLabels.style.fontSize = convertToPx('10pt');
      hcOptions.plotOptions.pie.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.pie.dataLabels.style.fontWeight = 'normal';
      if (
        'font_family' in chartProps.report_properties &&
        chartProps.report_properties.font_family != ''
      )
        hcOptions.plotOptions.pie.dataLabels.style.fontFamily =
          chartProps.report_properties.font_family;
      if (
        'font_size' in chartProps.report_properties &&
        chartProps.report_properties.font_size != ''
      )
        hcOptions.plotOptions.pie.dataLabels.style.fontSize = convertToPx(
          chartProps.report_properties.font_size
        );
      if (isUI)
        hcOptions.plotOptions.pie.dataLabels.formatter =
          hc_formatNameValueLabel;
      else
        hcOptions.plotOptions.pie.dataLabels.formatter =
          'hc_formatNameValueLabel';
    } else if ('funnel' === chartType || 'pyramid' === chartType) {
      hcOptions.plotOptions.funnel.dataLabels = {};
      hcOptions.plotOptions.funnel.dataLabels.enabled = true;
      hcOptions.plotOptions.funnel.dataLabels.softConnector = false;
      hcOptions.plotOptions.funnel.dataLabels.distance = 15;
      hcOptions.plotOptions.funnel.dataLabels.style = {};
      hcOptions.plotOptions.funnel.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.funnel.dataLabels.style.fontSize =
        convertToPx('10pt');
      hcOptions.plotOptions.funnel.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.funnel.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.funnel.dataLabels.style.fontWeight = 'normal';
      if (
        'font_family' in chartProps.report_properties &&
        chartProps.report_properties.font_family != ''
      )
        hcOptions.plotOptions.funnel.dataLabels.style.fontFamily =
          chartProps.report_properties.font_family;
      if (
        'font_size' in chartProps.report_properties &&
        chartProps.report_properties.font_size != ''
      )
        hcOptions.plotOptions.funnel.dataLabels.style.fontSize = convertToPx(
          chartProps.report_properties.font_size
        );
      if (isUI)
        hcOptions.plotOptions.funnel.dataLabels.formatter =
          hc_formatNameValueLabel;
      else
        hcOptions.plotOptions.funnel.dataLabels.formatter =
          'hc_formatNameValueLabel';
    } else if ('control' === chartType) {
      if (hcOptions.plotOptions == null)
        hcOptions.plotOptions = hcOptions.plotOptions || {};
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = true;
      hcOptions.plotOptions.series.dataLabels.softConnector = false;
      hcOptions.plotOptions.series.dataLabels.distance = 15;
      hcOptions.plotOptions.series.dataLabels.style = {};
      hcOptions.plotOptions.series.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.series.dataLabels.style.fontSize = '10pt';
      hcOptions.plotOptions.series.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fontWeight = 'normal';
      if (
        'font_family' in chartProps.report_properties &&
        chartProps.report_properties.font_family != ''
      )
        hcOptions.plotOptions.series.dataLabels.style.fontFamily =
          chartProps.report_properties.font_family;
      if (
        'font_size' in chartProps.report_properties &&
        chartProps.report_properties.font_size != ''
      )
        hcOptions.plotOptions.series.dataLabels.style.fontSize = convertToPx(
          chartProps.report_properties.font_size
        );
      if (isUI)
        hcOptions.plotOptions.series.dataLabels.formatter = hc_formatValueLabel;
      else
        hcOptions.plotOptions.series.dataLabels.formatter =
          'hc_formatValueLabel';
    } else if ('bar' === chartType || 'horizontal_bar' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = true;
      hcOptions.plotOptions.series.dataLabels.softConnector = false;
      hcOptions.plotOptions.series.dataLabels.distance = 15;
      hcOptions.plotOptions.series.dataLabels.style = {};
      hcOptions.plotOptions.series.dataLabels.style.fontFamily = 'Arial';
      hcOptions.plotOptions.series.dataLabels.style.fontSize =
        convertToPx('10pt');
      hcOptions.plotOptions.series.dataLabels.style.color = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fill = dataLabelColor;
      hcOptions.plotOptions.series.dataLabels.style.fontWeight = 'normal';
      hc_setDataLabelPositionProperties(hcOptions, chartData);
      if (
        'font_family' in chartProps.report_properties &&
        chartProps.report_properties.font_family != ''
      ) {
        hcOptions.plotOptions.series.dataLabels.style.fontFamily =
          chartProps.report_properties.font_family;
      }
      if (
        'font_size' in chartProps.report_properties &&
        chartProps.report_properties.font_size != ''
      )
        hcOptions.plotOptions.series.dataLabels.style.fontSize = convertToPx(
          chartProps.report_properties.font_size
        );
      addDataLabelPropertiesForPolaris(
        chartProps.report_properties,
        hcOptions.plotOptions.series.dataLabels
      );
      if (isUI)
        hcOptions.plotOptions.series.dataLabels.formatter = hc_formatValueLabel;
      else
        hcOptions.plotOptions.series.dataLabels.formatter =
          'hc_formatValueLabel';
    } else if ('pareto' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[1].dataLabels = {};
      hcOptions.series[0].dataLabels.enabled = true;
      hcOptions.series[0].dataLabels.softConnector = false;
      hcOptions.series[0].dataLabels.distance = 15;
      hcOptions.series[0].dataLabels.style = {};
      hcOptions.series[0].dataLabels.style.fontFamily = 'Arial';
      hcOptions.series[0].dataLabels.style.fontSize = convertToPx('10pt');
      hcOptions.series[0].dataLabels.style.color = dataLabelColor;
      hcOptions.series[0].dataLabels.style.fill = dataLabelColor;
      hcOptions.series[0].dataLabels.style.fontWeight = 'normal';
      hc_setDataLabelPositionProperties(hcOptions, chartData);
      if (
        'font_family' in chartProps.report_properties &&
        chartProps.report_properties.font_family != ''
      )
        hcOptions.series[0].dataLabels.style.fontFamily =
          chartProps.report_properties.font_family;
      if (
        'font_size' in chartProps.report_properties &&
        chartProps.report_properties.font_size != ''
      )
        hcOptions.series[0].dataLabels.style.fontSize = convertToPx(
          chartProps.report_properties.font_size
        );
      addDataLabelPropertiesForPolaris(
        chartProps.report_properties,
        hcOptions.series[0].dataLabels
      );
      if (isUI) hcOptions.series[0].dataLabels.formatter = hc_formatValueLabel;
      else hcOptions.series[0].dataLabels.formatter = 'hc_formatValueLabel';
    } else if ('trend' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      for (i = 0; i < hcOptions.series.length; i++) {
        hcOptions.series[i].dataLabels = {};
        hcOptions.series[i].dataLabels.enabled = true;
        hcOptions.series[i].dataLabels.softConnector = false;
        hcOptions.series[i].dataLabels.distance = 15;
        hcOptions.series[i].dataLabels.inside = false;
        hcOptions.series[i].dataLabels.style = {};
        hcOptions.series[i].dataLabels.style.fontFamily = 'Arial';
        hcOptions.series[i].dataLabels.style.fontSize = convertToPx('10pt');
        hcOptions.series[i].dataLabels.style.color = dataLabelColor;
        hcOptions.series[i].dataLabels.style.fill = dataLabelColor;
        hcOptions.series[i].dataLabels.style.fontWeight = 'normal';
        if (
          'font_family' in chartProps.report_properties &&
          chartProps.report_properties.font_family != ''
        )
          hcOptions.series[i].dataLabels.style.fontFamily =
            chartProps.report_properties.font_family;
        if (
          'font_size' in chartProps.report_properties &&
          chartProps.report_properties.font_size != ''
        )
          hcOptions.series[i].dataLabels.style.fontSize = convertToPx(
            chartProps.report_properties.font_size
          );
        addDataLabelPropertiesForPolaris(
          chartProps.report_properties,
          hcOptions.series[i].dataLabels
        );
        if (isUI)
          hcOptions.series[i].dataLabels.formatter = hc_formatValueLabel;
        else hcOptions.series[i].dataLabels.formatter = 'hc_formatValueLabel';
      }
      hc_setDataLabelPositionProperties(hcOptions, chartData);
    } else if ('gauge' === chartType) {
      if (hcOptions.plotOptions.gauge == null) hcOptions.plotOptions.gauge = {};
      if (hcOptions.plotOptions.gauge.dataLabels == null)
        hcOptions.plotOptions.gauge.dataLabels = {};
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.borderWidth = 0;
      hcOptions.series[0].dataLabels.enabled = true;
      hcOptions.series[0].dataLabels.allowOverlap = true;
      addGaugeCommonDataLabelsOptions(
        chartProps.report_properties,
        hcOptions.plotOptions.gauge.dataLabels
      );
    } else if ('angular_gauge' === chartType) {
      if (hcOptions.plotOptions.gauge == null) hcOptions.plotOptions.gauge = {};
      if (hcOptions.plotOptions.gauge.dataLabels == null)
        hcOptions.plotOptions.gauge.dataLabels = {};
      hcOptions.plotOptions.gauge.dataLabels.enabled = true;
      hcOptions.plotOptions.gauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.gauge.dataLabels.borderWidth = 0;
      addGaugeCommonDataLabelsOptions(
        chartProps.report_properties,
        hcOptions.plotOptions.gauge.dataLabels
      );
    } else if ('solid_gauge' === chartType) {
      if (hcOptions.plotOptions.solidgauge == null)
        hcOptions.plotOptions.solidgauge = {};
      if (hcOptions.plotOptions.solidgauge.dataLabels == null)
        hcOptions.plotOptions.solidgauge.dataLabels = {};
      hcOptions.plotOptions.solidgauge.dataLabels.enabled = true;
      hcOptions.plotOptions.solidgauge.dataLabels.y = -35;
      hcOptions.plotOptions.solidgauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.solidgauge.dataLabels.borderWidth = 0;
      addGaugeCommonDataLabelsOptions(
        chartProps.report_properties,
        hcOptions.plotOptions.solidgauge.dataLabels
      );
    } else if (isLineType(chartType)) {
      hcOptions.series.forEach(function (series) {
        series.dataLabels = series.dataLabels || {};
        series.dataLabels.enabled = series.dataLabels.enabled || false;
        series.dataLabels.softConnector = false;
        series.dataLabels.distance = 15;
        series.dataLabels.style = {};
        series.dataLabels.style.fontFamily = 'Arial';
        series.dataLabels.style.fontSize = convertToPx('10pt');
        series.dataLabels.style.color = dataLabelColor;
        series.dataLabels.style.fill = dataLabelColor;
        series.dataLabels.style.fontWeight = 'normal';
        if (
          'font_family' in chartProps.report_properties &&
          chartProps.report_properties.font_family != ''
        )
          series.dataLabels.style.fontFamily =
            chartProps.report_properties.font_family;
        if (
          'font_size' in chartProps.report_properties &&
          chartProps.report_properties.font_size != ''
        )
          series.dataLabels.style.fontSize = convertToPx(
            chartProps.report_properties.font_size
          );
        if (chartType == 'line_bar') {
          hc_setDataLabelPositionProperties(hcOptions, chartData);
          addDataLabelPropertiesForPolaris(
            chartProps.report_properties,
            series.dataLabels
          );
        }
        if (isUI) series.dataLabels.formatter = hc_formatValueLabel;
        else series.dataLabels.formatter = 'hc_formatValueLabel';
      });
    } else if ('heatmap' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '{point.value_display}';
      hcOptions.series[0].dataLabels.enabled = true;
      hcOptions.series[0].dataLabels.allowOverlap = true;
    } else if ('map' === chartType) {
    }
  } else {
    if ('pie' === chartType) {
      if (hcOptions.plotOptions.pie == null) hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = false;
    } else if ('heatmap' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.format = '{point.value}';
      hcOptions.series[0].dataLabels.enabled = false;
      hcOptions.series[0].dataLabels.color = 'black';
      hcOptions.series[0].dataLabels.style = {};
      hcOptions.series[0].dataLabels.style.textShadow = 'none';
      hcOptions.series[0].dataLabels.style.HcTextStroke = null;
    } else if ('semi_donut' === chartType || 'donut' === chartType) {
      if (hcOptions.plotOptions.pie == null) hcOptions.plotOptions.pie = {};
      hcOptions.plotOptions.pie.dataLabels = {};
      hcOptions.plotOptions.pie.dataLabels.enabled = false;
    } else if ('funnel' === chartType || 'pyramid' === chartType) {
      if (hcOptions.plotOptions.funnel == null)
        hcOptions.plotOptions.funnel = {};
      hcOptions.plotOptions.funnel.dataLabels = {};
      hcOptions.plotOptions.funnel.dataLabels.enabled = false;
    } else if ('control' === chartType) {
      if (hcOptions.plotOptions == null)
        hcOptions.plotOptions = hcOptions.plotOptions || {};
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = false;
    } else if ('bar' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = false;
    } else if ('pareto' === chartType) {
      if (hcOptions.plotOptions.series == null)
        hcOptions.plotOptions.series = {};
      hcOptions.plotOptions.series.dataLabels = {};
      hcOptions.plotOptions.series.dataLabels.enabled = false;
    } else if ('column' === chartType) {
      if (hcOptions.plotOptions.column == null)
        hcOptions.plotOptions.column = {};
      hcOptions.plotOptions.column.dataLabels = {};
      hcOptions.plotOptions.column.dataLabels.enabled = false;
    } else if ('gauge' === chartType) {
      hcOptions.series[0].dataLabels = {};
      addGaugeCommonDataLabelsOptions(
        chartProps.report_properties,
        hcOptions.series[0].dataLabels
      );
      hcOptions.series[0].dataLabels.borderWidth = 0;
      hcOptions.series[0].dataLabels.enabled = true;
      hcOptions.series[0].dataLabels.allowOverlap = true;
    } else if ('angular_gauge' === chartType) {
      if (hcOptions.plotOptions.gauge == null) hcOptions.plotOptions.gauge = {};
      if (hcOptions.plotOptions.gauge.dataLabels == null)
        hcOptions.plotOptions.gauge.dataLabels = {};
      hcOptions.plotOptions.gauge.dataLabels.enabled = true;
      hcOptions.plotOptions.gauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.gauge.dataLabels.borderWidth = 0;
      addGaugeCommonDataLabelsOptions(
        chartProps.report_properties,
        hcOptions.plotOptions.gauge.dataLabels
      );
    } else if ('solid_gauge' === chartType) {
      if (hcOptions.plotOptions.solidgauge == null)
        hcOptions.plotOptions.solidgauge = {};
      if (hcOptions.plotOptions.solidgauge.dataLabels == null)
        hcOptions.plotOptions.solidgauge.dataLabels = {};
      hcOptions.plotOptions.solidgauge.dataLabels.enabled = true;
      hcOptions.plotOptions.solidgauge.dataLabels.y = -35;
      hcOptions.plotOptions.solidgauge.dataLabels.useHTML = true;
      hcOptions.plotOptions.solidgauge.dataLabels.borderWidth = 0;
      addGaugeCommonDataLabelsOptions(
        chartProps.report_properties,
        hcOptions.plotOptions.solidgauge.dataLabels
      );
    } else if (isLineType(chartType)) {
      if (hcOptions.series[0] == null) hcOptions.series[0] = {};
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.enabled = false;
    } else if ('map' === chartType) {
      hcOptions.series[0].dataLabels = {};
      hcOptions.series[0].dataLabels.enabled = false;
    }
  }
  if (!isUI) {
    if (hcOptions.plotOptions == null)
      hcOptions.plotOptions = hcOptions.plotOptions || {};
    if (hcOptions.plotOptions.series == null) hcOptions.plotOptions.series = {};
  }
}
function hc_addStackedBarChartOptions(
  hcOptions,
  chartProps,
  chartData,
  barType,
  isUI,
  serieProps
) {
  hc_addCommonBarChartOptions(hcOptions, chartProps, chartData, barType, isUI);
  if (chartData.series.length === 1 && chartProps.aggType === 'COUNT')
    hc_addYAxisMax(chartProps, hcOptions, chartData, chartProps.chartType);
  if (isUI) {
    hcOptions.tooltip.shared = false;
    hcOptions.tooltip.formatter = hc_formatStackedBarToolTip;
    if (hcOptions.chart.width)
      hcOptions.tooltip.style = { width: hcOptions.chart.width / 2 };
  }
}
function hc_addLineChartOptions(
  hcOptions,
  chartProps,
  chartData,
  isUI,
  chartType
) {
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  for (i = 0; i < chartData.series.length; i++) {
    var seriesChartType = chartData.series[i].series_plot_type;
    if (seriesChartType === 'line' || seriesChartType === 'step_line') {
      hc_setZoomTypeForSlowMetric(chartData, hcOptions);
      hcOptions.chart.type = 'line';
    } else if (seriesChartType === 'area') hcOptions.chart.type = 'area';
    else if (seriesChartType === 'line_bar') {
      hcOptions.chart.type = 'column';
      hc_setZoomTypeForSlowMetric(chartData, hcOptions);
      hc_addSummaryDataToLegendForSlowMetric(chartData, hcOptions, isUI);
    } else if (seriesChartType === 'spline') hcOptions.chart.type = 'spline';
    if (isUI) {
      if (hcOptions.tooltip === undefined) hcOptions.tooltip = {};
      hcOptions.tooltip.shared = false;
      hcOptions.tooltip.formatter = hc_formatGeneralLineBarToolTip;
      hcOptions.plotOptions[hcOptions.chart.type] = {};
      hcOptions.plotOptions[hcOptions.chart.type].point =
        hcOptions.plotOptions[hcOptions.chart.type].point || {};
      hcOptions.plotOptions[hcOptions.chart.type].point.events =
        hcOptions.plotOptions[hcOptions.chart.type].events || {};
      hcOptions.plotOptions[hcOptions.chart.type].point.events.click =
        hc_dataPointClicked;
    }
  }
}
function hc_addAvailChartOptions(hcOptions, chartProps, chartData, isUI) {
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  if (hcOptions.tooltip == undefined) hcOptions.tooltip = {};
  if ('sub_series' in chartData.series[0]) {
    if (isUI) hcOptions.tooltip.formatter = hc_formatStackedBarToolTip;
  } else {
    hcOptions.legend.enabled = false;
    if (isUI) hcOptions.tooltip.formatter = hc_formatToolTip;
  }
  hcOptions.yAxis[0].min = 0;
  hcOptions.yAxis[0].max = 100;
  hcOptions.yAxis[0].tickInterval = 10;
}
function hc_addHistogramOptions(hcOptions, chartProps, chartData, isUI) {
  hc_addBarChartOptions(hcOptions, chartProps, chartData, 'column', isUI);
  hcOptions.plotOptions.column.pointPadding = 0;
  hcOptions.plotOptions.column.groupPadding = 0;
  hcOptions.plotOptions.column.borderWidth = 0.5;
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatHistToolTip;
    hcOptions.plotOptions.column.point = {};
    hcOptions.plotOptions.column.point.events = {};
    hcOptions.plotOptions.column.point.events.click = '';
  }
  hcOptions.legend.enabled = false;
}
function hc_addCommonBarChartOptions(
  hcOptions,
  chartProps,
  chartData,
  barType,
  isUI
) {
  hcOptions.chart.type = barType;
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hcOptions.plotOptions = hcOptions.plotOptions || {};
  hcOptions.plotOptions.series = {};
  if (barType == 'column') {
    hc_addSlantLabelOptions(hcOptions, chartProps, true);
    hcOptions.plotOptions.column = {};
    hcOptions.plotOptions.column.groupPadding = 0;
    if ('bar_spacing' in chartProps.report_properties)
      hcOptions.plotOptions.column.pointPadding =
        chartProps.report_properties.bar_spacing;
    if (isUI) {
      hcOptions.plotOptions.column = hcOptions.plotOptions.column || {};
      hcOptions.plotOptions.column.point =
        hcOptions.plotOptions.column.point || {};
      hcOptions.plotOptions.column.point.events =
        hcOptions.plotOptions.column.point.events || {};
      hcOptions.plotOptions.column.point.events.click = hc_dataPointClicked;
    }
  } else if (barType == 'bar') {
    hc_addSlantLabelOptions(hcOptions, chartProps, false);
    hcOptions.xAxis.labels.y = 0;
    hcOptions.plotOptions.bar = {};
    hcOptions.plotOptions.bar.groupPadding = 0;
    if ('bar_spacing' in chartProps.report_properties)
      hcOptions.plotOptions.bar.pointPadding =
        chartProps.report_properties.bar_spacing;
    if (isUI) {
      hcOptions.plotOptions.bar.point = hcOptions.plotOptions.bar.point || {};
      hcOptions.plotOptions.bar.point.events =
        hcOptions.plotOptions.bar.point.events || {};
      hcOptions.plotOptions.bar.point.events.click = hc_dataPointClicked;
    }
  }
  if (isUI) {
    hcOptions.tooltip.formatter = hc_formatToolTip;
    hcOptions.plotOptions.column = hcOptions.plotOptions.column || {};
    hcOptions.plotOptions.column.point =
      hcOptions.plotOptions.column.point || {};
    hcOptions.plotOptions.column.point.events =
      hcOptions.plotOptions.column.point.events || {};
    hcOptions.plotOptions.column.point.events.click = hc_dataPointClicked;
  }
}
function hc_getXAxisLabelStyle(chartProps, isUI) {
  return hc_getAxisLabelStyle(
    chartProps.report_properties.x_axis_label_color_value,
    chartProps.report_properties.x_axis_label_size,
    chartProps.report_properties.x_axis_label_bold,
    chartProps.defaultFontFamily,
    isUI
  );
}
function hc_getYAxisLabelStyle(chartProps, isUI) {
  return hc_getAxisLabelStyle(
    chartProps.report_properties.y_axis_label_color_value,
    chartProps.report_properties.y_axis_label_size,
    chartProps.report_properties.y_axis_label_bold,
    chartProps.defaultFontFamily,
    isUI
  );
}
function hc_getAxisLabelStyle(
  axis_label_color_value,
  axis_label_size,
  axis_label_bold,
  fontFamily,
  isUI
) {
  var style = {};
  style.fontFamily = fontFamily;
  style.color = axis_label_color_value;
  style.fontSize = axis_label_size + 'px';
  if (axis_label_bold) style.fontWeight = 'bold';
  if (isUI && window.isMSIE) {
    style.backgroundColor = '#fff';
  }
  return style;
}
function unescapeHtmlInput(input) {
  if (!input) return input;
  if (window.location.href.indexOf('WHTP') != -1) {
    var el = document.createElement('div');
    el.innerHTML = input;
    return el.childNodes.length === 0 ? '' : el.childNodes[0].nodeValue;
  }
  var parser = new DOMParser();
  var parsedString = parser.parseFromString(input, 'text/html');
  return parsedString && parsedString.body.textContent;
}
function hc_axisTitleDisplayText(axisTitle, isUI) {
  if (isUI) {
    var axisLabel = document.createElement('tspan');
    axisLabel.textContent = unescapeHtmlInput(axisTitle);
    axisLabel.setAttribute('title', unescapeHtmlInput(axisTitle));
    return axisLabel.outerHTML;
  } else return '<tspan  title="' + axisTitle + '">' + axisTitle + '</tspan>';
}
function hc_buildAxisTitle(
  axisTitleText,
  axisTitleBold,
  axisTitleSize,
  axisTitleColor,
  fontFamily,
  width,
  isUI
) {
  var title = {
    text: axisTitleText,
    useHTML: 'true',
    style: {
      fontFamily: fontFamily,
      fontWeight: axisTitleBold ? 'bold' : 'normal',
      fontSize: axisTitleSize + 'px',
      color: axisTitleColor,
      maxWidth: width ? width - 80 + 'px' : '300px',
      display: 'inline-block',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      '-o-text-overflow': 'ellipsis',
      '-ms-text-overflow': 'ellipsis',
      '-moz-text-overflow': 'ellipsis',
      'white-space': 'nowrap',
      'word-wrap': 'normal',
      position: 'relative',
    },
  };
  return title;
}
function hc_addHeatmapAxisCategories(hcOptions, chartData) {
  hcOptions.xAxis = {};
  hcOptions.xAxis.categories = fetchAxisCategory(
    chartData.series[0].xAxisCategories
  );
  hcOptions.xAxis.title = null;
  hcOptions.xAxis.labels = {};
  hcOptions.xAxis.labels.rotation = -45;
  var yAxis = {};
  yAxis.categories = fetchAxisCategory(chartData.series[0].yAxisCategories);
  yAxis.title = null;
  if (hcOptions.yAxis != undefined)
    yAxis.max = hcOptions.yAxis[0].categories.length - 1;
  hcOptions.yAxis = [];
  hcOptions.yAxis.push(yAxis);
}
function hc_addBubbleAxisCategories(hcOptions, chartData) {
  hcOptions.xAxis = {};
  hcOptions.xAxis.title = {};
  hcOptions.xAxis.title.text = chartData.series[0].xAxis;
  hcOptions.yAxis = {};
  hcOptions.yAxis.title = {};
  hcOptions.yAxis.title.text = chartData.series[0].yAxis;
}
function getCategoriesFromJSONArray(category) {
  return category.fieldValues[0].value;
}
function fetchAxisCategory(categories) {
  axisCategories = [];
  if (categories) {
    for (var i = 0; i < categories.length; i++) {
      axisCategories.push(categories[i].fieldValues[0].value);
    }
  }
  return axisCategories;
}
function hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI) {
  var label_style = hc_getXAxisLabelStyle(chartProps, isUI);
  hcOptions.xAxis = {};
  if (hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.xAxis.type = 'datetime';
  } else {
    hcOptions.xAxis.categories = [];
    hcOptions.xAxis.categories = chartProps.xValues;
  }
  hcOptions.xAxis.labels = {};
  hcOptions.xAxis.labels.style = label_style;
  hcOptions.xAxis.opposite = chartProps.report_properties.x_axis_opposite;
  hcOptions.xAxis.title = {};
  var xTitleText = chartProps.report_properties.x_axis_title;
  xTitleText = xTitleText === '' || xTitleText === undefined ? '' : xTitleText;
  hcOptions.xAxis.title = hc_buildAxisTitle(
    hc_axisTitleDisplayText(xTitleText, isUI),
    chartProps.report_properties.x_axis_title_bold,
    chartProps.report_properties.x_axis_title_size,
    chartProps.report_properties.x_axis_title_color_value,
    chartProps.defaultFontFamily,
    hcOptions.chart.width,
    isUI
  );
  if (chartProps.report_properties.x_axis_display_grid) {
    hcOptions.xAxis.gridLineWidth =
      chartProps.report_properties.x_axis_grid_width;
    hcOptions.xAxis.gridLineColor =
      chartProps.report_properties.x_axis_grid_color_value;
    if (chartProps.report_properties.x_axis_line_color) {
      hcOptions.xAxis.lineColor =
        chartProps.report_properties.x_axis_line_color;
    }
    if (chartProps.report_properties.x_axis_grid_dotted)
      hcOptions.xAxis.gridLineDashStyle = 'dot';
  } else {
    hcOptions.xAxis.gridLineWidth = 0;
  }
  var yAxis = {};
  yAxis.labels = {};
  yAxis.labels.style = hc_getYAxisLabelStyle(chartProps, isUI);
  yAxis.labels.useHTML = true;
  try {
    if (
      chartProps.formattingConfiguration &&
      typeof chartProps.formattingConfiguration === 'string'
    )
      chartProps.formattingConfiguration = JSON.parse(
        chartProps.formattingConfiguration
      );
  } catch (e) {
    console.log('Failed to parse json', JSON.stringify(e));
  }
  yAxis.formatting = {
    formattingConfiguration: chartProps.formattingConfiguration,
    aggField: chartProps.agg_field,
    isUI: isUI,
    timeUnits: {
      DAY: {
        value: 'DAY',
        display: 'format_duration_day',
        order: 1,
      },
      HOUR: {
        value: 'HOUR',
        display: 'format_duration_hour',
        order: 2,
      },
      MINUTE: {
        value: 'MINUTE',
        display: 'format_duration_minute',
        order: 3,
      },
      SECOND: {
        value: 'SECOND',
        display: 'format_duration_second',
        order: 4,
      },
    },
  };
  if (chartProps.report_properties.y_axis_display_grid) {
    yAxis.gridLineWidth = chartProps.report_properties.y_axis_grid_width;
    yAxis.gridLineColor = chartProps.report_properties.y_axis_grid_color_value;
    if (chartProps.report_properties.y_axis_line_color) {
      yAxis.lineColor = chartProps.report_properties.y_axis_line_color;
    }
    if (chartProps.report_properties.y_axis_grid_dotted)
      yAxis.gridLineDashStyle = 'dot';
  } else {
    yAxis.gridLineWidth = 0;
  }
  yAxis.title = {};
  yAxis.title.margin = 20;
  yAxis.opposite = chartProps.report_properties.y_axis_opposite;
  yAxis.title.useHTML = true;
  yAxis.title.style = {};
  var yTitleText = chartProps.report_properties.y_axis_title;
  yTitleText =
    yTitleText === '' || yTitleText === undefined
      ? chartData.series[0].yTitle
      : yTitleText;
  yAxis.title = hc_buildAxisTitle(
    hc_axisTitleDisplayText(yTitleText, isUI),
    chartProps.report_properties.y_axis_title_bold,
    chartProps.report_properties.y_axis_title_size,
    chartProps.report_properties.y_axis_title_color_value,
    chartProps.defaultFontFamily,
    hcOptions.chart.height,
    isUI
  );
  if (isUI && window.isMSIE) {
    yAxis.title.style.backgroundColor = '#ffffff';
  }
  if (chartProps.aggType == 'COUNT') yAxis.allowDecimals = false;
  hcOptions.yAxis = [];
  hcOptions.yAxis.push(yAxis);
}
function hc_addSlantLabelOptions(hcOptions, chartProps, xaxis) {
  var minLabelsToSlant = 5;
  if ('slant_axis_labels' in chartProps.report_properties)
    minLabelsToSlant = chartProps.report_properties.slant_axis_labels;
  if (chartProps.xValues.length >= minLabelsToSlant) {
    hcOptions.xAxis.labels.rotation = -45;
    hcOptions.xAxis.labels.align = hcOptions.xAxis.opposite ? 'left' : 'right';
  }
  if (!xaxis) {
    hcOptions.yAxis[0].labels.rotation = -45;
    hcOptions.yAxis[0].labels.align = hcOptions.yAxis[0].opposite
      ? 'left'
      : 'right';
  }
}
function hc_addParetoChartOptions(hcOptions, chartProps, total, isUI) {
  var bar_yAxis = hcOptions.yAxis;
  bar_yAxis.lineWidth = 1;
  hcOptions.yAxis = bar_yAxis;
  var percent_axis = {};
  percent_axis.title = {};
  if (isUI) percent_axis.title.margin = 20;
  percent_axis.title.style = {};
  percent_axis.title.text = 'Percent';
  percent_axis.title.style.color = chartProps.blackColor;
  percent_axis.title.style.fontFamily = chartProps.defaultFontFamily;
  percent_axis.title.style.fontSize = chartProps.fontSize;
  if (isUI && window.isMSIE) {
    percent_axis.title.style.backgroundColor = '#ffffff';
  }
  percent_axis.alignTicks = false;
  percent_axis.gridLineWidth = 0;
  percent_axis.lineColor = '#999';
  percent_axis.lineWidth = 1;
  percent_axis.tickColor = '#666';
  percent_axis.tickWidth = 1;
  percent_axis.tickLength = 3;
  percent_axis.tickInterval = parseFloat(total) / 10;
  percent_axis.endOnTick = false;
  percent_axis.opposite = true;
  percent_axis.linkedTo = 0;
  percent_axis.labels = {};
  if (isUI) {
    percent_axis.labels.formatter = function () {
      var pcnt = Highcharts.numberFormat(
        (this.value / parseFloat(total)) * 100,
        0,
        '.'
      );
      return pcnt + '%';
    };
  } else {
    percent_axis.labels.formatter = 'hc_formatParetoAxisLabels_' + total + '_';
  }
  percent_axis.labels.style = hc_getYAxisLabelStyle(chartProps, isUI);
  percent_axis.plotLines = [];
  var percent_plot = {};
  percent_plot.color = 'blue';
  percent_plot.width = 2;
  percent_plot.value = 0.8 * total;
  percent_axis.plotLines.push(percent_plot);
  hcOptions.yAxis.push(percent_axis);
  hcOptions.legend.enabled = false;
}
function hc_addControlChartOptions(hcOptions, chartProps, chartData, isUI) {
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  if (isUI) {
    hcOptions.plotOptions = hcOptions.plotOptions || {};
    hcOptions.plotOptions.line = {};
    hcOptions.plotOptions.line.point = {};
    hcOptions.plotOptions.line.point.events = {};
    hcOptions.plotOptions.line.point.events.click = hc_dataPointClicked;
    hcOptions.tooltip.formatter = hc_formatControlToolTip;
  }
}
function hc_addBoxChartOptions(hcOptions, chartProps, chartData, isUI) {
  hcOptions.chart.type = 'boxplot';
  hcOptions.legend.enabled = false;
  hc_addXYChartOptions(hcOptions, chartProps, chartData, isUI);
  hc_addSlantLabelOptions(hcOptions, chartProps, true);
  if (isUI) hcOptions.tooltip.followPointer = true;
}
function hc_addYAxisMax(chartProps, hcOptions, chartData, chartType) {
  if (chartType == 'pareto') return;
  var seriesData = chartData.series[0];
  if (
    chartData.report_properties_series != undefined &&
    chartData.report_properties_series[0].bar_unstack === true
  ) {
    hcOptions.yAxis[0].startOnTick = true;
    hcOptions.yAxis[0].endOnTick = true;
  } else {
    if (
      (chartData.report_properties_series[0].y_axis_to === undefined ||
        chartData.report_properties_series[0].y_axis_to === '') &&
      seriesData.ymax !== undefined &&
      seriesData.ymax !== ''
    )
      hcOptions.yAxis[0].max = parseFloat(seriesData.ymax);
  }
}
function hc_addYAxisMaxSeries(seriesProps, hcOptions, seriesData, iSerie) {
  if (seriesData.series_plot_type == 'pareto') return;
  if (hcOptions.yAxis[iSerie] == undefined) return;
  if (
    seriesProps.bar_unstack != undefined &&
    seriesProps.bar_unstack === true
  ) {
    hcOptions.yAxis[iSerie].startOnTick = true;
    hcOptions.yAxis[iSerie].endOnTick = true;
  }
  if (seriesProps.y_axis_from !== undefined && seriesProps.y_axis_from !== '')
    hcOptions.yAxis[iSerie].min = seriesProps.y_axis_from;
  if (seriesProps.y_axis_to !== undefined && seriesProps.y_axis_to !== '')
    hcOptions.yAxis[iSerie].max = seriesProps.y_axis_to;
}
function hc_addYAxisIfNedded(
  hcOptions,
  chartProps,
  chartPropsSerie,
  seriesData,
  isUI,
  iSerie
) {
  if (chartPropsSerie == null) return;
  if (chartPropsSerie.show_y_axis == true) {
    var yAxis = JSON.parse(JSON.stringify(hcOptions.yAxis[0]));
    yAxis.title = hc_buildAxisTitle(
      hc_axisTitleDisplayText(chartPropsSerie.y_axis_title, isUI),
      chartProps.report_properties.y_axis_title_bold,
      chartProps.report_properties.y_axis_title_size,
      chartProps.report_properties.y_axis_title_color_value,
      chartProps.defaultFontFamily,
      hcOptions.chart.height,
      isUI
    );
    yAxis.min = null;
    yAxis.max = null;
    yAxis.opposite = true;
    yAxis.showEmpty = true;
    var color = seriesData.colors != undefined ? seriesData.colors[0] : '';
    if (yAxis.labels == undefined) yAxis.labels = {};
    yAxis.labels.formatter = null;
    if (yAxis.title.style == undefined) yAxis.title.style = {};
    if (
      chartPropsSerie.y_axis_from != undefined &&
      chartPropsSerie.y_axis_from != ''
    )
      yAxis.min = chartPropsSerie.y_axis_from;
    if (
      chartPropsSerie.y_axis_to != undefined &&
      chartPropsSerie.y_axis_to != ''
    )
      yAxis.max = chartPropsSerie.y_axis_to;
    var formattingConfiguration;
    var formattingField;
    try {
      if (
        chartProps.datasetsFormattingConfiguration &&
        typeof chartProps.datasetsFormattingConfiguration === 'string'
      )
        chartProps.datasetsFormattingConfiguration = JSON.parse(
          chartProps.datasetsFormattingConfiguration
        );
      if (
        chartProps.datasetsFormattingConfiguration[iSerie - 1]
          .formatting_configuration &&
        typeof chartProps.datasetsFormattingConfiguration[iSerie - 1]
          .formatting_configuration === 'string'
      )
        chartProps.datasetsFormattingConfiguration[
          iSerie - 1
        ].formatting_configuration = JSON.parse(
          chartProps.datasetsFormattingConfiguration[iSerie - 1]
            .formatting_configuration
        );
      formattingConfiguration =
        chartProps.datasetsFormattingConfiguration[iSerie - 1]
          .formatting_configuration;
      formattingField =
        chartProps.datasetsFormattingConfiguration[iSerie - 1].formatting_field;
    } catch (e) {
      formattingConfiguration = '';
      formattingField =
        'Failed to parse json ' +
        JSON.stringify(e) +
        '\n' +
        chartProps.datasetsFormattingConfiguration;
    }
    yAxis.formatting = {
      formattingConfiguration: formattingConfiguration,
      aggField: formattingField,
      isUI: isUI,
      timeUnits: {
        DAY: {
          value: 'DAY',
          display: 'format_duration_day',
          order: 1,
        },
        HOUR: {
          value: 'HOUR',
          display: 'format_duration_hour',
          order: 2,
        },
        MINUTE: {
          value: 'MINUTE',
          display: 'format_duration_minute',
          order: 3,
        },
        SECOND: {
          value: 'SECOND',
          display: 'format_duration_second',
          order: 4,
        },
      },
    };
    hcOptions.yAxis.push(yAxis);
    return hcOptions.yAxis.length - 1;
  } else return 0;
}
function hc_createMultipleSeriesData(hcOptions, chartData, chartProps, isUI) {
  var series = [];
  if (isAccessibilityPatternsEnabled())
    hc_enableAccessibility(hcOptions, chartData, chartProps.chartType);
  var showYAxis;
  var yAxisProps = {};
  for (var i = 0; i < chartData.series.length; i++) {
    var yAxisIndex = 0;
    var seriesData = chartData.series[i];
    var seriesName = seriesData.series_name;
    var chartPropsSerie;
    if (!chartData.report_properties_series) chartPropsSerie = chartProps;
    else chartPropsSerie = chartData.report_properties_series[i];
    if (i > 0)
      yAxisIndex = hc_addYAxisIfNedded(
        hcOptions,
        chartProps,
        chartPropsSerie,
        seriesData,
        isUI,
        i
      );
    yAxisProps[i] = yAxisIndex;
    if ('sub_series' in seriesData) {
      var stackedSeries = hc_createStackedSeriesData(
        hcOptions,
        seriesData,
        chartProps,
        isUI,
        chartPropsSerie,
        i,
        yAxisIndex,
        chartData.series.length > 1
      );
      for (j = 0; j < stackedSeries.length; j++) {
        stackedSeries[j]['zIndex'] = 999 - i;
        hc_addYAxisMaxSeries(
          chartPropsSerie,
          hcOptions,
          seriesData,
          stackedSeries[j]['yAxis']
        );
      }
      series.push.apply(series, stackedSeries);
    } else {
      if (
        'yaxis_duration' in seriesData &&
        seriesData.yaxis_duration &&
        hc_hasAxes(chartProps.chartType)
      ) {
        var iYAxis = i;
        if (hcOptions.yAxis[i] == undefined) iYAxis = 0;
        if (hcOptions.yAxis[iYAxis].labels != undefined) {
          if (isUI)
            hcOptions.yAxis[iYAxis].labels.formatter = hc_formatDurationLabel;
          else
            hcOptions.yAxis[iYAxis].labels.formatter = 'hc_formatDurationLabel';
        }
      }
      var serie = {};
      var yMin = 0;
      serie['name'] = seriesName;
      serie['type'] = hc_getHighChartsType(
        seriesData.series_plot_type,
        chartPropsSerie.bar_unstack
      );
      serie['data'] = [];
      serie['zIndex'] = 999 - i;
      serie['stack'] = seriesName;
      serie['yAxis'] = 0;
      if (chartPropsSerie.show_y_axis === true) serie['yAxis'] = yAxisIndex;
      hc_addYAxisMaxSeries(
        chartPropsSerie,
        hcOptions,
        seriesData,
        serie['yAxis']
      );
      hc_seriesStyle(
        serie['type'],
        chartPropsSerie,
        serie,
        seriesData,
        isUI,
        i,
        false,
        chartData
      );
      var firstColor;
      for (var j = 0; j < seriesData.xvalues.length; j++) {
        if (j == 0) firstColor = seriesData.colors[0];
        var dataPoint = hc_createSingleSeriesDataPt(
          chartProps,
          j,
          seriesData,
          isUI,
          chartPropsSerie,
          firstColor,
          hcOptions
        );
        serie.data.push(dataPoint);
        if (dataPoint['y'] && dataPoint['y'] < yMin) yMin = dataPoint['y'];
      }
      serie['color'] = firstColor;
      if (
        isLineType(seriesData.series_plot_type) &&
        (chartPropsSerie.y_axis_from === undefined ||
          chartPropsSerie.y_axis_from === '') &&
        (!hcOptions.yAxis[yAxisProps[i]].min ||
          yMin < hcOptions.yAxis[yAxisProps[i]].min)
      ) {
        hcOptions.yAxis[yAxisProps[i]].min = yMin;
      }
      if ('step_line' == seriesData.series_plot_type) serie['step'] = 'center';
      series.push(serie);
    }
  }
  return series;
}
function hc_createHeatmapSeriesData(chartData, chartProps, isUI) {
  var chartPropsSerie = chartData.report_properties_series[0];
  var seriesData = chartData.series[0];
  var series = {};
  series['name'] = seriesData.series_name;
  series['type'] = hc_getHighChartsType(
    seriesData.series_plot_type,
    chartData.report_properties.bar_unstack
  );
  series['data'] = [];
  for (var j = 0; j < seriesData.series.data.length; j++) {
    var dataPoint = hc_createHeatmapSeriesDataPt(
      chartProps,
      j,
      seriesData,
      chartPropsSerie,
      isUI
    );
    series.data.push(dataPoint);
  }
  series['borderWidth'] = 0.5;
  series['borderColor'] = chartData.report_properties.axis_max_color;
  return series;
}
function hc_createMapSeriesData(hcOptions, chartData, chartProps, isUI) {
  var series;
  var mapData = chartData.report_properties_series[0].map_source;
  var map = JSON.parse(mapData.map_json);
  var isGeographicalMap = mapData.is_geographical_map;
  if (isGeographicalMap) {
    var useLatLon = mapData.use_lat_lon;
    if (useLatLon)
      series = hc_createMapSeriesDataLatLon(chartData, chartProps, map, isUI);
    else
      series = hc_createMapSeriesDataHcKey(
        hcOptions,
        chartData,
        chartProps,
        map,
        isUI
      );
  } else {
    series = hc_createMapSeriesDataHcKeyNonGeographical(
      chartData,
      chartProps,
      map,
      isUI
    );
  }
  return series;
}
function hc_createMapSeriesDataLatLon(chartData, chartProps, map, isUI) {
  var series = [];
  var serie = {};
  serie['mapData'] = map;
  serie['name'] = 'Basemap';
  serie['borderColor'] = '#C2C2C2';
  serie['showInLegend'] = false;
  series.push(serie);
  serie = {};
  serie['name'] = 'Separators';
  serie['type'] = 'mapline';
  serie['data'] = Highcharts.geojson(map, 'mapline');
  serie['color'] = '#C2C2C2';
  serie['showInLegend'] = false;
  serie['enableMouseTracking'] = false;
  series.push(serie);
  var dataArray = [];
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name;
  var chartPropsSerie;
  if (chartData.report_properties_series == undefined)
    chartPropsSerie = chartProps;
  else chartPropsSerie = chartData.report_properties_series[0];
  serie = {};
  serie['name'] = seriesName;
  serie['type'] = 'mappoint';
  for (var j = 0; j < seriesData.xvalues.length; j++) {
    var data = hc_createSingleSeriesDataLocationPt(
      chartProps,
      j,
      seriesData,
      isUI,
      chartPropsSerie
    );
    if (data) dataArray.push(data);
  }
  serie['data'] = dataArray;
  series.push(serie);
  return series;
}
function hc_createMapSeriesDataHcKey(
  hcOptions,
  chartData,
  chartProps,
  map,
  isUI
) {
  var dataArray = [];
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name;
  var series = [];
  var serie = {};
  serie['mapData'] = map;
  serie['name'] = seriesName;
  serie['showInLegend'] = false;
  var joinBy = chartData.report_properties_series[0].map_source.join_by_column;
  serie['joinBy'] = [joinBy, 'name'];
  var chartPropsSerie;
  if (chartData.report_properties_series == undefined)
    chartPropsSerie = chartProps;
  else chartPropsSerie = chartData.report_properties_series[0];
  for (var j = 0; j < seriesData.xvalues.length; j++) {
    var data = hc_createSingleSeriesDataLocationHcKeyPt(
      chartProps,
      j,
      seriesData,
      isUI,
      chartPropsSerie
    );
    if (data) dataArray.push(data);
  }
  serie['data'] = dataArray;
  if (serie['data'].length == 0) hcOptions.legend.enabled = false;
  series.push(serie);
  return series;
}
function hc_createMapSeriesDataHcKeyNonGeographical(
  chartData,
  chartProps,
  map,
  isUI
) {
  var series = [];
  var serie = {};
  serie['type'] = 'map';
  serie['showInLegend'] = false;
  var joinBy = chartData.report_properties_series[0].map_source.join_by_column;
  serie['joinBy'] = [joinBy, 'name'];
  serie['mapData'] = map;
  var chartPropsSerie;
  if (chartData.report_properties_series == undefined)
    chartPropsSerie = chartProps;
  else chartPropsSerie = chartData.report_properties_series[0];
  var dataArray = [];
  var seriesData = chartData.series[0];
  for (var j = 0; j < seriesData.xvalues.length; j++) {
    var data = hc_createSingleSeriesDataLocationHcKeyPt(
      chartProps,
      j,
      seriesData,
      isUI,
      chartPropsSerie
    );
    if (data) dataArray.push(data);
  }
  serie['data'] = dataArray;
  series.push(serie);
  return series;
}
function hc_createBubbleSeriesData(chartData, chartProps, isUI) {
  var chartPropsSerie = chartData.report_properties_series[0];
  var seriesData = chartData.series[0];
  var bubbleSeriesData = [];
  for (var i = 0; i < seriesData.series.length; i++) {
    var series = {};
    series['name'] = seriesData.series[i].name;
    series['type'] = hc_getHighChartsType(
      seriesData.series_plot_type,
      chartData.report_properties.bar_unstack
    );
    series['data'] = [];
    for (var j = 0; j < seriesData.series[i].data.length; j++) {
      var dataPoint = hc_createBubbleSeriesDataPt(
        chartProps,
        j,
        seriesData.series[i].data,
        chartPropsSerie,
        isUI,
        seriesData.table_name
      );
      series.data.push(dataPoint);
    }
    bubbleSeriesData.push(series);
  }
  return bubbleSeriesData;
}
function hc_uniqueId() {
  var randomLetters = 6;
  var letters = '';
  for (var i = 0; i < randomLetters; i++)
    letters += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
  var k = Math.floor(Math.random() * 1000000);
  return Date.now() + '-' + letters + '-' + k;
}
function createPatterns(id, colors) {
  return [
    'M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11',
    'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
    'M 3 0 L 3 10 M 8 0 L 8 10',
    'M 0 3 L 10 3 M 0 8 L 10 8',
    'M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7',
    'M 3 3 L 8 3 L 8 8 L 3 8 Z',
    'M 5 5 m -4 0 a 4 4 0 1 1 8 0 a 4 4 0 1 1 -8 0',
    'M 10 3 L 5 3 L 5 0 M 5 10 L 5 7 L 0 7',
    'M 2 5 L 5 2 L 8 5 L 5 8 Z',
    'M 0 0 L 5 10 L 10 0',
  ].map(function eachPattern(pattern, i) {
    return {
      id: 'highcharts-custom-pattern-' + id + '-' + i,
      width: 10,
      height: 10,
      path: {
        d: pattern,
      },
      color: colors[i],
    };
  });
}
function getPatterns(uniqueId) {
  var colors = Highcharts.getOptions().colors;
  var id = uniqueId || hc_uniqueId();
  return createPatterns(id, colors);
}
function getDashStyles() {
  return [
    'Solid',
    'ShortDash',
    'ShortDot',
    'ShortDashDot',
    'ShortDashDotDot',
    'Dot',
    'Dash',
    'LongDash',
    'DashDot',
    'LongDashDot',
    'LongDashDotDot',
  ];
}
function hc_enableAccessibility(hcOptions, chartData, chartType) {
  chartData.series.forEach(function a11ySeries(serie, i) {
    var colors = chartData.series[i].colors;
    var Highcharts = window.Highcharts;
    var patterns =
      (Highcharts && Highcharts.patterns) ||
      createPatterns(hc_uniqueId(), colors);
    colors.forEach(function a11yColor(color, j) {
      if (
        isLineType(chartType) &&
        chartType !== 'line_bar' &&
        chartType !== 'area'
      )
        chartData.series[i].colors[j] = '#000';
      else {
        var patternIndex = (j % 10) + '';
        var pattern = patterns[patternIndex];
        if (pattern) {
          var patternCopy = JSON.parse(JSON.stringify(pattern));
          patternCopy.color = color;
          chartData.series[i].colors[j] = {
            pattern: patternCopy,
          };
        }
      }
    });
  });
}
function hc_createSingleSeriesData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  if (isAccessibilityPatternsEnabled())
    hc_enableAccessibility(hcOptions, chartData, chartProps.chartType);
  var chartPropSerie = chartData.report_properties_series[0];
  var seriesName = seriesData.series_name;
  if (
    'yaxis_duration' in seriesData &&
    seriesData.yaxis_duration &&
    hc_hasAxes(chartProps.chartType)
  ) {
    if (isUI) hcOptions.yAxis[0].labels.formatter = hc_formatDurationLabel;
    else hcOptions.yAxis[0].labels.formatter = 'hc_formatDurationLabel';
  }
  var series = {};
  var yMin = 0;
  series['name'] = seriesName;
  series['type'] = hc_getHighChartsType(
    seriesData.series_plot_type,
    chartData.report_properties.bar_unstack
  );
  series['data'] = [];
  if (
    chartProps.chartType == 'angular_gauge' ||
    chartProps.chartType == 'solid_gauge'
  ) {
    var point = {};
    point.y = parseFloat(seriesData.yvalues);
    point.y_tooltip = seriesData.ydisplayvalues;
    point.displayvalue = seriesData.ydisplayvalues;
    point.table = seriesData.table_name;
    point.click_url_info = chartPropSerie.filter;
    if ('list_ui_view_name' in chartPropSerie)
      point['list_ui_view_name'] = chartPropSerie.list_ui_view_name;
    if ('report_drilldown' in chartPropSerie)
      point['report_drilldown'] = chartPropSerie.report_drilldown;
    if ('drill_open_new_win' in chartProps.report_properties)
      point['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      point['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      point['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
    series.data.push(point);
    return series;
  }
  if (isLineType(seriesData.series_plot_type))
    series['color'] = seriesData.colors[0];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPoint = hc_createSingleSeriesDataPt(
      chartProps,
      j,
      seriesData,
      isUI,
      chartPropSerie,
      undefined,
      hcOptions
    );
    series.data.push(dataPoint);
    if (dataPoint['y'] && dataPoint['y'] < yMin) yMin = dataPoint['y'];
  }
  if (
    isLineType(chartProps.chartType) &&
    (chartProps.report_properties.y_axis_from === undefined ||
      chartProps.report_properties.y_axis_from === '')
  )
    hcOptions.yAxis[0].min = yMin;
  if (chartProps.chartType == 'donut' || chartProps.chartType == 'semi_donut') {
    series['total'] = seriesData.display_human_readable_total;
    series['total_value'] = seriesData.display_grid_total;
  }
  return series;
}
function hc_hasAxes(chartType) {
  return !(
    chartType === 'angular_gauge' ||
    chartType === 'solid_gauge' ||
    chartType === 'pie' ||
    chartType === 'solid_gauge' ||
    chartType === 'funnel' ||
    chartType === 'donut' ||
    chartType === 'semi_donut' ||
    chartType === 'pyramid'
  );
}
function hc_createStackedSeriesData(
  hcOptions,
  seriesData,
  chartProps,
  isUI,
  chartPropsSerie,
  serieIndex,
  yAxisIndex,
  isMultiseries
) {
  if (
    'yaxis_duration' in seriesData &&
    seriesData.yaxis_duration &&
    hc_hasAxes(chartProps.chartType) &&
    (yAxisIndex == 0 || (yAxisIndex > 0 && chartPropsSerie.show_y_axis == true))
  ) {
    if (hcOptions.yAxis[yAxisIndex] == undefined) {
      hcOptions.yAxis[yAxisIndex] = {};
      hcOptions.yAxis[yAxisIndex].labels = {};
    }
    if (isUI)
      hcOptions.yAxis[yAxisIndex].labels.formatter = hc_formatDurationLabel;
    else
      hcOptions.yAxis[yAxisIndex].labels.formatter = 'hc_formatDurationLabel';
  }
  var x2Vals = seriesData.x2values;
  var x2Colors = seriesData.colors;
  var subSeriesList = seriesData.sub_series;
  var subSeriesDataArray = [];
  for (var j = 0; j < seriesData.xvalues.length; j++)
    subSeriesDataArray.push(subSeriesList[j]);
  var series = [];
  var yMin = 0;
  var isSlowMetricTable = hc_isSlowMetricChart(hcOptions, seriesData);
  hcOptions.yAxis[yAxisIndex].reversedStacks =
    chartPropsSerie.bar_unstack || false;
  for (var i = 0; i < x2Vals.length; i++) {
    var subseries = {};
    subseries.name = x2Vals[i].displayValue;
    if (chartProps.report_properties != undefined && isMultiseries)
      subseries.name = '[' + seriesData.series_name + '] ' + subseries.name;
    subseries.data = [];
    subseries['type'] = hc_getHighChartsType(
      seriesData.series_plot_type,
      chartPropsSerie.bar_unstack
    );
    subseries['legend_label_max_length'] =
      chartPropsSerie.legend_label_max_size;
    subseries['id'] = seriesData.series_name;
    subseries['stack'] = seriesData.series_name;
    subseries['yAxis'] = yAxisIndex;
    if (isAccessibilityPatternsEnabled())
      subseries['dashStyle'] = getDashStyles()[i % x2Vals.length];
    if (chartPropsSerie.show_y_axis === true) subseries['yAxis'] = yAxisIndex;
    hc_seriesStyle(
      subseries['type'],
      chartPropsSerie,
      subseries,
      seriesData,
      isUI,
      serieIndex,
      true
    );
    var dataExistsForX2Val = false;
    var categoryIndx;
    var max = Number.MIN_VALUE;
    var min = Number.MAX_VALUE;
    var total = 0;
    var count = 0;
    for (var j = 0; j < seriesData.xvalues.length; j++) {
      var subSeriesData = subSeriesDataArray[j];
      categoryIndx = j;
      var dataPoint = hc_initStackedSeriesDataPoint(
        i,
        j,
        x2Vals,
        x2Colors,
        chartProps,
        seriesData.table_name,
        seriesData.table_display_plural,
        isUI,
        chartPropsSerie,
        seriesData,
        categoryIndx
      );
      var dataFilled = false;
      if (subSeriesData && subSeriesData.xvalues) {
        for (var k = 0; k < subSeriesData.xvalues.length; k++) {
          if (
            x2Vals[i].value == subSeriesData.xvalues[k].value ||
            x2Vals[i].value == subSeriesData.xvalues[k]
          ) {
            dataExistsForX2Val = true;
            dataFilled = true;
            hc_fillStackedSeriesDataPoint(
              dataPoint,
              k,
              subSeriesData,
              chartProps,
              isUI,
              chartPropsSerie,
              categoryIndx,
              isSlowMetricTable,
              chartProps.xValues[j],
              chartProps.origXValues[j]
            );
            break;
          }
        }
      }
      if (!isSlowMetricTable || dataFilled) {
        subseries.data.push(dataPoint);
        if (isSlowMetricTable && dataPoint['y']) {
          max = Math.max(max, dataPoint['y']);
          min = Math.min(min, dataPoint['y']);
          total += dataPoint['y'];
          count++;
        }
      }
      if (dataPoint['y'] && dataPoint['y'] < yMin) yMin = dataPoint['y'];
    }
    if (isSlowMetricTable) {
      subseries.max = max;
      subseries.min = min;
      subseries.total = total;
      subseries.average = total / count;
    }
    if (seriesData.series_plot_type === 'step_line') subseries.step = 'center';
    if (dataExistsForX2Val) {
      subseries.color = x2Colors[i];
      series.push(subseries);
    }
  }
  if (
    isLineType(seriesData.series_plot_type) &&
    (chartPropsSerie.y_axis_from === undefined ||
      chartPropsSerie.y_axis_from === '')
  )
    hcOptions.yAxis[yAxisIndex].min = yMin;
  if (isSlowMetricTable) {
    series.sort(function (x, y) {
      return x.total - y.total;
    });
  }
  return series;
}
function hc_seriesStyle(
  type,
  chartPropsSerie,
  serie,
  seriesData,
  isUI,
  i,
  stacked,
  chartData
) {
  if ('column' === type || 'bar' === type) {
    if (chartPropsSerie.bar_unstack === true) serie.stacking = '';
    else serie.stacking = 'normal';
  }
  if ('line' === type || 'area' === type || 'spline' === type) {
    var showMarker = chartPropsSerie.show_marker;
    serie.marker = {};
    serie.marker.enabled = showMarker;
  }
  serie.color = seriesData.colors[i];
  if (
    'column' === type ||
    'bar' === type ||
    isLineType(type) ||
    'trend' === type
  ) {
    var dataLabelColor = '#606060';
    if (chartPropsSerie.show_chart_data_label === true) {
      serie.dataLabels = {};
      serie.dataLabels.enabled = true;
      serie.dataLabels.softConnector = false;
      serie.dataLabels.distance = 15;
      serie.dataLabels.style = {};
      serie.dataLabels.style.fontFamily = 'Arial';
      serie.dataLabels.style.fontSize = convertToPx('10pt');
      serie.dataLabels.style.color = dataLabelColor;
      serie.dataLabels.style.fill = dataLabelColor;
      serie.dataLabels.style.fontWeight = 'normal';
      serie.dataLabels.inside = false;
      if (serie.sub_series != undefined) serie.dataLabels.inside = true;
      if (
        'font_family' in chartPropsSerie &&
        chartPropsSerie.font_family != ''
      ) {
        serie.dataLabels.style.fontFamily = chartPropsSerie.font_family;
      }
      if (
        chartData &&
        chartData.report_properties &&
        chartData.report_properties.font_family
      ) {
        serie.dataLabels.style.fontFamily =
          chartData.report_properties.font_family;
      }
      if ('font_size' in chartPropsSerie && chartPropsSerie.font_size != '')
        serie.dataLabels.style.fontSize = convertToPx(
          chartPropsSerie.font_size
        );
      if (isUI) serie.dataLabels.formatter = hc_formatValueLabel;
      else serie.dataLabels.formatter = 'hc_formatValueLabel';
    } else {
      serie.dataLabels = {};
      serie.dataLabels.enabled = false;
    }
  }
  if (isUI) {
    if (
      isLineType(type) ||
      'column' === type ||
      'bar' === type ||
      'horizontal_bar' === type
    ) {
      serie.tooltip = {};
      if (stacked) serie.tooltip.tooltipText = 'stacked';
      else serie.tooltip.tooltipText = 'non-stacked';
    }
  }
}
function hc_createParetoCumulSeries(hcOptions, chartProps, series0, isUI) {
  var total = 0;
  var cumulative_totals = [];
  var cumulative_percent = [];
  for (var i = 0; i < series0.data.length; i++) {
    total = parseFloat(total) + parseFloat(series0.data[i].y);
    cumulative_totals.push(total);
  }
  var cuml_percent = 0;
  for (var i = 0; i < series0.data.length; i++) {
    var percent = (parseFloat(series0.data[i].y) / parseFloat(total)) * 100;
    cuml_percent = parseFloat(cuml_percent) + parseFloat(percent);
    var s = cuml_percent.toString();
    var k = s.indexOf('.');
    if (k >= 0) {
      var sub = s.substring(0, k);
      var rem = s.substring(k + 1);
      if (rem.length > 2) {
        sub += '.';
        for (var j = 0; j < 2; j++) sub += rem[j];
      } else sub += '.' + rem;
      cumulative_percent.push(sub);
    } else cumulative_percent.push(s);
  }
  var cumulative_series = {};
  cumulative_series.type = 'line';
  cumulative_series.name = 'pareto_series';
  cumulative_series.data = [];
  for (var i = 0; i < cumulative_totals.length; i++) {
    var dataPoint = {};
    dataPoint['y'] = cumulative_totals[i];
    dataPoint['percent'] = cumulative_percent[i];
    cumulative_series.data.push(dataPoint);
  }
  hc_addParetoChartOptions(hcOptions, chartProps, total, isUI);
  return cumulative_series;
}
function hc_createSingleSeriesDataPt(
  chartProps,
  indx,
  seriesData,
  isUI,
  chartSerieProps,
  color,
  hcOptions
) {
  var yVal;
  var dataPoint = {};
  dataPoint['legend_label_max_length'] =
    chartProps.report_properties.legend_label_max_size;
  dataPoint['name'] = seriesData.xvalues[indx];
  if (chartProps.origXValues[indx] == chartProps.otherKey)
    dataPoint['name'] = chartProps.xValues[indx];
  if (seriesData.yvalues[indx] !== undefined && seriesData.yvalues[indx])
    yVal = parseFloat(seriesData.yvalues[indx]);
  else yVal = null;
  var dataPointName = dataPoint['name'];
  if (dataPointName.length > chartProps.maxAllowedLabelLen) {
    dataPointName =
      dataPointName.substring(0, chartProps.maxAllowedLabelLen - 3) + '...';
  }
  if (hc_isSlowMetricChart(hcOptions, seriesData))
    dataPoint['x'] = hc_convertDateTimeFormatToUnixTime(
      seriesData.xvalues[indx]
    );
  else dataPoint['x'] = indx;
  dataPoint['origXValue'] = chartProps.origXValues[indx];
  dataPoint['y'] = yVal;
  if (!isLineType(seriesData.series_plot_type))
    dataPoint['color'] = seriesData.colors[indx];
  else dataPoint['color'] = color;
  dataPoint['y_tooltip'] = seriesData.ydisplayvalues[indx];
  dataPoint['y_formatted'] =
    typeof seriesData.yformatted_displayvalues !== 'undefined'
      ? seriesData.yformatted_displayvalues[indx]
      : seriesData.ydisplayvalues[indx];
  dataPoint['chart_type'] = chartProps.chartType;
  dataPoint['tooltip_date'] = seriesData.span_dates[indx]
    ? seriesData.span_dates[indx]
    : '';
  dataPoint['valid'] =
    seriesData.valids != undefined ? seriesData.valids[indx] === 'true' : true;
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (chartProps.origXValues[indx] == chartProps.otherKey)
      dataPoint['isOther'] = true;
    else dataPoint['isOther'] = false;
    if (chartProps.chartType == 'hist') {
      dataPoint['tt_label_min'] = chartProps.report_properties.hist_min;
      dataPoint['tt_label_max'] = chartProps.report_properties.hist_max;
      dataPoint['tt_label_cnt'] = chartProps.report_properties.hist_count;
    }
    if (
      'percents_from_count' in chartProps.report_properties &&
      chartProps.report_properties.percents_from_count
    )
      dataPoint['percent_count'] = true;
    else dataPoint['percent_count'] = false;
    if ('percentages' in seriesData && seriesData.percentages[indx])
      dataPoint['percent'] = seriesData.percentages[indx];
    generateSeriesUrlInfo(
      dataPoint,
      indx,
      dataPoint['isOther'],
      seriesData,
      chartSerieProps,
      undefined,
      chartProps,
      seriesData['table_name']
    );
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
  } else if (
    chartProps.chartType == 'pie' ||
    chartProps.chartType == 'semi_donut' ||
    chartProps.chartType == 'donut' ||
    chartProps.chartType == 'funnel' ||
    chartProps.chartType == 'pyramid'
  ) {
    if ('percentages' in seriesData)
      dataPoint['percent'] = seriesData.percentages[indx];
  }
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}
function isVariablesGroupby(groupby) {
  return groupby && groupby.startsWith('variables.');
}
function removeNonConditionTerms(filter) {
  var ignoreExpressions = [
    /^\s*$/,
    /^ORDERBY/,
    /^ORDERBYDESC/,
    /^GROUPBY/,
    /^TRENDBY/,
  ];
  if (!filter) return '';
  var terms = filter.split('^');
  var validTerms = [];
  for (var i = 0; i < terms.length; i++) {
    if (isToBeIgnored(terms[i], ignoreExpressions)) continue;
    validTerms.push(terms[i]);
  }
  var validFilter = validTerms.join('^');
  if (validFilter && validFilter.endsWith('^EQ'))
    validFilter = validFilter.substring(0, validFilter.length - 3);
  return validFilter;
}
function isToBeIgnored(value, ignoreExpressions) {
  for (i = 0; i < ignoreExpressions.length; i++) {
    if (ignoreExpressions[i].test(value)) return true;
  }
  return false;
}
function combineQueries(filter, aggregateQuery) {
  if (!filter) return aggregateQuery;
  if (!aggregateQuery) return filter;
  var filterQueries = filter.split('^NQ');
  for (var i = 0; i < filterQueries.length; i++)
    filterQueries[i] += '^' + aggregateQuery;
  return filterQueries.join('^NQ');
}
function canReportTypeActAsInteractiveFilter(chartType) {
  var supportedPublisherChartTypes = [
    'pie',
    'donut',
    'semi_donut',
    'funnel',
    'pyramid',
    'map',
  ];
  return supportedPublisherChartTypes.indexOf(chartType) > -1;
}
function generateSeriesUrlInfo(
  dataPoint,
  indx,
  isOther,
  seriesData,
  chartSerieProps,
  aggregateQueryPerSeries,
  chartProps,
  tableName
) {
  var isChartActsAsFilter = canReportTypeActAsInteractiveFilter(
    chartProps.chartType
  );
  if (isOther) {
    if (
      isChartActsAsFilter &&
      Array.isArray(seriesData.aggregate_query) &&
      seriesData.aggregate_query.length
    ) {
      var nonOtherDataPoints = seriesData.aggregate_query.filter(function (
        item
      ) {
        return item !== 'zzyynomatchaabb';
      });
      dataPoint.legend_deselect_filter = nonOtherDataPoints.join('^OR');
      dataPoint.publisher_filter = nonOtherDataPoints
        .map(function (item) {
          return item.replace('=', '!=');
        })
        .join('^');
    }
    dataPoint.click_url_info = generateOtherUrlInfo(
      indx,
      chartProps,
      tableName,
      chartSerieProps
    );
    return;
  }
  var categoryItemCondition = '';
  if (
    isVariablesGroupby(chartSerieProps.groupby) &&
    chartSerieProps.sc_groupby_item_id
  )
    categoryItemCondition = '^cat_item=' + chartSerieProps.sc_groupby_item_id;
  if (
    !categoryItemCondition &&
    chartSerieProps.stackby &&
    isVariablesGroupby(chartSerieProps.stackby) &&
    chartSerieProps.sc_stackby_item_id
  ) {
    categoryItemCondition = '^cat_item=' + chartSerieProps.sc_stackby_item_id;
  }
  var aggregateQuery = aggregateQueryPerSeries
    ? seriesData[indx].aggregate_query
    : seriesData.aggregate_query[indx];
  var filter = removeNonConditionTerms(chartSerieProps.filter);
  dataPoint['click_url_info'] = combineQueries(
    combineQueries(
      combineQueries(filter, categoryItemCondition),
      aggregateQuery
    ),
    extractOrderByConditions(chartProps.filter_with_orderby)
  );
  var publisherFilter = removeNonConditionTerms(
    chartProps.report_properties.publisher_filter
  );
  dataPoint['publisher_filter'] = combineQueries(
    combineQueries(publisherFilter, categoryItemCondition),
    aggregateQuery
  );
  if (aggregateQuery && isChartActsAsFilter && chartSerieProps.groupby) {
    var notAggregateQry = getNotAggregateQuery(aggregateQuery, chartSerieProps);
    dataPoint.legend_deselect_filter = combineQueries(
      combineQueries(publisherFilter, categoryItemCondition),
      notAggregateQry
    );
  }
}
function getNotAggregateQuery(aggregateQuery, chartSerieProps) {
  if (!chartSerieProps.hasRanges) {
    if (!aggregateQuery.split('=')[1])
      return chartSerieProps.groupby + '!=NULL';
    else
      return (
        aggregateQuery.replace('=', '!=') +
        '^OR' +
        chartSerieProps.groupby +
        '=NULL'
      );
  } else {
    var aggregateQueryAry = aggregateQuery.split('^');
    if (aggregateQueryAry.length == 1) {
      aggQuery = aggregateQueryAry[0];
      if (aggQuery.indexOf('ISEMPTY') > -1)
        return aggQuery.replace('ISEMPTY', 'ISNOTEMPTY');
      else if (aggQuery.indexOf('IN') > -1)
        return aggQuery.replace('IN', 'NOT IN');
    }
    var notAggregateQuery = [];
    aggregateQueryAry.forEach(function (query) {
      var updatedQry = '';
      if (query.indexOf('<=') > -1) updatedQry = query.replace('<=', '>');
      else if (query.indexOf('>=') > -1) updatedQry = query.replace('>=', '<');
      else if (query.indexOf('>') > -1) updatedQry = query.replace('>', '<=');
      else if (query.indexOf('<') > -1) updatedQry = query.replace('<', '>=');
      else if (query.indexOf('=') > -1) updatedQry = query.replace('=', '!=');
      notAggregateQuery.push(updatedQry);
    });
    return (
      notAggregateQuery.join('^OR') +
      '^OR' +
      chartSerieProps.groupby +
      'ISEMPTY'
    );
  }
}
function extractOrderByConditions(filter) {
  if (!filter) return '';
  var validExpressions = [/^ORDERBY/, /^ORDERBYDESC/];
  var terms = filter.split('^');
  var validTerms = [];
  for (var i = 0; i < terms.length; i++) {
    if (isToBeIgnored(terms[i], validExpressions)) validTerms.push(terms[i]);
  }
  var validFilter = validTerms.join('^');
  if (validFilter && validFilter.endsWith('^EQ'))
    validFilter = validFilter.substring(0, validFilter.length - 3);
  return validFilter;
}
function generateOtherUrlInfo(indx, chartProps, tableName, chartSerieProps) {
  var urlObj = {};
  var urlString = 'report_viewer.do?';
  var pagenum = parseInt(chartProps.page_num) + 1;
  if (chartSerieProps.report_id) {
    urlObj = {
      jvar_report_id: [chartSerieProps.report_id],
      sysparm_other_series: [chartSerieProps.report_id],
      sysparm_page_num: [pagenum],
    };
    if (chartProps.interactive_report)
      urlObj.sysparm_interactive_report = chartProps.interactive_report;
  } else {
    var reportProps = chartProps.report_properties;
    if (reportProps) {
      urlObj = {
        sysparm_bar_unstack: [chartSerieProps.bar_unstack],
        sysparm_show_chart_total: [reportProps.show_chart_total],
        sysparm_show_other: [chartProps.show_other],
        sysparm_lower_limit: [reportProps.lower_limit],
        sysparm_title: [chartProps.title],
        sysparm_table: [tableName],
        sysparm_compute_percent: [reportProps.percents_from_count],
        sysparm_custom_chart_size: [reportProps.custom_chart_size],
        sysparm_color_palette: [chartSerieProps.color_palette],
        sysparm_gauge_autoscale: [reportProps.gauge_autoscale],
        sysparm_aggregate: [chartProps.aggType],
        sysparm_show_marker: [chartSerieProps.show_marker],
        sysparm_show_chart_data_label: [reportProps.show_chart_data_label],
        sysparm_page_num: [pagenum],
        sysparm_type: [chartProps.chartType],
        sysparm_chart_size: [chartProps.chartSize],
        sysparm_direction: [reportProps.direction],
        sysparm_field: [chartSerieProps.groupby],
        sysparm_set_color: [chartSerieProps.set_color],
        sysparm_funnel_neck_percent: [reportProps.funnel_neck_percent],
        sysparm_from: [reportProps.from],
        sysparm_donut_width_percent: [reportProps.donut_width_percent],
        sysparm_others: [chartProps.other_threshold],
        sysparm_chart_color: [chartSerieProps.color],
        sysparm_display_grid: [chartProps.display_grid],
        sysparm_to: [reportProps.to],
        sysparm_upper_limit: [reportProps.upper_limit],
        sysparm_box_field: [chartProps.box_field],
        sysparm_query: [chartProps.filter_with_orderby],
        sysparm_sumfield: [chartProps.agg_field],
        sysparm_stack_field: [chartProps.stack_field],
        sysparm_trend_field: [chartProps.trend_field],
        sysparm_trend_interval: [chartProps.trend_interval],
        sysparm_chart_colors: [chartProps.colors],
      };
      if (reportProps.custom_chart_size) {
        urlObj.sysparm_custom_chart_height = chartProps.chart_height;
        urlObj.sysparm_custom_chart_width = chartProps.chart_width;
      }
    }
  }
  return urlString + jQuery.param(urlObj, true);
}
function hc_createSingleSeriesDataLocationPt(
  chartProps,
  indx,
  seriesData,
  isUI,
  chartSerieProps
) {
  var location = seriesData.locations[indx];
  if (!location || !location.name) return;
  var dataPoint = {};
  dataPoint['legend_label_max_length'] =
    chartProps.report_properties.legend_label_max_size;
  dataPoint['name'] = location.city;
  dataPoint['street'] = location.street;
  dataPoint['city'] = location.city;
  dataPoint['state'] = location.state;
  dataPoint['country'] = location.country;
  dataPoint['lat'] = Number(location.latitude);
  dataPoint['lon'] = Number(location.longitude);
  dataPoint['valid'] =
    seriesData.valids != undefined ? seriesData.valids[indx] === 'true' : true;
  dataPoint['y_tooltip'] = seriesData.ydisplayvalues[indx];
  dataPoint['y_formatted'] =
    typeof seriesData.yformatted_displayvalues !== 'undefined'
      ? seriesData.yformatted_displayvalues[indx]
      : seriesData.ydisplayvalues[indx];
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (chartProps.origXValues[indx] == chartProps.otherKey)
      dataPoint['isOther'] = true;
    else dataPoint['isOther'] = false;
    if (
      'percents_from_count' in chartProps.report_properties &&
      chartProps.report_properties.percents_from_count
    )
      dataPoint['percent_count'] = true;
    else dataPoint['percent_count'] = false;
    if ('percentages' in seriesData && seriesData.percentages[indx])
      dataPoint['percent'] = seriesData.percentages[indx];
    if ('click_url_info' in seriesData && seriesData.click_url_info[indx])
      dataPoint['click_url_info'] = seriesData.click_url_info[indx];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    if ('report_drilldown_zoom' in chartSerieProps)
      dataPoint['report_drilldown_zoom'] =
        chartSerieProps.report_drilldown_zoom;
    if ('report_drilldown_map' in chartSerieProps)
      dataPoint['report_drilldown_map'] = chartSerieProps.report_drilldown_map;
    dataPoint['isLatLon'] = true;
    dataPoint['show_data_label'] = chartSerieProps.show_chart_data_label;
    dataPoint['show_geographical_label'] =
      chartSerieProps.show_geographical_label;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
  }
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}
function hc_createSingleSeriesDataLocationHcKeyPt(
  chartProps,
  indx,
  seriesData,
  isUI,
  chartSerieProps
) {
  var location = seriesData.locations[indx];
  if (!location || !location.name) return;
  var dataPoint = {};
  dataPoint['name'] = location.name;
  dataPoint['y_tooltip'] = seriesData.ydisplayvalues[indx];
  dataPoint['value'] = seriesData.yvalues[indx];
  dataPoint['display_value'] = seriesData.ydisplayvalues[indx];
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (chartProps.origXValues[indx] == chartProps.otherKey)
      dataPoint['isOther'] = true;
    else dataPoint['isOther'] = false;
    if (
      'percents_from_count' in chartProps.report_properties &&
      chartProps.report_properties.percents_from_count
    )
      dataPoint['percent_count'] = true;
    else dataPoint['percent_count'] = false;
    if ('percentages' in seriesData && seriesData.percentages[indx])
      dataPoint['percent'] = seriesData.percentages[indx];
    if ('click_url_info' in seriesData && seriesData.click_url_info[indx])
      dataPoint['click_url_info'] = seriesData.click_url_info[indx];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    if ('report_drilldown_zoom' in chartSerieProps)
      dataPoint['report_drilldown_zoom'] =
        chartSerieProps.report_drilldown_zoom;
    if ('report_drilldown_map' in chartSerieProps)
      dataPoint['report_drilldown_map'] = chartSerieProps.report_drilldown_map;
    dataPoint['isLatLon'] = false;
    dataPoint['show_data_label'] = chartSerieProps.show_chart_data_label;
    dataPoint['show_geographical_label'] =
      chartSerieProps.show_geographical_label;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
  }
  return dataPoint;
}
function hc_createHeatmapSeriesDataPt(
  chartProps,
  indx,
  seriesData,
  chartSerieProps,
  isUI
) {
  var xIndex = 0,
    yIndex = 1,
    valueIndex = 2,
    displayValueIndex = 3,
    tooltipIndex = 4,
    clickUrlIndex = 5;
  var val;
  var dataPoint = {};
  dataPoint['legend_label_max_length'] =
    chartProps.report_properties.legend_label_max_size;
  dataPoint['name'] = chartProps.origXValues[indx];
  dataPoint['x'] = seriesData.series.data[indx][xIndex];
  dataPoint['y'] = seriesData.series.data[indx][yIndex];
  if (seriesData.series.data[indx][valueIndex] === null) val = 0;
  else val = parseFloat(seriesData.series.data[indx][valueIndex]);
  dataPoint['value'] = val;
  if (seriesData.series.data[indx][displayValueIndex])
    dataPoint['value_display'] =
      seriesData.series.data[indx][displayValueIndex];
  else dataPoint['value_display'] = '0';
  if (
    dataPoint['value_display'] === '0' &&
    chartProps.report_properties.show_zero === false
  )
    dataPoint['value_display'] = '';
  if (isUI) {
    dataPoint['table'] = seriesData.table_name;
    dataPoint['isOther'] = false;
    dataPoint['percent_count'] = false;
    if (seriesData.series.data[indx][clickUrlIndex]) {
      dataPoint['click_url_info'] = generateHeatMapClickUrl(
        seriesData,
        indx,
        clickUrlIndex,
        chartProps.filter_with_orderby
      );
    }
    if (seriesData.series.data[indx][tooltipIndex])
      dataPoint['value_tooltip'] = seriesData.series.data[indx][tooltipIndex];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
  }
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}
function generateHeatMapClickUrl(
  seriesData,
  indx,
  clickUrlIndex,
  filterWithOrderby
) {
  var showOther = seriesData.sysparm_show_other;
  var xAxisCategoryCount = seriesData.xAxisCategories.length;
  var aggregateQuery = seriesData.series.data[indx][clickUrlIndex];
  var filter = removeNonConditionTerms(seriesData.filter);
  if (
    showOther &&
    (indx + 1) % xAxisCategoryCount === 0 &&
    seriesData.otherQuery
  ) {
    aggregateQuery = aggregateQuery + '^' + seriesData.otherQuery;
  }
  return combineQueries(
    combineQueries(filter, aggregateQuery),
    extractOrderByConditions(filterWithOrderby)
  );
}
function hc_createBubbleSeriesDataPt(
  chartProps,
  indx,
  seriesData,
  chartSerieProps,
  isUI,
  table_name
) {
  var dataPoint = {};
  dataPoint['name'] = chartProps.origXValues[indx];
  dataPoint['x'] = seriesData[indx]['x'];
  dataPoint['y'] = seriesData[indx]['y'];
  dataPoint['z'] = seriesData[indx]['z'];
  dataPoint['value_display'] = seriesData[indx]['value_display'];
  if (isUI) {
    dataPoint['table'] = table_name;
    generateSeriesUrlInfo(
      dataPoint,
      indx,
      false,
      seriesData,
      chartSerieProps,
      true,
      chartProps,
      dataPoint['table']
    );
    dataPoint['value_tooltip'] = seriesData[indx]['value_tooltip'];
    if ('list_ui_view_name' in chartSerieProps)
      dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
    if ('report_drilldown' in chartSerieProps)
      dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
  }
  return dataPoint;
}
function hc_initStackedSeriesDataPoint(
  indx,
  indx2,
  x2Vals,
  x2Colors,
  chartProps,
  tblName,
  tblDispPlural,
  isUI,
  serieProps,
  seriesData,
  categoryIndx
) {
  var dataPoint = {};
  if (categoryIndx != undefined) dataPoint['x'] = categoryIndx;
  dataPoint['y'] = serieProps.use_null ? null : 0;
  dataPoint['name'] = x2Vals[indx].displayValue;
  dataPoint['color'] = x2Colors[indx];
  dataPoint['table'] = tblName;
  dataPoint['table_display_plural'] = tblDispPlural;
  dataPoint['isOther'] = false;
  if (
    seriesData &&
    Array.isArray(seriesData.span_dates) &&
    seriesData.span_dates[indx2]
  )
    dataPoint['tooltip_date'] = seriesData.span_dates[indx2];
  if (chartProps.origXValues[indx2] == chartProps.otherKey)
    dataPoint['isOther'] = true;
  dataPoint['valid'] = false;
  hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
  return dataPoint;
}
function hc_fillStackedSeriesDataPoint(
  dataPoint,
  indx,
  subSeriesData,
  chartProps,
  isUI,
  chartPropsSerie,
  categoryIndx,
  isSlowMetricTable,
  datetime,
  origXValue
) {
  dataPoint['valid'] = true;
  if (
    'percents_from_count' in chartPropsSerie &&
    chartPropsSerie.percents_from_count
  )
    dataPoint['percent_count'] = true;
  else dataPoint['percent_count'] = false;
  if (categoryIndx != undefined) dataPoint['x'] = categoryIndx;
  dataPoint['origXValue'] = origXValue;
  dataPoint['y'] = subSeriesData.yvalues[indx]
    ? parseFloat(subSeriesData.yvalues[indx])
    : null;
  dataPoint['y_tooltip'] = subSeriesData.ydisplayvalues[indx];
  dataPoint['y_formatted'] =
    typeof subSeriesData.yformatted_displayvalues !== 'undefined'
      ? subSeriesData.yformatted_displayvalues[indx]
      : subSeriesData.ydisplayvalues[indx];
  dataPoint['percent'] = subSeriesData.percentages[indx];
  if (isUI) {
    if (
      dataPoint['isOther'] ||
      (subSeriesData.aggregate_query && subSeriesData.aggregate_query[indx])
    )
      generateSeriesUrlInfo(
        dataPoint,
        indx,
        dataPoint['isOther'],
        subSeriesData,
        chartPropsSerie,
        undefined,
        chartProps,
        dataPoint['table']
      );
    dataPoint['list_ui_view_name'] = chartPropsSerie.list_ui_view_name;
    dataPoint['report_drilldown'] = chartPropsSerie.report_drilldown;
    dataPoint['drill_open_new_win'] = false;
    if ('drill_open_new_win' in chartProps.report_properties)
      dataPoint['drill_open_new_win'] =
        chartProps.report_properties.drill_open_new_win;
    if ('widget_navigation' in chartProps.report_properties) {
      dataPoint['widget_navigation'] =
        chartProps.report_properties.widget_navigation;
      dataPoint['widget_navigation_tooltip_text'] =
        chartProps.report_properties.translation.click_to_open;
    }
  }
  if (isSlowMetricTable) {
    dataPoint['x'] = hc_convertDateTimeFormatToUnixTime(datetime);
  }
}
function hc_createLineSeriesData(hcOptions, chartData, chartProps, isUI) {
  return hc_createMultipleSeriesData(hcOptions, chartData, chartProps, isUI);
}
function hc_createControlSeriesData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  var chartSerieProps = chartData.report_properties_series[0];
  var series = [];
  if (
    'yaxis_duration' in seriesData &&
    seriesData.yaxis_duration &&
    hc_hasAxes(chartProps.chartType)
  ) {
    if (isUI) hcOptions.yAxis[0].labels.formatter = hc_formatDurationLabel;
    else hcOptions.yAxis[0].labels.formatter = 'hc_formatDurationLabel';
  }
  var dataPtSeries = {};
  dataPtSeries.name = 'Data Points';
  dataPtSeries.color = 'black';
  dataPtSeries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPoint = {};
    dataPoint['y'] = seriesData.yvalues[j]
      ? parseFloat(seriesData.yvalues[j])
      : null;
    dataPoint['y_tooltip'] = seriesData.ydisplayvalues[j];
    dataPoint['tooltip_date'] = seriesData.span_dates[j];
    dataPoint['table'] = seriesData.table_name;
    dataPoint['table_display_plural'] = seriesData.table_display_plural;
    if (isUI) {
      if ('aggregate_query' in seriesData)
        generateSeriesUrlInfo(
          dataPoint,
          j,
          false,
          seriesData,
          chartSerieProps,
          false,
          chartProps
        );
      if ('list_ui_view_name' in chartSerieProps)
        dataPoint['list_ui_view_name'] = chartSerieProps.list_ui_view_name;
      if ('report_drilldown' in chartSerieProps)
        dataPoint['report_drilldown'] = chartSerieProps.report_drilldown;
      dataPoint['drill_open_new_win'] = false;
      if ('drill_open_new_win' in chartProps.report_properties)
        dataPoint['drill_open_new_win'] =
          chartProps.report_properties.drill_open_new_win;
      if ('widget_navigation' in chartProps.report_properties) {
        dataPoint['widget_navigation'] =
          chartProps.report_properties.widget_navigation;
        dataPoint['widget_navigation_tooltip_text'] =
          chartProps.report_properties.translation.click_to_open;
      }
    }
    hc_addPropsForDataLabelsTruncation(dataPoint, chartProps.report_properties);
    dataPtSeries.data.push(dataPoint);
  }
  series.push(dataPtSeries);
  var trendLineSeries = {};
  trendLineSeries.name = 'Trend Line';
  if (isAccessibilityPatternsEnabled()) {
    trendLineSeries.dashStyle = 'LongDashDot';
    trendLineSeries.color = '#000';
  } else trendLineSeries.color = 'yellow';
  trendLineSeries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPt = {};
    var y = parseFloat(seriesData.trendvalues[j]);
    dataPt.y = y;
    dataPt.y_tooltip = seriesData.trenddisplayvalues[j];
    dataPt.tooltip_date = seriesData.span_dates[j];
    hc_addPropsForDataLabelsTruncation(dataPt, chartProps.report_properties);
    trendLineSeries.data.push(dataPt);
  }
  series.push(trendLineSeries);
  var controlVals = seriesData.controlvalues;
  var displayVals = [];
  displayVals.push(seriesData.controldisplayvalues[0]);
  displayVals.push(seriesData.controldisplayvalues[1]);
  displayVals.push(seriesData.controldisplayvalues[2]);
  displayVals.push(seriesData.controldisplayvalues[3]);
  displayVals.push(seriesData.controldisplayvalues[4]);
  series.push(
    hc_createControlPlotLine(
      '-3Z',
      'red',
      parseFloat(controlVals[0]),
      displayVals[0],
      chartProps,
      isUI,
      seriesData.span_dates
    )
  );
  series.push(
    hc_createControlPlotLine(
      '-2Z',
      'green',
      parseFloat(controlVals[1]),
      displayVals[1],
      chartProps,
      isUI,
      seriesData.span_dates
    )
  );
  series.push(
    hc_createControlPlotLine(
      'Mean',
      'blue',
      parseFloat(controlVals[2]),
      displayVals[2],
      chartProps,
      isUI,
      seriesData.span_dates
    )
  );
  series.push(
    hc_createControlPlotLine(
      '+2Z',
      'green',
      parseFloat(controlVals[3]),
      displayVals[3],
      chartProps,
      isUI,
      seriesData.span_dates
    )
  );
  series.push(
    hc_createControlPlotLine(
      '+3Z',
      'red',
      parseFloat(controlVals[4]),
      displayVals[4],
      chartProps,
      isUI,
      seriesData.span_dates
    )
  );
  return series;
}
function hc_createControlPlotLine(
  label,
  color,
  val,
  disp,
  chartProps,
  isUI,
  spanDates
) {
  var series = {};
  series.name = label;
  if (isAccessibilityPatternsEnabled()) {
    if (color === 'red') series.dashStyle = 'Dot';
    else if (color === 'green') series.dashStyle = 'ShortDash';
    else series.dashStyle = 'Dash';
    series.color = '#000';
  } else series.color = color;
  series.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPt = {};
    dataPt.y = val;
    dataPt.y_tooltip = disp;
    dataPt.tooltip_date = spanDates[j];
    dataPt.marker = {};
    dataPt.marker.enabled = false;
    hc_addPropsForDataLabelsTruncation(dataPt, chartProps.report_properties);
    series.data.push(dataPt);
  }
  return series;
}
function hc_createBoxPlotData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name + ':box';
  if (
    'yaxis_duration' in seriesData &&
    seriesData.yaxis_duration &&
    hc_hasAxes(chartProps.chartType)
  ) {
    if (isUI) hcOptions.yAxis[0].labels.formatter = hc_formatDurationLabel;
    else hcOptions.yAxis[0].labels.formatter = 'hc_formatDurationLabel';
  }
  var boxseries = {};
  boxseries.name = seriesName;
  if ('box_color' in chartProps.report_properties)
    boxseries.color = chartProps.report_properties.box_color;
  boxseries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var boxValArray = [];
    var boxDisplayValArray = [];
    boxDisplayValArray = seriesData.boxdisplayvalues[j];
    if (isUI) boxValArray = seriesData.boxvalues[j].split(',');
    else boxValArray = hc_strToArray(seriesData.boxvalues[j], ',');
    var boxVals = {};
    boxVals.low = parseFloat(boxValArray[0]);
    boxVals.q1 = parseFloat(boxValArray[1]);
    boxVals.median = parseFloat(boxValArray[2]);
    boxVals.q3 = parseFloat(boxValArray[3]);
    boxVals.high = parseFloat(boxValArray[4]);
    boxVals.low_display = boxDisplayValArray[0];
    boxVals.q1_display = boxDisplayValArray[1];
    boxVals.median_display = boxDisplayValArray[2];
    boxVals.q3_display = boxDisplayValArray[3];
    boxVals.high_display = boxDisplayValArray[4];
    boxseries.data.push(boxVals);
  }
  if (isUI) {
    boxseries.tooltip = {};
    boxseries.tooltip.pointFormat =
      '<span style="color:{series.color};font-weight:bold">{series.name}</span><br/>' +
      chartProps.report_properties.box_max +
      ': {point.high_display}<br/>' +
      chartProps.report_properties.box_q3 +
      ': {point.q3_display}<br/>' +
      chartProps.report_properties.box_median +
      ': {point.median_display}<br/>' +
      chartProps.report_properties.box_q1 +
      ': {point.q1_display}<br/>' +
      chartProps.report_properties.box_min +
      ': {point.low_display}<br/>';
  }
  return boxseries;
}
function hc_createBoxMeanData(hcOptions, chartData, chartProps, isUI) {
  var seriesData = chartData.series[0];
  var seriesName = seriesData.series_name + ':mean';
  var meanseries = {};
  meanseries.name = seriesName;
  meanseries.type = 'scatter';
  if ('box_mean_color' in chartProps.report_properties)
    meanseries.color = chartProps.report_properties.box_mean_color;
  meanseries.data = [];
  for (var j = 0; j < chartProps.xValues.length; j++) {
    var dataPoint = [];
    dataPoint.push(j);
    dataPoint.push(parseFloat(seriesData.yvalues[j]));
    meanseries.data.push(dataPoint);
  }
  if (isUI) {
    meanseries.tooltip = {};
    meanseries.tooltip.pointFormat =
      chartProps.report_properties.box_mean + ': {point.y}';
  }
  return meanseries;
}
function hc_isPresentInArray(arr, key) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] === key) return i;
  }
  return -1;
}
function hc_strToArray(str, delim) {
  var arr = [];
  var indx = str.indexOf(delim);
  while (indx >= 0) {
    var elem = str.substring(0, indx);
    arr.push(elem);
    str = str.substring(indx + 1);
    indx = str.indexOf(delim);
  }
  str = str.trim();
  if (str.length > 0) arr.push(str);
  return arr;
}
function hc_dataPointSelected(event) {
  var gridWindow = getGridWindow(
    this.series.chart.userOptions.publisher_id,
    this.series.chart.userOptions.report_id
  );
  gridWindow.interactiveFilters = gridWindow.interactiveFilters || {};
  if (
    typeof this.publisher_filter === 'undefined' ||
    event.accumulate === 'preventDataPointSelect' ||
    isFilterAlreadyPublished(gridWindow)
  )
    return;
  var queryCondition = !this.isOther
    ? this.publisher_filter.replace('^', '^EQ^')
    : this.publisher_filter;
  var uniqueId =
    getDashboardMessageHandlerId(
      this.series.chart.userOptions.publisher_id,
      this.series.chart.userOptions.report_id
    ) + queryCondition;
  var filterMessage = hc_interactiveFilterMessage(
    uniqueId,
    this.table,
    queryCondition
  );
  filterMessage.sliced = true;
  if (gridWindow.queryCondition) {
    var oldUniqueId =
      getDashboardMessageHandlerId(
        this.series.chart.userOptions.publisher_id,
        this.series.chart.userOptions.report_id
      ) + gridWindow.queryCondition;
    delete gridWindow.interactiveFilters[oldUniqueId];
  }
  gridWindow.queryCondition = queryCondition;
  gridWindow.interactiveFilters[uniqueId] = filterMessage;
  initializeInteractiveChartStack(oldUniqueId, filterMessage, gridWindow);
  hc_dataPointPublishFilter(
    this.series.chart.userOptions.report_id,
    gridWindow.interactiveFilters,
    gridWindow._dashboardMessageHandler
  );
}
function hc_dataPointUnselected(event) {
  var gridWindow = getGridWindow(
    this.series.chart.userOptions.publisher_id,
    this.series.chart.userOptions.report_id
  );
  if (
    typeof this.publisher_filter === 'undefined' ||
    (typeof event.accumulate === 'undefined' && event.type === 'unselect') ||
    isFilterAlreadyPublished(gridWindow)
  )
    return;
  gridWindow.interactiveFilters = gridWindow.interactiveFilters || {};
  var queryCondition = !this.isOther
    ? this.publisher_filter.replace('^', '^EQ^')
    : this.publisher_filter;
  var uniqueId =
    getDashboardMessageHandlerId(
      this.series.chart.userOptions.publisher_id,
      this.series.chart.userOptions.report_id
    ) + queryCondition;
  delete gridWindow.interactiveFilters[uniqueId];
  popFromInteractiveChartStack();
  hc_dataPointPublishFilter(
    this.series.chart.userOptions.report_id,
    gridWindow.interactiveFilters,
    gridWindow._dashboardMessageHandler
  );
}
function hc_FilterPublisher(reportId, filter, dashboardMessageHandler) {
  var filterMessages = [];
  for (var key in filter) {
    filterMessages.push(filter[key]);
  }
  var handler =
    dashboardMessageHandler || new DashboardMessageHandler(reportId);
  var isInCanvas =
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.interactiveFilters &&
    SNC.canvas.isGridCanvasActive;
  if (filterMessages.length > 0) {
    if (isInCanvas)
      SNC.canvas.interactiveFilters.addFilterToDefaultValues(
        reportId,
        filterMessages
      );
    handler.publishMessage(filterMessages);
  } else {
    if (isInCanvas)
      SNC.canvas.interactiveFilters.removeFilterFromDefaultValues(reportId);
    handler.removeFilter();
  }
}
function hc_dataPointPublishFilter(reportId, filter, dashboardMessageHandler) {
  var currentFilterPublishedTime = Date.now();
  if (isRenderedInCanvas()) {
    SNC.canvas.chartsActingAsFilters = SNC.canvas.chartsActingAsFilters || {};
    SNC.canvas.chartsActingAsFilters.lastPublishTime =
      SNC.canvas.chartsActingAsFilters.currentPublishTime ||
      currentFilterPublishedTime;
    SNC.canvas.chartsActingAsFilters.currentPublishTime =
      currentFilterPublishedTime;
    SNC.canvas.chartsActingAsFilters.previousId =
      SNC.canvas.chartsActingAsFilters.currentId || null;
    SNC.canvas.chartsActingAsFilters.currentId = reportId || null;
  }
  hc_FilterPublisher(reportId, filter, dashboardMessageHandler);
}
function hc_interactiveFilterMessage(uniqueId, table, filter) {
  var filter_message = {};
  filter_message.id = uniqueId;
  filter_message.table = table;
  filter_message.filter = filter;
  return filter_message;
}
function hc_dataPointLegendClick(event) {
  var gridWindow = getGridWindow(
    this.series.chart.userOptions.publisher_id,
    this.series.chart.userOptions.report_id
  );
  gridWindow.interactiveFilters = gridWindow.interactiveFilters || {};
  var uniqueId = getDashboardMessageHandlerId(
    this.series.chart.userOptions.publisher_id,
    this.series.chart.userOptions.report_id
  );
  var filtersFromLegend = {};
  if (gridWindow.filtersFromLegend)
    filtersFromLegend = gridWindow.filtersFromLegend;
  var selected = jQuery.grep(this.series.points, function (obj) {
    if (event.target == obj && obj.visible)
      filtersFromLegend[obj.legend_deselect_filter] =
        obj.legend_deselect_filter;
    return event.target === obj ? obj.visible : !obj.visible;
  });
  if (selected.length == this.series.points.length || selected.length === 0) {
    delete gridWindow.interactiveFilters[uniqueId];
    delete gridWindow.filtersFromLegend;
  } else {
    var queryArr = jQuery.map(selected, function (val) {
      return val.legend_deselect_filter;
    });
    if (queryArr.length) {
      var queryCondition = queryArr.join('^');
      var filterMessage = hc_interactiveFilterMessage(
        uniqueId,
        this.table,
        queryCondition
      );
      filterMessage.isFromLegend = true;
      gridWindow.interactiveFilters[uniqueId] = filterMessage;
      gridWindow.filtersFromLegend = filtersFromLegend;
    }
  }
  hc_dataPointPublishFilter(
    this.series.chart.userOptions.report_id,
    gridWindow.interactiveFilters,
    gridWindow._dashboardMessageHandler
  );
}
function getDashboardMessageHandlerId(publisherId, reportId) {
  var dashboardMesssageHandlerId = '';
  if (typeof glideGrid != 'undefined') {
    var gridWindow = glideGrid.getWindowByGaugeId(publisherId);
    if (typeof gridWindow != 'undefined' && gridWindow != null && gridWindow)
      dashboardMesssageHandlerId = publisherId;
    else dashboardMesssageHandlerId = reportId;
  } else if (
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.canvasUtils &&
    SNC.canvas.isGridCanvasActive
  ) {
    var gridWindow = SNC.canvas.canvasUtils.getGlideWindow(reportId);
    if (typeof gridWindow != 'undefined' && gridWindow != null && gridWindow)
      dashboardMesssageHandlerId = reportId;
    else dashboardMesssageHandlerId = publisherId;
  }
  return dashboardMesssageHandlerId;
}
function getGridWindow(publisherId, reportId) {
  var gridWindow;
  if (typeof glideGrid != 'undefined') {
    gridWindow = glideGrid.getWindowByGaugeId(publisherId);
    if (typeof gridWindow === 'undefined' || gridWindow == null) {
      gridWindow = glideGrid.getWindowByGaugeId(reportId);
    }
  } else if (
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.canvasUtils &&
    SNC.canvas.isGridCanvasActive
  ) {
    gridWindow = SNC.canvas.canvasUtils.getGlideWindow(reportId);
  } else {
    gridWindow = glideGrid.getWindowByGaugeId(reportId);
  }
  return gridWindow;
}
function hc_dataPointClicked(event) {
  var point = event.point || event.target;
  if (point && point.valid === false) point = event.target.point;
  if (!point || typeof point.click_url_info === 'undefined') return;
  var openNewTab = event.ctrlKey || event.metaKey || point.drill_open_new_win;
  if (point.widget_navigation && point.widget_navigation.length) {
    var widgetNav = point.widget_navigation[0];
    window.open(widgetNav.value, openNewTab ? '_blank' : '_self');
  } else if (point.isOther) openUrl(event, point.click_url_info);
  else {
    var element = event.srcElement || event.target;
    if (event.target && event.target.graphic)
      element = event.target.graphic.element;
    var hcKey = '';
    if (typeof point.isLatLon !== 'undefined' && !point.isLatLon)
      hcKey = point.properties['hc-key'];
    generateDataPointClickUrl(
      event,
      element,
      point.report_drilldown,
      point.table,
      point.click_url_info,
      point.list_ui_view_name,
      point.drill_open_new_win,
      point.isOther,
      point.report_drilldown_zoom ? hcKey : null,
      point.report_drilldown_map,
      point.show_data_label,
      point.show_geographical_label
    );
    if (!openNewTab && point.report_drilldown && window.Highcharts) {
      var currentChartInstance = Highcharts.charts.find(function (chart) {
        return chart && event.currentTarget === chart.container;
      });
      return currentChartInstance && currentChartInstance.destroy();
    }
  }
}
function insertTooltipReportId(tt, obj) {
  return (
    tt +
    '<hctooltipreportid value="' +
    obj.series.chart.userOptions.report_id +
    '" style="display: none"/>'
  );
}
function hc_formatToolTip() {
  var tt = '';
  var parenthesisOpen = false;
  if (typeof this.point.valid == 'undefined' || this.point.valid === true) {
    var xDisplayValue;
    if (this.point.origXValue && this.point.origXValue !== 'zzyynomatchaabb')
      xDisplayValue = this.point.origXValue;
    else xDisplayValue = this.x;
    if (this.series.name == 'pareto_series') tt = this.point.percent + '%';
    else {
      tt = xDisplayValue;
      if (this.point.tooltip_date) tt += this.point.tooltip_date;
      tt += ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%';
      parenthesisOpen = true;
    }
    if (this.point.percent_count)
      tt += ' of ' + this.point.table_display_plural;
    if (parenthesisOpen) tt += ')';
    if (
      this.point.widget_navigation &&
      this.point.widget_navigation.length &&
      this.point.widget_navigation[0].value.length
    )
      tt +=
        '<br/>' +
        this.point.widget_navigation_tooltip_text +
        ' ' +
        this.point.widget_navigation[0].label;
    tt = sanitizeHTMLContent(tt);
    tt = insertTooltipReportId(tt, this);
    return tt;
  }
  return false;
}
function hc_formatGeneralLineBarToolTip(event) {
  var typeTooltip = this.series.options.tooltip.tooltipText;
  if ('stacked' === typeTooltip) {
    if (this.point.valid) {
      var xValue = this.x;
      if (hc_isSlowMetricChart(this.series.chart.options))
        xValue = hc_formatDatetimeString(this.x);
      var tt = xValue;
      if (this.point.tooltip_date) tt += this.point.tooltip_date;
      tt +=
        ', ' +
        this.point.name +
        ' = ' +
        this.point.y_tooltip +
        '<br/>(' +
        this.point.percent +
        '%';
      if (this.point.percent_count)
        tt += ' of ' + this.point.table_display_plural + ')';
      else tt += ')';
      if (
        this.point.widget_navigation &&
        this.point.widget_navigation.length &&
        this.point.widget_navigation[0].value.length
      )
        tt +=
          '<br/>' +
          this.point.widget_navigation_tooltip_text +
          ' ' +
          this.point.widget_navigation[0].label;
      return sanitizeHTMLContent(tt);
    }
    return false;
  } else {
    var tt = '';
    var parenthesisOpen = false;
    if (typeof this.point.valid == 'undefined' || this.point.valid === true) {
      if (this.series.name == 'pareto_series') tt = this.point.percent + '%';
      else {
        var xValue = this.x;
        if (hc_isSlowMetricChart(this.series.chart.options))
          xValue = hc_formatDatetimeString(this.x);
        tt = xValue;
        if (this.point.tooltip_date) tt += this.point.tooltip_date;
        tt +=
          ' = ' + this.point.y_tooltip + '<br/>(' + this.point.percent + '%';
        parenthesisOpen = true;
      }
      if (this.point.percent_count)
        tt += ' of ' + this.point.table_display_plural;
      if (parenthesisOpen) tt += ')';
      if (
        this.point.widget_navigation &&
        this.point.widget_navigation.length &&
        this.point.widget_navigation[0].value.length
      )
        tt +=
          '<br/>' +
          this.point.widget_navigation_tooltip_text +
          ' ' +
          this.point.widget_navigation[0].label;
      tt = sanitizeHTMLContent(tt);
      tt = insertTooltipReportId(tt, this);
      return tt;
    }
    return false;
  }
}
function hc_formatPie() {
  var tt =
    this.key +
    ' = ' +
    this.point.y_tooltip +
    '<br/>(' +
    this.point.percent +
    '%)';
  if (
    this.point.widget_navigation &&
    this.point.widget_navigation.length &&
    this.point.widget_navigation[0].value.length
  )
    tt +=
      '<br/>' +
      this.point.widget_navigation_tooltip_text +
      ' ' +
      this.point.widget_navigation[0].label;
  tt = sanitizeHTMLContent(tt);
  tt = insertTooltipReportId(tt, this);
  return tt;
}
function hc_formatHeatmapTooltip() {
  var tt = '<b>' + this.point.value_tooltip + '</b>';
  if (
    this.point.widget_navigation &&
    this.point.widget_navigation.length &&
    this.point.widget_navigation[0].value.length
  )
    tt +=
      '<br/>' +
      this.point.widget_navigation_tooltip_text +
      ' ' +
      this.point.widget_navigation[0].label;
  tt = sanitizeHTMLContent(tt);
  tt = insertTooltipReportId(tt, this);
  return tt;
}
function hc_formatMapTooltip() {
  var tt =
    this.point.name +
    (this.point.y_tooltip != '' ? ':' + this.point.y_tooltip : '');
  if (
    this.point.widget_navigation &&
    this.point.widget_navigation.length &&
    this.point.widget_navigation[0].value.length
  )
    tt +=
      '<br/>' +
      this.point.widget_navigation_tooltip_text +
      ' ' +
      this.point.widget_navigation[0].label;
  tt = sanitizeHTMLContent(tt);
  tt = insertTooltipReportId(tt, this);
  return tt;
}
function hc_formatMapDataLabels() {
  var showGeoLabel =
    this.point.series.chart.series[0].options.dataLabels
      .show_geographical_label;
  var showDataLabel =
    this.point.series.chart.series[0].options.dataLabels.show_data_label;
  var name = this.point.name;
  var value = this.point.y_tooltip;
  var out = '';
  if (showDataLabel && showGeoLabel)
    out = value !== undefined && value != '' ? name + ':' + value : name;
  else if (showDataLabel && !showGeoLabel) out = value;
  else if (!showDataLabel && showGeoLabel) out = name;
  return out;
}
function hc_formatStackedBarToolTip() {
  if (this.point.valid) {
    var xDisplayValue;
    if (this.point.origXValue && this.point.origXValue !== 'zzyynomatchaabb')
      xDisplayValue = this.point.origXValue;
    else xDisplayValue = this.x;
    var tt =
      xDisplayValue +
      ', ' +
      this.point.name +
      ' = ' +
      this.point.y_tooltip +
      '<br/>(' +
      this.point.percent +
      '%';
    if (this.point.percent_count)
      tt += ' of ' + this.point.table_display_plural + ')';
    else tt += ')';
    if (
      this.point.widget_navigation &&
      this.point.widget_navigation.length &&
      this.point.widget_navigation[0].value.length
    )
      tt +=
        '<br/>' +
        this.point.widget_navigation_tooltip_text +
        ' ' +
        this.point.widget_navigation[0].label;
    tt = sanitizeHTMLContent(tt);
    tt = insertTooltipReportId(tt, this);
    return tt;
  }
  return false;
}
function hc_formatHistToolTip() {
  var rangevals = this.x.split(':');
  var tt =
    this.point.tt_label_min +
    ' = ' +
    rangevals[0] +
    '<br/>' +
    this.point.tt_label_max +
    ' = ' +
    rangevals[1] +
    '<br/>' +
    this.point.tt_label_cnt +
    ' = ' +
    this.y;
  if (
    this.point.widget_navigation &&
    this.point.widget_navigation.length &&
    this.point.widget_navigation[0].value.length
  )
    tt +=
      '<br/>' +
      this.point.widget_navigation_tooltip_text +
      ' ' +
      this.point.widget_navigation[0].label;
  tt = sanitizeHTMLContent(tt);
  tt = insertTooltipReportId(tt, this);
  return tt;
}
function hc_formatControlToolTip() {
  var tt = this.x;
  if (this.point.tooltip_date) tt += this.point.tooltip_date;
  tt += ' = ' + this.point.y_tooltip;
  if (
    this.point.widget_navigation &&
    this.point.widget_navigation.length &&
    this.point.widget_navigation[0].value.length
  )
    tt +=
      '<br/>' +
      this.point.widget_navigation_tooltip_text +
      ' ' +
      this.point.widget_navigation[0].label;
  tt = sanitizeHTMLContent(tt);
  tt = insertTooltipReportId(tt, this);
  return tt;
}
function hc_addPropsForDataLabelsTruncation(dataPoint, reportProperties) {
  dataPoint.data_label_max_length = reportProperties.data_label_max_size;
  if ('truncate_data_labels' in reportProperties)
    dataPoint.truncate_data_labels = reportProperties.truncate_data_labels;
  if ('data_labels_remove_leading' in reportProperties)
    dataPoint.data_labels_remove_leading =
      reportProperties.data_labels_remove_leading;
}
function hc_addTotal(hcOptions, chartProps, series, chartData, isUI) {
  if (!series.data.length) {
    return;
  }
  hcOptions.subtitle = {};
  hcOptions.subtitle.verticalAlign = 'middle';
  hcOptions.subtitle.align = 'center';
  hcOptions.subtitle.style = {};
  hcOptions.subtitle.style.fontFamily = 'Arial';
  hcOptions.subtitle.style.color = '#000';
  hcOptions.subtitle.style['text-align'] = 'center';
  var titleVerticalAlign = chartData.report_properties.title_vertical_alignment;
  var titleSize = chartData.report_properties.chart_title_size;
  var fontHelper;
  if (hcOptions.chart.width < hcOptions.chart.height)
    fontHelper = hcOptions.chart.width;
  else fontHelper = hcOptions.chart.height;
  var fontSize = fontHelper / 15;
  var durationSubFontSize = parseInt(fontHelper / 20);
  hcOptions.subtitle.style.fontSize = parseInt(fontSize) + 'pt';
  var yPos = 0;
  var applyYPosForSemiDonut = function () {
    hcOptions.chart.events = {
      render: function (event) {
        var redraw = false;
        event.target.update(
          {
            subtitle: {
              y: event.target.plotTop + event.target.plotHeight / 4,
            },
          },
          redraw
        );
      },
    };
  };
  var applyYPosForDonut = function applyYPosForDonut(hasDuration) {
    hcOptions.subtitle.floating = true;
    hcOptions.subtitle.verticalAlign = 'top';
    var temporaryTopMargin = titleVerticalAlign === 'top' ? titleSize / 2 : 0;
    var magicPadding =
      titleVerticalAlign === 'top' ? (hasDuration ? -5 : 5) : 0;
    yPos = hcOptions.chart.height / 2 + temporaryTopMargin;
    hcOptions.chart.events = {
      render: function (event) {
        var redraw = false;
        event.target.update(
          {
            subtitle: {
              y:
                event.target.plotTop +
                magicPadding +
                event.target.plotHeight / 2,
            },
          },
          redraw
        );
      },
    };
  };
  if (
    'yaxis_duration' in chartData.series[0] &&
    chartData.series[0].yaxis_duration
  ) {
    hcOptions.subtitle.useHTML = true;
    hcOptions.subtitle.style['line-height'] = parseInt(fontSize / 1.2) + 'pt';
    var days = 'Days';
    var hours = 'Hours';
    var minutes = 'Minutes';
    var seconds = 'Seconds';
    var translation = chartData.report_properties.translation;
    if (typeof translation !== 'undefined') {
      days = translation.days;
      hours = translation.hours;
      minutes = translation.minutes;
      seconds = translation.seconds;
    }
    series.total =
      series.total
        .replace(
          days,
          days + "<br/><span style='font-size:" + durationSubFontSize + "pt;'>"
        )
        .replace(' ' + hours + ' ', 'h:')
        .replace(' ' + minutes + ' ', 'm:')
        .replace(' ' + seconds, 's') + '</span>';
    if (chartProps.chartType === 'donut') {
      if (isUI) {
        applyYPosForDonut(true);
      } else {
        if (hcOptions.title.text === '') {
          yPos = 0 - fontSize * (0.5 + fontSize / 200);
        } else if (titleVerticalAlign === 'top') {
          yPos = titleSize / 2 - fontSize * (fontSize / 100);
        } else if (titleVerticalAlign === 'bottom') {
          yPos = 0 - (titleSize / 2 + fontSize * (fontSize / 100));
        }
      }
    } else {
      if (hcOptions.title.text === '') {
        yPos = fontSize * 1.55;
        if (chartProps.chartType == 'semi_donut' && isUI) {
          applyYPosForSemiDonut();
        }
      } else if (titleVerticalAlign === 'top') {
        yPos = titleSize / 3 + fontSize * 1.55;
        if (chartProps.chartType == 'semi_donut' && isUI) {
          applyYPosForSemiDonut();
        }
      } else if (titleVerticalAlign === 'bottom') {
        yPos = fontSize * 1.55 + 11 - titleSize / 1.4;
      }
    }
  } else {
    series.total =
      '<span title=' + series.total_value + '>' + series.total + '</span>';
    if (chartProps.chartType == 'donut') {
      if (isUI) {
        applyYPosForDonut();
      } else {
        if (hcOptions.title.text === '') {
          yPos = 0 - fontSize * (0.2 + fontSize / 200);
        } else if (titleVerticalAlign === 'top') {
          yPos = titleSize / 2 + fontSize * (0.35 - fontSize / 100);
        } else if (titleVerticalAlign === 'bottom') {
          yPos = 0 - (titleSize / 2.5 + fontSize * (fontSize / 150));
        }
      }
    } else {
      if (hcOptions.title.text === '') {
        yPos = fontSize * (2.3 + fontSize / 400);
        if (chartProps.chartType == 'semi_donut' && isUI) {
          applyYPosForSemiDonut();
        }
      } else if (titleVerticalAlign === 'top') {
        yPos = titleSize / 4 + fontSize * 4;
        if (chartProps.chartType == 'semi_donut' && isUI) {
          applyYPosForSemiDonut();
        }
      } else if (titleVerticalAlign === 'bottom') {
        yPos = fontSize * (4 - fontSize / 400) - titleSize / 1.4;
      }
    }
  }
  hcOptions.subtitle.useHTML = true;
  hcOptions.subtitle.text = series.total;
  hcOptions.subtitle.y = yPos;
  hcOptions.legend.enabled = false;
}
function clickOnABreadcrumb(reportId, containerId, jsonProperties) {
  var decodedJsonProperties = decodeURIComponent(jsonProperties);
  var jsonProperties = JSON.parse(decodedJsonProperties);
  var content = jQuery('#' + containerId);
  var mapParams = '';
  var map;
  var contParams = 0;
  for (var i = 0; i < jsonProperties.length; i++) {
    var jsonProp = jsonProperties[i];
    if (jsonProp.key === 'report_map') map = jsonProp.value;
  }
  mapParams += '&sysparm_report_map_parent=' + map;
  drillReport(content.parent().parent(), reportId, '', mapParams);
}
function hc_isSlowMetricChart(hcOptions, seriesData) {
  if (
    hcOptions &&
    hcOptions.chart &&
    hcOptions.chart.isChartingSlowMetricTable !== undefined
  )
    return hcOptions.chart.isChartingSlowMetricTable;
  if (
    seriesData &&
    seriesData.table_name &&
    seriesData.xvalues &&
    seriesData.xvalues[0] &&
    seriesData.table_name.indexOf('v_rrd') === 0 &&
    /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/.test(seriesData.xvalues[0])
  ) {
    hcOptions.chart.isChartingSlowMetricTable = true;
    return true;
  } else hcOptions.chart.isChartingSlowMetricTable = false;
  return false;
}
function hc_convertDateTimeFormatToUnixTime(datetime) {
  var dateAndTimes = /(\d\d\d\d)-(\d\d)-(\d\d) (\d\d):(\d\d):(\d\d)/.exec(
    datetime
  );
  dateAndTimes.shift();
  for (var i = 0; i < dateAndTimes.length; i++) {
    dateAndTimes[i] = parseInt(dateAndTimes[i], 10);
  }
  return Date.UTC(
    dateAndTimes[0],
    dateAndTimes[1] - 1,
    dateAndTimes[2],
    dateAndTimes[3],
    dateAndTimes[4],
    dateAndTimes[5]
  );
}
function hc_setZoomTypeForSlowMetric(chartData, hcOptions) {
  if (hc_isSlowMetricChart(hcOptions, chartData.series[0])) {
    hcOptions.chart.zoomType = 'x';
  }
}
function hc_formatDatetimeString(x) {
  var xValue = new Date(x).toUTCString();
  xValue = xValue.substring(0, xValue.length - 4);
  return xValue;
}
function hc_addSummaryDataToLegendForSlowMetric(chartData, hcOptions, isUI) {
  if (
    isUI &&
    !(window.SNC && window.SNC.canvas && SNC.canvas.canvasUtils) &&
    hc_isSlowMetricChart(hcOptions, chartData.series[0])
  ) {
    hcOptions.legend.statsTable = {
      active: true,
      seriesLinkGenerator: function linkSeriesInLegendToPattern(serie) {
        try {
          var patternSysId = /pattern=(\w*)/.exec(
            serie.userOptions.data[0].click_url_info
          )[1];
          var patternType = serie.userOptions.data[0].table.split('_').pop();
          return 'sys_' + patternType + '_pattern.do?sys_id=' + patternSysId;
        } catch (e) {
          return '';
        }
      },
    };
    if (chartData.title.indexOf('Time') >= 0)
      hcOptions.legend.statsTable.unit = 'ms';
    hcOptions.chart.height -= 120;
  }
}
function hc_differenceOfClosestStringDateTimesInSeries(xValues) {
  var previousValue = hc_convertDateTimeFormatToUnixTime(xValues[0]);
  var smallestDifference = Number.MAX_VALUE;
  var currentValue, currentDifference;
  for (var i = 1; i < xValues.length; i++) {
    currentValue = hc_convertDateTimeFormatToUnixTime(xValues[i]);
    currentDifference = currentValue - previousValue;
    if (currentDifference < smallestDifference)
      smallestDifference = currentDifference;
    previousValue = currentValue;
  }
  if (smallestDifference === Number.MAX_VALUE) return 0;
  return smallestDifference;
}
function hc_disableTurboThreshold(hcOptions) {
  var threshold = 0;
  if (
    typeof hcOptions !== 'undefined' &&
    typeof hcOptions.series !== 'undefined'
  ) {
    for (var i = 0; i < hcOptions.series.length; i++)
      hcOptions.series[i].turboThreshold = threshold;
  }
}
function hc_setDataLabelPositionProperties(hcOptions, chartData) {
  var hcOptionSeriesCount = 0;
  var numberOfDatasets = chartData.series.length;
  for (var datasetIndex = 0; datasetIndex < numberOfDatasets; datasetIndex++) {
    var dataset = chartData.series[datasetIndex];
    var numberOfHcSeriesPerDataset = 1;
    if ('sub_series' in dataset)
      numberOfHcSeriesPerDataset = dataset.x2values.length;
    for (var j = 0; j < numberOfHcSeriesPerDataset; j++) {
      if (
        chartData.report_properties_series[datasetIndex].show_chart_data_label
      ) {
        hcOptions.series[j + hcOptionSeriesCount].dataLabels.enabled = true;
        if (
          chartData.report_properties_series[datasetIndex]
            .show_data_label_position_middle
        ) {
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.verticalAlign =
            'middle';
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.inside = true;
        } else
          hcOptions.series[j + hcOptionSeriesCount].dataLabels.inside = false;
        if (
          chartData.report_properties_series[datasetIndex]
            .allow_data_label_overlap
        )
          hcOptions.series[
            j + hcOptionSeriesCount
          ].dataLabels.allowOverlap = true;
        else
          hcOptions.series[
            j + hcOptionSeriesCount
          ].dataLabels.allowOverlap = false;
      } else
        hcOptions.series[j + hcOptionSeriesCount].dataLabels.enabled = false;
    }
    hcOptionSeriesCount += numberOfHcSeriesPerDataset;
  }
}
function isAccessibilityPatternsEnabled() {
  return (
    window.g_accessibility_visual_patterns === 'true' ||
    window.g_accessibility_visual_patterns === true
  );
}
function getOldFilterIndexFromStack(oldUniqueId) {
  var oldItemIndex = -1;
  if (
    window.SNC &&
    SNC.interactiveChart &&
    oldUniqueId &&
    SNC.interactiveChart.length
  ) {
    for (
      var index = 0, len = SNC.interactiveChart.length;
      index < len;
      index++
    ) {
      if (SNC.interactiveChart[index].id === oldUniqueId) {
        oldItemIndex = index;
        break;
      }
    }
  }
  return oldItemIndex;
}
function initializeInteractiveChartStack(
  oldUniqueId,
  filterMessage,
  gridWindow
) {
  window.SNC = window.SNC || {};
  SNC.interactiveChart = SNC.interactiveChart || [];
  var oldItemIndex =
    gridWindow.queryCondition && getOldFilterIndexFromStack(oldUniqueId);
  if (oldItemIndex > -1) SNC.interactiveChart[oldItemIndex] = filterMessage;
  else SNC.interactiveChart.push(filterMessage);
  subscribeToDashboardTabChange(gridWindow);
}
function subscribeToDashboardTabChange(gridWindow) {
  if (
    gridWindow &&
    window.SNC &&
    window.SNC.canvas &&
    window.SNC.canvas.eventbus &&
    !gridWindow.hasNotSubscribedToTabSwitch
  ) {
    gridWindow.hasNotSubscribedToTabSwitch = true;
    window.SNC.canvas.eventbus.subscribe(
      'dashboards:switchTab',
      function onTabChangeHandler() {
        if (SNC.canvas.canvasUtils.clearAllWidgetsCache)
          SNC.canvas.canvasUtils.clearAllWidgetsCache();
        window.SNC.canvas.eventbus.unsubscribe(
          'dashboards:switchTab',
          onTabChangeHandler
        );
      }
    );
  }
}
function popFromInteractiveChartStack() {
  if (window.SNC && SNC.interactiveChart && SNC.interactiveChart.length)
    SNC.interactiveChart.pop();
}
function isFilterAlreadyPublished(gridWindow) {
  var isFilterPublished = false;
  if (gridWindow) {
    var isBothPublisherNSubscriber =
      gridWindow.preferences.can_publish &&
      gridWindow.preferences.can_subscribe;
    var allConsumedFilter = gridWindow.consumed;
    var interactiveFilters = gridWindow.interactiveFilters || {};
    if (
      isBothPublisherNSubscriber &&
      allConsumedFilter &&
      Array.isArray(allConsumedFilter)
    ) {
      var allConsumedFilterFlattend = [].concat.apply([], allConsumedFilter);
      for (
        var index = 0, len = allConsumedFilterFlattend.length;
        index < len;
        index++
      ) {
        var item = allConsumedFilterFlattend[index];
        if (interactiveFilters[item.id]) {
          isFilterPublished = true;
          break;
        }
      }
    }
  }
  return isFilterPublished;
}
function convertToPx(valuePt) {
  if (typeof valuePt == 'string' && valuePt.endsWith('pt')) {
    var value = Number.parseInt(valuePt.slice(0, -2), 10);
    if (value) return Number(value * (4 / 3)).toFixed(2) + 'px';
    return valuePt;
  }
  return valuePt;
}
