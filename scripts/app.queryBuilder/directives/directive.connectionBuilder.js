/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.connectionBuilder.js */
angular.module('sn.queryBuilder').directive('connectionBuilder', [
  'i18n',
  'CONSTQB',
  'queryBuilderCommon',
  'queryBuilderValidation',
  'snNotification',
  'd3',
  'queryBuilderConnectionUtil',
  'queryBuilderSelection',
  'queryBuilderCanvasUtil',
  'getTemplateUrl',
  'queryBuilderTreeUtil',
  function (
    i18n,
    CONST,
    queryBuilderCommon,
    queryBuilderValidation,
    snNotification,
    d3,
    queryBuilderConnectionUtil,
    queryBuilderSelection,
    queryBuilderCanvasUtil,
    getTemplateUrl,
    queryBuilderTreeUtil
  ) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_connection_builder.xml'),
      controller: function ($scope, $rootScope, $timeout, $q) {
        var lineFunction = d3.svg
          .line()
          .x(function (d) {
            return d.x;
          })
          .y(function (d) {
            return d.y;
          })
          .interpolate(CONST.D3.INTERPOLATIONMODE);
        $scope.touchedSort = function (conn) {
          return conn.info.touched;
        };
        $scope.$on(
          'add_connection',
          function (event, data, isServiceConnection) {
            var firstSide = data.first_side + 'Connected';
            var secondSide = data.second_side + 'Connected';
            var matched = false;
            for (var i = 0; i < $scope.connections.length; i++) {
              var matchedSame = determineMatched(
                data,
                $scope.connections[i].info,
                false
              );
              var matchedReverse = determineMatched(
                data,
                $scope.connections[i].info,
                true
              );
              if (matchedSame || matchedReverse) matched = true;
            }
            if (!matched) {
              $scope.currentQuery.changed = true;
              if (
                $scope.currentQuery.query.query_type ===
                CONST.QUERY_TYPES.GENERAL
              ) {
                $rootScope.$emit('queryBuilder.dialogBox.connection.open', {
                  connection: data,
                  isServiceConnection: isServiceConnection,
                });
              } else if (
                $scope.currentQuery.query.query_type ===
                CONST.QUERY_TYPES.SERVICE
              ) {
                $rootScope.$emit(
                  'queryBuilder.dialogBox.appFlowConnection.open',
                  {
                    connection: data,
                  }
                );
              }
              if (
                queryBuilderCommon.isApplicationServiceNode(
                  queryBuilderCommon.getTrueParent(data.first)
                )
              )
                data.includesGraph = true;
              var firstHasConnection =
                data.first[data.first_side + 'Connections'].length > 0 &&
                (data.first.nodeType === CONST.NODETYPE.CLASS ||
                  data.first.nodeType === CONST.NODETYPE.SERVICE ||
                  data.first.nodeType === CONST.OBJECT_TYPES.NON_CMDB);
              var secondHasConnection =
                data.second[data.second_side + 'Connections'].length > 0 &&
                (data.second.nodeType === CONST.NODETYPE.CLASS ||
                  data.second.nodeType === CONST.NODETYPE.SERVICE ||
                  data.second.nodeType === CONST.OBJECT_TYPES.NON_CMDB);
              if (newConnection(data)) {
                data.first[data.first_side + 'Connections'].push(data.second);
                data.second[data.second_side + 'Connections'].push(data.first);
                data.first[firstSide] = true;
                data.second[secondSide] = true;
                $scope.connections.push({
                  id: getConnectionId(data),
                  info: data,
                });
                $scope.updateLine({
                  info: data,
                });
                $scope.$emit('connection_touched', {
                  connection: data,
                });
              } else if (firstHasConnection && secondHasConnection) {
                createDoubleOperators(data);
              } else if (firstHasConnection && !secondHasConnection) {
                createOperator(data, 'first');
              } else if (secondHasConnection && !firstHasConnection) {
                createOperator(data, 'second');
              } else if (
                data.first.nodeType === CONST.NODETYPE.OPERATOR ||
                data.second.nodeType === CONST.NODETYPE.OPERATOR
              ) {
                data.first[data.first_side + 'Connections'].push(data.second);
                data.second[data.second_side + 'Connections'].push(data.first);
                data.first[firstSide] = true;
                data.second[secondSide] = true;
                $scope.connections.push({
                  id: getConnectionId(data),
                  info: data,
                });
                $scope.updateLine({
                  info: data,
                });
                $scope.$emit('connection_touched', {
                  connection: data,
                });
              } else if (
                data.first.nodeType === CONST.NODETYPE.SERVICE ||
                data.second.nodeType === CONST.NODETYPE.SERVICE
              ) {
                data.first[data.first_side + 'Connections'].push(data.second);
                data.second[data.second_side + 'Connections'].push(data.first);
                data.first[firstSide] = true;
                data.second[secondSide] = true;
                $scope.connections.push({
                  id: getConnectionId(data),
                  info: data,
                });
                $scope.updateLine({
                  info: data,
                });
                $scope.$emit('connection_touched', {
                  connection: data,
                });
              } else if (data.second.nodeType === CONST.OBJECT_TYPES.NON_CMDB) {
                data.first[data.first_side + 'Connections'].push(data.second);
                data.second[data.second_side + 'Connections'].push(data.first);
                data.first[firstSide] = true;
                data.second[secondSide] = true;
                $scope.connections.push({
                  id: getConnectionId(data),
                  info: data,
                });
                $scope.updateLine({
                  info: data,
                });
                $scope.$emit('connection_touched', {
                  connection: data,
                });
              }
              ensureIsPatternSetCorrectly();
              $timeout(function () {
                $rootScope.$broadcast('calculate_path_center');
              });
            } else {
              $scope.$emit('queryBuilder.closeDialogBox');
              snNotification
                .show(
                  'error',
                  i18n.getMessage(
                    'queryBuilder.notifications.connectionExists'
                  ),
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
            }
          }
        );
        $scope.$on('clear_canvas', function () {
          $scope.connections = [];
        });
        $scope.$on('removeConnections', function (event, data) {
          if (data.node && data.node.nodeType === CONST.NODETYPE.OPERATOR) {
            var singleSideConnectionFound = false;
            for (var i = 0; i < $scope.connections.length; i++) {
              var first = $scope.connections[i].info.first;
              var second = $scope.connections[i].info.second;
              if (
                (first === data.node && data.node.multipleSide === 'left') ||
                (second === data.node && data.node.multipleSide === 'right')
              ) {
                if (queryBuilderCommon.isApplicationServiceNode(first))
                  setIsPatternFalse(first);
                deleteConnection(i);
                singleSideConnectionFound = true;
              }
            }
          }
          if (data.node && !singleSideConnectionFound) {
            for (var i = $scope.connections.length; i > 0; i--) {
              if (
                $scope.connections[i - 1].info.first === data.node ||
                $scope.connections[i - 1].info.second === data.node
              ) {
                if (queryBuilderCommon.isApplicationServiceNode(data.node))
                  setIsPatternFalse(data.node);
                for (var j = 0; j < data.node.leftConnections.length; j++) {
                  var left = data.node.leftConnections[j];
                  var index = left.rightConnections.indexOf(data.node);
                  if (index >= 0) left.rightConnections.splice(index, 1);
                }
                for (var k = 0; k < data.node.rightConnections.length; k++) {
                  var right = data.node.rightConnections[k];
                  var index = right.leftConnections.indexOf(data.node);
                  if (index >= 0) right.leftConnections.splice(index, 1);
                }
                deleteConnection(i - 1, data.node);
              }
            }
            if (data.node.nodeType === CONST.NODETYPE.OPERATOR) {
              var nodeIndex = $scope.nodes.indexOf(data.node);
              if (nodeIndex >= 0) {
                $scope.nodes.splice(nodeIndex, 1);
                if (queryBuilderCanvasUtil.getLatestTouched() === data.node)
                  queryBuilderCanvasUtil.setLatestTouched(null);
              }
            }
          }
        });
        function deleteConnection(i, node) {
          $scope.currentQuery.changed = true;
          var index1 = $scope.connections[
            i
          ].info.first.rightConnections.indexOf(
            $scope.connections[i].info.second
          );
          var index2 = $scope.connections[
            i
          ].info.second.leftConnections.indexOf(
            $scope.connections[i].info.first
          );
          if (index1 >= 0)
            $scope.connections[i].info.first.rightConnections.splice(index1, 1);
          if (index2 >= 0)
            $scope.connections[i].info.second.leftConnections.splice(index2, 1);
          if ((node && node.nodeType !== CONST.NODETYPE.OPERATOR) || !node) {
            var index1Operator =
              $scope.connections[i].info.first.nodeType ===
              CONST.NODETYPE.OPERATOR
                ? true
                : false;
            var index2Operator =
              $scope.connections[i].info.second.nodeType ===
              CONST.NODETYPE.OPERATOR
                ? true
                : false;
            if (index1Operator) {
              var stillValidOperator1 =
                queryBuilderValidation.checkPrimarySideOfOperator(
                  $scope.connections[i].info.first
                );
              var operator1 = $scope.connections[i].info.first;
              var isMultipleSideRight =
                $scope.connections[i].info.first.multipleSide === 'right';
            }
            if (index2Operator) {
              var stillValidOperator2 =
                queryBuilderValidation.checkPrimarySideOfOperator(
                  $scope.connections[i].info.second
                );
              var operator2 = $scope.connections[i].info.second;
              var isMultipleSideLeft =
                $scope.connections[i].info.second.multipleSide === 'left';
            }
          }
          if (
            $scope.connections[i].info ===
            queryBuilderCanvasUtil.getLatestTouched()
          ) {
            var operatorLines = queryBuilderCanvasUtil.getOperatorLines();
            for (var j = 0; j < operatorLines.length; j++)
              operatorLines[j].touched = false;
            queryBuilderCanvasUtil.getOperatorLines([]);
            queryBuilderCanvasUtil.setLatestTouched(null);
          }
          var multipleSide = queryBuilderValidation.isOnMultipleSide(
            $scope.connections[i].info
          );
          if (i >= 0) $scope.connections.splice(i, 1);
          if (!multipleSide) {
            if (operator1 && !isMultipleSideRight)
              removeMultipleSide(operator1);
            else if (operator2 && !isMultipleSideLeft)
              removeMultipleSide(operator2);
          }
          if (index1Operator && !stillValidOperator1 && operator1) {
            removeOperator(operator1);
          } else if (index2Operator && !stillValidOperator2 && operator2) {
            removeOperator(operator2);
          }
          verifyLatestTouched();
          hideRelationInfo();
          $timeout(function () {
            $rootScope.$broadcast('calculate_path_center');
          });
        }
        $scope.displayConnectionInfo = function (event, connection) {
          $scope.$emit('connection_touched', {
            connection: connection,
          });
          event.stopPropagation();
        };
        $scope.missingRelationsPosition = function (connection) {
          return {
            left: connection.center.x - 10 + 'px',
            top: connection.center.y - 10 + 'px',
          };
        };
        $scope.calculatePath = function (conn) {
          if (conn && conn.info && conn.info.path) return conn.info.path;
          return null;
        };
        $scope.updateLine = function (conn) {
          if (conn && conn.info && conn.info.line) {
            conn.info.isOperatorConnection = $scope.isOperatorConnection(conn);
            queryBuilderConnectionUtil.calculateLine(conn, conn.info.line);
            conn.info.path = lineFunction(conn.info.line);
          }
        };
        $scope.calculateArrow = function (conn) {
          if (conn && conn.info && conn.info.second) {
            var second = conn.info.second;
            var secondSide = conn.info.second_side;
            var secondBox = second[secondSide + 'Center'];
            var endPoint = {
              x: secondBox.x,
              y: secondBox.y,
            };
            var x = endPoint.x - 17;
            var y = endPoint.y;
            var first = x + ' ' + (y + 5);
            var second = x + 10 + ' ' + y;
            var third = x + ' ' + (y - 5);
            return (
              'M' +
              x +
              ' ' +
              y +
              ' L ' +
              first +
              ' L ' +
              second +
              ' L ' +
              third +
              'z'
            );
          }
          return null;
        };
        $scope.addHoverActive = function (event, conn) {
          if (!queryBuilderSelection.makingSelection())
            showRelationInfo(event, conn);
        };
        $scope.removeHoverActive = function () {
          hideRelationInfo();
        };
        $scope.connectionFocused = function (event, conn) {
          conn.info.focused =
            queryBuilderValidation.isOnMultipleSide(conn.info) &&
            !(
              conn.info.first.nodeType === CONST.NODETYPE.OPERATOR &&
              conn.info.second.nodeType === CONST.NODETYPE.OPERATOR
            );
        };
        $scope.connectionBlurred = function (event, conn) {
          conn.info.focused = false;
        };
        $scope.getConnectionClasses = function (conn) {
          return {
            'dashed-line': conn.info.isDotted || isPatternConnection(conn.info),
            selected: conn.info.touched,
            error: conn.info.error,
            focused: conn.info.focused,
          };
        };
        $scope.getArrowClasses = function (conn) {
          return {
            selected: conn.info.touched,
            error: conn.info.error,
            focused: conn.info.focused,
          };
        };
        $scope.isOperatorConnection = function (conn) {
          if (conn.info.second.nodeType === CONST.NODETYPE.OPERATOR)
            return true;
          return false;
        };
        $scope.getConnectionAriaLabel = function (conn) {
          if (conn) {
            return i18n.format(
              i18n.getMessage('queryBuilder.accessibility.connection'),
              [conn.info.first.name, conn.info.second.name]
            );
          }
          return '';
        };
        function deleteSpecificConnection(conn) {
          for (var i = 0; i < $scope.connections.length; i++) {
            if (
              $scope.connections[i].info.first === conn.first &&
              $scope.connections[i].info.second === conn.second
            ) {
              if (conn.first.isPattern) setIsPatternFalse(conn.first);
              deleteConnection(i);
            }
          }
        }
        $scope.$on(
          'queryBuilder.deleteSpecificConnection',
          function (event, data) {
            deleteSpecificConnection(data.conn);
          }
        );
        $scope.$on('queryBuilder.updateLine', function (event, data) {
          $scope.updateLine(data.conn);
        });
        function changeAndOr(conn) {
          if (conn.connection) conn = conn.connection;
        }
        $scope.srCanvasChangeMsg = null;
        function isPatternConnection(conn) {
          if (conn.applyToAllNodes) return true;
          if (
            conn.first &&
            conn.first.nodeType === CONST.NODETYPE.OPERATOR &&
            conn.second &&
            conn.second.nodeType !== CONST.OBJECT_TYPES.NON_CMDB
          ) {
            var firstConns = conn.first.leftConnections;
            if (firstConns.length === 1 && firstConns[0].isPattern) return true;
          }
          if (conn.second && conn.second.nodeType === CONST.NODETYPE.OPERATOR) {
            if (conn.first && conn.first.isPattern) return true;
          }
          if (
            conn.first &&
            conn.first.nodeType !== CONST.NODETYPE.OPERATOR &&
            conn.second &&
            conn.second.nodeType !== CONST.OBJECT_TYPES.NON_CMDB
          ) {
            if (conn.first.isPattern) return true;
          }
          return false;
        }
        function createOperator(data, side) {
          if (side === 'first') {
            createNewOperatorNode(data, side).then(function (operator) {
              var index = -1;
              var previousConnection = null;
              var previousChild =
                data.first[data.first_side + 'Connections'][0];
              for (var i = 0; i < $scope.connections.length; i++) {
                if (
                  data.first.nodeId ===
                    $scope.connections[i].info.first.nodeId &&
                  previousChild.nodeId ===
                    $scope.connections[i].info.second.nodeId
                ) {
                  index = i;
                }
              }
              previousConnection = $scope.connections[index];
              if (index >= 0) {
                $scope.connections.splice(index, 1);
                verifyLatestTouched();
              }
              var indexOfChild =
                data.first[data.first_side + 'Connections'].indexOf(
                  previousChild
                );
              if (indexOfChild >= 0)
                data.first[data.first_side + 'Connections'].splice(
                  indexOfChild,
                  1
                );
              var indexOfParent = previousChild[
                data.second_side + 'Connections'
              ].indexOf(data.first);
              if (indexOfParent >= 0)
                previousChild[data.second_side + 'Connections'].splice(
                  indexOfParent,
                  1
                );
              data.first[data.first_side + 'Connections'].push(operator);
              data.second[data.second_side + 'Connections'].push(operator);
              previousChild[data.second_side + 'Connections'].push(operator);
              $scope.srCanvasChangeMsg = i18n.format(
                i18n.getMessage('queryBuilder.addOperatorNode.first'),
                [data.first.name, previousChild.name, data.second.name]
              );
              var parentOperator = {
                first: data.first,
                second: operator,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: [],
                noRelations: false,
                reference: '',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: parentOperator,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(parentOperator)
              ) {
                parentOperator.appFlow = false;
                parentOperator.notAppFlow = false;
                parentOperator.reverseAppFlow = false;
                parentOperator.notReverseAppFlow = false;
              }
              $scope.connections.push({
                id: getConnectionId(parentOperator),
                info: parentOperator,
              });
              operator.leftConnections.push(data.first);
              var operatorPrevious = {
                first: operator,
                second: previousChild,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: previousConnection.info.relations,
                noRelations: previousConnection.info.noRelations,
                reference: previousConnection.info.reference,
                isValid: previousConnection.info.isValid,
                isReverse: previousConnection.info.isReverse,
                relationshipLevels: previousConnection.info.relationshipLevels,
                applyToAllNodes: previousConnection.info.applyToAllNodes,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              if (
                angular.isDefined(
                  previousConnection.info.selectedNonCmdbReference
                )
              ) {
                operatorPrevious.selectedNonCmdbReference =
                  previousConnection.info.selectedNonCmdbReference;
              }
              $scope.updateLine({
                info: operatorPrevious,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(operatorPrevious)
              ) {
                operatorPrevious.appFlow = previousConnection.info.appFlow;
                operatorPrevious.notAppFlow =
                  previousConnection.info.notAppFlow;
                operatorPrevious.reverseAppFlow =
                  previousConnection.info.reverseAppFlow;
                operatorPrevious.notReverseAppFlow =
                  previousConnection.info.notReverseAppFlow;
              }
              if (previousConnection.info.belongs != 'undefined') {
                operatorPrevious.belongs = previousConnection.info.belongs;
                operatorPrevious.isNot = previousConnection.info.isNot;
              }
              if (previousConnection.info.type) {
                operatorPrevious.type = previousConnection.info.type;
                operatorPrevious.isNot = previousConnection.info.isNot;
              }
              if (angular.isDefined(previousConnection.info.includesGraph))
                operatorPrevious.includesGraph =
                  previousConnection.info.includesGraph;
              $scope.connections.push({
                id: getConnectionId(operatorPrevious),
                info: operatorPrevious,
              });
              operator.rightConnections.push(previousChild);
              var newChildConnection = {
                first: operator,
                second: data.second,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: [],
                noRelations: false,
                reference: '',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: newChildConnection,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(newChildConnection)
              ) {
                newChildConnection.appFlow = data.appFlow;
                newChildConnection.notAppFlow = data.notAppFlow;
                newChildConnection.reverseAppFlow = data.reverseAppFlow;
                newChildConnection.notReverseAppFlow = data.notReverseAppFlow;
              }
              if (data.belongs != 'undefined') {
                newChildConnection.belongs = data.belongs;
                newChildConnection.isNot = data.isNot;
              }
              if (data.type) {
                newChildConnection.type = data.type;
                newChildConnection.isNot = data.isNot;
              }
              if (angular.isDefined(data.includesGraph))
                newChildConnection.includesGraph = data.includesGraph;
              $scope.connections.push({
                id: getConnectionId(newChildConnection),
                info: newChildConnection,
              });
              $scope.$emit('connection_touched', {
                connection: newChildConnection,
              });
              operator.rightConnections.push(data.second);
              ensureIsPatternSetCorrectly();
            });
          } else if (side === 'second') {
            createNewOperatorNode(data, side).then(function (operator) {
              var index = -1;
              var previousConnection = null;
              var previousParent =
                data.second[data.second_side + 'Connections'][0];
              for (var i = 0; i < $scope.connections.length; i++) {
                if (
                  previousParent.nodeId ===
                    $scope.connections[i].info.first.nodeId &&
                  data.second.nodeId ===
                    $scope.connections[i].info.second.nodeId
                ) {
                  index = i;
                }
              }
              previousConnection = $scope.connections[index];
              if (index >= 0) {
                $scope.connections.splice(index, 1);
                verifyLatestTouched();
              }
              var indexOfParent =
                data.second[data.second_side + 'Connections'].indexOf(
                  previousParent
                );
              if (indexOfParent >= 0)
                data.second[data.second_side + 'Connections'].splice(
                  indexOfParent,
                  1
                );
              var indexOfChild = previousParent[
                data.first_side + 'Connections'
              ].indexOf(data.second);
              if (indexOfChild >= 0)
                previousParent[data.first_side + 'Connections'].splice(
                  indexOfChild,
                  1
                );
              data.first[data.first_side + 'Connections'].push(operator);
              previousParent[data.first_side + 'Connections'].push(operator);
              data.second[data.second_side + 'Connections'].push(operator);
              $scope.srCanvasChangeMsg = i18n.format(
                i18n.getMessage('queryBuilder.addOperatorNode.second'),
                [previousParent.name, data.first.name, data.second.name]
              );
              var parentOperator = {
                first: data.first,
                second: operator,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: [],
                noRelations: false,
                reference: '',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: parentOperator,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(parentOperator)
              ) {
                parentOperator.appFlow = data.appFlow;
                parentOperator.notAppFlow = data.notAppFlow;
                parentOperator.reverseAppFlow = data.reverseAppFlow;
                parentOperator.notReverseAppFlow = data.notReverseAppFlow;
              }
              if (data.type) {
                parentOperator.type = data.type;
                parentOperator.isNot = data.isNot;
              }
              $scope.connections.push({
                id: getConnectionId(parentOperator),
                info: parentOperator,
              });
              operator.leftConnections.push(data.first);
              var operatorPrevious = {
                first: previousParent,
                second: operator,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: previousConnection.info.relations,
                noRelations: previousConnection.info.noRelations,
                reference: previousConnection.info.reference,
                isValid: previousConnection.info.isValid,
                isReverse: previousConnection.info.isReverse,
                relationshipLevels: previousConnection.info.relationshipLevels,
                applyToAllNodes: previousConnection.info.applyToAllNodes,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              if (
                angular.isDefined(
                  previousConnection.info.selectedNonCmdbReference
                )
              ) {
                operatorPrevious.selectedNonCmdbReference =
                  previousConnection.info.selectedNonCmdbReference;
              }
              $scope.updateLine({
                info: operatorPrevious,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(operatorPrevious)
              ) {
                operatorPrevious.appFlow = previousConnection.info.appFlow;
                operatorPrevious.notAppFlow =
                  previousConnection.info.notAppFlow;
                operatorPrevious.reverseAppFlow =
                  previousConnection.info.reverseAppFlow;
                operatorPrevious.notReverseAppFlow =
                  previousConnection.info.notReverseAppFlow;
              }
              if (previousConnection.info.belongs) {
                operatorPrevious.belongs = previousConnection.info.belongs;
                operatorPrevious.isNot = previousConnection.info.isNot;
              }
              if (previousConnection.info.type) {
                operatorPrevious.type = previousConnection.info.type;
                operatorPrevious.isNot = previousConnection.info.isNot;
              }
              if (angular.isDefined(previousConnection.info.includesGraph))
                operatorPrevious.includesGraph =
                  previousConnection.info.includesGraph;
              $scope.connections.push({
                id: getConnectionId(operatorPrevious),
                info: operatorPrevious,
              });
              operator.leftConnections.push(previousParent);
              var newChildConnection = {
                first: operator,
                second: data.second,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: [],
                noRelations: false,
                reference: '',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: newChildConnection,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(newChildConnection)
              ) {
                newChildConnection.appFlow = false;
                newChildConnection.notAppFlow = false;
                newChildConnection.reverseAppFlow = false;
                newChildConnection.notReverseAppFlow = false;
              }
              if (angular.isDefined(data.includesGraph))
                newChildConnection.includesGraph = data.includesGraph;
              $scope.connections.push({
                id: getConnectionId(newChildConnection),
                info: newChildConnection,
              });
              $scope.$emit('connection_touched', {
                connection: parentOperator,
              });
              operator.rightConnections.push(data.second);
              ensureIsPatternSetCorrectly();
            });
          }
        }
        function createDoubleOperators(data) {
          createNewOperatorNode(data, 'first').then(function (operator) {
            var index = -1;
            var previousConnection = null;
            var previousChild = data.first[data.first_side + 'Connections'][0];
            for (var i = 0; i < $scope.connections.length; i++) {
              if (
                data.first.nodeId === $scope.connections[i].info.first.nodeId &&
                previousChild.nodeId ===
                  $scope.connections[i].info.second.nodeId
              ) {
                index = i;
              }
            }
            previousConnection = $scope.connections[index];
            if (index >= 0) {
              $scope.connections.splice(index, 1);
              verifyLatestTouched();
            }
            var indexOfChild =
              data.first[data.first_side + 'Connections'].indexOf(
                previousChild
              );
            if (indexOfChild >= 0)
              data.first[data.first_side + 'Connections'].splice(
                indexOfChild,
                1
              );
            var indexOfParent = previousChild[
              data.second_side + 'Connections'
            ].indexOf(data.first);
            if (indexOfParent >= 0)
              previousChild[data.second_side + 'Connections'].splice(
                indexOfParent,
                1
              );
            data.first[data.first_side + 'Connections'].push(operator);
            data.second[data.second_side + 'Connections'].push(operator);
            previousChild[data.second_side + 'Connections'].push(operator);
            var parentOperator = {
              first: data.first,
              second: operator,
              isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                ? true
                : false,
              center: {
                x: null,
                y: null,
              },
              first_side: data.first_side,
              second_side: data.second_side,
              relations: [],
              noRelations: false,
              reference: '',
              isValid: false,
              touched: false,
              line: queryBuilderConnectionUtil.emptyLine(),
            };
            $scope.updateLine({
              info: parentOperator,
            });
            if (
              queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
              isPatternConnection(parentOperator)
            ) {
              parentOperator.appFlow = false;
              parentOperator.notAppFlow = false;
              parentOperator.reverseAppFlow = false;
              parentOperator.notReverseAppFlow = false;
            }
            $scope.connections.push({
              id: getConnectionId(parentOperator),
              info: parentOperator,
            });
            operator.leftConnections.push(data.first);
            var operatorPrevious = {
              first: operator,
              second: previousChild,
              isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                ? true
                : false,
              center: {
                x: null,
                y: null,
              },
              first_side: data.first_side,
              second_side: data.second_side,
              relations: previousConnection.info.relations,
              noRelations: previousConnection.info.noRelations,
              reference: previousConnection.info.reference,
              isValid: previousConnection.info.isValid,
              isReverse: previousConnection.info.isReverse,
              relationshipLevels: previousConnection.info.relationshipLevels,
              applyToAllNodes: previousConnection.info.applyToAllNodes,
              touched: false,
              line: queryBuilderConnectionUtil.emptyLine(),
            };
            $scope.updateLine({
              info: operatorPrevious,
            });
            if (
              queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
              isPatternConnection(operatorPrevious)
            ) {
              operatorPrevious.appFlow = previousConnection.info.appFlow;
              operatorPrevious.notAppFlow = previousConnection.info.notAppFlow;
              operatorPrevious.reverseAppFlow =
                previousConnection.info.reverseAppFlow;
              operatorPrevious.notReverseAppFlow =
                previousConnection.info.notReverseAppFlow;
            }
            if (previousConnection.info.belongs != 'undefined') {
              operatorPrevious.belongs = previousConnection.info.belongs;
              operatorPrevious.isNot = previousConnection.info.isNot;
            }
            if (previousConnection.info.type) {
              operatorPrevious.type = previousConnection.info.type;
              operatorPrevious.isNot = previousConnection.info.isNot;
            }
            if (angular.isDefined(previousConnection.info.includesGraph))
              operatorPrevious.includesGraph =
                previousConnection.info.includesGraph;
            $scope.connections.push({
              id: getConnectionId(operatorPrevious),
              info: operatorPrevious,
            });
            operator.rightConnections.push(previousChild);
            createNewOperatorNode(data, 'second').then(function (
              secondOperator
            ) {
              var index = -1;
              var previousConnection = null;
              var previousParent =
                data.second[data.second_side + 'Connections'][0];
              for (var i = 0; i < $scope.connections.length; i++) {
                if (
                  previousParent.nodeId ===
                    $scope.connections[i].info.first.nodeId &&
                  data.second.nodeId ===
                    $scope.connections[i].info.second.nodeId
                ) {
                  index = i;
                }
              }
              previousConnection = $scope.connections[index];
              if (index >= 0) {
                $scope.connections.splice(index, 1);
                verifyLatestTouched();
              }
              var indexOfParent =
                data.second[data.second_side + 'Connections'].indexOf(
                  previousParent
                );
              if (indexOfParent >= 0)
                data.second[data.second_side + 'Connections'].splice(
                  indexOfParent,
                  1
                );
              var indexOfChild = previousParent[
                data.first_side + 'Connections'
              ].indexOf(data.second);
              if (indexOfChild >= 0)
                previousParent[data.first_side + 'Connections'].splice(
                  indexOfChild,
                  1
                );
              operator[data.first_side + 'Connections'].push(secondOperator);
              previousParent[data.first_side + 'Connections'].push(
                secondOperator
              );
              data.second[data.second_side + 'Connections'].push(
                secondOperator
              );
              $scope.srCanvasChangeMsg = i18n.format(
                i18n.getMessage('queryBuilder.addDoubleOperatorNode'),
                [
                  data.first.name,
                  previousParent.name,
                  previousChild.name,
                  data.second.name,
                ]
              );
              var parentOperator = {
                first: operator,
                second: secondOperator,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: [],
                noRelations: false,
                reference: '',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: parentOperator,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(parentOperator)
              ) {
                parentOperator.appFlow = data.appFlow;
                parentOperator.notAppFlow = data.notAppFlow;
                parentOperator.reverseAppFlow = data.reverseAppFlow;
                parentOperator.notReverseAppFlow = data.notReverseAppFlow;
              }
              if (data.type) {
                parentOperator.type = data.type;
                parentOperator.isNot = data.isNot;
              }
              $scope.connections.push({
                id: getConnectionId(parentOperator),
                info: parentOperator,
              });
              secondOperator.leftConnections.push(operator);
              var operatorPrevious = {
                first: previousParent,
                second: secondOperator,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: previousConnection.info.relations,
                noRelations: previousConnection.info.noRelations,
                reference: previousConnection.info.reference,
                isValid: previousConnection.info.isValid,
                isReverse: previousConnection.info.isReverse,
                applyToAllNodes: previousConnection.info.applyToAllNodes,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: operatorPrevious,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(operatorPrevious)
              ) {
                operatorPrevious.appFlow = previousConnection.info.appFlow;
                operatorPrevious.notAppFlow =
                  previousConnection.info.notAppFlow;
                operatorPrevious.reverseAppFlow =
                  previousConnection.info.reverseAppFlow;
                operatorPrevious.notReverseAppFlow =
                  previousConnection.info.notReverseAppFlow;
              }
              if (previousConnection.info.belongs) {
                operatorPrevious.belongs = previousConnection.info.belongs;
                operatorPrevious.isNot = previousConnection.info.isNot;
              }
              if (previousConnection.info.type) {
                operatorPrevious.type = previousConnection.info.type;
                operatorPrevious.isNot = previousConnection.info.isNot;
              }
              if (angular.isDefined(previousConnection.info.includesGraph))
                operatorPrevious.includesGraph =
                  previousConnection.info.includesGraph;
              $scope.connections.push({
                id: getConnectionId(operatorPrevious),
                info: operatorPrevious,
              });
              secondOperator.leftConnections.push(previousParent);
              var newChildConnection = {
                first: secondOperator,
                second: data.second,
                isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
                  ? true
                  : false,
                center: {
                  x: null,
                  y: null,
                },
                first_side: data.first_side,
                second_side: data.second_side,
                relations: [],
                noRelations: false,
                reference: '',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
              };
              $scope.updateLine({
                info: newChildConnection,
              });
              if (
                queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
                isPatternConnection(newChildConnection)
              ) {
                newChildConnection.appFlow = false;
                newChildConnection.notAppFlow = false;
                newChildConnection.reverseAppFlow = false;
                newChildConnection.notReverseAppFlow = false;
              }
              if (angular.isDefined(data.includesGraph))
                newChildConnection.includesGraph = data.includesGraph;
              $scope.connections.push({
                id: getConnectionId(newChildConnection),
                info: newChildConnection,
              });
              $scope.$emit('connection_touched', {
                connection: parentOperator,
              });
              secondOperator.rightConnections.push(data.second);
              ensureIsPatternSetCorrectly();
            });
          });
        }
        function createNewOperatorNode(data, side) {
          var defer = $q.defer();
          var centerTriangle = findCenterTriangle(data, side);
          var node = {
            nodeId: getOperatorID(),
            x: centerTriangle.x,
            y: centerTriangle.y,
            center: null,
            divWidth: null,
            divHeight: null,
            hovering: false,
            leftSelected: false,
            leftConnected: false,
            leftCorner: null,
            leftCenter: null,
            rightSelected: false,
            rightConnected: false,
            rightCorner: null,
            rightCenter: null,
            dragged: false,
            nodeType: CONST.NODETYPE.OPERATOR,
            name: CONST.OPERATOR.AND,
            leftConnections: [],
            rightConnections: [],
            multipleSide: data[side + '_side'],
            operatorNumber: getOperatorNumber(),
          };
          $scope.nodes.push(node);
          $rootScope.$broadcast('calculate_center');
          $timeout(function () {
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('calculate_path_center');
            defer.resolve(node);
          });
          return defer.promise;
        }
        function getOperatorID() {
          var date = new Date();
          var GMT = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
          var local = new Date(GMT.valueOf() + $scope.api.g_tz_offset);
          var formatted =
            local.getMonth() +
            1 +
            '_' +
            local.getDate() +
            '_' +
            local.getFullYear() +
            '_' +
            local.getHours() +
            '_' +
            local.getMinutes() +
            '_' +
            local.getSeconds();
          return 'OPERATOR_' + formatted;
        }
        function getOperatorNumber() {
          if ($scope.currentQuery.usedNames['operator']) {
            $scope.currentQuery.usedNames['operator'] += 1;
          } else {
            $scope.currentQuery.usedNames['operator'] = 1;
          }
          return $scope.currentQuery.usedNames['operator'];
        }
        function findCenterTriangle(points, side) {
          var first = points.first;
          var second = points[side][points[side + '_side'] + 'Connections'][0];
          var third = points.second;
          if (side === 'first') {
            var centerTriangleX = (first.x + second.x + third.x) / 3 - 10;
            var centerTriangleY = (first.y + second.y + third.y) / 3 - 10;
          } else if (side === 'second') {
            var centerTriangleX =
              (first.x +
                first.divWidth +
                second.x +
                second.divWidth +
                third.x) /
                3 -
              10;
            var centerTriangleY = (first.y + second.y + third.y) / 3 - 10;
          }
          var center = {
            x: centerTriangleX,
            y: centerTriangleY,
          };
          return center;
        }
        function recreateConnection(connection) {
          $timeout(function () {
            var first = null;
            var second = null;
            for (var i = 0; i < $scope.nodes.length; i++) {
              if ($scope.nodes[i].nodeId === connection.from) {
                first = $scope.nodes[i];
              } else if ($scope.nodes[i].nodeId === connection.to) {
                second = $scope.nodes[i];
              }
            }
            if (first && second) {
              var relations = [];
              var noRelations = false;
              var reference = {};
              var relationshipLevels = angular.isDefined(connection.hiddenLevel)
                ? connection.hiddenLevel + 1
                : 1;
              if (connection.type === CONST.EDGE_TYPES.RELATION)
                relations = connection.relations;
              else if (connection.type === CONST.EDGE_TYPES.NO_RELATION)
                noRelations = true;
              else if (connection.type === CONST.EDGE_TYPES.REFERENCE)
                reference = connection.reference;
              var edge = {
                first: first,
                second: second,
                isDotted: connection.isDotted,
                isReverse: connection.isReverse,
                center: {
                  x: null,
                  y: null,
                },
                first_side: 'right',
                second_side: 'left',
                isValid: false,
                touched: false,
                line: queryBuilderConnectionUtil.emptyLine(),
                relationshipLevels: relationshipLevels,
                applyToAllNodes: connection.applyToAllNodes,
              };
              $scope.updateLine({
                info: edge,
              });
              if (angular.isDefined(connection.selectedNonCmdbReference)) {
                edge.type = CONST.OBJECT_TYPES.NON_CMDB;
                edge.selectedNonCmdbReference =
                  connection.selectedNonCmdbReference;
                edge.relations = [];
                edge.noRelations = false;
                edge.reference = {};
              } else if (
                connection.type !== CONST.EDGE_TYPES.APP_FLOW &&
                connection.type !== CONST.EDGE_TYPES.BELONGS &&
                connection.type !== CONST.OBJECT_TYPES.NON_CMDB
              ) {
                edge.relations = expandRelations(relations);
                edge.noRelations = noRelations;
                edge.reference = reference;
                if (connection.type === CONST.EDGE_TYPES.REFERENCE)
                  expandReference(edge, first, second);
              } else if (connection.type === CONST.EDGE_TYPES.APP_FLOW) {
                edge.type = CONST.EDGE_TYPES.APP_FLOW;
                edge.isNot = connection.isNot ? true : false;
                edge.isReverse = connection.isReverse;
                edge.appFlow = false;
                edge.notAppFlow = false;
                edge.reverseAppFlow = false;
                edge.notReverseAppFlow = false;
                if (!edge.isNot && !edge.isReverse) edge.appFlow = true;
                else if (edge.isNot && !edge.isReverse) edge.notAppFlow = true;
                else if (!edge.isNot && edge.isReverse)
                  edge.reverseAppFlow = true;
                else if (edge.isNot && edge.isReverse)
                  edge.notReverseAppFlow = true;
              } else if (connection.type === CONST.EDGE_TYPES.BELONGS) {
                edge.type = CONST.EDGE_TYPES.BELONGS;
                edge.isNot = connection.isNot ? true : false;
                edge.belongs = true;
                if (edge.isNot) edge.belongs = false;
                edge.relations = relations;
                edge.noRelations = noRelations;
                edge.reference = reference;
                if (angular.isDefined(connection.includesGraph)) {
                  edge.includesGraph = connection.includesGraph;
                  edge.type = CONST.EDGE_TYPES.APP_FLOW;
                  delete edge.isNot;
                  delete edge.belongs;
                }
              }
              $scope.connections.push({
                id: connection.id,
                info: edge,
              });
              first.rightConnections.push(second);
              second.leftConnections.push(first);
            }
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('calculate_path_center');
            ensureIsPatternSetCorrectly();
          });
        }
        function showRelationInfo(event, conn) {
          if (queryBuilderValidation.isOnMultipleSide(conn.info)) {
            var canvas = angular.element('.canvas-container');
            var label = angular.element('.relationship-label');
            var relationshipLabel = 'Missing relation information';
            var topOffset = canvas.offset().top - 130;
            label.addClass('active');
            label.css('top', event.clientY + 30 + 'px');
            label.css('left', event.clientX + 'px');
            if (conn.info.type === CONST.EDGE_TYPES.APP_FLOW) {
              relationshipLabel = '';
              relationshipLabel += getRelationshipHeader(conn);
              if (conn.info.isNot)
                relationshipLabel +=
                  i18n.getMessage('queryBuilder.general.not') + ' ';
              var connType = i18n.getMessage(
                'queryBuilder.general.applicativeFlow'
              );
              relationshipLabel += connType;
            } else {
              relationshipLabel = '';
              relationshipLabel += getRelationshipHeader(conn);
              if (conn.info.relations.length > 0) {
                for (var i = 0; i < conn.info.relations.length; i++) {
                  if (i < 3)
                    relationshipLabel += conn.info.relations[i].label + '<br>';
                  else if (i === 3) {
                    relationshipLabel += '...';
                    break;
                  }
                }
              } else if (conn.info.noRelations)
                relationshipLabel += i18n.getMessage(
                  'queryBuilder.general.noRelations'
                );
              else if (conn.info.reference && conn.info.reference.label)
                relationshipLabel += conn.info.reference.label;
              else if (conn.info.belongs != undefined)
                relationshipLabel += conn.info.belongs
                  ? i18n.getMessage('queryBuilder.dialogBox.belongs')
                  : i18n.getMessage('queryBuilder.dialogBox.notBelongs');
              else if (
                angular.isDefined(conn.info.relationshipLevels) &&
                conn.info.relationshipLevels > 1
              ) {
                if (conn.info.relationshipLevels === 2)
                  relationshipLabel += i18n.getMessage(
                    'queryBuilder.relationshipLevels.second'
                  );
                else
                  relationshipLabel += i18n.getMessage(
                    'queryBuilder.relationshipLevels.multipleLevels'
                  );
              } else if (
                angular.isDefined(conn.info.selectedNonCmdbReference) &&
                conn.info.selectedNonCmdbReference.column_name !== null
              ) {
                relationshipLabel +=
                  conn.info.selectedNonCmdbReference.column_label;
              } else
                relationshipLabel = i18n.getMessage(
                  'queryBuilder.general.missingRelation'
                );
            }
            label.html(relationshipLabel);
          }
        }
        function hideRelationInfo() {
          var label = angular.element('.relationship-label');
          label.removeClass('active');
        }
        function getConnectionId(conn) {
          var parent = conn.first;
          var child = conn.second;
          var parentName, childName;
          if (
            parent.nodeType === CONST.NODETYPE.OPERATOR &&
            child.nodeType === CONST.NODETYPE.OPERATOR
          ) {
            parentName = parent.name + ' ' + parent.operatorNumber;
            childName = child.name + ' ' + child.operatorNumber;
          } else {
            var isOnMultipleSide =
              queryBuilderValidation.isOnMultipleSide(conn);
            if (parent.nodeType === CONST.NODETYPE.OPERATOR) {
              var trueParent = queryBuilderCommon.getTrueParent(parent);
              parentName =
                isOnMultipleSide && trueParent
                  ? trueParent.name
                  : parent.name + ' ' + parent.operatorNumber;
              childName = child.name;
            } else if (child.nodeType === CONST.NODETYPE.OPERATOR) {
              parentName = parent.name;
              var trueChild = queryBuilderCommon.getTrueChild(child);
              childName =
                isOnMultipleSide && trueChild
                  ? trueChild.name
                  : child.name + ' ' + child.operatorNumber;
            } else {
              parentName = parent.name;
              childName = child.name;
            }
          }
          return parentName + '_' + childName;
        }
        function expandRelations(relations) {
          var relationList = [];
          for (var i = 0; i < relations.length; i++) {
            var allRelationshipTypes =
              queryBuilderCanvasUtil.getAllRelationshipTypes();
            var label = allRelationshipTypes[relations[i]];
            relationList.push({
              label: label,
              sys_id: relations[i],
            });
          }
          return relationList;
        }
        function expandReference(connection, parent, child) {
          var parent = connection.first;
          var element = connection.reference;
          var fromNode = parent;
          if (fromNode.nodeType === CONST.NODETYPE.OPERATOR)
            fromNode = queryBuilderCommon.getTrueParent(fromNode);
          if (fromNode) {
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            var parentProperties = allProperties[fromNode.type];
            if (parentProperties) {
              for (var i = 0; i < parentProperties.length; i++) {
                if (
                  typeof element === 'string' &&
                  parentProperties[i].element === element
                )
                  connection.reference = parentProperties[i];
                else if (
                  typeof element === 'object' &&
                  parentProperties[i].element === element.column_name
                ) {
                  if (parentProperties[i].element === element.column_name)
                    connection.reference = parentProperties[i];
                }
              }
            }
          }
        }
        function getRelationshipHeader(conn) {
          var first = conn.info.first;
          var second = conn.info.second;
          if (first.nodeType === CONST.NODETYPE.OPERATOR)
            first = queryBuilderCommon.getTrueParent(first);
          else if (second.nodeType === CONST.NODETYPE.OPERATOR)
            second = queryBuilderCommon.getTrueChild(second);
          if (!first || !second)
            return i18n.getMessage('queryBuilder.connection.invalid');
          if (
            $scope.currentQuery.query.query_type === CONST.QUERY_TYPES.GENERAL
          ) {
            if (conn.info.isReverse)
              return (
                second.name +
                ' [' +
                i18n.getMessage('queryBuilder.general.parent') +
                '] - ' +
                first.name +
                ' [' +
                i18n.getMessage('queryBuilder.general.child') +
                '] ' +
                '<br>'
              );
            return (
              first.name +
              ' [' +
              i18n.getMessage('queryBuilder.general.parent') +
              '] - ' +
              second.name +
              ' [' +
              i18n.getMessage('queryBuilder.general.child') +
              '] ' +
              '<br>'
            );
          } else if (
            $scope.currentQuery.query.query_type === CONST.QUERY_TYPES.SERVICE
          ) {
            if (conn.info.isReverse)
              return second.name + ' - ' + first.name + '<br>';
            return first.name + ' - ' + second.name + '<br>';
          }
        }
        function newConnection(data) {
          if (
            data.first[data.first_side + 'Connections'].length === 0 &&
            data.first.nodeType === CONST.NODETYPE.CLASS &&
            data.second[data.second_side + 'Connections'].length === 0 &&
            data.second.nodeType === CONST.NODETYPE.CLASS
          )
            return true;
          return false;
        }
        function removeOperator(operator) {
          var index1 = -1;
          var index2 = -1;
          for (var i = 0; i < $scope.connections.length; i++) {
            if (
              $scope.connections[i].info.first === operator &&
              $scope.connections[i].info.second === operator.rightConnections[0]
            )
              index2 = i;
            else if (
              $scope.connections[i].info.second === operator &&
              $scope.connections[i].info.first === operator.leftConnections[0]
            )
              index1 = i;
          }
          var oldConnection =
            operator.multipleSide === 'right'
              ? $scope.connections[index2].info
              : $scope.connections[index1].info;
          var afterOperator = {
            first: operator.leftConnections[0],
            second: operator.rightConnections[0],
            isDotted: queryBuilderCommon.isServiceQuery($scope.currentQuery)
              ? true
              : false,
            center: {
              x: null,
              y: null,
            },
            first_side: 'right',
            second_side: 'left',
            relations: oldConnection.relations,
            noRelations: oldConnection.noRelations,
            reference: oldConnection.reference,
            isValid: oldConnection.isValid,
            touched: oldConnection.touched,
            isReverse: oldConnection.isReverse,
            line: queryBuilderConnectionUtil.emptyLine(),
            relationshipLevels: oldConnection.relationshipLevels,
          };
          if (angular.isDefined(oldConnection.selectedNonCmdbReference)) {
            afterOperator.selectedNonCmdbReference =
              oldConnection.selectedNonCmdbReference;
          }
          $scope.updateLine({
            info: afterOperator,
          });
          if (
            queryBuilderCommon.isServiceQuery($scope.currentQuery) ||
            isPatternConnection(afterOperator)
          ) {
            afterOperator.appFlow = oldConnection.appFlow;
            afterOperator.notAppFlow = oldConnection.notAppFlow;
            afterOperator.reverseAppFlow = oldConnection.reverseAppFlow;
            afterOperator.notReverseAppFlow = oldConnection.notReverseAppFlow;
            afterOperator.type = oldConnection.type;
            afterOperator.isNot = oldConnection.isNot;
          }
          if (angular.isDefined(oldConnection.includesGraph))
            afterOperator.includesGraph = oldConnection.includesGraph;
          if (angular.isDefined(oldConnection.applyToAllNodes))
            afterOperator.applyToAllNodes = oldConnection.applyToAllNodes;
          $scope.connections.push({
            id: getConnectionId(afterOperator),
            info: afterOperator,
          });
          operator.leftConnections[0].rightConnections.splice(0, 1);
          operator.rightConnections[0].leftConnections.splice(0, 1);
          operator.leftConnections[0].rightConnections.push(
            operator.rightConnections[0]
          );
          operator.rightConnections[0].leftConnections.push(
            operator.leftConnections[0]
          );
          if (index2 > index1) {
            if (index2 >= 0) $scope.connections.splice(index2, 1);
            if (index1 >= 0) $scope.connections.splice(index1, 1);
          } else if (index1 > index2) {
            if (index1 >= 0) $scope.connections.splice(index1, 1);
            if (index2 >= 0) $scope.connections.splice(index2, 1);
          }
          verifyLatestTouched();
          if (
            operator.leftConnections[0].nodeType === CONST.NODETYPE.OPERATOR
          ) {
            var leftOperator = operator.leftConnections[0];
            var stillValidOperatorLeft =
              queryBuilderValidation.checkPrimarySideOfOperator(leftOperator);
            if (!stillValidOperatorLeft) removeOperator(leftOperator);
          } else if (
            operator.rightConnections[0].nodeType === CONST.NODETYPE.OPERATOR
          ) {
            var rightOperator = operator.rightConnections[0];
            var stillValidOperatorRight =
              queryBuilderValidation.checkPrimarySideOfOperator(rightOperator);
            if (!stillValidOperatorRight) removeOperator(rightOperator);
          }
          for (var i = 0; i < $scope.nodes.length; i++) {
            if ($scope.nodes[i].nodeId === operator.nodeId)
              $scope.nodes.splice(i, 1);
          }
          ensureIsPatternSetCorrectly();
        }
        function removeMultipleSide(operator) {
          var conns = [];
          var checkNodes = [];
          if (operator.multipleSide === 'right') {
            for (var i = 0; i < $scope.connections.length; i++) {
              if ($scope.connections[i].info.first === operator) {
                conns.push(i);
                checkNodes.push($scope.connections[i].info.second);
              }
            }
          } else if (operator.multipleSide === 'left') {
            for (var i = 0; i < $scope.connections.length; i++) {
              if ($scope.connections[i].info.second === operator) {
                conns.push(i);
                checkNodes.push($scope.connections[i].info.first);
              }
            }
          }
          var nodeSide = operator.multipleSide === 'right' ? 'left' : 'right';
          var operatorSide = operator.multipleSide;
          for (
            var i = 0;
            i < operator[operatorSide + 'Connections'].length;
            i++
          ) {
            var index =
              operator[operatorSide + 'Connections'][i][
                nodeSide + 'Connections'
              ].indexOf(operator);
            if (index >= 0)
              operator[operatorSide + 'Connections'][i][
                nodeSide + 'Connections'
              ].splice(index, 1);
          }
          for (var i = conns.length - 1; i >= 0; i--) {
            $scope.connections.splice(conns[i], 1);
          }
          verifyLatestTouched();
          for (var i = 0; i < checkNodes.length; i++) {
            if (checkNodes[i].nodeType === CONST.NODETYPE.OPERATOR) {
              var stillValidOperator =
                queryBuilderValidation.checkPrimarySideOfOperator(
                  checkNodes[i]
                );
              if (!stillValidOperator) removeOperator(checkNodes[i]);
              if (nodeSide !== checkNodes[i].multipleSide)
                removeMultipleSide(checkNodes[i]);
            }
          }
          for (var i = 0; i < $scope.nodes.length; i++) {
            if ($scope.nodes[i].nodeId === operator.nodeId)
              $scope.nodes.splice(i, 1);
          }
        }
        function determineMatched(data, connection, reverse) {
          var parent = connection.first;
          var child = connection.second;
          var matched = checkDirectMatch(data, parent, child, reverse);
          if (matched) return matched;
          if (parent.nodeType === CONST.NODETYPE.OPERATOR)
            parent = queryBuilderCommon.getTrueParent(parent);
          if (child.nodeType === CONST.NODETYPE.OPERATOR)
            child = queryBuilderCommon.getTrueChild(child);
          return checkDirectMatch(data, parent, child, reverse);
        }
        function checkDirectMatch(data, parent, child, reverse) {
          if (!reverse) return data.first === parent && data.second === child;
          else if (reverse)
            return data.first === child && data.second === parent;
        }
        function verifyLatestTouched() {
          var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
          if (
            latestTouched &&
            queryBuilderValidation.isConnectionType(latestTouched)
          ) {
            var isStillValid = false;
            for (
              var i = 0;
              i < $scope.connections.length && !isStillValid;
              i++
            ) {
              if ($scope.connections[i].info === latestTouched) {
                isStillValid = true;
              }
            }
            if (!isStillValid) {
              queryBuilderCanvasUtil.setLatestTouched(null);
            }
          }
        }
        function ensureIsPatternSetCorrectly() {
          if (!queryBuilderTreeUtil.getLoadingTree()) {
            for (var i = 0; i < $scope.nodes.length; i++) {
              if (
                queryBuilderCommon.isApplicationServiceNode($scope.nodes[i])
              ) {
                queryBuilderCommon.setIsPattern(
                  $scope.nodes[i],
                  $scope.nodes[i].isPattern
                );
              }
            }
          } else {
            $timeout(function () {
              ensureIsPatternSetCorrectly();
            });
          }
        }
        function setIsPatternFalse(node) {
          for (var i = 0; i < node.rightConnections.length; i++) {
            queryBuilderCommon.setIsPattern(node.rightConnections[i], false);
          }
        }
        $scope.$on('createRelationship.dialogBox.closed', function () {
          if ($scope.srCanvasChangeMsg) {
            $timeout(function () {
              $scope.srMessage = $scope.srCanvasChangeMsg;
              $scope.srCanvasChangeMsg = null;
            });
          }
        });
        $scope.$on('queryBuilder.loadConnections', function (event, args) {
          var connections = args.edges;
          for (var i = 0; i < connections.length; i++) {
            recreateConnection(connections[i]);
          }
          for (var i = 0; i < $scope.connections.length; i++) {
            var conToUpdate = $scope.connections[i];
            conToUpdate.id = getConnectionId(conToUpdate);
          }
          $timeout(function () {
            for (var i = 0; i < $scope.connections.length; i++) {
              var connectionToUpdate = $scope.connections[i];
              connectionToUpdate.id = getConnectionId(connectionToUpdate.info);
            }
            $scope.updateLine($scope.connections[0]);
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('calculate_path_center');
          });
          $timeout(function () {
            $rootScope.$broadcast('queryBuilder.setTabBeforeState');
          });
        });
        $scope.$on('queryBuilder.gotProperties', function (event, args) {
          var type = args.type;
          var connections = $scope.connections;
          for (var i = 0; i < connections.length; i++) {
            var parent = connections[i].info.first;
            if (parent.nodeType === CONST.NODETYPE.OPERATOR)
              parent = queryBuilderCommon.getTrueParent(parent);
            if (
              (parent &&
                parent.type === type &&
                typeof connections[i].info.reference == 'string') ||
              typeof connections[i].info.reference === 'object'
            )
              expandReference(connections[i].info);
          }
        });
      },
    };
  },
]);
