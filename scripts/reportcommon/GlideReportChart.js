/*! RESOURCE: /scripts/reportcommon/GlideReportChart.js */
var GlideReportChart = function GlideReportChart() {
  this.initialize.apply(this, arguments);
};
GlideReportChart.prototype = {
  initialize: function initialize(
    elemId1,
    elemId2,
    isGauge,
    chartSize,
    chartType,
    reportId,
    chartParams,
    chartHeight,
    chartWidth,
    sourceType,
    formattingConfiguration,
    datasetsFormattingConfiguration
  ) {
    this.chartContainerId = elemId1;
    this.msgContainerId = elemId2;
    this.isGauge = isGauge;
    this.chartSize = chartSize;
    this.chartHeight = chartHeight;
    this.chartWidth = chartWidth;
    this.chartOptions = {};
    this.chartingEngine = 'Highcharts';
    this.chartType = chartType;
    this.reportId = reportId;
    this.chartParams = chartParams;
    this.isPub = false;
    this.sourceType = sourceType;
    this.formattingConfiguration = formattingConfiguration;
    this.datasetsFormattingConfiguration = datasetsFormattingConfiguration;
    this.titleMargin = 50;
  },
  setPub: function setPub(isPub) {
    this.isPub = isPub;
  },
  showError: function showError(errorMsg) {
    document.getElementById(this.chartContainerId).innerHTML =
      '<div style="text-align:center;color:red">ERROR: ' + errorMsg + '</div>';
  },
  showWarning: function showWarning(warnMsg) {
    document.getElementById(this.msgContainerId).innerHTML =
      '<div style="text-align:center;color:black">WARNING: ' +
      warnMsg +
      '</div>';
  },
  showMessage: function showMessage(msg) {
    document.getElementById(this.msgContainerId).innerHTML =
      '<div style="text-align:center;color:black">' + msg + '</div>';
  },
  setRenderTo: function setRenderTo(elem) {
    this.chartOptions.renderTo = elem;
  },
  initDefaultChartOptions: function initDefaultChartOptions(
    chartData,
    aggType,
    stackedField
  ) {
    var isRtl =
      jQuery('html').hasClass('rtl') || jQuery('html').attr('dir') === 'rtl';
    var chartOptionsProps =
      hc_initDefaultChartOptions(
        this.chartOptions,
        chartData,
        this.chartType,
        this.chartSize,
        this.isGauge,
        this.isPub,
        this.chartContainerId,
        aggType,
        stackedField,
        true,
        this.chartHeight,
        this.chartWidth,
        isRtl
      ) || {};
    var chartParamsObj = JSON.parse(this.chartParams);
    chartOptionsProps.other_threshold = chartParamsObj.other_threshold;
    chartOptionsProps.display_grid = chartParamsObj.display_grid;
    chartOptionsProps.show_other = chartParamsObj.show_other;
    chartOptionsProps.interactive_report = chartParamsObj.interactive_report;
    chartOptionsProps.page_num = chartParamsObj.page_num
      ? chartParamsObj.page_num
      : 0;
    chartOptionsProps.box_field = chartParamsObj.box_field;
    chartOptionsProps.filter_with_orderby = chartParamsObj.filter;
    chartOptionsProps.agg_field = chartParamsObj.agg_field;
    chartOptionsProps.other_series = chartParamsObj.other_series;
    chartOptionsProps.stack_field = chartParamsObj.stack_field;
    chartOptionsProps.box_field = chartParamsObj.box_field;
    chartOptionsProps.trend_field = chartParamsObj.trend_field;
    chartOptionsProps.trend_interval = chartParamsObj.trend_interval;
    chartOptionsProps.colors = chartParamsObj.colors;
    chartOptionsProps.sourceType = this.sourceType;
    return chartOptionsProps;
  },
  createBreadcrumbsMapChart: function createBreadcrumbsMapChart(
    reportId,
    containerId,
    breadcrumbs
  ) {
    if (reportId) {
      var breadcrumbsContainer = jQuery('#' + containerId)
        .parent()
        .siblings('.report_breadcrumbs')[0];
      if (breadcrumbsContainer) {
        var ol = document.createElement('ol');
        ol.className = 'breadcrumb';
        ol.style.marginBottom = '0';
        for (i = 0; i < breadcrumbs.length; i++) {
          var breadcrumb = breadcrumbs[i];
          var li = document.createElement('li');
          var text = document.createTextNode(breadcrumb.name);
          if (i === breadcrumbs.length - 1) {
            li.className = 'active';
            li.appendChild(text);
          } else {
            var a = document.createElement('a');
            a.setAttribute('href', 'javascript:void(0)');
            a.setAttribute(
              'onclick',
              "clickOnABreadcrumb('" +
                reportId +
                "','" +
                containerId +
                "','" +
                encodeURIComponent(JSON.stringify(breadcrumb.params)) +
                "')"
            );
            a.appendChild(text);
            li.appendChild(a);
          }
          ol.appendChild(li);
        }
        breadcrumbsContainer.appendChild(ol);
      }
    }
  },
  buildMetricBase: function buildMetricBase(chartData, chartParams) {
    this.showMessage('');
    this.chartOptions = chartData;
    if (this.chartContainerId)
      this.chartOptions.chart.renderTo = this.chartContainerId;
    hc_setHeightWidthChart(
      this.chartOptions,
      chartData,
      this.chartSize,
      this.isGauge,
      this.chartContainerId,
      chartParams.custom_chart_size,
      this.chartHeight,
      this.chartWidth
    );
    var props = {};
    props.sourceType = this.sourceType;
    props.display_grid = JSON.parse(this.chartParams).display_grid;
    props.isGauge = this.isGauge;
    props.isPub = this.isPub;
    props.formattingConfiguration = this.formattingConfiguration;
    props.datasetsFormattingConfiguration =
      this.datasetsFormattingConfiguration;
    var hcWrapper = new GlideHCWrapper(
      this.chartOptions,
      chartData,
      props,
      this.reportId,
      this.chartParams,
      this.chartSize,
      this.sourceType
    );
    hcWrapper.createMetricBase(chartParams, this.chartType);
  },
  buildGroupChartForSingleSeries: function buildGroupChartForSingleSeries(
    chartData,
    stackedField,
    aggType,
    sourceType
  ) {
    this.showMessage('');
    if ('additional_msg' in chartData)
      this.showMessage(chartData.additional_msg);
    if ('additional_msg' in chartData.report_properties_series[0])
      this.showMessage(chartData.report_properties_series[0].additional_msg);
    if ('additional_msg' in chartData.report_properties_series[0])
      this.showMessage(chartData.report_properties_series[0].additional_msg);
    if (this.chartType !== 'heatmap' && 'warning' in chartData.series[0])
      this.showWarning(chartData.series[0].warning);
    if (this.chartingEngine === 'Highcharts') {
      if (this.chartType === 'map') {
        var reportId = this.reportId;
        var containerId = this.chartContainerId;
        var breadcrumbs = chartData.report_properties_series[0].breadcrumbs;
        this.createBreadcrumbsMapChart(reportId, containerId, breadcrumbs);
      }
      var props = this.initDefaultChartOptions(
        chartData,
        aggType,
        stackedField
      );
      props.formattingConfiguration = this.formattingConfiguration;
      props.datasetsFormattingConfiguration =
        this.datasetsFormattingConfiguration;
      var hcWrapper = new GlideHCWrapper(
        this.chartOptions,
        chartData,
        props,
        this.reportId,
        this.chartParams,
        this.chartSize,
        sourceType
      );
      hc_setLegendLabelFormatter(this.chartOptions, true, false);
      if (this.isBarType(this.chartType)) {
        if (stackedField === '') hcWrapper.createBarChart(this.chartType);
        else hcWrapper.createStackedBarChart(this.chartType);
      } else if (
        this.chartType === 'pie' ||
        this.chartType === 'semi_donut' ||
        this.chartType === 'donut'
      )
        hcWrapper.createPieChart(this.chartType);
      else if (this.chartType === 'funnel')
        hcWrapper.createFunnelChart(this.chartType);
      else if (this.chartType === 'heatmap')
        hcWrapper.createHeatmapChart(this.chartType);
      else if (this.chartType === 'map')
        hcWrapper.createMapChart(this.chartType);
      else if (this.chartType === 'bubble')
        hcWrapper.createBubbleChart(this.chartType);
      else if (this.chartType === 'pyramid')
        hcWrapper.createPyramidChart(this.chartType);
      else if (this.chartType === 'hist')
        hcWrapper.createHistogramChart(this.chartType);
      else if (this.chartType === 'pareto')
        hcWrapper.createParetoChart(this.chartType);
      else if (this.chartType === 'box' || this.chartType === 'tbox')
        hcWrapper.createBoxChart(this.chartType);
      else if (this.chartType === 'trend')
        hcWrapper.createTrendChart(this.chartType);
      else if (isLineType(this.chartType))
        hcWrapper.createLineChart(this.chartType);
      else if (this.chartType === 'control')
        hcWrapper.createControlChart(this.chartType);
      else if (this.chartType === 'availability')
        hcWrapper.createAvailChart(this.chartType);
      else if (
        this.chartType === 'angular_gauge' ||
        this.chartType === 'solid_gauge'
      )
        hcWrapper.createGaugeChart(this.chartType);
    }
  },
  isBarType: function isBarType(type) {
    if (type === 'bar' || type === 'horizontal_bar') return true;
    return false;
  },
  isLineType: function isLineType(type) {
    return (
      type === 'line' ||
      type === 'area' ||
      type === 'spline' ||
      type === 'line_bar' ||
      type === 'step_line'
    );
  },
  type: 'GlideReportChart',
};
