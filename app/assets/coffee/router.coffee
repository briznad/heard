aWindow = aWindow or {}

aWindow.router = ->

  beforePageRefresh = ->
    # remove previous body classes
    if aWindow.model.settings.currentPage
      aWindow.cache.$body.removeClass aWindow.model.settings.currentPage.type + ' ' + aWindow.model.settings.currentPage.titleNormalized

  updateCurrentPage = (type, titleNormalized) ->
    # update model with current page info
    aWindow.model.settings.currentPage = _.extend aWindow.model.settings.currentPage or {},
      type:             type
      titleNormalized:  titleNormalized

    # update page title
    pageTitle = if type isnt 'meta' and titleNormalized isnt 'root' then '{a window] | ' + type + ' | ' + aWindow.model[type][titleNormalized].title else if titleNormalized is 'root' then '{a window]' else '{a window] | ' + aWindow.model[type][titleNormalized].title

    # set page title
    aWindow.cache.$title.text pageTitle

    # update body classes
    aWindow.cache.$body.addClass type + ' ' + titleNormalized

    # render new view
    $('#primaryContainer').html aWindow.template.primary
      data:                   aWindow.model
      currentType:            type
      currentTitleNormalized: titleNormalized
      currentPageTitle:       pageTitle

  sendContactForm = (req) ->
    contactReq = $.ajax
      type: 'POST'
      url: req.path
      data: req.params
      success: (data) ->
        console.log data
      error: (data) ->
        console.log data

  routes = Davis ->
    @configure (config) ->
      config.generateRequestOnPageLoad = true

    @before beforePageRefresh

    @get '/', ->
      updateCurrentPage 'meta', 'root'

    @get '/:titleNormalized', (req) ->
      updateCurrentPage 'meta', req.params.titleNormalized

    @get '/:type/:titleNormalized', (req) ->
      updateCurrentPage req.params.type, req.params.titleNormalized

    @post '/contact', sendContactForm

  # init = ->
    # aWindow.log @

  # init:   init
  routes: routes