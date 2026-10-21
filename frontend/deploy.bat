@echo off
setlocal

cd /d "%~dp0.."
docker compose up --build -d
set "exitCode=%ERRORLEVEL%"

endlocal & exit /b %exitCode%
