var heardApp;

heardApp = heardApp || {};

heardApp.router = (function() {
  'use strict';
  var init, initRoutes, _testHash;
  init = function(callback) {
    if (callback == null) {
      callback = function() {};
    }
    initRoutes();
    _testHash();
    return callback();
  };
  initRoutes = function() {
    var routes;
    return routes = Davis(function() {
      this.configure(function(config) {
        return config.generateRequestOnPageLoad = true;
      });
      this.before(heardApp.updateView.beforeUpdate);
      return this.post('/create', heardApp.updateModel.create);
    });
  };
  _testHash = function() {
    if (location.hash) {
      return Davis.location.assign(new Davis.Request(location.hash.replace(/^#/, '')));
    }
  };
  return {
    init: init
  };
})();
