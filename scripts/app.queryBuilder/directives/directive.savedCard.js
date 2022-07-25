/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.savedCard.js */
angular.module('sn.queryBuilder').directive('savedCard', [
  'i18n',
  'CONSTQB',
  function (i18n, CONST) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      template:
        '' +
        '<div class="savedCardsArea">' +
        '	<div ng-focus="setFocusValue()" class="saved-card createNewCard" ng-click="createNewQuery($event)" ng-if="showCreateNewCard()" tabindex="0">' +
        '		<div class="saved-card-content">' +
        '			<div class="saved-card-header">' +
        '				<span class="icon-add-circle-empty"></span>' +
        '				<span>' +
        i18n.getMessage('queryBuilder.savedCards.createNew') +
        '</span>' +
        '			</div>' +
        '		</div>' +
        '	</div>' +
        '	<span ng-if="showNoMatches()" class="no-matches">' +
        i18n.getMessage('queryBuilder.savedCards.noMatches') +
        '</span>' +
        '	<a ng-focus="setFocusValue(savedQuery)" ng-if="isQb(savedQuery.source)" aria-label="{{savedQuery.name}}" tabindex="0" class="saved-card savedCards" ng-repeat="savedQuery in filteredSavedQueries() | orderObjectBy:savedQueriesSortTerm" ng-click="savedQueryClicked(savedQuery)" ng-mouseenter="setFocusValue(savedQuery)" ng-mouseleave="setFocusValue()" ng-class="{\'hovering\': shouldShowHeaderButtons(savedQuery)}" href="">' +
        '		<div class="saved-card-content">' +
        '			<div class="saved-card-header">' +
        '				<div class="saved-card-title" sn-tooltip-basic="{{savedQuery.name}}" overflow-only="true">{{savedQuery.name}}</div>' +
        '				<div class="saved-card-header-icons pull-right" ng-show="shouldShowHeaderButtons(savedQuery)">' +
        '					<button class="btn btn-icon icon-document saved-card-button" title="' +
        i18n.getMessage('queryBuilder.general.duplicateQuery') +
        '" ng-click="duplicateQuery($event, savedQuery)" ng-show="canWrite">' +
        '						<span class="sr-only">' +
        i18n.getMessage('queryBuilder.general.duplicateQuery') +
        '</span>' +
        '					</button>' +
        '					<button class="btn btn-icon icon-info saved-card-button" title="' +
        i18n.getMessage('queryBuilder.general.queryInformation') +
        '" ng-click="displayInformation($event, savedQuery, $index)" ng-class="{\'hovering\': savedQuery.infoClicked}">' +
        '						<span class="sr-only">' +
        i18n.getMessage('queryBuilder.general.queryInformation') +
        '</span>' +
        '					</button>' +
        '					<button class="btn btn-icon icon-cross saved-card-button" title="' +
        i18n.getMessage('queryBuilder.general.deleteQuery') +
        '" ng-click="deleteQuery($event, savedQuery)" ng-show="canWrite">' +
        '						<span class="sr-only">' +
        i18n.getMessage('queryBuilder.general.deleteQuery') +
        '</span>' +
        '					</button>' +
        '				</div>' +
        '			</div>' +
        '			<div class="saved-card-body">' +
        '				<div class="last-updated row form-group">' +
        '					<span class="saved-card-label col-sm-5">' +
        i18n.getMessage('queryBuilder.savedCards.lastUpdated') +
        '</span>' +
        '					<span class="content col-sm-7">{{savedQuery.updated_on}}</span>' +
        '				</div>' +
        '				<div class="created-by row form-group">' +
        '					<span class="saved-card-label col-sm-5">' +
        i18n.getMessage('queryBuilder.savedCards.createdBy') +
        '</span>' +
        '					<span class="content col-sm-7">{{savedQuery.created_by}}</span>' +
        '				</div>' +
        '				<div class="query_type row form-group">' +
        '					<span class="saved-card-label col-sm-5">' +
        i18n.getMessage('queryBuilder.dialogBox.queryType') +
        '</span>' +
        '					<span class="content col-sm-7">{{humanReadableType(savedQuery)}}</span>' +
        '				</div>' +
        '			</div>' +
        '		</div>' +
        '	</a>' +
        '<div>',
      controller: function ($scope, $rootScope, $timeout) {
        $scope.focusedQuery = null;
        $scope.isQb = function (source) {
          var isSourceQb = source !== 'NLQ';
          return isSourceQb;
        };
        $scope.createNewQuery = function (event) {
          event.stopPropagation();
          $rootScope.$broadcast('queryBuilder.closeInfoBox');
          $rootScope.$broadcast('queryBuilder.createNewQueryClicked');
        };
        $scope.savedQueryClicked = function (savedQuery) {
          $scope.setFocusValue();
          $rootScope.$broadcast('queryBuilder.loadSavedQuery', savedQuery);
        };
        $scope.deleteQuery = function (event, savedQuery) {
          $rootScope.$broadcast('queryBuilder.deleteQuery', {
            savedQuery: savedQuery,
            event: event,
          });
          event.preventDefault();
          event.stopPropagation();
          $scope.closeInfoBox();
        };
        $scope.displayInformation = function (event, savedQuery, index) {
          $rootScope.$broadcast('queryBuilder.displayInfo', {
            savedQuery: savedQuery,
            event: event,
            index: index,
          });
          event.preventDefault();
          event.stopPropagation();
        };
        $scope.duplicateQuery = function (event, savedQuery) {
          if (savedQuery.data) savedQuery = savedQuery.data;
          $scope.setFocusValue();
          $rootScope.$broadcast('queryBuilder.duplicateQuery', savedQuery);
          event.preventDefault();
          event.stopPropagation();
        };
        $scope.humanReadableType = function (savedQuery) {
          var graph = savedQuery.query;
          if (graph.query_type === CONST.QUERY_TYPES.SERVICE) {
            savedQuery.humanReadable = i18n.getMessage(
              'queryBuilder.dialogBox.serviceQuery'
            );
            return i18n.getMessage('queryBuilder.dialogBox.serviceQuery');
          } else {
            savedQuery.humanReadable = i18n.getMessage(
              'queryBuilder.dialogBox.generalQuery'
            );
            return i18n.getMessage('queryBuilder.dialogBox.generalQuery');
          }
        };
        $scope.showCreateNewCard = function () {
          if (
            $scope.savedQueries.length > 0 &&
            $scope.filteredSavedQueries().length > 0 &&
            $scope.canWrite
          )
            return true;
          else if ($scope.savedQueries.length === 0 && $scope.canWrite)
            return true;
          return false;
        };
        $scope.showNoMatches = function () {
          var selected = $scope.savedCardsSearch.selected;
          if (
            $scope.savedQueries.length > 0 &&
            $scope.filteredSavedQueries().length === 0 &&
            selected &&
            selected.length > 0
          )
            return true;
          return false;
        };
        $scope.filteredSavedQueries = function () {
          var filtered = [];
          var selected = $scope.savedCardsSearch.selected;
          if (!selected || selected.length === 0)
            filtered = $scope.savedQueries;
          else {
            filtered = $scope.savedQueries.filter(matchesAll);
          }
          return filtered;
        };
        $scope.setFocusValue = function (savedQuery) {
          if (savedQuery && savedQuery.sys_id)
            $scope.focusedQuery = savedQuery.sys_id;
          else $scope.focusedQuery = null;
        };
        $scope.shouldShowHeaderButtons = function (savedQuery) {
          if (savedQuery.infoClicked) return true;
          else if (
            $scope.focusedQuery &&
            savedQuery.sys_id === $scope.focusedQuery
          )
            return true;
          return false;
        };
        $scope.$on('search_selected', function (event, args) {
          $rootScope.$broadcast('queryBuilder.closeInfoBox');
        });
        function matchesAll(query) {
          var selected = $scope.savedCardsSearch.selected;
          var total = selected.length;
          var matched = 0;
          for (var i = 0; i < selected.length; i++) {
            var val = selected[i].provider.value;
            var res = selected[i].result;
            if (val === 'name') {
              if (query.name.toLowerCase().indexOf(res.toLowerCase()) > -1)
                matched++;
            } else if (val === 'tags') {
              for (var j = 0; j < query.tags.length; j++) {
                if (
                  query.tags[j].display_value.toLowerCase() ===
                  res.toLowerCase()
                )
                  matched++;
              }
            } else {
              if (query[val] === res) matched++;
            }
          }
          if (total === matched) return true;
          return false;
        }
      },
    };
  },
]);
