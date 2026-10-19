@echo off
setlocal

rem Windows equivalent of run-api.sh: compiles the module and starts the
rem Drools REST API. Set MAVEN_BIN to use another Maven executable.

cd /d "%~dp0"

if defined MAVEN_BIN (
    rem Quote only a custom path: call "mvn.cmd" is not found through PATH.
    set MVN="%MAVEN_BIN%"
) else (
    where mvn.cmd >nul 2>nul
    if errorlevel 1 (
        echo Maven was not found. Set MAVEN_BIN to the Maven executable path. 1>&2
        exit /b 1
    )
    set "MVN=mvn.cmd"
)

rem "< nul" keeps Maven from consuming the console input.
call %MVN% -q test-compile dependency:build-classpath -Dmdep.outputFile=target\classpath.txt < nul
if errorlevel 1 exit /b %ERRORLEVEL%

rem for /f reads the whole line (set /p stops at 1024 characters).
for /f "usebackq delims=" %%i in ("target\classpath.txt") do set "CLASSPATH=target\classes;%%i"

java meia.playgorithm.MovieRecommendationApi
set "exitCode=%ERRORLEVEL%"

endlocal & exit /b %exitCode%
