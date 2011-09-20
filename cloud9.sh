#!/bin/sh
cd $(dirname $0)
DIR=`pwd`
if [ ! -e cloud9/bin/cloud9.js ]; then 
 echo Fetching Cloud9 IDE...
 git submodule update --init --recursive cloud9/
fi
echo Starting Cloud9 IDE at $DIR
node cloud9/bin/cloud9.js -w . -l 0.0.0.0 -p 3000
