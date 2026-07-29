@echo off
REM Start MathBoard local development (API + Vite UI)
cd /d C:\dev\MathBoard

set NODE_ENV=development
set API_PORT=17030

echo Building backend packages...
call npx tsc -b C:\dev\MathBoard\math-common\tsconfig.json
if errorlevel 1 goto :build_failed
call npx tsc -b C:\dev\MathBoard\math-db\tsconfig.json
if errorlevel 1 goto :build_failed
call npx tsc -b C:\dev\MathBoard\math-server\tsconfig.json
if errorlevel 1 goto :build_failed

echo Starting API server (port %API_PORT%)...
start "MathBoard API" cmd /k "cd /d C:\dev\MathBoard\math-server && set NODE_ENV=development && set API_PORT=17030 && node .\build\app.js"

echo Starting UI (http://localhost:3000)...
start "MathBoard UI" cmd /k "cd /d C:\dev\MathBoard\math-ui3 && npm run dev"

timeout /t 4 /nobreak >nul
start "" http://localhost:3000/

echo.
echo MathBoard dev environment is starting.
echo   UI:  http://localhost:3000
echo   API: http://localhost:17030
exit /b 0

:build_failed
echo.
echo Build failed. Fix errors above and try again.
pause
exit /b 1
