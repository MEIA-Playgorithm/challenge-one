@echo off
rem Runs the Drools API (without Docker) at http://localhost:8080. Extra arguments go to the application:
rem "run.bat console" starts the console instead (see run-console.bat).
rem Optional: PORT changes the port; MOVIES_CSV and USERS_CSV change where the CSV files come from;
rem MAVEN_BIN is the path to Maven if it is not on the PATH.
setlocal
cd /d "%~dp0"

set MVN=mvn
if defined MAVEN_BIN set MVN="%MAVEN_BIN%"
call %MVN% -q -DskipTests package dependency:copy-dependencies
if errorlevel 1 exit /b 1
java -cp "target/classes;target/dependency/*" meia.playgorithm.Application %*
endlocal & exit /b %ERRORLEVEL%
