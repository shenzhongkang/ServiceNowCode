/*! RESOURCE: /scripts/reportcommon/hcformatterfuncs.js */
function hc_legendLabelShortenedFormatter() {
  var legendLabelMaxLength =
    this.userOptions !== undefined &&
    this.userOptions.legend_label_max_length !== undefined
      ? this.userOptions.legend_label_max_length
      : 30;
  return this.name.length > legendLabelMaxLength
    ? this.name.substring(0, legendLabelMaxLength) + '...'
    : this.name;
}
function hc_legendLabelPercentFormatter() {
  var label = this.y_tooltip;
  if (
    typeof this.y_formatted !== 'undefined' &&
    (this.chart_type === 'donut' ||
      this.chart_type === 'semi_donut' ||
      this.chart_type === 'pie' ||
      this.chart_type === 'funnel' ||
      this.chart_type === 'pyramid')
  )
    label = this.y_formatted;
  return this.name + ' = ' + label + ' (' + this.percent + '%)';
}
function hc_legendLabelShortenedPercentFormatter() {
  var label = this.y_tooltip;
  if (
    typeof this.y_formatted !== 'undefined' &&
    (this.chart_type === 'donut' ||
      this.chart_type === 'semi_donut' ||
      this.chart_type === 'pie' ||
      this.chart_type === 'funnel' ||
      this.chart_type === 'pyramid')
  )
    label = this.y_formatted;
  var shortenedLabel =
    this.name.length > this.options.legend_label_max_length
      ? this.name.substring(0, this.options.legend_label_max_length) + '...'
      : this.name;
  return shortenedLabel + ' = ' + label + ' (' + this.percent + '%)';
}
function hc_formatNameValueLabel() {
  var label =
    this.point.name +
    ' = ' +
    (typeof this.point.y_tooltip !== 'undefined'
      ? this.point.y_tooltip
      : this.point.y);
  if (
    typeof this.point !== 'undefined' &&
    typeof this.point.y_formatted !== 'undefined' &&
    (this.point.chart_type === 'donut' ||
      this.point.chart_type === 'semi_donut' ||
      this.point.chart_type === 'pie' ||
      this.point.chart_type === 'funnel' ||
      this.point.chart_type === 'pyramid')
  )
    label = this.point.name + ' = ' + this.point.y_formatted;
  var labelMaxLength =
    this.point.data_label_max_length !== undefined
      ? this.point.data_label_max_length
      : 16;
  var truncateLabels =
    this.point.truncate_data_labels !== undefined
      ? this.point.truncate_data_labels
      : 'false';
  var removeLeading =
    this.point.data_labels_remove_leading !== undefined
      ? this.point.data_labels_remove_leading
      : 'false';
  if (truncateLabels === true && label.length > labelMaxLength)
    label =
      removeLeading === true
        ? (label = '...' + label.substring(label.length - labelMaxLength))
        : label.substring(0, labelMaxLength) + '...';
  return label;
}
function hc_formatParetoAxisLabels() {
  var total = 1.0;
  var pcnt = Highcharts.numberFormat(
    (this.value / parseFloat(total)) * 100,
    0,
    '.'
  );
  return pcnt + '%';
}
function hc_formatValueLabel() {
  var legacyLabel =
    typeof this.point.y_tooltip !== 'undefined'
      ? this.point.y_tooltip
      : this.point.y;
  var label =
    typeof this.point !== 'undefined' &&
    typeof this.point.y_formatted !== 'undefined'
      ? this.point.y_formatted
      : legacyLabel;
  var labelMaxLength =
    this.point.data_label_max_length !== undefined
      ? this.point.data_label_max_length
      : 16;
  var truncateLabels =
    this.point.truncate_data_labels !== undefined
      ? this.point.truncate_data_labels
      : 'false';
  var removeLeading =
    this.point.data_labels_remove_leading !== undefined
      ? this.point.data_labels_remove_leading
      : 'false';
  if (truncateLabels === true && label.length > labelMaxLength)
    label =
      removeLeading === true
        ? (label = '...' + label.substring(label.length - labelMaxLength))
        : label.substring(0, labelMaxLength) + '...';
  if (label) return label;
  return undefined;
}
function hc_formatParetoLabelLine() {
  var label = this.point.percent + '%';
  var labelMaxLength =
    this.point.data_label_max_length !== undefined
      ? this.point.data_label_max_length
      : 16;
  var truncateLabels =
    this.point.truncate_data_labels !== undefined
      ? this.point.truncate_data_labels
      : 'false';
  var removeLeading =
    this.point.data_labels_remove_leading !== undefined
      ? this.point.data_labels_remove_leading
      : 'false';
  if (truncateLabels === true && label.length > labelMaxLength)
    label =
      removeLeading === true
        ? (label = '...' + label.substring(label.length - labelMaxLength))
        : label.substring(0, labelMaxLength) + '...';
  return label;
}
function hc_staticDurationFormatting(prepend, secs, i18n) {
  var days = Math.floor(secs / 86400);
  var hours = Math.floor((secs % 86400) / 3600);
  var mins = Math.floor(((secs % 86400) % 3600) / 60);
  secs = ((secs % 86400) % 3600) % 60;
  if (days > 0)
    return (
      prepend +
      days +
      ' ' +
      i18n.days.toLowerCase() +
      ' ' +
      hours +
      ' ' +
      i18n.hours.toLowerCase() +
      ' ' +
      mins +
      ' ' +
      i18n.minutes.toLowerCase() +
      ' ' +
      secs +
      ' ' +
      i18n.seconds.toLowerCase()
    );
  if (hours > 0)
    return (
      prepend +
      hours +
      ' ' +
      i18n.hours.toLowerCase() +
      ' ' +
      mins +
      ' ' +
      i18n.minutes.toLowerCase() +
      ' ' +
      secs +
      ' ' +
      i18n.seconds.toLowerCase()
    );
  if (mins > 0)
    return (
      prepend +
      mins +
      ' ' +
      i18n.minutes.toLowerCase() +
      ' ' +
      secs +
      ' ' +
      i18n.seconds.toLowerCase()
    );
  return prepend + secs + ' ' + i18n.seconds.toLowerCase();
}
function hc_roundHalfUp(value) {
  if (value >= 0) return Math.round(value);
  return value % 0.5 === 0 ? Math.floor(value) : Math.round(value);
}
function hc_roundHalfDown(value) {
  return value % 0.5 === 0
    ? value < 0
      ? Math.round(value)
      : Math.floor(value)
    : Math.round(value);
}
function hc_roundHalfEven(value) {
  if (value % 0.5 !== 0) return Math.round(value);
  return Math.floor(value) % 2 === 0 ? Math.floor(value) : Math.round(value);
}
function hc_roundUp(value) {
  return Math.ceil(value);
}
function hc_roundDown(value) {
  return Math.floor(value);
}
function hc_round(value, roundingMode) {
  this.hc_roundHalfUp = 'hc_roundHalfUp';
  this.hc_roundHalfDown = 'hc_roundHalfDown';
  this.hc_roundHalfEven = 'hc_roundHalfEven';
  this.hc_roundUp = 'hc_roundUp';
  this.hc_roundDown = 'hc_roundDown';
  if (this.axis.userOptions.formatting.isUI)
    this.hc_roundHalfUp = hc_roundHalfUp;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_roundHalfDown = hc_roundHalfDown;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_roundHalfEven = hc_roundHalfEven;
  if (this.axis.userOptions.formatting.isUI) this.hc_roundUp = hc_roundUp;
  if (this.axis.userOptions.formatting.isUI) this.hc_roundDown = hc_roundDown;
  if (roundingMode === 'HALF_UP') return this.hc_roundHalfUp(value);
  if (roundingMode === 'HALF_DOWN') return this.hc_roundHalfDown(value);
  if (roundingMode === 'HALF_EVEN') return this.hc_roundHalfEven(value);
  if (roundingMode === 'UP') return this.hc_roundUp(value);
  if (roundingMode === 'DOWN') return this.hc_roundDown(value);
  return this.hc_roundDown(value);
}
function hc_applyCarryOverToHour(duration) {
  duration.mins = 0;
  duration.hours = duration.hours + 1;
}
function hc_applyCarryOverToDay(duration) {
  duration.hours = 0;
  duration.days = duration.days + 1;
}
function hc_applyRounding(combined, originalSecs, durationProperties) {
  this.hc_round = 'hc_round';
  this.hc_applyCarryOverToHour = 'hc_applyCarryOverToHour';
  this.hc_applyCarryOverToDay = 'hc_applyCarryOverToDay';
  if (this.axis.userOptions.formatting.isUI) this.hc_round = hc_round;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_applyCarryOverToHour = hc_applyCarryOverToHour;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_applyCarryOverToDay = hc_applyCarryOverToDay;
  var result = new Object();
  result.days = combined && combined.days ? combined.days : 0;
  result.hours = combined && combined.hours ? combined.hours : 0;
  result.mins = combined && combined.mins ? combined.mins : 0;
  result.secs = combined && combined.secs ? combined.secs : 0;
  if (
    durationProperties.maximumUnit ===
      this.axis.userOptions.formatting.timeUnits.DAY.value &&
    durationProperties.minimumUnit ===
      this.axis.userOptions.formatting.timeUnits.MINUTE.value
  )
    result.mins = this.hc_round(
      ((originalSecs % 86400) % 3600) / 60.0,
      durationProperties.roundingMode
    );
  else if (
    durationProperties.maximumUnit ===
      this.axis.userOptions.formatting.timeUnits.HOUR.value &&
    durationProperties.minimumUnit ===
      this.axis.userOptions.formatting.timeUnits.MINUTE.value
  )
    result.mins = this.hc_round(
      (originalSecs % 3600) / 60.0,
      durationProperties.roundingMode
    );
  else if (
    durationProperties.maximumUnit ===
      this.axis.userOptions.formatting.timeUnits.MINUTE.value &&
    durationProperties.minimumUnit ===
      this.axis.userOptions.formatting.timeUnits.MINUTE.value
  )
    result.mins = this.hc_round(
      originalSecs / 60.0,
      durationProperties.roundingMode
    );
  else if (
    durationProperties.maximumUnit ===
      this.axis.userOptions.formatting.timeUnits.DAY.value &&
    durationProperties.minimumUnit ===
      this.axis.userOptions.formatting.timeUnits.HOUR.value
  )
    result.hours = this.hc_round(
      (originalSecs % 86400) / 3600.0,
      durationProperties.roundingMode
    );
  else if (
    durationProperties.maximumUnit ===
      this.axis.userOptions.formatting.timeUnits.HOUR.value &&
    durationProperties.minimumUnit ===
      this.axis.userOptions.formatting.timeUnits.HOUR.value
  )
    result.hours = this.hc_round(
      originalSecs / 3600.0,
      durationProperties.roundingMode
    );
  else if (result.days)
    result.days = this.hc_round(
      originalSecs / 86400.0,
      durationProperties.roundingMode
    );
  if (
    result.mins === 60 &&
    (durationProperties.maxUnit === 'HOUR' ||
      durationProperties.maxUnit === 'DAY')
  )
    this.hc_applyCarryOverToHour(result);
  if (result.hours === 24 && durationProperties.maxUnit === 'DAY')
    this.hc_applyCarryOverToDay(result);
  return result;
}
function hc_calculateDhms(secs) {
  var days = Math.floor(secs / 86400);
  var hours = Math.floor((secs % 86400) / 3600);
  var mins = Math.floor(((secs % 86400) % 3600) / 60);
  secs = ((secs % 86400) % 3600) % 60;
  var value = new Object();
  value.days = days ? days : 0;
  value.hours = hours ? hours : 0;
  value.mins = mins ? mins : 0;
  value.secs = secs ? secs : 0;
  return value;
}
function hc_calculateHms(secs) {
  var hours = Math.floor(secs / 3600);
  var mins = Math.floor((secs % 3600) / 60);
  secs = (secs % 3600) % 60;
  var value = new Object();
  value.hours = hours;
  value.mins = mins;
  value.secs = secs;
  return value;
}
function hc_calculateMs(secs) {
  var mins = Math.floor(secs / 60);
  secs = ((secs % 86400) % 3600) % 60;
  var value = new Object();
  value.mins = mins;
  value.secs = secs;
  return value;
}
function hc_toolTipped(prepend, originalSecs, i18n, value) {
  return (
    '<div title="' +
    hc_staticDurationFormatting(prepend, originalSecs, i18n) +
    '">' +
    value +
    '</div>'
  );
}
function hc_formatDurationLabel() {
  var secs = this.value;
  var prepend = '';
  if (secs < 0) prepend = '-';
  if (secs < 0) secs *= -1;
  var originalSecs = secs;
  var i18n = this.chart.options.lang;
  var durationFormattingProperties;
  this.hc_staticDurationFormatting = 'hc_staticDurationFormatting';
  this.hc_calculateDhms = 'hc_calculateDhms';
  this.hc_calculateHms = 'hc_calculateHms';
  this.hc_calculateMs = 'hc_calculateMs';
  this.hc_applyRounding = 'hc_applyRounding';
  if (this.axis.userOptions.formatting.isUI)
    this.hc_staticDurationFormatting = hc_staticDurationFormatting;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_calculateDhms = hc_calculateDhms;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_calculateHms = hc_calculateHms;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_calculateMs = hc_calculateMs;
  if (this.axis.userOptions.formatting.isUI)
    this.hc_applyRounding = hc_applyRounding;
  if (
    this.axis.userOptions.formatting &&
    this.axis.userOptions.formatting.formattingConfiguration &&
    this.axis.userOptions.formatting.formattingConfiguration
      .durationFormattingProperties
  )
    durationFormattingProperties =
      this.axis.userOptions.formatting.formattingConfiguration
        .durationFormattingProperties;
  else if (
    !this.axis.userOptions.formatting ||
    !this.axis.userOptions.formatting.formattingConfiguration ||
    !this.axis.userOptions.formatting.formattingConfiguration
      .durationFormattingProperties
  )
    return this.hc_staticDurationFormatting(prepend, secs, i18n);
  var durationProperties =
    durationFormattingProperties[
      this.axis.userOptions.formatting.aggField + ',AGGREGATION'
    ];
  if (!durationProperties)
    return this.hc_staticDurationFormatting(prepend, secs, i18n);
  var formattedValue = '';
  var daysString = durationProperties.shortNotation
    ? i18n.days_short
    : i18n.days;
  var hoursString = durationProperties.shortNotation
    ? i18n.hours_short
    : i18n.hours;
  var minutesString = durationProperties.shortNotation
    ? i18n.minutes_short
    : i18n.minutes;
  var secondsString = durationProperties.shortNotation
    ? i18n.seconds_short
    : i18n.seconds;
  var orderOfMinimum =
    this.axis.userOptions.formatting.timeUnits[durationProperties.minimumUnit]
      .order;
  var orderOfMaximum =
    this.axis.userOptions.formatting.timeUnits[durationProperties.maximumUnit]
      .order;
  var combined = new Object();
  combined.days = 0;
  combined.hours = 0;
  combined.mins = 0;
  combined.secs = secs;
  if (
    durationProperties.maximumUnit ===
    this.axis.userOptions.formatting.timeUnits.DAY.value
  )
    combined = this.hc_calculateDhms(secs);
  else if (
    durationProperties.maximumUnit ===
    this.axis.userOptions.formatting.timeUnits.HOUR.value
  )
    combined = this.hc_calculateHms(secs);
  else if (
    durationProperties.maximumUnit ===
    this.axis.userOptions.formatting.timeUnits.MINUTE.value
  )
    combined = this.hc_calculateMs(secs);
  if (
    this.axis.userOptions.formatting.timeUnits.SECOND.order !== orderOfMinimum
  )
    combined = this.hc_applyRounding(
      combined,
      originalSecs,
      durationProperties
    );
  if (
    this.axis.userOptions.formatting.timeUnits.DAY.order <= orderOfMinimum &&
    this.axis.userOptions.formatting.timeUnits.DAY.order >= orderOfMaximum
  )
    formattedValue += combined.days + ' ' + daysString + ' ';
  if (
    this.axis.userOptions.formatting.timeUnits.HOUR.order <= orderOfMinimum &&
    this.axis.userOptions.formatting.timeUnits.HOUR.order >= orderOfMaximum
  )
    formattedValue += combined.hours + ' ' + hoursString + ' ';
  if (
    this.axis.userOptions.formatting.timeUnits.MINUTE.order <= orderOfMinimum &&
    this.axis.userOptions.formatting.timeUnits.MINUTE.order >= orderOfMaximum
  )
    formattedValue += combined.mins + ' ' + minutesString + ' ';
  if (
    durationProperties.hideSecondsAfter1Minute &&
    this.axis.userOptions.formatting.timeUnits.SECOND.order <= orderOfMinimum &&
    this.axis.userOptions.formatting.timeUnits.SECOND.order >= orderOfMaximum &&
    combined.mins === 0
  )
    formattedValue += combined.secs + ' ' + secondsString + ' ';
  else if (
    !durationProperties.hideSecondsAfter1Minute &&
    this.axis.userOptions.formatting.timeUnits.SECOND.order <= orderOfMinimum &&
    this.axis.userOptions.formatting.timeUnits.SECOND.order >= orderOfMaximum
  )
    formattedValue += combined.secs + ' ' + secondsString + ' ';
  var value = prepend + formattedValue;
  return value;
}
