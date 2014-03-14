var aWindow;

aWindow = aWindow || {};

aWindow.cache = {
  $window: $(window),
  $document: $(document),
  $html: $(document.documentElement),
  $body: $(document.body),
  $title: $('title')
};
