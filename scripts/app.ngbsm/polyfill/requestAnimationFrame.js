/*! RESOURCE: /scripts/app.ngbsm/polyfill/requestAnimationFrame.js */
window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function (callback) {
    if (typeof callback === 'function') {
      setTimeout(function () {
        callback(Performance.now ? Performance.now() : Date.now());
      }, 16);
    }
  };
