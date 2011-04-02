#!/usr/bin/env node
// Copyright (C) 2010 Texas Instruments, Jason Kridner
var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var path = require('path');
var events = require('events');
var io = require('../../cloud9/support/socket.io');

// hack
process.chdir('labs/toggle-led-nodejs');

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
    encoding='utf8',
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
   sys.puts("Request included query: " + query);
   if('command' in query) {
    command = query.command;
    sys.puts("Query included command :" + command);
    child.stdin.write(command + "\n");
   }
  }
  if(uri == '/') {
   loadHTMLFile('/index.html', res);
  } else {
   loadHTMLFile(uri, res);
  }
 }
);

if(!server.listen(3001)) {
 sys.puts('Server running at http://127.0.0.1:3001/');
} else {
 sys.puts('Server failed to connect to socket');
}

// socket.io 
var socket = io.listen(server)
socket.on('connection', function(client) {
 // new client is here! 
 sys.puts("New client connected");
 client.myListener = function(data) {
  sys.puts("Sending message to client: " + data);
  client.send(data);
 };
 matrix.emitter.addListener('data', client.myListener);
 client.on('message', function(data) {
  sys.puts("Got message from client:", data);
  child.stdin.write(data + "\n");
 });
 client.on('disconnect', function() {
  sys.puts("Client disconnected.");
  matrix.emitter.removeListener('data', client.myListener);
 }); 
}); 
