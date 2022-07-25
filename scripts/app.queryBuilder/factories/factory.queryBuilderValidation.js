/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderValidation.js */
angular.module('sn.queryBuilder').factory('queryBuilderValidation', [
  'i18n',
  'CONSTQB',
  'snNotification',
  '$rootScope',
  'queryBuilderSelection',
  function (i18n, CONST, snNotification, $rootScope, queryBuilderSelection) {
    'use strict';
    function _isConnectionType(conn) {
      if (
        conn &&
        conn.touchedType &&
        conn.touchedType === CONST.OBJECT_TYPES.CONNECTION
      )
        return true;
      return false;
    }
    function _isNodeType(node) {
      if (
        node &&
        node.touchedType &&
        (node.touchedType === CONST.OBJECT_TYPES.NODE ||
          node.touchedType === CONST.OBJECT_TYPES.SERVICE ||
          node.touchedType === CONST.OBJECT_TYPES.NON_CMDB)
      )
        return true;
      return false;
    }
    function _isOnMultipleSide(connection) {
      if (connection && connection.first && connection.second) {
        if (
          !_isSpecificNodeType(connection.first, CONST.NODETYPE.OPERATOR) &&
          _isSpecificNodeType(connection.second, CONST.NODETYPE.OPERATOR)
        ) {
          if (connection.second.multipleSide === 'left') return true;
        } else if (
          _isSpecificNodeType(connection.first, CONST.NODETYPE.OPERATOR) &&
          !_isSpecificNodeType(connection.second, CONST.NODETYPE.OPERATOR)
        ) {
          if (connection.first.multipleSide === 'right') return true;
        } else if (
          !_isSpecificNodeType(connection.first, CONST.NODETYPE.OPERATOR) &&
          !_isSpecificNodeType(connection.second, CONST.NODETYPE.OPERATOR)
        )
          return true;
        else if (
          _isSpecificNodeType(connection.first, CONST.NODETYPE.OPERATOR) &&
          _isSpecificNodeType(connection.second, CONST.NODETYPE.OPERATOR)
        ) {
          if (
            connection.first.multipleSide === 'right' &&
            connection.second.multipleSide === 'left'
          )
            return true;
        }
      }
      return false;
    }
    function _isSpecificNodeType(node, type) {
      if (node && type) return node.nodeType === type ? true : false;
      return false;
    }
    function _isValidQuery(validatingFrom, currentQuery, connections, nodes) {
      var validConnections = true;
      var validTitle = false;
      var validStartNode = false;
      for (var i = 0; i < connections.length; i++) {
        if (connections[i].info.isValid !== true) {
          validConnections = false;
        }
      }
      if (connections.length === 0) validConnections = true;
      if (!validConnections)
        snNotification.show(
          'error',
          i18n.getMessage('queryBuilder.notifications.invalidGraph') +
            ': ' +
            i18n.getMessage('queryBuilder.notifications.connectionInvalid'),
          CONST.NOTIFICATION_TIME
        );
      if (validatingFrom === 'save') {
        if (currentQuery.name != undefined && currentQuery.name != '')
          validTitle = true;
        else
          snNotification.show(
            'error',
            i18n.getMessage('queryBuilder.notifications.invalidGraph') +
              ': ' +
              i18n.getMessage('queryBuilder.notifications.titleInvalid'),
            CONST.NOTIFICATION_TIME
          );
      } else if (validatingFrom === 'run') validTitle = true;
      validStartNode = isValidStartNode(nodes, connections, validatingFrom);
      if (validConnections && validTitle && validStartNode) return true;
      return false;
    }
    function _createsLoop(conn) {
      return isLooped(conn.first, conn);
    }
    function _checkPrimarySideOfOperator(operator) {
      var multipleSide = operator.multipleSide;
      if (multipleSide)
        if (operator[multipleSide + 'Connections'].length > 1) return true;
      return false;
    }
    function _canBeStartNode(startNode, connections) {
      if (startNode.leftConnections.length > 0) {
        if (startNode.leftConnections.length === 1) {
          if (
            startNode.leftConnections[0].nodeType === CONST.NODETYPE.OPERATOR
          ) {
            var connection = null;
            for (var i = 0; i < connections.length; i++) {
              if (
                connections[i].info.first === startNode.leftConnections[0] &&
                connections[i].info.second === startNode
              ) {
                connection = connections[i].info;
                break;
              }
            }
            if (queryBuilderSelection.hasSelection()) {
              if (queryBuilderSelection.nodeInSelection(startNode)) {
                if (
                  !queryBuilderSelection.nodeInSelection(
                    startNode.leftConnections[0]
                  )
                )
                  return true;
                else {
                  if (_isOnMultipleSide(connection)) {
                    var operator = startNode.leftConnections[0];
                    if (
                      operator.leftConnections &&
                      operator.leftConnections.length === 0
                    )
                      return true;
                    if (
                      operator.leftConnections &&
                      operator.leftConnections.length > 0
                    ) {
                      if (
                        !queryBuilderSelection.nodeInSelection(
                          operator.leftConnections[0]
                        )
                      )
                        return true;
                    }
                  }
                }
              }
            }
            if (connection) {
              if (!_isOnMultipleSide(connection)) return true;
              else {
                return false;
              }
            }
          } else {
            if (queryBuilderSelection.hasSelection()) {
              if (queryBuilderSelection.nodeInSelection(startNode)) {
                if (
                  !queryBuilderSelection.nodeInSelection(
                    startNode.leftConnections[0]
                  )
                )
                  return true;
              }
            }
          }
        }
        return false;
      } else if (startNode.rightConnections.length > 0) {
        if (startNode.rightConnections.length === 1) {
          if (
            startNode.rightConnections[0].nodeType === CONST.NODETYPE.OPERATOR
          ) {
            var connection = null;
            for (var i = 0; i < connections.length; i++) {
              if (
                connections[i].info.first === startNode &&
                connections[i].info.second === startNode.rightConnections[0]
              ) {
                connection = connections[i].info;
                break;
              }
            }
            if (connection) {
              if (!_isOnMultipleSide(connection)) return true;
              else {
                return false;
              }
            }
          }
        }
      }
      return true;
    }
    function isValidStartNode(nodes, connections, validatingFrom) {
      var startNode = null;
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].isStartNode) {
          if (!startNode) startNode = nodes[i];
          else if (startNode) {
            $rootScope.$broadcast('queryBuilder.pickStartNode.open', {
              nodes: nodes,
              connections: connections,
              validatingFrom: validatingFrom,
              errorMessage:
                i18n.getMessage('queryBuilder.notifications.invalidGraph') +
                ': ' +
                i18n.getMessage(
                  'queryBuilder.notifications.multipleStartNodes'
                ),
            });
            return false;
          }
        }
      }
      if (startNode) {
        if (startNode.leftConnections.length > 0) {
          if (startNode.leftConnections.length === 1) {
            if (
              startNode.leftConnections[0].nodeType === CONST.NODETYPE.OPERATOR
            ) {
              var connection = null;
              for (var i = 0; i < connections.length; i++) {
                if (
                  connections[i].info.first === startNode.leftConnections[0] &&
                  connections[i].info.second === startNode
                ) {
                  connection = connections[i].info;
                  break;
                }
              }
              if (queryBuilderSelection.hasSelection()) {
                if (queryBuilderSelection.nodeInSelection(startNode)) {
                  if (
                    !queryBuilderSelection.nodeInSelection(
                      startNode.leftConnections[0]
                    )
                  )
                    return true;
                  else {
                    if (_isOnMultipleSide(connection)) {
                      var operator = startNode.leftConnections[0];
                      if (
                        operator.leftConnections &&
                        operator.leftConnections.length === 0
                      )
                        return true;
                      if (
                        operator.leftConnections &&
                        operator.leftConnections.length > 0
                      ) {
                        if (
                          !queryBuilderSelection.nodeInSelection(
                            operator.leftConnections[0]
                          )
                        )
                          return true;
                      }
                    }
                  }
                }
              }
              if (connection) {
                if (!_isOnMultipleSide(connection)) return true;
                else {
                  $rootScope.$broadcast('queryBuilder.pickStartNode.open', {
                    nodes: nodes,
                    connections: connections,
                    validatingFrom: validatingFrom,
                    errorMessage:
                      i18n.getMessage(
                        'queryBuilder.notifications.invalidGraph'
                      ) +
                      ': ' +
                      i18n.getMessage(
                        'queryBuilder.notifications.multipleSideStartNode'
                      ),
                  });
                  return false;
                }
              }
            } else {
              if (
                queryBuilderSelection.hasSelection() &&
                validatingFrom === 'run'
              ) {
                if (queryBuilderSelection.nodeInSelection(startNode)) {
                  if (
                    !queryBuilderSelection.nodeInSelection(
                      startNode.leftConnections[0]
                    )
                  )
                    return true;
                }
              }
            }
          }
          $rootScope.$broadcast('queryBuilder.pickStartNode.open', {
            nodes: nodes,
            connections: connections,
            validatingFrom: validatingFrom,
            errorMessage:
              i18n.getMessage('queryBuilder.notifications.invalidGraph') +
              ': ' +
              i18n.getMessage('queryBuilder.notifications.incomingStartNode'),
          });
          return false;
        } else if (startNode.rightConnections.length > 0) {
          if (startNode.rightConnections.length === 1) {
            if (
              startNode.rightConnections[0].nodeType === CONST.NODETYPE.OPERATOR
            ) {
              var connection = null;
              for (var i = 0; i < connections.length; i++) {
                if (
                  connections[i].info.first === startNode &&
                  connections[i].info.second === startNode.rightConnections[0]
                ) {
                  connection = connections[i].info;
                  break;
                }
              }
              if (connection) {
                if (!_isOnMultipleSide(connection)) return true;
                else {
                  $rootScope.$broadcast('queryBuilder.pickStartNode.open', {
                    nodes: nodes,
                    connections: connections,
                    validatingFrom: validatingFrom,
                    errorMessage:
                      i18n.getMessage(
                        'queryBuilder.notifications.invalidGraph'
                      ) +
                      ': ' +
                      i18n.getMessage(
                        'queryBuilder.notifications.multipleSideStartNode'
                      ),
                  });
                  return false;
                }
              }
            }
          }
        }
        return true;
      } else if (!startNode) {
        $rootScope.$broadcast('queryBuilder.pickStartNode.open', {
          nodes: nodes,
          connections: connections,
          validatingFrom: validatingFrom,
          errorMessage:
            i18n.getMessage('queryBuilder.notifications.invalidGraph') +
            ': ' +
            i18n.getMessage('queryBuilder.notifications.missingStartNode'),
        });
        return false;
      }
    }
    function isLooped(node, conn) {
      if (node === conn.second) return true;
      for (var i = 0; i < node.leftConnections.length; i++) {
        if (isLooped(node.leftConnections[i], conn)) return true;
      }
      return false;
    }
    return {
      isConnectionType: _isConnectionType,
      isNodeType: _isNodeType,
      isOnMultipleSide: _isOnMultipleSide,
      isSpecificNodeType: _isSpecificNodeType,
      isValidQuery: _isValidQuery,
      createsLoop: _createsLoop,
      checkPrimarySideOfOperator: _checkPrimarySideOfOperator,
      canBeStartNode: _canBeStartNode,
    };
  },
]);
