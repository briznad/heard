aWindow = aWindow or {}

aWindow.template =

  primary: _.template $('#primaryTemplate').html()

  contactPartial: _.template $('#contactPartial').html()

  homepageDisplayPartial: _.template $('#homepageDisplayPartial').html()

  metaListPartial: _.template $('#metaListPartial').html()

do $('script[type="text/html"]').remove