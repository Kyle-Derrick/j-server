#!/bin/bash

current_path=$(cd `dirname $0`; pwd)
project_path=$(cd $current_path;cd ..;pwd)

export PATH=$current_path:$PATH

project_name=j-server
inner_path=resources

config_path=$project_path/config/ecosystem.config.js
if [ $# -gt 0 ]; then
option=$1
else
option=start
fi

pm2 $option $config_path