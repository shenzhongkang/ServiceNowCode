/*! RESOURCE: /scripts/doctype/PageTiming14.js */
NOW.PageTiming = function () {
  'use strict';
  var categories = null;
  initialize();
  function initialize() {
    CustomEvent.observe('page_timing', _pageTiming);
    CustomEvent.observe('page_timing_network', _pageTimingNetwork);
    CustomEvent.observe('page_timing_show', _pageTimingShow);
    CustomEvent.observe('page_timing_clear', _clearTimingDiv);
    CustomEvent.observe('page_timing_client', _clientTransaction);
  }
  function _pageTiming(timing) {
    var ms;
    if (timing.startTime) ms = new Date() - timing.startTime;
    else ms = timing.ms;
    if (isNaN(ms)) return;
    _initCategories();
    var category = timing.name + '';
    ms = new Number(ms);
    if (!categories[category]) {
      categories[category] = {
        children: [],
        ms: 0,
      };
    }
    var cat = categories[category];
    if (timing.child) {
      if (timing.child.description)
        cat.children.push({
          name: timing.child.description + '',
          script_type: timing.child.type,
          ms: ms,
          sys_id: timing.child.sys_id,
          source_table: timing.child.source_table,
        });
      else cat.children.push({ name: timing.child + '', ms: ms });
    }
    cat.ms += ms;
  }
  function _pageTimingNetwork(timing) {
    if (!window._timingStartTime) timing.ms = 0;
    else if (
      window.performance &&
      performance.timing.requestStart != performance.timing.responseStart
    )
      timing.ms =
        window.performance.timing.requestStart -
        window.performance.timing.navigationStart;
    else
      timing.ms = Math.max(
        0,
        timing.loadTime - window._timingStartTime - _getTiming('SERV')
      );
    if (isNaN(timing.ms)) timing.ms = 0;
    _pageTiming(timing);
  }
  function _pageTimingShow(info) {
    if (!window._timingStartTime) return;
    _setRlCatName();
    var tot;
    if (window.performance)
      tot =
        window.performance.timing.loadEventEnd -
        window.performance.timing.navigationStart;
    else tot = new Date().getTime() - window._timingStartTime;
    if (tot > 900000) {
      _clearTimingDiv(info);
      return;
    }
    window._timingTotal = tot;
    var div = _getOrCreateTimingDiv();
    var o = { RESP: tot };
    for (var c in categories) o[c] = _getTiming(c) + '';
    var txt = new XMLTemplate('glide:page_timing_div').evaluate(o);
    div.innerHTML = txt + '';
    if (tot > 0) {
      var timingGraph = $j('.timing_graph');
      var timingGraphDiv = $j('.timingGraphDiv');
      var pageTimingExpand = $j('.page_timing_expand');
      timingGraph
        .find('.timing_network')
        .width(Math.round((_getTiming('NETW') / tot) * 100) + '%');
      timingGraph
        .find('.timing_server')
        .width(Math.round((_getTiming('SERV') / tot) * 100) + '%');
      timingGraph
        .find('.timing_browser')
        .width(Math.round((_getTiming('REND') / tot) * 100) + '%');
      if (window.performance) {
        pageTimingExpand.attr('aria-expanded', 'false');
        pageTimingExpand.attr('aria-controls', 'glide:timingBreakdown_widget');
        pageTimingExpand.addClass('icon-chevron-down');
        pageTimingExpand
          .tooltip({
            title: function () {
              if (pageTimingExpand.attr('aria-expanded') === 'true') {
                return pageTimingExpand.data('title-collapse');
              }
              return pageTimingExpand.data('title-expand');
            },
            placement: 'top',
          })
          .hideFix();
        pageTimingExpand.one('click', function () {
          var timingBreakdown = $j(
            '<table class="timing_breakdown" id="glide:timingBreakdown_widget" aria-hidden="false">' +
              '<thead>' +
              '       <th aria-hidden="true"></th>' +
              '       <th class="timing_label">Timing Type</th>' +
              '       <th>Time Range</th>' +
              '       <th>Total Time</th>' +
              '</thead>'
          );
          var events = [
            ['timing_network', 'Cache/DNS/TCP', 'fetchStart', 'connectEnd'],
            ['timing_server', 'Server', 'requestStart', 'responseEnd'],
            ['timing_browser', 'Unload', 'unloadEventStart', 'unloadEventEnd'],
            ['timing_browser', 'DOM Processing', 'domLoading', 'domComplete'],
            ['timing_browser', 'onLoad', 'loadEventStart', 'loadEventEnd'],
          ];
          for (var i = 0; i < events.length; i++) {
            var runTime =
              window.performance.timing[events[i][3]] -
              window.performance.timing[events[i][2]];
            var startTime =
              window.performance.timing[events[i][2]] -
              window.performance.timing.navigationStart +
              '-' +
              (window.performance.timing[events[i][3]] -
                window.performance.timing.navigationStart);
            timingBreakdown.append(
              $j(
                '<tr><td aria-hidden="true" class="' +
                  events[i][0] +
                  '"></td><td class="timing_label">' +
                  events[i][1] +
                  '</td><td>' +
                  startTime +
                  'ms</td><td>' +
                  runTime +
                  'ms</td></tr>'
              )
            );
          }
          timingBreakdown.insertAfter(timingGraphDiv);
        });
        pageTimingExpand.on('click', function (e) {
          var isNotExpanded = pageTimingExpand.attr('aria-expanded') === 'true';
          if (isNotExpanded) {
            pageTimingExpand
              .removeClass('icon-chevron-up')
              .addClass('icon-chevron-down');
          } else {
            pageTimingExpand
              .removeClass('icon-chevron-down')
              .addClass('icon-chevron-up');
          }
          var timingBreakdown = $j('.timing_breakdown');
          pageTimingExpand.attr('aria-expanded', !isNotExpanded);
          timingBreakdown.attr('aria-hidden', isNotExpanded);
          isNotExpanded ? timingBreakdown.hide() : timingBreakdown.show();
          pageTimingExpand.tooltip('hide');
        });
      }
    }
    var img = div.down('img');
    if (!img) img = div.down('button');
    if (!img) return;
    img.observe('click', toggle.bindAsEventListener(this));
    img.setAttribute('aria-expanded', info.show);
    if (info.show == 'true') _toggle(img);
    var a = div.down('a');
    $j(a).on('click keydown', toggleDetails);
    a.next().down().down().next().observe('click', toggleDetails);
  }
  function toggle(evt) {
    var img = Event.element(evt);
    var isVisible = _toggle(img);
    img.setAttribute('aria-expanded', isVisible);
    _setPreference(isVisible);
  }
  function _toggle(img) {
    var span = img.up().down('.timing_span');
    if (!span) return false;
    span.toggle();
    return span.visible();
  }
  function _setPreference(flag) {
    try {
      setPreference('glide.ui.response_time', flag + '');
    } catch (e) {}
  }
  function toggleDetails(e) {
    if (e.type === 'keydown' && e.which !== 32) return;
    var span = gel('page_timing_details');
    var a = gel('page_timing_div').down('a');
    var state = span.getAttribute('data-state');
    if (state === 'shown') {
      span.setAttribute('data-state', 'hidden');
      a.setAttribute('aria-expanded', 'false');
      span.up().up().setAttribute('aria-hidden', 'true');
      span.hide();
      return false;
    }
    if (state === 'hidden') {
      span.setAttribute('data-state', 'shown');
      a.setAttribute('aria-expanded', 'true');
      span.up().up().setAttribute('aria-hidden', 'false');
      span.show();
      return;
    }
    span.innerHTML = _buildDetails();
    span.setAttribute('data-state', 'shown');
    a.setAttribute('aria-expanded', 'true');
    span.up().up().setAttribute('aria-hidden', 'false');
    span.on('click', 'div.timing_detail_line', function (evt, element) {
      if (element.getAttribute('data-children') === '0') return;
      var ariaExpandedElement = element.firstElementChild;
      if (ariaExpandedElement) {
        var ariaExp =
          ariaExpandedElement.getAttribute('aria-expanded') === 'true';
        ariaExpandedElement.setAttribute('aria-expanded', !ariaExp);
      }
      var div = element.down('div');
      if (div) div.toggle();
    });
  }
  function _buildDetails() {
    var txt = '';
    var o;
    var other = _getTiming('REND');
    var detailLine = new XMLTemplate('glide:page_timing_detail_line');
    var currentCategoryIndex = 1;
    var totalCategories = _getTotalValidCategories(other);
    CATEGORIES.forEach(function (cat) {
      if (!categories[cat.category]) return;
      var ms = _getTiming(cat.category) + '';
      if ('RLV2' !== cat.category) other -= ms;
      var children = categories[cat.category].children;
      var ariaLabel = new GwtMessage().getMessage(
        '{0} of {1} {2}: {3}',
        currentCategoryIndex,
        totalCategories,
        cat.name,
        ms
      );
      o = {
        name: cat.name,
        ms: ms,
        child_count: children.length + '',
        children: '',
        has_children: '',
        has_aria_label: ariaLabel,
      };
      if (children.length > 0) {
        o.children = _buildChildren(children);
        o.has_children = 'timing_detail_line_has_children';
        o.has_role = 'button';
        o.has_expanded = 'false';
      }
      currentCategoryIndex = currentCategoryIndex + 1;
      txt += detailLine.evaluate(o);
    });
    if (other > 10) {
      var ariaLabel = new GwtMessage().getMessage(
        '{0} of {1} Other: {2}',
        totalCategories,
        totalCategories,
        other
      );
      txt += detailLine.evaluate({
        name: 'Other',
        ms: other,
        child_count: 0,
        has_children: '',
        has_aria_label: ariaLabel,
      });
    }
    o = { details: txt };
    return new XMLTemplate('glide:page_timing_details').evaluate(o);
  }
  function _getTotalValidCategories(other) {
    var totalCategories = 0;
    CATEGORIES.forEach(function (cat) {
      if (!categories[cat.category]) return;
      else {
        totalCategories = totalCategories + 1;
        var ms = _getTiming(cat.category) + '';
        if ('RLV2' !== cat.category) other -= ms;
      }
    });
    return other > 10 ? totalCategories + 1 : totalCategories;
  }
  function _buildChildren(children) {
    var txt = '<div style="display:none; cursor:default">';
    var detailChild = new XMLTemplate('glide:page_timing_child_line');
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      var childAriaLabel = new GwtMessage().getMessage(
        '{0} of {1} {2}: {3}',
        i + 1,
        children.length,
        child.name,
        child.ms
      );
      var o = {
        name: child.name,
        ms: child.ms + '',
        childAriaLabel: childAriaLabel,
      };
      txt += detailChild.evaluate(o);
    }
    txt += '</div>';
    return txt;
  }
  function _initCategories() {
    if (categories) return;
    categories = {};
    var startTime = 0;
    if (window.performance)
      startTime = window.performance.timing.navigationStart;
    else startTime = parseInt(new CookieJar().get('g_startTime'), 10);
    window._timingStartTime = startTime;
  }
  function _getTiming(category) {
    if (!categories[category]) return 0;
    return Math.max(0, categories[category].ms);
  }
  function _setRlCatName() {
    var isDeferred = window.g_related_list_timing != 'default';
    var postFix = isDeferred === true ? ' (async)' : ' (sync)';
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].category === 'RLV2' && !hasPostFix(CATEGORIES[i].name))
        CATEGORIES[i].name = CATEGORIES[i].name + postFix;
    }
    function hasPostFix(cat_name) {
      var cat_name_split = cat_name.split(' ');
      var len = cat_name_split.length;
      return !!(
        cat_name_split[len - 1] === '(async)' ||
        cat_name_split[len - 1] === '(sync)'
      );
    }
  }
  function _clearTimingDiv() {
    window._timingTotal = -1;
    var div = gel('page_timing_div');
    if (div) {
      div.innerHTML = '';
      div.style.visibility = 'hidden';
    }
  }
  function _getOrCreateTimingDiv() {
    var div = gel('page_timing_div');
    if (!div) {
      div = cel('div');
      div.id = 'page_timing_div';
      div.setAttribute('role', 'complementary');
      div.setAttribute('aria-label', getMessage('Timing details'));
      div.className = 'timingDiv';
      document.body.appendChild(div);
    }
    div.style.visibility = '';
    return div;
  }
  function _clientTransaction(o) {
    if (
      !window._timingStartTime ||
      !window._timingTotal ||
      window._timingTotal <= 0 ||
      getActiveUser() === false ||
      getTopWindow().loggingOut === true
    )
      return;
    if (!Object.entries) {
      Object.entries = function (obj) {
        var ownProps = Object.keys(obj);
        var i = ownProps.length;
        var resArray = new Array(i);
        while (i--) resArray[i] = [ownProps[i], obj[ownProps[i]]];
        return resArray;
      };
    }
    if (o === undefined || o === null || !Object.entries(o).length) return;
    var det = [];
    for (var i = 0; i < CATEGORIES.length; i++) {
      var cat = CATEGORIES[i];
      if (!o.types[cat.category]) continue;
      if (!categories[cat.category]) continue;
      var children = categories[cat.category].children;
      if (!children) continue;
      for (var ndx = 0; ndx < children.length; ndx++) {
        var child = children[ndx];
        var t = {};
        t.type_code = cat.category;
        t.type = cat.name;
        t.script_detail = child.script_type;
        t.name = child.name;
        t.duration = child.ms;
        t.sys_id = child.sys_id;
        t.source_table = child.source_table;
        det.push(t);
      }
    }
    var data = {
      transaction_id: o.transaction_id,
      table_name: o.table_name,
      form_name: o.form_name,
      view_id: o.view_id,
      transaction_time: window._timingTotal,
      browser_server_time: _getTiming('SERV'),
      network_time: _getTiming('NETW'),
      browser_time: _getTiming('REND'),
      client_script_time: _getTiming('CSOL') + _getTiming('CSOC'),
      policy_time: _getTiming('UIOL'),
      client_details: Object.toJSON(det),
    };
    if (o.logged_in !== false) window.NOW.PageTimingService.send(data);
  }
  var CATEGORIES = [
    { category: 'SCPT', name: 'Script Load/Parse' },
    { category: 'PARS', name: 'CSS and JS Parse' },
    { category: 'SECT', name: 'Form Sections' },
    { category: 'UIOL', name: 'UI Policy - On Load' },
    { category: 'CSOL', name: 'Client Scripts - On Load' },
    { category: 'CSOC', name: 'Client Scripts - On Change (initial load)' },
    { category: 'PROC', name: 'Browser processing before onload' },
    { category: 'DOMC', name: 'DOMContentLoaded to LoadEventEnd' },
    { category: 'LOADF', name: 'addLoadEvent functions' },
    { category: 'RLV2', name: 'Related Lists' },
  ];
};
addTopRenderEvent(function () {
  NOW.PageTiming();
});
