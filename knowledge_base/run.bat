@echo off
rem Runs the knowledge base (without Docker) at http://localhost:8090.
rem Optional: PORT changes the port, DATA_DIR changes the folder that holds the CSV files.
setlocal
cd /d "%~dp0"

if not defined PORT set "PORT=8090"
if not defined DATA_DIR set "DATA_DIR=%CD%"

python -m pip install -q -r requirements.txt
if errorlevel 1 exit /b 1
python server.py
endlocal & exit /b %ERRORLEVEL%
