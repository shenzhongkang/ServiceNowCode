/*! RESOURCE: /scripts/app.$sp/directive.spWidget.js */
angular
  .module('sn.$sp')
  .directive(
    'spWidget',
    function (
      $rootScope,
      $timeout,
      $sanitize,
      lazyLoader,
      spWidgetService,
      spUtil,
      $ocLazyLoad
    ) {
      'use strict';
      var service = spWidgetService;
      function renderWidget(scope, element) {
        if (scope.widget.ngTemplates)
          lazyLoader.putTemplates(scope.widget.ngTemplates);
        service.initData(scope);
        service.initGlobals(scope);
        var name = scope.widget.sys_id;
        name = 'v' + name;
        if (scope.widget.update) {
          name += spUtil.createUid('xxxxx');
        }
        scope.widget.directiveName = name;
        scope.$watch('widget', function (newValue, oldValue) {
          if (newValue !== oldValue) service.initData(scope);
        });
        scope.$on('$destroy', function () {
          var depsList = scope.widget.dependencies || [];
          var widgetCSSIncludes = NOW.sp.widgetCSSIncludes;
          depsList.map(function (item) {
            var files = item.files.map(function (file) {
              if (file.type !== 'link') return;
              var fileURL = file.url;
              var usedElseWhere =
                widgetCSSIncludes[fileURL] && --widgetCSSIncludes[fileURL];
              if (usedElseWhere) return;
              var styleSheet = $('link[href="' + fileURL + '"]');
              if (styleSheet.length) {
                var last = styleSheet.last();
                last.prop('disabled', true);
                last.remove();
                $ocLazyLoad._getFilesCache().remove(fileURL);
              }
            });
          });
        });
        var idTag = scope.widget.rectangle_id
          ? 'id="x' + scope.widget.rectangle_id + '"'
          : '';
        var widgetTitle =
          (scope.widget.options || {}).title || scope.widget.name;
        var template =
          '<div ' +
          idTag +
          ' class="' +
          name +
          '" data="data" options="options" widget="widget" server="server" sn-atf-area="' +
          $sanitize(widgetTitle) +
          '"></div>';
        if (name.length == 0) return;
        function load() {
          service.loadDirective(scope, name, template);
          service.loadCSS(scope);
          service.render(scope, element, template);
        }
        function afterDependencyLoadHandler() {
          var depsList = scope.widget.dependencies;
          depsList.map(function (item) {
            var files = item.files.map(function (file) {
              if (file.type !== 'link') return;
              if (NOW.sp.widgetCSSIncludes[file.url])
                NOW.sp.widgetCSSIncludes[file.url] += 1;
              else NOW.sp.widgetCSSIncludes[file.url] = 1;
            });
          });
          load();
        }
        if (scope.widget.dependencies && scope.widget.dependencies.length > 0) {
          lazyLoader
            .dependencies(scope.widget.dependencies)
            .then(afterDependencyLoadHandler, function (e) {
              spUtil.format(
                'An error occurred when loading widget dependencies for: {name} ({id}) {error}',
                { name: scope.widget.name, id: scope.widget.sys_id, error: e }
              );
              load();
            });
        } else {
          load();
        }
      }
      function link(scope, element) {
        if (service.noData(scope)) {
          var w = scope.$watch('widget', function () {
            if (!service.noData(scope)) {
              w();
              renderWidget(scope, element);
            }
          });
          return;
        }
        renderWidget(scope, element);
      }
      return {
        restrict: 'E',
        link: link,
        scope: {
          widget: '=',
          page: '=?',
        },
      };
    }
  );
