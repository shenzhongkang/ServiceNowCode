/*! RESOURCE: /scripts/app.ngbsm/factory.bsmRelationships.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmRelationships',
    function ($rootScope, bsmCamera, i18n, bsmRESTService) {
      'use strict';
      var deletingRelationship = null;
      var creatingRelationship = null;
      var modifyingRelationship = null;
      var lastOver = null;
      var lastOverLocation = {
        x: 0,
        y: 0,
      };
      var lastMouseLocation = {
        x: 0,
        y: 0,
      };
      $rootScope.$on('ngbsm.relationship_delete_confirmed', deleteRelationship);
      $rootScope.$on(
        'ngbsm.relationship_type_selected.modifying',
        modifyRelationship
      );
      $rootScope.$on(
        'ngbsm.relationship_type_selected.adding',
        addRelationship
      );
      $rootScope.$on('ngbsm.closed_relationship_modifier', abortModification);
      function deleteRelationship() {
        if (deletingRelationship !== null) {
          bsmRESTService.removeRelation(deletingRelationship.id).then(
            function (response) {
              response = JSON.parse(response);
              if (response.status === 'OK') {
                $rootScope.$broadcast('ngbsm.success', {
                  success: i18n.getMessage(
                    'dependencies.ngbsm.relationship.success'
                  ),
                });
                $rootScope.$broadcast('ngbsm.view_significantly_changed');
              } else {
                $rootScope.$broadcast('ngbsm.error', {
                  error: i18n.getMessage(
                    'dependencies.ngbsm.relationship.error.delete'
                  ),
                });
              }
            },
            function () {
              $rootScope.$broadcast('ngbsm.error', {
                error: i18n.getMessage(
                  'dependencies.ngbsm.relationship.error.delete'
                ),
              });
            }
          );
          deletingRelationship = null;
        }
      }
      function modifyRelationship(event, type) {
        if (modifyingRelationship !== null && type !== null) {
          bsmRESTService
            .editRelation(modifyingRelationship.id, type.sys_id)
            .then(
              function (response) {
                response = JSON.parse(response);
                if (response.status === 'OK') {
                  var translatedMsg = i18n.getMessage(
                    'dependencies.ngbsm.relationship.success.modify'
                  );
                  $rootScope.$broadcast('ngbsm.success', {
                    success: translatedMsg + " '" + type.name + "'",
                  });
                  $rootScope.$broadcast('ngbsm.view_significantly_changed');
                } else {
                  $rootScope.$broadcast('ngbsm.error', {
                    error: i18n.getMessage(
                      'dependencies.ngbsm.relationship.error.modify'
                    ),
                  });
                }
              },
              function () {
                $rootScope.$broadcast('ngbsm.error', {
                  error: i18n.getMessage(
                    'dependencies.ngbsm.relationship.error.modify'
                  ),
                });
              }
            );
          modifyingRelationship = null;
        }
      }
      function addRelationship(event, type) {
        if (creatingRelationship !== null && type !== null) {
          var source = creatingRelationship.source.name;
          var target = creatingRelationship.target.name;
          bsmRESTService
            .addRelation(
              creatingRelationship.source.id,
              creatingRelationship.target.id,
              type.sys_id
            )
            .then(
              function (response) {
                response = JSON.parse(response);
                if (response.id) {
                  var translatedMsg = i18n.getMessage(
                    'dependencies.ngbsm.relationship.success.create'
                  );
                  $rootScope.$broadcast('ngbsm.success', {
                    success:
                      translatedMsg + " '" + source + "' and '" + target + "'",
                  });
                  $rootScope.$broadcast('ngbsm.view_significantly_changed');
                } else {
                  $rootScope.$broadcast('ngbsm.error', {
                    error: i18n.getMessage(
                      'dependencies.ngbsm.relationship.error.create'
                    ),
                  });
                }
              },
              function () {
                $rootScope.$broadcast('ngbsm.error', {
                  error: i18n.getMessage(
                    'dependencies.ngbsm.relationship.error.create'
                  ),
                });
              }
            );
          creatingRelationship = null;
        } else {
          abortModification();
          $rootScope.$broadcast('ngbsm.error', {
            error: i18n.getMessage(
              'dependencies.ngbsm.relationship.error.create'
            ),
          });
        }
      }
      function abortModification() {
        if (creatingRelationship !== null) {
          creatingRelationship = null;
        }
        if (modifyingRelationship !== null) {
          modifyingRelationship = null;
        }
        if (deletingRelationship !== null) {
          deletingRelationship = null;
        }
      }
      return {
        deleteRelationship: function (datum) {
          if (deletingRelationship === null) {
            deletingRelationship = datum;
            $rootScope.$broadcast('ngbsm.open_relationship_confirm');
          }
        },
        modifyRelationship: function (datum) {
          if (modifyingRelationship === null) {
            modifyingRelationship = datum;
            $rootScope.$broadcast('ngbsm.open_relationship_modifier', {
              adding: false,
            });
          }
        },
        createRelationship: function (datum) {
          if (creatingRelationship === null) {
            creatingRelationship = {
              source: datum,
              target: null,
            };
          }
        },
        isCreatingRelationship: function () {
          return (
            creatingRelationship !== null &&
            creatingRelationship.target === null
          );
        },
        creatingSourceNode: function () {
          return creatingRelationship.source;
        },
        abortCreation: function () {
          if (creatingRelationship !== null) creatingRelationship = null;
        },
        pickNewRelationshipTarget: function (datum) {
          if (creatingRelationship !== null) {
            creatingRelationship.target = datum;
            $rootScope.$broadcast('ngbsm.open_relationship_modifier', {
              adding: true,
            });
          }
        },
        onMouseMove: function (event) {
          lastMouseLocation = bsmCamera.unprojectScreenCoords(event);
          lastOverLocation = {
            x: event.x,
            y: event.y,
          };
        },
        onMouseOver: function (datum) {
          lastOver = datum;
        },
        onMouseOut: function () {
          lastOver = null;
        },
        getLastOver: function () {
          return lastOver;
        },
        getCreationLine: function () {
          return [
            creatingRelationship !== null
              ? creatingRelationship.source
              : lastMouseLocation,
            lastMouseLocation,
          ];
        },
        getTooltipLocation: function () {
          return {
            x: lastOverLocation.x + 6 + 'px',
            y: lastOverLocation.y - 32 + 'px',
          };
        },
      };
    }
  );