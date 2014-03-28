
console.log('\nHeard API server is starting up...\n');

/**
 * dependencies and what have you
 */

// load general depencies / global vars
var catchErrors = false,
  express = require('express'),
  cradle = require('cradle');

var logNewLineIndent = '\n  - ',
  logNewLineResultsIndent = '\n -- ',
  logLineBreak = '\n';

// load express app dependencies / configs / middleware
var app = express(),
  http_listen_port = 4327;

app.use(express.bodyParser());
app.use(express.cookieParser());

// load cradle (couch API wrapper) dependencies / configs
var conn = new (cradle.Connection)('127.0.0.1', 5984, { secure: false, auth: { username: 'heard', password: 'heardpass' } });

// dependencies and global vars declared - Locked & Loaded!
console.log('\n\n                        #####################\n                         H e a r d  -  A P I\n                        #####################\n');

/**
 * load the routes
 */

// test
app.get('/test', function(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineIndent + req.url + logLineBreak);
  // respond!!
  res.json({ heardSays: 'serving test!' });
});

// Hello World!
app.get('/', function(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineIndent + req.url + logLineBreak);
  // respond!!
  res.json({ heardSays: 'Hello World!' });
});

// peform basic user lookup and return their docPayload if they exist
app.get('/user/lookup/:session', function(req, res) {
  userLookup(req, res);
});

// login user
app.post('/user/login', function(req, res) {
  userLogin(req, res);
});

// save new user
app.post('/user/save', function(req, res) {
  userSave(req, res);
});

// udate session for fb user
app.post('/user/session/update', function(req, res) {
  userSessionUpdate(req, res);
});

// update the user's doc with fresh content
app.post('/doc/update/:session', function(req, res) {
  docUpdate(req, res);
});

// update user's notification preferences
app.post('/user/notifications/update/:session', function(req, res) {
  userNotificationUpdate(req, res);
});

// update user's password
app.post('/user/password/update/:session', function(req, res) {
  userPasswordUpdate(req, res);
});

// add user password after fb signup
app.post('/user/password/add/:session', function(req, res) {
  userPasswordAdd(req, res);
});

// update user's info
app.post('/user/info/update/:session', function(req, res) {
  userInfoUpdate(req, res);
});

// update user's email address
app.post('/user/email/update/:session', function(req, res) {
  userEmailUpdate(req, res);
});

/**
 * load the route functions
 */

// :session
function userLookup(req, res) {
  console.log('OMG, a request!');
  console.info('request made for:' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('asking DB for info on user:' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (doc === undefined) {
      // user doesn't exist
      console.warn('user has the right cookie but doesn\'t seem to exist in the DB - that\'s odd :/');
      res.json({ lookupResult: 'signUpRequired' });
    } else {
      // user exists
      var docPayload = {
        name: doc.name,
        notifications: doc.notifications,
        services: doc.services,
        friendsNotifyOn: doc.friendsNotifyOn,
        friendsNotifyOff: doc.friendsNotifyOff
      };
      if (doc.session === session.token && (doc.friendsNotifyOn.length !== 0 || doc.friendsNotifyOff.length !== 0)) {
        // ideal outcome
        // session token matches and user has content
        console.info('user is valid and setup' + logNewLineIndent + 'delivering payload');
        res.json({ lookupResult: 'letsRock', data: docPayload });
      } else if (doc.session === session.token && doc.services.do.fb !== false) {
        // user signed up and in via fb, session token matches, but user has no saved friends, aka isn't setup
        console.warn('fb user is valid but has no friends - run fbSetupFlow');
        res.json({ lookupResult: 'fbSetupRequired', data: docPayload });
      } else if (doc.session === session.token) {
        // session token matches but user has no saved friends, aka isn't setup
        console.warn('user is valid but has no friends - run setupFlow');
        res.json({ lookupResult: 'setupRequired', data: docPayload });
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ lookupResult: 'loginRequired' });
      }
    }
  });
}

//
function userLogin(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url + logNewLineIndent + 'check existence of user: ' + logNewLineResultsIndent + base64.decode(req.body.email));
  var db = conn.database('heard');
  db.get(req.body.email, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.info('user doesn\'t exist');
        res.json({ userLoginStatus: 'badAuthNotFound' });
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (hashlib.hmac_sha1(doc.password, new Date().getUTCDate().toString()) == req.body.password) {
        console.info('credentials look good' + logNewLineIndent + 'generating / saving new session token');
        var docPayload = {
          name: doc.name,
          notifications: doc.notifications,
          services: doc.services,
          friendsNotifyOn: doc.friendsNotifyOn,
          friendsNotifyOff: doc.friendsNotifyOff
        };
        var newSession = sessionHash();
        db.merge(req.body.email, { session: newSession }, function(err, result2) {
          console.log('DB responded!');
          if (err) {
            console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
            res.json(err);
          } else if (doc.friendsNotifyOn.length !== 0 || doc.friendsNotifyOff.length !== 0) {
            // ideal outcome
            console.info('we\'re all good - user is setup & session saved');
            res.json({ userLoginStatus: 'letsRock', session: req.body.email + '.' + newSession, data: docPayload });
          } else {
            console.warn('setup required');
            res.json({ userLoginStatus: 'setupRequired', session: req.body.email + '.' + newSession, data: docPayload });
          }
        });
      } else if (doc.services.do.fb === 'exclusive') {
        console.warn('uh-oh, password doesn\'t match but user has fb service' + logNewLineIndent +  'I think this user signed up via fb');
        res.json({ userLoginStatus: 'badAuthWrongPasswordWithFB' });
      } else {
        console.warn('uh-oh, wrong password');
        res.json({ userLoginStatus: 'badAuthWrongPassword' });
      }
    }
  });
}

