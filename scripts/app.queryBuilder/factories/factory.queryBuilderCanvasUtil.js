/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderCanvasUtil.js */
angular.module('sn.queryBuilder').factory('queryBuilderCanvasUtil', [
  'CONSTQB',
  'i18n',
  function (CONST, i18n) {
    'use strict';
    var droppedClass = false;
    var first_node = null;
    var first_node_side = null;
    var allRelationships = {};
    var allRelationshipTypes = {};
    var draggingItem = null;
    var operatorLines = [];
    var allProperties = {};
    var allChildrenTypes = {};
    var allParentTypes = {};
    var showFilters = false;
    var linking = false;
    var startNode = null;
    var latestTouched = null;
    var exportQuerySysId = null;
    var loadingTableProperties = false;
    function _getDroppedClass() {
      return droppedClass;
    }
    function _setDroppedClass(value) {
      droppedClass = value;
    }
    function _getFirstNode() {
      return first_node;
    }
    function _getFirstNodeSide() {
      return first_node_side;
    }
    function _setFirstNode(node) {
      first_node = node;
    }
    function _setFirstNodeSide(side) {
      first_node_side = side;
    }
    function _getAllRelationships() {
      return allRelationships;
    }
    function _setAllRelationships(relations) {
      allRelationships = relations;
    }
    function _getAllRelationshipTypes() {
      return allRelationshipTypes;
    }
    function _setAllRelationshipTypes(relationTypes) {
      for (var key in relationTypes) {
        relationTypes[key] = relationTypes[key].trim();
      }
      allRelationshipTypes = relationTypes;
    }
    function _getDraggingItem() {
      return draggingItem;
    }
    function _setDraggingItem(item) {
      draggingItem = item;
    }
    function _getOperatorLines() {
      return operatorLines;
    }
    function _setOperatorLines(opLines) {
      operatorLines = opLines;
    }
    function _pushOperatorLines(opLine) {
      operatorLines.push(opLine);
    }
    function _getAllChildrenTypes() {
      return allChildrenTypes;
    }
    function _addChildType(type, children) {
      allChildrenTypes[type] = children;
    }
    function _getAllParentTypes() {
      return allParentTypes;
    }
    function _addParentType(type, parents) {
      allParentTypes[type] = parents;
    }
    function _getAllProperties() {
      return allProperties;
    }
    function _addProperty(type, props) {
      allProperties[type] = props;
    }
    function _getShowFilters() {
      return showFilters;
    }
    function _setShowFilters(value) {
      showFilters = value;
    }
    function _getLinking() {
      return linking;
    }
    function _setLinking(value) {
      linking = value;
    }
    function _getStartNode() {
      return startNode;
    }
    function _setStartNode(value) {
      startNode = value;
    }
    function _getLatestTouched() {
      return latestTouched;
    }
    function _setLatestTouched(value) {
      latestTouched = value;
    }
    function _getExportQuerySysId() {
      return exportQuerySysId;
    }
    function _setExportQuerySysId(sysId) {
      exportQuerySysId = sysId;
    }
    function _isNonCmdbConnection(parent, child) {
      if (
        (parent && parent.nodeType === CONST.OBJECT_TYPES.NON_CMDB) ||
        (child && child.nodeType === CONST.OBJECT_TYPES.NON_CMDB)
      )
        return true;
      return false;
    }
    function _getLoadingTableProperties() {
      return loadingTableProperties;
    }
    function _setLoadingTableProperties(loadingProperties) {
      loadingTableProperties = loadingProperties;
    }
    return {
      getDroppedClass: _getDroppedClass,
      setDroppedClass: _setDroppedClass,
      getFirstNode: _getFirstNode,
      getFirstNodeSide: _getFirstNodeSide,
      setFirstNode: _setFirstNode,
      setFirstNodeSide: _setFirstNodeSide,
      getAllRelationships: _getAllRelationships,
      setAllRelationships: _setAllRelationships,
      getAllRelationshipTypes: _getAllRelationshipTypes,
      setAllRelationshipTypes: _setAllRelationshipTypes,
      getDraggingItem: _getDraggingItem,
      setDraggingItem: _setDraggingItem,
      getOperatorLines: _getOperatorLines,
      setOperatorLines: _setOperatorLines,
      pushOperatorLines: _pushOperatorLines,
      getAllChildrenTypes: _getAllChildrenTypes,
      addChildType: _addChildType,
      getAllParentTypes: _getAllParentTypes,
      addParentType: _addParentType,
      getAllProperties: _getAllProperties,
      addProperty: _addProperty,
      getShowFilters: _getShowFilters,
      setShowFilters: _setShowFilters,
      getLinking: _getLinking,
      setLinking: _setLinking,
      getStartNode: _getStartNode,
      setStartNode: _setStartNode,
      getLatestTouched: _getLatestTouched,
      setLatestTouched: _setLatestTouched,
      getExportQuerySysId: _getExportQuerySysId,
      setExportQuerySysId: _setExportQuerySysId,
      isNonCmdbConnection: _isNonCmdbConnection,
      getLoadingTableProperties: _getLoadingTableProperties,
      setLoadingTableProperties: _setLoadingTableProperties,
    };
  },
]);
