@echo off
rem Runs the frontend in development mode (without Docker) at http://localhost:5173.
setlocal
cd /d "%~dp0"

if not exist node_modules call npm ci
if errorlevel 1 exit /b 1
call npm run dev
endlocal & exit /b %ERRORLEVEL%
