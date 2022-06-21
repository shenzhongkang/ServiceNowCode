/*! RESOURCE: /scripts/libs/select2wrapper.js */
(function () {
  if (window.Select2 !== undefined) {
    var initSelect2 = window.Select2.class.abstract.prototype.init;
    var searchingMsg = '';
    angular.element(document).ready(function () {
      var i18n = angular.element('*[ng-app]').injector().get('i18n');
      searchingMsg = i18n.getMessage('Searching...');
    });
    window.Select2.class.single.prototype.init = function (opts) {
      var self = this;
      initSelect2.call(this, opts);
      this.opts.element.attr('aria-hidden', 'true');
      this.selection.off('touchstart');
      this.opts.element.on('$destroy', function () {
        self.opts.element.select2('destroy');
      });
      this.opts.element.on('select2-open', function () {
        if (!self.dropdown) return;
        var ddInput = self.dropdown.find('input');
        var acVal = ddInput.attr('aria-activedescendant');
        var lrText = self.liveRegion.text();
        if (lrText !== searchingMsg) self.liveRegion.text('');
        ddInput.removeAttr('aria-activedescendant');
        setTimeout(function () {
          ddInput.attr('aria-activedescendant', acVal);
          if (lrText !== searchingMsg) self.liveRegion.text(lrText);
        }, 500);
      });
      this.opts.element.on('select2-close', function () {
        if (!self.dropdown) return;
        var ddInput = self.dropdown.find('input');
        ddInput.removeAttr('aria-activedescendant');
      });
    };
    var highlightSelect2 = window.Select2.class.abstract.prototype.highlight;
    window.Select2.class.single.prototype.highlight =
      window.Select2.class.multi.prototype.highlight = highlightWrapper;
  }
  function highlightWrapper(index) {
    if (typeof index !== 'undefined') highlightSelect2.call(this, index);
    else return highlightSelect2.call(this);
    this.liveRegion.text('');
  }
})();
