@echo off
setlocal

docker compose up --build -d
set "exitCode=%ERRORLEVEL%"

endlocal & exit /b %exitCode%
