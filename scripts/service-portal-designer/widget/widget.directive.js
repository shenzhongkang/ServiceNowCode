/*! RESOURCE: /scripts/service-portal-designer/widget/widget.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_widget_directive', [])
    .directive(
      'widget',
      function (
        $compile,
        $rootScope,
        $timeout,
        map,
        widget,
        page,
        events,
        $state,
        lazyLoader,
        spWidgetService
      ) {
        var service = spWidgetService;
        function link(scope, element) {
          scope.widget = scope.item.widget;
          var notSaved;
          if (!scope.item.widget) {
            notSaved = true;
            scope.item.widget = {
              id: scope.item.sp_widget,
              data: { widget_parameters: {} },
            };
          }
          map.setProp(scope.item.id, 'scope', scope);
          map.setProp(scope.item.id, 'element', element);
          if (!notSaved) {
            scope.item.label = widget.getById(scope.item.widget.sys_id).label;
          }
          if (
            scope.item.sys_id &&
            $state.params.sysId &&
            $state.params.sysId == scope.item.sys_id
          ) {
            $rootScope.$broadcast(
              events.scrollUp,
              $(element).offset().top - 117
            );
          }
          if (service.noData(scope)) {
            console.warn('Widget cannot be rendered - No data available');
            return;
          }
          service.initData(scope);
          widget.initGlobals(scope);
          if (scope.widget.ngTemplates)
            lazyLoader.putTemplates(scope.widget.ngTemplates);
          service.initData(scope);
          widget.initGlobals(scope);
          scope.$watch('widget', function (newValue, oldValue) {
            if (newValue !== oldValue) service.initData(scope);
          });
          var name = scope.widget.sys_id;
          name = 'v' + name;
          scope.widget.directiveName = name;
          var idTag = scope.widget.rectangle_id
            ? 'id="x' + scope.widget.rectangle_id + '"'
            : '';
          var template =
            '<div ' +
            idTag +
            ' class="' +
            name +
            '" data="data" options="options" widget="widget" server="server"></div>';
          if (name.length == 0) {
            console.warn(
              'Widget cannot be rendered - Invalid directive name:',
              scope.widget.name
            );
            return;
          }
          if (scope.widget.dependencies) {
            lazyLoader
              .dependencies(scope.widget.dependencies)
              .then(function () {
                service.loadDirective(scope, name, template);
                service.loadCSS(scope);
                widget.render(scope, element, template);
              });
          } else {
            service.loadDirective(scope, name, template);
            service.loadCSS(scope);
            widget.render(scope, element, template);
          }
        }
        return {
          restrict: 'E',
          scope: {
            item: '=',
          },
          replace: true,
          link: link,
        };
      }
    );
})();
