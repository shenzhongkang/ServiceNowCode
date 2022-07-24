/*! RESOURCE: /scripts/reportcommon/customvisuals/calendar.js */
var Calendar = function Calendar(reportUUID, runType, reportParams) {
  'use strict';
  var Moment = moment;
  if (!reportParams) {
    reportParams = window.g_report_params[reportUUID];
    reportParams.is_report_source_filter_already_combined = true;
  }
  createReportTemplate(reportUUID, reportParams);
  this.combinedFilter = reportParams.filter;
  this.containerId = 'chart-container-' + reportUUID;
  this.startTime = new Date().getTime();
  var self = this;
  function showMessage(msg, level, approval, requiredRoles, approver, msgJson) {
    if (level === 'FAILURE')
      jQuery('#' + self.containerId)
        .parent()
        .siblings('.report-message')
        .addClass('pivot-error')
        .text(msg);
    if (level === 'REPORT_VIEW') {
      showReportView(
        jQuery('#' + self.containerId)
          .parent()
          .siblings('.report-message')[0].id,
        msg,
        approval,
        self.reportId,
        requiredRoles,
        approver,
        msgJson
      );
      jQuery('#' + self.containerId).hide();
    } else
      jQuery('#' + self.containerId)
        .parent()
        .siblings('.report-message')
        .text(msg);
  }
  this.init = function init() {
    showReportIsLoading(findGridWindowFromElementID(self.containerId));
    self.runCalendar(reportParams, runType);
  };
  this.runCalendar = function runCalendar() {
    self.reportId = reportParams.report_id || 'calendar';
    window.calendarReport = window.calendarReport || {};
    window.calendarReport[self.reportId] =
      window.calendarReport[self.reportId] || {};
    reportParams.styleField =
      reportParams.styleField ||
      window.calendarReport[self.reportId].highlight ||
      reportParams.calstyle;
    var defaultDateOverride = null;
    if (reportParams.year || reportParams.month || reportParams.day)
      defaultDateOverride = moment({
        year: reportParams.year,
        month: reportParams.month,
        day: reportParams.day,
      }).format('YYYY-MM-DD');
    if (reportParams.calview === 'week') reportParams.calview = 'agendaWeek';
    else if (reportParams.calview === 'day') reportParams.calview = 'agendaDay';
    var calWidth = jQuery('#' + self.containerId).width();
    var yearCols = 2;
    if (calWidth < 640) yearCols = 1;
    else if (calWidth > 1280) yearCols = 3;
    jQuery('#' + self.containerId)
      .empty()
      .fullCalendar('destroy');
    jQuery('#' + self.containerId).fullCalendar({
      theme: false,
      buttonText: chartHelpers.i18n.buttonText,
      dayNames: chartHelpers.i18n.daysNames,
      dayNamesShort: chartHelpers.i18n.dayNamesShort,
      monthNames: chartHelpers.i18n.monthNames,
      monthNamesShort: chartHelpers.i18n.monthNamesShort,
      allDayHtml: chartHelpers.i18n.allDayHtml,
      weekNumberTitle: chartHelpers.i18n.weekNumberTitleShort,
      weekNumberCalculation:
        window.chartHelpers.systemParams.firstDay === 0 ? 'local' : 'ISO',
      isRTL: chartHelpers.i18n.isRTL,
      buttonIcons: {
        prev: 'left-single-arrow',
        next: 'right-single-arrow',
        prevYear: 'left-double-arrow',
        nextYear: 'right-double-arrow',
      },
      fixedWeekCount: true,
      timeFormat: 'H:mm',
      slotLabelFormat: 'H:mm',
      axisFormat: 'H:mm',
      firstDay: window.chartHelpers.systemParams.firstDay,
      defaultDate:
        window.calendarReport[self.reportId].start ||
        defaultDateOverride ||
        window.chartHelpers.systemParams.defaultDate,
      defaultView:
        window.calendarReport[self.reportId].view ||
        reportParams.calview ||
        'month',
      defaultTimedEventDuration:
        window.chartHelpers.systemParams.defaultEventDuration,
      yearColumns: yearCols,
      slotEventOverlap: window.chartHelpers.systemParams.slotEventOverlap
        ? true
        : false,
      lazyFetching: false,
      height: 'auto',
      contentHeight: 'auto',
      eventLimit:
        parseInt(
          window.chartHelpers.systemParams.maxEventsDisplayedPerCell,
          10
        ) + 1,
      nextDayThreshold: '00:00:00',
      eventLimitText: function eventLimitText(amountOfEvents) {
        if (
          amountOfEvents <=
          parseInt(window.chartHelpers.systemParams.maxMoreEventsPerDay, 10)
        ) {
          return chartHelpers.i18n.plusMore.format(amountOfEvents);
        }
        return chartHelpers.i18n.plusMany;
      },
      eventLimitClick: function eventLimitClick(cellInfo, jsEvent) {
        setTimeout(function timeoutCb() {
          jQuery('#' + self.containerId)
            .find('.fc-close')
            .attr('tabindex', 0);
        }, 500);
        if (
          cellInfo.date &&
          cellInfo.hiddenSegs &&
          cellInfo.hiddenSegs.length >
            parseInt(window.chartHelpers.systemParams.maxMoreEventsPerDay, 10)
        ) {
          var selectedDate = moment(cellInfo.date).format('YYYY-MM-DD');
          self.drillViewToList({
            data: { startDate: selectedDate, endDate: selectedDate },
          });
          return false;
        }
        return 'popover';
      },
      views: {
        month: {
          weekNumbers: true,
        },
        year: {
          weekNumbers: true,
        },
      },
      header: {
        left: 'agendaDay,agendaWeek,month,year',
        center: 'title',
        right: 'today prevYear,prev,next,nextYear',
      },
      eventDataTransform: function (event) {
        var view = jQuery('#' + self.containerId).fullCalendar('getView');
        if (view.name === 'agendaDay') {
          if (event.start && event.end) {
            var viewStartMoment = new Moment(view.intervalStart.toISOString());
            var viewEndMoment = new Moment(view.intervalEnd.toISOString());
            if (
              (viewStartMoment.isSame(event.start) ||
                viewStartMoment.isAfter(event.start)) &&
              (viewEndMoment.isBefore(event.end) ||
                viewEndMoment.isSame(event.end))
            ) {
              event.allDay = true;
            }
          }
        } else if (view.name === 'agendaWeek')
          if (event.start && event.end) {
            var eventStartMoment = new Moment(event.start);
            var eventEndMoment = new Moment(event.end);
            var hoursDiff = eventEndMoment.diff(eventStartMoment, 'hours');
            var startOfDayOfEventStartMoment = new Moment(event.start).startOf(
              'day'
            );
            if (
              hoursDiff >= 24 &&
              (startOfDayOfEventStartMoment.isSame(eventStartMoment) ||
                eventEndMoment.diff(startOfDayOfEventStartMoment, 'day') >= 2)
            )
              event.allDay = true;
          }
        return event;
      },
      eventMouseover: function eventMouseover(event, jsEvent, view) {
        if (
          window.chartHelpers.systemParams.enablePreviewOnHover &&
          window.chartHelpers.systemParams.enablePreviewOnHover !== 'false'
        )
          popRecordDiv(jsEvent, reportParams.table, event.id);
      },
      eventMouseout: function eventMouseout(event, jsEvent, view) {
        if (
          window.chartHelpers.systemParams.enablePreviewOnHover &&
          window.chartHelpers.systemParams.enablePreviewOnHover !== 'false'
        )
          lockPopup(jsEvent);
      },
      viewRender: function viewRender(view, element) {
        jQuery('#' + self.containerId)
          .parent()
          .siblings('.report-message')
          .text(chartHelpers.i18n.building);
      },
      eventAfterAllRender: function eventAfterAllRender(view) {
        var start = new Moment(view.intervalStart.toISOString());
        if (start.isValid())
          window.calendarReport[self.reportId] = {
            view: view.name,
            start: start.format('YYYY-MM-DD'),
            highlight: reportParams.styleField,
          };
        var viewStart = new Moment(view.start.toISOString());
        if (viewStart.isValid()) {
          var dateAfterLastDateInView = new Moment(view.end.toISOString());
          var viewEnd = dateAfterLastDateInView.subtract(1, 'day');
          var $drillToListLink = jQuery(
            '#' + self.containerId + ' #drillViewToList'
          );
          if (!$drillToListLink.length) {
            $drillToListLink = jQuery('<a/>', {
              id: 'drillViewToList',
              class: 'all-records-link',
              target: '_blank',
            }).text(chartHelpers.i18n.viewAllRecords);
            jQuery('#' + self.containerId + ' .highlight-wrap').append(
              $drillToListLink
            );
          }
          $drillToListLink.unbind('click');
          $drillToListLink.on('click', function clickCb() {
            self.drillViewToList({
              data: {
                startDate: viewStart.format('YYYY-MM-DD'),
                endDate: viewEnd.format('YYYY-MM-DD'),
              },
            });
          });
        }
        jQuery('#' + self.containerId)
          .parent()
          .siblings('.report-message')
          .empty();
        if (
          window.g_accessibility === 'true' ||
          window.g_accessibility === true
        )
          self.enableAccessibility();
        jQuery('.fc-year-monthly-name>a').click(
          function preventDefaultAnchorClick(e) {
            e.preventDefault();
          }
        );
      },
      eventSources: [
        {
          allDayDefault: false,
          backgroundColor: 'white',
          borderColor: 'lightgrey',
          textColor: 'black',
          editable: false,
          events: function events(start, end, timezone, fullCalendarCallback) {
            var processor =
              runType === 'run'
                ? 'CalendarRunProcessor'
                : 'CalendarRunPublishedProcessor';
            self.firstVisibleDate = start.format('YYYY-MM-DD').toString();
            self.lastVisibleDate = end.format('YYYY-MM-DD').toString();
            jQuery
              .ajax({
                method: 'POST',
                url: '/xmlhttp.do',
                dataType: 'xml',
                headers: { 'X-UserToken': window.g_ck },
                data: {
                  sysparm_processor: processor,
                  sysparm_scope: 'global',
                  is_portal: reportParams.is_portal,
                  start_date: start.format('YYYY-MM-DD').toString(),
                  end_date: end.format('YYYY-MM-DD').toString(),
                  style_field: reportParams.styleField,
                  sysparm_timer: new Date().getTime(),
                  sysparm_request_params: JSON.stringify(
                    self.buildRequestParams(reportParams)
                  ),
                },
              })
              .done(function doneCb(xml) {
                self.processResponse(xml, fullCalendarCallback);
              })
              .fail(function failCb(jqXHR, textStatus, error) {
                console.log(textStatus, error);
              });
          },
        },
      ],
      dayClick: function dayClick(date, jsEvent, view) {
        jQuery('#' + self.containerId).fullCalendar('changeView', 'agendaDay');
        jQuery('#' + self.containerId).fullCalendar('gotoDate', date);
      },
    });
  };
  this.drillViewToList = function drillViewToList(event) {
    var payload = {
      sysparm_cal_field: reportParams.cal_field,
      sysparm_table: reportParams.table,
      sysparm_start_date: event.data.startDate,
      sysparm_end_date: event.data.endDate,
      sysparm_filter: self.combinedFilter,
      sysparm_cal_first_vis_data: self.firstVisibleDate,
      sysparm_end_field: this.reportParamHasEndField(),
    };
    jQuery
      .ajax({
        method: 'POST',
        url: '/api/now/reporting/calendar/drill',
        contentType: 'application/json',
        dataType: 'json',
        headers: { 'X-UserToken': window.g_ck },
        data: JSON.stringify(payload),
      })
      .done(function doneCb(jsonResponse) {
        window.open(jsonResponse.url, '_blank');
      })
      .fail(function failCb(jqXHR, textStatus, error) {
        console.log(textStatus, error);
      });
  };
  this.reportParamHasEndField = function reportParamHasEndField() {
    var calField = reportParams.cal_field;
    var isStartField =
      calField.indexOf('_start', calField.length - '_start'.length) !== -1 ||
      calField.indexOf('start_') === 0 ||
      calField.indexOf('_start_') !== -1 ||
      calField === 'start';
    if (isStartField) {
      var calEndField = calField.replace(/start/g, 'end');
      var hasEndField = true;
      if (typeof Table !== 'undefined') {
        var calendarTable = Table.get(reportParams.table);
        if (calendarTable) {
          var element = calendarTable.getElement(calEndField);
          if (!element) hasEndField = false;
        }
      }
      if (hasEndField) return calEndField;
    }
    return '';
  };
  this.processResponse = function processResponse(
    response,
    fullcalendarCallback
  ) {
    if (!response) {
      showError(self.containerId, 'No response from the server');
    } else {
      var resp = JSON.parse(jQuery(response).find('RESPONSE').text());
      if (resp.STATUS === 'SUCCESS')
        try {
          var responseData = resp.RESPONSE_DATA;
          self.combinedFilter = responseData.filterQuery;
          self.populateStyleFields(responseData.styleFields);
          fullcalendarCallback(responseData.calendarEvents);
          if (responseData.message) showMessage(responseData.message, 'INFO');
        } catch (err) {
          showMessage(chartHelpers.i18n.chartGenerationError, 'FAILURE');
          console.log(err);
        }
      else {
        fullcalendarCallback([]);
        showMessage(
          resp.RESPONSE_DATA,
          resp.STATUS,
          resp.APPROVAL,
          resp.REQUIRED_ROLES,
          resp.APPROVER,
          resp.MSG
        );
      }
    }
    hideReportIsLoading(findGridWindowFromElementID(self.containerId));
    var now = new Date().getTime();
    var elapsedTime = (now - self.startTime) / 1000;
    console.log('Time taken to render report: ' + elapsedTime);
  };
  this.populateStyleFields = function populateStyleFields(styleFields, args) {
    if (jQuery('#' + self.containerId + ' .highlight-dropdown').length) return;
    var $highlightWrap = jQuery('#' + self.containerId).append(
      '<div class="highlight-wrap"/>'
    );
    if (styleFields && styleFields.length) {
      var highlightOptions;
      var selectedOption = '';
      for (var i = 0; i < styleFields.length; i++) {
        if (i === 0)
          highlightOptions +=
            '<option value="">' + chartHelpers.i18n.none + '</option>';
        if (reportParams.styleField)
          if (styleFields[i].name === reportParams.styleField)
            highlightOptions +=
              '<option selected="selected" value="' +
              styleFields[i].name +
              '" >' +
              styleFields[i].label +
              '</option>';
          else
            highlightOptions +=
              '<option value="' +
              styleFields[i].name +
              '" >' +
              styleFields[i].label +
              '</option>';
        else
          highlightOptions +=
            '<option  value="' +
            styleFields[i].name +
            '" >' +
            styleFields[i].label +
            '</option>';
      }
      $highlightWrap
        .find('.highlight-wrap')
        .append(
          jQuery('<label for="highlight_field" />').text(
            chartHelpers.i18n.highlightBasedOn
          )
        )
        .append(
          jQuery(
            '<select id="highlight_field" class="highlight-dropdown form-control"/>'
          ).html(highlightOptions)
        );
      jQuery('#' + self.containerId + ' .highlight-dropdown').on(
        'change',
        function changeCb() {
          reportParams.styleField = this.value;
          jQuery('#' + self.containerId).fullCalendar('refetchEvents');
        }
      );
    }
  };
  this.enableAccessibility = function enableAccessibility() {
    jQuery('#' + self.containerId)
      .find('table')
      .attr('role', 'grid')
      .find('tr')
      .attr('role', 'row')
      .find('.fc-more')
      .attr('tabindex', 0);
    jQuery('#' + self.containerId)
      .find('thead th')
      .attr({ role: 'columnheader', scope: 'col' });
    jQuery('#' + self.containerId)
      .find('tbody td')
      .attr({ role: 'gridcell' });
  };
  this.buildRequestParams = function buildRequestParams() {
    return {
      sysparm_cal_field: reportParams.cal_field,
      sysparm_table: reportParams.table,
      sysparm_report_id: reportParams.report_id,
      sysparm_report_source_id: reportParams.report_source_id,
      sysparm_is_report_source_filter_already_combined:
        reportParams.is_report_source_filter_already_combined,
      sysparm_query: reportParams.filter,
      sysparm_list_ui_view: reportParams.list_ui_view,
      sysparm_homepage_sysid: reportParams.homepage_sysid,
      sysparm_is_published: reportParams.is_published,
    };
  };
  this.init();
};
String.prototype.format = function formatString() {
  var args = arguments;
  return this.replace(/\{(\d+)\}/g, function replaceCb() {
    return args[arguments[1]];
  });
};
