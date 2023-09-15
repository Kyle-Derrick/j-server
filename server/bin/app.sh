#!/bin/bash

current_path=$(pwd)
project_path=$(cd ..;pwd)

export PATH=$current_path:$PATH

project_name=js-engine
inner_path=resources/app

function start() {
  log_path=$project_path/log
  mkdir -p $log_path

  pm2 start ../$inner_path/App.js -i max -n $project_name -o $log_path/out.log -e $log_path/err.log
}

if [ "$1" == "stop" ]; then
    pm2 stop $inner_path
else
    start
fi