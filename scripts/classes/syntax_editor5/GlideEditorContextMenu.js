/*! RESOURCE: /scripts/classes/syntax_editor5/GlideEditorContextMenu.js */
var GlideEditorContextMenu = (function () {
  var showDocLabel = getMessage('Show Documentation');
  var findReferencesLabel = getMessage('Find References');
  var contextMenuItems = [
    {
      type: 'sys_db_object',
      menu: getMessage('Show Definition'),
      action: 'record',
      keyField: 'name',
    },
    {
      type: 'sys_db_object',
      menu: getMessage('Show Data'),
      action: 'list',
      keyField: 'name',
    },
    { type: 'sys_db_object', menu: findReferencesLabel, action: 'reference' },
    {
      type: 'sys_script_include',
      menu: getMessage('Open Definition'),
      action: 'record',
      keyField: 'api_name',
    },
    {
      type: 'sys_script_include',
      menu: findReferencesLabel,
      action: 'reference',
    },
  ];
  var developerDocUrl = 'https://developer.servicenow.com';
  var apiDocUrl =
    developerDocUrl +
    '/go_to_api.do?v=' +
    getVersion() +
    '&resource_id=CSHelp:';
  function showEditorContext(event, literal) {
    var cMenu = new GwtContextMenu('context_menu_editor_' + literal.name);
    cMenu.clear();
    addContextMenuItems(cMenu, literal);
    return contextShow(event, cMenu.getID(), 500, 0, 0);
  }
  function openDefinitionTab(literal) {
    if (literal.type === 'api') window.open(apiDocUrl + literal.key, '_blank');
    else {
      if (window.isDevStudio || literal.type === 'sys_script_include')
        openDefinition(literal);
      else {
        var uri = literal.type + '.do?sysparm_query=name=' + literal.key;
        window.open(uri, '_blank');
      }
    }
  }
  function openDefinition(literal) {
    $j.ajax({
      url:
        'api/now/v1/syntax_editor/cache/' +
        literal.type +
        '?name=' +
        literal.key,
      method: 'GET',
      headers: {
        'X-UserToken': window.g_ck,
      },
    }).done(function (data) {
      if (!data || typeof data !== 'object') return;
      var sys_id = data.result && data.result.result;
      openRecord(literal.type, sys_id);
    });
  }
  function openRecord(tableName, sysId) {
    if (!sysId || !tableName) return;
    var studioId = tableName + '_' + sysId;
    var uri = tableName + '.do?sys_id=' + sysId;
    if (window.isDevStudio) {
      if (window.openStudioTab) window.openStudioTab(uri, studioId);
    } else window.open(uri, '_blank');
  }
  function addContextMenuItems(cMenu, literal) {
    if (literal.type === 'api') {
      var openDocumenation = function () {
        window.open(apiDocUrl + literal.key, '_blank');
      };
      cMenu.addFunc(showDocLabel, openDocumenation, literal.key);
    } else
      contextMenuItems.forEach(function (item) {
        if (item.type == literal.type) {
          var id =
            item.action == 'list'
              ? literal.key + '_list'
              : literal.type + '_' + literal.key;
          if (item.action === 'reference') {
            var showReferences = function () {
              GlideEditorFindReferences.showUsages(literal);
            };
            cMenu.addFunc(findReferencesLabel, showReferences, literal.key);
          } else if (
            (window.isDevStudio && item.action === 'record') ||
            literal.type === 'sys_script_include'
          ) {
            var openContextMenuTab = function () {
              openDefinition(literal);
            };
            cMenu.addFunc(item.menu, openContextMenuTab, id);
          } else {
            var uri =
              item.action == 'list'
                ? literal.key + '_list.do?sys_id=-1'
                : literal.type +
                  '.do?sysparm_query=' +
                  item.keyField +
                  '=' +
                  literal.key;
            cMenu.addURL(item.menu, uri, '_blank', id);
          }
        }
      });
  }
  function getVersion() {
    var buildName = 'Sandiego';
    var version = buildName.toLowerCase();
    var p1 = version.indexOf('(');
    var p2 = version.indexOf(')');
    if (p1 > -1 && p2 > p1) version = version.substring(p1 + 1, p2);
    return version;
  }
  return {
    showEditorContext: showEditorContext,
    openDefinitionTab: openDefinitionTab,
    openRecord: openRecord,
  };
})();
