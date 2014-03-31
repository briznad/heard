heardApp = heardApp or {}

heardApp.contact = do ->
  'use strict'

  send = (req) ->
    contactReq = $.ajax
      type: 'POST'
      url: req.path
      data: req.params
      success: (data) ->
        console.log data
      error: (data) ->
        console.log data

  send: send