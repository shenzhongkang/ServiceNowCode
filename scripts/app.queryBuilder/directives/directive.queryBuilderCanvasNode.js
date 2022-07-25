/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderCanvasNode.js */
angular.module('sn.queryBuilder').directive('queryBuilderCanvasNode', [
  'i18n',
  'CONSTQB',
  'getTemplateUrl',
  function (i18n, CONST, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        currentQuery: '=',
        nodes: '=',
        connections: '=',
        showSuggestedConnections: '=',
        api: '=',
        srMessage: '=',
        canWrite: '=',
      },
      templateUrl: getTemplateUrl('query_builder_canvas_node.xml'),
      controller: [
        '$scope',
        '$rootScope',
        '$timeout',
        'queryBuilderSelection',
        'queryService',
        'queryBuilderCanvasUtil',
        'queryBuilderCommon',
        'queryBuilderConnectionUtil',
        'queryBuilderValidation',
        'encodedQueryService',
        'snNotification',
        'queryBuilderTreeUtil',
        function (
          $scope,
          $rootScope,
          $timeout,
          queryBuilderSelection,
          queryService,
          queryBuilderCanvasUtil,
          queryBuilderCommon,
          queryBuilderConnectionUtil,
          queryBuilderValidation,
          encodedQueryService,
          snNotification,
          queryBuilderTreeUtil
        ) {
          var mouseDownX = null;
          var mouseDownY = null;
          $scope.movingNode = false;
          $scope.nodeStyle = function (node) {
            return {
              top: node.y + 'px',
              left: node.x + 'px',
            };
          };
          $scope.clickedNode = function ($event, node) {
            if (node) {
              if (
                ($event.keyCode === CONST.KEY_CODES.ENTER_KEY ||
                  $event.keyCode === CONST.KEY_CODES.SPACE_KEY) &&
                $scope.api.getSelectMode()
              ) {
                if (queryBuilderCanvasUtil.getLatestTouched())
                  queryBuilderCanvasUtil.setLatestTouched(null);
                $event.preventDefault();
                queryBuilderSelection.manuallySelectNode(
                  node,
                  $scope.connections
                );
              } else {
                if (!node.dragged) {
                  if (
                    node.nodeType === CONST.NODETYPE.CLASS ||
                    node.nodeType === CONST.OBJECT_TYPES.NON_CMDB
                  )
                    tryToSuggest(node);
                  else $rootScope.$broadcast('queryBuilder.resetTree');
                  $scope.$emit('node_touched', {
                    node: node,
                  });
                } else node.dragged = false;
              }
              $event.stopPropagation();
            }
          };
          $scope.getNodeClasses = function (node) {
            return {
              selected: node.touched,
              movingNode: $scope.movingNode,
              operatorNode: $scope.api.isOperatorNode(node),
              lineSelected: $scope.api.isLineSelected(node),
              serviceNode: $scope.api.isServiceNode(node),
              startNode: $scope.api.isStartNode(node),
              error: $scope.api.hasError(node),
              focused: node.focused,
              patternNode: node.isPattern || showAsPatternNode(node),
            };
          };
          $scope.nodeDragStart = function (event, node) {
            if (!queryBuilderSelection.makingSelection()) {
              event.stopPropagation();
              mouseDownX = event.clientX;
              mouseDownY = event.clientY;
              $scope.movingNode = true;
              queryBuilderCanvasUtil.setDraggingItem(node);
            }
          };
          $scope.calculateNodeMove = function (event, node) {
            if (!queryBuilderSelection.makingSelection()) {
              if (!queryBuilderSelection.hasSelection()) {
                if (
                  $scope.movingNode &&
                  node === queryBuilderCanvasUtil.getDraggingItem()
                ) {
                  setNodeMove(event, node);
                  mouseDownX = event.clientX;
                  mouseDownY = event.clientY;
                }
              } else if (queryBuilderSelection.hasSelection()) {
                if (queryBuilderSelection.nodeInSelection(node)) {
                  if (
                    $scope.movingNode &&
                    node === queryBuilderCanvasUtil.getDraggingItem()
                  ) {
                    var currentSelection = queryBuilderSelection.getSelection();
                    for (var i = 0; i < currentSelection.nodes.length; i++) {
                      setNodeMove(event, currentSelection.nodes[i]);
                    }
                    mouseDownX = event.clientX;
                    mouseDownY = event.clientY;
                  }
                } else {
                  if (
                    $scope.movingNode &&
                    node === queryBuilderCanvasUtil.getDraggingItem()
                  ) {
                    queryBuilderSelection.clearSelection();
                    setNodeMove(event, node);
                    mouseDownX = event.clientX;
                    mouseDownY = event.clientY;
                  }
                }
              }
            } else if (
              $scope.movingCanvas &&
              queryBuilderSelection.makingSelection()
            )
              $scope.calculateOffset(event, 'canvas');
          };
          $scope.nodeDragStop = function (node) {
            $scope.movingNode = false;
            queryBuilderCanvasUtil.setDraggingItem(null);
          };
          $scope.nodeFocused = function (event, node) {
            node.focused = true;
            event.target.on('keydown', function (e) {
              if (isMoveEvent(e)) {
                if (e.which === CONST.KEY_CODES.LEFT_ARROW)
                  node.x -= CONST.ACCESSIBILITY.NODE_MOVE_AMOUNT;
                else if (e.which === CONST.KEY_CODES.UP_ARROW)
                  node.y -= CONST.ACCESSIBILITY.NODE_MOVE_AMOUNT;
                if (e.which === CONST.KEY_CODES.RIGHT_ARROW)
                  node.x += CONST.ACCESSIBILITY.NODE_MOVE_AMOUNT;
                else if (e.which === CONST.KEY_CODES.DOWN_ARROW)
                  node.y += CONST.ACCESSIBILITY.NODE_MOVE_AMOUNT;
                updateConnectionPositions(node);
              }
            });
          };
          $scope.nodeBlurred = function (event, node) {
            node.focused = false;
          };
          $scope.toggleHoveringTrue = function (event, node) {
            if (!$scope.api.makingSelection) node.hovering = true;
          };
          $scope.toggleHoveringFalse = function (event, node) {
            if (!$scope.api.makingSelection) node.hovering = false;
          };
          $scope.connectionClicked = function (event, node, side) {
            if (side === 'not-allowed') {
              if (node.nodeType === CONST.NODETYPE.SERVICE) {
                snNotification
                  .show(
                    'error',
                    i18n.getMessage(
                      'queryBuilder.notifications.noPatternToSavedService'
                    ),
                    CONST.NOTIFICATION_TIME
                  )
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
              } else if (!nonCmdbReferenceExists(node)) {
                snNotification
                  .show(
                    'error',
                    i18n.getMessage(
                      'queryBuilder.notifications.noReferenceToClass'
                    ),
                    CONST.NOTIFICATION_TIME
                  )
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
              } else {
                snNotification
                  .show(
                    'error',
                    i18n.getMessage('queryBuilder.notifications.notallowed'),
                    CONST.NOTIFICATION_TIME
                  )
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
              }
              return;
            }
            var sideSelected = side + 'Selected';
            if (!queryBuilderCanvasUtil.getLinking()) {
              queryBuilderCanvasUtil.setLinking(true);
              queryBuilderCanvasUtil.setFirstNode(node);
              node[sideSelected] = true;
              queryBuilderCanvasUtil.setFirstNodeSide(side);
            } else {
              var first_node = queryBuilderCanvasUtil.getFirstNode();
              var first_node_side = queryBuilderCanvasUtil.getFirstNodeSide();
              if (first_node != node) {
                if (
                  $scope.currentQuery.query.query_type ===
                  CONST.QUERY_TYPES.GENERAL
                ) {
                  var isServiceConnection = false;
                  var connection = {
                    first: first_node,
                    second: node,
                    isDotted: queryBuilderCommon.isServiceQuery(
                      $scope.currentQuery
                    )
                      ? true
                      : false,
                    center: {
                      x: null,
                      y: null,
                    },
                    first_side: first_node_side,
                    second_side: side,
                    relations: [],
                    noRelations: false,
                    reference: '',
                    isValid: false,
                    touched: false,
                    isReverse: false,
                    line: queryBuilderConnectionUtil.emptyLine(),
                  };
                  if (first_node.isPattern) {
                    connection.appFlow = true;
                    connection.notAppFlow = false;
                    connection.reverseAppFlow = false;
                    connection.notReverseAppFlow = false;
                    connection.type = CONST.EDGE_TYPES.APP_FLOW;
                    connection.isNot = false;
                  }
                  queryBuilderConnectionUtil.calculateLine(
                    {
                      info: connection,
                    },
                    connection.line
                  );
                  if (
                    first_node.nodeType === CONST.NODETYPE.SERVICE ||
                    node.nodeType === CONST.NODETYPE.SERVICE
                  )
                    isServiceConnection = true;
                  var createsLoop =
                    queryBuilderValidation.createsLoop(connection);
                } else if (
                  $scope.currentQuery.query.query_type ===
                  CONST.QUERY_TYPES.SERVICE
                ) {
                  var connection = {
                    first: first_node,
                    second: node,
                    isDotted: queryBuilderCommon.isServiceQuery(
                      $scope.currentQuery
                    )
                      ? true
                      : false,
                    center: {
                      x: null,
                      y: null,
                    },
                    first_side: first_node_side,
                    second_side: side,
                    relations: [],
                    noRelations: false,
                    reference: '',
                    appFlow: true,
                    notAppFlow: false,
                    reverseAppFlow: false,
                    notReverseAppFlow: false,
                    type: CONST.EDGE_TYPES.APP_FLOW,
                    isNot: false,
                    isReverse: false,
                    line: queryBuilderConnectionUtil.emptyLine(),
                  };
                  queryBuilderConnectionUtil.calculateLine(
                    {
                      info: connection,
                    },
                    connection.line
                  );
                  var createsLoop =
                    queryBuilderValidation.createsLoop(connection);
                }
                if (!createsLoop)
                  $rootScope.$broadcast(
                    'add_connection',
                    connection,
                    isServiceConnection
                  );
                else
                  snNotification
                    .show(
                      'error',
                      i18n.getMessage('queryBuilder.notifications.loop'),
                      CONST.NOTIFICATION_TIME
                    )
                    .then(function (notificationElement) {
                      queryBuilderCommon.focusNotificationCloseButton(
                        notificationElement
                      );
                    });
              }
              first_node.leftSelected = false;
              first_node.rightSelected = false;
              queryBuilderCanvasUtil.setFirstNode(null);
              queryBuilderCanvasUtil.setFirstNodeSide(null);
              queryBuilderCanvasUtil.setLinking(false);
            }
            event.stopPropagation();
          };
          $scope.shouldShowRightBox = function (node) {
            if (node.nodeType === CONST.NODETYPE.CLASS && $scope.canWrite) {
              if (node.leftConnections.length > 0) {
                var left = node.leftConnections[0];
                for (var i = 0; i < $scope.connections.length; i++) {
                  if (
                    $scope.connections[i].info.first === left &&
                    $scope.connections[i].info.second === node &&
                    $scope.connections[i].info.noRelations
                  )
                    return false;
                }
              }
              return (
                ((node.hovering || $scope.hasAccessibilityEnabled()) &&
                  !queryBuilderCanvasUtil.getLinking()) ||
                node.rightSelected
              );
            } else if (
              node.nodeType === CONST.NODETYPE.OPERATOR &&
              $scope.canWrite
            ) {
              if (
                node.multipleSide === 'right' &&
                (((node.hovering || $scope.hasAccessibilityEnabled()) &&
                  !queryBuilderCanvasUtil.getLinking()) ||
                  node.rightSelected)
              )
                return true;
            }
            return false;
          };
          $scope.shouldShowLeftBox = function (node) {
            return (
              showLeftBox(node, nonCmdbReferenceExists(node)) &&
              !$scope.checkConnectionRules(node)
            );
          };
          $scope.checkConnectionRules = function (node) {
            var current = queryBuilderCommon.getTrueParent(
              queryBuilderCanvasUtil.getFirstNode()
            );
            if (
              current &&
              current.isPattern &&
              node.nodeType === CONST.NODETYPE.SERVICE &&
              node.hovering
            )
              return true;
            return false;
          };
          function showLeftBox(node, hasNonCmdbReference) {
            if (node.nodeType !== CONST.NODETYPE.OPERATOR && $scope.canWrite)
              return (
                (node.hovering || $scope.hasAccessibilityEnabled()) &&
                queryBuilderCanvasUtil.getLinking() &&
                !node.rightSelected &&
                hasNonCmdbReference
              );
            else if (
              node.nodeType === CONST.NODETYPE.OPERATOR &&
              $scope.canWrite
            ) {
              if (
                node.multipleSide === 'left' &&
                (node.hovering || $scope.hasAccessibilityEnabled()) &&
                queryBuilderCanvasUtil.getLinking() &&
                !node.rightSelected
              )
                return true;
            }
            return false;
          }
          function nonCmdbReferenceExists(current) {
            var node = queryBuilderCanvasUtil.getFirstNode();
            if (
              node &&
              node.nodeType === CONST.NODETYPE.CLASS &&
              current.nodeType === CONST.OBJECT_TYPES.NON_CMDB
            ) {
              var referenceColumns = current.referenceColumns;
              var allChildrenTypes =
                queryBuilderCanvasUtil.getAllChildrenTypes();
              var valid = false;
              for (var i = 0; i < referenceColumns.length; i++) {
                var refChildren =
                  allChildrenTypes[referenceColumns[i].cmdb_class_name];
                if (!refChildren) {
                  refChildren = queryBuilderTreeUtil.findChildren(
                    referenceColumns[i].cmdb_class_name,
                    queryBuilderTreeUtil.getSpecificTree('cmdb')
                  );
                  queryBuilderCanvasUtil.addChildType(
                    referenceColumns[i].cmdb_class_name,
                    refChildren
                  );
                }
                if (
                  (refChildren && refChildren.indexOf(node.ci_type) > -1) ||
                  node.ci_type === referenceColumns[i].cmdb_class_name
                ) {
                  valid = true;
                }
              }
              return valid;
            }
            return true;
          }
          $scope.removeNode = function ($event, node) {
            if ($scope.canWrite) {
              $scope.$broadcast('queryBuilder.hide_right_dropdown');
              deleteNode(node);
            }
            $event.stopPropagation();
          };
          $scope.displayFilterNodeIcon = function (node) {
            return (
              !$scope.api.isOperatorNode(node) &&
              !$scope.api.isServiceNode(node) &&
              (node.filters.platform !== '' || node.filters.custom !== '')
            );
          };
          $scope.showNodeFilters = function (event, node) {
            if (node.nodeType === CONST.NODETYPE.CLASS)
              node.touchedType = CONST.OBJECT_TYPES.NODE;
            else if (node.nodeType === CONST.NODETYPE.SERVICE)
              node.touchedType = CONST.OBJECT_TYPES.SERVICE;
            else if (node.nodeType === CONST.OBJECT_TYPES.NON_CMDB)
              node.touchedType = CONST.OBJECT_TYPES.NON_CMDB;
            $rootScope.$broadcast('queryBuilder.toggleShowFilters', {
              event: event,
              node: node,
            });
          };
          $scope.showNodeIcon = function (node) {
            if (node.nodeType === 'class' && node.image) return true;
            else if (node.image) return true;
            return false;
          };
          $scope.hasAccessibilityEnabled = function () {
            return window.NOW.g_accessibility;
          };
          $scope.showReferenceFilterApplied = function (node) {
            if (
              node &&
              node.rightConnections &&
              node.rightConnections.length > 0
            ) {
              for (var i = 0; i < node.rightConnections.length; i++) {
                var right = node.rightConnections[i];
                if (right.nodeType !== CONST.NODETYPE.OPERATOR) {
                  for (var j = 0; j < $scope.connections.length; j++) {
                    var connection = $scope.connections[j].info;
                    var first = queryBuilderCommon.getTrueParent(
                      connection.first
                    );
                    var second = queryBuilderCommon.getTrueChild(
                      connection.second
                    );
                    if (
                      first === node &&
                      second === right &&
                      connection.applyToAllNodes
                    ) {
                      node.refFilterApplied = true;
                      $rootScope.$broadcast('calculate_center');
                      $rootScope.$broadcast('calculate_path_center');
                      return true;
                    }
                  }
                } else if (right.nodeType === CONST.NODETYPE.OPERATOR) {
                  for (var j = 0; j < right.rightConnections.length; j++) {
                    var operatorRight = right.rightConnections[j];
                    for (var k = 0; k < $scope.connections.length; k++) {
                      var connection = $scope.connections[k].info;
                      var first = queryBuilderCommon.getTrueParent(
                        connection.first
                      );
                      var second = queryBuilderCommon.getTrueChild(
                        connection.second
                      );
                      if (
                        first === node &&
                        second === operatorRight &&
                        connection.applyToAllNodes
                      ) {
                        node.refFilterApplied = true;
                        $rootScope.$broadcast('calculate_center');
                        $rootScope.$broadcast('calculate_path_center');
                        return true;
                      }
                    }
                  }
                }
              }
            }
            if (
              node &&
              node.leftConnections &&
              node.leftConnections.length > 0 &&
              node.nodeType !== CONST.OBJECT_TYPES.NON_CMDB
            ) {
              for (var i = 0; i < node.leftConnections.length; i++) {
                var left = node.leftConnections[i];
                if (left.nodeType === CONST.NODETYPE.OPERATOR) {
                  for (var j = 0; j < left.leftConnections.length; j++) {
                    var operatorLeft = left.leftConnections[j];
                    if (operatorLeft.refFilterApplied) {
                      node.refFilterApplied = true;
                      $rootScope.$broadcast('calculate_center');
                      $rootScope.$broadcast('calculate_path_center');
                      return true;
                    }
                  }
                } else if (
                  left.refFilterApplied &&
                  node.nodeType !== CONST.NODETYPE.OPERATOR
                ) {
                  node.refFilterApplied = true;
                  $rootScope.$broadcast('calculate_center');
                  $rootScope.$broadcast('calculate_path_center');
                  return true;
                }
              }
            }
            node.refFilterApplied = false;
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('calculate_path_center');
            return false;
          };
          function showAsPatternNode(node) {
            if (
              node &&
              node.nodeType == CONST.OBJECT_TYPES.NON_CMDB &&
              node.leftConnections &&
              node.leftConnections.length > 0
            ) {
              for (var i = 0; i < node.leftConnections.length; i++) {
                var left = node.leftConnections[i];
                if (
                  left.nodeType !== CONST.NODETYPE.OPERATOR &&
                  left.isPattern
                ) {
                  for (var j = 0; j < $scope.connections.length; j++) {
                    var connection = $scope.connections[j].info;
                    var first = connection.first;
                    var second = connection.second;
                    if (
                      first === left &&
                      second === node &&
                      connection.applyToAllNodes
                    )
                      return true;
                  }
                } else if (left.nodeType === CONST.NODETYPE.OPERATOR) {
                  var operatorLeft = left.leftConnections;
                  for (var j = 0; j < operatorLeft.length; j++) {
                    if (operatorLeft[j].isPattern) {
                      for (var k = 0; k < $scope.connections.length; k++) {
                        var connection = $scope.connections[k].info;
                        var first = connection.first;
                        var second = connection.second;
                        if (
                          first === left &&
                          second === node &&
                          connection.applyToAllNodes
                        )
                          return true;
                      }
                    }
                  }
                }
              }
            }
            return false;
          }
          $scope.$on('queryBuilder.deleteNode', function (event, args) {
            var node = args.node;
            deleteNode(node);
          });
          $scope.$on('queryBuilder.loadQuery', function (event, args) {
            $rootScope.$broadcast('queryBuilder.resetTree');
            var nodes = args.nodes;
            if ((typeof nodes !== 'undefined') & (nodes.length > 0)) {
              for (var i = 0; i < nodes.length; i++) {
                recreateNode(nodes[i]);
              }
              $rootScope.$broadcast('queryBuilder.nodesRecreated');
              $rootScope.$broadcast('queryBuilder.loadConnections', args);
            }
          });
          $scope.$on('queryBuilder.calculateNodeMove', function (event, args) {
            $scope.calculateNodeMove(args.event, args.node);
          });
          $scope.$on('node_dropped', function (event, args) {
            var node = args.node;
            if (node && showSuggested(node)) {
              $timeout(function () {
                suggestConnections(node);
                $scope.srMessage = i18n.format(
                  i18n.getMessage('queryBuilder.canvas.addNode'),
                  node.name
                );
              });
            }
            $scope.currentQuery.changed = true;
          });
          $scope.$on(
            'queryBuilder.suggestedConnectionsChanged',
            function (event, args) {
              var suggested = args.showSuggestedConnections;
              if (suggested) {
                var latest = queryBuilderCanvasUtil.getLatestTouched();
                if (queryBuilderValidation.isNodeType(latest)) {
                  suggestConnections(latest);
                }
              } else {
                $rootScope.$broadcast('queryBuilder.resetTree');
              }
            }
          );
          $scope.$on(
            'queryBuilder.filterButtonClickedNode',
            function (event, args) {
              var node = args.node;
              tryToSuggest(node);
              $scope.$emit('node_touched', {
                node: node,
              });
            }
          );
          function setNodeMove(event, node) {
            node.x = event.clientX - mouseDownX + node.x;
            node.y = event.clientY - mouseDownY + node.y;
            node.dragged = true;
            updateConnectionPositions(node);
          }
          function updateConnectionPositions(node) {
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('calculate_path_center');
            for (var i = 0; i < $scope.connections.length; i++) {
              if (
                node === $scope.connections[i].info.first ||
                node === $scope.connections[i].info.second
              ) {
                $rootScope.$broadcast('queryBuilder.updateLine', {
                  conn: $scope.connections[i],
                });
              }
            }
          }
          function deleteNode(node) {
            var index = $scope.nodes.indexOf(node);
            if (index > -1) {
              if (queryBuilderCanvasUtil.getStartNode() === node)
                queryBuilderCanvasUtil.setStartNode(null);
              if ($scope.currentQuery.hasEntryPoint && node.entryPoint) {
                $scope.currentQuery.hasEntryPoint = false;
                $scope.entryPoint = null;
              }
              if (node.rightConnections && node.rightConnections.length > 0) {
                for (var i = 0; i < node.rightConnections.length; i++) {
                  if (
                    !queryBuilderCommon.isApplicationServiceNode(
                      node.rightConnections[i]
                    )
                  )
                    queryBuilderCommon.setIsPattern(
                      node.rightConnections[i],
                      false
                    );
                }
              }
              $scope.$emit('removeConnections', {
                node: node,
              });
              $scope.$emit('removeFilters', {
                node: node,
              });
              if (queryBuilderCanvasUtil.getLatestTouched() == node) {
                $rootScope.$broadcast('queryBuilder.resetTree');
                $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
                queryBuilderCanvasUtil.setLatestTouched(null);
                if ($scope.showFilters) {
                  $scope.showFilters = false;
                  $scope.filterConfigRelated.encodedQuery = '';
                }
              }
              if (node.nodeType === CONST.NODETYPE.SERVICE) {
                var nodeCount = 0;
                for (var i = 0; i < $scope.nodes.length; i++) {
                  if ($scope.nodes[i].name === node.name) nodeCount++;
                  if (nodeCount > 1) break;
                }
                if (nodeCount == 1) {
                  for (
                    var i = 0;
                    i < $scope.currentQuery.dependencies.length;
                    i++
                  ) {
                    if ($scope.currentQuery.dependencies[i] == node.sys_id) {
                      $scope.currentQuery.dependencies.splice(i, 1);
                      break;
                    }
                  }
                }
              }
              if (node.nodeType !== CONST.NODETYPE.OPERATOR)
                $scope.nodes.splice(index, 1);
              if ($scope.nodes.length === 0)
                $rootScope.$broadcast('clear_canvas');
              if (
                queryBuilderCanvasUtil.getLinking() &&
                queryBuilderCanvasUtil.getFirstNode() === node
              ) {
                queryBuilderCanvasUtil.setFirstNode(null);
                queryBuilderCanvasUtil.setFirstNodeSide(null);
                queryBuilderCanvasUtil.setLinking(false);
              }
              $rootScope.$broadcast('contextMenu.close');
              $scope.currentQuery.changed = true;
              $timeout(function () {
                $scope.srMessage = i18n.format(
                  i18n.getMessage('queryBuilder.canvas.removeNode'),
                  node.name
                );
              });
            }
          }
          function recreateNode(node) {
            if (node.isNonCmdb) {
              node.nodeType = CONST.OBJECT_TYPES.NON_CMDB;
            }
            if (node.type === CONST.NODETYPE.OPERATOR) {
              node.name = node.operatorType;
            }
            if (node.isPattern && node.nodeType !== CONST.NODETYPE.CLASS)
              node.nodeType = CONST.NODETYPE.CLASS;
            var nodeInfo = angular.copy(node);
            nodeInfo.center = null;
            nodeInfo.divWidth = null;
            nodeInfo.divHeight = null;
            nodeInfo.touched = false;
            nodeInfo.hovering = false;
            nodeInfo.leftSelected = false;
            nodeInfo.leftConnected = false;
            nodeInfo.leftCorner = null;
            nodeInfo.leftCenter = null;
            nodeInfo.rightSelected = false;
            nodeInfo.rightConnected = false;
            nodeInfo.rightCorner = null;
            nodeInfo.rightCenter = null;
            nodeInfo.dragged = false;
            nodeInfo.type = node.className;
            nodeInfo.ci_type = node.className;
            nodeInfo.sys_id = nodeInfo.sys_id;
            if (!nodeInfo.unique_id) nodeInfo.unique_id = nodeInfo.sys_id;
            nodeInfo.leftConnections = [];
            nodeInfo.rightConnections = [];
            if (!node.filters && node.nodeType !== CONST.NODETYPE.OPERATOR) {
              nodeInfo.filters = {
                platform: '',
                custom: '',
              };
            }
            if (node.nodeType === CONST.OBJECT_TYPES.NON_CMDB)
              nodeInfo.type = node.sys_id;
            if (!nodeInfo.nodeType) nodeInfo.nodeType = node.type;
            if (!nodeInfo.nodeId) nodeInfo.nodeId = node.id;
            if (
              (!nodeInfo.image ||
                nodeInfo.image === CONST.DEFAULT_CLASS_NODE_IMAGE) &&
              nodeInfo.nodeType !== CONST.NODETYPE.OPERATOR &&
              nodeInfo.nodeType !== CONST.NODETYPE.SERVICE
            )
              nodeInfo.image = $scope.api.getImage(nodeInfo);
            if (node.filters && node.filters.platform) {
              nodeInfo.filters.platform = node.filters.platform;
            } else if (node.className) {
              nodeInfo.filters.platform = node.className;
            }
            if (
              !nodeInfo.applied_filters &&
              nodeInfo.nodeType !== CONST.NODETYPE.OPERATOR
            )
              nodeInfo.applied_filters = nodeInfo.filters_attrib
                ? nodeInfo.filters_attrib
                : '';
            if (nodeInfo.isStartNode)
              queryBuilderCanvasUtil.setStartNode(nodeInfo);
            if (nodeInfo.entryPoint) {
              $scope.currentQuery.hasEntryPoint = true;
              $scope.entryPoint = nodeInfo;
            }
            if (nodeInfo.nodeType === CONST.NODETYPE.CLASS) {
              var allChildrenTypes =
                queryBuilderCanvasUtil.getAllChildrenTypes();
              if (!allChildrenTypes[nodeInfo.type]) {
                queryBuilderCanvasUtil.addChildType(nodeInfo.type, []);
                $scope.api.getAllChildren(nodeInfo.type, true);
              }
              var allParentTypes = queryBuilderCanvasUtil.getAllParentTypes();
              if (!allParentTypes[nodeInfo.type]) {
                queryBuilderCanvasUtil.addParentType(nodeInfo.type, []);
                $scope.api.getAllParents(nodeInfo.type, true);
              }
            }
            if (nodeInfo.nodeType === CONST.NODETYPE.SERVICE_QUERY)
              nodeInfo.nodeType = CONST.NODETYPE.SERVICE;
            else if (nodeInfo.nodeType === CONST.NODETYPE.OPERATOR)
              nodeInfo.multipleSide = node.multipleSide;
            if (
              nodeInfo.nodeType === CONST.NODETYPE.CLASS ||
              nodeInfo.nodeType === CONST.NODETYPE.SERVICE ||
              nodeInfo.nodeType === CONST.OBJECT_TYPES.NON_CMDB
            ) {
              queryBuilderCanvasUtil.setLoadingTableProperties(true);
              queryService
                .getCIProperties(nodeInfo.type)
                .then(function (results) {
                  queryBuilderCanvasUtil.setLoadingTableProperties(false);
                  queryBuilderCanvasUtil.addProperty(nodeInfo.type, results);
                  getOptionLabels(nodeInfo);
                  $scope.$emit('queryBuilder.gotProperties', {
                    type: nodeInfo.type,
                  });
                });
            }
            if (nodeInfo.nodeType === CONST.NODETYPE.SERVICE)
              nodeInfo.sys_id = node.queryId;
            if (
              (nodeInfo.nodeType === CONST.NODETYPE.CLASS ||
                nodeInfo.nodeType === CONST.OBJECT_TYPES.NON_CMDB) &&
              hasFilters(nodeInfo)
            )
              createExistingFilter(nodeInfo);
            $timeout(function () {
              if (node.type === CONST.NODETYPE.OPERATOR) {
                if (!node.operatorNumber) {
                  nodeInfo.operatorNumber = getOperatorNumber();
                }
              }
              $scope.nodes.push(nodeInfo);
              $rootScope.$broadcast('calculate_center');
              $scope.$emit('node_recreated', {
                node: nodeInfo,
              });
            });
          }
          function getOperatorNumber() {
            if ($scope.currentQuery.usedNames['operator']) {
              $scope.currentQuery.usedNames['operator'] += 1;
            } else {
              $scope.currentQuery.usedNames['operator'] = 1;
            }
            return $scope.currentQuery.usedNames['operator'];
          }
          function getOptionLabels(node) {
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            var props = allProperties[node.type];
            var newOptions = [];
            for (var i = 0; i < node.returnValues.length; i++) {
              for (var j = 0; j < props.length; j++) {
                if (props[j].element === node.returnValues[i]) {
                  newOptions.push({
                    label: props[j].label,
                    element: node.returnValues[i],
                  });
                }
              }
            }
            node.returnValues = newOptions;
          }
          function hasFilters(node) {
            var containsFilters = node.applied_filters !== undefined;
            if (containsFilters && node.applied_filters != '') return true;
            return false;
          }
          function createExistingFilter(node) {
            node.applied_filters = node.applied_filters.replace(
              '^ORDERBYname',
              ''
            );
            node.applied_filters = node.applied_filters.replace(
              '^ORDERBYnull',
              ''
            );
            var newFilterCard = {
              nodeId: node.nodeId,
              filters_attrib: node.filters_attrib,
              applied_filters: node.applied_filters,
              humanReadable_attrib: [],
              node: node,
            };
            if (node.applied_filters != '') {
              encodedQueryService
                .getHumanReadable(node.type, node.applied_filters)
                .then(function (results) {
                  newFilterCard.humanReadable_attrib = results;
                });
            }
            $scope.$emit('queryBuilder.addNewFilter', {
              filter: newFilterCard,
            });
          }
          function showSuggested(node) {
            if (
              queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
              $scope.showSuggestedConnections &&
              node.nodeType !== CONST.NODETYPE.OPERATOR &&
              node.nodeType !== CONST.NODETYPE.SERVICE
            )
              return true;
            return false;
          }
          function suggestConnections(node) {
            if (!node.isPattern) {
              var suggestedConnections = [];
              if (node.nodeType === CONST.NODETYPE.CLASS)
                suggestedConnections =
                  queryBuilderCommon.getSuggestedConnections(node);
              $rootScope.$broadcast('queryBuilder.showSuggestedTree', {
                suggestedArray: suggestedConnections,
                suggestedClass: node.name,
                selectedClass: node,
              });
            } else $rootScope.$broadcast('queryBuilder.resetTree');
          }
          function tryToSuggest(node) {
            if (node && showSuggested(node)) {
              if (!node.touched) {
                if (!queryBuilderTreeUtil.getLoadingTree()) {
                  suggestConnections(node);
                } else {
                  waitForTreeLoadSuggestions(node);
                }
              } else if (node.touched) {
                $rootScope.$broadcast('queryBuilder.resetTree');
              }
            }
          }
          function waitForTreeLoadSuggestions(node) {
            $timeout(function () {
              if (!queryBuilderTreeUtil.getLoadingTree()) {
                suggestConnections(node);
              } else {
                waitForTreeLoadSuggestions(node);
              }
            }, 500);
          }
          function isMoveEvent(event) {
            return (
              event.which === 37 ||
              event.which === 38 ||
              event.which === 39 ||
              event.which === 40
            );
          }
        },
      ],
    };
  },
]);
