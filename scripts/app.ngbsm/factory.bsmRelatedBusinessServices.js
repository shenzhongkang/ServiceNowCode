/*! RESOURCE: /scripts/app.ngbsm/factory.bsmRelatedBusinessServices.js */
(function () {
  'use strict';
  angular
    .module('sn.ngbsm')
    .factory(
      'bsmRelatedBusinessServices',
      function (
        $q,
        $resource,
        $http,
        $rootScope,
        bsmURL,
        bsmRenderer,
        bsmGraph,
        i18n,
        bsmRESTService,
        CONST
      ) {
        var _mapCIs = {};
        var _mapBS = {};
        var _indicators = {};
        var _collapsedCisForClusters = {};
        function setBSListforCI(BS, ci_id, doAppend) {
          if (!_mapCIs.hasOwnProperty(ci_id)) {
            _mapCIs[ci_id] = {};
            _mapCIs[ci_id]._bs = [];
            angular.forEach(
              BS,
              function (bs_info, bs_id) {
                setBS(bs_info, ci_id);
                this.push(bs_id);
              },
              _mapCIs[ci_id]._bs
            );
          } else if (doAppend) {
            angular.forEach(
              BS,
              function (bs_info, bs_id) {
                if (this.indexOf(bs_id) === -1) this.push(bs_id);
              },
              _mapCIs[ci_id]._bs
            );
          }
        }
        function setBS(BS, ci_id) {
          if (!_mapBS.hasOwnProperty(BS.id)) {
            _mapBS[BS.id] = BS;
            _mapBS[BS.id]._cis = [];
          }
          if (_mapBS[BS.id]._cis.indexOf(ci_id) < 0) {
            _mapBS[BS.id]._cis.push(ci_id);
          }
        }
        function getBS() {
          return _mapBS;
        }
        function getBSforCI(ci_id) {
          var list = [];
          if (ci_id === '') {
            angular.forEach(
              _mapBS,
              function (BS) {
                this.push(BS);
              },
              list
            );
          } else if (_mapCIs.hasOwnProperty(ci_id)) {
            angular.forEach(
              _mapCIs[ci_id]._bs,
              function (bs_id) {
                this.push(_mapBS[bs_id]);
              },
              list
            );
          }
          return list;
        }
        function loadBusinessServicesForCIList(cisList, parentsOfCollapsedCis) {
          bsmRESTService
            .getRelatedServices(cisList.toString())
            .then(function (response) {
              response = JSON.parse(response);
              _mapBS = {};
              _mapCIs = {};
              angular.forEach(response.result, function (BS, ci_id) {
                setBSListforCI(BS, ci_id);
                if (parentsOfCollapsedCis[ci_id])
                  setBSListforCI(BS, parentsOfCollapsedCis[ci_id], true);
              });
              $rootScope.$broadcast('ngbsm.related_business_services_loaded');
            });
        }
        function createIndicatorsEventsQuery(indicatorKey, cisList) {
          var cmdb = _indicators[indicatorKey].cmdb_ci_field;
          var cond = _indicators[indicatorKey].conditions;
          if (!angular.isArray(cisList) || cisList.length === 0) return cond;
          var cis = [];
          angular.forEach(
            cisList,
            function (ci_id) {
              this.push([ci_id]);
              if (_collapsedCisForClusters[ci_id])
                this.push(_collapsedCisForClusters[ci_id]);
            },
            cis
          );
          var query = cond + '^' + cmdb + 'IN' + cis.concat.apply([], cis);
          return query;
        }
        function getCIsIndicatorEvents(indicatorKey, cisList) {
          var cmdb = _indicators[indicatorKey].cmdb_ci_field;
          var table = _indicators[indicatorKey].table;
          var tooltip_label = _indicators[indicatorKey].tooltip_label;
          var tooltip_info = _indicators[indicatorKey].tooltip_info;
          var isAffectedCI = table === 'task_ci';
          var promise = $q.defer();
          var data = {};
          var baseUrl = '/api/now/cmdb/ui/table/' + table + '/rows';
          var sysparmFields = [
            'sys_id',
            'number',
            'short_description',
            cmdb,
            tooltip_label,
            tooltip_info,
          ];
          var sysparmQuery = createIndicatorsEventsQuery(indicatorKey, cisList);
          if (isAffectedCI) {
            sysparmFields = ['sys_id', 'ci_item', 'task', 'task.cmdb_ci'];
          }
          data['sysparm_display_value'] = 'all';
          data['sysparm_fields'] = sysparmFields.join(',');
          data['sysparm_query'] = sysparmQuery;
          var ciList = {};
          $http({
            url: baseUrl,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            data: data,
          }).then(
            function (response) {
              var result =
                response && response.data ? response.data.result : [];
              _indicators[indicatorKey]._cis = {};
              angular.forEach(result, function (node) {
                setIndicator(
                  indicatorKey,
                  ciList,
                  node,
                  isAffectedCI,
                  node[cmdb].value
                );
              });
              allInfoCollected();
              promise.resolve(response);
            },
            function (err) {
              promise.resolve();
            }
          );
          function allInfoCollected() {
            _indicators[indicatorKey]._cis = ciList;
            updateGraph(indicatorKey);
            bsmRenderer.drawAll(500);
          }
          return promise.promise;
        }
        function setIndicator(
          indicatorKey,
          ciList,
          node,
          isAffectedCI,
          ciSysId
        ) {
          if (!ciList.hasOwnProperty(ciSysId)) {
            ciList[ciSysId] = {};
          }
          var entrySysId = node.sys_id.value;
          var tooltip_label = _indicators[indicatorKey].tooltip_label;
          var tooltip_info = _indicators[indicatorKey].tooltip_info;
          ciList[ciSysId][entrySysId] = {};
          if (isAffectedCI) {
            ciList[ciSysId][entrySysId].tooltip_label = angular.isUndefined(
              node['task']
            )
              ? ''
              : node['task']['display_value'];
            ciList[ciSysId][entrySysId].tooltip_info = angular.isUndefined(
              node['task.cmdb_ci']
            )
              ? ''
              : node['task.cmdb_ci']['display_value'];
          } else {
            ciList[ciSysId][entrySysId].tooltip_label = angular.isUndefined(
              node[tooltip_label]
            )
              ? ''
              : node[tooltip_label]['display_value'];
            ciList[ciSysId][entrySysId].tooltip_info = angular.isUndefined(
              node[tooltip_info]
            )
              ? ''
              : node[tooltip_info]['display_value'];
          }
        }
        function updateGraph(indicatorKey) {
          var description = _indicators[indicatorKey].description;
          var tooltip_label = _indicators[indicatorKey].tooltip_label;
          var tooltip_info = _indicators[indicatorKey].tooltip_info;
          var nodeArray = bsmGraph.current().nodes;
          angular.forEach(nodeArray, function (node) {
            if (!node.hasOwnProperty('indicators')) {
              node.indicators = [];
            }
            var isExists = false;
            for (var i = 0; i < node.indicators.length; i++) {
              if (node.indicators[i].id == indicatorKey) {
                isExists = true;
              }
            }
            var cisEvents = {};
            if (!isExists) {
              var cisEvents = _indicators[indicatorKey]._cis[node.id] || {};
              if (_collapsedCisForClusters[node.id]) {
                angular.forEach(
                  _collapsedCisForClusters[node.id],
                  function (collapsedCID) {
                    var collapsedEvents =
                      _indicators[indicatorKey]._cis[collapsedCID];
                    for (var key in collapsedEvents) {
                      this[key] = collapsedEvents[key];
                    }
                  },
                  cisEvents
                );
              }
            }
            var size = Object.keys(cisEvents).length;
            if (size > 0) {
              var ind = {};
              var msg = '';
              ind.id = indicatorKey;
              ind.icon = _indicators[indicatorKey].icon;
              ind.show = true;
              if (
                CONST.SYS_IDS.BSM_INDICATOR_SVC_CI_ASSOC_RECORD !== indicatorKey
              ) {
                msg = i18n.getMessage(
                  'dependencies.ngbsm.related.business.services'
                );
                msg += '\n';
                ind.tooltip = msg
                  .replace('{0}', description)
                  .replace('{1}', size + ' ');
                for (var key in cisEvents) {
                  ind.tooltip +=
                    cisEvents[key].tooltip_label +
                    ' : ' +
                    cisEvents[key].tooltip_info +
                    '\n';
                }
              } else {
                msg = i18n.getMessage(
                  'dependencies.ngbsm.related.business.svc_ci_assoc'
                );
                ind.tooltip = msg.replace('{0}', size);
              }
              node.indicators.push(ind);
            }
          });
        }
        function loadIndicatorsEventsForCIList(nodeList) {
          bsmRESTService.getIndicators().then(function (response) {
            response = JSON.parse(response);
            _indicators = response.result;
            var promiseArr = [];
            angular.forEach(
              _indicators,
              function (indicatorData, indicatorKey) {
                indicatorData._cis = {};
                promiseArr.push(getCIsIndicatorEvents(indicatorKey, nodeList));
              }
            );
            if (promiseArr.length > 0) {
              $q.all(promiseArr).then(function (result) {
                $rootScope.$broadcast('ngbsm.indicators_loaded');
                $rootScope.$broadcast('ngbsm.re_render_indicator_on_map');
              });
            } else {
              $rootScope.$broadcast('ngbsm.indicators_loaded');
            }
          });
        }
        function getAvailableIndicators() {
          return _indicators;
        }
        return {
          loadDataForNodeList: function (nodeList) {
            if (nodeList.length > 0) {
              var list = [];
              var parentsOfCollapsedCis = {};
              angular.forEach(
                nodeList,
                function (node) {
                  this.push(node.id);
                  if (
                    angular.isString(node.collapsedIds) &&
                    node.collapsedIds.length !== 0
                  ) {
                    var collapsedChildren = node.collapsedIds.split(',');
                    for (var i = 0; i < collapsedChildren.length; i++) {
                      this.push(collapsedChildren[i]);
                      parentsOfCollapsedCis[collapsedChildren[i]] = node.id;
                      _collapsedCisForClusters[node.id] = collapsedChildren;
                    }
                  }
                },
                list
              );
              loadBusinessServicesForCIList(list, parentsOfCollapsedCis);
              loadIndicatorsEventsForCIList(list);
            }
          },
          getBusinessServices: function () {
            return getBS();
          },
          getBusinessServicesforCI: function (ci_id) {
            return getBSforCI(ci_id);
          },
          getIndicators: function () {
            return getAvailableIndicators();
          },
          getIndicatorsQuery: function (indicatorKey, cisList) {
            return createIndicatorsEventsQuery(indicatorKey, cisList);
          },
        };
      }
    );
})();