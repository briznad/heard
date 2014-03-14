aWindow = aWindow or {}

aWindow.cache =

  $window:    $(window)
  $document:  $(document)
  $html:      $(document.documentElement) # document.documentElement === 'html'
  $body:      $(document.body)

  $title:     $('title')