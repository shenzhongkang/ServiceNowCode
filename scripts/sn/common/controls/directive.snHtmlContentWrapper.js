/*! RESOURCE: /scripts/sn/common/controls/directive.snHtmlContentWrapper.js */
angular
  .module('sn.common.controls')
  .directive('snHtmlContentWrapper', function () {
    function link(scope, element, attrs) {
      attrs.$observe('content', function (content) {
        encapsulate(element[0], content, attrs.uniqueId);
      });
    }
    function createDefaultCssLink() {
      var link = document.createElement('link');
      link.href = 'styles/activity_encapsulated.css';
      link.rel = 'stylesheet';
      link.type = 'text/css';
      return link;
    }
    function encapsulate(root, content, uniqueId) {
      var defaultCssLink = createDefaultCssLink();
      var style = document.createElement('style');
      style.innerHTML =
        ':host img {max-width: 100%; height: auto; overflow: hidden;}';
      if (document.head.createShadowRoot || document.head.attachShadow) {
        var shadow =
          root.shadowRoot ||
          (document.head.attachShadow
            ? root.attachShadow({ mode: 'open' })
            : root.createShadowRoot());
        var contentDiv = document.createElement('div');
        contentDiv.innerHTML = content;
        shadow.innerHTML = contentDiv.outerHTML;
        shadow.appendChild(defaultCssLink);
        shadow.appendChild(style);
      } else {
        var iframeId = 'activity-iframe-' + uniqueId;
        var existingIframe = document.getElementById(iframeId);
        if (existingIframe) {
          existingIframe.contentDocument.write(content);
          existingIframe.contentWindow.document.head.appendChild(
            defaultCssLink
          );
          existingIframe.setAttribute(
            'height',
            existingIframe.contentWindow.document.body.scrollHeight + 'px'
          );
        } else {
          var rootEl = $j(root);
          var iframe = document.createElement('iframe');
          iframe.setAttribute('id', iframeId);
          iframe.setAttribute('style', 'border:none;display:block;width:100%');
          iframe.setAttribute('class', 'html-content');
          iframe.setAttribute('scrolling', 'no');
          iframe.setAttribute('height', '0');
          iframe.setAttribute('sandbox', 'allow-same-origin');
          root.appendChild(iframe);
          var doc = iframe.contentWindow.document;
          doc.open();
          doc.write(content);
          doc.close();
          iframe.contentWindow.document.head.appendChild(defaultCssLink);
          iframe.height = doc.body.scrollHeight + 'px';
          var parentTab = rootEl.closest('.tabs2_section');
          var parentSectionId = parentTab.attr('data-section-id');
          var setIFrameHeightFn = function (tab) {
            var openedTab = $j('.tabs2_section.' + tab);
            if (
              openedTab.length > 0 &&
              openedTab.attr('data-section-id') === parentSectionId
            ) {
              iframe.contentWindow.document.head.appendChild(defaultCssLink);
              iframe.height = doc.body.scrollHeight + 'px';
              CustomEvent.un('tab.activated', setIFrameHeightFn);
            }
          };
          CustomEvent.observe('tab.activated', setIFrameHeightFn);
        }
      }
    }
    return {
      link: link,
      restrict: 'E',
      replace: true,
    };
  });
