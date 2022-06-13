/*! RESOURCE: /scripts/app.ngbsm/directive.snMapSettings.js */
angular.module('sn.ngbsm').directive('snMapSettings', [
  '$compile',
  '$timeout',
  'bsmSettings',
  'i18n',
  '$rootScope',
  'CONST',
  function ($compile, $timeout, bsmSettings, i18n, $rootScope) {
    'use strict';
    return {
      restrict: 'E',
      scope: {
        settings: '=',
      },
      replace: true,
      template:
        '' +
        '<div class="sn-map-settings">' +
        '	<button class="sn-ms-toggle btn btn-icon icon-configuration" data-test-id="dv_btnSettings" aria-expanded="{{open}}" sn-tooltip-basic="{{buttonLabel}}" aria-haspopup="true" aria-label="{{buttonLabel}}" type="button"></button>' +
        '</div>',
      controller: function ($scope, $element, CONST) {
        $scope.settings = bsmSettings.get();
        $scope.buttonLabel = i18n.getMessage('Map Settings');
        $scope.setMaxLevels = bsmSettings.setMaxLevels;
        $scope.resetFilters = bsmSettings.resetFilters;
        $scope.saveFilters = bsmSettings.saveFilters;
        $scope.loadFilters = bsmSettings.loadFilters;
        $scope.runScript = bsmSettings.runScript;
        $scope.applyPredefinedFilter = bsmSettings.applyPredefinedFilter;
        $scope.uniqueLabelId = new Date().getTime();
        $scope.stopPropagation = function (event) {
          event.stopPropagation();
        };
        $rootScope.$on('ngbsm_post_reset', function () {
          $scope.resetFilters(false);
        });
        $scope.enterToggle = function (event, key, scope) {
          scope = scope || $scope;
          if (
            event.keyCode === CONST.KEYCODE_ENTER ||
            event.keyCode === CONST.KEYCODE_SPACE
          ) {
            scope[key] = !scope[key];
          }
        };
        $scope.keyup = function (e) {
          if (e.keyCode === CONST.KEYCODE_ESC) {
            if ($scope.open) {
              $element.find('> button').click();
            }
          }
        };
      },
      link: function (scope, element, attrs) {
        scope.open = false;
        var body = angular.element(document).find('body');
        var toggle = angular.element(element.children()[0]);
        var container = $compile(html())(scope);
        body.append(container);
        var popover = angular.element(container.children()[0]);
        var arrow = angular.element(popover.children()[0]);
        var content = angular.element(popover.children()[1]);
        var drilldown = angular.element(popover.children()[2]);
        toggle.on('click', function () {
          if (!scope.open) {
            togglePopover();
          }
        });
        popover.on('transitionend', function (event) {
          if (event.originalEvent) event = event.originalEvent;
          if (event.propertyName !== 'opacity') return;
          if (!scope.open) popover.css('display', 'none');
          scope.$digest();
        });
        function togglePopover() {
          scope.open = !scope.open;
          if (scope.open) {
            requestAnimationFrame(function () {
              body.on('click', checkClick);
              angular.element(window).on('resize', updatePopover);
              popover.css('display', 'block');
              popover.css('opacity', 0);
              popover.css('transform', 'translate(0px, 6px)');
              var successful = updatePopover();
              if (successful) {
                requestAnimationFrame(function () {
                  popover.css('opacity', 1);
                  popover.css('transform', '');
                });
              }
            });
          } else {
            popover.css('opacity', 0);
            popover.css('transform', 'translate(0px, 6px)');
            if (document.documentMode < 10) popover.css('display', 'none');
          }
        }
        function updatePopover() {
          var offsets = absoluteOffset(toggle[0]);
          var tdx = toggle[0].clientWidth / 2;
          var tdy = toggle[0].clientHeight + 3;
          var dx = popover[0].clientWidth / 2;
          container.css('left', offsets.left + tdx - dx + 'px');
          container.css('top', offsets.top + tdy + 'px');
          var space = 6;
          var ady = 14;
          if (offsets.left + tdx + dx > body[0].clientWidth - space) {
            var adjust =
              body[0].clientWidth - space - (offsets.left + tdx + dx);
            var adx = popover[0].clientWidth / 2 - adjust;
            container.css('margin-left', adjust + 'px');
            arrow.css('left', adx + 'px');
          }
          var height = body[0].clientHeight - space - (offsets.top + tdy + ady);
          content.css('max-height', height + 'px');
          var toggleMidX = offsets.left + toggle[0].clientWidth / 2;
          var toggleMidY = offsets.top + toggle[0].clientHeight / 2;
          if (
            height < 75 ||
            document.elementFromPoint(toggleMidX, toggleMidY) !== toggle[0]
          ) {
            closePopover();
            return false;
          }
          return true;
        }
        function closePopover() {
          togglePopover();
          body.off('click', checkClick);
          angular.element(window).off('resize', updatePopover);
        }
        function checkClick(event) {
          if (scope.open) {
            if (!popover[0].contains(event.target)) {
              closePopover();
            }
          }
        }
        function absoluteOffset(element) {
          var left = 0;
          var top = 0;
          var current = element;
          while (current !== null) {
            left += current.offsetLeft;
            top += current.offsetTop;
            left -= current.scrollLeft;
            top -= current.scrollTop;
            current = current.offsetParent;
          }
          return {
            left: left,
            top: top,
          };
        }
        function html() {
          return (
            '	<div class="sn-ms-popover">' +
            '		<aside class="popover fade bottom in">' +
            '			<div class="arrow"></div>' +
            '			<div class="popover-content primary-content" sn-focus-trap="' +
            i18n.getMessage('Map Settings') +
            '" open-model="open"  ng-keyup="keyup($event)">' +
            '				<div class="popover-body">' +
            '					<h4>' +
            '						<span>' +
            i18n.getMessage('Map Settings') +
            '</span>' +
            '						<span class="refresh pull-right icon-refresh" ng-click="resetFilters(false)">' +
            i18n.getMessage('Reset') +
            '</span>' +
            '					</h4>' +
            '					<label class="like-legend" for="save-custom-settings-{{::$id}}">' +
            i18n.getMessage('Save Custom Settings') +
            '</label>' +
            '					<div class="row action-row">' +
            '						<span class="col-sm-9 left">' +
            '							<input class="form-control" type="text" id="save-custom-settings-{{::$id}}" placeholder="' +
            i18n.getMessage('Custom Settings Name') +
            '" ng-model="settings.saveName" ng-keydown="stopPropagation($event)" data-test-id="dv_saveFilterTextId"/> ' +
            '						</span>' +
            '						<span class="col-sm-3 right" >' +
            '							<button type="submit" class="btn btn-primary" data-test-id="dv_saveFilterButtonId" ng-click="saveFilters()">' +
            i18n.getMessage('Save') +
            '</button>' +
            '						</span>' +
            '					</div>' +
            '					<label class="like-legend" id="load-custom-settings-{{::$id}}-label">' +
            i18n.getMessage('Load Custom Settings') +
            '</label>' +
            '					<div class="row action-row">' +
            '						<span class="col-sm-9 left">' +
            '							<sn-dropdown data="settings.savedFilters" id="load-custom-settings-{{::$id}}"></sn-dropdown>' +
            '						</span>' +
            '						<span class="col-sm-3 right">' +
            '							<button type="submit" class="btn btn-primary" data-test-id="dv_loadFilterButtonId" ng-click="loadFilters(true)">' +
            i18n.getMessage('Load') +
            '</button>' +
            '						</span>' +
            '					</div>' +
            '					<label class="like-legend" id="predefined-filters-{{::$id}}-label">' +
            i18n.getMessage('Predefined Filters') +
            '</label>' +
            '					<div class="row action-row">' +
            '						<span class="col-sm-9 left">' +
            '							<sn-dropdown data="settings.savedPredefinedFilter" id="predefined-filters-{{::$id}}"></sn-dropdown>' +
            '						</span>' +
            '						<span class="col-sm-3 right">' +
            '							<button type="submit" class="btn btn-primary" data-test-id="dv_applyPredefinedFilter" ng-click="applyPredefinedFilter(false)">' +
            i18n.getMessage('Apply') +
            '</button>' +
            '						</span>' +
            '					</div>' +
            '					<label class="like-legend" id="dependency-type-{{::$id}}-label">' +
            i18n.getMessage('Dependency Type') +
            '</label>' +
            '					<div class="row action-row">' +
            '						<span class="col-sm-9 left">' +
            '							<sn-dropdown changed="onMapScriptChange" data="settings.savedScripts" id="dependency-type-{{::$id}}"></sn-dropdown>' +
            '						</span>' +
            '						<span class="col-sm-3 right">' +
            '							<button type="submit" class="btn btn-primary" ng-disabled="scriptLoading" data-test-id="dv_runScriptButtonId" ng-click="runScript(false)">' +
            i18n.getMessage('Apply') +
            '</button>' +
            '						</span>' +
            '					</div>' +
            '					<label class="like-legend"  for="max-levels-{{::$id}}-input">' +
            i18n.getMessage('Max Levels') +
            '</label>' +
            '					<div class="row action-row">' +
            '						<span class="col-sm-9 left">' +
            '							<sn-number-spinner data="settings.maxLevels" min="1" max="49" id="max-levels-{{::$id}}"></sn-number-spinner>' +
            '						</span>' +
            '						<span class="col-sm-3 right">' +
            '							<button type="submit" class="btn btn-primary" data-test-id="dv_applyLevelButtonId" ng-click="setMaxLevels()">' +
            i18n.getMessage('Apply') +
            '</button>' +
            '						</span>' +
            '					</div>' +
            '					<sn-checklist ng-repeat="filter in settings.filters | isValidFilterTypes" data="filter" unique-label="{{uniqueLabelId}}" uitype="switch"></sn-checklist>' +
            '					<legend>' +
            i18n.getMessage('Display') +
            '</legend>' +
            '					<div class="row">' +
            '						<label class="pull-left display-options-color" id="mode_{{::$id}}-label">' +
            i18n.getMessage('Remove Filtered Items') +
            '</label>' +
            '						<div class="input-switch pull-right">' +
            '							<input tabindex="-1" type="checkbox" id="mode_{{::$id}}" name="mode_{{::$parent.$id}}" ng-model="settings.filterMode" data-test-id="dv_input_filterMode"></input>' +
            '							<label tabindex="0" ng-keydown="enterToggle($event, \'filterMode\', settings)" aria-labelledby="mode_{{::$id}}-label" aria-checked="{{settings.filterMode}}" role="checkbox" class="switch" for="mode_{{::$id}}"></label>' +
            '						</div>' +
            '					</div>' +
            '					<div class="row">' +
            '						<label class="pull-left display-options-color" id="layout_{{::$id}}-label">' +
            i18n.getMessage('Run Layout Automatically') +
            '</label>' +
            '						<div class="input-switch pull-right">' +
            '							<input tabindex="-1" type="checkbox" id="layout_{{::$id}}" name="layout_{{::$parent.$id}}" ng-model="settings.filterAutoLayout" data-test-id="dv_input_filterAutoLayout"></input>' +
            '							<label tabindex="0" ng-keydown="enterToggle($event, \'filterAutoLayout\', settings)" aria-labelledby="layout_{{::$id}}-label" aria-checked="{{settings.filterAutoLayout}}" role="checkbox" class="switch" for="layout_{{::$id}}"></label>' +
            '						</div>' +
            '					</div>' +
            '					<div class="row">' +
            '						<label class="pull-left display-options-color" id="fit_{{::$id}}-label">' +
            i18n.getMessage('Fit To Screen Automatically') +
            '</label>' +
            '						<div class="input-switch pull-right">' +
            '							<input tabindex="-1" type="checkbox" id="fit_{{::$id}}" name="fit_{{::$parent.$id}}" ng-model="settings.filterAutoFit" data-test-id="dv_input_filterAutoFit"></input>' +
            '							<label tabindex="0" ng-keydown="enterToggle($event, \'filterAutoFit\', settings)" aria-labelledby="fit_{{::$id}}-label" aria-checked="{{settings.filterAutoFit}}" role="checkbox" class="switch" for="fit_{{::$id}}"></label>' +
            '						</div>' +
            '					</div>' +
            '				</div>' +
            '			</div>' +
            '		</aside>' +
            '	</div>'
          );
        }
      },
    };
  },
]);