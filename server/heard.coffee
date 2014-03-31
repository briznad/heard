console.log '\nHeard API server is warming up...\n'

###
 load general depencies / global vars
###
settings =
  mode: 'DEV'
  # mode: 'PROD'
  httpPort: 4327

_       = require 'underscore'
cradle  = require 'cradle'
express = require 'express'
app     = do express
conn    = new (cradle.Connection) '127.0.0.1', 5984, # load cradle (couch API wrapper) dependencies / configs
  secure: false
  auth:
    username: 'heard'
    password: 'heardpass'

# specify our db
db = conn.database 'heard';

init = ->
  # load express middleware
  app.use express.bodyParser()
  app.use express.cookieParser()

  # init routes
  do initRoutes

  # have app listen
  app.listen settings.httpPort

  # server started
  console.info '\nserver started at http://127.0.0.1:' + settings.httpPort

  # ERROR catcher
  if settings.mode is 'PROD'
    console.info '\nPROD: errors will be caught and logged'
    process.on 'uncaughtException', (err) ->
      console.log '\nCaught the following exception:\n' + err
  else
    console.info '\nDEV: errors will NOT be caught'

  # locked & loaded!
  console.log '\n\n                  #####################\n                   H e a r d  -  A P I\n                  #####################\n'

###
load routes
###
routes =
  'get' :
    '/'     : 'root'
    '/test' : 'test'
    '/list' : 'listAll'
  # 'put' :
  #   '/update' : 'updateRequest'
  'post' :
    '/create' : 'createRequest'

initRoutes = ->
  _.each routes, (value, key) ->
    verb = key
    _.each value, (value, key) ->
      app[verb] key, routeHandlers[value]

routeHandlers =
  root: (req, res) ->
    console.log '\nOMG, a request!'
    console.info 'request made for:\n' + req.url

    # respond!!
    res.json heardSays: 'Hello World!'

  test: (req, res) ->
    console.log '\nOMG, a request!'
    console.info 'request made for:\n' + req.url

    # respond!!
    res.json heardSays: 'serving test!'

  listAll: (req, res) ->
    console.log '\nOMG, a request!'
    console.info 'request made for:\n' + req.url

    db.get 'requests', (err, doc) ->
      if err then res.json err

      # respond!!
      res.json doc

  createRequest: (req, res) ->
    console.log '\nOMG, a request!'
    console.info 'request made for:\n' + req.url

    db.save
      type    : 'request'
      title   : req.body.title
      message : req.body.message
    , (err, doc) ->
      if err then res.json err

      # respond!!
      res.json doc

do init