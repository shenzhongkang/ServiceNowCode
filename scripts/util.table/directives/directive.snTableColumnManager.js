/*! RESOURCE: /scripts/util.table/directives/directive.snTableColumnManager.js */
angular.module('sn.table').directive('snTableColumnManager', [
  '$http',
  'snTableCommon',
  'snTableRepository',
  'i18n',
  'trapFocusInModal',
  'SNTABLECONSTANTS',
  function (
    $http,
    snTableCommon,
    snTableRepository,
    i18n,
    trapFocusInModal,
    SNTABLECONSTANTS
  ) {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        config: '=config',
        columns: '=columns',
        all: '=all',
      },
      template:
        '' +
        '<div style="position: absolute; z-index: 1049;">' +
        '    <style>' +
        '        .sn-table .ng-hide-add {' +
        '          display:block!important;' +
        '        }' +
        '        .sn-table .ng-hide-remove {' +
        '          display:block!important;' +
        '        }' +
        '        .sn-table .modal {' +
        '            display: block;' +
        '            background-color: rgba(0,0,0,0.5);' +
        '        }' +
        '        .sn-table .modal.ng-hide-add {' +
        '          opacity: 1;' +
        '          transition: opacity 0.5s ease;' +
        '        }' +
        '        .sn-table .modal.ng-hide-add-active {' +
        '          opacity: 0;' +
        '        }' +
        '        .sn-table .modal.ng-hide-remove {' +
        '          opacity: 0;' +
        '          transition: opacity 0.5s ease;' +
        '        }' +
        '        .sn-table .modal.ng-hide-remove-active {' +
        '          opacity: 1;' +
        '        }' +
        '        .sn-table .modal.ng-hide-add .modal-content {' +
        '          transform: translateY( 0px );' +
        '          transition: transform 0.35s ease;' +
        '        }' +
        '        .sn-table .modal.ng-hide-add-active .modal-content {' +
        '          transform: translateY( 12px );' +
        '        }' +
        '        .sn-table .modal.ng-hide-remove .modal-content {' +
        '          transform: translateY( -12px );' +
        '          transition: transform 0.5s ease;' +
        '        }' +
        '        .sn-table .modal.ng-hide-remove-active .modal-content {' +
        '          transform: translateY( 0px );' +
        '        }' +
        '    </style>' +
        '    <div class="modal allow-animation ng-hide" ng-keydown="closePopover($event)" ng-show="open" role="dialog" ng-click="close()">' +
        '        <div class="modal-dialog small-modal" ng-click="stopPropagation($event)">' +
        '            <div id="col-manager-modal-content" class="modal-content">' +
        '                <header class="modal-header">' +
        '					 <a tabindex="0" role="button" class="btn btn-icon close icon-cross" ng-click="close()" sn-enter-click="" title="' +
        i18n.getMessage('Close') +
        '">' +
        '                    	<span class="sr-only">' +
        i18n.getMessage('Close') +
        '</span>' +
        '                    </a>' +
        '                    <h2 class="modal-title h4">' +
        i18n.getMessage('Personalize List Columns') +
        '</h2>' +
        '                </header>' +
        '                <div class="modal-body add-modify">' +
        '                    <div class="container-fluid slushbucket row form-group" id="slush">' +
        '                        <div class="col-xs-6 glide-list" style="width: 50%;">' +
        '                            <label for="slush_left">' +
        i18n.getMessage('Available') +
        '</label>' +
        '                            <div class="slushbucket-top">' +
        '                                <select id="snTableColumnManager" class="slushselect form-control" multiple="yes" ng-dblclick="leftToRight()" ng-model="activeAvailable" ng-options="option as option.label for option in available">' +
        '                                </select>' +
        '                                <div class="button-column" id="addRemoveButtons">' +
        '                                    <a tabindex="0" role="button" class="btn btn-default icon-chevron-right" ng-click="leftToRight()" title="' +
        i18n.getMessage('Add') +
        '" sn-enter-click="">' +
        '                                        <span class="sr-only">' +
        i18n.getMessage('Add') +
        '</span>' +
        '                                    </a>' +
        '                                    <a tabindex="0" role="button" class="btn btn-default icon-chevron-left" ng-click="rightToLeft();" title="' +
        i18n.getMessage('Remove') +
        '" sn-enter-click="">' +
        '                                        <span class="sr-only">' +
        i18n.getMessage('Remove') +
        '</span>' +
        '                                    </a>' +
        '                                </div>' +
        '                            </div>' +
        '                        </div>' +
        '                        <div class="col-xs-6 glide-list" style="width: 50%;">' +
        '                            <label for="slush_right">' +
        i18n.getMessage('Selected') +
        '</label>' +
        '                            <div class="slushbucket-top slushbody">' +
        '                                <select class="slushselect form-control" multiple="yes" ng-dblclick="rightToLeft()" ng-model="activeSelected" ng-options="option as option.label for option in selected">' +
        '                                </select>' +
        '                                <div class="button-column" id="upDownButtons">' +
        '                                    <a tabindex="0" role="button" class="btn btn-default icon-chevron-up" ng-click="moveUp();" title="' +
        i18n.getMessage('Move Up') +
        '" sn-enter-click="">' +
        '                                        <span class="sr-only">' +
        i18n.getMessage('Move Up') +
        '</span>' +
        '                                    </a>' +
        '                                    <a tabindex="0" role="button" class="btn btn-default icon-chevron-down" ng-click="moveDown();" title="' +
        i18n.getMessage('Move Down') +
        '" sn-enter-click="">' +
        '                                        <span class="sr-only">' +
        i18n.getMessage('Move Down') +
        '</span>' +
        '                                    </a>' +
        '                                </div>' +
        '                            </div>' +
        '                        </div>' +
        '                    </div>' +
        '                    <footer class="modal-footer">' +
        '                        <button class="btn btn-default" style="min-width: 5em;" ng-click="close()">' +
        i18n.getMessage('Cancel') +
        '</button>' +
        '                        <button class="btn btn-primary" style="min-width: 5em;" ng-click="update()">' +
        i18n.getMessage('OK') +
        '</button>' +
        '                    </footer>' +
        '                </div>' +
        '            </div>' +
        '        </div>' +
        '    </div>' +
        '</div>',
      controller: function ($scope, $timeout) {
        var _focusTrap = null;
        $scope.open = false;
        $scope.available = [];
        $scope.selected = [];
        var previousElement = null;
        $scope.closePopover = function (e) {
          if (e.keyCode === SNTABLECONSTANTS.KEY_CODES.ESCAPE_KEY) {
            $scope.close();
          }
        };
        $scope.$on('manage_columns', function () {
          $scope.open = true;
          $timeout(function () {
            previousElement = angular.element(document.activeElement)[0];
            previousElement.blur();
            var columnManager = angular.element('#snTableColumnManager')[0];
            columnManager.focus();
            _focusTrap = trapFocusInModal.activateFocusTrap(
              angular.element('#col-manager-modal-content'),
              _focusTrap
            );
          });
          enumerateOptions();
        });
        $scope.leftToRight = function () {
          if ($scope.activeAvailable && $scope.activeAvailable.length > 0) {
            for (var i = 0; i < $scope.activeAvailable.length; i++) {
              $scope.activeAvailable[i].remove = true;
              $scope.selected.push($scope.activeAvailable[i]);
            }
            $scope.available = $scope.available.filter(function (element) {
              return !element.remove;
            });
            for (var i = 0; i < $scope.selected.length; i++) {
              $scope.selected[i].order = i;
              $scope.selected[i].remove = undefined;
            }
            sortSelected();
            sortAvailable();
          }
        };
        $scope.rightToLeft = function () {
          if ($scope.activeSelected && $scope.activeSelected.length > 0) {
            for (var i = 0; i < $scope.activeSelected.length; i++) {
              $scope.activeSelected[i].remove = true;
              $scope.available.push($scope.activeSelected[i]);
            }
            $scope.selected = $scope.selected.filter(function (element) {
              return !element.remove;
            });
            for (var i = 0; i < $scope.selected.length; i++)
              $scope.selected[i].order = i;
            for (var i = 0; i < $scope.available.length; i++) {
              $scope.available[i].order = undefined;
              $scope.available[i].remove = undefined;
            }
            sortSelected();
            sortAvailable();
          }
        };
        $scope.moveUp = function () {
          if ($scope.activeSelected && $scope.activeSelected.length > 0) {
            for (var i = 0; i < $scope.activeSelected.length; i++)
              $scope.activeSelected[i].move = true;
            for (var i = 1; i < $scope.selected.length; i++) {
              if ($scope.selected[i].move) {
                if (!$scope.selected[i - 1].move) {
                  var temp = $scope.selected[i - 1];
                  $scope.selected[i - 1] = $scope.selected[i];
                  $scope.selected[i] = temp;
                }
              }
            }
            for (var i = 0; i < $scope.selected.length; i++) {
              $scope.selected[i].move = undefined;
              $scope.selected[i].order = i;
            }
            sortSelected();
          }
        };
        $scope.moveDown = function () {
          if ($scope.activeSelected && $scope.activeSelected.length > 0) {
            for (var i = 0; i < $scope.activeSelected.length; i++)
              $scope.activeSelected[i].move = true;
            for (var i = $scope.selected.length - 2; i >= 0; i--) {
              if ($scope.selected[i].move) {
                if (!$scope.selected[i + 1].move) {
                  var temp = $scope.selected[i + 1];
                  $scope.selected[i + 1] = $scope.selected[i];
                  $scope.selected[i] = temp;
                }
              }
            }
            for (var i = 0; i < $scope.selected.length; i++) {
              $scope.selected[i].move = undefined;
              $scope.selected[i].order = i;
            }
            sortSelected();
          }
        };
        $scope.update = function () {
          if ($scope.columns === $scope.all) {
            var map = {};
            for (var i = 0; i < $scope.columns.length; i++) {
              $scope.columns[i].active = false;
              $scope.columns[i].order = undefined;
              map[$scope.columns[i].name] = $scope.columns[i];
            }
            for (var i = 0; i < $scope.selected.length; i++) {
              map[$scope.selected[i].name].active = true;
              map[$scope.selected[i].name].order = $scope.selected[i].order;
            }
            $scope.$emit('force_update_table');
            $scope.close();
          } else {
            $scope.columns = [];
            for (var i = 0; i < $scope.selected.length; i++) {
              $scope.selected[i].active = true;
              $scope.columns.push($scope.selected[i]);
            }
            $scope.$emit('force_refresh_data');
            snTableRepository.saveColumns($scope.config, $scope.columns);
            $scope.close();
          }
        };
        $scope.close = function () {
          $scope.open = false;
          trapFocusInModal.deactivateFocusTrap(_focusTrap);
          _focusTrap = null;
          $timeout(function () {
            var currentFocus = angular.element(document.activeElement)[0];
            currentFocus.blur();
            previousElement.focus();
          });
        };
        $scope.stopPropagation = function (event) {
          if (event && event.stopPropagation) event.stopPropagation();
        };
        function enumerateOptions() {
          $scope.available = [];
          $scope.selected = [];
          if ($scope.columns === $scope.all) {
            for (var i = 0; i < $scope.columns.length; i++) {
              if ($scope.columns[i].active)
                $scope.selected.push(angular.copy($scope.columns[i]));
              else $scope.available.push(angular.copy($scope.columns[i]));
            }
          } else {
            var alreadySelected = {};
            for (var i = 0; i < $scope.columns.length; i++) {
              $scope.selected.push(angular.copy($scope.columns[i]));
              alreadySelected[$scope.columns[i].name] = true;
            }
            for (var i = 0; i < $scope.all.length; i++) {
              if (!alreadySelected[$scope.all[i].name])
                $scope.available.push(angular.copy($scope.all[i]));
            }
          }
          sortAvailable();
          sortSelected();
        }
        function sortAvailable() {
          $scope.available.sort(function (a, b) {
            return a.label == b.label ? 0 : a.label < b.label ? -1 : 1;
          });
        }
        function sortSelected() {
          $scope.selected.sort(function (a, b) {
            return a.order == b.order ? 0 : a.order < b.order ? -1 : 1;
          });
        }
      },
    };
  },
]);
