var aWindow;

aWindow = aWindow || {};

aWindow.template = {
  primary: _.template($('#primaryTemplate').html()),
  contactPartial: _.template($('#contactPartial').html()),
  homepageDisplayPartial: _.template($('#homepageDisplayPartial').html()),
  metaListPartial: _.template($('#metaListPartial').html())
};

$('script[type="text/html"]').remove();
