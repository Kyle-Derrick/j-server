@echo off
set project_path=%~dp0

set PATH=%project_path%;%PATH%

set project_name=js-engine
set inner_path=resources

set command=%1

if "%command%"=="stop" ( pm2 stop %project_name% )^
else if "%command%"=="status" (pm2 status %project_name%)^
else ( GOTO start )

exit
:start
set log_path=%project_path%log
mkdir %log_path% 2>nul
echo %log_path%

pm2 start %inner_path%\App.js -i max -n %project_name% -o %log_path%\out.log -e %log_path%\err.log

pause