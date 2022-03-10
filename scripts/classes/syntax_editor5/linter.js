/*! RESOURCE: /scripts/classes/syntax_editor5/linter.js */
var linter = (function () {
  'use strict';
  if (typeof Worker === 'undefined') return;
  var editors = {},
    callbacks = {},
    worker,
    file = 'scripts/classes/syntax_editor5/lintWorker.js?v=02-01-2022_2323';
  if (typeof window.SharedWorker === 'undefined') worker = new Worker(file);
  else {
    var lintSharedWorker = new SharedWorker(file);
    worker = lintSharedWorker.port;
  }
  worker.onmessage = function (message) {
    var id = message.data.id,
      errors = message.data.errors;
    callbacks[id].callback(editors[id], errors);
    delete callbacks[id];
    delete editors[id];
  };
  return {
    validate: function (cm, updateLinting, options, editor) {
      var id = Math.floor(Math.random() * 1001);
      editors[id] = editor;
      callbacks[id] = {
        callback: updateLinting,
        start: Date.now(),
      };
      worker.postMessage({
        id: id,
        code: cm,
        eslintConfig: options.eslintConfig,
      });
    },
    destroy: function () {
      if (worker) {
        if (worker.terminate) worker.terminate();
        else worker.close && worker.close();
        worker = null;
      }
    },
  };
})();
