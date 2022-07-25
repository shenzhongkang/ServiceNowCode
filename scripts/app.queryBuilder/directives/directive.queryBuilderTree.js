/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.queryBuilderTree.js */
angular.module('sn.queryBuilder').directive('queryBuilderTree', function () {
  'use strict';
  return {
    restrict: 'E',
    template:
      '' +
      '<div class="query-builder-tree">' +
      '	<div class="tree-node dnd-drag" dnd-drag-type="{{dragType}}" dnd-drag-data="treeNode" dnd-drag-class="dragging" ng-repeat="treeNode in flattenedLeftPanelTree" highlight-on-inside-focus="" ng-style="getTreeNodeStyle(treeNode)">' +
      '		<div class="left-icon">' +
      '			<span class="icon" tabindex="0" ng-show="hasChildren(treeNode)" ng-class="{ \'icon-vcr-down\': treeNode.expanded, \'icon-vcr-right\': !treeNode.expanded }" ng-click="toggleTreeNode(treeNode)" aria-label="{{getExpandLabel(treeNode)}}"></span>' +
      '		</div>' +
      '		<div class="content">' +
      '			<span class="type" tabindex="0" ng-keyup="treeNodeKeyUp($event, treeNode)" ng-class="{matched: treeNode.matched}" sn-tooltip-basic="{{getTreeNodeTooltip(treeNode)}}">{{::treeNode.label}}</span>' +
      '		</div>' +
      '		<div class="right-icon" sn-sticky-hover="hierarchy-tree-container">' +
      '			<span class="icon icon-drag-dots"></span>' +
      '		</div>' +
      '	</div>' +
      '</div>',
    controller: [
      '$scope',
      '$rootScope',
      'queryService',
      'queryBuilderTreeUtil',
      'i18n',
      'queryBuilderCommon',
      'CONSTQB',
      '$filter',
      'queryBuilderCanvasUtil',
      '$timeout',
      function (
        $scope,
        $rootScope,
        queryService,
        queryBuilderTreeUtil,
        i18n,
        queryBuilderCommon,
        CONST,
        $filter,
        queryBuilderCanvasUtil,
        $timeout
      ) {
        $scope.flattenedLeftPanelTree = [];
        $scope.treeSearchTerm = '';
        $scope.isFilteredTree = false;
        $scope.isConnectionTree = false;
        $scope.connectionTreeMessage = '';
        $scope.filteredNode = null;
        $scope.dragType = CONST.CLASS;
        var treeTypes = {};
        var currentSuggestedArray = [];
        var waitingForTree = '';
        var nonCmdbSuggested = [];
        $scope.getTreeNodeStyle = function (treeNode) {
          return {
            'padding-left': treeNode.level * 24 + 'px',
          };
        };
        $scope.hasChildren = function (treeNode) {
          if (treeNode.children && treeNode.children.length > 0) return true;
          return false;
        };
        $scope.toggleTreeNode = function (node) {
          if (!$scope.isFilteredTree && !$scope.isConnectionTree) {
            node.expanded = !node.expanded;
            if (
              queryBuilderTreeUtil.getCurrentTreeType() !=
              CONST.OBJECT_TYPES.NON_CMDB
            ) {
              $scope.flattenedLeftPanelTree = flattenTree(
                queryBuilderTreeUtil.getCurrentTree()
              );
            } else {
              $scope.flattenedLeftPanelTree = flattenNonCMDBTree(
                queryBuilderTreeUtil.getCurrentTree()
              );
            }
          }
        };
        $scope.treeSearchChanged = function (newVal) {
          if (newVal !== '' && newVal !== undefined) {
            newVal = newVal.toLowerCase();
            $scope.isFilteredTree = true;
          } else $scope.isFilteredTree = false;
          if (!$scope.isConnectionTree)
            $scope.flattenedLeftPanelTree = flattenTree(
              queryBuilderTreeUtil.getCurrentTree(),
              null,
              newVal,
              false
            );
          else {
            if (
              queryBuilderTreeUtil.getCurrentTreeType() !==
              CONST.OBJECT_TYPES.NON_CMDB
            ) {
              $scope.flattenedLeftPanelTree = suggestTree(
                queryBuilderTreeUtil.getCurrentTree(),
                null,
                currentSuggestedArray,
                false,
                newVal
              );
            } else {
              $scope.flattenedLeftPanelTree = searchFlattenedNonCmdb(
                nonCmdbSuggested,
                newVal,
                false
              );
            }
          }
        };
        $scope.treeNodeKeyUp = function (e, treeNode) {
          if (
            queryBuilderCommon.hasAccessibilityEnabled() &&
            e.keyCode === CONST.KEY_CODES.ENTER_KEY
          ) {
            var drop = {
              data: treeNode,
              type: $scope.dragType,
            };
            $rootScope.$broadcast('queryBuilder.accessibility.addNode', {
              drop: drop,
            });
          }
        };
        $scope.getExpandLabel = function (treeNode) {
          if (treeNode) {
            if (treeNode.expanded) {
              return i18n.format(
                i18n.getMessage('queryBuilder.accessibility.collapseLeftItem'),
                [treeNode.data.label]
              );
            }
            return i18n.format(
              i18n.getMessage('queryBuilder.accessibility.expandLeftItem'),
              [treeNode.data.label]
            );
          }
          return '';
        };
        $scope.getTreeNodeTooltip = function (treeNode) {
          if (treeNode) {
            if (treeNode.table_name) return treeNode.table_name;
            else if (treeNode.data && treeNode.data.ci_type)
              return treeNode.data.ci_type;
          }
          return '';
        };
        $scope.$on('queryBuilder.searchCleared', function (event, args) {
          if (args.searchValue === 'treeSearchTerm') {
            if (!$scope.isConnectionTree)
              $scope.flattenedLeftPanelTree = flattenTree(
                queryBuilderTreeUtil.getCurrentTree(),
                null,
                '',
                false
              );
            else {
              if (
                queryBuilderTreeUtil.getCurrentTreeType() !==
                CONST.OBJECT_TYPES.NON_CMDB
              ) {
                $scope.flattenedLeftPanelTree = suggestTree(
                  queryBuilderTreeUtil.getCurrentTree(),
                  null,
                  currentSuggestedArray,
                  false
                );
              } else {
                $scope.flattenedLeftPanelTree = searchFlattenedNonCmdb(
                  nonCmdbSuggested,
                  '',
                  true
                );
              }
            }
            $scope.isFilteredTree = false;
          }
        });
        $scope.$on('queryBuilder.loadingQueryType', function (event, args) {
          var queryType = args.type;
          loadTree(queryType);
        });
        $scope.$on('queryBuilder.resetTree', function (event, args) {
          var tree = queryBuilderTreeUtil.getCurrentTree();
          if (
            queryBuilderTreeUtil.getCurrentTreeType() ===
            CONST.OBJECT_TYPES.NON_CMDB
          ) {
            initializeNonCmdbTree(
              tree,
              queryBuilderTreeUtil.getCurrentTreeType()
            );
          } else {
            initializeTree(tree, queryBuilderTreeUtil.getCurrentTreeType());
          }
          resetTree();
        });
        $scope.$on('queryBuilder.showSuggestedTree', function (event, args) {
          if (queryBuilderTreeUtil.getLoadingTree()) {
            waitForTreeLoadSuggestions(args);
            return;
          }
          if (
            queryBuilderTreeUtil.getCurrentTreeType() !==
            CONST.OBJECT_TYPES.NON_CMDB
          ) {
            var suggestedArray = args.suggestedArray;
            var suggestedClass = args.suggestedClass;
            var selectedClass = args.selectedClass;
            currentSuggestedArray = suggestedArray;
            if (selectedClass.nodeType === CONST.NODETYPE.CLASS) {
              $scope.flattenedLeftPanelTree = suggestTree(
                queryBuilderTreeUtil.getCurrentTree(),
                null,
                suggestedArray,
                false
              );
            } else if (selectedClass.nodeType === CONST.OBJECT_TYPES.NON_CMDB) {
              var referenceTables = [];
              var referenceColumns = selectedClass.referenceColumns;
              for (var i = 0; i < referenceColumns.length; i++) {
                referenceTables.push(referenceColumns[i].cmdb_class_name);
              }
              currentSuggestedArray = referenceTables;
              $scope.flattenedLeftPanelTree = suggestTree(
                queryBuilderTreeUtil.getCurrentTree(),
                null,
                referenceTables,
                false
              );
            }
            if ($scope.flattenedLeftPanelTree.length > 0)
              $scope.connectionTreeMessage = i18n.format(
                i18n.getMessage('queryBuilder.suggestedTreeMessage'),
                [suggestedClass]
              );
            else
              $scope.connectionTreeMessage = i18n.format(
                i18n.getMessage('queryBuilder.noSuggestedTreeMessage'),
                [suggestedClass]
              );
            $scope.isConnectionTree = true;
          } else if (
            queryBuilderTreeUtil.getCurrentTreeType() ===
            CONST.OBJECT_TYPES.NON_CMDB
          ) {
            var suggestedClass = args.suggestedClass;
            var selectedClass = args.selectedClass;
            var current = queryBuilderTreeUtil.getCurrentTree();
            if (selectedClass.nodeType === CONST.OBJECT_TYPES.NON_CMDB) {
              $scope.flattenedLeftPanelTree = current;
              $scope.isConnectionTree = false;
              resetTree();
            } else {
              var allParentTypes = queryBuilderCanvasUtil.getAllParentTypes();
              var myParents = allParentTypes[selectedClass.type];
              var suggested = [];
              for (var i = 0; i < current.length; i++) {
                var found = false;
                var columns = current[i].data.referenceColumns;
                for (var j = 0; j < columns.length; j++) {
                  for (var k = 0; k < myParents.length; k++) {
                    if (
                      myParents[k].data.ci_type === columns[j].cmdb_class_name
                    ) {
                      suggested.push(current[i]);
                      found = true;
                      break;
                    }
                  }
                  if (found) {
                    break;
                  }
                }
              }
              $scope.flattenedLeftPanelTree = suggested;
              nonCmdbSuggested = angular.copy(suggested);
              if ($scope.flattenedLeftPanelTree.length > 0)
                $scope.connectionTreeMessage = i18n.format(
                  i18n.getMessage('queryBuilder.suggestedTreeMessage'),
                  [suggestedClass]
                );
              else
                $scope.connectionTreeMessage = i18n.format(
                  i18n.getMessage('queryBuilder.noSuggestedTreeMessage'),
                  [suggestedClass]
                );
              $scope.isConnectionTree = true;
            }
          }
        });
        $scope.$on('queryBuilder.loadTreeType', function (event, args) {
          var queryType = args.type;
          resetTree();
          loadTree(queryType);
          var latestTouched = queryBuilderCanvasUtil.getLatestTouched();
          if (
            latestTouched &&
            (latestTouched.nodeType === CONST.NODETYPE.CLASS ||
              latestTouched.nodeType === CONST.OBJECT_TYPES.NON_CMDB)
          ) {
            var suggestedConnections = [];
            if (latestTouched.nodeType === CONST.NODETYPE.CLASS)
              suggestedConnections =
                queryBuilderCommon.getSuggestedConnections(latestTouched);
            $rootScope.$broadcast('queryBuilder.showSuggestedTree', {
              suggestedArray: suggestedConnections,
              suggestedClass: latestTouched.name,
              selectedClass: latestTouched,
            });
          }
        });
        function handleKeyPress(event) {
          if (event.which === 13) {
            var searchTerm = angular.copy($scope.treeSearchTerm);
            searchTerm = searchTerm.toLowerCase();
            if (!$scope.isConnectionTree)
              $scope.flattenedLeftPanelTree = flattenTree(
                queryBuilderTreeUtil.getCurrentTree(),
                null,
                searchTerm,
                true
              );
            else {
              if (
                queryBuilderTreeUtil.getCurrentTreeType() !==
                CONST.OBJECT_TYPES.NON_CMDB
              ) {
                $scope.flattenedLeftPanelTree = suggestTree(
                  queryBuilderTreeUtil.getCurrentTree(),
                  null,
                  currentSuggestedArray,
                  true,
                  searchTerm
                );
              } else {
                $scope.flattenedLeftPanelTree = searchFlattenedNonCmdb(
                  nonCmdbSuggested,
                  searchTerm,
                  true
                );
              }
            }
            $scope.$digest();
          }
        }
        var searchBox = angular.element('#treeSearchBox');
        searchBox.on('keyup', function (e) {
          handleKeyPress(e);
        });
        function initializeTree(tree, treeType) {
          if (
            waitingForTree !== '' &&
            waitingForTree !== queryBuilderTreeUtil.getCurrentTreeType()
          ) {
            loadTree(waitingForTree, true);
            waitingForTree = '';
            return;
          } else {
            waitingForTree = '';
          }
          if (tree && Object.keys(tree).length > 0) {
            tree = angular.copy(tree);
            tree.expanded = true;
            tree.level = 0;
            tree.searchable_term = tree.searchable_term.toLowerCase();
            sortChildren(tree.children);
            for (var i = 0; i < tree.children.length; i++) {
              setInitialExpandedFalse(tree.children[i], 1);
            }
            queryBuilderTreeUtil.updateCurrentTree(tree, treeType);
            $scope.flattenedLeftPanelTree = flattenTree(
              queryBuilderTreeUtil.getCurrentTree()
            );
            queryBuilderTreeUtil.updateCurrentFlatTree(
              angular.copy($scope.flattenedLeftPanelTree)
            );
            queryBuilderTreeUtil.setLoadingTree(false);
            $rootScope.$broadcast('queryBuilder.loadedCmdbTree');
          }
        }
        function initializeNonCmdbTree(tree, treeType) {
          if (
            waitingForTree !== '' &&
            waitingForTree !== queryBuilderTreeUtil.getCurrentTreeType()
          ) {
            loadTree(waitingForTree, true);
            waitingForTree = '';
            return;
          } else {
            waitingForTree = '';
          }
          if (tree && tree.length > 0) {
            for (var i = 0; i < tree.length; i++) {
              tree[i].searchable_term = tree[i].searchable_term.toLowerCase();
            }
            tree = $filter('orderObjectBy')(tree, CONST.LABEL);
            queryBuilderTreeUtil.updateCurrentTree(tree, treeType);
            $scope.flattenedLeftPanelTree = flattenNonCMDBTree(tree);
            queryBuilderTreeUtil.updateCurrentFlatTree(
              angular.copy($scope.flattenedLeftPanelTree)
            );
            queryBuilderTreeUtil.setLoadingTree(false);
          }
        }
        function setInitialExpandedFalse(child, level) {
          child.expanded = false;
          child.level = level;
          child.searchable_term = child.searchable_term.toLowerCase();
          if (child.children) {
            for (var i = 0; i < child.children.length; i++) {
              setInitialExpandedFalse(child.children[i], level + 1);
            }
          }
        }
        function flattenTree(tree, flatArray, searchTerm, doExactSearch) {
          if (
            queryBuilderTreeUtil.getCurrentTreeType() ===
            CONST.OBJECT_TYPES.NON_CMDB
          ) {
            return flattenNonCMDBTree(
              tree,
              flatArray,
              searchTerm,
              doExactSearch
            );
          }
          if (searchTerm === '' || searchTerm === undefined) {
            var flatTree = [];
            if (flatArray) flatTree = flatArray;
            var root = tree;
            resetFiltered(root);
            flatTree.push(root);
            if (root.expanded && root.children) {
              for (var i = 0; i < root.children.length; i++)
                flatTree = flattenTree(root.children[i], flatTree);
            }
            return flatTree;
          } else {
            var flatTree = [];
            if (flatArray) flatTree = flatArray;
            var root = tree;
            if (doFilterAndExpand(root, searchTerm, doExactSearch)) {
              flatTree.push(root);
            }
            if (root.children) {
              for (var i = 0; i < root.children.length; i++) {
                flatTree = flattenTree(
                  root.children[i],
                  flatTree,
                  searchTerm,
                  doExactSearch
                );
              }
            }
            return flatTree;
          }
        }
        function flattenNonCMDBTree(
          tree,
          flatArray,
          searchTerm,
          doExactSearch
        ) {
          if (searchTerm === '' || searchTerm === undefined) {
            var flatTree = [];
            if (flatArray) flatTree = flatArray;
            for (var i = 0; i < tree.length; i++) {
              resetFiltered(tree[i]);
              flatTree.push(tree[i]);
            }
            return flatTree;
          } else {
            var flatTree = [];
            if (flatArray) flatTree = flatArray;
            for (var i = 0; i < tree.length; i++) {
              if (doNonCmdbFilter(tree[i], searchTerm, doExactSearch)) {
                flatTree.push(tree[i]);
              }
            }
            return flatTree;
          }
        }
        function suggestTree(
          tree,
          flatArray,
          searchArray,
          doExactSearch,
          searchTerm
        ) {
          var suggestedTree = [];
          if (flatArray) suggestedTree = flatArray;
          var root = tree;
          if (
            doSuggestAndExpand(root, searchArray, doExactSearch, searchTerm)
          ) {
            suggestedTree.push(root);
          }
          if (root.children) {
            for (var i = 0; i < root.children.length; i++) {
              suggestedTree = suggestTree(
                root.children[i],
                suggestedTree,
                searchArray,
                doExactSearch,
                searchTerm
              );
            }
          }
          return suggestedTree;
        }
        function searchFlattenedNonCmdb(tree, searchTerm, doExactSearch) {
          var searched = [];
          for (var i = 0; i < tree.length; i++) {
            var node = tree[i];
            var found = false;
            if ((searchTerm === '' || searchTerm === undefined) && node) {
              found = true;
              node.filtered = false;
              node.matched = false;
            } else if (searchTerm && node && node.searchable_term) {
              if (
                !doExactSearch &&
                node.searchable_term.indexOf(searchTerm) >= 0
              ) {
                found = true;
                node.filtered = true;
                node.matched = true;
              } else if (doExactSearch && node.searchable_term === searchTerm) {
                found = true;
                node.filtered = true;
                node.matched = true;
              }
            }
            if (found) searched.push(node);
          }
          return searched;
        }
        function sortChildren(children) {
          children.sort(function (a, b) {
            return a.label.localeCompare(b.label);
          });
          for (var i = 0; i < children.length; i++) {
            if (children[i].children && children[i].children.length > 0)
              sortChildren(children[i].children);
          }
        }
        function resetFiltered(node) {
          node.filtered = false;
          node.matched = false;
        }
        function doFilterAndExpand(node, term, doExactSearch) {
          var found = false;
          resetFiltered(node);
          node.expanded = false;
          if (!doExactSearch && node.searchable_term.indexOf(term) >= 0) {
            found = true;
            node.matched = true;
          } else if (doExactSearch && node.searchable_term === term) {
            found = true;
            node.matched = true;
          }
          if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
              if (doFilterAndExpand(node.children[i], term, doExactSearch)) {
                found = true;
                node.expanded = true;
              }
            }
          }
          node.filtered = found;
          return found;
        }
        function doNonCmdbFilter(node, term, doExactSearch) {
          var found = false;
          resetFiltered(node);
          if (!doExactSearch && node.searchable_term.indexOf(term) >= 0) {
            found = true;
            node.matched = true;
          } else if (doExactSearch && node.searchable_term === term) {
            found = true;
            node.matched = true;
          }
          node.filtered = found;
          return found;
        }
        function doSuggestAndExpand(
          node,
          searchArray,
          doExactSearch,
          searchTerm
        ) {
          var found = false;
          resetFiltered(node);
          node.expanded = false;
          if (
            (searchTerm === '' || searchTerm === undefined) &&
            node &&
            node.data &&
            searchArray.indexOf(node.data.ci_type) > -1
          ) {
            found = true;
          } else if (
            searchTerm &&
            node &&
            node.data &&
            searchArray.indexOf(node.data.ci_type) > -1
          ) {
            if (
              !doExactSearch &&
              node.searchable_term.indexOf(searchTerm) >= 0
            ) {
              found = true;
              node.matched = true;
            } else if (doExactSearch && node.searchable_term === searchTerm) {
              found = true;
              node.matched = true;
            }
          }
          if (node.children) {
            for (var i = 0; i < node.children.length; i++) {
              if (
                doSuggestAndExpand(
                  node.children[i],
                  searchArray,
                  doExactSearch,
                  searchTerm
                )
              ) {
                found = true;
                node.expanded = true;
                if (!node.matched && searchTerm) {
                  if (
                    !doExactSearch &&
                    node.searchable_term.indexOf(searchTerm) >= 0
                  )
                    node.matched = true;
                  else if (doExactSearch && node.searchable_term === searchTerm)
                    node.matched = true;
                }
              } else if (
                searchArray.indexOf(node.children[i].data.ci_type) > -1 &&
                !node.matched &&
                searchTerm !== '' &&
                searchTerm
              ) {
                if (
                  !doExactSearch &&
                  node.searchable_term.indexOf(searchTerm) >= 0
                ) {
                  found = true;
                  node.matched = true;
                } else if (
                  doExactSearch &&
                  node.searchable_term === searchTerm
                ) {
                  found = true;
                  node.matched = true;
                }
              }
            }
          }
          node.filtered = found;
          return found;
        }
        function loadTree(queryType, wasWaiting) {
          if (
            queryBuilderTreeUtil.getLoadingTree() &&
            queryType !== queryBuilderTreeUtil.getCurrentTreeType() &&
            !wasWaiting
          ) {
            waitingForTree = queryType;
            return;
          } else {
            waitingForTree = '';
          }
          $scope.leftPanelTree = {};
          $scope.flattenedLeftPanelTree = [];
          $scope.treeSearchTerm = '';
          queryBuilderTreeUtil.setLoadingTree(true);
          queryBuilderTreeUtil.setCurrentTreeType(queryType);
          if (queryType === CONST.OBJECT_TYPES.NON_CMDB) {
            $scope.dragType = CONST.OBJECT_TYPES.NON_CMDB;
          } else {
            $scope.dragType = CONST.CLASSES;
          }
          if (!treeTypes[queryType]) {
            queryService.getLeftTree(queryType).then(function (hierarchy) {
              if (hierarchy && queryType === CONST.OBJECT_TYPES.NON_CMDB) {
                treeTypes[queryType] = angular.copy(hierarchy);
                initializeNonCmdbTree(hierarchy, queryType);
              } else if (
                hierarchy &&
                queryType != CONST.OBJECT_TYPES.NON_CMDB
              ) {
                treeTypes[queryType] = angular.copy(hierarchy);
                initializeTree(hierarchy, queryType);
              }
            });
          } else {
            if (queryType === CONST.OBJECT_TYPES.NON_CMDB)
              initializeNonCmdbTree(treeTypes[queryType], queryType);
            else initializeTree(treeTypes[queryType], queryType);
          }
        }
        function resetTree() {
          if ($scope.isConnectionTree) {
            $scope.isConnectionTree = false;
            $scope.filteredNode = null;
            $scope.connectionTreeMessage = '';
            currentSuggestedArray = [];
            nonCmdbSuggested = [];
          }
          if ($scope.isFilteredTree) {
            $scope.isFilteredTree = false;
            $scope.treeSearchTerm = '';
          }
        }
        function waitForTreeLoadSuggestions(args) {
          $timeout(function () {
            if (!queryBuilderTreeUtil.getLoadingTree()) {
              $rootScope.$broadcast('queryBuilder.showSuggestedTree', args);
            } else {
              waitForTreeLoadSuggestions(args);
            }
          }, 500);
        }
      },
    ],
  };
});
