/*! RESOURCE: /scripts/app.ciModel/factories/factory.ciModelPermissions.js */
angular.module('sn.ciModel').factory('ciModelPermissions', [
  'securityConstants',
  function (securityConstants) {
    'use strict';
    var perms = {};
    function init() {
      perms[securityConstants.PERMISSIONS.READ] = false;
      perms[securityConstants.PERMISSIONS.WRITE] = false;
      perms[securityConstants.PERMISSIONS.DICTIONARY] = false;
      var roles = window.NOW.roles ? window.NOW.roles.split(',') : [];
      if (roles.some(checkAdminRole)) {
        perms[securityConstants.PERMISSIONS.READ] = true;
        perms[securityConstants.PERMISSIONS.WRITE] = true;
        perms[securityConstants.PERMISSIONS.DICTIONARY] = true;
      } else {
        if (roles.some(checkItilAdminRole)) {
          perms[securityConstants.PERMISSIONS.READ] = true;
          perms[securityConstants.PERMISSIONS.WRITE] = true;
        } else if (roles.some(checkItilRole)) {
          perms[securityConstants.PERMISSIONS.READ] = true;
        }
      }
      if (roles.some(checkPersDicRole)) {
        perms[securityConstants.PERMISSIONS.DICTIONARY] = true;
      }
    }
    function checkAdminRole(role) {
      return (
        role === securityConstants.ROLES.ADMIN ||
        role === securityConstants.ROLES.MAINT
      );
    }
    function checkItilRole(role) {
      return role === securityConstants.ROLES.ITIL;
    }
    function checkItilAdminRole(role) {
      return role === securityConstants.ROLES.ITIL_ADMIN;
    }
    function checkPersDicRole(role) {
      return role === securityConstants.ROLES.PERSONALIZED_DIC;
    }
    function canRead() {
      return perms[securityConstants.PERMISSIONS.READ];
    }
    function canWrite() {
      return perms[securityConstants.PERMISSIONS.WRITE];
    }
    function canWriteDictionary() {
      return perms[securityConstants.PERMISSIONS.DICTIONARY];
    }
    init();
    return {
      canRead: canRead,
      canWrite: canWrite,
      canWriteDictionary: canWriteDictionary,
    };
  },
]);
