/*! RESOURCE: /scripts/sn/common/util/directive.snBanner.js */
angular
  .module('sn.common.util')
  .directive('snBanner', function (getTemplateUrl, $window, $http) {
    'use strict';
    function isIOS() {
      var match = navigator.userAgent.match(/iPhone; CPU iPhone OS ([0-9_]*)/);
      return !!match;
    }
    function isNative() {
      return (
        navigator.userAgent.match(/SnMobile/i) ||
        navigator.userAgent.match(/ServiceNow/i)
      );
    }
    var isBannerClosed = function () {
      var localStorageTime = $window.localStorage.getItem(
        'mobileBannerDismissed'
      );
      var isBannerClosedFlag = false;
      var SECONDS_IN_A_DAY = 86400000;
      if (localStorageTime) {
        if ((Date.now() - localStorageTime) / SECONDS_IN_A_DAY < 1) {
          isBannerClosedFlag = true;
        } else {
          $window.localStorage.removeItem('mobileBannerDismissed');
        }
      }
      return isBannerClosedFlag;
    };
    var setBannerClosedTime = function () {
      $window.localStorage.setItem('mobileBannerDismissed', Date.now());
    };
    var emitBannerState = function (state, $scope) {
      $scope.$emit(state);
    };
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('sn_banner.xml'),
      scope: {
        bannerApiUrl: '=',
      },
      controller: function ($scope) {
        $scope.isIOS = isIOS();
        $scope.closeBanner = function () {
          $scope.banner.show = false;
          setBannerClosedTime();
          emitBannerState('banner.closed', $scope);
        };
        $scope.openUrl = function () {
          $window.open($scope.banner.nativeAppUrl, '_blank');
        };
        $scope.$watch('bannerApiUrl', function (newVal, oldVal) {
          if (newVal && newVal !== oldVal) {
            setBanner(newVal);
          }
        });
        function setBanner(bannerApiUrl) {
          $scope.banner = {};
          if (isBannerClosed()) {
            $scope.banner.show = false;
            return;
          }
          if (isNative()) {
            $scope.banner.show = false;
            return;
          }
          $http.get(bannerApiUrl).then(function (response) {
            var data = response.data;
            if (data.BannerDetails) {
              $scope.banner.show = true;
              $scope.banner.icon = data.BannerDetails.IconPath;
              $scope.banner.name = data.BannerDetails.Name;
              $scope.banner.description = data.BannerDetails.Description;
              $scope.banner.nativeAppUrl = data.BannerDetails.Ulink;
              emitBannerState('banner.opened', $scope);
            } else {
              $scope.banner.show = false;
              emitBannerState('banner.closed', $scope);
            }
          });
        }
      },
    };
  });