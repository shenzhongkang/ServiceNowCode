/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderRelationshipBubble.js */
angular.module('sn.queryBuilder').directive('queryBuilderRelationshipBubble', [
  '$rootScope',
  '$timeout',
  'i18n',
  'CONSTQB',
  'queryBuilderValidation',
  function ($rootScope, $timeout, i18n, CONST, queryBuilderValidation) {
    'use strict';
    return {
      restrict: 'AE',
      scope: {
        bubbleConn: '=',
        currentQuery: '=',
      },
      template:
        '' +
        '<div class="connection-info-bubble" ng-style="relationshipBubbleStyles(bubbleConn.info)" ng-show="showRelationshipBubble(bubbleConn)" ng-class="getRelationshipBubbleClasses(bubbleConn)" ng-click="displayConnectionInfo($event, bubbleConn.info)">' +
        '	{{getInformationBubbleText(bubbleConn)}}' +
        '</div>',
      controller: function ($scope, $element) {
        var relationshipBubbleGap = 20;
        $scope.relationshipBubbleStyles = function (connection) {
          var hasReference =
            connection.reference && connection.reference.label ? true : false;
          var bubbleElem = angular.element($element[0].firstChild)[0];
          var widthDiff = 45;
          var heightDiff = 10;
          if (bubbleElem) {
            widthDiff = Math.ceil(bubbleElem.clientWidth / 2);
            heightDiff = Math.ceil(bubbleElem.clientHeight / 2);
          }
          if (hasReference) {
            return {
              left: connection.center.x - widthDiff + 'px',
              top: connection.center.y - heightDiff + 'px',
              'max-width':
                getReferenceWidth(connection, bubbleElem.clientWidth) + 'px',
              'text-overflow': 'ellipsis',
              overflow: 'hidden',
              'white-space': 'nowrap',
            };
          }
          return {
            left: connection.center.x - widthDiff + 'px',
            top: connection.center.y - heightDiff + 'px',
          };
        };
        $scope.showRelationshipBubble = function (conn) {
          if (conn.info) {
            conn = conn.info;
            if (!queryBuilderValidation.isOnMultipleSide(conn)) {
              return false;
            } else {
              if ($scope.currentQuery.query) {
                if (
                  $scope.currentQuery.query.query_type ===
                    CONST.QUERY_TYPES.GENERAL &&
                  conn.type !== CONST.EDGE_TYPES.APP_FLOW
                ) {
                  var hasRelations = conn.relations.length > 0 ? true : false;
                  var noRelationsChecked = conn.noRelations;
                  var hasReference = conn.reference.label ? true : false;
                  var hasBelongs = conn.belongs !== undefined ? true : false;
                  var isMultiLevel = angular.isDefined(conn.relationshipLevels)
                    ? conn.relationshipLevels > 1
                    : false;
                  if (
                    (hasRelations && !noRelationsChecked && !hasBelongs) ||
                    hasReference ||
                    isMultiLevel
                  ) {
                    return true;
                  }
                }
              }
            }
          }
          return false;
        };
        $scope.getRelationshipBubbleClasses = function (conn) {
          return {
            selected: conn.info.touched,
            error: conn.info.error,
            focused: conn.info.focused,
          };
        };
        $scope.displayConnectionInfo = function (event, connection) {
          $scope.$emit('connection_touched', {
            connection: connection,
          });
          event.stopPropagation();
        };
        $scope.getInformationBubbleText = function (conn) {
          if (conn.info) {
            conn = conn.info;
            var hasReference =
              conn.reference && conn.reference.label ? true : false;
            if (hasReference) {
              return conn.reference.label;
            }
            if (shouldShowLongInfoBubble(conn)) {
              if (
                angular.isDefined(conn.relationshipLevels) &&
                conn.relationshipLevels > 1
              ) {
                return i18n.format(
                  i18n.getMessage(
                    'queryBuilder.connectionBubble.multiLevel.long'
                  ),
                  [conn.relationshipLevels]
                );
              } else if (angular.isDefined(conn.relations)) {
                return i18n.format(
                  i18n.getMessage(
                    'queryBuilder.connectionBubble.relationship.long'
                  ),
                  [conn.relationshipLevels, conn.relations.length]
                );
              }
            } else {
              if (
                angular.isDefined(conn.relationshipLevels) &&
                conn.relationshipLevels > 1
              ) {
                return i18n.format(
                  i18n.getMessage(
                    'queryBuilder.connectionBubble.multiLevel.short'
                  ),
                  [conn.relationshipLevels]
                );
              } else if (angular.isDefined(conn.relations)) {
                return i18n.format(
                  i18n.getMessage(
                    'queryBuilder.connectionBubble.relationship.short'
                  ),
                  [conn.relationshipLevels, conn.relations.length]
                );
              }
            }
          }
          return '';
        };
        function shouldShowLongInfoBubble(conn) {
          var firstRightSide = conn.first.rightCorner.x;
          var firstBottom = conn.first.y + conn.first.divHeight;
          var secondLeftSide = conn.second.leftCorner.x;
          var secondTop = conn.second.y;
          if (
            secondLeftSide - firstRightSide >= 150 ||
            (Math.abs(secondTop - firstBottom) >= 35 &&
              Math.abs(conn.first.y - conn.second.y) >= 70)
          )
            return true;
          return false;
        }
        function getReferenceWidth(conn, bubbleElem) {
          var bubbleElemWidth = bubbleElem.clientWidth;
          var firstRightSide = conn.first.rightCorner.x;
          var firstBottom = conn.first.y + conn.first.divHeight;
          var secondLeftSide = conn.second.leftCorner.x;
          var secondTop = conn.second.y;
          if (
            secondLeftSide - firstRightSide >=
              bubbleElemWidth + relationshipBubbleGap ||
            (Math.abs(secondTop - firstBottom) >= 35 &&
              Math.abs(conn.first.y - conn.second.y) >= 70)
          )
            return bubbleElemWidth;
          else return secondLeftSide - firstRightSide - relationshipBubbleGap;
        }
      },
    };
  },
]);
