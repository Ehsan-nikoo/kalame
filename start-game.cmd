@echo off
rem Double-click this file to run the game on this computer.
rem It starts the test server and opens the game in your browser.
title Kalame - game server
cd /d "%~dp0"
node serve.js --open
rem keep the window open only if something went wrong
if errorlevel 1 (
  echo.
  pause
)
