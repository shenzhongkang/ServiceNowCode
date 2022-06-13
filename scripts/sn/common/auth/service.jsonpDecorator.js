/*! RESOURCE: /scripts/sn/common/auth/service.jsonpDecorator.js */
angular.module('sn.common.auth').config([
  '$provide',
  '$sceDelegateProvider',
  function ($provide, $sceDelegateProvider) {
    var jsonpEnableInclusionList = 'true' !== 'false';
    if (jsonpEnableInclusionList) {
      var jsonpInclusionList = 'self' || 'self';
      $sceDelegateProvider.resourceUrlWhitelist(jsonpInclusionList.split(','));
    }
    $provide.decorator('$sce', [
      '$delegate',
      function $sceDecorator($delegate) {
        if (jsonpEnableInclusionList) return $delegate;
        var originalGetTrusted = $delegate.getTrusted;
        function isNotEmpty(maybeTrusted) {
          return (
            maybeTrusted !== null &&
            !angular.isUndefined(maybeTrusted) &&
            maybeTrusted !== ''
          );
        }
        $delegate.getTrusted = function decorateGetTrusted(type, maybeTrusted) {
          if (
            type === 'resourceUrl' &&
            isNotEmpty(maybeTrusted) &&
            angular.isString(maybeTrusted)
          )
            maybeTrusted = $delegate.trustAsResourceUrl(maybeTrusted);
          return originalGetTrusted.apply($delegate, [type, maybeTrusted]);
        };
        $delegate.getTrustedResourceUrl = function decoratedGetTrustedUrl(
          maybeTrusted
        ) {
          return $delegate.getTrusted('resourceUrl', maybeTrusted);
        };
        return $delegate;
      },
    ]);
  },
]);
