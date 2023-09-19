#!/bin/bash
project_name=$1
node_file=$2
version=$3
download_url=$4

function download_node() {
  mkdir -p build
  echo "downloading $node_file"
  wget -c -O build/$node_file --no-check-certificate $download_url
  echo "download over"
}

if [ -f "build/$node_file" ]; then
  echo "node pkg already download"
else
  download_node
fi

extract_arg=''
ext=.tar
if [[ "$node_file" == *.gz ]]; then
  extract_arg='xzf'
  ext="${ext}.gz"
else
  extract_arg='Jxf'
  ext="${ext}.xz"
fi
dir_name=$(basename $node_file $ext)

function extract_and_init_node() {
  rm -rf build/$dir_name
  echo "extract node tar"
  tar -$extract_arg build/$node_file -C build/
  echo "extract over"

  current_path=$(pwd)
  export PATH=$current_path/build/$dir_name/bin:$PATH
  echo "install pm2"
  npm install -g pm2
  echo "install pm2 over"
  mv build/$dir_name build/$project_name
}

if [ -d "build/$project_name" ]; then
  echo "node already extracted"
else
  extract_and_init_node
fi

echo "copy project..."
resources_path=build/$project_name/resources
rm -rf $resources_path
mkdir -p $resources_path
chmod +x bin/*
/bin/cp -f bin/* build/$project_name/bin/
/bin/cp -rf core $resources_path
/bin/cp -rf config build/$project_name/
/bin/cp -rf core $resources_path
/bin/cp -f App.js $resources_path
/bin/cp -f LICENSE $resources_path
/bin/cp -f package.json $resources_path
/bin/cp -f package-lock.json $resources_path 2>/dev/null
echo "copy over"

echo "pkg project..."
tar -Jcf build/${project_name}-${version}.tar.xz -C build/ $project_name
echo "> pkg finished!"