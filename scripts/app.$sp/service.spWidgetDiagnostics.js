/*! RESOURCE: /scripts/app.$sp/service.spWidgetDiagnostics.js */
angular
  .module('sn.$sp')
  .factory(
    'spWidgetDiagnostics',
    function ($rootScope, $http, spModal, i18n, $ocLazyLoad) {
      'use strict';
      var diagnostics = {};
      diagnostics.widgetClasses = [
        'widget-uncategorized',
        'widget-oob',
        'widget-cloned',
        'widget-new',
        'widget-customized',
      ];
      diagnostics.i18nStrings = {
        widget: i18n.getMessage('Widget'),
        cloned: i18n.getMessage('Cloned'),
        new_widget: i18n.getMessage('New'),
        customized: i18n.getMessage('Customized'),
        basesystem: i18n.getMessage('Base system'),
        color_codes: i18n.getMessage('Color codes'),
        compare_with_oob: i18n.getMessage('Compare with Base system'),
        compare_with_prev: i18n.getMessage('Compare with previous version'),
        widget_diagnostics: i18n.getMessage('Widget Diagnostics'),
        open_in_platform: i18n.getMessage('Open widget in platform'),
        open_diagnostics_info: i18n.getMessage('Open diagnostics information'),
      };
      diagnostics.widgetMsgs = [
        'Uncategorized',
        diagnostics.i18nStrings.basesystem,
        diagnostics.i18nStrings.cloned,
        diagnostics.i18nStrings.new_widget,
        diagnostics.i18nStrings.customized,
      ];
      var body = $('body');
      var legendContent =
        '<button class="fa fa-info-circle legend-icon" data-original-title="' +
        diagnostics.i18nStrings.color_codes +
        '" data-toggle="popover" data-trigger="focus" data-placement="left"></button>' +
        '<div class="widget-legend-wrapper popper-content hide" id="widget-legend-wrapper">' +
        '<div class="widget-legend-info" tabindex="-1">' +
        '<div><span class="legend-dot-yellow"></span><span>' +
        diagnostics.i18nStrings.cloned +
        '</span></div>' +
        '<div><span class="legend-dot-blue"></span><span>' +
        diagnostics.i18nStrings.new_widget +
        '</span></div>' +
        '<div><span class="legend-dot-red"></span><span>' +
        diagnostics.i18nStrings.customized +
        '</span></div>' +
        '<div><span class="legend-dot-green"></span><span>' +
        diagnostics.i18nStrings.basesystem +
        '</span></div>' +
        '</div>' +
        '</div>';
      var diagnosticIcon =
        '<button class="fa fa-info-circle widget-diagnostics-info"></button>';
      var locationChangeHandle;
      function enableDiagnostics() {
        if (!diagnostics.depsLoaded) {
          $ocLazyLoad
            .load(['/styles/sp-diagnostics-tool.css'])
            .finally(function () {
              diagnostics.depsLoaded = true;
              runDiagnostics();
            });
        } else runDiagnostics();
      }
      function runDiagnostics() {
        body.attr('data-widget-diagnostics-mode', 'true');
        getWidgetsInfoOnPage();
        updateWidgetsInfoFromServer();
        $(document).on(
          'click',
          '.widget-diagnostics-info',
          widgetInfoIconHandler
        );
        locationChangeHandle = $rootScope.$on(
          '$locationChangeStart',
          function (event, newUrl, oldUrl) {
            if (newUrl !== oldUrl && diagnostics.isEnabled)
              disableDiagnostics();
          }
        );
        diagnostics.isEnabled = true;
      }
      function addLegendToPage() {
        body.append($.parseHTML(legendContent));
      }
      function widgetInfoIconHandler(event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        var parent = $(event.target).parent();
        var parentId = parent.attr('id') || parent.attr('class');
        parentId = parentId.split(' ')[0];
        var widgetObj = diagnostics.instances.filter(function (item) {
          return item['elementId'] === parentId;
        });
        var details = widgetObj[0].widgetCustDetails;
        var bCustomized = details.category == 4 && !!details.isRecordCustomized;
        var compareBtnLabel = bCustomized
          ? diagnostics.i18nStrings.compare_with_oob
          : diagnostics.i18nStrings.open_in_platform;
        var options = {
          title: diagnostics.i18nStrings.widget_diagnostics,
          widget: 'widget-diagnostics',
          widgetInput: widgetObj[0],
          buttons: [
            {
              label: compareBtnLabel,
              primary: true,
              class: 'compare-button compare-button-oob',
            },
          ],
        };
        if (bCustomized) {
          var obj = {
            label: diagnostics.i18nStrings.compare_with_prev,
            primary: true,
            compare: 'previous',
            class: 'compare-button compare-button-prev',
          };
          options.buttons.unshift(obj);
        }
        spModal.open(options);
        setTimeout(function () {
          var compareButtons = angular.element(
            document.querySelectorAll('.compare-button')
          );
          compareButtons.unbind('click');
          compareButtons.bind('click', function (event) {
            var bComparePrev = $(event.target).hasClass('compare-button-prev');
            var url;
            var tmp;
            if (bCustomized) {
              var v1 = bComparePrev
                ? details.currentSysId
                : details.baselineSysId;
              var v2 = bComparePrev ? details.prevSysId : details.currentSysId;
              if (bComparePrev) {
                tmp = v1;
                v1 = v2;
                v2 = tmp;
              }
              url =
                'merge_form_select_version_ro.do?sysparm_hide_back_btn=true&sysparm_version1=' +
                v1 +
                '&sysparm_version2=' +
                v2;
            } else {
              url = 'sp_widget.do?sys_id=' + details.widSysId;
            }
            window.open(url, '_blank');
          });
        }, 1000);
      }
      function getWidgetsInfoOnPage() {
        var instances = [];
        var instanceArr = [];
        $("[widget='widget']").each(function (index, elem) {
          var widget = angular.element(elem).scope().widget;
          var widgetInfo = {};
          var instanceMap = {};
          widgetInfo.widgetName = widget.name;
          widgetInfo.widgetId = widget.sys_id;
          instanceMap['widgetInfo'] = widgetInfo;
          instanceMap['instanceId'] = widget.rectangle_id || widget.sys_id;
          if (!!widget.rectangle_id)
            instanceMap['elementId'] = 'x' + widget.rectangle_id;
          else {
            instanceMap['elementId'] = 'v' + widget.sys_id;
            instanceMap['isEmbeddedWidget'] = true;
          }
          var id = widget.rectangle_id || widget.sys_id;
          if (instanceArr.join('####').indexOf(id) == -1) {
            instanceArr.push(id);
            instances.push(instanceMap);
          }
        });
        diagnostics.instances = instances;
        diagnostics.instanceArr = instanceArr;
      }
      function updateWidgetsInfoFromServer() {
        $http({
          url: '/xmlhttp.do',
          method: 'POST',
          params: {
            sysparm_processor: 'SPDiagnosticsDriver',
            sysparm_name: 'categorize',
            sysparm_instances_array: JSON.stringify(diagnostics.instanceArr),
          },
          dataType: 'json',
        }).then(function (response) {
          var element = new DOMParser()
            .parseFromString(response.data, 'text/xml')
            .getElementsByTagName('xml')[0];
          var answer = element.getAttribute('answer');
          mergeWidgetsInfo(JSON.parse(answer));
          addWidgetCategoryClasses();
          addLegendToPage();
          $('[data-toggle="popover"]').popover({
            html: true,
            content: function () {
              return $('#widget-legend-wrapper').html();
            },
          });
        });
      }
      function mergeWidgetsInfo(serverObj) {
        var instances = Object.keys(serverObj);
        var size = instances.length;
        for (var i = 0; i < size; i++) {
          var instanceMap = diagnostics.instances.filter(function (item) {
            return item['instanceId'] === instances[i];
          });
          $.extend(true, instanceMap[0], serverObj[instances[i]]);
        }
      }
      function addWidgetCategoryClasses() {
        var label = diagnostics.i18nStrings.open_diagnostics_info;
        diagnostics.instances.forEach(function (item) {
          var details = item['widgetCustDetails'];
          var category = details['category'];
          var elem = $($.parseHTML(diagnosticIcon));
          elem.attr(
            'aria-label',
            details.name
              .concat(' ')
              .concat(diagnostics.widgetMsgs[category])
              .concat(' ')
              .concat(diagnostics.i18nStrings.widget)
              .concat('-')
              .concat(label)
          );
          var elemId = item['elementId'];
          var domElem;
          if (!!item.isEmbeddedWidget) {
            domElem = document.querySelectorAll('[class*=' + elemId + ']');
            $(domElem).each(function (index, _domElem) {
              var _cloneElem = elem.clone();
              $(_domElem).innerHeight() == 0
                ? _cloneElem.addClass('widget-is-empty')
                : '';
              _cloneElem.insertBefore($(_domElem).children()[0]);
            });
          } else {
            domElem = $('#' + elemId);
            domElem.innerHeight() == 0 ? elem.addClass('widget-is-empty') : '';
            elem.insertBefore(domElem.contents()[0]);
          }
          $(domElem).addClass(diagnostics.widgetClasses[category]);
        });
      }
      function disableDiagnostics() {
        var widgetClasses = diagnostics.widgetClasses.join(' ');
        body.removeAttr('data-widget-diagnostics-mode');
        $(document).off('click', '.widget-diagnostics-info');
        diagnostics.instances.forEach(function (item) {
          var elemId = item['elementId'];
          var domElem;
          if (!!item.isEmbeddedWidget) {
            domElem = document.querySelectorAll('[class*=' + elemId + ']');
            $(domElem).each(function (index, _domElem) {
              var $_domElem = $(_domElem);
              $_domElem.removeClass(widgetClasses);
              $_domElem.find('.widget-diagnostics-info').remove();
            });
          } else {
            domElem = $('#' + elemId);
            domElem.removeClass(widgetClasses);
            domElem.find('.widget-diagnostics-info').remove();
          }
          $('#' + $('.legend-icon').attr('aria-describedby')).remove();
          $('.legend-icon').remove();
          $('#widget-legend-wrapper').remove();
        });
        locationChangeHandle();
        diagnostics.isEnabled = false;
      }
      return {
        diagnostics: diagnostics,
        enableDiagnostics: enableDiagnostics,
        disableDiagnostics: disableDiagnostics,
      };
    }
  );
