/*! RESOURCE: /codeFormat.js */
(function () {
  var beautifierOptions = {
    javascript: {
      beautifyFunc: js_beautify,
    },
    css: {
      beautifyFunc: '',
    },
    htmlmixed: {
      beautifyFunc: '',
    },
  };
  function getOptions(cm) {
    if (!cm || !cm.doc || !cm.doc.mode || !cm.state) return;
    if (cm.doc.mode.name === 'javascript') return beautifierOptions.javascript;
    else if (cm.doc.mode.name === 'css') return beautifierOptions.css;
    else if (cm.doc.mode.name === 'htmlmixed') return beautifierOptions.html;
    else return;
  }
  function beautify(cm, isSomethingSelected, formatConfig) {
    var options = getOptions(cm);
    if (!options) return;
    if (isSomethingSelected)
      cm.replaceSelection(
        options.beautifyFunc(cm.getSelection(), formatConfig)
      );
    else
      cm.setValue(
        options.beautifyFunc(cm.getValue().replace(/^\s+/, ''), formatConfig)
      );
  }
  CodeMirror.defineExtension(
    'format_code',
    function (isSomethingSelected, formatConfig) {
      beautify(this, isSomethingSelected, formatConfig);
    }
  );
})();
