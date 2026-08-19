@echo off
REM Start MathBoard local development (API + messages + Vite UI + Chrome)
cd /d C:\dev\MathBoard

set NODE_ENV=development
set API_PORT=17030
set MESSAGING_PORT=18030

echo Building backend packages...
call npx tsc -b C:\dev\MathBoard\math-common\tsconfig.json
if errorlevel 1 goto :build_failed
call npx tsc -b C:\dev\MathBoard\math-db\tsconfig.json
if errorlevel 1 goto :build_failed
call npx tsc -b C:\dev\MathBoard\math-auth\tsconfig.json
if errorlevel 1 goto :build_failed
call npx tsc -b C:\dev\MathBoard\math-server\tsconfig.json
if errorlevel 1 goto :build_failed
call npx tsc -b C:\dev\MathBoard\math-messages\tsconfig.json
if errorlevel 1 goto :build_failed

echo Starting API server (port %API_PORT%)...
start "MathBoard API" cmd /k "cd /d C:\dev\MathBoard\math-server && set NODE_ENV=development&& set API_PORT=17030 && node .\build\app.js"

echo Starting messages server (port %MESSAGING_PORT%)...
start "MathBoard Messages" cmd /k "cd /d C:\dev\MathBoard\math-messages && set NODE_ENV=development&& set MESSAGING_PORT=18030 && node .\build\app.js"

echo Starting UI (http://localhost:3000)...
start "MathBoard UI" cmd /k "cd /d C:\dev\MathBoard\math-ui3 && npm run dev"

timeout /t 4 /nobreak >nul
call :open_chrome http://localhost:3000/

echo.
echo MathBoard dev environment is starting.
echo   UI:       http://localhost:3000
echo   API:      http://localhost:17030
echo   Messages: http://localhost:18030
exit /b 0

:open_chrome
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if defined CHROME (
  start "" "%CHROME%" "%~1"
) else (
  start chrome "%~1"
)
exit /b 0

:build_failed
echo.
echo Build failed. Fix errors above and try again.
pause
exit /b 1
