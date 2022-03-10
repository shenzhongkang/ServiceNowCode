/*! RESOURCE: /scripts/textAreaCharCount.js */
addAfterPageLoadedEvent(function () {
  var textAreas = $$("textarea[data-charLimit='true']");
  if (textAreas.length > 0) {
    textAreas.each(function (element) {
      if (!$(element).hasClassName('htmlField')) {
        var elementId = $(element).readAttribute('id');
        element.charCounter({
          allowed: parseInt($(element).readAttribute('data-length')),
          warning: 20,
          elementId: elementId,
        });
      }
    });
  }
});
