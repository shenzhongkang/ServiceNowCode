/*! RESOURCE: /scripts/app.ngbsm/directive.snRelationshipModifier.js */
angular
  .module('sn.ngbsm')
  .directive(
    'snRelationshipModifier',
    function ($rootScope, bsmActions, bsmSearchRepository) {
      'use strict';
      return {
        restrict: 'E',
        replace: false,
        scope: {},
        templateUrl:
          '/angular.do?sysparm_type=get_partial&name=sn_relationship_modifier.xml',
        controller: function ($scope) {
          $scope.active = false;
          $scope.modifying = false;
          $scope.confirming = false;
          $scope.addingRelationship = false;
          $scope.search = {
            htmlID: 'searchForRelationshipType',
            placeholder: 'Search for Relationship Type',
            interval: 500,
            providers: [
              {
                label: 'Relationship Types',
                call: bsmSearchRepository.searchRelationshipTypes,
              },
            ],
          };
          $scope.$on(
            'ngbsm.open_relationship_modifier',
            function (event, args) {
              $scope.active = true;
              $scope.modifying = true;
              $scope.addingRelationship = args.adding;
              setTimeout(function () {
                var inputElems = document
                  .getElementById('searchContainer')
                  .getElementsByTagName('input');
                inputElems[0].focus();
              });
            }
          );
          $scope.$on('ngbsm.open_relationship_confirm', function () {
            $scope.active = true;
            $scope.confirming = true;
          });
          $scope.$watch('search.selected', function () {
            if ($scope.active && $scope.modifying) {
              if ($scope.addingRelationship)
                $rootScope.$broadcast(
                  'ngbsm.relationship_type_selected.adding',
                  $scope.search.selected.result
                );
              else
                $rootScope.$broadcast(
                  'ngbsm.relationship_type_selected.modifying',
                  $scope.search.selected.result
                );
              $scope.search.term = undefined;
              $scope.active = false;
              $scope.modifying = false;
              $scope.addingRelationship = false;
            }
          });
          $scope.confirm = function () {
            if ($scope.active && $scope.confirming) {
              $rootScope.$broadcast('ngbsm.relationship_delete_confirmed');
              $scope.active = false;
              $scope.confirming = false;
            }
          };
          $scope.close = function () {
            $scope.search.term = undefined;
            $scope.active = false;
            $scope.modifying = false;
            $scope.confirming = false;
            $rootScope.$broadcast('ngbsm.closed_relationship_modifier');
          };
        },
      };
    }
  );