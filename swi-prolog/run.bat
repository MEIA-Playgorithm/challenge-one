@echo off
rem Runs the Prolog API (without Docker) at http://localhost:8080.
rem Optional: PORT changes the port; MOVIES_CSV and USERS_CSV change where the CSV files come from.
setlocal
cd /d "%~dp0"

if not defined PORT set "PORT=8080"

swipl -q -s api/server.pl -g "server:start(%PORT%), thread_get_message(stop)"
endlocal & exit /b %ERRORLEVEL%
