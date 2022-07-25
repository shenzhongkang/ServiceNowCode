/*! RESOURCE: /scripts/heisenberg/bootstrap/tooltip.js */
+(function ($) {
  'use strict';
  var DISALLOWED_ATTRIBUTES = ['sanitize', 'whiteList', 'sanitizeFn'];
  var uriAttrs = [
    'background',
    'cite',
    'href',
    'itemtype',
    'longdesc',
    'poster',
    'src',
    'xlink:href',
  ];
  var ARIA_ATTRIBUTE_PATTERN = /^aria-[\w-]*$/i;
  var DefaultWhitelist = {
    '*': ['class', 'dir', 'id', 'lang', 'role', ARIA_ATTRIBUTE_PATTERN],
    a: ['target', 'href', 'title', 'rel'],
    area: [],
    b: [],
    br: [],
    col: [],
    code: [],
    div: [],
    em: [],
    hr: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    i: [],
    img: ['src', 'alt', 'title', 'width', 'height'],
    li: [],
    ol: [],
    p: [],
    pre: [],
    s: [],
    small: [],
    span: [],
    sub: [],
    sup: [],
    strong: [],
    u: [],
    ul: [],
  };
  var SAFE_URL_PATTERN =
    /^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi;
  var DATA_URL_PATTERN =
    /^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;
  function allowedAttribute(attr, allowedAttributeList) {
    var attrName = attr.nodeName.toLowerCase();
    if ($.inArray(attrName, allowedAttributeList) !== -1) {
      if ($.inArray(attrName, uriAttrs) !== -1) {
        return Boolean(
          attr.nodeValue.match(SAFE_URL_PATTERN) ||
            attr.nodeValue.match(DATA_URL_PATTERN)
        );
      }
      return true;
    }
    var regExp = $(allowedAttributeList).filter(function (index, value) {
      return value instanceof RegExp;
    });
    for (var i = 0, l = regExp.length; i < l; i++) {
      if (attrName.match(regExp[i])) {
        return true;
      }
    }
    return false;
  }
  function sanitizeHtml(unsafeHtml, whiteList, sanitizeFn) {
    if (unsafeHtml.length === 0) {
      return unsafeHtml;
    }
    if (sanitizeFn && typeof sanitizeFn === 'function') {
      return sanitizeFn(unsafeHtml);
    }
    if (
      !document.implementation ||
      !document.implementation.createHTMLDocument
    ) {
      return unsafeHtml;
    }
    var createdDocument =
      document.implementation.createHTMLDocument('sanitization');
    createdDocument.body.innerHTML = unsafeHtml;
    var whitelistKeys = $.map(whiteList, function (el, i) {
      return i;
    });
    var elements = $(createdDocument.body).find('*');
    for (var i = 0, len = elements.length; i < len; i++) {
      var el = elements[i];
      var elName = el.nodeName.toLowerCase();
      if ($.inArray(elName, whitelistKeys) === -1) {
        el.parentNode.removeChild(el);
        continue;
      }
      var attributeList = $.map(el.attributes, function (el) {
        return el;
      });
      var whitelistedAttributes = [].concat(
        whiteList['*'] || [],
        whiteList[elName] || []
      );
      for (var j = 0, len2 = attributeList.length; j < len2; j++) {
        if (!allowedAttribute(attributeList[j], whitelistedAttributes)) {
          el.removeAttribute(attributeList[j].nodeName);
        }
      }
    }
    return createdDocument.body.innerHTML;
  }
  var Tooltip = function (element, options) {
    this.type =
      this.options =
      this.enabled =
      this.timeout =
      this.hoverState =
      this.orphanCheck =
      this.$element =
        null;
    this.init('tooltip', element, options);
  };
  Tooltip.VERSION = '3.2.0';
  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template:
      '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner" style="overflow-wrap: break-word;"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0,
    },
    sanitize: false,
    sanitizeFn: null,
    whiteList: DefaultWhitelist,
  };
  Tooltip.prototype.init = function (type, element, options) {
    this.enabled = true;
    this.type = type;
    this.$element = $(element);
    this.options = this.getOptions(options);
    var viewport =
      this.options.viewport &&
      (this.options.viewport.selector || this.options.viewport);
    viewport = viewport === '#' ? [] : viewport;
    this.$viewport = this.options.viewport && $(document).find(viewport);
    var triggers = this.options.trigger.split(' ');
    for (var i = triggers.length; i--; ) {
      var trigger = triggers[i];
      if (trigger == 'click') {
        this.$element.on(
          'click.' + this.type,
          this.options.selector,
          $.proxy(this.toggle, this)
        );
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin';
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout';
        this.$element.on(
          eventIn + '.' + this.type,
          this.options.selector,
          $.proxy(this.enter, this)
        );
        this.$element.on(
          eventOut + '.' + this.type,
          this.options.selector,
          $.proxy(this.leave, this)
        );
      }
    }
    this.options.selector
      ? (this._options = $.extend({}, this.options, {
          trigger: 'manual',
          selector: '',
        }))
      : this.fixTitle();
  };
  Tooltip.prototype.getDefaults = function () {
    return Tooltip.DEFAULTS;
  };
  Tooltip.prototype.getOptions = function (options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options);
    var dataAttributes = this.$element.data();
    for (var dataAttr in dataAttributes) {
      if (
        dataAttributes.hasOwnProperty(dataAttr) &&
        $.inArray(dataAttr, DISALLOWED_ATTRIBUTES) !== -1
      ) {
        delete dataAttributes[dataAttr];
      }
    }
    options = $.extend({}, this.getDefaults(), dataAttributes, options);
    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay,
      };
    }
    if (options.sanitize) {
      options.template = sanitizeHtml(
        options.template,
        options.whiteList,
        options.sanitizeFn
      );
    }
    return options;
  };
  Tooltip.prototype.getDelegateOptions = function () {
    var options = {};
    var defaults = this.getDefaults();
    this._options &&
      $.each(this._options, function (key, value) {
        if (defaults[key] != value) options[key] = value;
      });
    return options;
  };
  Tooltip.prototype.enter = function (obj) {
    var self =
      obj instanceof this.constructor
        ? obj
        : $(obj.currentTarget).data('bs.' + this.type);
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }
    clearTimeout(self.timeout);
    clearInterval(self.orphanCheck);
    self.hoverState = 'in';
    if (!self.options.delay || !self.options.delay.show) return self.show();
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'in') self.show();
    }, self.options.delay.show);
    self.orphanCheck = setInterval(function () {
      if (self.$element && !self.$element.is(':visible')) {
        self.hide();
        clearInterval(self.orphanCheck);
      }
    }, 1000);
  };
  Tooltip.prototype.leave = function (obj) {
    var self =
      obj instanceof this.constructor
        ? obj
        : $(obj.currentTarget).data('bs.' + this.type);
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions());
      $(obj.currentTarget).data('bs.' + this.type, self);
    }
    clearTimeout(self.timeout);
    clearInterval(self.orphanCheck);
    self.hoverState = 'out';
    if (!self.options.delay || !self.options.delay.hide) return self.hide();
    self.timeout = setTimeout(function () {
      if (self.hoverState == 'out') self.hide();
    }, self.options.delay.hide);
  };
  Tooltip.prototype.show = function () {
    var e = $.Event('show.bs.' + this.type);
    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e);
      var inDom = $.contains(document.documentElement, this.$element[0]);
      if (e.isDefaultPrevented() || !inDom) return;
      var that = this;
      var $tip = this.tip();
      var tipId = this.getUID(this.type);
      this.setContent();
      $tip.attr('id', tipId);
      if (this.options.omitAriaDescribedby !== true)
        this.$element.attr('aria-describedby', tipId);
      if (this.options.animation) $tip.addClass('fade');
      var placement =
        typeof this.options.placement == 'function'
          ? this.options.placement.call(this, $tip[0], this.$element[0])
          : this.options.placement;
      var autoToken = /\s?auto?\s?/i;
      var autoPlace = autoToken.test(placement);
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top';
      $tip
        .detach()
        .css({ top: 0, left: 0, display: 'block' })
        .addClass(placement)
        .data('bs.' + this.type, this);
      this.options.container
        ? $tip.appendTo(
            $(document).find(
              this.options.container === '#' ? [] : this.options.container
            )
          )
        : $tip.insertAfter(this.$element);
      var pos = this.getPosition();
      var actualWidth = $tip[0].offsetWidth;
      var actualHeight = $tip[0].offsetHeight;
      if (autoPlace) {
        var orgPlacement = placement;
        var $container = this.options.container
          ? $(
              $(document).find(
                this.options.container === '#' ? [] : this.options.container
              )
            )
          : this.$element.parent();
        var containerDim = this.getPosition($container);
        placement =
          placement == 'bottom' &&
          pos.top + pos.height + actualHeight - containerDim.scroll >
            containerDim.height
            ? 'top'
            : placement == 'top' &&
              pos.top - containerDim.scroll - actualHeight < containerDim.top
            ? 'bottom'
            : placement == 'right' &&
              pos.right + actualWidth > containerDim.width
            ? 'left'
            : placement == 'left' && pos.left - actualWidth < containerDim.left
            ? 'right'
            : placement;
        $tip.removeClass(orgPlacement).addClass(placement);
      }
      var calculatedOffset = this.getCalculatedOffset(
        placement,
        pos,
        actualWidth,
        actualHeight
      );
      this.applyPlacement(calculatedOffset, placement);
      var complete = function () {
        var prevHoverState = that.hoverState;
        that.$element.trigger('shown.bs.' + that.type);
        that.hoverState = null;
        if (prevHoverState == 'out') that.leave(that);
      };
      $.support.transition && this.$tip.hasClass('fade')
        ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(150)
        : complete();
    }
  };
  Tooltip.prototype.applyPlacement = function (offset, placement) {
    var $tip = this.tip();
    var width = $tip[0].offsetWidth;
    var height = $tip[0].offsetHeight;
    var marginTop = parseInt($tip.css('margin-top'), 10);
    var marginLeft = parseInt($tip.css('margin-left'), 10);
    if (isNaN(marginTop)) marginTop = 0;
    if (isNaN(marginLeft)) marginLeft = 0;
    offset.top = offset.top + marginTop;
    offset.left = offset.left + marginLeft;
    var viewportDimensions = this.getPosition(this.$viewport);
    $.offset.setOffset(
      $tip[0],
      $.extend(
        {
          using: function (props) {
            $tip.css({
              top: Math.round(props.top),
              left: Math.round(props.left),
              width: width + 1,
            });
          },
        },
        offset
      ),
      0
    );
    $tip.addClass('in');
    var actualWidth = $tip[0].offsetWidth;
    var actualHeight = $tip[0].offsetHeight;
    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight;
    }
    var delta = this.getViewportAdjustedDelta(
      placement,
      offset,
      actualWidth,
      actualHeight,
      viewportDimensions
    );
    var isVertical = /top|bottom/.test(placement);
    if (isVertical && this.options && this.options.container) {
      var $container = this.$element.closest(this.options.container);
      const isContainerSameAsViewport =
        this.$viewport && this.$viewport[0] === $container[0];
      if ($container.length && !isContainerSameAsViewport) {
        var containerDim = this.getPosition($container);
        var tooltipExtraLengthAfterThisEle =
          (actualWidth - this.getPosition().width) / 2;
        var deltaRWithRespectToContainer =
          this.getPosition().right +
          tooltipExtraLengthAfterThisEle -
          (containerDim.left + containerDim.width);
        var deltaLWithRespectToContainer =
          containerDim.left -
          (this.getPosition().left - tooltipExtraLengthAfterThisEle);
        if (deltaRWithRespectToContainer > 0) {
          if (delta.left <= 0) {
            if (Math.abs(delta.left) < deltaRWithRespectToContainer) {
              delta.left = -deltaRWithRespectToContainer;
            }
          }
        }
        if (deltaLWithRespectToContainer > 0) {
          if (delta.left >= 0) {
            if (Math.abs(delta.left) < deltaLWithRespectToContainer) {
              delta.left = deltaLWithRespectToContainer;
            }
          }
        }
      }
    }
    if (delta.left) offset.left += delta.left;
    else offset.top += delta.top;
    var arrowDelta = isVertical
      ? delta.left * 2 - width + actualWidth
      : delta.top * 2 - height + actualHeight;
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight';
    $tip.offset(offset);
    this.replaceArrow(
      arrowDelta,
      $tip[0][arrowOffsetPosition],
      isVertical,
      viewportDimensions
    );
  };
  Tooltip.prototype.replaceArrow = function (
    delta,
    dimension,
    isHorizontal,
    viewportDimensions
  ) {
    var $arrow = this.arrow();
    if ($arrow.length === 0) return;
    $arrow
      .css(isHorizontal ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isHorizontal ? 'right' : 'bottom', 'auto')
      .css(isHorizontal ? 'top' : 'left', '');
    if (!viewportDimensions) return;
    var arrPostion = $arrow.position();
    var arrowLeft = arrPostion.left;
    var arrowTop = arrPostion.right;
    var tipWidth = this.$tip[0].offsetWidth;
    var arrowWidth = $arrow[0].offsetWidth;
    var arrowMarginLeft = parseInt($arrow.css('margin-left'), 10);
    var tipBorderRadius = parseInt(this.$tip.css('border-radius'), 10);
    var arrowRight = arrowLeft + arrowWidth + arrowMarginLeft;
    var scrollBarWidth = viewportDimensions.scrollbarWidth;
    if (isHorizontal && tipWidth > arrowWidth) {
      if (arrowLeft < arrowWidth / 2 + tipBorderRadius)
        arrowLeft = arrowWidth / 2 + tipBorderRadius;
      else if (arrowRight > tipWidth)
        arrowLeft = tipWidth - arrowWidth / 2 - tipBorderRadius;
      arrowLeft = arrowLeft - (arrowMarginLeft + arrowWidth / 2);
      $arrow.css('right', 'auto').css('left', arrowLeft).css('top', arrowTop);
    } else if (isHorizontal && tipWidth < arrowWidth) {
      $arrow.css('margin-bottom', tipBorderRadius);
    }
  };
  Tooltip.prototype.setContent = function () {
    var $tip = this.tip();
    var title = this.getTitle();
    if (this.options.html) {
      if (this.options.sanitize) {
        title = sanitizeHtml(
          title,
          this.options.whiteList,
          this.options.sanitizeFn
        );
      }
      $tip.find('.tooltip-inner').html(title);
    } else {
      $tip.find('.tooltip-inner').text(title);
    }
    $tip.removeClass('fade in top bottom left right');
  };
  Tooltip.prototype.hide = function (callback) {
    var that = this;
    var $tip = this.tip();
    var e = $.Event('hide.bs.' + this.type);
    function complete() {
      if (that.hoverState != 'in') $tip.detach();
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type);
      callback && callback();
    }
    this.$element.trigger(e);
    if (e.isDefaultPrevented()) return;
    $tip.removeClass('in');
    $.support.transition && this.$tip.hasClass('fade')
      ? $tip.one('bsTransitionEnd', complete).emulateTransitionEnd(150)
      : complete();
    this.hoverState = null;
    return this;
  };
  Tooltip.prototype.fixTitle = function () {
    var $e = this.$element;
    if ($e.attr('title') || typeof $e.attr('data-original-title') != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '');
    }
  };
  Tooltip.prototype.hasContent = function () {
    return this.getTitle();
  };
  Tooltip.prototype.getPosition = function ($element) {
    $element = $element || this.$element;
    var el = $element[0];
    var isBody = el.tagName == 'BODY';
    var viewPortScrollOffset = document.viewport
      ? document.viewport.getScrollOffsets()
      : { left: 0, right: 0 };
    return $.extend(
      {},
      typeof el.getBoundingClientRect == 'function'
        ? el.getBoundingClientRect()
        : null,
      {
        scroll: isBody
          ? document.documentElement.scrollTop || document.body.scrollTop
          : $element.scrollTop(),
        width: isBody
          ? document.documentElement.scrollWidth
          : $element.outerWidth(),
        height: isBody ? $(window).height() : $element.outerHeight(),
      },
      isBody ? { top: 0, left: 0 } : $element.offset(),
      { viewPortScrollOffset: viewPortScrollOffset },
      {
        scrollbarWidth:
          window.innerWidth - document.documentElement.clientWidth,
      }
    );
  };
  Tooltip.prototype.getCalculatedOffset = function (
    placement,
    pos,
    actualWidth,
    actualHeight
  ) {
    return placement == 'bottom'
      ? {
          top: pos.top + pos.height,
          left: pos.left + pos.width / 2 - actualWidth / 2,
        }
      : placement == 'top'
      ? {
          top: pos.top - actualHeight,
          left: pos.left + pos.width / 2 - actualWidth / 2,
        }
      : placement == 'left'
      ? {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left - actualWidth,
        }
      : {
          top: pos.top + pos.height / 2 - actualHeight / 2,
          left: pos.left + pos.width,
        };
  };
  Tooltip.prototype.getViewportAdjustedDelta = function (
    placement,
    pos,
    actualWidth,
    actualHeight,
    viewportDimensions
  ) {
    var delta = { top: 0, left: 0 };
    if (!this.$viewport) return delta;
    var viewportPadding =
      (this.options.viewport && this.options.viewport.padding) || 0;
    var scrollBarWidth = viewportDimensions.scrollbarWidth;
    if (/right|left/.test(placement)) {
      var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll;
      var bottomEdgeOffset =
        pos.top + viewportPadding - viewportDimensions.scroll + actualHeight;
      if (topEdgeOffset < viewportDimensions.top) {
        delta.top = viewportDimensions.top - topEdgeOffset;
      } else if (
        bottomEdgeOffset >
        viewportDimensions.top + viewportDimensions.height
      ) {
        delta.top =
          viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset;
      }
    } else {
      var leftEdgeOffset = pos.left;
      var rightEdgeOffset = pos.left + actualWidth;
      var scrollLeft =
        viewportDimensions.x !== undefined &&
        viewportDimensions.viewPortScrollOffset.left === 0
          ? viewportDimensions.x
          : viewportDimensions.viewPortScrollOffset.left;
      var docWidth = document.documentElement.offsetWidth;
      var scrollbarWidthForRTL = document.dir === 'rtl' ? scrollBarWidth : 0;
      var viewportScrollWidth = 0;
      if (this.$viewport && this.$viewport[0]) {
        viewportScrollWidth =
          this.$viewport[0].offsetWidth - this.$viewport[0].clientWidth;
      }
      if (leftEdgeOffset < scrollLeft) {
        delta.left = scrollbarWidthForRTL + scrollLeft - leftEdgeOffset;
        if (document.dir === 'rtl') {
          delta.left += viewportScrollWidth;
        }
      } else if (rightEdgeOffset > docWidth + scrollLeft) {
        delta.left =
          docWidth + scrollLeft - rightEdgeOffset + scrollbarWidthForRTL;
        if (document.dir === 'ltr') {
          delta.left -= viewportScrollWidth;
        }
      }
    }
    return delta;
  };
  Tooltip.prototype.getTitle = function () {
    var title;
    var $e = this.$element;
    var o = this.options;
    title =
      $e.attr('data-original-title') ||
      (typeof o.title == 'function' ? o.title.call($e[0]) : o.title);
    return title;
  };
  Tooltip.prototype.getUID = function (prefix) {
    do prefix += ~~(Math.random() * 1000000);
    while (document.getElementById(prefix));
    return prefix;
  };
  Tooltip.prototype.tip = function () {
    return (this.$tip = this.$tip || $(this.options.template));
  };
  Tooltip.prototype.arrow = function () {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'));
  };
  Tooltip.prototype.validate = function () {
    if (!this.$element[0].parentNode) {
      this.hide();
      this.$element = null;
      this.options = null;
    }
  };
  Tooltip.prototype.enable = function () {
    this.enabled = true;
  };
  Tooltip.prototype.disable = function () {
    this.enabled = false;
  };
  Tooltip.prototype.toggleEnabled = function () {
    this.enabled = !this.enabled;
  };
  Tooltip.prototype.toggle = function (e) {
    var self = this;
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type);
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions());
        $(e.currentTarget).data('bs.' + this.type, self);
      }
    }
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self);
  };
  Tooltip.prototype.destroy = function () {
    var that = this;
    clearTimeout(this.timeout);
    this.hide(function () {
      that.$element.off('.' + that.type).removeData('bs.' + that.type);
    });
  };
  Tooltip.prototype.sanitizeHtml = function (unsafeHtml) {
    return sanitizeHtml(
      unsafeHtml,
      this.options.whiteList,
      this.options.sanitizeFn
    );
  };
  function Plugin(option) {
    return this.each(function () {
      var $this = $(this);
      var data = $this.data('bs.tooltip');
      var options = typeof option == 'object' && option;
      if (!data && option == 'destroy') return;
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)));
      if (typeof option == 'string') data[option]();
    });
  }
  var old = $.fn.tooltip;
  $.fn.tooltip = Plugin;
  $.fn.tooltip.Constructor = Tooltip;
  $.fn.tooltip.noConflict = function () {
    $.fn.tooltip = old;
    return this;
  };
})(jQuery);
