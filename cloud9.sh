#!/bin/sh
cd $(dirname $0)
DIR=`pwd`
echo Starting Cloud9 IDE at $DIR
$DIR/cloud9/bin/cloud9.sh -w $DIR
