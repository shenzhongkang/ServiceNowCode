/*! RESOURCE: /scripts/interactive_reports.js */
if (window.uxf && window.frameElement) {
  try {
    console.log('-- Try to inject the API', window.location.toString());
    var varName = window.frameElement.getAttribute('data-inject-api-var-name');
    if (varName) {
      const apiToInject = window.parent[varName];
      Object.assign(window, apiToInject);
      console.log(':-)  Injected API OK!', apiToInject);
      if (SNC.legacyWidgetWrapper) {
        SNC.legacyWidgetWrapper.getIframeRootContainer = function () {
          var container = jQuery('body').get(0);
          console.log('getIframeRootContainer', container);
          return container;
        };
      }
    } else {
      console.log('ERROR: Failed to find legacy par widget api');
    }
  } catch (e) {
    console.log('ERROR: Error while injecting API', e);
  }
}
function getListURL(
  table,
  urlInfo,
  viewName,
  isServicePortal,
  currentHostName,
  makeUrlsAbsolute
) {
  var url = {};
  url.endpoint = '/' + table + '_list.do';
  url.params = {};
  if (urlInfo) url.params.sysparm_query = urlInfo;
  if (viewName) {
    url.params.sysparm_view = viewName;
    url.params.sysparm_view_forced = true;
  }
  var resultingUrl = generateWholeUrl(url, isServicePortal);
  if (makeUrlsAbsolute) resultingUrl = currentHostName + resultingUrl;
  return resultingUrl;
}
function generateWholeUrl(url, isServicePortal) {
  var endPoint = isServicePortal
    ? '/nav_to.do?uri=' + encodeURIComponent(url.endpoint)
    : url.endpoint;
  if (!jQuery.isEmptyObject(url.params))
    return (
      endPoint +
      '?' +
      Object.keys(url.params)
        .map(function mapFunction(key) {
          return (
            key +
            '=' +
            encodeURIComponent(url.params[key])
              .replace(/%40/gi, '@')
              .replace(/%3A/gi, ':')
          );
        })
        .join('&')
    );
  return endPoint;
}
function drillReport(targetSpan, reportDrillId, newQuery, extraParams) {
  var interactiveReport = {};
  var url = {};
  url.params = {};
  interactiveReport.additional_query = newQuery;
  url.endpoint = '/report_viewer.do';
  var $publicPage = jQuery('#public-page');
  if ($publicPage.length && $publicPage.val() === 'true')
    url.endpoint = '/report_viewer_published.do';
  url.params.jvar_report_id = reportDrillId;
  url.params.sysparm_interactive_report = JSON.stringify(interactiveReport);
  if (extraParams) url.endpoint = url.endpoint + '?' + extraParams;
  reportReplace(targetSpan, url, true);
}
function drillList(targetSpan, table, newQuery, listView) {
  var url = {};
  url.endpoint = '/report_viewer.do';
  url.params = {
    sysparm_type: 'list',
    sysparm_query: newQuery,
    sysparm_view: listView,
    sysparm_table: table,
  };
  reportReplace(targetSpan, url);
}
function embedReportById(targetSpan, reportId) {
  embedReportByParams(targetSpan, { jvar_report_id: reportId });
}
function isServicePortal() {
  var htmlNGAppAttr = jQuery('html').attr('ng-app');
  return (
    htmlNGAppAttr === 'sn.$sp' ||
    htmlNGAppAttr === 'ng_spd' ||
    (window.NOW && window.NOW.hasOwnProperty('sp'))
  );
}
function embedReportByParams(targetSpan, params) {
  var url = {};
  url.params = {};
  url.endpoint = '/report_viewer.do';
  if (!isServicePortal()) url.params.sysparm_inline_embed = 'true';
  if (isServicePortal()) url.params.sysparm_is_service_portal = 'true';
  if (params)
    for (var key in params)
      if (typeof params[key] !== 'undefined')
        url.params[key] = params[key].toString() || '';
  reportReplace(targetSpan, url);
}
function reportReplace(targetSpan, url, stick) {
  if (!targetSpan)
    throw new Error(
      'Report replace called, but the element to replace was not found!'
    );
  CustomEvent.fireTop('request_start', document);
  url.params = url.params || {};
  url.params.sysparm_nostack = 'true';
  url.params['ni.nolog.x_referer'] = 'ignore';
  url.params.x_referer = buildReferringURL();
  var isPortal = targetSpan.find('.jvar_is_portal').first();
  var rootReportId;
  if (isPortal.length && isPortal.val() === 'true')
    url.params.jvar_is_portal = 'true';
  if (isServicePortal()) url.params.jvar_is_portal = 'true';
  var isLegacyWidgetWrapper = window.SNC && !!SNC.legacyWidgetWrapper;
  if (window.isEmbeddedReport === 'true' && !isLegacyWidgetWrapper)
    window.location.href = generateWholeUrl(url);
  else {
    if (
      window.SNC &&
      window.SNC.canvas &&
      SNC.canvas.canvasUtils &&
      SNC.reportResizingFunctions
    ) {
      rootReportId = targetSpan.find('.sysparm_root_report_id').first().val();
      var uuid = SNC.canvas.canvasUtils.getUuidFromSysId(rootReportId);
      if (uuid && SNC.reportResizingFunctions[uuid])
        SNC.canvas.eventbus.unsubscribe(
          uuid,
          SNC.reportResizingFunctions[uuid]
        );
    }
    url.params.sysparm_direct = 'true';
    if (window.isInlineEmbed) {
      rootReportId = targetSpan.find('.sysparm_root_report_id').first().val();
      url.params.sysparm_inline_embed = window.isInlineEmbed[rootReportId];
    }
    showReportIsLoading(
      findGridWindowFromElement(targetSpan),
      targetSpan,
      stick
    );
    url.params.sysparm_processor = '';
    url.params.sysparm_scope = 'global';
    url.params.jvar_report_id = url.params.jvar_report_id || '';
    url.params.sysparm_interactive_report =
      url.params.sysparm_interactive_report || '';
    jQuery
      .ajax({
        method: 'POST',
        url: url.endpoint,
        dataType: 'text',
        data: url.params,
      })
      .done(function doneAjax(xml) {
        reportReplaceCallback(xml, targetSpan);
      })
      .fail(function failedAjax(jqXHR, textStatus, error) {
        console.log(textStatus, error);
      });
  }
}
function evaluateScriptTags(htmlNode) {
  var arr = htmlNode.getElementsByTagName('script');
  try {
    for (var n = 0; n < arr.length; n++) {
      if (arr[n].type !== 'application/xml' && arr[n].innerHTML)
        eval(arr[n].innerHTML);
    }
  } catch (error) {
    throw new Error(error);
  }
}
function reportReplaceCallback(html, targetSpan) {
  var scrollTop;
  if (window.isMSIE) scrollTop = document.body.scrollTop;
  var isList = html.indexOf('chart_type = "list"') > -1;
  if (isRenderedInCanvas()) {
    html += ' <div class="end-of-widget"></div>';
    updateWidgetCacheInCanvas(html, targetSpan);
  }
  if (isList && isServicePortal())
    html =
      '<div style="margin:20px 10px;">List chart is not supported in Service Portal widgets. Please use Simple List widget instead.</div>';
  if (targetSpan[0]) targetSpan[0].innerHTML = html;
  var htmlNode = document.createElement('div');
  htmlNode.innerHTML = html;
  if (isList && !isServicePortal()) html.evalScripts();
  else evaluateScriptTags(htmlNode);
  CustomEvent.fireTop('request_complete', document);
  CustomEvent.fire('partial.page.reload', targetSpan);
  if (window.isMSIE) document.body.scrollTop = scrollTop;
}
function generateDataPointClickUrl(
  event,
  element,
  reportDrilldown,
  table,
  clickUrlInfo,
  listUiViewName,
  drillOpenNewWin,
  isOther,
  mapKey,
  actualMap,
  showDataLabel,
  showGeographicalLabel
) {
  var clickUrl;
  if (typeof jQuery !== 'undefined') {
    var content = jQuery(element).closest('.report_content');
    if (content.length && reportDrilldown) {
      var mapParams = '';
      if (mapKey) mapParams = 'sysparm_report_map_key=' + mapKey;
      if (actualMap) mapParams += '&sysparm_report_map_parent=' + actualMap;
      if (showDataLabel)
        mapParams += '&sysparm_show_chart_data_label=' + showDataLabel;
      if (showGeographicalLabel)
        mapParams +=
          '&sysparm_show_geographical_label=' + showGeographicalLabel;
      drillReport(content.parent(), reportDrilldown, clickUrlInfo, mapParams);
      return;
    }
    clickUrl = getListURL(
      table,
      clickUrlInfo,
      listUiViewName,
      isServicePortal()
    );
  }
  clickUrl = getListURL(table, clickUrlInfo, listUiViewName, isServicePortal());
  openUrl(event, clickUrl, drillOpenNewWin, isOther);
}
function handleUrlNavigation(event, processedUrl, drillOpenNewWin, isOther) {
  if (('metaKey' in event && event.metaKey) || event.ctrlKey)
    window.open(processedUrl);
  else if (isServicePortal()) top.location.href = processedUrl;
  else if (drillOpenNewWin && !isOther) window.open(processedUrl);
  else if (processedUrl) window.location.href = processedUrl;
}
function openUrl(event, clickUrl, drillOpenNewWin, isOther) {
  if (
    clickUrl.length > 2000 &&
    jQuery !== undefined &&
    typeof jQuery.ajax === 'function'
  ) {
    jQuery
      .ajax({
        type: 'POST',
        url: '/api/now/tinyurl',
        data: JSON.stringify({ url: clickUrl }),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
      })
      .done(function (response) {
        handleUrlNavigation(event, response.result, drillOpenNewWin, isOther);
      });
  } else handleUrlNavigation(event, clickUrl, drillOpenNewWin, isOther);
}
function applyExecutiveReport(reportId, groupEl, stackEl, filter) {
  var $groupEl = jQuery(groupEl);
  var $stackEl = jQuery(stackEl);
  var target = $groupEl.closest('.report_content');
  if (target.length) target = target.parent();
  var interactiveReport = {};
  interactiveReport.groupby = $groupEl.val();
  if (filter) interactiveReport.additional_query = filter;
  if ($stackEl) interactiveReport.stackby = $stackEl.val();
  var gaugeId = $groupEl.closest('.sysparm_gauge_id');
  var gridWindow;
  if (typeof glideGrid !== 'undefined' && target && target.length)
    gridWindow = glideGrid.getWindow(
      target.closest('[dragpart]').first().attr('dragpart')
    );
  else if (gaugeId) gridWindow = _getGridWindow(gaugeId.value, reportId);
  if (gridWindow && gridWindow.getDashboardMessageHandler() !== undefined)
    interactiveReport.additional_filters = gridWindow
      .getDashboardMessageHandler()
      .getCurrentFilters();
  interactiveReport = JSON.stringify(interactiveReport);
  var interactiveReportEl = jQuery('#sysparm_interactive_report')[0];
  if (
    ((typeof runReport === 'function' && interactiveReportEl) ||
      (typeof gReport !== 'undefined' && gReport.isDesigner)) &&
    !filter
  ) {
    if (typeof runReport === 'function') {
      interactiveReportEl.value = interactiveReport;
      runReport(false);
    } else
      NOW.CustomEvent.fire(
        'reportDesigner:runInteractiveReport',
        interactiveReport
      );
  } else {
    var $publicPage = jQuery('#public-page');
    var url = {
      endpoint:
        $publicPage.length && $publicPage.val() === 'true'
          ? '/report_viewer_published.do'
          : '/report_viewer.do',
      params: {
        jvar_report_id: reportId,
        sysparm_interactive_report: interactiveReport,
      },
    };
    reportReplace(target, url);
  }
}
function initializeInteractionOnGauge(
  reportId,
  rootReportId,
  gaugeId,
  homepageFilters,
  chartType,
  aggregateType
) {
  clearHighchartsTooltips(reportId);
  if (!gaugeId) return;
  var gridWindow = _getGridWindow(gaugeId, rootReportId);
  if (typeof gridWindow === 'undefined' || !gridWindow) return;
  var realTime = chartType === 'single_score' && aggregateType === 'COUNT';
  if (realTime) {
    gridWindow.setPreference('can_real_time', 'true');
    if (
      window.SNC &&
      window.SNC.canvas &&
      SNC.canvas.canvasUtils &&
      SNC.canvas.appProperties.sysparm_media !== 'print'
    ) {
      var uuid = SNC.canvas.canvasUtils.getUuidFromSysId(reportId);
      SNC.canvas.canvasUtils.displayRealTimeIndicator(
        uuid,
        gridWindow.getPreference('real_time') === 'true'
      );
    }
  } else gridWindow.setPreference('can_real_time', 'false');
  gridWindow.setPreference('can_subscribe', 'true');
  var supportedPublisherChartTypes = [
    'pie',
    'donut',
    'semi_donut',
    'funnel',
    'pyramid',
    'map',
  ];
  if (supportedPublisherChartTypes.indexOf(chartType) > -1)
    gridWindow.setPreference('can_publish', 'true');
  else gridWindow.removePreference('can_publish');
  if (
    window.SNC &&
    window.SNC.canvas &&
    SNC.canvas.interactiveFilters &&
    SNC.canvas.interactiveFilters.isReportingWidgetActingAsInteractiveFilter(
      gridWindow.preferences
    ) &&
    gridWindow.preferences.subscriber_widget === 'true'
  ) {
    gridWindow._dashboardMessageHandler =
      gridWindow._dashboardMessageHandler ||
      new DashboardMessageHandler(
        reportId,
        function dashboardMessageHandlerCallback() {
          updateReportInGauge(gaugeId, false, reportId);
        }
      );
  }
  if (gridWindow.getDashboardMessageHandler() !== undefined) {
    gridWindow.getDashboardMessageHandler().setCurrentFilters(homepageFilters);
    gridWindow.overwriteRefresh(function overwriteRefreshCallback() {
      updateReportInGauge(gridWindow, true, reportId);
    });
    var updateReportFn = updateReportInGauge.bind(
      null,
      gridWindow,
      false,
      reportId
    );
    var updateReportWithDelay = debounceHandler(updateReportFn, 600, false);
    var updateReportNow = debounceHandler(updateReportFn, 0, true);
    gridWindow
      .getDashboardMessageHandler()
      .setCallback(function getDashboardMessageHandlerCallback() {
        var target = getTargetFromGridWindow(gridWindow);
        if (isRenderedInCanvas()) showCanvasStyleLoading(target);
        applyInteractiveFiltersToReport(updateReportWithDelay, updateReportNow);
      });
  } else
    gridWindow.overwriteRefresh(function overwriteRefreshSimpleCallback() {
      simpleReportRefresh(gaugeId, rootReportId);
    });
}
function _getGridWindow(gaugeId, reportId) {
  var gridWindow;
  if (typeof glideGrid !== 'undefined') {
    gridWindow = glideGrid.getWindowByGaugeId(gaugeId);
    if (typeof gridWindow === 'undefined')
      gridWindow = glideGrid.getWindowByGaugeId(reportId);
  } else if (window.SNC && window.SNC.canvas && window.SNC.canvas.canvasUtils) {
    gridWindow = SNC.canvas.canvasUtils.getGlideWindow(gaugeId);
    if (typeof gridWindow === 'undefined')
      gridWindow = SNC.canvas.canvasUtils.getGlideWindow(reportId);
  }
  return gridWindow;
}
function updateReportInGauge(gridWindow, refresh, reportId) {
  var interactiveReport = {};
  if (gridWindow)
    interactiveReport.additional_filters =
      getAllFiltersFromInteractiveUtil(gridWindow);
  if (refresh && gridWindow && gridWindow.consumed)
    interactiveReport.additional_filters = gridWindow.consumed;
  updateAdditionalReportConfig(
    gridWindow,
    reportId,
    interactiveReport,
    refresh
  );
  if (gridWindow) {
    gridWindow.consumed = gridWindow.consumed || {};
    gridWindow.consumed = interactiveReport.additional_filters;
  }
  var target;
  target = getTargetFromGridWindow(gridWindow);
  if (target && target.length) {
    if (refresh) {
      reportId = target.find('.sysparm_root_report_id').first().val();
    } else {
      var filter = target.find('.sysparm_interactive_filter').first().val();
      if (typeof filter !== 'undefined' && filter)
        interactiveReport.additional_query = filter;
      var groupEl = gel('additional_groupby_' + reportId);
      var stackEl = gel('additional_stackby_' + reportId);
      if (groupEl) interactiveReport.groupby = groupEl.value;
      if (stackEl) interactiveReport.stackby = stackEl.value;
    }
  }
  var isRealTime =
    gridWindow &&
    gridWindow.getPreference('real_time') &&
    gridWindow.getPreference('real_time') === 'true';
  var canRealTime =
    gridWindow &&
    gridWindow.getPreference('can_real_time') &&
    gridWindow.getPreference('can_real_time') === 'true';
  var url = {
    endpoint: '/report_viewer.do',
    params: {
      jvar_report_id: reportId,
      jvar_real_time: isRealTime && canRealTime,
      sysparm_interactive_report: JSON.stringify(interactiveReport),
    },
  };
  reportReplace(target, url);
  if (!isRenderedInCanvas()) showFilterIndicator(target, gridWindow);
}
function simpleReportRefresh(gaugeId, reportId) {
  var gridWindow = _getGridWindow(gaugeId, reportId);
  if (typeof gridWindow !== 'undefined' && gridWindow) {
    if (typeof jQuery !== 'undefined') showReportIsLoading(gridWindow);
    gridWindow.render();
  }
}
function isRenderedInCanvas() {
  return (
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.canvasUtils &&
    SNC.canvas.isGridCanvasActive
  );
}
function findGridWindowFromElementID(id) {
  if (typeof jQuery === 'undefined') return null;
  if (typeof glideGrid !== 'undefined')
    return glideGrid.getWindow(
      jQuery(document)
        .find('#' + id)
        .closest('[dragpart]')
        .first()
        .attr('dragpart')
    );
  return null;
}
function findGridWindowFromElement(target) {
  if (typeof jQuery === 'undefined') return null;
  if (typeof glideGrid !== 'undefined')
    return glideGrid.getWindow(
      target.closest('[dragpart]').first().attr('dragpart')
    );
  return null;
}
function showReportIsLoading(gridWindow, targetSpan, stick) {
  var reportContent;
  var loadingMsg = window.GwtMessage
    ? new GwtMessage().getMessage('Loading report...')
    : 'Loading report...';
  if (isServicePortal() || isRenderedInCanvas()) {
    showCanvasStyleLoading(targetSpan);
    return;
  }
  if (!gridWindow) {
    if (targetSpan && targetSpan.length > 0) reportContent = targetSpan[0];
    if (!reportContent)
      reportContent = document.querySelector(
        '.report_content .chart-container'
      );
    if (!reportContent)
      reportContent = document.querySelector('.report_content');
    if (reportContent) reportContent.textContent = loadingMsg;
    return;
  }
  gridWindow.showLoading(loadingMsg, stick);
}
function hideReportIsLoading(gridWindow) {
  if (typeof gridWindow === 'undefined' || !gridWindow) return;
  gridWindow.hideLoading();
}
function showFilterIndicator(target, gridWindow) {
  var isFilterSelected =
    gridWindow.getDashboardMessageHandler().getCurrentFilters().length > 0;
  var isSubscribedAndOptedForFilterIndication =
    gridWindow.getPreference('can_subscribe') &&
    typeof gridWindow.getPreference('filter_indicator') === 'undefined'
      ? false
      : gridWindow.getPreference('filter_indicator');
  var condition =
    isFilterSelected && isSubscribedAndOptedForFilterIndication === 'true';
  var filterIndicatorPlaceholder = jQuery('#filter-indicator-' + gridWindow.id);
  if (condition) filterIndicatorPlaceholder.addClass('active');
  else filterIndicatorPlaceholder.removeClass('active');
}
function buildReferringURL() {
  var path = location.pathname;
  var args = location.search;
  if (path.substring(path.length - 1) === '/') {
    if (args) return args;
    return '';
  }
  return path.substring(path.lastIndexOf('/') + 1) + args;
}
function updateAdditionalReportConfig(
  gridWindow,
  reportId,
  interactiveReport,
  refresh
) {
  var isBothPublisherNSubscriber =
    gridWindow &&
    gridWindow.preferences.can_publish &&
    gridWindow.preferences.can_subscribe;
  if (isBothPublisherNSubscriber) {
    var allFilters = isRenderedInCanvas()
      ? SNC.canvas.interactiveFilters.getDefaultValues()
      : getAllFiltersForHomePage(gridWindow);
    if (gridWindow.filtersFromLegend)
      interactiveReport.filtersFromLegend = gridWindow.filtersFromLegend;
    var otherFilterCount = 0;
    for (var key in allFilters) {
      if (allFilters.hasOwnProperty(key)) {
        var filter = allFilters[key];
        Array.isArray(filter) &&
          filter.forEach(function (item) {
            if (item.sliced) otherFilterCount++;
          });
        if (key == reportId) {
          Array.isArray(filter) &&
            filter.forEach(function (item) {
              if (item.sliced) {
                interactiveReport.selectedPoint = item.filter;
                otherFilterCount--;
              }
            });
        }
      }
    }
    if (
      (!refresh && isFilterValidForRemoval(gridWindow)) ||
      (refresh && otherFilterCount === 0)
    )
      removeSelfPublishedFilter(interactiveReport, reportId);
  }
}
function getAllFiltersForHomePage(gridWindow) {
  var draggables = glideGrid && glideGrid._getDraggables();
  var allFilters = {};
  for (var i = 0; i < draggables.length; i++) {
    var current = draggables[i];
    if (
      current &&
      current.gWindow &&
      current.gWindow.getDashboardMessageHandler() &&
      !jQuery.isEmptyObject(
        current.gWindow.getDashboardMessageHandler()._filters
      )
    ) {
      var keys = Object.keys(
        current.gWindow.getDashboardMessageHandler()._filters
      );
      keys.forEach(function (item) {
        if (
          !allFilters.hasOwnProperty(item) ||
          (allFilters.hasOwnProperty(item) && gridWindow.id === current.id)
        )
          allFilters[item] =
            current.gWindow.getDashboardMessageHandler()._filters[item];
      });
    }
  }
  return allFilters;
}
function removeSelfPublishedFilter(interactiveReport, reportId) {
  var hasAdditionalFilter =
    interactiveReport.additional_filters &&
    interactiveReport.additional_filters.length &&
    interactiveReport.selectedPoint;
  if (hasAdditionalFilter || interactiveReport.filtersFromLegend) {
    var newFilter = [];
    interactiveReport.additional_filters.forEach(function (filter) {
      var isCascadingFilter = !Array.isArray(filter);
      if (!isCascadingFilter) {
        filter.forEach(function (childFilter) {
          if (
            childFilter.id &&
            childFilter.id.substring(0, reportId.length) != reportId
          ) {
            newFilter.push(filter);
          } else if (!childFilter.id) {
            newFilter.push(filter);
          }
        });
      } else {
        newFilter.push(filter);
      }
    });
    interactiveReport.additional_filters = newFilter;
  }
}
function showCanvasStyleLoading(target) {
  jQuery(target)
    .find('.report_content')
    .replaceWith(
      '<div class="spinner-container"><div class="icon icon-loading"></div></div>'
    );
}
function debounceHandler(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
function getTargetFromGridWindow(gridWindow) {
  var target;
  if (typeof jQuery !== 'undefined' && gridWindow) {
    if (isRenderedInCanvas())
      target = jQuery(
        SNC.canvas.canvasUtils.getWidgetContainer(gridWindow.getID())
      );
    else target = jQuery(gridWindow.body);
  }
  return target;
}
function applyInteractiveFiltersToReport(
  updateReportWithDelay,
  updateReportNow
) {
  if (
    !(
      window.SNC &&
      SNC.canvas &&
      SNC.canvas.chartsActingAsFilters &&
      SNC.canvas.chartsActingAsFilters.lastPublishTime
    )
  ) {
    updateReportNow();
    return;
  }
  var isFirstFilterPublished =
    SNC.canvas.chartsActingAsFilters.previousId == null;
  if (isFirstFilterPublished) {
    updateReportWithDelay();
    return;
  }
  var currentTime = Date.now();
  var isFilterPublishedQuickly =
    currentTime - SNC.canvas.chartsActingAsFilters.lastPublishTime < 600;
  var isNewFilterPublishedAfterDelay =
    currentTime - SNC.canvas.chartsActingAsFilters.lastPublishTime > 1000;
  var isFilterFromSameReport =
    SNC.canvas.chartsActingAsFilters.currentId ===
    SNC.canvas.chartsActingAsFilters.previousId;
  var isFilterFromOneReport =
    (isFilterPublishedQuickly || isNewFilterPublishedAfterDelay) &&
    isFilterFromSameReport;
  if (isFilterFromOneReport) updateReportWithDelay();
  else updateReportNow();
}
function updateWidgetCacheInCanvas(html, targetSpan) {
  try {
    if (
      SNC.canvas.canvasUtils.updateWidgetCache &&
      typeof SNC.canvas.canvasUtils.updateWidgetCache === 'function' &&
      isOnlyInteractiveFilterApplied()
    )
      SNC.canvas.canvasUtils.updateWidgetCache(html, targetSpan);
  } catch (error) {
    if (SNC.canvas.canvasUtils.clearAllWidgetsCache)
      SNC.canvas.canvasUtils.clearAllWidgetsCache();
  }
}
function isOnlyInteractiveFilterApplied() {
  var allFilters =
    window.SNC &&
    SNC.canvas &&
    SNC.canvas.interactiveFilters &&
    SNC.canvas.interactiveFilters.getDefaultValues();
  var isOnlyInteractiveFilter = true;
  for (var key in allFilters) {
    if (allFilters.hasOwnProperty(key)) {
      var filter = allFilters[key];
      if (Array.isArray(filter) && filter.length) {
        for (var index = 0, len = filter.length; index < len; index++) {
          var item = filter[index];
          if (item.sliced || item.isFromLegend) {
            isOnlyInteractiveFilter = false;
            break;
          }
        }
      }
    }
  }
  return isOnlyInteractiveFilter;
}
function isFilterValidForRemoval(gridWindow) {
  var isValidForRemoval = false;
  if (gridWindow) {
    var isBothPublisherNSubscriber =
      gridWindow.preferences.can_publish &&
      gridWindow.preferences.can_subscribe;
    var interactiveFilters = gridWindow.interactiveFilters || {};
    var lastItemFromActiveFilterStack =
      window.SNC &&
      SNC.interactiveChart &&
      SNC.interactiveChart.length &&
      SNC.interactiveChart[SNC.interactiveChart.length - 1];
    if (
      isBothPublisherNSubscriber &&
      lastItemFromActiveFilterStack &&
      interactiveFilters[lastItemFromActiveFilterStack.id]
    )
      isValidForRemoval = true;
    else if (
      gridWindow.filtersFromLegend &&
      !hasBothLegendAndSlicedFilter(interactiveFilters)
    )
      isValidForRemoval = true;
  }
  return isValidForRemoval;
}
function getAllFiltersFromInteractiveUtil(gridWindow) {
  var allFilters = isRenderedInCanvas()
    ? SNC.canvas.interactiveFilters.getDefaultValues()
    : gridWindow._dashboardMessageHandler._filters;
  var newFilter = [];
  for (var key in allFilters) newFilter.push(allFilters[key]);
  return newFilter;
}
function hasBothLegendAndSlicedFilter(interactiveFilters) {
  var fCount = 0;
  var filter;
  if (interactiveFilters) {
    for (var key in interactiveFilters) {
      if (interactiveFilters.hasOwnProperty(key)) {
        filter = interactiveFilters[key];
        if (filter.sliced || filter.isFromLegend) fCount++;
      }
    }
  }
  return fCount >= 2;
}
function clearHighchartsTooltips(reportId) {
  jQuery('hctooltipreportid[value="' + reportId + '"]')
    .closest('.highcharts-tooltip-container')
    .remove();
}
