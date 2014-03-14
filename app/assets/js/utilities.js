var aWindow;

aWindow = aWindow || {};

aWindow.log = function(msg1, msg2) {
  'use strict';
  if ((typeof console !== "undefined" && console !== null) && (console.log != null)) {
    if (msg2) {
      return console.log(msg1, msg2);
    } else {
      return console.log(msg1);
    }
  }
};

aWindow.DB = function(key) {
  var store;
  store = window.localStorage || {};
  return {
    get: function() {
      return JSON.parse(store[key] || '{}');
    },
    put: function(data) {
      return store[key] = JSON.stringify(data);
    }
  };
};
