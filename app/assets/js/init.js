var aWindow;

aWindow = aWindow || {};

aWindow.init = (function() {
  'use strict';
  aWindow.store = aWindow.store || aWindow.DB('heardApp');
  return aWindow.modelBuildr.init(function() {
    return aWindow.router();
  });
})();
