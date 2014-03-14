aWindow = aWindow or {}

aWindow.modelBuildr = do ->
  'use strict'

  init = (callback) ->
    getData callback

  getData = (callback) ->
    # ID of current CMS spreadsheet
    contentSpreadsheetID = '0AvY0yhzqHzgSdDRjV1UzcUxfQnRmSDNKcEhkUDlKeHc'

    # requesting data from Google
    request = $.ajax
      url:    'https://spreadsheets.google.com/feeds/list/' + contentSpreadsheetID + '/od6/public/values?alt=json-in-script'
      dataType: 'jsonp'

    # here's the data
    request.done (data) ->
      # console.log data
      createCleanModel data, callback

    # uh-oh, something went wrong
    request.fail (data) ->
      aWindow.model =
        status: 'error'
        description: 'unable to talk to Google'
        data: data

      do callback

  createCleanModel = (data, callback) ->

    # add model object to aWindow
    aWindow.model = {}

    # sort each page type
    sortRawInput = (obj) ->

      # what type of object are we working with?
      key = obj.gsx$newpagetype.$t

      # process general info that all page types have
      tempCleanObj = processGeneral obj, key

      switch key
        when 'edition'
          # save the last processed edition as the current edition
          aWindow.model.settings = aWindow.model.settings or {}
          aWindow.model.settings.currentEdition = tempCleanObj.normalized

          tempCleanObj = _.extend tempCleanObj,
            items:          [] # create container array, to be populated in post-processing
            collaborators:  [] # create container array, to be populated in post-processing
            location:       obj['gsx$edition-location']['$t'].replace(/\n/g, '<br/>')
            hours:          obj['gsx$edition-hours']['$t'].replace(/\n/g, '<br/>')
            contact:
              email:          obj['gsx$edition-contact-email']['$t']
              phone:          obj['gsx$edition-contact-phone']['$t']

        when 'collaborator'
          tempCleanObj = _.extend tempCleanObj,
            associatedWithEditions: [] # create container array, to be populated in post-processing
            items:                  [] # create container array, to be populated in post-processing

        when 'item'
          tempCleanObj = _.extend tempCleanObj,
            creator:        obj['gsx$item-creator']['$t']
            edition:        obj['gsx$item-edition']['$t']
            price:          obj['gsx$item-price']['$t']
            madeToOrder:    if obj['gsx$item-madetoorder']['$t'] is 'TRUE' then true else false
            productionRun:  obj['gsx$item-productionrun']['$t']
            timeToShip:     obj['gsx$item-timetoship']['$t']
            windowDisplay:
              media:          obj['gsx$item-windowdisplaymedia']['$t']
              position:
                top:            if obj['gsx$item-windowdisplaymediaposition-top']['$t'] isnt '' then obj['gsx$item-windowdisplaymediaposition-top']['$t'] else 0
                left:           if obj['gsx$item-windowdisplaymediaposition-left']['$t'] isnt '' then obj['gsx$item-windowdisplaymediaposition-left']['$t'] else 0

      # make sure the correct container array exists in the model
      aWindow.model[key] = aWindow.model[key] or {}

      # after cleaning things up save to the model
      aWindow.model[key][tempCleanObj.normalized] = tempCleanObj

    processGeneral = (obj, key) ->
      # return the cleaned up bits
      type:         key
      title:        obj['gsx$' + key + '-title']['$t']
      normalized:   obj['gsx$' + key + '-normalized']['$t']
      description:  obj['gsx$' + key + '-description']['$t'].replace(/\n/g, '<br/>')
      media:        obj['gsx$' + key + '-media']['$t']

    # after the initial model is created, do some additional processing
    postProcessing = (callback) ->
      # add the root/homepage item
      aWindow.model.meta.root =
        type:         'meta'
        title:        'Root'
        normalized:   'root'
        description:  'This is the homepage.'

      # add the editions list page by collating info on each edition
      aWindow.model.meta.editions =
        type:         'meta'
        title:        'Editions'
        normalized:   'editions'
        description:  'This is the Editions list.'
        displayOrder: _.keys aWindow.model.edition

      # add the collaborators list page by collating info on each collaborator
      aWindow.model.meta.collaborators =
        type:         'meta'
        title:        'Collaborators'
        normalized:   'collaborators'
        description:  'This is the Collaborators list.'
        displayOrder: do _.keys(aWindow.model.collaborator).sort

      # go through each item to collate the following lists: items > editions, collaborators > editions, items > collaborator
      _.each aWindow.model.item, (value, key) ->
        # items > edition
        aWindow.model.edition[value.edition].items.push key
        # collaborators > edition
        aWindow.model.edition[value.edition].collaborators.push value.creator
        # items > collaborator
        aWindow.model.collaborator[value.creator].items.push key

      # sort collated lists
      _.each aWindow.model.edition, (value, key) ->
        do value.collaborators.sort
        do value.items.sort

      _.each aWindow.model.collaborator, (value, key) ->
        do value.items.sort

      do callback

    if data.feed.entry
      # go through each object in the raw input, clean it, and add it to the model object
      _.each data.feed.entry, sortRawInput

      # after building the model object spice up the data
      postProcessing ->
        do callback
    else
      aWindow.model =
        status: 'error'
        description: 'no "entry" object returned'
        data: data

      do callback

  init: init