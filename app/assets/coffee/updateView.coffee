heardApp = heardApp or {}

heardApp.updateView = do ->
  'use strict'

  beforeUpdate = (request) ->
    # false if /jpg$|jpeg$|png$|gif$|bmp$/.test request.path

  update = (type, titleNormalized, purchasePage = false) ->
    # remove previous body classes
    do _removeBodyClasses

    # update model with current page info
    heardApp.model.settings.currentPage = _.extend heardApp.model.settings.currentPage or {},
      type:             type
      titleNormalized:  titleNormalized
      purchasePage:     purchasePage

    # compute body classes
    bodyClasses = [
      type
      titleNormalized
      'purchase' if purchasePage
    ]

    # update body classes
    heardApp.cache.$body.addClass bodyClasses.join ' '

    # update page title and h1
    heardApp.cache.$title.add(heardApp.cache.$h1).text _computePageTitle type, heardApp.model[type][titleNormalized].title, purchasePage

    # render new view
    heardApp.cache.$dynamicContainer.html heardApp.template.primaryTemplate
      data:                   heardApp.model
      currentType:            type
      currentTitleNormalized: titleNormalized
      currentEdition:         heardApp.model.settings.currentEdition
      purchasePage:           purchasePage

  _removeBodyClasses = ->
    # remove previous body classes
    if heardApp.model.settings.currentPage
      bodyClasses = [
        heardApp.model.settings.currentPage.type
        heardApp.model.settings.currentPage.titleNormalized
        'purchase'
      ]

      heardApp.cache.$body.removeClass bodyClasses.join ' '

  _computePageTitle = (type, title, purchasePage) ->
    if title is 'Root' then '{a window]'
    else if type is 'edition'
      if purchasePage then '{a window] | ' + 'purchase edition' + title
      else '{a window] | ' + 'edition' + title
    else if purchasePage then '{a window] | ' + 'purchase ' + title
    else '{a window] | ' + title

  beforeUpdate: beforeUpdate
  update:       update