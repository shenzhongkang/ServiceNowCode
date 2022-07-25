/*! RESOURCE: /scripts/app.queryBuilder/directives/directive.dialogBox.js */
angular.module('sn.queryBuilder').directive('qbDialogBox', [
  '$rootScope',
  'i18n',
  'CONSTQB',
  'trapFocusInModal',
  'getTemplateUrl',
  function ($rootScope, i18n, CONST, trapFocusInModal, getTemplateUrl) {
    'use strict';
    return {
      restrict: 'E',
      templateUrl: getTemplateUrl('query_builder_dialog_box.xml'),
      controller: [
        '$scope',
        '$timeout',
        'queryService',
        'snNotification',
        'queryBuilderValidation',
        'queryBuilderCanvasUtil',
        'queryBuilderCommon',
        function (
          $scope,
          $timeout,
          queryService,
          snNotification,
          queryBuilderValidation,
          queryBuilderCanvasUtil,
          queryBuilderCommon
        ) {
          var ESC_KEY_CODE = 27;
          var body = angular.element(document).find('body');
          var _focusTrap = null;
          $scope.queryType = CONST.QUERY_TYPES.GENERAL;
          $scope.queyerBuilderModalTitle = '';
          $scope.startNodeDropdown = {
            options: [],
            selected: null,
          };
          $scope.config = {
            buttons: [
              {
                label: i18n.getMessage('queryBuilder.dialogBox.cancel'),
                callBack: null,
              },
              {
                label: i18n.getMessage('queryBuilder.dialogBox.create'),
                callBack: function () {
                  createQuery('create');
                },
                primary: true,
              },
            ],
          };
          $scope.dialogView = 'create_query';
          var show = false;
          $scope.buttonStyle = function (button) {
            var style = '';
            var buttonStyle = 'btn-default';
            if (button.primary) buttonStyle = 'btn-primary';
            var float = '';
            if (button.left) float = 'float-left';
            style += buttonStyle + ' ' + float;
            return style;
          };
          $scope.toggle = function () {
            if (show)
              return {
                display: 'block',
              };
            else
              return {
                display: 'none',
              };
          };
          $scope.buttonClicked = function (button) {
            show = false;
            body.off('keyup', $scope.onEscapeCloseDialog);
            trapFocusInModal.deactivateFocusTrap(_focusTrap);
            _focusTrap = null;
            if (button.callBack) button.callBack();
          };
          $scope.disableButton = function (button) {
            if (button.isDisabled) return button.isDisabled();
            return false;
          };
          $scope.closeDialogBox = function () {
            if (
              $scope.dialogView === 'create_relationship' ||
              $scope.dialogView === 'create_service_relationship' ||
              $scope.dialogBox === 'create_applicative_flow'
            )
              $rootScope.$broadcast('createRelationship.dialogBox.closed');
            $rootScope.$broadcast('queryBuilder.hide_right_dropdown');
            show = false;
            body.off('keyup', $scope.onEscapeCloseDialog);
            trapFocusInModal.deactivateFocusTrap(_focusTrap);
            _focusTrap = null;
          };
          $scope.onEscapeCloseDialog = function (event) {
            if (event.keyCode === ESC_KEY_CODE) {
              $timeout(function () {
                $scope.closeDialogBox();
              });
            }
          };
          $scope.getLatestTouched = function () {
            return queryBuilderCanvasUtil.getLatestTouched();
          };
          $scope.getProgressBarStyle = function () {
            if ($scope.dialogView === 'export_saved_query') {
              return {
                width: queryBuilderCanvasUtil.getExportQuerySysId()
                  ? '100%'
                  : '0%',
              };
            }
            return;
          };
          function createQuery(button) {
            var title =
              $scope.queryTitle != '' && $scope.queryTitle != undefined
                ? $scope.queryTitle
                : i18n.getMessage('queryBuilder.dialogBox.untitledQuery');
            $rootScope.$broadcast('queryBuilder.newQuery', {
              title: title,
              type: $scope.queryType,
            });
          }
          $rootScope.$on(
            'queryBuilder.dialogBox.createNew.open',
            function (event) {
              $scope.queryTitle = '';
              $scope.config.buttons = [
                {
                  label: i18n.getMessage('queryBuilder.dialogBox.cancel'),
                  callBack: null,
                },
                {
                  label: i18n.getMessage('queryBuilder.dialogBox.create'),
                  callBack: function () {
                    createQuery('create');
                  },
                  primary: true,
                },
              ];
              $scope.dialogView = 'create_query';
              show = true;
              body.on('keyup', $scope.onEscapeCloseDialog);
              $timeout(function () {
                trapFocusInModal.saveActiveElement(
                  angular.element(document.activeElement)[0]
                );
                var input = angular.element('#create-new-input')[0];
                if (input) input.focus();
                _focusTrap = trapFocusInModal.activateFocusTrap(
                  angular.element('#create-query-modal-content'),
                  _focusTrap
                );
              });
            }
          );
          $rootScope.$on(
            'queryBuilder.pickStartNode.open',
            function (event, data) {
              var nodes = data.nodes;
              var connections = data.connections;
              var validatingFrom = data.validatingFrom;
              if (data.errorMessage) {
                snNotification
                  .show('error', data.errorMessage, CONST.NOTIFICATION_TIME)
                  .then(function (notificationElement) {
                    queryBuilderCommon.focusNotificationCloseButton(
                      notificationElement
                    );
                  });
              }
              $scope.config.buttons = [
                {
                  label: i18n.getMessage('queryBuilder.dialog.box.confirm'),
                  callBack: function () {
                    for (var i = 0; i < nodes.length; i++) {
                      if (
                        nodes[i].nodeId ===
                        $scope.startNodeDropdown.selected.nodeId
                      ) {
                        nodes[i].isStartNode = true;
                        var startNode = queryBuilderCanvasUtil.getStartNode();
                        if (startNode) startNode.isStartNode = false;
                        queryBuilderCanvasUtil.setStartNode(nodes[i]);
                      }
                    }
                    show = false;
                    if (validatingFrom === 'save') $scope.saveQuery();
                    else if (validatingFrom === 'run') $scope.runQuery();
                  },
                  primary: true,
                },
              ];
              $scope.startNodeDropdown.options = [];
              $scope.startNodeDropdown.selected = null;
              for (var i = 0; i < nodes.length; i++) {
                if (
                  nodes[i].nodeType !== CONST.NODETYPE.OPERATOR &&
                  !nodes[i].isStartNode
                ) {
                  if (
                    queryBuilderValidation.canBeStartNode(nodes[i], connections)
                  ) {
                    $scope.startNodeDropdown.options.push({
                      label: nodes[i].name,
                      nodeId: nodes[i].nodeId,
                      value: i,
                    });
                  }
                }
              }
              $scope.startNodeDropdown.selected =
                $scope.startNodeDropdown.options[0];
              $scope.dialogView = 'pick_start_node';
              show = true;
              body.on('keyup', $scope.onEscapeCloseDialog);
              $timeout(function () {
                trapFocusInModal.saveActiveElement(
                  angular.element(document.activeElement)[0]
                );
                _focusTrap = trapFocusInModal.activateFocusTrap(
                  angular.element('#pick-start-modal-content'),
                  _focusTrap
                );
              });
              if ($scope.startNodeDropdown.options.length === 0)
                $scope.closeDialogBox();
            }
          );
          $rootScope.$on('queryBuilder.closeDialogBox', function (event, data) {
            $scope.closeDialogBox();
          });
          $rootScope.$on(
            'queryBuilder.setEscapeHandlerOnDialog',
            function (event, data) {
              body.on('keyup', $scope.onEscapeCloseDialog);
            }
          );
          $rootScope.$on(
            'queryBuilder.exportSavedQuery.open',
            function (event, data) {
              $scope.dialogView = 'export_saved_query';
              show = true;
              $scope.queyerBuilderModalTitle = i18n.getMessage(
                'queryBuilder.export.inProgress'
              );
              $scope.queryBuilderModalExtraText = i18n.getMessage(
                'queryBuilder.export.starting'
              );
              $scope.config.buttons = [
                {
                  label: i18n.getMessage('queryBuilder.dialogBox.cancel'),
                  callBack: null,
                },
                {
                  label: i18n.getMessage('queryBuilder.export.download'),
                  callBack: function () {
                    window.location.replace(
                      'sys_attachment.do?sys_id=' +
                        queryBuilderCanvasUtil.getExportQuerySysId()
                    );
                    show = false;
                  },
                  primary: true,
                  isDisabled: function () {
                    if (queryBuilderCanvasUtil.getExportQuerySysId())
                      return false;
                    return true;
                  },
                },
              ];
              body.on('keyup', $scope.onEscapeCloseDialog);
              $timeout(function () {
                trapFocusInModal.saveActiveElement(
                  angular.element(document.activeElement)[0]
                );
                _focusTrap = trapFocusInModal.activateFocusTrap(
                  angular.element('#export-saved-query-modal-content'),
                  _focusTrap
                );
              });
            }
          );
          $rootScope.$on(
            'queryBuilder.exportSavedQuery.success',
            function (event, data) {
              $scope.queyerBuilderModalTitle = i18n.getMessage(
                'queryBuilder.export.complete'
              );
              $scope.queryBuilderModalExtraText = i18n.getMessage(
                'queryBuilder.export.done'
              );
            }
          );
          $rootScope.$on(
            'queryBuilder.exportSavedQuery.failure',
            function (event, data) {
              $scope.queyerBuilderModalTitle = i18n.getMessage(
                'queryBuilder.export.failed'
              );
              var progressBar = angular.element('#export-progress-bar');
              if (progressBar) progressBar.addClass('progress-bar-danger');
            }
          );
        },
      ],
    };
  },
]);
