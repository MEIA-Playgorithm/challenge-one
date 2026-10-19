@echo off
setlocal

rem Windows equivalent of run-console.sh: compiles the module and opens the
rem interactive Drools console. Set MAVEN_BIN to use another Maven executable.

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
call %MVN% -q compile dependency:build-classpath -DincludeScope=runtime -Dmdep.outputFile=target\classpath.txt < nul
if errorlevel 1 exit /b %ERRORLEVEL%

rem for /f reads the whole line (set /p stops at 1024 characters).
for /f "usebackq delims=" %%i in ("target\classpath.txt") do set "CLASSPATH=target\classes;%%i"

rem UTF-8 so the Portuguese dialogue questions show their accents.
chcp 65001 >nul

java -Dstdout.encoding=UTF-8 -Dstdin.encoding=UTF-8 meia.playgorithm.MovieRecommendationConsole
set "exitCode=%ERRORLEVEL%"

endlocal & exit /b %exitCode%
