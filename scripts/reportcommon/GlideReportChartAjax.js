/*! RESOURCE: /scripts/reportcommon/GlideReportChartAjax.js */
var stopWatch;
function runEmbeddedReport(
  msg_container_id,
  chart_container_id,
  title,
  display_grid,
  other_threshold,
  show_empty,
  table,
  group_by,
  filter,
  aggregate,
  agg_field,
  chart_type,
  stack_field,
  box_field,
  trend_field,
  trend_interval,
  compute_percent,
  show_other,
  use_color_palette,
  chart_size,
  funnel_neck_percent,
  donut_width_percent,
  gauge_autoscale,
  from,
  to,
  upper_limit,
  lower_limit,
  direction,
  chart_title,
  show_chart_title,
  chart_title_size,
  chart_title_color,
  custom_chart_title_position,
  chart_title_x_position,
  chart_title_y_position,
  title_horizontal_alignment,
  title_vertical_alignment,
  legend_horizontal_alignment,
  legend_vertical_alignment,
  report_id,
  show_chart_data_label,
  show_chart_border,
  chart_border_width,
  chart_border_radius,
  chart_border_color,
  chart_background_color,
  legend_border_width,
  legend_border_radius,
  legend_border_color,
  legend_background_color,
  show_legend,
  show_legend_border,
  chart_height,
  chart_width,
  custom_chart_size,
  report_source_id,
  bar_unstack,
  x_axis_title,
  x_axis_title_size,
  x_axis_title_color,
  x_axis_title_bold,
  x_axis_opposite,
  x_axis_grid_width,
  x_axis_grid_color,
  x_axis_display_grid,
  x_axis_grid_dotted,
  x_axis_label_size,
  x_axis_label_color,
  x_axis_label_bold,
  y_axis_title,
  y_axis_title_size,
  y_axis_title_color,
  y_axis_title_bold,
  y_axis_opposite,
  y_axis_grid_width,
  y_axis_grid_color,
  y_axis_display_grid,
  y_axis_grid_dotted,
  y_axis_from,
  y_axis_to,
  y_axis_label_size,
  y_axis_label_color,
  y_axis_label_bold,
  show_marker,
  sc_groupby_item_id,
  sc_groupby_variable_id,
  sc_stackby_item_id,
  sc_stackby_variable_id,
  list_ui_view,
  report_drilldown,
  show_chart_total,
  use_color_heatmap,
  axis_max_color,
  axis_min_color,
  ct_row,
  ct_column,
  show_zero,
  score_color,
  interactive_report,
  set_color,
  color,
  colors,
  color_palette,
  other_series,
  report_map
) {
  var params = {};
  params.title = title;
  params.display_grid = display_grid;
  params.other_threshold = other_threshold;
  params.show_empty = show_empty;
  params.table = table;
  params.group_by = group_by;
  params.filter = filter;
  params.aggregate = aggregate;
  params.agg_field = agg_field;
  params.chart_type = chart_type;
  params.stack_field = stack_field;
  params.box_field = box_field;
  params.trend_field = trend_field;
  params.trend_interval = trend_interval;
  params.compute_percent = compute_percent;
  params.show_other = show_other;
  params.chart_size = chart_size;
  params.funnel_neck_percent = funnel_neck_percent;
  params.donut_width_percent = donut_width_percent;
  params.gauge_autoscale = gauge_autoscale;
  params.from = from;
  params.to = to;
  params.upper_limit = upper_limit;
  params.lower_limit = lower_limit;
  params.direction = direction;
  params.chart_title = chart_title;
  params.show_chart_title = show_chart_title;
  params.chart_title_size = chart_title_size;
  params.chart_title_color = chart_title_color;
  params.custom_chart_title_position = custom_chart_title_position;
  params.chart_title_x_position = chart_title_x_position;
  params.chart_title_y_position = chart_title_y_position;
  params.title_horizontal_alignment = title_horizontal_alignment;
  params.title_vertical_alignment = title_vertical_alignment;
  params.legend_horizontal_alignment = legend_horizontal_alignment;
  params.legend_vertical_alignment = legend_vertical_alignment;
  params.report_id = report_id;
  params.show_chart_data_label = show_chart_data_label;
  params.show_chart_border = show_chart_border;
  params.chart_border_width = chart_border_width;
  params.chart_border_radius = chart_border_radius;
  params.chart_border_color = chart_border_color;
  params.chart_background_color = chart_background_color;
  params.legend_border_width = legend_border_width;
  params.legend_border_radius = legend_border_radius;
  params.legend_border_color = legend_border_color;
  params.legend_background_color = legend_background_color;
  params.show_legend = show_legend;
  params.show_legend_border = show_legend_border;
  params.chart_height = chart_height;
  params.chart_width = chart_width;
  params.custom_chart_size = custom_chart_size;
  params.report_source_id = report_source_id;
  params.bar_unstack = bar_unstack;
  params.x_axis_title = x_axis_title;
  params.x_axis_title_size = x_axis_title_size;
  params.x_axis_title_color = x_axis_title_color;
  params.x_axis_title_bold = x_axis_title_bold;
  params.x_axis_opposite = x_axis_opposite;
  params.x_axis_grid_width = x_axis_grid_width;
  params.x_axis_grid_color = x_axis_grid_color;
  params.x_axis_display_grid = x_axis_display_grid;
  params.x_axis_grid_dotted = x_axis_grid_dotted;
  params.x_axis_label_size = x_axis_label_size;
  params.x_axis_label_color = x_axis_label_color;
  params.x_axis_label_bold = x_axis_label_bold;
  params.y_axis_title = y_axis_title;
  params.y_axis_title_size = y_axis_title_size;
  params.y_axis_title_color = y_axis_title_color;
  params.y_axis_title_bold = y_axis_title_bold;
  params.y_axis_opposite = y_axis_opposite;
  params.y_axis_grid_width = y_axis_grid_width;
  params.y_axis_grid_color = y_axis_grid_color;
  params.y_axis_display_grid = y_axis_display_grid;
  params.y_axis_grid_dotted = y_axis_grid_dotted;
  params.y_axis_from = y_axis_from;
  params.y_axis_to = y_axis_to;
  params.y_axis_label_size = y_axis_label_size;
  params.y_axis_label_color = y_axis_label_color;
  params.y_axis_label_bold = y_axis_label_bold;
  params.show_marker = show_marker;
  params.sc_groupby_item_id = sc_groupby_item_id;
  params.sc_groupby_variable_id = sc_groupby_variable_id;
  params.sc_stackby_item_id = sc_stackby_item_id;
  params.sc_stackby_variable_id = sc_stackby_variable_id;
  params.list_ui_view = list_ui_view;
  params.report_drilldown = report_drilldown;
  params.show_chart_total = show_chart_total;
  params.use_color_heatmap = use_color_heatmap;
  params.axis_max_color = axis_max_color;
  params.axis_min_color = axis_min_color;
  params.ct_row = ct_row;
  params.ct_column = ct_column;
  params.show_zero = show_zero;
  params.score_color = score_color;
  params.interactive_report = interactive_report;
  params.set_color = set_color;
  params.color = color;
  params.colors = colors;
  params.color_palette = color_palette;
  params.other_series = other_series;
  params.report_map = report_map;
  runReportAsGauge(
    params,
    chart_container_id,
    msg_container_id,
    'false',
    'false',
    null,
    true
  );
}
function runReportAsGauge(
  params,
  chartContainerId,
  msgContainerId,
  isGauge,
  isGaugePreview,
  maxCancelationRetries,
  noRetry
) {
  var startTime = new Date().getTime();
  setupSeries(params);
  if (isGaugePreview == 'true') params.gauge_preview = true;
  var pageNum = document.getElementById('sysparm_page_num_' + params.report_id);
  if (pageNum && pageNum.value) params.page_num = pageNum.value;
  else params.page_num = 0;
  if (isGauge === 'true' || isGauge === true) isGauge = true;
  else isGauge = false;
  var additionalArgs = constructAdditionalArgs(
    params,
    chartContainerId,
    msgContainerId,
    isGauge,
    startTime
  );
  generateChart(
    params,
    additionalArgs,
    chartContainerId,
    maxCancelationRetries,
    0,
    noRetry
  );
}
function constructAdditionalArgs(
  params,
  chartContainerId,
  msgContainerId,
  isGauge,
  startTime
) {
  var additionalArgs = {};
  additionalArgs.chart_container_id = chartContainerId;
  additionalArgs.msg_container_id = msgContainerId;
  additionalArgs.chart_type = params.series[0].plot_type;
  additionalArgs.agg_type = params.series[0].aggregate_type;
  additionalArgs.aggregation_source = params.series[0].aggregation_source;
  additionalArgs.chart_size = params.chart_size;
  additionalArgs.chart_height = params.chart_height;
  additionalArgs.chart_width = params.chart_width;
  additionalArgs.start_time = startTime;
  additionalArgs.compute_percent = params.compute_percent;
  additionalArgs.group_by = params.series[0].groupby;
  additionalArgs.stacked_field = '';
  if (isBarType(additionalArgs.chart_type))
    additionalArgs.stacked_field = params.series[0].stacked_field;
  additionalArgs.display_grid = false;
  if (params.display_grid === 'true' || params.display_grid === true)
    additionalArgs.display_grid = true;
  additionalArgs.isGauge = isGauge;
  if (additionalArgs.isGauge) {
    additionalArgs.gauge_id = params.gauge_id;
    additionalArgs.gauge_preview = params.gauge_preview;
  }
  additionalArgs.chart_params = JSON.stringify(params);
  additionalArgs.report_id = params.report_id;
  additionalArgs.source_type = params.source_type;
  if (params.report_uuid) additionalArgs.report_uuid = params.report_uuid;
  additionalArgs.publisher_filter = params.publisher_filter;
  return additionalArgs;
}
function isHighChartsSupportedType(chart_type) {
  return (
    chart_type == 'bar' ||
    chart_type == 'horizontal_bar' ||
    isPieType(chart_type) ||
    chart_type == 'pareto' ||
    chart_type == 'hist' ||
    chart_type == 'trend' ||
    chart_type == 'box' ||
    chart_type == 'line' ||
    chart_type == 'step_line' ||
    chart_type == 'area' ||
    chart_type == 'spline' ||
    chart_type == 'line_bar' ||
    chart_type == 'control' ||
    chart_type == 'availability' ||
    chart_type == 'tbox' ||
    isGaugeType(chart_type) ||
    chart_type == 'heatmap' ||
    chart_type == 'bubble' ||
    chart_type == 'map'
  );
}
function runReportFromBuilder(
  reportUUID,
  fixedSize,
  params,
  maxCancelationRetries,
  noRetry
) {
  if (!params) params = window.g_report_params[reportUUID];
  if (!params.report_uuid) params.report_uuid = reportUUID;
  createReportTemplate(reportUUID, params, fixedSize);
  runReportAsGauge(
    params,
    'chart-container-' + reportUUID,
    'msg-container-' + reportUUID,
    'false',
    'false',
    maxCancelationRetries,
    noRetry
  );
}
function destroyExistingReports($reportContainer) {
  var $highchartsContainer = $reportContainer.find('.highcharts-container')[0];
  if ($highchartsContainer) {
    Highcharts.charts.forEach(function (chart) {
      if (chart && chart.container === $highchartsContainer) {
        chart.destroy();
      }
    });
  }
  $reportContainer.empty();
}
function createReportTemplate(reportUUID, params, fixedSize) {
  var $reportContainer = jQuery('#report-container-' + reportUUID);
  destroyExistingReports($reportContainer);
  $reportContainer.append(
    jQuery("<div class='gauge-size-handle report_breadcrumbs' />")
  );
  var $msgContainer = jQuery(
    '<div class="report-message gauge-size-handle" id="msg-container-' +
      reportUUID +
      '"/>'
  );
  var $noDataMessageContainer = jQuery(getNoDataMessageTemplate());
  var containerClass = 'chart-container';
  if (isScrollableType(params.chart_type)) containerClass += ' scrollable';
  var $chartContainer = jQuery(
    '<div class="' +
      containerClass +
      '" id="chart-container-' +
      reportUUID +
      '">Loading report...</div>'
  );
  var isLegacyWidget = window.SNC && !!SNC.legacyWidgetWrapper;
  if (fixedSize && !isLegacyWidget) {
    var chartHeight = 550;
    var chartWidth = 750;
    var customChartSize = params.custom_chart_size;
    var customChartHeight = params.chart_height;
    var customChartWidth = params.chart_width;
    var chartSize = params.chart_size;
    if (
      customChartSize === 'true' &&
      customChartHeight !== 'null' &&
      customChartHeight !== ''
    )
      chartHeight = customChartHeight;
    else if (chartSize === 'medium') chartHeight = 450;
    else if (chartSize === 'small') chartHeight = 375;
    if (
      customChartSize === 'true' &&
      customChartWidth !== 'null' &&
      customChartWidth !== ''
    )
      chartWidth = customChartWidth;
    else if (chartSize === 'medium') chartWidth = 600;
    else if (chartSize === 'small') chartWidth = 450;
    $chartContainer.height(chartHeight).width(chartWidth);
  }
  var $chartPlaceholder = jQuery('<div>')
    .css('position', 'relative')
    .append($chartContainer)
    .append($noDataMessageContainer);
  $reportContainer.append($msgContainer);
  $reportContainer.append($chartPlaceholder);
  if (
    (!params.page_num || params.page_num == '0') &&
    params.additional_groupby &&
    hasAdditionalGroupBy(params.chart_type)
  ) {
    $reportContainer.append(
      jQuery(
        '<div id="interactive-container-' +
          reportUUID +
          '" class="interactive_container gauge-size-handle" style="text-align: center; padding-top: 5px;"/>'
      )
    );
  }
  if (
    (params.display_grid === 'true' ||
      params.display_grid === true ||
      window.g_accessibility_screen_reader_table === 'true' ||
      window.g_accessibility_screen_reader_table === true) &&
    isDisplayGridApplicable(params.chart_type)
  ) {
    $reportContainer.append(
      jQuery(
        '<div class="display-grid-container">' +
          '<table id="display-grid-table-' +
          reportUUID +
          '" tabindex="0" align="center" border="0" cellpadding="0" cellspacing="0" class="chart_legend display-grid-table" />' +
          '</div>'
      )
    );
  }
}
function isScrollableType(type) {
  return 'pivot_v2' == type || 'calendar' == type;
}
function generateChart(
  params,
  additionalArgs,
  chartContainerId,
  maxCancelationRetries,
  cancelledCount,
  noRetry
) {
  maxCancelationRetries = parseInt(maxCancelationRetries) || 15;
  cancelledCount = parseInt(cancelledCount) || 0;
  if (
    additionalArgs.formatting_configuration === undefined &&
    params.formatting_configuration !== undefined
  )
    additionalArgs.formatting_configuration = params.formatting_configuration;
  if (
    additionalArgs.datasets_formatting_configuration === undefined &&
    params.datasets_formatting_configuration !== undefined
  )
    additionalArgs.datasets_formatting_configuration =
      params.datasets_formatting_configuration;
  if (cancelledCount == 0) {
    var paramsStringified = JSON.stringify(params);
    params = {};
    params.sysparm_request_params = paramsStringified;
    params.sysparm_timer = new Date().getTime();
    if ('chartOnForm' in params) params.sysparm_chartonform = true;
    params.sysparm_processor = 'ChartDataProcessor';
    params.sysparm_scope = 'global';
    params.sysparm_want_session_messages = true;
  }
  var config = {
    method: 'POST',
    url: 'xmlhttp.do',
    data: $j.param(params),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    dataType: 'xml',
  };
  $j.ajax(config).then(
    function successCallback(response) {
      if (
        !response ||
        (response.getElementById('transaction_canceled_island') &&
          response
            .getElementById('transaction_canceled_island')
            .getAttribute('transaction_canceled') === 'true')
      ) {
        var cancelledMsg = response
          ? response
              .getElementById('transaction_canceled_island')
              .getAttribute('cancel_message')
          : '';
        cancelledMsg = cancelledMsg.toLowerCase();
        if (cancelledCount > maxCancelationRetries) {
          if (window.console)
            console.log(
              'Transaction has been cancelled ' +
                maxCancelationRetries +
                ' times and stop retrying'
            );
          if (chartContainerId)
            document.getElementById(chartContainerId).innerHTML = cancelledMsg;
        } else {
          if (
            cancelledMsg &&
            cancelledMsg.indexOf('maximum execution time exceeded') !== -1 &&
            chartContainerId
          )
            document.getElementById(chartContainerId).innerHTML = cancelledMsg;
          else if (!noRetry)
            setTimeout(function () {
              generateChart(
                params,
                additionalArgs,
                chartContainerId,
                maxCancelationRetries,
                ++cancelledCount,
                noRetry
              );
            }, 500);
        }
      } else getChartDataDone(response, additionalArgs);
    },
    function errorCallback(response) {
      if (!noRetry)
        setTimeout(function () {
          generateChart(
            params,
            additionalArgs,
            chartContainerId,
            maxCancelationRetries,
            ++cancelledCount,
            noRetry
          );
        }, 500);
    }
  );
}
function getReportParams(chartonform, type) {
  var config = getReportConfig(chartonform, type);
  config.show_empty = getReportParamValue('sysparm_show_empty', chartonform);
  var pageNum = document.getElementById('sysparm_page_num_' + config.report_id);
  if (pageNum && pageNum.value) config.page_num = pageNum.value;
  return config;
}
function getReportConfig(chartonform, type) {
  var params = {};
  params.sysparm_report_designer_builder = 'true';
  params.sysparm_is_published = getReportParamValue(
    'sysparm_is_published',
    chartonform
  );
  if (type === 'list') {
    params.sysparm_type = type;
    params.sysparm_table = getReportParamValue('sysparm_table', chartonform);
    params.sysparm_field = getReportParamValue('sysparm_field', chartonform);
    params.sysparm_field_list = getReportParamValue(
      'sysparm_field_list',
      chartonform
    );
    params.sysparm_full_query = getReportParamValue(
      'sysparm_query',
      chartonform
    );
    params.sysparm_query = getReportParamValue('sysparm_query', chartonform);
    params.sysparm_additional_groupby = getReportParamValue(
      'sysparm_additional_groupby',
      chartonform
    );
    params.sysparm_interactive_report = getReportParamValue(
      'sysparm_interactive_report',
      chartonform
    );
    params.sysparm_report_source_id = getReportParamValue(
      'sysparm_report_source_id',
      chartonform
    );
    params.sysparm_view = getReportParamValue('sysparm_view', chartonform);
    return params;
  } else if (type === 'pivot') {
    params.sysparm_type = type;
    params.sysparm_table = getReportParamValue('sysparm_table', chartonform);
    params.sysparm_ct_row = getReportParamValue('sysparm_ct_row', chartonform);
    params.sysparm_ct_column = getReportParamValue(
      'sysparm_ct_column',
      chartonform
    );
    params.sysparm_sumfield = getReportParamValue(
      'sysparm_sumfield',
      chartonform
    );
    params.sysparm_aggregate = getReportParamValue(
      'sysparm_aggregate',
      chartonform
    );
    params.sysparm_aggregation_source = getReportParamValue(
      'sysparm_aggregation_source',
      chartonform
    );
    params.sysparm_query = getReportParamValue('sysparm_query', chartonform);
    params.sysparm_title = getReportParamValue('sysparm_title', chartonform);
    params.sysparm_others = getReportParamValue('sysparm_others', chartonform);
    params.sysparm_show_other = getReportParamValue(
      'sysparm_show_other',
      chartonform
    );
    params.sysparm_list_ui_view = getReportParamValue(
      'sysparm_list_ui_view',
      chartonform
    );
    params.sysparm_report_drilldown = getReportParamValue(
      'sysparm_report_drilldown',
      chartonform
    );
    params.sysparm_report_source_id = getReportParamValue(
      'sysparm_report_source_id',
      chartonform
    );
    return params;
  } else if (type === 'calendar') {
    params.sysparm_type = type;
    params.sysparm_table = getReportParamValue('sysparm_table', chartonform);
    params.sysparm_field = getReportParamValue('sysparm_field', chartonform);
    params.sysparm_cal_field = getReportParamValue(
      'sysparm_cal_field',
      chartonform
    );
    params.sysparm_query = getReportParamValue('sysparm_query', chartonform);
    params.sysparm_list_ui_view = getReportParamValue(
      'sysparm_list_ui_view',
      chartonform
    );
    params.sysparm_report_drilldown = getReportParamValue(
      'sysparm_report_drilldown',
      chartonform
    );
    params.sysparm_report_source_id = getReportParamValue(
      'sysparm_report_source_id',
      chartonform
    );
    return params;
  } else {
    params.table = getReportParamValue('sysparm_table', chartonform);
    params.report_id =
      typeof additionalArgs === 'undefined' ? '' : additionalArgs.report_id;
    if (params.report_id === '')
      params.report_id = getReportParamValue('sysparm_report_id', chartonform);
    params.title = getReportParamValue('sysparm_title', chartonform);
    params.display_grid = getReportParamValue(
      'sysparm_display_grid',
      chartonform
    );
    params.other_threshold = getReportParamValue('sysparm_others', chartonform);
    params.compute_percent = getReportParamValue(
      'sysparm_compute_percent',
      chartonform
    );
    params.chart_size = getReportParamValue('sysparm_chart_size', chartonform);
    params.custom_chart_size = getReportParamValue(
      'sysparm_custom_chart_size',
      chartonform
    );
    params.chart_height = getReportParamValue(
      'sysparm_custom_chart_height',
      chartonform
    );
    params.chart_width = getReportParamValue(
      'sysparm_custom_chart_width',
      chartonform
    );
    params.show_other = getReportParamValue('sysparm_show_other', chartonform);
    params.chart_type = getReportParamValue('sysparm_type', chartonform);
    params.group_by = getReportParamValue('sysparm_field', chartonform);
    params.filter = getReportParamValue('sysparm_query', chartonform);
    params.aggregate = getReportParamValue('sysparm_aggregate', chartonform);
    params.aggregation_source = getReportParamValue(
      'sysparm_aggregation_source',
      chartonform
    );
    params.agg_field = getReportParamValue('sysparm_sumfield', chartonform);
    params.stack_field = getReportParamValue(
      'sysparm_stack_field',
      chartonform
    );
    params.box_field = getReportParamValue('sysparm_box_field', chartonform);
    params.trend_field = getReportParamValue(
      'sysparm_trend_field',
      chartonform
    );
    params.trend_interval = getReportParamValue(
      'sysparm_trend_interval',
      chartonform
    );
    params.calendar = getReportParamValue('sysparm_calendar', chartonform);
    params.funnel_neck_percent = getReportParamValue(
      'sysparm_funnel_neck_percent',
      chartonform
    );
    params.donut_width_percent = getReportParamValue(
      'sysparm_donut_width_percent',
      chartonform
    );
    params.gauge_autoscale = getReportParamValue(
      'sysparm_gauge_autoscale',
      chartonform
    );
    params.from = getReportParamValue('sysparm_from', chartonform);
    params.to = getReportParamValue('sysparm_to', chartonform);
    params.upper_limit = getReportParamValue(
      'sysparm_upper_limit',
      chartonform
    );
    params.lower_limit = getReportParamValue(
      'sysparm_lower_limit',
      chartonform
    );
    params.direction = getReportParamValue('sysparm_direction', chartonform);
    params.chart_title = getReportParamValue(
      'sysparm_chart_title',
      chartonform
    );
    params.show_chart_title = getReportParamValue(
      'sysparm_show_chart_title',
      chartonform
    );
    params.chart_title_size = getReportParamValue(
      'sysparm_chart_title_size',
      chartonform
    );
    params.chart_title_color = getReportParamValue(
      'sysparm_chart_title_color',
      chartonform
    );
    params.custom_chart_title_position = getReportParamValue(
      'sysparm_custom_chart_title_position',
      chartonform
    );
    params.chart_title_x_position = getReportParamValue(
      'sysparm_chart_title_x_position',
      chartonform
    );
    params.chart_title_y_position = getReportParamValue(
      'sysparm_chart_title_y_position',
      chartonform
    );
    params.show_chart_border = getReportParamValue(
      'sysparm_show_chart_border',
      chartonform
    );
    params.title_horizontal_alignment = getReportParamValue(
      'sysparm_title_horizontal_alignment',
      chartonform
    );
    params.title_vertical_alignment = getReportParamValue(
      'sysparm_title_vertical_alignment',
      chartonform
    );
    params.legend_horizontal_alignment = getReportParamValue(
      'sysparm_legend_horizontal_alignment',
      chartonform
    );
    params.legend_vertical_alignment = getReportParamValue(
      'sysparm_legend_vertical_alignment',
      chartonform
    );
    params.chart_border_width = getReportParamValue(
      'sysparm_chart_border_width',
      chartonform
    );
    params.chart_border_radius = getReportParamValue(
      'sysparm_chart_border_radius',
      chartonform
    );
    params.chart_border_color = getReportParamValue(
      'sysparm_chart_border_color',
      chartonform
    );
    params.score_color = getReportParamValue(
      'sysparm_score_color',
      chartonform
    );
    params.chart_background_color = getReportParamValue(
      'sysparm_chart_background_color',
      chartonform
    );
    params.legend_border_width = getReportParamValue(
      'sysparm_legend_border_width',
      chartonform
    );
    params.legend_border_radius = getReportParamValue(
      'sysparm_legend_border_radius',
      chartonform
    );
    params.legend_border_color = getReportParamValue(
      'sysparm_legend_border_color',
      chartonform
    );
    params.legend_background_color = getReportParamValue(
      'sysparm_legend_background_color',
      chartonform
    );
    params.legend_items_left_align = getReportParamValue(
      'sysparm_legend_items_left_align',
      chartonform
    );
    params.show_legend = getReportParamValue(
      'sysparm_show_legend',
      chartonform
    );
    params.show_legend_border = getReportParamValue(
      'sysparm_show_legend_border',
      chartonform
    );
    params.show_chart_data_label = getReportParamValue(
      'sysparm_show_chart_data_label',
      chartonform
    );
    params.show_data_label_position_middle = getReportParamValue(
      'sysparm_show_data_label_position_middle',
      chartonform
    );
    params.allow_data_label_overlap = getReportParamValue(
      'sysparm_allow_data_label_overlap',
      chartonform
    );
    params.show_geographical_label = getReportParamValue(
      'sysparm_show_geographical_label',
      chartonform
    );
    params.show_zero = getReportParamValue('sysparm_show_zero', chartonform);
    params.show_marker = getReportParamValue(
      'sysparm_show_marker',
      chartonform
    );
    params.bar_unstack = getReportParamValue(
      'sysparm_bar_unstack',
      chartonform
    );
    params.x_axis_title = getReportParamValue(
      'sysparm_x_axis_title',
      chartonform
    );
    params.x_axis_title_size = getReportParamValue(
      'sysparm_x_axis_title_size',
      chartonform
    );
    params.x_axis_title_color = getReportParamValue(
      'sysparm_x_axis_title_color',
      chartonform
    );
    params.x_axis_title_bold = getReportParamValue(
      'sysparm_x_axis_title_bold',
      chartonform
    );
    params.x_axis_opposite = getReportParamValue(
      'sysparm_x_axis_opposite',
      chartonform
    );
    params.x_axis_grid_width = getReportParamValue(
      'sysparm_x_axis_grid_width',
      chartonform
    );
    params.x_axis_grid_color = getReportParamValue(
      'sysparm_x_axis_grid_color',
      chartonform
    );
    params.x_axis_display_grid = getReportParamValue(
      'sysparm_x_axis_display_grid',
      chartonform
    );
    params.x_axis_grid_dotted = getReportParamValue(
      'sysparm_x_axis_grid_dotted',
      chartonform
    );
    params.x_axis_label_size = getReportParamValue(
      'sysparm_x_axis_label_size',
      chartonform
    );
    params.x_axis_label_color = getReportParamValue(
      'sysparm_x_axis_label_color',
      chartonform
    );
    params.x_axis_label_bold = getReportParamValue(
      'sysparm_x_axis_label_bold',
      chartonform
    );
    params.y_axis_title = getReportParamValue(
      'sysparm_y_axis_title',
      chartonform
    );
    params.y_axis_title_size = getReportParamValue(
      'sysparm_y_axis_title_size',
      chartonform
    );
    params.y_axis_title_color = getReportParamValue(
      'sysparm_y_axis_title_color',
      chartonform
    );
    params.y_axis_title_bold = getReportParamValue(
      'sysparm_y_axis_title_bold',
      chartonform
    );
    params.y_axis_opposite = getReportParamValue(
      'sysparm_y_axis_opposite',
      chartonform
    );
    params.y_axis_grid_width = getReportParamValue(
      'sysparm_y_axis_grid_width',
      chartonform
    );
    params.y_axis_grid_color = getReportParamValue(
      'sysparm_y_axis_grid_color',
      chartonform
    );
    params.y_axis_display_grid = getReportParamValue(
      'sysparm_y_axis_display_grid',
      chartonform
    );
    params.y_axis_grid_dotted = getReportParamValue(
      'sysparm_y_axis_grid_dotted',
      chartonform
    );
    params.y_axis_from = getReportParamValue(
      'sysparm_y_axis_from',
      chartonform
    );
    params.y_axis_to = getReportParamValue('sysparm_y_axis_to', chartonform);
    params.y_axis_label_size = getReportParamValue(
      'sysparm_y_axis_label_size',
      chartonform
    );
    params.y_axis_label_color = getReportParamValue(
      'sysparm_y_axis_label_color',
      chartonform
    );
    params.y_axis_label_bold = getReportParamValue(
      'sysparm_y_axis_label_bold',
      chartonform
    );
    params.report_source_id = getReportParamValue(
      'sysparm_report_source_id',
      chartonform
    );
    params.sc_groupby_item_id = getReportParamValue(
      'sysparm_sc_groupby_item_id',
      chartonform
    );
    params.sc_groupby_variable_id = getReportParamValue(
      'sysparm_sc_groupby_variable_id',
      chartonform
    );
    params.sc_stackby_item_id = getReportParamValue(
      'sysparm_sc_stackby_item_id',
      chartonform
    );
    params.sc_stackby_variable_id = getReportParamValue(
      'sysparm_sc_stackby_variable_id',
      chartonform
    );
    params.list_ui_view = getReportParamValue(
      'sysparm_list_ui_view',
      chartonform
    );
    params.report_drilldown = getReportParamValue(
      'sysparm_report_drilldown',
      chartonform
    );
    params.show_chart_total = getReportParamValue(
      'sysparm_show_chart_total',
      chartonform
    );
    params.use_color_heatmap = getReportParamValue(
      'sysparm_use_color_heatmap_map',
      chartonform
    );
    params.axis_max_color = getReportParamValue(
      'sysparm_axis_max_color',
      chartonform
    );
    params.axis_min_color = getReportParamValue(
      'sysparm_axis_min_color',
      chartonform
    );
    params.ct_column = getReportParamValue('sysparm_ct_column', chartonform);
    params.ct_row = getReportParamValue('sysparm_ct_row', chartonform);
    params.interactive_report = getReportParamValue(
      'sysparm_interactive_report',
      chartonform
    );
    params.set_color = getReportParamValue('sysparm_set_color', chartonform);
    params.set_color = getReportParamValue('sysparm_set_color', chartonform);
    params.use_default_colors = getReportParamValue(
      'sysparm_use_default_colors',
      chartonform
    );
    params.color = getReportParamValue('sysparm_chart_color', chartonform);
    params.colors = getReportParamValue('sysparm_chart_colors', chartonform);
    params.color_palette = getReportParamValue(
      'sysparm_color_palette',
      chartonform
    );
    params.decimal_precision = getReportParamValue(
      'sysparm_decimal_precision',
      chartonform
    );
    params.show_empty = true;
    params.other_series = '';
    params.report_map = getReportParamValue('sysparm_report_map', chartonform);
    params.report_map_source = getReportParamValue(
      'sysparm_report_map_source',
      chartonform
    );
    params.additional_groupby = getReportParamValue(
      'sysparm_additional_groupby',
      chartonform
    );
    params.original_groupby = getReportParamValue('sysparm_field', chartonform);
    params.original_stackby = getReportParamValue(
      'sysparm_stack_field',
      chartonform
    );
    params.is_published = params.sysparm_is_published;
    params.use_null_in_trend = getReportParamValue(
      'sysparm_use_null_in_trend',
      chartonform
    );
    params.series_name_text = getReportParamValue(
      'sysparm_series_name_text',
      chartonform
    );
    params.formatting_configuration = getReportParamValue(
      'sysparm_formatting_configuration',
      chartonform
    );
    params.datasets_formatting_configuration = getReportParamValue(
      'sysparm_datasets_formatting_configuration',
      chartonform
    );
    params.x_axis_category_fields = getReportParamValue(
      'sysparm_x_axis_category_fields',
      chartonform
    );
    params.y_axis_category_fields = getReportParamValue(
      'sysparm_y_axis_category_fields',
      chartonform
    );
    params.pivot_expanded = getReportParamValue(
      'sysparm_pivot_expanded',
      chartonform
    );
    params.display_row_lines = getReportParamValue(
      'sysparm_display_row_lines',
      chartonform
    );
    params.display_column_lines = getReportParamValue(
      'sysparm_display_column_lines',
      chartonform
    );
    params.cal_field = getReportParamValue('sysparm_cal_field', chartonform);
    params.source_type = getReportParamValue(
      'sysparm_source_type',
      chartonform
    );
    params.custom_config = getReportParamValue(
      'sysparm_custom_config',
      chartonform
    );
    params.start_time = getReportParamValue('sysparm_start_time', chartonform);
    params.end_time = getReportParamValue('sysparm_end_time', chartonform);
    params.pa_indicator = getReportParamValue(
      'sysparm_pa_indicator',
      chartonform
    );
    params.pa_breakdown = getReportParamValue(
      'sysparm_pa_breakdown',
      chartonform
    );
    params.pa_element = getReportParamValue('sysparm_pa_element', chartonform);
    params.pa_breakdown_level2 = getReportParamValue(
      'sysparm_pa_breakdown_level2',
      chartonform
    );
    params.pa_element_level2 = getReportParamValue(
      'sysparm_pa_element_level2',
      chartonform
    );
    params.pa_aggregate = getReportParamValue(
      'sysparm_pa_aggregate',
      chartonform
    );
    return setupSeries(params);
  }
}
function getReportParamValue(name, chartonform) {
  var fullName = name;
  if (chartonform) fullName += chartonform;
  var element = document.getElementById(fullName);
  if (element) return element.value;
  return '';
}
function setupSeries(params) {
  if (
    params.chart_type == 'line' ||
    params.chart_type == 'area' ||
    params.chart_type == 'spline' ||
    params.chart_type == 'line_bar' ||
    params.chart_type == 'step_line'
  )
    params.other_threshold = -1;
  params.series = new Array();
  var curSeries = {};
  var interactiveReport = {};
  if (params.interactive_report) {
    try {
      interactiveReport = JSON.parse(params.interactive_report);
    } catch (err) {
      console.log('unable to parse interactive reports JSON definition');
    }
  }
  curSeries.table = params.table;
  curSeries.report_source_id = params.report_source_id;
  if (interactiveReport.groupby || interactiveReport.groupby === '')
    curSeries.groupby = interactiveReport.groupby;
  else curSeries.groupby = params.group_by;
  curSeries.location = params.location;
  curSeries.report_map_source = params.report_map_source;
  curSeries.report_map = params.report_map;
  curSeries.sc_groupby_item_id = params.sc_groupby_item_id;
  curSeries.sc_groupby_variable_id = params.sc_groupby_variable_id;
  curSeries.sc_stackby_item_id = params.sc_stackby_item_id;
  curSeries.sc_stackby_variable_id = params.sc_stackby_variable_id;
  curSeries.filter = params.filter;
  curSeries.interactive_report = params.interactive_report;
  curSeries.plot_type = params.chart_type;
  if (curSeries.plot_type == 'pareto') curSeries.aggregate_type = 'COUNT';
  else {
    curSeries.aggregate_type = params.aggregate;
    if (params.aggregate != 'COUNT') {
      curSeries.aggregate_field = params.agg_field;
      if (params.aggregate != 'COUNT(DISTINCT')
        curSeries.aggregation_source = params.aggregation_source;
    }
  }
  if (isBarType(curSeries.plot_type)) {
    if (interactiveReport.stackby === '' || interactiveReport.stackby)
      curSeries.stacked_field = interactiveReport.stackby;
    else curSeries.stacked_field = params.stack_field;
  } else if (curSeries.plot_type == 'hist') {
    curSeries.hist_field = params.box_field;
  } else if (curSeries.plot_type == 'box') {
    curSeries.box_field = params.box_field;
  } else if (
    curSeries.plot_type == 'trend' ||
    curSeries.plot_type == 'line' ||
    curSeries.plot_type == 'area' ||
    curSeries.plot_type == 'spline' ||
    curSeries.plot_type == 'line_bar' ||
    curSeries.plot_type == 'control' ||
    curSeries.plot_type == 'availability' ||
    curSeries.plot_type == 'tbox' ||
    curSeries.plot_type == 'step_line'
  ) {
    curSeries.trend_field = params.trend_field;
    curSeries.trend_interval = params.trend_interval;
    curSeries.calendar = params.calendar;
  } else if (
    curSeries.plot_type == 'heatmap' ||
    curSeries.plot_type == 'bubble'
  ) {
    curSeries.ct_row = params.ct_row;
    curSeries.ct_column = params.ct_column;
  } else if (curSeries.plot_type == 'map')
    curSeries.show_geographical_label = params.show_geographical_label;
  curSeries.show_chart_data_label = params.show_chart_data_label;
  curSeries.show_data_label_position_middle =
    params.show_data_label_position_middle;
  curSeries.allow_data_label_overlap = params.allow_data_label_overlap;
  curSeries.show_marker = params.show_marker;
  curSeries.bar_unstack = params.bar_unstack;
  curSeries.list_ui_view = params.list_ui_view;
  curSeries.set_color = params.set_color;
  curSeries.color = params.color;
  curSeries.colors = params.colors;
  curSeries.color_palette = params.color_palette;
  curSeries.show_y_axis = params.show_y_axis;
  curSeries.y_axis_from = params.y_axis_from;
  curSeries.y_axis_to = params.y_axis_to;
  curSeries.y_axis_title = params.y_axis_title;
  curSeries.series_name_text = params.series_name_text;
  curSeries.source_type = params.source_type;
  curSeries.custom_config = params.custom_config;
  curSeries.use_null_in_trend = params.use_null_in_trend;
  params.series.push(curSeries);
  return params;
}
function getChartDataDone(response, args) {
  var chartDataResponse = response.getElementsByTagName('CHART_DATA_RESPONSE');
  if (!response || !chartDataResponse) {
    showError(args['msg_container_id'], 'No response from the server');
  } else {
    var resp = JSON.parse(getTextValue(chartDataResponse[0]));
    processChartDataResponse(resp, args);
  }
  var now = new Date().getTime();
  var elapsedTime = (now - args['start_time']) / 1000;
  console.log('Time taken to render chart: ' + elapsedTime);
}
function processChartDataResponse(resp, args) {
  if (resp.STATUS == 'SUCCESS') {
    var formattingConfiguration;
    var datasetsFormattingConfiguration;
    if (args['formatting_configuration'] === undefined) {
      try {
        var parsedChartParams = JSON.parse(args['chart_params']);
        formattingConfiguration = parsedChartParams.formatting_configuration;
        if (args['datasets_formatting_configuration'] === undefined)
          datasetsFormattingConfiguration =
            parsedChartParams.datasets_formatting_configuration;
      } catch (e) {
        console.log(
          'Failed to parse formatting configuration JSON in chart_params, reverting to default configuration'
        );
      }
    } else {
      formattingConfiguration = args['formatting_configuration'];
      datasetsFormattingConfiguration =
        args['datasets_formatting_configuration'];
    }
    var mychart;
    if ('chartOnForm' in args)
      mychart = new GlideReportChart(
        args['chart_container_id'],
        args['msg_container_id'],
        args['isGauge'],
        args['chart_size'],
        args['chart_type'],
        args['report_id'],
        args['chart_params'],
        args['chart_height'],
        args['chart_width'],
        args['source_type'],
        formattingConfiguration,
        datasetsFormattingConfiguration
      );
    else
      mychart = new GlideReportChart(
        args['chart_container_id'],
        args['msg_container_id'],
        args['isGauge'],
        args['chart_size'],
        args['chart_type'],
        args['report_id'],
        args['chart_params'],
        args['chart_height'],
        args['chart_width'],
        args['source_type'],
        formattingConfiguration,
        datasetsFormattingConfiguration
      );
    if ('isPub' in args && args.isPub) mychart.setPub(args.isPub);
    else mychart.setPub(false);
    var chart_data = JSON.parse(resp.CHART_DATA);
    if (!renderChart(mychart, chart_data, args)) {
      var interval = setInterval(function () {
        if (renderChart(mychart, chart_data, args)) {
          clearInterval(interval);
        }
      }, 1000);
    }
  } else if (resp.STATUS == 'INFO') {
    showInfo(
      args['chart_container_id'],
      resp.MESSAGE ? resp.MESSAGE : resp.INFO_MESSAGE
    );
    document.getElementById(args['msg_container_id']).innerHTML = '';
  } else if (resp.STATUS == 'REPORT_VIEW') {
    showReportView(
      args['chart_container_id'],
      resp.MESSAGE,
      resp.APPROVAL,
      args['report_id'],
      resp.REQUIRED_ROLES,
      resp.APPROVER,
      resp.MSG
    );
    document.getElementById(args['msg_container_id']).innerHTML = '';
  } else {
    showError(
      args['chart_container_id'],
      resp.MESSAGE ? resp.MESSAGE : resp.ERROR_MESSAGE
    );
    document.getElementById(args['msg_container_id']).innerHTML = '';
  }
}
function renderChart(mychart, chart_data, args) {
  var $chartContainer = jQuery('#' + args['chart_container_id']);
  var $noDataMessage = jQuery(
    '#' + args['chart_container_id'] + ' ~ .no-data-container-polaris'
  );
  var isPolarisEnabled = window.NOW && window.NOW.isPolarisEnabled === 'true';
  if (
    isPolarisEnabled &&
    $noDataMessage.css('display') === 'none' &&
    isHighchartEmpty(mychart, chart_data)
  ) {
    $noDataMessage.find('.no-data-message').text(chart_data.noDataToDisplayMsg);
    $noDataMessage.css('display', 'flex');
  }
  if ($chartContainer.is(':visible')) {
    if (args['source_type'] === 'metricbase') {
      var chartParams;
      if (mychart.chartParams) chartParams = JSON.parse(mychart.chartParams);
      mychart.buildMetricBase(chart_data, chartParams);
    } else {
      chart_data.report_properties.publisher_id = args['publisher_id'];
      chart_data.report_properties.report_id = args['report_id'];
      chart_data.report_properties.publisher_filter = args['publisher_filter'];
      checkAndEnableInteractiveFilters(chart_data, args);
      mychart.buildGroupChartForSingleSeries(
        chart_data,
        args['stacked_field'],
        args['agg_type'],
        args['source_type']
      );
      checkAndEnableDisplayGrid(chart_data, args);
    }
    return true;
  } else return false;
}
function isBarType(chart_type) {
  return chart_type === 'bar' || chart_type === 'horizontal_bar';
}
function isPieType(chart_type) {
  return (
    chart_type === 'pie' ||
    chart_type === 'funnel' ||
    chart_type === 'semi_donut' ||
    chart_type === 'pyramid' ||
    chart_type === 'donut'
  );
}
function isGaugeType(chartType) {
  return chartType === 'angular_gauge' || chartType === 'solid_gauge';
}
function formatDuration(secs) {
  var days = Math.floor(secs / 86400);
  var hours = Math.floor((secs % 86400) / 3600);
  var mins = Math.floor(((secs % 86400) % 3600) / 60);
  var secs = ((secs % 86400) % 3600) % 60;
  if (days > 0)
    return (
      days +
      ' days ' +
      hours +
      ' hours ' +
      mins +
      ' minutes ' +
      secs +
      ' seconds'
    );
  if (hours > 0)
    return hours + ' hours ' + mins + ' minutes ' + secs + ' seconds';
  if (mins > 0) return mins + ' minutes ' + secs + ' seconds';
  return secs + ' seconds';
}
function showError(container, errorMsg) {
  document.getElementById(container).innerHTML =
    '<div style="text-align:center;color:red">' +
    'ERROR: ' +
    errorMsg +
    '</div>';
}
function showInfo(container, infoMsg) {
  document.getElementById(container).innerHTML =
    '<div style="text-align:center;color:black">' + infoMsg + '</div>';
}
function showReportView(
  container,
  infoMsg,
  approvalStatus,
  reportId,
  requiredRoles,
  approverName,
  msg
) {
  var aclMessage =
    '<div style="text-align:center;color:black">' + infoMsg + '</div>';
  if (!approvalStatus) approvalStatus = 'NOT_APPLICABLE';
  var msgJson = msg ? JSON.parse(msg) : '';
  switch (approvalStatus) {
    case 'NOT_REQUESTED':
      var onclickValue =
        'onclick="createAccessRequest(' +
        "'" +
        reportId +
        "','" +
        requiredRoles +
        "','" +
        container +
        "','" +
        infoMsg +
        "','" +
        msgJson['Request submitted'] +
        "','" +
        msgJson['Request failed'] +
        "'" +
        ')"';
      document.getElementById(container).innerHTML =
        aclMessage +
        '<br/>' +
        '<button type="button" class="btn btn-default" aria-label="' +
        msgJson['Request Access'] +
        '" tabindex="0" id="request-access-button" ' +
        onclickValue +
        '>' +
        msgJson['Request Access'] +
        '</button>';
      break;
    case 'REQUESTED':
      document.getElementById(container).innerHTML =
        aclMessage +
        '<br/>' +
        '<div style="text-align:center;color:black" aria-label="' +
        msgJson['Request submitted'] +
        '">' +
        msgJson['Request submitted'] +
        '</div>';
      break;
    case 'REJECTED':
      document.getElementById(container).innerHTML =
        aclMessage +
        '<br/>' +
        '<div style="text-align:center;color:black" data-toggle="tooltip" title="' +
        msgJson['Access denied by'] +
        ' ' +
        approverName +
        '" role="tooltip" tabindex="0" aria-label="' +
        msgJson['Access denied'] +
        '">' +
        msgJson['Access denied'] +
        '</div>';
      break;
    case 'NOT_APPLICABLE':
      document.getElementById(container).innerHTML = aclMessage;
      break;
  }
}
function createAccessRequest(
  reportId,
  requiredRoles,
  elementId,
  infoMsg,
  actionMsg,
  errorMsg
) {}
function isHighchartEmpty(glideReportChart, chartData) {
  function isSeriesEmpty(series) {
    return series.series && series.series.data && !series.series.data.length;
  }
  function isBarSeriesEmpty(series) {
    return (
      series.xvalues &&
      series.yvalues &&
      !series.xvalues.length &&
      !series.yvalues.length
    );
  }
  function isSubSeriesEmpty(series) {
    return (
      series.sub_series &&
      series.sub_series.every((series) => isBarSeriesEmpty(series))
    );
  }
  return (
    glideReportChart.chartingEngine.toLowerCase() === 'highcharts' &&
    (!chartData.series.length ||
      chartData.series.every(
        (series) =>
          isSeriesEmpty(series) ||
          isBarSeriesEmpty(series) ||
          isSubSeriesEmpty(series)
      ))
  );
}
function getNoDataMessageTemplate() {
  return (
    '<div data-reporting class="no-data-container-polaris">' +
    '<svg class="no-data-icon" xmlns="http://www.w3.org/2000/svg" width="56" height="56">' +
    '<g fill="none" fill-rule="evenodd">' +
    '<path fill="#FFF" d="M2.5 41.5h42.999V6.501H2.5z"/>' +
    '<path fill="var(--color-main, #64DDAC)" d="M9 34h33v-7H9z"/>' +
    '<path fill="var(--color-light, #E0F8EE)" d="M3 9h42V7H3z"/>' +
    '<path d="M3 9h42V7H3v2zm42 32h-4v-5.5a.5.5 0 00-.5-.5h-9a.5.5 0 00-.5.5V41h-2v-5.5a.5.5 0 00-.5-.5h-9a.5.5 0 00-.5.5V41h-2v-5.5a.5.5 0 00-.5-.5h-9a.5.5 0 00-.5.5V41H3V10h42v31zm-13 0h8v-5h-8v5zm-12 0h8v-5h-8v5zM8 41h8v-5H8v5zM45.5 6h-43a.5.5 0 00-.5.5v35a.5.5 0 00.5.5h43a.5.5 0 00.5-.5v-35a.5.5 0 00-.5-.5z" fill="#2A3E40"/>' +
    '<path d="M8 22h14v-9H8v9zm-.5 1h15a.5.5 0 00.5-.5v-10a.5.5 0 00-.5-.5h-15a.5.5 0 00-.5.5v10a.5.5 0 00.5.5zM26 22h14v-9H26v9zm-.5 1h15a.5.5 0 00.5-.5v-10a.5.5 0 00-.5-.5h-15a.5.5 0 00-.5.5v10a.5.5 0 00.5.5zM8 32h32v-6H8v6zm-.5 1h33a.5.5 0 00.5-.5v-7a.5.5 0 00-.5-.5h-33a.5.5 0 00-.5.5v7a.5.5 0 00.5.5z" fill="#2A3E40"/>' +
    '<path d="M54.5 41.5a9 9 0 01-9 9 9 9 0 01-9-9 9 9 0 019-9 9 9 0 019 9" fill="#FFF"/>' +
    '<path d="M45.5 50c-4.687 0-8.5-3.813-8.5-8.5 0-4.687 3.813-8.5 8.5-8.5 4.687 0 8.5 3.813 8.5 8.5 0 4.687-3.813 8.5-8.5 8.5m0-18c-5.238 0-9.5 4.262-9.5 9.5s4.262 9.5 9.5 9.5 9.5-4.262 9.5-9.5-4.262-9.5-9.5-9.5" fill="#2A3E40"/>' +
    '<path d="M48.593 38.407a.5.5 0 00-.707 0L45.5 40.793l-2.386-2.386a.5.5 0 00-.707.707l2.386 2.386-2.386 2.386a.5.5 0 00.707.707l2.386-2.386 2.386 2.386a.502.502 0 00.707 0 .5.5 0 000-.707L46.207 41.5l2.386-2.386a.5.5 0 000-.707" fill="#2A3E40"/>' +
    '</g>' +
    '</svg>' +
    '<span class="no-data-message"></span>' +
    '</div>'
  );
}
