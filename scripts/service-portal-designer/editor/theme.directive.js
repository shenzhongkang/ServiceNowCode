/*! RESOURCE: /scripts/service-portal-designer/editor/theme.directive.js */
(function () {
  'use strict';
  angular
    .module('spd_theme_directive', [])
    .directive('spdTheme', function (config, utils, portal, state) {
      function update(scope, value) {
        var portalId =
          (scope.type === 'portalId' && value) || state.get('portalId');
        if (portalId) {
          scope.external = [];
          var options = {
            async: true,
            fileAsync: true,
            compress: true,
          };
          less.render(
            nameSpace(scope, config.themeName, portalId, value),
            options,
            function (e, output) {
              if (e) {
                var message = e.message;
                var extract = e.extract.join('\n');
                var errorMessage =
                  'ERROR with CSS \n ' + message + ' : \n' + extract;
                console.error(errorMessage);
                return;
              }
              output.css = output.css.replace(
                /"bootstrap\//g,
                '/styles/heisenberg/bootstrap/'
              );
              output.css = output.css.replace(/body/gi, '.layout-ul');
              output.css = output.css.replace(
                /\.\.\/fonts\/fontawesome/g,
                '/scripts/icon-fonts/font-awesome/fonts/fontawesome'
              );
              scope.styles = output.css;
            }
          );
        }
      }
      function nameSpace(scope, themeName, portalId, value) {
        var css = '.' + themeName + ' {' + '\n';
        if (scope.type == 'portalId') {
          var files = [];
          _.forEach(config.themeStyles, function (url) {
            files.push(utils.format(url, { portalId: portalId }));
          });
          _.forEach(config.editorStyles, function (url) {
            files.push(url);
          });
          _.forEach(files, function (url) {
            css += '	@import (less) "' + url + '";' + '\n';
          });
        }
        if (scope.type == 'pageInfo') {
          if (value.css) css += value.css;
        }
        css += '}';
        return css;
      }
      var cache = {};
      return {
        scope: { type: '=' },
        template:
          '<div><style type="text/css">{{styles}}</style><div ng-repeat="item in external"><link rel="stylesheet" type="text/css" href="{{item}}"/></div></div>',
        replace: true,
        link: function (scope) {
          state.onChange(scope.type).call(function (value) {
            if (cache[scope.type] !== value) {
              update(scope, value);
              cache[scope.type] = value;
            }
          });
        },
      };
    });
})();
