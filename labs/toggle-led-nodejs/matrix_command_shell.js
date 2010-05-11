#!/usr/bin/env node
// Copyright (C) 2010 Texas Instruments, Jason Kridner
var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var path = require('path');
var events = require('events');

// Spawn child process
sys.puts('Spawning child process');
var child = child_process.spawn('cat');
var matrix = {};
matrix.data = '';
matrix.emitter = new events.EventEmitter;
child.stdout.addListener(
 'data',
 function (data) {
  sys.puts('New data: ' + data);
  matrix.data += data;
  matrix.emitter.emit('data', matrix.data);
 }
);
matrix.getData = function(res, wait) {
 var myListener = {};
 myListener = function(data) {
  sys.puts("Responding"); 
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write(matrix.data + data);
  res.end();
  if(wait) {
   matrix.emitter.removeListener('data', myListener);
  }
 };
 if(wait) {
  sys.puts("Waiting for data");
  matrix.emitter.addListener('data', myListener);
  setTimeout(function() {sys.puts("Timeout"); myListener('');}, 10000);
 } else {
  sys.puts("Not waiting");
  myListener('');
 }
}

// Serve web page and notify user
function loadHTMLFile(uri, res) {
 var filename = path.join(process.cwd(), uri);
 path.exists(
  filename,
  function(exists) {
   if(!exists) {
    res.writeHead(404, {"Content-Type": "text/plain"});
    res.write("404 Not Found\n");
    res.end();
    return;
   }
   fs.readFile(
    filename,
    'text',
    function(err, file) {
     if(err) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
     }
     res.writeHead(200, {"Content-Type": "text/html"});
     var str = ("" + file).replace("<!--%OUTPUT%-->", matrix.data);
     res.write(str);
     res.end();
    }
   );
  }
 );
}
sys.puts('Creating server');
var server = http.createServer(
 function(req, res) {
  var uri = url.parse(req.url).pathname;
  sys.puts("Got request for " + uri);
  var query = url.parse(req.url, true).query;
  var command = false;
  if(typeof(query) != 'undefined') {
   //sys.puts("Request included query: " + query);
   if('command' in query) {
    command = query.command;
    sys.puts("Query included command " + command);
    child.stdin.write(command + "\n");
   }
  }
  if(uri == '/') {
   loadHTMLFile('/index.html', res);
  } else if(uri == '/data') {
   setTimeout(function() { matrix.getData(res, false); }, 100);
  } else if(uri == '/event') {
   matrix.getData(res, true);
  } else {
   loadHTMLFile(uri, res);
  }
 }
);
if(!server.listen(3000)) {
 sys.puts('Server running at http://127.0.0.1:3000/');
} else {
 sys.puts('Server failed to connect to socket');
}
