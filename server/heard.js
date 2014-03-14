var http = require('http');

http.createServer(function (req, http_res) {
  http_res.writeHead(200, {'Content-Type': 'text/plain'});

  var response = '';

  var cradle = require('cradle');

  var connection = new(cradle.Connection)('http://127.0.0.1', 5984, {
      auth: { username: 'heard', password: 'twavex52' }
  });

  var db = connection.database('heard');

  db.save('document_key', {
      name: 'A Funny Name'
  }, function (err, res) {
      if (err) {
          // Handle error
          response += ' SAVE ERROR: Could not save record!!\n';
      } else {
          // Handle success
          response += ' SUCESSFUL SAVE\n';
      }

      db.get('document_key', function (err, doc) {
          response += ' DOCUMENT: ' + doc + '\n';
          http_res.end(response);
      });
  });

}).listen(8071);