/*! RESOURCE: /scripts/app.ngbsm/directive.snBsmSide.js */
angular
  .module('sn.ngbsm')
  .directive(
    'snBsmSide',
    function (
      $parse,
      $rootScope,
      $timeout,
      $window,
      bsmCamera,
      bsmCanvas,
      bsmFilters,
      bsmGraph,
      bsmIndicators,
      bsmLinkLayout,
      bsmNodeLayout,
      bsmRenderer,
      bsmURL,
      CONFIG,
      i18n
    ) {
      'use strict';
      var DEFAULT_MAX_LEVELS = 3;
      var translatedI18n = i18n.getMessage(
        'dependencies.ngbsm.filters.default.caption'
      );
      var DEFAULT_CAPTION = '<' + translatedI18n + '>';
      var SETTINGS_RESET_ID = 98;
      var SETTINGS_LOAD_ID = 99;
      var lastCustomGraphScript = '';
      return {
        restrict: 'E',
        replace: false,
        scope: {
          side: '=data',
          bottom: '=',
        },
        templateUrl:
          '/angular.do?sysparm_type=get_partial&name=sn_bsm_side.xml',
        controller: function ($scope) {
          var lastLongDraw = {
            time: Date.now(),
            duration: 0,
          };
          $scope.maxLevels = bsmURL.getParameter('level') || DEFAULT_MAX_LEVELS;
          $scope.side.width = CONFIG.SIDE_PANEL_WIDTH;
          $scope.filters = bsmFilters.getFilters();
          $scope.scripts = bsmFilters.getMapScripts();
          $scope.filterMode = bsmFilters.getFilterMode();
          $scope.filterAutoLayout = CONFIG.FILTERS_RUN_LAYOUT_AUTOMATICALLY;
          $scope.filterAutoFit = CONFIG.FILTERS_FIT_TO_SCREEN_AUTOMATICALLY;
          $scope.scriptLoading = false;
          var enumeratedDefaultFilter = bsmFilters.enumerateFilter(
            bsmGraph.current(),
            CONFIG.FILTERS_DEFAULT
          );
          $scope.savedScripts = {
            selected: {
              label: DEFAULT_CAPTION,
              value: '',
            },
            options: [],
            align: 'left',
          };
          $scope.savedFilters = {
            selected: {
              label: DEFAULT_CAPTION,
              value: enumeratedDefaultFilter,
            },
            options: [
              {
                label: DEFAULT_CAPTION,
                value: enumeratedDefaultFilter,
              },
            ],
            align: 'left',
          };
          $rootScope.$on('ngbsm.new.graph.loaded', function (event, newValue) {
            $timeout(function () {
              $scope.scriptLoading = false;
            }, 1000);
          });
          $rootScope.$on('ngbsm.long_draw_triggered', updateLastLongDraw);
          $rootScope.$on('bsm_spinner_value_chang', function (event, newValue) {
            bsmFilters.setCurrentFormElementOption('current', newValue);
          });
          $scope.$watch('filters', handleFilterChanges, true);
          $scope.$watch('filterMode', handleFilterChanges);
          $scope.$watch('filterMode', function (newValue, oldValue) {
            bsmFilters.setCurrentFormElementOption('filterMode', newValue);
          });
          $scope.$watch('filterAutoLayout', function (newValue, oldValue) {
            bsmFilters.setCurrentFormElementOption(
              'filterAutoLayout',
              newValue
            );
          });
          $scope.$watch('filterAutoFit', function (newValue, oldValue) {
            bsmFilters.setCurrentFormElementOption('filterAutoFit', newValue);
          });
          $scope.$watch('maxLevels', function (newValue, oldValue) {
            var setvalue = newValue;
            if (angular.isUndefined(setvalue) || setvalue === '') {
              setvalue = DEFAULT_MAX_LEVELS;
            }
            bsmFilters.setCurrentFormElementOption('current', setvalue);
          });
          $scope.$watch('savedScripts.selected', function (newValue, oldValue) {
            bsmFilters.setCurrentFormElementOption('mapscript', newValue);
          });
          $scope.$watch('side.open', function (isNowTrue) {
            if (bsmGraph.current()) {
              if (isNowTrue) {
                bsmCamera.fitToScreen(bsmGraph.current());
                bsmCamera.moveCamera(500);
              } else {
                $timeout(function () {
                  bsmCamera.fitToScreen(bsmGraph.current());
                  bsmCamera.moveCamera(650);
                }, 50);
              }
            }
          });
          $scope.loadOptions = function (data) {
            for (var i = 0; i < data.length; i++) {
              if (data[i].type !== 'formElement') {
                continue;
              }
              var val = $parse(data[i].model);
              val.assign($scope, data[i].value);
            }
          };
          $rootScope.$on('dv_filter_updated', function (event, data) {
            $scope.loadOptions(data);
          });
          $timeout(function () {
            updateSavedFilterOptions();
            loadScriptsNames();
          }, 1000);
          $scope.panelHeight = function () {
            if ($scope.bottom.open)
              return (
                $window.innerHeight - (45 + CONFIG.BOTTOM_PANEL_HEIGHT) + 'px'
              );
            return $window.innerHeight - 45 + 'px';
          };
          $scope.panelWidth = function () {
            return CONFIG.SIDE_PANEL_WIDTH + 'px';
          };
          $scope.panelOffset = function () {
            if ($scope.side.open) return '0px';
            return -CONFIG.SIDE_PANEL_WIDTH + 'px';
          };
          $scope.contentWidth = function () {
            return CONFIG.SIDE_PANEL_WIDTH - 7 + 'px';
          };
          $scope.toggleOpen = function () {
            $scope.side.open = !$scope.side.open;
          };
          $scope.saveFilter = function () {
            var lsm = function (saveIndex) {
              if ($scope.savedFilters.options.length > 0) {
                $scope.savedFilters.selected =
                  $scope.savedFilters.options[saveIndex];
              }
              $scope.saveName = '';
            };
            if (
              $scope.saveName !== null &&
              $scope.saveName !== undefined &&
              $scope.saveName.length >= 4
            ) {
              bsmFilters
                .saveFilters(g_user.userID, $scope.saveName)
                .then(function () {
                  updateSavedFilterOptions(lsm);
                });
            } else {
              $rootScope.$broadcast('ngbsm.warning', {
                warning: i18n.getMessage(
                  'dependencies.ngbsm.filters.warning.name'
                ),
              });
            }
          };
          $scope.runScript = function (resetFilter) {
            var val = $scope.savedScripts.selected.value;
            if (lastCustomGraphScript !== val || bsmURL.getParameter('debug')) {
              lastCustomGraphScript = val;
              $scope.scriptLoading = true;
              $rootScope.$broadcast('ngbsm.set_map_script', val);
              $scope.overrideLevel();
              if (resetFilter) {
                $scope.resetFilter(true);
              }
            }
          };
          $scope.setMaxLevelFromCurrent = function (doNotReloadMap) {
            var maxLevels = bsmFilters.getCurrentPropertyValue('current');
            if (angular.isUndefined(maxLevels) || maxLevels === '') {
              maxLevels = DEFAULT_MAX_LEVELS;
            }
            $rootScope.$broadcast('bsm_spinner_value_set', maxLevels);
            bsmFilters.setCurrentFormElementOption('current', maxLevels);
            $scope.maxLevels = maxLevels;
            $scope.overrideLevel(doNotReloadMap);
          };
          $scope.setScriptFromCurrent = function () {
            var selectedScript =
              bsmFilters.getCurrentPropertyValue('mapscript');
            if (angular.isUndefined(selectedScript)) {
              return;
            }
            $scope.savedScripts.selected = $scope.getSelectScriptFromOption(
              selectedScript.value
            );
          };
          $scope.loadFilter = function (doRunScript) {
            if (angular.isUndefined(doRunScript)) {
              doRunScript = false;
            }
            if (!$scope.isValidFilter(true)) {
              return;
            }
            if ($scope.savedFilters.selected.label === DEFAULT_CAPTION) {
              $scope.resetFilter();
              return;
            }
            if (
              $scope.savedFilters.selected &&
              $scope.savedFilters.selected.value
            ) {
              bsmFilters.replaceFilters($scope.savedFilters.selected.value);
              $scope.setMaxLevelFromCurrent();
              $scope.setScriptFromCurrent();
              if (doRunScript) {
                $scope.runScript();
              }
              var transMsg = i18n.getMessage(
                'dependencies.ngbsm.filters.loaded.success'
              );
              $rootScope.$broadcast('ngbsm.success', {
                id: SETTINGS_LOAD_ID,
                success:
                  transMsg + " '" + $scope.savedFilters.selected.label + "'",
              });
            } else {
              $rootScope.$broadcast('ngbsm.error', {
                error: i18n.getMessage(
                  'dependencies.ngbsm.filters.error.no.filter'
                ),
              });
            }
          };
          $scope.getSelectScriptFromOption = function (mapScriptId) {
            var scriptList = $scope.savedScripts.options;
            for (var index = 0; index < scriptList.length; index++) {
              if (scriptList[index].value === mapScriptId) {
                return scriptList[index];
              }
            }
          };
          $scope.isValidFilter = function (allowdefault) {
            if (!allowdefault) {
              allowdefault = false;
            }
            if (angular.isUndefined($scope.savedFilters.selected)) {
              return false;
            }
            if (
              allowdefault &&
              $scope.savedFilters.selected.value === DEFAULT_CAPTION
            ) {
              return true;
            } else {
              if (
                $scope.savedFilters.selected.value === DEFAULT_CAPTION ||
                $scope.savedFilters.selected.value === ''
              ) {
                return false;
              }
            }
            return true;
          };
          $scope.resetFilter = function (doNotLoadScript) {
            if (angular.isUndefined($scope.savedFilters.selected)) {
              $scope.savedFilters.selected = $scope.savedFilters.options[0];
            }
            if (!$scope.isValidFilter(true)) {
              $scope.savedFilters.selected = $scope.savedFilters.options[0];
            }
            bsmFilters.resetFilters();
            bsmFilters.enumerateFilters(bsmGraph.current());
            bsmFilters.applyFilters(bsmGraph.current());
            bsmRenderer.drawAll(0);
            $scope.postReset(doNotLoadScript);
          };
          $scope.postReset = function (doNotLoadScript) {
            $scope.savedFilters.selected = $scope.savedFilters.options[0];
            $scope.setMaxLevelFromCurrent(true);
            $scope.setScriptFromCurrent();
            $rootScope.$broadcast('ngbsm.success', {
              id: SETTINGS_RESET_ID,
              success: i18n.getMessage(
                'dependencies.ngbsm.filters.reset.success'
              ),
            });
            $rootScope.$broadcast('ngbsm.view_significantly_changed');
            $scope.loadOptions(CONFIG.FILTERS_DEFAULT);
            if (!doNotLoadScript) {
              $scope.runScript(false);
            }
          };
          $rootScope.$on('ngbsm_post_reset', function () {
            $scope.postReset(false);
          });
          $scope.overrideLevel = function (doNotReloadMap) {
            $rootScope.$broadcast('ngbsm.set_max_level', $scope.maxLevels);
            if (!doNotReloadMap) {
              $rootScope.$broadcast('ngbsm.view_significantly_changed');
            }
          };
          $scope.negate = function (flagName) {
            $scope[flagName] = !$scope[flagName];
          };
          $scope.stopEvent = function (event) {
            event.stopPropagation();
          };
          $scope.onMapScriptChange = function (select) {
            $scope.savedScripts.selected.value = select.value;
          };
          function loadScriptsNames() {
            bsmFilters.loadScripts(g_user.userID).then(function (scripts) {
              $scope.savedScripts.options = [];
              $scope.savedScripts.options.push({
                label: DEFAULT_CAPTION,
                value: '',
              });
              if (scripts && scripts.length > 0) {
                for (var i = 0; i < scripts.length; i++) {
                  if (!angular.isUndefined(scripts[i])) {
                    $scope.savedScripts.options.push({
                      label: scripts[i].name,
                      value: scripts[i].sys_id,
                    });
                  }
                }
              }
            });
          }
          function updateSavedFilterOptions(callback) {
            bsmFilters.loadFilters(g_user.userID).then(function (filters) {
              if (filters && filters.length > 0) {
                $timeout(function () {
                  var saveIndex = 0;
                  var enumeratedDefaultFilter = bsmFilters.enumerateFilter(
                    bsmGraph.current(),
                    CONFIG.FILTERS_DEFAULT
                  );
                  $scope.savedFilters.options = [
                    { label: DEFAULT_CAPTION, value: enumeratedDefaultFilter },
                  ];
                  for (var i = 0; i < filters.length; i++) {
                    if ($scope.saveName === filters[i].name) {
                      saveIndex = i + 1;
                    }
                    $scope.savedFilters.options.push({
                      label: filters[i].name,
                      value: JSON.parse(filters[i].filter),
                    });
                  }
                  if (!angular.isUndefined(callback)) {
                    $timeout(function () {
                      callback(saveIndex);
                    }, 100);
                  }
                }, 0);
              }
            });
          }
          function handleFilterChanges() {
            bsmFilters.setFilterMode($scope.filterMode);
            if (bsmGraph.current() !== null) {
              bsmFilters.applyFilters(bsmGraph.current());
              bsmIndicators.reapplyIndicators(bsmGraph.current());
              if ($scope.filterAutoLayout) {
                bsmNodeLayout.runCurrentLayout(
                  bsmGraph.current(),
                  bsmGraph.current().root
                );
                bsmLinkLayout.recalculateAllLinks(bsmGraph.current());
                bsmRenderer.drawMinimal(750);
              } else bsmRenderer.drawAll(calculateDrawDuration());
              if ($scope.filterAutoFit) {
                bsmCamera.fitToScreen(bsmGraph.current());
                bsmCamera.moveCamera(1000, false, false);
              }
            }
            $rootScope.$emit('ngbsm.filters_changed');
          }
          function updateLastLongDraw(event, data) {
            lastLongDraw.time = Date.now();
            lastLongDraw.duration = data.duration;
          }
          function calculateDrawDuration() {
            if (Date.now() < lastLongDraw.time + lastLongDraw.duration)
              return lastLongDraw.duration - (Date.now() - lastLongDraw.time);
            else return 0;
          }
        },
      };
    }
  );