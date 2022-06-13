/*! RESOURCE: /scripts/app.ngbsm/factory.bsmFilters.js */
angular.module('sn.ngbsm').filter('isValidFilterTypes', function () {
  return function (input) {
    var out = [];
    for (var i = 0; i < input.length; i++) {
      if (
        input[i].type === 'node' ||
        input[i].type === 'link' ||
        input[i].type === 'task'
      ) {
        out.push(input[i]);
      }
    }
    return out;
  };
});
angular
  .module('sn.ngbsm')
  .factory(
    'bsmFilters',
    function (
      $resource,
      $rootScope,
      bsmGraph,
      bsmGraphUtilities,
      CONFIG,
      i18n,
      bsmRESTService
    ) {
      'use strict';
      var api = null;
      var current = [];
      var filters = $resource('/api/now/table/ngbsm_filter');
      var scriptsResource = $resource('/api/now/table/ngbsm_script');
      var removeFilteredItems = CONFIG.FILTERS_REMOVE_FILTERED_ITEMS;
      var scriptsList = [];
      var taskFilter = {
        label: i18n.getMessage('dependencies.ngbsm.filteres.task.types'),
        property: 'name',
        type: 'task',
        expanded: false,
        options: [],
      };
      var previousFilters = [];
      var loadCluster = false;
      setToDefault();
      function firePostResetEvent() {
        $rootScope.$broadcast('ngbsm_post_reset');
      }
      function postFilter(user, name) {
        var payload = {
          filter: JSON.stringify(current),
          name: name,
          user: user,
        };
        return filters.save(payload).$promise.then(function (response) {
          return response.result;
        });
      }
      function setToDefault() {
        var set = CONFIG.FILTERS_DEFAULT;
        current.length = 0;
        for (var i = 0; i < set.length; i++) {
          current.push({
            label: set[i].label,
            value: set[i].value,
            property: set[i].property,
            type: set[i].type,
            expanded: set[i].expanded,
            options: set[i].options,
            model: set[i].model,
          });
        }
        setOptionsToTrue(taskFilter.options);
        taskFilter.expanded = false;
        current.push(taskFilter);
        return filters;
      }
      function setOptionsToTrue(options) {
        for (var i = 0; i < options.length; i++) {
          if (options[i].type !== 'selection') options[i].checked = true;
        }
      }
      function clearAllFilters(graph) {
        bsmGraphUtilities.setPropertyOnGraphElements(
          graph,
          'isFiltered',
          false
        );
        bsmGraphUtilities.setPropertyOnGraphElements(
          graph,
          'isFilteredImplicitly',
          false
        );
        bsmGraphUtilities.setPropertyOnGraphElements(
          graph,
          'isReachable',
          true
        );
      }
      function applyNodeFilters(graph) {
        for (var i = 0; i < graph.nodes.length; i++) {
          if (!graph.nodes[i].isFiltered) {
            if (isNodeFiltered(graph, graph.nodes[i])) {
              applyNodeFilter(graph, graph.nodes[i]);
            }
          }
        }
      }
      function applyLinkFilters(graph) {
        for (var i = 0; i < graph.links.length; i++) {
          if (!graph.links[i].isFiltered) {
            if (isLinkFiltered(graph, graph.links[i])) {
              applyLinkFilter(graph, graph.links[i]);
            }
          }
        }
      }
      function applyNodeFilter(graph, node) {
        node.isFiltered = true;
        var links = bsmGraphUtilities.getLinksAttachedToNode(graph, node);
        for (var i = 0; i < links.length; i++)
          links[i].isFilteredImplicitly = true;
      }
      function applyLinkFilter(graph, link) {
        link.isFiltered = true;
      }
      function isNodeFiltered(graph, node) {
        if (node === graph.root) return false;
        for (var i = 0; i < current.length; i++) {
          if (current[i].type === 'node') {
            for (var j = 0; j < current[i].options.length; j++) {
              var fail = false;
              var curOptChecked = current[i].options[j].checked;
              var nodePropVal = node[current[i].property];
              var filterPropVal = current[i].options[j].value;
              if (nodePropVal instanceof Array) {
                if (nodePropVal.indexOf(filterPropVal) != -1) fail = true;
              } else if (nodePropVal == filterPropVal) fail = true;
              if (!curOptChecked && fail) return true;
            }
          }
        }
        return false;
      }
      function isLinkFiltered(graph, link) {
        for (var i = 0; i < current.length; i++) {
          if (current[i].type === 'link') {
            for (var j = 0; j < current[i].options.length; j++) {
              if (
                !current[i].options[j].checked &&
                link[current[i].property] == current[i].options[j].value
              )
                return true;
            }
          }
        }
        return false;
      }
      function enumerateFilters(graph) {
        if (!loadCluster) {
          previousFilters = [];
          angular.copy(current, previousFilters);
        } else {
          current.length = 0;
          angular.copy(previousFilters, current);
          loadCluster = false;
        }
        for (var i = 0; i < current.length; i++) {
          if (!angular.isUndefined(current[i])) {
            enumerateFilter(graph, current[i]);
          }
        }
      }
      function enumerateFilter(graph, pFilter) {
        if (pFilter.type === 'link') enumerateLinkFilter(graph, pFilter);
        else if (pFilter.type === 'node') enumerateNodeFilter(graph, pFilter);
      }
      function enumerateNodeFilter(graph, filter) {
        var oldOptions = filter.options;
        filter.options = [];
        var optionsMap = {};
        var ciLabels = {};
        for (var i = 0; i < graph.nodes.length; i++) {
          var poropertyValue = graph.nodes[i][filter.property];
          if (poropertyValue instanceof Array)
            for (var q = 0; q < poropertyValue.length; q++)
              addKeyToOptionsMap(poropertyValue[q], i);
          else addKeyToOptionsMap(poropertyValue, i);
        }
        function addKeyToOptionsMap(pKey, index) {
          var key = pKey ? pKey.toString() : 'undefined';
          if (optionsMap[key]) {
            ciLabels[key] = graph.nodes[index].classLabel;
            optionsMap[key] += 1;
          } else {
            ciLabels[key] = graph.nodes[index].classLabel;
            optionsMap[key] = 1;
          }
        }
        var keys = Object.keys(optionsMap);
        for (var i = 0; i < keys.length; i++) {
          if (!angular.isUndefined(keys[i]) && keys[i] !== 'undefined') {
            if (
              filter.label ===
              i18n.getMessage('dependencies.ngbsm.filteres.ci.type')
            )
              filter.options.push(
                createOptionEntry(
                  keys[i],
                  optionsMap,
                  oldOptions,
                  false,
                  ciLabels
                )
              );
            else
              filter.options.push(
                createOptionEntry(
                  keys[i],
                  optionsMap,
                  oldOptions,
                  true,
                  ciLabels
                )
              );
          }
        }
        filter.options.sort(compareLabels);
      }
      function enumerateLinkFilter(graph, filter) {
        var oldOptions = filter.options;
        filter.options = [];
        var optionsMap = {};
        for (var i = 0; i < graph.links.length; i++) {
          var key = graph.links[i][filter.property]
            ? graph.links[i][filter.property].toString()
            : 'undefined';
          if (optionsMap[key]) optionsMap[key] += 1;
          else optionsMap[key] = 1;
        }
        var keys = Object.keys(optionsMap);
        for (var i = 0; i < keys.length; i++) {
          filter.options.push(
            createOptionEntry(keys[i], optionsMap, oldOptions, true)
          );
        }
        filter.options.sort(compareLabels);
      }
      function enumerateTaskFilter(indicators) {
        var oldOptions = taskFilter.options;
        taskFilter.options = [];
        angular.forEach(indicators, function (indicatorData, indicatorID) {
          var taskLabels = {};
          taskLabels[indicatorID] = indicatorData.label;
          var opt = createOptionEntry(
            indicatorID,
            {},
            oldOptions,
            false,
            taskLabels
          );
          opt.icon = indicatorData.icon;
          taskFilter.options.push(opt);
        });
        taskFilter.options.sort(compareLabels);
      }
      function createOptionEntry(key, map, old, dontFormat, labelMap) {
        return {
          label: dontFormat ? key : formatKeyAsLabel(key, labelMap),
          value: key === 'undefined' ? undefined : key,
          count: map[key],
          checked: oldOptionSelectedValueOrTrue(old, key),
          icon: key,
        };
      }
      function formatKeyAsLabel(key, map) {
        if (key === 'undefined') return '( No Value )';
        if (map && map[key]) return map[key];
        var capitalArray = key.match(/[A-Z][a-z]+/g);
        capitalArray = capitalArray == null ? [key] : capitalArray;
        var words = [];
        for (var i = 0; i < capitalArray.length; i++) {
          var underbarArray = capitalArray[i].split('_');
          for (var j = 0; j < underbarArray.length; j++)
            words.push(underbarArray[j]);
        }
        var string = '';
        for (var i = 0; i < words.length; i++)
          string += capitalize(words[i]) + ' ';
        return string;
      }
      function oldOptionSelectedValueOrTrue(old, key) {
        for (var i = 0; i < old.length; i++)
          if (old[i].value === key) return old[i].checked;
        return true;
      }
      function capitalize(string) {
        var known = {
          cmdb: 'CMDB',
          ci: 'CI',
        };
        return known[string]
          ? known[string]
          : string.charAt(0).toUpperCase() + string.slice(1);
      }
      function compareLabels(a, b) {
        if (a.label > b.label) return 1;
        if (a.label < b.label) return -1;
        return 0;
      }
      function taskTypesLoaded(event, data) {
        api.enumerateFilters(bsmGraph.current());
      }
      return (api = {
        enumerateFilter: enumerateFilter,
        firePostResetEvent: firePostResetEvent,
        getFilters: function () {
          return current;
        },
        getTaskFilter: function () {
          return taskFilter;
        },
        applyFilters: function (graph) {
          clearAllFilters(graph);
          applyLinkFilters(graph);
          applyNodeFilters(graph);
          if (removeFilteredItems) bsmGraphUtilities.flagReachable(graph);
        },
        enumerateFilters: function (graph) {
          enumerateFilters(graph);
        },
        enumerateTaskFilters: function (indicators) {
          enumerateTaskFilter(indicators);
        },
        replaceFilters: function (filters) {
          current.length = 0;
          for (var i = 0; i < filters.length; i++) {
            var newFilter = angular.copy(filters[i]);
            current.push(newFilter);
            if (newFilter.type === 'task') taskFilter = newFilter;
          }
          $rootScope.$broadcast('dv_filter_updated', current);
        },
        serializeFilters: function () {
          return JSON.stringify(current);
        },
        saveFilters: function (user, name) {
          return postFilter(user, name).then(
            function () {
              var translatedMsg = i18n.getMessage(
                'dependencies.ngbsm.filteres.saved.msg'
              );
              $rootScope.$broadcast('ngbsm.success', {
                success: translatedMsg + " '" + name + "'",
              });
            },
            function (response) {
              var message = i18n.getMessage(
                'dependencies.ngbsm.filteres.saved.msg.failed'
              );
              if (
                response &&
                response.data &&
                response.data.error &&
                response.data.error.detail
              ) {
                if (
                  response.data.error.detail.indexOf(
                    'Prevent Duplicate Filter Name'
                  ) > 0
                )
                  message = i18n.getMessage(
                    'dependencies.ngbsm.filteres.saved.msg.duplicated'
                  );
              }
              $rootScope.$broadcast('ngbsm.error', {
                error: message,
              });
            }
          );
        },
        loadFilters: function (user) {
          return filters
            .get({
              sysparm_query: 'ORDERBYDESCname^user=' + user,
              sysparm_fields: 'name,filter',
            })
            .$promise.then(function (response) {
              return response.result;
            });
        },
        loadScripts: function (user) {
          return scriptsResource
            .get({
              sysparm_query: 'ORDERBYname^active=true',
              sysparm_fields: 'sys_id,name',
            })
            .$promise.then(function (response) {
              scriptsList = response.result;
              return scriptsList;
            });
        },
        loadPredefinedFilter: function () {
          return bsmRESTService.getFilters().then(function (response) {
            if (!response) {
              console.log(
                'loadPredefinedFilter()->getPredefinedFilterList no response'
              );
              return;
            } else {
              return JSON.parse(response).predefinedFilters;
            }
          });
        },
        getMapScripts: function () {
          return scriptsList;
        },
        resetFilters: function () {
          setToDefault();
        },
        getFilterMode: function () {
          return removeFilteredItems;
        },
        setFilterMode: function (mode) {
          removeFilteredItems = mode;
        },
        setCurrentFormElementOption: function (key, value) {
          for (var i = 0; i < current.length; i++) {
            if (current[i].type !== 'formElement') {
              continue;
            }
            if (current[i].model === key) {
              current[i].value = value;
              break;
            }
          }
        },
        getCurrentPropertyValue: function (key) {
          for (var i = 0; i < current.length; i++) {
            if (current[i].type !== 'formElement') {
              continue;
            }
            if (current[i].model === key) {
              return current[i].value;
            }
          }
        },
        loadingCluster: function () {
          loadCluster = true;
        },
      });
    }
  );