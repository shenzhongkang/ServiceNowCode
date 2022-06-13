/*! RESOURCE: /scripts/app.ngbsm/controller.ngBsm.js */
angular
  .module('sn.ngbsm')
  .controller(
    'ngBsm',
    function (
      $scope,
      $timeout,
      $injector,
      bsmCanvas,
      bsmGraph,
      bsmSearchRepository,
      bsmViewRepository,
      CONFIG,
      i18n,
      CONST,
      ngBsmConstants,
      cmdbMatomo,
      bsmURL,
      amb
    ) {
      cmdbMatomo.trackEvent(
        ngBsmConstants.MATOMO.CATEGORY,
        ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_OPENED,
        ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_OPENED
      );
      cmdbMatomo.trackEvent(
        ngBsmConstants.MATOMO.CATEGORY,
        ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_USER_ROLES,
        ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_USER_ROLES +
          ' ' +
          g_user.roles.toString()
      );
      referrer = 'Direct';
      if (bsmURL.getParameter('referrer') === 'form') {
        referrer = 'Form';
      }
      cmdbMatomo.trackEvent(
        ngBsmConstants.MATOMO.CATEGORY,
        ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_REFERRER,
        ngBsmConstants.MATOMO.EVENTS.NG_BSM_MAP_REFERRER + ' ' + referrer
      );
      $scope.initializing = true;
      $scope.mapLoading = true;
      $scope.title = undefined;
      $scope.menu = {
        options: [
          {
            label: i18n.getMessage('dependencies.ngbsm.title.option.save'),
            icon: 'icon-drawer',
            action: function () {
              bsmViewRepository.saveView(
                bsmGraph.current(),
                g_user.userID,
                bsmGraph.current().id
              );
            },
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.title.option.load'),
            icon: 'icon-folder',
            action: function () {
              bsmViewRepository.loadView(g_user.userID, bsmGraph.current().id);
            },
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.title.option.last'),
            icon: 'icon-arrow-left',
            action: function () {
              bsmGraph.pop();
            },
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.title.option.export'),
            icon: 'icon-image',
            action: function () {
              $scope.$broadcast('ngbsm.export_image');
            },
          },
        ],
      };
      $scope.search = {
        htmlID: 'mapSearchForCI',
        placeholder: i18n.getMessage('dependencies.ngbsm.searchDefault'),
        ariaLabel: i18n.getMessage('dependencies.ngbsm.searchDefault'),
        interval: 500,
        providers: [
          {
            label: 'Infrastructure Views',
            columns: CONFIG.SEARCH_COLUMNS.split(';'),
            call: bsmSearchRepository.searchCi,
          },
        ],
      };
      $scope.explorer = {
        startClosed: true,
        closeable: true,
        userClosable: false,
      };
      $scope.list = {
        tabs: ['manual'],
      };
      $scope.layout = {
        options: [
          {
            label: i18n.getMessage('dependencies.ngbsm.layout.Vertical'),
            value: 'vertical',
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.layout.Horizontal'),
            value: 'horizontal',
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.layout.Radial'),
            value: 'radial',
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.layout.Force'),
            value: 'force',
          },
          {
            label: i18n.getMessage('dependencies.ngbsm.layout.Group'),
            value: 'group',
          },
        ],
        selected: undefined,
      };
      $scope.bottomRelated = {
        open: false,
      };
      $scope.side = {
        open: false,
      };
      $scope.metricModeTab = 'map';
      var saListData = null;
      if (
        parameterEquals('metric_view', true) &&
        window.NOW['flag_sa_metric_enabled'] === true
      )
        saListData = $injector.get('saListData');
      $scope.layout.selected = $scope.layout.options[0];
      $scope.$watch(
        function () {
          if (bsmGraph && bsmGraph.current() && bsmGraph.current().name)
            return bsmGraph.current().name;
          return undefined;
        },
        function (newVal, oldVal) {
          $scope.title = newVal;
        }
      );
      $scope.goBack = function () {
        window.history.back();
      };
      $scope.isTabActive = function (tab) {
        return {
          active: tab === $scope.metricModeTab,
        };
      };
      $scope.selectTab = function (tab) {
        $scope.metricModeTab = tab;
        if ($scope.metricModeTab === 'metric')
          $scope.$broadcast('sn_insights_explorer_open');
        if ($scope.metricModeTab === 'map')
          $scope.$broadcast('sn_insights_explorer_close');
      };
      $scope.layoutEnter = function (e, index) {
        if (e.keyCode === CONST.KEYCODE_ENTER) {
          $scope.layout.selected = $scope.layout.options[index];
        }
      };
      function doneInitializing() {
        $scope.mapLoading = false;
        $scope.initializing = false;
      }
      function clearMetricList() {
        if (parameterEquals('metric_view', true)) {
          $scope.$broadcast('sn_metric_list_clear');
        }
      }
      function populateMetricList() {
        if (parameterEquals('metric_view', true)) {
          var nodes = bsmGraph.current().nodes;
          var cis = [];
          if (nodes && nodes.length > 0) {
            for (var i = 0; i < nodes.length; i++) cis.push(nodes[i].id);
          }
          saListData.getItems(cis.join(',')).then(function (items) {
            $scope.$broadcast('sn_metric_list_clear');
            $scope.$broadcast('sn_metric_list_add_cis', items);
          });
        }
      }
      function parameterEquals(name, value) {
        if (hasParameter(name))
          return window.NOW.bsm.parameters[name] === value;
        return false;
      }
      function hasParameter(name) {
        if (window.NOW && window.NOW.bsm && window.NOW.bsm.parameters)
          if (window.NOW.bsm.parameters[name]) return true;
        return false;
      }
      $scope.$on('ngbsm.new.graph.loaded', doneInitializing);
      $scope.$on('ngbsm.new.graph.loaded', populateMetricList);
      $scope.$on('ngbsm.error', doneInitializing);
      $scope.$on('ngbsm.graph.begin.load', function () {
        $scope.mapLoading = true;
      });
      if (parameterEquals('metric_view', true)) {
        $scope.$on('ngbsm.node_selected', function (event, node) {
          $scope.$broadcast('sn_metric_list_ci_selected', node.id);
        });
      }
    }
  );