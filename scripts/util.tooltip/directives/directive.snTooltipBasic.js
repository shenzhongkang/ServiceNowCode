/*! RESOURCE: /scripts/util.tooltip/directives/directive.snTooltipBasic.js */
angular.module('sn.tooltip').directive('snTooltipBasic', [
  function () {
    'use strict';
    return {
      restrict: 'A',
      scope: false,
      link: function (scope, elem, attrs) {
        if (jQuery && jQuery.fn.tooltip) {
          var $ = jQuery(elem);
          var defaults = jQuery.fn.tooltip.Constructor.DEFAULTS;
          var config = {};
          config.title = function () {
            if (
              attrs['overflowOnly'] == 'true' &&
              elem[0].scrollWidth <= elem[0].clientWidth
            )
              return null;
            return $.attr('sn-tooltip-basic');
          };
          config.container = 'body';
          config.placement = attrs['placement']
            ? attrs['placement']
            : defaults.placement;
          config.animation = attrs['animation']
            ? attrs['animation'] == 'true'
            : defaults.animation;
          config.delay = {
            show: attrs['delayShow']
              ? parseInt(attrs['delayShow'])
              : defaults.delay.show,
            hide: attrs['delayHide']
              ? parseInt(attrs['delayHide'])
              : defaults.delay.hide,
          };
          if (attrs['classes']) {
            var old = 'class="tooltip"';
            var replacement = 'class="tooltip ' + attrs['classes'] + '"';
            config.template = defaults.template.replace(old, replacement);
          }
          if (attrs['isHtml'] == 'true') {
            config.html = true;
          }
          $.tooltip(config).hideFix();
          $.on('sn-tooltip-basic-removed', function () {
            $.tooltip('destroy');
          });
        }
      },
    };
  },
]);
(function ($) {
  var ev = new $.Event('sn-tooltip-basic-removed');
  var orig = $.fn.remove;
  $.fn.remove = function () {
    $(this).trigger(ev);
    return orig.apply(this, arguments);
  };
})(jQuery);