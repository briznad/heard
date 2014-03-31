heardApp = heardApp or {}

heardApp.updateModel = do ->
  'use strict'

  create = (req) ->
    createAjax = $.ajax
      type: 'POST'
      url: 'http://api.heardapp.com:4327/create'
      data: req.params

    createAjax.fail (data) ->
      heardApp.log data

    createAjax.done (data) ->
      heardApp.log data

  create: create