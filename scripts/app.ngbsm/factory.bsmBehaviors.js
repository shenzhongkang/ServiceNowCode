/*! RESOURCE: /scripts/app.ngbsm/factory.bsmBehaviors.js */
angular
  .module('sn.ngbsm')
  .factory(
    'bsmBehaviors',
    function (
      $rootScope,
      $timeout,
      bsmActions,
      bsmCamera,
      bsmCanvas,
      bsmGraph,
      bsmGraphUtilities,
      bsmGroups,
      bsmLinkLayout,
      bsmRelationships,
      bsmRenderer,
      bsmSelection,
      CONFIG,
      d3,
      bsmAccessibility,
      CONST
    ) {
      'use strict';
      var zoom = d3.behavior
        .zoom()
        .scaleExtent([0.05, 4])
        .on('zoomstart', zoomStartedHandler)
        .on('zoom', zoomedHandler)
        .on('zoomend', zoomEndedHandler);
      var drag = d3.behavior
        .drag()
        .on('dragstart', dragStartedHandler)
        .on('drag', draggedHandler)
        .on('dragend', dragEndedHandler);
      var editMode = false;
      var startedZooming = false;
      var flippedToMinimalMode = false;
      var blockInteractionUntil = 0;
      var accessibility = bsmAccessibility.state;
      var currentFocus = bsmAccessibility.currentFocus;
      $rootScope.$on('ngbsm.change_mouse_mode', switchMouseMode);
      $rootScope.$on('ngbsm.long_draw_triggered', blockInteraction);
      if (accessibility.enabled) {
        var loaded = false;
        $rootScope.$on('ngbsm.new.graph.loaded', function () {
          loaded = true;
          $timeout(function () {
            currentFocus.reset();
          });
        });
        $rootScope.$on('ngbsm.filters_changed', function () {
          if (loaded) {
            currentFocus.reset();
          }
        });
        $rootScope.$on('ngbsm.layout_change.complete', function (e, mode) {
          currentFocus.reset();
        });
        $rootScope.$on('ngbsm.svg_element_focus', function (e, datum) {
          if (
            currentFocus.lastElement &&
            currentFocus.lastElement.d3id !== datum.d3id
          ) {
            if (typeof currentFocus.lastElement.nodeId !== 'undefined') {
              nodeMouseOutHandler(currentFocus.lastElement);
            } else {
              linkMouseOutHandler(currentFocus.lastElement);
            }
          }
          var x = 0;
          var y = 0;
          if (currentFocus.type === 'node') {
            nodeMouseOverHandler(datum);
            x = -1 * datum.x * bsmCamera.getScale();
            y = -1 * datum.y * bsmCamera.getScale();
            bsmCamera.setTranslation(x, y);
            bsmCamera.moveCamera(500).done(function () {
              if (bsmRelationships.isCreatingRelationship()) {
                var found = currentFocus.datumGet(datum);
                var rect = found.getBoundingClientRect();
                var coords = {
                  x: rect.left + 12 * bsmCamera.getScale(),
                  y: rect.top + rect.height / 2 - 45,
                };
                bsmRelationships.onMouseMove(coords);
                bsmRenderer.drawAbove(0);
              }
            });
          }
          if (currentFocus.type === 'link') {
            var found = currentFocus.datumGet(datum);
            var rect = found.getBoundingClientRect();
            var coords = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2 - 45,
            };
            if (!bsmRelationships.isCreatingRelationship()) {
              bsmRelationships.onMouseMove(coords);
            }
            linkMouseOverHandler(datum);
            x =
              ((-1 * (datum.line[0].x + datum.line[3].x)) / 2) *
              bsmCamera.getScale();
            y =
              ((-1 * (datum.line[0].y + datum.line[3].y)) / 2) *
              bsmCamera.getScale();
            bsmCamera.setTranslation(x, y);
            bsmCamera.moveCamera(500);
          }
        });
      }
      function openContextMenuFromKeyboard() {
        var datum = currentFocus.currentDatum();
        var element = currentFocus.datumGet(datum);
        var rect = element.getBoundingClientRect();
        openMenu(datum, rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
      function selectNode(datum) {
        if (
          datum !== undefined &&
          datum.nodeId !== undefined &&
          !bsmSelection.nodeInSelection(datum)
        ) {
          bsmSelection.select(datum);
          $rootScope.$broadcast('ngbsm.node_selected', datum);
          $rootScope.$apply();
        }
      }
      function indicatorFocus() {
        angular.element('.dv-map-info.indicator-info').addClass('active');
        angular
          .element('.dv-map-info.indicator-info')
          .html(
            angular.element(this).find('title').text().replace(/\n/g, '<br />')
          );
      }
      function indicatorBlur() {
        angular.element('.dv-map-info.indicator-info').removeClass('active');
      }
      function a11yNavigateEnter() {
        var node = currentFocus.currentNode();
        accessibility.navigate = true;
        if (node.isReachable) {
          currentFocus.focus(node);
        } else {
          currentFocus.reset();
          currentFocus.focus(currentFocus.currentNode());
        }
      }
      function a11yNavigateExit() {
        if (accessibility.navigate) {
          accessibility.navigate = false;
          var current = currentFocus.currentDatum();
          if (current) {
            if (angular.isDefined(current.nodeId)) {
              nodeMouseOutHandler(current);
            } else {
              linkMouseOutHandler(current);
            }
          }
        }
        setTimeout(function () {
          indicatorBlur();
        });
      }
      function nodeRightClickHandler(datum) {
        if (d3.event) d3.event.preventDefault();
      }
      function nodeMouseOverHandler(datum) {
        if (d3.event) d3.event.preventDefault();
        if (bsmSelection.hasSelection()) return;
        datum.isMouseOver = true;
        datum.relatedElements =
          bsmGraphUtilities.getDirectlyRelatedNodesAndLinks(
            bsmGraph.current(),
            datum
          );
        bsmGraphUtilities.setPropertyOnGraphElements(
          datum.relatedElements,
          'isDirectlyRelated',
          true
        );
        bsmRenderer.drawAll();
      }
      function nodeMouseOutHandler(datum) {
        bsmGraphUtilities.setPropertyOnGraphElements(
          datum.relatedElements,
          'isDirectlyRelated',
          false
        );
        datum.relatedElements = undefined;
        datum.isMouseOver = false;
        bsmRenderer.drawAll();
      }
      function linkMouseOverHandler(datum) {
        datum.isMouseOver = true;
        bsmRelationships.onMouseOver(datum);
        bsmRenderer.drawAll(0);
        bsmRenderer.drawAbove(0);
      }
      function linkMouseOutHandler(datum) {
        datum.isMouseOver = false;
        bsmRelationships.onMouseOut();
        bsmRenderer.drawAll(0);
        bsmRenderer.drawAbove(0);
      }
      function linkMouseClicked(datum) {}
      function clearSelection() {
        bsmGraphUtilities.setPropertyOnGraphElements(
          bsmSelection.getSelection(),
          'isSelected',
          false
        );
        bsmSelection.clearSelection();
        $rootScope.$broadcast('ngbsm.node_selected', {});
        bsmRenderer.drawAll(0);
        if (bsmRelationships.isCreatingRelationship()) {
          bsmRelationships.abortCreation();
          bsmRenderer.drawAbove(0);
        }
      }
      function mouseDownHandler(datum) {
        if (d3.event.target !== bsmCanvas.canvas()[0][0]) {
          d3.event.stopPropagation();
          if (datum !== undefined && datum.nodeId !== undefined) {
            if (bsmRelationships.isCreatingRelationship()) {
              bsmRelationships.pickNewRelationshipTarget(datum);
              bsmRenderer.drawAbove(0);
            } else if (!bsmSelection.nodeInSelection(datum)) {
              bsmSelection.select(datum);
              $rootScope.$broadcast('ngbsm.node_selected', datum);
              currentFocus.reset(datum);
            }
          }
        } else if (d3.event.which !== 3) {
          if (bsmRelationships.isCreatingRelationship()) {
            bsmRenderer.drawAbove(0);
          }
          if (bsmSelection.hasSelection()) {
            clearSelection();
          }
          if (editMode) {
            lockNodes();
            lockHover();
            bsmSelection.onSelectionStart(normalizedLocationEvent(d3.event));
          }
        }
        $rootScope.$apply();
      }
      function mouseMoveHandler(datum) {
        if (d3.event) {
          d3.event.preventDefault();
        }
        if (bsmSelection.makingSelection()) {
          bsmGraphUtilities.setPropertyOnGraphElements(
            bsmSelection.getSelection(),
            'isSelected',
            false
          );
          bsmSelection.onSelectionChange(
            normalizedLocationEvent(d3.event),
            bsmGraph.current()
          );
          bsmGraphUtilities.setPropertyOnGraphElements(
            bsmSelection.getSelection(),
            'isSelected',
            true
          );
          bsmRenderer.drawAbove(0);
        }
        if (bsmRelationships.getLastOver() !== null) {
          bsmRelationships.onMouseMove(normalizedLocationEvent(d3.event));
          bsmRenderer.drawAbove(0);
        }
        if (bsmRelationships.isCreatingRelationship()) {
          bsmRelationships.onMouseMove(normalizedLocationEvent(d3.event));
          bsmRenderer.drawAbove(0);
        }
      }
      function mouseUpHandler(datum) {
        if (d3.event) d3.event.preventDefault();
        if (bsmSelection.makingSelection()) {
          bsmSelection.onSelectionEnd(normalizedLocationEvent(d3.event));
          unlockNodes();
          unlockHover();
          bsmRenderer.drawAbove(0);
          bsmRenderer.drawAll(0);
        }
      }
      function rightClickHandler(datum) {
        if (d3.event) {
          d3.event.preventDefault();
          d3.event.stopPropagation();
        }
        openMenu(datum, d3.event.clientX, d3.event.clientY);
      }
      function openMenu(datum, x, y) {
        var box = d3.select('svg').node().getBoundingClientRect();
        var data = {
          x: x,
          y: y,
          mapH: box.height,
          mapW: box.width,
        };
        if (datum !== undefined && datum.nodeId !== undefined)
          data.options = bsmActions.getActions('node', datum);
        else if (datum !== undefined && datum.typeName == 'reference')
          data.options = [];
        else if (datum !== undefined && datum.target !== undefined)
          data.options = bsmActions.getActions('link', datum);
        else data.options = bsmActions.getActions(undefined, datum);
        if (data.options.length > 0) {
          $timeout(function () {
            $rootScope.$broadcast('ngbsm.open_menu', data);
          });
        }
      }
      function zoomStartedHandler() {
        bsmCanvas
          .camera()
          .attr(
            'transform',
            'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')'
          );
      }
      function zoomedHandler() {
        bsmCanvas
          .camera()
          .attr(
            'transform',
            'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')'
          );
      }
      function zoomEndedHandler() {
        bsmCanvas
          .camera()
          .attr(
            'transform',
            'translate(' + zoom.translate() + ')scale(' + zoom.scale() + ')'
          );
        bsmCamera.zoomEnded();
      }
      function dragStartedHandler(d) {
        if (!editMode) lockZoom();
        lockHover();
        bsmRenderer.drawAll(0);
      }
      function draggedHandler(d) {
        if (bsmSelection.hasSelection() && d.isSelected) {
          for (var i = 0; i < bsmSelection.getSelection().nodes.length; i++)
            updateNode(bsmSelection.getSelection().nodes[i]);
          for (var i = 0; i < bsmSelection.getSelection().links.length; i++)
            bsmLinkLayout.recalculateLink(
              bsmGraph.current(),
              bsmSelection.getSelection().links[i]
            );
        } else {
          updateNode(d);
          for (var i = 0; i < bsmGraph.current().links.length; i++) {
            if (
              bsmGraph.current().links[i].target === d.nodeId ||
              bsmGraph.current().links[i].source === d.nodeId
            )
              bsmLinkLayout.recalculateLink(
                bsmGraph.current(),
                bsmGraph.current().links[i]
              );
          }
        }
        if (bsmGroups.groups().length > 0) {
          bsmGroups.update();
          bsmRenderer.drawAbove(0);
        }
        bsmRenderer.drawMinimal(0);
        function updateNode(d) {
          d.x += d3.event.dx;
          d.y += d3.event.dy;
          d.theta = Math.atan(d.y / d.x);
          d.r = Math.sqrt(d.x * d.x + d.y * d.y);
        }
      }
      function dragEndedHandler(d) {
        if (!editMode) unlockZoom();
        unlockHover();
        bsmRenderer.drawAll(0);
      }
      function keyDownHandler() {
        if (
          accessibility.navigate &&
          accessibility.enabled &&
          isAccessiblityKey(d3.event.keyCode)
        ) {
          d3.event.stopPropagation();
          var mode = bsmGraph.current().mode;
          if (d3.event.keyCode === CONST.KEYCODE_LEFT) {
            if (mode === 'horizontal') {
              bsmAccessibility.hierarchyMove('up');
            } else {
              bsmAccessibility.siblingMove('left');
            }
          } else if (d3.event.keyCode === CONST.KEYCODE_UP) {
            if (mode === 'horizontal') {
              bsmAccessibility.siblingMove('left');
            } else {
              bsmAccessibility.hierarchyMove('up');
            }
          } else if (d3.event.keyCode === CONST.KEYCODE_RIGHT) {
            if (mode === 'horizontal') {
              bsmAccessibility.hierarchyMove('down');
            } else {
              bsmAccessibility.siblingMove('right');
            }
          } else if (d3.event.keyCode === CONST.KEYCODE_DOWN) {
            if (mode === 'horizontal') {
              bsmAccessibility.siblingMove('right');
            } else {
              bsmAccessibility.hierarchyMove('down');
            }
          } else if (
            d3.event.keyCode === CONST.KEYCODE_PLUS ||
            d3.event.keyCode === CONST.KEYCODE_EQUALS
          ) {
            bsmCamera.scaleBy(2 * CONFIG.CAMERA_SCALE_AMOUNT);
            bsmCamera.moveCamera(500);
          } else if (
            d3.event.keyCode === CONST.KEYCODE_MINUS ||
            d3.event.keyCode === CONST.KEYCODE_DASH
          ) {
            bsmCamera.scaleBy(-2 * CONFIG.CAMERA_SCALE_AMOUNT);
            bsmCamera.moveCamera(500);
          } else if (d3.event.keyCode === CONST.KEYCODE_SPACE) {
            if (bsmRelationships.isCreatingRelationship()) {
              bsmRelationships.abortCreation();
              bsmRenderer.drawAbove(0);
            } else {
              openContextMenuFromKeyboard();
            }
          } else if (d3.event.keyCode === CONST.KEYCODE_ENTER) {
            if (
              bsmRelationships.isCreatingRelationship() &&
              currentFocus.type === 'node'
            ) {
              bsmRelationships.pickNewRelationshipTarget(
                currentFocus.currentNode()
              );
              bsmRenderer.drawAbove(0);
              $rootScope.$apply();
            } else {
              selectNode(currentFocus.currentDatum());
              bsmRenderer.drawAll(0);
            }
          } else if (d3.event.keyCode === CONST.KEYCODE_TAB) {
            d3.event.preventDefault();
            bsmAccessibility.tab(d3.event);
          }
        } else {
          if (d3.event.keyCode === CONST.KEYCODE_SPACE) {
            switchMouseMode();
          }
        }
        if (d3.event.keyCode === CONST.KEYCODE_ONE) {
          bsmRenderer.toggleVisualizeFlow();
          bsmRenderer.drawAll(0);
        } else if (d3.event.keyCode === CONST.KEYCODE_TWO) {
          if (bsmSelection.getSelection().nodes.length > 1) {
            bsmGroups.create(bsmSelection.getSelection().nodes);
            bsmRenderer.drawAbove(0);
          }
        }
        if (
          bsmCanvas.canvas()[0][0]['__onmousemove.zoom'] &&
          !(accessibility.navigate && accessibility.enabled)
        )
          bsmCamera.keydown(d3.event);
        function isAccessiblityKey(keycode) {
          return (
            -1 !==
            [
              CONST.KEYCODE_LEFT,
              CONST.KEYCODE_UP,
              CONST.KEYCODE_RIGHT,
              CONST.KEYCODE_DOWN,
              CONST.KEYCODE_SPACE,
              CONST.KEYCODE_ENTER,
              CONST.KEYCODE_TAB,
              CONST.KEYCODE_PLUS,
              CONST.KEYCODE_MINUS,
              CONST.KEYCODE_EQUALS,
              CONST.KEYCODE_DASH,
            ].indexOf(keycode)
          );
        }
      }
      function taskClickHandler(datum) {
        if (d3.event) {
          d3.event.preventDefault();
          d3.event.stopPropagation();
        }
        if (datum.indicatorCount) {
          var position = {
            x: datum.x - 14 - (5 + ('' + datum.indicatorCount).length * 5) / 2,
            y: datum.y + 10,
          };
          $rootScope.$broadcast('ngbsm.view_task_popover', {
            position: bsmCamera.projectToScreenCoords(position),
            count: datum.indicatorCount,
            target: datum,
          });
        }
      }
      function lockNodes() {
        bsmCanvas.visualization().selectAll('g.node').on('.drag', null);
      }
      function unlockNodes() {
        bsmCanvas.visualization().selectAll('g.node').call(drag);
      }
      function lockZoom() {
        bsmCanvas.canvas().on('.zoom', null);
      }
      function unlockZoom() {
        bsmCanvas.canvas().call(zoom);
        bsmCanvas.canvas().on('dblclick.zoom', null);
      }
      function lockHover() {
        bsmCanvas.visualization().selectAll('g.node').on('mouseover', null);
        bsmCanvas.visualization().selectAll('g.node').on('mouseout', null);
      }
      function unlockHover() {
        bsmCanvas
          .visualization()
          .selectAll('g.node')
          .on('mouseover', nodeMouseOverHandler);
        bsmCanvas
          .visualization()
          .selectAll('g.node')
          .on('mouseout', nodeMouseOutHandler);
      }
      function switchMouseMode() {
        if (editMode) {
          bsmCanvas.canvas().classed('edit-mode', false);
          bsmCanvas.canvas().classed('move-mode', true);
          unlockZoom();
        } else {
          bsmCanvas.canvas().classed('edit-mode', true);
          bsmCanvas.canvas().classed('move-mode', false);
          lockZoom();
        }
        editMode = !editMode;
        $rootScope.$broadcast('ngbsm.mouse_mode_changed', editMode);
      }
      function blockInteraction(event, data) {
        var stop = Date.now() + data.duration;
        blockInteractionUntil =
          stop > blockInteractionUntil ? stop : blockInteractionUntil;
        lockHover();
        $timeout(function () {
          if (Date.now() > blockInteractionUntil) unlockHover();
        }, data.duration + 100);
      }
      function calcLayers(evt) {
        var el = evt.target,
          x = 0,
          y = 0;
        while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
          x += el.offsetLeft - el.scrollLeft;
          y += el.offsetTop - el.scrollTop;
          el = el.offsetParent;
        }
        x = evt.clientX - x;
        y = evt.clientY - y - 45;
        return { x: x, y: y };
      }
      function normalizedLocationEvent(event) {
        if (CONFIG.FLAG_IS_IE9) return event;
        return calcLayers(event);
      }
      return {
        onNodeRightClick: nodeRightClickHandler,
        onNodeMouseOver: nodeMouseOverHandler,
        onNodeMouseOut: nodeMouseOutHandler,
        onLinkSelected: linkMouseClicked,
        onLinkMouseOver: linkMouseOverHandler,
        onLinkMouseOut: linkMouseOutHandler,
        onMouseDown: mouseDownHandler,
        onMouseMove: mouseMoveHandler,
        onMouseUp: mouseUpHandler,
        onRightClick: rightClickHandler,
        onKeyDown: keyDownHandler,
        onTaskClick: taskClickHandler,
        indicatorFocus: indicatorFocus,
        indicatorBlur: indicatorBlur,
        a11yNavigateEnter: a11yNavigateEnter,
        a11yNavigateExit: a11yNavigateExit,
        openMenu: openMenu,
        clearSelection: clearSelection,
        zoom: zoom,
        drag: drag,
      };
    }
  );