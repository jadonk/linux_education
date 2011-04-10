#!/bin/sh
node ./processingjs-demo.js &
NODE_PID=$!
midori --app="localhost:3001"
kill -15 $!
