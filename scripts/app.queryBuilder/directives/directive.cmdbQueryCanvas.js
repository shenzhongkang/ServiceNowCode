/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.cmdbQueryCanvas.js */
angular.module('sn.queryBuilder').directive('cmdbQueryCanvas', [
  'CONSTQB',
  'queryService',
  'i18n',
  'snNotification',
  'queryBuilderCommon',
  'queryBuilderValidation',
  'UA',
  'queryBuilderConnectionUtil',
  'queryBuilderSelection',
  'queryBuilderTreeUtil',
  'queryBuilderCanvasUtil',
  function (
    CONST,
    queryService,
    i18n,
    snNotification,
    queryBuilderCommon,
    queryBuilderValidation,
    UA,
    queryBuilderConnectionUtil,
    queryBuilderSelection,
    queryBuilderTreeUtil,
    queryBuilderCanvasUtil
  ) {
    'use strict';
    return {
      restrict: 'E',
      replace: true,
      scope: {
        currentQuery: '=',
        nodes: '=',
        connections: '=',
        showSuggestedConnections: '=',
        api: '=',
        canWrite: '=',
        leftContainerClosed: '=',
      },
      template:
        '' +
        '<div class="canvas-container noselect dnd-drop" dnd-drop-types="classes,movingNode,services,nonCmdb" dnd-drop-dropped="add($event,$drop)" dnd-drop-accepted="accepted" dnd-drop-rejected="rejected" tabindex="-1" role="presentation" aria-label="' +
        i18n.getMessage('queryBuilder.general.canvas') +
        '" ng-click="clickedCanvas()" ng-mousedown="dragStart($event, \'canvas\')" ng-mousemove="calculateOffset($event, \'canvas\')" ng-mouseup="dragStop($event)" ng-class="getCanvasClasses()">' +
        '<div class="sr-only" aria-live="assertive" aria-atomic="true">' +
        '	<p> {{srMessage}} </p>' +
        '</div>' +
        '	<div class="welcome-message-area" ng-if="showWelcomeMessage()">' +
        '		<div class="h1">' +
        i18n.getMessage('queryBuilder.general.queryBuilder') +
        '</div>' +
        '		<span ng-if="api.isGeneralQueryWithServiceWatch()">' +
        '			<span class="welcome-message-subtext">' +
        i18n.getMessage('queryBuilder.welcomeMessage.message1') +
        '</span>' +
        '		</span>' +
        '		<span ng-if="api.isGeneralQueryWithoutServiceWatch()">' +
        '			<span class="welcome-message-subtext">' +
        i18n.getMessage('queryBuilder.welcomeMessage.message2') +
        '</span>' +
        '		</span>' +
        '		<span ng-if="api.isServiceQuery()">' +
        '			<span class="welcome-message-subtext">' +
        i18n.getMessage('queryBuilder.welcomeMessage.message3') +
        '</span>' +
        '		</span>' +
        '	</div>' +
        '	<query-builder-canvas-control ng-show="isClassDropped()"></query-builder-canvas-control>' +
        '		<div class="relationship-label">' +
        '		</div>' +
        '	<div class="cmdb-query-canvas" ng-style="getTransform()">' +
        '		<query-builder-canvas-node current-query="currentQuery" nodes="nodes" connections="connections" api="nodesAPI" sr-message="srMessage" show-suggested-connections="showSuggestedConnections" can-write="canWrite" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0;"></query-builder-canvas-node>' +
        '		<div class="connection-required-icon icon icon-required" ng-repeat="conn in connections" ng-click="displayConnectionInfo($event, conn.info)" ng-style="missingRelationsPosition(conn.info)" ng-if="!isValidConn(conn)" >' +
        '		</div>' +
        '		<query-builder-relationship-bubble ng-repeat="conn in connections" bubble-conn="conn" current-query="currentQuery"></query-builder-relationship-bubble>' +
        '		<connection-builder></connection-builder>' +
        '	</div>' +
        '</div>',
      controller: [
        '$scope',
        '$timeout',
        '$http',
        '$rootScope',
        'encodedQueryService',
        'queryService',
        function (
          $scope,
          $timeout,
          $http,
          $rootScope,
          encodedQueryService,
          queryService
        ) {
          $scope.makingSelection = false;
          var images = {};
          var mouseDownX = null;
          var mouseDownY = null;
          $scope.movingCanvas = false;
          $scope.currentFilters = [];
          $scope.entryPoint = null;
          $scope.loadingNodes = false;
          $scope.srMessage = null;
          $scope.add = function (event, drop) {
            $scope.currentQuery.query.graph.nodes = $scope.nodes;
            $scope.currentQuery.query.graph.edges = $scope.connections;
            var name = $scope.currentQuery.name;
            var description = $scope.currentQuery.description;
            var blob = queryBuilderCommon.flattenGraph(
              $scope.currentQuery.query,
              $scope.currentQuery.name,
              $scope.currentQuery.usedNames
            );
            if (queryBuilderCommon.getClassCount(blob) < CONST.MAX_CLASSES) {
              var isStartNode = false;
              if (
                $scope.nodes.length === 0 &&
                !queryBuilderCanvasUtil.getStartNode()
              )
                isStartNode = true;
              if (
                drop.type === CONST.CLASSES ||
                drop.type === CONST.OBJECT_TYPES.NON_CMDB
              ) {
                var sendNode = angular.copy(drop.data.data);
                sendNode.x = event.layerX - $scope.canvasXOffset;
                sendNode.y = event.layerY - $scope.canvasYOffset;
                sendNode.center = null;
                sendNode.divWidth = null;
                sendNode.divHeight = null;
                sendNode.touched = false;
                sendNode.hovering = false;
                sendNode.leftSelected = false;
                sendNode.leftConnected = false;
                sendNode.leftCorner = null;
                sendNode.leftCenter = null;
                sendNode.leftConnections = [];
                sendNode.rightSelected = false;
                sendNode.rightConnected = false;
                sendNode.rightCorner = null;
                sendNode.rightCenter = null;
                sendNode.rightConnections = [];
                sendNode.dragged = false;
                sendNode.returnValues = [];
                sendNode.filters_attrib = '';
                sendNode.applied_filters = '';
                sendNode.isStartNode = isStartNode;
              }
              if (drop.type === 'classes') {
                var node = angular.copy(sendNode);
                node.nodeId = getNodeID(node);
                node.name = getUniqueName(node.ci_type, node.label);
                node.type = node.ci_type;
                if (!node.image) node.image = $scope.api.getImage(node);
                if (isStartNode) queryBuilderCanvasUtil.setStartNode(node);
                if (
                  $scope.currentQuery.query.query_type ===
                  CONST.QUERY_TYPES.SERVICE
                ) {
                  var isEndpoint = determineEndpoint(drop);
                  node.canBeEntryPoint = isEndpoint;
                  if (
                    isEndpoint &&
                    (!$scope.currentQuery.hasEntryPoint ||
                      $scope.entryPoint.entryPoint === false)
                  ) {
                    $scope.dialogInfo = {
                      header: node.name,
                      message: i18n.getMessage(
                        'queryBuilder.dialog.box.askEntrypoint'
                      ),
                      buttons: [
                        {
                          label: i18n.getMessage(
                            'queryBuilder.dialog.box.button.no'
                          ),
                          callBack: function () {},
                        },
                        {
                          label: i18n.getMessage(
                            'queryBuilder.dialog.box.button.yes'
                          ),
                          callBack: function () {
                            $scope.currentQuery.hasEntryPoint = true;
                            node.entryPoint = true;
                            $scope.entryPoint = node;
                          },
                        },
                      ],
                    };
                    $rootScope.$broadcast('dialogBox.open');
                  }
                }
                var allChildrenTypes =
                  queryBuilderCanvasUtil.getAllChildrenTypes();
                if (!allChildrenTypes[drop.data.data.ci_type]) {
                  queryBuilderCanvasUtil.addChildType(
                    drop.data.data.ci_type,
                    []
                  );
                  $scope.getAllChildren(drop.data.data.ci_type);
                }
                var allParentTypes = queryBuilderCanvasUtil.getAllParentTypes();
                if (!allParentTypes[drop.data.data.ci_type]) {
                  queryBuilderCanvasUtil.addParentType(
                    drop.data.data.ci_type,
                    []
                  );
                  $scope.getAllParents(drop.data.data.ci_type);
                }
                $scope.nodes.push(node);
                $rootScope.$broadcast('calculate_center');
                $rootScope.$broadcast('node_dropped', {
                  node: node,
                });
                $timeout(function () {
                  var selector = '#' + node.nodeId;
                  var newNode = angular.element(selector);
                  if (newNode) {
                    newNode.focus();
                    var canvasContainer = angular.element('.canvas-container');
                    var canvasScrollLeft = canvasContainer[0].scrollLeft;
                    if (canvasScrollLeft > 0) {
                      $scope.canvasXOffset += -canvasScrollLeft;
                      canvasContainer[0].scrollLeft = 0;
                    }
                  }
                  $rootScope.$broadcast('calculate_center');
                  $rootScope.$broadcast('calculate_path_center');
                });
              } else if (drop.type === 'services')
                addService(event, drop, isStartNode);
              else if (drop.type === CONST.OBJECT_TYPES.NON_CMDB)
                addNonCmdbNode(event, drop, isStartNode, sendNode);
            } else
              snNotification
                .show(
                  'error',
                  i18n.getMessage('queryBuilder.notifications.maxClasses') +
                    ' (' +
                    CONST.MAX_CLASSES +
                    ')',
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
          };
          function addService(event, drop, isStartNode) {
            drop.data = angular.copy(drop.data);
            var service = {
              nodeId: getServiceNodeID(drop.data),
              x: event.layerX - $scope.canvasXOffset,
              y: event.layerY - $scope.canvasYOffset,
              center: null,
              divWidth: null,
              divHeight: null,
              touched: false,
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
              nodeType: CONST.NODETYPE.SERVICE,
              name: drop.data.name,
              sys_id: drop.data.sys_id,
              type: CONST.BASE_SERVICE_CLASS,
              leftConnections: [],
              rightConnections: [],
              returnValues: drop.data.query.returnValues,
              isStartNode: isStartNode,
            };
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            if (!allProperties[service.type]) {
              queryBuilderCanvasUtil.setLoadingTableProperties(true);
              queryService
                .getCIProperties(service.type)
                .then(function (results) {
                  queryBuilderCanvasUtil.setLoadingTableProperties(false);
                  queryBuilderCanvasUtil.addProperty(service.type, results);
                  getOptionLabels(service);
                  $scope.$emit('queryBuilder.gotProperties', {
                    type: service.type,
                  });
                });
            } else if (allProperties[service.type]) {
              getOptionLabels(service);
            }
            if (isStartNode) queryBuilderCanvasUtil.setStartNode(service);
            $scope.nodes.push(service);
            if (!$scope.currentQuery.dependencies)
              $scope.currentQuery.dependencies = [];
            var contains = false;
            for (var i = 0; i < $scope.currentQuery.dependencies.length; i++) {
              if ($scope.currentQuery.dependencies[i] == '') {
                $scope.currentQuery.dependencies.splice(i, 1);
                i--;
              } else if (
                $scope.currentQuery.dependencies[i] == service.sys_id
              ) {
                contains = true;
                break;
              }
            }
            if (!contains)
              $scope.currentQuery.dependencies.push(service.sys_id);
            $rootScope.$broadcast('calculate_center');
            $scope.$emit('node_dropped', {
              node: service,
            });
            $timeout(function () {
              $rootScope.$broadcast('calculate_center');
              $rootScope.$broadcast('calculate_path_center');
            });
          }
          function addNonCmdbNode(event, drop, isStartNode, preNode) {
            var nonCmdbNode = angular.copy(preNode);
            nonCmdbNode.nodeId = getNonCmdbNodeID(preNode);
            nonCmdbNode.name = getUniqueName(
              drop.data.table_name,
              drop.data.label
            );
            nonCmdbNode.sys_id = nonCmdbNode.unique_id;
            nonCmdbNode.type = drop.data.table_name;
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            if (!allProperties[nonCmdbNode.type]) {
              queryBuilderCanvasUtil.setLoadingTableProperties(true);
              queryService
                .getCIProperties(nonCmdbNode.type)
                .then(function (results) {
                  queryBuilderCanvasUtil.setLoadingTableProperties(false);
                  queryBuilderCanvasUtil.addProperty(nonCmdbNode.type, results);
                  getOptionLabels(nonCmdbNode);
                  $scope.$emit('queryBuilder.gotProperties', {
                    type: nonCmdbNode.type,
                  });
                });
            } else if (allProperties[nonCmdbNode.type]) {
              getOptionLabels(nonCmdbNode);
            }
            if (isStartNode) queryBuilderCanvasUtil.setStartNode(nonCmdbNode);
            $scope.nodes.push(nonCmdbNode);
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('node_dropped', {
              node: nonCmdbNode,
            });
            $timeout(function () {
              var selector = '#' + nonCmdbNode.nodeId;
              var newNode = angular.element(selector);
              if (newNode) {
                newNode.focus();
                var canvasContainer = angular.element('.canvas-container');
                if (canvasContainer) {
                  var canvasScrollLeft = canvasContainer[0].scrollLeft;
                  if (canvasScrollLeft > 0) {
                    $scope.canvasXOffset += -canvasScrollLeft;
                    canvasContainer[0].scrollLeft = 0;
                  }
                }
              }
              $rootScope.$broadcast('calculate_center');
              $rootScope.$broadcast('calculate_path_center');
            });
          }
          $scope.isOperatorNode = function (node) {
            return isNodeType(node, CONST.NODETYPE.OPERATOR);
          };
          $scope.isServiceNode = function (node) {
            return isNodeType(node, CONST.NODETYPE.SERVICE);
          };
          $scope.isClassNode = function (node) {
            return isNodeType(node, CONST.NODETYPE.CLASS);
          };
          $scope.isNonCmdbNode = function (node) {
            return isNodeType(node, CONST.OBJECT_TYPES.NON_CMDB);
          };
          $scope.isStartNode = function (node) {
            return node.isStartNode;
          };
          $scope.hasError = function (node) {
            return node.error;
          };
          $scope.isLineSelected = function (node) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (node.touched) return true;
            if (
              latestTouched &&
              latestTouched.touchedType === 'connection' &&
              node.nodeType === 'operator'
            )
              if (latestTouched.first === node || latestTouched.second === node)
                return true;
            var operatorLines = queryBuilderCanvasUtil.getOperatorLines();
            for (var i = 0; i < operatorLines.length; i++) {
              if (operatorLines[i] === node) return true;
            }
            return false;
          };
          $scope.clickedCanvas = function () {
            if (!$scope.makingSelection) {
              if (queryBuilderCanvasUtil.getLinking()) {
                queryBuilderCanvasUtil.setLinking(false);
                var first_node = queryBuilderCanvasUtil.getFirstNode();
                if (first_node && first_node.rightSelected)
                  first_node.rightSelected = false;
                queryBuilderCanvasUtil.setFirstNode(null);
              }
              queryBuilderCanvasUtil.setShowFilters(false);
              $scope.showServiceProps = false;
              $scope.$emit('canvas_touched');
              $rootScope.$broadcast('queryBuilder.resetTree');
              if (queryBuilderSelection.hasSelection())
                queryBuilderSelection.clearSelection();
            }
          };
          $scope.dragStart = function (event, item) {
            if (!$scope.selectMode) {
              if (event.type === 'mousedown' && event.which === 1) {
                queryBuilderCanvasUtil.setDraggingItem(item);
                if (queryBuilderCanvasUtil.getDraggingItem() != 'contextMenu') {
                  mouseDownX = event.clientX;
                  mouseDownY = event.clientY;
                  $scope.movingCanvas = true;
                }
              }
            } else {
              if (event.type === 'mousedown' && event.which === 1) {
                queryBuilderCanvasUtil.setDraggingItem(item);
                mouseDownX = event.clientX;
                mouseDownY = event.clientY;
                $scope.movingCanvas = true;
                queryBuilderSelection.onSelectionStart(event, {
                  canvasXOffset: $scope.canvasXOffset,
                  canvasYOffset: $scope.canvasYOffset,
                });
              }
            }
          };
          $scope.calculateOffset = function (event, item) {
            if (!$scope.selectMode) {
              if (
                $scope.movingCanvas &&
                item === queryBuilderCanvasUtil.getDraggingItem()
              ) {
                $scope.canvasXOffset =
                  event.clientX - mouseDownX + $scope.canvasXOffset;
                $scope.canvasYOffset =
                  event.clientY - mouseDownY + $scope.canvasYOffset;
                mouseDownX = event.clientX;
                mouseDownY = event.clientY;
              } else {
                for (var i = 0; i < $scope.nodes.length; i++) {
                  if (
                    queryBuilderCanvasUtil.getDraggingItem() === $scope.nodes[i]
                  ) {
                    $rootScope.$broadcast('queryBuilder.calculateNodeMove', {
                      event: event,
                      node: $scope.nodes[i],
                    });
                  }
                }
              }
            } else {
              if (
                $scope.movingCanvas &&
                item === queryBuilderCanvasUtil.getDraggingItem()
              ) {
                if (queryBuilderSelection.makingSelection())
                  $scope.makingSelection = true;
                queryBuilderSelection.onSelectionChange(event, {
                  nodes: $scope.nodes,
                  connections: $scope.connections,
                  canvasXOffset: $scope.canvasXOffset,
                  canvasYOffset: $scope.canvasYOffset,
                });
              } else {
                for (var i = 0; i < $scope.nodes.length; i++) {
                  if (
                    queryBuilderCanvasUtil.getDraggingItem() === $scope.nodes[i]
                  ) {
                    $rootScope.$broadcast('queryBuilder.calculateNodeMove', {
                      event: event,
                      node: $scope.nodes[i],
                    });
                  }
                }
              }
            }
          };
          $scope.dragStop = function (event) {
            $scope.movingCanvas = false;
            queryBuilderCanvasUtil.setDraggingItem(null);
            if ($scope.selectMode) {
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              if (latestTouched) {
                $rootScope.$broadcast('queryBuilder.resetTree');
                if (!queryBuilderSelection.nodeInSelection(latestTouched))
                  latestTouched.touched = false;
                queryBuilderCanvasUtil.setLatestTouched(null);
              }
              if (queryBuilderCanvasUtil.getShowFilters())
                queryBuilderCanvasUtil.setShowFilters(false);
              queryBuilderSelection.onSelectionStop();
              requestAnimationFrame(function () {
                $scope.makingSelection = false;
              });
            }
          };
          $scope.isValidConn = function (conn) {
            if (conn.info) {
              conn = conn.info;
              if (!queryBuilderValidation.isOnMultipleSide(conn)) {
                conn.isValid = true;
                return true;
              } else {
                conn.isValid = false;
                if ($scope.currentQuery.query) {
                  var parent = queryBuilderCommon.getTrueParent(conn.first);
                  var child = queryBuilderCommon.getTrueChild(conn.second);
                  if (
                    queryBuilderCanvasUtil.isNonCmdbConnection(parent, child)
                  ) {
                    if (
                      angular.isDefined(conn.selectedNonCmdbReference) &&
                      conn.selectedNonCmdbReference.column_name !== null
                    ) {
                      conn.isValid = true;
                      return true;
                    }
                  } else if (
                    $scope.currentQuery.query.query_type ===
                      CONST.QUERY_TYPES.GENERAL &&
                    !parent.isPattern
                  ) {
                    var hasRelations = conn.relations.length > 0 ? true : false;
                    var noRelationsChecked = conn.noRelations;
                    var hasReference = conn.reference.label ? true : false;
                    var hasBelongs = conn.belongs !== undefined ? true : false;
                    var isMultiLevel = conn.relationshipLevels > 1;
                    if (
                      hasRelations ||
                      noRelationsChecked ||
                      hasReference ||
                      hasBelongs ||
                      isMultiLevel
                    ) {
                      conn.isValid = true;
                      return true;
                    }
                  } else if (
                    $scope.currentQuery.query.query_type ===
                      CONST.QUERY_TYPES.SERVICE ||
                    parent.isPattern
                  ) {
                    if (
                      conn.type === CONST.EDGE_TYPES.APP_FLOW ||
                      conn.type === CONST.EDGE_TYPES.BELONGS
                    ) {
                      conn.isValid = true;
                      return true;
                    }
                  }
                }
              }
            }
            return false;
          };
          function isNodeType(node, type) {
            if (node && type) return node.nodeType === type ? true : false;
            return false;
          }
          $scope.showWelcomeMessage = function () {
            if (
              !queryBuilderCanvasUtil.getDroppedClass() &&
              !$scope.loadingNodes
            )
              return true;
            return false;
          };
          $scope.getTransform = function () {
            var transform =
              'translate(' +
              $scope.canvasXOffset +
              'px, ' +
              $scope.canvasYOffset +
              'px)scale(' +
              $scope.canvasZoom +
              ')';
            return {
              transform: transform,
              '-ms-transform': transform,
              '-webkit-transform': transform,
              '-moz-transform': transform,
            };
          };
          $scope.getCanvasClasses = function () {
            return {
              movingCanvas: $scope.movingCanvas,
              drawing: queryBuilderCanvasUtil.getDroppedClass(),
              selecting: $scope.selectMode,
            };
          };
          $scope.isClassDropped = function () {
            return queryBuilderCanvasUtil.getDroppedClass();
          };
          function determineEndpoint(drop) {
            var type = drop.data.data.ci_type;
            var currentLevel = drop.data.data.level;
            if (currentLevel === 1 && type === CONST.BASE_ENDPOINT_CLASS) {
              return true;
            } else if (currentLevel > 1) {
              var parent = drop.data.data.parent;
              while (currentLevel > 1) {
                currentLevel = parent.level;
                if (
                  currentLevel === 1 &&
                  parent.ci_type === CONST.BASE_ENDPOINT_CLASS
                ) {
                  return true;
                } else if (currentLevel > 1) {
                  parent = parent.parent;
                }
              }
            }
            return false;
          }
          function clearCanvas() {
            $scope.nodes = [];
            queryBuilderCanvasUtil.setFirstNode(null);
            queryBuilderCanvasUtil.setLinking(false);
            $scope.canvasXOffset = 0;
            $scope.canvasYOffset = 0;
            queryBuilderCanvasUtil.setStartNode(null);
            queryBuilderCanvasUtil.setDroppedClass(false);
            $scope.errorFound = null;
            if (
              $scope.currentQuery &&
              $scope.currentQuery.query &&
              $scope.currentQuery.query.query_type === CONST.QUERY_TYPES.SERVICE
            ) {
              if (
                $scope.currentQuery.hasEntryPoint !== null &&
                $scope.currentQuery.hasEntryPoint !== undefined
              )
                $scope.currentQuery.hasEntryPoint = false;
              $scope.entryPoint = null;
            }
            $rootScope.$broadcast('queryBuilder.resetTree');
          }
          function clearUsedNames() {
            for (var key in $scope.currentQuery.usedNames)
              $scope.currentQuery.usedNames[key] = 0;
          }
          function getNodeID(node) {
            var formatted = getFormattedTime();
            return node.unique_id + '_' + formatted;
          }
          function getUniqueName(type, name) {
            if ($scope.currentQuery.usedNames[type] >= 0) {
              $scope.currentQuery.usedNames[type] += 1;
              return name + ' ' + $scope.currentQuery.usedNames[type];
            } else {
              $scope.currentQuery.usedNames[type] = 1;
              return name + ' ' + $scope.currentQuery.usedNames[type];
            }
          }
          function getServiceNodeID(service) {
            var formatted = getFormattedTime();
            return service.sys_id + '_' + formatted;
          }
          function getNonCmdbNodeID(nonCmdb) {
            var formatted = getFormattedTime();
            return nonCmdb.unique_id + '_' + formatted;
          }
          function getFormattedTime() {
            var date = new Date();
            var GMT = new Date(
              date.valueOf() + date.getTimezoneOffset() * 60000
            );
            var local = new Date(GMT.valueOf() + $scope.api.g_tz_offset);
            return (
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
              local.getSeconds()
            );
          }
          $scope.$on('clear_canvas', clearCanvas);
          $scope.$on('property_selected', function (event, args) {
            var index = args.node.returnValues.indexOf(args.property);
            if (index > -1) args.node.returnValues.splice(index, 1);
            else args.node.returnValues.push(args.property);
          });
          $scope.$on('queryBuilder.loadQuery', function (event, args) {
            $scope.loadingNodes = true;
          });
          $scope.$on('queryBuilder.nodesRecreated', function (event, args) {
            $scope.loadingNodes = false;
          });
          $scope.$on('queryBuilder.newQuery', function (event, args) {
            $scope.currentQuery.usedNames = {};
          });
          $scope.$on(
            'queryBuilder.accessibility.addNode',
            function (event, args) {
              if (args.drop) {
                var position = getAddNodePosition();
                $scope.add(
                  { layerX: position.x, layerY: position.y },
                  args.drop
                );
              }
            }
          );
          function getOptionLabels(node) {
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            var props = allProperties[node.type];
            var newOptions = [];
            for (var i = 0; i < node.returnValues.length; i++)
              for (var j = 0; j < props.length; j++) {
                if (props[j].element === node.returnValues[i]) {
                  newOptions.push({
                    label: props[j].label,
                    element: node.returnValues[i],
                  });
                }
              }
            node.returnValues = newOptions;
          }
          $scope.getAllChildren = function (classType, recreating) {
            var delay = recreating ? 1000 : 0;
            setTimeout(function () {
              if (!queryBuilderTreeUtil.getLoadingTree()) {
                var allChildren = queryBuilderTreeUtil.findChildren(
                  classType,
                  queryBuilderTreeUtil.getCurrentTree()
                );
                queryBuilderCanvasUtil.addChildType(classType, allChildren);
              } else {
                $scope.getAllChildren(classType);
              }
            }, delay);
          };
          $scope.getAllParents = function (classType, recreating) {
            var delay = recreating ? 1000 : 0;
            setTimeout(function () {
              if (!queryBuilderTreeUtil.getLoadingTree()) {
                var allParents = queryBuilderTreeUtil.findParents(
                  classType,
                  queryBuilderTreeUtil.getCurrentTree()
                );
                queryBuilderCanvasUtil.addParentType(classType, allParents);
              } else {
                $scope.getAllParents(classType);
              }
            }, delay);
          };
          function getSubClasses(children, allChildren) {
            for (var i = 0; i < children.length; i++) {
              allChildren.push(children[i]);
            }
          }
          function getParentClasses(parents, allParents) {
            for (var i = 0; i < parents.length; i++) {
              allParents.push(parents[i]);
            }
          }
          function getAddNodePosition() {
            var position = {
              x: 50 + $scope.canvasXOffset,
              y: 25,
            };
            var overlapping = true;
            while (overlapping) {
              var overlappingNode = isOverlapping(position);
              if (overlappingNode > -1) {
                position.x += $scope.nodes[overlappingNode].divWidth + 100;
              } else overlapping = false;
            }
            return position;
          }
          function isOverlapping(position) {
            var overlappingNode = -1;
            for (var i = 0; i < $scope.nodes.length; i++) {
              if (
                position.x - $scope.canvasXOffset >
                  $scope.nodes[i].x + $scope.nodes[i].divWidth ||
                position.x - $scope.canvasXOffset < $scope.nodes[i].x
              )
                continue;
              else if (
                position.y > $scope.nodes[i].y + $scope.nodes[i].divHeight ||
                position.y + 40 < $scope.nodes[i].y
              )
                continue;
              else {
                overlappingNode = i;
                break;
              }
            }
            return overlappingNode;
          }
          function getSelectMode() {
            return $scope.selectMode;
          }
          $scope.nodesAPI = {
            getImage: $scope.api.getImage,
            isOperatorNode: $scope.isOperatorNode,
            isServiceNode: $scope.isServiceNode,
            isClassNode: $scope.isClassNode,
            isStartNode: $scope.isStartNode,
            hasError: $scope.hasError,
            isLineSelected: $scope.isLineSelected,
            getAllChildren: $scope.getAllChildren,
            getAllParents: $scope.getAllParents,
            makingSelection: $scope.makingSelection,
            getSelectMode: getSelectMode,
            openServiceQuery: $scope.api.openServiceQuery,
          };
        },
      ],
    };
  },
]);
