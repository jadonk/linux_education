#!/bin/sh
cd $(dirname $0)
node ./processingjs-demo.js &
NODE_PID=$!
sleep 1
#/usr/bin/chrome/chrome --app="http://localhost:3001/"
#x-www-browser --app="http://localhost:3001/"
midori --app="http://localhost:3001/"
kill -15 $NODE_PID
