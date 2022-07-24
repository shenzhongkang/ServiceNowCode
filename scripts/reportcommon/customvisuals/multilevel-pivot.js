/*! RESOURCE: /scripts/reportcommon/customvisuals/multilevel-pivot.js */
var MultilevelPivot = function MultilevelPivot(
  reportUUID,
  runType,
  options,
  notSaveStatistics,
  currentHostName,
  makeUrlsAbsolute
) {
  'use strict';
  var self = this;
  if (!options) {
    options = window.g_report_params[reportUUID];
    options.is_report_source_filter_already_combined = true;
  }
  options.not_save_statistics = notSaveStatistics;
  createReportTemplate(reportUUID, options);
  this.containerId = 'chart-container-' + reportUUID;
  this.reportId = options.report_id;
  this.showZero = options.show_zero;
  this.pivotExpanded =
    options.pivot_expanded !== 'false' && options.pivot_expanded !== false;
  this.displayRowLines =
    options.display_row_lines !== 'false' &&
    options.display_row_lines !== false;
  this.displayColumnLines =
    options.display_column_lines !== 'false' &&
    options.display_column_lines !== false;
  this.fixedHeaders = window.chartHelpers.systemParams.fixedHeaders;
  this.table = options.table;
  this.$table = jQuery(
    '<table id="pivot_table" class="pivot-2-levels table" cellspacing="0" cellpadding="0" tabindex="0" role="grid" />'
  );
  this.listUIViewName = '';
  this.isBuilder =
    jQuery('#reportform_control').length ||
    (typeof gReport !== 'undefined' && gReport && gReport.isDesigner);
  this.isDesigner =
    typeof gReport !== 'undefined' && gReport && gReport.isDesigner;
  this.isOldBuilder = jQuery('#reportform_control').length;
  this.isCanvas =
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.canvasUtils &&
    SNC.canvas.isGridCanvasActive;
  this.options = options;
  this.title = options.title;
  this.currentHostName = currentHostName;
  this.makeUrlsAbsolute = makeUrlsAbsolute;
  var leftMostRowSpan = [];
  var leftMostRowValue = [];
  this.init = function init() {
    self.runPivot(options, runType);
    self.eventHandlers();
  };
  this.runPivot = function runPivot() {
    self.startTime = new Date().getTime();
    var processor =
      runType === 'run' ? 'PivotRunProcessor' : 'PivotRunPublishedProcessor';
    jQuery
      .ajax({
        method: 'POST',
        url: '/xmlhttp.do',
        dataType: 'xml',
        headers: { 'X-UserToken': window.g_ck },
        data: {
          sysparm_processor: processor,
          sysparm_scope: 'global',
          is_portal: options.is_portal,
          sysparm_timer: new Date().getTime(),
          sysparm_request_params: JSON.stringify(
            self.buildRequestParams(options)
          ),
        },
      })
      .done(function doneCb(xml) {
        self.processResponse(xml);
      })
      .fail(function failCb(jqXHR, textStatus, error) {
        console.log(textStatus, error);
      });
  };
  this.processResponse = function processResponse(response) {
    if (!response) showError(self.containerId, 'No response from the server');
    else {
      var resp = JSON.parse(jQuery(response).find('RESPONSE').text());
      if (resp.STATUS === 'SUCCESS')
        try {
          response = JSON.parse(resp.RESPONSE_DATA);
          self.drill_new_win = response.drill_open_new_win;
          if (response.widget_navigation && response.widget_navigation.length)
            this.widgetNav = response.widget_navigation[0];
          self.reportDrilldown = response.report_drilldown;
          self.renderTable(response);
          if (self.isBuilder && response.drill_message)
            showInfo(self.containerId, response.drill_message);
          if (response.message) showInfo(self.containerId, response.message);
          if (self.fixedHeaders) self.fixateHeader();
        } catch (err) {
          showError(self.containerId, chartHelpers.i18n.chartGenerationError);
          throw new Error(err);
        }
      else {
        jQuery('#' + self.containerId).empty();
        if (resp.STATUS === 'FAILURE')
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
      }
    }
    var now = new Date().getTime();
    var elapsedTime = (now - self.startTime) / 1000;
    console.log('Time taken to render report: ' + elapsedTime);
    hideReportIsLoading(findGridWindowFromElementID(self.containerId));
    var whtpReadyState = document.getElementById('whtp_ready_state');
    if (whtpReadyState) whtpReadyState.value = 'complete';
  };
  this.reduceAxisCategories = function reduceAxisCategories(
    categories,
    sortKey
  ) {
    var uniqueAxisCategories = {};
    for (var i = 0; i < categories.length; i++) {
      if (!uniqueAxisCategories.hasOwnProperty(categories[i][sortKey])) {
        var record = {};
        record.count = 1;
        record.value = categories[i].value;
        uniqueAxisCategories[categories[i][sortKey]] = record;
      } else uniqueAxisCategories[categories[i][sortKey]].count += 1;
    }
    return uniqueAxisCategories;
  };
  this.renderTable = function renderTable(response) {
    var aggregateFunction = response.aggregate.function;
    var titleProps;
    var showTitle = true;
    var config = self.options;
    var $container = jQuery('#' + self.containerId);
    var $table = self.$table;
    var $caption = jQuery('<caption class="sr-only"/>');
    var $row = jQuery('<tr role="row" />');
    var $yLabelsRow = jQuery(
      '<tr class="y-labels-row header-row" role="row"/>'
    );
    var yLastColSpan = 1;
    var xLastRowSpan = 1;
    var headerRows = [];
    var data = response.series.data;
    var xCategories = response.xAxisCategories;
    var yCategories = response.yAxisCategories;
    var xCategorySortKey = xCategories[0].fieldValues[0].hasOwnProperty(
      'sys_id'
    )
      ? 'sys_id'
      : 'value';
    var yCategorySortKey = yCategories[0].fieldValues[0].hasOwnProperty(
      'sys_id'
    )
      ? 'sys_id'
      : 'value';
    var subtotals = response.subtotals;
    self.listUIViewName = response.list_ui_view_name;
    self.drillOpenNewWin = response.drill_open_new_win;
    var xLevel = xCategories[0].fieldValues.length;
    var yLevel = yCategories[0].fieldValues.length;
    var yTopmostCategories = [];
    var xTopmostCategories = [];
    var nextBlocked = 0;
    $caption.text(config.chart_title || config.title);
    $table.append($caption);
    for (var i = 0; i < xLevel; i++)
      headerRows.push(jQuery('<tr class="header-row" role="row"/>'));
    for (i = 0; i < yCategories.length; i++)
      yTopmostCategories[i] = yCategories[i].fieldValues[0];
    for (i = 0; i < xCategories.length; i++)
      xTopmostCategories[i] = xCategories[i].fieldValues[0];
    var yTopmostUniqueCategories = this.reduceAxisCategories(
      yTopmostCategories,
      yCategorySortKey
    );
    var xTopmostUniqueCategories = this.reduceAxisCategories(
      xTopmostCategories,
      xCategorySortKey
    );
    if (yLevel === 1) yLastColSpan = 2;
    if (xLevel === 1) xLastRowSpan = 2;
    for (i = 0; i < yCategories.length; i++) {
      for (var j = 0; j <= xCategories.length; j++)
        if (j < xCategories.length) {
          var dataPoint = data[xCategories.length * i + j];
          var cellQueryParts = [];
          var dataPointValue = dataPoint[0];
          if (
            dataPointValue ||
            (dataPointValue === 0 &&
              (aggregateFunction === 'AVG' || aggregateFunction === 'SUM'))
          ) {
            var xCategoryQuery =
              response.otherQuery && !xCategories[j].categoryQuery
                ? response.otherQuery
                : xCategories[j].categoryQuery;
            cellQueryParts = [
              xCategoryQuery,
              yCategories[i].categoryQuery,
              response.filter,
            ];
          }
          if (dataPointValue === null && self.showZero && dataPoint[1] === '0')
            dataPointValue = 0;
          var colorStyle = chartHelpers.evaluateColorRules(
            dataPointValue,
            response.rules
          );
          var $td = jQuery('<td/>');
          if (colorStyle && colorStyle.color)
            $td.css('color', colorStyle.color);
          if (colorStyle && colorStyle.bgColor)
            $td.css('background-color', colorStyle.bgColor);
          $td
            .appendTo($row)
            .html(
              self.generateCell(
                dataPoint[1],
                cellQueryParts,
                dataPoint[2],
                aggregateFunction
              )
            );
        } else {
          var yAggregateQueryParts = [yCategories[i].categoryQuery];
          if (!response.sysparm_show_other && response.otherQuery)
            yAggregateQueryParts.push(response.otherQuery);
          yAggregateQueryParts.push(response.filter);
          jQuery('<td class="aggregate-right"/>')
            .appendTo($row)
            .html(
              self.generateCell(
                yCategories[i].aggregatedValue,
                yAggregateQueryParts,
                yCategories[i].tooltipText
              )
            );
        }
      for (var k = yLevel - 1; k >= 0; k--)
        if (k === 0)
          if (nextBlocked === 0) {
            if (subtotals) {
              $row.addClass('below-subtotals');
              leftMostRowSpan.push(
                yTopmostUniqueCategories[
                  yCategories[i].fieldValues[k][yCategorySortKey]
                ].count
              );
              leftMostRowValue.push(
                yTopmostUniqueCategories[
                  yCategories[i].fieldValues[k][yCategorySortKey]
                ].value
              );
            } else
              jQuery('<td/>', {
                class: 'y-axis-category-field-leftmost header-left',
                scope: 'row',
                role: 'rowheader',
                colspan: yLastColSpan,
                rowspan:
                  yTopmostUniqueCategories[
                    yCategories[i].fieldValues[k][yCategorySortKey]
                  ].count,
              })
                .prependTo($row)
                .text(
                  yTopmostUniqueCategories[
                    yCategories[i].fieldValues[k][yCategorySortKey]
                  ].value
                );
            nextBlocked =
              yTopmostUniqueCategories[
                yCategories[i].fieldValues[k][yCategorySortKey]
              ].count - 1;
          } else nextBlocked--;
        else if (k === yLevel - 1)
          jQuery('<td/>', {
            scope: 'row',
            colspan: 2,
            role: 'rowheader',
            class: 'y-axis-category-field header-left',
          })
            .prependTo($row)
            .text(yCategories[i].fieldValues[k].value);
        else
          jQuery('<td/>', {
            scope: 'row',
            class: 'y-axis-category-field header-left',
            role: 'rowheader',
          })
            .prependTo($row)
            .text(yCategories[i].fieldValues[k].value);
      if (!self.pivotExpanded && subtotals) $row.css('display', 'none');
      $table.append($row.addClass('content-row'));
      $row = jQuery('<tr role="row"/>');
    }
    for (i = 0; i <= xCategories.length; i++)
      if (i < xCategories.length) {
        xCategoryQuery =
          response.otherQuery && !xCategories[i].categoryQuery
            ? response.otherQuery
            : xCategories[i].categoryQuery;
        var $content = self.generateCell(
          xCategories[i].aggregatedValue,
          [xCategoryQuery, response.filter],
          xCategories[i].tooltipText
        );
        $row.addClass('totals');
        jQuery('<td class="aggregate-bottom"/>').appendTo($row).html($content);
        for (j = 0; j < xLevel; j++)
          if (typeof xCategories[i].fieldValues[j] !== 'undefined')
            if (j === 0) {
              if (nextBlocked === 0) {
                jQuery('<th/>', {
                  rowspan: xLastRowSpan,
                  scope: 'col',
                  role: 'columnheader',
                  colspan:
                    xTopmostUniqueCategories[
                      xCategories[i].fieldValues[j][xCategorySortKey]
                    ].count,
                })
                  .appendTo(headerRows[j])
                  .text(xCategories[i].fieldValues[j].value);
                nextBlocked =
                  xTopmostUniqueCategories[
                    xCategories[i].fieldValues[j][xCategorySortKey]
                  ].count - 1;
              } else nextBlocked--;
            } else if (j === xLevel - 2)
              jQuery('<th/>', {
                class: 'x-axis-category-field',
                scope: 'col',
                role: 'columnheader',
              })
                .appendTo(headerRows[j])
                .text(xCategories[i].fieldValues[j].value);
            else
              jQuery('<th/>', {
                rowspan: 2,
                class: 'x-axis-category-field',
                scope: 'col',
                role: 'columnheader',
              })
                .appendTo(headerRows[j])
                .text(xCategories[i].fieldValues[j].value);
          else
            headerRows[0]
              .find(
                'th:nth-child(' +
                  chartHelpers.objectSize(xTopmostUniqueCategories) +
                  ')'
              )
              .attr('rowspan', xLevel + 1);
      } else {
        var grantTotalQueryParts =
          !response.sysparm_show_other && response.otherQuery
            ? [response.otherQuery, response.filter]
            : [response.filter];
        $content = self.generateCell(
          response.aggregate.grandAggregate,
          grantTotalQueryParts,
          response.aggregate.tooltipText
        );
        jQuery('<td class="grand"/>').appendTo($row).html($content);
        $row.prepend(
          '<td colspan="' +
            (yLevel + 1) +
            '" class="header-left">' +
            response.aggregate.functionLabel +
            '</td>'
        );
        headerRows[0].append(
          '<th class="aggregate-right" scope="col" role="columnheader" rowspan="' +
            (xLevel + 1) +
            '"> ' +
            response.aggregate.functionLabel +
            ' </th>'
        );
      }
    for (i = 0; i < xLevel; i++) {
      for (k = yLevel - 1; k >= 0; k--)
        if (i === xLevel - 1) {
          jQuery('<th/>', { class: 'y-axis-category header-left' })
            .prependTo($yLabelsRow)
            .text(yCategories[0].fieldValues[k].field);
          headerRows[i + 1] = $yLabelsRow;
        }
      jQuery('<th/>', { class: 'x-axis-category' })
        .prependTo(headerRows[i])
        .text(xCategories[0].fieldValues[i].field);
      if (i === 0) {
        var aggregateFieldDisplayValue = '';
        var pointerButton = '';
        if (response.aggregate.aggregateFieldDisplayValue)
          aggregateFieldDisplayValue =
            response.aggregate.aggregateFieldDisplayValue;
        if (subtotals)
          pointerButton =
            '<a href="#" class="icon- collapse-all ' +
            (self.pivotExpanded ? 'expanded' : '') +
            '"/>';
        headerRows[0].prepend(
          '<th class="top-left-hole" colspan="' +
            yLevel +
            '" rowspan="' +
            xLevel +
            '">' +
            pointerButton +
            aggregateFieldDisplayValue +
            '</th>'
        );
      }
      if (i === xLevel - 1) $yLabelsRow.append('<th/>');
    }
    $table.append($row);
    for (j = xLevel; j >= 0; j--) $table.prepend(headerRows[j]);
    if (subtotals)
      self.generateSubtotals(
        $table,
        subtotals,
        yLevel,
        xCategories,
        aggregateFunction
      );
    $container
      .empty()
      .html('<div class="pivot-wrap"/>')
      .find('.pivot-wrap')
      .append($table);
    if (
      config.show_chart_title === 'never' ||
      (!config.title && !config.chart_title) ||
      (config.show_chart_title === 'report' && !self.isBuilder)
    )
      showTitle = false;
    if (showTitle) {
      if (config.chart_title) config.title = config.chart_title;
      titleProps = {
        title: config.title,
        chart_title_size: config.chart_title_size,
        chart_title_x_position: config.chart_title_x_position,
        chart_title_y_position: config.chart_title_y_position,
        title_horizontal_alignment: config.title_horizontal_alignment,
        title_vertical_alignment: config.title_vertical_alignment,
      };
      if (response.chart_title_color)
        titleProps.chart_title_color = response.chart_title_color;
      self.generateTitle(titleProps);
    }
    var isServicePortal =
      jQuery('html').attr('ng-app') === 'ng_spd' ||
      (window.NOW && window.NOW.hasOwnProperty('sp'));
    var tip = $container.find('td a');
    if (tip.tooltip && !isServicePortal)
      tip
        .attr('data-placement', 'bottom')
        .attr('data-container', 'body')
        .tooltip()
        .hideFix();
    if (!self.displayRowLines)
      jQuery('#pivot_table td').addClass('pivot-2-td-border-top-none');
    if (self.displayColumnLines)
      jQuery('#pivot_table td').addClass('pivot-2-td-border-left');
  };
  this.generateTitle = function generateTitle(titleProps) {
    var defaultFontSize = 14;
    var titleSelector = 'pivot_title';
    var $container = jQuery('#' + this.containerId).find('.pivot-wrap');
    var $titleEl = jQuery('<div class="' + titleSelector + '"/>').text(
      titleProps.title
    );
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
  this.generateCell = function generateCell(
    displayValue,
    cellQueryParts,
    message,
    aggregateFunction
  ) {
    var cellQuery = this.combineQueries(cellQueryParts);
    var encodedCellQuery = encodeURIComponent(cellQuery);
    var $content = jQuery('').html('&nbsp;');
    var hrefVal = '';
    if (displayValue)
      hrefVal = getListURL(
        self.table,
        cellQuery,
        self.listUiViewName,
        undefined,
        self.currentHostName,
        self.makeUrlsAbsolute
      );
    if (aggregateFunction) {
      if (
        displayValue &&
        (displayValue !== '0' ||
          (displayValue === '0' &&
            (self.showZero === 'true' ||
              self.showZero === true ||
              aggregateFunction === 'AVG' ||
              aggregateFunction === 'SUM')))
      )
        if (cellQuery)
          $content = jQuery('<a/>', {
            href: hrefVal,
            rel: encodedCellQuery,
            class: 'datapoint',
            title: message,
          }).text(displayValue);
        else
          $content = jQuery('<span title="' + message + '"/>').text(
            displayValue
          );
    } else if (displayValue)
      $content = jQuery('<a/>', {
        href: hrefVal,
        rel: encodedCellQuery,
        class: 'datapoint',
        title: message,
      }).text(displayValue);
    return $content;
  };
  this.generateSubtotals = function generateSubtotals(
    $table,
    subtotals,
    yLevel,
    xCategories,
    aggregateFunction
  ) {
    $table
      .find('.below-subtotals')
      .before(
        '<tr role="row" class="icon- subtotals ' +
          (self.pivotExpanded ? 'expanded' : '') +
          '"/>'
      );
    $table.find('.subtotals').each(function eachCb(key) {
      var $currRow = jQuery(this);
      var totalCols = yLevel + xCategories.length + 1;
      var subtotalsData = subtotals.series.data;
      var subtotalsAgg = subtotals.yAxisCategories;
      for (var i = 0; i < totalCols; i++)
        if (i === 0) {
          var rowSpan;
          if (self.pivotExpanded) {
            rowSpan = leftMostRowSpan[key] + 1;
            $currRow.addClass('expanded');
          } else rowSpan = 1;
          $currRow.append(
            '<td class="leftmost-cell" rowspan="' +
              rowSpan +
              '" scope="row" role="rowheader" data-mergerows="' +
              (leftMostRowSpan[key] + 1) +
              '"><a href="#" class="icon- subcollapse"/>' +
              leftMostRowValue[key] +
              '</td>'
          );
        } else if (i === 1)
          $currRow.append(
            '<td class="subtotals-empty">' +
              chartHelpers.i18n.total +
              '</td> <td class="subtotals-empty"/>'
          );
        else if (i > 1 && i < yLevel)
          $currRow.append('<td class="subtotals-empty"/>');
        else if (i === totalCols - 1)
          jQuery('<td class="aggregate-right"/>')
            .appendTo($currRow)
            .html(
              self.generateCell(
                subtotalsAgg[key].aggregatedValue,
                [subtotalsAgg[key].categoryQuery, subtotals.filter],
                subtotalsAgg[key].tooltipText
              )
            );
        else {
          var currSubtotal = xCategories.length * key + (i - yLevel);
          var cellQueryParts = [];
          if (
            subtotalsData[currSubtotal][0] ||
            (subtotalsData[currSubtotal][0] === 0 &&
              (aggregateFunction === 'AVG' || aggregateFunction === 'SUM'))
          ) {
            var xCategoryQuery =
              subtotals.otherQuery && !xCategories[i - yLevel].categoryQuery
                ? subtotals.otherQuery
                : xCategories[i - yLevel].categoryQuery;
            cellQueryParts = [
              xCategoryQuery,
              subtotalsAgg[key].categoryQuery,
              subtotals.filter,
            ];
          }
          jQuery('<td/>')
            .appendTo($currRow)
            .html(
              self.generateCell(
                subtotalsData[currSubtotal][1],
                cellQueryParts,
                subtotalsData[currSubtotal][2],
                aggregateFunction
              )
            );
        }
    });
  };
  this.fixateHeader = function fixateHeader() {
    var $scrollContainer;
    var $table = self.$table;
    var tableOffset = $table.position().top;
    var offsetDiff = 0;
    var offsetFetched = false;
    var $fixedHeader = jQuery(
      '<table class="fixed-header pivot-2-levels table"/>'
    )
      .insertBefore($table)
      .html(self.getSizedHeaders(true));
    var $pivotTitle = jQuery('.pivot_title');
    if (self.isDesigner) {
      $scrollContainer = jQuery('#main-content');
      tableOffset = $table.offset().top - $scrollContainer.offset().top;
      offsetDiff = tableOffset - $table.position().top;
      if (
        window.NOW &&
        window.NOW.isPolarisEnabled === 'true' &&
        $pivotTitle.size() > 0
      ) {
        offsetDiff += $pivotTitle.outerHeight(true);
      }
    } else if (self.isOldBuilder) $scrollContainer = jQuery(document);
    else if (self.isCanvas)
      $scrollContainer = jQuery('#' + this.containerId).closest(
        '.grid-widget-content'
      );
    else
      $scrollContainer = jQuery('#' + this.containerId).closest('.widget_body');
    $scrollContainer.scroll(function scrollCb() {
      if (!offsetFetched && self.isOldBuilder) {
        tableOffset = $table.offset().top;
        offsetDiff = tableOffset - $table.position().top;
        offsetFetched = true;
      }
      var offset = jQuery(this).scrollTop() - offsetDiff;
      if (self.isDesigner)
        offset -= jQuery('#condition-builder-wrap form').height();
      if (offset !== 0 && offset >= tableOffset - offsetDiff)
        $fixedHeader.css({ top: offset, display: 'table' });
      else $fixedHeader.hide();
    });
  };
  this.getSizedHeaders = function getSizedHeaders(createHeader) {
    var $headerRows = self.$table.find('.header-row');
    var $clonedHeaderRows = createHeader
      ? $headerRows.clone()
      : jQuery('#' + self.containerId).find('.fixed-header .header-row');
    $headerRows.each(function eachRowCb(i) {
      var $children = $headerRows.eq(i).children();
      var $clonedChildren = $clonedHeaderRows.eq(i).children();
      $children.each(function eachChildCb(j) {
        $clonedChildren.eq(j).css('min-width', $children.eq(j).outerWidth());
      });
    });
    return $clonedHeaderRows;
  };
  this.buildRequestParams = function buildRequestParams(params) {
    return {
      sysparm_table: params.table,
      sysparm_x_axis_category_fields:
        params.x_axis_category_fields != null
          ? params.x_axis_category_fields.trim().split(/[\s,]+/)
          : '',
      sysparm_y_axis_category_fields:
        params.y_axis_category_fields != null
          ? params.y_axis_category_fields.trim().split(/[\s,]+/)
          : '',
      sysparm_aggregate: params.aggregate,
      sysparm_aggregation_source: params.aggregation_source,
      sysparm_show_other: params.show_other,
      sysparm_apply_alias: params.apply_alias,
      sysparm_others: params.other_threshold,
      sysparm_chart_title_color: params.chart_title_color,
      sysparm_sumfield: params.agg_field,
      sysparm_query: params.filter,
      sysparm_report_id: params.report_id,
      sysparm_list_ui_view: params.list_ui_view,
      sysparm_interactive_report: params.interactive_report,
      sysparm_report_drilldown: params.report_drilldown,
      sysparm_homepage_sysid: params.homepage_sysid,
      sysparm_decimal_precision: params.decimal_precision,
      sysparm_report_source_id: params.report_source_id,
      sysparm_is_report_source_filter_already_combined:
        params.is_report_source_filter_already_combined,
      sysparm_is_published: params.is_published,
      sysparm_not_save_statistics: params.not_save_statistics,
      sysparm_set_redirect: params.set_redirect,
      sysparm_formatting_configuration: params.formatting_configuration,
    };
  };
  this.eventHandlers = function eventHandlers() {
    var $container = jQuery('#' + self.containerId);
    $container.on(
      'click',
      '.subtotals .subcollapse',
      function subcollapseClickCb(ev) {
        ev.preventDefault();
        var $parentRow = jQuery(this).closest('.subtotals');
        var $parentCell = jQuery(this).closest('td');
        var $subRows = $parentRow.nextUntil('.subtotals,.totals');
        if ($parentCell.attr('rowspan') > 1) {
          $parentCell.attr('rowspan', 1);
          $parentRow.removeClass('expanded');
          $subRows.hide();
        } else {
          $parentCell.attr('rowspan', $parentCell.data('mergerows'));
          $parentRow.addClass('expanded');
          $subRows.show();
        }
        if (self.fixedHeaders) self.getSizedHeaders(false);
      }
    );
    $container.on('click', '.collapse-all', function collapseCb(ev) {
      ev.preventDefault();
      var $contentRows = $container.find('.content-row');
      var $el = jQuery(this);
      if ($el.is('.expanded')) {
        $container.find('.subtotals.expanded').each(function eachCb() {
          jQuery(this).removeClass('expanded');
          jQuery(this).find('.leftmost-cell').attr('rowspan', 1);
        });
        $el
          .closest('.pivot-wrap')
          .find('.collapse-all')
          .removeClass('expanded');
        $contentRows.hide();
      } else {
        $container.find('.subtotals:not(.expanded)').each(function eachCb() {
          jQuery(this).addClass('expanded');
          var $cell = jQuery(this).find('.leftmost-cell');
          $cell.attr('rowspan', $cell.data('mergerows'));
        });
        $el.closest('.pivot-wrap').find('.collapse-all').addClass('expanded');
        $contentRows.show();
      }
      if (self.fixedHeaders) self.getSizedHeaders(false);
    });
    $container.on('click', '.datapoint', function dataPointClickCb(ev) {
      ev.preventDefault();
      var openNewTab = ev.ctrlKey || ev.metaKey || self.drill_new_win;
      var orderbyQuery = self.extractOrderByConditions(
        self.options && self.options.filter
      );
      var queryStr = jQuery(this).attr('rel');
      var decodedQueryStr = decodeURIComponent(queryStr);
      var finalQryString =
        queryStr +
        (decodedQueryStr &&
        decodedQueryStr.slice(decodedQueryStr.length - 1) === '^'
          ? ''
          : '^') +
        orderbyQuery;
      if (self.widgetNav)
        window.open(self.widgetNav.value, openNewTab ? '_blank' : '_self');
      else
        generateDataPointClickUrl(
          ev,
          '#' + self.containerId,
          self.reportDrilldown,
          self.table,
          decodeURIComponent(finalQryString),
          self.listUIViewName,
          self.drillOpenNewWin
        );
    });
  };
  this.combineQueries = function combineQueries(queryParts) {
    if (typeof queryParts === 'string') return queryParts;
    queryParts = queryParts.filter(function filterCb(el) {
      return el;
    });
    if (!queryParts.length) return '';
    return queryParts.reduce(function reduceCb(acc, curr) {
      var accParts = acc.split('^NQ');
      var currParts = curr.split('^NQ');
      var finalParts = [];
      for (var i = 0; i < accParts.length; i++)
        for (var j = 0; j < currParts.length; j++)
          finalParts[i * currParts.length + j] =
            accParts[i] + '^' + currParts[j];
      return finalParts.join('^NQ');
    });
  };
  this.extractOrderByConditions = function extractOrderByConditions(filter) {
    if (!filter) return '';
    var validExpressions = [/^ORDERBY/, /^ORDERBYDESC/];
    var terms = filter.split('^');
    var validTerms = [];
    for (var i = 0; i < terms.length; i++) {
      if (this.matches(terms[i], validExpressions)) validTerms.push(terms[i]);
    }
    var validFilter = validTerms.join('^');
    if (validFilter && validFilter.endsWith('^EQ'))
      validFilter = validFilter.substring(0, validFilter.length - 3);
    return validFilter;
  };
  this.matches = function matches(value, validExpressions) {
    for (var i = 0; i < validExpressions.length; i++) {
      if (validExpressions[i].test(value)) return true;
    }
    return false;
  };
  this.init();
};
