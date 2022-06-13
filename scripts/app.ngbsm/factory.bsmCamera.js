/*! RESOURCE: /scripts/app.ngbsm/factory.bsmCamera.js */
angular
  .module('sn.ngbsm')
  .factory('bsmCamera', function (bsmCanvas, bsmFilters, CONFIG, d3, CONST) {
    'use strict';
    var zoomBehavior = null;
    var targetX = 0;
    var targetY = 0;
    var targetScale = 1;
    function isCameraControlKey(event) {
      if (event.keyCode === CONST.KEYCODE_LEFT) return true;
      if (event.keyCode === CONST.KEYCODE_UP) return true;
      if (event.keyCode === CONST.KEYCODE_RIGHT) return true;
      if (event.keyCode === CONST.KEYCODE_DOWN) return true;
      return false;
    }
    function computeBoundingBox(graph) {
      var aabb = {
        x0: Number.POSITIVE_INFINITY,
        y0: Number.POSITIVE_INFINITY,
        x1: Number.NEGATIVE_INFINITY,
        y1: Number.NEGATIVE_INFINITY,
      };
      for (var i = 0; i < graph.nodes.length; i++) {
        if (
          bsmFilters.getFilterMode() === true &&
          (graph.nodes[i].isFiltered || !graph.nodes[i].isReachable)
        )
          continue;
        var n = graph.nodes[i];
        var halfW = CONFIG.CAMERA_NODE_BOX_WIDTH / 2;
        var halfH = CONFIG.CAMERA_NODE_BOX_HEIGHT / 2;
        if (n.x - halfW < aabb.x0) aabb.x0 = n.x - halfW;
        if (n.x + halfW > aabb.x1) aabb.x1 = n.x + halfW;
        if (n.y - halfH < aabb.y0) aabb.y0 = n.y - halfH;
        if (n.y + halfH > aabb.y1) aabb.y1 = n.y + halfH;
      }
      return aabb;
    }
    function clampScale() {
      var min = zoomBehavior.scaleExtent()[0];
      var max = zoomBehavior.scaleExtent()[1];
      targetScale = Math.max(min, Math.min(targetScale, max));
    }
    return {
      attach: function (d3ZoomBehavior) {
        zoomBehavior = d3ZoomBehavior;
      },
      translateBy: function (dx, dy) {
        targetX += dx;
        targetY += dy;
      },
      scaleBy: function (percent) {
        var centerCoords = this.unprojectScreenCoords({
          x: bsmCanvas.getWidth() / 2,
          y: bsmCanvas.getHeight() / 2,
        });
        if (percent >= 0)
          this.translateBy(
            -centerCoords.x * CONFIG.CAMERA_SCALE_AMOUNT,
            -centerCoords.y * CONFIG.CAMERA_SCALE_AMOUNT
          );
        else
          this.translateBy(
            centerCoords.x * CONFIG.CAMERA_SCALE_AMOUNT,
            centerCoords.y * CONFIG.CAMERA_SCALE_AMOUNT
          );
        targetScale += percent;
        clampScale();
      },
      setTranslation: function (x, y) {
        targetX = x;
        targetY = y;
      },
      getScale: function () {
        return targetScale;
      },
      setScale: function (scale) {
        var delta = scale - targetScale;
        this.scaleBy(delta);
      },
      zoomEnded: function () {
        if (zoomBehavior !== null) {
          targetX = zoomBehavior.translate()[0] - bsmCanvas.getWidth() / 2;
          targetY = zoomBehavior.translate()[1] - bsmCanvas.getHeight() / 2;
          targetScale = zoomBehavior.scale();
        }
      },
      moveCamera: function (transitionDuration, continuingMove, abrupt) {
        var end = angular.element.Deferred();
        if (zoomBehavior !== null) {
          if (!continuingMove) zoomBehavior.on('zoomstart')();
          var ix = d3.interpolate(
              zoomBehavior.translate()[0],
              targetX + bsmCanvas.getWidth() / 2
            ),
            iy = d3.interpolate(
              zoomBehavior.translate()[1],
              targetY + bsmCanvas.getHeight() / 2
            ),
            iz = d3.interpolate(zoomBehavior.scale(), targetScale);
          d3.transition()
            .duration(transitionDuration)
            .ease(
              continuingMove || abrupt ? 'poly-out' : 'poly-in-out',
              continuingMove ? 4.5 : 2.5
            )
            .tween('zoom', function () {
              return function (t) {
                zoomBehavior.scale(iz(t)).translate([ix(t), iy(t)]);
                zoomBehavior.on('zoom')();
              };
            })
            .each('end', function () {
              zoomBehavior.scale(iz(1)).translate([ix(1), iy(1)]);
              zoomBehavior.on('zoomend')();
              end.resolve();
            });
        } else {
          end.reject();
        }
        return end.promise();
      },
      snapCamera: function (transitionDuration, continuingMove) {
        if (zoomBehavior !== null) {
          zoomBehavior
            .scale(targetScale)
            .translate([
              targetX + bsmCanvas.getWidth() / 2,
              targetY + bsmCanvas.getHeight() / 2,
            ])
            .on('zoom')();
        }
      },
      keydown: function (event) {
        if (isCameraControlKey(event)) {
          if (event.altKey) {
            if (event.keyCode === CONST.KEYCODE_UP)
              this.scaleBy(CONFIG.CAMERA_SCALE_AMOUNT);
            if (event.keyCode === CONST.KEYCODE_DOWN)
              this.scaleBy(-CONFIG.CAMERA_SCALE_AMOUNT);
          } else {
            if (event.keyCode === CONST.KEYCODE_LEFT)
              this.translateBy(CONFIG.CAMERA_TRANSLATE_AMOUNT, 0);
            if (event.keyCode === CONST.KEYCODE_UP)
              this.translateBy(0, CONFIG.CAMERA_TRANSLATE_AMOUNT);
            if (event.keyCode === CONST.KEYCODE_RIGHT)
              this.translateBy(-CONFIG.CAMERA_TRANSLATE_AMOUNT, 0);
            if (event.keyCode === CONST.KEYCODE_DOWN)
              this.translateBy(0, -CONFIG.CAMERA_TRANSLATE_AMOUNT);
          }
          this.moveCamera(800, event.repeat, true);
        }
      },
      fitToScreen: function (graph) {
        var aabb = computeBoundingBox(graph);
        var yc = (aabb.y0 + aabb.y1) / 2;
        var xc = (aabb.x0 + aabb.x1) / 2;
        var zy = bsmCanvas.getInnerHeight() / (aabb.y1 - aabb.y0);
        var zx = bsmCanvas.getInnerWidth() / (aabb.x1 - aabb.x0);
        var z = zx < zy ? zx : zy;
        z = z > 1.75 ? 1.75 : z;
        z = z * 0.975;
        this.setTranslation(-xc * z, -yc * z);
        this.setScale(z);
      },
      unprojectScreenCoords: function (coords) {
        return {
          x: (coords.x - targetX - bsmCanvas.getWidth() / 2) / targetScale,
          y: (coords.y - targetY - bsmCanvas.getHeight() / 2) / targetScale,
        };
      },
      projectToScreenCoords: function (coords) {
        return {
          x: coords.x * targetScale + targetX + bsmCanvas.getWidth() / 2,
          y: coords.y * targetScale + targetY + bsmCanvas.getHeight() / 2,
        };
      },
    };
  });