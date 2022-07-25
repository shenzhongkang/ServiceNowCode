/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.rightPanelDropdown.js */
angular.module('sn.queryBuilder').directive('rightPanelDropdown', [
  '$rootScope',
  '$timeout',
  'i18n',
  'CONSTQB',
  'snNotification',
  'queryBuilderCanvasUtil',
  function (
    $rootScope,
    $timeout,
    i18n,
    CONST,
    snNotification,
    queryBuilderCanvasUtil
  ) {
    'use strict';
    return {
      restrict: 'AE',
      template:
        '' +
        '<div class="right-panel-dropdown">' +
        '	<div class="display-content" ng-show="hasDisplayInfo()">' +
        '		<div class="right-properties-search">' +
        '			<div class="input-group-transparent">' +
        '				<span class="sr-only" aria-live="polite" aria-atomic="true"> {{srAvailableResultsMsg}} </span>' +
        '				<span class="input-group-addon-transparent icon-search"></span>' +
        '				<input class="form-control form-control-search" type="search" tabindex="0" ng-click="$event.stopPropagation()" ng-change="notifySearchResults(event)" ng-model="rightPanelPropertiesSearch" aria-label="{{rightPanelDropdownSearch}}" placeholder="{{rightPanelDropdownSearch}}"/> ' +
        '				<span class="input-group-addon-transparent icon-cross-circle" role="button" tabindex="0" aria-label="' +
        i18n.getMessage('queryBuilder.rightPanelDropdown.clearSearch') +
        '" ng-if="shouldShowClear(\'rightPanelPropertiesSearch\')" ng-click="clearSearch($event, \'rightPanelPropertiesSearch\')" sn-tooltip-basic="' +
        i18n.getMessage('queryBuilder.rightPanelDropdown.clearSearch') +
        '"></span>' +
        '			</div>' +
        '		</div>' +
        '		<ul class="option-list" role="listbox" aria-multiselectable="true" tabindex="0">' +
        '			<li class="display-info" role="option" ng-repeat="value in filteredSearch = (displayInfo | filter:rightPanelPropertiesSearch | orderObjectBy:\'label\')" tabindex="0" ng-click="addValue($event, value)" aria-selected="{{isAdded(value)}}">' +
        '				{{value.label}}' +
        '				<span class="isInIcon icon icon-check" ng-show="isAdded(value)" aria-label="' +
        i18n.getMessage('queryBuilder.rightPanelDropdown.checkedOption') +
        '"></span>' +
        '			</li>' +
        '		</ul>' +
        '	</div>' +
        '	<div class="display-content-none" ng-show="!hasDisplayInfo()">' +
        '		<div class="display-info loading-display-info" ng-show="isLoadingDisplayInfo">' +
        '			<div>' +
        i18n.getMessage('queryBuilder.rightPanelDropdown.loadingProperties') +
        '</div>' +
        '			<div class="icon icon-loading"></div>' +
        '		</div>' +
        '		<div class="display-info no-display-info">' +
        '			<span>{{noInfoErrorMessage}}</span>' +
        '		</div>' +
        '	</div>' +
        '</div>',
      link: function (scope, element, attributes) {
        scope.rightPanelPropertiesSearch = '';
        scope.rightPanelDropdownSearch = '';
        scope.displayInfo = [];
        scope.isLoadingDisplayInfo = false;
        var latest = null;
        var type = null;
        var body = angular.element(document).find('body');
        var dropDown = angular.element(element.children()[0]);
        var inputSearch = angular.element(
          element.children().find('.form-control-search')[0]
        );
        var displayInfo = angular.element(
          element.children().find('.display-content')[0]
        );
        var isReverse = null;
        var context = null;
        element.on('keypress', function (event) {
          if (event.keyCode === CONST.KEY_CODES.SPACE_KEY)
            event.stopPropagation();
        });
        var ESC_KEY_CODE = 27;
        var maxHeight = CONST.DROPDOWN.MAXHEIGHT;
        displayInfo.css('max-height', maxHeight);
        scope.displayInfo = [];
        scope.noInfoErrorMessage = '';
        scope.filteredSearch = null;
        scope.srAvailableResultsMsg = '';
        scope.availableResults = 0;
        scope.timeoutPromise = null;
        scope.notifySearchResults = function (event) {
          if (scope.timeoutPromise) {
            $timeout.cancel(scope.timeoutPromise);
          }
          scope.timeoutPromise = $timeout(function () {
            scope.availableResults = scope.filteredSearch.length;
            scope.srAvailableResultsMsg = i18n.format(
              i18n.getMessage(
                'queryBuilder.rightPanelDropdown.srResultsAvailbleMsg'
              ),
              scope.availableResults
            );
            scope.timeoutPromise = null;
          }, 1000);
        };
        scope.$on('queryBuilder.display_relations', function (event, data) {
          context = data.context;
          var correctContext = element.hasClass(context);
          isReverse = data.isReverse;
          if (type !== 'relations' && correctContext) {
            scope.rightPanelDropdownSearch = i18n.getMessage(
              'queryBuilder.rightPanelDropdown.searchForRelation'
            );
            maxHeight = CONST.DROPDOWN.MAXHEIGHT;
            displayInfo.css('max-height', maxHeight);
            scope.displayInfo = data.relations;
            if (scope.displayInfo.length === 0)
              scope.noInfoErrorMessage = i18n.getMessage(
                'queryBuilder.rightPanelDropdown.noRelations'
              );
            latest = data.latest;
            type = 'relations';
            getDropDownStyle(context);
          }
        });
        scope.$on('queryBuilder.display_references', function (event, data) {
          context = data.context;
          var correctContext = element.hasClass(context);
          isReverse = data.isReverse;
          if (type !== 'reference' && correctContext) {
            scope.rightPanelDropdownSearch = i18n.getMessage(
              'queryBuilder.rightPanelDropdown.searchForReference'
            );
            maxHeight = CONST.DROPDOWN.MAXHEIGHT;
            displayInfo.css('max-height', maxHeight);
            scope.displayInfo = data.references;
            if (scope.displayInfo.length === 0)
              scope.noInfoErrorMessage = i18n.getMessage(
                'queryBuilder.rightPanelDropdown.noReferences'
              );
            latest = data.latest;
            type = 'reference';
            getDropDownStyle(context);
          }
        });
        scope.$on('queryBuilder.display_properties', function (event, data) {
          isReverse = null;
          if (type !== 'returnValues') {
            if (queryBuilderCanvasUtil.getLoadingTableProperties()) {
              scope.isLoadingDisplayInfo = true;
              waitForPropertiesToBeLoaded(data);
            } else {
              scope.rightPanelDropdownSearch = i18n.getMessage(
                'queryBuilder.rightPanelDropdown.searchForAttributes'
              );
              context = 'rightPanel';
              maxHeight = CONST.DROPDOWN.MAXHEIGHT;
              displayInfo.css('max-height', maxHeight);
              var click = data.event;
              scope.displayInfo = data.properties;
              latest = data.latest;
              type = 'returnValues';
            }
            getDropDownStyle(context);
          }
        });
        scope.$on(
          'queryBuilder.clear_right_dropdown_properties',
          clearDropdownProperties
        );
        scope.addValue = function (event, value) {
          event.stopPropagation();
          if (latest && type) {
            if (isReverse !== null) latest.isReverse = isReverse;
            if (type === 'relations') {
              if (value.sys_id === CONST.EDGE_TYPES.ANY_RELATION) {
                if (latest[type].length !== scope.displayInfo.length - 1) {
                  for (var i = 0; i < scope.displayInfo.length; i++) {
                    if (
                      scope.displayInfo[i].sys_id !==
                      CONST.EDGE_TYPES.ANY_RELATION
                    ) {
                      var index = findValue(
                        latest,
                        type,
                        scope.displayInfo[i],
                        'label'
                      );
                      if (index === -1) latest[type].push(scope.displayInfo[i]);
                    }
                  }
                  $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
                } else if (
                  latest[type].length ===
                  scope.displayInfo.length - 1
                ) {
                  latest[type] = [];
                }
              } else {
                var index = findValue(latest, type, value, 'label');
                if (index === -1) latest[type].push(value);
                else {
                  latest[type].splice(index, 1);
                  if (shouldCloseDropdown(latest, type))
                    $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
                }
              }
            } else if (type === 'reference') {
              if (latest[type] !== value) {
                if (latest[type].label) {
                  var notificationMessage = i18n.getMessage(
                    'queryBuilder.notifications.oneReference'
                  );
                  snNotification
                    .show(
                      'warning',
                      notificationMessage,
                      CONST.NOTIFICATION_TIME
                    )
                    .then(function (notificationElement) {
                      queryBuilderCommon.focusNotificationCloseButton(
                        notificationElement
                      );
                    });
                }
                latest[type] = value;
              } else {
                latest[type] = {};
              }
              $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
            } else if (type === 'returnValues') {
              var index = findValue(latest, type, value, 'element');
              if (index === -1) latest[type].push(value);
              else {
                latest[type].splice(index, 1);
              }
            }
            if (shouldCloseDropdown(latest, type))
              $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
          }
        };
        scope.hasDisplayInfo = function () {
          if (scope.displayInfo && scope.displayInfo.length > 0) return true;
          return false;
        };
        scope.isAdded = function (value) {
          if (latest && type) {
            if (type !== 'reference') {
              if (latest[type]) {
                for (var i = 0; i < latest[type].length; i++)
                  if (latest[type][i].label === value.label) return true;
              }
              if (type === 'relations') {
                if (
                  latest[type].length === scope.displayInfo.length - 1 &&
                  value.sys_id === CONST.EDGE_TYPES.ANY_RELATION
                )
                  return true;
              }
            } else if (type === 'reference') {
              if (latest[type] === value) return true;
            }
          }
          return false;
        };
        function getDropDownStyle(context) {
          if (element.hasClass(context)) {
            displayInfo.scrollTop(0);
            inputSearch.focus();
            if (context === 'dialogBox') body.off('keyup');
            body.on('keyup', scope.onEscapeCloseDropdown);
          }
        }
        scope.onEscapeCloseDropdown = function (event) {
          if (event.keyCode === ESC_KEY_CODE) {
            $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
          }
        };
        function clearDropdownProperties() {
          scope.rightPanelPropertiesSearch = '';
          type = null;
          if (context === 'dialogBox')
            $rootScope.$broadcast('queryBuilder.setEscapeHandlerOnDialog');
          body.off('keyup', scope.onEscapeCloseDropdown);
        }
        function findValue(latest, type, value, compare) {
          var index = -1;
          for (var i = 0; i < latest[type].length; i++)
            if (latest[type][i][compare] === value[compare]) index = i;
          return index;
        }
        function shouldCloseDropdown(latest, type) {
          if (latest && type) {
            if (context === 'dialogBox') return true;
            else if (context === 'rightPanel') {
              if (type === 'relations' && isReverse && latest[type].length <= 1)
                return true;
              else if (type === 'reference') return true;
            }
          }
          return false;
        }
        function waitForPropertiesToBeLoaded(data) {
          setTimeout(function () {
            if (!queryBuilderCanvasUtil.getLoadingTableProperties()) {
              type = '';
              $rootScope.$broadcast(
                'queryBuilder.try_to_redisplay_properties',
                data
              );
            } else {
              waitForPropertiesToBeLoaded(data);
            }
          }, 250);
        }
      },
    };
  },
]);
