console.log "\nHeard API server is warming up...\n"

###
dependencies and what have you
###

# load general depencies / global vars
settings =
  catchErrors: false
  http_listen_port: 4327

_ = require("underscore")
express = require("express")
cradle = require("cradle")
app = express()
conn = new (cradle.Connection)("127.0.0.1", 5984, # load cradle (couch API wrapper) dependencies / configs
  secure: false
  auth:
    username: "heard"
    password: "heardpass"
)

# load express middleware
app.use express.bodyParser()
app.use express.cookieParser()

# locked & loaded!
console.log "\n\n                        #####################\n                         H e a r d  -  A P I\n                        #####################\n"

###
load routes
###

# test
app.get "/test", (req, res) ->
  console.log "OMG, a request!"
  console.info "request made for:\n" + req.url

  # respond!!
  res.json heardSays: "serving test!"
  return


# Hello World!
app.get "/", (req, res) ->
  console.log "OMG, a request!"
  console.info "request made for:\n" + req.url

  # respond!!
  res.json heardSays: "Hello World!"
  return


###
init and load helper functions
###

# have app listen
app.listen settings.http_listen_port

# server started
console.info "server started at http://127.0.0.1:" + settings.http_listen_port

# ERROR catcher
if settings.catchErrors
  process.on "uncaughtException", (err) ->
    console.log "Caught the following exception: " + logNewLineResultsIndent + err
    return
