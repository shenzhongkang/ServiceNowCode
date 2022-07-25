/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderCommon.js */
angular.module('sn.queryBuilder').factory('queryBuilderCommon', [
  'CONSTQB',
  'i18n',
  'queryBuilderSelection',
  '$window',
  '$location',
  'queryBuilderValidation',
  'queryBuilderCanvasUtil',
  'queryBuilderTreeUtil',
  function (
    CONST,
    i18n,
    queryBuilderSelection,
    $window,
    $location,
    queryBuilderValidation,
    queryBuilderCanvasUtil,
    queryBuilderTreeUtil
  ) {
    'use strict';
    function _replaceList(target, source) {
      while (target.length > 0) target.pop();
      for (var i = 0; i < source.length; i++) target.push(source[i]);
    }
    function _appendList(target, source) {
      for (var i = 0; i < source.length; i++) target.push(source[i]);
    }
    function _flattenGraph(query, queryName, usedNames) {
      var flat = {
        type: query.query_type,
        nodes: [],
        edges: [],
        usedNames: usedNames,
      };
      if (query.query_type === CONST.QUERY_TYPES.SERVICE) {
        flat.isNot = !query.includesGraph;
        var graph = query.graph;
        var invalidOperators = [];
        var mergeConnections = {};
        if (graph.nodes.length === 0) return flat;
        var serviceQueryNode = {
          returnValues: flattenItem(query.returnValues, 'element'),
          filters_attrib: query.applied_filters,
          applied_filters: query.applied_filters,
          name: i18n.getMessage('queryBuilder.general.serviceBoxName'),
          className: CONST.BASE_SERVICE_CLASS,
          id: queryName,
          type: CONST.NODETYPE.SERVICE,
          isStartNode: true,
        };
        flat.nodes.push(serviceQueryNode);
        invalidOperators = findInvalidOps(graph);
        var startNode = null;
        for (var i = 0; i < graph.nodes.length; i++) {
          if (graph.nodes[i].isStartNode) startNode = graph.nodes[i];
          if (invalidOperators.indexOf(graph.nodes[i].nodeId) === -1)
            flat.nodes.push(flattenServiceNode(graph.nodes[i]));
          else {
            for (var j = 0; j < graph.edges.length; j++) {
              if (
                graph.edges[j].info.first === graph.nodes[i] ||
                graph.edges[j].info.second === graph.nodes[i]
              ) {
                if (!mergeConnections[graph.nodes[i].nodeId])
                  mergeConnections[graph.nodes[i].nodeId] = [];
                mergeConnections[graph.nodes[i].nodeId].push(graph.edges[j].id);
              }
            }
          }
        }
        if (startNode) {
          var serviceToFirst = {
            from: serviceQueryNode.id,
            to: startNode.nodeId,
            type: CONST.EDGE_TYPES.BELONGS,
            id: serviceQueryNode.id + '_' + startNode.name,
          };
          flat.edges.push(serviceToFirst);
        }
        for (var i = 0; i < graph.edges.length; i++) {
          if (
            invalidOperators.indexOf(graph.edges[i].info.first.nodeId) === -1 &&
            invalidOperators.indexOf(graph.edges[i].info.second.nodeId) === -1
          ) {
            flat.edges.push(flattenEdge(graph.edges[i], query));
          } else {
            var combinedEdge = combineEdge(
              invalidOperators,
              mergeConnections,
              graph.edges[i],
              graph
            );
            if (combinedEdge) {
              flat.edges.push(flattenEdge(combinedEdge, query));
            }
          }
        }
      } else if (query.query_type === CONST.QUERY_TYPES.GENERAL) {
        var graph = query.graph;
        var invalidOperators = [];
        var mergeConnections = {};
        invalidOperators = findInvalidOps(graph);
        for (var i = 0; i < graph.nodes.length; i++) {
          if (invalidOperators.indexOf(graph.nodes[i].nodeId) === -1) {
            if (graph.nodes[i].isPattern)
              flat.nodes.push(flattenServiceNode(graph.nodes[i], true));
            else flat.nodes.push(flattenNode(graph.nodes[i]));
          } else {
            for (var j = 0; j < graph.edges.length; j++) {
              if (
                graph.edges[j].info.first === graph.nodes[i] ||
                graph.edges[j].info.second === graph.nodes[i]
              ) {
                if (!mergeConnections[graph.nodes[i].nodeId])
                  mergeConnections[graph.nodes[i].nodeId] = [];
                mergeConnections[graph.nodes[i].nodeId].push(graph.edges[j].id);
              }
            }
          }
        }
        for (var i = 0; i < graph.edges.length; i++) {
          if (
            invalidOperators.indexOf(graph.edges[i].info.first.nodeId) === -1 &&
            invalidOperators.indexOf(graph.edges[i].info.second.nodeId) === -1
          ) {
            flat.edges.push(flattenEdge(graph.edges[i], query));
          } else {
            var combinedEdge = combineEdge(
              invalidOperators,
              mergeConnections,
              graph.edges[i],
              graph
            );
            if (combinedEdge) {
              flat.edges.push(flattenEdge(combinedEdge, query));
            }
          }
        }
      }
      return flat;
    }
    function _flattenLocally(query) {
      var flat = {
        query_type: query.query_type,
        graph: {
          nodes: [],
          edges: [],
        },
      };
      if (query.query_type === CONST.QUERY_TYPES.SERVICE) {
        flat.returnValues = flattenItem(query.returnValues, 'element');
        flat.filters_attrib = query.applied_filters;
        flat.applied_filters = query.applied_filters;
        flat.includesGraph = query.includesGraph;
        flat.hasEntryPoint = query.hasEntryPoint;
      }
      var graph = query.graph;
      for (var i = 0; i < graph.nodes.length; i++) {
        if (query.query_type === CONST.QUERY_TYPES.GENERAL) {
          if (graph.nodes[i].isPattern)
            flat.graph.nodes.push(flattenServiceNode(graph.nodes[i], true));
          else flat.graph.nodes.push(flattenNode(graph.nodes[i]));
        } else if (query.query_type === CONST.QUERY_TYPES.SERVICE) {
          var flatNode = flattenServiceNode(graph.nodes[i]);
          if (flatNode.type === CONST.NODETYPE.SERVICE_ELEMENT)
            flatNode.type = CONST.NODETYPE.CLASS;
          flat.graph.nodes.push(flatNode);
        }
      }
      for (var i = 0; i < graph.edges.length; i++) {
        flat.graph.edges.push(flattenEdge(graph.edges[i], query));
      }
      return flat;
    }
    function _getCurrentTimeInUserFormat(offset) {
      var date = new Date();
      var GMT = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
      var local = new Date(GMT.valueOf() + offset);
      var userDateFormat = window.NOW.g_user_date_format.toUpperCase();
      var userTimeFormat = window.NOW.g_user_time_format.replace(
        window.NOW.g_user_date_format,
        ''
      );
      var userDateTimeFormat = userDateFormat + userTimeFormat;
      return moment(local).format(userDateTimeFormat);
    }
    function _getCurrentRawTime() {
      return Date.now();
    }
    function _getClassCount(blob) {
      var count = 0;
      if (blob.type === CONST.QUERY_TYPES.SERVICE) count = -1;
      for (var i = 0; i < blob.nodes.length; i++) {
        if (
          blob.nodes[i].type === CONST.NODETYPE.CLASS ||
          blob.nodes[i].type === CONST.NODETYPE.SERVICE ||
          blob.nodes[i].type === CONST.NODETYPE.SERVICE_ELEMENT
        )
          count++;
      }
      return count;
    }
    function _getOperatorCount(blob) {
      var count = 0;
      for (var i = 0; i < blob.nodes.length; i++) {
        if (blob.nodes[i].type === CONST.NODETYPE.OPERATOR) count++;
      }
      return count;
    }
    function _getQueryType(blob) {
      return blob.type;
    }
    function _getQueryDepth(blob) {
      var count = null;
      var start = null;
      for (var i = 0; i < blob.nodes.length; i++) {
        if (blob.nodes[i].leftConnections.length === 0) start = blob.nodes[i];
      }
      if (start) {
        count = 0;
        count = getLongestPath(start, count);
      }
      return count;
    }
    function _getTrueParent(parent) {
      while (parent && parent.nodeType === CONST.NODETYPE.OPERATOR) {
        parent = parent.leftConnections[0];
      }
      if (parent && parent.nodeType != CONST.NODETYPE.OPERATOR) return parent;
      return null;
    }
    function _getTrueChild(child) {
      while (child && child.nodeType === CONST.NODETYPE.OPERATOR) {
        child = child.rightConnections[0];
      }
      if (child && child.nodeType != CONST.NODETYPE.OPERATOR) return child;
      return null;
    }
    function _isGeneralQuery(checkQuery) {
      if (
        checkQuery &&
        checkQuery.query &&
        checkQuery.query.query_type === CONST.QUERY_TYPES.GENERAL
      )
        return true;
      return false;
    }
    function _isServiceQuery(checkQuery) {
      if (
        checkQuery &&
        checkQuery.query &&
        checkQuery.query.query_type === CONST.QUERY_TYPES.SERVICE
      )
        return true;
      return false;
    }
    function _hasAccessibilityEnabled() {
      return window.NOW.g_accessibility;
    }
    function _getURLParameter(name) {
      return (
        decodeURIComponent(
          (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(
            location.search
          ) || [, ''])[1].replace(/\+/g, '%20')
        ) || null
      );
    }
    function _updateSavedQueryURLParameter(sys_id) {
      var param = 'sysparm_saved_qb_query';
      $location.search(param, sys_id);
    }
    function _getSuggestedConnections(node) {
      var suggested = [];
      var existingRelationships = queryBuilderCanvasUtil.getAllRelationships();
      var allChildrenTypes = queryBuilderCanvasUtil.getAllChildrenTypes();
      var myChildren = allChildrenTypes[node.type];
      for (var key in existingRelationships[node.type]) {
        if (suggested.indexOf(key) === -1) suggested.push(key);
      }
      for (var i = 0; i < myChildren.length; i++) {
        for (var key in existingRelationships[myChildren[i]]) {
          if (suggested.indexOf(key) === -1) suggested.push(key);
        }
      }
      for (var parentKey in existingRelationships) {
        for (var childKey in existingRelationships[parentKey]) {
          if (childKey === node.type && suggested.indexOf(parentKey) === -1)
            suggested.push(parentKey);
        }
      }
      return suggested;
    }
    function _focusFilterArea() {
      var filterArea = angular.element(
        '.filters-area .filters-body .related-filters .predicate .filter-toggle-header button'
      );
      if (filterArea && filterArea[0]) {
        filterArea[0].focus();
      }
    }
    function _focusNotificationCloseButton(notificationElement) {
      if (notificationElement) {
        var focusedBeforeNotification = angular.element(
          document.activeElement
        )[0];
        var notificationCloseButton = angular.element(
          notificationElement.find('button.close')
        );
        notificationCloseButton.focus();
        var notificationElement = angular.element(notificationElement);
        notificationElement.on('remove', function () {
          focusedBeforeNotification.focus();
        });
      }
    }
    function _focusFirstElement(selector) {
      if (selector) {
        var element = angular.element(selector);
        if (element) {
          var focusable = tabbable(element[0]);
          if (focusable && focusable.length > 0) focusable[0].focus();
        }
      }
    }
    function _isApplicationServiceNode(node) {
      if (node && node.ci_type) {
        var appServiceChildren = [];
        if (queryBuilderTreeUtil.hasTree('cmdb'))
          appServiceChildren = queryBuilderTreeUtil.findChildren(
            CONST.APPLICATION_SERVICE_TABLE,
            queryBuilderTreeUtil.getSpecificTree('cmdb')
          );
        else if (queryBuilderTreeUtil.hasTree('business_service'))
          appServiceChildren = queryBuilderTreeUtil.findChildren(
            CONST.APPLICATION_SERVICE_TABLE,
            queryBuilderTreeUtil.getSpecificTree('business_service')
          );
        return (
          node.ci_type === CONST.APPLICATION_SERVICE_TABLE ||
          appServiceChildren.indexOf(node.ci_type) > -1
        );
      }
      return false;
    }
    function _isValidPatternSelection(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        if (nodes[i].isPattern && !_isApplicationServiceNode(nodes[i])) {
          var parentApplicationService = findParentApplicationService(nodes[i]);
          if (
            (parentApplicationService &&
              !queryBuilderSelection.nodeInSelection(
                parentApplicationService
              )) ||
            !parentApplicationService
          )
            return false;
        }
      }
      return true;
    }
    function _setIsPattern(node, isPattern) {
      if (
        node.nodeType !== CONST.OBJECT_TYPES.NON_CMDB &&
        node.nodeType !== CONST.NODETYPE.OPERATOR &&
        node.nodeType !== CONST.NODETYPE.SERVICE
      )
        node.isPattern = isPattern;
      if (node.rightConnections && node.rightConnections.length > 0) {
        for (var i = 0; i < node.rightConnections.length; i++) {
          if (!_isApplicationServiceNode(node.rightConnections[i]))
            _setIsPattern(node.rightConnections[i], isPattern);
        }
      }
    }
    function flattenNode(node) {
      var sendNode = angular.copy(node);
      sendNode.type = node.nodeType;
      sendNode.id = node.nodeId;
      if (angular.isDefined(node.isPattern))
        sendNode.isPattern = node.isPattern;
      delete sendNode.center;
      delete sendNode.divWidth;
      delete sendNode.divHeight;
      delete sendNode.touched;
      delete sendNode.hovering;
      delete sendNode.leftSelected;
      delete sendNode.leftConnections;
      delete sendNode.leftCorner;
      delete sendNode.leftCenter;
      delete sendNode.leftConnected;
      delete sendNode.rightSelected;
      delete sendNode.rightConnections;
      delete sendNode.rightCorner;
      delete sendNode.rightCenter;
      delete sendNode.rightConnected;
      delete sendNode.dragged;
      delete sendNode.touchedType;
      if (
        node.nodeType === CONST.NODETYPE.CLASS ||
        node.nodeType === CONST.NODETYPE.SERVICE ||
        node.nodeType === CONST.OBJECT_TYPES.NON_CMDB
      ) {
        sendNode.className = node.type;
        sendNode.name = node.name;
        sendNode.returnValues = flattenItem(node.returnValues, 'element');
        if (
          node.nodeType === CONST.NODETYPE.CLASS ||
          node.nodeType === CONST.OBJECT_TYPES.NON_CMDB
        ) {
          sendNode.unique_id = node.unique_id;
          sendNode.sys_id = node.sys_id;
          sendNode.filters_attrib = node.applied_filters;
          sendNode.applied_filters = node.applied_filters;
        } else if (node.nodeType === CONST.NODETYPE.SERVICE) {
          sendNode.queryId = node.sys_id;
          sendNode.type = CONST.NODETYPE.SERVICE_QUERY;
        }
        if (node.nodeType === CONST.OBJECT_TYPES.NON_CMDB) {
          sendNode.isNonCmdb = true;
          sendNode.nodeType = CONST.NODETYPE.CLASS;
          sendNode.type = CONST.NODETYPE.CLASS;
          sendNode.ci_type = node.type;
        }
      } else if (node.nodeType === CONST.NODETYPE.OPERATOR) {
        delete sendNode.focused;
        sendNode.operatorType = node.name;
        sendNode.multipleSide = node.multipleSide;
      }
      return sendNode;
    }
    function flattenServiceNode(node, isBasicQuery) {
      var sendNode = {
        id: node.nodeId,
        x: node.x,
        y: node.y,
        type: node.nodeType,
        isStartNode: node.isStartNode,
      };
      if (angular.isDefined(node.isPattern))
        sendNode.isPattern = node.isPattern;
      if (node.nodeType === CONST.NODETYPE.CLASS) {
        sendNode.type = CONST.NODETYPE.SERVICE_ELEMENT;
        sendNode.className = node.type;
        sendNode.name = node.name;
        sendNode.sys_id = node.sys_id;
        sendNode.returnValues = flattenItem(node.returnValues, 'element');
        sendNode.filters_attrib = node.applied_filters;
        sendNode.applied_filters = node.applied_filters;
        sendNode.entryPoint = node.entryPoint;
        sendNode.canBeEntryPoint = node.canBeEntryPoint;
      } else if (node.nodeType === CONST.NODETYPE.OPERATOR) {
        sendNode.operatorType = node.name;
        sendNode.multipleSide = node.multipleSide;
      }
      if (isBasicQuery && _isApplicationServiceNode(node))
        sendNode.type = CONST.NODETYPE.SERVICE;
      return sendNode;
    }
    function flattenEdge(edge, currentQuery) {
      var sendEdge = {
        id: edge.id,
        from: edge.info.first.nodeId,
        to: edge.info.second.nodeId,
        isDotted: edge.info.isDotted,
        type: CONST.EDGE_TYPES.EMPTY,
        isReverse: edge.info.isReverse,
        direction: edge.info.isReverse ? 'inbound' : 'outbound',
        hiddenLevel: edge.info.relationshipLevels
          ? edge.info.relationshipLevels - 1
          : 0,
        applyToAllNodes: edge.info.applyToAllNodes,
      };
      if (edge.info.relations && edge.info.relations.length > 0) {
        sendEdge.type = CONST.EDGE_TYPES.RELATION;
        sendEdge.relations = flattenItem(edge.info.relations, 'sys_id');
      } else if (edge.info.noRelations)
        sendEdge.type = CONST.EDGE_TYPES.NO_RELATION;
      else if (edge.info.reference && edge.info.reference.element) {
        sendEdge.type = CONST.EDGE_TYPES.REFERENCE;
        sendEdge.reference = {
          column_name: edge.info.reference.element,
          column_label: edge.info.reference.label,
        };
      } else if (
        edge.info.type === CONST.EDGE_TYPES.APP_FLOW &&
        !angular.isDefined(edge.info.selectedNonCmdbReference)
      ) {
        if (
          angular.isDefined(edge.info.includesGraph) &&
          currentQuery.query_type === CONST.QUERY_TYPES.GENERAL
        ) {
          sendEdge.includesGraph = edge.info.includesGraph;
          sendEdge.type = CONST.EDGE_TYPES.BELONGS;
          if (!edge.info.includesGraph) sendEdge.isNot = true;
        } else {
          sendEdge.type = edge.info.type;
          if (edge.info.isNot) sendEdge.isNot = true;
        }
      } else if (edge.info.belongs === true || edge.info.belongs === false) {
        sendEdge.type = CONST.EDGE_TYPES.BELONGS;
        if (edge.info.belongs === false) sendEdge.isNot = true;
      } else if (edge.info.selectedNonCmdbReference) {
        sendEdge.type = CONST.EDGE_TYPES.REFERENCE;
        sendEdge.selectedNonCmdbReference = edge.info.selectedNonCmdbReference;
        sendEdge.reference = {
          column_name: edge.info.selectedNonCmdbReference.column_name,
          column_label: edge.info.selectedNonCmdbReference.column_label,
        };
        if (edge.info.applyToAllNodes)
          sendEdge.type = CONST.EDGE_TYPES.APPLY_TO_ALL;
      } else if (
        edge.info.relationshipLevels &&
        queryBuilderValidation.isOnMultipleSide(edge.info)
      ) {
        sendEdge.type = CONST.EDGE_TYPES.ANY_RELATION;
      }
      return sendEdge;
    }
    function flattenItem(item, send) {
      var itemList = [];
      for (var i = 0; i < item.length; i++) {
        itemList.push(item[i][send]);
      }
      return itemList;
    }
    function getLongestPath(node, count) {
      count++;
      var beforeLoop = count;
      for (var i = 0; i < node.rightConnections.length; i++) {
        var path = getLongestPath(node.rightConnections[i], beforeLoop);
        if (path > count) count = path;
      }
      return count;
    }
    function findInvalidOps(graph) {
      var invalidOperators = [];
      if (queryBuilderSelection.hasSelection()) {
        var currentSelection = queryBuilderSelection.getSelection();
        for (var i = 0; i < graph.nodes.length; i++) {
          if (graph.nodes[i].nodeType === CONST.NODETYPE.OPERATOR) {
            var parentLength = getSideLength(
              graph.nodes[i].leftConnections,
              currentSelection
            );
            var childrenLength = getSideLength(
              graph.nodes[i].rightConnections,
              currentSelection
            );
            if (parentLength <= 1 && childrenLength <= 1) {
              invalidOperators.push(graph.nodes[i].nodeId);
            }
          }
        }
      }
      return invalidOperators;
    }
    function getSideLength(side, selection) {
      var count = 0;
      for (var i = 0; i < side.length; i++) {
        for (var j = 0; j < selection.nodes.length; j++) {
          if (side[i].nodeId === selection.nodes[j].nodeId) count++;
        }
      }
      return count;
    }
    function combineEdge(invalidOperators, mergeConnections, edge, graph) {
      var invalidOp = null;
      if (invalidOperators.indexOf(edge.info.first.nodeId) > -1)
        invalidOp = edge.info.first.nodeId;
      else if (invalidOperators.indexOf(edge.info.second.nodeId) > -1)
        invalidOp = edge.info.second.nodeId;
      if (invalidOp) {
        if (mergeConnections[invalidOp]) {
          var toMerge = mergeConnections[invalidOp];
          if (toMerge.length === 2) {
            var edge1 = null;
            var edge2 = null;
            for (var i = 0; i < graph.edges.length; i++) {
              if (graph.edges[i].id === toMerge[0])
                edge1 = angular.copy(graph.edges[i]);
              else if (graph.edges[i].id === toMerge[1])
                edge2 = angular.copy(graph.edges[i]);
            }
            if (edge1 && edge2) {
              var uncommon1 = null;
              var uncommon2 = null;
              var common = null;
              if (edge1.info.first.nodeId === edge2.info.second.nodeId) {
                uncommon1 = edge1.info.second;
                uncommon2 = edge2.info.first;
                common = edge1.info.first;
              } else if (edge1.info.second.nodeId === edge2.info.first.nodeId) {
                uncommon1 = edge1.info.first;
                uncommon2 = edge2.info.second;
                common = edge1.info.second;
              }
              if (uncommon1 && uncommon2 && common) {
                if (common.multipleSide) {
                  var infoEdge = null;
                  if (
                    common.multipleSide === 'right' &&
                    edge2.info.first.nodeId === common.nodeId
                  ) {
                    infoEdge = edge2;
                  } else if (
                    common.multipleSide === 'right' &&
                    edge1.info.first.nodeId === common.nodeId
                  ) {
                    infoEdge = edge1;
                  }
                  if (
                    common.multipleSide === 'left' &&
                    edge2.info.second.nodeId === common.nodeId
                  ) {
                    infoEdge = edge2;
                  } else if (
                    common.multipleSide === 'left' &&
                    edge1.info.second.nodeId === common.nodeId
                  ) {
                    infoEdge = edge1;
                  }
                  if (infoEdge) {
                    var combinedEdge = {};
                    combinedEdge.id = getCombinedId(
                      edge1,
                      edge2,
                      uncommon1,
                      uncommon2,
                      infoEdge,
                      common.multipleSide
                    );
                    combinedEdge.info = getCombinedInfo(
                      edge1,
                      edge2,
                      uncommon1,
                      uncommon2,
                      infoEdge,
                      common.multipleSide
                    );
                    mergeConnections[invalidOp] = undefined;
                    return combinedEdge;
                  }
                }
              }
            }
          }
        }
      }
      return null;
    }
    function getCombinedId(
      edge1,
      edge2,
      uncommon1,
      uncommon2,
      infoEdge,
      multipleSide
    ) {
      return infoEdge.id;
    }
    function getCombinedInfo(
      edge1,
      edge2,
      uncommon1,
      uncommon2,
      infoEdge,
      multipleSide
    ) {
      infoEdge.info.first = uncommon1;
      infoEdge.info.second = uncommon2;
      return infoEdge.info;
    }
    function checkLessThanTen(check) {
      return check < 10 ? '0' + check : check;
    }
    function hasAnyRelationship(relations) {
      return relations.indexOf('anyRelation') > -1;
    }
    function findParentApplicationService(node) {
      if (node.leftConnections && node.leftConnections.length > 0) {
        for (var i = 0; i < node.leftConnections.length; i++) {
          var left = node.leftConnections[i];
          if (_isApplicationServiceNode(left)) return left;
          if (left.leftConnections.length > 0)
            return findParentApplicationService(left);
        }
      }
      return null;
    }
    return {
      replaceList: _replaceList,
      appendList: _appendList,
      flattenGraph: _flattenGraph,
      flattenLocally: _flattenLocally,
      getCurrentTimeInUserFormat: _getCurrentTimeInUserFormat,
      getCurrentRawTime: _getCurrentRawTime,
      getClassCount: _getClassCount,
      getOperatorCount: _getOperatorCount,
      getQueryType: _getQueryType,
      getQueryDepth: _getQueryDepth,
      getTrueParent: _getTrueParent,
      getTrueChild: _getTrueChild,
      isGeneralQuery: _isGeneralQuery,
      isServiceQuery: _isServiceQuery,
      hasAccessibilityEnabled: _hasAccessibilityEnabled,
      getURLParameter: _getURLParameter,
      updateSavedQueryURLParameter: _updateSavedQueryURLParameter,
      getSuggestedConnections: _getSuggestedConnections,
      focusFilterArea: _focusFilterArea,
      focusNotificationCloseButton: _focusNotificationCloseButton,
      focusFirstElement: _focusFirstElement,
      isApplicationServiceNode: _isApplicationServiceNode,
      isValidPatternSelection: _isValidPatternSelection,
      setIsPattern: _setIsPattern,
    };
  },
]);
