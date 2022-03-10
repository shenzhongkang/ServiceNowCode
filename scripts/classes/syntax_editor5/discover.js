/*! RESOURCE: /scripts/classes/syntax_editor5/discover.js */
var discover = (function () {
  'use strict';
  var showContextMenu = 'true';
  if (showContextMenu !== 'true') return;
  if (typeof window.SharedWorker === 'undefined') return;
  var editors = {},
    callbacks = {},
    discoverWorker = new SharedWorker(
      'scripts/classes/syntax_editor5/discoverWorker.js?v=02-01-2022_2323'
    ),
    workerPort = discoverWorker.port;
  workerPort.onmessage = function (message) {
    var data = message.data;
    var id = data.id,
      cmd = data.command;
    if (callbacks[cmd] && callbacks[cmd][id])
      callbacks[cmd][id].callback &&
        callbacks[cmd][id].callback(editors[cmd][id], data.result);
    removeCallback(data.command, data.id);
  };
  function addCallback(command, editor, callback) {
    editors[command] || (editors[command] = {});
    callbacks[command] || (callbacks[command] = {});
    var id = Math.floor(Math.random() * 1001);
    editors[command][id] = editor;
    callbacks[command][id] = {
      callback: callback,
      start: Date.now(),
    };
    return id;
  }
  function removeCallback(command, id) {
    if (command) {
      if (editors[command]) delete editors[command][id];
      if (callbacks[command]) delete callbacks[command][id];
    }
  }
  return {
    storeCache: function (cacheFlushTime, editor, callback) {
      var cmd = 'loadCache';
      var id = addCallback(cmd, editor, callback);
      workerPort.postMessage({
        command: cmd,
        id: id,
        cacheFlushTime: cacheFlushTime,
        g_ck: window.g_ck,
      });
    },
    discoverTokens: function (
      lines,
      apiDocResourceIdsJson,
      options,
      editor,
      callback
    ) {
      var cmd = 'discover';
      var id = addCallback(cmd, editor, callback);
      workerPort.postMessage({
        command: cmd,
        id: id,
        lines: lines,
        currentScope: options.currentScope,
        apiDocIdsJson: apiDocResourceIdsJson,
      });
    },
    destroy: function () {
      if (workerPort) {
        workerPort.close && workerPort.close();
        discoverWorker = workerPort = null;
      }
    },
  };
})();
