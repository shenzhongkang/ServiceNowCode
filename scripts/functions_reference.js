/*! RESOURCE: /scripts/functions_reference.js */
function updateAndFlip(select, elementName) {
  var option = setSelectValue(select, elementName);
  onChange(elementName);
  refFlipImage(option, elementName);
}
function setSelectValue(select, elementName) {
  elementName = elementName || '';
  if (elementName.indexOf('sys_select.') === 0)
    elementName = elementName.replace('sys_select.', '');
  var value = '';
  var text = '';
  var option;
  if (select.selectedIndex != -1) {
    option = select.options[select.selectedIndex];
    value = option.value;
    text = option.text;
  }
  var id = gel(elementName);
  id.value = value;
  var idd = gel('sys_display.' + elementName);
  if (value == '') idd.value = '';
  else idd.value = text;
  return option;
}
function refFlipImage(element, elementName, useText) {
  if (typeof g_form !== 'undefined' && !g_form.isFieldVisible(elementName))
    return;
  var viewField = gel('view.' + elementName);
  var viewRField = gel('viewr.' + elementName);
  var viewHideField = gel('view.' + elementName + '.no');
  var refid = gel(elementName);
  var value = element.value;
  if (!value) {
    hideObject(viewField);
    hideObject(viewRField);
    showObjectInline(viewHideField);
  } else {
    if (isDoctype()) {
      showObjectInlineBlock(viewField);
      showObjectInlineBlock(viewRField);
    } else {
      showObjectInline(viewField);
      showObjectInline(viewRField);
    }
    hideObject(viewHideField);
  }
}
function refFlipImageDisplay(element, dsp) {
  if (element) element.style.display = dsp;
}
function derivedFromChoiceListHasValue(elementName) {
  var parentName = elementName.substring(0, elementName.lastIndexOf('.'));
  if (parentName.indexOf('.') < 0) return false;
  var parent = gel(parentName);
  if (!parent || parent.getAttribute('choice') !== '3') return false;
  return !!parent.value || derivedFromChoiceListHasValue(parentName);
}
function emptyWithoutNoneRefChoiceListOnLoadHandler(elementName) {
  var element = gel(elementName);
  if (!element || !element.value) return;
  if (!derivedFromChoiceListHasValue(elementName)) {
    refFlipImage(element, elementName);
    onSelChange(elementName);
  }
}
