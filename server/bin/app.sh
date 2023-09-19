#!/bin/bash

current_path=$(cd `dirname $0`; pwd)
project_path=$(cd $current_path;cd ..;pwd)

export PATH=$current_path:$PATH

project_name=js-engine
inner_path=resources

config_path=$project_path/config/ecosystem.config.js

function start() {
  pm2 start $config_path
}

if [ "$1" == "stop" ]; then
    pm2 stop $config_path
elif [ "$1" == "status" ]; then
    pm2 status $config_path
else
    start
fi