//
function userSave(req, res) {
  console.log('OMG, a request!');
  console.info('request made for:' + logNewLineResultsIndent + req.url + logNewLineIndent + 'check to see if user exists: ' + logNewLineResultsIndent + base64.decode(req.body.email));
  var db = conn.database('heard');
  db.get(req.body.email, function(err, result) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        // ideal outcome
        console.info('sweet, user not found' + logNewLineIndent + 'saving new user in DB');
        var docPayload = {
          name: req.body.value.name,
          password: req.body.value.password,
          session: sessionHash(),
          friendsNotifyOn: [],
          friendsNotifyOff: [],
          notifications: {
            email: req.body.email,
            do: {
              email: true,
              sms: false
            }
          }
        };
        if (req.body.value.services === undefined) {
          docPayload.services = { do: { fb: false } };
        } else {
          docPayload.services = req.body.value.services;
        }
        db.save(req.body.email, docPayload, function(err, result) {
          console.log('DB responded!');
          if (err) {
            console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
            res.json(err);
          } else {
            // ideal outcome
            console.info('user saved');
            res.json({ userSaveStatus: 'userSaveSuccessful', session: req.body.email + '.' + docPayload.session, data: docPayload });
          }
        });
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      console.warn('uh-oh, user already exists');
      res.json({ userSaveStatus: 'userAlreadyExists' });
    }
  });
}

//
function userSessionUpdate(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url + logNewLineIndent + 'check to see if user exists: ' + logNewLineResultsIndent + base64.decode(req.body.email));
  var db = conn.database('heard');
  db.get(req.body.email, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error === 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd (unless it\'s an fb user)');
        res.json({ userSessionUpdateStatus: 'notFound' });
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      console.info('updating user session');
      var docPayload = {
        session: sessionHash(),
        services: doc.services
      };
      if (doc.password !== undefined) docPayload.services.do.fb = true;
      db.merge(req.body.email, docPayload, function(err, result2) {
        console.log('DB responded!');
        if (err) {
          console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
          res.json(err);
        } else {
          // ideal outcome
          console.info('success! send sessionPayload');
          res.json({ userSessionUpdateStatus: 'letsRock', session: req.body.email + '.' + docPayload.session });
        }
      });
    }
  });
}

// :session
function docUpdate(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('verifying session for user: ' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd :/');
        res.json(err);
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (doc.session == session.token) {
        // session token matches
        console.info('user is valid - update doc');
        db.merge(session.user, req.body, function(err, result) {
          console.log('DB responded!');
          if (err) {
            console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
            res.json(err);
          } else {
            // ideal outcome
            console.info('session payload sent to client!');
            res.json({ docUpdateStatus: 'BOOM!' });
          }
        });
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ docUpdateStatus: 'loginRequired' });
      }
    }
  });
}
// :session
function userNotificationUpdate(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('verifying session for user: ' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd :/');
        res.json(err);
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (doc.session == session.token) {
        // session token matches
        console.info('user is valid - update notification preferences');
        db.merge(session.user, { notifications: req.body }, function(err, result) {
          console.log('DB responded!');
          if (err) {
            console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
            res.json(err);
          } else {
            // ideal outcome
            console.info('session payload sent to client!');
            res.json({ notificationUpdateStatus: 'BOOM!' });
          }
        });
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ notificationUpdateStatus: 'loginRequired' });
      }
    }
  });
}

// :session
function userPasswordUpdate(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('verifying session for user: ' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd :/');
        res.json(err);
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (doc.session == session.token) {
        // session token matches
        console.info('user is valid - verify current credentials');
        if (hashlib.hmac_sha1(doc.password, new Date().getUTCDate().toString()) === req.body.oldPass) {
          console.info('current credentials look good' + logNewLineIndent + 'save new password and a fresh session token');
          var newSession = sessionHash();
          db.merge(session.user, { password: req.body.newPass, session: newSession }, function(err, result2) {
            console.log('DB responded!');
            if (err) {
              console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
              res.json(err);
            } else {
              // ideal outcome
              console.info('we\'re all good - new password and session saved' + logNewLineIndent + 'send session token to user');
              res.json({ passwordUpdateStatus: 'BOOM!', session: session.user + '.' + newSession });
            }
          });
        } else {
          console.warn('uh-oh, wrong password');
          res.json({ passwordUpdateStatus: 'badAuthWrongPassword' });
        }
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ passwordUpdateStatus: 'loginRequired' });
      }
    }
  });
}

