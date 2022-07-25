/*! RESOURCE: /scripts/app.queryBuilder/factories/factory.queryBuilderTreeUtil.js */
angular.module('sn.queryBuilder').factory('queryBuilderTreeUtil', [
  'CONSTQB',
  'i18n',
  function (CONST, i18n) {
    'use strict';
    var currentTree = {};
    var loadingTree = false;
    var currentFlatTree = [];
    var currentTreeType = '';
    var specificTrees = {};
    function _findParents(type, tree) {
      var allParents = [];
      isChildMatch(type, tree, allParents);
      return allParents;
    }
    function _findChildren(type, tree) {
      var allChildren = [];
      allChildren = checkChildren(type, tree, allChildren);
      return allChildren;
    }
    function _getCurrentTree() {
      return currentTree;
    }
    function _updateCurrentTree(tree, queryType) {
      currentTree = tree;
      specificTrees[queryType] = tree;
    }
    function _getCurrentFlatTree() {
      return currentFlatTree;
    }
    function _updateCurrentFlatTree(flatTree) {
      currentFlatTree = flatTree;
    }
    function _getLoadingTree() {
      return loadingTree;
    }
    function _setLoadingTree(loading) {
      loadingTree = loading;
    }
    function _getCurrentTreeType() {
      return currentTreeType;
    }
    function _setCurrentTreeType(treeType) {
      currentTreeType = treeType;
    }
    function _getSpecificTree(treeType) {
      return specificTrees[treeType];
    }
    function _hasTree(treeType) {
      return angular.isDefined(specificTrees[treeType]);
    }
    function isChildMatch(type, tree, allParents) {
      var match = false;
      if (tree && tree.data && type === tree.data.ci_type) {
        match = true;
        allParents.push(tree);
      }
      if (tree && tree.children && tree.children.length && !match) {
        for (var i = 0; i < tree.children.length; i++) {
          if (isChildMatch(type, tree.children[i], allParents)) {
            match = true;
            allParents.push(tree);
          }
        }
      }
      return match;
    }
    function checkChildren(type, tree, allChildren) {
      if (tree && tree.data && tree.data.ci_type === type) {
        if (tree.children && tree.children.length > 0) {
          allChildren = addChildren(tree.children, allChildren);
        }
      } else if (tree.children && tree.children.length) {
        for (var i = 0; i < tree.children.length; i++) {
          allChildren = checkChildren(type, tree.children[i], allChildren);
        }
      }
      return allChildren;
    }
    function addChildren(children, allChildren) {
      for (var i = 0; i < children.length; i++) {
        allChildren.push(children[i].data.ci_type);
        if (children[i].children && children[i].children.length > 0) {
          allChildren = addChildren(children[i].children, allChildren);
        }
      }
      return allChildren;
    }
    return {
      findParents: _findParents,
      findChildren: _findChildren,
      getCurrentTree: _getCurrentTree,
      updateCurrentTree: _updateCurrentTree,
      getCurrentFlatTree: _getCurrentFlatTree,
      updateCurrentFlatTree: _updateCurrentFlatTree,
      getLoadingTree: _getLoadingTree,
      setLoadingTree: _setLoadingTree,
      getCurrentTreeType: _getCurrentTreeType,
      setCurrentTreeType: _setCurrentTreeType,
      getSpecificTree: _getSpecificTree,
      hasTree: _hasTree,
    };
  },
]);
