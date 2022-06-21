/*! RESOURCE: /scripts/app.$sp/directive.spAgentChat.js */
angular.module('sn.$sp').directive('spAgentChat', function () {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'sp_agent_chat.xml',
    controllerAs: 'c',
    scope: true,
    controller: function (
      $window,
      spAgentChat,
      i18n,
      $rootScope,
      $scope,
      spUtil
    ) {
      var c = this;
      var _portalId = $rootScope.portal_id;
      c.isVisible = false;
      c.isOpen = false;
      c.hasUnreadMessage = false;
      c.unreadMessages = 0;
      c.frameUrl = null;
      c.isMobile = spUtil.isMobile();
      c.i18n = {
        openChatWindow: i18n.getMessage('Open chat window'),
        minimizeChatWindow: i18n.getMessage('Minimize chat window'),
        openChatWindowWithUnreadMessage: i18n.getMessage(
          'Open chat window. {0} unread messages'
        ),
        agentChatWindow: i18n.getMessage('Agent Chat Window'),
      };
      c.getBadgeAriaLabel = function () {
        if (c.isOpen) return c.i18n.minimizeChatWindow;
        else if (c.hasUnreadMessage)
          return c.i18n.openChatWindowWithUnreadMessage.withValues([
            c.unreadMessages,
          ]);
        else return c.i18n.openChatWindow;
      };
      c.toggle = function ($event) {
        if ($event) {
          $event.currentTarget.blur();
        }
        c.isOpen = !c.isOpen;
        c.hasUnreadMessage = false;
        c.unreadMessages = 0;
        $('body').toggleClass('disable_overflow_scrolling');
        spAgentChat.setState({
          isOpen: c.isOpen,
          hasUnreadMessage: c.hasUnreadMessage,
          unreadMessages: c.unreadMessages,
        });
        if (c.isOpen && c.frameUrl !== undefined) {
          var spAgentChatFrame = $('iframe.sp-ac-frame');
          var vaWebClient = $(
            'sn-component-va-web-client',
            spAgentChatFrame.contents()
          )[0];
          var snChatInputElement = $(
            '.sn-chat-input-element',
            $(vaWebClient)
          )[0];
          if (snChatInputElement === undefined)
            snChatInputElement = $(
              '.sn-chat-input-element',
              vaWebClient.shadowRoot
            )[0];
          setTimeout(function () {
            if (snChatInputElement.disabled) $('.sp-ac-root')[0].focus();
            else snChatInputElement.focus();
          }, 0);
        } else if (c.isOpen && c.frameUrl === undefined) {
          setTimeout(function () {
            $('.sp-ac-root')[0].focus();
          }, 0);
        }
        if (c.frameUrl !== undefined) return;
        spAgentChat.getFrameUrl().then(function (frameUrl) {
          c.frameUrl = frameUrl;
        });
      };
      spAgentChat.init(_portalId).then(function (config) {
        c.frameUrl = config.frameUrl;
        c.isVisible = config.isVisible;
        c.hasUnreadMessage = config.hasUnreadMessage;
        c.unreadMessages = config.unreadMessages;
        if (c.isOpen !== config.isOpen) {
          c.toggle();
        }
      });
      spAgentChat.subscribe(spAgentChat.events.NEW_UNREAD_MESSAGE, function () {
        if (!c.isOpen) {
          c.hasUnreadMessage = true;
          c.unreadMessages = c.unreadMessages + 1;
          if (c.unreadMessages > 999) {
            c.unreadMessages = 999;
          }
          $scope.$apply();
          spAgentChat.setState({
            isOpen: c.isOpen,
            hasUnreadMessage: c.hasUnreadMessage,
            unreadMessages: c.unreadMessages,
          });
        }
      });
      spAgentChat.subscribe(spAgentChat.events.CLOSE_AGENT_CHAT, function () {
        c.toggle();
        $scope.$apply();
        $('button.sp-ac-btn')[0].focus();
      });
      spAgentChat.subscribe(spAgentChat.events.REAUTH, function () {
        $window.location.reload(true);
      });
      spAgentChat.subscribe(spAgentChat.events.STATE_CHANGE, function (config) {
        c.isOpen = config.isOpen;
      });
    },
  };
});
