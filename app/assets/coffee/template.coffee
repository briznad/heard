heardApp = heardApp or {}

heardApp.template = do ->
  'use strict'

  init = (callback) ->
    request = $.ajax
      url: '/assets/templates/templates.html',
      dataType: 'html',

    request.done (data) ->
      processTemplates data, callback

    # uh-oh, something went wrong
    request.fail (data) ->
      heardApp.template =
        status: 'error'
        description: 'unable to retrieve template'
        data: data

      do callback

  processTemplates = (response, callback) ->
    $templates = $(response).filter('script[type="text/html"]')

    $templates.each ->
      heardApp.template[$(this).attr 'id'] = _.template $(this).html()

    do callback

  init: init