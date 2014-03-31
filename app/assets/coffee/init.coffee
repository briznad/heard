heardApp = heardApp or {}

heardApp.init = do ->
  'use strict'

  # load templates
  heardApp.template.init ->
    # retrieve json and build document model
    heardApp.modelBuildr.init ->
      # load router controller
      do heardApp.router.init