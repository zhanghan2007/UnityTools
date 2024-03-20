@echo off
cd /d %~dp0\project
call npm install pkg -g
call pkg index.js --targets win --output %~dp0psd2ui.exe
pause