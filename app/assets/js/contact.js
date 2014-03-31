var heardApp;

heardApp = heardApp || {};

heardApp.contact = (function() {
  'use strict';
  var send;
  send = function(req) {
    var contactReq;
    return contactReq = $.ajax({
      type: 'POST',
      url: req.path,
      data: req.params,
      success: function(data) {
        return console.log(data);
      },
      error: function(data) {
        return console.log(data);
      }
    });
  };
  return {
    send: send
  };
})();
