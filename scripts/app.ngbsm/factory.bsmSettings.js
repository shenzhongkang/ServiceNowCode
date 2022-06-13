/*! RESOURCE: /scripts/app.ngbsm/factory.bsmSettings.js */
angular.module('sn.ngbsm').factory('bsmSettings', [
  '$parse',
  '$rootScope',
  '$timeout',
  'bsmCamera',
  'bsmCanvas',
  'bsmFilters',
  'bsmGraph',
  'bsmIndicators',
  'bsmLinkLayout',
  'bsmNodeLayout',
  'bsmRenderer',
  'bsmURL',
  'CONFIG',
  'i18n',
  function (
    $parse,
    $rootScope,
    $timeout,
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
    var defaultFilterOptions = bsmFilters.enumerateFilter(
      bsmGraph.current(),
      CONFIG.FILTERS_DEFAULT
    );
    var defaultCaption =
      '[ ' +
      i18n.getMessage('dependencies.ngbsm.filters.default.caption') +
      ' ]';
    var defaultMaxLevels = 3;
    var settingsResetId = 98;
    var settingsLoadId = 99;
    var scriptLoading = false;
    var lastCustomGraphScript = '';
    var lastPredefinedFilter = '';
    var lastLongDraw = {
      time: Date.now(),
      duration: 0,
    };
    var scope = $rootScope.$new(true);
    scope.state = {
      maxLevels: bsmURL.getParameter('level') || CONFIG.DEFAULT_MAX_LEVELS,
      filters: bsmFilters.getFilters(),
      scripts: bsmFilters.getMapScripts(),
      filterMode: CONFIG.FILTERS_REMOVE_FILTERED_ITEMS,
      filterAutoLayout: CONFIG.FILTERS_RUN_LAYOUT_AUTOMATICALLY,
      filterAutoFit: CONFIG.FILTERS_FIT_TO_SCREEN_AUTOMATICALLY,
      scriptLoading: false,
      saveName: '',
      savedFilters: {
        selected: {
          label: defaultCaption,
          value: defaultFilterOptions,
        },
        options: [
          {
            label: defaultCaption,
            value: defaultFilterOptions,
          },
        ],
        align: 'left',
      },
      savedScripts: {
        selected: {
          label: defaultCaption,
          value: '',
        },
        options: [],
        align: 'left',
      },
      savedPredefinedFilter: {
        selected: {
          label: defaultCaption,
          value: '',
        },
        options: [],
        align: 'left',
      },
    };
    $timeout(function () {
      _loadSavedScripts();
      _loadSavedFilters();
      _loadSavedPredefinedFilter();
    });
    scope.$watch('state.maxLevels', function (current, previous) {
      if (angular.isUndefined(current) || current === '')
        current = defaultMaxLevels;
      bsmFilters.setCurrentFormElementOption('current', current);
    });
    scope.$watch('state.filters', _onFilterChange, true);
    scope.$watch('state.filterMode', function (current, previous) {
      bsmFilters.setCurrentFormElementOption('filterMode', current);
    });
    scope.$watch('state.filterAutoLayout', function (current, previous) {
      bsmFilters.setCurrentFormElementOption('filterAutoLayout', current);
    });
    scope.$watch('state.filterAutoFit', function (current, previous) {
      bsmFilters.setCurrentFormElementOption('filterAutoFit', current);
    });
    scope.$watch('state.savedScripts.selected', function (current, previous) {
      bsmFilters.setCurrentFormElementOption('mapscript', current);
    });
    scope.$watch(
      'state.savedPredefinedFilter.selected',
      function (current, previous) {
        bsmFilters.setCurrentFormElementOption('predefinedFilters', current);
      }
    );
    $rootScope.$on('dv_filter_updated', _syncFromFiltersFactory);
    function _loadSavedScripts() {
      bsmFilters.loadScripts(g_user.userID).then(function (scripts) {
        scope.state.savedScripts.options = [];
        scope.state.savedScripts.options.push({
          label: defaultCaption,
          value: '',
        });
        if (scripts && scripts.length > 0) {
          var defaultMapScriptID = bsmURL.getParameter('mapScriptID');
          for (var i = 0; i < scripts.length; i++) {
            if (!angular.isUndefined(scripts[i])) {
              var lastObjIndex = scope.state.savedScripts.options.push({
                label: scripts[i].name,
                value: scripts[i].sys_id,
              });
            }
            if (defaultMapScriptID === scripts[i].sys_id) {
              scope.state.savedScripts.selected =
                scope.state.savedScripts.options[lastObjIndex - 1];
            }
          }
        }
      });
    }
    function _loadSavedPredefinedFilter() {
      bsmFilters
        .loadPredefinedFilter(g_user.userID)
        .then(function (predefinedFilter) {
          scope.state.savedPredefinedFilter.options = [];
          scope.state.savedPredefinedFilter.options.push({
            label: defaultCaption,
            value: '',
          });
          if (predefinedFilter && predefinedFilter.length > 0) {
            var defaultPredefinedFilterId = bsmURL.getParameter('preFilterId');
            for (var i = 0; i < predefinedFilter.length; i++) {
              if (!angular.isUndefined(predefinedFilter[i])) {
                var lastObjIndex =
                  scope.state.savedPredefinedFilter.options.push({
                    label: predefinedFilter[i].name,
                    value: predefinedFilter[i].sys_id,
                  });
                if (defaultPredefinedFilterId === predefinedFilter[i].sys_id) {
                  scope.state.savedPredefinedFilter.selected =
                    scope.state.savedPredefinedFilter.options[lastObjIndex - 1];
                }
              }
            }
          }
        });
    }
    function _loadSavedFilters(callback) {
      bsmFilters.loadFilters(g_user.userID).then(function (filters) {
        if (filters && filters.length > 0) {
          scope.state.savedFilters.options = [
            {
              label: defaultCaption,
              value: defaultFilterOptions,
            },
          ];
          var newlyAddedIndex = 0;
          for (var i = 0; i < filters.length; i++) {
            if (scope.state.saveName === filters[i].name)
              newlyAddedIndex = i + 1;
            scope.state.savedFilters.options.push({
              label: sanitizeHtml(filters[i].name),
              value: JSON.parse(filters[i].filter),
            });
          }
          if (!angular.isUndefined(callback)) callback(newlyAddedIndex);
        }
      });
    }
    function _onFilterChange() {
      bsmFilters.setFilterMode(scope.state.filterMode);
      if (bsmGraph.current() !== null) {
        bsmFilters.applyFilters(bsmGraph.current());
        bsmIndicators.reapplyIndicators(bsmGraph.current());
        if (scope.state.filterAutoLayout) {
          bsmNodeLayout.runCurrentLayout(
            bsmGraph.current(),
            bsmGraph.current().root
          );
          bsmLinkLayout.recalculateAllLinks(bsmGraph.current());
          bsmRenderer.drawMinimal(750);
        } else bsmRenderer.drawAll(_calculateDrawDuration());
        if (scope.state.filterAutoFit) {
          bsmCamera.fitToScreen(bsmGraph.current());
          bsmCamera.moveCamera(1000, false, false);
        }
      }
      $rootScope.$emit('ngbsm.filters_changed');
    }
    function _isValidFilter(allowDefault) {
      allowDefault = allowDefault ? true : false;
      if (allowDefault) {
        if (
          scope.state.savedFilters.selected ===
          scope.state.savedFilters.options[0]
        )
          return true;
      }
      if (!scope.state.savedFilters.selected.value) return false;
      return true;
    }
    function _syncToFiltersFactory() {
      bsmFilters.setCurrentFormElementOption('current', scope.state.maxLevels);
      bsmFilters.setCurrentFormElementOption(
        'filterMode',
        scope.state.filterMode
      );
      bsmFilters.setCurrentFormElementOption(
        'filterAutoLayout',
        scope.state.filterAutoLayout
      );
      bsmFilters.setCurrentFormElementOption(
        'filterAutoFit',
        scope.state.filterAutoFit
      );
      bsmFilters.setCurrentFormElementOption(
        'mapscript',
        scope.state.savedScripts.selected
      );
      bsmFilters.setCurrentFormElementOption(
        'predefinedFilters',
        scope.state.savedPredefinedFilter.selected
      );
      $rootScope.$broadcast('bsm_spinner_value_set', scope.state.maxLevels);
      $rootScope.$broadcast('ngbsm.set_max_level', scope.state.maxLevels);
    }
    function _syncFromFiltersFactory() {
      scope.state.maxLevels = bsmFilters.getCurrentPropertyValue('current');
      scope.state.filterMode = bsmFilters.getCurrentPropertyValue('filterMode');
      scope.state.filterAutoLayout =
        bsmFilters.getCurrentPropertyValue('filterAutoLayout');
      scope.state.filterAutoFit =
        bsmFilters.getCurrentPropertyValue('filterAutoFit');
      scope.state.savedScripts.selected =
        bsmFilters.getCurrentPropertyValue('mapscript');
      scope.state.savedPredefinedFilter.selected =
        bsmFilters.getCurrentPropertyValue('predefinedFilters');
      $rootScope.$broadcast('bsm_spinner_value_set', scope.state.maxLevels);
      $rootScope.$broadcast('ngbsm.set_max_level', scope.state.maxLevels);
    }
    function _findScriptByValue(value) {
      var scriptList = scope.state.savedScripts.options;
      for (var i = 0; i < scriptList.length; i++) {
        if (scriptList[i].value === value) {
          return scriptList[i];
        }
      }
      return scriptList[0];
    }
    function _updateLastLongDraw(event, data) {
      lastLongDraw.time = Date.now();
      lastLongDraw.duration = data.duration;
    }
    function _calculateDrawDuration() {
      if (Date.now() < lastLongDraw.time + lastLongDraw.duration)
        return lastLongDraw.duration - (Date.now() - lastLongDraw.time);
      else return 0;
    }
    function _get() {
      return scope.state;
    }
    function _setMaxLevels(skipReload) {
      $rootScope.$broadcast('ngbsm.set_max_level', scope.state.maxLevels);
      if (!skipReload) {
        $rootScope.$broadcast('ngbsm.view_significantly_changed');
      }
    }
    function _saveFilters() {
      var lsm = function (saveIndex) {
        if (scope.state.savedFilters.options.length > 0)
          scope.state.savedFilters.selected =
            scope.state.savedFilters.options[saveIndex];
        scope.state.saveName = '';
      };
      if (scope.state.saveName && scope.state.saveName.length >= 4) {
        bsmFilters
          .saveFilters(g_user.userID, scope.state.saveName)
          .then(function () {
            _loadSavedFilters(lsm);
          });
      } else {
        $rootScope.$broadcast('ngbsm.warning', {
          warning: i18n.getMessage('dependencies.ngbsm.filters.warning.name'),
        });
      }
    }
    function _loadFilters(doRunScript) {
      doRunScript = doRunScript ? true : false;
      if (!_isValidFilter(true)) {
        $rootScope.$broadcast('ngbsm.error', {
          error: i18n.getMessage('dependencies.ngbsm.filters.error.no.filter'),
        });
        return;
      }
      if (
        scope.state.savedFilters.selected ===
        scope.state.savedFilters.options[0]
      ) {
        _resetFilters();
        return;
      }
      bsmFilters.replaceFilters(scope.state.savedFilters.selected.value);
      $rootScope.$broadcast('ngbsm.view_significantly_changed');
      $rootScope.$broadcast('ngbsm.success', {
        id: settingsLoadId,
        success:
          i18n.getMessage('dependencies.ngbsm.filters.loaded.success') +
          " '" +
          scope.state.savedFilters.selected.label +
          "'",
      });
      if (doRunScript) _runScript();
    }
    function _applyPredefinedFilter() {
      scope.state.savedScripts.selected = scope.state.savedScripts.options[0];
      $rootScope.$broadcast(
        'ngbsm.set_map_script',
        scope.state.savedScripts.selected.value
      );
      var val = scope.state.savedPredefinedFilter.selected;
      if (val === scope.state.savedPredefinedFilter.options[0]) {
        $rootScope.$broadcast('ngbsm.applyPredefinedFilter', val);
        lastPredefinedFilter = val;
        _resetFilters();
        return;
      } else {
        if (lastPredefinedFilter !== val || bsmURL.getParameter('debug')) {
          lastPredefinedFilter = val;
          scriptLoading = true;
          $rootScope.$broadcast('ngbsm.applyPredefinedFilter', val);
          _setMaxLevels();
        }
      }
    }
    function _runScript(resetFilters) {
      scope.state.savedPredefinedFilter.selected =
        scope.state.savedPredefinedFilter.options[0];
      $rootScope.$broadcast(
        'ngbsm.applyPredefinedFilter',
        scope.state.savedPredefinedFilter.selected
      );
      var val = scope.state.savedScripts.selected.value;
      if (lastCustomGraphScript !== val || bsmURL.getParameter('debug')) {
        lastCustomGraphScript = val;
        scriptLoading = true;
        $rootScope.$broadcast('ngbsm.set_map_script', val);
        _setMaxLevels();
        if (resetFilters) _resetFilters(true);
      }
    }
    function _resetFilters(doNotLoadScript) {
      scope.state.savedFilters.selected = scope.state.savedFilters.options[0];
      scope.state.savedScripts.selected = scope.state.savedScripts.options[0];
      scope.state.savedPredefinedFilter.selected =
        scope.state.savedPredefinedFilter.options[0];
      scope.state.filterMode = CONFIG.FILTERS_REMOVE_FILTERED_ITEMS;
      scope.state.filterAutoLayout = CONFIG.FILTERS_RUN_LAYOUT_AUTOMATICALLY;
      scope.state.filterAutoFit = CONFIG.FILTERS_FIT_TO_SCREEN_AUTOMATICALLY;
      scope.state.maxLevels =
        bsmURL.getParameter('level') || CONFIG.DEFAULT_MAX_LEVELS;
      _syncToFiltersFactory();
      bsmFilters.resetFilters();
      bsmFilters.enumerateFilters(bsmGraph.current());
      bsmFilters.applyFilters(bsmGraph.current());
      bsmRenderer.drawAll(0);
      $rootScope.$broadcast('ngbsm.view_significantly_changed');
      $rootScope.$broadcast('ngbsm.success', {
        id: settingsResetId,
        success: i18n.getMessage('dependencies.ngbsm.filters.reset.success'),
      });
      if (!doNotLoadScript) {
        if (
          lastPredefinedFilter !== scope.state.savedPredefinedFilter.options[0]
        ) {
          _applyPredefinedFilter();
        } else if (
          lastCustomGraphScript !== scope.state.savedScripts.options[0]
        ) {
          _runScript(false);
        }
      }
    }
    return {
      get: _get,
      setMaxLevels: _setMaxLevels,
      saveFilters: _saveFilters,
      loadFilters: _loadFilters,
      runScript: _runScript,
      applyPredefinedFilter: _applyPredefinedFilter,
      resetFilters: _resetFilters,
    };
  },
]);