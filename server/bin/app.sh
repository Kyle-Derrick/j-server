#!/bin/bash

current_path=$(cd `dirname $0`; pwd)
project_path=$(cd $current_path;cd ..;pwd)

export PATH=$current_path:$PATH

project_name=js-engine
inner_path=resources

config_path=$project_path/config/ecosystem.config.js
if [ $# -gt 1 ]; then
option=$1
else
option=start
fi

pm2 $1 $config_path