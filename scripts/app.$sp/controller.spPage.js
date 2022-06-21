/*! RESOURCE: /scripts/app.$sp/controller.spPage.js */
angular
  .module('sn.$sp')
  .controller(
    'spPageCtrl',
    function (
      $scope,
      $http,
      $location,
      $window,
      spAriaUtil,
      spUtil,
      spMetatagService,
      spAnnouncement,
      snRecordWatcher,
      $rootScope,
      spPage,
      spAriaFocusManager,
      $timeout,
      spAtf,
      spGtd,
      spContextManager,
      tinymceService,
      snAnalyticsUtil,
      snAnalytics
    ) {
      'use strict';
      var _ = $window._;
      var c = this;
      var hasDynamicHeaderFooter = true;
      c.doAnimate = false;
      c.firstPage = true;
      c.loadingIndicator = false;
      $scope.theme = {};
      $scope.page = {
        title: 'Loading...',
      };
      $scope.sessions = {};
      $scope.$on('sp_loading_indicator', function (e, value) {
        c.loadingIndicator = value;
      });
      if ($window.NOW.sp_show_console_error) {
        spPage.showBrowserErrors();
      }
      tinymceService.loadTinymceAsync();
      c.parseJSON = function (str) {
        return JSON.parse(str);
      };
      c.isObjectEmpty = function (obj) {
        if (obj && typeof obj === 'object')
          return Object.keys(obj).length === 0;
      };
      c.getContainerClasses = function (container) {
        var classes = [];
        if (!container.bootstrap_alt) {
          classes[classes.length] = container.width;
        }
        if (container.container_class_name) {
          classes[classes.length] = container.container_class_name;
        }
        return classes;
      };
      var oid = $location.search().id;
      var oldPath = $location.path();
      var locationChanged = false;
      function isNavigateOutPortal(newUrl, oldUrl) {
        var newUrlParser = document.createElement('a'),
          oldUrlParser = document.createElement('a');
        newUrlParser.href = newUrl;
        oldUrlParser.href = oldUrl;
        if (newUrlParser.hostname !== oldUrlParser.hostname) return true;
        if (newUrlParser.pathname === oldUrlParser.pathname) return false;
        return true;
      }
      $rootScope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
        if (newUrl !== oldUrl && isNavigateOutPortal(newUrl, oldUrl)) {
          event.preventDefault();
          $window.location = newUrl;
        }
      });
      $rootScope.$on('$locationChangeSuccess', function (e, newUrl, oldUrl) {
        locationChanged = oldUrl != newUrl;
        var s = $location.search();
        var p = $location.path();
        if (oldPath != p) {
          $window.location.href = $location.absUrl();
          return;
        }
        if (angular.isDefined($scope.containers) && oid == s.id && s.spa) {
          return;
        }
        if (spPage.isHashChange(newUrl, oldUrl)) {
          return;
        }
        if (!g_persist_msgs_through_page_nav)
          $scope.$broadcast('$$uiNotification.dismiss');
        if ((newUrl = spPage.containsSystemPage(p))) {
          $window.location.href = newUrl;
          return;
        }
        if (!$window.NOW.has_access && locationChanged) {
          $window.location.href = $location.absUrl();
          return;
        }
        oid = s.id;
        getPage();
      });
      $rootScope.$on('sp.page.loaded', function () {
        if (spUtil.isMobile()) spUtil.setMobileBanner($scope);
      });
      function loadPage(r) {
        var response = r.data.result;
        spMetatagService.setTags(response.metatags);
        spMetatagService.setSeoTags(response.seotags);
        c.firstPage = false;
        $scope.containers = _.filter(response.containers, {
          subheader: false,
        });
        $scope.subheaders = _.filter(response.containers, {
          subheader: true,
        });
        var p = response.page;
        var u = response.user;
        if (!spPage.isPublicOrUserLoggedIn(p, u)) {
          if (locationChanged) {
            $window.location.href = $location.absUrl();
            return;
          }
        }
        $rootScope.page = $scope.page = p;
        $(spPage.getElement(p)).remove();
        $(spPage.getStyle(p)).appendTo('head');
        response.portal = $rootScope.portal;
        $window.document.title = spPage.getTitle(response);
        $scope.$broadcast('$sp.scroll', { position: 0 });
        if (response.theme) {
          var theme = response.theme;
          $rootScope.theme = $scope.theme = theme;
          var isHeaderDynamic =
            theme.header && theme.header['static'] === false;
          var isFooterDynamic =
            theme.footer && theme.footer['static'] === false;
          hasDynamicHeaderFooter = !!(isHeaderDynamic || isFooterDynamic);
        }
        c.style = spPage.getClasses($scope);
        if (!$scope.user) {
          $rootScope.user = $scope.user = {};
        }
        $scope.g_accessibility = spAriaUtil.g_accessibility;
        angular.extend($scope.user, response.user);
        $scope.user.logged_in = spPage.userLoggedIn($scope.user);
        $scope.$broadcast('$$uiNotification', response.$$uiNotification);
        if ($scope.user.logged_in && !p.omit_watcher) snRecordWatcher.init();
        $timeout(function () {
          c.doAnimate = true;
        }, 500);
        if (spUtil.isMobile()) {
          NOW.sp.enableTours = false;
        }
        if (NOW && NOW.sp && NOW.sp.enableTours && $scope.user.logged_in) {
          spGtd
            .getToursForPage({
              portal: $rootScope.portal,
              page: $rootScope.page,
              user: $rootScope.user,
            })
            .then(function (data) {
              $rootScope.$broadcast('sp-menu-update-tours', data);
              $scope.$on('sp-header-loaded', function () {
                $rootScope.$broadcast('sp-menu-update-tours', data);
              });
            });
        }
        spContextManager.init();
        var recordInfo = {};
        var queryParams = $location.search();
        Object.keys(queryParams).forEach(function (key) {
          if (key === 'table' || key === 'sys_id')
            recordInfo[key] = queryParams[key];
        });
        if (recordInfo.table || recordInfo.sys_id)
          spContextManager.updateContextForKey('record', recordInfo);
        sendAnalytics(response.page);
        return r;
      }
      function sendAnalytics(page) {
        snAnalytics.startPage(page.id, page.static_title);
      }
      $rootScope.$on('sn.ucm.finished', function () {
        sendAnalytics($scope.page);
        if (NOW.ucm_invocations != 1) return;
        var payload = {};
        payload.name = 'Successful Login';
        payload.data = {};
        payload.data['Login'] = 'true';
        snAnalytics.addEvent(payload);
      });
      function setupAtf() {
        spAtf.init().then(function (atf) {
          atf.triggerPageLoaded();
        });
      }
      function signalPageLoaded() {
        $rootScope.$emit('sp.page.loaded', $rootScope);
        displayAnalyticsConsentModal();
      }
      function displayAnalyticsConsentModal() {
        if (
          $rootScope.portal &&
          $rootScope.portal.sys_id == 'db57a91047001200ba13a5554ee49050'
        )
          return;
        snAnalyticsUtil.invokeUCMEngine();
      }
      function getSPPageResponse() {
        if (NOW.spPageResponse) {
          return NOW.spPageResponse.then(function (response) {
            return {
              data: response,
            };
          });
        } else {
          return $http({
            method: 'GET',
            url: spPage.getUrl($scope.portal_id, !hasDynamicHeaderFooter),
            headers: spUtil.getHeaders(),
          });
        }
      }
      function getPage() {
        return getSPPageResponse()
          .then(loadPage, handlePageLoadErrors)
          .then(function (res) {
            spAnnouncement
              .init(res.data.result.announcements)
              .then(function () {
                spAriaFocusManager.pageLoadComplete($location.url());
                setupAtf();
              });
          })
          .then(signalPageLoaded)
          .then(function () {
            NOW.spPageResponse = null;
          });
      }
      function handlePageLoadErrors(error) {
        var absUrl = $location.absUrl();
        var url = $location.url();
        var path = $location.path();
        if ('Unauthorized' == error.statusText || '401' == error.status) {
          absUrl = absUrl.replace(
            url,
            path + '?sysparm_goto_url=' + $rootScope.portal.url_suffix
          );
          $window.location.href = absUrl;
        }
        console.error(error);
        return Promise.reject(error);
      }
      $scope.$on('sp.page.reload', getPage);
      $($window).keydown(spPage.saveOnCtrlS);
      $scope.$on('$destroy', function () {
        $($window).off('keydown', spPage.saveOnCtrlS);
      });
      c.focusOnPageTitle = function (focusFirstTabbableEl, $event) {
        spAriaFocusManager.focusOnPageTitle(focusFirstTabbableEl, $event);
      };
      c.focusOnAgentChat = function () {
        spAriaFocusManager.focusOnAgentChat();
      };
      spAriaUtil.init();
    }
  );
