var heardApp;

heardApp = heardApp || {};

heardApp.template = (function() {
  'use strict';
  var init, processTemplates;
  init = function(callback) {
    var request;
    request = $.ajax({
      url: '/assets/templates/templates.html',
      dataType: 'html'
    });
    request.done(function(data) {
      return processTemplates(data, callback);
    });
    return request.fail(function(data) {
      heardApp.template = {
        status: 'error',
        description: 'unable to retrieve template',
        data: data
      };
      return callback();
    });
  };
  processTemplates = function(response, callback) {
    var $templates;
    $templates = $(response).filter('script[type="text/html"]');
    $templates.each(function() {
      return heardApp.template[$(this).attr('id')] = _.template($(this).html());
    });
    return callback();
  };
  return {
    init: init
  };
})();
