@echo off
rem Double-click this file to run the game on this computer.
rem It starts the test server and opens the game in your browser.
title Kalame - game server
cd /d "%~dp0"
node serve.js --open
echo.
pause
