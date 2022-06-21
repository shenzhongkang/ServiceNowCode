/*! RESOURCE: /scripts/app.$sp/directive.spDatePicker.js */
angular
  .module('sn.$sp')
  .directive(
    'spDatePicker',
    function (
      spConf,
      $rootScope,
      $document,
      $window,
      spAriaUtil,
      i18n,
      spDatePickerUtil,
      select2EventBroker,
      spUtil
    ) {
      var dateFormat = g_user_date_format || spConf.SYS_DATE_FORMAT;
      var dateTimeFormat = g_user_date_time_format || spConf.SYS_TIME_FORMAT;
      var keyMap = {
        ArrowLeft: { date: 'decrementDays', time: null },
        Left: { date: 'decrementDays', time: null },
        ArrowRight: { date: 'incrementDays', time: null },
        Right: { date: 'incrementDays', time: null },
        ArrowUp: { date: 'decrementWeeks', time: 'incrementMinutes' },
        Up: { date: 'decrementWeeks', time: 'incrementMinutes' },
        ArrowDown: { date: 'incrementWeeks', time: 'decrementMinutes' },
        Down: { date: 'incrementWeeks', time: 'decrementMinutes' },
        AltUp: 'toggleDateTimePicker',
        AltArrowUp: 'toggleDateTimePicker',
        AltDown: 'toggleDateTimePicker',
        AltArrowDown: 'toggleDateTimePicker',
        PageUp: { date: 'decrementMonths', time: 'incrementHours' },
        PageDown: { date: 'incrementMonths', time: 'decrementHours' },
        AltPageUp: { date: 'decrementYears', time: null },
        AltPageDown: { date: 'incrementYears', time: null },
        Home: { date: 'startOfCurrentMonth', time: null },
        End: { date: 'endOfCurrentMonth', time: null },
      };
      var TOGGLE_DATETIME_PICKER = 'toggleDateTimePicker';
      var DECREMENT_MINUTES = 'decrementMinutes';
      var oldDateValue, oldInputValue;
      const ACTIVE_DAY = '.datepicker-days .day.active div';
      const ACTIVE_MONTH = '.datepicker-months span.active',
        MONTH_ELEMENTS = '.datepicker-months .month';
      const ACTIVE_YEAR = '.datepicker-years span.active';
      var translations = [];
      var iconAriaLabel;
      i18n.getMessages(
        [
          'Date in format',
          'Use format',
          'Entered date not valid. Enter date in format',
          'Show Calendar for {0}',
          'Toggle date time picker',
          'month',
          'year',
          'decade',
          'Toggle',
          'Previous',
          'Next',
          'increment Minutes',
          'increment Hours',
          'decrement Minutes',
          'decrement Hours',
          '{0} hours. hour picker',
          '{0} minutes. minute picker',
          '{0} minutes',
          '{0} hours',
        ],
        function (msgs) {
          translations = msgs;
        }
      );
      var isChrome = $window.navigator.userAgent.indexOf('Chrome') > -1;
      var isSafari =
        !isChrome && $window.navigator.userAgent.indexOf('Safari') > -1;
      var enableDateTranslation = $window.NOW.sp.enableDateTranslation;
      function setDisabledFields(picker) {
        var showCalenderType = spDatePickerUtil.calendarShowType(picker);
        var ariaDisabledFields = picker.widget.find(
          '.datepicker-' + showCalenderType + " [aria-disabled='true']"
        );
        var disabledFields = picker.widget.find(
          '.datepicker-' + showCalenderType + ' .disabled'
        );
        if (ariaDisabledFields.length)
          ariaDisabledFields.removeAttr('aria-disabled');
        if (disabledFields.length) disabledFields.attr('aria-disabled', 'true');
      }
      function onShowDatePicker(picker) {
        setArialabels(picker);
        setShowDatePickerFocus(picker, picker.date, 'open');
        repositionDatePickerModal(picker);
        setDisabledFields(picker);
        if (spDatePickerUtil.datePickerShowType(picker) == 'date')
          picker.options.pickTime
            ? picker.widget
                .find('.picker-switch.accordion-toggle .flex-row')
                .removeClass('cancelok-hidden')
            : picker.widget
                .find('.datepicker')
                .next()
                .removeClass('cancelok-hidden');
        picker.element.find('button').addClass('calendarbutton-pressed');
      }
      function repositionDatePickerModal(picker) {
        var mediaQuery = window.matchMedia('(max-width: 767px)');
        picker.widget[0].style.height = '';
        if (mediaQuery.matches && !spUtil.isMobile()) {
          picker.widget[0].classList.add('reposition');
          var widgetOuterHeight = picker.widget.outerHeight();
          picker.widget[0].style.top =
            ((window.pageYOffset + widgetOuterHeight / 20) /
              window.innerHeight) *
              100 +
            '%';
          picker.widget[0].style.left =
            ((window.innerWidth / 2 - picker.widget.outerWidth() / 2) /
              window.innerWidth) *
              100 +
            '%';
          if (
            window.innerHeight < widgetOuterHeight &&
            picker.element.parents().hasClass('modal-body')
          ) {
            picker.widget[0].style.height = window.innerHeight * 0.8 + 'px';
            picker.widget[0].style.overflowY = 'auto';
          }
        } else picker.widget[0].classList.remove('reposition');
      }
      function attachKeyboardEvent(picker) {
        picker.widget.on('keydown', $.proxy(onKeydownEvt, this, picker));
        picker.widget.on('keyup', $.proxy(onKeyupEvt, this, picker));
        picker.widget.on(
          'click',
          '.datepicker *',
          $.proxy(onClickEvt, this, picker)
        );
      }
      function detachKeyboardEvent(picker) {
        picker.widget.off('keydown');
        picker.widget.off('keyup');
        picker.widget.off('click', '.datepicker *');
      }
      function onKeyupEvt(picker, e) {
        e.stopPropagation();
        e.preventDefault();
      }
      function onDpToggle(picker, e, openMessage) {
        var toggleElement = setToggleElementArialabel(picker);
        if (openMessage) {
          setArialabel(
            toggleElement,
            openMessage + ' ' + toggleElement.getAttribute('aria-label')
          );
        }
        toggleElement.blur();
        setTimeout(function () {
          toggleElement.focus();
        }, 150);
      }
      function onClickEvt(picker, e) {
        var calendarShowType = spDatePickerUtil.calendarShowType(picker),
          toggleText =
            calendarShowType == 'years'
              ? translations['decade']
              : calendarShowType == 'months'
              ? translations['year']
              : translations['month'],
          pickerSwitchAriaLabel =
            calendarShowType == 'years'
              ? picker.widget.find('.datepicker-years .picker-switch').html()
              : picker.widget
                  .find('.datepicker-' + calendarShowType + ' .picker-switch')
                  .html() +
                '. ' +
                translations['Toggle'] +
                ' ' +
                toggleText;
        if ($(e.target).is('.day div,.day')) {
          setTimeout(function () {
            setShowDatePickerFocus(picker, picker.date, 'click');
          }, 200);
        } else if ($(e.target).is(MONTH_ELEMENTS)) {
          picker.options.pickTime
            ? picker.widget
                .find('.picker-switch.accordion-toggle .flex-row')
                .removeClass('cancelok-hidden')
            : picker.widget
                .find('.datepicker')
                .next()
                .removeClass('cancelok-hidden');
          picker.widget
            .find('.datepicker-' + calendarShowType + ' .picker-switch')
            .attr('aria-label', pickerSwitchAriaLabel);
          setMonthDayYearArialabel(picker);
          setDisabledFields(picker);
        } else if ($(e.target).hasClass('picker-switch')) {
          picker.options.pickTime
            ? picker.widget
                .find('.picker-switch.accordion-toggle .flex-row')
                .addClass('cancelok-hidden')
            : picker.widget
                .find('.datepicker')
                .next()
                .addClass('cancelok-hidden');
          picker.widget
            .find('.datepicker-' + calendarShowType + ' .picker-switch')
            .attr('aria-label', pickerSwitchAriaLabel);
          setDisabledFields(picker);
        } else if ($(e.target).is('.prev,.next,.year')) {
          picker.widget
            .find('.datepicker-' + calendarShowType + ' .picker-switch')
            .attr('aria-label', pickerSwitchAriaLabel);
          setDisabledFields(picker);
        }
        setDayMonthYearArrowElementsArialabel(picker);
      }
      function setArialabels(picker) {
        setMonthDayYearArialabel(picker);
        setDayMonthYearArrowElementsArialabel(picker);
        if (picker.options.pickTime) {
          setToggleElementArialabel(picker);
          setTimeArrowElementsArialabel(picker);
          setHourMinuteArialabel(picker);
          setHourMinutePickersAriaLabel(picker, 'both');
        }
      }
      function setHourMinuteArialabel(picker) {
        var minutes = picker.widget.find('.timepicker .minute'),
          hours = picker.widget.find('.timepicker .hour');
        $(minutes).each(function (index, minute) {
          $(minute).attr({
            tabindex: '0',
            role: 'button',
            'aria-label': i18n.format(
              translations['{0} minutes'],
              parseInt($(minute).text())
            ),
          });
        });
        $(hours).each(function (index, hour) {
          $(hour).attr({
            tabindex: '0',
            role: 'button',
            'aria-label': i18n.format(
              translations['{0} hours'],
              parseInt($(hour).text())
            ),
          });
        });
      }
      function setHourMinutePickersAriaLabel(picker, flag) {
        switch (flag) {
          case 'hour':
          case 'both':
            var hourPicker = picker.widget.find(
                '.timepicker [data-action="showHours"]'
              ),
              hourPickerAriaLabel = i18n.format(
                translations['{0} hours. hour picker'],
                parseInt(hourPicker.text())
              );
            hourPicker.attr({
              tabindex: '0',
              role: 'button',
              'aria-label': hourPickerAriaLabel,
            });
            if (flag == 'hour') break;
          case 'minute':
            var minutePicker = picker.widget.find(
                '.timepicker [data-action="showMinutes"]'
              ),
              minutePickerAriaLabel = i18n.format(
                translations['{0} minutes. minute picker'],
                parseInt(minutePicker.text())
              );
            minutePicker.attr({
              tabindex: '0',
              role: 'button',
              'aria-label': minutePickerAriaLabel,
            });
        }
      }
      function setMonthDayYearArialabel(picker) {
        if (isSafari) return;
        var dates = picker.widget.find('.datepicker .day'),
          months = picker.widget.find('.datepicker .month'),
          currentDate = moment(picker.date);
        $(dates).each(function (index, date) {
          var clone = currentDate.clone(),
            div = $(date).find('div')[0];
          if ($(date).hasClass('old')) {
            clone.subtract('1', 'month');
          } else if ($(date).hasClass('new')) {
            clone.add('1', 'month');
          }
          clone.date(div.innerHTML);
          var dateText = spDatePickerUtil.formattedDate(picker, clone);
          div.setAttribute('aria-label', dateText);
        });
        $(months).each(function (index, month) {
          var clone = currentDate.clone(),
            format = 'MMMM',
            monthAriaLabel;
          clone.month(month.innerHTML);
          if (enableDateTranslation) {
            monthAriaLabel = moment(clone).format(format);
          } else {
            monthAriaLabel = moment(clone).locale('en').format(format);
          }
          month.setAttribute('aria-label', monthAriaLabel);
        });
      }
      function setDayMonthYearArrowElementsArialabel(picker) {
        setDayMonthYearArrowElementArialabel(
          picker,
          'days',
          translations['month']
        );
        setDayMonthYearArrowElementArialabel(
          picker,
          'months',
          translations['year']
        );
        setDayMonthYearArrowElementArialabel(
          picker,
          'years',
          translations['decade']
        );
      }
      function setDayMonthYearArrowElementArialabel(
        picker,
        calendarShowType,
        toggleText
      ) {
        var pickerSwitchAriaLabel =
          calendarShowType == 'years'
            ? picker.widget.find('.datepicker-years .picker-switch').html()
            : picker.widget
                .find('.datepicker-' + calendarShowType + ' .picker-switch')
                .html() +
              '. ' +
              translations['Toggle'] +
              ' ' +
              toggleText;
        picker.widget
          .find('.datepicker-' + calendarShowType + ' .prev')
          .attr({
            role: 'button',
            tabindex: '0',
            title: translations['Previous'] + ' ' + toggleText,
            'data-toggle': 'tooltip',
            'data-placement': 'top',
            'data-container': 'body',
            'aria-label': translations['Previous'] + ' ' + toggleText,
          });
        picker.widget
          .find('.datepicker-' + calendarShowType + ' .next')
          .attr({
            role: 'button',
            tabindex: '0',
            title: translations['Next'] + ' ' + toggleText,
            'data-toggle': 'tooltip',
            'data-placement': 'top',
            'data-container': 'body',
            'aria-label': translations['Next'] + ' ' + toggleText,
          });
        picker.widget
          .find('.datepicker-' + calendarShowType + ' .picker-switch')
          .attr({
            role: 'button',
            tabindex: '0',
            'aria-label': pickerSwitchAriaLabel,
          });
      }
      function setTimeArrowElementsArialabel(picker) {
        setTimeArrowElementArialabel(picker, 'increment Minutes');
        setTimeArrowElementArialabel(picker, 'decrement Minutes');
        setTimeArrowElementArialabel(picker, 'increment Hours');
        setTimeArrowElementArialabel(picker, 'decrement Hours');
      }
      function setTimeArrowElementArialabel(picker, action) {
        var arrowElement = picker.widget.find(
          '.timepicker [data-action=' + action.replace(/\s/g, '') + ']'
        );
        if (arrowElement.length > 0) {
          setArialabel(arrowElement[0], translations[action]);
          setTooltip(arrowElement[0], translations[action]);
        }
      }
      function setHideDatePickerFocus(picker) {
        var calendarButtonElement = picker.element.find('button');
        var closeMessage =
          (picker.options.pickTime
            ? i18n.getMessage('date time')
            : i18n.getMessage('date')) +
          ' ' +
          i18n.getMessage('picker is closed');
        if (calendarButtonElement.length > 0) {
          setArialabel(
            calendarButtonElement[0],
            closeMessage + '. ' + iconAriaLabel
          );
          calendarButtonElement[0].focus();
          setTimeout(function () {
            setArialabel(calendarButtonElement[0], iconAriaLabel);
          }, 3000);
        }
      }
      function setHideDatePickerFocusPrev(picker) {
        var previousElement = picker.element.prev();
        if (previousElement.length > 0) {
          previousElement[0].focus();
        }
      }
      function setToggleElementArialabel(picker) {
        var showType = spDatePickerUtil.datePickerShowType(picker),
          toggleElement = picker.widget.find('.accordion-toggle a');
        if (toggleElement[0])
          toggleElement.attr('title', translations['Toggle date time picker']);
        setArialabel(
          toggleElement[0],
          showTypeMessage(picker) + i18n.getMessage('Toggle date time picker')
        );
        return toggleElement[0];
      }
      function showTypeMessage(picker) {
        var showType = spDatePickerUtil.datePickerShowType(picker);
        return (
          i18n.getMessage('showing') +
          ' ' +
          i18n.getMessage(showType) +
          ' ' +
          i18n.getMessage('picker') +
          '. '
        );
      }
      function setFocusOnTab(picker) {
        var activeEl,
          calendarShowType = spDatePickerUtil.calendarShowType(picker);
        switch (calendarShowType) {
          case 'days':
            if (picker.widget.find(ACTIVE_DAY).length == 0)
              picker.setDate(
                moment(picker.date)
                  .year(
                    picker.widget
                      .find('.datepicker-days .picker-switch')
                      .html()
                      .slice(-4)
                  )
                  .month(
                    picker.widget
                      .find('.datepicker-days .picker-switch')
                      .html()
                      .slice(0, -5)
                  )
                  .date(1)
              );
            activeEl = ACTIVE_DAY;
            break;
          case 'months':
            if (picker.widget.find(ACTIVE_MONTH).length == 0)
              picker.setDate(
                moment(picker.date)
                  .year(
                    picker.widget
                      .find('.datepicker-months .picker-switch')
                      .html()
                  )
                  .month(0)
              );
            activeEl = ACTIVE_MONTH;
            break;
          case 'years':
            if (picker.widget.find(ACTIVE_YEAR).length == 0)
              picker.setDate(
                moment(picker.date).year(
                  picker.widget
                    .find('.datepicker-years .picker-switch')
                    .html()
                    .slice(0, 4)
                )
              );
            activeEl = ACTIVE_YEAR;
            break;
        }
        picker.widget
          .find(activeEl)
          .attr({ tabindex: '-1', role: 'button' })
          .focus();
      }
      function setShowDatePickerFocus(picker, date, action) {
        var showType = spDatePickerUtil.datePickerShowType(picker),
          formattedDate = spDatePickerUtil.formattedDate(picker, date),
          openMessage = getOpenMessage(picker),
          calendarShowType = spDatePickerUtil.calendarShowType(picker);
        if (action == 'toggleDateTimePicker') {
          if (showType == 'date' && calendarShowType == 'days')
            picker.widget
              .find('.picker-switch.accordion-toggle .flex-row')
              .removeClass('cancelok-hidden');
          else
            picker.widget
              .find('.picker-switch.accordion-toggle .flex-row')
              .addClass('cancelok-hidden');
        }
        if (!action || action.indexOf('toggleDateTimePicker') !== -1) {
          return;
        }
        if (showType === 'date') {
          var dayElement = picker.widget.find('.datepicker-days td.active div');
          if (dayElement.length > 0) {
            var label = formattedDate;
            if (action === 'open') {
              label =
                openMessage +
                (picker.options.pickTime ? showTypeMessage(picker) : '') +
                label;
              setArialabel(dayElement[0], label);
            } else {
              if (!isSafari) {
                setArialabel(dayElement[0], label);
              }
            }
            dayElement[0].blur();
            setTimeout(function () {
              dayElement[0].focus();
            }, 50);
          }
        }
        if (showType === 'time') {
          if (action === 'open') {
            onDpToggle(picker, null, openMessage);
          } else if (action === 'togglePeriod') {
            var togglePeriodElement = picker.widget.find(
              '.timepicker [data-action=' + action + ']'
            );
            setArialabel(
              togglePeriodElement[0],
              action + ' ' + togglePeriodElement[0].innerText
            );
            togglePeriodElement[0].blur();
            setTimeout(function () {
              togglePeriodElement[0].focus();
            }, 100);
          } else if (action === 'selectHour') {
            var showHoursEl = picker.widget.find(
              '.timepicker [data-action="showHours"]'
            );
            showHoursEl.focus();
            setHourMinutePickersAriaLabel(picker, 'hour');
          } else if (action === 'selectMinute') {
            var showMinutesEl = picker.widget.find(
              '.timepicker [data-action="showMinutes"]'
            );
            showMinutesEl.focus();
            setHourMinutePickersAriaLabel(picker, 'minute');
          } else if (action === 'showHours') {
            var togglePickerEl = picker.widget.find(
              '[data-action="toggleDateTimePicker"]'
            );
            togglePickerEl.focus();
            spAriaUtil.sendLiveMessage(
              i18n.getMessage('hour picker opened'),
              'status'
            );
          } else if (action === 'showMinutes') {
            var togglePickerEl = picker.widget.find(
              '[data-action="toggleDateTimePicker"]'
            );
            togglePickerEl.focus();
            spAriaUtil.sendLiveMessage(
              i18n.getMessage('minute picker opened'),
              'status'
            );
          } else {
            var arrowElement = picker.widget.find(
              '.timepicker [data-action=' + action + ']'
            );
            setArialabel(
              arrowElement[0],
              action + ' ' + (isSafari ? '' : formattedDate)
            );
            arrowElement[0].blur();
            setTimeout(function () {
              arrowElement[0].focus();
            }, 100);
            setHourMinutePickersAriaLabel(picker, 'both');
          }
        }
      }
      function getOpenMessage(picker) {
        return (
          (picker.options.pickTime
            ? i18n.getMessage('date time')
            : i18n.getMessage('date')) +
          ' ' +
          i18n.getMessage('picker is opened') +
          '. '
        );
      }
      function setArialabel(element, label) {
        if (element) {
          element.setAttribute('aria-label', label);
        }
      }
      function setTooltip(element, label) {
        if (element) {
          element.setAttribute('data-toggle', 'tooltip');
          element.setAttribute('title', label);
          element.setAttribute('data-placement', 'top');
        }
      }
      function onDpAction(e) {
        setShowDatePickerFocus(e.picker, e.date, e.action);
      }
      function onDpChangeAria(e, picker, element) {
        if (isSafari) {
          var el = element.find('.form-control');
          el[0].setAttribute(
            'aria-label',
            spDatePickerUtil.formattedDayTime(picker, e.date)
          );
        }
        if (
          e.date.month() !== e.oldDate.month() ||
          e.date.year() !== e.oldDate.year()
        ) {
          setMonthDayYearArialabel(picker);
          setDayMonthYearArrowElementsArialabel(picker);
        }
      }
      function hidePicker(picker) {
        var input = spDatePickerUtil.getSPDateickerInput(picker);
        if (input && input.val() === '') {
          picker.setDate(
            enableDateTranslation
              ? moment().format(picker.format)
              : moment().locale('en').format(picker.format)
          );
        }
        picker.hide();
        setHideDatePickerFocus(picker);
      }
      function setTimeArrowElementFocus(picker, action) {
        var arrowElement = picker.widget.find(
          '.timepicker [data-action=' + action + ']'
        );
        if (arrowElement[0]) arrowElement[0].focus();
      }
      function cancelDatePickerValue(picker) {
        picker.setDate(oldDateValue);
        picker.hide();
        setHideDatePickerFocus(picker);
        if (oldInputValue == '')
          spDatePickerUtil.getSPDateickerInput(picker).val('');
      }
      function onKeydownEvt(picker, e) {
        var showType = spDatePickerUtil.datePickerShowType(picker);
        var calendarShowType = spDatePickerUtil.calendarShowType(picker);
        var amPmCheck = picker.widget.find(
          '.timepicker [data-action="togglePeriod"]'
        ).length
          ? true
          : false;
        if (e.keyCode === 9) {
          if (showType === 'date') {
            var datePickerfocusableEls = window.tabbable(picker.widget[0]);
            var firstFocusableEl = datePickerfocusableEls[0],
              nextButtonEl = datePickerfocusableEls[2],
              cancelOrTimeButtonEl = datePickerfocusableEls[3],
              lastFocusableEl =
                datePickerfocusableEls[datePickerfocusableEls.length - 1],
              dmyEl =
                calendarShowType == 'days'
                  ? '.datepicker-days td.day div'
                  : '.datepicker-' +
                    calendarShowType +
                    ' span.' +
                    calendarShowType.slice(0, -1);
            if (e.shiftKey) {
              if (document.activeElement === firstFocusableEl) {
                if (!picker.options.pickTime && calendarShowType != 'days')
                  setFocusOnTab(picker);
                else lastFocusableEl.focus();
                e.stopPropagation();
                e.preventDefault();
              } else if (document.activeElement === cancelOrTimeButtonEl) {
                setFocusOnTab(picker);
                e.stopPropagation();
                e.preventDefault();
              } else if ($(e.target).is(dmyEl)) {
                nextButtonEl.focus();
                e.stopPropagation();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === nextButtonEl) {
                setFocusOnTab(picker);
                e.stopPropagation();
                e.preventDefault();
              } else if (document.activeElement === lastFocusableEl) {
                firstFocusableEl.focus();
                e.stopPropagation();
                e.preventDefault();
              } else if ($(e.target).is(dmyEl)) {
                if (!picker.options.pickTime && calendarShowType != 'days')
                  firstFocusableEl.focus();
                else cancelOrTimeButtonEl.focus();
                e.stopPropagation();
                e.preventDefault();
              }
            }
          }
          if (showType === 'time') {
            if (
              picker.widget.find('.timepicker-picker')[0].style.display ===
              'none'
            ) {
              var timePickerfocusableEls = window.tabbable(picker.widget[0]);
              var firstFocusableElem = timePickerfocusableEls[0],
                lastFocusableElem =
                  timePickerfocusableEls[timePickerfocusableEls.length - 1];
              if (event.which === 9) {
                if (event.shiftKey) {
                  if (document.activeElement === firstFocusableElem) {
                    lastFocusableElem.focus();
                    event.preventDefault();
                    event.stopPropagation();
                  }
                } else {
                  if (document.activeElement === lastFocusableElem) {
                    firstFocusableElem.focus();
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }
              }
              return;
            }
            if (e.shiftKey) {
              e.stopPropagation();
              e.preventDefault();
              if (
                ($(e.target).parent().hasClass('accordion-toggle') &&
                  !amPmCheck) ||
                $(e.target).attr('data-action') === 'togglePeriod'
              ) {
                setTimeArrowElementFocus(picker, DECREMENT_MINUTES);
              } else if ($(e.target).attr('data-action') === 'incrementHours') {
                var toggleElement = picker.widget.find('.accordion-toggle a');
                toggleElement[0].focus();
              } else if (
                $(e.target).attr('data-action') === 'incrementMinutes'
              ) {
                setTimeArrowElementFocus(picker, 'decrementHours');
              } else if ($(e.target).attr('data-action') === 'decrementHours') {
                setTimeArrowElementFocus(picker, 'showHours');
              } else if ($(e.target).attr('data-action') === 'showHours') {
                setTimeArrowElementFocus(picker, 'incrementHours');
              } else if (
                $(e.target).attr('data-action') === 'decrementMinutes'
              ) {
                setTimeArrowElementFocus(picker, 'showMinutes');
              } else if ($(e.target).attr('data-action') === 'showMinutes') {
                setTimeArrowElementFocus(picker, 'incrementMinutes');
              } else if ($(e.target).parent().hasClass('accordion-toggle')) {
                setTimeArrowElementFocus(picker, 'togglePeriod');
              }
            } else {
              if (
                ($(e.target).attr('data-action') === DECREMENT_MINUTES &&
                  !amPmCheck) ||
                $(e.target).attr('data-action') === 'togglePeriod'
              ) {
                e.stopPropagation();
                e.preventDefault();
                picker.widget
                  .find('[data-action=' + TOGGLE_DATETIME_PICKER + ']')
                  .focus();
              } else {
                e.stopPropagation();
                e.preventDefault();
                if ($(e.target).parent().hasClass('accordion-toggle')) {
                  setTimeArrowElementFocus(picker, 'incrementHours');
                } else if (
                  $(e.target).attr('data-action') === 'incrementHours'
                ) {
                  setTimeArrowElementFocus(picker, 'showHours');
                } else if ($(e.target).attr('data-action') === 'showHours') {
                  setTimeArrowElementFocus(picker, 'decrementHours');
                } else if (
                  $(e.target).attr('data-action') === 'decrementHours'
                ) {
                  setTimeArrowElementFocus(picker, 'incrementMinutes');
                } else if (
                  $(e.target).attr('data-action') === 'incrementMinutes'
                ) {
                  setTimeArrowElementFocus(picker, 'showMinutes');
                } else if ($(e.target).attr('data-action') === 'showMinutes') {
                  setTimeArrowElementFocus(picker, 'decrementMinutes');
                } else if (
                  $(e.target).attr('data-action') === 'decrementMinutes'
                ) {
                  setTimeArrowElementFocus(picker, 'togglePeriod');
                }
              }
            }
          }
          return;
        }
        if (e.keyCode === 13 && $(e.target).attr('data-action')) {
          if (
            $(e.target).attr('data-action') !== 'showHours' &&
            $(e.target).attr('data-action') !== 'showMinutes'
          )
            return;
        }
        var arrowKeys = [37, 38, 39, 40];
        if (arrowKeys.indexOf(e.keyCode) != -1 && calendarShowType != 'days') {
          e.stopPropagation();
          e.preventDefault();
          var clone = moment(picker.date).clone();
          if (e.keyCode == 37) {
            clone.subtract('1', calendarShowType.slice(0, -1));
          } else if (e.keyCode == 38) {
            clone.subtract('4', calendarShowType.slice(0, -1));
          } else if (e.keyCode == 39) {
            clone.add('1', calendarShowType.slice(0, -1));
          } else if (e.keyCode == 40) {
            clone.add('4', calendarShowType.slice(0, -1));
          }
          if (calendarShowType == 'months') var prev = picker.date.year();
          picker.setDate(clone);
          picker.widget
            .find('.month,.year')
            .attr({ tabindex: '-1', role: 'button' });
          picker.widget
            .find('.datepicker-' + calendarShowType + ' .active')
            .focus();
          if (calendarShowType != 'months' || prev != picker.date.year())
            setDisabledFields(picker);
          return;
        }
        e.stopPropagation();
        e.preventDefault();
        if (e.keyCode === 13) {
          $(e.target).click();
          if ($(e.target).hasClass('picker-switch')) {
            calendarShowType = spDatePickerUtil.calendarShowType(picker);
            picker.widget
              .find('.datepicker-' + calendarShowType + ' .picker-switch')
              .attr({ tabindex: '0', role: 'button' })
              .focus();
          } else if ($(e.target).is('.month, .year')) {
            if ($(e.target).is('.month')) {
              var dmyElement = picker.widget.find(ACTIVE_DAY).length
                ? picker.widget.find(ACTIVE_DAY)
                : picker.widget
                    .find('.datepicker-days .day:not(.old) div')
                    .first();
              dmyElement.focus();
            } else {
              var dmyElement = picker.widget.find(ACTIVE_MONTH).length
                ? picker.widget.find(ACTIVE_MONTH)
                : picker.widget.find(MONTH_ELEMENTS).first();
              $(dmyElement).attr({ tabindex: '-1', role: 'button' });
              dmyElement.focus();
            }
          } else {
            $(e.target).blur();
            setTimeout(function () {
              $(e.target).focus();
            }, 100);
          }
        } else if (e.keyCode === 32) {
          setTimeout(function () {
            hidePicker(picker);
          }, 200);
        } else if (e.keyCode === 27) {
          cancelDatePickerValue(picker);
        } else {
          var maybeAltHandler = e.altKey && keyMap['Alt' + e.key],
            action = maybeAltHandler || keyMap[e.key];
          if (action && action instanceof Object) {
            action = action[showType];
          }
          if (action) {
            if (showType === 'time' && action.indexOf('toggle') === -1) {
              var arrowElement = picker.widget.find(
                '.timepicker [data-action=' + action + ']'
              );
              $(arrowElement[0]).trigger('click');
            } else {
              var actionEvent = jQuery.Event('doAction', { action: action });
              picker.widget.trigger(actionEvent);
              setDisabledFields(picker);
            }
          }
        }
        if (maybeAltHandler && (e.keyCode === 38 || e.keyCode === 40)) {
          spAriaUtil.sendLiveMessage(
            i18n
              .getMessage('Switching to {0} picker')
              .withValues([spDatePickerUtil.datePickerShowType(picker)])
          );
        }
      }
      if ($rootScope.user && $rootScope.user.date_format)
        dateFormat = $rootScope.user.date_format;
      if ($rootScope.user && $rootScope.user.date_time_format)
        dateTimeFormat = $rootScope.user.date_time_format;
      return {
        template:
          '<div ng-class="{\'sp-date-input-group\': snDisabled, \'input-group\': !snDisabled, \'has-error\': field.isInvalidDateFormat || field.isInvalid}" style="width: 100%;" role="presentation">' +
          '<input id="sp_formfield_{{::field.name}}" aria-live="{{::live}}" aria-hidden="true" aria-label="{{::field.label}} {{formattedDateAria}}" type="text" name="{{field.name}}" class="form-control" placeholder="{{field.placeholder}}" title="{{g_accessibility ? translations[\'Date in format\'] + \' \': \'\'}}{{g_accessibility ? format : \'\'}}" data-placement="top" data-toggle="{{g_accessibility ? \'tooltip\' : undefined}}" ng-model="formattedDate" ng-model-options="{updateOn: \'blur\', getterSetter: true}" ng-readonly="snDisabled" aria-required="{{field.isMandatory()}}" aria-invalid="{{field.isInvalidDateFormat}}"/>' +
          '<span class="input-group-btn" ng-hide="snDisabled">' +
          '<input type="hidden" class="datepickerinput" ng-model="formattedDate" ng-readonly="true" />' +
          '<button class="btn btn-default" type="button" role="button" title="{{::iconAriaLabel}}" aria-label="{{::iconAriaLabel}}" data-toggle="tooltip" data-placement="top" data-container="body">' +
          '<glyph sn-char="calendar" />' +
          '</button>' +
          '</span>' +
          '<span ng-if="field.isInvalidDateFormat" class="sp-date-format-info" style="display:table-row;" aria-hidden="true">{{translations[\'Date in format\']}} {{format}}</span>' +
          '</div>',
        restrict: 'E',
        replace: true,
        require: '?ngModel',
        scope: {
          field: '=',
          snDisabled: '=',
          snIncludeTime: '=',
          snChange: '&',
          snMaxDate: '=',
          snMinDate: '=',
        },
        controller: function ($scope) {
          $scope.live = isSafari ? 'polite' : 'off';
        },
        link: function (scope, element, attrs, ngModel) {
          scope.g_accessibility = spAriaUtil.isAccessibilityEnabled();
          iconAriaLabel = i18n.format(
            translations['Show Calendar for {0}'],
            scope.field.label
          );
          scope.iconAriaLabel = iconAriaLabel;
          var includeTime = scope.snIncludeTime;
          var format,
            isUserEnteredValue = false,
            initDateTimePicker = true;
          var dpValueTouched;
          var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
          format = includeTime ? dateTimeFormat.trim() : dateFormat.trim();
          format = format
            .replace(/y/g, 'Y')
            .replace(/d/g, 'D')
            .replace(/a/g, 'A');
          scope.format = format;
          var config = {
            keepInvalid: true,
            pickTime: scope.snIncludeTime === true,
            format: scope.format,
            locale: spUtil.localeMap[g_lang],
            language: spUtil.localeMap[g_lang],
            maxDate: scope.snMaxDate,
            minDate: scope.snMinDate,
          };
          var dp = element
            .find('.input-group-btn')
            .datetimepicker(config)
            .on('dp.change', onDpChange);
          if (scope.snIncludeTime === true)
            $(element.find('.input-group-btn')).data(
              'DateTimePicker'
            ).initial_value = scope.field.value;
          if (isIE11) {
            angular.element('body').on('click', function (e) {
              var target = e.target;
              var el = angular.element(target);
              if (
                document.activeElement !== target &&
                el.hasClass('form-control')
              )
                target.focus();
            });
          }
          element
            .find('.form-control')
            .on('blur', function (e) {
              var value = e.target.value;
              setFieldValue('newValue', value);
            })
            .on('keyup', function (e) {
              if (e.keyCode === 13) {
                var value = e.target.value;
                setFieldValue('newValue', value);
              } else {
                isUserEnteredValue = true;
              }
            })
            .on('focus', function (e) {
              e.target.removeAttribute('aria-hidden');
            });
          function validate(formattedDate) {
            scope.field.isInvalidDateFormat = false;
            scope.field.isInvalid = false;
            return spDatePickerUtil.validate(
              dp,
              format,
              formattedDate,
              isUserEnteredValue,
              function (error) {
                if (error) {
                  spAriaUtil.sendLiveMessage(
                    scope.translations[
                      'Entered date not valid. Enter date in format'
                    ] +
                      ' ' +
                      format
                  );
                  scope.field.isInvalidDateFormat = true;
                  if (g_datepicker_validation_enable)
                    scope.field.isInvalid = true;
                }
              }
            );
          }
          function closeOnTouch(evt) {
            if (
              !jQuery.contains(dp.data('DateTimePicker').widget[0], evt.target)
            ) {
              dp.data('DateTimePicker').hide();
            }
          }
          function bindTouchClose() {
            (oldDateValue = dp.data('DateTimePicker').date.clone()),
              (oldInputValue = scope.field.isInvalidDateFormat
                ? ''
                : spDatePickerUtil
                    .getSPDateickerInput(dp.data('DateTimePicker'))
                    .val());
            var el = element.find('.form-control');
            el[0].removeAttribute('aria-hidden');
            if (initDateTimePicker) {
              initDateTimePicker = false;
              var picker = dp.data('DateTimePicker');
              attachKeyboardEvent(picker);
              picker.widget
                .find('table.table-condensed')
                .attr('role', 'presentation');
              if (picker.options.pickTime)
                picker.widget
                  .find('.picker-switch.accordion-toggle')
                  .append(
                    '<div class="flex-row cancelok-datetime"><button class="btn cancel">' +
                      i18n.getMessage('Cancel') +
                      '</button><button class="btn ok">' +
                      i18n.getMessage('OK') +
                      '</button></div>'
                  );
              else
                picker.widget.append(
                  '<div class="flex-row cancelok-date"><button class="btn cancel">' +
                    i18n.getMessage('Cancel') +
                    '</button><button class="btn ok">' +
                    i18n.getMessage('OK') +
                    '</button></div>'
                );
              picker.widget.find('.cancel').on('click', function (e) {
                e.stopPropagation();
                cancelDatePickerValue(picker);
              });
              picker.widget.find('.ok').on('click', function (e) {
                e.stopPropagation();
                hidePicker(picker);
              });
            }
            $document.on('touchstart', closeOnTouch);
            attachOnscrollEvent();
            onShowDatePicker(dp.data('DateTimePicker'));
          }
          function unBindTouchClose() {
            dp.data('DateTimePicker')
              .element.find('button')
              .removeClass('calendarbutton-pressed');
            $document.off('touchstart', closeOnTouch);
            detachOnscrollEvent();
          }
          function detachOnscrollEvent() {
            var scrollContainer = $('.sp-scroll');
            if (scrollContainer) {
              $(scrollContainer[0]).off('scroll');
            }
            var containers = $('.sp-row-content > div .panel .panel-body');
            if (containers) {
              for (var i = 0; i < containers.length; i++) {
                $(containers[i]).off('scroll');
              }
            }
          }
          function attachOnscrollEvent() {
            var lazyPlace = _.debounce(onscrollEvt, 100);
            var scrollContainer = $('.sp-scroll');
            if (scrollContainer) {
              $(scrollContainer[0]).scroll(
                lazyPlace.bind(null, scrollContainer[0])
              );
            }
            var containers = $('.sp-row-content > div .panel .panel-body');
            if (containers) {
              for (var i = 0; i < containers.length; i++) {
                $(containers[i]).scroll(lazyPlace.bind(null, containers[i]));
              }
            }
          }
          function onscrollEvt(container) {
            var picker = dp.data('DateTimePicker');
            if (isElementInViewport(picker.element, container)) {
              picker.place(container);
            } else {
              picker.hide();
            }
          }
          function isElementInViewport(el, scrollContainer) {
            if (typeof jQuery === 'function' && el instanceof jQuery) {
              el = el[0];
            }
            var rect = el.getBoundingClientRect(),
              scrollContainerRect = scrollContainer.getBoundingClientRect();
            return (
              rect.top >= scrollContainerRect.top &&
              rect.left >= scrollContainerRect.left &&
              rect.bottom <= scrollContainerRect.bottom &&
              rect.right <= scrollContainerRect.right
            );
          }
          dp.on('dp.show', bindTouchClose).on('dp.hide', unBindTouchClose);
          dp.on('dp.action', function (e) {
            onDpAction(e);
          });
          dp.on('dp.toggle', function (e) {
            onDpToggle(dp.data('DateTimePicker'), e);
          });
          dp.on('dp.hide', function (e) {
            if (ngModel) {
              setFieldValue('newValue', scope.field.stagedValue);
            }
          });
          scope.$on('sp.spFormField.unFocus', function () {
            validate(scope.field.value);
          });
          function onDpChange(e) {
            isUserEnteredValue = false;
            var elem = $(e.target);
            if (
              elem.data('DateTimePicker').initial_value === '' &&
              !dpValueTouched
            )
              reInitializeTime(e, elem);
            var translatedDate = enableDateTranslation
              ? e.date.format(format)
              : e.date.locale('en').format(format);
            scope.formattedDate(translatedDate);
            scope.formattedDateAria = spDatePickerUtil.formattedDate(
              dp.data('DateTimePicker'),
              e.date
            );
            if (!scope.$root.$$phase) scope.$apply();
            onDpChangeAria(e, dp.data('DateTimePicker'), element);
          }
          function reInitializeTime(e, elem) {
            var now = moment();
            e.date.set({
              hour: now.get('hour'),
              minute: now.get('minute'),
              second: now.get('second'),
            });
            elem.data('DateTimePicker').initial_value = null;
          }
          function setFieldValue(key, value) {
            if (scope.snChange) {
              var change = {};
              change[key] = value;
              scope.snChange(change);
            }
          }
          if (ngModel) {
            ngModel.$parsers.push(validate);
            ngModel.$render = function () {
              var formattedDate = ngModel.$viewValue;
              if (
                formattedDate &&
                formattedDate !== null &&
                formattedDate !== ''
              ) {
                dpValueTouched = true;
                if (!spDatePickerUtil.isValidDate(formattedDate, format)) {
                  var validFormattedDate = null;
                  if (enableDateTranslation) {
                    validFormattedDate = moment(
                      formattedDate,
                      format,
                      true
                    ).format(format);
                  } else {
                    validFormattedDate = moment(formattedDate, format, true)
                      .locale('en')
                      .format(format);
                  }
                  if (validFormattedDate !== 'Invalid date') {
                    formattedDate = validFormattedDate;
                  }
                }
              }
              validate(formattedDate);
            };
            scope.formattedDate = function (formattedValue) {
              if (angular.isDefined(formattedValue)) {
                dpValueTouched = true;
                ngModel.$setViewValue(formattedValue);
                setFieldValue('stagedValue', formattedValue);
              }
              var formattedDate = ngModel.$viewValue;
              if (
                formattedDate &&
                formattedDate !== null &&
                formattedDate !== ''
              ) {
                if (!spDatePickerUtil.isValidDate(formattedDate, format)) {
                  var validFormattedDate = null;
                  if (enableDateTranslation) {
                    validFormattedDate = moment(
                      formattedDate,
                      format,
                      true
                    ).format(format);
                  } else {
                    validFormattedDate = moment(formattedDate, format, true)
                      .locale('en')
                      .format(format);
                  }
                  if (validFormattedDate !== 'Invalid date') {
                    formattedDate = validFormattedDate;
                  }
                }
              } else {
                scope.formattedDateAria = '';
              }
              return formattedDate;
            };
          } else {
            scope.formattedDate = function (formattedValue) {
              if (angular.isDefined(formattedValue)) {
                scope.field.value = validate(formattedValue);
                setFieldValue('newValue', formattedValue);
              }
              return scope.field.value;
            };
            scope.$watch('field.value', function (newValue, oldValue) {
              if (newValue != oldValue) validate(newValue);
            });
          }
          var select2Unsubscribe = select2EventBroker.subscribeSelect2Opening(
            function () {
              if ($(dp.data('DateTimePicker').widget[0]).is(':visible'))
                dp.data('DateTimePicker').hide();
            }
          );
          scope.$on('$destroy', function () {
            dp.off('dp.change', onDpChange);
            unBindTouchClose();
            select2Unsubscribe();
            detachKeyboardEvent(dp.data('DateTimePicker'));
          });
          scope.translations = translations;
        },
      };
    }
  );
