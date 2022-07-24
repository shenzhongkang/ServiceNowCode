/*! RESOURCE: /scripts/reportcommon/GlideHCWrapper.js */
var GlideHCWrapper = function GlideHCWrapper() {
  this.initialize.apply(this, arguments);
};
GlideHCWrapper.prototype = {
  initialize: function initialize(
    defaultChartOptions,
    data,
    chartProps,
    reportId,
    chartParams,
    chartSize,
    sourceType
  ) {
    this.chartOptions = defaultChartOptions;
    this.chartData = data;
    this.chartProps = chartProps;
    this.chartSize = chartSize;
    this.chartPropsSeries = data.report_properties_series;
    this.isReportViewer =
      window.location.pathname.indexOf('report_viewer.do') !== -1;
    this.defaultFontFamily = 'Helvetica';
    this.otherDisplay = 'Other';
    this.otherDisplayMore = '(more...)';
    this.isGauge = chartProps.isGauge;
    this.origXValues = [];
    this.xValues = [];
    this.maxAllowedLabelLen = 20;
    this.grayColor = '#666';
    this.blackColor = '#000';
    this.aggType = chartProps.aggType;
    this.aggSource = chartProps.aggSource;
    this.otherKey = 'zzyynomatchaabb';
    this.chartType = chartProps.chartType;
    this.report_properties = {};
    if (chartProps.isPub) {
      this.chartOptions.exporting = {};
      this.chartOptions.exporting.enabled = false;
    } else this.setupExportOptions(reportId, chartParams, chartProps.isGauge);
    if (sourceType !== 'metricbase') {
      this.report_properties = {};
      if ('report_properties' in data) {
        this.report_properties = data.report_properties;
        if (
          'font_family' in this.report_properties &&
          this.report_properties.font_family !== ''
        )
          this.defaultFontFamily = this.report_properties.font_family;
        this.otherDisplay = this.report_properties.other_display;
        this.otherDisplayMore = this.report_properties.other_display_more;
      }
      this.chartOptions.publisher_id =
        this.chartData.report_properties.publisher_id;
      this.chartOptions.report_id = this.chartData.report_properties.report_id;
      this.isPublisher = false;
      var gridWindow = '';
      if (typeof glideGrid !== 'undefined') {
        gridWindow = glideGrid.getWindowByGaugeId(
          this.chartOptions.publisher_id
        );
        if (typeof gridWindow === 'undefined' || !gridWindow)
          gridWindow = glideGrid.getWindowByGaugeId(
            this.chartOptions.report_id
          );
      } else if (
        window.SNC &&
        SNC.canvas &&
        SNC.canvas.canvasUtils &&
        SNC.canvas.isGridCanvasActive
      ) {
        gridWindow = SNC.canvas.canvasUtils.getGlideWindow(
          this.chartOptions.report_id
        );
        if (!gridWindow)
          gridWindow = SNC.canvas.canvasUtils.getGlideWindow(
            this.chartOptions.publisher_id
          );
      }
      if (typeof gridWindow !== 'undefined' && gridWindow) {
        var publisherWidget = gridWindow.getPreference('publisher_widget');
        this.isPublisher = publisherWidget === 'true';
      }
    }
    this.chartOptions.credits = { enabled: false };
    var self = this;
    if (typeof this.chartOptions.chart.events !== 'undefined') {
      if (typeof this.chartOptions.chart.events.load !== 'undefined') {
        var callbackInArgument = this.chartOptions.chart.events.load;
        this.chartOptions.chart.events.load = function () {
          self.load();
          callbackInArgument();
        };
      } else {
        this.chartOptions.chart.events.load = this.load;
      }
    } else {
      this.chartOptions.chart.events = {
        load: this.load,
      };
    }
  },
  setupExportOptions: function setupExportOptions(
    reportId,
    chartParams,
    isGauge
  ) {
    if (
      !this.chartData.series.length ||
      (this.chartData.series[0].xvalues &&
        !this.chartData.series[0].xvalues.length)
    ) {
      this.chartOptions.exporting = false;
      return;
    }
    this.chartOptions.exporting = {};
    this.chartOptions.exporting.enabled =
      !(
        typeof chartHelpers !== 'undefined' &&
        chartHelpers &&
        chartHelpers.device
      ) ||
      (chartHelpers.device.type !== 'mobile' &&
        chartHelpers.device.type !== 'm' &&
        chartHelpers.device.type !== 'tablet');
    this.chartOptions.exporting.reportId = reportId;
    this.chartOptions.exporting.isGauge = isGauge;
    var jsonParameters = JSON.parse(chartParams);
    jsonParameters.is_gauge = isGauge;
    this.chartOptions.exporting.params = JSON.stringify(jsonParameters);
    this.chartOptions.exporting.buttons = {
      contextButton: {
        align: 'right',
        x: 0,
        y: -2,
        theme: {
          stroke: 'silver',
        },
        menuItems: [],
      },
    };
    this.chartOptions.exporting.buttons.contextButton.onclick = function (e) {
      if (e) {
        e.stopPropagation();
      }
      if (!this.tooltip.isHidden) {
        this.tooltip.hide(0);
      }
      var button = this.exportSVGElements[0];
      this.contextMenu(
        button.menuClassName,
        this.options.exporting.buttons.contextButton.menuItems,
        button.translateX,
        button.translateY,
        button.width,
        button.height,
        button
      );
      button.setState(2);
    };
    var oldFirefox = false;
    if (window.isFirefox && this.getVersion('firefox') < '40')
      oldFirefox = true;
    var oldChrome = false;
    if (window.isChrome && this.getVersion('chrome') < '64') oldChrome = true;
    var isEdge = this.isBrowser('edge');
    var oldBrowser =
      window.isMSIE9 || window.isMSIE10 || oldFirefox || oldChrome || isEdge;
    this.chartOptions.exporting.downloadMsg =
      chartHelpers.i18n.downloadComplete;
    var self = this;
    var item1 = {};
    var item2 = {};
    item1.text = chartHelpers.i18n.saveAsPng;
    item2.text = chartHelpers.i18n.saveAsJpg;
    if (oldBrowser) this.chartOptions.exporting.enabled = false;
    item1.onclick = function () {
      self.saveChartClientSide('png', this);
    };
    item2.onclick = function () {
      self.saveChartClientSide('jpeg', this);
    };
    this.chartOptions.exporting.buttons.contextButton.menuItems.push(item1);
    this.chartOptions.exporting.buttons.contextButton.menuItems.push(item2);
  },
  getVersion: function (browser) {
    var userAgent = navigator.userAgent.toLowerCase();
    userAgent = userAgent.substring(
      userAgent.indexOf(browser + '/') + (browser === 'firefox' ? 8 : 7)
    );
    userAgent = userAgent.substring(0, userAgent.indexOf('.'));
    var version = userAgent;
    return version;
  },
  isBrowser: function (browser) {
    var userAgent = navigator.userAgent.toLowerCase();
    return userAgent.indexOf(browser.toLowerCase()) > 0;
  },
  saveChartClientSide: function (type, obj) {
    if (typeof obj.options.exporting == '') obj.options.exporting = {};
    obj.options.exporting.fallbackToExportServer = false;
    obj.options.exporting.type = 'image/' + type;
    var titleReport = obj.options.title.text;
    if (titleReport) {
      titleReport =
        titleReport.length > 100 ? titleReport.substring(0, 100) : titleReport;
      titleReport = titleReport.replace(/\s+/g, '_');
      obj.options.exporting.filename = titleReport;
    }
    var expParams = JSON.parse(obj.options.exporting.params);
    var widthTmp = obj.options.chart.width;
    var heightTmp = obj.options.chart.height;
    obj.options.chart.width = expParams.chart_width;
    obj.options.chart.height = expParams.chart_height;
    obj.exportChartLocal(
      {},
      {
        chart: {
          backgroundColor: '#FFFFFF',
        },
      }
    );
    obj.options.chart.width = widthTmp;
    obj.options.chart.height = heightTmp;
    this.showMessage(obj.options.exporting.downloadMsg, 'info', 8000);
  },
  showMessage: function showMessage(message, type, timeInMiliSeconds) {
    if (message) {
      var span = document.createElement('span');
      span.setAttribute('data-type', type ? type : this.msgType.type_default);
      span.setAttribute('data-text', message);
      span.setAttribute(
        'data-duration',
        timeInMiliSeconds ? timeInMiliSeconds : '5000'
      );
      if (typeof GlideUI !== 'undefined')
        GlideUI.get().fire(new GlideUINotification({ xml: span }));
    }
  },
  saveChartServerSide: function (type, obj) {
    var reportDetails = {};
    reportDetails['report_id'] = obj.options.exporting.reportId;
    reportDetails['is_gauge'] = obj.options.exporting.isGauge;
    var chartExportParams = obj.options.exporting.params;
    obj.options.exporting.fallbackToExportServer = true;
    if (chartExportParams === '')
      hc_saveChart(
        'report_id',
        'hcexport_' + type,
        JSON.stringify(reportDetails)
      );
    else hc_saveChart('report_params', 'hcexport_' + type, chartExportParams);
  },
  createHeatmapChart: function (chartType) {
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    var curSeries = hc_createHeatmapSeriesData(
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(curSeries);
    hc_addHeatmapChartOptions(
      this.chartOptions,
      this.chartProps,
      true,
      this.chartData,
      curSeries
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_addHeatmapAxisCategories(this.chartOptions, this.chartData);
    hc_sanitizeCategoryValues(this.chartOptions, this.chartProps);
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createMapChart: function (chartType) {
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    hc_addMapChartOptions(
      this.chartOptions,
      this.chartProps,
      true,
      this.chartData
    );
    var curSeries = hc_createMapSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series = curSeries;
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_updateDataLabelOptionsGeographical(
      this.chartOptions,
      this.chartData,
      this.chartType
    );
    hc_updateMapVisualizationOptions(
      this.chartOptions,
      this.chartData,
      this.chartProps
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart(true);
  },
  createBubbleChart: function (chartType) {
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    this.chartOptions.series = hc_createBubbleSeriesData(
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.xAxis = this.chartData.series[0].xAxis;
    this.chartOptions.yAxis = this.chartData.series[0].yAxis;
    const chartDataSeries = this.chartData.series[0].series;
    this.chartOptions.series = this.chartOptions.series.map((series, index) => {
      series.color = chartDataSeries[index].color;
      return series;
    });
    hc_addBubbleChartOptions(
      this.chartOptions,
      true,
      this.chartData.series[0].legend.enabled
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createBarChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addBarChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      this.getHighChartsType(this.chartData.series[0].series_plot_type),
      true
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    this.chartOptions.series = hc_createMultipleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true,
      this.chartPropsSeries
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createMetricBase: function (chartParams, chartType) {
    if (
      chartParams.show_chart_title === 'never' ||
      (this.isGauge && chartParams.show_chart_title === 'report')
    ) {
      this.chartOptions.title = {};
      this.chartOptions.title.text = '';
    }
    hc_configureLegendAlignment(
      chartType,
      chartParams,
      this.chartOptions,
      false,
      true
    );
    hc_setLegendLabelFormatter(this.chartOptions, true, false);
    this.chartOptions.series.forEach(function (series) {
      series.dataLabels = series.dataLabels || {};
      series.dataLabels.formatter = hc_formatValueLabel;
    });
    this.renderChart();
  },
  createStackedBarChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addStackedBarChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      this.getHighChartsType(this.chartData.series[0].series_plot_type),
      true,
      this.chartPropsSeries
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    this.chartOptions.series = hc_createMultipleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true,
      this.chartPropsSeries
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      'trend',
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createPieChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addXYChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    hc_addPieChartOptions(
      this.chartOptions,
      this.chartProps,
      true,
      chartType == 'semi_donut',
      this.isPublisher
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    var curSeries = hc_createSingleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    if (chartType == 'semi_donut' || chartType == 'donut') {
      curSeries.innerSize =
        100 - this.chartProps.report_properties.donut_width_percent + '%';
      if (this.chartProps.report_properties.show_chart_total)
        hc_addTotal(
          this.chartOptions,
          this.chartProps,
          curSeries,
          this.chartData,
          true
        );
    }
    this.chartOptions.series.push(curSeries);
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createFunnelChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addXYChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    hc_addFunnelChartOptions(
      this.chartOptions,
      this.chartProps,
      true,
      this.chartData,
      this.isPublisher
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    var curSeries = hc_createSingleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(curSeries);
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createPyramidChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addXYChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    hc_addPyramidChartOptions(
      this.chartOptions,
      this.chartProps,
      true,
      this.chartData,
      this.isPublisher
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    var curSeries = hc_createSingleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(curSeries);
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createGaugeChart: function (chartType) {
    hc_addGaugeChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      this.getHighChartsType(this.chartData.series[0].series_plot_type),
      true
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    var curSeries = hc_createSingleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(curSeries);
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      'gauge',
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createHistogramChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addHistogramOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    var histogramSeries = hc_createSingleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(histogramSeries);
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createBoxChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addBoxChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    var boxSeries = hc_createBoxPlotData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(boxSeries);
    var meanSeries = hc_createBoxMeanData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(meanSeries);
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createParetoChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addBarChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      'column',
      true
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    this.chartOptions.plotOptions.column.point = {};
    this.chartOptions.plotOptions.column.point.events = {};
    this.chartOptions.plotOptions.column.point.events.click =
      hc_dataPointClicked;
    var series0 = hc_createSingleSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    this.chartOptions.series.push(series0);
    var cumulative_series = hc_createParetoCumulSeries(
      this.chartOptions,
      this.chartProps,
      series0,
      true
    );
    this.chartOptions.series.push(cumulative_series);
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createTrendChart: function (chartType) {
    if ('sub_series' in this.chartData.series[0]) this.createStackedBarChart();
    else this.createBarChart('trend');
  },
  createLineChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addLineChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true,
      chartType
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    this.chartOptions.series = hc_createLineSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createAvailChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_addAvailChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    this.chartOptions.series = hc_createLineSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  createControlChart: function (chartType) {
    hc_sanitizeXValues(this.chartData, this.chartProps);
    hc_configureChartProportions(
      chartType,
      this.chartData,
      this.chartOptions,
      false,
      true
    );
    hc_addControlChartOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      true
    );
    this.chartOptions.series = hc_createControlSeriesData(
      this.chartOptions,
      this.chartData,
      this.chartProps,
      true
    );
    hc_addDataLabelOptions(
      this.chartOptions,
      this.chartProps,
      this.chartData,
      chartType,
      true
    );
    hc_disableTurboThreshold(this.chartOptions);
    this.renderChart();
  },
  load: function () {
    var reportRoot;
    if (typeof this.userOptions.chart.renderTo === 'string') {
      reportRoot = document.querySelector(
        '#' + this.userOptions.chart.renderTo
      );
    } else {
      reportRoot = this.userOptions.chart.renderTo;
    }
    var tooltipContainer = document.createElement('span');
    tooltipContainer.setAttribute('id', 'hc-aria-label-fallback');
    reportRoot.parentNode.appendChild(tooltipContainer);
    reportRoot.addEventListener('focusin', function (event) {
      var focusedElement = event.target;
      if (!focusedElement.hasAttribute('aria-label')) {
        return;
      }
      tooltipContainer.innerHTML = focusedElement.getAttribute('aria-label');
      focusedElement.setAttribute('aria-describedby', 'hc-aria-label-fallback');
      focusedElement.removeAttribute('aria-label');
      focusedElement.setAttribute('x-had-aria', 'true');
    });
    reportRoot.addEventListener('focusout', function (event) {
      var focusedElement = event.target;
      if (!focusedElement.hasAttribute('x-had-aria')) {
        return;
      }
      focusedElement.setAttribute('aria-label', tooltipContainer.innerHTML);
      focusedElement.removeAttribute('x-had-aria');
      tooltipContainer.innerHTML = '';
    });
  },
  renderChart: function renderChart(isMap) {
    var chart;
    var chartData = this.chartData;
    var chartType = this.chartProps.chartType;
    var self = this;
    if (typeof isMap === 'undefined' || isMap !== true) {
      this.setAnimation(chartData);
      this.setBoost(chartData);
      chart = new Highcharts.Chart(this.chartOptions);
    } else
      chart = new Highcharts.Map(this.chartOptions, function (chart) {
        var reportId = self.chartOptions.mapVisualization.report_id;
        if (reportId) {
          var isLastLevel =
            chartData.report_properties_series[0].map_source
              .is_map_source_last_level;
          var containsLatLonLevel =
            chartData.report_properties_series[0].map_source
              .map_source_contains_lat_lon_level;
          var showPinLocations = containsLatLonLevel && !isLastLevel;
          var useLatLon =
            chartData.report_properties_series[0].map_source.use_lat_lon;
          if (showPinLocations && !chart.options.chart.forExport) {
            var heatmapImg;
            var markerImg;
            var getMapOptions = function (className, title) {
              return (
                "<button class='hc-export-option " +
                className +
                "' title='" +
                title +
                "'></button>"
              );
            };
            if (!useLatLon) {
              heatmapImg = chart.renderer.html(
                getMapOptions(
                  'active-heatmap',
                  chartHelpers.i18n.showAsHeatmap
                ),
                chart.chartWidth - 95,
                24
              );
              markerImg = chart.renderer.html(
                getMapOptions('marker', chartHelpers.i18n.showAsMarkers),
                chart.chartWidth - 65,
                24
              );
            } else {
              heatmapImg = chart.renderer.html(
                getMapOptions('heatmap', chartHelpers.i18n.showAsHeatmap),
                chart.chartWidth - 95,
                24
              );
              markerImg = chart.renderer.html(
                getMapOptions('active-marker', chartHelpers.i18n.showAsMarkers),
                chart.chartWidth - 65,
                24
              );
            }
            heatmapImg.add();
            heatmapImg.attr({
              title: chartHelpers.i18n.showAsHeatmap,
              class: 'hc-image',
              'aria-hidden': false,
            });
            heatmapImg.on('click', function clickHeatmapImg(ev) {
              self.onClickCustomButton(ev, 'heatmap', reportId);
            });
            markerImg.add();
            markerImg.attr({
              title: chartHelpers.i18n.showAsMarkers,
              class: 'hc-image',
              'aria-hidden': false,
            });
            markerImg.on('click', function clickMarkerImg(ev) {
              self.onClickCustomButton(ev, 'marker', reportId);
            });
          }
        }
      });
    var chartsWithDataTable = [
      'control',
      'heatmap',
      'bubble',
      'tbox',
      'box',
      'hist',
    ];
    var containerId = this.chartOptions.chart.renderTo;
    var shouldDisplayGridMetricbase =
      self.chartProps.sourceType === 'metricbase' &&
      self.chartProps.display_grid;
    if (
      ((window.g_accessibility_screen_reader_table === 'true' ||
        window.g_accessibility_screen_reader_table === true) &&
        chartsWithDataTable.indexOf(chartType) > -1) ||
      shouldDisplayGridMetricbase === true ||
      shouldDisplayGridMetricbase === 'true'
    ) {
      this.displayDataTable(containerId, chart);
    }
    jQuery(
      '#' +
        containerId +
        '>div[role=region] h3,#' +
        containerId +
        '> h3, #' +
        containerId +
        '>div[role=region]>div[tabindex=0]'
    ).remove();
    if (chart.exportSVGElements && chart.exportSVGElements[0])
      chart.exportSVGElements[0].toFront();
    var isCanvas = window.SNC && window.SNC.canvas && SNC.canvas.canvasUtils;
    var rootReportId;
    if (
      this.isReportViewer ||
      (isCanvas && containerId.indexOf('preview') === -1)
    ) {
      if (isCanvas) {
        rootReportId = jQuery('#' + containerId)
          .closest('.grid-stack-item')
          .find('.sysparm_root_report_id')
          .first()
          .val();
        var uuid = SNC.canvas.canvasUtils.getUuidFromSysId(rootReportId);
        if (uuid) {
          window.SNC.reportResizingFunctions =
            window.SNC.reportResizingFunctions || {};
          SNC.canvas.eventbus.subscribe(
            uuid,
            this.resizeChartFromCanvas.bind(this)
          );
          SNC.reportResizingFunctions[uuid] = this.resizeChartFromCanvas;
        }
      } else
        rootReportId = jQuery('#' + containerId)
          .parent()
          .parent()
          .find('.sysparm_root_report_id')
          .first()
          .val();
      window.SNC = window.SNC || {};
      window.SNC.reportResizingTimeouts =
        window.SNC.reportResizingTimeouts || {};
      window.addEventListener(
        'resize',
        function () {
          if (SNC.reportResizingTimeouts[rootReportId])
            clearTimeout(SNC.reportResizingTimeouts[rootReportId]);
          SNC.reportResizingTimeouts[rootReportId] = setTimeout(function () {
            var containerDimensions = hc_getDimensions(containerId, true);
            chart.setSize(
              containerDimensions.width,
              containerDimensions.height
            );
          }, 250);
        },
        false
      );
    }
    this.applyPreviousStateForInteractiveFilter(chart);
  },
  displayDataTable: function (containerId, chart) {
    var dataTableDiv = document.createElement('div');
    dataTableDiv.className = 'highcharts-data-table';
    dataTableDiv.innerHTML = chart.getTable();
    var dataTable = dataTableDiv.getElementsByTagName('table');
    if (dataTable && dataTable.length) {
      dataTable[0].setAttribute('tabindex', 0);
    }
    jQuery(dataTableDiv).insertAfter('#' + containerId);
  },
  setAnimation: function (chartData) {
    this.chartOptions.plotOptions = this.chartOptions.plotOptions || {};
    this.chartOptions.plotOptions.series =
      this.chartOptions.plotOptions.series || {};
    if (chartData.report_properties) {
      this.chartOptions.plotOptions.series.animation =
        chartData.report_properties.chart_animation;
      this.chartOptions.chart.animation =
        chartData.report_properties.chart_animation;
    }
    var isEdge = this.isBrowser('edge');
    var isMSIE11 = this.isBrowser('trident');
    if (window.isMSIE || isMSIE11 || isEdge) {
      this.chartOptions.plotOptions.series.animation = false;
      this.chartOptions.chart.animation = false;
    }
  },
  setBoost: function (chartData) {
    this.chartOptions.plotOptions = this.chartOptions.plotOptions || {};
    this.chartOptions.plotOptions.series =
      this.chartOptions.plotOptions.series || {};
    this.chartOptions.boost = {};
    this.chartOptions.boost.enabled =
      chartData.report_properties &&
      chartData.report_properties.chart_boost_enabled
        ? chartData.report_properties.chart_boost_enabled
        : false;
    if (chartData.report_properties && chartData.report_properties.chart_boost)
      this.chartOptions.plotOptions.series.boostThreshold =
        chartData.report_properties.chart_boost;
  },
  applyPreviousStateForInteractiveFilter: function (chart) {
    var isChartFilterable =
      this.chartProps.chartType == 'pie' ||
      this.chartProps.chartType == 'semi_donut' ||
      this.chartProps.chartType == 'donut' ||
      this.chartProps.chartType == 'funnel' ||
      this.chartProps.chartType == 'pyramid';
    if (isChartFilterable) {
      if (this.chartProps.interactive_report) {
        var interActiveReport = JSON.parse(this.chartProps.interactive_report);
        var selectedPointUrl = interActiveReport.selectedPoint || '';
        var filtersFromLegend = interActiveReport.filtersFromLegend || {};
        chart.series[0].data.forEach(function (dataPoint) {
          if (dataPoint.publisher_filter) {
            var url = dataPoint.publisher_filter.replace('^', '^EQ^');
            if (url === selectedPointUrl)
              dataPoint.select('select', 'preventDataPointSelect');
            url = dataPoint.legend_deselect_filter;
            if (filtersFromLegend[url]) dataPoint.setVisible(false);
          }
        });
      }
    }
  },
  resizeChartFromCanvas: function resizeChartFromCanvas(data) {
    if (data.action === 'resize') {
      var containerId = this.chartOptions.chart.renderTo;
      var chart = jQuery('#' + containerId).highcharts();
      if (chart) {
        var containerDimensions = hc_getDimensions(containerId, true);
        chart.setSize(containerDimensions.width, containerDimensions.height);
      }
    }
  },
  onClickCustomButton: function onClickCustomButton(event, button, reportId) {
    if (typeof this.chartOptions.mapVisualization !== 'undefined') {
      var mapVis = this.chartOptions.mapVisualization;
      var fullQuery = mapVis.full_query;
      var showDataLabel = mapVis.show_data_label;
      var showGeographicalLabel = mapVis.show_geographical_label;
      var mapParams = '';
      var element = event.srcElement;
      if (!element) element = event.target;
      var content = jQuery(element).closest('.report_content');
      if (reportId) {
        var actualMap = mapVis.report_drilldown_map;
        if (actualMap) mapParams += 'sysparm_report_map_parent=' + actualMap;
        if (showDataLabel)
          mapParams += '&sysparm_show_chart_data_label=' + showDataLabel;
        if (showGeographicalLabel)
          mapParams +=
            '&sysparm_show_geographical_label=' + showGeographicalLabel;
        if (fullQuery) mapParams += '&sysparm_full_query_map=' + fullQuery;
        if (button === 'heatmap')
          mapParams += '&sysparm_report_map_exact_points=false';
        else mapParams += '&sysparm_report_map_exact_points=true';
        drillReport(content.parent(), reportId, '', mapParams);
      }
    }
  },
  getHighChartsType: function getHighChartsType(snType) {
    if (snType == 'bar' || snType == 'trend') return 'column';
    else if (snType == 'horizontal_bar') return 'bar';
    else if (snType == 'pie') return 'pie';
    else if (snType == 'semi_donut') return 'pie';
    else if (snType == 'donut') return 'pie';
    else if (snType == 'funnel') return 'funnel';
    else if (snType == 'pyramid') return 'funnel';
    else if (snType == 'box') return 'boxplot';
    else if (snType == 'angular_gauge') return 'gauge';
    else if (snType == 'solid_gauge') return 'solidgauge';
    else if (snType == 'heatmap') return 'heatmap';
    else if (snType == 'bubble') return 'bubble';
    else return '';
  },
  type: 'GlideHCWrapper',
};
