/*! RESOURCE: /scripts/libs/bs_tooltip_wrapper.js */
(function () {
  if ($.fn.tooltip.Constructor.prototype !== undefined) {
    var toolTipShow = $.fn.tooltip.Constructor.prototype.show;
    var toolTipHide = $.fn.tooltip.Constructor.prototype.hide;
    var toolTipInit = $.fn.tooltip.Constructor.prototype.init;
    $(window).on('load', function () {
      $('body').on('keydown', function (evt) {
        if (evt.which == 27) {
          var ttElem = $('.tooltip.in');
          if (!ttElem.length) return;
          var targetElem = $('[aria-describedby=' + ttElem.attr('id') + ']');
          if (!targetElem.length) return;
          var ttObj = $(targetElem).data('bs.tooltip');
          if (!ttObj || !ttObj.tip().hasClass('in')) return;
          ttObj.hoverOnTip = false;
          ttObj.inState['override'] = false;
          ttObj.hide();
          evt.stopImmediatePropagation();
          evt.stopPropagation();
        }
      });
    });
    $.fn.tooltip.Constructor.prototype.init = function (
      type,
      element,
      options
    ) {
      toolTipInit.apply(this, arguments);
      var eventClick = 'click' + '.' + this.type;
      this.$element.on(
        eventClick,
        null,
        $.proxy(function () {
          this.hoverOnTip = false;
          this.inState['override'] = false;
          this.hide();
        }, this)
      );
    };
    $.fn.tooltip.Constructor.prototype.show = function () {
      var $element = this.$element;
      var ariaDescribedBy = $element.attr('aria-describedby');
      var ariaDescribedByList = ariaDescribedBy
        ? ariaDescribedBy.split(' ')
        : [];
      toolTipShow.apply(this, arguments);
      var $tip = this.tip();
      if (ariaDescribedByList.length > 0) {
        ariaDescribedByList.push($tip.attr('id'));
        $element.attr('aria-describedby', ariaDescribedByList.join(' '));
      }
      var eventIn = 'mouseenter';
      var eventOut = 'mouseleave';
      var eventBlur = 'blur';
      $tip.off(eventIn + '.' + this.type).off(eventOut + '.' + this.type);
      $tip.on(
        eventIn + '.' + this.type,
        null,
        $.proxy(function () {
          this.hoverOnTip = true;
          this.inState['override'] = true;
        }, this)
      );
      $tip.on(
        eventOut + '.' + this.type,
        null,
        $.proxy(function () {
          this.hoverOnTip = false;
          this.timeout = setTimeout(
            $.proxy(function () {
              this.inState['override'] = false;
              if (!this.$element.is(':hover')) this.hide();
            }, this),
            100
          );
        }, this)
      );
      $element.off(eventBlur + '.' + this.type);
      $element.on(
        eventBlur + '.' + this.type,
        null,
        $.proxy(function () {
          this.hoverOnTip = false;
          this.inState['override'] = false;
          this.hide();
        }, this)
      );
    };
    $.fn.tooltip.Constructor.prototype.hide = function (callback) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(
        $.proxy(function () {
          if (!this.hoverOnTip) {
            var $element = this.$element;
            var ariaDescribedBy = $element.attr('aria-describedby');
            var ariaDescribedByList = ariaDescribedBy
              ? ariaDescribedBy.split(' ')
              : [];
            if (ariaDescribedByList.length > 1)
              $element.off('hidden.bs.tooltip').on(
                'hidden.bs.tooltip',
                null,
                $.proxy(function () {
                  var tipId = this.tip().attr('id');
                  if (ariaDescribedByList.indexOf(tipId) !== -1) {
                    ariaDescribedByList.splice(
                      ariaDescribedByList.indexOf(tipId),
                      1
                    );
                    if (ariaDescribedByList.length)
                      $element.attr(
                        'aria-describedby',
                        ariaDescribedByList.join(' ')
                      );
                    else $element.removeAttr('aria-describedby');
                  }
                }, this)
              );
            this.inState['override'] = false;
            toolTipHide.apply(this, arguments);
          }
        }, this),
        100
      );
    };
  }
})();
