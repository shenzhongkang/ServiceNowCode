/*! RESOURCE: /scripts/app.$sp/directive.spFacetList.js */
angular
  .module('sn.$sp')
  .directive('spFacetList', function (i18n, spFacetManager, spAriaUtil) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        listTitle: '=',
        t: '=',
        facets: '=',
        loading: '=',
        collapsed: '=',
        collpasedMap: '=',
        toggleSearchsource: '=',
        collapsedSearchsource: '=',
      },
      templateUrl: 'sp_facet_list.xml',
      controllerAs: 'c',
      controller: function ($scope) {
        var c = this;
        c.showClearAll = shouldShowClearAll();
        c.show = $scope.facets && $scope.facets.length !== 0;
        c.collapsed = $scope.collapsedSearchsource;
        $scope.$on('$locationChangeSuccess', onLocationChangeSuccess);
        function onLocationChangeSuccess(event, newUrl, oldUrl) {
          c.showClearAll = shouldShowClearAll();
        }
        function searchSourceChanged(newUrl, oldUrl) {
          var newUrlParams = newUrl.match(/t=.+/),
            oldUrlParams = oldUrl.match(/t=.+/);
          if (!newUrlParams && !oldUrlParams) {
            return false;
          }
          if (
            (!newUrlParams && oldUrlParams) ||
            (newUrlParams && !oldUrlParams)
          ) {
            return true;
          }
          return (
            newUrlParams[0].split('&')[0] !== oldUrlParams[0].split('&')[0]
          );
        }
        function shouldShowClearAll() {
          for (var i = 0; i < $scope.facets.length; i++) {
            if (spFacetManager.isFacetSelected($scope.facets[i].id, $scope.t)) {
              return true;
            }
          }
          return false;
        }
        c.toggleIcon = function (title) {
          c.collapsed = !c.collapsed;
          spFacetManager.publish('spSearchSources.toggle.data', {
            searchSource: $scope.t,
            collapsed: c.collapsed,
          });
          if (c.collapsed)
            spAriaUtil.sendLiveMessage(c.i18n.isCollapsed.withValues([title]));
          else
            spAriaUtil.sendLiveMessage(c.i18n.isExpanded.withValues([title]));
        };
        c.i18n = {
          clearAll: i18n.getMessage('Clear All'),
          loading: i18n.getMessage('Loading'),
          filterSelectionCleared: i18n.getMessage(
            'filter selection has cleared for {0} and search results updated'
          ),
          filterSelected: i18n.getMessage(
            'Filter selected {0} and search results updated'
          ),
          filterSelectedWithLabels: i18n.getMessage(
            'Filter selected {0} {1} and search results updated'
          ),
          isCollapsed: i18n.getMessage('{0} is collapsed'),
          isExpanded: i18n.getMessage('{0} is Expanded'),
          allFacetsCleared: i18n.getMessage(
            'All facets have been cleared, and search results have been updated'
          ),
          enabled: i18n.getMessage('Enabled'),
          disabled: i18n.getMessage('Disabled'),
        };
        c.showClear = function (facet) {
          return spFacetManager.isFacetSelected(facet.id, $scope.t);
        };
        c.clearAll = function () {
          spFacetManager.clearAllFacet();
          spAriaUtil.sendLiveMessage(c.i18n.allFacetsCleared);
        };
        c.onSelectFacet = function (menu, input) {
          if (Array.isArray(input)) {
            var values = input.map(function (item) {
              return item.value;
            });
            if ($scope.t) {
              spFacetManager.addFacetWithSearchSource(
                $scope.t,
                menu.id,
                values
              );
            } else {
              spFacetManager.addFacet(menu.id, values);
            }
            spAriaUtil.sendLiveMessage(
              c.i18n.filterSelected.withValues([menu.label])
            );
          } else {
            var item = input;
            if ($scope.t) {
              spFacetManager.addFacetWithSearchSource(
                $scope.t,
                menu.id,
                item.value
              );
            } else {
              spFacetManager.addFacet(menu.id, item.value);
            }
            spAriaUtil.sendLiveMessage(
              c.i18n.filterSelectedWithLabels.withValues([
                menu.label,
                item.label,
              ])
            );
          }
        };
        c.clearFacet = function (menu) {
          spFacetManager.clearFacet(menu.id);
          spAriaUtil.sendLiveMessage(
            c.i18n.filterSelectionCleared.withValues([menu.label])
          );
          c.showClearAll = shouldShowClearAll();
        };
        c.isCollapsed = function (menuId) {
          return $scope.collpasedMap &&
            $scope.collpasedMap[menuId] !== undefined
            ? $scope.collpasedMap[menuId]
            : $scope.collapsed;
        };
        c.onFacetToggle = function (menuId, collapsed) {
          spFacetManager.publish('spFacets.toggle.data', {
            searchSource: $scope.t,
            facetId: menuId,
            collapsed: collapsed,
          });
        };
      },
    };
  });
