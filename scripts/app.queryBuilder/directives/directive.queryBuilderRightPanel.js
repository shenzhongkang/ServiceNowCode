/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderRightPanel.js */
angular.module('sn.queryBuilder').directive('queryBuilderRightPanel', [
  'CONSTQB',
  '$compile',
  'getTemplateUrl',
  function (CONST, $compile, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_right_panel.xml'),
      controller: [
        '$scope',
        '$rootScope',
        'i18n',
        'queryBuilderValidation',
        'queryBuilderCommon',
        'queryService',
        'queryBuilderCanvasUtil',
        'queryBuilderTreeUtil',
        '$timeout',
        function (
          $scope,
          $rootScope,
          i18n,
          queryBuilderValidation,
          queryBuilderCommon,
          queryService,
          queryBuilderCanvasUtil,
          queryBuilderTreeUtil,
          $timeout
        ) {
          $scope.maxNameLength = window.NOW.max_name_length;
          $scope.views = [];
          $scope.views.push({
            id: 1,
            viewName: i18n.getMessage('queryBuilder.rightTabs.settings'),
          });
          $scope.views.push({
            id: 2,
            viewName: i18n.getMessage('queryBuilder.rightTabs.appliedFilters'),
          });
          $scope.activeView = 1;
          $scope.displayRightPanel = true;
          $scope.rightContainerClosed = false;
          $scope.suggestedRelations = [];
          $scope.relationshipDirection = {
            options: [],
            selected: undefined,
          };
          $scope.childInputField = '';
          $scope.parentInputField = '';
          $scope.relationshipLevelsInputField = '';
          $scope.nonCmdbOptionInputField = '';
          $scope.relationshipLevels = {
            options: [
              {
                value: 1,
                name: i18n.getMessage('queryBuilder.relationshipLevels.first'),
              },
              {
                value: 2,
                name: i18n.getMessage('queryBuilder.relationshipLevels.second'),
              },
            ],
            selected: undefined,
          };
          $scope.nonCmdbOptions = {
            options: [],
            selected: undefined,
          };
          var defaultNonCmdbOption = {
            column_label: i18n.getMessage(
              'queryBuilder.rightPanelDropdown.selectCiReferences'
            ),
            column_name: null,
            cmdb_class_name: null,
          };
          var showDropdown = false;
          queryService.getRelationsTypes().then(
            function (relationTypes) {
              queryBuilderCanvasUtil.setAllRelationshipTypes(relationTypes);
            },
            function () {
              snNotification
                .show(
                  'error',
                  i18n.getMessage(
                    'queryBuilder.notifications.loadAllRelationsProblem'
                  ),
                  CONST.NOTIFICATION_TIME
                )
                .then(function (notificationElement) {
                  queryBuilderCommon.focusNotificationCloseButton(
                    notificationElement
                  );
                });
            }
          );
          $scope.suggestedReferences = [];
          $scope.changeActive = function (view, focusElement) {
            $scope.activeView = view;
            if (focusElement) {
              var tab = angular.element(
                '#queryBuilder-right-panel-tab-' + view
              );
              tab.focus();
            }
          };
          $scope.stylesForRightContainer = function () {
            var w = CONST.SIDE_PANEL_WIDTH;
            var widthInPx = w < 0 ? '0px' : w + 'px';
            var rightPanel = angular.element('.right-panel-nav');
            if (rightPanel && rightPanel[0]) {
              var rightPanelWidth = rightPanel[0].clientWidth;
              return {
                'max-width': widthInPx,
                right: $scope.rightContainerClosed
                  ? CONST.SIDE_PANEL_TOGGLE_WIDTH - rightPanelWidth + 'px'
                  : '0px',
              };
            }
            return {};
          };
          $scope.stylesForRightContainerContent = function () {
            var w = $scope.rightContainerClosed
              ? 0
              : CONST.SIDE_PANEL_WIDTH - CONST.SIDE_PANEL_TOGGLE_WIDTH;
            var widthInPx = w < 0 ? '0px' : w + 'px';
            return {
              'max-width': widthInPx,
              right: $scope.rightContainerClosed
                ? '-' +
                  (CONST.SIDE_PANEL_WIDTH - CONST.SIDE_PANEL_TOGGLE_WIDTH) +
                  'px'
                : '0px',
            };
          };
          $scope.isGeneralQuery = function () {
            return queryBuilderCommon.isGeneralQuery($scope.currentQuery);
          };
          $scope.isServiceQuery = function () {
            return queryBuilderCommon.isServiceQuery($scope.currentQuery);
          };
          $scope.isNodeType = function () {
            return queryBuilderValidation.isNodeType(
              queryBuilderCanvasUtil.getLatestTouched()
            );
          };
          $scope.isConnectionType = function () {
            return queryBuilderValidation.isConnectionType(
              queryBuilderCanvasUtil.getLatestTouched()
            );
          };
          $scope.deleteSpecificConnection = function (connection) {
            if (
              queryBuilderCommon.getTrueParent(connection.first) &&
              queryBuilderCommon.getTrueParent(connection.first).isPattern
            ) {
              for (
                var i = 0;
                i < connection.first.rightConnections.length;
                i++
              ) {
                fixRightConnections(
                  connection.first.rightConnections[i],
                  false
                );
              }
            }
            $rootScope.$broadcast('queryBuilder.deleteSpecificConnection', {
              conn: connection,
            });
          };
          $scope.getSuggestedRelations = function (parent, child) {
            return getSuggestedRelations(parent, child);
          };
          $scope.getSuggestedReferences = function (parent, child) {
            return getSuggestedReferences(parent, child);
          };
          $scope.isCmdbConnection = function () {
            if (
              $scope.isGeneralQuery() &&
              $scope.isConnectionType() &&
              !$scope.isPatternConnection()
            ) {
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              var parent = queryBuilderCommon.getTrueParent(
                latestTouched.first
              );
              var child = queryBuilderCommon.getTrueChild(latestTouched.second);
              if (
                parent.nodeType !== CONST.OBJECT_TYPES.NON_CMDB &&
                child.nodeType !== CONST.OBJECT_TYPES.NON_CMDB
              )
                return true;
            }
            return false;
          };
          $scope.isNonCmdbConnection = function () {
            if ($scope.isGeneralQuery() && $scope.isConnectionType()) {
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              var parent = queryBuilderCommon.getTrueParent(
                latestTouched.first
              );
              var child = queryBuilderCommon.getTrueChild(latestTouched.second);
              return queryBuilderCanvasUtil.isNonCmdbConnection(parent, child);
            }
            return false;
          };
          $scope.isPatternConnection = function () {
            if ($scope.isGeneralQuery() && $scope.isConnectionType()) {
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              var parent = queryBuilderCommon.getTrueParent(
                latestTouched.first
              );
              var child = queryBuilderCommon.getTrueChild(latestTouched.second);
              if (
                (parent.isPattern ||
                  (child.isPattern &&
                    !queryBuilderCommon.isApplicationServiceNode(child))) &&
                child.nodeType !== CONST.OBJECT_TYPES.NON_CMDB
              )
                return true;
            }
            return false;
          };
          $scope.isFirstPatternConnection = function () {
            if (
              $scope.isGeneralQuery() &&
              $scope.isConnectionType() &&
              $scope.isPatternConnection()
            ) {
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              var parent = queryBuilderCommon.getTrueParent(
                latestTouched.first
              );
              if (queryBuilderCommon.isApplicationServiceNode(parent))
                return true;
            }
            return false;
          };
          $scope.shouldShowFilterCards = function () {
            if ($scope.currentFilters && $scope.currentFilters.length === 0)
              return false;
            else if ($scope.currentFilters && $scope.currentFilters.length > 0)
              return true;
          };
          $scope.displayRelationOptions = function (event, data) {
            event.stopPropagation();
            var context = data.context;
            var isReverse = data.isReverse;
            if (showDropdown) removeRightPanelDropdown();
            else {
              insertRightPanelDropdown(event.currentTarget, context);
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              if (
                latestTouched &&
                queryBuilderValidation.isConnectionType(latestTouched)
              ) {
                var parent = latestTouched.first;
                var child = latestTouched.second;
                if (parent.nodeType === CONST.NODETYPE.OPERATOR)
                  parent = queryBuilderCommon.getTrueParent(parent);
                if (child.nodeType === CONST.NODETYPE.OPERATOR)
                  child = queryBuilderCommon.getTrueChild(child);
                if (isReverse)
                  $scope.suggestedRelations = getSuggestedRelations(
                    child,
                    parent
                  );
                else if (!isReverse)
                  $scope.suggestedRelations = getSuggestedRelations(
                    parent,
                    child
                  );
                $rootScope.$broadcast('queryBuilder.display_relations', {
                  relations: $scope.suggestedRelations,
                  latest: latestTouched,
                  event: event,
                  context: context,
                  isReverse: isReverse,
                });
              }
            }
          };
          $scope.displayReferenceOptions = function (event, data) {
            event.stopPropagation();
            var context = data.context;
            var isReverse = data.isReverse;
            if (showDropdown) removeRightPanelDropdown();
            else {
              insertRightPanelDropdown(event.currentTarget, context);
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              if (
                latestTouched &&
                queryBuilderValidation.isConnectionType(latestTouched)
              ) {
                var parent = latestTouched.first;
                var child = latestTouched.second;
                if (parent.nodeType === CONST.NODETYPE.OPERATOR)
                  parent = queryBuilderCommon.getTrueParent(parent);
                if (child.nodeType === CONST.NODETYPE.OPERATOR)
                  child = queryBuilderCommon.getTrueChild(child);
                if (isReverse)
                  $scope.suggestedReferences = getSuggestedReferences(
                    child,
                    parent
                  );
                else if (!isReverse)
                  $scope.suggestedReferences = getSuggestedReferences(
                    parent,
                    child
                  );
                $rootScope.$broadcast('queryBuilder.display_references', {
                  references: $scope.suggestedReferences,
                  latest: latestTouched,
                  event: event,
                  context: context,
                  isReverse: isReverse,
                });
              }
            }
          };
          $scope.displayClassProperties = function (event) {
            event.stopPropagation();
            if (showDropdown) removeRightPanelDropdown();
            else {
              insertRightPanelDropdown(event.currentTarget);
              var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
              $rootScope.$broadcast('queryBuilder.display_properties', {
                properties: getProperties(latestTouched),
                latest: latestTouched,
                event: event,
              });
            }
          };
          $scope.displayServicesProperties = function (event) {
            event.stopPropagation();
            if (showDropdown) removeRightPanelDropdown();
            else {
              insertRightPanelDropdown(event.currentTarget);
              $rootScope.$broadcast('queryBuilder.display_properties', {
                properties: getProperties({
                  type: CONST.BASE_SERVICE_CLASS,
                }),
                latest: $scope.currentQuery.query,
                event: event,
                isService: true,
              });
            }
          };
          $scope.getStylesForReadOnlyAttributeSection = function () {
            if (!$scope.canWrite) {
              return {
                height: '100%',
                top: '0px',
              };
            }
            return {};
          };
          $scope.nonCmdbRelationshipRequiredClass = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            return {
              'non-cmdb-relation-complete':
                $scope.isNonCmdbConnection() &&
                latestTouched.selectedNonCmdbReference.column_name != null,
            };
          };
          function insertRightPanelDropdown(target, context) {
            var compiledDropdown = '';
            if (context === 'dialogBox') {
              compiledDropdown = $compile(
                '<right-panel-dropdown class="dialogBox"></right-panel-dropdown>'
              );
            } else {
              compiledDropdown = $compile(
                '<right-panel-dropdown class="rightPanel"></right-panel-dropdown>'
              );
            }
            var dropDown = compiledDropdown($scope);
            dropDown.insertAfter(target);
            showDropdown = true;
          }
          function removeRightPanelDropdown() {
            if (showDropdown) {
              var dropDown =
                angular.element(document).find('.rightPanel')[0] ||
                angular.element(document).find('.dialogBox')[0];
              dropDown.remove();
              $rootScope.$broadcast(
                'queryBuilder.clear_right_dropdown_properties'
              );
              showDropdown = false;
            }
          }
          $rootScope.$on(
            'queryBuilder.hide_right_dropdown',
            removeRightPanelDropdown
          );
          $scope.hasReference = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (queryBuilderValidation.isConnectionType(latestTouched)) {
              if (latestTouched.reference && latestTouched.reference.label)
                return true;
              else return false;
            }
          };
          $scope.removeRelation = function (relation) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (queryBuilderValidation.isConnectionType(latestTouched)) {
              var index = latestTouched.relations.indexOf(relation);
              if (index > -1) {
                latestTouched.relations.splice(index, 1);
                if (
                  latestTouched.relations.length === 0 &&
                  !latestTouched.noRelations &&
                  latestTouched.reference.length === 0
                )
                  latestTouched.isValid = false;
              }
            }
          };
          $scope.removeReference = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (queryBuilderValidation.isConnectionType(latestTouched))
              latestTouched.reference = {};
          };
          $scope.removeProperty = function (property) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (queryBuilderValidation.isNodeType(latestTouched)) {
              var index = latestTouched.returnValues.indexOf(property);
              if (index > -1) latestTouched.returnValues.splice(index, 1);
            } else if (
              !queryBuilderCommon.isGeneralQuery($scope.currentQuery)
            ) {
              var index =
                $scope.currentQuery.query.returnValues.indexOf(property);
              if (index > -1)
                $scope.currentQuery.query.returnValues.splice(index, 1);
            }
          };
          $scope.displayAddRelationsSection = function (data) {
            var context = data.context;
            var isReverse = data.isReverse;
            var suggestedLength = 0;
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched) &&
              !$scope.isPatternConnection()
            ) {
              if (
                latestTouched.relationshipLevels &&
                latestTouched.relationshipLevels > 1
              )
                return false;
              var parent = latestTouched.first;
              var child = latestTouched.second;
              if (parent.nodeType === CONST.NODETYPE.OPERATOR)
                parent = queryBuilderCommon.getTrueParent(parent);
              if (child.nodeType === CONST.NODETYPE.OPERATOR)
                child = queryBuilderCommon.getTrueChild(child);
              if (isReverse)
                suggestedLength = getSuggestedRelations(child, parent).length;
              else if (!isReverse)
                suggestedLength = getSuggestedRelations(parent, child).length;
              if (
                queryBuilderValidation.isConnectionType(latestTouched) &&
                queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
                !hasSavedServiceConn() &&
                (($scope.canWrite && suggestedLength > 0) || !$scope.canWrite)
              ) {
                if (
                  !latestTouched.reference.label &&
                  !latestTouched.noRelations
                )
                  return true;
                else return false;
              }
            }
            return false;
          };
          $scope.displayNoRelationsSection = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              queryBuilderValidation.isConnectionType(latestTouched) &&
              queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
              !hasSavedServiceConn() &&
              latestTouched.relationshipLevels === 1 &&
              !$scope.isPatternConnection()
            ) {
              if (
                latestTouched.relations.length === 0 &&
                !latestTouched.reference.label
              )
                return true;
              else return false;
            }
            return false;
          };
          $scope.displayAddReferencesSection = function (data) {
            var context = data.context;
            var isReverse = data.isReverse;
            var suggestedLength = 0;
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched) &&
              !$scope.isPatternConnection()
            ) {
              var parent = latestTouched.first;
              var child = latestTouched.second;
              if (parent.nodeType === CONST.NODETYPE.OPERATOR)
                parent = queryBuilderCommon.getTrueParent(parent);
              if (child.nodeType === CONST.NODETYPE.OPERATOR)
                child = queryBuilderCommon.getTrueChild(child);
              if (isReverse)
                suggestedLength = getSuggestedReferences(child, parent).length;
              else if (!isReverse)
                suggestedLength = getSuggestedReferences(parent, child).length;
              if (
                queryBuilderValidation.isConnectionType(latestTouched) &&
                queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
                !hasSavedServiceConn() &&
                (($scope.canWrite && suggestedLength > 0) ||
                  !$scope.canWrite) &&
                latestTouched.relationshipLevels === 1
              ) {
                if (
                  latestTouched.relations.length === 0 &&
                  !latestTouched.noRelations
                )
                  return true;
                else return false;
              }
            }
            return false;
          };
          $scope.displayBelongsSection = function () {
            if (
              queryBuilderValidation.isConnectionType(
                queryBuilderCanvasUtil.getLatestTouched()
              ) &&
              queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
              hasSavedServiceConn()
            )
              return true;
            return false;
          };
          $scope.displayParentChild = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            var conn = latestTouched;
            if (
              queryBuilderValidation.isConnectionType(latestTouched) &&
              queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
              !hasSavedServiceConn() &&
              !$scope.isPatternConnection()
            ) {
              var hasRelations = conn.relations.length > 0 ? true : false;
              var noRelationsChecked = conn.noRelations;
              var hasReference = conn.reference.label ? true : false;
              if (
                (hasRelations || noRelationsChecked || hasReference) &&
                !conn.isReverse
              )
                return true;
              else if (
                !hasRelations &&
                !noRelationsChecked &&
                !hasReference &&
                !conn.isReverse
              )
                return true;
            }
            return false;
          };
          $scope.displayChildParent = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            var conn = latestTouched;
            if (
              queryBuilderValidation.isConnectionType(latestTouched) &&
              queryBuilderCommon.isGeneralQuery($scope.currentQuery) &&
              !hasSavedServiceConn() &&
              !$scope.isPatternConnection()
            ) {
              var hasRelations = conn.relations.length > 0 ? true : false;
              var noRelationsChecked = conn.noRelations;
              var hasReference = conn.reference.label ? true : false;
              if (
                (hasRelations || noRelationsChecked || hasReference) &&
                conn.isReverse
              )
                return true;
              else if (
                !hasRelations &&
                !noRelationsChecked &&
                !hasReference &&
                conn.isReverse
              )
                return true;
            }
            return false;
          };
          $scope.showFilterHeaderIcon = function () {
            return (
              queryBuilderCommon.isServiceQuery($scope.currentQuery) &&
              $scope.canWrite
            );
          };
          $scope.showPropertyHeaderIcon = function () {
            return (
              queryBuilderCommon.isServiceQuery($scope.currentQuery) &&
              !queryBuilderCanvasUtil.getLatestTouched()
            );
          };
          $scope.showQueryProperties = function () {
            return showQueryProperties();
          };
          $scope.showEntryPoint = function (node) {
            if (node && node.canBeEntryPoint) {
              if (
                $scope.currentQuery &&
                $scope.currentQuery.hasEntryPoint &&
                $scope.entryPoint &&
                ($scope.entryPoint === node ||
                  $scope.entryPoint.entryPoint === false)
              )
                return true;
              else if (
                $scope.currentQuery &&
                !$scope.currentQuery.hasEntryPoint &&
                !$scope.entryPoint
              )
                return true;
            }
            return false;
          };
          $scope.appFlowChanged = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched)
            ) {
              latestTouched.isNot = false;
            }
          };
          $scope.notAppFlowChanged = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched)
            ) {
              latestTouched.isNot = true;
            }
          };
          $scope.entryPointChanged = function (node) {
            if (node.entryPoint === true) $scope.entryPoint = node;
          };
          $scope.toggleProperty = function (property) {
            $scope.$broadcast('property_selected', {
              node: queryBuilderCanvasUtil.getLatestTouched(),
              property: property.label,
            });
          };
          $scope.rightPanelBodyClicked = function () {
            $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
            $rootScope.$broadcast('queryBuilder.closeInfoBox');
          };
          $scope.getLatestTouched = function () {
            return queryBuilderCanvasUtil.getLatestTouched();
          };
          function showQueryProperties() {
            if (
              !queryBuilderCanvasUtil.getLatestTouched() &&
              !$scope.showServiceProps
            )
              return true;
            return false;
          }
          function getProperties(classes) {
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            if (allProperties && allProperties[classes.type]) {
              var properties = [];
              for (var i = 0; i < allProperties[classes.type].length; i++) {
                properties.push({
                  label: allProperties[classes.type][i].label,
                  element: allProperties[classes.type][i].element,
                });
              }
              return properties;
            }
            return null;
          }
          function hasSavedServiceConn() {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (queryBuilderValidation.isConnectionType(latestTouched)) {
              if (latestTouched) {
                var first = latestTouched.first;
                var second = latestTouched.second;
                if (
                  (first && first.nodeType === CONST.NODETYPE.SERVICE) ||
                  (second && second.nodeType === CONST.NODETYPE.SERVICE)
                )
                  return true;
                else if (first && first.nodeType === CONST.NODETYPE.OPERATOR) {
                  first = queryBuilderCommon.getTrueParent(first);
                  if (first && first.nodeType === CONST.NODETYPE.SERVICE)
                    return true;
                } else if (
                  second &&
                  second.nodeType === CONST.NODETYPE.OPERATOR
                ) {
                  second = queryBuilderCommon.getTrueChild(second);
                  if (second && second.nodeType === CONST.NODETYPE.SERVICE)
                    return true;
                }
              }
            }
            return false;
          }
          function getSuggestedRelations(parent, child) {
            var relations = [];
            var matchedRelations = {};
            var allParents = [];
            var allChildren = [];
            var fromNode = parent;
            var toNode = child;
            var fromType = fromNode.type;
            var toType = toNode.type;
            if (parent.nodeType === CONST.NODETYPE.OPERATOR) {
              fromNode = queryBuilderCommon.getTrueParent(parent);
              fromType = fromNode.type;
            }
            if (child.nodeType === CONST.NODETYPE.OPERATOR) {
              toNode = queryBuilderCommon.getTrueChild(child);
              toType = toNode.type;
            }
            var allChildrenTypes = queryBuilderCanvasUtil.getAllChildrenTypes();
            if (allChildrenTypes[fromType] && allChildrenTypes[fromType].length)
              allParents = angular.copy(allChildrenTypes[fromType]);
            allParents.unshift(fromType);
            if (allChildrenTypes[toType] && allChildrenTypes[toType].length)
              allChildren = angular.copy(allChildrenTypes[toType]);
            allChildren.unshift(toType);
            for (var i = 0; i < allParents.length; i++) {
              var parentType = allParents[i];
              var suggestedRelationships =
                queryBuilderCanvasUtil.getAllRelationships();
              if (suggestedRelationships[parentType]) {
                for (var j = 0; j < allChildren.length; j++) {
                  var childType = allChildren[j];
                  if (suggestedRelationships[parentType][childType]) {
                    var possibleRelationships =
                      suggestedRelationships[parentType][childType];
                    for (var k = 0; k < possibleRelationships.length; k++) {
                      var sys_id = possibleRelationships[k];
                      var allRelationships =
                        queryBuilderCanvasUtil.getAllRelationshipTypes();
                      var label = allRelationships[sys_id];
                      if (matchedRelations[sys_id] === undefined)
                        matchedRelations[sys_id] = label;
                    }
                  }
                }
              }
            }
            for (var rels in matchedRelations) {
              if (matchedRelations.hasOwnProperty(rels))
                relations.push({
                  label: matchedRelations[rels],
                  sys_id: rels,
                });
            }
            if (relations.length > 0) {
              relations.unshift({
                label:
                  '   ' + i18n.getMessage('queryBuilder.anyRelationshipType'),
                sys_id: 'anyRelation',
              });
            }
            return relations;
          }
          function getSuggestedReferences(parent, child) {
            var references = [];
            var fromNode = parent;
            var toNode = child;
            var fromType = fromNode.type;
            var toType = toNode.type;
            if (parent.nodeType === CONST.NODETYPE.OPERATOR) {
              fromNode = queryBuilderCommon.getTrueParent(parent);
              fromType = fromNode.type;
            }
            if (child.nodeType === CONST.NODETYPE.OPERATOR) {
              toNode = queryBuilderCommon.getTrueChild(child);
              toType = toNode.type;
            }
            var allProperties = queryBuilderCanvasUtil.getAllProperties();
            var parentProperties = allProperties[fromType];
            if (parentProperties) {
              for (var i = 0; i < parentProperties.length; i++) {
                if (parentProperties[i].type === 'reference')
                  if (parentProperties[i].reference === toType)
                    references.push(parentProperties[i]);
              }
              var allParentTypes = queryBuilderCanvasUtil.getAllParentTypes();
              if (allParentTypes[toType] && allParentTypes[toType].length > 0) {
                for (var i = 0; i < parentProperties.length; i++) {
                  if (parentProperties[i].type === 'reference') {
                    for (var j = 0; j < allParentTypes[toType].length; j++) {
                      if (
                        parentProperties[i].reference ===
                        allParentTypes[toType][j].data.ci_type
                      ) {
                        if (references.indexOf(parentProperties[i]) === -1)
                          references.push(parentProperties[i]);
                      }
                    }
                  }
                }
              }
            }
            return references;
          }
          $scope.$on(
            'queryBuilder.update_right_panel_items',
            function (event, data) {
              var parent = data.connection.first;
              var child = data.connection.second;
              if (parent.nodeType === CONST.NODETYPE.OPERATOR)
                parent = queryBuilderCommon.getTrueParent(parent);
              if (child.nodeType === CONST.NODETYPE.OPERATOR)
                child = queryBuilderCommon.getTrueChild(child);
              $scope.relationshipDirection.options = [];
              $scope.relationshipDirection.options.push(parent);
              $scope.relationshipDirection.options.push(child);
              if (!data.connection.isReverse) {
                $scope.relationshipDirection.selected =
                  $scope.relationshipDirection.options[0];
                $scope.childInputField =
                  $scope.relationshipDirection.options[1].name;
                $scope.parentInputField =
                  $scope.relationshipDirection.options[0].name;
              } else {
                $scope.relationshipDirection.selected =
                  $scope.relationshipDirection.options[1];
                $scope.childInputField =
                  $scope.relationshipDirection.options[0].name;
                $scope.parentInputField =
                  $scope.relationshipDirection.options[1].name;
              }
              if (!angular.isDefined(data.connection.relationshipLevels)) {
                data.connection.relationshipLevels =
                  $scope.relationshipLevels.options[0].value;
                $scope.relationshipLevels.selected =
                  $scope.relationshipLevels.options[0];
                $scope.relationshipLevelsInputField = i18n.getMessage(
                  'queryBuilder.relationshipLevels.first'
                );
              } else {
                for (
                  var i = 0;
                  i < $scope.relationshipLevels.options.length;
                  i++
                ) {
                  if (
                    $scope.relationshipLevels.options[i].value ===
                    data.connection.relationshipLevels
                  ) {
                    $scope.relationshipLevels.selected =
                      $scope.relationshipLevels.options[i];
                    break;
                  }
                }
                if (data.connection.relationshipLevels === 1) {
                  $scope.relationshipLevelsInputField = i18n.getMessage(
                    'queryBuilder.relationshipLevels.first'
                  );
                } else if (data.connection.relationshipLevels === 2) {
                  $scope.relationshipLevelsInputField = i18n.getMessage(
                    'queryBuilder.relationshipLevels.second'
                  );
                }
              }
              if ($scope.isNonCmdbConnection()) {
                $scope.nonCmdbOptions.options = [];
                $scope.nonCmdbOptions.options.push(
                  angular.copy(defaultNonCmdbOption)
                );
                var allChildrenTypes =
                  queryBuilderCanvasUtil.getAllChildrenTypes();
                if (parent.nodeType === CONST.OBJECT_TYPES.NON_CMDB) {
                  for (var i = 0; i < parent.referenceColumns.length; i++) {
                    var classType = parent.referenceColumns[i].cmdb_class_name;
                    var allChildren = allChildrenTypes[classType];
                    if (!angular.isDefined(allChildren)) {
                      if (
                        queryBuilderTreeUtil.getCurrentTreeType() ===
                        CONST.OBJECT_TYPES.NON_CMDB
                      ) {
                        allChildren = queryBuilderTreeUtil.findChildren(
                          classType,
                          queryBuilderTreeUtil.getSpecificTree('cmdb')
                        );
                        queryBuilderCanvasUtil.addChildType(
                          classType,
                          allChildren
                        );
                      } else {
                        allChildren = queryBuilderTreeUtil.findChildren(
                          classType,
                          queryBuilderTreeUtil.getCurrentTree()
                        );
                        queryBuilderCanvasUtil.addChildType(
                          classType,
                          allChildren
                        );
                      }
                    }
                    if (
                      allChildren.indexOf(child.type) > -1 ||
                      child.type === classType
                    )
                      $scope.nonCmdbOptions.options.push(
                        angular.copy(parent.referenceColumns[i])
                      );
                  }
                } else if (child.nodeType === CONST.OBJECT_TYPES.NON_CMDB) {
                  for (var i = 0; i < child.referenceColumns.length; i++) {
                    var classType = child.referenceColumns[i].cmdb_class_name;
                    var allChildren = allChildrenTypes[classType];
                    if (!angular.isDefined(allChildren)) {
                      if (
                        queryBuilderTreeUtil.getCurrentTreeType() ===
                        CONST.OBJECT_TYPES.NON_CMDB
                      ) {
                        allChildren = queryBuilderTreeUtil.findChildren(
                          classType,
                          queryBuilderTreeUtil.getSpecificTree('cmdb')
                        );
                        queryBuilderCanvasUtil.addChildType(
                          classType,
                          allChildren
                        );
                      } else {
                        allChildren = queryBuilderTreeUtil.findChildren(
                          classType,
                          queryBuilderTreeUtil.getCurrentTree()
                        );
                        queryBuilderCanvasUtil.addChildType(
                          classType,
                          allChildren
                        );
                      }
                    }
                    if (
                      allChildren.indexOf(parent.type) > -1 ||
                      parent.type === classType
                    )
                      $scope.nonCmdbOptions.options.push(
                        angular.copy(child.referenceColumns[i])
                      );
                  }
                }
                if (
                  !angular.isDefined(data.connection.selectedNonCmdbReference)
                ) {
                  data.connection.selectedNonCmdbReference =
                    $scope.nonCmdbOptions.options[0];
                  if ($scope.nonCmdbOptions.options.length === 2) {
                    data.connection.selectedNonCmdbReference =
                      $scope.nonCmdbOptions.options[1];
                    $scope.nonCmdbOptions.selected =
                      $scope.nonCmdbOptions.options[1];
                  }
                } else if (
                  angular.isDefined(data.connection.selectedNonCmdbReference)
                ) {
                  var found = -1;
                  for (
                    var i = 0;
                    i < $scope.nonCmdbOptions.options.length;
                    i++
                  ) {
                    var option = $scope.nonCmdbOptions.options[i];
                    if (
                      option.cmdb_class_name ===
                        data.connection.selectedNonCmdbReference
                          .cmdb_class_name &&
                      option.column_name ===
                        data.connection.selectedNonCmdbReference.column_name
                    ) {
                      found = i;
                      break;
                    }
                  }
                  if (found > -1) {
                    $scope.nonCmdbOptions.selected =
                      $scope.nonCmdbOptions.options[found];
                  }
                }
              }
            }
          );
          $scope.patternChanged = function (node) {
            if (node) {
              if (node.isPattern)
                $rootScope.$broadcast('queryBuilder.resetTree');
              else if ($scope.showSuggestedConnections)
                $rootScope.$broadcast(
                  'queryBuilder.suggestedConnectionsChanged',
                  {
                    showSuggestedConnections: $scope.showSuggestedConnections,
                  }
                );
              if (node.rightConnections && node.rightConnections.length > 0)
                queryBuilderCommon.setIsPattern(
                  node,
                  angular.isDefined(node.isPattern) ? node.isPattern : false
                );
            }
            fixRightConnections(node, node.isPattern);
          };
          function fixRightConnections(node, isPattern) {
            var removeConnections = [];
            if (
              node &&
              node.rightConnections &&
              node.rightConnections.length > 0 &&
              !isPattern
            ) {
              for (var i = 0; i < node.rightConnections.length; i++) {
                if (
                  node.rightConnections[i].nodeType ===
                  CONST.OBJECT_TYPES.NON_CMDB
                ) {
                  var right = node.rightConnections[i];
                  for (var j = 0; j < $scope.connections.length; j++) {
                    var connection = $scope.connections[j].info;
                    if (
                      connection.first === node &&
                      connection.second === right
                    ) {
                      if (!angular.isDefined(connection.relations))
                        connection.relations = [];
                      if (!angular.isDefined(connection.noRelations))
                        connection.noRelations = false;
                      if (!angular.isDefined(connection.reference))
                        connection.reference = {};
                      delete connection.applyToAllNodes;
                      delete node.refFilterApplied;
                      delete connection.type;
                    }
                  }
                }
                if (
                  node.rightConnections[i].nodeType === CONST.NODETYPE.OPERATOR
                ) {
                  var rightOperator = node.rightConnections[i].rightConnections;
                  for (var j = 0; j < rightOperator.length; j++) {
                    for (var k = 0; k < $scope.connections.length; k++) {
                      var connection = $scope.connections[k].info;
                      if (
                        connection.first === node.rightConnections[i] &&
                        connection.second === rightOperator[j]
                      ) {
                        if (!angular.isDefined(connection.relations))
                          connection.relations = [];
                        if (!angular.isDefined(connection.noRelations))
                          connection.noRelations = false;
                        if (!angular.isDefined(connection.reference))
                          connection.reference = {};
                        delete connection.applyToAllNodes;
                        delete node.refFilterApplied;
                        delete connection.type;
                      }
                    }
                  }
                }
                if (
                  node.rightConnections[i].nodeType !==
                    CONST.NODETYPE.OPERATOR &&
                  node.rightConnections[i].nodeType !==
                    CONST.OBJECT_TYPES.NON_CMDB
                ) {
                  var right = node.rightConnections[i];
                  for (var j = 0; j < $scope.connections.length; j++) {
                    var connection = $scope.connections[j].info;
                    if (
                      connection.first === node &&
                      connection.second === right
                    ) {
                      if (!angular.isDefined(connection.relations))
                        connection.relations = [];
                      if (!angular.isDefined(connection.noRelations))
                        connection.noRelations = false;
                      if (!angular.isDefined(connection.reference))
                        connection.reference = {};
                      delete connection.applyToAllNodes;
                      delete node.refFilterApplied;
                      delete connection.type;
                    }
                  }
                }
                fixRightConnections(node.rightConnections[i], isPattern);
              }
            } else if (
              node &&
              node.rightConnections &&
              node.rightConnections.length > 0 &&
              isPattern
            ) {
              for (var i = 0; i < node.rightConnections.length; i++) {
                if (
                  node.rightConnections[i].nodeType !==
                    CONST.OBJECT_TYPES.NON_CMDB &&
                  node.rightConnections[i].nodeType !== CONST.NODETYPE.OPERATOR
                ) {
                  var right = node.rightConnections[i];
                  for (var j = 0; j < $scope.connections.length; j++) {
                    var connection = $scope.connections[j].info;
                    if (
                      connection.first === node &&
                      connection.second === right
                    ) {
                      if (
                        right &&
                        right.nodeType &&
                        right.nodeType === CONST.NODETYPE.SERVICE
                      ) {
                        if (removeConnections.indexOf(j) === -1)
                          removeConnections.push(j);
                      }
                      if (!angular.isDefined(connection.appFlow))
                        connection.appFlow = true;
                      if (!angular.isDefined(connection.notAppFlow))
                        connection.notAppFlow = false;
                      if (!angular.isDefined(connection.reverseAppFlow))
                        connection.reverseAppFlow = false;
                      if (!angular.isDefined(connection.notReverseAppFlow))
                        connection.notReverseAppFlow = false;
                      if (!angular.isDefined(connection.isNot))
                        connection.isNot = false;
                      connection.type = CONST.EDGE_TYPES.APP_FLOW;
                      connection.reference = {};
                      connection.relations = [];
                      connection.noRelations = false;
                      connection.relationshipLevels = 1;
                    }
                  }
                }
                if (
                  node.rightConnections[i].nodeType === CONST.NODETYPE.OPERATOR
                ) {
                  var rightOperator = node.rightConnections[i].rightConnections;
                  for (var j = 0; j < rightOperator.length; j++) {
                    for (var k = 0; k < $scope.connections.length; k++) {
                      var connection = $scope.connections[k].info;
                      if (
                        connection.first === node.rightConnections[i] &&
                        connection.second === rightOperator[j]
                      ) {
                        if (
                          rightOperator[j] &&
                          rightOperator[j].nodeType &&
                          rightOperator[j].nodeType === CONST.NODETYPE.SERVICE
                        ) {
                          if (removeConnections.indexOf(k) === -1)
                            removeConnections.push(k);
                        }
                        if (!angular.isDefined(connection.appFlow))
                          connection.appFlow = true;
                        if (!angular.isDefined(connection.notAppFlow))
                          connection.notAppFlow = false;
                        if (!angular.isDefined(connection.reverseAppFlow))
                          connection.reverseAppFlow = false;
                        if (!angular.isDefined(connection.notReverseAppFlow))
                          connection.notReverseAppFlow = false;
                        if (!angular.isDefined(connection.isNot))
                          connection.isNot = false;
                        connection.type = CONST.EDGE_TYPES.APP_FLOW;
                        connection.reference = {};
                        connection.relations = [];
                        connection.noRelations = false;
                        connection.relationshipLevels = 1;
                      }
                    }
                  }
                }
                if (removeConnections.length > 0) {
                  for (var j = 0; j < removeConnections.length; j++) {
                    $scope.deleteSpecificConnection(
                      $scope.connections[removeConnections[j]].info
                    );
                  }
                }
                fixRightConnections(node.rightConnections[i], isPattern);
              }
            }
          }
          $scope.applyToAllNodesChanged = function () {
            $rootScope.$broadcast('calculate_center');
            $rootScope.$broadcast('calculate_path_center');
            $timeout(function () {
              for (var i = 0; i < $scope.connections.length; i++) {
                $rootScope.$broadcast('queryBuilder.updateLine', {
                  conn: $scope.connections[i],
                });
              }
            });
          };
          $scope.isApplicationServiceNode = function (node) {
            return (
              queryBuilderCommon.isApplicationServiceNode(node) &&
              $scope.isGeneralQuery()
            );
          };
          $scope.showApplyToAllNodes = function (connection) {
            if (connection) {
              var first = queryBuilderCommon.getTrueParent(connection.first);
              if (
                first &&
                first.isPattern &&
                queryBuilderCommon.isApplicationServiceNode(first)
              )
                return true;
            }
            return false;
          };
          $scope.getApplyToAllNodesText = function (connection) {
            if (
              $scope.showApplyToAllNodes(connection) &&
              connection.second &&
              connection.second.name
            )
              return i18n.format(
                i18n.getMessage('queryBuilder.rightPanel.applyToAllNodes'),
                [connection.second.name]
              );
            return '';
          };
          $scope.relationshipDirectionOptionChanged = function (option) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched)
            ) {
              var parent = latestTouched.first;
              var child = latestTouched.second;
              if (parent.nodeType === CONST.NODETYPE.OPERATOR)
                parent = queryBuilderCommon.getTrueParent(parent);
              if (child.nodeType === CONST.NODETYPE.OPERATOR)
                child = queryBuilderCommon.getTrueChild(child);
              if (!latestTouched.isReverse && option === child) {
                latestTouched.isReverse = true;
                $scope.childInputField =
                  $scope.relationshipDirection.options[0].name;
                $scope.parentInputField =
                  $scope.relationshipDirection.options[1].name;
                latestTouched.relations = [];
                latestTouched.reference = '';
              } else if (latestTouched.isReverse && option === parent) {
                latestTouched.isReverse = false;
                $scope.childInputField =
                  $scope.relationshipDirection.options[1].name;
                $scope.parentInputField =
                  $scope.relationshipDirection.options[0].name;
                latestTouched.relations = [];
                latestTouched.reference = '';
              }
            }
          };
          $scope.relationshipLevelsChanged = function (option) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched)
            ) {
              latestTouched.relationshipLevels = option.value;
              if (latestTouched.relationshipLevels === 1) {
                latestTouched.isMultiLevel = false;
                $scope.relationshipLevelsInputField = i18n.getMessage(
                  'queryBuilder.relationshipLevels.first'
                );
              } else if (latestTouched.relationshipLevels === 2) {
                latestTouched.isMultiLevel = true;
                latestTouched.relations = [];
                $scope.relationshipLevelsInputField = i18n.getMessage(
                  'queryBuilder.relationshipLevels.second'
                );
              }
            }
          };
          $scope.nonCmdbOptionChanged = function (option) {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched)
            ) {
              latestTouched.selectedNonCmdbReference = option;
              $scope.nonCmdbOptionInputField = option.column_label;
            }
          };
          $scope.showRelationshipDirection = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched) &&
              !hasSavedServiceConn() &&
              !$scope.isFirstPatternConnection()
            ) {
              return true;
            }
            return false;
          };
          $scope.showRelationshipLevels = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched)
            ) {
              var noRelationsChecked = latestTouched.noRelations;
              var hasReference =
                latestTouched.reference && latestTouched.reference.label
                  ? true
                  : false;
              if (noRelationsChecked || hasReference || hasSavedServiceConn())
                return false;
              return true;
            }
          };
          $scope.showRelationshipSectionHeader = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched) &&
              angular.isDefined(latestTouched.relationshipLevels) &&
              latestTouched.relationshipLevels > 1
            )
              return false;
            return true;
          };
          $scope.showRelationshipAndRelatedHeader = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched) &&
              hasSavedServiceConn()
            )
              return false;
            return true;
          };
          $scope.showServiceHeader = function () {
            var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
            if (
              latestTouched &&
              queryBuilderValidation.isConnectionType(latestTouched) &&
              hasSavedServiceConn()
            )
              return true;
            return false;
          };
          $scope.getRightTabsTabIndex = function (view) {
            return view.id === $scope.activeView ? 0 : -1;
          };
          $scope.$on(
            'queryBuilder.switchTabFromArrows',
            function (event, args) {
              if (args.panel === CONST.RIGHT) {
                if (args.arrow === CONST.KEY_CODES.LEFT_ARROW) {
                  if ($scope.activeView === 1) {
                    $scope.changeActive($scope.views.length, true);
                  } else {
                    $scope.changeActive($scope.activeView - 1, true);
                  }
                } else if (args.arrow === CONST.KEY_CODES.RIGHT_ARROW) {
                  if ($scope.activeView === $scope.views.length) {
                    $scope.changeActive(1, true);
                  } else {
                    $scope.changeActive($scope.activeView + 1, true);
                  }
                }
              }
            }
          );
          $scope.$on(
            'queryBuilder.try_to_redisplay_properties',
            function (event, args) {
              if (!args.isService) {
                $rootScope.$broadcast('queryBuilder.display_properties', {
                  properties: getProperties(args.latest),
                  latest: args.latest,
                  event: args.event,
                });
              } else {
                $rootScope.$broadcast('queryBuilder.display_properties', {
                  properties: getProperties({
                    type: CONST.BASE_SERVICE_CLASS,
                  }),
                  latest: args.latest,
                  event: args.event,
                  isService: true,
                });
              }
            }
          );
        },
      ],
    };
  },
]);
