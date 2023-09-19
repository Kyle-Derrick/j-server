@echo off
set project_path=%~dp0

set PATH=%project_path%;%PATH%

set project_name=js-engine
set inner_path=resources

set config_path=%project_path%\config\ecosystem.config.js

set command=%1
if "%1" == "" (
  set command=start
)
pm2 %command% %config_path%