set "PARENT_DIR=%CD%"

:: Check if "test" is in PARENT_DIR to set NODE_ENV
echo %PARENT_DIR% | find /i "test" > nul
if %ERRORLEVEL% == 0 (
    set "NODE_ENV=test"
) else (
    set "NODE_ENV=prod"
)

:: Navigate to parent directory
cd /d "%PARENT_DIR%"

:: Git operations
git pull

:: Process math-common
cd /d "%PARENT_DIR%\math-common"
call npm i
del /s /q tsconfig.tsbuildinfo
call tsc -d

:: Process math-db
cd /d "%PARENT_DIR%\math-db"
call npm i
del /s /q tsconfig.tsbuildinfo
call tsc -d

:: Process math-auth
cd /d "%PARENT_DIR%\math-auth"
call npm i
del /s /q tsconfig.tsbuildinfo
call tsc -d

:: Process math-ui3
cd /d "%PARENT_DIR%\math-ui3"
call npm i
del /s /q tsconfig.tsbuildinfo
call tsc -d
call npm run build


:: Process math-server
cd /d "%PARENT_DIR%\math-server"
del /s /q tsconfig.tsbuildinfo
call npm i
call tsc

:: Process math-messages
cd /d "%PARENT_DIR%\math-messages"
call npm i
del /s /q tsconfig.tsbuildinfo
call tsc

pause