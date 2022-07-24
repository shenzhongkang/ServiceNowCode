/*! RESOURCE: /scripts/reportcommon/additional_groupby.js */
function hasAdditionalGroupBy(type) {
  return !(
    type === 'hist' ||
    type === 'pivot' ||
    type === 'heatmap' ||
    type === 'pivot_v2' ||
    type === 'calendar' ||
    type === 'control' ||
    type === 'availability' ||
    type === 'angular_gauge' ||
    type === 'solid_gauge' ||
    type === 'gauge' ||
    type === 'single_score' ||
    type === 'map'
  );
}
function checkAndEnableInteractiveFilters(chartData, args) {
  var isMultiSeries = false;
  if ('report_properties' in chartData)
    isMultiSeries = chartData.series.length > 1;
  var $interactiveContainer = jQuery(
    '#interactive-container-' + args.report_uuid
  );
  var msgIntoAdditionalGroupByPopup = document.getElementById(
    'msg_additional_group_by'
  );
  if (isMultiSeries) {
    if ($interactiveContainer.length) $interactiveContainer.hide();
    if (msgIntoAdditionalGroupByPopup) msgIntoAdditionalGroupByPopup.show();
  } else {
    if (msgIntoAdditionalGroupByPopup) msgIntoAdditionalGroupByPopup.hide();
    if ($interactiveContainer.length)
      constructInteractiveFilters(
        chartData.series[0].additional_groupby,
        args,
        $interactiveContainer
      );
  }
}
function constructInteractiveFilters(
  additionalGroupBy,
  args,
  $interactiveContainer
) {
  var $stackBySelect;
  $interactiveContainer.append(
    '<div class="additional-groupby-label">' +
      '<label for="additional-groupby-' +
      args.report_uuid +
      '" id="additional-groupby-label" title="' +
      window.chartHelpers.i18n.groupByTitle +
      '">' +
      window.chartHelpers.i18n.groupBy +
      '</label>' +
      '</div>'
  );
  var $groupByContainer = jQuery('<div class="additional-groupby-select"/>');
  $interactiveContainer.append($groupByContainer);
  var $groupBySelect = jQuery(
    '<select id="additional-groupby-' +
      args.report_uuid +
      '" name="additional-groupby" class="form-control interactive"/>'
  );
  createAdditionalOptions(
    $groupBySelect,
    additionalGroupBy.list,
    additionalGroupBy.original_group_by,
    additionalGroupBy.original_stack_by,
    args.group_by,
    hasNone(args.chart_type)
  );
  if (isBarType(args.chart_type)) {
    var originalGroupBy = additionalGroupBy.original_group_by_can_be_stacked
      ? additionalGroupBy.original_group_by
      : null;
    $stackBySelect = jQuery(
      '<select id="additional-stackby-' +
        args.report_uuid +
        '" name="additional-stackby" class="form-control interactive"/>'
    );
    createAdditionalOptions(
      $stackBySelect,
      additionalGroupBy.stackby_list,
      additionalGroupBy.original_stack_by,
      originalGroupBy,
      args.stacked_field,
      true
    );
  }
  $groupBySelect.change(function groupBySelectChangeCallback() {
    applyExecutiveReport(
      args.report_id,
      $groupBySelect,
      $stackBySelect,
      JSON.parse(args.chart_params).interactive_filter
    );
  });
  $groupByContainer.append($groupBySelect);
  if ($stackBySelect) {
    $interactiveContainer.append(
      '<div class="additional-stackby-label">' +
        '<label for="additional-stackby-' +
        args.report_uuid +
        '" id="additional-stackby-label" title="' +
        window.chartHelpers.i18n.stackByTitle +
        '">' +
        window.chartHelpers.i18n.stackBy +
        '</label>' +
        '</div>'
    );
    var $stackByContainer = jQuery('<div class="additional-groupby-select"/>');
    $interactiveContainer.append($stackByContainer);
    $stackBySelect.change(function stackBySelectChangeCallback() {
      applyExecutiveReport(
        args.report_id,
        $groupBySelect,
        $stackBySelect,
        JSON.parse(args.chart_params).interactive_filter
      );
    });
    $stackByContainer.append($stackBySelect);
  }
}
function createAdditionalOptions(
  $select,
  choices,
  originalGrouping,
  otherGrouping,
  selectedValue,
  hasNoneOption
) {
  var option;
  if (hasNoneOption) {
    option = new Option(window.chartHelpers.i18n.none, '');
    $select.append(jQuery(option));
  }
  if (originalGrouping) {
    option = new Option(originalGrouping.label, originalGrouping.value);
    $select.append(jQuery(option));
  }
  for (var i = 0; i < choices.length; ++i) {
    option = new Option(choices[i].label, choices[i].value);
    $select.append(jQuery(option));
  }
  if (
    otherGrouping &&
    !$select.children("option[value='" + otherGrouping.value + "']").length
  ) {
    option = new Option(otherGrouping.label, otherGrouping.value);
    $select.append(jQuery(option));
  }
  if (
    selectedValue &&
    selectedValue.indexOf('variables') > -1 &&
    selectedValue.split('.').length - 1 == 2
  )
    selectedValue = selectedValue.replace(/\..*\./, '.');
  if (selectedValue === 'variables') $select.val($select.children()[0].value);
  else $select.val(selectedValue);
}
function hasNone(type) {
  return (
    type === 'list' ||
    type === 'bubble' ||
    type === 'trend' ||
    type === 'line' ||
    type === 'step_line' ||
    type === 'line_bar' ||
    type === 'area' ||
    type === 'spline'
  );
}
