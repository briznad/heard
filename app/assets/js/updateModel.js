var heardApp;

heardApp = heardApp || {};

heardApp.updateModel = (function() {
  'use strict';
  var create;
  create = function(req) {
    var createAjax;
    createAjax = $.ajax({
      type: 'POST',
      url: 'http://api.heardapp.com:4327/create',
      data: req.params
    });
    createAjax.fail(function(data) {
      return heardApp.log(data);
    });
    return createAjax.done(function(data) {
      return heardApp.log(data);
    });
  };
  return {
    create: create
  };
})();
