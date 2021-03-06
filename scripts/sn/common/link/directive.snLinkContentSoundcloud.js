/*! RESOURCE: /scripts/sn/common/link/directive.snLinkContentSoundcloud.js */
angular
  .module('sn.common.link')
  .directive(
    'snLinkContentSoundcloud',
    function (getTemplateUrl, $sce, inFrameSet) {
      'use strict';
      return {
        restrict: 'A',
        replace: true,
        templateUrl: getTemplateUrl('snLinkContentSoundcloud.xml'),
        scope: {
          link: '=',
        },
        controller: function ($scope) {
          $scope.playerActive = false;
          $scope.width = inFrameSet ? '248px' : '500px';
          $scope.height = inFrameSet ? '139px' : '281px';
          $scope.showPlayer = function () {
            $scope.playerActive = true;
          };
          $scope.getVideoEmbedLink = function () {
            if ($scope.link.embedLink) {
              var videoLink = $scope.link.embedLink + '&amp;auto_play=true';
              var width = inFrameSet ? 248 : 500;
              return $sce.trustAsHtml(
                "<iframe width='" +
                  $scope.width +
                  "' height='" +
                  $scope.height +
                  "' autoplay='1' frameborder='0' allowfullscreen='' src='" +
                  videoLink +
                  "'></iframe>"
              );
            }
          };
        },
      };
    }
  );
