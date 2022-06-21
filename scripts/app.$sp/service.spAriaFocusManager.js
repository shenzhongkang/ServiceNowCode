/*! RESOURCE: /scripts/app.$sp/service.spAriaFocusManager.js */
angular.module('sn.$sp').service('spAriaFocusManager', function () {
  var danglingNavigation;
  var onPageLoadHandlerCallback;
  function linkHandler(newLinkRoute) {
    danglingNavigation = newLinkRoute;
  }
  function pageLoadComplete(newPageRoute) {
    if (newPageRoute == danglingNavigation && onPageLoadHandlerCallback) {
      onPageLoadHandlerCallback();
    }
    danglingNavigation = null;
  }
  function registerPageTitleCallback(pageLoadHandlerFn) {
    onPageLoadHandlerCallback = pageLoadHandlerFn;
  }
  function focusOnPageTitle(focusFirstTabbableEl, $event) {
    if (onPageLoadHandlerCallback) {
      onPageLoadHandlerCallback(focusFirstTabbableEl, $event);
    }
  }
  function focusOnAgentChat() {
    var spAgentChatContainer = $('.sp-ac-root')[0];
    var chatToggleButton = $('button.sp-ac-btn')[0];
    var isChatOpen = angular.element(spAgentChatContainer).scope()['$parent'][
      'c'
    ]['isOpen'];
    if (isChatOpen) spAgentChatContainer.focus();
    else chatToggleButton.focus();
  }
  function enableFocusOnDisabledSelect2(element) {
    if (g_accessibility !== 'true') {
      return;
    }
    element = $(element.currentTarget);
    var parentElem = element.parent();
    var inputElem = parentElem.find('.select2-focusser');
    if (!inputElem[0]) return;
    var spanElem =
      parentElem.find('.select2-arrow')[0] ||
      parentElem.find('[data-select2-arrow]')[0];
    spanElem = $(spanElem);
    if (element.attr('disabled')) {
      inputElem.removeAttr('disabled');
      inputElem.removeAttr('aria-expanded');
      inputElem.attr('readonly', 'readonly');
      inputElem.removeAttr('role');
      spanElem.removeClass('select2-arrow');
      spanElem.attr('data-select2-arrow', 'false');
    } else {
      inputElem.removeAttr('readonly');
      inputElem.attr('role', 'combobox');
      inputElem.attr('aria-expanded', 'false');
      spanElem.addClass('select2-arrow');
      spanElem.attr('data-select2-arrow', 'true');
    }
  }
  return {
    navigateToLink: linkHandler,
    pageLoadComplete: pageLoadComplete,
    registerPageTitleFocus: registerPageTitleCallback,
    focusOnPageTitle: focusOnPageTitle,
    enableFocusOnDisabledSelect2: enableFocusOnDisabledSelect2,
    focusOnAgentChat: focusOnAgentChat,
  };
});
