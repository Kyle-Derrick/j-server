@echo off
set project_path=%~dp0

set PATH=%project_path%;%PATH%

set project_name=js-engine
set inner_path=resources

set command=%1
set config_path=%project_path%\config\ecosystem.config.js

if "%command%"=="stop" ( pm2 stop %config_path% )^
else if "%command%"=="status" (pm2 status %config_path%)^
else ( pm2 start %config_path% )