// :session
function userPasswordAdd(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('verifying session for user: ' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd :/');
        res.json(err);
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (doc.session == session.token) {
        // session token matches
        console.info('user is valid' + logNewLineIndent + 'save new password and a fresh session token');
        var newSession = sessionHash();
        db.merge(session.user, { password: req.body.password, session: newSession, services: req.body.services }, function(err, result2) {
          console.log('DB responded!');
          if (err) {
            console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
            res.json(err);
          } else {
            // ideal outcome
            console.info('we\'re all good - new password and session saved' + logNewLineIndent + 'send session token to user');
            res.json({ passwordAddStatus: 'BOOM!', session: session.user + '.' + newSession });
          }
        });
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ passwordUpdateStatus: 'loginRequired' });
      }
    }
  });
}

// :session
function userInfoUpdate(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('verifying session for user: ' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd :/');
        res.json(err);
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (doc.session == session.token) {
        // session token matches
        console.info('user is valid - verify current credentials');
        if (hashlib.hmac_sha1(doc.password, new Date().getUTCDate().toString()) === req.body.password) {
          console.info('current credentials look good' + logNewLineIndent + 'save updated user info and a fresh session token');
          var newSession = sessionHash();
          db.merge(session.user, { name: req.body.name, session: newSession }, function(err, result2) {
            console.log('DB responded!');
            if (err) {
              console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
              res.json(err);
            } else {
              // ideal outcome
              console.info('we\'re all good - updated user info and session saved' + logNewLineIndent + 'send session token to user');
              res.json({ userInfoUpdateStatus: 'BOOM!', session: session.user + '.' + newSession });
            }
          });
        } else {
          console.warn('uh-oh, wrong password');
          res.json({ userInfoUpdateStatus: 'badAuthWrongPassword' });
        }
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ userInfoUpdateStatus: 'loginRequired' });
      }
    }
  });
}

// :session
function userEmailUpdate(req, res) {
  console.log('OMG, a request!');
  console.info('request made for: ' + logNewLineResultsIndent + req.url);
  var cookie = unescape(req.params.session).split('.'),
  db = conn.database('heard'),
  session = {};
  session.user = cookie[0];
  session.token = cookie[1];
  console.info('verifying session for user: ' + logNewLineResultsIndent + base64.decode(session.user));
  db.get(session.user, function(err, doc) {
    console.log('DB responded!');
    if (err) {
      if (err.error == 'not_found') {
        console.error('user doesn\'t seem to exist in the DB - that\'s odd :/');
        res.json(err);
      } else {
        console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
        res.json(err);
      }
    } else {
      if (doc.session == session.token) {
        // session token matches
        console.info('user is valid - verify current credentials');
        if (hashlib.hmac_sha1(doc.password, new Date().getUTCDate().toString()) === req.body.password) {
          console.info('current credentials look good' + logNewLineIndent + 'save new email address and a fresh session token');
          var docPayload = {
            name: req.body.name,
            password: doc.password,
            friendsNotifyOn: doc.friendsNotifyOn,
            friendsNotifyOff: doc.friendsNotifyOff,
            session: sessionHash(),
            services: doc.services,
            notifications: {
              email: req.body.newEmail,
              sms: doc.notifications.sms,
              do: doc.notifications.do
            }
          };
          db.save(req.body.newEmail, docPayload, function(err) {
            console.log('DB responded!');
            if (err) {
              console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
              res.json(err);
            } else {
              // ideal outcome
              console.info('we\'re all good - new email address and session saved' + logNewLineIndent + 'send session token to user' + logNewLineIndent + 'delete old record from the DB');
              res.json({ emailUpdateStatus: 'BOOM!', session: req.body.newEmail + '.' + docPayload.session });
              // after the new record is successfully saved, delete the old record
              db.remove(session.user, doc._rev, function(err) {
                console.log('DB responded!');
                if (err) {
                  console.error('uh-oh, unknown ERROR: ' + logNewLineResultsIndent + err);
                  res.json(err);
                } else {
                  // ideal outcome
                  console.info('old record successfully deleted');
                }
              });
            }
          });
        } else {
          console.warn('uh-oh, wrong password');
          res.json({ emailUpdateStatus: 'badAuthWrongPassword' });
        }
      } else {
        // cookie exists but current session token for user doesn't match server
        console.warn('user not authorized');
        res.json({ emailUpdateStatus: 'loginRequired' });
      }
    }
  });
}

/**
 * init and load helper functions
 */

// have app listen
app.listen(http_listen_port);

// server started
console.info('server started at http://127.0.0.1:' + http_listen_port);

// ERROR catcher
if (catchErrors) {
  process.on('uncaughtException', function(err) {
    console.log('Caught the following exception: ' + logNewLineResultsIndent + err);
  });
}