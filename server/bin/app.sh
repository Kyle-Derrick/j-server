#!/bin/bash

current_path=$(cd `dirname $0`; pwd)
project_path=$(cd $current_path;cd ..;pwd)

export PATH=$current_path:$PATH

project_name=js-engine
inner_path=resources

function start() {
  log_path=$project_path/log
  mkdir -p $log_path

  pm2 start $project_path/$inner_path/App.js -i max -n $project_name -o $log_path/out.log -e $log_path/err.log
}

if [ "$1" == "stop" ]; then
    pm2 stop $project_name
elif [ "$1" == "status" ]; then
    pm2 status $project_name
else
    start
fi