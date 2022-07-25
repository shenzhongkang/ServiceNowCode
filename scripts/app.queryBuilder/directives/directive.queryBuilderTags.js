/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderTags.js */
angular.module('sn.queryBuilder').directive('queryBuilderTags', [
  '$rootScope',
  '$timeout',
  'i18n',
  'CONSTQB',
  function ($rootScope, $timeout, i18n, CONST) {
    'use strict';
    return {
      restrict: 'E',
      template:
        '' +
        '<div class="tags-area">' +
        '	<button class="btn btn-default btn-icon icon icon-label" sn-tooltip-basic="' +
        i18n.getMessage('queryBuilder.general.addTags') +
        '" ng-click="openTagsArea($event)" ng-disabled="disableTagsButton()" style="margin-right: 8px;" ng-class="getTagsButtonClasses()" ng-show="canWrite">' +
        '		<span class="sr-only">' +
        i18n.getMessage('queryBuilder.general.addTags') +
        '</span>' +
        '	</button>' +
        '</div>',
      controller: [
        '$scope',
        'tagsService',
        function ($scope, tagsService) {
          $scope.openTagsArea = function (event) {
            $scope.$emit('queryBuilder.displayTags', {
              event: event,
              query: $scope.currentQuery,
            });
          };
          $scope.getTagsButtonClasses = function () {
            return {
              disabled: $scope.currentQuery.sys_id ? false : true,
            };
          };
          $scope.disableTagsButton = function () {
            if ($scope.currentQuery.sys_id) return false;
            return true;
          };
          $scope.$on('queryBuilder.removeTag', function (event, args) {
            var tag = args.tag;
            var index = args.index;
            if (tag.sys_id && $scope.currentQuery.sys_id) {
              tagsService
                .removeTagFromSingle($scope.currentQuery.sys_id, tag.sys_id)
                .then(function (resp) {
                  if (!resp.failed) {
                    $scope.currentQuery.tags.splice(index, 1);
                    updateSavedQueryTags();
                  }
                });
            }
          });
          $scope.$on('queryBuilder.addTag', function (event, args) {
            var tag = args.tag;
            if (!$scope.currentQuery.tags) $scope.currentQuery.tags = [];
            if (!addedTag(tag) && tag !== '') {
              var newTag = {
                display_value: tag,
              };
              if ($scope.currentQuery.sys_id) {
                $scope.currentQuery.tags.push(newTag);
                tagsService
                  .addTagForSingle($scope.currentQuery.sys_id, tag)
                  .then(function (tagID) {
                    if (!tagID.failed) {
                      newTag['sys_id'] = tagID;
                      $scope.$emit('queryBuilder.updateActiveInfoBox', {
                        property: 'tags',
                        value: $scope.currentQuery.tags,
                      });
                      updateSavedQueryTags();
                    }
                  });
              }
            }
          });
          function addedTag(tag) {
            if ($scope.currentQuery && $scope.currentQuery.tags && tag) {
              for (var i = 0; i < $scope.currentQuery.tags.length; i++) {
                if (
                  $scope.currentQuery.tags[i].display_value.toLowerCase() ===
                  tag.toLowerCase()
                )
                  return true;
              }
            }
            return false;
          }
          function updateSavedQueryTags() {
            if ($scope.currentQuery && $scope.currentQuery.sys_id) {
              for (var i = 0; i < $scope.savedQueries.length; i++) {
                if (
                  $scope.savedQueries[i].sys_id === $scope.currentQuery.sys_id
                ) {
                  $scope.savedQueries[i].tags = $scope.currentQuery.tags;
                  break;
                }
              }
            }
          }
        },
      ],
    };
  },
]);
