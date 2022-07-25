/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.infoBox.js */
angular.module('sn.queryBuilder').directive('infoBox', [
  '$rootScope',
  '$timeout',
  'i18n',
  'CONSTQB',
  'tagsService',
  '$document',
  function ($rootScope, $timeout, i18n, CONST, tagsService, $document) {
    'use strict';
    return {
      restrict: 'AE',
      template:
        '' +
        '<div>' +
        '	<div class="popover queryBuilder-popover" role="tooltip" ng-class="getPopoverClasses()">' +
        '		<div class="arrow" ng-show="showArrow()"></div>' +
        '		<div class="popover-content qb-info-box" ng-show="context === \'displayInfo\'">' +
        '			<div class="popover-header">' +
        '				<h4>' +
        i18n.getMessage('queryBuilder.infoBox.queryInfo') +
        '</h4>' +
        '			</div>' +
        '			<div class="popover-body">' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.queryName') +
        '</span>' +
        '					<span>{{activeInfoBox.query.name}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.queryDescription') +
        '</span>' +
        '					<span ng-if="!hasDescription()" class="missing-info">' +
        i18n.getMessage('queryBuilder.infoBox.noDescription') +
        '</span>' +
        '					<span ng-if="hasDescription()">{{activeInfoBox.query.description}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.dialogBox.queryType') +
        '</span>' +
        '					<span>{{activeInfoBox.query_type_human_readable}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.queryTags') +
        '</span>' +
        '					<span ng-if="!hasTagsInfo()" class="missing-info">' +
        i18n.getMessage('queryBuilder.infoBox.noTags') +
        '</span>' +
        '					<span class="btn-link tag-display-value" ng-if="hasTagsInfo()" ng-repeat="tag in activeInfoBox.query.tags" ng-click="tagClickedInfoBox(tag)">' +
        '						{{tag.display_value}}{{$last ? "" : ", "}}' +
        '					</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.ownedBy') +
        '</span>' +
        '					<span>{{activeInfoBox.query.created_by}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.updatedBy') +
        '</span>' +
        '					<span>{{activeInfoBox.query.updated_by}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.createdOn') +
        '</span>' +
        '					<span>{{activeInfoBox.query.created_on}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.lastModified') +
        '</span>' +
        '					<span>{{activeInfoBox.query.updated_on}}</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.groups') +
        '</span>' +
        '					<span ng-if="!hasGroups()" class="missing-info">' +
        i18n.getMessage('queryBuilder.infoBox.noGroups') +
        '</span>' +
        '					<span ng-if="hasGroups()" ng-repeat="group in activeInfoBox.query.groups">' +
        '						<a ng-href="{{group.link}}" target="_blank" class="groups-link">{{group.name}}</a>{{$last ? "" : ", "}}' +
        '					</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.schedules') +
        '</span>' +
        '					<span ng-if="!hasSchedule()" class="missing-info">' +
        i18n.getMessage('queryBuilder.infoBox.noSchedule') +
        '</span>' +
        '					<span ng-if="hasSchedule()" ng-repeat="schedule in activeInfoBox.query.schedules">' +
        '						<a ng-href="{{schedule.link}}" target="_blank" class="groups-link">{{schedule.name}}</a>{{$last ? "" : ", "}}' +
        '					</span>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.reportSource') +
        '</span>' +
        '					<span ng-if="!hasReportSource()" class="missing-info">' +
        i18n.getMessage('queryBuilder.infoBox.noReportSource') +
        '</span>' +
        '					<span ng-if="hasReportSource()">' +
        '						<a ng-href="{{activeInfoBox.query.reportSource.link}}" target="_blank" class="groups-link">{{activeInfoBox.query.reportSource.name}}</a>' +
        '					</span>' +
        '				</div>' +
        '			</div>' +
        '		</div>' +
        '		<div id="qb-settings-container" class="popover-content qb-info-box" ng-show="context === \'displaySettings\'">' +
        '			<div class="popover-header">' +
        '				<h4 id="settings-header-msg">' +
        i18n.getMessage('queryBuilder.infoBox.querySettings') +
        '</h4>' +
        '			</div>' +
        '			<div class="popover-body">' +
        '				<div class="body-section">' +
        '					<span id="qb-display-rel-setting" class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.displayRelationships') +
        '</span>' +
        '					<div class="input-switch">' +
        '						<input id="displayRelationshipsSwitch" type="checkbox" aria-labelledby="settings-header-msg qb-display-rel-setting" name="displayRelationshipsSwitch" ' +
        '           			ng-model="showRelationships" ng-change="showRelationshipsChanged()"></input>' +
        '						<label aria-hidden="true" class="switch" for="displayRelationshipsSwitch"></label>' +
        '					</div>' +
        '				</div>' +
        '				<div class="body-section" ng-show="canWrite">' +
        '					<span id="qb-display-sugested-conect" class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.displaySuggestedConnections') +
        '</span>' +
        '					<div class="input-switch">' +
        '						<input id="suggestedConnectionSwitch" type="checkbox" name="suggestedConnectionSwitch" ng-model="showSuggestedConnections" ng-change="showSuggestedConnectionsChanged()" ' +
        ' 									aria-labelledby="settings-header-msg qb-display-sugested-conect"></input>' +
        '						<label aria-hidden="true" class="switch" for="suggestedConnectionSwitch"></label>' +
        '					</div>' +
        '				</div>' +
        '				<div class="body-section">' +
        '					<span id="qb-display-results-in-new-tab" class="label popover-label">' +
        i18n.getMessage('queryBuilder.infoBox.displayResultsInNewTab') +
        '</span>' +
        '					<div class="input-switch">' +
        '						<input id="showResultsInNewTabSwitch" type="checkbox" name="showResultsInNewTabSwitch" ng-model="runInNewTab" ng-change="showResultsInNewTabChanged()" ' +
        ' 									aria-labelledby="settings-header-msg qb-display-results-in-new-tab"></input>' +
        '						<label aria-hidden="true" class="switch" for="showResultsInNewTabSwitch"></label>' +
        '					</div>' +
        '				</div>' +
        '			</div>' +
        '		</div>' +
        '		<div class="popover-content qb-info-box" ng-show="context === \'displayTags\'">' +
        '			<div class="popover-header">' +
        '				<h4 id="query-tags-label">' +
        i18n.getMessage('queryBuilder.infoBox.queryTags') +
        '</h4>' +
        '			</div>' +
        '			<div class="popover-body">' +
        '				<div class="body-section">' +
        '					<div class="add-tag">' +
        '						<button id="add-tag-btn" class="btn-link" ng-click="toggleAddTagsArea()" aria-labelledby="query-tags-label add-tag-btn">' +
        i18n.getMessage('queryBuilder.general.addTag') +
        '</button>' +
        '					</div>' +
        '				</div>' +
        '				<div class="body-section" ng-show="showTagsList()" style="padding-bottom: 0;">' +
        '					<div class="added-tag" ng-repeat="tag in activeInfoBox.tags" ng-class="getTagsClasses($index)">' +
        '						{{tag.display_value}}' +
        '						<span class="icon icon-cross pull-right tag-remove-btn" ng-click="removeTag(tag, $index)" ng-keydown="$last && tagsBoundryElementTabbed($event)" ' +
        '							style="cursor: pointer;" aria-label="' +
        i18n.format(
          i18n.getMessage('queryBuilder.infoBox.removeQueryTag'),
          '{{tag.display_value}}'
        ) +
        '"></span>' +
        '					</div>' +
        '				</div>' +
        '				<div class="body-section" ng-show="addTagsArea">' +
        '					<input class="form-control tags-input" type="text" ng-model="tagText" ng-keydown="tagsKeydown($event)" aria-label="' +
        i18n.getMessage('queryBuilder.general.addTag') +
        '" placeholder="' +
        i18n.getMessage('queryBuilder.general.addTag') +
        '"/>' +
        '				</div>' +
        '			</div>' +
        '		</div>' +
        '	</div>' +
        '	<div class="suggested-tags" ng-show="showSuggestedTags()" ng-style="suggestedTagsStyles()">' +
        '		<div class="suggested-tag" ng-repeat="suggestedTag in recentTags | filter:suggestedTagsFilter" ng-click="addSuggestedTag(suggestedTag)">' +
        '			{{suggestedTag.display_value}}' +
        '		</div>' +
        '	</div>' +
        '</div>',
      controller: [
        '$scope',
        function ($scope) {
          $scope.selectURL = function (event) {
            event.target.focus();
            event.target.selectionStart = 0;
            event.target.selectionEnd = event.target.value.length;
            event.preventDefault();
            event.stopPropagation();
            angular.element(event.target).attr('readonly', true);
          };
          $scope.unselectURL = function (event) {
            event.target.blur();
            event.target.selectionStart = event.target.selectionEnd = 0;
            angular.element(event.target).attr('readonly', false);
          };
        },
      ],
      link: function (scope, element, attributes) {
        scope.activeInfoBox = {};
        scope.activeInfoBox.index = null;
        scope.context = null;
        scope.tagText = '';
        scope.addTagsArea = false;
        scope.recentTags = [];
        var innerElement = angular.element(element.children()[0]);
        var infoBox = angular.element(innerElement.children()[0]);
        var suggestedTagsSection = angular.element(innerElement.children()[1]);
        var infoContent = angular.element(
          innerElement.children().find('.popover-content')[0]
        );
        var arrow = angular.element(innerElement.children().find('.arrow')[0]);
        var activeScroll = 0;
        var previousMiddleX = 0;
        var previousMiddleY = 0;
        var targetButton = null;
        var allSettings = innerElement
          .find('#qb-settings-container')
          .find('input');
        var firstSetting = angular.element(allSettings[0]);
        var lastSetting = angular.element(allSettings[allSettings.length - 1]);
        var addTagButton = innerElement.find('#add-tag-btn');
        infoBox.css('display', 'none');
        var maxHeight = CONST.INFOBOX.MAXHEIGHT;
        infoContent.css('max-height', maxHeight);
        arrow.css('left', 'calc(50%)');
        element.on('keydown', function (event) {
          if (event.which === CONST.KEY_CODES.ESCAPE_KEY) {
            scope.closeInfoBoxThroughKeyboard();
          }
        });
        scope.getPopoverClasses = function () {
          return {
            bottom: !scope.onTop,
            top: scope.onTop,
          };
        };
        scope.hasDescription = function () {
          if (
            scope.activeInfoBox &&
            scope.activeInfoBox.query &&
            scope.activeInfoBox.query.description
          )
            return true;
          return false;
        };
        scope.hasGroups = function () {
          if (
            scope.activeInfoBox &&
            scope.activeInfoBox.query &&
            scope.activeInfoBox.query.groups
          )
            if (scope.activeInfoBox.query.groups.length > 0) return true;
          return false;
        };
        scope.hasTagsInfo = function () {
          if (
            scope.activeInfoBox &&
            scope.activeInfoBox.query &&
            scope.activeInfoBox.query.tags
          )
            if (scope.activeInfoBox.query.tags.length > 0) return true;
          return false;
        };
        scope.hasSchedule = function () {
          if (
            scope.activeInfoBox &&
            scope.activeInfoBox.query &&
            scope.activeInfoBox.query.schedules
          )
            if (scope.activeInfoBox.query.schedules.length > 0) return true;
          return false;
        };
        scope.hasReportSource = function () {
          return (
            scope.activeInfoBox &&
            scope.activeInfoBox.query &&
            scope.activeInfoBox.query.reportSource.sys_id
          );
        };
        scope.showArrow = function () {
          if (
            scope.context &&
            (scope.context === 'displayInfo' || scope.context === 'displayTags')
          )
            return true;
          return false;
        };
        scope.showSuggestedTags = function () {
          if (
            scope.context === 'displayTags' &&
            scope.addTagsArea &&
            scope.tagText.length > 0
          )
            return true;
          return false;
        };
        scope.tagsKeydown = function (event) {
          $timeout(function () {
            getSuggestedTagsStyle(previousMiddleY, previousMiddleX);
          });
          if (event.which === 13) {
            scope.addTag(scope.tagText);
          } else if (
            event.keyCode === CONST.KEY_CODES.TAB_KEY &&
            !event.shiftKey
          ) {
            scope.closeInfoBoxThroughKeyboard();
          }
        };
        scope.addSuggestedTag = function (tag) {
          scope.addTag(tag.display_value);
        };
        scope.addTag = function (tag) {
          $rootScope.$broadcast('queryBuilder.addTag', {
            tag: tag,
          });
          scope.tagText = '';
        };
        scope.removeTag = function (tag, index) {
          $rootScope.$broadcast('queryBuilder.removeTag', {
            tag: tag,
            index: index,
          });
          addTagButton.focus();
        };
        scope.showTagsList = function () {
          if (isTagsContext() && hasTags()) return true;
          return false;
        };
        scope.getTagsClasses = function (index) {
          if (isTagsContext() && hasTags()) {
            return {
              'body-section': index < scope.activeInfoBox.tags.length - 1,
            };
          }
          return {};
        };
        scope.toggleAddTagsArea = function () {
          scope.addTagsArea = !scope.addTagsArea;
          if (scope.addTagsArea) {
            $timeout(function () {
              getSuggestedTagsStyle(previousMiddleY, previousMiddleX);
            });
          }
        };
        scope.tagClickedInfoBox = function (tag) {
          var provider = null;
          var tagLabel = tag.display_value;
          for (var i = 0; i < scope.savedCardsSearch.providers.length; i++) {
            if (scope.savedCardsSearch.providers[i].value === 'tags') {
              provider = scope.savedCardsSearch.providers[i];
              break;
            }
          }
          if (provider !== null) {
            var toSend = {
              provider: provider,
              result: tagLabel,
            };
            $rootScope.$broadcast('add_search_bubble', toSend);
          }
        };
        scope.settingsFocusChange = function (event) {
          if (event.keyCode === CONST.KEY_CODES.TAB_KEY) {
            if (scope.context === 'displaySettings') {
              if (event.target === firstSetting[0] && event.shiftKey) {
                $timeout(function () {
                  lastSetting.focus();
                });
              } else if (event.target === lastSetting[0] && !event.shiftKey) {
                $timeout(function () {
                  firstSetting.focus();
                });
              }
            } else if (
              (event.target === firstSetting[0] && event.shiftKey) ||
              (event.target === lastSetting[0] && !event.shiftKey)
            ) {
              scope.closeInfoBoxThroughKeyboard();
            }
          }
        };
        firstSetting.on('keydown', scope.settingsFocusChange);
        lastSetting.on('keydown', scope.settingsFocusChange);
        scope.tagsBoundryElementTabbed = function (event) {
          if (event.keyCode === CONST.KEY_CODES.TAB_KEY) {
            var isAddButton = event.target === addTagButton[0];
            if (
              (isAddButton &&
                (event.shiftKey ||
                  (!scope.addTagsArea &&
                    scope.activeInfoBox.tags.length === 0))) ||
              (!isAddButton && !event.shiftKey && !scope.addTagsArea)
            ) {
              scope.closeInfoBoxThroughKeyboard();
            }
          }
        };
        addTagButton.on('keydown', scope.tagsBoundryElementTabbed);
        scope.closeInfoBoxThroughKeyboard = function () {
          event.preventDefault();
          $timeout(function () {
            targetButton.focus();
          });
          scope.closeInfoBox();
        };
        scope.$on('queryBuilder.displayInfo', function (event, data) {
          scope.context = 'displayInfo';
          maxHeight = CONST.INFOBOX.MAXHEIGHT;
          infoContent.css('max-height', maxHeight);
          arrow.css('left', 'calc(50%)');
          activeScroll = angular.element('.saved-queries-area').scrollTop();
          var position = data.event;
          var sourceElem = position.srcElement || position.target;
          if (position.clientX !== 0 || position.offsetX !== 0)
            var middleX =
              position.clientX -
              position.offsetX +
              sourceElem.clientWidth / 2 -
              150;
          else
            var middleX =
              angular.element(sourceElem).offset().left +
              sourceElem.clientWidth / 2 -
              150;
          if (position.clientY !== 0 || position.offsetY !== 0)
            var middleY =
              position.clientY -
              position.offsetY +
              sourceElem.clientHeight / 2 +
              16 -
              activeScroll;
          else
            var middleY =
              angular.element(sourceElem).offset().top +
              sourceElem.clientHeight / 2 +
              16 -
              activeScroll;
          angular.element('.popover-content').scrollTop(0);
          if (
            scope.activeInfoBox.query &&
            scope.activeInfoBox.query.infoClicked
          )
            scope.activeInfoBox.query.infoClicked = false;
          scope.activeInfoBox.query = data.savedQuery;
          var graph = scope.activeInfoBox.query.query;
          if (graph.query_type === CONST.QUERY_TYPES.SERVICE)
            scope.activeInfoBox.query_type_human_readable = i18n.getMessage(
              'queryBuilder.dialogBox.serviceQuery'
            );
          else
            scope.activeInfoBox.query_type_human_readable = i18n.getMessage(
              'queryBuilder.dialogBox.generalQuery'
            );
          scope.activeInfoBox.query.infoClicked = true;
          if (scope.activeInfoBox.index === null) {
            scope.activeInfoBox.index = data.index;
            getInfoBoxStyle(middleY, middleX);
          } else if (scope.activeInfoBox.index === data.index)
            scope.closeInfoBox();
          else if (scope.activeInfoBox.index !== data.index) {
            scope.activeInfoBox.index = data.index;
            getInfoBoxStyle(middleY, middleX);
          }
        });
        scope.$on('queryBuilder.displaySettings', function (event, data) {
          if (scope.context === 'displaySettings') {
            scope.closeInfoBox();
            scope.context = null;
          } else {
            scope.context = 'displaySettings';
            maxHeight = CONST.INFOBOX.MAXHEIGHT;
            infoContent.css('max-height', maxHeight);
            arrow.css('left', 'calc(50%)');
            var position = data.event;
            var sourceElem = position.srcElement || position.target;
            var middleX =
              position.clientX -
              position.offsetX +
              sourceElem.clientWidth / 2 -
              150;
            var middleY =
              position.clientY -
              position.offsetY +
              sourceElem.clientHeight / 2 +
              9;
            angular.element('.popover-content').scrollTop(0);
            getInfoBoxStyle(middleY, middleX);
            targetButton = data.event.target;
            $timeout(function () {
              firstSetting.focus();
            }, 0);
          }
        });
        scope.$on('queryBuilder.displayTags', function (event, data) {
          if (scope.context === 'displayTags') {
            scope.closeInfoBox();
            scope.context = null;
          } else {
            targetButton = data.event.target;
            tagsService.getRecentTags().then(
              function (recentTags) {
                if (!recentTags.failed) {
                  scope.recentTags = recentTags;
                  showTags(event, data);
                }
              },
              function () {
                showTags(event, data);
              }
            );
          }
        });
        scope.$on('queryBuilder.updateActiveInfoBox', function (event, data) {
          var prop = data.property;
          var value = data.value;
          scope.activeInfoBox[prop] = value;
        });
        scope.$on('queryBuilder.closeInfoBox', function (event, data) {
          scope.closeInfoBox();
        });
        scope.closeInfoBox = function () {
          infoBox.css('display', 'none');
          scope.activeInfoBox.index = null;
          scope.context = null;
          if (scope.activeInfoBox.query)
            scope.activeInfoBox.query.infoClicked = false;
        };
        scope.suggestedTagsFilter = function (tag) {
          var current = scope.tagText.toLowerCase();
          var suggested = tag.display_value.toLowerCase();
          if (current != '' && suggested.indexOf(current) === 0) return true;
          return false;
        };
        $document.bind('click', function (event) {
          var isClickedElementChildOfPopup =
            element.find(event.target).length > 0 ||
            event.target.classList.contains('suggested-tag');
          if (isClickedElementChildOfPopup) {
            return;
          }
          scope.closeInfoBox();
        });
        function getInfoBoxStyle(top, left) {
          innerElement.removeAttr('style');
          infoBox.removeAttr('style');
          infoBox.css('display', 'none');
          if (scope.context === 'displayInfo')
            var scrollHeight = angular
              .element('.saved-queries-area')
              .prop('scrollHeight');
          else
            var scrollHeight = angular
              .element('.main-area')
              .prop('scrollHeight');
          var rightSide = window.innerWidth;
          var styles = {};
          if (scrollHeight - top > top) {
            scope.onTop = false;
            if (maxHeight > scrollHeight - top)
              infoContent.css('max-height', scrollHeight - top - 27 + 'px');
            styles['top'] = top + 'px';
            styles['transform'] = 'translateY(0%)';
            styles['margin-top'] = '14px';
          } else {
            scope.onTop = true;
            if (maxHeight > top) infoContent.css('max-height', top - 49 + 'px');
            styles['top'] = top + 'px';
            styles['transform'] = 'translateY(-100%)';
            styles['margin-top'] = '-36px';
          }
          var infoBoxRight = left + 300;
          if (scope.context === 'displayInfo') {
            if (infoBoxRight > rightSide) {
              var leftOffset = infoBoxRight - rightSide + 12;
              styles['left'] = left - leftOffset + 'px';
              arrow.css('left', 'calc(50% + ' + leftOffset + 'px)');
            } else {
              styles['left'] = left + 'px';
            }
          } else if (scope.context === 'displaySettings') {
            innerElement.css('position', 'absolute');
            innerElement.css('right', '315px');
          } else if (scope.context === 'displayTags') {
            left = left - 150;
            infoBoxRight = left + 300;
            if (infoBoxRight > rightSide) {
              var leftOffset = infoBoxRight - rightSide + 12;
              styles['left'] = left - leftOffset + 'px';
              arrow.css('left', 'calc(50% + ' + leftOffset + 'px)');
            } else {
              styles['left'] = left + 'px';
            }
            styles['margin-top'] = '22px';
          }
          infoBox.css(styles);
          infoBox.css('display', 'block');
        }
        function getSuggestedTagsStyle(top, left) {
          suggestedTagsSection.removeAttr('style');
          var currentHeight = infoBox.children()[3].offsetHeight;
          var currentWidth = infoBox.children()[3].offsetWidth;
          var styles = {};
          var hasSuggestedTags = false;
          for (var i = 0; i < scope.recentTags.length; i++) {
            if (scope.suggestedTagsFilter(scope.recentTags[i])) {
              hasSuggestedTags = true;
              break;
            }
          }
          if (!hasSuggestedTags) styles['display'] = 'none';
          styles['width'] = currentWidth - 28 + 'px';
          styles['left'] = left - 135 + 'px';
          styles['top'] = top + currentHeight + 8 + 'px';
          suggestedTagsSection.css(styles);
        }
        function isTagsContext() {
          if (scope.context === 'displayTags') return true;
          return false;
        }
        function hasTags() {
          if (
            scope.activeInfoBox &&
            scope.activeInfoBox.tags &&
            scope.activeInfoBox.tags.length > 0
          )
            return true;
          return false;
        }
        function showTags(event, data) {
          scope.context = 'displayTags';
          scope.activeInfoBox.tags = data.query.tags;
          maxHeight = CONST.INFOBOX.MAXHEIGHT;
          infoContent.css('max-height', maxHeight);
          arrow.css('left', 'calc(50%)');
          var position = data.event;
          var sourceElem = position.srcElement || position.target;
          var rect = sourceElem.getBoundingClientRect();
          var middleX = rect.left + sourceElem.clientWidth / 2;
          var middleY = rect.top + sourceElem.clientHeight / 2 + 9;
          previousMiddleX = middleX;
          previousMiddleY = middleY;
          angular.element('.popover-content').scrollTop(0);
          getInfoBoxStyle(middleY, middleX);
          $timeout(function () {
            addTagButton.focus();
            getSuggestedTagsStyle(middleY, middleX);
          });
        }
      },
    };
  },
]);
