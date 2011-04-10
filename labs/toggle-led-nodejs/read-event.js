#!/usr/bin/env node
// Copyright (C) 2010 Texas Instruments, Jason Kridner
var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var io = require('socket.io');
var binary = require('binary');

// hack
if(!("" + process.cwd()).match(/labs\/toggle-led-nodejs$/)) {
 sys.puts("Changing directory from " + process.cwd());
 process.chdir('labs/toggle-led-nodejs');
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
    encoding='utf8',
    function(err, file) {
     if(err) {
      res.writeHead(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.end();
      return;
     }
     res.writeHead(200, {"Content-Type": "text/html"});
     var str = ("" + file).replace("<!--%OUTPUT%-->", "");
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
   loadHTMLFile('/read-event.html', res);
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

 // Function for parsing and forwarding events
 var myListener = function (data) {
  var myData = new Buffer(data, encoding='binary');
  var myEvent = binary.parse(myData)
   .word32lu('time1')
   .word32lu('time2')
   .word16lu('type')
   .word16lu('code')
   .word32lu('value')
   .vars;
  myEvent.time = myEvent.time1 + (myEvent.time2 / 1000000);
  var myEventJSON = JSON.stringify(myEvent);
  client.send(myEventJSON + "\n");
 };

 // initiate read
 var myStream = fs.createReadStream(
  '/dev/input/event2',
  {
   'encoding': 'binary',
   'bufferSize': 16
  }
 );
 myStream.addListener('data', myListener);
 myStream.addListener('error', function(error) {
  sys.puts("Read error: " + error);
 });
 
 // on message
 client.on('message', function(data) {
  sys.puts("Got message from client:", data);
 });
 
 // on disconnect
 client.on('disconnect', function() {
  sys.puts("Client disconnected.");
 }); 
}); 

