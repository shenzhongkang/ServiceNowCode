/*! RESOURCE: /scripts/app.ngbsm/factory.bsmViewRepository.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmViewRepository',
    function (
      $resource,
      $rootScope,
      $timeout,
      bsmCanvas,
      bsmFilters,
      bsmGraphUtilities,
      bsmRasterizer,
      CONFIG,
      i18n
    ) {
      'use strict';
      var views = $resource('/api/now/table/ngbsm_view');
      var api = null;
      function saveView(graph, user, ci) {
        var thumbnail = 'data:image/png;base64,';
        var graphString = bsmGraphUtilities.serializeGraph(graph);
        api.getLastVersion(user, ci).then(
          function (version) {
            postWithVersion(version + 1);
          },
          function () {
            postWithVersion(1);
          }
        );
        function postWithVersion(version) {
          thumbnail = createThumbnail(graph.root.name, version);
          if (CONFIG.FLAG_IS_FIREFOX) {
            $timeout(function () {
              thumbnail = createThumbnail(graph.root.name, version);
              api
                .postView({
                  user: user,
                  configuration_item: ci,
                  version: version,
                  graph: graphString,
                  filter: bsmFilters.serializeFilters(),
                  thumbnail: thumbnail,
                })
                .then(success, failure);
            }, 100);
          } else {
            api
              .postView({
                user: user,
                configuration_item: ci,
                version: version,
                graph: graphString,
                filter: bsmFilters.serializeFilters(),
                thumbnail: thumbnail,
              })
              .then(success, failure);
          }
        }
        function success(response) {
          $rootScope.$broadcast('ngbsm.view_saved', {
            image: thumbnail,
            name: graph.root.name,
          });
        }
        function failure(error) {
          $rootScope.$broadcast('ngbsm.error', {
            error: 'Could not save your current view',
          });
        }
      }
      function loadView(user, ci) {
        api.getViews(user, ci).then(success, failure);
        function success(views) {
          $rootScope.$broadcast('ngbsm.views_loaded', views);
        }
        function failure(error) {
          $rootScope.$broadcast('ngbsm.warning', {
            warning: i18n.getMessage('dependencies.ngbsm.repository.warning'),
          });
        }
      }
      function createThumbnail(title, version) {
        var canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        var ctx = canvas.getContext('2d');
        createGraphThumbnail(ctx, title, version);
        return canvas.toDataURL('image/png');
      }
      function createGraphThumbnail(ctx, title, version) {
        var img = new Image();
        img.src = bsmRasterizer.rasterizeAsPNG();
        var scale =
          img.naturalWidth > img.naturalHeight
            ? 256 / img.naturalHeight
            : 256 / img.naturalWidth;
        var dx = (img.naturalWidth * scale - 256) / -2;
        var dy = (img.naturalHeight * scale - 256) / -2;
        ctx.drawImage(
          img,
          dx,
          dy,
          img.naturalWidth * scale,
          img.naturalHeight * scale
        );
        ctx.fillStyle = 'rgba(244,244,244,0.75)';
        ctx.fillRect(0, 0, 256, 32);
        ctx.fillStyle = 'rgb(33,33,33)';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(title, 8, 22);
        ctx.fillStyle = 'rgba(244,244,244,0.75)';
        ctx.fillRect(0, 224, 256, 32);
        ctx.fillStyle = 'rgb(66,66,66)';
        ctx.font = '16px Arial';
        ctx.fillText('Version ' + version, 8, 246);
        ctx.fillStyle = 'rgba(99,99,99,0.75)';
        ctx.strokeRect(0, 0, 256, 256);
      }
      return (api = {
        saveView: function (graph, user, ci) {
          saveView(graph, user, ci);
        },
        loadView: function (user, ci) {
          loadView(user, ci);
        },
        postView: function (payload) {
          return views.save(payload).$promise.then(function (response) {
            return response.result;
          });
        },
        getLastVersion: function (user, ci) {
          return views
            .get({
              sysparm_query:
                'ORDERBYDESCversion^configuration_item=' + ci + '^user=' + user,
              sysparm_limit: 1,
            })
            .$promise.then(function (response) {
              var version = 0;
              if (
                response &&
                angular.isArray(response.result) &&
                response.result.length !== 0
              )
                version = response.result[0].version;
              return parseInt(version) || 0;
            });
        },
        getViews: function (user, ci) {
          return views
            .get({
              sysparm_query:
                'ORDERBYDESCversion^configuration_item=' + ci + '^user=' + user,
            })
            .$promise.then(function (response) {
              return response.result;
            });
        },
        getView: function (user, ci, version) {
          return views
            .get({
              sysparm_query:
                'ORDERBYDESCversion^configuration_item=' +
                ci +
                '^user=' +
                user +
                '^version=' +
                version,
            })
            .$promise.then(function (response) {
              return response.result;
            });
        },
      });
    }
  );