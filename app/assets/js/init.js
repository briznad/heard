var heardApp;

heardApp = heardApp || {};

heardApp.init = (function() {
  'use strict';
  return heardApp.template.init(function() {
    return heardApp.modelBuildr.init(function() {
      return heardApp.router.init();
    });
  });
})();
