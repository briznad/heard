aWindow = aWindow or {}

aWindow.init = do ->
  'use strict'

  # init storage
  aWindow.store = aWindow.store || aWindow.DB('heardApp');

  aWindow.modelBuildr.init ->
    # load router controller
    do aWindow.router