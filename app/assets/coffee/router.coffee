heardApp = heardApp or {}

heardApp.router = do ->
  'use strict'

  init = (callback = ->) ->
    do initRoutes
    do _testHash
    do callback

  initRoutes = ->
    routes = Davis ->
      @configure (config) ->
        config.generateRequestOnPageLoad = true

      @before heardApp.updateView.beforeUpdate

      # @get '/', ->
      #   do heardApp.updateView.update 'meta', 'root'

      # @get '/:titleNormalized', (req) ->
      #   heardApp.updateView.update 'meta', req.params.titleNormalized

      # @get '/:type/:titleNormalized', (req) ->
      #   heardApp.updateView.update req.params.type, req.params.titleNormalized

      # @get '/:type/:titleNormalized/purchase', (req) ->
      #   heardApp.updateView.update req.params.type, req.params.titleNormalized, true

      @post '/create', heardApp.updateModel.create

  _testHash = ->
    if location.hash
      Davis.location.assign new Davis.Request location.hash.replace /^#/, ''

  init: init