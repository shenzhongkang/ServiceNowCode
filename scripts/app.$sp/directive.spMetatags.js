/*! RESOURCE: /scripts/app.$sp/directive.spMetatags.js */
angular
  .module('sn.$sp')
  .directive('spMetatags', function (spMetatagService, $window) {
    return {
      restrict: 'A',
      link: function (scope, elem, attr) {
        spMetatagService.subscribe(function (tags) {
          elem.find('[custom-tag]').remove();
          for (var key in tags) {
            var tagElement = $window.document.createElement('meta');
            tagElement.setAttribute('custom-tag', '');
            tagElement.setAttribute('name', key);
            tagElement.setAttribute('content', tags[key]);
            elem.append(tagElement);
          }
        });
        spMetatagService.subscribeSEO(function (seoMap) {
          if (!seoMap) return;
          canonicalURL(seoMap.canonicalURL);
          hrefLangTags(seoMap.hrefLangs);
          customseoTags(seoMap.customSEOTags);
          function canonicalURL(canonicalURL) {
            if (!canonicalURL) return;
            var tagElement = $window.document.createElement('link');
            tagElement.setAttribute('custom-tag', '');
            tagElement.setAttribute('rel', 'canonical');
            tagElement.setAttribute('href', canonicalURL);
            elem.append(tagElement);
          }
          function hrefLangTags(hrefLangs) {
            if (!hrefLangs) return;
            try {
              var hrefLangsArr = JSON.parse(hrefLangs);
              for (var i = 0; i < hrefLangsArr.length; i++) {
                var tagElement = $window.document.createElement('link');
                tagElement.setAttribute('custom-tag', '');
                tagElement.setAttribute('rel', 'alternate');
                tagElement.setAttribute('hreflang', hrefLangsArr[i].locale);
                tagElement.setAttribute('href', hrefLangsArr[i].href);
                elem.append(tagElement);
              }
            } catch (err) {}
          }
          function customseoTags(customSEOTags) {
            if (!customSEOTags) return;
            try {
              var customSEOTagsArr = JSON.parse(customSEOTags);
              for (var i = 0; i < customSEOTagsArr.length; i++) {
                var div = $window.document.createElement('div');
                div.innerHTML = customSEOTagsArr[i].trim();
                elem.append(div.firstChild);
              }
            } catch (err) {}
          }
        });
      },
    };
  });
