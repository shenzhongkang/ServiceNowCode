/*! RESOURCE: /scripts/app.ngbsm/directive.snNgBsm.js */
angular
  .module('sn.ngbsm')
  .directive(
    'snNgBsm',
    function (
      $rootScope,
      $timeout,
      $window,
      bsmBehaviors,
      bsmCamera,
      bsmCanvas,
      bsmFilters,
      bsmGraph,
      bsmGraphUtilities,
      bsmGroups,
      bsmLinkLayout,
      bsmNodeLayout,
      bsmRenderer,
      bsmRepository,
      bsmURL,
      bsmUserHistory,
      CONFIG,
      d3,
      bsmViewRepository,
      bsmRelatedBusinessServices,
      i18n,
      bsmAccessibility,
      CONST,
      ngBsmConstants,
      cmdbMatomo
    ) {
      'use strict';
      return {
        restrict: 'E',
        replace: true,
        template:
          '' +
          '<div class="sn-ng-bsm" ng-style="calculateStyles()">' +
          '    <div ng-show="showErrors()" role="alert"></div>' +
          '    <svg id="dependency-map-{{::$id}}" tabindex="{{a11yEnabled ? 0 : \'\'}}" focusable="{{a11yEnabled ? \'true\' : \'\'}}" aria-label="{{ngbsmTitle}}" aria-describedby="dependency-map-label-{{::$id}}" ng-keydown="keyDownHandler($event)" data-test-id="dv_map_container" ng-attr-width="{{calculateWidth()}}" ng-attr-height="{{calculateHeight()}}" ng-attr-viewbox="0 0 {{calculateWidth()}} {{calculateHeight()}}"></svg>' +
          '    <div class="dv-map-info instructions" id="dependency-map-label-{{::$id}}">{{ngbsmLabel}}</div>' +
          '    <div role="status" aria-live="polite"><div class="dv-map-info indicator-info"></div></div>' +
          '</div>',
        controller: function ($scope, $element, $document) {
          $scope.showErrorFlag = true;
          $scope.errors = [];
          $scope.a11yEnabled = bsmAccessibility.state.enabled;
          $scope.ngbsmTitle = i18n.getMessage('accessibility.ngbsm.title');
          $scope.ngbsmLabel = i18n.getMessage('accessibility.ngbsm.map.info');
          $scope.ngbsmExitLabel = i18n.getMessage(
            'accessibility.ngbsm.map.exit'
          );
          $scope.accessibility = bsmAccessibility.state;
          $scope.keyDownHandler = function (e) {
            if (e.keyCode === CONST.KEYCODE_ENTER) {
              if (!$scope.accessibility.navigate) {
                bsmBehaviors.a11yNavigateEnter();
                e.stopPropagation();
              }
            } else if (e.keyCode === CONST.KEYCODE_ESC) {
              bsmBehaviors.a11yNavigateExit();
              angular.element('#dependency-map-' + $scope.$id).focus();
              bsmBehaviors.clearSelection();
            } else if (e.keyCode === CONST.KEYCODE_SPACE) {
              if (!$scope.accessibility.navigate) {
                var box = d3.select('svg').node().getBoundingClientRect();
                bsmBehaviors.openMenu(undefined, box.width / 2, box.height / 2);
              }
            }
            return true;
          };
          var tabPressed = false;
          function documentFocus(e) {
            var svg = $element.find('svg')[0];
            if (
              e.target.tagName === 'INPUT' &&
              angular.element.contains(svg, e.target)
            )
              return;
            if (!angular.element.contains(svg, e.target) || e.target === svg) {
              bsmBehaviors.a11yNavigateExit();
            } else {
              if (tabPressed && !$scope.accessibility.navigate) {
                var found = false;
                var last;
                var next;
                angular.element('[tabindex="0"], button').map(function (a, b) {
                  if (b === svg) {
                    found = true;
                  }
                  if (
                    angular.element(b).is(':visible') &&
                    !angular.element.contains(svg, b)
                  ) {
                    if (!found) {
                      last = b;
                    } else if (found && !next && !(b === svg)) {
                      next = b;
                    }
                  }
                  return b;
                });
                if (tabPressed === 1) {
                  bsmAccessibility.cbFocus(next);
                } else {
                  bsmAccessibility.cbFocus(svg);
                }
              } else {
                $scope.accessibility.navigate = true;
              }
            }
          }
          function tabBehavior(e) {
            if (e.keyCode === CONST.KEYCODE_TAB) {
              tabPressed = e.shiftKey ? -1 : 1;
              setTimeout(function () {
                tabPressed = false;
              });
            }
          }
          document.addEventListener('focus', documentFocus, true);
          document.addEventListener('click', documentFocus, true);
          document.addEventListener('keydown', tabBehavior, true);
          $scope.$on('ngbsm.view_selected', function (event, data) {
            savedGraphLoaded(data);
            $timeout(function () {
              $scope.$broadcast('ngbsm.view_loaded', {
                image: data.thumbnail,
                name: bsmGraph.current().root.name,
              });
            }, 1000);
          });
          $scope.$on('ngbsm.previous_view_loaded', previousGraphLoaded);
          $scope.$on(
            'ngbsm.view_significantly_changed',
            function (event, data) {
              bsmRepository.loadGraph(bsmGraph.current().id).then(function () {
                newGraphLoaded();
              });
            }
          );
          $scope.$on('ngbsm.new_graph_loaded', newGraphLoaded);
          $scope.$watch('search.selected.result', searchSelectionChanged);
          $scope.$watch('layout.selected', layoutSelectionChanged);
          angular.element($window).bind('resize', function () {
            $scope.$digest();
          });
          bsmUserHistory.load().then(function (data) {
            if (bsmURL.getParameter('savedmapversion')) {
              bsmViewRepository
                .getView(
                  g_user.userID,
                  bsmURL.getParameter('id'),
                  bsmURL.getParameter('savedmapversion')
                )
                .then(function (data) {
                  $scope.$broadcast('ngbsm.view_selected', data[0]);
                });
            } else {
              var serviceView =
                bsmURL.getParameter('serviceView') == 'true' ? true : false;
              bsmRepository
                .loadGraph(
                  bsmURL.getParameter('id') || data.id,
                  undefined,
                  undefined,
                  serviceView
                )
                .then(newGraphLoaded);
            }
          });
          $scope.calculateHeight = function () {
            var h = $window.innerHeight - 45;
            if ($scope.bottomRelated.open)
              h = $window.innerHeight - (45 + CONFIG.BOTTOM_PANEL_HEIGHT);
            return h < 0 ? '0' : h;
          };
          $scope.calculateWidth = function () {
            var w = $window.innerWidth;
            if ($scope.side.open)
              w = $window.innerWidth - CONFIG.SIDE_PANEL_WIDTH;
            return w < 0 ? '0' : w;
          };
          $scope.calculateStyles = function () {
            return {
              height: $scope.calculateHeight(),
              width: $scope.calculateWidth(),
              top: '45px',
              left: '0px',
            };
          };
          $scope.inServiceView = function () {
            if (hasTypeFlags()) return !bsmGraph.current().infrastructureView;
            return false;
          };
          $scope.hasServiceView = function () {
            if (hasTypeFlags() && bsmGraph.current().serviceViewAvailable)
              return true;
            return false;
          };
          $scope.switchToInfrastructure = function () {
            if (hasTypeFlags() && !bsmGraph.current().infrastructureView) {
              $rootScope.$broadcast('ngbsm.view_mode_switching');
              bsmRepository
                .loadGraph(bsmGraph.current().serviceId)
                .then(function () {
                  newGraphLoaded();
                });
            }
          };
          $scope.switchToService = function () {
            if (!$scope.inServiceView() && $scope.hasServiceView()) {
              $rootScope.$broadcast('ngbsm.view_mode_switching');
              bsmRepository
                .loadGraph(bsmGraph.current().id, undefined, undefined, true)
                .then(function () {
                  newGraphLoaded();
                });
            }
          };
          $scope.getMessageHash = function (str) {
            if (Array.prototype.reduce) {
              return str.split('').reduce(function (a, b) {
                a = (a << 5) - a + b.charCodeAt(0);
                return a & a;
              }, 0);
            }
            var hash = 0;
            if (str.length === 0) return hash;
            for (var i = 0; i < str.length; i++) {
              var character = str.charCodeAt(i);
              hash = (hash << 5) - hash + character;
              hash = hash & hash;
            }
            return hash;
          };
          $scope.showErrors = function () {
            if ($scope.showErrorFlag && $scope.getErrors().length > 0) {
              $scope.errors = $scope.getErrors();
              for (var i = 0; i < $scope.errors.length; i++) {
                if (
                  $scope.errors[i].type === 'DEBUG' ||
                  $scope.errors[i].type === 'INFO' ||
                  $scope.errors[i].type === 'WARNING'
                )
                  $rootScope.$broadcast('ngbsm.warning', {
                    warning: $scope.errors[i].message,
                  });
                else if ($scope.errors[i].type === 'ERROR') {
                  var msg = $scope.errors[i].message;
                  $rootScope.$broadcast('ngbsm.error', {
                    error: msg,
                    id: $scope.getMessageHash(msg),
                  });
                }
              }
              $scope.errors = [];
              $scope.showErrorFlag = false;
              return true;
            } else {
              $scope.errors = [];
              return false;
            }
          };
          $scope.getErrors = function () {
            if (
              bsmGraph &&
              bsmGraph.current() &&
              bsmGraph.current().errors &&
              bsmGraph.current().errors.length > 0
            )
              return bsmGraph.current().errors;
            return false;
          };
          function hasTypeFlags() {
            if (
              bsmGraph &&
              bsmGraph.current() &&
              bsmGraph.current().infrastructureView !== undefined &&
              bsmGraph.current().serviceViewAvailable !== undefined
            )
              return true;
            return false;
          }
          function newGraphLoaded() {
            if (!bsmGraph) return;
            var currGraph = bsmGraph.current();
            if (!currGraph || !angular.isArray(currGraph.nodes)) return;
            var timer = new StopWatch();
            $scope.showErrorFlag = true;
            bsmRelatedBusinessServices.loadDataForNodeList(currGraph.nodes);
            currGraph.mode = $scope.layout.selected.value;
            layoutAndFilterGraph();
            bsmRenderer.drawAll(1250);
            bsmCamera.fitToScreen(currGraph);
            bsmCamera.moveCamera(1000, false, true);
            $rootScope.$broadcast('ngbsm.new.graph.loaded');
            var token = bsmCanvas.canvas().attr('data-token');
            var newToken;
            do {
              newToken = String(Math.random());
            } while (newToken === token);
            bsmCanvas.canvas().attr('data-token', newToken);
            cmdbMatomo.trackEvent(
              ngBsmConstants.MATOMO.CATEGORY,
              ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_RENDER,
              ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_RENDER,
              timer.getTime()
            );
          }
          function previousGraphLoaded() {
            bsmFilters.enumerateFilters(bsmGraph.current());
            bsmFilters.applyFilters(bsmGraph.current());
            bsmRenderer.drawAll(1250);
            bsmCamera.fitToScreen(bsmGraph.current());
            bsmCamera.moveCamera(1000, false, true);
          }
          function savedGraphLoaded(data) {
            bsmGraph.push(JSON.parse(data.graph));
            bsmGraphUtilities.prepareLoadedGraph(bsmGraph.current());
            bsmFilters.replaceFilters(JSON.parse(data.filter));
            bsmFilters.applyFilters(bsmGraph.current());
            bsmLinkLayout.recalculateAllLinks(bsmGraph.current());
            bsmRenderer.drawAll(1250);
            bsmCamera.fitToScreen(bsmGraph.current());
            bsmCamera.moveCamera(1000, false, true);
          }
          function searchSelectionChanged() {
            if ($scope.search.selected && $scope.search.selected.result) {
              var isService =
                $scope.search.selected.provider &&
                $scope.search.selected.provider.label === 'Service Views';
              bsmRepository
                .loadGraph(
                  $scope.search.selected.result.sys_id,
                  undefined,
                  undefined,
                  isService
                )
                .then(newGraphLoaded);
            }
          }
          function layoutSelectionChanged() {
            var end = angular.element.Deferred();
            if (bsmGraph.current() !== null) {
              bsmGraph.current().mode = $scope.layout.selected.value;
              if (bsmGraph.current().mode === 'horizontal')
                bsmNodeLayout.runHorizontalTreeLayout(
                  bsmGraph.current(),
                  bsmGraph.current().root
                );
              else if (bsmGraph.current().mode === 'radial')
                bsmNodeLayout.runRadialTreeLayout(
                  bsmGraph.current(),
                  bsmGraph.current().root
                );
              else if (bsmGraph.current().mode === 'vertical')
                bsmNodeLayout.runVerticalTreeLayout(
                  bsmGraph.current(),
                  bsmGraph.current().root
                );
              else if (bsmGraph.current().mode === 'force')
                bsmNodeLayout.runForceLayout(
                  bsmGraph.current(),
                  bsmGraph.current().root
                );
              else
                bsmNodeLayout.runForceGroupLayout(
                  bsmGraph.current(),
                  bsmGraph.current().root
                );
              bsmLinkLayout.recalculateAllLinks(bsmGraph.current());
              var drawAllPromise = bsmRenderer.drawAll(1250);
              if (bsmGroups.groups().length > 0) {
                bsmGroups.update();
                bsmRenderer.drawAbove(1250);
              }
              bsmCamera.fitToScreen(bsmGraph.current());
              var moveCameraPromise = bsmCamera.moveCamera(1000, false, false);
              angular.element
                .when(drawAllPromise, moveCameraPromise)
                .done(function () {
                  end.resolve();
                })
                .fail(function () {
                  end.reject();
                });
            } else {
              end.reject();
            }
            end.done(function () {
              $rootScope.$broadcast(
                'ngbsm.layout_change.complete',
                bsmGraph.current().mode
              );
            });
          }
          function layoutAndFilterGraph(mode) {
            if (mode === undefined) mode = bsmGraph.current().mode;
            bsmFilters.enumerateFilters(bsmGraph.current());
            bsmFilters.applyFilters(bsmGraph.current());
            if (mode === 'horizontal')
              bsmNodeLayout.runHorizontalTreeLayout(
                bsmGraph.current(),
                bsmGraph.current().root
              );
            else if (mode === 'radial')
              bsmNodeLayout.runRadialTreeLayout(
                bsmGraph.current(),
                bsmGraph.current().root
              );
            else if (mode === 'vertical')
              bsmNodeLayout.runVerticalTreeLayout(
                bsmGraph.current(),
                bsmGraph.current().root
              );
            else if (mode === 'force')
              bsmNodeLayout.runForceLayout(
                bsmGraph.current(),
                bsmGraph.current().root
              );
            else
              bsmNodeLayout.runForceGroupLayout(
                bsmGraph.current(),
                bsmGraph.current().root
              );
            bsmLinkLayout.recalculateAllLinks(bsmGraph.current());
          }
        },
        link: function (scope, elem, attrs) {
          setupCanvasAndCamera();
          function setupCanvasAndCamera() {
            bsmRenderer.setBehaviors(bsmBehaviors);
            bsmCamera.attach(bsmBehaviors.zoom);
            bsmCanvas.setContainer(d3.select(elem[0]));
            bsmCanvas.setCanvas(d3.select(elem.find('svg')[0]));
            bsmCanvas.setCamera(bsmCanvas.canvas().append('g'));
            bsmCanvas.setBelow(bsmCanvas.camera().append('g'));
            bsmCanvas.setVisualization(bsmCanvas.camera().append('g'));
            bsmCanvas.setAbove(bsmCanvas.camera().append('g'));
            bsmCanvas.setMargins([20, 64, 32, 64]);
            bsmCanvas
              .above()
              .append('text')
              .classed('common-text-element', true)
              .attr('x', '-4000')
              .attr('y', '-4000')
              .style('display', 'none');
            d3.select('body').on('keydown', bsmBehaviors.onKeyDown);
            bsmCanvas
              .canvas()
              .classed('move-mode', true)
              .on('mousedown', bsmBehaviors.onMouseDown)
              .on('mousemove', bsmBehaviors.onMouseMove)
              .on('mouseup', bsmBehaviors.onMouseUp)
              .on('contextmenu', bsmBehaviors.onRightClick)
              .call(bsmBehaviors.zoom);
            bsmCanvas.canvas().on('dblclick.zoom', null);
            bsmCanvas
              .above()
              .append('g')
              .classed('selection', true)
              .append('rect')
              .classed('active', false);
            bsmCanvas
              .above()
              .append('g')
              .classed('new-relationship', true)
              .append('path')
              .classed('active', false);
            bsmCanvas
              .container()
              .append('div')
              .classed('relationship-label', true);
          }
        },
      };
    }
  );