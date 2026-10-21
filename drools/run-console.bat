@echo off
rem Runs the Drools console (without Docker).
call "%~dp0run.bat" console
exit /b %ERRORLEVEL%
