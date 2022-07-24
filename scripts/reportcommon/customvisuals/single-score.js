/*! RESOURCE: /scripts/reportcommon/customvisuals/single-score.js */
function SingleScore(reportUUID, runType, config) {
  'use strict';
  var self = this;
  if (!config) {
    config = window.g_report_params[reportUUID];
    config.is_report_source_filter_already_combined = true;
  }
  createReportTemplate(reportUUID, config);
  this.containerId = 'chart-container-' + reportUUID;
  this.msgContainerId = 'msg-container-' + reportUUID;
  this.$container = jQuery('#' + this.containerId);
  this.$wrap = this.$container;
  this.config = config;
  this.title = config.title;
  this.is_portal = config.is_portal;
  this.isServicePortal =
    jQuery('html').attr('ng-app') === 'ng_spd' ||
    (window.NOW && window.NOW.hasOwnProperty('sp'));
  this.reportId = config.report_id;
  this.table = config.table;
  this.condition = config.filter;
  this.minMargin = 5;
  this.maxFontSize = 200;
  this.minWrapHeight = 64;
  this.listUIViewName = '';
  this.relativeFontSize = 0.7;
  this.real_time = config.real_time;
  this.channelId = '';
  if (top.g_ambClient || (top.amb && top.amb.getClient()))
    this.amb = top.g_ambClient || top.amb.getClient();
  this._channelListener = null;
  this.$el = jQuery('<span/>');
  this.rootReportElementClass = '.sysparm_root_report_id';
  this.defaults = {
    value: '0',
    chart_background_color: '#fff',
    displayvalue: 'No value',
    color: '#000',
    displayValueChars: 0,
  };
  this.isBuilder = reportUUID === 'builder';
  self.fetchData(runType);
}
SingleScore.prototype.fetchData = function fetchData(runType) {
  var self = this;
  self.unsubscribeListener(self);
  var processor =
    runType === 'run'
      ? 'SingleScoreRunProcessor'
      : 'SingleScoreRunPublishedProcessor';
  jQuery
    .ajax({
      method: 'POST',
      url: '/xmlhttp.do',
      dataType: 'xml',
      headers: { 'X-UserToken': window.g_ck },
      data: {
        sysparm_processor: processor,
        sysparm_scope: 'global',
        is_portal: self.is_portal,
        sysparm_timer: new Date().getTime(),
        sysparm_request_params: JSON.stringify(
          self.buildRequestParams(self.config)
        ),
      },
    })
    .done(function doneCb(xml) {
      self.render(xml);
    })
    .fail(function failCb(jqXHR, textStatus, error) {
      console.log(textStatus, error);
    });
  self.eventHandlers();
};
SingleScore.prototype.getChannelId = function getChannelId(
  reportId,
  responseDate
) {
  var self = this;
  if (
    self.is_portal &&
    top.SNC &&
    top.SNC.channelListeners &&
    self.real_time === 'true'
  ) {
    jQuery
      .ajax({
        method: 'POST',
        url: '/api/now/par/amb/' + reportId,
        dataType: 'json',
        headers: {
          'X-UserToken': window.g_ck,
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({ sysparm_query: self.config.filter }),
      })
      .done(function doneCb(response) {
        var sortedKeys = Object.keys(response.result).sort();
        var sortedResult = {};
        for (var i = 0; i < sortedKeys.length; i++) {
          var key = sortedKeys[i];
          sortedResult[key] = response.result[key];
        }
        response.result = sortedResult;
        sortedResult.condition = responseDate.condition;
        try {
          self.channelId =
            '/par/aggregate/' +
            self.base64Encode(JSON.stringify(sortedResult)).replace(/=/g, '-');
        } catch (error) {
          console.log('Error in base64Encode: ' + error);
          showError(
            self.containerId,
            'An error occured while generating chart.'
          );
        }
        self.registerWatcher(responseDate);
      })
      .fail(function failCb(jqXHR, textStatus, error) {
        console.log(textStatus, error);
      });
  } else self.registerWatcher(responseDate);
};
SingleScore.prototype.unsubscribeListener = function unsubscribeListener() {
  var self = this;
  if (top.SNC && top.SNC.channelListeners) {
    self._channelListener = top.SNC.channelListeners[self.reportId];
    if (self._channelListener) {
      self._channelListener.unsubscribe();
      delete top.SNC.channelListeners[self.reportId];
    }
  }
};
SingleScore.prototype.shouldShowTitle = function shouldShowTitle() {
  if (
    this.config.show_chart_title === 'never' ||
    (!this.config.title && !this.config.chart_title) ||
    (this.config.show_chart_title === 'report' && this.isBuilder === false)
  )
    return false;
  return true;
};
SingleScore.prototype.render = function render(response) {
  var self = this;
  var config = self.config;
  var responseData;
  if (!response) {
    hideReportIsLoading(findGridWindowFromElementID(self.containerId));
    showError(self.containerId, 'No response from the server');
    return;
  }
  var resp = JSON.parse(jQuery(response).find('RESPONSE').text());
  if (resp.STATUS === 'SUCCESS') {
    try {
      var respData = JSON.parse(resp.RESPONSE_DATA);
      var hrefVal;
      var titleProps;
      self.drill_new_win = respData.drill_open_new_win;
      if (self.isBuilder && respData.drill_message)
        showInfo(self.msgContainerId, respData.drill_message);
      this.reportDrilldown = respData.report_drilldown;
      if (respData.widget_navigation && respData.widget_navigation.length)
        this.widgetNav = respData.widget_navigation;
      self.listUIViewName = respData.list_ui_view_name;
      self.drillOpenNewWin = respData.drill_open_new_win;
      responseData = jQuery.extend({}, self.defaults, respData);
      var evaluatedColor = self.evaluateColor(
        responseData.value,
        responseData.rules,
        responseData.color
      );
      hrefVal =
        typeof this.widgetNav !== 'undefined'
          ? this.widgetNav
          : getListURL(
              self.table,
              responseData.filter,
              responseData.list_ui_view_name
            );
      var encodedClickUrlInfo = encodeURIComponent(responseData.filter);
      var $contentEl = jQuery('<a/>')
        .text(responseData.displayvalue)
        .attr('id', self.reportId)
        .attr('href', hrefVal)
        .attr('rel', encodedClickUrlInfo)
        .attr('aria-label', self.title + '+' + responseData.tooltip)
        .css('color', evaluatedColor);
      self.$container
        .html('<div class="single-score" aria-live="polite"/>')
        .find('.single-score')
        .html(self.$el.html($contentEl));
      if (!window.isMSIE9) {
        jQuery(window).on('beforeunload', self.unsubscribeListener.bind(self));
        self.unsubscribeListener(self);
        setTimeout(function getChannelTimeoutCb() {
          self.getChannelId(self.reportId, responseData);
        }, 200);
      }
      if (responseData.tooltip) {
        self.$el.attr('title', responseData.tooltip);
        if (!self.isServicePortal && self.$el.tooltip)
          self.$el
            .attr('data-container', 'body')
            .attr('data-placement', 'bottom')
            .tooltip()
            .hideFix();
      }
      if (
        !(
          window.SNC &&
          window.SNC.canvas &&
          window.SNC.canvas.layoutJson &&
          window.SNC.canvas.layoutJson.isConverting
        )
      )
        self.updateSize();
      if (self.shouldShowTitle()) {
        if (config.chart_title) config.title = config.chart_title;
        titleProps = {
          title: config.title,
          chart_title_size: config.chart_title_size,
          chart_title_x_position: config.chart_title_x_position,
          chart_title_y_position: config.chart_title_y_position,
          title_horizontal_alignment: config.title_horizontal_alignment,
          title_vertical_alignment: config.title_vertical_alignment,
        };
        if (responseData.chart_title_color)
          titleProps.chart_title_color = responseData.chart_title_color;
        self.generateTitle(titleProps);
        self.updateSize();
      }
    } catch (error) {
      console.log(error);
      showError(self.containerId, 'An error occured while generating chart.');
    }
  } else if (resp.STATUS === 'FAILURE')
    showError(self.containerId, resp.RESPONSE_DATA);
  else if (resp.STATUS == 'REPORT_VIEW')
    showReportView(
      self.containerId,
      resp.RESPONSE_DATA,
      resp.APPROVAL,
      self.reportId,
      resp.REQUIRED_ROLES,
      resp.APPROVER,
      resp.MSG
    );
  else showInfo(self.containerId, resp.RESPONSE_DATA);
  hideReportIsLoading(findGridWindowFromElementID(self.containerId));
};
SingleScore.prototype.evaluateColor = function evaluateColor(
  score,
  rules,
  defaultColor
) {
  if (rules) {
    var colorStyle = chartHelpers.evaluateColorRules(score, rules);
    if (colorStyle.color) return colorStyle.color;
  }
  return defaultColor;
};
SingleScore.prototype.base64Encode = function base64Encode(queryString) {
  try {
    return btoa(queryString);
  } catch (error) {
    if (
      window.DOMException &&
      error instanceof window.DOMException &&
      error.name === 'InvalidCharacterError'
    )
      return btoa(chartHelpers.hexEncode(queryString));
    throw error;
  }
};
SingleScore.prototype.registerWatcher = function registerWatcher(
  singleScoreResponse
) {
  var self = this;
  if (self.is_portal && top.SNC && top.SNC.channelListeners) {
    try {
      self._channelListener = top.SNC.channelListeners[self.reportId];
      if (self._channelListener) {
        self._channelListener.unsubscribe();
        delete top.SNC.channelListeners[self.reportId];
      }
      if (
        self.real_time === 'true' &&
        self.amb &&
        self.amb.getChannel(self.channelId)
      ) {
        self._channelListener = self.amb.getChannel(self.channelId);
        self._channelListener.subscribe(function subscribeCb(channelData) {
          self.updateScore(channelData, singleScoreResponse);
        });
        top.SNC.channelListeners[self.reportId] = self._channelListener;
      }
    } catch (error) {}
  }
};
SingleScore.prototype.updateSize = function updateSize() {
  var self = this;
  var wrapHeight;
  var wrapWidth;
  var $widgetBody;
  var fontSize = self.maxFontSize;
  var $widgetContent;
  var titleHeight = 0;
  var isCanvas =
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.canvasUtils &&
    SNC.canvas.isGridCanvasActive;
  self.$container.css({
    margin: '0',
  });
  if (!self.is_portal) {
    if (self.$wrap.closest('td').length) $widgetBody = self.$wrap.closest('td');
    else $widgetBody = jQuery('body');
    self.$container.css({ padding: '10px 0' });
    wrapHeight = 100;
    wrapWidth = $widgetBody.width() || 100;
  } else if (isCanvas && self.containerId.indexOf('preview') === -1) {
    $widgetContent = self.$container.closest('.grid-widget-content');
    wrapHeight = $widgetContent.height();
    wrapWidth = $widgetContent.width() - this.minMargin * 2;
    titleHeight = $widgetContent.find('.singlescore_title').height() || 0;
  } else if (isCanvas && self.containerId.indexOf('preview') >= -1) {
    $widgetContent = self.$container.closest('.widget-preview');
    wrapHeight = $widgetContent.height();
    wrapWidth = $widgetContent.width();
    titleHeight = $widgetContent.find('.singlescore_title').height() || 0;
  } else {
    $widgetBody = self.$wrap.closest('.widget_body');
    if (jQuery('.home_preview ' + self.$containerId).length) {
      self.$container = jQuery('.home_preview #' + self.containerId);
      self.$wrap = self.$container.closest('.single-score-wrap');
      $widgetBody = jQuery('.home_preview');
    }
    wrapHeight = $widgetBody.height();
    wrapWidth = $widgetBody.width() - this.minMargin * 2;
    if (wrapWidth < 0) wrapWidth = 150;
    if (wrapHeight < self.minWrapHeight) wrapHeight = self.minWrapHeight;
  }
  wrapHeight -= titleHeight;
  self.$el.css({ 'font-size': fontSize });
  while (self.$container.find('span').width() > wrapWidth && fontSize > 15) {
    fontSize -= 5;
    self.$el.css('font-size', fontSize);
  }
  fontSize = self.checkHeight(fontSize, wrapHeight);
  self.$el.css('font-size', fontSize);
  if (!isCanvas) {
    self.$container.css(
      'margin-top',
      self.getMinMargin(
        parseInt((wrapHeight - fontSize) / 2, 10) - this.minMargin
      )
    );
    self.$container.css(
      'margin-bottom',
      self.getMinMargin(
        parseInt((wrapHeight - fontSize) / 2, 10) - this.minMargin
      )
    );
  } else {
    self.$container.css(
      'margin-top',
      self.getMinMargin(parseInt((wrapHeight - fontSize) / 2, 10))
    );
    self.$container.css(
      'margin-bottom',
      self.getMinMargin(parseInt((wrapHeight - fontSize) / 2, 10))
    );
  }
  self.$container.css({
    'margin-left': this.minMargin + 'px',
    'margin-right': this.minMargin + 'px',
  });
};
SingleScore.prototype.updateScore = function updateScore(
  channelData,
  singleScoreResponse
) {
  var self = this;
  try {
    var $element = jQuery('#' + self.reportId);
    var $parent = $element.closest('span');
    var score = channelData.data && channelData.data.score;
    var formatted_score = channelData.data && channelData.data.formatted_score;
    var formatted_score_tooltip =
      channelData.data && channelData.data.formatted_score_tooltip;
    if (
      typeof channelData.data.score !== 'undefined' &&
      typeof score === 'number'
    ) {
      if (score < 0) score = 0;
      var localizedScore = score.toLocaleString();
      if (window.isMSIE10)
        localizedScore = localizedScore.substring(
          0,
          localizedScore.indexOf('.')
        );
      if ($parent.attr('data-original-title'))
        $parent.attr('data-original-title', formatted_score_tooltip);
      $element.text(formatted_score);
      $element.css(
        'color',
        self.evaluateColor(
          score,
          singleScoreResponse.rules,
          singleScoreResponse.color
        )
      );
      if (
        singleScoreResponse.displayValueChars !==
        singleScoreResponse.displayvalue.length
      ) {
        self.updateSize();
        singleScoreResponse.displayValueChars =
          singleScoreResponse.displayvalue.length;
      }
      singleScoreResponse.value = score;
      singleScoreResponse.displayvalue = formatted_score;
    }
  } catch (error) {
    console.log(error);
    showError(
      SingleScore.containerId,
      'An error occured while generating chart.'
    );
  }
};
SingleScore.prototype.generateTitle = function generateTitle(titleProps) {
  var defaultFontSize = 14;
  var $container = jQuery('#' + this.containerId).find('.single-score');
  var $titleEl = jQuery('<div class="singlescore_title"/>')
    .text(titleProps.title)
    .attr('title', titleProps.title)
    .attr('aria-hidden', 'true');
  if ($titleEl.tooltip && !this.isServicePortal)
    $titleEl
      .attr('data-container', 'body')
      .attr('data-placement', 'top')
      .tooltip()
      .hideFix();
  if (titleProps.chart_title_color)
    $titleEl.css('color', titleProps.chart_title_color);
  if (titleProps.chart_title_size)
    $titleEl.css('font-size', titleProps.chart_title_size + 'px');
  if (titleProps.title_horizontal_alignment)
    $titleEl.css('text-align', titleProps.title_horizontal_alignment);
  if (!titleProps.custom_chart_title_position)
    switch (titleProps.title_vertical_alignment) {
      case 'top':
        $container.prepend($titleEl);
        break;
      case 'middle':
        $titleEl.css({
          position: 'absolute',
          width: '100%',
          top: '50%',
          'margin-top':
            -(titleProps.chart_title_size / 2) || -(defaultFontSize / 2),
        });
        $container.prepend($titleEl);
        break;
      case 'bottom':
        $container.append($titleEl);
        break;
    }
  else {
    $titleEl.css({
      position: 'absolute',
      top: titleProps.chart_title_y_position,
      left: titleProps.chart_title_x_position,
    });
    $container.css({
      paddingTop: titleProps.chart_title_size + 20 || 20 + defaultFontSize,
    });
    $container.prepend($titleEl);
  }
};
SingleScore.prototype.getMinMargin = function getMinMargin(val) {
  return val < this.minMargin ? this.minMargin : val;
};
SingleScore.prototype.checkHeight = function checkHeight(fontSize, height) {
  return fontSize + 2 * this.minMargin > height
    ? parseInt(this.relativeFontSize * height, 10)
    : fontSize;
};
SingleScore.prototype.buildRequestParams = function buildRequestParams(params) {
  return {
    sysparm_table: params.table,
    sysparm_aggregate: params.aggregate,
    sysparm_aggregation_source: params.aggregation_source,
    sysparm_sumfield: params.agg_field,
    sysparm_query: params.filter,
    sysparm_interactive_report: params.interactive_report,
    sysparm_report_drilldown: params.report_drilldown,
    sysparm_report_id: params.report_id,
    sysparm_score_color: params.score_color,
    sysparm_chart_title_color: params.chart_title_color,
    sysparm_homepage_sysid: params.homepage_sysid,
    sysparm_chart_background_color: params.chart_background_color,
    sysparm_list_ui_view: params.list_ui_view,
    sysparm_decimal_precision: params.decimal_precision,
    sysparm_report_source_id: params.report_source_id,
    sysparm_is_report_source_filter_already_combined:
      params.is_report_source_filter_already_combined,
    sysparm_show_zero: params.show_zero,
    sysparm_is_published: params.is_published,
    sysparm_set_redirect: params.set_redirect,
    sysparm_formatting_configuration: params.formatting_configuration,
  };
};
SingleScore.prototype.resizeHandlers = function resizeHandlers(data) {
  if (data.action === 'resize') this.updateSize();
};
SingleScore.prototype.eventHandlers = function eventHandlers() {
  var self = this;
  this.$container.on('click', 'a', function clickCb(ev) {
    ev.preventDefault();
    if (self.widgetNav) {
      var openNewTab = ev.ctrlKey || ev.metaKey || self.drill_new_win;
      window.open(self.widgetNav, openNewTab ? '_blank' : '_self');
    } else {
      var drillDownUrl = jQuery(this).attr('rel');
      drillDownUrl = decodeURIComponent(drillDownUrl);
      generateDataPointClickUrl(
        ev,
        '#' + self.containerId,
        self.reportDrilldown,
        self.table,
        drillDownUrl,
        self.listUIViewName,
        self.drillOpenNewWin
      );
    }
  });
  if (
    jQuery &&
    window.SNC &&
    window.SNC.canvas &&
    SNC.canvas.canvasUtils &&
    self.containerId.indexOf('preview') === -1
  ) {
    var rootReportId = self.$container
      .closest('.grid-stack-item')
      .find(self.rootReportElementClass)
      .first()
      .val();
    var uuid = self.$container.closest('.grid-stack-item').attr('data-uuid');
    if (uuid) {
      window.SNC.reportResizingFunctions =
        window.SNC.reportResizingFunctions || {};
      SNC.canvas.eventbus.subscribe(uuid, this.resizeHandlers.bind(this));
      SNC.reportResizingFunctions[uuid] = this.resizeHandlers;
    }
    window.SNC.reportResizingTimeouts = window.SNC.reportResizingTimeouts || {};
    window.addEventListener(
      'resize',
      function resizeCb() {
        if (SNC.reportResizingTimeouts[rootReportId])
          clearTimeout(SNC.reportResizingTimeouts[rootReportId]);
        SNC.reportResizingTimeouts[rootReportId] = setTimeout(
          function resizingTimeoutCb() {
            self.updateSize();
          },
          250
        );
      },
      false
    );
  }
};
